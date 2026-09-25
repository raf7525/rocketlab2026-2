"""Regras de negócio das avaliações de filmes."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.movies.models import DimReview, MovieReview
from app.reviews import repository
from app.reviews.schemas import MovieReviewCreate
from app.shared.exceptions import NotFoundError


async def create_review(
    session: AsyncSession, sk_movie_id: str, data: MovieReviewCreate
) -> MovieReview:
    """Registra a avaliação e atualiza o resumo (quantidade e média) do filme."""

    await _ensure_movie_exists(session, sk_movie_id)

    review = MovieReview(sk_movie_id=sk_movie_id, **data.model_dump())
    session.add(review)
    await session.flush()
    await _refresh_summary(session, sk_movie_id)
    await session.commit()
    return review


async def list_reviews(session: AsyncSession, sk_movie_id: str) -> list[MovieReview]:
    await _ensure_movie_exists(session, sk_movie_id)
    return await repository.list_reviews(session, sk_movie_id)


async def get_summary(session: AsyncSession, sk_movie_id: str) -> DimReview | None:
    await _ensure_movie_exists(session, sk_movie_id)
    return await repository.get_summary(session, sk_movie_id)


async def _ensure_movie_exists(session: AsyncSession, sk_movie_id: str) -> None:
    if not await repository.movie_exists(session, sk_movie_id):
        raise NotFoundError("Filme não encontrado.")


async def _refresh_summary(session: AsyncSession, sk_movie_id: str) -> None:
    """Recalcula `dim_reviews` a partir das avaliações individuais, que são a fonte da verdade."""

    total, average = await repository.aggregate_scores(session, sk_movie_id)
    summary = await repository.get_summary(session, sk_movie_id)
    if summary is None:
        summary = DimReview(sk_movie_id=sk_movie_id)
        session.add(summary)
    summary.qtd_avaliacoes_usuarios = total
    summary.nota_media_usuarios = None if average is None else round(average, 2)
