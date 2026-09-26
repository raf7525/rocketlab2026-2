"""Carrega os CSVs da camada Diamond no banco configurado em `DATABASE_URL`.

Uso, dentro de `backend/` e com as migrations aplicadas (`alembic upgrade head`):

    python -m scripts.load_data                      # CSVs em backend/data/
    python -m scripts.load_data --csv-dir ~/rocket   # CSVs em outra pasta
    python -m scripts.load_data --reset              # apaga tudo e carrega de novo

Os CSVs podem ficar soltos na pasta ou nas subpastas originais (bases_atv_dev1/ e
bases_atv_dev_2/). O `dim_reviews.csv` não é importado: ele não bate com as avaliações
individuais, então o resumo de cada filme é recalculado a partir de `movies_reviews.csv`,
como a API faz a cada nova avaliação.
"""

import argparse
import csv
import logging
import sys
import time
from collections.abc import Callable, Iterable, Iterator
from dataclasses import dataclass, field
from datetime import date
from itertools import islice
from pathlib import Path

from sqlalchemy import Connection, Table, create_engine, func, inspect, select

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import enable_sqlite_foreign_keys
from app.movies.models import (
    DimCompany,
    DimGenre,
    DimMovie,
    DimPerson,
    DimReview,
    FactMoviePerformance,
    MovieReview,
    bridge_movie_company,
    bridge_movie_genre,
    bridge_movie_person,
)

logger = logging.getLogger(__name__)

DEFAULT_CSV_DIR = Path(__file__).resolve().parents[1] / "data"
BATCH_SIZE = 10_000

Converter = Callable[[str], object]


class LoadError(Exception):
    """Problema que impede a carga; nada é gravado."""


def optional(convert: Converter) -> Converter:
    """Célula vazia vira NULL; as demais passam pela conversão."""

    return lambda value: None if value == "" else convert(value)


def whole_number(value: str) -> int:
    """O CSV grava algumas contagens como decimais: "2375.0" → 2375."""

    return int(float(value))


def unquote(value: str) -> str:
    """Desfaz a segunda camada de CSV de títulos e sinopses que têm aspas.

    Esses textos chegam como `"Julia sees a ""movie"" ..."` (às vezes cortados antes da aspa
    final); lê-los mais uma vez como CSV devolve `Julia sees a "movie" ...`.
    """

    return next(csv.reader([value]))[0] if value.startswith('"') else value


@dataclass(frozen=True)
class CsvTable:
    """Um CSV e a tabela que ele preenche. Colunas sem conversor entram como texto."""

    file_name: str
    table: Table
    converters: dict[str, Converter] = field(default_factory=dict)


optional_float = optional(float)

# Na ordem das chaves estrangeiras: dimensões, depois pontes, fato e avaliações.
CSV_TABLES = (
    CsvTable("dim_genres.csv", DimGenre.__table__),
    CsvTable("dim_companies.csv", DimCompany.__table__),
    CsvTable("dim_people.csv", DimPerson.__table__),
    CsvTable(
        "dim_movies.csv",
        DimMovie.__table__,
        {
            "titulo": unquote,
            "data_lancamento": optional(date.fromisoformat),
            "ano_lancamento": optional(int),
            "duracao_minutos": optional(int),
            "status_filme": optional(str),
            "sinopse": optional(unquote),
            "url_poster": optional(str),
            "url_backdrop": optional(str),
        },
    ),
    CsvTable("bridge_movie_genre.csv", bridge_movie_genre),
    CsvTable("bridge_movie_company.csv", bridge_movie_company),
    CsvTable("bridge_movie_person.csv", bridge_movie_person),
    CsvTable(
        "fact_movies_performance.csv",
        FactMoviePerformance.__table__,
        {
            "orcamento_usd": optional_float,
            "receita_usd": optional_float,
            "lucro_usd": float,
            "orcamento_brl": optional_float,
            "receita_brl": optional_float,
            "lucro_brl": float,
            "popularidade": optional_float,
            "nota_tmdb": optional_float,
            "qtd_tmdb": optional(whole_number),
            "nota_imdb": optional_float,
            "qtd_imdb": optional(whole_number),
        },
    ),
    CsvTable("movies_reviews.csv", MovieReview.__table__, {"nota": float}),
)


