#!/bin/bash
set -e

echo "=== LeadDesk Mini Pro — Production Start ==="

# Step 1: Run migrations
echo "→ Running migrations..."
python -m alembic upgrade head
echo "✓ Migrations done"

# Step 2: Seed admin (no-op if already exists)
echo "→ Seeding admin..."
python -m app.utils.seed
echo "✓ Seed done"

# Step 3: Start server
# Single worker — avoids Railway container memory issues
# asyncio loop — more portable than uvloop
# $PORT — Railway injects this automatically
echo "→ Starting server on port ${PORT:-8000}..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers 1 \
  --loop asyncio
