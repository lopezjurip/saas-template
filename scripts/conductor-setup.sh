#!/bin/bash
set -e

cp "$CONDUCTOR_ROOT_PATH/.env.local" ./.env.local
cp "$CONDUCTOR_ROOT_PATH/apps/platform/.env.local" ./apps/platform/.env.local

mkdir -p apps/platform/certs
ROOT_CERT="$CONDUCTOR_ROOT_PATH/apps/platform/certs/lvh.me-cert.pem"
ROOT_KEY="$CONDUCTOR_ROOT_PATH/apps/platform/certs/lvh.me-key.pem"
if [ -f "$ROOT_CERT" ] && [ -f "$ROOT_KEY" ]; then
  cp "$ROOT_CERT" ./apps/platform/certs/lvh.me-cert.pem
  cp "$ROOT_KEY" ./apps/platform/certs/lvh.me-key.pem
else
  bash scripts/setup-https.sh
fi

mkdir -p .claude
cp "$CONDUCTOR_ROOT_PATH/.claude/settings.local.json" ./.claude/settings.local.json

pnpm install