def load_csvs(connection: Connection, csv_dir: Path, *, reset: bool = False) -> dict[str, int]:
    """Carrega os CSVs na transação de `connection` e devolve quantas linhas cada tabela recebeu."""

    paths = _find_csvs(csv_dir)
    _check_schema(connection)
    if reset:
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())
    elif _has_data(connection):
        raise LoadError(
            "O banco já tem dados. Use --reset para apagá-los (inclusive os filmes e as "
            "avaliações cadastrados pela aplicação) e carregar os CSVs de novo."
        )

    counts: dict[str, int] = {}
    for spec in CSV_TABLES:
        counts[spec.table.name] = _insert_csv(connection, spec, paths[spec.file_name])
        logger.info("%-25s %9s linhas", spec.table.name, _thousands(counts[spec.table.name]))
    counts[DimReview.__tablename__] = _summarize_reviews(connection)
    logger.info("%-25s %9s linhas", DimReview.__tablename__, _thousands(counts["dim_reviews"]))
    return counts


def _find_csvs(csv_dir: Path) -> dict[str, Path]:
    """Procura cada CSV na pasta e nas subpastas diretas dela."""

    paths: dict[str, Path] = {}
    for spec in CSV_TABLES:
        found = [*csv_dir.glob(spec.file_name), *csv_dir.glob(f"*/{spec.file_name}")]
        if found:
            paths[spec.file_name] = found[0]
    missing = [spec.file_name for spec in CSV_TABLES if spec.file_name not in paths]
    if missing:
        raise LoadError(f"CSVs não encontrados em {csv_dir}: {', '.join(missing)}.")
    return paths


def _check_schema(connection: Connection) -> None:
    inspector = inspect(connection)
    if not all(inspector.has_table(table.name) for table in Base.metadata.sorted_tables):
        raise LoadError("As tabelas não existem. Rode `alembic upgrade head` antes da carga.")


def _has_data(connection: Connection) -> bool:
    return any(
        connection.execute(select(table).limit(1)).first() is not None
        for table in Base.metadata.sorted_tables
    )


def _insert_csv(connection: Connection, spec: CsvTable, path: Path) -> int:
    with path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        columns = [name for name in reader.fieldnames or [] if name in spec.table.c]
        rows = (
            {name: spec.converters.get(name, str)(row[name]) for name in columns} for row in reader
        )
        total = 0
        for batch in _batches(rows):
            connection.execute(spec.table.insert(), batch)
            total += len(batch)
    return total


def _summarize_reviews(connection: Connection) -> int:
    """Gera `dim_reviews` (quantidade e média por filme) a partir das avaliações individuais."""

    summaries = [
        {
            "sk_movie_id": sk_movie_id,
            "qtd_avaliacoes_usuarios": total,
            "nota_media_usuarios": round(average, 2),
        }
        for sk_movie_id, total, average in connection.execute(
            select(MovieReview.sk_movie_id, func.count(), func.avg(MovieReview.nota)).group_by(
                MovieReview.sk_movie_id
            )
        )
    ]
    for batch in _batches(summaries):
        connection.execute(DimReview.__table__.insert(), batch)
    return len(summaries)


def _batches(rows: Iterable[dict[str, object]]) -> Iterator[list[dict[str, object]]]:
    iterator = iter(rows)
    while batch := list(islice(iterator, BATCH_SIZE)):
        yield batch


def _thousands(value: int) -> str:
    return f"{value:,}".replace(",", ".")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Carrega os CSVs do desafio no banco.")
    parser.add_argument(
        "--csv-dir",
        type=Path,
        default=DEFAULT_CSV_DIR,
        help="pasta com os CSVs (ou com as subpastas bases_atv_dev1 e bases_atv_dev_2); "
        "padrão: backend/data",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="apaga os dados atuais, inclusive os cadastrados pela aplicação, antes da carga",
    )
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    # Como no Alembic: a carga usa o driver síncrono sobre o mesmo arquivo da API.
    database_url = get_settings().database_url.replace("+aiosqlite", "")
    engine = create_engine(database_url)
    enable_sqlite_foreign_keys(engine)
    started = time.perf_counter()
    try:
        with engine.begin() as connection:
            load_csvs(connection, args.csv_dir.expanduser(), reset=args.reset)
    except LoadError as error:
        print(f"Erro: {error}", file=sys.stderr)
        return 1
    finally:
        engine.dispose()

    logger.info("Carga concluída em %.0f s (%s).", time.perf_counter() - started, database_url)
    return 0


if __name__ == "__main__":
    sys.exit(main())
