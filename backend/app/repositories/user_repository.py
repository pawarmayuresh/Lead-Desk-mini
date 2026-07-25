"""
UserRepository — all database operations for the User model.

Responsibilities (Single Responsibility Principle):
  - Only interacts with the database
  - No business logic, no HTTP concerns, no validation
  - Business decisions belong in AuthService

Why inject Session instead of creating it here?
  - Dependency Inversion: repository depends on the Session abstraction,
    not on a concrete engine or session factory
  - Testability: tests can inject a mock/test session without touching the DB
  - Transaction ownership: the caller (service) controls commit/rollback,
    not the repository
"""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """Handles all persistence operations for User entities."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def get_by_email(self, email: str) -> User | None:
        """
        Look up a user by email address.
        Uses the ix_users_email index — O(log n) lookup.
        """
        stmt = select(User).where(User.email == email)
        return self._db.scalar(stmt)

    def get_by_id(self, user_id: str) -> User | None:
        """Look up a user by primary key."""
        return self._db.get(User, user_id)

    def create(self, email: str, password_hash: str) -> User:
        """
        Persist a new user.
        Caller is responsible for committing the transaction.
        """
        user = User(email=email, password_hash=password_hash)
        self._db.add(user)
        self._db.flush()   # Get DB-generated values (id) without committing
        return user

    def update_last_login(self, user: User) -> None:
        """Record the time of last successful login for audit trail."""
        user.last_login = datetime.now(timezone.utc)
        self._db.flush()

    def exists(self) -> bool:
        """Check if any user exists — used by the seed guard."""
        stmt = select(User).limit(1)
        return self._db.scalar(stmt) is not None
