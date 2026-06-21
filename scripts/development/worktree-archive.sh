#!/bin/bash
set -e

WS=$(echo "${WORKTREE_NAME:-local}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
PROJECT=$(printf '%s' "${WORKTREE_PROJECT:-}" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
PROJECT_PREFIX=$(printf '%s' "${PROJECT}" | cut -c1-20 | sed 's/-$//')
WS_HASH=$(printf '%s' "${PROJECT}:${WS}" | shasum -a 256 | cut -c1-12)

if [ -z "$PROJECT_PREFIX" ]; then
  PROJECT_PREFIX="workspace"
fi

# --- Deregister this worktree from the shared Supabase instance ---
INSTANCE_KEY="${PROJECT_PREFIX}-${WS_HASH}"
REF_DIR="$HOME/.worktree-refs/${INSTANCE_KEY}"
REF_FILE="$REF_DIR/$(pwd | tr '/' '_')"
rm -f "$REF_FILE"

# Purge stale refs whose worktree directories no longer exist
for _stale_ref in "$REF_DIR"/*; do
  [ -f "$_stale_ref" ] || continue
  _stale_dir=$(basename "$_stale_ref" | tr '_' '/')
  [ -d "$_stale_dir" ] || rm -f "$_stale_ref"
done

REF_COUNT=$(ls "$REF_DIR" 2>/dev/null | wc -l | tr -d ' ')

if [ "$REF_COUNT" -gt 0 ]; then
  echo "Supabase ${INSTANCE_KEY} still used by ${REF_COUNT} other worktree(s), skipping shutdown"
else
  rmdir "$REF_DIR" 2>/dev/null || true

  # Tear down via `docker` directly (deterministic by label) — not `pnpm db:stop`,
  # which fails silently in Conductor's non-interactive shell and leaks everything.
  CIDS=$(docker ps -aq --filter "label=com.supabase.cli.project=${INSTANCE_KEY}" 2>/dev/null)
  [ -n "$CIDS" ] && docker rm -f $CIDS >/dev/null 2>&1 || true

  VOLS=$(docker volume ls -q --filter "label=com.supabase.cli.project=${INSTANCE_KEY}" 2>/dev/null)
  [ -n "$VOLS" ] && docker volume rm $VOLS >/dev/null 2>&1 || true

  docker network rm "supabase_network_${INSTANCE_KEY}" >/dev/null 2>&1 || true
fi

# Remove node_modules
rm -rf node_modules
