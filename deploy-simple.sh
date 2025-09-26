#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Simple Rica Deployment ===${NC}"
echo -e "This script will set up Rica with essential services\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing...${NC}"
    DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
    mkdir -p $DOCKER_CONFIG/cli-plugins
    curl -SL https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
    chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file with default values...${NC}"
    cat > .env <<EOL
# Rica Configuration
API_KEY=$(openssl rand -hex 32)
DEEPSEEK_API_KEY=

# Service Ports
RICA_UI_PORT=3000
RICA_API_PORT=3001
OLLAMA_PORT=11434

# Ollama Configuration
OLLAMA_MODEL=deepseek-coder:latest
EOL
    echo -e "${GREEN}Created .env file with secure random values. Please review and update as needed.${NC}"
fi

# Load environment variables
set -a
source .env
set +a

# Function to start services
start_services() {
    echo -e "${GREEN}Starting Rica services...${NC}"
    
    # Create required directories
    mkdir -p nginx/conf.d
    
    # Copy Nginx config if it doesn't exist
    if [ ! -f nginx/nginx.conf ]; then
        echo -e "${YELLOW}Creating Nginx configuration...${NC}"
        mkdir -p nginx
        cp nginx.conf nginx/ 2>/dev/null || true
        cp rica.conf nginx/conf.d/ 2>/dev/null || true
    fi
    
    # Start services
    echo -e "${YELLOW}Starting containers...${NC}"
    docker-compose -f docker-compose.simple.yml up -d --build
    
    # Wait for services to be ready
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 5
    
    # Initialize Ollama with DeepSeek model
    echo -e "${YELLOW}Initializing Ollama model (this may take a while)...${NC}"
    docker exec -d ollama ollama pull ${OLLAMA_MODEL}
    
    echo -e "\n${GREEN}=== Deployment Complete ===${NC}"
    echo -e "Rica UI: http://localhost:3000"
    echo -e "Rica API: http://localhost:3001"
    echo -e "Ollama: http://localhost:11434"
    echo -e "\n${YELLOW}Note:${NC} To access the services, you may need to update your hosts file with:"
    echo -e "127.0.0.1   app.rica.local rica.local"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping Rica services...${NC}"
    docker-compose -f docker-compose.simple.yml down
}

# Function to view logs
view_logs() {
    echo -e "${YELLOW}Tailing logs... (Ctrl+C to exit)${NC}"
    docker-compose -f docker-compose.simple.yml logs -f
}

# Function to check status
check_status() {
    echo -e "${GREEN}=== Service Status ===${NC}"
    docker-compose -f docker-compose.simple.yml ps
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
