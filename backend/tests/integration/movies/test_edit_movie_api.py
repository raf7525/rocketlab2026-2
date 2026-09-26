from datetime import date

import httpx
import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.movies.models import (
    DimGenre,
    DimMovie,
    DimPerson,
    DimReview,
    FactMoviePerformance,
    MovieReview,
    bridge_movie_genre,
    bridge_movie_person,
)

MOVIES_URL = "/api/v1/movies"
UNKNOWN_MOVIE_ID = "0" * 64


@pytest.fixture
async def movie(session: AsyncSession) -> DimMovie:
    """Filme importado do CSV: com pôster, elenco, roteirista, métricas e avaliações."""

    movie = DimMovie(
        id_filme="872585",
        titulo="Oppenhaimer",
        data_lancamento=date(2023, 7, 19),
        ano_lancamento=2023,
        duracao_minutos=180,
        sinopse="Resumo antigo.",
        url_poster="https://image.tmdb.org/t/p/w500/oppenheimer.jpg",
        genres=[DimGenre(nome_genero="Drama")],
        people=[
            DimPerson(nome_pessoa="Cillian Murphy", tipo_pessoa="Ator"),
            DimPerson(nome_pessoa="Kai Bird", tipo_pessoa="Roteirista"),
            DimPerson(nome_pessoa="Chris Nolan", tipo_pessoa="Diretor"),
        ],
        performance=FactMoviePerformance(popularidade=90),
        reviews_summary=DimReview(qtd_avaliacoes_usuarios=1, nota_media_usuarios=8),
        reviews=[MovieReview(nome="Ana", nota=8, comentario="Ótimo.")],
    )
    session.add_all([movie, DimGenre(nome_genero="History")])
    await session.commit()
    return movie


def movie_payload(**changes: object) -> dict[str, object]:
    return {
        "titulo": "Oppenheimer",
        "ano_lancamento": 2023,
        "diretores": ["Christopher Nolan"],
        "generos": ["History", "Drama"],
        "sinopse": "A história de J. Robert Oppenheimer.",
        **changes,
    }


async def count(session_factory: async_sessionmaker[AsyncSession], what: object) -> int:
    async with session_factory() as fresh_session:
        return await fresh_session.scalar(select(func.count()).select_from(what)) or 0


# PUT /movies/{id}


