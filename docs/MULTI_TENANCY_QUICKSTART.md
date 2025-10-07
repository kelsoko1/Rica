# Rica Multi-Tenancy Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly set up and test the multi-tenancy system.

## Prerequisites

- ✅ Kubernetes cluster (local or cloud)
- ✅ kubectl configured
- ✅ Node.js 18+ installed
- ✅ npm or yarn installed
- ✅ Docker (optional, for building images)

## Step 1: Install Dependencies

### Windows
```bash
cd rica-api
npm install

cd ../rica-landing
npm install
```

### Linux/Mac
```bash
cd rica-api && npm install && cd ..
cd rica-landing && npm install && cd ..
```

## Step 2: Configure Environment

### Rica-API Configuration

Create `rica-api/.env`:
```env
NODE_ENV=development
PORT=3001
DOCKER_REGISTRY=localhost:5000
DOMAIN=localhost
```

### Rica-Landing Configuration

Create `rica-landing/.env`:
```env
REACT_APP_TENANT_API_URL=http://localhost:3001/api/tenants
REACT_APP_DOMAIN=localhost
```

## Step 3: Set Up Kubernetes (Local Development)

### Option A: Using Minikube

```bash
# Start minikube
minikube start --cpus=4 --memory=8192

# Enable ingress
minikube addons enable ingress

# Get minikube IP
minikube ip
```

### Option B: Using Docker Desktop

```bash
# Enable Kubernetes in Docker Desktop settings
# Wait for Kubernetes to start

# Verify
kubectl cluster-info
```

### Install Required Add-ons

```bash
# Install ingress-nginx
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager (optional for local dev)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Step 4: Start Rica-API

```bash
cd rica-api
npm start
```

You should see:
```
Rica API Server running on port 3001
Credit Resource Manager initialized
```

## Step 5: Test the API

### Check Pricing Estimates

```bash
curl http://localhost:3001/api/tenants/pricing/estimate
```

Expected response:
```json
{
  "success": true,
  "estimates": {
    "pay-as-you-go": {
      "tier": "pay-as-you-go",
      "hourlyCredits": 6,
      "dailyCredits": 144,
      "monthlyCredits": 4320,
      "estimatedMonthlyCost": "172.80"
    },
    ...
  }
}
```

## Step 6: Start Rica-Landing

In a new terminal:

```bash
cd rica-landing
npm start
```

Visit: http://localhost:3000

## Step 7: Test Tenant Provisioning

### 1. Sign Up / Log In
- Create an account or log in with Firebase

### 2. Purchase Credits
- Buy credits via ClickPesa
- Minimum 10 credits for Pay-As-You-Go

### 3. Provision Tenant
- Navigate to Tenant Provisioning page
- Select a tier
- Click "Provision Environment"

### 4. Monitor Provisioning

Watch the Kubernetes resources being created:

```bash
# Watch namespaces
kubectl get namespaces -w | grep rica-tenant

# Once namespace is created, watch pods
kubectl get pods -n rica-tenant-{TENANT_ID} -w
```

### 5. Access Your Environment

Once provisioning completes, you'll be redirected to:
```
https://{username}-{tenant-id}.rica.example.com
```

For local development, you may need to add to `/etc/hosts`:
```
127.0.0.1 {username}-{tenant-id}.localhost
```

## Testing Without Kubernetes

If you don't have Kubernetes available, you can still test the API logic:

### Mock Mode

Create `rica-api/tenantManager.mock.js`:

```javascript
class MockTenantManager {
  constructor() {
    this.tenants = new Map();
  }

