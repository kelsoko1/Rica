# Rica Port Mapping - Updated Configuration

## Overview
This document describes the standardized port mapping for all Rica services after the latest updates.

## Port Allocation

### Core Services
| Service | Port | Protocol | Description |
|---------|------|----------|-------------|
| **Rica UI** | 3030 | HTTP | Main dashboard and user interface |
| **Rica API** | 3001 | HTTP | Backend API for multi-tenancy |
| **Rica Landing** | 3000 | HTTP | Payment and subscription portal |

### Headless Servers
| Service | Port | Protocol | Description |
|---------|------|----------|-------------|
| **Activepieces** | 2020 | HTTP | Automation and workflow platform |
| **Code Server** | 2021 | HTTP | VS Code in browser |
| **Ollama** | 2022 | HTTP | Local LLM server (internal: 11434) |

### Database Services (Internal Only)
| Service | Port | Protocol | Description |
|---------|------|----------|-------------|
| **PostgreSQL** | 5432 | TCP | Database for Activepieces |
| **Redis** | 6379 | TCP | Cache for Activepieces |

### Reverse Proxy (Production)
| Service | Port | Protocol | Description |
|---------|------|----------|-------------|
| **Nginx** | 80 | HTTP | HTTP traffic |
| **Nginx** | 443 | HTTPS | HTTPS traffic with SSL/TLS |

## Service URLs

### Local Development
```
Rica UI:        http://localhost:3030
Rica API:       http://localhost:3001
Rica Landing:   http://localhost:3000
Activepieces:   http://localhost:2020
Code Server:    http://localhost:2021
Ollama:         http://localhost:2022
```

### Production (with Nginx)
```
Main Access:    https://yourdomain.com
Rica UI:        https://yourdomain.com/
Rica API:       https://yourdomain.com/api
Rica Landing:   https://yourdomain.com/landing
Activepieces:   https://yourdomain.com/auto
Code Server:    https://yourdomain.com/code
Ollama:         https://yourdomain.com/ollama
```

## Kubernetes Multi-Tenancy

### Per-Tenant Services
Each tenant gets their own isolated namespace with the following services:

| Service | Internal Port | Exposed Port | Description |
|---------|---------------|--------------|-------------|
| Rica UI | 80 | N/A | Accessed via Ingress |
| Activepieces | 80 | 2020 | Automation platform |
| Code Server | 8080 | 2021 | VS Code in browser |
| Ollama | 11434 | 2022 | LLM server |
| PostgreSQL | 5432 | N/A | Internal database |
| Redis | 6379 | N/A | Internal cache |

### Tenant Access
Each tenant gets a unique subdomain:
```
https://{username}-{tenant-id}.rica.example.com
```

## Docker Compose Configuration

### Network
All services run on the `rica-network` bridge network:
```
Network: rica-network
Driver: bridge
Subnet: 172.25.0.0/16
Gateway: 172.25.0.1
```

### Volume Mounts
```
ollama_data:    /root/.ollama
postgres_data:  /var/lib/postgresql/data
redis_data:     /data
```

## Environment Variables

### Rica UI
```bash
NODE_ENV=production
REACT_APP_API_URL=http://localhost:3001
REACT_APP_RICA_UI_PORT=3030
```

### Rica API
```bash
NODE_ENV=production
PORT=3001
OLLAMA_URL=http://ollama:11434
OLLAMA_EXTERNAL_URL=http://localhost:2022
API_KEY=your_api_key_here
```

### Ollama
```bash
OLLAMA_HOST=0.0.0.0:11434
```

### Activepieces
```bash
AP_FRONTEND_URL=http://localhost:2020
AP_POSTGRES_HOST=activepieces-postgres
AP_REDIS_HOST=activepieces-redis
```

## Health Check Endpoints

All services provide health check endpoints:

```
Rica UI:        http://localhost:3030/
Rica API:       http://localhost:3001/health
Activepieces:   http://localhost:2020/api/v1/health
Code Server:    http://localhost:2021/healthz
Ollama:         http://localhost:2022/api/tags
```

## Firewall Rules (Production)

### Required Open Ports
```
80/tcp   - HTTP (Nginx)
443/tcp  - HTTPS (Nginx)
```

### Internal Ports (Should NOT be exposed)
```
2020/tcp - Activepieces
2021/tcp - Code Server
2022/tcp - Ollama
3000/tcp - Rica Landing
3001/tcp - Rica API
3030/tcp - Rica UI
5432/tcp - PostgreSQL
6379/tcp - Redis
```

## Migration Notes

### Changes from Previous Configuration
1. **Rica UI**: Moved from port 3000 to 3030
2. **Rica Landing**: Now uses port 3000 (previously conflicted)
3. **Ollama**: External port remains 2022, internal port is 11434
4. **Removed Services**: OpenCTI and OpenBAS have been removed

### Update Checklist
- [x] Update docker-compose files
- [x] Update Kubernetes templates
- [x] Update startup scripts
- [x] Update health check endpoints
- [x] Update documentation
- [x] Update environment variables
- [x] Update nginx configuration

## Troubleshooting

### Port Already in Use
```bash
# Check what's using a port
netstat -tulpn | grep :3030
# or
ss -tulpn | grep :3030

# Kill the process
kill -9 <PID>
```

### Service Not Accessible
```bash
# Check if service is running
docker ps | grep rica-ui

# Check service logs
docker logs rica-ui

# Check if port is exposed
docker port rica-ui
```

### Network Issues
```bash
# Inspect network
docker network inspect rica-network

# Reconnect container to network
docker network connect rica-network rica-ui
```

## Testing

### Quick Test Script
```bash
#!/bin/bash
echo "Testing Rica services..."

# Test Rica UI
curl -s http://localhost:3030 > /dev/null && echo "✓ Rica UI (3030)" || echo "✗ Rica UI (3030)"

# Test Rica API
curl -s http://localhost:3001/health > /dev/null && echo "✓ Rica API (3001)" || echo "✗ Rica API (3001)"

# Test Rica Landing
curl -s http://localhost:3000 > /dev/null && echo "✓ Rica Landing (3000)" || echo "✗ Rica Landing (3000)"

# Test Activepieces
curl -s http://localhost:2020 > /dev/null && echo "✓ Activepieces (2020)" || echo "✗ Activepieces (2020)"

# Test Code Server
curl -s http://localhost:2021 > /dev/null && echo "✓ Code Server (2021)" || echo "✗ Code Server (2021)"

# Test Ollama
curl -s http://localhost:2022/api/tags > /dev/null && echo "✓ Ollama (2022)" || echo "✗ Ollama (2022)"
```

## References

- Docker Compose Files: `docker-compose.*.yml`
- Kubernetes Templates: `k8s/*.yaml`
- Startup Scripts: `start-rica-complete.*`
- Nginx Config: `nginx.conf`, `rica-complete.conf`

---

**Last Updated:** 2025-10-07
**Version:** 2.0
**Status:** Active
