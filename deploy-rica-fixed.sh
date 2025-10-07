#!/bin/bash

# Rica Complete Deployment Script
# This script ensures all services are properly configured and running

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
echo "Rica Complete Deployment Script"
echo "================================================"
echo ""

# Step 1: Check prerequisites
print_step "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker is installed"

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi
print_success "Docker Compose is available"

echo ""

# Step 2: Create network if it doesn't exist
print_step "Setting up Docker network..."
if ! docker network ls | grep -q "rica-network"; then
    docker network create rica-network
    print_success "Created rica-network"
else
    print_success "rica-network already exists"
fi

echo ""

# Step 3: Stop any conflicting services
print_step "Stopping any conflicting services..."
docker stop rica-landing 2>/dev/null || true
docker stop rica-ui 2>/dev/null || true
docker stop rica-api 2>/dev/null || true
print_success "Conflicting services stopped"

echo ""

# Step 4: Build images
print_step "Building Docker images..."
docker-compose -f docker-compose.master.yml build --no-cache
print_success "Images built successfully"

echo ""

# Step 5: Start services
print_step "Starting all Rica services..."
docker-compose -f docker-compose.master.yml up -d

echo ""

# Step 6: Wait for services to initialize
print_step "Waiting for services to initialize (60 seconds)..."
sleep 60

echo ""

# Step 7: Check service health
print_step "Checking service health..."

check_service() {
    local name=$1
    local url=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        print_success "$name is healthy"
        return 0
    else
        print_warning "$name is not responding yet"
        return 1
    fi
}

# Check each service
check_service "Rica UI" "http://localhost:3030"
check_service "Rica API" "http://localhost:3001/health"
check_service "Rica Landing" "http://localhost:3000"
check_service "Activepieces" "http://localhost:2020"
check_service "Code Server" "http://localhost:2021"
check_service "Ollama" "http://localhost:2022/api/tags"

echo ""

# Step 8: Display container status
print_step "Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "rica|activepieces|code-server|ollama|postgres|redis"

echo ""

# Step 9: Check for unhealthy containers
print_step "Checking for unhealthy containers..."
unhealthy=$(docker ps --filter "health=unhealthy" --format "{{.Names}}")
if [ -z "$unhealthy" ]; then
    print_success "All containers are healthy"
else
    print_warning "Unhealthy containers found: $unhealthy"
    echo "   Attempting to restart unhealthy containers..."
    for container in $unhealthy; do
        docker restart "$container"
        print_success "Restarted $container"
    done
fi

echo ""

# Step 10: Display access URLs
print_step "Service Access URLs:"
echo ""
echo "  Core Services:"
echo "  - Rica UI:        http://localhost:3030"
echo "  - Rica API:       http://localhost:3001"
echo "  - Rica Landing:   http://localhost:3000"
echo ""
echo "  Headless Servers:"
echo "  - Activepieces:   http://localhost:2020"
echo "  - Code Server:    http://localhost:2021"
echo "  - Ollama:         http://localhost:2022"
echo ""

# Step 11: Display logs location
print_step "Logs:"
echo "  View logs with: docker logs <container-name>"
echo "  Follow logs with: docker logs -f <container-name>"
echo ""

# Step 12: Create test script
print_step "Creating test script..."
cat > test-rica-services.sh << 'EOF'
#!/bin/bash

echo "Testing Rica Services..."
echo ""

# Test function
test_service() {
    local name=$1
    local url=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo "✓ $name"
    else
        echo "✗ $name"
    fi
}

test_service "Rica UI (3030)" "http://localhost:3030"
test_service "Rica API (3001)" "http://localhost:3001/health"
test_service "Rica Landing (3000)" "http://localhost:3000"
test_service "Activepieces (2020)" "http://localhost:2020"
test_service "Code Server (2021)" "http://localhost:2021"
test_service "Ollama (2022)" "http://localhost:2022/api/tags"

echo ""
echo "Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "rica|activepieces|code-server|ollama"
EOF

chmod +x test-rica-services.sh
print_success "Test script created: ./test-rica-services.sh"

echo ""

# Step 13: Final status
echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo ""
echo "Next Steps:"
echo "  1. Access Rica UI at http://localhost:3030"
echo "  2. Run ./test-rica-services.sh to verify all services"
echo "  3. Check logs if any service is not responding"
echo ""
echo "Useful Commands:"
echo "  - View all containers: docker ps"
echo "  - View logs: docker logs <container-name>"
echo "  - Restart service: docker restart <container-name>"
echo "  - Stop all: docker-compose -f docker-compose.master.yml down"
echo ""
