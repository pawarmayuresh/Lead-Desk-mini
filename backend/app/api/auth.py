"""
Auth routes — presentation layer only.
Delegates all logic to AuthService via dependency injection.
"""

import logging
from fastapi import APIRouter, Cookie, Depends, Request, Response, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.dependencies.services import get_auth_service
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    LogoutResponse,
    RefreshResponse,
    AuthStatusResponse,
)
from app.services.auth_service import AuthService
from app.core.cookies import set_auth_cookies, clear_auth_cookies, REFRESH_COOKIE_NAME

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Admin login",
    description="Rate limited: 5 attempts/minute per IP. Sets HTTP-only cookies.",
)
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    payload: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    access_token, refresh_token = service.login(payload.email, payload.password)
    set_auth_cookies(response, access_token, refresh_token)
    return TokenResponse(access_token=access_token)


@router.post(
    "/refresh",
    response_model=RefreshResponse,
    summary="Rotate tokens",
    description="Issues new access + refresh tokens. Requires valid refresh cookie.",
)
def refresh_token(
    response: Response,
    service: AuthService = Depends(get_auth_service),
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
) -> RefreshResponse:
    if not refresh_token:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )
    new_access, new_refresh = service.refresh(refresh_token)
    set_auth_cookies(response, new_access, new_refresh)
    return RefreshResponse()


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Logout",
    description="Clears auth cookies server-side.",
)
def logout(response: Response) -> LogoutResponse:
    clear_auth_cookies(response)
    logger.info("Logout — cookies cleared")
    return LogoutResponse()


@router.get(
    "/me",
    response_model=AuthStatusResponse,
    summary="Session check",
    description="Returns current user if cookie session is valid.",
)
def get_me(current_user: User = Depends(get_current_user)) -> AuthStatusResponse:
    return AuthStatusResponse(authenticated=True, email=current_user.email)
