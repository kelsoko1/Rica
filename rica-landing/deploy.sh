#!/bin/bash
# Rica Landing Deployment Script

# Exit on error
set -e

# Display help message
show_help() {
  echo "Rica Landing Deployment Script"
  echo "Usage: ./deploy.sh [options]"
  echo ""
  echo "Options:"
  echo "  --firebase    Deploy to Firebase Hosting"
  echo "  --docker      Deploy using Docker"
  echo "  --both        Deploy to both Firebase and Docker"
  echo "  --help        Display this help message"
  echo ""
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
  show_help
  exit 1
fi

# Parse arguments
DEPLOY_FIREBASE=false
DEPLOY_DOCKER=false

for arg in "$@"; do
  case $arg in
    --firebase)
      DEPLOY_FIREBASE=true
      shift
      ;;
    --docker)
      DEPLOY_DOCKER=true
      shift
      ;;
    --both)
      DEPLOY_FIREBASE=true
      DEPLOY_DOCKER=true
      shift
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      show_help
      exit 1
      ;;
  esac
done

# Build the application
echo "Building Rica Landing application..."
npm run build

# Deploy to Firebase if requested
if [ "$DEPLOY_FIREBASE" = true ]; then
  echo "Deploying to Firebase Hosting..."
  firebase deploy --only hosting
fi

# Deploy using Docker if requested
if [ "$DEPLOY_DOCKER" = true ]; then
  echo "Deploying using Docker..."
  docker-compose build
  docker-compose up -d
fi

echo "Deployment completed successfully!"
