"""
Database engine configuration.

Connection strategy:
  - NullPool for serverless environments (Neon, Render free tier)
    → No idle connections held between requests
    → Safe for environments that kill connections aggressively
  - QueuePool for traditional servers (future scale-up path)
    → pool_pre_ping: validates connection before use (handles dropped connections)
    → pool_recycle: recycles connections after 30 min (avoids stale connections)
    → pool_size / max_overflow: limits concurrent DB connections

Why pool_pre_ping=True matters:
  Without it, a connection that was dropped by the DB server (timeout, restart)
  would fail silently on the first query. pre_ping sends a lightweight check
  (SELECT 1) before using any connection from the pool.
"""

from sqlalchemy import create_engine, Engine
from sqlalchemy.pool import NullPool, QueuePool

from app.core.config import get_settings

settings = get_settings()


def _create_engine() -> Engine:
    """
    Build the SQLAlchemy engine with environment-appropriate pool settings.

    Serverless (Neon / Render): NullPool — no persistent connections
    Traditional server: QueuePool with pre_ping and recycle
    """
    common_kwargs = {
        "echo": settings.APP_ENV == "development",  # SQL logging in dev only
    }

    if settings.APP_ENV in ("development", "production") and "neon.tech" in settings.DATABASE_URL:
        # Neon PostgreSQL is serverless — use NullPool to avoid idle connection limits
        return create_engine(
            settings.DATABASE_URL,
            poolclass=NullPool,
            **common_kwargs,
        )

    # Standard pool for traditional PostgreSQL (self-hosted, RDS, etc.)
    return create_engine(
        settings.DATABASE_URL,
        poolclass=QueuePool,
        pool_size=5,           # Base connections kept open
        max_overflow=10,       # Burst capacity beyond pool_size
        pool_pre_ping=True,    # Validate connection before use
        pool_recycle=1800,     # Recycle after 30 min — prevents stale connections
        **common_kwargs,
    )


engine = _create_engine()
