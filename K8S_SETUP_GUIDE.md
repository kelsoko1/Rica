# Kubernetes Multi-Tenancy Setup Guide

## 🔍 Check Kubernetes Status

First, check if Kubernetes is ready for multi-tenancy:

```bash
cd /root/Rica

# Make executable
chmod +x check-k8s-multi-tenancy.sh

# Run the health check
./check-k8s-multi-tenancy.sh
```

This script will check:
- ✅ kubectl installation
- ✅ Cluster connection
- ✅ Cluster nodes
- ✅ Rica system namespace
- ✅ Rica API deployment
- ✅ RBAC configuration
- ✅ Storage classes
- ✅ Ingress controller
- ✅ Existing tenants
- ✅ Kubernetes templates

---

## 📊 Possible Outcomes

### Outcome 1: ✅ All Checks Passed
```
✓ All checks passed! Kubernetes is ready for multi-tenancy! 🎉
```

**Action:** You're ready to provision tenants!
```bash
./provision-tenant.sh user@example.com personal
```

---

### Outcome 2: ⚠️ Kubernetes Not Installed

```
✗ kubectl is not installed
```

**Action:** Install Kubernetes. Choose one option:

#### Option A: k3s (Recommended for servers)
```bash
# Install k3s (lightweight Kubernetes)
curl -sfL https://get.k3s.io | sh -

# Configure kubectl
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config

# Verify
kubectl get nodes
```

#### Option B: Minikube (For local testing)
```bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start Minikube
minikube start --driver=docker

# Verify
kubectl get nodes
```

#### Option C: Cloud Provider
- **Google Cloud (GKE)**: `gcloud container clusters create rica-cluster`
- **AWS (EKS)**: Use AWS Console or eksctl
- **Azure (AKS)**: `az aks create`

---

### Outcome 3: ⚠️ Rica API Not Deployed

```
⚠ Rica API is not deployed
```

**Action:** Deploy Rica API to Kubernetes:

```bash
cd /root/Rica

# Set API key
export API_KEY=$(openssl rand -hex 32)
echo "Save this API key: $API_KEY"

# Deploy
chmod +x deploy-k8s-multi-tenancy.sh
./deploy-k8s-multi-tenancy.sh
```

---

### Outcome 4: ⚠️ Ingress Controller Missing

```
⚠ Ingress controller not found
```

**Action:** Install nginx-ingress:

```bash
# Install nginx-ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Wait for it to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Verify
kubectl get pods -n ingress-nginx
```

---

## 🚀 Complete Setup Process

### Step 1: Install Kubernetes (if needed)

```bash
# For production servers, use k3s
curl -sfL https://get.k3s.io | sh -
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
```

### Step 2: Verify Kubernetes

```bash
kubectl get nodes
kubectl cluster-info
```

### Step 3: Check Rica K8s Status

```bash
cd /root/Rica
chmod +x check-k8s-multi-tenancy.sh
./check-k8s-multi-tenancy.sh
```

### Step 4: Deploy Rica API to K8s

```bash
# Generate API key
export API_KEY=$(openssl rand -hex 32)
echo "API Key: $API_KEY" > ~/rica-api-key.txt

# Deploy
chmod +x deploy-k8s-multi-tenancy.sh
./deploy-k8s-multi-tenancy.sh
```

### Step 5: Verify Deployment

```bash
# Check Rica API pods
kubectl get pods -n rica-system

# Check Rica API service
kubectl get svc -n rica-system

# Test Rica API
kubectl port-forward -n rica-system svc/rica-api 3001:3001 &
curl http://localhost:3001/health
```

### Step 6: Provision Test Tenant

```bash
# Provision a test tenant
./provision-tenant.sh test@example.com personal

# Check tenant namespace
kubectl get namespaces | grep rica-tenant

# Check tenant pods
kubectl get pods -n rica-tenant-<id>
```

---

## 🧪 Testing Multi-Tenancy

### Test 1: Provision a Tenant

```bash
# Provision tenant
curl -X POST http://localhost:3001/api/tenants/provision \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "test@example.com",
    "subscriptionTier": "personal",
    "userId": "test-user-123"
  }'
```

Expected response:
```json
{
  "success": true,
  "tenantId": "test-abc123",
  "namespace": "rica-tenant-test-abc123",
  "subdomain": "test-abc123.rica.example.com"
}
```

### Test 2: Check Tenant Status

