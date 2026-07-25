"""
FastAPI dependency providers for services.

Why a dedicated dependencies layer?
  - Routes should not instantiate services directly (violates DI principle)
  - This layer is the single place where the dependency graph is wired
  - Easy to swap implementations for testing (inject mock services)
  - Clean separation: routes declare WHAT they need, this layer provides it

Usage in a route:
    from app.dependencies.services import get_lead_service

    @router.get("/leads")
    def get_leads(service: LeadService = Depends(get_lead_service)):
        return service.get_leads()
"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.lead_repository import LeadRepository
from app.repositories.user_repository import UserRepository
from app.services.lead_service import LeadService
from app.services.auth_service import AuthService


def get_lead_service(db: Session = Depends(get_db)) -> LeadService:
    """Provide a fully wired LeadService for route injection."""
    repo = LeadRepository(db)
    return LeadService(repo=repo, db=db)


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Provide a fully wired AuthService for route injection."""
    repo = UserRepository(db)
    return AuthService(repo=repo, db=db)
