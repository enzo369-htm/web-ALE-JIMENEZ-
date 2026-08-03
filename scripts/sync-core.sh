#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CORE="$(cd "$ROOT/../studio-core" && pwd)"
DEST="$ROOT/src/core"

if [[ ! -d "$CORE/free-canvas" ]]; then
  echo "studio-core not found at $CORE"
  exit 1
fi

mkdir -p "$DEST"
for mod in free-canvas auth supabase upload admin-shell; do
  rm -rf "$DEST/$mod"
  cp -R "$CORE/$mod" "$DEST/$mod"
  echo "synced $mod"
done

cp "$CORE/sql/"*.sql "$ROOT/supabase/" 2>/dev/null || true
echo "done → $DEST"
