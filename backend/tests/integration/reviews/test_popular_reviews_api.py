from datetime import datetime

import httpx
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.movies.models import DimMovie, MovieReview

POPULAR_URL = "/api/v1/reviews/popular"


def review(movie: DimMovie, nome: str, curtidas: int, created_at: datetime) -> MovieReview:
    return MovieReview(
        sk_movie_id=movie.sk_movie_id,
        nome=nome,
        nota=8,
        comentario="Ótimo filme.",
        curtidas=curtidas,
        created_at=created_at,
    )


async def test_popular_reviews_come_from_every_movie_most_liked_first(
    client: httpx.AsyncClient, session: AsyncSession, movie: DimMovie
) -> None:
    other_movie = DimMovie(
        id_filme="2",
        titulo="Outro Filme",
        ano_lancamento=2019,
        url_poster="https://image.tmdb.org/t/p/w500/outro.jpg",
    )
    session.add(other_movie)
    await session.flush()
    session.add_all(
        [
            review(movie, "Pouco curtida", curtidas=1, created_at=datetime(2026, 9, 1)),
            review(other_movie, "Mais curtida", curtidas=10, created_at=datetime(2026, 1, 1)),
            review(movie, "Empate antiga", curtidas=5, created_at=datetime(2026, 2, 1)),
            review(movie, "Empate recente", curtidas=5, created_at=datetime(2026, 3, 1)),
        ]
    )
    await session.commit()

    response = await client.get(POPULAR_URL)

    assert response.status_code == 200
    body = response.json()
    assert [(r["nome"], r["curtidas"]) for r in body] == [
        ("Mais curtida", 10),
        ("Empate recente", 5),
        ("Empate antiga", 5),
        ("Pouco curtida", 1),
    ]
    assert body[0]["filme"] == {
        "sk_movie_id": other_movie.sk_movie_id,
        "titulo": "Outro Filme",
        "ano_lancamento": 2019,
        "url_poster": "https://image.tmdb.org/t/p/w500/outro.jpg",
    }
    assert body[0]["estrelas"] == 4.0


async def test_popular_reviews_respect_the_limit(
    client: httpx.AsyncClient, session: AsyncSession, movie: DimMovie
) -> None:
    session.add_all(
        review(movie, f"Review {n}", curtidas=n, created_at=datetime(2026, 1, 1)) for n in range(8)
    )
    await session.commit()

    default = await client.get(POPULAR_URL)
    limited = await client.get(POPULAR_URL, params={"limit": 2})

    assert len(default.json()) == 6
    assert [r["nome"] for r in limited.json()] == ["Review 7", "Review 6"]


async def test_no_reviews_means_an_empty_list(client: httpx.AsyncClient) -> None:
    response = await client.get(POPULAR_URL)

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.parametrize("limit", [0, 51])
async def test_invalid_limit_returns_422(client: httpx.AsyncClient, limit: int) -> None:
    response = await client.get(POPULAR_URL, params={"limit": limit})

    assert response.status_code == 422
