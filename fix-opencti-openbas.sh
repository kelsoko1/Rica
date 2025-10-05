#!/bin/bash

echo "=== Fixing OpenCTI and OpenBAS ==="

# Stop Nginx first (it's holding ports 2020-2023)
echo "Stopping Nginx..."
sudo systemctl stop nginx

# Stop all existing containers
echo "Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null

# Remove problematic containers
echo "Removing old containers..."
docker rm opencti openbas 2>/dev/null

# Start OpenCTI with docker-compose (creates proper network)
echo "Starting OpenCTI..."
docker-compose -f docker-compose.opencti.yml up -d

# Wait for OpenCTI dependencies to be ready
echo "Waiting for OpenCTI dependencies..."
sleep 30

# Check OpenCTI status
echo "Checking OpenCTI..."
docker logs opencti --tail 20

# Start OpenBAS with docker-compose
echo "Starting OpenBAS..."
docker-compose -f docker-compose.openbas.yml up -d

# Wait for OpenBAS dependencies
echo "Waiting for OpenBAS dependencies..."
sleep 30

# Check OpenBAS status
echo "Checking OpenBAS..."
docker logs openbas --tail 20

# Start Activepieces
echo "Starting Activepieces..."
docker-compose -f docker-compose.activepieces.yml up -d

# Start Code Server and Ollama
echo "Starting Code Server and Ollama..."
docker start code-server ollama 2>/dev/null || {
    docker run -d --name code-server -p 8080:8080 -e PASSWORD=Code@123 codercom/code-server:latest
    docker run -d --name ollama -p 2024:11434 ollama/ollama:latest
}

# Wait for everything to start
sleep 20

echo ""
echo "=== Service Status ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== Starting Nginx ==="
sudo systemctl start nginx
sleep 5

echo ""
echo "=== Testing Services ==="
echo "OpenCTI (2020):"
curl -I http://localhost:2020 2>&1 | head -1
echo "OpenBAS (2021):"
curl -I http://localhost:2021 2>&1 | head -1
echo "Activepieces (2022):"
curl -I http://localhost:2022 2>&1 | head -1
echo "Code Server (2023):"
curl -I http://localhost:2023 2>&1 | head -1
echo "Ollama (2024):"
curl -I http://localhost:2024 2>&1 | head -1
echo "Ollama via Nginx (2025):"
curl -I http://localhost:2025 2>&1 | head -1
