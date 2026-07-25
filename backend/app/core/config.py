from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    # Access token: short-lived (15 min) — reduces window if stolen
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15

    # Refresh token: long-lived (7 days) — stored in separate HTTP-only cookie
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    APP_ENV: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:3000"

    # Cookie settings
    # Secure=True in production (HTTPS only), False in local dev (HTTP)
    COOKIE_SECURE: bool = False  # Set True in production via env var
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: str | None = None

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def cookie_secure(self) -> bool:
        """Auto-enable secure cookies in production regardless of env var."""
        return self.COOKIE_SECURE or self.is_production

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
