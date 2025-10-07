# Rica Deployment Guide

## Complete Step-by-Step Deployment

**Last Updated:** October 6, 2025

---

## 📋 Pre-Deployment Checklist

### System Requirements
- [ ] Docker Desktop installed and running
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] 8GB+ RAM available
- [ ] 20GB+ disk space available
- [ ] Ports 80, 443, 2020-2022, 3000-3001 available

### Environment Setup
- [ ] `.env` file configured
- [ ] Firebase credentials set up (for rica-landing)
- [ ] ClickPesa API keys configured (for payments)
- [ ] SSL certificates ready (for production)

---

## 🚀 Deployment Steps

### Step 1: Prepare Environment Files

#### 1.1 Create Main .env File
```bash
cd c:\Users\kelvin\Desktop\Rica
copy .env.example .env
```

#### 1.2 Edit .env File
Open `.env` and update these critical values:

```bash
# PostgreSQL - CHANGE THIS!
POSTGRES_PASSWORD=KelgloKargav1@

# Activepieces - CHANGE THESE!
AP_API_KEY=your-secure-api-key-here
AP_ENCRYPTION_KEY=your-secure-encryption-key-here
AP_JWT_SECRET=your-secure-jwt-secret-here
AP_POSTGRES_PASSWORD=your-postgres-password-here

# Redis - CHANGE THIS!
REDIS_PASSWORD=YourSecureRedisPassword123!

# Code Server - CHANGE THESE!
CODE_SERVER_PASSWORD=YourCodeServerPassword123!
CODE_SERVER_SUDO_PASSWORD=YourSudoPassword123!

# Ollama (usually no changes needed)
OLLAMA_MODEL=deepseek-r1:1.5b
```

#### 1.3 Create Rica-UI .env
```bash
cd rica-ui
copy .env.example .env
```

Edit `rica-ui/.env`:
```bash
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_AUTO_URL=http://localhost:2020
REACT_APP_CODE_SERVER_URL=http://localhost:2021
REACT_APP_OLLAMA_URL=http://localhost:2022
```

#### 1.4 Create Rica-Landing .env
```bash
cd ..\rica-landing
copy .env.example .env
```

Edit `rica-landing/.env`:
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# ClickPesa Configuration
REACT_APP_CLICKPESA_API_KEY=your-clickpesa-api-key
REACT_APP_CLICKPESA_COLLECTION_ACCOUNT=your-collection-account

# API URLs
REACT_APP_API_URL=http://localhost:3001/api
```

---

### Step 2: Create Docker Network

This is **CRITICAL** - must be done first!

```bash
cd c:\Users\kelvin\Desktop\Rica

# Option 1: Use the setup script (Recommended)
setup-network.bat

# Option 2: Manual creation
docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1
```

**Verify network created:**
```bash
docker network ls | findstr rica-network
```

You should see:
```
xxxxxxxxx   rica-network   bridge    local
```

---

### Step 3: Install Dependencies

#### 3.1 Rica UI Dependencies
```bash
cd c:\Users\kelvin\Desktop\Rica\rica-ui
npm install
```

#### 3.2 Rica Landing Dependencies
```bash
cd ..\rica-landing
npm install
```

---

### Step 4: Build Docker Images

#### 4.1 Pull Required Images
```bash
cd c:\Users\kelvin\Desktop\Rica

# Pull all base images
docker pull nginx:alpine
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull activepieces/activepieces:latest
docker pull codercom/code-server:latest
docker pull ollama/ollama:latest
```

#### 4.2 Build Custom Images (if any)
```bash
# Build Rica UI image (if using Docker)
cd rica-ui
docker build -t rica-ui:latest .

# Build Rica Landing image (if using Docker)
cd ..\rica-landing
docker build -t rica-landing:latest .
```

---

### Step 5: Start Services

#### 5.1 Start Core Infrastructure

**Option A: Start Everything (Recommended for first deployment)**
```bash
cd c:\Users\kelvin\Desktop\Rica
docker-compose up -d
```

**Option B: Start Services Individually**
```bash
# Start PostgreSQL and Redis first
docker-compose up -d postgres redis

# Wait 30 seconds for databases to initialize
timeout /t 30

# Start Activepieces
docker-compose up -d activepieces

