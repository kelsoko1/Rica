#!/bin/bash

# Rica Services Fix Script
# This script fixes common issues with Rica services

echo "================================================"
echo "Rica Services Fix Script"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print step
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Check Docker
print_step "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker is installed"
echo ""

# Step 2: Check Docker Compose
print_step "Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi
print_success "Docker Compose is available"
echo ""

# Step 3: Create network if it doesn't exist
print_step "Checking rica-network..."
if ! docker network ls | grep -q "rica-network"; then
    print_warning "rica-network does not exist, creating..."
    docker network create rica-network
    print_success "rica-network created"
else
    print_success "rica-network exists"
fi
echo ""

# Step 4: Fix unhealthy Ollama
print_step "Checking Ollama service..."
if docker ps | grep -q "ollama"; then
    health=$(docker inspect --format='{{.State.Health.Status}}' ollama 2>/dev/null)
    if [ "$health" == "unhealthy" ]; then
        print_warning "Ollama is unhealthy, restarting..."
        docker restart ollama
        sleep 10
        print_success "Ollama restarted"
    else
        print_success "Ollama is healthy"
    fi
else
    print_warning "Ollama is not running"
fi
echo ""

# Step 5: Fix unhealthy Activepieces
print_step "Checking Activepieces service..."
if docker ps | grep -q "activepieces"; then
    health=$(docker inspect --format='{{.State.Health.Status}}' activepieces 2>/dev/null)
    if [ "$health" == "unhealthy" ]; then
        print_warning "Activepieces is unhealthy, restarting..."
        docker restart activepieces
        sleep 10
        print_success "Activepieces restarted"
    else
        print_success "Activepieces is healthy"
    fi
else
    print_warning "Activepieces is not running"
fi
echo ""

# Step 6: Check if Rica-UI is running
print_step "Checking Rica-UI..."
if ! docker ps | grep -q "rica-ui"; then
    print_warning "Rica-UI is not running"
    echo "   To start Rica-UI, you need to:"
    echo "   1. Stop rica-landing if it's using port 3000"
    echo "   2. Run: docker-compose -f docker-compose.rica-ui.yml up -d"
else
    print_success "Rica-UI is running"
fi
echo ""

# Step 7: Check if Rica-API is running
print_step "Checking Rica-API..."
if ! docker ps | grep -q "rica-api"; then
    print_warning "Rica-API is not running"
    echo "   To start Rica-API:"
    echo "   1. Navigate to rica-api directory"
    echo "   2. Run: npm install"
    echo "   3. Run: npm start"
    echo "   Or build and run with Docker"
else
    print_success "Rica-API is running"
fi
echo ""

# Step 8: Check port conflicts
print_step "Checking for port conflicts..."
if docker ps | grep -q "rica-landing.*3000"; then
    print_warning "Port 3000 is being used by rica-landing"
    echo "   This port should be used by rica-ui"
    echo "   Consider stopping rica-landing or changing its port"
fi
echo ""

# Step 9: Wait for services to become healthy
print_step "Waiting for services to become healthy (30 seconds)..."
sleep 30
echo ""

# Step 10: Final status check
print_step "Final Status Check:"
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "================================================"
echo "Fix Script Complete"
echo "================================================"
echo ""
echo "Next Steps:"
echo "1. Run: ./check-rica-status.sh to verify all services"
echo "2. Check logs for any remaining issues: docker logs <container-name>"
echo "3. If services are still unhealthy, check their specific logs"
echo ""
echo "Service URLs:"
echo "  - Rica Landing: http://localhost:3000"
echo "  - Activepieces: http://localhost:2020"
echo "  - Code Server: http://localhost:2021"
echo "  - Ollama: http://localhost:2022"
echo ""
