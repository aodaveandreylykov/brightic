#!/bin/sh
set -e
node_modules/.bin/medusa db:migrate
exec node_modules/.bin/medusa start --port ${PORT:-9000}
