"""Consultas da watchlist."""

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.sqlite import insert
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


async def add_item(session: AsyncSession, sk_movie_id: str) -> None:
    await session.execute(
        insert(WatchlistItem).values(sk_movie_id=sk_movie_id).on_conflict_do_nothing()
    )


async def remove_item(session: AsyncSession, sk_movie_id: str) -> None:
    await session.execute(delete(WatchlistItem).where(WatchlistItem.sk_movie_id == sk_movie_id))
