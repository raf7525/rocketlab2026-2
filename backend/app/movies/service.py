"""Regras de negócio do catálogo de filmes."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.movies import repository
from app.movies.models import DimMovie
from app.movies.schemas import MovieSummary
from app.shared.exceptions import NotFoundError
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
