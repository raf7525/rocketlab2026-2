"""Pôsteres enviados pela aplicação: gravados em `<media_dir>/posters/` e servidos pela API.

Só entram imagens JPG, PNG e WebP de até 5 MB. O tipo é conferido pelos primeiros bytes do
arquivo, não pelo nome nem pelo tipo que o navegador informa. Cada arquivo ganha um nome
aleatório, e só nomes nesse formato são lidos ou apagados (nada de `../` fora da pasta).
"""

import re
from collections.abc import AsyncIterator
from pathlib import Path
from uuid import uuid4

from app.core.config import get_settings
from app.shared.exceptions import BusinessRuleError

MAX_BYTES = 5 * 1024 * 1024
POSTERS_PATH = f"{get_settings().api_v1_prefix}/posters"
POSTER_NAME = re.compile(r"[0-9a-f]{32}\.(?:jpg|png|webp)")
MEDIA_TYPES = {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}


def posters_dir() -> Path:
    return get_settings().media_dir / "posters"


def is_uploaded_poster(url: str) -> bool:
    """Se o endereço é de um pôster enviado por aqui (e não um link externo, como o do TMDB)."""

    prefix = f"{POSTERS_PATH}/"
    return url.startswith(prefix) and POSTER_NAME.fullmatch(url.removeprefix(prefix)) is not None


async def save_poster(chunks: AsyncIterator[bytes]) -> str:
    """Grava a imagem (lida aos pedaços, parando no limite) e devolve o endereço dela na API."""

    content = bytearray()
    async for chunk in chunks:
        content += chunk
        if len(content) > MAX_BYTES:
            raise BusinessRuleError("A imagem pode ter até 5 MB.")
    extension = _image_extension(content)
    if extension is None:
        raise BusinessRuleError("Envie uma imagem JPG, PNG ou WebP.")

    name = f"{uuid4().hex}{extension}"
    posters_dir().mkdir(parents=True, exist_ok=True)
    (posters_dir() / name).write_bytes(content)
    return f"{POSTERS_PATH}/{name}"


def find_poster(name: str) -> Path | None:
    """O arquivo com esse nome, se o nome for válido e o arquivo existir."""

    if not POSTER_NAME.fullmatch(name):
        return None
    path = posters_dir() / name
    return path if path.is_file() else None


def delete_poster(url: str | None) -> None:
    """Apaga o arquivo de um pôster enviado por aqui; links externos são ignorados."""

    if url and is_uploaded_poster(url):
        (posters_dir() / url.rsplit("/", 1)[1]).unlink(missing_ok=True)


def media_type(path: Path) -> str:
    return MEDIA_TYPES[path.suffix]


def _image_extension(content: bytes | bytearray) -> str | None:
    if content.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if content[:4] == b"RIFF" and content[8:12] == b"WEBP":
        return ".webp"
    return None
