from pathlib import Path

import httpx
import pytest

POSTERS_URL = "/api/v1/posters"

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 32
JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 32
WEBP = b"RIFF\x24\x00\x00\x00WEBPVP8 " + b"\x00" * 32


def upload(client: httpx.AsyncClient, content: bytes, mime: str = "image/png"):
    return client.post(POSTERS_URL, content=content, headers={"Content-Type": mime})


@pytest.mark.parametrize(("content", "extension"), [(PNG, ".png"), (JPEG, ".jpg"), (WEBP, ".webp")])
async def test_upload_saves_the_image_and_returns_its_address(
    client: httpx.AsyncClient, media_dir: Path, content: bytes, extension: str
) -> None:
    response = await upload(client, content)

    assert response.status_code == 201
    url = response.json()["url"]
    assert url.startswith(f"{POSTERS_URL}/")
    assert url.endswith(extension)
    saved = media_dir / "posters" / url.rsplit("/", 1)[1]
    assert saved.read_bytes() == content


async def test_uploaded_image_can_be_downloaded(client: httpx.AsyncClient) -> None:
    url = (await upload(client, PNG)).json()["url"]

    response = await client.get(url)

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content == PNG


async def test_the_type_comes_from_the_content_not_from_the_name(
    client: httpx.AsyncClient,
) -> None:
    response = await upload(client, b"<script>alert(1)</script>", "image/png")

    assert response.status_code == 422
    assert response.json() == {"detail": "Envie uma imagem JPG, PNG ou WebP."}


async def test_image_larger_than_5_mb_is_refused(
    client: httpx.AsyncClient, media_dir: Path
) -> None:
    response = await upload(client, PNG + b"\x00" * (5 * 1024 * 1024))

    assert response.status_code == 422
    assert response.json() == {"detail": "A imagem pode ter até 5 MB."}
    assert not any((media_dir / "posters").glob("*"))


async def test_unknown_image_returns_404(client: httpx.AsyncClient) -> None:
    response = await client.get(f"{POSTERS_URL}/{'0' * 32}.png")

    assert response.status_code == 404
    assert response.json() == {"detail": "Imagem não encontrada."}


@pytest.mark.parametrize("name", ["..%2F..%2Frocketlab.db", "poster.txt", "abc.png"])
async def test_only_names_created_by_the_upload_are_served(
    client: httpx.AsyncClient, name: str
) -> None:
    response = await client.get(f"{POSTERS_URL}/{name}")

    assert response.status_code == 404
