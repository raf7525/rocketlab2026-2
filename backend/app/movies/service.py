"""Regras de negócio do catálogo de filmes."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.movies import repository
from app.movies.models import ACTOR, DIRECTOR, DimGenre, DimMovie, DimPerson, PersonType
from app.movies.schemas import MovieCreate, MovieFilters, MovieSummary, MovieUpdate
from app.shared.exceptions import BusinessRuleError, NotFoundError
from app.shared.pagination import Page, PageParams


async def list_movies(
    session: AsyncSession, filters: MovieFilters, params: PageParams
) -> Page[MovieSummary]:
    total = await repository.count_movies(session, filters)
    movies = await repository.list_movies(
        session, filters, offset=params.offset, limit=params.page_size
    )
    items = [MovieSummary.model_validate(movie) for movie in movies]
    return Page[MovieSummary].build(items, total, params)


async def get_movie(session: AsyncSession, sk_movie_id: str) -> DimMovie:
    movie = await repository.get_movie(session, sk_movie_id)
    if movie is None:
        raise NotFoundError("Filme não encontrado.")
    return movie


async def create_movie(session: AsyncSession, data: MovieCreate) -> DimMovie:
    """Cadastra o filme; diretores e atores que ainda não estão em `dim_people` entram como
    pessoas novas."""

    genres = await _find_genres(session, data.generos)
    directors = await _find_or_create_people(session, data.diretores, DIRECTOR)
    cast = await _find_or_create_people(session, data.elenco, ACTOR)
    movie = DimMovie(
        titulo=data.titulo,
        ano_lancamento=data.ano_lancamento,
        sinopse=data.sinopse,
        genres=genres,
        people=directors + cast,
    )
    session.add(movie)
    await session.commit()

    # Relê do banco para a resposta sair igual à do GET /movies/{id} (gêneros em ordem etc.).
    session.expunge(movie)
    return await get_movie(session, movie.sk_movie_id)


async def update_movie(session: AsyncSession, sk_movie_id: str, data: MovieUpdate) -> DimMovie:
    """Substitui título, ano, sinopse, gêneros, diretores e (se enviado) o elenco."""

    movie = await get_movie(session, sk_movie_id)
    genres = await _find_genres(session, data.generos)
    replaced: dict[PersonType, list[DimPerson]] = {
        DIRECTOR: await _find_or_create_people(session, data.diretores, DIRECTOR)
    }
    if data.elenco is not None:
        replaced[ACTOR] = await _find_or_create_people(session, data.elenco, ACTOR)

    movie.titulo = data.titulo
    # Uma data de lançamento de outro ano contradiria o ano novo.
    if movie.data_lancamento and movie.data_lancamento.year != data.ano_lancamento:
        movie.data_lancamento = None
    movie.ano_lancamento = data.ano_lancamento
    movie.sinopse = data.sinopse
    movie.genres = genres
    # Troca só os papéis enviados; roteiristas (e o elenco, se não veio) continuam ligados.
    kept = [person for person in movie.people if person.tipo_pessoa not in replaced]
    movie.people = kept + [person for people in replaced.values() for person in people]
    await session.commit()

    session.expunge(movie)
    return await get_movie(session, sk_movie_id)


async def delete_movie(session: AsyncSession, sk_movie_id: str) -> None:
    """Apaga o filme com avaliações, métricas e ligações; gêneros e pessoas continuam no banco."""

    movie = await get_movie(session, sk_movie_id)
    await session.delete(movie)
    await session.commit()


async def list_genre_names(session: AsyncSession) -> list[str]:
    return [genre.nome_genero for genre in await repository.list_genres(session)]


async def _find_genres(session: AsyncSession, names: list[str]) -> list[DimGenre]:
    """Os gêneros com esses nomes, sem diferenciar maiúsculas; todos precisam existir."""

    genres = await repository.list_genres(session)
    by_name = {genre.nome_genero.casefold(): genre for genre in genres}
    unknown = [name for name in names if name.casefold() not in by_name]
    if unknown:
        label = "Gênero desconhecido" if len(unknown) == 1 else "Gêneros desconhecidos"
        raise BusinessRuleError(f"{label}: {', '.join(unknown)}.")
    return [by_name[name.casefold()] for name in names]


async def _find_or_create_people(
    session: AsyncSession, names: list[str], tipo: PersonType
) -> list[DimPerson]:
    """As pessoas com esses nomes e papel, reaproveitando quem já está em `dim_people`."""

    people: list[DimPerson] = []
    for nome in names:
        person = await repository.find_person(session, nome, tipo)
        people.append(person or DimPerson(nome_pessoa=nome, tipo_pessoa=tipo))
    return people
