# Rica Platform - Kubernetes Deployment Guide

## Overview

This guide explains how to deploy the entire Rica platform to Kubernetes with:
- **Rica UI on port 3030** (main dashboard)
- **Rica Landing on port 3000** (payment portal)
- **All services running persistently** (even after SSH disconnection)
- **Multi-tenancy support** with proper isolation
- **Auto-scaling and high availability**

---

## 📋 Prerequisites

### Required Software
- Kubernetes cluster (v1.24+)
- kubectl CLI tool
- Docker (for building images)
- Helm (optional, for easier management)

### Cluster Requirements
- Minimum 4 CPU cores
- Minimum 8GB RAM
- 100GB storage
- LoadBalancer or NodePort support

---

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
cd /root/Rica

# Make script executable
chmod +x deploy-to-k8s.sh

# Deploy everything
./deploy-to-k8s.sh

# Wait for deployment (2-5 minutes)
# Script will show access URLs when complete
```

### Option 2: Manual Deployment

```bash
cd /root/Rica

# Build Docker images
docker build -t localhost:5000/rica-ui:latest ./rica-ui
docker build -t localhost:5000/rica-api:latest ./rica-api
docker build -t localhost:5000/rica-landing:latest ./rica-landing

# Apply Kubernetes manifests
kubectl apply -f k8s/rica-complete-deployment.yaml

# Wait for pods to be ready
kubectl wait --for=condition=available --timeout=300s \
  deployment/rica-ui deployment/rica-api deployment/rica-landing \
  -n rica-platform

# Get access information
kubectl get services -n rica-platform
```

---

## 🔧 Configuration

### Port Mapping

| Service | Internal Port | NodePort | Purpose |
|---------|--------------|----------|---------|
| Rica UI | 80 | 30030 | Main dashboard |
| Rica Landing | 80 | 30000 | Payment portal |
| Rica API | 3001 | 30001 | Backend API |
| Activepieces | 80 | 30020 | Automation |
| Code Server | 8080 | 30021 | VS Code |
| Ollama | 11434 | 30022 | AI models |

### Environment Variables

Edit `k8s/rica-complete-deployment.yaml` to customize:

```yaml
# In ConfigMap section
data:
  api-url: "http://rica-api:3001"
  ollama-url: "http://ollama:11434"
  # ... other URLs

# In Secret section
stringData:
  api-key: "your_secure_api_key_here"
  postgres-password: "your_secure_postgres_password"
  # ... other secrets
```

### Resource Limits

Default resource allocations:

```yaml
# Rica UI
requests:
  cpu: "100m"
  memory: "128Mi"
limits:
  cpu: "300m"
  memory: "256Mi"

# Rica API
requests:
  cpu: "200m"
  memory: "256Mi"
limits:
  cpu: "500m"
  memory: "512Mi"

# Ollama (AI models)
requests:
  cpu: "500m"
  memory: "2Gi"
limits:
  cpu: "2000m"
  memory: "4Gi"
```

Adjust based on your cluster capacity.

---

## 🌐 Accessing Services

### Via NodePort (Development/Testing)

```bash
# Get node IP
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')

# Access services
echo "Rica UI:      http://${NODE_IP}:30030"
echo "Rica Landing: http://${NODE_IP}:30000"
echo "Rica API:     http://${NODE_IP}:30001"
```

### Via Ingress (Production)

1. **Install Nginx Ingress Controller:**

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

2. **Configure DNS:**

Point your domain to the ingress controller's external IP:

```bash
kubectl get service ingress-nginx-controller -n ingress-nginx
```

3. **Update Ingress manifest:**

Edit `k8s/rica-complete-deployment.yaml`:

```yaml
spec:
  tls:
  - hosts:
    - yourdomain.com  # Change this
    secretName: rica-tls
  rules:
  - host: yourdomain.com  # Change this
```

4. **Install cert-manager for SSL:**

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

5. **Access via domain:**

```
https://yourdomain.com           → Rica UI
https://yourdomain.com/landing   → Rica Landing
https://yourdomain.com/api       → Rica API
```

---

## 🔒 Multi-Tenancy Setup

### Enable Multi-Tenancy

The Rica API includes built-in multi-tenancy support with Kubernetes integration.

1. **Verify Rica API is running:**

```bash
kubectl get pods -n rica-platform -l app=rica-api
```

2. **Create a tenant:**

```bash
# Port-forward to Rica API
kubectl port-forward -n rica-platform svc/rica-api 3001:3001 &

# Create tenant via API
curl -X POST http://localhost:3001/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "username": "john_doe",
    "email": "john@example.com",
    "tier": "personal"
  }'
