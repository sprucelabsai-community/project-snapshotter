#!/bin/bash

# One-command dev environment setup
# Boots Gitea + creates admin user + starts API

set -e

CONTAINER_NAME="regressionproof-gitea-dev"
GITEA_PORT=3333
API_PORT=3000
GITEA_URL="http://localhost:${GITEA_PORT}"
ADMIN_USER="admin"
ADMIN_PASSWORD="devpassword123"
ADMIN_EMAIL="admin@localhost"

echo "🚀 Starting RegressionProof dev environment..."

# Check if Gitea container exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo "✅ Gitea already running at ${GITEA_URL}"
    else
        echo "▶️  Starting existing Gitea container..."
        docker start "${CONTAINER_NAME}"
    fi
else
    echo "📦 Creating Gitea container..."
    docker run -d \
        --name "${CONTAINER_NAME}" \
        -p "${GITEA_PORT}:3000" \
        -e GITEA__security__INSTALL_LOCK=true \
        -e GITEA__server__ROOT_URL="${GITEA_URL}" \
        -e GITEA__server__HTTP_PORT=3000 \
        gitea/gitea:latest
fi

# Wait for Gitea to be ready
echo "⏳ Waiting for Gitea..."
for i in {1..30}; do
    if curl -s "${GITEA_URL}/api/v1/version" > /dev/null 2>&1; then
        echo "✅ Gitea ready"
        break
    fi
    sleep 1
done

# Create admin user (ignore error if already exists)
echo "👤 Ensuring admin user exists..."
docker exec --user git "${CONTAINER_NAME}" gitea admin user create \
    --username "${ADMIN_USER}" \
    --password "${ADMIN_PASSWORD}" \
    --email "${ADMIN_EMAIL}" \
    --admin 2>/dev/null || echo "   (admin user already exists)"

# Write API .env
echo "📝 Configuring API..."
cat > packages/api/.env << EOF
API_PORT=${API_PORT}
GITEA_URL=${GITEA_URL}
GITEA_ADMIN_USER=${ADMIN_USER}
GITEA_ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF

# Write CLI .env
cat > packages/cli/.env << EOF
REGRESSIONPROOF_API_URL=http://localhost:${API_PORT}
EOF

echo ""
echo "✅ Dev environment ready!"
echo ""
echo "   Gitea:  ${GITEA_URL} (${ADMIN_USER}/${ADMIN_PASSWORD})"
echo "   API:    http://localhost:${API_PORT}"
echo ""
echo "Starting API server..."
echo ""

# Start the API
cd packages/api && yarn serve
