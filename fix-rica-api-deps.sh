#!/bin/bash

# Fix Rica API Dependencies Script
# This script fixes the package-lock.json sync issues

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

print_error() {
    echo -e "${RED}✗${NC} $1"
}

echo "================================================"
echo "Fix Rica API Dependencies"
echo "================================================"
echo ""

# Step 1: Check if Node.js is installed
print_step "Checking Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 18+ first"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION is installed"

# Step 2: Navigate to rica-api
print_step "Navigating to rica-api directory..."
cd rica-api || exit 1
print_success "In rica-api directory"

# Step 3: Backup old package-lock.json
print_step "Backing up package-lock.json..."
if [ -f "package-lock.json" ]; then
    cp package-lock.json package-lock.json.backup
    print_success "Backup created: package-lock.json.backup"
fi

# Step 4: Remove node_modules and package-lock.json
print_step "Cleaning old dependencies..."
rm -rf node_modules
rm -f package-lock.json
print_success "Cleaned node_modules and package-lock.json"

# Step 5: Install dependencies
print_step "Installing dependencies (this may take a few minutes)..."
npm install
print_success "Dependencies installed successfully"

# Step 6: Verify installation
print_step "Verifying installation..."
if [ -f "package-lock.json" ]; then
    print_success "New package-lock.json created"
else
    print_error "package-lock.json not created"
    exit 1
fi

if [ -d "node_modules" ]; then
    print_success "node_modules directory created"
else
    print_error "node_modules not created"
    exit 1
fi

# Step 7: Test the API
print_step "Testing API..."
if node index.js &> /dev/null & then
    API_PID=$!
    sleep 3
    
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        print_success "API is working correctly"
        kill $API_PID 2>/dev/null || true
    else
        print_error "API health check failed"
        kill $API_PID 2>/dev/null || true
    fi
else
    print_error "Failed to start API"
fi

echo ""
echo "================================================"
echo "Dependencies Fixed!"
echo "================================================"
echo ""
echo "Next Steps:"
echo "  1. Build Docker image: docker build -t rica-api ."
echo "  2. Or run locally: npm start"
echo "  3. Or deploy: cd .. && ./deploy-rica-fixed.sh"
echo ""
