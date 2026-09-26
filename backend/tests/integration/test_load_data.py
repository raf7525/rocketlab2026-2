"""Script de carga: CSVs da camada Diamond → banco SQLite."""

import csv
from collections.abc import Iterator
from datetime import date
from pathlib import Path

import pytest
from sqlalchemy import Engine, create_engine, insert, select
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import enable_sqlite_foreign_keys
from app.movies.models import DimMovie, DimReview, FactMoviePerformance, MovieReview
from scripts.load_data import LoadError, load_csvs

# Os CSVs gravam títulos e sinopses com aspas numa segunda camada de CSV (como aparecem depois
# de lidos uma vez). Algumas sinopses vieram cortadas antes da aspa final.
QUOTED_TITLE = '"satie\'s ""parade"""'
QUOTED_SYNOPSIS = '"Julia finds a ""movie within the movie'

MOVIE_COLUMNS = [
    "sk_movie_id",
    "id_filme",
    "titulo",
    "data_lancamento",
    "ano_lancamento",
    "duracao_minutos",
    "status_filme",
    "sinopse",
    "url_poster",
    "url_backdrop",
]
FACT_COLUMNS = [
    "sk_movie_id",
    "orcamento_usd",
    "receita_usd",
    "lucro_usd",
    "orcamento_brl",
    "receita_brl",
    "lucro_brl",
    "popularidade",
    "nota_tmdb",
    "qtd_tmdb",
    "nota_imdb",
    "qtd_imdb",
]

# Mesma organização das pastas entregues com o desafio.
CSVS: dict[str, list[list[str]]] = {
    "bases_atv_dev1/dim_genres.csv": [
        ["nome_genero", "sk_genre_id"],
        ["Drama", "g-drama"],
        ["History", "g-history"],
    ],
    "bases_atv_dev1/dim_companies.csv": [
        ["nome_produtora", "sk_company_id"],
        ["Syncopy", "c-syncopy"],
    ],
    "bases_atv_dev1/dim_people.csv": [
        ["nome_pessoa", "tipo_pessoa", "sk_person_id"],
        ["Christopher Nolan", "Diretor", "p-nolan"],
        ["Cillian Murphy", "Ator", "p-murphy"],
    ],
    "bases_atv_dev1/dim_movies.csv": [
        MOVIE_COLUMNS,
        [
            "m-oppenheimer",
            "872585",
            "Oppenheimer",
            "2023-07-19",
            "2023",
            "180",
            "Lançado",
            "The story of J. Robert Oppenheimer.",
            "https://image.tmdb.org/t/p/w500/oppenheimer.jpg",
            "https://image.tmdb.org/t/p/w1280/fundo.jpg",
        ],
        ["m-parade", "14564", QUOTED_TITLE, "2017-02-01", "2017", "0", "Planejado", QUOTED_SYNOPSIS]
        + ["", ""],
    ],
    # Não deve ser importado: o resumo é recalculado a partir das avaliações individuais.
    "bases_atv_dev1/dim_reviews.csv": [
        ["sk_review_id", "sk_movie_id", "qtd_avaliacoes_usuarios", "nota_media_usuarios"],
        ["m-oppenheimer", "m-oppenheimer", "5", "1.0"],
    ],
    "bases_atv_dev_2/bridge_movie_genre.csv": [
        ["sk_movie_id", "sk_genre_id"],
        ["m-oppenheimer", "g-drama"],
        ["m-oppenheimer", "g-history"],
    ],
    "bases_atv_dev_2/bridge_movie_company.csv": [
        ["sk_movie_id", "sk_company_id"],
        ["m-oppenheimer", "c-syncopy"],
    ],
    "bases_atv_dev_2/bridge_movie_person.csv": [
        ["sk_movie_id", "sk_person_id"],
        ["m-oppenheimer", "p-nolan"],
        ["m-oppenheimer", "p-murphy"],
    ],
    "bases_atv_dev_2/fact_movies_performance.csv": [
        FACT_COLUMNS,
        ["m-oppenheimer", "100000000.0", "950000000.0", "850000000.0", "503700000.0"]
        + ["4784750000.0", "4281050000.0", "120.5", "8.1", "2375.0", "8.4", "46286.0"],
        ["m-parade", "", "", "0.0", "", "", "0.0", "", "4.9", "", "", ""],
    ],
    "bases_atv_dev_2/movies_reviews.csv": [
        ["sk_movie_review_id", "sk_movie_id", "nome", "nota", "comentario"],
        ["r-1", "m-oppenheimer", "Henrique Carvalho", "9.8", "Adorei cada minuto."],
        ["r-2", "m-oppenheimer", "Lucas Silva", "2.4", "Horrível! Perda de tempo."],
    ],
}


@pytest.fixture
def csv_dir(tmp_path: Path) -> Path:
    for name, rows in CSVS.items():
        path = tmp_path / name
        path.parent.mkdir(exist_ok=True)
        with path.open("w", newline="", encoding="utf-8") as file:
            csv.writer(file).writerows(rows)
    return tmp_path


