#!/bin/bash

# Boot infrastructure (Gitea + admin user + .env files)
# Reentrant - safe to run multiple times
# Used by: boot-dev.sh, e2e-setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo ""
    echo "ERROR: Docker is not running"
    echo ""
    echo "Please start Docker Desktop and try again."
    echo ""
    exit 1
fi

# Configurable via environment variables
CONTAINER_NAME="${CONTAINER_NAME:-regressionproof-gitea-dev}"
GITEA_PORT="${GITEA_PORT:-3333}"
API_PORT="${API_PORT:-3000}"
GITEA_URL="${GITEA_URL:-http://localhost:${GITEA_PORT}}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-devpassword123}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@localhost}"

# Export for other scripts
export CONTAINER_NAME GITEA_PORT API_PORT GITEA_URL ADMIN_USER ADMIN_PASSWORD ADMIN_EMAIL

# Helper function to check/kill port - can be called by scripts that source this
check_port() {
    local port=$1
    local service_name=$2

    if lsof -i :${port} > /dev/null 2>&1; then
        echo ""
        echo "WARNING: Port ${port} is already in use"
        echo ""
        lsof -i :${port} | head -5
        echo ""
        read -p "Kill the process using port ${port}? (y/N) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Killing process on port ${port}..."
            lsof -ti :${port} | xargs kill -9 2>/dev/null || true
            sleep 1
            echo "Done"
        else
            echo "Cannot start ${service_name} - port ${port} is in use"
            exit 1
        fi
    fi
}

echo "==> Starting infrastructure..."

# Check if Gitea container exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo "    Gitea already running at ${GITEA_URL}"
    else
        echo "    Starting existing Gitea container..."
        docker start "${CONTAINER_NAME}"
    fi
else
    echo "    Creating Gitea container..."
    docker run -d \
        --name "${CONTAINER_NAME}" \
        -p "${GITEA_PORT}:3000" \
        -e GITEA__security__INSTALL_LOCK=true \
        -e GITEA__server__ROOT_URL="${GITEA_URL}" \
        -e GITEA__server__HTTP_PORT=3000 \
        gitea/gitea:latest
fi

# Wait for Gitea to be ready
echo "==> Waiting for Gitea..."
for i in {1..30}; do
    if curl -s "${GITEA_URL}/api/v1/version" > /dev/null 2>&1; then
        echo "    Gitea ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "    ERROR: Gitea failed to start"
        exit 1
    fi
    sleep 1
done

# Create admin user (ignore error if already exists)
echo "==> Ensuring admin user exists..."
docker exec --user git "${CONTAINER_NAME}" gitea admin user create \
    --username "${ADMIN_USER}" \
    --password "${ADMIN_PASSWORD}" \
    --email "${ADMIN_EMAIL}" \
    --admin 2>/dev/null || echo "    (admin user already exists)"

# Write API .env
echo "==> Writing .env files..."
cat > "${ROOT_DIR}/packages/api/.env" << EOF
API_PORT=${API_PORT}
GITEA_URL=${GITEA_URL}
GITEA_ADMIN_USER=${ADMIN_USER}
GITEA_ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF

# Write root .env for CLI
cat > "${ROOT_DIR}/.env" << EOF
REGRESSIONPROOF_API_URL=http://localhost:${API_PORT}
EOF

echo "==> Infrastructure ready"
echo "    Gitea:  ${GITEA_URL} (${ADMIN_USER}/${ADMIN_PASSWORD})"
echo "    API:    http://localhost:${API_PORT}"
