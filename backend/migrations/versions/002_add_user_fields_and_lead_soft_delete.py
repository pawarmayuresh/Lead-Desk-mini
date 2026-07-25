"""add user fields and lead soft delete

Adds to users:  role, is_active, last_login, updated_at
Adds to leads:  deleted_at, ix_leads_active (partial index)

All new columns are nullable or have server defaults — non-breaking.
Existing rows remain valid without any data migration.

Revision ID: 002
Revises: 001
Create Date: 2024-07-20
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ─── users: add role, is_active, last_login, updated_at ─────────────────
    user_role_enum = sa.Enum("ADMIN", name="user_role_enum")
    user_role_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "users",
        sa.Column(
            "role",
            sa.Enum("ADMIN", name="user_role_enum"),
            nullable=False,
            server_default="ADMIN",
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "is_active",
            sa.Boolean,
            nullable=False,
            server_default="true",
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "last_login",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ─── leads: add deleted_at for soft delete ───────────────────────────────
    op.add_column(
        "leads",
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # Partial index — only indexes active (non-deleted) leads
    # Smaller index = faster maintenance, less storage
    op.create_index(
        "ix_leads_active",
        "leads",
        ["created_at"],
        postgresql_where=sa.text("deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("ix_leads_active", table_name="leads")
    op.drop_column("leads", "deleted_at")

    op.drop_column("users", "updated_at")
    op.drop_column("users", "last_login")
    op.drop_column("users", "is_active")
    op.drop_column("users", "role")

    sa.Enum(name="user_role_enum").drop(op.get_bind(), checkfirst=True)
