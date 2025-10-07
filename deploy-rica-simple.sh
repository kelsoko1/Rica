#!/bin/bash

# Rica Simple Deployment Script
# Deploys Rica services without building from source

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

echo "================================================"
echo "Rica Simple Deployment"
echo "================================================"
echo ""

# Step 1: Check Docker
print_step "Checking Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker is installed"

# Step 2: Create network
print_step "Creating Docker network..."
docker network create rica-network 2>/dev/null || print_success "Network already exists"

# Step 3: Stop conflicting services
print_step "Stopping conflicting services..."
docker stop rica-landing rica-ui rica-api 2>/dev/null || true
print_success "Stopped conflicting services"

# Step 4: Start headless servers (no build required)
print_step "Starting headless servers..."
docker-compose -f docker-compose.headless-servers.yml up -d
print_success "Headless servers started"

# Step 5: Wait for services
print_step "Waiting for services to initialize (30 seconds)..."
sleep 30

# Step 6: Check status
print_step "Checking service status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "activepieces|code-server|ollama|postgres|redis"

echo ""
print_step "Service URLs:"
echo "  - Activepieces: http://localhost:2020"
echo "  - Code Server: http://localhost:2021"
echo "  - Ollama: http://localhost:2022"
echo ""

# Step 7: Start Rica Landing (pre-built)
print_step "Starting Rica Landing..."
docker-compose -f docker-compose.prod.yml up -d
print_success "Rica Landing started on http://localhost:3000"

echo ""
print_step "Deployment Complete!"
echo ""
echo "Running Services:"
echo "  ✓ Activepieces (http://localhost:2020)"
echo "  ✓ Code Server (http://localhost:2021)"
echo "  ✓ Ollama (http://localhost:2022)"
echo "  ✓ Rica Landing (http://localhost:3000)"
echo ""
echo "To start Rica UI and API (requires building):"
echo "  1. cd rica-api && npm install && cd .."
echo "  2. docker-compose -f docker-compose.rica-ui.yml up -d"
echo ""