@pytest.fixture
def engine() -> Iterator[Engine]:
    """Banco em memória com o schema dos modelos, como nos outros testes de integração."""

    engine = create_engine("sqlite://", poolclass=StaticPool)
    enable_sqlite_foreign_keys(engine)
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


def load(engine: Engine, csv_dir: Path, *, reset: bool = False) -> dict[str, int]:
    with engine.begin() as connection:
        return load_csvs(connection, csv_dir, reset=reset)


def test_loads_every_table_and_reports_the_row_counts(engine: Engine, csv_dir: Path) -> None:
    assert load(engine, csv_dir) == {
        "dim_genres": 2,
        "dim_companies": 1,
        "dim_people": 2,
        "dim_movies": 2,
        "bridge_movie_genre": 2,
        "bridge_movie_company": 1,
        "bridge_movie_person": 2,
        "fact_movies_performance": 2,
        "movie_reviews": 2,
        "dim_reviews": 1,
    }


def test_converts_the_csv_text_to_the_column_types(engine: Engine, csv_dir: Path) -> None:
    load(engine, csv_dir)

    with engine.connect() as connection:
        oppenheimer = connection.execute(
            select(DimMovie.__table__).where(DimMovie.sk_movie_id == "m-oppenheimer")
        ).one()
        parade = connection.execute(
            select(DimMovie.__table__).where(DimMovie.sk_movie_id == "m-parade")
        ).one()
        facts = connection.execute(
            select(FactMoviePerformance.popularidade, FactMoviePerformance.qtd_tmdb).order_by(
                FactMoviePerformance.sk_movie_id
            )
        ).all()

    assert (oppenheimer.data_lancamento, oppenheimer.ano_lancamento) == (date(2023, 7, 19), 2023)
    assert oppenheimer.duracao_minutos == 180
    # Célula vazia vira NULL; contagens gravadas como "2375.0" viram inteiros.
    assert (parade.url_poster, parade.url_backdrop) == (None, None)
    assert facts == [(120.5, 2375), (None, None)]


def test_undoes_the_extra_quoting_of_titles_and_synopses(engine: Engine, csv_dir: Path) -> None:
    load(engine, csv_dir)

    with engine.connect() as connection:
        movies = dict(connection.execute(select(DimMovie.titulo, DimMovie.sinopse)).all())

    assert movies == {
        "Oppenheimer": "The story of J. Robert Oppenheimer.",
        'satie\'s "parade"': 'Julia finds a "movie within the movie',
    }


def test_rating_summary_comes_from_the_individual_reviews(engine: Engine, csv_dir: Path) -> None:
    load(engine, csv_dir)

    with engine.connect() as connection:
        summaries = connection.execute(
            select(
                DimReview.sk_movie_id,
                DimReview.qtd_avaliacoes_usuarios,
                DimReview.nota_media_usuarios,
            )
        ).all()

    # O dim_reviews.csv (5 avaliações, média 1.0) não bate com as avaliações e é ignorado.
    assert summaries == [("m-oppenheimer", 2, 6.1)]


def test_imported_reviews_start_without_likes(engine: Engine, csv_dir: Path) -> None:
    load(engine, csv_dir)

    with engine.connect() as connection:
        reviews = connection.execute(select(MovieReview.curtidas, MovieReview.created_at)).all()

    assert [curtidas for curtidas, _ in reviews] == [0, 0]
    assert all(created_at is not None for _, created_at in reviews)


def test_finds_the_csvs_directly_in_the_folder(engine: Engine, csv_dir: Path) -> None:
    for path in list(csv_dir.glob("*/*.csv")):
        path.rename(csv_dir / path.name)

    assert load(engine, csv_dir)["dim_movies"] == 2


def test_missing_csvs_are_reported_before_loading_anything(engine: Engine, csv_dir: Path) -> None:
    (csv_dir / "bases_atv_dev_2/bridge_movie_person.csv").unlink()

    with pytest.raises(LoadError, match="bridge_movie_person.csv"):
        load(engine, csv_dir)

    with engine.connect() as connection:
        assert connection.execute(select(DimMovie.sk_movie_id)).all() == []


def test_refuses_to_load_over_existing_data(engine: Engine, csv_dir: Path) -> None:
    load(engine, csv_dir)

    with pytest.raises(LoadError, match="--reset"):
        load(engine, csv_dir)


def test_reset_replaces_the_existing_data(engine: Engine, csv_dir: Path) -> None:
    load(engine, csv_dir)
    with engine.begin() as connection:
        connection.execute(insert(DimMovie), [{"id_filme": "local-1", "titulo": "Cadastrado"}])

    load(engine, csv_dir, reset=True)

    with engine.connect() as connection:
        titles = connection.scalars(select(DimMovie.titulo).order_by(DimMovie.titulo)).all()
    assert titles == ["Oppenheimer", 'satie\'s "parade"']


def test_requires_the_migrated_schema(csv_dir: Path) -> None:
    empty = create_engine("sqlite://", poolclass=StaticPool)

    with pytest.raises(LoadError, match="alembic upgrade head"):
        load(empty, csv_dir)
