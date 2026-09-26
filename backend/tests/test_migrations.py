"""As migrações do Alembic criam exatamente o schema descrito pelos modelos."""

from pathlib import Path

import pytest
from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext
from sqlalchemy import create_engine

from app.core.config import get_settings
from app.db.base import Base
from app.movies import models  # noqa: F401  Registra os modelos ORM.

BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_migrations_match_the_models(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    database = tmp_path / "migrado.db"
    monkeypatch.setattr(get_settings(), "database_url", f"sqlite+aiosqlite:///{database}")
    monkeypatch.chdir(BACKEND_DIR)

    command.upgrade(Config("alembic.ini"), "head")

    engine = create_engine(f"sqlite:///{database}")
    with engine.connect() as connection:
        differences = compare_metadata(MigrationContext.configure(connection), Base.metadata)
    engine.dispose()
    assert differences == []