```

3. **Tenant will get:**
- Isolated namespace: `rica-tenant-<id>`
- Dedicated resources (CPU, memory, storage)
- Own instances of: Rica UI, Activepieces, Code Server, Ollama
- Unique subdomain: `https://john-doe-<id>.yourdomain.com`

### Tenant Tiers

| Tier | Credits | CPU | Memory | Storage | Monthly Cost |
|------|---------|-----|--------|---------|--------------|
| Pay-As-You-Go | 10 min | 500m | 1Gi | 5Gi | ~$144 |
| Personal | 50 min | 2000m | 4Gi | 20Gi | ~$230 |
| Team | 100 min | 4000m | 8Gi | 50Gi | ~$461 |

### Manage Tenants

```bash
# List all tenants
curl http://localhost:3001/api/tenants

# Get tenant status
curl http://localhost:3001/api/tenants/<tenant-id>/status

# Upgrade tenant tier
curl -X PUT http://localhost:3001/api/tenants/<tenant-id>/tier \
  -H "Content-Type: application/json" \
  -d '{"tier": "team"}'

# Add credits
curl -X POST http://localhost:3001/api/tenants/<tenant-id>/credits \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'

# Deprovision tenant
curl -X DELETE http://localhost:3001/api/tenants/<tenant-id>
```

---

## 📊 Monitoring & Management

### Check Deployment Status

```bash
# View all pods
kubectl get pods -n rica-platform

# View services
kubectl get services -n rica-platform

# View persistent volumes
kubectl get pvc -n rica-platform

# View ingress
kubectl get ingress -n rica-platform
```

### View Logs

```bash
# View logs for a specific pod
kubectl logs -f <pod-name> -n rica-platform

# View logs for a deployment
kubectl logs -f deployment/rica-ui -n rica-platform

# View logs for all containers in a pod
kubectl logs <pod-name> -n rica-platform --all-containers

# View previous logs (if pod restarted)
kubectl logs <pod-name> -n rica-platform --previous
```

### Scale Services

```bash
# Scale Rica UI to 3 replicas
kubectl scale deployment/rica-ui --replicas=3 -n rica-platform

# Scale Rica API to 5 replicas
kubectl scale deployment/rica-api --replicas=5 -n rica-platform

# Auto-scale based on CPU
kubectl autoscale deployment/rica-ui \
  --min=2 --max=10 --cpu-percent=80 \
  -n rica-platform
```

### Update Services

```bash
# Update Rica UI image
kubectl set image deployment/rica-ui \
  rica-ui=localhost:5000/rica-ui:v2.0 \
  -n rica-platform

# Rollout status
kubectl rollout status deployment/rica-ui -n rica-platform

# Rollback if needed
kubectl rollout undo deployment/rica-ui -n rica-platform
```

---

## 🐛 Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n rica-platform

# Common issues:
# 1. Image pull errors → Check registry access
# 2. Resource limits → Check cluster capacity
# 3. Volume mount errors → Check PVC status
```

### Services Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n rica-platform

# Check if pods are ready
kubectl get pods -n rica-platform

# Test service internally
kubectl run -it --rm debug --image=busybox --restart=Never -n rica-platform -- wget -O- http://rica-ui:3030
```

### Ollama Unhealthy

```bash
# Check Ollama logs
kubectl logs -f deployment/ollama -n rica-platform

# Common fix: Pull models
kubectl exec -it deployment/ollama -n rica-platform -- ollama pull deepseek-r1:1.5b
kubectl exec -it deployment/ollama -n rica-platform -- ollama pull llama3.2:3b

# Restart Ollama
kubectl rollout restart deployment/ollama -n rica-platform
```

### Activepieces Unhealthy

```bash
# Check Activepieces logs
kubectl logs -f deployment/activepieces -n rica-platform

# Check database connection
kubectl exec -it deployment/postgres -n rica-platform -- psql -U activepieces -d activepieces -c "SELECT 1"

# Restart Activepieces
kubectl rollout restart deployment/activepieces -n rica-platform
```

### Database Issues

```bash
# Check PostgreSQL logs
kubectl logs -f deployment/postgres -n rica-platform

# Access PostgreSQL shell
kubectl exec -it deployment/postgres -n rica-platform -- psql -U activepieces

# Check Redis
kubectl exec -it deployment/redis -n rica-platform -- redis-cli ping
```

### Persistent Volume Issues

```bash
# Check PVC status
kubectl get pvc -n rica-platform

# Check PV status
kubectl get pv

# Describe PVC for details
kubectl describe pvc <pvc-name> -n rica-platform

# If PVC stuck in Pending:
# 1. Check if storage class exists
# 2. Check if cluster has available storage
# 3. Check PV provisioner logs
```

