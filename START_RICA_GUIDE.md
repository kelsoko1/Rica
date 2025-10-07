# Start Rica Core Services - Complete Guide

## Overview
This guide will help you start Rica UI (port 3030), Rica Landing (port 3000), and Rica API (port 3001) with all the new updates.

---

## 🚀 Quick Start (Recommended)

### Method 1: Using the Startup Script

```bash
cd /root/Rica

# Make script executable
chmod +x start-rica-core-services.sh

# Run the script
./start-rica-core-services.sh
```

**This script will:**
1. ✅ Check prerequisites
2. ✅ Create Docker network
3. ✅ Stop conflicting services
4. ✅ Fix Rica API dependencies
5. ✅ Build all Docker images
6. ✅ Start all services
7. ✅ Verify health
8. ✅ Display access URLs

---

### Method 2: Using Docker Compose

```bash
cd /root/Rica

# Ensure network exists
docker network create rica-network 2>/dev/null || true

# Fix Rica API dependencies first
cd rica-api
rm -rf node_modules package-lock.json
npm install
cd ..

# Start all core services
docker-compose -f docker-compose.core-services.yml up -d

# Check status
docker-compose -f docker-compose.core-services.yml ps

# View logs
docker-compose -f docker-compose.core-services.yml logs -f
```

---

## 📋 Step-by-Step Manual Setup

### Step 1: Prepare the Environment

```bash
cd /root/Rica

# Create Docker network
docker network create rica-network

# Stop any conflicting services
docker stop rica-ui rica-api rica-landing 2>/dev/null || true
docker rm rica-ui rica-api rica-landing 2>/dev/null || true
```

### Step 2: Fix Rica API Dependencies

```bash
cd /root/Rica/rica-api

# Remove old dependencies
rm -rf node_modules package-lock.json

# Install fresh dependencies
npm install

# Verify installation
ls -la node_modules
ls -la package-lock.json

cd ..
```

### Step 3: Build Docker Images

```bash
# Build Rica API
docker build -t rica-api:latest ./rica-api

# Build Rica UI
docker build -t rica-ui:latest ./rica-ui

# Build Rica Landing
docker build -t rica-landing:latest ./rica-landing

# Verify images
docker images | grep rica
```

### Step 4: Start Rica API

```bash
docker run -d \
  --name rica-api \
  --network rica-network \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e OLLAMA_URL=http://ollama:11434 \
  -e OLLAMA_EXTERNAL_URL=http://localhost:2022 \
  -e API_KEY=changeme_in_production \
  -e ACTIVEPIECES_URL=http://activepieces:80 \
  --restart unless-stopped \
  rica-api:latest

# Wait for API to start
sleep 10

# Test API
curl http://localhost:3001/health
```

### Step 5: Start Rica UI

```bash
docker run -d \
  --name rica-ui \
  --network rica-network \
  -p 3030:80 \
  -e NODE_ENV=production \
  -e REACT_APP_API_URL=http://localhost:3001 \
  -e REACT_APP_RICA_UI_PORT=3030 \
  --restart unless-stopped \
  rica-ui:latest

# Wait for UI to start
sleep 10

# Test UI
curl http://localhost:3030
```

### Step 6: Start Rica Landing

```bash
docker run -d \
  --name rica-landing \
  --network rica-network \
  -p 3000:80 \
  -e NODE_ENV=production \
  --restart unless-stopped \
  rica-landing:latest

# Wait for Landing to start
sleep 10

# Test Landing
curl http://localhost:3000
```

### Step 7: Verify All Services

```bash
# Check running containers
docker ps | grep rica

# Check health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep rica

# Test all endpoints
curl http://localhost:3001/health  # Rica API
curl http://localhost:3030         # Rica UI
curl http://localhost:3000         # Rica Landing
```

---

## 🌐 Access Your Services

Once all services are running:

