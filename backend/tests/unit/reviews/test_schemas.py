import pytest
from pydantic import ValidationError

from app.reviews.schemas import MovieReviewCreate, MovieReviewSummary

VALID_REVIEW = {"nome": "Ana", "nota": 7, "comentario": "Ótimo filme."}


def test_valid_review_trims_text_fields() -> None:
    review = MovieReviewCreate(nome="  Ana ", nota=7, comentario=" Ótimo filme. ")

    assert review.model_dump() == VALID_REVIEW


@pytest.mark.parametrize("nota", [-1, 11, 7.5, "7", None])
def test_score_must_be_an_integer_from_0_to_10(nota: object) -> None:
    with pytest.raises(ValidationError):
        MovieReviewCreate(**{**VALID_REVIEW, "nota": nota})


@pytest.mark.parametrize("nota", [0, 10])
def test_score_accepts_scale_limits(nota: int) -> None:
    assert MovieReviewCreate(**{**VALID_REVIEW, "nota": nota}).nota == nota


@pytest.mark.parametrize(
    "changes",
    [
        {"nome": "   "},
        {"comentario": ""},
        {"nome": "a" * 121},
        {"comentario": "a" * 4001},
    ],
)
def test_name_and_comment_must_be_filled_and_fit_the_columns(changes: dict[str, str]) -> None:
    with pytest.raises(ValidationError):
        MovieReviewCreate(**{**VALID_REVIEW, **changes})


def test_summary_without_reviews_has_no_average() -> None:
    summary = MovieReviewSummary()

    assert summary.model_dump() == {
        "qtd_avaliacoes_usuarios": 0,
        "nota_media_usuarios": None,
        "estrelas_media": None,
    }


def test_summary_shows_average_in_stars() -> None:
    summary = MovieReviewSummary(qtd_avaliacoes_usuarios=2, nota_media_usuarios=7.0)

    assert summary.estrelas_media == 3.5
