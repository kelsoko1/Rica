#!/bin/bash

# Rica Platform - Quick Kubernetes Deployment
# One-command deployment to get everything running

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║   Rica Platform - Quick K8s Deployment        ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}This script will:${NC}"
echo "  1. Build Docker images"
echo "  2. Deploy to Kubernetes"
echo "  3. Wait for services to be ready"
echo "  4. Display access URLs"
echo ""
echo -e "${YELLOW}Estimated time: 5-10 minutes${NC}"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Set registry (change if using remote registry)
export REGISTRY="${REGISTRY:-localhost:5000}"

# Run the deployment script
echo -e "${GREEN}Starting deployment...${NC}"
echo ""

chmod +x deploy-to-k8s.sh
./deploy-to-k8s.sh

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║            Deployment Complete! 🎉             ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Get node IP
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
if [ -z "$NODE_IP" ]; then
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
fi

echo -e "${GREEN}Access your Rica platform:${NC}"
echo ""
echo "  Rica UI (Main):    http://${NODE_IP}:30030"
echo "  Rica Landing:      http://${NODE_IP}:30000"
echo "  Rica API:          http://${NODE_IP}:30001"
echo "  Activepieces:      http://${NODE_IP}:30020"
echo "  Code Server:       http://${NODE_IP}:30021"
echo "  Ollama:            http://${NODE_IP}:30022"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo ""
echo "  Check status:      kubectl get pods -n rica-platform"
echo "  View logs:         kubectl logs -f <pod-name> -n rica-platform"
echo "  Scale service:     kubectl scale deployment/<name> --replicas=<count> -n rica-platform"
echo "  Delete all:        kubectl delete namespace rica-platform"
echo ""
echo "For more information, see: K8S_DEPLOYMENT_GUIDE.md"
echo ""
