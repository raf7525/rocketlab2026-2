"""Escala de notas usada por todas as avaliações.

As notas vão de 0 a 10 e cada ponto vale meia estrela: 1 = ½ estrela, 10 = 5 estrelas.
Novas avaliações recebem notas inteiras; as importadas do CSV podem ser decimais.
"""

import math
from typing import Annotated

from pydantic import Field

MIN_SCORE = 0
MAX_SCORE = 10

Score = Annotated[int, Field(ge=MIN_SCORE, le=MAX_SCORE, strict=True)]


def score_to_stars(nota: float) -> float:
    """Converte uma nota 0–10 em estrelas 0–5, arredondando para a meia estrela mais próxima."""

    return math.floor(nota + 0.5) / 2
