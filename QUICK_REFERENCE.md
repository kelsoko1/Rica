# Rica Quick Reference Card

## 🚀 Quick Start

### Local Deployment (5 minutes)
```bash
cd /root/Rica
./deploy-rica-fixed.sh
```

### Kubernetes Deployment (10 minutes)
```bash
cd /root/Rica
export API_KEY=$(openssl rand -hex 32)
./deploy-k8s-multi-tenancy.sh
```

---

## 🌐 Service URLs

### Local Development
| Service | URL | Purpose |
|---------|-----|---------|
| Rica UI | http://localhost:3030 | Main dashboard |
| Rica API | http://localhost:3001 | Backend API |
| Rica Landing | http://localhost:3000 | Payment portal |
| Activepieces | http://localhost:2020 | Automation |
| Code Server | http://localhost:2021 | VS Code |
| Ollama | http://localhost:2022 | AI models |

### Production (Kubernetes)
```
https://{username}-{tenant-id}.rica.example.com
```

---

## 📋 Common Commands

### Docker

```bash
# Start all services
docker-compose -f docker-compose.master.yml up -d

# Stop all services
docker-compose -f docker-compose.master.yml down

# View logs
docker logs -f rica-ui
docker logs -f rica-api

# Restart service
docker restart rica-ui

# Check status
docker ps

# View stats
docker stats
```

### Kubernetes

```bash
# Deploy Rica API
./deploy-k8s-multi-tenancy.sh

# Check status
kubectl get pods -n rica-system

# View logs
kubectl logs -f -n rica-system -l app=rica-api

# Scale API
kubectl scale deployment rica-api -n rica-system --replicas=3

# Provision tenant
./provision-tenant.sh user@example.com personal

# Check tenant
./check-tenant-status.sh <tenant-id>
```

---

## 🔧 Troubleshooting

### Service Not Starting
```bash
# Check logs
docker logs <container-name>

# Restart service
docker restart <container-name>

# Rebuild and restart
docker-compose -f docker-compose.master.yml up -d --build
```

### Port Conflict
```bash
# Find what's using port
netstat -tulpn | grep :3030

# Kill process
kill -9 <PID>
```

### Ollama Unhealthy
```bash
# Restart Ollama
docker restart ollama

# Pull models
docker exec ollama ollama pull deepseek-r1:1.5b
```

### Network Issues
```bash
# Recreate network
docker network rm rica-network
docker network create rica-network
docker-compose -f docker-compose.master.yml up -d
```

---

## 🧪 Testing

### Quick Test
```bash
./test-rica-services.sh
```

### Manual Test
```bash
curl http://localhost:3030          # Rica UI
curl http://localhost:3001/health   # Rica API
curl http://localhost:3000          # Rica Landing
curl http://localhost:2020          # Activepieces
curl http://localhost:2021          # Code Server
curl http://localhost:2022/api/tags # Ollama
```

### Verify All Fixes
```bash
./verify-all-fixes.sh
```

---

## 📊 Monitoring

### Container Health
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
docker inspect --format='{{.State.Health.Status}}' rica-ui
```

### Resource Usage
```bash
docker stats --no-stream
```

### Kubernetes Metrics
```bash
kubectl top pods -n rica-system
kubectl top nodes
```

---

## 💾 Backup

### Quick Backup
```bash
# Backup Ollama data
docker run --rm -v ollama_data:/data -v $(pwd):/backup alpine tar czf /backup/ollama-backup.tar.gz /data

# Backup database
docker exec activepieces-postgres pg_dump -U activepieces activepieces > backup.sql
```

---

## 🔐 Security

### Change API Key
```bash
# Edit .env file
nano .env

# Update API_KEY value
API_KEY=your_new_secure_key_here

# Restart services
docker-compose -f docker-compose.master.yml restart
```

### View Secrets (Kubernetes)
```bash
kubectl get secrets -n rica-system
kubectl get secret rica-api-secret -n rica-system -o yaml
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview |
| `PORT_MAPPING_UPDATED.md` | Port reference |
| `DEPLOYMENT_GUIDE_UPDATED.md` | Complete deployment guide |
| `FIXES_APPLIED_SUMMARY.md` | All fixes applied |
| `QUICK_REFERENCE.md` | This document |

---

## 🆘 Help

### Scripts
```bash
./deploy-rica-fixed.sh           # Deploy locally
./deploy-k8s-multi-tenancy.sh    # Deploy to K8s
./test-rica-services.sh          # Test services
./verify-all-fixes.sh            # Verify fixes
./check-rica-status.sh           # Check status
./fix-rica-services.sh           # Fix issues
```

### Logs
```bash
# Docker
docker logs <container-name>
docker logs -f <container-name>  # Follow

# Kubernetes
kubectl logs -f -n rica-system -l app=rica-api
```

### Status
```bash
# Docker
docker ps
docker stats

# Kubernetes
kubectl get all -n rica-system
kubectl get pods -A
```

---

## 🎯 Quick Fixes

### Everything Not Working?
```bash
# Nuclear option - restart everything
docker-compose -f docker-compose.master.yml down
docker network create rica-network
./deploy-rica-fixed.sh
```

### One Service Not Working?
```bash
# Restart just that service
docker restart <service-name>
```

### Kubernetes Issues?
```bash
# Restart Rica API
kubectl rollout restart deployment/rica-api -n rica-system

# Delete and redeploy
kubectl delete deployment rica-api -n rica-system
./deploy-k8s-multi-tenancy.sh
```

---

## 📞 Support Checklist

Before asking for help:
1. ✅ Run `./verify-all-fixes.sh`
2. ✅ Check logs: `docker logs <container>`
3. ✅ Check status: `docker ps`
4. ✅ Try restarting: `docker restart <container>`
5. ✅ Review documentation

---

**Version:** 2.0  
**Last Updated:** 2025-10-07  
**Status:** Production Ready
