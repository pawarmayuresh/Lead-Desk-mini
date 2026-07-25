"""
Lead routes — presentation layer only.

Responsibilities:
  - Parse and validate HTTP requests (Pydantic does this automatically)
  - Delegate to LeadService
  - Translate domain exceptions to HTTP responses
  - Return HTTP responses

What routes do NOT contain:
  - Business logic
  - Database access
  - Validation rules (those are in schemas and services)

Why translate LeadNotFoundError here and not in the service?
  Services are HTTP-agnostic. A service could be called from a CLI tool or test.
  The route layer is the only layer that knows about HTTP status codes.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.services import get_lead_service
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadResponse, LeadStatusUpdate, DashboardStats
from app.services.lead_service import LeadService, LeadNotFoundError

router = APIRouter(tags=["Leads"])


# ─── Public ──────────────────────────────────────────────────────────────────

@router.post(
    "/leads",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a lead",
    description="Public — visitors submit their project inquiry.",
)
def submit_lead(
    payload: LeadCreate,
    service: LeadService = Depends(get_lead_service),
) -> LeadResponse:
    return service.create_lead(
        name=payload.name,
        email=payload.email,
        budget=payload.budget,
        message=payload.message,
    )


# ─── Protected ───────────────────────────────────────────────────────────────

@router.get(
    "/leads",
    response_model=list[LeadResponse],
    summary="Get all leads",
    description="Admin only. Supports optional ?search= query.",
)
def get_leads(
    search: str | None = Query(default=None, description="Search by name or email"),
    service: LeadService = Depends(get_lead_service),
    _: User = Depends(get_current_user),
) -> list[LeadResponse]:
    return service.get_leads(search=search)


@router.patch(
    "/leads/{lead_id}/status",
    response_model=LeadResponse,
    summary="Update lead status",
    description="Admin only. Changes the status of a specific lead.",
)
def update_lead_status(
    lead_id: str,
    payload: LeadStatusUpdate,
    service: LeadService = Depends(get_lead_service),
    _: User = Depends(get_current_user),
) -> LeadResponse:
    try:
        return service.update_status(lead_id, payload.status)
    except LeadNotFoundError as exc:
        # Domain exception → HTTP 404
        # This translation belongs here, not in the service
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.get(
    "/dashboard/stats",
    response_model=DashboardStats,
    summary="Dashboard statistics",
    description="Admin only. Returns total, new, contacted, and closed counts.",
)
def get_dashboard_stats(
    service: LeadService = Depends(get_lead_service),
    _: User = Depends(get_current_user),
) -> DashboardStats:
    return service.get_dashboard_stats()
