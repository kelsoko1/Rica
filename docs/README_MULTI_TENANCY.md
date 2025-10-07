# Rica Multi-Tenancy System

## 🎯 Overview

Rica's multi-tenancy system provides **complete isolation** for each user's environment using Kubernetes namespaces. After the unified rica-landing experience, users get their own isolated Rica-UI instance with dedicated headless servers, ensuring **security**, **scalability**, and **cost management** through an integrated credit system.

## ✨ Key Features

- 🔒 **Complete Isolation** - Each user gets their own Kubernetes namespace
- 💳 **Credit-Based Billing** - Pay only for what you use ($0.04 per credit)
- 🚀 **Instant Provisioning** - Automated deployment in minutes
- 📊 **Three Subscription Tiers** - Pay-As-You-Go, Personal, Team
- 🔐 **Enterprise Security** - RBAC, NetworkPolicy, Secret Management
- 📈 **Auto-Scaling** - Resources scale with your needs
- 🌐 **Unique URLs** - Each tenant gets `https://{username}-{id}.rica.example.com`
- 🔄 **Seamless Integration** - Works with existing Firebase auth and ClickPesa payments

## 📁 Project Structure

```
Rica/
├── k8s/                                    # Kubernetes templates
│   ├── tenant-namespace-template.yaml      # Namespace, quotas, RBAC
│   ├── tenant-rica-ui-deployment.yaml      # Rica UI deployment
│   ├── tenant-headless-servers.yaml        # All headless servers
│   └── tenant-ingress.yaml                 # Ingress configuration
│
├── rica-api/                               # Backend API
│   ├── tenantManager.js                    # Tenant lifecycle management
│   ├── creditResourceManager.js            # Credit-based resource management
│   └── tenantRoutes.js                     # REST API endpoints
│
├── rica-landing/src/                       # Frontend
│   ├── services/
│   │   └── tenantService.js                # Tenant API client
│   └── components/
│       ├── TenantProvisioning.jsx          # Provisioning UI
│       └── TenantProvisioning.css          # Styling
│
└── Documentation/
    ├── MULTI_TENANCY_GUIDE.md              # Complete guide
    ├── MULTI_TENANCY_QUICKSTART.md         # Quick start
    ├── MULTI_TENANCY_ARCHITECTURE.md       # Architecture diagrams
    └── MULTI_TENANCY_IMPLEMENTATION_SUMMARY.md  # Implementation details
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Windows
cd rica-api && npm install && cd ..
cd rica-landing && npm install && cd ..

# Or run deployment script
deploy-multi-tenancy.bat
```

### 2. Start Services

```bash
# Start API server
cd rica-api
npm start

# Start landing page (in another terminal)
cd rica-landing
npm start
```

### 3. Provision Your First Tenant

1. Visit http://localhost:3000
2. Sign up / Log in
3. Purchase credits (minimum 10 for Pay-As-You-Go)
4. Navigate to Tenant Provisioning
5. Select a tier and click "Provision"
6. Wait for deployment (2-5 minutes)
7. Access your environment at the provided URL

## 💰 Pricing

### Subscription Tiers

| Tier | Min Credits | CPU | Memory | Storage | Monthly Cost* |
|------|-------------|-----|--------|---------|---------------|
| **Pay-As-You-Go** | 10 | 500m | 1Gi | 5Gi | $172.80 |
| **Personal** | 50 | 2000m | 4Gi | 20Gi | $460.80 |
| **Team** | 100 | 4000m | 8Gi | 50Gi | $921.60 |

*Based on 24/7 usage at $0.04 per credit

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

### Credit Packages

- **Basic**: $10 = 250 credits
- **Standard**: $50 = 1,250 credits
- **Premium**: $100 = 2,500 credits
- **Enterprise**: Custom pricing

## 🏗️ Architecture

### High-Level Overview

```
User → Rica-Landing → Firebase Auth → Purchase Credits → 
Select Tier → Provision Tenant → Kubernetes Deployment → 
Access Isolated Environment
```

### Components

1. **Rica-Landing** - User-facing frontend for provisioning
2. **Rica-API** - Backend service managing tenants
3. **Tenant Manager** - Kubernetes resource orchestration
4. **Credit Resource Manager** - Credit tracking and enforcement
5. **Kubernetes Cluster** - Infrastructure for tenant isolation

### Tenant Isolation

Each tenant gets:
- ✅ Dedicated Kubernetes namespace
- ✅ Resource quotas (CPU, memory, storage)
- ✅ Network isolation (NetworkPolicy)
- ✅ RBAC permissions
- ✅ Unique secrets
- ✅ Persistent storage
- ✅ Custom subdomain

## 🔐 Security

### Multi-Layer Security

1. **Authentication** - Firebase ID token verification
2. **Authorization** - RBAC with minimal permissions
3. **Network Isolation** - NetworkPolicy enforcement
4. **Resource Isolation** - Dedicated namespaces
5. **Data Protection** - Encrypted secrets, TLS/SSL

