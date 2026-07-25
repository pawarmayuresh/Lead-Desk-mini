#!/bin/bash
# ============================================================
# LeadDesk Mini Pro — Production Startup Script
# Railway executes this on every deploy.
#
# Order:
#   1. Run Alembic migrations (idempotent — safe to run every deploy)
#   2. Seed admin user if not already present
#   3. Start Uvicorn with production settings
# ============================================================

set -e  # Exit immediately if any command fails

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  LeadDesk Mini Pro — Production Start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Run database migrations
echo "→ Running Alembic migrations..."
alembic upgrade head
echo "✓ Migrations complete"

# Step 2: Seed admin user (no-op if already exists)
echo "→ Seeding admin account..."
python -m app.utils.seed
echo "✓ Seed complete"

# Step 3: Start API server
echo "→ Starting FastAPI server..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers 2 \
  --loop uvloop \
  --no-access-log
