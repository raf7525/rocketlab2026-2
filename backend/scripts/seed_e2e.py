"""Prepara o banco dos testes ponta a ponta (Cypress) com um conjunto pequeno e fixo de filmes.

Uso (o `npm run e2e` do front chama isto antes de cada cenário):

    python -m scripts.seed_e2e --database /tmp/e2e/e2e.db --media-dir /tmp/e2e/media

Aplica as migrações, apaga tudo o que houver no banco e na pasta de imagens e grava os dados
abaixo. Com dados fixos, os cenários sabem exatamente o que esperar (ex.: "matrix" encontra 2
filmes). Por segurança, recusa o banco padrão da aplicação (`rocketlab.db`).
"""

import argparse
import shutil
from dataclasses import dataclass, field
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import enable_sqlite_foreign_keys
from app.movies.models import (
    DimGenre,
    DimMovie,
    DimPerson,
    DimReview,
    FactMoviePerformance,
    MovieReview,
)

BACKEND_DIR = Path(__file__).resolve().parents[1]
APP_DATABASE = (BACKEND_DIR / "rocketlab.db").resolve()

GENRES = ("Action", "Adventure", "Crime", "Drama", "Science Fiction", "Thriller")

# Quantos filmes "de arquivo" completam o catálogo: com os 6 principais, são 28 filmes, ou seja,
# uma página cheia (24) e uma segunda página com 4.
ARCHIVE_MOVIES = 22


@dataclass
class Movie:
    titulo: str
    ano: int
    popularidade: float
    generos: list[str]
    diretores: list[str]
    elenco: list[str] = field(default_factory=list)
    duracao: int | None = None
    status: str = "Lançado"
    sinopse: str | None = None
    avaliacoes: list[tuple[str, float, str]] = field(default_factory=list)


# Os seis filmes que os cenários citam pelo nome, do mais popular para o menos.
MOVIES = [
    Movie(
        "The Matrix",
        1999,
        100,
        ["Action", "Science Fiction"],
        ["Lana Wachowski", "Lilly Wachowski"],
        ["Keanu Reeves", "Carrie-Anne Moss", "Laurence Fishburne"],
        duracao=136,
        sinopse="Um hacker descobre que a realidade é uma simulação.",
        avaliacoes=[("Ana", 10, "Revolucionário."), ("Bruno", 8, "Efeitos incríveis.")],
    ),
    Movie(
        "The Matrix Reloaded",
        2003,
        90,
        ["Action", "Science Fiction"],
        ["Lana Wachowski", "Lilly Wachowski"],
        ["Keanu Reeves", "Monica Bellucci"],
        duracao=138,
    ),
    Movie(
        "John Wick",
        2014,
        80,
        ["Action", "Thriller"],
        ["Chad Stahelski"],
        ["Keanu Reeves"],
        duracao=101,
    ),
    Movie(
        "Heat",
        1995,
        70,
        ["Action", "Crime", "Drama"],
        ["Michael Mann"],
        ["Al Pacino", "Robert De Niro"],
        duracao=170,
        avaliacoes=[("Carla", 8, "Tenso do início ao fim."), ("Davi", 6, "Longo demais.")],
    ),
    Movie(
        "Oppenheimer",
        2023,
        60,
        ["Drama"],
        ["Christopher Nolan"],
        ["Cillian Murphy", "Emily Blunt"],
        duracao=180,
        sinopse="A história do físico J. Robert Oppenheimer.",
    ),
    Movie(
        "The Odyssey",
        2026,
        50,
        ["Adventure"],
        ["Christopher Nolan"],
        ["Matt Damon"],
        status="Planejado",
    ),
    *(
        Movie(f"Filme de Arquivo {n:02d}", 1980, n, ["Drama"], ["Diretor de Arquivo"])
        for n in range(ARCHIVE_MOVIES, 0, -1)
    ),
]


def seed(database: Path, media_dir: Path) -> None:
    database = database.resolve()
    if database == APP_DATABASE:
        raise SystemExit("Recusado: este é o banco da aplicação, não o dos testes.")

    settings = get_settings()
    settings.database_url = f"sqlite+aiosqlite:///{database}"
    settings.media_dir = media_dir
    database.parent.mkdir(parents=True, exist_ok=True)
    command.upgrade(Config(str(BACKEND_DIR / "alembic.ini")), "head")

    shutil.rmtree(media_dir, ignore_errors=True)
    media_dir.mkdir(parents=True)

    engine = create_engine(f"sqlite:///{database}")
    enable_sqlite_foreign_keys(engine)
    with Session(engine) as session:
        for table in reversed(Base.metadata.sorted_tables):
            session.execute(table.delete())
        session.add_all(_build_movies())
        session.commit()
    engine.dispose()


def _build_movies() -> list[DimMovie]:
    genres = {name: DimGenre(nome_genero=name) for name in GENRES}
    people: dict[tuple[str, str], DimPerson] = {}

    def person(nome: str, tipo: str) -> DimPerson:
        return people.setdefault((nome, tipo), DimPerson(nome_pessoa=nome, tipo_pessoa=tipo))

    movies = []
    for n, data in enumerate(MOVIES, start=1):
        scores = [nota for _, nota, _ in data.avaliacoes]
        movies.append(
            DimMovie(
                id_filme=f"e2e-{n}",
                titulo=data.titulo,
                ano_lancamento=data.ano,
                duracao_minutos=data.duracao,
                status_filme=data.status,
                sinopse=data.sinopse,
                genres=[genres[name] for name in data.generos],
                people=[person(nome, "Diretor") for nome in data.diretores]
                + [person(nome, "Ator") for nome in data.elenco],
                performance=FactMoviePerformance(popularidade=data.popularidade),
                reviews=[
                    MovieReview(nome=nome, nota=nota, comentario=comentario)
                    for nome, nota, comentario in data.avaliacoes
                ],
                # O mesmo resumo que a API recalcula a cada avaliação nova.
                reviews_summary=DimReview(
                    qtd_avaliacoes_usuarios=len(scores),
                    nota_media_usuarios=sum(scores) / len(scores) if scores else None,
                ),
            )
        )
    return movies


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepara o banco dos testes ponta a ponta.")
    parser.add_argument("--database", type=Path, required=True, help="arquivo SQLite dos testes")
    parser.add_argument("--media-dir", type=Path, required=True, help="pasta das imagens enviadas")
    args = parser.parse_args()
    seed(args.database, args.media_dir)


if __name__ == "__main__":
    main()