---

## 🔐 Security Best Practices

### 1. Update Secrets

```bash
# Generate secure passwords
openssl rand -base64 32

# Update secrets in manifest
kubectl edit secret rica-secrets -n rica-platform
```

### 2. Enable RBAC

```bash
# Create service account with limited permissions
kubectl create serviceaccount rica-sa -n rica-platform

# Create role
kubectl create role rica-role \
  --verb=get,list,watch \
  --resource=pods,services \
  -n rica-platform

# Bind role
kubectl create rolebinding rica-binding \
  --role=rica-role \
  --serviceaccount=rica-platform:rica-sa \
  -n rica-platform
```

### 3. Network Policies

```bash
# Apply network policies to isolate tenants
kubectl apply -f k8s/tenant-namespace-template.yaml
```

### 4. Resource Quotas

Already included in deployment:
- CPU limits per pod
- Memory limits per pod
- Storage limits per PVC
- Namespace resource quotas for tenants

---

## 🔄 Backup & Recovery

### Backup Persistent Data

```bash
# Backup PostgreSQL
kubectl exec deployment/postgres -n rica-platform -- \
  pg_dump -U activepieces activepieces > postgres-backup.sql

# Backup Ollama models
kubectl cp rica-platform/ollama-pod:/root/.ollama ./ollama-backup

# Backup all PVCs
for pvc in $(kubectl get pvc -n rica-platform -o name); do
  kubectl get $pvc -n rica-platform -o yaml > ${pvc}.yaml
done
```

### Restore from Backup

```bash
# Restore PostgreSQL
kubectl exec -i deployment/postgres -n rica-platform -- \
  psql -U activepieces activepieces < postgres-backup.sql

# Restore Ollama models
kubectl cp ./ollama-backup rica-platform/ollama-pod:/root/.ollama
```

---

## 📈 Performance Optimization

### 1. Enable Horizontal Pod Autoscaling

```bash
# Install metrics server (if not already installed)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Enable HPA for Rica UI
kubectl autoscale deployment/rica-ui \
  --min=2 --max=10 --cpu-percent=70 \
  -n rica-platform

# Enable HPA for Rica API
kubectl autoscale deployment/rica-api \
  --min=2 --max=10 --cpu-percent=70 \
  -n rica-platform
```

### 2. Use Node Affinity

For better performance, pin resource-intensive services to specific nodes:

```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: node-type
            operator: In
            values:
            - high-memory  # For Ollama
```

### 3. Enable Pod Disruption Budgets

```bash
kubectl apply -f - <<EOF
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: rica-ui-pdb
  namespace: rica-platform
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: rica-ui
EOF
```

---

## 🎯 Production Checklist

Before going to production:

- [ ] Update all secrets with secure values
- [ ] Configure proper domain and SSL certificates
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure log aggregation (ELK or Loki)
- [ ] Enable backup automation
- [ ] Set up alerting for critical services
- [ ] Configure resource quotas and limits
- [ ] Enable network policies
- [ ] Set up CI/CD pipeline
- [ ] Document disaster recovery procedures
- [ ] Load test the platform
- [ ] Security audit and penetration testing

---

## 📞 Support & Resources

### Useful Commands Reference

```bash
# Quick status check
kubectl get all -n rica-platform

# Watch pod status
kubectl get pods -n rica-platform -w

# Get all events
kubectl get events -n rica-platform --sort-by='.lastTimestamp'

# Resource usage
kubectl top pods -n rica-platform
kubectl top nodes

# Delete everything
kubectl delete namespace rica-platform
```

### Documentation

- Main README: `/root/Rica/README.md`
- Multi-Tenancy Guide: `/root/Rica/docs/MULTI_TENANCY_GUIDE.md`
- API Documentation: `/root/Rica/rica-api/README.md`
- Kubernetes Docs: https://kubernetes.io/docs/

---

## 🎉 Success!

Your Rica platform is now running in Kubernetes with:
- ✅ Rica UI on port 3030
- ✅ Rica Landing on port 3000
- ✅ All services running persistently
- ✅ Multi-tenancy support enabled
- ✅ Auto-scaling configured
- ✅ High availability setup

**Services will continue running even after you disconnect from SSH!**

Access your platform:
- Rica UI: `http://<node-ip>:30030`
- Rica Landing: `http://<node-ip>:30000`

For production access, configure ingress with your domain.

---

**Last Updated:** 2025-10-07
**Version:** 1.0
