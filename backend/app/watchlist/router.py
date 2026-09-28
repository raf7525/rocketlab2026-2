"""Endpoints da watchlist, montados em /watchlist.

`PUT` e `DELETE` em /watchlist/{sk_movie_id} guardam e tiram um filme; os dois podem ser
repetidos sem efeito extra, então o botão do front não precisa saber o estado anterior.
"""

from fastapi import APIRouter, status

from app.api.deps import PageParamsDep, SessionDep
from app.movies.schemas import MovieSummary
from app.shared.pagination import Page
from app.watchlist import service

router = APIRouter()


@router.get("", response_model=Page[MovieSummary])
async def list_watchlist(params: PageParamsDep, session: SessionDep) -> Page[MovieSummary]:
    """Filmes guardados, do mais recente para o mais antigo."""

    return await service.list_movies(session, params)


@router.put("/{sk_movie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def add_to_watchlist(sk_movie_id: str, session: SessionDep) -> None:
    await service.add(session, sk_movie_id)


@router.delete("/{sk_movie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_watchlist(sk_movie_id: str, session: SessionDep) -> None:
    await service.remove(session, sk_movie_id)
