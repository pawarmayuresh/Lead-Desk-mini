"""
Centralized exception handling.

Why centralized?
  - Consistent error response shape across all endpoints
  - Single place to add logging, monitoring, alerting
  - Prevents leaking stack traces or DB details to clients
  - Every HTTP error returns the same predictable JSON structure
"""

import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)


def _error_response(status_code: int, message: str, detail: object = None) -> JSONResponse:
    """Uniform error response shape for every error in the API."""
    body: dict = {"success": False, "message": message}
    if detail is not None:
        body["detail"] = detail
    return JSONResponse(status_code=status_code, content=body)


def register_exception_handlers(app: FastAPI) -> None:
    """
    Register all global exception handlers on the FastAPI app.
    Call this once in main.py after app creation.
    """

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """
        Pydantic validation failures (422).
        Flatten the errors into a readable list for the client.
        """
        errors = [
            {
                "field": " → ".join(str(loc) for loc in err["loc"] if loc != "body"),
                "message": err["msg"],
            }
            for err in exc.errors()
        ]
        logger.warning("Validation error on %s: %s", request.url.path, errors)
        return _error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            message="Validation failed. Check the fields below.",
            detail=errors,
        )

    @app.exception_handler(SQLAlchemyError)
    async def database_exception_handler(
        request: Request, exc: SQLAlchemyError
    ) -> JSONResponse:
        """
        Database errors.
        Log the real error internally, return a safe message externally.
        Never expose DB internals to the client.
        """
        logger.error(
            "Database error on %s: %s",
            request.url.path,
            str(exc),
            exc_info=True,
        )
        return _error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="A database error occurred. Please try again.",
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """
        Catch-all for any unhandled exception.
        Prevents raw tracebacks from reaching the client in production.
        """
        logger.error(
            "Unhandled exception on %s: %s",
            request.url.path,
            str(exc),
            exc_info=True,
        )
        return _error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="An unexpected error occurred.",
        )
