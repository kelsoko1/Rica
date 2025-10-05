# Rica Platform - Quick Reference Guide

## 🚀 Quick Start

### Start Everything
```bash
# Windows
start-rica-complete.bat all

# Linux
./start-rica-complete.sh all
```

### Access Rica UI
Open your browser and navigate to: **http://localhost:3000**

## 📍 Port Mapping Reference

| Service | Port | Access URL | Description |
|---------|------|------------|-------------|
| **Rica UI** | 3000 | http://localhost:3000 | Main user interface |
| **Rica API** | 3001 | http://localhost:3001 | Backend API |
| **OpenCTI (Fabric)** | 2020 | http://localhost:2020 | Threat intelligence |
| **OpenBAS (Sims)** | 2021 | http://localhost:2021 | Security simulations |
| **Activepieces (Auto)** | 2022 | http://localhost:2022 | Automation workflows |
| **Code Server** | 2023 | http://localhost:2023 | VS Code in browser |
| **Ollama** | 2024 | http://localhost:2024 | AI model server |

## 🎯 Accessing Headless Servers

### Via Rica UI (Recommended)
1. Go to http://localhost:3000
2. Click sidebar items:
   - **Fabric** → OpenCTI
   - **Simulations** → OpenBAS
   - **Auto** → Activepieces

### Direct Access
Use the URLs in the port mapping table above.

## 🔧 Management Commands

### Start Services
```bash
# All components
start-rica-complete.bat all

# UI only
start-rica-complete.bat ui

# Headless servers only
start-rica-complete.bat headless

# Individual services
start-rica-complete.bat opencti
start-rica-complete.bat openbas
start-rica-complete.bat activepieces
start-rica-complete.bat ollama
```

### Stop Services
```bash
start-rica-complete.bat stop
```

### Check Status
```bash
start-rica-complete.bat status
```

## 🏥 Health Monitoring

### View Health Status
- Health indicators appear in the topbar when viewing headless servers
- Shows: ✅ Online | ⚠️ Partial | ❌ Offline

### Manual Health Check
- Click the refresh button in the health status indicator

## 🛠️ Setup Scripts

### Initial Setup
```bash
# 1. Setup integration
update-headless-integration.bat

# 2. Setup health endpoints
update-health-endpoints.bat

# 3. Rebuild UI
cd rica-ui
npm run build
cd ..

# 4. Start services
start-rica-complete.bat all
```

## 📊 Docker Commands

### View Running Containers
```bash
docker ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.master.yml logs

# Specific service
docker logs <container_name>
```

### Restart Service
```bash
docker restart <container_name>
```

## 🔍 Troubleshooting

### Service Not Loading
```bash
# 1. Check if running
docker ps | grep <service_name>

# 2. Check logs
docker logs <container_name>

# 3. Restart service
docker restart <container_name>
```

### Port Already in Use
```bash
# Windows - Find process using port
netstat -ano | findstr :<port>

# Linux - Find process using port
lsof -i :<port>

# Kill process (use PID from above)
# Windows
taskkill /PID <pid> /F

# Linux
kill -9 <pid>
```

### Health Check Failing
```bash
# 1. Re-run health endpoints setup
update-health-endpoints.bat

# 2. Restart Nginx
docker restart nginx

# 3. Check Nginx logs
docker logs nginx
```

## 📁 Important Files

### Configuration
- `.env` - Environment variables
- `docker-compose.master.yml` - All services
- `headless-servers.conf` - Nginx configuration

### Scripts
- `start-rica-complete.bat/sh` - Service management
- `update-headless-integration.bat/sh` - Integration setup
- `update-health-endpoints.bat/sh` - Health check setup

### Documentation
- `INTEGRATION_COMPLETE.md` - Complete integration guide
- `QUICKSTART.md` - Detailed quick start
- `RICA_ARCHITECTURE.md` - System architecture
- `PORT_MAPPING.md` - Port reference

## 🔐 Default Credentials

### OpenCTI (Fabric)
- URL: http://localhost:2020
- Username: admin@opencti.io
- Password: (check .env file)

### OpenBAS (Simulations)
- URL: http://localhost:2021
- Username: admin@openbas.io
- Password: (check .env file)

### Activepieces (Auto)
- URL: http://localhost:2022
- Setup required on first access

## 💡 Tips

1. **Always use the Rica UI** for accessing headless servers for the best experience
2. **Monitor health status** in the topbar to catch issues early
3. **Check logs** if something isn't working as expected
4. **Use `status` command** to see what's running
5. **Rebuild UI** after making changes to React components

## 🆘 Getting Help

1. Check the logs: `docker logs <container_name>`
2. Review documentation in the `docs/` folder
3. Check `INTEGRATION_COMPLETE.md` for detailed setup
4. Verify port mappings in `PORT_MAPPING.md`

## 📝 Common Tasks

### Update a Service
```bash
# 1. Stop the service
docker stop <container_name>

# 2. Pull latest image
docker pull <image_name>

# 3. Restart
start-rica-complete.bat <service_name>
```

### Backup Data
```bash
# List volumes
docker volume ls

# Backup volume
docker run --rm -v <volume_name>:/data -v $(pwd):/backup alpine tar czf /backup/<volume_name>.tar.gz /data
```

### Clean Up
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune
```

---

**Need more details?** Check out `INTEGRATION_COMPLETE.md` for comprehensive documentation.
