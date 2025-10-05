#!/bin/bash

echo "Rica Headless Server Integration Update Script"
echo "============================================"
echo
echo "This script will update the Docker Compose files to ensure proper integration"
echo "between the Rica UI and the headless servers."
echo

# Check if the required files exist
if [ ! -f "docker-compose.master.yml" ]; then
    echo "ERROR: docker-compose.master.yml not found."
    echo "Please make sure you're running this script from the Rica root directory."
    exit 1
fi

if [ ! -f "docker-compose.headless-servers.yml" ]; then
    echo "ERROR: docker-compose.headless-servers.yml not found."
    echo "Please make sure you're running this script from the Rica root directory."
    exit 1
fi

echo "Updating Docker Compose files..."

# Add network configuration to ensure all services can communicate
sed -i 's/networks:\s*rica-network:\s*driver: bridge/networks:\n  rica-network:\n    name: rica-network\n    driver: bridge/g' docker-compose.rica-ui.yml
sed -i 's/networks:\s*rica-network:\s*driver: bridge/networks:\n  rica-network:\n    name: rica-network\n    driver: bridge/g' docker-compose.headless-servers.yml
sed -i 's/networks:\s*rica-network:\s*driver: bridge/networks:\n  rica-network:\n    name: rica-network\n    driver: bridge/g' docker-compose.master.yml

echo
echo "Updating Nginx configuration..."

# Create a directory for Nginx configuration if it doesn't exist
if [ ! -d "nginx" ]; then
    mkdir -p nginx
    echo "Created nginx directory"
fi

if [ ! -d "nginx/conf.d" ]; then
    mkdir -p nginx/conf.d
    echo "Created nginx/conf.d directory"
fi

# Create a CORS configuration file for Nginx
echo "Creating CORS configuration for Nginx..."
cat > nginx/conf.d/cors.conf << 'EOF'
# CORS configuration for Rica headless servers

# Allow CORS from Rica UI
add_header 'Access-Control-Allow-Origin' 'http://localhost:3000' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;

# Handle preflight requests
if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' 'http://localhost:3000' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Max-Age' 1728000;
    add_header 'Content-Type' 'text/plain; charset=utf-8';
    add_header 'Content-Length' 0;
    return 204;
}
EOF

echo
echo "Updating headless-servers.conf..."

# Update the headless-servers.conf to include the CORS configuration
sed -i 's/# Security headers/# Security headers\n    include \/etc\/nginx\/conf.d\/cors.conf;/g' headless-servers.conf

echo
echo "Creating environment file for Rica UI..."

# Create .env file for Rica UI if it doesn't exist
if [ ! -f "rica-ui/.env" ]; then
    cat > rica-ui/.env << 'EOF'
# Rica UI Environment Variables
REACT_APP_FABRIC_URL=http://localhost:2020
REACT_APP_SIMS_URL=http://localhost:2021
REACT_APP_AUTO_URL=http://localhost:2022
REACT_APP_CODE_SERVER_URL=http://localhost:2023
EOF
    echo "Created rica-ui/.env file"
fi

echo
echo "Update complete."
echo
echo "The following changes have been made:"
echo "1. Updated Docker Compose network configuration for proper service communication"
echo "2. Created CORS configuration for Nginx to allow cross-origin requests"
echo "3. Updated headless-servers.conf to include the CORS configuration"
echo "4. Created environment file for Rica UI with headless server URLs"
echo
echo "You should rebuild the Rica UI for the changes to take effect:"
echo "  cd rica-ui"
echo "  npm run build"
echo
echo "Then restart the services:"
echo "  ./start-rica-complete.sh all"
echo
