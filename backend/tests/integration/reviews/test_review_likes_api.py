import httpx
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.movies.models import DimMovie, MovieReview

UNKNOWN_ID = "0" * 64


def likes_url(sk_movie_id: str, sk_movie_review_id: str) -> str:
    return f"/api/v1/movies/{sk_movie_id}/reviews/{sk_movie_review_id}/likes"


async def add_review(session: AsyncSession, movie: DimMovie, curtidas: int = 0) -> MovieReview:
    review = MovieReview(
        sk_movie_id=movie.sk_movie_id,
        nome="Ana",
        nota=8,
        comentario="Ótimo filme.",
        curtidas=curtidas,
    )
    session.add(review)
    await session.commit()
    return review


# POST /movies/{id}/reviews/{review_id}/likes


async def test_like_adds_one_and_returns_the_updated_review(
    client: httpx.AsyncClient, session: AsyncSession, movie: DimMovie
) -> None:
    review = await add_review(session, movie)

    await client.post(likes_url(movie.sk_movie_id, review.sk_movie_review_id))
    response = await client.post(likes_url(movie.sk_movie_id, review.sk_movie_review_id))

    assert response.status_code == 200
    body = response.json()
    assert body["sk_movie_review_id"] == review.sk_movie_review_id
    assert body["curtidas"] == 2
    assert body["estrelas"] == 4.0


async def test_likes_are_saved(
    client: httpx.AsyncClient, session: AsyncSession, movie: DimMovie
) -> None:
    review = await add_review(session, movie)

    await client.post(likes_url(movie.sk_movie_id, review.sk_movie_review_id))
    response = await client.get(f"/api/v1/movies/{movie.sk_movie_id}/reviews")

    assert response.json()[0]["curtidas"] == 1


# DELETE /movies/{id}/reviews/{review_id}/likes


async def test_unlike_removes_one(
    client: httpx.AsyncClient, session: AsyncSession, movie: DimMovie
) -> None:
    review = await add_review(session, movie, curtidas=3)

    response = await client.delete(likes_url(movie.sk_movie_id, review.sk_movie_review_id))

    assert response.status_code == 200
    assert response.json()["curtidas"] == 2


async def test_likes_never_go_below_zero(
    client: httpx.AsyncClient, session: AsyncSession, movie: DimMovie
) -> None:
    review = await add_review(session, movie, curtidas=0)

    response = await client.delete(likes_url(movie.sk_movie_id, review.sk_movie_review_id))

    assert response.status_code == 200
    assert response.json()["curtidas"] == 0


# Erros, iguais para curtir e descurtir


@pytest.mark.parametrize("method", ["POST", "DELETE"])
async def test_unknown_review_returns_404(
    client: httpx.AsyncClient, movie: DimMovie, method: str
) -> None:
    response = await client.request(method, likes_url(movie.sk_movie_id, UNKNOWN_ID))

    assert response.status_code == 404
    assert response.json() == {"detail": "Avaliação não encontrada."}


@pytest.mark.parametrize("method", ["POST", "DELETE"])
async def test_review_of_another_movie_returns_404_and_is_not_changed(
    client: httpx.AsyncClient, session: AsyncSession, movie: DimMovie, method: str
) -> None:
    other_movie = DimMovie(id_filme="2", titulo="Outro Filme")
    session.add(other_movie)
    review = await add_review(session, movie, curtidas=1)

    response = await client.request(
        method, likes_url(other_movie.sk_movie_id, review.sk_movie_review_id)
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Avaliação não encontrada."}
    reviews = (await client.get(f"/api/v1/movies/{movie.sk_movie_id}/reviews")).json()
    assert reviews[0]["curtidas"] == 1


@pytest.mark.parametrize("method", ["POST", "DELETE"])
async def test_unknown_movie_returns_404(client: httpx.AsyncClient, method: str) -> None:
    response = await client.request(method, likes_url(UNKNOWN_ID, UNKNOWN_ID))

    assert response.status_code == 404
    assert response.json() == {"detail": "Filme não encontrado."}
