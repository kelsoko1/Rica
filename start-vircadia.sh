#!/bin/bash
# Script to start the Vircadia server
# This script starts the Vircadia server using Docker Compose

echo "======================================================"
echo "Rica - Vircadia Metaverse Server"
echo "======================================================"
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running."
    echo "Please start Docker Desktop or Docker Engine and try again."
    exit 1
fi

# Check if rica-network exists, create if not
if ! docker network inspect rica-network > /dev/null 2>&1; then
    echo "Creating rica-network..."
    if ! docker network create --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1 rica-network; then
        echo "Error: Failed to create rica-network."
        exit 1
    fi
    echo "Rica network created successfully."
fi

# Start Vircadia server
echo "Starting Vircadia server..."
docker-compose -f docker-compose.vircadia.yml up -d

if [ $? -ne 0 ]; then
    echo "Error: Failed to start Vircadia server."
    exit 1
fi

echo
echo "Vircadia server started successfully!"
echo
echo "You can access Vircadia at:"
echo "http://localhost:2023"
echo
echo "To view logs:"
echo "docker-compose -f docker-compose.vircadia.yml logs -f"
echo
echo "To stop the server:"
echo "docker-compose -f docker-compose.vircadia.yml down"
echo
echo "======================================================"
