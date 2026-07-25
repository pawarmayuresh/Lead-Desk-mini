from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.lead import Lead, LeadStatusEnum, BudgetEnum
from app.models.user import User


class UserRepository:
    """Handles all User database operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, email: str, password_hash: str) -> User:
        user = User(email=email, password_hash=password_hash)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def exists(self) -> bool:
        """Check if any admin user exists (used for seed guard)."""
        return self.db.query(User).count() > 0


class LeadRepository:
    """Handles all Lead database operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        name: str,
        email: str,
        budget: BudgetEnum,
        message: str,
    ) -> Lead:
        lead = Lead(name=name, email=email, budget=budget, message=message)
        self.db.add(lead)
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get_all(self, search: str | None = None) -> list[Lead]:
        """
        Fetch all leads ordered by creation date descending.
        Optional case-insensitive search on name or email.
        """
        query = self.db.query(Lead)

        if search:
            pattern = f"%{search.lower()}%"
            query = query.filter(
                func.lower(Lead.name).like(pattern)
                | func.lower(Lead.email).like(pattern)
            )

        return query.order_by(Lead.created_at.desc()).all()

    def get_by_id(self, lead_id: str) -> Lead | None:
        return self.db.query(Lead).filter(Lead.id == lead_id).first()

    def update_status(self, lead: Lead, status: LeadStatusEnum) -> Lead:
        lead.status = status
        self.db.commit()
        self.db.refresh(lead)
        return lead

    def get_stats(self) -> dict[str, int]:
        """
        Single aggregated query for dashboard cards.
        Uses conditional counting to avoid 4 separate queries.
        """
        total = self.db.query(func.count(Lead.id)).scalar() or 0
        new = (
            self.db.query(func.count(Lead.id))
            .filter(Lead.status == LeadStatusEnum.NEW)
            .scalar() or 0
        )
        contacted = (
            self.db.query(func.count(Lead.id))
            .filter(Lead.status == LeadStatusEnum.CONTACTED)
            .scalar() or 0
        )
        closed = (
            self.db.query(func.count(Lead.id))
            .filter(Lead.status == LeadStatusEnum.CLOSED)
            .scalar() or 0
        )
        return {"total": total, "new": new, "contacted": contacted, "closed": closed}
