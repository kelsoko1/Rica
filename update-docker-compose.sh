#!/bin/bash
# Script to update docker-compose.yml with the new version

echo "Updating docker-compose.yml with the new version that includes rica-landing..."

# Backup the current docker-compose.yml
if [ -f docker-compose.yml ]; then
  echo "Backing up current docker-compose.yml to docker-compose.yml.bak"
  cp docker-compose.yml docker-compose.yml.bak
fi

# Move the new docker-compose.yml into place
echo "Moving new docker-compose.yml into place"
mv docker-compose.yml.new docker-compose.yml

echo "Docker Compose file updated successfully!"
echo
echo "To deploy the updated configuration:"
echo "1. Run 'docker-compose build rica-landing' to build the landing page image"
echo "2. Run 'docker-compose up -d' to start or update the services"
echo
echo "For production deployment, use the deploy.sh script:"
echo "  ./deploy.sh [registry] [tag]"
echo
