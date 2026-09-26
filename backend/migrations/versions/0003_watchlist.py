"""Cria a watchlist: os filmes guardados para assistir depois.

Revision ID: 0003_watchlist
Revises: 0002_movie_review_likes
Create Date: 2026-09-26
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_watchlist"
down_revision: str | Sequence[str] | None = "0002_movie_review_likes"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "watchlist",
        sa.Column("sk_movie_id", sa.String(length=64), nullable=False),
        sa.Column(
            "adicionado_em",
            sa.DateTime(),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["sk_movie_id"],
            ["dim_movies.sk_movie_id"],
            name=op.f("fk_watchlist_sk_movie_id_dim_movies"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("sk_movie_id", name=op.f("pk_watchlist")),
    )
    op.create_index(op.f("ix_watchlist_adicionado_em"), "watchlist", ["adicionado_em"])


def downgrade() -> None:
    op.drop_index(op.f("ix_watchlist_adicionado_em"), table_name="watchlist")
    op.drop_table("watchlist")
