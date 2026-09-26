"""Erros de negócio compartilhados, traduzidos para HTTP em `app.main`."""


class NotFoundError(Exception):
    """Recurso inexistente; vira uma resposta 404 com a mensagem como `detail`."""


class BusinessRuleError(Exception):
    """Dados bem formados que uma regra do domínio recusa (ex.: um gênero que não existe).

    Vira uma resposta 422 com a mensagem como `detail`, e nada é salvo.
    """
