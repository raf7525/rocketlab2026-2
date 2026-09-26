from datetime import date

import httpx
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.movies.models import DimGenre, DimMovie, DimPerson, DimReview, FactMoviePerformance

MOVIES_URL = "/api/v1/movies"
UNKNOWN_MOVIE_ID = "0" * 64


async def add_movies(session: AsyncSession, *movies: DimMovie) -> None:
    session.add_all(movies)
    await session.commit()


def popular_movie(titulo: str, popularidade: float | None) -> DimMovie:
    performance = None if popularidade is None else FactMoviePerformance(popularidade=popularidade)
    return DimMovie(id_filme=titulo, titulo=titulo, performance=performance)


# GET /movies


async def test_catalog_lists_movies_with_genres_and_rating_summary(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    movie = DimMovie(
        id_filme="872585",
        titulo="Oppenheimer",
        ano_lancamento=2023,
        duracao_minutos=180,
        url_poster="https://image.tmdb.org/t/p/w500/oppenheimer.jpg",
        genres=[DimGenre(nome_genero="Drama"), DimGenre(nome_genero="History")],
        reviews_summary=DimReview(qtd_avaliacoes_usuarios=4, nota_media_usuarios=7.25),
    )
    await add_movies(session, movie)

    response = await client.get(MOVIES_URL)

    assert response.status_code == 200
    assert response.json() == {
        "items": [
            {
                "sk_movie_id": movie.sk_movie_id,
                "titulo": "Oppenheimer",
                "ano_lancamento": 2023,
                "duracao_minutos": 180,
                "url_poster": "https://image.tmdb.org/t/p/w500/oppenheimer.jpg",
                "generos": ["Drama", "History"],
                "qtd_avaliacoes_usuarios": 4,
                "nota_media_usuarios": 7.25,
                "estrelas_media": 3.5,
            }
        ],
        "total": 1,
        "page": 1,
        "page_size": 24,
        "pages": 1,
    }


async def test_movie_without_reviews_has_empty_rating(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    response = await client.get(MOVIES_URL)

    item = response.json()["items"][0]
    assert item["qtd_avaliacoes_usuarios"] == 0
    assert item["nota_media_usuarios"] is None
    assert item["estrelas_media"] is None


async def test_catalog_is_paginated(client: httpx.AsyncClient, session: AsyncSession) -> None:
    await add_movies(session, *(popular_movie(f"Filme {n}", popularidade=n) for n in range(5)))

    response = await client.get(MOVIES_URL, params={"page": 2, "page_size": 2})

    body = response.json()
    assert [item["titulo"] for item in body["items"]] == ["Filme 2", "Filme 1"]
    assert (body["total"], body["page"], body["page_size"], body["pages"]) == (5, 2, 2, 3)


async def test_catalog_shows_most_popular_first_and_unknown_popularity_last(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    await add_movies(
        session,
        popular_movie("Sem dados", popularidade=None),
        popular_movie("Pouco visto", popularidade=1.5),
        popular_movie("Sucesso", popularidade=900.0),
    )

    response = await client.get(MOVIES_URL)

    assert [item["titulo"] for item in response.json()["items"]] == [
        "Sucesso",
        "Pouco visto",
        "Sem dados",
    ]


async def test_empty_catalog_has_no_pages(client: httpx.AsyncClient) -> None:
    response = await client.get(MOVIES_URL)

    assert response.json() == {"items": [], "total": 0, "page": 1, "page_size": 24, "pages": 0}


@pytest.mark.parametrize("params", [{"page": 0}, {"page_size": 0}, {"page_size": 101}])
async def test_invalid_page_returns_422(client: httpx.AsyncClient, params: dict[str, int]) -> None:
    response = await client.get(MOVIES_URL, params=params)

    assert response.status_code == 422


# GET /movies/{id}


async def test_movie_detail_adds_release_date_status_synopsis_backdrop_and_directors(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    movie = DimMovie(
        id_filme="872585",
        titulo="Oppenheimer",
        data_lancamento=date(2023, 7, 19),
        ano_lancamento=2023,
        duracao_minutos=180,
        status_filme="Released",
        sinopse="A história de J. Robert Oppenheimer.",
        url_poster="https://image.tmdb.org/t/p/w500/oppenheimer.jpg",
        url_backdrop="https://image.tmdb.org/t/p/w1280/fundo.jpg",
        genres=[DimGenre(nome_genero="Drama")],
        people=[
            DimPerson(nome_pessoa="Cillian Murphy", tipo_pessoa="Ator"),
            DimPerson(nome_pessoa="Christopher Nolan", tipo_pessoa="Diretor"),
        ],
    )
    await add_movies(session, movie)

    response = await client.get(f"{MOVIES_URL}/{movie.sk_movie_id}")

    assert response.status_code == 200
    assert response.json() == {
        "sk_movie_id": movie.sk_movie_id,
        "titulo": "Oppenheimer",
        "ano_lancamento": 2023,
        "duracao_minutos": 180,
        "url_poster": "https://image.tmdb.org/t/p/w500/oppenheimer.jpg",
        "generos": ["Drama"],
        "qtd_avaliacoes_usuarios": 0,
        "nota_media_usuarios": None,
        "estrelas_media": None,
        "data_lancamento": "2023-07-19",
        "status_filme": "Released",
        "sinopse": "A história de J. Robert Oppenheimer.",
        "url_backdrop": "https://image.tmdb.org/t/p/w1280/fundo.jpg",
        "diretores": ["Christopher Nolan"],
    }


async def test_movie_detail_of_unknown_movie_returns_404(client: httpx.AsyncClient) -> None:
    response = await client.get(f"{MOVIES_URL}/{UNKNOWN_MOVIE_ID}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Filme não encontrado."}
