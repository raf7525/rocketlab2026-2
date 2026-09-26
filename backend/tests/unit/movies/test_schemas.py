import pytest
from pydantic import ValidationError

from app.movies.schemas import MovieCreate, MovieUpdate

VALID_MOVIE = {
    "titulo": "Oppenheimer",
    "ano_lancamento": 2023,
    "diretores": ["Christopher Nolan"],
    "generos": ["Drama", "History"],
    "sinopse": "A história de J. Robert Oppenheimer.",
    "elenco": [],
}


def test_valid_movie_trims_text_fields() -> None:
    movie = MovieCreate(
        titulo="  Oppenheimer ",
        ano_lancamento=2023,
        diretores=[" Christopher Nolan "],
        generos=[" Drama", "History "],
        sinopse=" A história de J. Robert Oppenheimer. ",
    )

    assert movie.model_dump() == VALID_MOVIE


@pytest.mark.parametrize("sinopse", [None, "", "   "])
def test_synopsis_is_optional(sinopse: str | None) -> None:
    assert MovieCreate(**{**VALID_MOVIE, "sinopse": sinopse}).sinopse is None


def test_repeated_directors_and_genres_count_once() -> None:
    movie = MovieCreate(
        **{
            **VALID_MOVIE,
            "diretores": ["Lana Wachowski", "Lilly Wachowski", "lana wachowski "],
            "generos": ["Drama", "drama"],
        }
    )

    assert movie.diretores == ["Lana Wachowski", "Lilly Wachowski"]
    assert movie.generos == ["Drama"]


def test_cast_is_optional_trimmed_and_counts_each_name_once() -> None:
    without_cast = {key: value for key, value in VALID_MOVIE.items() if key != "elenco"}

    assert MovieCreate(**without_cast).elenco == []
    assert MovieCreate(
        **{**VALID_MOVIE, "elenco": [" Cillian Murphy ", "Emily Blunt", "cillian murphy"]}
    ).elenco == ["Cillian Murphy", "Emily Blunt"]


def test_update_without_cast_keeps_it_unset() -> None:
    without_cast = {key: value for key, value in VALID_MOVIE.items() if key != "elenco"}

    assert MovieUpdate(**without_cast).elenco is None


@pytest.mark.parametrize("field", ["titulo", "ano_lancamento", "diretores", "generos"])
def test_title_year_directors_and_genres_are_required(field: str) -> None:
    with pytest.raises(ValidationError):
        MovieCreate(**{name: value for name, value in VALID_MOVIE.items() if name != field})


@pytest.mark.parametrize("ano", [1887, 2101, 2023.5, "2023", None])
def test_year_must_be_an_integer_from_1888_to_2100(ano: object) -> None:
    with pytest.raises(ValidationError):
        MovieCreate(**{**VALID_MOVIE, "ano_lancamento": ano})


@pytest.mark.parametrize("ano", [1888, 2100])
def test_year_accepts_the_limits(ano: int) -> None:
    assert MovieCreate(**{**VALID_MOVIE, "ano_lancamento": ano}).ano_lancamento == ano


@pytest.mark.parametrize(
    "changes",
    [
        {"titulo": "   "},
        {"titulo": "a" * 501},
        {"diretores": []},
        {"diretores": ["  "]},
        {"diretores": ["a" * 256]},
        {"generos": []},
        {"generos": [""]},
        {"sinopse": "a" * 4001},
    ],
)
def test_texts_must_be_filled_and_fit_the_columns(changes: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        MovieCreate(**{**VALID_MOVIE, **changes})