### Compliance

- ✅ Data isolation per tenant
- ✅ Audit logging
- ✅ Secret rotation
- ✅ Network segmentation
- ✅ Access control

## 📊 Monitoring

### Real-Time Monitoring

- Credit usage tracking (every 5 minutes)
- Resource utilization (CPU, memory, storage)
- Pod health checks
- Service availability
- Network traffic

### Alerts

- **Low Credits** (< 50) - Warning notification
- **Critical Credits** (< 10) - Urgent alert
- **Zero Credits** - Automatic suspension
- **Resource Limits** - Quota exceeded alerts
- **Pod Failures** - Service disruption alerts

## 🔄 Lifecycle Management

### Provisioning

1. User selects tier
2. Credit validation
3. Namespace creation
4. Resource deployment
5. Ingress configuration
6. Credit tracking starts
7. User redirected to environment

### Suspension

- Triggered when credits reach zero
- Pods scaled to 0 replicas
- Data preserved
- User notified
- Resume when credits added

### Deprovisioning

- User-initiated or admin action
- All resources deleted
- Data backed up (optional)
- Namespace removed
- Final credit usage calculated

## 📈 Scalability

### Horizontal Scaling

- Multiple rica-api instances
- Load balancer distribution
- Stateless design

### Vertical Scaling

- Tier upgrades (Pay-As-You-Go → Personal → Team)
- Dynamic resource allocation
- No downtime

### Cluster Scaling

- Auto-scaling based on demand
- Multi-zone deployment
- Regional distribution

## 🛠️ Development

### Local Development

```bash
# Use Minikube or Docker Desktop Kubernetes
minikube start --cpus=4 --memory=8192

# Install add-ons
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Start services
cd rica-api && npm start
cd rica-landing && npm start
```

### Testing

```bash
# Test API
curl http://localhost:3001/api/tenants/pricing/estimate

# Test provisioning
# Use the web UI or curl with proper headers
```

### Deployment

```bash
# Run deployment script
./deploy-multi-tenancy.sh  # Linux/Mac
deploy-multi-tenancy.bat   # Windows

# Or deploy manually
# See MULTI_TENANCY_GUIDE.md for detailed instructions
```

## 📚 Documentation

- **[Complete Guide](MULTI_TENANCY_GUIDE.md)** - Comprehensive documentation
- **[Quick Start](MULTI_TENANCY_QUICKSTART.md)** - Get started in 5 minutes
- **[Architecture](MULTI_TENANCY_ARCHITECTURE.md)** - System diagrams
- **[Implementation Summary](MULTI_TENANCY_IMPLEMENTATION_SUMMARY.md)** - Technical details

## 🤝 Integration

### With Existing Systems

✅ **Firebase Authentication** - Seamless user management  
✅ **ClickPesa Payments** - Existing payment flow  
✅ **Credit System** - Integrated credit tracking  
✅ **Rica-UI** - Isolated instances per tenant  
✅ **Headless Servers** - OpenCTI, OpenBAS, Activepieces, etc.

### API Endpoints

- `POST /api/tenants/provision` - Create new tenant
- `GET /api/tenants/my-tenant` - Get user's tenant
- `PUT /api/tenants/:id/tier` - Upgrade tier
- `GET /api/tenants/:id/credits` - Credit usage
- `DELETE /api/tenants/:id` - Deprovision

See [API Documentation](MULTI_TENANCY_GUIDE.md#api-endpoints) for full details.

## 🐛 Troubleshooting

### Common Issues

**Provisioning Fails**
- Check credit balance
- Verify Kubernetes connection
- Review pod logs

**Tenant Not Accessible**
- Verify DNS configuration
- Check ingress status
- Test SSL certificates

**Services Not Starting**
- Check resource quotas
- Review pod events
- Verify secrets

See [Troubleshooting Guide](MULTI_TENANCY_GUIDE.md#troubleshooting) for solutions.

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Multi-tenancy architecture
- ✅ Credit-based resource management
- ✅ Three subscription tiers
- ✅ Automated provisioning

### Phase 2 (Q1 2025)
- ⏳ Auto-scaling (HPA)
- ⏳ Advanced monitoring (Prometheus/Grafana)
- ⏳ Backup & restore
- ⏳ Multi-region support

### Phase 3 (Q2 2025)
- ⏳ Custom domains
- ⏳ White-label options
- ⏳ Enterprise tier
- ⏳ Advanced analytics

## 🙏 Support

- 📖 **Documentation**: See docs folder
- 🐛 **Issues**: GitHub Issues
- 💬 **Community**: Discord/Slack
- 📧 **Email**: support@rica.example.com

## 📄 License

Copyright © 2025 Rica. All rights reserved.

---

## 🎉 Get Started Now!

```bash
# Clone the repository
git clone https://github.com/your-org/rica.git

# Run deployment script
cd rica
./deploy-multi-tenancy.sh

# Start using Rica!
```

**Built with ❤️ by the Rica Team**
