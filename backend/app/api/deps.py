"""Dependências reutilizadas pelos routers."""

from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.shared.pagination import PageParams

SessionDep = Annotated[AsyncSession, Depends(get_db)]
PageParamsDep = Annotated[PageParams, Query()]
