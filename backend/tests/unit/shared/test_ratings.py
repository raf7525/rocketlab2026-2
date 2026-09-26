import pytest

from app.shared.ratings import RatingSummary, score_to_stars


@pytest.mark.parametrize(
    ("nota", "estrelas"),
    [
        (0, 0.0),
        (1, 0.5),
        (7, 3.5),
        (10, 5.0),
    ],
)
def test_each_point_is_worth_half_a_star(nota: float, estrelas: float) -> None:
    assert score_to_stars(nota) == estrelas


@pytest.mark.parametrize(
    ("nota", "estrelas"),
    [
        (9.8, 5.0),
        (2.4, 1.0),
        (7.26, 3.5),
        (2.5, 1.5),
    ],
)
def test_decimal_scores_round_to_nearest_half_star(nota: float, estrelas: float) -> None:
    assert score_to_stars(nota) == estrelas


def test_summary_without_reviews_has_no_average() -> None:
    summary = RatingSummary()

    assert summary.model_dump() == {
        "qtd_avaliacoes_usuarios": 0,
        "nota_media_usuarios": None,
        "estrelas_media": None,
    }


def test_summary_shows_average_in_stars() -> None:
    summary = RatingSummary(qtd_avaliacoes_usuarios=2, nota_media_usuarios=7.0)

    assert summary.estrelas_media == 3.5