| Service | URL | Purpose |
|---------|-----|---------|
| **Rica UI** | http://localhost:3030 | Main dashboard with all features |
| **Rica API** | http://localhost:3001 | Backend API for multi-tenancy |
| **Rica Landing** | http://localhost:3000 | Payment and subscription portal |

### Additional Services (if running)
| Service | URL | Purpose |
|---------|-----|---------|
| Activepieces | http://localhost:2020 | Automation platform |
| Code Server | http://localhost:2021 | VS Code in browser |
| Ollama | http://localhost:2022 | AI models |

---

## 🔍 Verification Checklist

Run these commands to verify everything is working:

```bash
# 1. Check Docker containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Check health status
docker inspect --format='{{.State.Health.Status}}' rica-api
docker inspect --format='{{.State.Health.Status}}' rica-ui
docker inspect --format='{{.State.Health.Status}}' rica-landing

# 3. Test endpoints
curl -I http://localhost:3001/health
curl -I http://localhost:3030
curl -I http://localhost:3000

# 4. Check logs for errors
docker logs rica-api --tail 20
docker logs rica-ui --tail 20
docker logs rica-landing --tail 20
```

**Expected Results:**
- ✅ All containers show "Up" status
- ✅ Health status shows "healthy" (after 30 seconds)
- ✅ All curl commands return 200 OK
- ✅ No errors in logs

---

## 🔧 Troubleshooting

### Problem: Rica API Won't Start

**Symptoms:**
- Container exits immediately
- Health check fails
- Error in logs about dependencies

**Solution:**
```bash
# Fix dependencies
cd /root/Rica/rica-api
rm -rf node_modules package-lock.json
npm install

# Rebuild image
cd ..
docker build -t rica-api:latest ./rica-api

# Restart container
docker rm -f rica-api
docker run -d --name rica-api --network rica-network -p 3001:3001 \
  -e NODE_ENV=production -e PORT=3001 \
  -e OLLAMA_URL=http://ollama:11434 \
  -e API_KEY=changeme_in_production \
  rica-api:latest

# Check logs
docker logs -f rica-api
```

### Problem: Port Already in Use

**Symptoms:**
- Error: "port is already allocated"

**Solution:**
```bash
# Find what's using the port
netstat -tulpn | grep :3030

# Kill the process
kill -9 <PID>

# Or stop the conflicting container
docker stop <container-name>
```

### Problem: Services Can't Communicate

**Symptoms:**
- Rica UI can't reach Rica API
- 502 Bad Gateway errors

**Solution:**
```bash
# Check network
docker network inspect rica-network

# Reconnect containers
docker network connect rica-network rica-ui
docker network connect rica-network rica-api
docker network connect rica-network rica-landing

# Restart services
docker restart rica-ui rica-api rica-landing
```

### Problem: Health Checks Failing

**Symptoms:**
- Container shows "unhealthy" status

**Solution:**
```bash
# Wait longer (health checks take 30 seconds)
sleep 30
docker ps

# Check health manually
curl http://localhost:3001/health
curl http://localhost:3030
curl http://localhost:3000

# Check logs
docker logs rica-api --tail 50
```

### Problem: Build Fails

**Symptoms:**
- Docker build fails with npm errors

**Solution:**
```bash
# For Rica API
cd /root/Rica/rica-api
rm -rf node_modules package-lock.json
npm install
cd ..

# For Rica UI
cd /root/Rica/rica-ui
rm -rf node_modules package-lock.json build
npm install
cd ..

# For Rica Landing
cd /root/Rica/rica-landing
rm -rf node_modules package-lock.json build
npm install
cd ..

# Rebuild all
docker build --no-cache -t rica-api:latest ./rica-api
docker build --no-cache -t rica-ui:latest ./rica-ui
docker build --no-cache -t rica-landing:latest ./rica-landing
```

---

## 📊 Monitoring

### View Logs

