from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator

from app.models.lead import BudgetEnum, LeadStatusEnum


class LeadCreate(BaseModel):
    """Schema for lead submission from public landing page."""

    name: str
    email: EmailStr
    budget: BudgetEnum
    message: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Name must be under 100 characters")
        return v

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 10:
            raise ValueError("Message must be at least 10 characters")
        if len(v) > 1000:
            raise ValueError("Message must be under 1000 characters")
        return v


class LeadStatusUpdate(BaseModel):
    """Schema for PATCH /leads/{id}/status."""
    status: LeadStatusEnum


class LeadResponse(BaseModel):
    """Full lead response returned to admin."""

    id: str
    name: str
    email: str
    budget: BudgetEnum
    message: str
    status: LeadStatusEnum
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    """Aggregated stats for the admin dashboard cards."""
    total: int
    new: int
    contacted: int
    closed: int
