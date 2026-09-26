"""Regras de negócio do catálogo de filmes."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.movies import repository
from app.movies.models import DIRECTOR, DimGenre, DimMovie, DimPerson
from app.movies.schemas import MovieCreate, MovieSummary
from app.shared.exceptions import BusinessRuleError, NotFoundError
from app.shared.pagination import Page, PageParams


async def list_movies(session: AsyncSession, params: PageParams) -> Page[MovieSummary]:
    total = await repository.count_movies(session)
    movies = await repository.list_movies(session, offset=params.offset, limit=params.page_size)
    items = [MovieSummary.model_validate(movie) for movie in movies]
    return Page[MovieSummary].build(items, total, params)


async def get_movie(session: AsyncSession, sk_movie_id: str) -> DimMovie:
    movie = await repository.get_movie(session, sk_movie_id)
    if movie is None:
        raise NotFoundError("Filme não encontrado.")
    return movie


async def create_movie(session: AsyncSession, data: MovieCreate) -> DimMovie:
    """Cadastra o filme; diretores que ainda não estão em `dim_people` entram como pessoas novas."""

    genres = await _find_genres(session, data.generos)
    directors = [await _find_or_create_director(session, nome) for nome in data.diretores]
    movie = DimMovie(
        titulo=data.titulo,
        ano_lancamento=data.ano_lancamento,
        sinopse=data.sinopse,
        genres=genres,
        people=directors,
    )
    session.add(movie)
    await session.commit()

    # Relê do banco para a resposta sair igual à do GET /movies/{id} (gêneros em ordem etc.).
    session.expunge(movie)
    return await get_movie(session, movie.sk_movie_id)


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


async def _find_or_create_director(session: AsyncSession, nome: str) -> DimPerson:
    director = await repository.find_person(session, nome, DIRECTOR)
    return director or DimPerson(nome_pessoa=nome, tipo_pessoa=DIRECTOR)
