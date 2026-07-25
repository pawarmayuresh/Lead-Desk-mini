"""
LeadService — business logic for lead management.

Responsibilities (Single Responsibility Principle):
  - Business rules (status transition validation)
  - Orchestration between repository and return types
  - Never raises HTTP exceptions — raises domain exceptions instead
    (routes translate these to HTTP responses)

Why remove HTTPException from services?
  Services are a business logic layer. They should not know about HTTP.
  A service could be called from a CLI script, a test, or a background job —
  none of which understand HTTP status codes.
  The route handler is responsible for translating NotFound → 404.

Dependency Injection:
  Repository and session are injected — service doesn't create them.
  This makes services fully testable with a mock repository.
"""

import logging
from sqlalchemy.orm import Session

from app.models.lead import Lead, LeadStatusEnum, BudgetEnum
from app.repositories.lead_repository import LeadRepository
from app.schemas.lead import DashboardStats

logger = logging.getLogger(__name__)


class LeadNotFoundError(Exception):
    """Raised when a lead does not exist or has been soft-deleted."""
    def __init__(self, lead_id: str) -> None:
        self.lead_id = lead_id
        super().__init__(f"Lead '{lead_id}' not found")


class LeadService:
    """Business logic layer for lead operations."""

    def __init__(self, repo: LeadRepository, db: Session) -> None:
        self._repo = repo
        self._db = db

    def create_lead(
        self,
        name: str,
        email: str,
        budget: BudgetEnum,
        message: str,
    ) -> Lead:
        """
        Create and persist a new lead.
        Wraps the repository call in a transaction — commits or rolls back atomically.
        """
        try:
            lead = self._repo.create(name=name, email=email, budget=budget, message=message)
            self._db.commit()
            self._db.refresh(lead)
            logger.info("Lead created: %s (%s)", lead.id, email)
            return lead
        except Exception:
            self._db.rollback()
            raise

    def get_leads(self, search: str | None = None) -> list[Lead]:
        """Return all active leads, optionally filtered by search term."""
        return self._repo.get_all(search=search)

    def update_status(self, lead_id: str, new_status: LeadStatusEnum) -> Lead:
        """
        Update lead status.
        Raises LeadNotFoundError if the lead doesn't exist.
        Route handler translates this to HTTP 404.
        """
        lead = self._repo.get_by_id(lead_id)
        if not lead:
            raise LeadNotFoundError(lead_id)

        try:
            updated = self._repo.update_status(lead, new_status)
            self._db.commit()
            self._db.refresh(updated)
            logger.info("Lead %s status → %s", lead_id, new_status)
            return updated
        except Exception:
            self._db.rollback()
            raise

    def get_dashboard_stats(self) -> DashboardStats:
        """Return aggregated counts for dashboard cards — single DB query."""
        stats = self._repo.get_stats()
        return DashboardStats(**stats)
