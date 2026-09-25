import pytest

from app.shared.ratings import score_to_stars


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
