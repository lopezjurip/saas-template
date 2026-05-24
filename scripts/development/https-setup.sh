#!/usr/bin/env bash
# Provision a local TLS cert for apps/platform so it can run over HTTPS in dev.
# Required for WebAuthn / passkeys (secure context) and for OAuth callbacks to match
# the https://lvh.me:7003 entries in supabase/config.toml.
#
# Idempotent — safe to re-run.

set -euo pipefail

if ! command -v mkcert >/dev/null 2>&1; then
  echo "error: mkcert is not installed."
  echo "Install it first:"
  echo "  macOS:  brew install mkcert nss"
  echo "  Linux:  see https://github.com/FiloSottile/mkcert#installation"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_DIR="$SCRIPT_DIR/../../apps/platform/certs"

mkdir -p "$CERT_DIR"

echo "==> Installing mkcert root CA (idempotent)…"
mkcert -install

echo "==> Issuing cert for lvh.me + *.lvh.me + localhost + 127.0.0.1…"
mkcert \
  -key-file "$CERT_DIR/lvh.me-key.pem" \
  -cert-file "$CERT_DIR/lvh.me-cert.pem" \
  lvh.me '*.lvh.me' localhost 127.0.0.1

echo
echo "✅ Certs written to apps/platform/certs/"
echo "   Run 'pnpm dev' and open https://lvh.me:7003"
