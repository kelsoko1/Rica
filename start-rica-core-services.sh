#!/bin/bash

# Start Rica Core Services Script
# This script starts Rica UI (3030), Rica Landing (3000), and Rica API (3001)

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo ""
}

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

print_header "Rica Core Services Startup"

# Step 1: Check prerequisites
print_step "Step 1/8: Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker is installed"

if ! command -v node &> /dev/null; then
    print_warning "Node.js not found (needed for local API development)"
else
    NODE_VERSION=$(node --version)
    print_success "Node.js $NODE_VERSION is installed"
fi

# Step 2: Create network
print_step "Step 2/8: Setting up Docker network..."
if docker network inspect rica-network &> /dev/null; then
    print_success "rica-network already exists"
else
    docker network create rica-network
    print_success "rica-network created"
fi

# Step 3: Stop any conflicting services
print_step "Step 3/8: Stopping conflicting services..."
docker stop rica-ui rica-api rica-landing 2>/dev/null || true
print_success "Stopped any conflicting services"

# Step 4: Fix Rica API dependencies
print_step "Step 4/8: Fixing Rica API dependencies..."
cd rica-api

if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    print_warning "Dependencies not installed, installing now..."
    rm -rf node_modules package-lock.json
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

cd ..

# Step 5: Build Rica API Docker image
print_step "Step 5/8: Building Rica API Docker image..."
docker build -t rica-api:latest ./rica-api
print_success "Rica API image built"

# Step 6: Build Rica UI Docker image
print_step "Step 6/8: Building Rica UI Docker image..."
docker build -t rica-ui:latest ./rica-ui
print_success "Rica UI image built"

# Step 7: Build Rica Landing Docker image
print_step "Step 7/8: Building Rica Landing Docker image..."
docker build -t rica-landing:latest ./rica-landing
print_success "Rica Landing image built"

# Step 8: Start all core services
print_step "Step 8/8: Starting all core services..."

# Start Rica API
docker run -d \
  --name rica-api \
  --network rica-network \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e OLLAMA_URL=http://ollama:11434 \
  -e OLLAMA_EXTERNAL_URL=http://localhost:2022 \
  -e API_KEY=${API_KEY:-changeme_in_production} \
  -e ACTIVEPIECES_URL=http://activepieces:80 \
  --restart unless-stopped \
  rica-api:latest

print_success "Rica API started on port 3001"

# Wait for API to be ready
sleep 5

# Start Rica UI
docker run -d \
  --name rica-ui \
  --network rica-network \
  -p 3030:80 \
  -e NODE_ENV=production \
  -e REACT_APP_API_URL=http://localhost:3001 \
  -e REACT_APP_RICA_UI_PORT=3030 \
  --restart unless-stopped \
  rica-ui:latest

print_success "Rica UI started on port 3030"

# Start Rica Landing
docker run -d \
  --name rica-landing \
  --network rica-network \
  -p 3000:80 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  rica-landing:latest

print_success "Rica Landing started on port 3000"

# Step 9: Wait for services to initialize
print_step "Waiting for services to initialize (30 seconds)..."
sleep 30

# Step 10: Check service health
print_header "Service Health Check"

check_service() {
    local name=$1
    local url=$2
    local port=$3
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        print_success "$name is healthy (http://localhost:$port)"
        return 0
    else
        print_warning "$name is not responding yet (http://localhost:$port)"
        return 1
    fi
}

check_service "Rica API" "http://localhost:3001/health" "3001"
check_service "Rica UI" "http://localhost:3030" "3030"
check_service "Rica Landing" "http://localhost:3000" "3000"

# Step 11: Display container status
print_header "Container Status"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "rica-ui|rica-api|rica-landing"

# Step 12: Display access information
print_header "Access Your Services"
echo ""
echo "  🎨 Rica UI (Main Dashboard):"
echo "     http://localhost:3030"
echo ""
echo "  🔧 Rica API (Backend):"
echo "     http://localhost:3001"
echo "     Health: http://localhost:3001/health"
echo ""
echo "  💳 Rica Landing (Payment Portal):"
echo "     http://localhost:3000"
echo ""

# Step 13: Display logs command
print_header "Useful Commands"
echo ""
echo "  View logs:"
echo "    docker logs -f rica-ui"
echo "    docker logs -f rica-api"
echo "    docker logs -f rica-landing"
echo ""
echo "  Restart services:"
echo "    docker restart rica-ui"
echo "    docker restart rica-api"
echo "    docker restart rica-landing"
echo ""
echo "  Stop services:"
echo "    docker stop rica-ui rica-api rica-landing"
echo ""
echo "  Remove services:"
echo "    docker rm -f rica-ui rica-api rica-landing"
echo ""

# Step 14: Check if headless servers are running
print_header "Headless Servers Status"
if docker ps | grep -q "activepieces"; then
    print_success "Activepieces is running (http://localhost:2020)"
else
    print_warning "Activepieces is not running"
    echo "    Start with: docker-compose -f docker-compose.activepieces.yml up -d"
fi

if docker ps | grep -q "code-server"; then
    print_success "Code Server is running (http://localhost:2021)"
else
    print_warning "Code Server is not running"
    echo "    Start with: docker-compose -f docker-compose.code-server.yml up -d"
fi

if docker ps | grep -q "ollama"; then
    print_success "Ollama is running (http://localhost:2022)"
else
    print_warning "Ollama is not running"
    echo "    Start with: docker-compose -f docker-compose.ollama.yml up -d"
fi

# Final summary
print_header "Startup Complete!"
echo ""
echo "✅ All core services are now running!"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:3030 in your browser (Rica UI)"
echo "  2. Check http://localhost:3001/health (Rica API)"
echo "  3. Visit http://localhost:3000 (Rica Landing)"
echo ""
echo "If any service is not responding:"
echo "  - Check logs: docker logs <service-name>"
echo "  - Restart: docker restart <service-name>"
echo ""
