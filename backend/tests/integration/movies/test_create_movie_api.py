import httpx
import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.movies.models import DimGenre, DimMovie, DimPerson

MOVIES_URL = "/api/v1/movies"
GENRES_URL = "/api/v1/genres"


@pytest.fixture
async def genres(session: AsyncSession) -> list[DimGenre]:
    genres = [DimGenre(nome_genero=nome) for nome in ["Science Fiction", "Drama", "History"]]
    session.add_all(genres)
    await session.commit()
    return genres


def movie_payload(**changes: object) -> dict[str, object]:
    return {
        "titulo": "Oppenheimer",
        "ano_lancamento": 2023,
        "diretores": ["Christopher Nolan"],
        "generos": ["History", "Drama"],
        "sinopse": "A história de J. Robert Oppenheimer.",
        **changes,
    }


async def count(session_factory: async_sessionmaker[AsyncSession], model: type) -> int:
    async with session_factory() as fresh_session:
        return await fresh_session.scalar(select(func.count()).select_from(model)) or 0


# POST /movies


@pytest.mark.usefixtures("genres")
async def test_create_movie_returns_the_movie_detail(client: httpx.AsyncClient) -> None:
    response = await client.post(MOVIES_URL, json=movie_payload())

    assert response.status_code == 201
    body = response.json()
    assert body == {
        "sk_movie_id": body["sk_movie_id"],
        "titulo": "Oppenheimer",
        "ano_lancamento": 2023,
        "duracao_minutos": None,
        "url_poster": None,
        "generos": ["Drama", "History"],
        "qtd_avaliacoes_usuarios": 0,
        "nota_media_usuarios": None,
        "estrelas_media": None,
        "data_lancamento": None,
        "status_filme": None,
        "sinopse": "A história de J. Robert Oppenheimer.",
        "url_backdrop": None,
        "diretores": ["Christopher Nolan"],
        "elenco": [],
    }


@pytest.mark.usefixtures("genres")
async def test_created_movie_joins_the_catalog(client: httpx.AsyncClient) -> None:
    created = (await client.post(MOVIES_URL, json=movie_payload())).json()

    detail = await client.get(f"{MOVIES_URL}/{created['sk_movie_id']}")
    catalog = await client.get(MOVIES_URL)

    assert detail.json() == created
    assert [movie["sk_movie_id"] for movie in catalog.json()["items"]] == [created["sk_movie_id"]]


@pytest.mark.usefixtures("genres")
async def test_new_directors_are_registered_as_people(
    client: httpx.AsyncClient, session_factory: async_sessionmaker[AsyncSession]
) -> None:
    await client.post(
        MOVIES_URL, json=movie_payload(diretores=["Lilly Wachowski", "Lana Wachowski"])
    )

    async with session_factory() as fresh_session:
        people = await fresh_session.execute(
            select(DimPerson.nome_pessoa, DimPerson.tipo_pessoa).order_by(DimPerson.nome_pessoa)
        )
    assert people.all() == [("Lana Wachowski", "Diretor"), ("Lilly Wachowski", "Diretor")]