```bash
# Get tenant status
curl -X GET http://localhost:3001/api/tenants/test-abc123/status \
  -H "x-api-key: YOUR_API_KEY"
```

### Test 3: List All Tenants

```bash
# List tenants
curl -X GET http://localhost:3001/api/tenants \
  -H "x-api-key: YOUR_API_KEY"
```

### Test 4: Check Tenant Resources

```bash
# Get tenant namespace
kubectl get namespace rica-tenant-test-abc123

# Get tenant pods
kubectl get pods -n rica-tenant-test-abc123

# Get tenant services
kubectl get svc -n rica-tenant-test-abc123

# Get tenant ingress
kubectl get ingress -n rica-tenant-test-abc123
```

---

## 📊 Monitoring Multi-Tenancy

### View All Tenants

```bash
# List all tenant namespaces
kubectl get namespaces -l app=rica-tenant

# Count tenants
kubectl get namespaces -l app=rica-tenant --no-headers | wc -l
```

### Check Tenant Resources

```bash
# Get resource quotas
kubectl get resourcequota -n rica-tenant-<id>

# Get resource usage
kubectl top pods -n rica-tenant-<id>

# Get tenant events
kubectl get events -n rica-tenant-<id> --sort-by='.lastTimestamp'
```

### View Rica API Logs

```bash
# View Rica API logs
kubectl logs -f -n rica-system -l app=rica-api

# View last 100 lines
kubectl logs -n rica-system -l app=rica-api --tail=100

# View logs from specific pod
kubectl logs -f -n rica-system <pod-name>
```

---

## 🔧 Troubleshooting

### Issue: kubectl not found

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### Issue: Cannot connect to cluster

```bash
# Check if k3s is running
sudo systemctl status k3s

# Restart k3s
sudo systemctl restart k3s

# Check kubeconfig
cat ~/.kube/config

# Set KUBECONFIG
export KUBECONFIG=~/.kube/config
```

### Issue: Rica API pods not starting

```bash
# Check pod status
kubectl get pods -n rica-system

# Describe pod
kubectl describe pod -n rica-system <pod-name>

# Check logs
kubectl logs -n rica-system <pod-name>

# Delete and recreate
kubectl delete pod -n rica-system <pod-name>
```

### Issue: Tenant provisioning fails

```bash
# Check Rica API logs
kubectl logs -f -n rica-system -l app=rica-api

# Check RBAC permissions
kubectl get clusterrolebinding rica-tenant-manager

# Check if namespace was created
kubectl get namespace rica-tenant-<id>

# Manually delete failed tenant
kubectl delete namespace rica-tenant-<id>
```

---

## 📚 Additional Resources

### Kubernetes Documentation
- **k3s**: https://k3s.io/
- **Minikube**: https://minikube.sigs.k8s.io/
- **kubectl**: https://kubernetes.io/docs/reference/kubectl/

### Rica Multi-Tenancy Docs
- `MULTI_TENANCY_GUIDE.md` - Complete guide
- `MULTI_TENANCY_QUICKSTART.md` - Quick start
- `MULTI_TENANCY_ARCHITECTURE.md` - Architecture diagrams

### Scripts
- `check-k8s-multi-tenancy.sh` - Health check
- `deploy-k8s-multi-tenancy.sh` - Deploy to K8s
- `provision-tenant.sh` - Provision tenant
- `check-tenant-status.sh` - Check tenant status

---

## ✅ Success Criteria

Your Kubernetes multi-tenancy is working when:

1. ✅ `./check-k8s-multi-tenancy.sh` shows all checks passed
2. ✅ Rica API is running in `rica-system` namespace
3. ✅ You can provision a test tenant successfully
4. ✅ Tenant namespace is created with all resources
5. ✅ Tenant pods are running and healthy
6. ✅ You can access tenant services via ingress

---

## 🎯 Quick Commands

```bash
# Check K8s status
./check-k8s-multi-tenancy.sh

# Deploy Rica API to K8s
./deploy-k8s-multi-tenancy.sh

# Provision tenant
./provision-tenant.sh user@example.com personal

# Check tenant status
./check-tenant-status.sh <tenant-id>

# List all tenants
kubectl get namespaces -l app=rica-tenant

# View Rica API logs
kubectl logs -f -n rica-system -l app=rica-api
```

---

**Last Updated**: 2025-10-07  
**Version**: 2.0  
**Status**: Ready for Multi-Tenancy
