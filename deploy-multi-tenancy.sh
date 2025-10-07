#!/bin/bash

# Rica Multi-Tenancy Deployment Script
# This script sets up the multi-tenancy infrastructure

set -e

echo "================================================"
echo "Rica Multi-Tenancy Deployment"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"localhost:5000"}
DOMAIN=${DOMAIN:-"rica.example.com"}
NAMESPACE_PREFIX="rica-tenant"

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_prerequisites() {
    echo "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Please install kubectl."
        exit 1
    fi
    print_success "kubectl found"
    
    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    print_success "Connected to Kubernetes cluster"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js."
        exit 1
    fi
    print_success "Node.js found"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm."
        exit 1
    fi
    print_success "npm found"
    
    echo ""
}

install_dependencies() {
    echo "Installing dependencies..."
    
    # Install rica-api dependencies
    print_info "Installing rica-api dependencies..."
    cd rica-api
    npm install @kubernetes/client-node js-yaml express cors helmet compression
    cd ..
    print_success "rica-api dependencies installed"
    
    # Install rica-landing dependencies
    print_info "Installing rica-landing dependencies..."
    cd rica-landing
    npm install
    cd ..
    print_success "rica-landing dependencies installed"
    
    echo ""
}

setup_kubernetes() {
    echo "Setting up Kubernetes infrastructure..."
    
    # Check if ingress-nginx is installed
    if ! kubectl get namespace ingress-nginx &> /dev/null; then
        print_info "Installing ingress-nginx..."
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
        print_success "ingress-nginx installed"
    else
        print_success "ingress-nginx already installed"
    fi
    
    # Check if cert-manager is installed
    if ! kubectl get namespace cert-manager &> /dev/null; then
        print_info "Installing cert-manager..."
        kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
        print_success "cert-manager installed"
    else
        print_success "cert-manager already installed"
    fi
    
    # Check if metrics-server is installed
    if ! kubectl get deployment metrics-server -n kube-system &> /dev/null; then
        print_info "Installing metrics-server..."
        kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
        print_success "metrics-server installed"
    else
        print_success "metrics-server already installed"
    fi
    
    echo ""
}

create_cluster_issuer() {
    echo "Creating ClusterIssuer for SSL certificates..."
    
    cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@${DOMAIN}
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
    
    print_success "ClusterIssuer created"
    echo ""
}

build_docker_images() {
    echo "Building Docker images..."
    
    # Build rica-ui image
    print_info "Building rica-ui image..."
    cd rica-ui
    docker build -t ${DOCKER_REGISTRY}/rica-ui:latest .
    docker push ${DOCKER_REGISTRY}/rica-ui:latest
    cd ..
    print_success "rica-ui image built and pushed"
    
    echo ""
}

update_api_server() {
    echo "Updating rica-api server..."
    
    # Check if index.js exists
    if [ ! -f "rica-api/index.js" ]; then
        print_error "rica-api/index.js not found"
        exit 1
    fi
    
    # Add tenant routes if not already added
    if ! grep -q "tenantRoutes" rica-api/index.js; then
        print_info "Adding tenant routes to API server..."
        
        # Backup original file
        cp rica-api/index.js rica-api/index.js.backup
        
        # Add routes (this is a simplified version - manual integration may be needed)
        cat >> rica-api/index.js <<'EOF'

// Multi-Tenancy Routes
const tenantRoutes = require('./tenantRoutes');
const creditResourceManager = require('./creditResourceManager');

app.use('/api/tenants', tenantRoutes);

// Initialize credit resource manager
creditResourceManager.initialize();

// Cleanup on shutdown
process.on('SIGTERM', () => {
  creditResourceManager.shutdown();
  process.exit(0);
});
EOF
        print_success "Tenant routes added"
    else
        print_success "Tenant routes already configured"
    fi
    
    echo ""
}

configure_environment() {
    echo "Configuring environment variables..."
    
    # Create rica-api .env if it doesn't exist
    if [ ! -f "rica-api/.env" ]; then
        cat > rica-api/.env <<EOF
NODE_ENV=production
PORT=3001
DOCKER_REGISTRY=${DOCKER_REGISTRY}
DOMAIN=${DOMAIN}
EOF
        print_success "rica-api .env created"
    else
        print_success "rica-api .env already exists"
    fi
    
    # Create rica-landing .env if it doesn't exist
    if [ ! -f "rica-landing/.env" ]; then
        cat > rica-landing/.env <<EOF
REACT_APP_TENANT_API_URL=https://api.${DOMAIN}/api/tenants
REACT_APP_DOMAIN=${DOMAIN}
EOF
        print_success "rica-landing .env created"
    else
        print_success "rica-landing .env already exists"
    fi
    
    echo ""
}

test_deployment() {
    echo "Testing deployment..."
    
    # Test API server
    print_info "Starting rica-api server for testing..."
    cd rica-api
    npm start &
    API_PID=$!
    cd ..
    
    # Wait for server to start
    sleep 5
    
    # Test pricing endpoint
    if curl -s http://localhost:3001/api/tenants/pricing/estimate > /dev/null; then
        print_success "API server is responding"
    else
        print_error "API server is not responding"
    fi
    
    # Stop test server
    kill $API_PID 2>/dev/null || true
    
    echo ""
}

print_next_steps() {
    echo "================================================"
    echo "Deployment Complete!"
    echo "================================================"
    echo ""
    echo "Next Steps:"
    echo ""
    echo "1. Configure DNS:"
    echo "   - Add wildcard DNS record: *.${DOMAIN} → Ingress Controller IP"
    echo "   - Get Ingress IP: kubectl get svc -n ingress-nginx"
    echo ""
    echo "2. Start rica-api server:"
    echo "   cd rica-api && npm start"
    echo ""
    echo "3. Build and deploy rica-landing:"
    echo "   cd rica-landing && npm run build"
    echo ""
    echo "4. Test tenant provisioning:"
    echo "   - Sign up at https://${DOMAIN}"
    echo "   - Purchase credits"
    echo "   - Provision a tenant"
    echo ""
    echo "5. Monitor tenants:"
    echo "   kubectl get namespaces | grep ${NAMESPACE_PREFIX}"
    echo ""
    echo "Documentation: ./MULTI_TENANCY_GUIDE.md"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    install_dependencies
    setup_kubernetes
    create_cluster_issuer
    configure_environment
    update_api_server
    
    # Optional: Build Docker images
    read -p "Do you want to build and push Docker images? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_docker_images
    fi
    
    test_deployment
    print_next_steps
}

# Run main function
main