@pytest.mark.usefixtures("genres")
async def test_existing_director_is_reused_ignoring_case(
    client: httpx.AsyncClient,
    session: AsyncSession,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    session.add(DimPerson(nome_pessoa="Christopher Nolan", tipo_pessoa="Diretor"))
    await session.commit()

    response = await client.post(MOVIES_URL, json=movie_payload(diretores=["christopher nolan"]))

    assert response.json()["diretores"] == ["Christopher Nolan"]
    assert await count(session_factory, DimPerson) == 1


@pytest.mark.usefixtures("genres")
async def test_actor_with_the_same_name_is_not_taken_as_the_director(
    client: httpx.AsyncClient,
    session: AsyncSession,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    session.add(DimPerson(nome_pessoa="Greta Gerwig", tipo_pessoa="Ator"))
    await session.commit()

    response = await client.post(MOVIES_URL, json=movie_payload(diretores=["Greta Gerwig"]))

    assert response.json()["diretores"] == ["Greta Gerwig"]
    assert await count(session_factory, DimPerson) == 2


@pytest.mark.usefixtures("genres")
async def test_create_movie_with_cast_lists_it_in_alphabetical_order(
    client: httpx.AsyncClient,
) -> None:
    response = await client.post(
        MOVIES_URL, json=movie_payload(elenco=["Emily Blunt", "Cillian Murphy", "emily blunt"])
    )

    assert response.status_code == 201
    assert response.json()["elenco"] == ["Cillian Murphy", "Emily Blunt"]


@pytest.mark.usefixtures("genres")
async def test_existing_actor_is_reused_ignoring_case(
    client: httpx.AsyncClient,
    session: AsyncSession,
    session_factory: async_sessionmaker[AsyncSession],
) -> None:
    session.add(DimPerson(nome_pessoa="Cillian Murphy", tipo_pessoa="Ator"))
    await session.commit()

    response = await client.post(MOVIES_URL, json=movie_payload(elenco=["cillian murphy"]))

    assert response.json()["elenco"] == ["Cillian Murphy"]
    # O ator reaproveitado e o diretor novo.
    assert await count(session_factory, DimPerson) == 2


@pytest.mark.usefixtures("genres")
async def test_the_same_person_can_direct_and_act(client: httpx.AsyncClient) -> None:
    response = await client.post(
        MOVIES_URL, json=movie_payload(diretores=["Greta Gerwig"], elenco=["Greta Gerwig"])
    )

    assert response.json()["diretores"] == ["Greta Gerwig"]
    assert response.json()["elenco"] == ["Greta Gerwig"]


@pytest.mark.usefixtures("genres")
async def test_create_movie_with_duration_status_and_poster(client: httpx.AsyncClient) -> None:
    poster = (
        await client.post(
            "/api/v1/posters",
            content=b"\x89PNG\r\n\x1a\n" + b"0" * 8,
            headers={"Content-Type": "image/png"},
        )
    ).json()["url"]

    response = await client.post(
        MOVIES_URL,
        json=movie_payload(duracao_minutos=180, status_filme="Pós-Produção", url_poster=poster),
    )

    body = response.json()
    assert response.status_code == 201
    assert body["duracao_minutos"] == 180
    assert body["status_filme"] == "Pós-Produção"
    assert body["url_poster"] == poster


@pytest.mark.usefixtures("genres")
async def test_poster_can_be_an_image_address(client: httpx.AsyncClient) -> None:
    url = "https://image.tmdb.org/t/p/w500/oppenheimer.jpg"

    response = await client.post(MOVIES_URL, json=movie_payload(url_poster=url))

    assert response.json()["url_poster"] == url


@pytest.mark.usefixtures("genres")
async def test_genres_are_matched_ignoring_case(client: httpx.AsyncClient) -> None:
    response = await client.post(MOVIES_URL, json=movie_payload(generos=["science fiction"]))

    assert response.json()["generos"] == ["Science Fiction"]


@pytest.mark.usefixtures("genres")
async def test_same_title_can_be_registered_again(client: httpx.AsyncClient) -> None:
    first = await client.post(MOVIES_URL, json=movie_payload(titulo="Duna", ano_lancamento=1984))
    remake = await client.post(MOVIES_URL, json=movie_payload(titulo="Duna", ano_lancamento=2021))

    assert (first.status_code, remake.status_code) == (201, 201)
    assert first.json()["sk_movie_id"] != remake.json()["sk_movie_id"]


@pytest.mark.usefixtures("genres")
async def test_unknown_genre_returns_422_and_nothing_is_saved(
    client: httpx.AsyncClient, session_factory: async_sessionmaker[AsyncSession]
) -> None:
    response = await client.post(MOVIES_URL, json=movie_payload(generos=["Drama", "Novela"]))

    assert response.status_code == 422
    assert response.json() == {"detail": "Gênero desconhecido: Novela."}
    assert await count(session_factory, DimMovie) == 0
    assert await count(session_factory, DimPerson) == 0


@pytest.mark.usefixtures("genres")
@pytest.mark.parametrize(
    "changes",
    [
        {"titulo": " "},
        {"ano_lancamento": "2023"},
        {"diretores": []},
        {"generos": []},
        {"elenco": [" "]},
        {"elenco": ["a" * 256]},
        {"duracao_minutos": 0},
        {"duracao_minutos": 20001},
        {"duracao_minutos": "90"},
        {"status_filme": "Cancelado"},
        {"url_poster": "javascript:alert(1)"},
        {"url_poster": "/api/v1/posters/../../rocketlab.db"},
    ],
)
async def test_invalid_movie_returns_422_and_is_not_saved(
    client: httpx.AsyncClient,
    session_factory: async_sessionmaker[AsyncSession],
    changes: dict[str, object],
) -> None:
    response = await client.post(MOVIES_URL, json=movie_payload(**changes))

    assert response.status_code == 422
    assert await count(session_factory, DimMovie) == 0


# GET /genres


@pytest.mark.usefixtures("genres")
async def test_genres_are_listed_in_alphabetical_order(client: httpx.AsyncClient) -> None:
    response = await client.get(GENRES_URL)

    assert response.status_code == 200
    assert response.json() == ["Drama", "History", "Science Fiction"]
