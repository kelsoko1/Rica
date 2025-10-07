# Rica Multi-Tenancy Architecture Guide

## Overview

Rica's multi-tenancy system provides complete isolation for each user's environment using Kubernetes namespaces. Each user gets their own isolated Rica-UI instance with dedicated headless servers, ensuring security, scalability, and resource management through a credit-based system.

## Architecture

### Components

1. **Tenant Manager** (`rica-api/tenantManager.js`)
   - Provisions and deprovisions tenant environments
   - Manages Kubernetes resources
   - Handles tenant lifecycle

2. **Credit Resource Manager** (`rica-api/creditResourceManager.js`)
   - Integrates credit system with resource allocation
   - Monitors credit usage per tenant
   - Enforces resource limits based on available credits

3. **Tenant API Routes** (`rica-api/tenantRoutes.js`)
   - REST API endpoints for tenant management
   - Authentication and authorization
   - Credit validation

4. **Tenant Service** (`rica-landing/src/services/tenantService.js`)
   - Client-side service for tenant operations
   - Communicates with Tenant API
   - Manages tenant state in rica-landing

5. **Tenant Provisioning UI** (`rica-landing/src/components/TenantProvisioning.jsx`)
   - User interface for provisioning tenants
   - Displays tenant status and information
   - Handles tier upgrades

## Subscription Tiers

### Pay As You Go
- **Minimum Credits**: 10
- **Resources**: 500m CPU, 1Gi Memory, 5Gi Storage
- **Features**:
  - Rica UI Dashboard
  - Activepieces Automation
  - Code Server (VS Code)
  - Ollama AI Assistant
  - 5 Browser Profiles
  - 2 Teams
- **Hourly Cost**: ~6 credits/hour
- **Monthly Estimate**: ~$172.80

### Personal
- **Minimum Credits**: 50
- **Resources**: 2000m CPU, 4Gi Memory, 20Gi Storage
- **Features**:
  - All Pay-As-You-Go features
  - OpenCTI Threat Intelligence
  - OpenBAS Security Simulations
  - 20 Browser Profiles
  - 5 Teams
- **Hourly Cost**: ~16 credits/hour
- **Monthly Estimate**: ~$460.80

### Team
- **Minimum Credits**: 100
- **Resources**: 4000m CPU, 8Gi Memory, 50Gi Storage
- **Features**:
  - All Personal features
  - 100 Browser Profiles
  - 20 Teams
  - Advanced Analytics
  - Dedicated Support
- **Hourly Cost**: ~32 credits/hour
- **Monthly Estimate**: ~$921.60

## Kubernetes Resources

### Namespace Isolation

Each tenant gets a dedicated namespace: `rica-tenant-{TENANT_ID}`

**Included Resources**:
- ResourceQuota - Limits CPU, memory, storage
- LimitRange - Pod-level resource constraints
- NetworkPolicy - Network isolation
- ServiceAccount - RBAC permissions
- Role & RoleBinding - Namespace-scoped permissions

### Deployed Services

1. **Rica UI** - Main dashboard interface
2. **OpenCTI** - Threat intelligence platform (Personal/Team tiers)
3. **OpenBAS** - Security simulation platform (Personal/Team tiers)
4. **Activepieces** - Automation platform
5. **Code Server** - VS Code in browser
6. **Ollama** - Local LLM server
7. **PostgreSQL** - Database for services
8. **Redis** - Caching and queuing

### Ingress Configuration

Each tenant gets a unique subdomain:
```
https://{username}-{tenant-id}.rica.example.com
```

**Path Routing**:
- `/` - Rica UI
- `/opencti` - OpenCTI
- `/openbas` - OpenBAS
- `/activepieces` - Activepieces
- `/code` - Code Server
- `/ollama` - Ollama API

## Credit-Based Resource Management

### Credit Costs (per hour)

| Feature | Credits/Hour |
|---------|-------------|
| Rica UI | 1 |
| OpenCTI | 5 |
| OpenBAS | 3 |
| Activepieces | 2 |
| Code Server | 2 |
| Ollama | 4 |
| Storage | 0.1 per GB |

### Credit Monitoring

The system automatically:
- Tracks credit usage in real-time
- Warns users when credits are low (< 50)
- Alerts when credits are critical (< 10)
- Suspends tenant when credits reach zero
- Resumes tenant when credits are added

### Credit Thresholds

- **Low Warning**: 50 credits remaining
- **Critical Warning**: 10 credits remaining
- **Suspension**: 0 credits
- **Minimum for Provisioning**:
  - Pay-As-You-Go: 10 credits
  - Personal: 50 credits
  - Team: 100 credits

## Provisioning Flow

### 1. User Authentication
```javascript
// User logs in via Firebase Auth
const user = auth.currentUser;
```

### 2. Credit Check
```javascript
// Check if user has sufficient credits
const creditCheck = await creditResourceManager.canProvisionTenant(
  userId,
  userCredits,
  subscriptionTier
);
```

