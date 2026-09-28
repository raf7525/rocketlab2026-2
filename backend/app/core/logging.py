import logging

from app.core.config import get_settings


def configure_logging() -> None:
    """Configura o logging da aplicação uma única vez no processo."""

    settings = get_settings()
    logging.basicConfig(
        level=settings.log_level.upper(),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    # No ambiente local, mostra o SQL de cada consulta. Pelo logger, e não pelo `echo` do engine:
    # o `echo` tem um handler próprio, e cada linha sairia duas vezes.
    if settings.environment == "local":
        logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)
