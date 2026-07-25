from pydantic import BaseModel, EmailStr, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Password cannot be empty")
        return v


class TokenResponse(BaseModel):
    """
    Returned on successful login.
    access_token also set in HTTP-only cookie by the route handler.
    Included in body for Swagger UI compatibility only.
    Frontend should NOT read this — it uses the cookie automatically.
    """
    access_token: str
    token_type: str = "bearer"
    message: str = "Login successful"


class RefreshResponse(BaseModel):
    message: str = "Token refreshed"


class LogoutResponse(BaseModel):
    message: str = "Logged out successfully"


class AuthStatusResponse(BaseModel):
    """Used by frontend to check if cookie session is still valid."""
    authenticated: bool
    email: str | None = None