### 3. Tenant Provisioning
```javascript
// Provision tenant environment
const tenant = await tenantManager.provisionTenant(
  userEmail,
  subscriptionTier,
  userId
);
```

### 4. Resource Deployment
- Create Kubernetes namespace
- Apply resource quotas and limits
- Deploy Rica UI
- Deploy headless servers
- Configure ingress

### 5. Credit Tracking
```javascript
// Start monitoring credit usage
creditResourceManager.startCreditTracking(tenantId, userId);
```

### 6. User Redirection
```javascript
// Redirect to tenant environment
window.location.href = tenant.url;
```

## API Endpoints

### Provision Tenant
```http
POST /api/tenants/provision
Headers:
  x-user-id: {userId}
  x-user-email: {userEmail}
Body:
  {
    "subscriptionTier": "personal",
    "userCredits": 250
  }
```

### Get My Tenant
```http
GET /api/tenants/my-tenant
Headers:
  x-user-id: {userId}
  x-user-email: {userEmail}
```

### Get Tenant Status
```http
GET /api/tenants/{tenantId}/status
Headers:
  x-user-id: {userId}
  x-user-email: {userEmail}
```

### Update Tier
```http
PUT /api/tenants/{tenantId}/tier
Headers:
  x-user-id: {userId}
  x-user-email: {userEmail}
Body:
  {
    "newTier": "team",
    "userCredits": 500
  }
```

### Get Credit Usage
```http
GET /api/tenants/{tenantId}/credits
Headers:
  x-user-id: {userId}
  x-user-email: {userEmail}
```

### Check Credits
```http
POST /api/tenants/{tenantId}/check-credits
Headers:
  x-user-id: {userId}
  x-user-email: {userEmail}
Body:
  {
    "currentCredits": 150
  }
```

### Suspend Tenant
```http
POST /api/tenants/{tenantId}/suspend
Headers:
  x-user-id: {userId}
  x-user-email: {userEmail}
Body:
  {
    "reason": "Insufficient credits"
  }
```

### Resume Tenant
```http
POST /api/tenants/{tenantId}/resume
Headers:
  x-user-id: {userId}
  x-user-email: {userEmail}
```

### Deprovision Tenant
```http
DELETE /api/tenants/{tenantId}
Headers:
  x-user-id: {userId}
  x-user-email: {userEmail}
```

### Get Pricing Estimates
```http
GET /api/tenants/pricing/estimate?tier=personal
```

## Security Features

### Network Isolation
- Each tenant namespace has NetworkPolicy
- Ingress only from ingress controller
- Egress to same namespace and DNS
- Internet access can be restricted per tier

### RBAC
- Dedicated ServiceAccount per tenant
- Namespace-scoped Role with minimal permissions
- RoleBinding limits access to tenant resources

### Secrets Management
- Unique secrets generated per tenant
- Base64 encoded in Kubernetes secrets
- Includes passwords for all services
- Auto-generated on provisioning

### Resource Quotas
- CPU and memory limits per tier
- Storage quotas enforced
- Pod count limits
- Prevents resource exhaustion

## Integration with Rica-Landing

### User Flow

1. **Sign Up/Login** → Firebase Authentication
2. **Purchase Credits** → ClickPesa Payment
3. **Select Tier** → Choose subscription tier
4. **Provision** → Create isolated environment
5. **Access Rica-UI** → Redirect to tenant URL

### Credit Integration

```javascript
// rica-landing checks credits before provisioning
const userCredits = creditService.getUserCredits(userId);

// Provision tenant if sufficient credits
if (userCredits >= minCredits) {
  await tenantService.provisionTenant(tier);
}

// Monitor credits during usage
tenantService.startTenantMonitoring(
  tenantId,
  onCreditWarning,
  onCriticalCredits
);
```

### PostMessage Communication

Rica-UI communicates with rica-landing for credit updates:

```javascript
// Rica-UI sends credit check request
window.parent.postMessage({
  type: 'CHECK_CREDITS',
  data: { tenantId }
}, 'https://rica.example.com');

// Rica-landing responds with credit status
window.postMessage({
  type: 'CREDIT_STATUS',
  data: {
    credits: 150,
    status: 'ok'
  }
}, tenantUrl);
```

## Deployment

### Prerequisites

1. **Kubernetes Cluster** (v1.24+)
   - kubectl configured
   - Sufficient resources for tenants

2. **Ingress Controller** (nginx-ingress)
   - SSL/TLS certificates
   - DNS wildcard configured

3. **Storage Class**
   - Dynamic provisioning enabled
   - Sufficient storage capacity

4. **Docker Registry**
   - Rica-UI image
   - Headless server images

### Installation Steps

1. **Install Dependencies**
```bash
cd rica-api
npm install @kubernetes/client-node js-yaml
```

2. **Configure Environment**
```bash
# rica-api/.env
DOCKER_REGISTRY=your-registry.com
KUBERNETES_CONFIG=/path/to/kubeconfig
```

