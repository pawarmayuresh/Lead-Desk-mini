"""
Lead ORM model.

Design decisions:
  - ENUM for budget and status: rejects invalid values at DB level, not just application level
  - deleted_at (soft delete): data is never destroyed; queries filter it by default
  - Composite index (status, created_at): covers the most common dashboard query pattern
    (WHERE status = X ORDER BY created_at DESC)
  - updated_at with onupdate: timestamp maintained automatically, never manually
  - No FK to users: single admin MVP; future multi-user adds assigned_to column
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class BudgetEnum(str, enum.Enum):
    """
    Predefined budget ranges.
    ENUM type enforces valid values at the database level.
    Never stored as free-text — analytics and filtering are simpler.
    """
    LESS_THAN_50K = "LESS_THAN_50K"
    BETWEEN_50K_1L = "50K_TO_1L"
    BETWEEN_1L_5L = "1L_TO_5L"
    ABOVE_5L = "ABOVE_5L"


class LeadStatusEnum(str, enum.Enum):
    """
    Lead lifecycle.
    NEW → CONTACTED → CLOSED
    Only forward transitions are allowed (enforced in service layer).
    """
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    CLOSED = "CLOSED"


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    budget: Mapped[BudgetEnum] = mapped_column(
        Enum(BudgetEnum, name="budget_enum"),
        nullable=False,
    )
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    status: Mapped[LeadStatusEnum] = mapped_column(
        Enum(LeadStatusEnum, name="lead_status_enum"),
        nullable=False,
        default=LeadStatusEnum.NEW,
        server_default=LeadStatusEnum.NEW.value,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    # Soft delete — NULL means active; timestamp means deleted.
    # All repository queries must filter: Lead.deleted_at.is_(None)
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
        doc="Soft delete timestamp. NULL = active record.",
    )

    __table_args__ = (
        # email: searched in lead lookup
        Index("ix_leads_email", "email"),
        # status: filtered on dashboard cards
        Index("ix_leads_status", "status"),
        # created_at: default sort order
        Index("ix_leads_created_at", "created_at"),
        # Composite: covers WHERE status=X ORDER BY created_at in a single index scan
        Index("ix_leads_status_created_at", "status", "created_at"),
        # Partial index on active leads only — WHERE deleted_at IS NULL
        # This is the most common query pattern; reduces index size
        Index("ix_leads_active", "created_at",
              postgresql_where="deleted_at IS NULL"),
    )

    def __repr__(self) -> str:
        return f"<Lead id={self.id} name={self.name} status={self.status}>"
