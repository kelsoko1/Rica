#!/bin/bash
# Script to initialize PostgreSQL database for Rica authentication
# This script creates the necessary database and tables for user authentication

echo "=================================================="
echo "Rica Authentication Database Initialization"
echo "=================================================="
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running."
    echo "Please start Docker Desktop or Docker Engine and try again."
    exit 1
fi

# Check if PostgreSQL container is running
if ! docker ps | grep -q postgres; then
    echo "Starting PostgreSQL container..."
    docker-compose -f docker-compose.postgres.yml up -d

    if [ $? -ne 0 ]; then
        echo "Error: Failed to start PostgreSQL container."
        exit 1
    fi

    echo "PostgreSQL container started. Waiting for it to be ready..."
    sleep 10
fi

# Check if rica-network exists, create if not
if ! docker network inspect rica-network > /dev/null 2>&1; then
    echo "Creating rica-network..."
    docker network create --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1 rica-network
    echo "Rica network created successfully."
fi

# Create the rica_auth database if it doesn't exist
echo "Creating rica_auth database..."
docker exec postgres psql -U postgres -c "CREATE DATABASE rica_auth;" 2>/dev/null || echo "Database rica_auth already exists or creation failed"

# Run the database initialization
echo "Initializing authentication tables..."
docker exec postgres psql -U postgres -d rica_auth -f /docker-entrypoint-initdb.d/init-auth.sql 2>/dev/null || echo "Tables may already exist"

if [ $? -eq 0 ]; then
    echo "Database initialized successfully!"
    echo
    echo "You can now start the Rica API server:"
    echo "  npm start"
    echo
    echo "The API will be available at:"
    echo "  http://localhost:3001"
    echo "  Health check: http://localhost:3001/health"
    echo
else
    echo "Warning: Database initialization may have failed."
    echo "Please check the PostgreSQL container logs for details:"
    echo "  docker logs postgres"
fi

echo "=================================================="
