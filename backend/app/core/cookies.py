"""
Cookie management.

Cross-site cookie requirement (production):
  Frontend: lead-desk-mini-sage.vercel.app  (vercel.app domain)
  Backend:  leakdesk-mini-production.up.railway.app  (railway.app domain)

  These are DIFFERENT domains. Browsers block SameSite=Lax cookies cross-site.
  Production must use SameSite=None; Secure for cookies to be sent/stored.

  SameSite=None requires Secure=True (HTTPS only) — both Railway and Vercel
  use HTTPS so this is safe.
"""

from fastapi import Response
from app.core.config import get_settings

settings = get_settings()

ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    secure = settings.cookie_secure          # True in production
    samesite = settings.cookie_samesite      # "none" in production, "lax" in dev

    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=secure,
        samesite=samesite,  # type: ignore[arg-type]
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        domain=settings.COOKIE_DOMAIN or None,
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite=samesite,  # type: ignore[arg-type]
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/auth",
        domain=settings.COOKIE_DOMAIN or None,
    )


def clear_auth_cookies(response: Response) -> None:
    secure = settings.cookie_secure
    samesite = settings.cookie_samesite

    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        path="/",
        domain=settings.COOKIE_DOMAIN or None,
        httponly=True,
        secure=secure,
        samesite=samesite,  # type: ignore[arg-type]
    )
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/v1/auth",
        domain=settings.COOKIE_DOMAIN or None,
        httponly=True,
        secure=secure,
        samesite=samesite,  # type: ignore[arg-type]
    )