  async provisionTenant(userEmail, subscriptionTier, userId) {
    const tenantId = Math.random().toString(36).substring(7);
    const tenant = {
      tenantId,
      userId,
      userEmail,
      subscriptionTier,
      url: `https://${userEmail.split('@')[0]}-${tenantId}.rica.example.com`,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    this.tenants.set(tenantId, tenant);
    return tenant;
  }

  getTenant(tenantId) {
    return this.tenants.get(tenantId);
  }

  getTenantByUserId(userId) {
    for (const [, tenant] of this.tenants.entries()) {
      if (tenant.userId === userId) return tenant;
    }
    return null;
  }

  async deprovisionTenant(tenantId) {
    this.tenants.delete(tenantId);
    return { success: true, tenantId };
  }
}

module.exports = new MockTenantManager();
```

Update `rica-api/tenantRoutes.js` to use mock:
```javascript
const tenantManager = process.env.MOCK_MODE === 'true' 
  ? require('./tenantManager.mock')
  : require('./tenantManager');
```

Set environment variable:
```bash
export MOCK_MODE=true  # Linux/Mac
set MOCK_MODE=true     # Windows
```

## Common Commands

### View All Tenants

```bash
kubectl get namespaces | grep rica-tenant
```

### Check Tenant Status

```bash
kubectl get all -n rica-tenant-{TENANT_ID}
```

### View Tenant Logs

```bash
# Rica UI logs
kubectl logs -n rica-tenant-{TENANT_ID} deployment/rica-ui

# Ollama logs
kubectl logs -n rica-tenant-{TENANT_ID} deployment/ollama
```

### Delete a Tenant

```bash
kubectl delete namespace rica-tenant-{TENANT_ID}
```

### Monitor Resource Usage

```bash
kubectl top pods -n rica-tenant-{TENANT_ID}
kubectl top nodes
```

## Troubleshooting

### API Server Won't Start

**Error**: `Cannot find module '@kubernetes/client-node'`

**Solution**:
```bash
cd rica-api
npm install @kubernetes/client-node js-yaml
```

### Provisioning Fails

**Error**: `Insufficient credits`

**Solution**:
- Check user credits in Firebase/localStorage
- Ensure minimum credits (10 for Pay-As-You-Go)

**Error**: `Cannot connect to Kubernetes cluster`

**Solution**:
```bash
# Check kubectl config
kubectl cluster-info

# Verify kubeconfig
echo $KUBECONFIG
```

### Pods Not Starting

**Error**: `ImagePullBackOff`

**Solution**:
- Build and push Docker images
- Or use public images
- Update image registry in templates

**Error**: `Insufficient resources`

**Solution**:
- Check cluster resources: `kubectl top nodes`
- Reduce resource requests in tier configs
- Add more nodes to cluster

### Cannot Access Tenant URL

**Error**: DNS resolution fails

**Solution** (Local Development):
```bash
# Add to /etc/hosts (Linux/Mac)
127.0.0.1 {username}-{tenant-id}.localhost

# Add to C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 {username}-{tenant-id}.localhost
```

## Development Workflow

### 1. Make Changes

Edit files in `rica-api/` or `rica-landing/src/`

### 2. Test Locally

```bash
# Restart API server
cd rica-api
npm start

# Rica-landing auto-reloads
# Just refresh browser
```

### 3. Test Provisioning

Use the UI or curl:

```bash
curl -X POST http://localhost:3001/api/tenants/provision \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -H "x-user-email: test@example.com" \
  -d '{
    "subscriptionTier": "pay-as-you-go",
    "userCredits": 100
  }'
```

### 4. Monitor Logs

```bash
# API server logs
tail -f rica-api/logs/app.log

# Kubernetes logs
kubectl logs -f -n rica-tenant-{TENANT_ID} deployment/rica-ui
```

## Production Deployment

### 1. Build Docker Images

```bash
# Build rica-ui
cd rica-ui
docker build -t your-registry.com/rica-ui:latest .
docker push your-registry.com/rica-ui:latest

# Build rica-landing
cd rica-landing
npm run build
# Deploy to hosting (Firebase, Netlify, etc.)
```

### 2. Update Environment

```bash
# rica-api/.env
NODE_ENV=production
DOCKER_REGISTRY=your-registry.com
DOMAIN=rica.example.com
```

### 3. Configure DNS

```bash
# Add wildcard DNS record
*.rica.example.com → Ingress Controller IP
```

### 4. Deploy

```bash
# Run deployment script
./deploy-multi-tenancy.sh

# Or manually
cd rica-api
npm start

# Deploy rica-landing
cd rica-landing
npm run build
# Upload to hosting
```

### 5. Verify

```bash
# Check ingress
kubectl get ingress --all-namespaces

# Test API
curl https://api.rica.example.com/api/tenants/pricing/estimate

# Test provisioning
# Use the web UI
```

## Next Steps

1. **Read Full Documentation**: `MULTI_TENANCY_GUIDE.md`
2. **Review Implementation**: `MULTI_TENANCY_IMPLEMENTATION_SUMMARY.md`
3. **Customize Tiers**: Edit `rica-api/tenantManager.js` TIER_CONFIGS
4. **Add Monitoring**: Set up Prometheus/Grafana
5. **Configure Backups**: Implement backup strategy
6. **Security Audit**: Review RBAC and NetworkPolicies

## Support

- 📖 Documentation: `MULTI_TENANCY_GUIDE.md`
- 🐛 Issues: GitHub Issues
- 💬 Community: Discord/Slack
- 📧 Email: support@rica.example.com

## Resources

- Kubernetes Documentation: https://kubernetes.io/docs/
- kubectl Cheat Sheet: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- Ingress-nginx: https://kubernetes.github.io/ingress-nginx/
- Cert-manager: https://cert-manager.io/docs/

---

**Happy Multi-Tenanting! 🎉**
