# Rica Multi-Tenant SaaS Kubernetes Deployment

This document provides comprehensive instructions for deploying Rica's multi-tenant SaaS platform with credit metering on Kubernetes.

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Docker (for building images)
- Helm (optional, for monitoring)

### Basic Deployment

```bash
# Linux/Mac
./deploy-rica.sh production deploy

# Windows
deploy-rica.bat production deploy
```

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Deployment Options](#deployment-options)
3. [Configuration](#configuration)
4. [Monitoring & Observability](#monitoring--observability)
5. [Tenant Management](#tenant-management)
6. [Troubleshooting](#troubleshooting)
7. [Security Considerations](#security-considerations)

## 🏗️ Architecture Overview

### Core Components

1. **Credit Metering Service** - Tracks resource usage and manages credits
2. **Resource Collector** - Monitors Kubernetes resources and reports usage
3. **PostgreSQL** - Persistent storage for usage records and tenant data
4. **Redis** - High-speed caching and real-time credit tracking

### Tenant Isolation

- Each tenant gets its own namespace with resource quotas
- Network policies ensure complete isolation
- RBAC provides minimal required permissions
- Separate databases and storage per tier

## 🚀 Deployment Options

### Option 1: Full Deployment (Recommended)

```bash
# Deploy everything
./deploy-rica.sh production deploy
```

This includes:
- ✅ Credit metering service with auto-scaling
- ✅ Resource collector for real-time monitoring
- ✅ PostgreSQL and Redis databases
- ✅ Prometheus monitoring stack
- ✅ Sample tenant for testing

### Option 2: Component-by-Component

```bash
# Just secrets
./deploy-rica.sh production secrets

# Just images
./deploy-rica.sh production build

# Just Kubernetes manifests
kubectl apply -f k8s-rica-multi-tenant.yml
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file or modify the generated secrets:

```bash
# Database
DATABASE_URL=postgresql://rica:password@postgres:5432/rica
REDIS_URL=redis://:password@redis:6379/0

# Credit Metering
PRICING_CPU=0.04
PRICING_MEMORY=0.008
PRICING_STORAGE=0.0002

# Collection
COLLECTION_INTERVAL=60000

# Monitoring
GRAFANA_PASSWORD=your-secure-password
```

### Resource Allocation

Default quotas per tier:

| Tier | CPU | Memory | Storage | Monthly Cost |
|------|-----|--------|---------|--------------|
| Pay-As-You-Go | 500m | 1Gi | 5Gi | ~$144 |
| Personal | 2000m | 4Gi | 20Gi | ~$230 |
| Team | 4000m | 8Gi | 50Gi | ~$461 |

## 📊 Monitoring & Observability

### Prometheus Metrics

The deployment includes ServiceMonitor configurations for automatic metric collection:

- `credit_deductions_total` - Credit usage by tenant and resource
- `credit_balance` - Current balance per tenant
- Kubernetes resource metrics (CPU, memory, storage)

### Grafana Dashboards

Access Grafana at `http://grafana.your-domain.com` with:
- Username: `admin`
- Password: Set via `GRAFANA_PASSWORD` environment variable

### Health Checks

All services include health check endpoints:
- Credit Metering: `/health`, `/ready`
- PostgreSQL: Database connectivity
- Redis: Connection and memory usage

## 👥 Tenant Management

### Creating Tenants

```bash
# Create a new tenant
TENANT_ID="my-company"
kubectl create namespace tenant-${TENANT_ID} \
  --labels=rica-tenant=true,tenant-id=${TENANT_ID},subscription-tier=personal

# Apply resource quotas
kubectl apply -f - <<EOF
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
```

### Managing Tenant Resources

```bash
# Check tenant usage
kubectl top pods -n tenant-${TENANT_ID}

# View tenant events
kubectl get events -n tenant-${TENANT_ID}

# Check resource quotas
kubectl describe resourcequota tenant-quota -n tenant-${TENANT_ID}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Pod Stuck in Pending

```bash
# Check resource quotas and limits
kubectl describe resourcequota -A

# Check node resources
kubectl describe nodes

# Check persistent volume claims
kubectl get pvc -A
```

#### 2. Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n rica-platform

# Check ingress controller
kubectl get ingress -A

# Check network policies
kubectl describe networkpolicy -A
```

#### 3. Database Connection Issues

```bash
# Check PostgreSQL logs
kubectl logs deployment/postgres -n rica-platform

# Test database connectivity
kubectl run postgres-client --rm -it --restart=Never --image=postgres:15-alpine \
  -- psql -h postgres -U rica -d rica
```

#### 4. Credit Metering Issues

```bash
# Check service logs
kubectl logs deployment/credit-metering-service -n rica-platform

# Verify Redis connectivity
kubectl exec deployment/redis -n rica-platform -- redis-cli ping

# Check metrics endpoint
curl http://credit-metering-service:3100/metrics
```

### Logs and Debugging

```bash
# Get all logs for a namespace
kubectl logs -f -n rica-platform --all-containers=true

# Get logs for specific deployment
kubectl logs -f deployment/credit-metering-service -n rica-platform

# Debug with temporary pod
kubectl run debug --rm -it --restart=Never --image=busybox:1.35 \
  -- sh -n rica-platform
```

## 🔒 Security Considerations

### Network Security

- All inter-service communication uses Kubernetes services
- Network policies restrict traffic between namespaces
- External access only through ingress controller

### Authentication & Authorization

- API keys required for credit metering API
- RBAC configured with minimal required permissions
- Secrets stored in Kubernetes secrets (encrypted at rest)

### Data Protection

- Database credentials rotated regularly
- TLS encryption for all external communications
- Audit logging for all credit operations

### Compliance

- Resource quotas prevent resource exhaustion
- Network isolation ensures tenant data separation
- Regular security updates and vulnerability scanning

## 📈 Scaling

### Horizontal Scaling

The credit metering service includes HPA configuration:

```yaml
# Scale based on CPU and memory
- type: Resource
  resource:
    name: cpu
    target:
      type: Utilization
      averageUtilization: 70
- type: Resource
  resource:
    name: memory
    target:
      type: Utilization
      averageUtilization: 80
```

### Manual Scaling

```bash
# Scale credit metering service
kubectl scale deployment credit-metering-service --replicas=5 -n rica-platform

# Scale resource collector
kubectl scale deployment resource-collector --replicas=2 -n rica-platform
```

## 🔄 Backup & Recovery

### Database Backups

```bash
# Create backup
kubectl exec deployment/postgres -n rica-platform -- \
  pg_dump -U rica rica > rica-backup-$(date +%Y%m%d-%H%M%S).sql

# Restore from backup
kubectl exec -i deployment/postgres -n rica-platform -- \
  psql -U rica rica < rica-backup.sql
```

### Persistent Volume Backups

```bash
# Snapshot PVCs (depends on your storage class)
kubectl create snapshot pvc-postgres -n rica-platform

# List snapshots
kubectl get volumesnapshot -A
```

## 🛠️ Development & Testing

### Local Development

```bash
# Run credit metering service locally
cd rica-api
npm install
npm start

# Run resource collector locally (requires kubeconfig)
node services/k8s-resource-collector.js
```

### Testing

```bash
# Test credit metering API
curl -X POST http://localhost:3100/api/usage \
  -H "X-Tenant-Id: test-tenant" \
  -d '{"resourceType": "cpu", "amount": 1.0}'

# Check metrics
curl http://localhost:3100/metrics
```

## 📞 Support

For issues and questions:

1. Check the troubleshooting guide above
2. Review Kubernetes logs: `kubectl logs -f -n rica-platform`
3. Check Grafana dashboards for metrics and alerts
4. Verify resource quotas and limits

## 🔄 Updates & Upgrades

### Rolling Updates

```bash
# Update deployment image
kubectl set image deployment/credit-metering-service \
  credit-metering=rica/credit-metering:v2.0.0 -n rica-platform

# Check rollout status
kubectl rollout status deployment/credit-metering-service -n rica-platform
```

### Database Migrations

```bash
# Apply database migrations
kubectl exec deployment/credit-metering-service -n rica-platform -- \
  npm run migrate
```

---

**Note**: This deployment provides production-ready multi-tenancy with enterprise-grade security, monitoring, and scalability features.
