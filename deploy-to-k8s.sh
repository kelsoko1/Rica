#!/bin/bash

# Rica Platform Kubernetes Deployment Script
# This script deploys the entire Rica platform to Kubernetes
# All services will run persistently even after SSH disconnection

set -e

echo "================================================"
echo "Rica Platform - Kubernetes Deployment"
echo "================================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="${REGISTRY:-localhost:5000}"
NAMESPACE="rica-platform"

# Function to print step
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if kubectl is installed
print_step "Checking kubectl installation..."
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed"
    echo "Install kubectl: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi
print_success "kubectl is installed"
echo ""

# Check if cluster is accessible
print_step "Checking Kubernetes cluster access..."
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot access Kubernetes cluster"
    echo "Make sure your kubeconfig is properly configured"
    exit 1
fi
print_success "Kubernetes cluster is accessible"
echo ""

# Build Docker images
print_step "Building Docker images..."
echo "Building Rica UI..."
docker build -t ${REGISTRY}/rica-ui:latest ./rica-ui
print_success "Rica UI image built"

echo "Building Rica API..."
docker build -t ${REGISTRY}/rica-api:latest ./rica-api
print_success "Rica API image built"

echo "Building Rica Landing..."
docker build -t ${REGISTRY}/rica-landing:latest ./rica-landing
print_success "Rica Landing image built"
echo ""

# Push images to registry (if not localhost)
if [ "$REGISTRY" != "localhost:5000" ]; then
    print_step "Pushing images to registry..."
    docker push ${REGISTRY}/rica-ui:latest
    docker push ${REGISTRY}/rica-api:latest
    docker push ${REGISTRY}/rica-landing:latest
    print_success "Images pushed to registry"
    echo ""
fi

# Apply Kubernetes manifests
print_step "Deploying to Kubernetes..."

# Replace registry placeholder in manifest
sed "s|\${REGISTRY}|${REGISTRY}|g" k8s/rica-complete-deployment.yaml > /tmp/rica-deployment.yaml

# Apply the manifest
kubectl apply -f /tmp/rica-deployment.yaml

print_success "Kubernetes manifests applied"
echo ""

# Wait for deployments to be ready
print_step "Waiting for deployments to be ready..."
echo "This may take a few minutes..."
echo ""

# Wait for namespace
kubectl wait --for=condition=Active namespace/${NAMESPACE} --timeout=60s

# Wait for deployments
deployments=("postgres" "redis" "ollama" "activepieces" "code-server" "rica-api" "rica-ui" "rica-landing")

for deployment in "${deployments[@]}"; do
    echo "Waiting for ${deployment}..."
    kubectl wait --for=condition=available --timeout=300s deployment/${deployment} -n ${NAMESPACE} || true
done

print_success "All deployments are ready"
echo ""

# Get service information
print_step "Service Information:"
echo ""
kubectl get services -n ${NAMESPACE}
echo ""

# Get pod status
print_step "Pod Status:"
echo ""
kubectl get pods -n ${NAMESPACE}
echo ""

# Get NodePort information
print_step "Access URLs (NodePorts):"
echo ""
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
if [ -z "$NODE_IP" ]; then
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
fi

echo "Node IP: ${NODE_IP}"
echo ""
echo "Services:"
echo "  - Rica UI:         http://${NODE_IP}:30030"
echo "  - Rica Landing:    http://${NODE_IP}:30000"
echo "  - Rica API:        http://${NODE_IP}:30001"
echo "  - Activepieces:    http://${NODE_IP}:30020"
echo "  - Code Server:     http://${NODE_IP}:30021"
echo "  - Ollama:          http://${NODE_IP}:30022"
echo ""

# Check ingress
print_step "Checking Ingress..."
if kubectl get ingress -n ${NAMESPACE} &> /dev/null; then
    kubectl get ingress -n ${NAMESPACE}
    echo ""
    print_warning "Configure your DNS to point to the ingress controller IP"
else
    print_warning "Ingress controller not found. Using NodePort access."
fi
echo ""

# Save deployment info
print_step "Saving deployment information..."
cat > rica-k8s-info.txt << EOF
Rica Platform - Kubernetes Deployment Information
Generated: $(date)

Namespace: ${NAMESPACE}
Registry: ${REGISTRY}

Access URLs:
- Rica UI:         http://${NODE_IP}:30030
- Rica Landing:    http://${NODE_IP}:30000
- Rica API:        http://${NODE_IP}:30001
- Activepieces:    http://${NODE_IP}:30020
- Code Server:     http://${NODE_IP}:30021
- Ollama:          http://${NODE_IP}:30022

Useful Commands:
- View pods:       kubectl get pods -n ${NAMESPACE}
- View services:   kubectl get services -n ${NAMESPACE}
- View logs:       kubectl logs -f <pod-name> -n ${NAMESPACE}
- Scale service:   kubectl scale deployment/<name> --replicas=<count> -n ${NAMESPACE}
- Delete all:      kubectl delete namespace ${NAMESPACE}

Troubleshooting:
- Check pod logs:  kubectl logs <pod-name> -n ${NAMESPACE}
- Describe pod:    kubectl describe pod <pod-name> -n ${NAMESPACE}
- Get events:      kubectl get events -n ${NAMESPACE} --sort-by='.lastTimestamp'
EOF

print_success "Deployment information saved to rica-k8s-info.txt"
echo ""

echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo ""
echo "Your Rica platform is now running in Kubernetes."
echo "All services will continue running even after you disconnect from SSH."
echo ""
echo "Next Steps:"
echo "1. Access Rica UI at: http://${NODE_IP}:30030"
echo "2. Check pod status: kubectl get pods -n ${NAMESPACE}"
echo "3. View logs: kubectl logs -f <pod-name> -n ${NAMESPACE}"
echo "4. Configure ingress for production access"
echo ""
echo "For more information, see: rica-k8s-info.txt"
echo ""
