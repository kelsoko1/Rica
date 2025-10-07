#!/bin/bash

echo "Rica Headless Servers Setup Script"
echo "================================"
echo

echo "Creating required directories..."

if [ ! -d "nginx" ]; then
    mkdir -p nginx
    echo "Created nginx directory"
fi

if [ ! -d "nginx/conf.d" ]; then
    mkdir -p nginx/conf.d
    echo "Created nginx/conf.d directory"
fi

if [ ! -d "certs" ]; then
    mkdir -p certs
    echo "Created certs directory"
    echo "Note: You'll need to generate SSL certificates for production use"
fi

echo
echo "Copying configuration files..."

cp headless-servers.conf nginx/conf.d/headless-servers.conf
echo "Copied headless-servers.conf to nginx/conf.d/"

if [ ! -f "nginx/nginx.conf" ]; then
    cp nginx.conf nginx/nginx.conf
    echo "Copied nginx.conf to nginx/"
fi

if [ ! -f "nginx/ssl-dhparams.pem" ]; then
    echo "Creating dummy ssl-dhparams.pem file..."
    echo "# This is a placeholder file. Generate a proper dhparams file for production." > nginx/ssl-dhparams.pem
    echo "# Run: openssl dhparam -out ssl-dhparams.pem 2048" >> nginx/ssl-dhparams.pem
    echo "Created placeholder ssl-dhparams.pem"
fi

echo
echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed or not in PATH."
    echo "Please install Docker and Docker Compose before continuing."
    exit 1
fi

echo "Docker is installed."
echo
echo "Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed or not in PATH."
    echo "Please install Docker Compose before continuing."
    exit 1
fi

echo "Docker Compose is installed."
echo
echo "Making scripts executable..."
chmod +x start-headless-servers.sh
echo "Made start-headless-servers.sh executable"

echo
echo "Setup completed successfully."
echo
echo "Next steps:"
echo "1. Create a .env file with your secure passwords (see HEADLESS_SERVERS_README.md)"
echo "2. Run './start-headless-servers.sh all' to start all headless servers"
echo "3. Access the services at their respective ports (see HEADLESS_SERVERS_README.md)"
echo
echo "For more information, see HEADLESS_SERVERS_README.md"
