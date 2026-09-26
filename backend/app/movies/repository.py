"""Consultas ao banco usadas pelo catálogo de filmes."""

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.movies.models import (
    ACTOR,
    DIRECTOR,
    DimGenre,
    DimMovie,
    DimPerson,
    FactMoviePerformance,
    PersonType,
    bridge_movie_genre,
    bridge_movie_person,
)
from app.movies.schemas import MovieFilters

# O que as respostas de filme mostram além das colunas de `dim_movies`.
WITH_GENRES_AND_RATING = (
    selectinload(DimMovie.genres),
    joinedload(DimMovie.reviews_summary),
    joinedload(DimMovie.watchlist_item),
)


def _filtered(query: Select, filters: MovieFilters) -> Select:
    """Aplica busca e filtros. Subconsultas (IN) em vez de joins: o filme nunca se repete."""

    if filters.busca:
        query = query.where(DimMovie.titulo.icontains(filters.busca, autoescape=True))
    if filters.genero:
        query = query.where(
            DimMovie.sk_movie_id.in_(
                select(bridge_movie_genre.c.sk_movie_id)
                .join(DimGenre)
                .where(func.lower(DimGenre.nome_genero) == filters.genero.lower())
            )
        )
    if filters.status:
        query = query.where(DimMovie.status_filme == filters.status)
    for tipo, nome in ((DIRECTOR, filters.diretor), (ACTOR, filters.ator)):
        if nome:
            query = query.where(
                DimMovie.sk_movie_id.in_(
                    select(bridge_movie_person.c.sk_movie_id)
                    .join(DimPerson)
                    .where(
                        DimPerson.tipo_pessoa == tipo,
                        DimPerson.nome_pessoa.icontains(nome, autoescape=True),
                    )
                )
            )
    return query


async def count_movies(session: AsyncSession, filters: MovieFilters) -> int:
    query = _filtered(select(func.count()).select_from(DimMovie), filters)
    return await session.scalar(query) or 0


async def list_movies(
    session: AsyncSession, filters: MovieFilters, offset: int, limit: int
) -> list[DimMovie]:
    """Uma fatia do catálogo, dos filmes mais populares para os menos (sem dados por último)."""

    result = await session.scalars(
        _filtered(select(DimMovie), filters)
        .outerjoin(DimMovie.performance)
        .options(*WITH_GENRES_AND_RATING)
        .order_by(
            FactMoviePerformance.popularidade.desc().nulls_last(),
            DimMovie.titulo,
            DimMovie.sk_movie_id,
        )
        .offset(offset)
        .limit(limit)
    )
    return list(result)


async def get_movie(session: AsyncSession, sk_movie_id: str) -> DimMovie | None:
    """O filme com gêneros, resumo das avaliações e pessoas (para diretores e elenco)."""

    return await session.scalar(
        select(DimMovie)
        .where(DimMovie.sk_movie_id == sk_movie_id)
        .options(*WITH_GENRES_AND_RATING, selectinload(DimMovie.people))
    )


async def list_genres(session: AsyncSession) -> list[DimGenre]:
    result = await session.scalars(select(DimGenre).order_by(DimGenre.nome_genero))
    return list(result)


async def find_person(session: AsyncSession, nome: str, tipo: PersonType) -> DimPerson | None:
    """A pessoa com esse nome e papel, sem diferenciar maiúsculas; a grafia exata vem antes."""

    return await session.scalar(
        select(DimPerson)
        .where(
            DimPerson.tipo_pessoa == tipo,
            func.lower(DimPerson.nome_pessoa) == func.lower(nome),
        )
        .order_by((DimPerson.nome_pessoa == nome).desc())
        .limit(1)
    )
