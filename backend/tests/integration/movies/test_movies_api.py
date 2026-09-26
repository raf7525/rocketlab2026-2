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
                "na_watchlist": False,
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


# GET /movies com busca e filtros


def movie_with(
    titulo: str,
    *,
    popularidade: float | None = None,
    genres: list[DimGenre] | None = None,
    people: list[DimPerson] | None = None,
) -> DimMovie:
    movie = popular_movie(titulo, popularidade)
    movie.genres = genres or []
    movie.people = people or []
    return movie


def director(nome: str) -> DimPerson:
    return DimPerson(nome_pessoa=nome, tipo_pessoa="Diretor")


def actor(nome: str) -> DimPerson:
    return DimPerson(nome_pessoa=nome, tipo_pessoa="Ator")


def titles(response: httpx.Response) -> list[str]:
    return [item["titulo"] for item in response.json()["items"]]


async def test_search_finds_movies_by_part_of_the_title_ignoring_case(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    await add_movies(
        session,
        movie_with("The Matrix", popularidade=90),
        movie_with("The Matrix Reloaded", popularidade=80),
        movie_with("Blade Runner", popularidade=70),
    )

    response = await client.get(MOVIES_URL, params={"busca": "matrix"})

    assert response.status_code == 200
    assert titles(response) == ["The Matrix", "The Matrix Reloaded"]
    assert response.json()["total"] == 2
    assert response.json()["pages"] == 1


async def test_search_treats_percent_and_underscore_as_plain_text(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    await add_movies(session, movie_with("100% Wolf"), movie_with("Wolf"))

    response = await client.get(MOVIES_URL, params={"busca": "100%"})

    assert titles(response) == ["100% Wolf"]


async def test_filter_by_genre_ignoring_case(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    drama, action = DimGenre(nome_genero="Drama"), DimGenre(nome_genero="Action")
    await add_movies(
        session,
        movie_with("Oppenheimer", popularidade=90, genres=[drama]),
        movie_with("Heat", popularidade=80, genres=[action, drama]),
        movie_with("John Wick", popularidade=70, genres=[action]),
    )

    response = await client.get(MOVIES_URL, params={"genero": "drama"})

    assert titles(response) == ["Oppenheimer", "Heat"]


async def test_filter_by_part_of_the_director_name(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    nolan = director("Christopher Nolan")
    await add_movies(
        session,
        movie_with("Oppenheimer", popularidade=90, people=[nolan]),
        movie_with("Tenet", popularidade=80, people=[nolan]),
        movie_with("Dune", people=[director("Denis Villeneuve")]),
    )

    response = await client.get(MOVIES_URL, params={"diretor": "nolan"})

    assert titles(response) == ["Oppenheimer", "Tenet"]


async def test_filter_by_part_of_the_actor_name(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    await add_movies(
        session,
        movie_with("Oppenheimer", people=[actor("Cillian Murphy")]),
        movie_with("Dune", people=[actor("Zendaya")]),
    )

    response = await client.get(MOVIES_URL, params={"ator": "murphy"})

    assert titles(response) == ["Oppenheimer"]


async def test_person_filters_only_look_at_that_role(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    await add_movies(
        session,
        movie_with("Sherlock Jr.", people=[actor("Buster Keaton")]),
        movie_with("The General", people=[director("Buster Keaton")]),
    )

    by_director = await client.get(MOVIES_URL, params={"diretor": "keaton"})
    by_actor = await client.get(MOVIES_URL, params={"ator": "keaton"})

    assert titles(by_director) == ["The General"]
    assert titles(by_actor) == ["Sherlock Jr."]


async def test_movie_with_two_matching_people_appears_once(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    await add_movies(
        session,
        movie_with(
            "The Matrix",
            people=[
                director("Lana Wachowski"),
                director("Lilly Wachowski"),
            ],
        ),
    )

    response = await client.get(MOVIES_URL, params={"diretor": "wachowski"})

    assert titles(response) == ["The Matrix"]
    assert response.json()["total"] == 1


async def test_filter_by_status(client: httpx.AsyncClient, session: AsyncSession) -> None:
    released = movie_with("Oppenheimer", popularidade=90)
    released.status_filme = "Lançado"
    planned = movie_with("The Odyssey", popularidade=80)
    planned.status_filme = "Planejado"
    await add_movies(session, released, planned)

    response = await client.get(MOVIES_URL, params={"status": "Planejado"})

    assert titles(response) == ["The Odyssey"]


async def test_unknown_status_filter_returns_422(client: httpx.AsyncClient) -> None:
    response = await client.get(MOVIES_URL, params={"status": "Cancelado"})

    assert response.status_code == 422


async def test_filters_combine(client: httpx.AsyncClient, session: AsyncSession) -> None:
    drama, action = DimGenre(nome_genero="Drama"), DimGenre(nome_genero="Action")
    murphy = actor("Cillian Murphy")
    nolan = director("Christopher Nolan")
    await add_movies(
        session,
        movie_with("Oppenheimer", genres=[drama], people=[murphy, nolan]),
        movie_with("Dunkirk", genres=[action], people=[murphy, nolan]),
        movie_with("Peaky Blinders: The Movie", genres=[drama], people=[murphy]),
    )

    response = await client.get(
        MOVIES_URL, params={"genero": "Drama", "diretor": "Nolan", "ator": "Murphy"}
    )

    assert titles(response) == ["Oppenheimer"]


async def test_filtered_results_are_paginated(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    await add_movies(
        session,
        *(movie_with(f"Star Wars {n}", popularidade=n) for n in range(5)),
        movie_with("Alien", popularidade=100),
    )

    response = await client.get(MOVIES_URL, params={"busca": "star", "page": 2, "page_size": 2})

    body = response.json()
    assert titles(response) == ["Star Wars 2", "Star Wars 1"]
    assert (body["total"], body["pages"]) == (5, 3)


async def test_blank_filters_are_ignored(client: httpx.AsyncClient, session: AsyncSession) -> None:
    await add_movies(session, movie_with("Alien"), movie_with("Heat"))

    response = await client.get(
        MOVIES_URL, params={"busca": "  ", "genero": "", "diretor": "", "ator": ""}
    )

    assert response.json()["total"] == 2


async def test_search_without_results_is_an_empty_page(
    client: httpx.AsyncClient, session: AsyncSession
) -> None:
    await add_movies(session, movie_with("Alien"))

    response = await client.get(MOVIES_URL, params={"busca": "xyz"})

    assert response.status_code == 200
    assert response.json()["items"] == []
    assert response.json()["total"] == 0


async def test_too_long_search_returns_422(client: httpx.AsyncClient) -> None:
    response = await client.get(MOVIES_URL, params={"busca": "a" * 201})

    assert response.status_code == 422


# GET /movies/{id}


async def test_movie_detail_adds_release_date_status_synopsis_backdrop_directors_and_cast(
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
            DimPerson(nome_pessoa="Emily Blunt", tipo_pessoa="Ator"),
            DimPerson(nome_pessoa="Cillian Murphy", tipo_pessoa="Ator"),
            DimPerson(nome_pessoa="Christopher Nolan", tipo_pessoa="Diretor"),
            DimPerson(nome_pessoa="Kai Bird", tipo_pessoa="Roteirista"),
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
        "na_watchlist": False,
        "qtd_avaliacoes_usuarios": 0,
        "nota_media_usuarios": None,
        "estrelas_media": None,
        "data_lancamento": "2023-07-19",
        "status_filme": "Released",
        "sinopse": "A história de J. Robert Oppenheimer.",
        "url_backdrop": "https://image.tmdb.org/t/p/w1280/fundo.jpg",
        "diretores": ["Christopher Nolan"],
        # O CSV não traz a ordem dos créditos: o elenco sai em ordem alfabética.
        "elenco": ["Cillian Murphy", "Emily Blunt"],
    }


async def test_movie_detail_of_unknown_movie_returns_404(client: httpx.AsyncClient) -> None:
    response = await client.get(f"{MOVIES_URL}/{UNKNOWN_MOVIE_ID}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Filme não encontrado."}
