"""Contratos de entrada e saída da API do catálogo de filmes."""

from datetime import date
from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints, field_validator, model_validator

from app.movies.models import ACTOR, DIRECTOR, DimMovie, MovieStatus
from app.posters.storage import is_uploaded_poster
from app.shared.pagination import PageParams
from app.shared.ratings import RatingSummary

# Roundhay Garden Scene (1888) é o filme mais antigo que se conhece.
MIN_YEAR = 1888
MAX_YEAR = 2100

# O filme mais longo do CSV tem 13.319 minutos (Svalbard Minutt For Minutt).
MAX_DURATION = 20_000

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
PosterUrl = Annotated[str, StringConstraints(strip_whitespace=True, max_length=2048)]


class MovieCreate(BaseModel):
    """Dados enviados para cadastrar um filme. Os gêneros precisam existir em `dim_genres`."""

    titulo: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]
    ano_lancamento: Annotated[int, Field(ge=MIN_YEAR, le=MAX_YEAR, strict=True)]
    diretores: Annotated[list[Name], Field(min_length=1)]
    generos: Annotated[list[Name], Field(min_length=1)]
    sinopse: Annotated[str, StringConstraints(strip_whitespace=True, max_length=4000)] | None = None
    elenco: list[Name] = []
    """Atores e atrizes, opcional."""
    duracao_minutos: Annotated[int, Field(ge=1, le=MAX_DURATION, strict=True)] | None = None
    status_filme: MovieStatus | None = None
    url_poster: PosterUrl | None = None
    """Endereço devolvido por `POST /posters` ou um link http(s) de imagem (como os do TMDB)."""

    @field_validator("url_poster")
    @classmethod
    def _poster_from_upload_or_link(cls, url: str | None) -> str | None:
        if not url:
            return None
        if is_uploaded_poster(url) or url.startswith(("https://", "http://")):
            return url
        raise ValueError("use o endereço devolvido por POST /posters ou um link http(s)")

    @field_validator("diretores", "generos", "elenco")
    @classmethod
    def _count_each_name_once(cls, names: list[str] | None) -> list[str] | None:
        """Tira os nomes repetidos (sem diferenciar maiúsculas), mantendo a ordem."""

        if names is None:
            return None
        unique: dict[str, str] = {}
        for name in names:
            unique.setdefault(name.casefold(), name)
        return list(unique.values())

    @field_validator("sinopse")
    @classmethod
    def _blank_synopsis_is_none(cls, sinopse: str | None) -> str | None:
        return sinopse or None


class MovieUpdate(MovieCreate):
    """Edição de um filme: os mesmos campos e regras do cadastro, e o envio substitui todos eles.

    Campos opcionais que não vêm (`elenco`, `duracao_minutos`, `status_filme`, `url_poster`)
    continuam como estão; vindo, mesmo vazios ou nulos, são trocados. O que o formulário não
    mostra (roteiristas, métricas, avaliações) nunca muda.
    """

    elenco: list[Name] | None = None  # type: ignore[assignment]


SearchText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)]


class MovieFilters(BaseModel):
    """Busca e filtros do catálogo, todos opcionais e combinados entre si (E).

    Texto em branco é o mesmo que não filtrar.
    """

    busca: SearchText | None = None
    """Parte do título, sem diferenciar maiúsculas."""
    genero: SearchText | None = None
    """Nome exato do gênero, sem diferenciar maiúsculas."""
    diretor: SearchText | None = None
    """Parte do nome de quem dirigiu."""
    ator: SearchText | None = None
    """Parte do nome de alguém do elenco."""
    status: MovieStatus | None = None
    """Um dos status dos CSVs (Lançado, Pós-Produção, Em Produção, Planejado)."""

    @field_validator("busca", "genero", "diretor", "ator")
    @classmethod
    def _blank_is_none(cls, value: str | None) -> str | None:
        return value or None

    @field_validator("status", mode="before")
    @classmethod
    def _blank_status_is_none(cls, value: object) -> object:
        return value if value != "" else None


class CatalogParams(MovieFilters, PageParams):
    """Query string do catálogo: o FastAPI só lê um modelo por query, então os dois viram um."""


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
        """Aceita um `DimMovie` com `genres` e `reviews_summary` já carregados.

        O detalhe (`MovieDetail`) também precisa de `people`, para listar diretores e elenco.
        """

        if not isinstance(data, DimMovie):
            return data
        summary = data.reviews_summary
        flat = {
            **{name: getattr(data, name) for name in cls.model_fields if hasattr(DimMovie, name)},
            "generos": [genre.nome_genero for genre in data.genres],
            "qtd_avaliacoes_usuarios": summary.qtd_avaliacoes_usuarios if summary else 0,
            "nota_media_usuarios": summary.nota_media_usuarios if summary else None,
        }
        if "diretores" in cls.model_fields:
            flat["diretores"] = sorted(
                person.nome_pessoa for person in data.people if person.tipo_pessoa == DIRECTOR
            )
        if "elenco" in cls.model_fields:
            # O CSV não traz a ordem dos créditos; a alfabética é a única que não engana.
            flat["elenco"] = sorted(
                person.nome_pessoa for person in data.people if person.tipo_pessoa == ACTOR
            )
        return flat


class MovieDetail(MovieSummary):
    """Filme com os dados da página de detalhe."""

    data_lancamento: date | None
    status_filme: str | None
    sinopse: str | None
    url_backdrop: str | None
    diretores: list[str]
    elenco: list[str]
