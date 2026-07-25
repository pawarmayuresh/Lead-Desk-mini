#!/bin/bash
set -e

echo "=== LeadDesk Mini Pro startup ==="
echo "Python: $(python --version)"
echo "Port: ${PORT:-8000}"

# Step 1: Run migrations using python -m (always works regardless of PATH)
echo "→ Running migrations..."
python -m alembic upgrade head
echo "✓ Migrations done"

# Step 2: Seed admin (idempotent)
echo "→ Seeding admin..."
python -m app.utils.seed
echo "✓ Seed done"

# Step 3: Start server
echo "→ Starting uvicorn..."
exec python -m uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers 1
