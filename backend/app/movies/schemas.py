"""Contratos de saída da API do catálogo de filmes."""

from datetime import date

from pydantic import model_validator

from app.movies.models import DimMovie
from app.shared.ratings import RatingSummary


class MovieSummary(RatingSummary):
    """Filme como aparece no catálogo, com os nomes dos gêneros e o resumo das avaliações."""

    sk_movie_id: str
    titulo: str
    ano_lancamento: int | None
    duracao_minutos: int | None
    url_poster: str | None
    generos: list[str]

    @model_validator(mode="before")
    @classmethod
    def _flatten_movie(cls, data: object) -> object:
        """Aceita um `DimMovie` com `genres` e `reviews_summary` já carregados."""

        if not isinstance(data, DimMovie):
            return data
        summary = data.reviews_summary
        return {
            **{name: getattr(data, name) for name in cls.model_fields if hasattr(DimMovie, name)},
            "generos": [genre.nome_genero for genre in data.genres],
            "qtd_avaliacoes_usuarios": summary.qtd_avaliacoes_usuarios if summary else 0,
            "nota_media_usuarios": summary.nota_media_usuarios if summary else None,
        }


class MovieDetail(MovieSummary):
    """Filme com os dados da página de detalhe."""

    data_lancamento: date | None
    status_filme: str | None
    sinopse: str | None
    url_backdrop: str | None
