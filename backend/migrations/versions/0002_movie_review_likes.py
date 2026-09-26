"""Adiciona a contagem de curtidas às avaliações de filmes.

Revision ID: 0002_movie_review_likes
Revises: 0001_initial_movie_schema
Create Date: 2026-09-25
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_movie_review_likes"
down_revision: str | Sequence[str] | None = "0001_initial_movie_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # O SQLite só cria CHECK recriando a tabela, e o batch mode do Alembic faz isso.
    with op.batch_alter_table("movie_reviews") as batch_op:
        batch_op.add_column(
            sa.Column("curtidas", sa.Integer(), server_default=sa.text("0"), nullable=False)
        )
        batch_op.create_check_constraint("curtidas_nao_negativas", "curtidas >= 0")


def downgrade() -> None:
    with op.batch_alter_table("movie_reviews") as batch_op:
        batch_op.drop_constraint("curtidas_nao_negativas", type_="check")
        batch_op.drop_column("curtidas")