async def test_update_movie_returns_the_updated_detail(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    response = await client.put(f"{MOVIES_URL}/{movie.sk_movie_id}", json=movie_payload())

    assert response.status_code == 200
    body = response.json()
    assert body["sk_movie_id"] == movie.sk_movie_id
    assert body["titulo"] == "Oppenheimer"
    assert body["sinopse"] == "A história de J. Robert Oppenheimer."
    assert body["generos"] == ["Drama", "History"]
    assert body["diretores"] == ["Christopher Nolan"]


async def test_update_keeps_what_the_form_does_not_edit(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    await client.put(f"{MOVIES_URL}/{movie.sk_movie_id}", json=movie_payload())

    body = (await client.get(f"{MOVIES_URL}/{movie.sk_movie_id}")).json()
    assert body["elenco"] == ["Cillian Murphy"]
    assert body["duracao_minutos"] == 180
    assert body["url_poster"] == "https://image.tmdb.org/t/p/w500/oppenheimer.jpg"
    assert body["data_lancamento"] == "2023-07-19"
    assert body["qtd_avaliacoes_usuarios"] == 1
    reviews = (await client.get(f"{MOVIES_URL}/{movie.sk_movie_id}/reviews")).json()
    assert [review["comentario"] for review in reviews] == ["Ótimo."]


async def test_update_replaces_the_cast_when_it_is_sent(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    response = await client.put(
        f"{MOVIES_URL}/{movie.sk_movie_id}",
        json=movie_payload(elenco=["Emily Blunt", "cillian murphy"]),
    )

    assert response.json()["elenco"] == ["Cillian Murphy", "Emily Blunt"]


async def test_update_can_clear_the_cast(client: httpx.AsyncClient, movie: DimMovie) -> None:
    response = await client.put(f"{MOVIES_URL}/{movie.sk_movie_id}", json=movie_payload(elenco=[]))

    assert response.json()["elenco"] == []


async def test_update_keeps_writers_linked(
    client: httpx.AsyncClient,
    movie: DimMovie,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    await client.put(f"{MOVIES_URL}/{movie.sk_movie_id}", json=movie_payload())

    async with session_factory() as fresh_session:
        types = await fresh_session.scalars(
            select(DimPerson.tipo_pessoa)
            .join(bridge_movie_person)
            .where(bridge_movie_person.c.sk_movie_id == movie.sk_movie_id)
            .order_by(DimPerson.tipo_pessoa)
        )
        assert list(types) == ["Ator", "Diretor", "Roteirista"]


async def test_changing_the_year_drops_a_release_date_from_another_year(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    response = await client.put(
        f"{MOVIES_URL}/{movie.sk_movie_id}", json=movie_payload(ano_lancamento=2024)
    )

    assert response.json()["ano_lancamento"] == 2024
    assert response.json()["data_lancamento"] is None


async def test_update_can_clear_the_synopsis(client: httpx.AsyncClient, movie: DimMovie) -> None:
    response = await client.put(
        f"{MOVIES_URL}/{movie.sk_movie_id}", json=movie_payload(sinopse="   ")
    )

    assert response.json()["sinopse"] is None


async def test_update_reuses_an_existing_director(
    client: httpx.AsyncClient,
    movie: DimMovie,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    people_before = await count(session_factory, DimPerson)

    await client.put(
        f"{MOVIES_URL}/{movie.sk_movie_id}", json=movie_payload(diretores=["chris nolan"])
    )

    assert await count(session_factory, DimPerson) == people_before


async def test_update_with_unknown_genre_returns_422_and_changes_nothing(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    response = await client.put(
        f"{MOVIES_URL}/{movie.sk_movie_id}", json=movie_payload(generos=["Faroeste"])
    )

    assert response.status_code == 422
    assert response.json() == {"detail": "Gênero desconhecido: Faroeste."}
    body = (await client.get(f"{MOVIES_URL}/{movie.sk_movie_id}")).json()
    assert body["titulo"] == "Oppenhaimer"


@pytest.mark.parametrize(
    "changes",
    [{"titulo": " "}, {"ano_lancamento": 1700}, {"diretores": []}, {"generos": []}],
)
async def test_update_with_invalid_data_returns_422(
    client: httpx.AsyncClient, movie: DimMovie, changes: dict[str, object]
) -> None:
    response = await client.put(f"{MOVIES_URL}/{movie.sk_movie_id}", json=movie_payload(**changes))

    assert response.status_code == 422


async def test_update_of_unknown_movie_returns_404(client: httpx.AsyncClient) -> None:
    response = await client.put(f"{MOVIES_URL}/{UNKNOWN_MOVIE_ID}", json=movie_payload())

    assert response.status_code == 404
    assert response.json() == {"detail": "Filme não encontrado."}


# DELETE /movies/{id}


async def test_delete_movie_removes_it_from_the_catalog(
    client: httpx.AsyncClient, movie: DimMovie
) -> None:
    response = await client.delete(f"{MOVIES_URL}/{movie.sk_movie_id}")

    assert response.status_code == 204
    assert response.content == b""
    assert (await client.get(f"{MOVIES_URL}/{movie.sk_movie_id}")).status_code == 404
    assert (await client.get(MOVIES_URL)).json()["total"] == 0


async def test_delete_movie_removes_its_reviews_metrics_and_links(
    client: httpx.AsyncClient,
    movie: DimMovie,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    await client.delete(f"{MOVIES_URL}/{movie.sk_movie_id}")

    assert await count(session_factory, MovieReview) == 0
    assert await count(session_factory, DimReview) == 0
    assert await count(session_factory, FactMoviePerformance) == 0
    assert await count(session_factory, bridge_movie_genre) == 0
    assert await count(session_factory, bridge_movie_person) == 0


async def test_delete_movie_keeps_genres_and_people(
    client: httpx.AsyncClient,
    movie: DimMovie,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    await client.delete(f"{MOVIES_URL}/{movie.sk_movie_id}")

    assert await count(session_factory, DimGenre) == 2
    assert await count(session_factory, DimPerson) == 3


async def test_delete_of_unknown_movie_returns_404(client: httpx.AsyncClient) -> None:
    response = await client.delete(f"{MOVIES_URL}/{UNKNOWN_MOVIE_ID}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Filme não encontrado."}
