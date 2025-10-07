# Rica Quick Fix Guide 🚀

## Current Issues Summary

| Issue | Severity | Impact |
|-------|----------|--------|
| Rica-UI not running | 🔴 Critical | Main dashboard unavailable |
| Rica-API not running | 🔴 Critical | Multi-tenancy features unavailable |
| Port 3000 conflict | 🟡 High | rica-landing blocking rica-ui |
| Ollama unhealthy | 🟡 Medium | AI features may not work |
| Activepieces unhealthy | 🟡 Medium | Automation may not work |
| Nginx not running | 🟢 Low | Direct port access still works |

---

## 🎯 Quick Fix (5 Minutes)

Run these commands on your Linux server (srv1017792):

```bash
# Navigate to Rica directory
cd /root/Rica

# Make scripts executable
chmod +x check-rica-status.sh fix-rica-services.sh

# Run the fix script
./fix-rica-services.sh

# Wait 30 seconds for services to stabilize
sleep 30

# Check status
./check-rica-status.sh
```

---

## 🔧 Manual Fix Steps

### Step 1: Fix Port Conflict (2 min)
```bash
# Stop rica-landing (currently on port 3000)
docker stop rica-landing

# Start rica-ui on port 3000
docker-compose -f docker-compose.rica-ui.yml up -d

# Restart rica-landing on a different port (edit compose file first)
# Or access it via nginx when that's running
```

### Step 2: Start Rica-API (2 min)
```bash
cd /root/Rica/rica-api

# Install dependencies (if not already done)
npm install

# Start the API server
npm start &

# Or use PM2 for production
pm2 start index.js --name rica-api
```

### Step 3: Fix Unhealthy Services (1 min)
```bash
# Restart Ollama
docker restart ollama

# Restart Activepieces
docker restart activepieces

# Wait for health checks
sleep 30
docker ps
```

---

## ✅ Verification

After running the fixes, verify everything is working:

```bash
# Check all containers
docker ps

# Expected output should show:
# - rica-ui (healthy)
# - rica-landing (healthy)
# - activepieces (healthy)
# - code-server (healthy)
# - ollama (healthy)
# - activepieces-postgres (healthy)
# - activepieces-redis (healthy)

# Test services
curl http://localhost:3000  # Rica UI
curl http://localhost:3001  # Rica API
curl http://localhost:2020  # Activepieces
curl http://localhost:2021  # Code Server
curl http://localhost:2022  # Ollama
```

---

## 🌐 Access Your Services

Once everything is running:

| Service | URL | Purpose |
|---------|-----|---------|
| **Rica UI** | http://localhost:3000 | Main dashboard |
| **Rica API** | http://localhost:3001 | Backend API |
| **Rica Landing** | http://localhost:3002 | Payment portal |
| **Activepieces** | http://localhost:2020 | Automation |
| **Code Server** | http://localhost:2021 | VS Code |
| **Ollama** | http://localhost:2022 | AI models |

---

## 🆘 If Something Goes Wrong

### Ollama Still Unhealthy?
```bash
# Check logs
docker logs ollama --tail 50

# Common fix: Pull models
docker exec ollama ollama pull deepseek-r1:1.5b
docker exec ollama ollama pull llama3.2:3b

# Restart
docker restart ollama
```

### Activepieces Still Unhealthy?
```bash
# Check logs
docker logs activepieces --tail 50

# Check database
docker exec activepieces-postgres psql -U activepieces -d activepieces -c "SELECT 1"

# Nuclear option: Fresh start
docker-compose -f docker-compose.activepieces.yml down -v
docker-compose -f docker-compose.activepieces.yml up -d
```

### Rica-API Won't Start?
```bash
# Check Node.js version (needs v18+)
node --version

# Check for port conflicts
netstat -tulpn | grep :3001

# Check logs
cd /root/Rica/rica-api
npm start
# Look for error messages
```

### Port Already in Use?
```bash
# Find what's using the port
netstat -tulpn | grep :3000

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yml
```

---

## 🚀 Start Everything from Scratch

If you want to start fresh:

```bash
cd /root/Rica

# Stop everything
docker-compose -f docker-compose.master.yml down
docker stop $(docker ps -aq) 2>/dev/null

# Remove old containers (keeps data)
docker-compose -f docker-compose.master.yml down

# Ensure network exists
docker network create rica-network 2>/dev/null || true

# Start everything
docker-compose -f docker-compose.master.yml up -d

# Wait for initialization
sleep 60

# Check status
docker ps
./check-rica-status.sh
```

---

## 📊 Health Check Commands

```bash
# Quick status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Detailed health
docker inspect --format='{{.Name}}: {{.State.Health.Status}}' $(docker ps -q)

# View logs
docker logs <container-name> --tail 50 -f

# Resource usage
docker stats --no-stream

# Network connectivity
docker network inspect rica-network
```

---

## 💡 Pro Tips

1. **Always check logs first:** `docker logs <container> --tail 50`
2. **Wait for health checks:** Services can take 30-60 seconds to become healthy
3. **Check network:** All containers should be on `rica-network`
4. **Port conflicts:** Use `netstat` or `ss` to find what's using a port
5. **Fresh start:** Sometimes `docker-compose down -v && docker-compose up -d` fixes everything

---

## 📞 Need More Help?

1. Run: `./check-rica-status.sh` for detailed status
2. Check: `CURRENT_STATUS_REPORT.md` for comprehensive analysis
3. Review: `README.md` for full documentation
4. Logs: `docker logs <container-name>` for specific issues

---

**Quick Reference:**
- Status Check: `./check-rica-status.sh`
- Fix Script: `./fix-rica-services.sh`
- Start All: `docker-compose -f docker-compose.master.yml up -d`
- Stop All: `docker-compose -f docker-compose.master.yml down`
- View Logs: `docker-compose -f docker-compose.master.yml logs -f`
