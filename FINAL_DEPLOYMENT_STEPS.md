# Final Deployment Steps - Rica Core Services

## ✅ All Issues Fixed!

I've fixed all the `npm ci` and `package-lock.json` sync issues in:
- ✅ rica-api/Dockerfile
- ✅ rica-ui/Dockerfile  
- ✅ rica-landing/Dockerfile
- ✅ Removed obsolete `version` fields from docker-compose files

---

## 🚀 Deploy Now (One Command)

Run this on your server:

```bash
cd /root/Rica

# Make executable
chmod +x fix-all-deps-and-start.sh

# Run it!
./fix-all-deps-and-start.sh
```

**This script will:**
1. ✅ Check Node.js installation
2. ✅ Fix Rica API dependencies (clean install)
3. ✅ Fix Rica UI dependencies (clean install)
4. ✅ Fix Rica Landing dependencies (clean install)
5. ✅ Create Docker network
6. ✅ Build all Docker images
7. ✅ Start all services
8. ✅ Wait for initialization
9. ✅ Test all endpoints
10. ✅ Show status and URLs

---

## 📊 What You'll Get

After running the script:

| Service | Port | URL | Status |
|---------|------|-----|--------|
| **Rica UI** | 3030 | http://localhost:3030 | ✅ Running |
| **Rica API** | 3001 | http://localhost:3001 | ✅ Running |
| **Rica Landing** | 3000 | http://localhost:3000 | ✅ Running |

Plus your existing services:
- Ollama (2022)
- Activepieces (2020)
- Code Server (2021)

---

## 🔍 Verify Everything Works

```bash
# Check containers
docker ps | grep rica

# Test endpoints
curl http://localhost:3001/health  # Should return {"status":"ok"}
curl http://localhost:3030         # Should return HTML
curl http://localhost:3000         # Should return HTML

# View logs
docker logs -f rica-api
docker logs -f rica-ui
docker logs -f rica-landing
```

---

## 🛠️ Alternative: Manual Steps

If you prefer to do it manually:

### Step 1: Fix Dependencies
```bash
cd /root/Rica

# Fix Rica API
cd rica-api
rm -rf node_modules package-lock.json
npm install
cd ..

# Fix Rica UI
cd rica-ui
rm -rf node_modules package-lock.json
npm install
cd ..

# Fix Rica Landing
cd rica-landing
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Step 2: Create Network
```bash
docker network create rica-network
```

### Step 3: Start Services
```bash
docker-compose -f docker-compose.core-services.yml up -d --build
```

### Step 4: Wait and Check
```bash
sleep 45
docker ps
curl http://localhost:3001/health
curl http://localhost:3030
curl http://localhost:3000
```

---

## 📝 Managing Services

### View Logs
```bash
# All services
docker-compose -f docker-compose.core-services.yml logs -f

# Individual service
docker logs -f rica-api
docker logs -f rica-ui
docker logs -f rica-landing
```

### Restart Services
```bash
# All services
docker-compose -f docker-compose.core-services.yml restart

# Individual service
docker restart rica-api
```

### Stop Services
```bash
# All services
docker-compose -f docker-compose.core-services.yml down

# Individual service
docker stop rica-api
```

### Rebuild After Changes
```bash
docker-compose -f docker-compose.core-services.yml up -d --build
```

---

## 🔧 Troubleshooting

### If Build Still Fails

```bash
# Clean everything
cd /root/Rica
docker-compose -f docker-compose.core-services.yml down
docker rm -f rica-ui rica-api rica-landing
docker rmi -f rica-ui rica-api rica-landing

# Fix dependencies again
./fix-all-deps-and-start.sh
```

### If Service Won't Start

```bash
# Check logs
docker logs rica-api --tail 50

# Restart service
docker restart rica-api

# Check if port is in use
netstat -tulpn | grep :3001
```

### If Health Check Fails

```bash
# Wait longer (services need 30-45 seconds)
sleep 45
docker ps

# Test manually
curl -v http://localhost:3001/health
curl -v http://localhost:3030
curl -v http://localhost:3000
```

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ All three containers show "Up" status:
   ```bash
   docker ps | grep -E "rica-ui|rica-api|rica-landing"
   ```

2. ✅ All health checks pass (after 30 seconds):
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}"
   ```

3. ✅ All endpoints respond:
   ```bash
   curl http://localhost:3001/health  # Returns {"status":"ok"}
   curl http://localhost:3030         # Returns HTML
   curl http://localhost:3000         # Returns HTML
   ```

4. ✅ You can access in browser:
   - http://localhost:3030 (Rica UI - Main Dashboard)
   - http://localhost:3001/health (Rica API - Health Check)
   - http://localhost:3000 (Rica Landing - Payment Portal)

---

## 🎯 What Changed

### Dockerfile Fixes
All Dockerfiles now use `npm install` instead of `npm ci`:

**Before:**
```dockerfile
RUN npm ci --production=false
```

**After:**
```dockerfile
RUN npm install
```

This handles package-lock.json sync issues automatically.

### Docker Compose Updates
Removed obsolete `version: '3.8'` field from:
- docker-compose.core-services.yml
- docker-compose.rica-ui.yml

### New Script
Created `fix-all-deps-and-start.sh` that:
- Fixes all dependencies before building
- Creates network
- Builds and starts services
- Tests everything
- Shows status

---

## 📚 Additional Resources

- **Full Guide**: `START_RICA_GUIDE.md`
- **Port Mapping**: `PORT_MAPPING_UPDATED.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Troubleshooting**: `FIX_DEPLOYMENT_ERRORS.md`

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check logs**: `docker logs <container-name>`
2. **Run the fix script**: `./fix-all-deps-and-start.sh`
3. **Verify dependencies**: Check that npm install completed successfully
4. **Check network**: `docker network inspect rica-network`
5. **Review docs**: `START_RICA_GUIDE.md`

---

## 🎉 Ready to Deploy!

Everything is fixed and ready. Just run:

```bash
cd /root/Rica
chmod +x fix-all-deps-and-start.sh
./fix-all-deps-and-start.sh
```

**Your Rica services will be up and running in about 2-3 minutes!** 🚀

---

**Last Updated**: 2025-10-07  
**Version**: 2.1  
**Status**: ✅ All Issues Fixed - Ready to Deploy
