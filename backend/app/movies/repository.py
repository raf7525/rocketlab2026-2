"""Consultas ao banco usadas pelo catálogo de filmes."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.movies.models import DimMovie, FactMoviePerformance

# O que as respostas de filme mostram além das colunas de `dim_movies`.
_WITH_GENRES_AND_RATING = (
    selectinload(DimMovie.genres),
    joinedload(DimMovie.reviews_summary),
)


async def count_movies(session: AsyncSession) -> int:
    return await session.scalar(select(func.count()).select_from(DimMovie)) or 0


async def list_movies(session: AsyncSession, offset: int, limit: int) -> list[DimMovie]:
    """Uma fatia do catálogo, dos filmes mais populares para os menos (sem dados por último)."""

    result = await session.scalars(
        select(DimMovie)
        .outerjoin(DimMovie.performance)
        .options(*_WITH_GENRES_AND_RATING)
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
    return await session.scalar(
        select(DimMovie)
        .where(DimMovie.sk_movie_id == sk_movie_id)
        .options(*_WITH_GENRES_AND_RATING)
    )
