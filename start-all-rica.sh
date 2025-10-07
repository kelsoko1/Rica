#!/bin/bash

# Simple script to start all Rica services
# Usage: ./start-all-rica.sh

echo "🚀 Starting Rica Services..."
echo ""

# Create network
docker network create rica-network 2>/dev/null || echo "✓ Network exists"

# Fix Rica API dependencies
echo "📦 Fixing Rica API dependencies..."
cd rica-api
if [ ! -d "node_modules" ]; then
    rm -f package-lock.json
    npm install
fi
cd ..

# Start using docker-compose
echo "🐳 Starting services with Docker Compose..."
docker-compose -f docker-compose.core-services.yml up -d --build

# Wait for services
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Show status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.core-services.yml ps

# Test services
echo ""
echo "🧪 Testing services..."
curl -s http://localhost:3001/health > /dev/null && echo "✓ Rica API (3001)" || echo "✗ Rica API (3001)"
curl -s http://localhost:3030 > /dev/null && echo "✓ Rica UI (3030)" || echo "✗ Rica UI (3030)"
curl -s http://localhost:3000 > /dev/null && echo "✓ Rica Landing (3000)" || echo "✗ Rica Landing (3000)"

echo ""
echo "✅ Done! Access your services:"
echo "   Rica UI:      http://localhost:3030"
echo "   Rica API:     http://localhost:3001"
echo "   Rica Landing: http://localhost:3000"
echo ""
echo "📝 View logs: docker-compose -f docker-compose.core-services.yml logs -f"
echo "🛑 Stop all:  docker-compose -f docker-compose.core-services.yml down"
echo ""
