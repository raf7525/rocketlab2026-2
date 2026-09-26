"""Endpoints dos pôsteres, montados em /posters.

O envio recebe a imagem como o próprio corpo da requisição (sem multipart) e devolve o endereço
dela, que depois vai no `url_poster` do cadastro ou da edição do filme (`POST /movies`,
`PUT /movies/{id}`).
"""

from fastapi import APIRouter, Request, status
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.posters import storage
from app.shared.exceptions import NotFoundError

router = APIRouter()


class PosterUploaded(BaseModel):
    url: str


# Documenta o corpo binário no /docs (o Swagger mostra um seletor de arquivo).
_IMAGE_BODY = {
    "requestBody": {
        "required": True,
        "content": {
            media_type: {"schema": {"type": "string", "format": "binary"}}
            for media_type in storage.MEDIA_TYPES.values()
        },
    }
}


@router.post(
    "",
    response_model=PosterUploaded,
    status_code=status.HTTP_201_CREATED,
    openapi_extra=_IMAGE_BODY,
)
async def upload_poster(request: Request) -> PosterUploaded:
    """Recebe uma imagem JPG, PNG ou WebP de até 5 MB como corpo da requisição."""

    return PosterUploaded(url=await storage.save_poster(request.stream()))


@router.get("/{name}", response_class=FileResponse)
async def get_poster(name: str) -> FileResponse:
    path = storage.find_poster(name)
    if path is None:
        raise NotFoundError("Imagem não encontrada.")
    return FileResponse(path, media_type=storage.media_type(path))