```bash
# Real-time logs
docker logs -f rica-api
docker logs -f rica-ui
docker logs -f rica-landing

# Last 100 lines
docker logs --tail 100 rica-api

# Since specific time
docker logs --since 2024-01-01T00:00:00 rica-api
```

### Check Resource Usage

```bash
# All containers
docker stats

# Specific containers
docker stats rica-ui rica-api rica-landing

# One-time snapshot
docker stats --no-stream
```

### Check Container Details

```bash
# Full details
docker inspect rica-api

# Specific field
docker inspect --format='{{.State.Status}}' rica-api
docker inspect --format='{{.NetworkSettings.IPAddress}}' rica-api
```

---

## 🔄 Managing Services

### Restart Services

```bash
# Restart all
docker restart rica-ui rica-api rica-landing

# Restart one
docker restart rica-api
```

### Stop Services

```bash
# Stop all
docker stop rica-ui rica-api rica-landing

# Stop one
docker stop rica-api
```

### Remove Services

```bash
# Remove all (keeps images)
docker rm -f rica-ui rica-api rica-landing

# Remove with volumes
docker rm -f -v rica-ui rica-api rica-landing
```

### Update Services

```bash
# Rebuild images
docker build -t rica-api:latest ./rica-api
docker build -t rica-ui:latest ./rica-ui
docker build -t rica-landing:latest ./rica-landing

# Stop old containers
docker stop rica-ui rica-api rica-landing
docker rm rica-ui rica-api rica-landing

# Start new containers
./start-rica-core-services.sh
```

---

## 🎯 Common Tasks

### Change API Key

```bash
# Stop Rica API
docker stop rica-api

# Start with new key
docker run -d --name rica-api --network rica-network -p 3001:3001 \
  -e NODE_ENV=production \
  -e API_KEY=your_new_secure_key_here \
  -e OLLAMA_URL=http://ollama:11434 \
  rica-api:latest
```

### Enable Debug Mode

```bash
# Stop service
docker stop rica-api

# Start with debug
docker run -d --name rica-api --network rica-network -p 3001:3001 \
  -e NODE_ENV=development \
  -e DEBUG=* \
  rica-api:latest

# View debug logs
docker logs -f rica-api
```

### Backup Configuration

```bash
# Backup Docker images
docker save rica-api:latest | gzip > rica-api-backup.tar.gz
docker save rica-ui:latest | gzip > rica-ui-backup.tar.gz
docker save rica-landing:latest | gzip > rica-landing-backup.tar.gz

# Restore
gunzip -c rica-api-backup.tar.gz | docker load
```

---

## 📚 Additional Resources

- **Full Deployment Guide**: `DEPLOYMENT_GUIDE_UPDATED.md`
- **Port Mapping**: `PORT_MAPPING_UPDATED.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Fix Errors**: `FIX_DEPLOYMENT_ERRORS.md`

---

## ✅ Success Criteria

Your setup is successful when:

1. ✅ All three containers are running:
   ```bash
   docker ps | grep -E "rica-ui|rica-api|rica-landing"
   ```

2. ✅ All health checks pass:
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}"
   ```

3. ✅ All services respond:
   ```bash
   curl http://localhost:3001/health  # Returns {"status":"ok"}
   curl http://localhost:3030         # Returns HTML
   curl http://localhost:3000         # Returns HTML
   ```

4. ✅ You can access in browser:
   - http://localhost:3030 (Rica UI)
   - http://localhost:3001/health (Rica API)
   - http://localhost:3000 (Rica Landing)

---

## 🆘 Need Help?

If you encounter issues:

1. **Check logs**: `docker logs <container-name>`
2. **Run verification**: `./verify-all-fixes.sh`
3. **Check status**: `docker ps`
4. **Review docs**: `DEPLOYMENT_GUIDE_UPDATED.md`

---

**Last Updated**: 2025-10-07  
**Version**: 2.0  
**Status**: Production Ready
