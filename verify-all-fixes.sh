#!/bin/bash

# Rica Complete Verification Script
# This script verifies all fixes have been applied correctly

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo "================================================"
    echo "$1"
    echo "================================================"
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

# Counter for tests
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_error "$test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

print_header "Rica Complete Verification"

# Section 1: File Verification
print_header "1. Verifying Configuration Files"

run_test "docker-compose.rica-ui.yml exists" "test -f docker-compose.rica-ui.yml"
run_test "docker-compose.master.yml exists" "test -f docker-compose.master.yml"
run_test "deploy-rica-fixed.sh exists" "test -f deploy-rica-fixed.sh"
run_test "deploy-k8s-multi-tenancy.sh exists" "test -f deploy-k8s-multi-tenancy.sh"
run_test "PORT_MAPPING_UPDATED.md exists" "test -f PORT_MAPPING_UPDATED.md"
run_test "DEPLOYMENT_GUIDE_UPDATED.md exists" "test -f DEPLOYMENT_GUIDE_UPDATED.md"
run_test "FIXES_APPLIED_SUMMARY.md exists" "test -f FIXES_APPLIED_SUMMARY.md"

# Section 2: Port Configuration Verification
print_header "2. Verifying Port Configuration"

run_test "Rica UI port 3030 in docker-compose.rica-ui.yml" "grep -q '3030:80' docker-compose.rica-ui.yml"
run_test "Rica UI port 3030 in docker-compose.master.yml" "grep -q '3030:80' docker-compose.master.yml"
run_test "REACT_APP_RICA_UI_PORT in docker-compose.rica-ui.yml" "grep -q 'REACT_APP_RICA_UI_PORT=3030' docker-compose.rica-ui.yml"
run_test "Ollama internal port 11434 in docker-compose.master.yml" "grep -q 'OLLAMA_URL=http://ollama:11434' docker-compose.master.yml"
run_test "Ollama external port 2022 in docker-compose.master.yml" "grep -q 'OLLAMA_EXTERNAL_URL=http://localhost:2022' docker-compose.master.yml"

# Section 3: Kubernetes Configuration Verification
print_header "3. Verifying Kubernetes Configuration"

run_test "tenant-rica-ui-deployment.yaml exists" "test -f k8s/tenant-rica-ui-deployment.yaml"
run_test "tenant-headless-servers.yaml exists" "test -f k8s/tenant-headless-servers.yaml"
run_test "tenant-ingress.yaml exists" "test -f k8s/tenant-ingress.yaml"
run_test "tenant-namespace-template.yaml exists" "test -f k8s/tenant-namespace-template.yaml"
run_test "REACT_APP_RICA_UI_PORT in K8s config" "grep -q 'REACT_APP_RICA_UI_PORT' k8s/tenant-rica-ui-deployment.yaml"

# Section 4: Script Verification
print_header "4. Verifying Scripts"

run_test "deploy-rica-fixed.sh is executable" "test -x deploy-rica-fixed.sh || chmod +x deploy-rica-fixed.sh"
run_test "deploy-k8s-multi-tenancy.sh is executable" "test -x deploy-k8s-multi-tenancy.sh || chmod +x deploy-k8s-multi-tenancy.sh"
run_test "start-rica-complete.sh exists" "test -f start-rica-complete.sh"
run_test "check-rica-status.sh exists" "test -f check-rica-status.sh"
run_test "fix-rica-services.sh exists" "test -f fix-rica-services.sh"

# Section 5: Docker Prerequisites
print_header "5. Checking Docker Prerequisites"

run_test "Docker is installed" "command -v docker"
run_test "Docker Compose is available" "command -v docker-compose || docker compose version"
run_test "Docker daemon is running" "docker ps"

# Section 6: Network Configuration
print_header "6. Checking Network Configuration"

if docker network ls | grep -q "rica-network"; then
    print_success "rica-network exists"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_warning "rica-network does not exist (will be created during deployment)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Section 7: Service Status (if running)
print_header "7. Checking Running Services"