# Start Code Server
docker-compose up -d code-server

# Start Ollama
docker-compose up -d ollama

# Start Nginx (if using)
docker-compose up -d nginx
```

#### 5.2 Verify Services Started
```bash
docker-compose ps
```

All services should show "Up" status:
```
NAME                STATUS
activepieces        Up (healthy)
code-server         Up (healthy)
ollama              Up (healthy)
postgres            Up (healthy)
redis               Up (healthy)
```

---

### Step 6: Initialize Ollama Model

**IMPORTANT:** Download the AI model for Starry AI

```bash
# Pull DeepSeek model
docker exec ollama ollama pull deepseek-r1:1.5b

# Verify model downloaded
docker exec ollama ollama list
```

Expected output:
```
NAME                    ID              SIZE
deepseek-r1:1.5b       abc123def       1.5 GB
```

---

### Step 7: Start Rica Applications

#### 7.1 Start Rica UI
```bash
cd c:\Users\kelvin\Desktop\Rica\rica-ui
npm start
```

This will start on **http://localhost:3000**

#### 7.2 Start Rica Landing (New Terminal)
```bash
cd c:\Users\kelvin\Desktop\Rica\rica-landing
npm run dev
```

This will start on **http://localhost:3030** (or configured port)

---

### Step 8: Verify Deployment

#### 8.1 Check All Services

**Rica UI:** http://localhost:3000
- [ ] Page loads without errors
- [ ] Welcome screen appears
- [ ] Sidebar navigation works

**Activepieces (Auto):** http://localhost:2020
- [ ] Loads in browser
- [ ] Login page appears
- [ ] Accessible from Rica UI "Auto" tab

**Code Server (Project):** http://localhost:2021
- [ ] Loads in browser
- [ ] VS Code interface appears
- [ ] Accessible from Rica UI "Project Explorer" tab

**Ollama:** http://localhost:2022/api/version
- [ ] Returns version JSON
- [ ] Starry AI responds in Rica UI

**Rica Landing:** http://localhost:3030
- [ ] Landing page loads
- [ ] Firebase auth works
- [ ] Payment page accessible

#### 8.2 Check Docker Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f activepieces
docker-compose logs -f code-server
docker-compose logs -f ollama
```

#### 8.3 Check Network Connectivity
```bash
# Inspect network
docker network inspect rica-network

# Test connectivity between containers
docker exec activepieces ping code-server
docker exec code-server ping ollama
```

---

### Step 9: Configure Services

#### 9.1 Activepieces Initial Setup
1. Navigate to http://localhost:2020
2. Create admin account
3. Set up first workflow (optional)
4. Configure integrations (optional)

#### 9.2 Code Server Initial Setup
1. Navigate to http://localhost:2021
2. Enter password (from .env: CODE_SERVER_PASSWORD)
3. Install extensions (optional):
   - ESLint
   - Prettier
   - GitLens
   - Docker

#### 9.3 Test Starry AI
1. Open Rica UI: http://localhost:3000
2. Click Starry AI icon (sidebar)
3. Type: "Hello, can you help me?"
4. Verify AI responds

---

### Step 10: Production Deployment (Optional)

#### 10.1 SSL Certificates
```bash
# Create certs directory
mkdir certs

# Copy your SSL certificates
copy your-cert.crt certs\
copy your-key.key certs\
```

#### 10.2 Update Nginx Configuration
Edit `nginx/nginx.conf` to enable HTTPS

#### 10.3 Use Production Compose File
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔧 Troubleshooting

### Issue: Docker Network Not Found
**Error:** `network rica-network not found`

**Solution:**
```bash
docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1
```

### Issue: Port Already in Use
**Error:** `port is already allocated`

**Solution:**
```bash
# Find what's using the port (example: port 3000)
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process-id> /F
```

### Issue: Service Won't Start
**Error:** Container exits immediately

**Solution:**
```bash
# Check logs
docker-compose logs <service-name>

# Check environment variables
docker-compose config

# Restart service
docker-compose restart <service-name>
```

### Issue: Ollama Model Not Found
**Error:** `model not found`

**Solution:**
```bash
# Pull the model
docker exec ollama ollama pull deepseek-r1:1.5b

# List available models
docker exec ollama ollama list
```

