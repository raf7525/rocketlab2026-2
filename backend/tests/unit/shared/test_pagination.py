import pytest
from pydantic import ValidationError

from app.shared.pagination import Page, PageParams


def test_first_page_of_24_by_default() -> None:
    params = PageParams()

    assert (params.page, params.page_size, params.offset) == (1, 24, 0)


def test_offset_skips_the_previous_pages() -> None:
    assert PageParams(page=3, page_size=10).offset == 20


@pytest.mark.parametrize("changes", [{"page": 0}, {"page_size": 0}, {"page_size": 101}])
def test_page_and_size_must_be_in_range(changes: dict[str, int]) -> None:
    with pytest.raises(ValidationError):
        PageParams(**changes)


@pytest.mark.parametrize(("total", "pages"), [(0, 0), (1, 1), (24, 1), (25, 2)])
def test_page_counts_the_last_partial_page(total: int, pages: int) -> None:
    page = Page[str].build(items=["a"], total=total, params=PageParams())

    assert page.pages == pages
    assert (page.page, page.page_size, page.total) == (1, 24, total)
