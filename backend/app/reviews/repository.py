"""Consultas ao banco usadas pelo domínio de avaliações de filmes."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.movies.models import DimMovie, DimReview, MovieReview


async def movie_exists(session: AsyncSession, sk_movie_id: str) -> bool:
    return await session.get(DimMovie, sk_movie_id) is not None


async def list_reviews(session: AsyncSession, sk_movie_id: str) -> list[MovieReview]:
    result = await session.scalars(
        select(MovieReview)
        .where(MovieReview.sk_movie_id == sk_movie_id)
        .order_by(MovieReview.created_at.desc())
    )
    return list(result)


async def get_review(
    session: AsyncSession, sk_movie_id: str, sk_movie_review_id: str
) -> MovieReview | None:
    return await session.scalar(
        select(MovieReview).where(
            MovieReview.sk_movie_review_id == sk_movie_review_id,
            MovieReview.sk_movie_id == sk_movie_id,
        )
    )


async def list_most_liked(session: AsyncSession, limit: int) -> list[MovieReview]:
    """As avaliações mais curtidas de todos os filmes (empate: a mais nova primeiro)."""

    result = await session.scalars(
        select(MovieReview)
        .options(joinedload(MovieReview.movie))
        .order_by(MovieReview.curtidas.desc(), MovieReview.created_at.desc())
        .limit(limit)
    )
    return list(result)


async def get_summary(session: AsyncSession, sk_movie_id: str) -> DimReview | None:
    return await session.scalar(select(DimReview).where(DimReview.sk_movie_id == sk_movie_id))


async def aggregate_scores(session: AsyncSession, sk_movie_id: str) -> tuple[int, float | None]:
    """Quantidade e média das notas individuais do filme (média `None` se não houver)."""

    total, average = (
        await session.execute(
            select(func.count(MovieReview.sk_movie_review_id), func.avg(MovieReview.nota)).where(
                MovieReview.sk_movie_id == sk_movie_id
            )
        )
    ).one()
    return total, average
