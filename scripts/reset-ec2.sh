#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="${ROOT_DIR:-$HOME/regressionproof}"
FORCE="${FORCE:-false}"

if [ "${1:-}" = "--force" ]; then
    FORCE=true
fi

echo "This will remove all regressionproof containers, images, volumes, and data."
if [ "$FORCE" != "true" ]; then
    read -r -p "Type RESET to continue: " confirm

    if [ "$confirm" != "RESET" ]; then
        echo "Aborted."
        exit 1
    fi
else
    echo "Force mode enabled; skipping confirmation."
fi

if [ -d "$ROOT_DIR" ]; then
    cd "$ROOT_DIR"
fi

if docker compose version >/dev/null 2>&1; then
    docker compose down -v --remove-orphans || true
else
    docker-compose down -v --remove-orphans || true
fi

docker rm -f regressionproof-api regressionproof-gitea regressionproof-nginx 2>/dev/null || true
docker rmi regressionproof-api:local 2>/dev/null || true

rm -rf "$ROOT_DIR/gitea" 2>/dev/null || sudo rm -rf "$ROOT_DIR/gitea"

echo "Reset complete."
