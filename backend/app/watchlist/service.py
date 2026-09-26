"""Regras da watchlist: adicionar e tirar são idempotentes (repetir não muda nada)."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.movies.models import DimMovie, WatchlistItem
from app.movies.schemas import MovieSummary
from app.shared.exceptions import NotFoundError
from app.shared.pagination import Page, PageParams
from app.watchlist import repository


async def list_movies(session: AsyncSession, params: PageParams) -> Page[MovieSummary]:
    total = await repository.count_items(session)
    movies = await repository.list_movies(session, offset=params.offset, limit=params.page_size)
    items = [MovieSummary.model_validate(movie) for movie in movies]
    return Page[MovieSummary].build(items, total, params)


async def add(session: AsyncSession, sk_movie_id: str) -> None:
    await _ensure_movie_exists(session, sk_movie_id)
    if await repository.get_item(session, sk_movie_id) is None:
        session.add(WatchlistItem(sk_movie_id=sk_movie_id))
        await session.commit()


async def remove(session: AsyncSession, sk_movie_id: str) -> None:
    await _ensure_movie_exists(session, sk_movie_id)
    item = await repository.get_item(session, sk_movie_id)
    if item is not None:
        await session.delete(item)
        await session.commit()


async def _ensure_movie_exists(session: AsyncSession, sk_movie_id: str) -> None:
    if await session.get(DimMovie, sk_movie_id) is None:
        raise NotFoundError("Filme não encontrado.")
