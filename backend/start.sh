#!/bin/sh
set -e
node_modules/.bin/medusa db:migrate
node scripts/ensure-admin.js

# Start Medusa in background, seed products, then keep it running
node_modules/.bin/medusa start --port ${PORT:-9000} &
MEDUSA_PID=$!

# Wait for Medusa to be ready
echo "[start] Waiting for Medusa to start..."
for i in $(seq 1 60); do
  if wget -q -O /dev/null "http://localhost:${PORT:-9000}/health" 2>/dev/null; then
    echo "[start] Medusa is ready"
    break
  fi
  sleep 2
done

# Seed products (idempotent)
node scripts/seed-products.js || echo "[start] seed-products skipped or failed (non-fatal)"

# Wait for Medusa process
wait $MEDUSA_PID
