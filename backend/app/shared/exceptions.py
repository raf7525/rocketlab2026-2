"""Erros de negócio compartilhados, traduzidos para HTTP em `app.main`."""


class NotFoundError(Exception):
    """Recurso inexistente; vira uma resposta 404 com a mensagem como `detail`."""
