"""Endpoints de avaliações de um filme, montados em /movies/{sk_movie_id}/reviews."""

from fastapi import APIRouter, status

from app.api.deps import SessionDep
from app.movies.models import DimReview, MovieReview
from app.reviews import service
from app.reviews.schemas import MovieReviewCreate, MovieReviewRead, MovieReviewSummary

router = APIRouter()


@router.post("", response_model=MovieReviewRead, status_code=status.HTTP_201_CREATED)
async def create_movie_review(
    sk_movie_id: str, data: MovieReviewCreate, session: SessionDep
) -> MovieReview:
    return await service.create_review(session, sk_movie_id, data)


@router.get("", response_model=list[MovieReviewRead])
async def list_movie_reviews(sk_movie_id: str, session: SessionDep) -> list[MovieReview]:
    return await service.list_reviews(session, sk_movie_id)


@router.get("/summary", response_model=MovieReviewSummary)
async def get_movie_review_summary(
    sk_movie_id: str, session: SessionDep
) -> DimReview | MovieReviewSummary:
    summary = await service.get_summary(session, sk_movie_id)
    return summary or MovieReviewSummary()
