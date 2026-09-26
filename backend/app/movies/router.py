"""Endpoints do catálogo de filmes, montados em /movies."""

from fastapi import APIRouter

from app.api.deps import PageParamsDep, SessionDep
from app.movies import service
from app.movies.models import DimMovie
from app.movies.schemas import MovieDetail, MovieSummary
from app.shared.pagination import Page

router = APIRouter()


@router.get("", response_model=Page[MovieSummary])
async def list_movies(params: PageParamsDep, session: SessionDep) -> Page[MovieSummary]:
    return await service.list_movies(session, params)


@router.get("/{sk_movie_id}", response_model=MovieDetail)
async def get_movie(sk_movie_id: str, session: SessionDep) -> DimMovie:
    return await service.get_movie(session, sk_movie_id)
