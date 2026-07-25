"""
Seed script — creates the admin user if none exists.

Run with:
    cd backend && PYTHONPATH=. venv/bin/python -m app.utils.seed

Credentials:
    Email:    admin@digitalheroes.com
    Password: Admin@123
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.session import SessionLocal
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password

ADMIN_EMAIL = "admin@digitalheroes.com"
ADMIN_PASSWORD = "Admin@123"


def seed_admin() -> None:
    db = SessionLocal()
    try:
        repo = UserRepository(db)

        if repo.exists():
            print("✓ Admin user already exists. Skipping seed.")
            return

        hashed = hash_password(ADMIN_PASSWORD)
        user = repo.create(email=ADMIN_EMAIL, password_hash=hashed)
        db.commit()
        db.refresh(user)
        print(f"✓ Admin user created: {user.email}")
        print("  Email:    admin@digitalheroes.com")
        print("  Password: Admin@123")

    except Exception as e:
        print(f"✗ Seed failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
