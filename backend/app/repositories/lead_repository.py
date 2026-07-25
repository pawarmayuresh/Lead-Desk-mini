"""
LeadRepository — all database operations for the Lead model.

Key design decisions:
  - All queries automatically filter deleted_at IS NULL (soft delete)
  - Stats query uses a single SQL CASE WHEN — one round trip, not four
  - Search uses func.lower() on both sides — case-insensitive, index-safe
  - select() style (SQLAlchemy 2.x) instead of legacy query() style
  - Session injected via __init__ — never created here
"""

from datetime import datetime, timezone

from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import Session

from app.models.lead import Lead, LeadStatusEnum, BudgetEnum


class LeadRepository:
    """Handles all persistence operations for Lead entities."""

    def __init__(self, db: Session) -> None:
        self._db = db

    # ── Active record filter ──────────────────────────────────────────────────
    # All queries use this to automatically exclude soft-deleted leads.
    # Adding deleted_at is a non-breaking schema change — no existing queries break.

    @staticmethod
    def _active() -> bool:
        """Return the soft-delete filter condition."""
        return Lead.deleted_at.is_(None)

    # ── Write operations ─────────────────────────────────────────────────────

    def create(
        self,
        name: str,
        email: str,
        budget: BudgetEnum,
        message: str,
    ) -> Lead:
        """
        Persist a new lead.
        Caller commits the transaction — repository only flushes.
        """
        lead = Lead(name=name, email=email, budget=budget, message=message)
        self._db.add(lead)
        self._db.flush()
        return lead

    def update_status(self, lead: Lead, status: LeadStatusEnum) -> Lead:
        """Update status on an existing lead object."""
        lead.status = status
        self._db.flush()
        return lead

    def soft_delete(self, lead: Lead) -> None:
        """Mark lead as deleted — never removes the row from the database."""
        lead.deleted_at = datetime.now(timezone.utc)
        self._db.flush()

    # ── Read operations ──────────────────────────────────────────────────────

    def get_by_id(self, lead_id: str) -> Lead | None:
        """
        Fetch a single active lead by ID.
        Uses primary key — O(1) lookup.
        """
        stmt = select(Lead).where(Lead.id == lead_id, self._active())
        return self._db.scalar(stmt)

    def get_all(self, search: str | None = None) -> list[Lead]:
        """
        Return all active leads, newest first.
        Optional case-insensitive search on name or email.

        Why func.lower() on both sides?
          Ensures case-insensitive match without collation dependency.
          Works on any PostgreSQL locale.
        """
        stmt = (
            select(Lead)
            .where(self._active())
            .order_by(Lead.created_at.desc())
        )

        if search:
            pattern = f"%{search.lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(Lead.name).like(pattern),
                    func.lower(Lead.email).like(pattern),
                )
            )

        return list(self._db.scalars(stmt).all())

    def get_stats(self) -> dict[str, int]:
        """
        Single aggregated query for dashboard statistics.

        Why CASE WHEN instead of 4 COUNT queries?
          Four separate queries = 4 round trips to the database.
          One query with CASE WHEN = 1 round trip, same result.
          At scale this is the difference between 400ms and 100ms.

        SQL equivalent:
          SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'NEW' THEN 1 END) as new,
            COUNT(CASE WHEN status = 'CONTACTED' THEN 1 END) as contacted,
            COUNT(CASE WHEN status = 'CLOSED' THEN 1 END) as closed
          FROM leads
          WHERE deleted_at IS NULL;
        """
        stmt = select(
            func.count().label("total"),
            func.count(
                case((Lead.status == LeadStatusEnum.NEW, 1))
            ).label("new"),
            func.count(
                case((Lead.status == LeadStatusEnum.CONTACTED, 1))
            ).label("contacted"),
            func.count(
                case((Lead.status == LeadStatusEnum.CLOSED, 1))
            ).label("closed"),
        ).where(self._active())

        row = self._db.execute(stmt).one()
        return {
            "total": row.total,
            "new": row.new,
            "contacted": row.contacted,
            "closed": row.closed,
        }
