# Docker Network Conflict Fix

## Problem
Multiple Docker Compose files were creating the `rica-network` independently, causing conflicts when running multiple services together.

## Solution
All Docker Compose files now use an **external network** that must be created first.

---

## Quick Fix Steps

### 1. Create the Network (One Time Only)
```bash
docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1
```

Or use the network compose file:
```bash
docker-compose -f docker-compose.network.yml up -d
```

### 2. Verify Network Created
```bash
docker network ls | grep rica-network
```

You should see:
```
NETWORK ID     NAME           DRIVER    SCOPE
xxxxxxxxx      rica-network   bridge    local
```

### 3. Start Your Services
Now you can start any Docker Compose file without conflicts:
```bash
docker-compose up -d
# or
docker-compose -f docker-compose.prod.yml up -d
# or
docker-compose -f docker-compose.activepieces.yml up -d
```

---

## What Was Changed

### Files Modified (7 files)
1. `docker-compose.prod.yml`
2. `docker-compose.activepieces.yml`
3. `docker-compose.code-server.yml`
4. `docker-compose.ollama.yml`
5. `docker-compose.headless-servers.yml`
6. `docker-compose.master.yml`
7. **NEW:** `docker-compose.network.yml`

### Network Definition Change

**Before (Caused Conflicts):**
```yaml
networks:
  rica-network:
    driver: bridge
```

**After (No Conflicts):**
```yaml
networks:
  rica-network:
    external: true
    name: rica-network
```

---

## Network Details

### Network Configuration
- **Name:** `rica-network`
- **Driver:** bridge
- **Subnet:** 172.25.0.0/16
- **Gateway:** 172.25.0.1
- **IP Range:** 172.25.0.0 - 172.25.255.255

### Benefits
- ✅ No more network conflicts
- ✅ All services can communicate
- ✅ Persistent network across restarts
- ✅ Can run multiple compose files simultaneously
- ✅ Clean network management

---

## Troubleshooting

### Error: "network rica-network not found"
**Solution:** Create the network first
```bash
docker network create rica-network
```

### Error: "network rica-network already exists"
**Solution:** This is fine! The network is already created. Just start your services.

### Error: "network has active endpoints"
**Solution:** Stop all containers first, then recreate the network
```bash
docker-compose down
docker network rm rica-network
docker network create rica-network --driver bridge --subnet 172.25.0.0/16
docker-compose up -d
```

### Check Network Connectivity
```bash
# List all containers on the network
docker network inspect rica-network

# Test connectivity between containers
docker exec <container-name> ping <other-container-name>
```

---

## Complete Cleanup and Reset

If you want to start fresh:

### 1. Stop All Services
```bash
docker-compose down
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.activepieces.yml down
docker-compose -f docker-compose.code-server.yml down
docker-compose -f docker-compose.ollama.yml down
```

### 2. Remove Old Network
```bash
docker network rm rica-network
```

### 3. Create Fresh Network
```bash
docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1
```

### 4. Start Services
```bash
docker-compose up -d
```

---

## Automated Setup Script

### Windows (setup-network.bat)
```batch
@echo off
echo Creating Rica network...
docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1
if %errorlevel% == 0 (
    echo Network created successfully!
) else (
    echo Network already exists or error occurred
)
pause
```

### Linux/Mac (setup-network.sh)
```bash
#!/bin/bash
echo "Creating Rica network..."
docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1

if [ $? -eq 0 ]; then
    echo "Network created successfully!"
else
    echo "Network already exists or error occurred"
fi
```

---

## Network Architecture

```
rica-network (172.25.0.0/16)
├── nginx (172.25.0.2)
├── rica-ui (172.25.0.3)
├── rica-api (172.25.0.4)
├── activepieces (172.25.0.10)
├── code-server (172.25.0.11)
├── ollama (172.25.0.12)
├── postgres (172.25.0.20)
├── redis (172.25.0.21)
└── ... (other services)
```

---

## Best Practices

### 1. Always Create Network First
Before starting any Rica services, ensure the network exists:
```bash
docker network ls | grep rica-network || docker network create rica-network
```

### 2. Use Consistent Network Name
All services use `rica-network` - don't create custom networks

### 3. Check Network Health
Periodically inspect the network:
```bash
docker network inspect rica-network
```

### 4. Clean Up Unused Networks
Remove networks from old/deleted services:
```bash
docker network prune
```

---

## Migration from Old Setup

If you're upgrading from the old network configuration:

### 1. Stop All Services
```bash
docker-compose down
```

### 2. Pull Latest Changes
```bash
git pull origin main
```

### 3. Remove Old Network (if exists)
```bash
docker network rm rica-network 2>/dev/null || true
```

### 4. Create New Network
```bash
docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1
```

### 5. Start Services
```bash
docker-compose up -d
```

---

## FAQ

### Q: Do I need to create the network every time?
**A:** No! Create it once. It persists across Docker restarts.

### Q: Can I use a different subnet?
**A:** Yes, but update `docker-compose.network.yml` and recreate the network.

### Q: What if I delete the network by accident?
**A:** Just recreate it with the same command. No data loss.

### Q: Can services on different compose files communicate?
**A:** Yes! That's the whole point. All services on `rica-network` can communicate.

### Q: How do I check if the network is working?
**A:** Run `docker network inspect rica-network` and check for connected containers.

---

## Summary

✅ **Problem Solved:** Network conflicts eliminated
✅ **Solution:** External network shared across all compose files
✅ **Setup:** One-time network creation
✅ **Benefits:** Clean, conflict-free Docker networking

**Status:** Ready to use! Create the network and start your services.

---

**Last Updated:** October 5, 2025
**Fix Applied:** External Network Configuration
