"""
JWT utilities.

Token strategy:
  - Access token:  15 min lifetime, stored in HTTP-only cookie
  - Refresh token: 7 day lifetime, stored in separate HTTP-only cookie

Why two tokens?
  Short access token lifetime limits damage if intercepted.
  Refresh token allows silent re-auth without re-login.
  Both stored in HTTP-only cookies — never accessible to JavaScript.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()

# Token type claim — prevents using a refresh token as an access token
TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"


def create_access_token(data: dict[str, Any]) -> str:
    """
    Generate a short-lived signed JWT access token (15 min).
    Includes type='access' to prevent token type confusion attacks.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire, "type": TOKEN_TYPE_ACCESS})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    """
    Generate a long-lived signed JWT refresh token (7 days).
    Only contains 'sub' and 'type' — minimal claims.
    """
    to_encode = {"sub": data["sub"]}
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    to_encode.update({"exp": expire, "type": TOKEN_TYPE_REFRESH})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises JWTError if invalid, expired, or wrong type.
    """
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

    # Reject refresh tokens being used as access tokens
    if payload.get("type") != TOKEN_TYPE_ACCESS:
        raise JWTError("Invalid token type")

    return payload


def decode_refresh_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT refresh token.
    Raises JWTError if invalid, expired, or wrong type.
    """
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

    if payload.get("type") != TOKEN_TYPE_REFRESH:
        raise JWTError("Invalid token type")

    return payload
