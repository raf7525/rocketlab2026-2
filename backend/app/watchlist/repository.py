"""Consultas da watchlist."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.movies.models import DimMovie, WatchlistItem
from app.movies.repository import WITH_GENRES_AND_RATING


async def count_items(session: AsyncSession) -> int:
    return await session.scalar(select(func.count()).select_from(WatchlistItem)) or 0


async def list_movies(session: AsyncSession, offset: int, limit: int) -> list[DimMovie]:
    """Os filmes da watchlist, do guardado por último para o primeiro."""

    result = await session.scalars(
        select(DimMovie)
        .join(DimMovie.watchlist_item)
        .options(*WITH_GENRES_AND_RATING)
        .order_by(WatchlistItem.adicionado_em.desc(), DimMovie.sk_movie_id)
        .offset(offset)
        .limit(limit)
    )
    return list(result)


async def get_item(session: AsyncSession, sk_movie_id: str) -> WatchlistItem | None:
    return await session.get(WatchlistItem, sk_movie_id)
