#!/bin/bash

# Rica Multi-Tenant SaaS Deployment Script
# Usage: ./deploy-rica.sh [environment] [action]

set -e

ENVIRONMENT=${1:-production}
ACTION=${2:-deploy}
NAMESPACE="rica-platform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed. Please install kubectl first."
    fi

    # Check if helm is installed (for optional monitoring)
    if ! command -v helm &> /dev/null; then
        warn "helm is not installed. Some monitoring features may not work."
    fi

    # Check if Docker is available (for building images)
    if ! command -v docker &> /dev/null; then
        warn "docker is not installed. You may need to use pre-built images."
    fi

    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    fi

    log "Prerequisites check completed"
}

# Create secrets
create_secrets() {
    log "Creating secrets for $ENVIRONMENT environment..."

    # Generate secure passwords if they don't exist
    if [ ! -f ".secrets-${ENVIRONMENT}.env" ]; then
        log "Generating secure secrets..."
        cat > ".secrets-${ENVIRONMENT}.env" << EOF
# Auto-generated secrets for $ENVIRONMENT environment
# Generated on: $(date)

POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
API_KEY=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Database connection details
DATABASE_URL=postgresql://rica:$(echo $POSTGRES_PASSWORD | sed 's/\//\\\//g')@postgres:5432/rica
REDIS_URL=redis://:$(echo $REDIS_PASSWORD | sed 's/\//\\\//g')@redis:6379/0
EOF
        success "Generated .secrets-${ENVIRONMENT}.env"
    fi

    # Create Kubernetes secrets
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

    kubectl create secret generic rica-secrets \
        --namespace $NAMESPACE \
        --from-env-file=".secrets-${ENVIRONMENT}.env" \
        --dry-run=client -o yaml | kubectl apply -f -

    success "Secrets created"
}

# Build and push Docker images
build_images() {
    log "Building Docker images..."

    # Build credit metering service
    docker build -t rica/credit-metering:latest -f Dockerfile.credit-metering .
    docker tag rica/credit-metering:latest rica/credit-metering:$ENVIRONMENT

    # Build resource collector
    docker build -t rica/resource-collector:latest -f Dockerfile.collector .
    docker tag rica/resource-collector:latest rica/resource-collector:$ENVIRONMENT

    # Push images (if registry is configured)
    if [ ! -z "$DOCKER_REGISTRY" ]; then
        docker push rica/credit-metering:$ENVIRONMENT
        docker push rica/resource-collector:$ENVIRONMENT
        success "Images pushed to registry"
    else
        warn "DOCKER_REGISTRY not set, skipping image push"
    fi

    success "Docker images built"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log "Deploying to Kubernetes..."

    # Apply the main deployment
    envsubst < k8s-rica-multi-tenant.yml | kubectl apply -f -

    # Wait for deployments to be ready
    log "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/credit-metering-service --namespace $NAMESPACE
    kubectl wait --for=condition=available --timeout=300s deployment/resource-collector --namespace $NAMESPACE
    kubectl wait --for=condition=available --timeout=300s statefulset/postgres --namespace $NAMESPACE

    success "Kubernetes deployment completed"
}

# Setup monitoring (optional)
setup_monitoring() {
    if command -v helm &> /dev/null; then
        log "Setting up monitoring with Prometheus..."

        # Add prometheus-community repo if not exists
        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
        helm repo update

        # Install kube-prometheus-stack
        helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
            --namespace monitoring --create-namespace \
            --set grafana.adminPassword="$GRAFANA_PASSWORD" \
            --set prometheus.serviceMonitorSelectorNilUsesHelmValues=false

        success "Monitoring setup completed"
    else
        warn "Helm not available, skipping monitoring setup"
    fi
}

# Create sample tenant
create_sample_tenant() {
    log "Creating sample tenant..."

    TENANT_ID="demo-$(date +%s)"
    cat > tenant-sample.yml << EOF
apiVersion: v1
kind: Namespace
metadata:
  name: tenant-${TENANT_ID}
  labels:
    rica-tenant: "true"
    tenant-id: "${TENANT_ID}"
    subscription-tier: "personal"
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: tenant-quota
  namespace: tenant-${TENANT_ID}
spec:
  hard:
    requests.cpu: "2000m"
    requests.memory: "4Gi"
    persistentvolumeclaims: "20"
    pods: "10"
EOF

    kubectl apply -f tenant-sample.yml

    success "Sample tenant created (ID: ${TENANT_ID})"
}

# Main deployment function
main() {
    log "Starting Rica deployment for $ENVIRONMENT environment"

    case $ACTION in
        "deploy")
            check_prerequisites
            create_secrets
            build_images
            deploy_kubernetes
            setup_monitoring
            success "Rica deployment completed successfully!"
            ;;
        "secrets")
            create_secrets
            ;;
        "build")
            build_images
            ;;
        "tenant")
            create_sample_tenant
            ;;
        "destroy")
            log "Destroying Rica deployment..."
            kubectl delete namespace $NAMESPACE --ignore-not-found=true
            success "Rica deployment destroyed"
            ;;
        *)
            error "Unknown action: $ACTION. Available actions: deploy, secrets, build, tenant, destroy"
            ;;
    esac
}

# Run main function with all arguments
main "$@"
