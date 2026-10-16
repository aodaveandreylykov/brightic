#!/bin/sh
set -e
node_modules/.bin/medusa db:migrate

# Create admin user on first run if env vars are set
if [ -n "$MEDUSA_ADMIN_EMAIL" ] && [ -n "$MEDUSA_ADMIN_PASSWORD" ]; then
  node_modules/.bin/medusa user -e "$MEDUSA_ADMIN_EMAIL" -p "$MEDUSA_ADMIN_PASSWORD" 2>/dev/null || true
fi

exec node_modules/.bin/medusa start --port ${PORT:-9000}
