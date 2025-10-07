# Rica Deployment Guide - Updated Configuration

## Overview
This guide covers deploying Rica with the updated port configuration and multi-tenancy support.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Port Configuration](#port-configuration)
3. [Local Deployment](#local-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Multi-Tenancy Setup](#multi-tenancy-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- Kubernetes 1.24+ (for production)
- kubectl (for Kubernetes deployment)

### System Requirements
- **Minimum**: 4 CPU cores, 8GB RAM, 50GB storage
- **Recommended**: 8 CPU cores, 16GB RAM, 100GB storage
- **Production**: 16+ CPU cores, 32GB+ RAM, 500GB+ storage

---

## Port Configuration

### Updated Port Mapping
```
Core Services:
  Rica UI:        3030  (changed from 3000)
  Rica API:       3001  (unchanged)
  Rica Landing:   3000  (unchanged)

Headless Servers:
  Activepieces:   2020  (unchanged)
  Code Server:    2021  (unchanged)
  Ollama:         2022  (external), 11434 (internal)
```

### Why the Change?
- **Rica UI** moved to port 3030 to avoid conflicts with Rica Landing
- **Rica Landing** remains on port 3000 for payment/subscription portal
- **Ollama** uses internal port 11434, exposed as 2022 for consistency

---

## Local Deployment

### Quick Start (5 minutes)

```bash
# 1. Clone the repository
cd /root/Rica

# 2. Create network
docker network create rica-network

# 3. Deploy all services
chmod +x deploy-rica-fixed.sh
./deploy-rica-fixed.sh

# 4. Wait for services to start (60 seconds)
sleep 60

# 5. Test services
./test-rica-services.sh
```

### Manual Deployment

```bash
# 1. Create network
docker network create rica-network

# 2. Start all services
docker-compose -f docker-compose.master.yml up -d

# 3. Check status
docker ps

# 4. View logs
docker-compose -f docker-compose.master.yml logs -f
```

### Individual Service Deployment

```bash
# Start only Rica UI and API
docker-compose -f docker-compose.rica-ui.yml up -d

# Start only headless servers
docker-compose -f docker-compose.headless-servers.yml up -d

# Start only Rica Landing
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Rica API
NODE_ENV=production
PORT=3001
API_KEY=your_secure_api_key_here

# Ollama
OLLAMA_URL=http://ollama:11434
OLLAMA_EXTERNAL_URL=http://localhost:2022

# Activepieces
AP_API_KEY=your_activepieces_api_key
AP_ENCRYPTION_KEY=your_encryption_key
AP_JWT_SECRET=your_jwt_secret

# PostgreSQL
POSTGRES_PASSWORD=your_postgres_password

# Registry (for Kubernetes)
REGISTRY=your.registry.com
```

---

## Kubernetes Deployment

### Prerequisites

```bash
# 1. Ensure kubectl is configured
kubectl cluster-info

# 2. Install cert-manager (for SSL)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# 3. Install nginx-ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

### Deploy Multi-Tenancy Infrastructure

```bash
# 1. Set environment variables
export API_KEY=$(openssl rand -hex 32)
export REGISTRY=your.registry.com

# 2. Run deployment script
chmod +x deploy-k8s-multi-tenancy.sh
./deploy-k8s-multi-tenancy.sh

# 3. Verify deployment
kubectl get pods -n rica-system
kubectl get svc -n rica-system
```

### Build and Push Images

```bash
# 1. Build Rica UI
cd rica-ui
docker build -t $REGISTRY/rica-ui:latest .
docker push $REGISTRY/rica-ui:latest

# 2. Build Rica API
cd ../rica-api
docker build -t $REGISTRY/rica-api:latest .
docker push $REGISTRY/rica-api:latest

# 3. Build Rica Landing
cd ../rica-landing
docker build -t $REGISTRY/rica-landing:latest .
docker push $REGISTRY/rica-landing:latest
```

### Deploy Individual Components

```bash
# Deploy Rica API
kubectl apply -f k8s/rica-api-deployment.yaml

# Deploy Rica UI
kubectl apply -f k8s/rica-ui-deployment.yaml

# Deploy Rica Landing
kubectl apply -f k8s/rica-landing-deployment.yaml
```

---

## Multi-Tenancy Setup

### Provision a New Tenant

```bash
# Using the helper script
./provision-tenant.sh user@example.com personal

# Or using curl
curl -X POST http://localhost:3001/api/tenants/provision \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "user@example.com",
    "subscriptionTier": "personal",
    "userId": "user-123"
  }'
```

### Subscription Tiers

#### Pay-As-You-Go
- **Resources**: 500m CPU, 1Gi RAM, 5Gi storage
- **Features**: Activepieces, Code Server, Ollama
- **Cost**: ~$144/month

#### Personal
- **Resources**: 2000m CPU, 4Gi RAM, 20Gi storage
- **Features**: All features
- **Cost**: ~$230/month

#### Team
- **Resources**: 4000m CPU, 8Gi RAM, 50Gi storage
- **Features**: All features + priority support
- **Cost**: ~$461/month

### Manage Tenants

```bash
# Check tenant status
./check-tenant-status.sh <tenant-id>

# List all tenants
curl -X GET http://localhost:3001/api/tenants \
  -H "x-api-key: YOUR_API_KEY"

# Update tenant tier
curl -X PUT http://localhost:3001/api/tenants/<tenant-id>/tier \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tier": "team"}'

# Deprovision tenant
curl -X DELETE http://localhost:3001/api/tenants/<tenant-id> \
  -H "x-api-key: YOUR_API_KEY"
```

### Tenant Access

Each tenant gets a unique subdomain:
```
https://{username}-{tenant-id}.rica.example.com
```

Example:
```
https://john-abc123.rica.example.com
```

---

## Troubleshooting

### Services Not Starting

```bash
# Check Docker logs
docker logs rica-ui
docker logs rica-api
docker logs ollama

# Check if ports are in use
netstat -tulpn | grep -E "3030|3001|3000|2020|2021|2022"

# Restart services
docker-compose -f docker-compose.master.yml restart
```

### Port Conflicts

```bash
# Find what's using a port
lsof -i :3030
# or
ss -tulpn | grep :3030

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yml
```

### Ollama Not Responding

```bash
# Check Ollama logs
docker logs ollama

# Restart Ollama
docker restart ollama

# Pull required models
docker exec ollama ollama pull deepseek-r1:1.5b
docker exec ollama ollama pull llama3.2:3b

# Test Ollama
curl http://localhost:2022/api/tags
```

### Activepieces Unhealthy

```bash
# Check logs
docker logs activepieces
docker logs activepieces-postgres

# Check database connection
docker exec activepieces-postgres psql -U activepieces -d activepieces -c "SELECT 1"

# Restart with fresh database
docker-compose -f docker-compose.activepieces.yml down -v
docker-compose -f docker-compose.activepieces.yml up -d
```

### Kubernetes Issues

```bash
# Check pod status
kubectl get pods -n rica-system

# Check pod logs
kubectl logs -f -n rica-system -l app=rica-api

# Describe pod for events
kubectl describe pod <pod-name> -n rica-system

# Check service endpoints
kubectl get endpoints -n rica-system

# Check ingress
kubectl get ingress -n rica-system
kubectl describe ingress rica-api-ingress -n rica-system
```

### Network Issues

```bash
# Check Docker network
docker network inspect rica-network

# Reconnect containers
docker network connect rica-network rica-ui
docker network connect rica-network rica-api

# Recreate network
docker network rm rica-network
docker network create rica-network
docker-compose -f docker-compose.master.yml up -d
```

### Health Check Failures

```bash
# Test health endpoints
curl http://localhost:3030/          # Rica UI
curl http://localhost:3001/health    # Rica API
curl http://localhost:3000/          # Rica Landing
curl http://localhost:2020/          # Activepieces
curl http://localhost:2021/          # Code Server
curl http://localhost:2022/api/tags  # Ollama

# Check container health
docker inspect --format='{{.State.Health.Status}}' rica-ui
docker inspect --format='{{.State.Health.Status}}' rica-api
```

---

## Monitoring

### Container Stats

```bash
# Real-time stats
docker stats

# Specific container
docker stats rica-ui

# Export to file
docker stats --no-stream > stats.txt
```

### Logs

```bash
# View logs
docker logs rica-ui
docker logs -f rica-api  # Follow logs

# Last 100 lines
docker logs --tail 100 ollama

# Since timestamp
docker logs --since 2024-01-01T00:00:00 rica-api
```

### Kubernetes Monitoring

```bash
# Pod metrics
kubectl top pods -n rica-system

# Node metrics
kubectl top nodes

# Events
kubectl get events -n rica-system --sort-by='.lastTimestamp'
```

---

## Backup and Restore

### Backup

```bash
# Backup volumes
docker run --rm -v ollama_data:/data -v $(pwd):/backup alpine tar czf /backup/ollama-backup.tar.gz /data

# Backup database
docker exec activepieces-postgres pg_dump -U activepieces activepieces > backup.sql

# Backup tenant data (Kubernetes)
kubectl get all -n rica-tenant-<id> -o yaml > tenant-backup.yaml
```

### Restore

```bash
# Restore volume
docker run --rm -v ollama_data:/data -v $(pwd):/backup alpine tar xzf /backup/ollama-backup.tar.gz -C /

# Restore database
docker exec -i activepieces-postgres psql -U activepieces activepieces < backup.sql

# Restore tenant (Kubernetes)
kubectl apply -f tenant-backup.yaml
```

---

## Security

### Best Practices

1. **Change default passwords** in `.env` file
2. **Use strong API keys** (32+ characters)
3. **Enable SSL/TLS** in production
4. **Restrict network access** with firewall rules
5. **Regular updates** of Docker images
6. **Backup regularly** (daily recommended)
7. **Monitor logs** for suspicious activity

### Firewall Configuration

```bash
# Allow only necessary ports
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 3030/tcp   # Block direct Rica UI access
ufw deny 3001/tcp   # Block direct API access
ufw deny 2020/tcp   # Block direct Activepieces access
ufw deny 2021/tcp   # Block direct Code Server access
ufw deny 2022/tcp   # Block direct Ollama access
```

---

## Performance Tuning

### Docker

```bash
# Increase Docker resources
# Edit /etc/docker/daemon.json
{
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}

# Restart Docker
systemctl restart docker
```

### Kubernetes

```yaml
# Increase resource limits
resources:
  requests:
    cpu: 2000m
    memory: 4Gi
  limits:
    cpu: 4000m
    memory: 8Gi
```

---

## Support

For issues or questions:
1. Check logs: `docker logs <container-name>`
2. Review documentation in `/root/Rica/docs/`
3. Run status check: `./check-rica-status.sh`
4. Run fix script: `./fix-rica-services.sh`

---

**Last Updated:** 2025-10-07
**Version:** 2.0
**Status:** Production Ready
