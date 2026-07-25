"""
AuthService — business logic for authentication.

Security decisions:
  - Constant-time password check always runs bcrypt.verify — even if user not found —
    to prevent timing-based email enumeration attacks
  - Generic error message: "Invalid email or password" — never reveals which is wrong
  - last_login is updated on successful auth — audit trail
  - is_active check: disabled accounts cannot log in
  - Token data contains only 'sub' (email) and 'user_id' — minimal claims
"""

import logging
from sqlalchemy.orm import Session

from fastapi import HTTPException, status
from jose import JWTError

from app.core.security import verify_password
from app.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)

# Sentinel hash used when user is not found.
# Ensures bcrypt.verify always runs — prevents timing-based email enumeration.
# This exact hash doesn't match any real password.
_DUMMY_HASH = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"

_INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid email or password",
    headers={"WWW-Authenticate": "Bearer"},
)


class AuthService:
    """Business logic for authentication and token management."""

    def __init__(self, repo: UserRepository, db: Session) -> None:
        self._repo = repo
        self._db = db

    def login(self, email: str, password: str) -> tuple[str, str]:
        """
        Authenticate admin credentials.

        Returns (access_token, refresh_token) on success.
        Always raises the same 401 regardless of which check fails
        to prevent user enumeration.
        """
        user = self._repo.get_by_email(email)

        # Always run bcrypt.verify — even if user not found — constant time
        hash_to_check = user.password_hash if user else _DUMMY_HASH
        password_ok = verify_password(password, hash_to_check)

        if not user or not password_ok:
            logger.warning("Failed login attempt for: %s", email)
            raise _INVALID_CREDENTIALS

        # Check account is active
        if not user.is_active:
            logger.warning("Login attempt on inactive account: %s", email)
            raise _INVALID_CREDENTIALS

        # Record successful login
        self._repo.update_last_login(user)
        self._db.commit()

        token_data = {"sub": user.email, "user_id": user.id}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        logger.info("Login successful: %s", email)
        return access_token, refresh_token

    def refresh(self, refresh_token: str) -> tuple[str, str]:
        """
        Issue a new access + refresh token pair from a valid refresh token.
        Rotates the refresh token on every call.
        """
        try:
            payload = decode_refresh_token(refresh_token)
            email: str | None = payload.get("sub")
            if not email:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )

        user = self._repo.get_by_email(email)
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        token_data = {"sub": user.email, "user_id": user.id}
        new_access = create_access_token(token_data)
        new_refresh = create_refresh_token(token_data)

        logger.info("Token refreshed: %s", email)
        return new_access, new_refresh
