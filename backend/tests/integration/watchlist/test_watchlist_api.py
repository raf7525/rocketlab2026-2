import httpx
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.movies.models import DimMovie, FactMoviePerformance

WATCHLIST_URL = "/api/v1/watchlist"
MOVIES_URL = "/api/v1/movies"
UNKNOWN_MOVIE_ID = "0" * 64


@pytest.fixture
async def movies(session: AsyncSession) -> list[DimMovie]:
    movies = [
        DimMovie(
            id_filme=str(n),
            titulo=f"Filme {n}",
            performance=FactMoviePerformance(popularidade=10 - n),
        )
        for n in range(3)
    ]
    session.add_all(movies)
    await session.commit()
    return movies


def titles(response: httpx.Response) -> list[str]:
    return [item["titulo"] for item in response.json()["items"]]


async def test_watchlist_starts_empty(client: httpx.AsyncClient) -> None:
    response = await client.get(WATCHLIST_URL)

    assert response.status_code == 200
    assert response.json() == {"items": [], "total": 0, "page": 1, "page_size": 24, "pages": 0}


async def test_added_movies_are_listed_from_the_most_recent(
    client: httpx.AsyncClient, movies: list[DimMovie]
) -> None:
    for movie in (movies[1], movies[0], movies[2]):
        response = await client.put(f"{WATCHLIST_URL}/{movie.sk_movie_id}")
        assert response.status_code == 204

    response = await client.get(WATCHLIST_URL)

    assert titles(response) == ["Filme 2", "Filme 0", "Filme 1"]
    assert all(item["na_watchlist"] for item in response.json()["items"])


async def test_adding_twice_keeps_one_entry(
    client: httpx.AsyncClient, movies: list[DimMovie]
) -> None:
    await client.put(f"{WATCHLIST_URL}/{movies[0].sk_movie_id}")
    response = await client.put(f"{WATCHLIST_URL}/{movies[0].sk_movie_id}")

    assert response.status_code == 204
    assert (await client.get(WATCHLIST_URL)).json()["total"] == 1


async def test_removing_takes_the_movie_out(
    client: httpx.AsyncClient, movies: list[DimMovie]
) -> None:
    await client.put(f"{WATCHLIST_URL}/{movies[0].sk_movie_id}")

    response = await client.delete(f"{WATCHLIST_URL}/{movies[0].sk_movie_id}")

    assert response.status_code == 204
    assert (await client.get(WATCHLIST_URL)).json()["total"] == 0


async def test_removing_a_movie_that_is_not_there_is_fine(
    client: httpx.AsyncClient, movies: list[DimMovie]
) -> None:
    response = await client.delete(f"{WATCHLIST_URL}/{movies[0].sk_movie_id}")

    assert response.status_code == 204


@pytest.mark.parametrize("method", ["put", "delete"])
async def test_unknown_movie_returns_404(client: httpx.AsyncClient, method: str) -> None:
    response = await getattr(client, method)(f"{WATCHLIST_URL}/{UNKNOWN_MOVIE_ID}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Filme não encontrado."}


async def test_watchlist_is_paginated(client: httpx.AsyncClient, movies: list[DimMovie]) -> None:
    for movie in movies:
        await client.put(f"{WATCHLIST_URL}/{movie.sk_movie_id}")

    response = await client.get(WATCHLIST_URL, params={"page": 2, "page_size": 2})

    body = response.json()
    assert titles(response) == ["Filme 0"]
    assert (body["total"], body["pages"]) == (3, 2)


async def test_catalog_and_detail_tell_whether_the_movie_is_saved(
    client: httpx.AsyncClient, movies: list[DimMovie]
) -> None:
    await client.put(f"{WATCHLIST_URL}/{movies[1].sk_movie_id}")

    catalog = (await client.get(MOVIES_URL)).json()["items"]
    detail = (await client.get(f"{MOVIES_URL}/{movies[1].sk_movie_id}")).json()

    assert {item["titulo"]: item["na_watchlist"] for item in catalog} == {
        "Filme 0": False,
        "Filme 1": True,
        "Filme 2": False,
    }
    assert detail["na_watchlist"] is True


async def test_deleting_the_movie_takes_it_out_of_the_watchlist(
    client: httpx.AsyncClient, movies: list[DimMovie]
) -> None:
    await client.put(f"{WATCHLIST_URL}/{movies[0].sk_movie_id}")

    await client.delete(f"{MOVIES_URL}/{movies[0].sk_movie_id}")

    assert (await client.get(WATCHLIST_URL)).json()["total"] == 0