3. **Update API Server**
```javascript
// rica-api/index.js
const tenantRoutes = require('./tenantRoutes');
const creditResourceManager = require('./creditResourceManager');

app.use('/api/tenants', tenantRoutes);

// Initialize credit monitoring
creditResourceManager.initialize();
```

4. **Deploy Rica-API**
```bash
cd rica-api
npm start
```

5. **Configure Rica-Landing**
```bash
# rica-landing/.env
REACT_APP_TENANT_API_URL=https://api.rica.example.com/api/tenants
```

6. **Build and Deploy**
```bash
cd rica-landing
npm run build
# Deploy to hosting
```

### Kubernetes Setup

1. **Create Network**
```bash
kubectl apply -f k8s/tenant-namespace-template.yaml
```

2. **Configure Ingress**
```yaml
# Update DNS wildcard
*.rica.example.com → Ingress Controller IP
```

3. **Install Cert-Manager** (for SSL)
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

## Monitoring and Maintenance

### Health Checks

Monitor tenant health:
```javascript
const status = await tenantManager.getTenantStatus(tenantId);
console.log(status.pods); // Pod status
console.log(status.services); // Service availability
```

### Credit Monitoring

Automatic monitoring runs every 5 minutes:
```javascript
creditResourceManager.checkAllTenantsCredits();
```

### Logs

View tenant logs:
```bash
# Get all pods in tenant namespace
kubectl get pods -n rica-tenant-{TENANT_ID}

# View logs
kubectl logs -n rica-tenant-{TENANT_ID} {pod-name}
```

### Metrics

Requires metrics-server:
```bash
# Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# View resource usage
kubectl top pods -n rica-tenant-{TENANT_ID}
kubectl top nodes
```

## Scaling Considerations

### Horizontal Scaling
- Rica-API can run multiple replicas
- Load balancer distributes requests
- Shared Kubernetes cluster access

### Vertical Scaling
- Adjust tier resource allocations
- Modify TIER_CONFIGS in tenantManager.js
- Update existing tenants with new quotas

### Cluster Scaling
- Add nodes to Kubernetes cluster
- Configure auto-scaling
- Monitor resource utilization

## Troubleshooting

### Provisioning Fails

**Check Credits**:
```javascript
const creditCheck = await creditResourceManager.canProvisionTenant(
  userId, userCredits, tier
);
console.log(creditCheck);
```

**Check Kubernetes**:
```bash
kubectl get namespaces | grep rica-tenant
kubectl describe namespace rica-tenant-{TENANT_ID}
```

### Tenant Not Accessible

**Check Ingress**:
```bash
kubectl get ingress -n rica-tenant-{TENANT_ID}
kubectl describe ingress -n rica-tenant-{TENANT_ID}
```

**Check DNS**:
```bash
nslookup {subdomain}.rica.example.com
```

### Services Not Starting

**Check Pods**:
```bash
kubectl get pods -n rica-tenant-{TENANT_ID}
kubectl describe pod {pod-name} -n rica-tenant-{TENANT_ID}
kubectl logs {pod-name} -n rica-tenant-{TENANT_ID}
```

**Check Resources**:
```bash
kubectl describe resourcequota -n rica-tenant-{TENANT_ID}
```

### Credit Tracking Issues

**Check Tracking**:
```javascript
const report = creditResourceManager.getCreditUsageReport(tenantId);
console.log(report);
```

**Reset Tracking**:
```javascript
creditResourceManager.stopCreditTracking(tenantId);
creditResourceManager.startCreditTracking(tenantId, userId);
```

## Best Practices

1. **Resource Management**
   - Set appropriate resource quotas
   - Monitor cluster capacity
   - Plan for growth

2. **Security**
   - Regular security audits
   - Update NetworkPolicies
   - Rotate secrets periodically

3. **Cost Optimization**
   - Monitor credit usage patterns
   - Adjust tier pricing as needed
   - Implement auto-suspend for inactive tenants

4. **User Experience**
   - Clear credit warnings
   - Smooth provisioning flow
   - Quick tenant access

5. **Monitoring**
   - Set up alerts for failures
   - Track provisioning success rate
   - Monitor resource utilization

## Future Enhancements

1. **Auto-Scaling**
   - Horizontal pod autoscaling
   - Cluster autoscaling
   - Dynamic resource allocation

2. **Backup & Restore**
   - Automated backups
   - Point-in-time recovery
   - Cross-region replication

3. **Advanced Monitoring**
   - Prometheus integration
   - Grafana dashboards
   - Custom metrics

4. **Multi-Region**
   - Deploy across regions
   - Geo-routing
   - Data sovereignty

5. **Advanced Tiers**
   - Enterprise tier
   - Custom resource allocation
   - Dedicated nodes

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-org/rica
- Email: support@rica.example.com
- Documentation: https://docs.rica.example.com

## License

Copyright © 2025 Rica. All rights reserved.
