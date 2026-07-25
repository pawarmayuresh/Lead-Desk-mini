"""
Authentication dependency.

Token extraction order:
  1. HTTP-only cookie (primary — production path)
  2. Authorization: Bearer header (fallback — allows Swagger UI / API testing)

Why support both?
  - Cookie is the secure production path (not readable by JS)
  - Bearer header fallback keeps the OpenAPI /docs UI functional for testing
  - Both paths use the same JWT validation logic

Why not just Bearer?
  - Bearer requires frontend JS to read and attach the token
  - If JS can read it, XSS can steal it
  - HTTP-only cookies are immune to XSS token theft
"""

import logging
from fastapi import Cookie, Depends, HTTPException, Request, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.jwt import decode_access_token
from app.core.cookies import ACCESS_COOKIE_NAME
from app.database.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    access_token: str | None = Cookie(default=None, alias=ACCESS_COOKIE_NAME),
) -> User:
    """
    FastAPI dependency — validates the JWT on every protected request.

    Reads token from:
      1. HTTP-only cookie (access_token) — primary path
      2. Authorization: Bearer header — fallback for API testing

    Usage:
        @router.get("/leads")
        def get_leads(current_user: User = Depends(get_current_user)):
            ...
    """
    token: str | None = None

    # 1. Try cookie first
    if access_token:
        token = access_token

    # 2. Fall back to Authorization header (for Swagger docs / testing)
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        logger.warning("Unauthenticated access attempt: %s %s", request.method, request.url.path)
        raise _credentials_exception()

    try:
        payload = decode_access_token(token)
        email: str | None = payload.get("sub")
        if not email:
            raise _credentials_exception()
    except JWTError:
        logger.warning("Invalid JWT on %s %s", request.method, request.url.path)
        raise _credentials_exception()

    user = UserRepository(db).get_by_email(email)
    if not user:
        raise _credentials_exception()

    return user
