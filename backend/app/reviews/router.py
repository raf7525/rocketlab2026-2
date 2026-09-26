"""Endpoints de avaliações de filmes.

- `movie_reviews_router`, montado em /movies/{sk_movie_id}/reviews: as avaliações de um filme.
- `reviews_router`, montado em /reviews: avaliações de todos os filmes.
"""

from typing import Annotated

from fastapi import APIRouter, Query, status

from app.api.deps import SessionDep
from app.movies.models import DimReview, MovieReview
from app.reviews import service
from app.reviews.schemas import MovieReviewCreate, MovieReviewRead, PopularReview
from app.shared.ratings import RatingSummary

movie_reviews_router = APIRouter()
reviews_router = APIRouter()


@movie_reviews_router.post("", response_model=MovieReviewRead, status_code=status.HTTP_201_CREATED)
async def create_movie_review(
    sk_movie_id: str, data: MovieReviewCreate, session: SessionDep
) -> MovieReview:
    return await service.create_review(session, sk_movie_id, data)


@movie_reviews_router.get("", response_model=list[MovieReviewRead])
async def list_movie_reviews(sk_movie_id: str, session: SessionDep) -> list[MovieReview]:
    return await service.list_reviews(session, sk_movie_id)


@movie_reviews_router.get("/summary", response_model=RatingSummary)
async def get_movie_review_summary(
    sk_movie_id: str, session: SessionDep
) -> DimReview | RatingSummary:
    summary = await service.get_summary(session, sk_movie_id)
    return summary or RatingSummary()


@movie_reviews_router.post("/{sk_movie_review_id}/likes", response_model=MovieReviewRead)
async def like_movie_review(
    sk_movie_id: str, sk_movie_review_id: str, session: SessionDep
) -> MovieReview:
    return await service.like_review(session, sk_movie_id, sk_movie_review_id)


@movie_reviews_router.delete("/{sk_movie_review_id}/likes", response_model=MovieReviewRead)
async def unlike_movie_review(
    sk_movie_id: str, sk_movie_review_id: str, session: SessionDep
) -> MovieReview:
    return await service.unlike_review(session, sk_movie_id, sk_movie_review_id)


@reviews_router.get("/popular", response_model=list[PopularReview])
async def list_popular_reviews(
    session: SessionDep, limit: Annotated[int, Query(ge=1, le=50)] = 6
) -> list[MovieReview]:
    return await service.list_popular_reviews(session, limit)
