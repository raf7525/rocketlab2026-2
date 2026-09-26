"""Endpoints do catálogo de filmes.

- `router`, montado em /movies: catálogo, detalhe e cadastro de filmes.
- `genres_router`, montado em /genres: os gêneros que um filme pode ter.
"""

from fastapi import APIRouter, status

from app.api.deps import PageParamsDep, SessionDep
from app.movies import service
from app.movies.models import DimMovie
from app.movies.schemas import MovieCreate, MovieDetail, MovieSummary
from app.shared.pagination import Page

router = APIRouter()
genres_router = APIRouter()


@router.get("", response_model=Page[MovieSummary])
async def list_movies(params: PageParamsDep, session: SessionDep) -> Page[MovieSummary]:
    return await service.list_movies(session, params)


@router.post("", response_model=MovieDetail, status_code=status.HTTP_201_CREATED)
async def create_movie(data: MovieCreate, session: SessionDep) -> DimMovie:
    return await service.create_movie(session, data)


@router.get("/{sk_movie_id}", response_model=MovieDetail)
async def get_movie(sk_movie_id: str, session: SessionDep) -> DimMovie:
    return await service.get_movie(session, sk_movie_id)


@genres_router.get("", response_model=list[str])
async def list_genres(session: SessionDep) -> list[str]:
    """Nomes dos gêneros, em ordem alfabética."""

    return await service.list_genre_names(session)
