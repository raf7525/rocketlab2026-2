"""Contratos de entrada e saída da API de avaliações de filmes."""

from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, computed_field

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
    curtidas: int

    @computed_field
    @property
    def estrelas(self) -> float:
        return score_to_stars(self.nota)


class ReviewedMovie(BaseModel):
    """O suficiente do filme para mostrar a avaliação fora da página dele."""

    model_config = ConfigDict(from_attributes=True)

    sk_movie_id: str
    titulo: str
    ano_lancamento: int | None
    url_poster: str | None


class PopularReview(MovieReviewRead):
    """Avaliação da lista de populares, com o filme avaliado."""

    filme: ReviewedMovie = Field(validation_alias="movie")
