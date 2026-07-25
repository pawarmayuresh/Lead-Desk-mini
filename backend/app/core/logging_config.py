"""
Structured logging configuration.

Why structured logging?
  - Machine-readable in production (Render logs, Datadog, etc.)
  - Consistent format across all modules
  - Log level controlled by environment variable
"""

import logging
import sys
from app.core.config import get_settings


def configure_logging() -> None:
    settings = get_settings()

    level = logging.DEBUG if settings.APP_ENV == "development" else logging.INFO

    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Silence noisy third-party loggers in production
    if settings.APP_ENV != "development":
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
