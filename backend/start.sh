#!/bin/sh
set -e
node_modules/.bin/medusa db:migrate
node_modules/.bin/medusa exec src/scripts/create-admin.js 2>/dev/null || true
exec node_modules/.bin/medusa start --port ${PORT:-9000}
