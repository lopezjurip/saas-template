#!/bin/bash
set -e

copy_if_exists() {
  local src="$1"
  local dst="$2"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
  else
    echo "Warning: $src not found, skipping."
  fi
}

copy_if_exists "$CONDUCTOR_ROOT_PATH/.env.local" ./.env.local
copy_if_exists "$CONDUCTOR_ROOT_PATH/apps/platform/.env.local" ./apps/platform/.env.local

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
copy_if_exists "$CONDUCTOR_ROOT_PATH/.claude/settings.local.json" ./.claude/settings.local.json

pnpm install
