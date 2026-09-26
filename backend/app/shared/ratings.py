"""Escala de notas usada por todas as avaliações.

As notas vão de 0 a 10 e cada ponto vale meia estrela: 1 = ½ estrela, 10 = 5 estrelas.
Novas avaliações recebem notas inteiras; as importadas do CSV podem ser decimais.
"""

import math
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, computed_field

MIN_SCORE = 0
MAX_SCORE = 10

Score = Annotated[int, Field(ge=MIN_SCORE, le=MAX_SCORE, strict=True)]


def score_to_stars(nota: float) -> float:
    """Converte uma nota 0–10 em estrelas 0–5, arredondando para a meia estrela mais próxima."""

    return math.floor(nota + 0.5) / 2


class RatingSummary(BaseModel):
    """Quantidade e média das avaliações recebidas, com a média também em estrelas."""

    model_config = ConfigDict(from_attributes=True)

    qtd_avaliacoes_usuarios: int = 0
    nota_media_usuarios: float | None = None

    @computed_field
    @property
    def estrelas_media(self) -> float | None:
        if self.nota_media_usuarios is None:
            return None
        return score_to_stars(self.nota_media_usuarios)
