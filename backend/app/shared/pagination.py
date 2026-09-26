"""Paginação comum às listas da API: `?page=1&page_size=24` → `{items, total, page, ...}`."""

import math
from collections.abc import Sequence
from typing import Generic, Self, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")

DEFAULT_PAGE_SIZE = 24
MAX_PAGE_SIZE = 100


class PageParams(BaseModel):
    """Página pedida na query string."""

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE)

    @property
    def offset(self) -> int:
        """Quantos itens pular para chegar ao começo da página."""

        return (self.page - 1) * self.page_size


class Page(BaseModel, Generic[T]):
    """Envelope das listas paginadas."""

    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int

    @classmethod
    def build(cls, items: Sequence[T], total: int, params: PageParams) -> Self:
        return cls(
            items=list(items),
            total=total,
            page=params.page,
            page_size=params.page_size,
            pages=math.ceil(total / params.page_size),
        )
