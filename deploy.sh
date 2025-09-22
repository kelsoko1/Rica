#!/bin/bash
# Rica Production Deployment Script

set -e

# Configuration
REGISTRY=${REGISTRY:-"localhost:5000"}
TAG=${TAG:-"latest"}
ENV=${ENV:-"production"}
NAMESPACE=${NAMESPACE:-"rica"}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Rica Production Deployment${NC}"
echo "Registry: $REGISTRY"
echo "Tag: $TAG"
echo "Environment: $ENV"
echo "Namespace: $NAMESPACE"
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Function to deploy with Docker Compose
deploy_docker_compose() {
    echo -e "${GREEN}Deploying with Docker Compose...${NC}"
    
    # Set environment variables
    export NODE_ENV=$ENV
    
    # Build and run
    docker-compose build
    docker-compose up -d
    
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo "Rica UI: http://localhost"
    echo "Rica API: http://localhost:3001"
}

# Function to deploy with Kubernetes
deploy_kubernetes() {
    echo -e "${GREEN}Deploying with Kubernetes...${NC}"
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}kubectl is not installed. Please install kubectl first.${NC}"
        exit 1
    }
    
    # Create namespace if it doesn't exist
    kubectl get namespace $NAMESPACE &> /dev/null || kubectl create namespace $NAMESPACE
    
    # Build and push Docker images
    echo -e "${YELLOW}Building and pushing Docker images...${NC}"
    docker build -t $REGISTRY/rica-api:$TAG ./rica-api
    docker build -t $REGISTRY/rica-ui:$TAG ./rica-ui
    docker push $REGISTRY/rica-api:$TAG
    docker push $REGISTRY/rica-ui:$TAG
    
    # Replace variables in Kubernetes manifests
    echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"
    sed -i "s|\${REGISTRY}|$REGISTRY|g" k8s/*.yaml
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/rica-config.yaml -n $NAMESPACE
    kubectl apply -f k8s/rica-api-deployment.yaml -n $NAMESPACE
    kubectl apply -f k8s/rica-ui-deployment.yaml -n $NAMESPACE
    
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo "Check the status with: kubectl get pods -n $NAMESPACE"
}

# Main deployment logic
if [ "$1" == "k8s" ]; then
    deploy_kubernetes
else
    deploy_docker_compose
fi
