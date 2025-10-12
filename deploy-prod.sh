#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Rica Production Deployment ===${NC}"
echo -e "This script will set up Rica with all required services\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file with default values...${NC}"
    cat > .env <<EOL
# Rica Configuration
API_KEY=$(openssl rand -hex 32)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Service Ports
RICA_UI_PORT=80
RICA_API_PORT=3001
_PORT=4000
_ADMIN_PASSWORD=$(openssl rand -base64 32)
_ADMIN_TOKEN=$(openssl rand -hex 32)
POSTGRES_PORT=2024

# Database Credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -base64 32)
POSTGRES_DB=rica

# Replication Credentials
REPLICATION_USER=repl_user
REPLICATION_PASSWORD=$(openssl rand -base64 32)

# Redis Password
REDIS_PASSWORD=$(openssl rand -base64 32)

# MinIO Credentials
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)

# Firebase Admin Config (for sync service)
FIREBASE_ADMIN_CONFIG=$(cat firebase-admin-config.json | jq -c)
EOL
    echo -e "${GREEN}Created .env file with secure random values. Please review and update as needed.${NC}"
fi

# Load environment variables
set -a
source .env
set +a

# Function to check if a service is running
is_running() {
    docker ps --format '{{.Names}}' | grep -q "^$1$"
}

# Function to start services
start_services() {
    echo -e "${GREEN}Starting Rica services...${NC}"
    
    # Pull latest images
    echo -e "${YELLOW}Pulling latest Docker images...${NC}"
    docker-compose -f docker-compose.prod.yml pull
    
    # Start services
    echo -e "${YELLOW}Starting containers...${NC}"
    docker-compose -f docker-compose.prod.yml -f docker-compose.db-replication.yml up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 10
    
    # Initialize Ollama with DeepSeek model
    echo -e "${YELLOW}Initializing DeepSeek model...${NC}"
    docker exec -it ollama ollama pull deepseek-coder:latest
    
    echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
    echo -e "Rica UI: http://localhost:${RICA_UI_PORT:-80}"
    echo -e "Rica API: http://localhost:${RICA_API_PORT:-3001}"
    echo -e ": http://localhost:${_PORT:-4000}"
    echo -e "Code Server: http://localhost:8080"
    echo -e "\n${YELLOW}Initial credentials:${NC}"
    echo -e ": admin / ${_ADMIN_PASSWORD:-check .env}"
    echo -e "Code Server: coder / ChangeMeInProduction123!"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping Rica services...${NC}"
    docker-compose -f docker-compose.prod.yml down
}

# Function to view logs
view_logs() {
    echo -e "${YELLOW}Tailing logs... (Ctrl+C to exit)${NC}"
    docker-compose -f docker-compose.prod.yml logs -f
}

# Function to check status
check_status() {
    echo -e "${GREEN}=== Service Status ===${NC}"
    docker-compose -f docker-compose.prod.yml ps
}

# Main menu
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        start_services
        ;;
    status)
        check_status
        ;;
    logs)
        view_logs
        ;;
    *)
        echo -e "${GREEN}Usage: $0 [command]${NC}"
        echo "  start     - Start all services"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  status    - Show service status"
        echo "  logs      - View logs"
        exit 1
        ;;
esac

exit 0