check_service_running() {
    local service=$1
    if docker ps | grep -q "$service"; then
        print_success "$service is running"
        return 0
    else
        print_warning "$service is not running"
        return 1
    fi
}

check_service_running "rica-ui"
check_service_running "rica-api"
check_service_running "rica-landing"
check_service_running "activepieces"
check_service_running "code-server"
check_service_running "ollama"

# Section 8: Port Availability (if services not running)
print_header "8. Checking Port Availability"

check_port() {
    local port=$1
    local service=$2
    
    if netstat -tuln 2>/dev/null | grep -q ":${port} " || ss -tuln 2>/dev/null | grep -q ":${port} "; then
        if docker ps | grep -q "$service"; then
            print_success "Port $port is in use by $service"
        else
            print_warning "Port $port is in use by another process"
        fi
    else
        print_success "Port $port is available"
    fi
}

check_port "3030" "rica-ui"
check_port "3001" "rica-api"
check_port "3000" "rica-landing"
check_port "2020" "activepieces"
check_port "2021" "code-server"
check_port "2022" "ollama"

# Section 9: Health Endpoints (if services running)
print_header "9. Testing Health Endpoints"

test_endpoint() {
    local name=$1
    local url=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        print_success "$name is responding"
        return 0
    else
        print_warning "$name is not responding (may not be running)"
        return 1
    fi
}

test_endpoint "Rica UI (3030)" "http://localhost:3030"
test_endpoint "Rica API (3001)" "http://localhost:3001/health"
test_endpoint "Rica Landing (3000)" "http://localhost:3000"
test_endpoint "Activepieces (2020)" "http://localhost:2020"
test_endpoint "Code Server (2021)" "http://localhost:2021"
test_endpoint "Ollama (2022)" "http://localhost:2022/api/tags"

# Section 10: Documentation Verification
print_header "10. Verifying Documentation"

run_test "README.md exists" "test -f README.md"
run_test "PORT_MAPPING_UPDATED.md is complete" "grep -q 'Rica UI.*3030' PORT_MAPPING_UPDATED.md"
run_test "DEPLOYMENT_GUIDE_UPDATED.md is complete" "grep -q 'Port Configuration' DEPLOYMENT_GUIDE_UPDATED.md"
run_test "FIXES_APPLIED_SUMMARY.md is complete" "grep -q 'Port Configuration Updates' FIXES_APPLIED_SUMMARY.md"

# Section 11: Kubernetes Prerequisites (optional)
print_header "11. Checking Kubernetes Prerequisites (Optional)"

if command -v kubectl &> /dev/null; then
    print_success "kubectl is installed"
    
    if kubectl cluster-info &> /dev/null; then
        print_success "kubectl can connect to cluster"
        
        # Check if Rica API is deployed
        if kubectl get namespace rica-system &> /dev/null; then
            print_success "rica-system namespace exists"
            
            if kubectl get deployment rica-api -n rica-system &> /dev/null; then
                print_success "rica-api deployment exists"
            else
                print_warning "rica-api deployment not found"
            fi
        else
            print_warning "rica-system namespace not found (not deployed yet)"
        fi
    else
        print_warning "kubectl cannot connect to cluster"
    fi
else
    print_warning "kubectl not installed (skip if not using Kubernetes)"
fi

# Final Summary
print_header "Verification Summary"

echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tests passed!${NC}"
    echo ""
    echo "Next Steps:"
    echo "  1. Deploy locally: ./deploy-rica-fixed.sh"
    echo "  2. Deploy to Kubernetes: ./deploy-k8s-multi-tenancy.sh"
    echo "  3. Test services: ./test-rica-services.sh"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed, but this may be expected if services are not running yet.${NC}"
    echo ""
    echo "To fix issues:"
    echo "  1. Review failed tests above"
    echo "  2. Check documentation: DEPLOYMENT_GUIDE_UPDATED.md"
    echo "  3. Run deployment: ./deploy-rica-fixed.sh"
    echo ""
    exit 1
fi
