"""Contratos de entrada e saída da API de avaliações de filmes."""

from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints, computed_field

from app.shared.ratings import Score, score_to_stars


class MovieReviewCreate(BaseModel):
    """Dados enviados para registrar uma nova avaliação."""

    nome: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
    nota: Score
    comentario: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=4000)
    ]


class MovieReviewRead(BaseModel):
    """Avaliação individual devolvida pela API."""

    model_config = ConfigDict(from_attributes=True)

    sk_movie_review_id: str
    sk_movie_id: str
    nome: str
    nota: float
    comentario: str
    created_at: datetime

    @computed_field
    @property
    def estrelas(self) -> float:
        return score_to_stars(self.nota)


class MovieReviewSummary(BaseModel):
    """Quantidade e média das avaliações de um filme (lido de `dim_reviews`)."""

    model_config = ConfigDict(from_attributes=True)

    qtd_avaliacoes_usuarios: int = 0
    nota_media_usuarios: float | None = None

    @computed_field
    @property
    def estrelas_media(self) -> float | None:
        if self.nota_media_usuarios is None:
            return None
        return score_to_stars(self.nota_media_usuarios)
