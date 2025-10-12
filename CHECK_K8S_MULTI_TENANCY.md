# Check Kubernetes Multi-Tenancy - Quick Guide

## 🎉 Great! All Pages Work!

Now let's check if Kubernetes is ready for multi-tenancy.

---

## 🚀 One Command to Check Everything

Run this on your server:

```bash
cd /root/Rica

# Make executable
chmod +x check-k8s-multi-tenancy.sh

# Run the check
./check-k8s-multi-tenancy.sh
```

---

## 📊 What This Script Checks

The script will verify:

1. ✅ **kubectl installed** - Kubernetes command-line tool
2. ✅ **Cluster connection** - Can connect to Kubernetes cluster
3. ✅ **Cluster nodes** - At least one node available
4. ✅ **Rica system namespace** - Namespace for Rica API
5. ✅ **Rica API deployment** - Rica API running in K8s
6. ✅ **RBAC configuration** - Permissions for tenant management
7. ✅ **Storage classes** - Storage for tenant data
8. ✅ **Ingress controller** - For external access
9. ✅ **Existing tenants** - Any provisioned tenants
10. ✅ **Kubernetes templates** - Template files for tenants

---

## 🎯 Possible Results

### Result 1: ✅ All Checks Passed

```
✓ All checks passed! Kubernetes is ready for multi-tenancy! 🎉
```

**You're ready!** Provision a tenant:
```bash
./provision-tenant.sh user@example.com personal
```

---

### Result 2: ⚠️ Kubernetes Not Installed

```
✗ kubectl is not installed
```

**Install k3s (recommended for servers):**
```bash
# Install k3s
curl -sfL https://get.k3s.io | sh -

# Configure kubectl
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config

# Verify
kubectl get nodes
```

---

### Result 3: ⚠️ Rica API Not Deployed

```
⚠ Rica API is not deployed
```

**Deploy Rica API to Kubernetes:**
```bash
cd /root/Rica

# Generate API key
export API_KEY=$(openssl rand -hex 32)
echo "Save this: $API_KEY"

# Deploy
chmod +x deploy-k8s-multi-tenancy.sh
./deploy-k8s-multi-tenancy.sh
```

---

## 🔍 Detailed Setup (If Needed)

### Step 1: Install Kubernetes

```bash
# Install k3s (lightweight Kubernetes)
curl -sfL https://get.k3s.io | sh -

# Configure kubectl
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config

# Verify installation
kubectl get nodes
kubectl cluster-info
```

### Step 2: Check K8s Status

```bash
cd /root/Rica
chmod +x check-k8s-multi-tenancy.sh
./check-k8s-multi-tenancy.sh
```

### Step 3: Deploy Rica API to K8s

```bash
# Generate and save API key
export API_KEY=$(openssl rand -hex 32)
echo "API Key: $API_KEY" > ~/rica-api-key.txt
cat ~/rica-api-key.txt

# Deploy Rica API
chmod +x deploy-k8s-multi-tenancy.sh
./deploy-k8s-multi-tenancy.sh

# Wait for deployment
kubectl wait --for=condition=available --timeout=300s deployment/rica-api -n rica-system

# Verify
kubectl get pods -n rica-system
kubectl get svc -n rica-system
```

### Step 4: Test Tenant Provisioning

```bash
# Provision a test tenant
./provision-tenant.sh test@example.com personal

# Check tenant namespace
kubectl get namespaces | grep rica-tenant

# Check tenant pods
TENANT_ID=$(kubectl get namespaces -l app=rica-tenant -o jsonpath='{.items[0].metadata.name}' | cut -d'-' -f3-)
kubectl get pods -n rica-tenant-$TENANT_ID

# Check tenant status
./check-tenant-status.sh $TENANT_ID
```

---

## 🧪 Quick Test Commands

### Test 1: Check Kubernetes

```bash
kubectl get nodes
kubectl cluster-info
kubectl get namespaces
```

### Test 2: Check Rica API

```bash
# Port forward Rica API
kubectl port-forward -n rica-system svc/rica-api 3001:3001 &

# Test health endpoint
curl http://localhost:3001/health

# Should return: {"status":"ok",...}
```

### Test 3: Provision Tenant via API

```bash
# Replace YOUR_API_KEY with your actual API key
curl -X POST http://localhost:3001/api/tenants/provision \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "test@example.com",
    "subscriptionTier": "personal",
    "userId": "test-123"
  }'
```

### Test 4: Check Tenant Resources

```bash
# List tenant namespaces
kubectl get namespaces -l app=rica-tenant

# Get tenant details
kubectl get all -n rica-tenant-<id>

# Check resource quota
kubectl get resourcequota -n rica-tenant-<id>

# Check tenant pods
kubectl get pods -n rica-tenant-<id>
```

---

## 📚 Documentation

For more details, see:

- **`K8S_SETUP_GUIDE.md`** - Complete Kubernetes setup guide
- **`MULTI_TENANCY_GUIDE.md`** - Multi-tenancy documentation
- **`DEPLOYMENT_GUIDE_UPDATED.md`** - Full deployment guide

---

## 🎯 Summary

**To check if K8s is ready for multi-tenancy:**

```bash
cd /root/Rica
chmod +x check-k8s-multi-tenancy.sh
./check-k8s-multi-tenancy.sh
```

**If Kubernetes is not installed:**

```bash
# Install k3s
curl -sfL https://get.k3s.io | sh -
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
```

**If Rica API is not deployed:**

```bash
export API_KEY=$(openssl rand -hex 32)
./deploy-k8s-multi-tenancy.sh
```

**Then provision a tenant:**

```bash
./provision-tenant.sh user@example.com personal
```

---

## ✅ Success Criteria

Multi-tenancy is working when:

1. ✅ `./check-k8s-multi-tenancy.sh` passes all checks
2. ✅ Rica API is running in `rica-system` namespace
3. ✅ You can provision a tenant successfully
4. ✅ Tenant namespace is created with all resources
5. ✅ Tenant pods are running and healthy

---

**Last Updated**: 2025-10-07  
**Status**: Ready to Check K8s Multi-Tenancy
