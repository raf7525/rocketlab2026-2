from datetime import datetime

import httpx
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.movies.models import DimMovie, DimReview, MovieReview

UNKNOWN_MOVIE_ID = "0" * 64


def reviews_url(sk_movie_id: str) -> str:
    return f"/api/v1/movies/{sk_movie_id}/reviews"


def review_payload(nota: int = 7) -> dict[str, object]:
    return {"nome": "Ana", "nota": nota, "comentario": "Ótimo filme."}


# POST /movies/{id}/reviews


async def test_create_review_returns_the_saved_review(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    response = await client.post(reviews_url(movie.sk_movie_id), json=review_payload(nota=7))

    assert response.status_code == 201
    body = response.json()
    assert body["sk_movie_id"] == movie.sk_movie_id
    assert body["nome"] == "Ana"
    assert body["nota"] == 7
    assert body["estrelas"] == 3.5
    assert body["comentario"] == "Ótimo filme."
    assert body["curtidas"] == 0
    assert body["sk_movie_review_id"]
    assert body["created_at"]


async def test_create_review_for_unknown_movie_returns_404(client: httpx.AsyncClient) -> None:
    response = await client.post(reviews_url(UNKNOWN_MOVIE_ID), json=review_payload())

    assert response.status_code == 404
    assert response.json() == {"detail": "Filme não encontrado."}


@pytest.mark.parametrize("nota", [11, 7.5])
async def test_invalid_review_returns_422_and_is_not_saved(
    client: httpx.AsyncClient, movie: DimMovie, nota: object
) -> None:
    response = await client.post(reviews_url(movie.sk_movie_id), json=review_payload(nota=nota))

    assert response.status_code == 422
    assert (await client.get(reviews_url(movie.sk_movie_id))).json() == []


async def test_new_reviews_update_the_movie_average(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    await client.post(reviews_url(movie.sk_movie_id), json=review_payload(nota=8))
    await client.post(reviews_url(movie.sk_movie_id), json=review_payload(nota=6))

    response = await client.get(f"{reviews_url(movie.sk_movie_id)}/summary")

    assert response.json() == {
        "qtd_avaliacoes_usuarios": 2,
        "nota_media_usuarios": 7.0,
        "estrelas_media": 3.5,
    }


async def test_average_is_stored_in_dim_reviews(
    client: httpx.AsyncClient,
    movie: DimMovie,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    await client.post(reviews_url(movie.sk_movie_id), json=review_payload(nota=9))
    await client.post(reviews_url(movie.sk_movie_id), json=review_payload(nota=4))

    async with session_factory() as fresh_session:
        summary = await fresh_session.scalar(
            select(DimReview).where(DimReview.sk_movie_id == movie.sk_movie_id)
        )

    assert summary is not None
    assert summary.qtd_avaliacoes_usuarios == 2
    assert summary.nota_media_usuarios == 6.5


async def test_average_is_recalculated_from_all_individual_reviews(
    client: httpx.AsyncClient, movie: DimMovie, session: AsyncSession
) -> None:
    # Resumo desatualizado, como acontece com parte dos dados do CSV.
    session.add(DimReview(sk_movie_id=movie.sk_movie_id, qtd_avaliacoes_usuarios=5))
    session.add(
        MovieReview(sk_movie_id=movie.sk_movie_id, nome="Bia", nota=2.5, comentario="Fraco.")
    )
    await session.commit()

    await client.post(reviews_url(movie.sk_movie_id), json=review_payload(nota=8))
    response = await client.get(f"{reviews_url(movie.sk_movie_id)}/summary")

    assert response.json()["qtd_avaliacoes_usuarios"] == 2
    assert response.json()["nota_media_usuarios"] == 5.25


# GET /movies/{id}/reviews


async def test_list_reviews_newest_first_with_stars(
    client: httpx.AsyncClient, movie: DimMovie, session: AsyncSession
) -> None:
    other_movie = DimMovie(id_filme="2", titulo="Outro Filme")
    session.add(other_movie)
    await session.flush()
    session.add_all(
        [
            MovieReview(
                sk_movie_id=movie.sk_movie_id,
                nome="Antiga",
                nota=9.8,
                comentario="Obra-prima.",
                created_at=datetime(2026, 1, 1),
            ),
            MovieReview(
                sk_movie_id=movie.sk_movie_id,
                nome="Recente",
                nota=2.4,
                comentario="Não gostei.",
                created_at=datetime(2026, 6, 1),
            ),
            MovieReview(
                sk_movie_id=other_movie.sk_movie_id,
                nome="De outro filme",
                nota=5,
                comentario="Ok.",
            ),
        ]
    )
    await session.commit()

    response = await client.get(reviews_url(movie.sk_movie_id))

    assert response.status_code == 200
    assert [(r["nome"], r["nota"], r["estrelas"]) for r in response.json()] == [
        ("Recente", 2.4, 1.0),
        ("Antiga", 9.8, 5.0),
    ]


async def test_reviews_created_in_the_same_second_keep_their_order(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    for nome in ["Primeira", "Segunda", "Terceira"]:
        await client.post(reviews_url(movie.sk_movie_id), json={**review_payload(), "nome": nome})

    response = await client.get(reviews_url(movie.sk_movie_id))

    assert [r["nome"] for r in response.json()] == ["Terceira", "Segunda", "Primeira"]


async def test_list_reviews_for_unknown_movie_returns_404(client: httpx.AsyncClient) -> None:
    response = await client.get(reviews_url(UNKNOWN_MOVIE_ID))

    assert response.status_code == 404
    assert response.json() == {"detail": "Filme não encontrado."}


# GET /movies/{id}/reviews/summary


async def test_summary_of_movie_without_reviews_is_empty(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    response = await client.get(f"{reviews_url(movie.sk_movie_id)}/summary")

    assert response.status_code == 200
    assert response.json() == {
        "qtd_avaliacoes_usuarios": 0,
        "nota_media_usuarios": None,
        "estrelas_media": None,
    }


async def test_summary_for_unknown_movie_returns_404(client: httpx.AsyncClient) -> None:
    response = await client.get(f"{reviews_url(UNKNOWN_MOVIE_ID)}/summary")

    assert response.status_code == 404
    assert response.json() == {"detail": "Filme não encontrado."}
