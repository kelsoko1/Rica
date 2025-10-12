# 🚀 Run This On Your Server

## Quick Fix for npm ci Errors

Your Dockerfiles on the server still have the old `npm ci` commands. Run this to update them:

```bash
cd /root/Rica

# Download and run the update script
chmod +x update-dockerfiles.sh
./update-dockerfiles.sh
```

This will update all three Dockerfiles to use `npm install` instead of `npm ci`.

---

## Then Deploy

After updating the Dockerfiles, deploy with:

```bash
# Option 1: Full automated deployment (recommended)
chmod +x fix-all-deps-and-start.sh
./fix-all-deps-and-start.sh
```

OR

```bash
# Option 2: Just build and start
docker-compose -f docker-compose.core-services.yml up -d --build
```

---

## What the Update Script Does

The `update-dockerfiles.sh` script will:

### 1. Update rica-api/Dockerfile
```dockerfile
# Changes from:
RUN npm ci --production

# To:
RUN npm install --production --no-optional
```

### 2. Update rica-ui/Dockerfile
```dockerfile
# Changes from:
RUN npm ci --production=false

# To:
RUN npm install
```

### 3. Update rica-landing/Dockerfile
```dockerfile
# Changes from:
RUN npm ci

# To:
RUN npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag fixes the React peer dependency conflict you're seeing.

---

## Complete Step-by-Step

Run these commands on your server:

```bash
# Step 1: Go to Rica directory
cd /root/Rica

# Step 2: Update Dockerfiles
chmod +x update-dockerfiles.sh
./update-dockerfiles.sh

# Step 3: Fix dependencies and deploy
chmod +x fix-all-deps-and-start.sh
./fix-all-deps-and-start.sh

# Step 4: Wait for services (about 2-3 minutes)
# The script will show you when everything is ready

# Step 5: Verify
curl http://localhost:3001/health
curl http://localhost:3030
curl http://localhost:3000
```

---

## Expected Output

After running `./fix-all-deps-and-start.sh`, you should see:

```
✅ All dependencies fixed and services started!

🌐 Access Your Services:
   Rica UI:      http://localhost:3030
   Rica API:     http://localhost:3001
   Rica Landing: http://localhost:3000

✓ Rica API is healthy (http://localhost:3001)
✓ Rica UI is healthy (http://localhost:3030)
✓ Rica Landing is healthy (http://localhost:3000)
```

---

## If You Still Get Errors

### Error: "npm ci can only install..."
**Solution**: Make sure you ran `./update-dockerfiles.sh` first

### Error: "peer dependency conflict"
**Solution**: The update script adds `--legacy-peer-deps` which fixes this

### Error: "version is obsolete"
**Solution**: This is just a warning, ignore it. The script works fine.

### Error: "port already in use"
```bash
# Stop all containers
docker-compose -f docker-compose.core-services.yml down

# Remove old containers
docker rm -f rica-ui rica-api rica-landing

# Try again
./fix-all-deps-and-start.sh
```

---

## Manual Alternative

If the scripts don't work, you can manually update each Dockerfile:

### rica-api/Dockerfile
Change line 8 from:
```dockerfile
RUN npm ci --production
```
To:
```dockerfile
RUN npm install --production --no-optional
```

### rica-ui/Dockerfile
Change line 9 from:
```dockerfile
RUN npm ci --production=false
```
To:
```dockerfile
RUN npm install
```

### rica-landing/Dockerfile
Change line 13 from:
```dockerfile
RUN npm ci
```
To:
```dockerfile
RUN npm install --legacy-peer-deps
```

Then run:
```bash
docker-compose -f docker-compose.core-services.yml up -d --build
```

---

## Verify Everything Works

```bash
# Check containers
docker ps | grep rica

# Should show:
# rica-api       Up X minutes (healthy)
# rica-ui        Up X minutes (healthy)
# rica-landing   Up X minutes (healthy)

# Test endpoints
curl http://localhost:3001/health  # Should return {"status":"ok"}
curl http://localhost:3030         # Should return HTML
curl http://localhost:3000         # Should return HTML

# View logs if needed
docker logs -f rica-api
docker logs -f rica-ui
docker logs -f rica-landing
```

---

## Summary

**Two simple commands to fix everything:**

```bash
cd /root/Rica
chmod +x update-dockerfiles.sh && ./update-dockerfiles.sh
chmod +x fix-all-deps-and-start.sh && ./fix-all-deps-and-start.sh
```

**That's it! Your Rica services will be running in 2-3 minutes.** 🎉

---

**Last Updated**: 2025-10-07  
**Status**: ✅ Ready to Deploy
