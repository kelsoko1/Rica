# Fix Deployment Errors - Quick Guide

## Problem
The deployment failed because `rica-api/package-lock.json` is out of sync with `package.json`.

## Solution

### Option 1: Fix Dependencies and Deploy (Recommended)

```bash
cd /root/Rica

# Fix the rica-api dependencies
chmod +x fix-rica-api-deps.sh
./fix-rica-api-deps.sh

# Now deploy everything
./deploy-rica-fixed.sh
```

### Option 2: Deploy Without Building (Faster)

```bash
cd /root/Rica

# Deploy only pre-built services
chmod +x deploy-rica-simple.sh
./deploy-rica-simple.sh

# This will start:
# - Activepieces (port 2020)
# - Code Server (port 2021)
# - Ollama (port 2022)
# - Rica Landing (port 3000)
```

### Option 3: Manual Fix

```bash
cd /root/Rica/rica-api

# Remove old dependencies
rm -rf node_modules package-lock.json

# Install fresh dependencies
npm install

# Go back and deploy
cd ..
./deploy-rica-fixed.sh
```

---

## What Was Fixed

### 1. Dockerfile Updated
Changed from `npm ci` to `npm install` to handle package-lock.json sync issues:
```dockerfile
# Before
RUN npm ci --production

# After  
RUN npm install --production --no-optional
```

### 2. Removed OpenCTI/OpenBAS Dependencies
These services were removed from the project, so we cleaned up references:
- ✅ Removed from `docker-compose.master.yml` depends_on
- ✅ Removed environment variables
- ✅ Removed unused volumes (es_data, minio_data, rabbitmq_data)

### 3. Created Helper Scripts
- ✅ `fix-rica-api-deps.sh` - Fixes package-lock.json issues
- ✅ `deploy-rica-simple.sh` - Deploys without building
- ✅ All scripts are now executable

---

## Quick Test

After fixing, test with:

```bash
# Test headless servers
curl http://localhost:2020  # Activepieces
curl http://localhost:2021  # Code Server
curl http://localhost:2022/api/tags  # Ollama

# Test Rica services (if deployed)
curl http://localhost:3000  # Rica Landing
curl http://localhost:3001/health  # Rica API
curl http://localhost:3030  # Rica UI
```

---

## Current Service Status

Based on your output, currently running:
- ✅ rica-landing (port 3000)
- ✅ ollama (port 2022) - unhealthy
- ✅ code-server (port 2021) - healthy
- ✅ activepieces (port 2020) - unhealthy
- ✅ activepieces-postgres - healthy
- ✅ activepieces-redis - healthy

### Fix Unhealthy Services

```bash
# Restart Ollama (takes 2-3 minutes to become healthy)
docker restart ollama
sleep 120
docker ps

# Restart Activepieces
docker restart activepieces
sleep 60
docker ps

# Check health
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## Recommended Deployment Steps

### Step 1: Fix Dependencies
```bash
cd /root/Rica
./fix-rica-api-deps.sh
```

### Step 2: Deploy Services
```bash
# Option A: Deploy everything (requires building)
./deploy-rica-fixed.sh

# Option B: Deploy only pre-built services (faster)
./deploy-rica-simple.sh
```

### Step 3: Verify
```bash
# Check all containers
docker ps

# Test services
curl http://localhost:2020  # Activepieces
curl http://localhost:2021  # Code Server
curl http://localhost:2022/api/tags  # Ollama
curl http://localhost:3000  # Rica Landing
curl http://localhost:3001/health  # Rica API (if deployed)
curl http://localhost:3030  # Rica UI (if deployed)
```

### Step 4: Fix Unhealthy Services
```bash
# Restart unhealthy services
docker restart ollama activepieces

# Wait for health checks
sleep 120

# Verify
docker ps
```

---

## Troubleshooting

### Error: "npm ci can only install packages when..."
**Solution**: Run `./fix-rica-api-deps.sh`

### Error: "Port already in use"
```bash
# Find what's using the port
netstat -tulpn | grep :3030

# Kill the process
kill -9 <PID>
```

### Error: "Network rica-network not found"
```bash
docker network create rica-network
```

### Services Still Unhealthy After Restart
```bash
# Check logs
docker logs ollama --tail 50
docker logs activepieces --tail 50

# For Ollama, pull models
docker exec ollama ollama pull deepseek-r1:1.5b
docker exec ollama ollama pull llama3.2:3b

# For Activepieces, check database
docker exec activepieces-postgres psql -U activepieces -d activepieces -c "SELECT 1"
```

---

## Files Modified

### Configuration Files
- ✅ `rica-api/Dockerfile` - Changed npm ci to npm install
- ✅ `docker-compose.master.yml` - Removed OpenCTI/OpenBAS dependencies
- ✅ All port configurations verified

### New Scripts
- ✅ `fix-rica-api-deps.sh` - Fix package-lock.json
- ✅ `deploy-rica-simple.sh` - Deploy without building
- ✅ `FIX_DEPLOYMENT_ERRORS.md` - This guide

---

## Next Steps

1. **Fix Dependencies**:
   ```bash
   ./fix-rica-api-deps.sh
   ```

2. **Deploy**:
   ```bash
   ./deploy-rica-simple.sh  # Fast, no building
   # OR
   ./deploy-rica-fixed.sh   # Full deployment with building
   ```

3. **Verify**:
   ```bash
   docker ps
   docker logs -f rica-api  # If deployed
   ```

4. **Access Services**:
   - Rica Landing: http://localhost:3000
   - Activepieces: http://localhost:2020
   - Code Server: http://localhost:2021
   - Ollama: http://localhost:2022

---

## Support

If issues persist:
1. Check logs: `docker logs <container-name>`
2. Review: `DEPLOYMENT_GUIDE_UPDATED.md`
3. Run: `./check-rica-status.sh`

---

**Last Updated**: 2025-10-07
**Status**: Ready to Deploy
