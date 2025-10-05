# Rica Headless Servers Deployment Status

## Current Status (2025-10-05)

### ✅ Working Services

1. **Ollama (Port 2024)** - ✅ FULLY WORKING
   - Direct access: http://72.60.133.11:2024
   - Status: Healthy and responding
   
2. **Code Server (Port 8080 internally)** - ✅ WORKING
   - Needs Nginx proxy on port 2023
   - Container running successfully

3. **Activepieces (Port 2022)** - ⚠️ PARTIALLY WORKING
   - Container running on port 2022
   - Needs configuration fixes for full functionality

### ⚠️ Services with Issues

4. **OpenCTI (Port 2020)** - ⚠️ STARTING BUT HAS ERRORS
   - Container: Running
   - Issue: Redis authentication error - "NOAUTH Authentication required"
   - Fix needed: Configure Redis password in OpenCTI environment variables
   - Dependencies: Elasticsearch ✅, MinIO ✅, RabbitMQ ✅, Redis ⚠️

5. **OpenBAS (Port 2021)** - ❌ NOT WORKING
   - Container: Running but failing to start
   - Issue: Database URL error - "URL must start with 'jdbc'"
   - Fix needed: Correct DATABASE_URL format in docker-compose.openbas.yml
   - Current: `postgresql://postgres:Postgres@123@openbas-postgres:5432/openbas?schema=public`
   - Should be: `jdbc:postgresql://openbas-postgres:5432/openbas`

6. **Nginx** - ❌ FAILED TO START
   - Issue: Configuration error or port conflict
   - Ports needed: 2020, 2021, 2022, 2023, 2025
   - Status: Stopped

## Port Mapping

| Service | Internal Port | External Port | Status |
|---------|--------------|---------------|--------|
| OpenCTI | 4000 | 2020 | ⚠️ Redis Auth Error |
| OpenBAS | 3000 | 2021 | ❌ DB Connection Error |
| Activepieces | 80 | 2022 | ⚠️ Partial |
| Code Server | 8080 | 2023 (via Nginx) | ✅ Working |
| Ollama | 11434 | 2024 | ✅ Working |
| Ollama (Nginx) | 11434 | 2025 (via Nginx) | ⚠️ Nginx Down |

## Next Steps to Fix

### 1. Fix OpenCTI Redis Authentication
```bash
# Update docker-compose.opencti.yml to add Redis password
# Add to opencti service environment:
- REDIS__PASSWORD=ChangeMeInProduction123!

# Also update redis service to require password
# Add to redis service command:
command: redis-server --requirepass ChangeMeInProduction123!
```

### 2. Fix OpenBAS Database URL
```bash
# Update docker-compose.openbas.yml
# Change DATABASE_URL from:
DATABASE_URL=postgresql://postgres:Postgres@123@openbas-postgres:5432/openbas?schema=public

# To proper JDBC format:
SPRING_DATASOURCE_URL=jdbc:postgresql://openbas-postgres:5432/openbas
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=Postgres@123
```

### 3. Fix Nginx Configuration
```bash
# Check Nginx error
sudo systemctl status nginx.service
sudo nginx -t

# Likely need to fix configuration conflicts
# Check: /etc/nginx/sites-enabled/rica
# Check: /etc/nginx/sites-available/rica-headless
```

## Quick Commands

### Check Service Status
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### View Logs
```bash
docker logs opencti --tail 50
docker logs openbas --tail 50
docker logs activepieces --tail 50
```

### Restart Services
```bash
docker restart opencti openbas activepieces
```

### Test Connectivity
```bash
curl -I http://localhost:2020  # OpenCTI
curl -I http://localhost:2021  # OpenBAS
curl -I http://localhost:2022  # Activepieces
curl -I http://localhost:2024  # Ollama
```

## Summary

**Working:** 1.5/5 services (Ollama fully, Code Server partially)
**Needs Fixes:** OpenCTI (Redis auth), OpenBAS (DB config), Nginx (config)
**Progress:** Containers are running, just need configuration fixes
