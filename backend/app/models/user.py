"""
User ORM model.

Design decisions:
  - UUID primary key: globally unique, hard to guess, avoids sequential ID enumeration
  - role ENUM: extensible for future RBAC without schema redesign
  - is_active: soft-disable accounts without deletion
  - last_login: audit trail, useful for detecting stale accounts
  - updated_at: all write operations are auditable
  - No FK from leads to users: MVP is single-admin; assigned_to can be added later
"""

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class UserRole(str, enum.Enum):
    """
    User role enum.
    ADMIN: full access to all leads and dashboard
    Future: VIEWER, MANAGER, etc.
    """
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role_enum"),
        nullable=False,
        default=UserRole.ADMIN,
        server_default=UserRole.ADMIN.value,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
        doc="Soft-disable accounts without deletion",
    )
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
        doc="Updated on successful login — useful for audit and stale account detection",
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

    __table_args__ = (
        # Indexed for login lookup — O(log n) instead of O(n) table scan
        Index("ix_users_email", "email", unique=True),
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
