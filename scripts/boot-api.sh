#!/bin/bash

# Boot API server (infrastructure + API in foreground)
# Use this for interactive development with live API

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

clear
# Boot infrastructure (Gitea + admin + .env) - source to get exported vars
source "${SCRIPT_DIR}/boot-infra.sh"

# Check if API port is available
check_port "${API_PORT}" "API"

echo ""
echo "==> Starting API server..."

# Start API in background, capture logs
cd "${ROOT_DIR}/packages/api"
yarn serve > "${ROOT_DIR}/api.log" 2>&1 &
API_PID=$!
cd "$ROOT_DIR"

# Wait for API to be ready
echo "    Waiting for API..."
API_READY=false
for i in {1..15}; do
    if curl -s "http://localhost:${API_PORT}/check-name/test" > /dev/null 2>&1; then
        API_READY=true
        break
    fi
    # Check if process died
    if ! kill -0 $API_PID 2>/dev/null; then
        echo ""
        echo "ERROR: API failed to start"
        echo ""
        cat "${ROOT_DIR}/api.log"
        exit 1
    fi
    sleep 1
done

if [ "$API_READY" = false ]; then
    echo ""
    echo "ERROR: API failed to respond after 15 seconds"
    echo ""
    cat "${ROOT_DIR}/api.log"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

# Success!
clear
echo ""
echo "=============================================="
echo "  regressionproof.ai running locally!"
echo "=============================================="
echo ""
echo "  Gitea:  ${GITEA_URL} (${ADMIN_USER}/${ADMIN_PASSWORD})"
echo "  API:    http://localhost:${API_PORT}"
echo ""
echo "  Logs: ${ROOT_DIR}/api.log"
echo "  Ctrl+C to stop"
echo ""

# Handle Ctrl+C - kill API
trap "kill $API_PID 2>/dev/null; exit 0" INT TERM

# Wait for API to exit
wait $API_PID
