"""
Cookie management utilities.

Why HTTP-only cookies?
  - JavaScript cannot read HTTP-only cookies → XSS cannot steal tokens
  - Secure flag ensures cookies only travel over HTTPS in production
  - SameSite=Lax blocks CSRF for cross-site requests (GET allowed, mutations blocked)
  - Path=/ ensures cookie is sent with all API requests

Production behaviour:
  - settings.cookie_secure property auto-returns True when APP_ENV=production
  - This means even if COOKIE_SECURE env var is omitted, production is always secure
"""

from fastapi import Response
from app.core.config import get_settings

settings = get_settings()

ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set both tokens as HTTP-only cookies. Secure flag auto-enables in production."""
    secure = settings.cookie_secure  # True if APP_ENV=production

    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=secure,
        samesite=settings.COOKIE_SAMESITE,  # type: ignore[arg-type]
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        domain=settings.COOKIE_DOMAIN or None,
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite=settings.COOKIE_SAMESITE,  # type: ignore[arg-type]
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/auth",   # Scoped — only sent to auth endpoints
        domain=settings.COOKIE_DOMAIN or None,
    )


def clear_auth_cookies(response: Response) -> None:
    """Clear both cookies on logout. Paths must match set_cookie exactly."""
    secure = settings.cookie_secure

    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        path="/",
        domain=settings.COOKIE_DOMAIN or None,
        httponly=True,
        secure=secure,
        samesite=settings.COOKIE_SAMESITE,  # type: ignore[arg-type]
    )
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/v1/auth",
        domain=settings.COOKIE_DOMAIN or None,
        httponly=True,
        secure=secure,
        samesite=settings.COOKIE_SAMESITE,  # type: ignore[arg-type]
    )
