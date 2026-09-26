"""O script que prepara o banco dos testes ponta a ponta (os cenários ficam no Cypress)."""

from pathlib import Path

import pytest
from sqlalchemy import create_engine, func, select

from app.core.config import get_settings
from app.movies.models import DimMovie, WatchlistItem
from scripts import seed_e2e


@pytest.fixture
def database(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    # O script muda as configurações; o monkeypatch as devolve ao fim do teste.
    monkeypatch.setattr(get_settings(), "database_url", get_settings().database_url)
    return tmp_path / "e2e.db"


def count(database: Path, model: type) -> int:
    engine = create_engine(f"sqlite:///{database}")
    with engine.connect() as connection:
        total = connection.scalar(select(func.count()).select_from(model)) or 0
    engine.dispose()
    return total


def test_seed_creates_the_fixed_catalog(database: Path, tmp_path: Path) -> None:
    seed_e2e.seed(database, tmp_path / "media")

    assert count(database, DimMovie) == 28


def test_seed_again_starts_over(database: Path, tmp_path: Path) -> None:
    media = tmp_path / "media"
    seed_e2e.seed(database, media)
    engine = create_engine(f"sqlite:///{database}")
    with engine.begin() as connection:
        movie_id = connection.scalar(select(DimMovie.sk_movie_id).limit(1))
        connection.execute(WatchlistItem.__table__.insert().values(sk_movie_id=movie_id))
    engine.dispose()
    (media / "posters").mkdir()
    (media / "posters" / "velho.png").write_bytes(b"x")

    seed_e2e.seed(database, media)

    assert count(database, DimMovie) == 28
    assert count(database, WatchlistItem) == 0
    assert list(media.iterdir()) == []


def test_seed_refuses_the_application_database(tmp_path: Path) -> None:
    with pytest.raises(SystemExit, match="banco da aplicação"):
        seed_e2e.seed(seed_e2e.APP_DATABASE, tmp_path / "media")
