#!/bin/bash

# Fix All Dependencies and Start Rica Services
# This script fixes package-lock.json issues in all projects and starts services

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

print_header "Fix All Dependencies and Start Rica"

# Step 1: Check Node.js
print_step "Step 1/6: Checking Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION is installed"

# Step 2: Fix Rica API dependencies
print_header "Fixing Rica API Dependencies"
cd rica-api
print_step "Cleaning old dependencies..."
rm -rf node_modules package-lock.json
print_success "Cleaned"

print_step "Installing fresh dependencies..."
npm install
print_success "Rica API dependencies installed"
cd ..

# Step 3: Fix Rica UI dependencies
print_header "Fixing Rica UI Dependencies"
cd rica-ui
print_step "Cleaning old dependencies..."
rm -rf node_modules package-lock.json
print_success "Cleaned"

print_step "Installing fresh dependencies..."
npm install
print_success "Rica UI dependencies installed"
cd ..

# Step 4: Fix Rica Landing dependencies
print_header "Fixing Rica Landing Dependencies"
cd rica-landing
print_step "Cleaning old dependencies..."
rm -rf node_modules package-lock.json
print_success "Cleaned"

print_step "Installing fresh dependencies..."
npm install
print_success "Rica Landing dependencies installed"
cd ..

# Step 5: Create Docker network
print_header "Setting Up Docker Network"
if docker network inspect rica-network &> /dev/null; then
    print_success "rica-network already exists"
else
    docker network create rica-network
    print_success "rica-network created"
fi

# Step 6: Start services
print_header "Starting Rica Services"
print_step "Building and starting services..."
docker-compose -f docker-compose.core-services.yml up -d --build

print_success "Services started"

# Step 7: Wait for services
print_step "Waiting for services to initialize (45 seconds)..."
sleep 45

# Step 8: Check health
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

# Step 9: Show container status
print_header "Container Status"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "rica-ui|rica-api|rica-landing"

# Step 10: Final summary
print_header "Deployment Complete!"
echo ""
echo "✅ All dependencies fixed and services started!"
echo ""
echo "🌐 Access Your Services:"
echo "   Rica UI:      http://localhost:3030"
echo "   Rica API:     http://localhost:3001"
echo "   Rica Landing: http://localhost:3000"
echo ""
echo "📝 Useful Commands:"
echo "   View logs:    docker-compose -f docker-compose.core-services.yml logs -f"
echo "   Restart:      docker-compose -f docker-compose.core-services.yml restart"
echo "   Stop:         docker-compose -f docker-compose.core-services.yml down"
echo ""
echo "🔍 Check individual logs:"
echo "   docker logs -f rica-api"
echo "   docker logs -f rica-ui"
echo "   docker logs -f rica-landing"
echo ""

# Check if headless servers are running
if docker ps | grep -q "ollama"; then
    print_success "Ollama is running (http://localhost:2022)"
else
    print_warning "Ollama is not running"
fi

if docker ps | grep -q "activepieces"; then
    print_success "Activepieces is running (http://localhost:2020)"
else
    print_warning "Activepieces is not running"
fi

if docker ps | grep -q "code-server"; then
    print_success "Code Server is running (http://localhost:2021)"
else
    print_warning "Code Server is not running"
fi

echo ""
print_success "All done! Your Rica services are ready to use! 🚀"
echo ""
