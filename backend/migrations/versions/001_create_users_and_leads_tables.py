"""create users and leads tables

Revision ID: 001
Revises:
Create Date: 2024-07-20

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ─── Enums ───────────────────────────────────────────────────────────────
    budget_enum = sa.Enum(
        "LESS_THAN_50K",
        "50K_TO_1L",
        "1L_TO_5L",
        "ABOVE_5L",
        name="budget_enum",
    )
    lead_status_enum = sa.Enum(
        "NEW",
        "CONTACTED",
        "CLOSED",
        name="lead_status_enum",
    )

    # ─── USERS table ─────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True, nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.Text, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ─── LEADS table ─────────────────────────────────────────────────────────
    op.create_table(
        "leads",
        sa.Column("id", sa.String(36), primary_key=True, nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("budget", budget_enum, nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column(
            "status",
            lead_status_enum,
            nullable=False,
            server_default="NEW",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # Individual indexes
    op.create_index("ix_leads_email", "leads", ["email"])
    op.create_index("ix_leads_status", "leads", ["status"])
    op.create_index("ix_leads_created_at", "leads", ["created_at"])

    # Composite index — optimises dashboard query (filter by status + sort by date)
    op.create_index("ix_leads_status_created_at", "leads", ["status", "created_at"])


def downgrade() -> None:
    # Drop in reverse order
    op.drop_index("ix_leads_status_created_at", table_name="leads")
    op.drop_index("ix_leads_created_at", table_name="leads")
    op.drop_index("ix_leads_status", table_name="leads")
    op.drop_index("ix_leads_email", table_name="leads")
    op.drop_table("leads")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    # Drop enums from PostgreSQL
    sa.Enum(name="lead_status_enum").drop(op.get_bind())
    sa.Enum(name="budget_enum").drop(op.get_bind())
