"""
LeadDesk Mini Pro — FastAPI Application Entry Point

Security hardening applied:
  - HTTP-only cookie authentication (XSS-resistant)
  - CORS restricted to known origins with credentials allowed
  - Security headers via middleware (CSP, X-Frame-Options, etc.)
  - Rate limiting on auth endpoints
  - Centralized exception handling (no stack trace leakage)
  - Structured logging (never logs secrets/tokens)
"""

import logging
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import get_settings
from app.core.logging_config import configure_logging
from app.core.exceptions import register_exception_handlers
from app.api import auth, leads

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()

# Rate limiter — shared instance, used by auth routes
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title="LeadDesk Mini Pro API",
    description=(
        "Lead management REST API — Digital Heroes internship assignment.\n\n"
        "**Auth:** HTTP-only cookie authentication\n"
        "**Public:** Lead submission\n"
        "**Protected:** All admin operations require valid session cookie"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={"name": "Mayuresh Pawar"},
)

# Attach limiter to app state so slowapi middleware can find it
app.state.limiter = limiter

# ─── Middleware ────────────────────────────────────────────────────────────────

# Rate limiting middleware
app.add_middleware(SlowAPIMiddleware)

# CORS — must be configured correctly for cookie authentication
# Why allow_credentials=True?
#   Required for browser to send/receive cookies cross-origin.
#   Cannot use allow_origins=["*"] with allow_credentials=True — browsers reject it.
# Why specific origins?
#   Wildcard would allow any site to make credentialed requests using the victim's cookies.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,                              # Required for cookie auth
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],    # Authorization kept for Swagger fallback
    expose_headers=["Set-Cookie"],
)

# ─── Security Headers Middleware ──────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next) -> Response:
    """
    Add security headers to every response.

    Why each header:
      X-Content-Type-Options: nosniff
        — Prevents MIME-type sniffing attacks (browser won't guess content type)
      X-Frame-Options: DENY
        — Prevents clickjacking (page can't be embedded in an iframe)
      Referrer-Policy: strict-origin-when-cross-origin
        — Controls how much referrer info is sent (don't leak full URL cross-origin)
      Permissions-Policy
        — Disables browser features we don't use (camera, mic, geolocation)
      Content-Security-Policy
        — Controls which sources can load scripts/styles (XSS mitigation)
    """
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    # CSP — relaxed for production to allow Google Fonts (used by Inter typeface)
    # and Vercel Analytics. 'unsafe-inline' on styles is required by Tailwind CSS.
    if settings.is_production:
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: blob:; "
            f"connect-src 'self' {' '.join(settings.allowed_origins_list)};"
        )
    else:
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob:; "
            "connect-src 'self' http://localhost:*;"
        )
    response.headers["Content-Security-Policy"] = csp

    return response

# ─── Exception Handlers ───────────────────────────────────────────────────────
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
register_exception_handlers(app)

# ─── Routers ──────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(leads.router, prefix=API_PREFIX)


# ─── Lifecycle ────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup() -> None:
    logger.info(
        "LeadDesk API starting | env=%s | cookie_secure=%s",
        settings.APP_ENV,
        settings.COOKIE_SECURE,
    )


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("LeadDesk API shutting down")


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], summary="Health check")
def health_check() -> dict[str, str]:
    """
    Returns 200 with status=healthy when the API is running.
    Used by Railway for health monitoring and zero-downtime deploys.
    """
    return {"status": "healthy", "service": "LeadDesk Mini Pro API", "version": "1.0.0"}
