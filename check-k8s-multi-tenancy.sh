#!/bin/bash

# Kubernetes Multi-Tenancy Health Check Script
# This script checks if Kubernetes is properly configured for Rica multi-tenancy

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

run_check() {
    local check_name=$1
    local check_command=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if eval "$check_command" > /dev/null 2>&1; then
        print_success "$check_name"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        print_error "$check_name"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

print_header "Kubernetes Multi-Tenancy Health Check"

# Check 1: kubectl installed
print_header "1. Checking Prerequisites"

if command -v kubectl &> /dev/null; then
    KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null || kubectl version --client 2>/dev/null | head -n1)
    print_success "kubectl is installed: $KUBECTL_VERSION"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_error "kubectl is not installed"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo ""
    echo "Install kubectl:"
    echo "  curl -LO https://dl.k8s.io/release/\$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    echo "  chmod +x kubectl"
    echo "  sudo mv kubectl /usr/local/bin/"
    echo ""
    exit 1
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check 2: Kubernetes cluster connection
print_header "2. Checking Kubernetes Cluster Connection"

if kubectl cluster-info &> /dev/null; then
    CLUSTER_INFO=$(kubectl cluster-info | head -n1)
    print_success "Connected to Kubernetes cluster"
    echo "   $CLUSTER_INFO"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_error "Cannot connect to Kubernetes cluster"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo ""
    echo "Kubernetes cluster is not accessible. Options:"
    echo ""
    echo "Option 1: Install Minikube (for local testing)"
    echo "  curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64"
    echo "  sudo install minikube-linux-amd64 /usr/local/bin/minikube"
    echo "  minikube start"
    echo ""
    echo "Option 2: Install k3s (lightweight Kubernetes)"
    echo "  curl -sfL https://get.k3s.io | sh -"
    echo "  sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config"
    echo ""
    echo "Option 3: Use a cloud provider (GKE, EKS, AKS)"
    echo "  Configure kubectl with your cloud provider credentials"
    echo ""
    exit 1
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check 3: Cluster nodes
print_header "3. Checking Cluster Nodes"

NODE_COUNT=$(kubectl get nodes --no-headers 2>/dev/null | wc -l)
if [ "$NODE_COUNT" -gt 0 ]; then
    print_success "Cluster has $NODE_COUNT node(s)"
    kubectl get nodes
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_error "No nodes found in cluster"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check 4: Rica system namespace
print_header "4. Checking Rica System Namespace"

if kubectl get namespace rica-system &> /dev/null; then
    print_success "rica-system namespace exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_warning "rica-system namespace does not exist (will be created during deployment)"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check 5: Rica API deployment
print_header "5. Checking Rica API Deployment"

if kubectl get deployment rica-api -n rica-system &> /dev/null; then
    REPLICAS=$(kubectl get deployment rica-api -n rica-system -o jsonpath='{.status.availableReplicas}' 2>/dev/null || echo "0")
    if [ "$REPLICAS" -gt 0 ]; then
        print_success "Rica API is deployed and running ($REPLICAS replicas)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        print_warning "Rica API is deployed but not ready"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
else
    print_warning "Rica API is not deployed (run ./deploy-k8s-multi-tenancy.sh)"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check 6: RBAC configuration
print_header "6. Checking RBAC Configuration"

if kubectl get clusterrole rica-tenant-manager &> /dev/null; then
    print_success "rica-tenant-manager ClusterRole exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_warning "rica-tenant-manager ClusterRole not found"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if kubectl get clusterrolebinding rica-tenant-manager &> /dev/null; then
    print_success "rica-tenant-manager ClusterRoleBinding exists"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_warning "rica-tenant-manager ClusterRoleBinding not found"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check 7: Storage class
print_header "7. Checking Storage Configuration"

STORAGE_CLASSES=$(kubectl get storageclass --no-headers 2>/dev/null | wc -l)
if [ "$STORAGE_CLASSES" -gt 0 ]; then
    print_success "Storage classes available: $STORAGE_CLASSES"
    kubectl get storageclass
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_warning "No storage classes found"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check 8: Ingress controller
print_header "8. Checking Ingress Controller"

if kubectl get pods -n ingress-nginx &> /dev/null || kubectl get pods -n kube-system -l app.kubernetes.io/name=ingress-nginx &> /dev/null; then
    print_success "Ingress controller found"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_warning "Ingress controller not found (optional but recommended)"
    echo "   Install nginx-ingress:"
    echo "   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check 9: Existing tenants
print_header "9. Checking Existing Tenants"

TENANT_NAMESPACES=$(kubectl get namespaces -l app=rica-tenant --no-headers 2>/dev/null | wc -l)
if [ "$TENANT_NAMESPACES" -gt 0 ]; then
    print_success "Found $TENANT_NAMESPACES tenant namespace(s)"
    kubectl get namespaces -l app=rica-tenant
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    print_warning "No tenant namespaces found (none provisioned yet)"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check 10: Kubernetes templates
print_header "10. Checking Kubernetes Templates"

TEMPLATE_DIR="k8s"
REQUIRED_TEMPLATES=(
    "tenant-namespace-template.yaml"
    "tenant-rica-ui-deployment.yaml"
    "tenant-headless-servers.yaml"
    "tenant-ingress.yaml"
)

for template in "${REQUIRED_TEMPLATES[@]}"; do
    if [ -f "$TEMPLATE_DIR/$template" ]; then
        print_success "$template exists"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        print_error "$template not found"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
done

# Summary
print_header "Health Check Summary"

echo "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $PASSED_CHECKS${NC}"
echo -e "${RED}Failed: $FAILED_CHECKS${NC}"
echo ""

# Determine overall status
if [ $FAILED_CHECKS -eq 0 ]; then
    print_success "All checks passed! Kubernetes is ready for multi-tenancy! 🎉"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy Rica API to K8s: ./deploy-k8s-multi-tenancy.sh"
    echo "  2. Provision a test tenant: ./provision-tenant.sh test@example.com personal"
    echo ""
    exit 0
elif [ $PASSED_CHECKS -ge 5 ]; then
    print_warning "Kubernetes is partially configured"
    echo ""
    echo "To complete setup:"
    echo "  1. Fix the failed checks above"
    echo "  2. Deploy Rica API: ./deploy-k8s-multi-tenancy.sh"
    echo ""
    exit 1
else
    print_error "Kubernetes is not properly configured"
    echo ""
    echo "Required actions:"
    echo "  1. Install and configure Kubernetes cluster"
    echo "  2. Run: ./deploy-k8s-multi-tenancy.sh"
    echo ""
    exit 1
fi
