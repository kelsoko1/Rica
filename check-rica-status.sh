#!/bin/bash

# Rica Complete Status Check Script
# This script checks all Rica components and provides a detailed status report

echo "================================================"
echo "Rica Platform Status Check"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a service is running
check_service() {
    local service_name=$1
    local container_name=$2
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        local status=$(docker inspect --format='{{.State.Health.Status}}' ${container_name} 2>/dev/null)
        if [ "$status" == "healthy" ]; then
            echo -e "${GREEN}✓${NC} ${service_name}: Running (Healthy)"
            return 0
        elif [ "$status" == "unhealthy" ]; then
            echo -e "${YELLOW}⚠${NC} ${service_name}: Running (Unhealthy)"
            return 1
        else
            echo -e "${GREEN}✓${NC} ${service_name}: Running (No health check)"
            return 0
        fi
    else
        echo -e "${RED}✗${NC} ${service_name}: Not Running"
        return 2
    fi
}

# Function to check port availability
check_port() {
    local port=$1
    local service=$2
    
    if netstat -tuln 2>/dev/null | grep -q ":${port} " || ss -tuln 2>/dev/null | grep -q ":${port} "; then
        echo -e "${GREEN}✓${NC} Port ${port} (${service}): In Use"
        return 0
    else
        echo -e "${RED}✗${NC} Port ${port} (${service}): Available (Service not running)"
        return 1
    fi
}

echo "1. Docker Network Status"
echo "------------------------"
if docker network ls | grep -q "rica-network"; then
    echo -e "${GREEN}✓${NC} rica-network exists"
else
    echo -e "${RED}✗${NC} rica-network does not exist"
    echo "   Run: docker network create rica-network"
fi
echo ""

echo "2. Core Services Status"
echo "-----------------------"
check_service "Rica UI" "rica-ui"
check_service "Rica API" "rica-api"
check_service "Rica Landing" "rica-landing"
check_service "Nginx Proxy" "rica-nginx"
echo ""

echo "3. Headless Servers Status"
echo "--------------------------"
check_service "Activepieces" "activepieces"
check_service "Code Server" "code-server"
check_service "Ollama" "ollama"
echo ""

echo "4. Database Services Status"
echo "---------------------------"
check_service "PostgreSQL" "activepieces-postgres"
check_service "Redis" "activepieces-redis"
echo ""

echo "5. Port Status"
echo "--------------"
check_port "80" "Nginx HTTP"
check_port "443" "Nginx HTTPS"
check_port "3000" "Rica UI"
check_port "3001" "Rica API"
check_port "2020" "Activepieces"
check_port "2021" "Code Server"
check_port "2022" "Ollama"
echo ""

echo "6. Container Health Details"
echo "---------------------------"
echo "Checking unhealthy containers..."
for container in $(docker ps --format '{{.Names}}'); do
    health=$(docker inspect --format='{{.State.Health.Status}}' ${container} 2>/dev/null)
    if [ "$health" == "unhealthy" ]; then
        echo -e "${YELLOW}⚠${NC} ${container} is unhealthy"
        echo "   Last 10 log lines:"
        docker logs ${container} --tail 10 2>&1 | sed 's/^/   /'
        echo ""
    fi
done

echo "7. Disk Usage"
echo "-------------"
docker system df
echo ""

echo "8. Running Containers Summary"
echo "-----------------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "================================================"
echo "Status Check Complete"
echo "================================================"
echo ""
echo "Quick Actions:"
echo "  Start all services: docker-compose -f docker-compose.master.yml up -d"
echo "  Stop all services: docker-compose -f docker-compose.master.yml down"
echo "  View logs: docker logs <container-name>"
echo "  Restart unhealthy: docker restart <container-name>"
echo ""
