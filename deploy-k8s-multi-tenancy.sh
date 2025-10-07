#!/bin/bash

# Kubernetes Multi-Tenancy Deployment Script for Rica
# This script deploys the multi-tenancy infrastructure to Kubernetes

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

echo "================================================"
echo "Rica Kubernetes Multi-Tenancy Deployment"
echo "================================================"
echo ""

# Step 1: Check prerequisites
print_step "Checking prerequisites..."

if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed"
    exit 1
fi
print_success "kubectl is installed"

# Check if kubectl can connect to cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi
print_success "Connected to Kubernetes cluster"

echo ""

# Step 2: Create namespace for Rica API
print_step "Creating Rica API namespace..."
kubectl create namespace rica-system 2>/dev/null || print_warning "Namespace rica-system already exists"
print_success "Rica API namespace ready"

echo ""

# Step 3: Deploy Rica API
print_step "Deploying Rica API..."

# Create ConfigMap for Rica API
kubectl create configmap rica-api-config \
    --from-literal=NODE_ENV=production \
    --from-literal=PORT=3001 \
    --from-literal=OLLAMA_URL=http://ollama:11434 \
    --from-literal=OLLAMA_EXTERNAL_URL=http://localhost:2022 \
    -n rica-system \
    --dry-run=client -o yaml | kubectl apply -f -

print_success "Rica API ConfigMap created"

# Create Secret for Rica API
if [ -z "$API_KEY" ]; then
    API_KEY=$(openssl rand -hex 32)
    print_warning "Generated random API_KEY: $API_KEY"
    echo "   Save this key for future use!"
fi

kubectl create secret generic rica-api-secret \
    --from-literal=API_KEY=$API_KEY \
    -n rica-system \
    --dry-run=client -o yaml | kubectl apply -f -

print_success "Rica API Secret created"

# Deploy Rica API
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rica-api
  namespace: rica-system
spec:
  replicas: 2
  selector:
    matchLabels:
      app: rica-api
  template:
    metadata:
      labels:
        app: rica-api
    spec:
      containers:
      - name: rica-api
        image: ${REGISTRY:-localhost:5000}/rica-api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3001
          name: http
        envFrom:
        - configMapRef:
            name: rica-api-config
        - secretRef:
            name: rica-api-secret
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: rica-api
  namespace: rica-system
spec:
  selector:
    app: rica-api
  ports:
  - port: 3001
    targetPort: 3001
    name: http
  type: ClusterIP
EOF

print_success "Rica API deployed"

echo ""

# Step 4: Create RBAC for tenant management
print_step "Setting up RBAC for tenant management..."

kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: rica-tenant-manager
  namespace: rica-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: rica-tenant-manager
rules:
- apiGroups: [""]
  resources: ["namespaces", "serviceaccounts", "secrets", "configmaps", "services", "persistentvolumeclaims"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses", "networkpolicies"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["rbac.authorization.k8s.io"]
  resources: ["roles", "rolebindings"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: [""]
  resources: ["resourcequotas", "limitranges"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: rica-tenant-manager
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: rica-tenant-manager
subjects:
- kind: ServiceAccount
  name: rica-tenant-manager
  namespace: rica-system
EOF

print_success "RBAC configured"

echo ""

# Step 5: Update Rica API deployment to use service account
print_step "Updating Rica API with service account..."

kubectl patch deployment rica-api -n rica-system -p '{"spec":{"template":{"spec":{"serviceAccountName":"rica-tenant-manager"}}}}'

print_success "Rica API updated with service account"

echo ""

# Step 6: Create storage class for tenant data
print_step "Creating storage class for tenant data..."

kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: rica-tenant-storage
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Retain
EOF

print_success "Storage class created"

echo ""

# Step 7: Deploy monitoring and metrics
print_step "Setting up monitoring..."

kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: rica-monitoring-config
  namespace: rica-system
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'rica-api'
      static_configs:
      - targets: ['rica-api:3001']
EOF

print_success "Monitoring configured"

echo ""

# Step 8: Create ingress for Rica API
print_step "Creating ingress for Rica API..."

kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: rica-api-ingress
  namespace: rica-system
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.rica.example.com
    secretName: rica-api-tls
  rules:
  - host: api.rica.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: rica-api
            port:
              number: 3001
EOF

print_success "Ingress created"

echo ""

# Step 9: Wait for Rica API to be ready
print_step "Waiting for Rica API to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/rica-api -n rica-system
print_success "Rica API is ready"

echo ""

# Step 10: Display deployment information
print_step "Deployment Information:"
echo ""
echo "  Rica API:"
echo "  - Namespace: rica-system"
echo "  - Service: rica-api:3001"
echo "  - Ingress: api.rica.example.com"
echo "  - API Key: $API_KEY"
echo ""

# Step 11: Test API connectivity
print_step "Testing API connectivity..."
API_POD=$(kubectl get pods -n rica-system -l app=rica-api -o jsonpath='{.items[0].metadata.name}')
if kubectl exec -n rica-system $API_POD -- wget -q -O- http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Rica API is responding"
else
    print_warning "Rica API health check failed"
fi

echo ""

# Step 12: Display tenant provisioning example
print_step "Tenant Provisioning Example:"
echo ""
echo "To provision a new tenant, use the Rica API:"
echo ""
echo "curl -X POST https://api.rica.example.com/api/tenants/provision \\"
echo "  -H 'x-api-key: $API_KEY' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"userEmail\": \"user@example.com\","
echo "    \"subscriptionTier\": \"personal\","
echo "    \"userId\": \"user-123\""
echo "  }'"
echo ""

# Step 13: Create helper scripts
print_step "Creating helper scripts..."

# Create tenant provisioning script
cat > provision-tenant.sh << 'SCRIPT'
#!/bin/bash

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./provision-tenant.sh <email> <tier>"
    echo "Tiers: pay-as-you-go, personal, team"
    exit 1
fi

EMAIL=$1
TIER=$2
USER_ID=$(echo -n "$EMAIL" | md5sum | cut -d' ' -f1)

curl -X POST http://localhost:3001/api/tenants/provision \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"userEmail\": \"$EMAIL\",
    \"subscriptionTier\": \"$TIER\",
    \"userId\": \"$USER_ID\"
  }"
SCRIPT

chmod +x provision-tenant.sh
print_success "Created provision-tenant.sh"

# Create tenant status script
cat > check-tenant-status.sh << 'SCRIPT'
#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./check-tenant-status.sh <tenant-id>"
    exit 1
fi

TENANT_ID=$1

curl -X GET http://localhost:3001/api/tenants/$TENANT_ID/status \
  -H "x-api-key: $API_KEY"
SCRIPT

chmod +x check-tenant-status.sh
print_success "Created check-tenant-status.sh"

echo ""

# Step 14: Final status
echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo ""
echo "Rica Multi-Tenancy is now deployed to Kubernetes"
echo ""
echo "Important Information:"
echo "  - API Key: $API_KEY (save this!)"
echo "  - API Endpoint: http://localhost:3001 (or https://api.rica.example.com)"
echo "  - Namespace: rica-system"
echo ""
echo "Helper Scripts:"
echo "  - ./provision-tenant.sh <email> <tier>"
echo "  - ./check-tenant-status.sh <tenant-id>"
echo ""
echo "Useful Commands:"
echo "  - View API logs: kubectl logs -f -n rica-system -l app=rica-api"
echo "  - List tenants: kubectl get namespaces | grep rica-tenant"
echo "  - Scale API: kubectl scale deployment rica-api -n rica-system --replicas=3"
echo ""
