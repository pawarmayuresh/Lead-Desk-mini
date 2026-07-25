"""
LeadDesk Mini Pro — FastAPI Application Entry Point
"""

import logging
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging_config import configure_logging
from app.core.exceptions import register_exception_handlers
from app.api import auth, leads

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()

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

# ─── CORS ─────────────────────────────────────────────────────────────────────
# allow_credentials=True required for HTTP-only cookies cross-origin.
# Cannot use wildcard origins with credentials — browsers block it.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Cookie"],
    expose_headers=["Set-Cookie"],
)

# ─── Security Headers ─────────────────────────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next) -> Response:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

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
register_exception_handlers(app)

# ─── Routers ──────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(leads.router, prefix=API_PREFIX)


# ─── Lifecycle ────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup() -> None:
    logger.info(
        "LeadDesk API starting | env=%s | origins=%s",
        settings.APP_ENV,
        settings.allowed_origins_list,
    )


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("LeadDesk API shutting down")


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": "LeadDesk Mini Pro API", "version": "1.0.0"}
