"""Endpoints do catálogo de filmes.

- `router`, montado em /movies: catálogo (com busca e filtros), detalhe, cadastro, edição e
  remoção de filmes.
- `genres_router`, montado em /genres: os gêneros que um filme pode ter.
"""

from typing import Annotated

from fastapi import APIRouter, Query, Response, status

from app.api.deps import SessionDep
from app.movies import service
from app.movies.models import DimMovie
from app.movies.schemas import (
    CatalogParams,
    MovieCreate,
    MovieDetail,
    MovieSummary,
    MovieUpdate,
)
from app.shared.pagination import Page

router = APIRouter()
genres_router = APIRouter()


@router.get("", response_model=Page[MovieSummary])
async def list_movies(
    params: Annotated[CatalogParams, Query()], session: SessionDep
) -> Page[MovieSummary]:
    """Catálogo paginado; `busca`, `genero`, `diretor` e `ator` restringem os filmes."""

    return await service.list_movies(session, filters=params, params=params)


@router.post("", response_model=MovieDetail, status_code=status.HTTP_201_CREATED)
async def create_movie(data: MovieCreate, session: SessionDep) -> DimMovie:
    return await service.create_movie(session, data)


@router.get("/{sk_movie_id}", response_model=MovieDetail)
async def get_movie(sk_movie_id: str, session: SessionDep) -> DimMovie:
    return await service.get_movie(session, sk_movie_id)


@router.put("/{sk_movie_id}", response_model=MovieDetail)
async def update_movie(sk_movie_id: str, data: MovieUpdate, session: SessionDep) -> DimMovie:
    return await service.update_movie(session, sk_movie_id, data)


@router.delete("/{sk_movie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_movie(sk_movie_id: str, session: SessionDep) -> Response:
    """Remove o filme e tudo o que é só dele (avaliações, métricas, ligações)."""

    await service.delete_movie(session, sk_movie_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@genres_router.get("", response_model=list[str])
async def list_genres(session: SessionDep) -> list[str]:
    """Nomes dos gêneros, em ordem alfabética."""

    return await service.list_genre_names(session)
