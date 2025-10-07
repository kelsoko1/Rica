#!/bin/bash

echo "========================================"
echo "Rica Network Setup"
echo "========================================"
echo ""

echo "Checking if Docker is running..."
if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "Docker is running!"
echo ""

echo "Creating Rica network..."
if docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1 2>/dev/null; then
    echo "SUCCESS: Network 'rica-network' created successfully!"
    echo ""
    echo "Network Details:"
    echo "  Name: rica-network"
    echo "  Driver: bridge"
    echo "  Subnet: 172.25.0.0/16"
    echo "  Gateway: 172.25.0.1"
else
    echo "INFO: Network 'rica-network' already exists."
    echo "This is fine - the network is ready to use!"
fi

echo ""
echo "Verifying network..."
if docker network ls | grep -q rica-network; then
    echo ""
    echo "========================================"
    echo "Network setup complete!"
    echo "You can now start Rica services with:"
    echo "  docker-compose up -d"
    echo "========================================"
else
    echo ""
    echo "ERROR: Network verification failed!"
    echo "Please check Docker logs for details."
    exit 1
fi

echo ""
