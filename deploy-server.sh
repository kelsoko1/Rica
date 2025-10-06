#!/bin/bash

###############################################################################
# Rica Server Deployment Script
# Automates the deployment process for Rica on Ubuntu server
# Version: 1.0
# Date: October 6, 2025
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RICA_DIR="/var/www/rica"
DOMAIN=""
EMAIL=""

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root"
        exit 1
    fi
}

check_ubuntu() {
    if [[ ! -f /etc/lsb-release ]]; then
        print_error "This script is designed for Ubuntu"
        exit 1
    fi
}

###############################################################################
# Installation Functions
###############################################################################

install_docker() {
    print_header "Installing Docker"
    
    # Remove old versions
    sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Install dependencies
    sudo apt update
    sudo apt install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed"
}

install_docker_compose() {
    print_header "Installing Docker Compose"
    
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose installed"
}

install_nodejs() {
    print_header "Installing Node.js"
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Install PM2
    sudo npm install -g pm2 serve
    
    print_success "Node.js and PM2 installed"
}

install_nginx() {
    print_header "Installing Nginx"
    
    sudo apt install -y nginx
    sudo systemctl enable nginx
    
    print_success "Nginx installed"
}

install_certbot() {
    print_header "Installing Certbot"
    
    sudo apt install -y certbot python3-certbot-nginx
    
    print_success "Certbot installed"
}

###############################################################################
# Configuration Functions
###############################################################################

configure_firewall() {
    print_header "Configuring Firewall"
    
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 2020/tcp
    sudo ufw allow 2021/tcp
    sudo ufw allow 2022/tcp
    sudo ufw allow 3000/tcp
    sudo ufw allow 3001/tcp
    sudo ufw allow 3030/tcp
    
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

create_project_directory() {
    print_header "Creating Project Directory"
    
    sudo mkdir -p $RICA_DIR
    sudo chown -R $USER:$USER $RICA_DIR
    chmod -R 755 $RICA_DIR
    
    print_success "Project directory created: $RICA_DIR"
}

create_docker_network() {
    print_header "Creating Docker Network"
    
    docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1 2>/dev/null || print_warning "Network already exists"
    
    print_success "Docker network ready"
}

generate_secrets() {
    print_header "Generating Secrets"
    
    AP_API_KEY=$(openssl rand -hex 32)
    AP_ENCRYPTION_KEY=$(openssl rand -hex 32)
    AP_JWT_SECRET=$(openssl rand -hex 32)
    REDIS_PASSWORD=$(openssl rand -hex 32)
    
    print_success "Secrets generated"
}

create_env_files() {
    print_header "Creating Environment Files"
    
    # Main .env
    cat > $RICA_DIR/.env << EOF
# PostgreSQL
POSTGRES_PASSWORD=YourSecurePassword123!
POSTGRES_USER=rica
POSTGRES_DB=rica

# Activepieces
AP_API_KEY=$AP_API_KEY
AP_ENCRYPTION_KEY=$AP_ENCRYPTION_KEY
AP_JWT_SECRET=$AP_JWT_SECRET
AP_POSTGRES_PASSWORD=YourActivepiecesPassword123!
AP_FRONTEND_URL=http://$DOMAIN:2020

# Redis
REDIS_PASSWORD=$REDIS_PASSWORD

# Code Server
CODE_SERVER_PASSWORD=YourCodeServerPassword123!
CODE_SERVER_SUDO_PASSWORD=YourSudoPassword123!

# Ollama
OLLAMA_MODEL=deepseek-r1:1.5b

# Domain
DOMAIN=$DOMAIN
EOF

    print_success "Environment files created"
    print_warning "Please update passwords in $RICA_DIR/.env"
}

pull_docker_images() {
    print_header "Pulling Docker Images"
    
    docker pull nginx:alpine
    docker pull postgres:15-alpine
    docker pull redis:7-alpine
    docker pull activepieces/activepieces:latest
    docker pull codercom/code-server:latest
    docker pull ollama/ollama:latest
    
    print_success "Docker images pulled"
}

start_docker_services() {
    print_header "Starting Docker Services"
    
    cd $RICA_DIR
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Docker services started"
}

initialize_ollama() {
    print_header "Initializing Ollama"
    
    print_info "Waiting for Ollama to start..."
    sleep 10
    
    docker exec ollama ollama pull deepseek-r1:1.5b
    
    print_success "Ollama model downloaded"
}

setup_ssl() {
    print_header "Setting up SSL Certificates"
    
    if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
        print_warning "Domain or email not set. Skipping SSL setup."
        print_info "Run: sudo certbot --nginx -d $DOMAIN"
        return
    fi
    
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
    
    print_success "SSL certificates obtained"
}

create_systemd_service() {
    print_header "Creating Systemd Service"
    
    sudo tee /etc/systemd/system/rica.service > /dev/null << EOF
[Unit]
Description=Rica Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$RICA_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=$USER

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable rica.service
    
    print_success "Systemd service created"
}

###############################################################################
# Main Deployment Flow
###############################################################################

main() {
    print_header "Rica Server Deployment"
    
    # Checks
    check_root
    check_ubuntu
    
    # Get configuration
    read -p "Enter your domain name (e.g., rica.example.com): " DOMAIN
    read -p "Enter your email for SSL certificates: " EMAIL
    
    # Update system
    print_header "Updating System"
    sudo apt update
    sudo apt upgrade -y
    print_success "System updated"
    
    # Install components
    install_docker
    install_docker_compose
    install_nodejs
    install_nginx
    install_certbot
    
    # Configure system
    configure_firewall
    create_project_directory
    create_docker_network
    
    # Setup Rica
    generate_secrets
    create_env_files
    
    print_warning "Please upload your Rica project files to: $RICA_DIR"
    read -p "Press Enter when files are uploaded..."
    
    # Deploy
    pull_docker_images
    start_docker_services
    initialize_ollama
    create_systemd_service
    
    # SSL (optional)
    read -p "Setup SSL certificates now? (y/n): " setup_ssl_now
    if [ "$setup_ssl_now" = "y" ]; then
        setup_ssl
    fi
    
    # Summary
    print_header "Deployment Complete!"
    print_success "Rica is now deployed"
    echo ""
    print_info "Access your application at:"
    echo "  - Main App: http://$DOMAIN"
    echo "  - Activepieces: http://$DOMAIN:2020"
    echo "  - Code Server: http://$DOMAIN:2021"
    echo "  - Ollama: http://$DOMAIN:2022"
    echo ""
    print_warning "Next steps:"
    echo "  1. Update passwords in $RICA_DIR/.env"
    echo "  2. Build and start Node.js apps (rica-ui, rica-landing)"
    echo "  3. Configure Nginx reverse proxy"
    echo "  4. Setup SSL if not done"
    echo "  5. Test all services"
    echo ""
    print_info "Useful commands:"
    echo "  - Check services: docker-compose ps"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Restart: sudo systemctl restart rica"
    echo ""
}

# Run main function
main "$@"
