"""Regras da watchlist: adicionar e tirar são idempotentes (repetir não muda nada)."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.movies.schemas import MovieSummary
from app.movies.service import ensure_movie_exists
from app.shared.pagination import Page, PageParams
from app.watchlist import repository


async def list_movies(session: AsyncSession, params: PageParams) -> Page[MovieSummary]:
    total = await repository.count_items(session)
    movies = await repository.list_movies(session, offset=params.offset, limit=params.page_size)
    items = [MovieSummary.model_validate(movie) for movie in movies]
    return Page[MovieSummary].build(items, total, params)


async def add(session: AsyncSession, sk_movie_id: str) -> None:
    await ensure_movie_exists(session, sk_movie_id)
    await repository.add_item(session, sk_movie_id)
    await session.commit()


async def remove(session: AsyncSession, sk_movie_id: str) -> None:
    await ensure_movie_exists(session, sk_movie_id)
    await repository.remove_item(session, sk_movie_id)
    await session.commit()