### Issue: Cannot Connect to Services
**Error:** `ERR_CONNECTION_REFUSED`

**Solution:**
```bash
# Check if service is running
docker-compose ps

# Check if port is exposed
docker port <container-name>

# Restart Docker Desktop
# Then restart services
docker-compose down
docker-compose up -d
```

---

## 📊 Health Checks

### Quick Health Check Script
Create `health-check.bat`:

```batch
@echo off
echo Rica Health Check
echo ==================

echo.
echo Checking Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Docker is not running
    exit /b 1
) else (
    echo [OK] Docker is running
)

echo.
echo Checking Network...
docker network inspect rica-network >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] rica-network not found
) else (
    echo [OK] rica-network exists
)

echo.
echo Checking Services...
docker-compose ps

echo.
echo Checking Ports...
curl -s http://localhost:2020/api/v1/flags >nul && echo [OK] Activepieces (2020) || echo [FAIL] Activepieces (2020)
curl -s http://localhost:2021/healthz >nul && echo [OK] Code Server (2021) || echo [FAIL] Code Server (2021)
curl -s http://localhost:2022/api/version >nul && echo [OK] Ollama (2022) || echo [FAIL] Ollama (2022)
curl -s http://localhost:3000 >nul && echo [OK] Rica UI (3000) || echo [FAIL] Rica UI (3000)

echo.
echo Health check complete!
pause
```

Run it:
```bash
health-check.bat
```

---

## 🔄 Update/Restart Procedures

### Restart All Services
```bash
cd c:\Users\kelvin\Desktop\Rica
docker-compose restart
```

### Restart Specific Service
```bash
docker-compose restart activepieces
docker-compose restart code-server
docker-compose restart ollama
```

### Update Services
```bash
# Pull latest images
docker-compose pull

# Recreate containers
docker-compose up -d --force-recreate
```

### Clean Restart
```bash
# Stop everything
docker-compose down

# Remove volumes (WARNING: Deletes data!)
docker-compose down -v

# Start fresh
docker-compose up -d
```

---

## 📦 Backup Procedures

### Backup Docker Volumes
```bash
# List volumes
docker volume ls

# Backup specific volume
docker run --rm -v activepieces_data:/data -v c:\backup:/backup alpine tar czf /backup/activepieces-backup.tar.gz /data
```

### Backup Environment Files
```bash
# Create backup directory
mkdir backup

# Copy environment files
copy .env backup\
copy rica-ui\.env backup\rica-ui.env
copy rica-landing\.env backup\rica-landing.env
```

---

## 🎯 Post-Deployment Tasks

### 1. Security Hardening
- [ ] Change all default passwords
- [ ] Enable firewall rules
- [ ] Configure SSL/TLS
- [ ] Set up rate limiting
- [ ] Enable authentication on all services

### 2. Monitoring Setup
- [ ] Configure log aggregation
- [ ] Set up health check monitoring
- [ ] Configure alerts
- [ ] Set up performance monitoring

### 3. Documentation
- [ ] Document custom configurations
- [ ] Create runbooks for common issues
- [ ] Document backup/restore procedures
- [ ] Create user guides

---

## 📞 Support Resources

### Documentation
- PORT_MAPPING.md - Port configuration reference
- NETWORK_FIX_GUIDE.md - Network troubleshooting
- HEADLESS_SERVER_INTEGRATION_SUMMARY.md - Service integration details
- DOCKER_NETWORK_FIX_SUMMARY.md - Network setup guide

### Quick Commands Reference
```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart <service>

# Check status
docker-compose ps

# Execute command in container
docker exec -it <container> <command>
```

---

## ✅ Deployment Complete!

Once all steps are completed, you should have:

✅ Rica UI running on http://localhost:3000
✅ Rica Landing running on http://localhost:3030
✅ Activepieces (Auto) on http://localhost:2020
✅ Code Server (Project) on http://localhost:2021
✅ Ollama (Starry AI) on http://localhost:2022
✅ All services healthy and communicating
✅ Docker network configured correctly
✅ AI model downloaded and ready

**Congratulations! Rica is now deployed and ready to use!** 🎉

---

**Deployment Guide Version:** 1.0
**Last Updated:** October 6, 2025
