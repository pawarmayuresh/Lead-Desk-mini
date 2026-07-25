"""
Cookie management.

SameSite=None; Secure required for cross-site cookies (Vercel + Railway different domains).
Settings are read inside each function call — not cached at module load time.
"""

from fastapi import Response
from app.core.config import get_settings

ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    # Read settings fresh — never use module-level cached settings for cookies
    s = get_settings()
    secure = s.cookie_secure      # True in production (auto)
    samesite = s.cookie_samesite  # "none" in production, "lax" in dev

    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=secure,
        samesite=samesite,  # type: ignore[arg-type]
        max_age=s.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        domain=s.COOKIE_DOMAIN or None,
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite=samesite,  # type: ignore[arg-type]
        max_age=s.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/auth",
        domain=s.COOKIE_DOMAIN or None,
    )


def clear_auth_cookies(response: Response) -> None:
    s = get_settings()
    secure = s.cookie_secure
    samesite = s.cookie_samesite

    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        path="/",
        domain=s.COOKIE_DOMAIN or None,
        httponly=True,
        secure=secure,
        samesite=samesite,  # type: ignore[arg-type]
    )
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/v1/auth",
        domain=s.COOKIE_DOMAIN or None,
        httponly=True,
        secure=secure,
        samesite=samesite,  # type: ignore[arg-type]
    )
