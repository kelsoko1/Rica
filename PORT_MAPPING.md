# Rica Port Mapping

This document describes all the ports used by Rica services.

## Port Overview

| Service | Internal Port | External Port | Description |
|---------|--------------|---------------|-------------|
| **Rica UI** | 80 | 3000 | Main Rica user interface |
| **Rica API** | 3001 | 3001 | Rica backend API |
| **Rica Landing** | 80 | 80 (via nginx) | Landing page |
| **Ollama** | 11434 | **2024** | DeepSeek AI model server |
| **OpenCTI** | 4000 | **2020** | Threat intelligence platform |
| **OpenBAS** | 3000 | **2021** | Security simulation platform |
| **Activepieces** | 80 | **2022** | Automation/workflow platform |
| **Code Server** | 8080 | **2023** | VS Code in browser |
| **Nginx** | 80/443 | 80/443 | Reverse proxy |
| **PostgreSQL** | 5432 | - | Database (internal only) |
| **Redis** | 6379 | - | Cache/queue (internal only) |
| **Elasticsearch** | 9200 | - | Search engine (internal only) |
| **MinIO** | 9000/9001 | - | Object storage (internal only) |
| **RabbitMQ** | 5672/15672 | - | Message broker (internal only) |

## Headless Server Ports (2020-2024)

The headless servers are configured to run on sequential ports starting from 2020:

### Port 2020 - OpenCTI (Fabric)
- **Service**: OpenCTI - Open Cyber Threat Intelligence Platform
- **Access**: http://localhost:2020
- **Purpose**: Threat intelligence management, STIX/TAXII support
- **UI Tab**: "Fabric"

### Port 2021 - OpenBAS (Simulations)
- **Service**: OpenBAS - Open Breach and Attack Simulation
- **Access**: http://localhost:2021
- **Purpose**: Security simulation and training exercises
- **UI Tab**: "Sims"

### Port 2022 - Activepieces (Auto)
- **Service**: Activepieces - Automation Platform
- **Access**: http://localhost:2022
- **Purpose**: Workflow automation, integrations, scheduled tasks
- **UI Tab**: "Auto"

### Port 2023 - Code Server
- **Service**: Code Server - VS Code in Browser
- **Access**: http://localhost:2023
- **Purpose**: Browser-based development environment
- **UI Tab**: N/A (accessed via direct URL)

### Port 2024 - Ollama
- **Service**: Ollama - DeepSeek AI Model Server
- **Access**: http://localhost:2024
- **Purpose**: AI model serving for DeepSeek
- **UI Tab**: N/A (accessed via API)

## Port Configuration

### Changing Ports

To change the external ports, edit `docker-compose.prod.yml`:

```yaml
services:
  opencti:
    ports:
      - "2020:4000"  # Change 2020 to your desired port
```

After changing ports, also update the corresponding UI components:
- `OpenCTIFrame.js` - for OpenCTI
- `OpenBASFrame.js` - for OpenBAS
- `AutoFrame.js` - for Activepieces
- `CodeServer.js` - for Code Server

### Firewall Configuration

If running on a remote server, ensure these ports are open in your firewall:

```bash
# For Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 2020/tcp
sudo ufw allow 2021/tcp
sudo ufw allow 2022/tcp
sudo ufw allow 2023/tcp
sudo ufw allow 2024/tcp
```

## Security Considerations

### Internal Services
The following services should **NOT** be exposed to the internet:
- PostgreSQL (5432)
- Redis (6379)
- Elasticsearch (9200)
- MinIO (9000, 9001)
- RabbitMQ (5672, 15672)

These services are only accessible within the Docker network.

### External Services
Services exposed to external access should be:
1. Protected with strong authentication
2. Accessed via HTTPS in production
3. Rate-limited to prevent abuse
4. Monitored for suspicious activity

### Production Deployment

For production, it's recommended to:
1. Use a reverse proxy (Nginx) with SSL/TLS
2. Implement IP whitelisting for sensitive services
3. Use VPN for administrative access
4. Enable audit logging for all services
5. Regularly update all services

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using a port (Windows)
netstat -ano | findstr :2020

# Check what's using a port (Linux)
sudo lsof -i :2020

# Kill the process (Windows)
taskkill /PID <PID> /F

# Kill the process (Linux)
sudo kill -9 <PID>
```

### Cannot Access Service

1. Check if the container is running:
   ```bash
   docker ps | grep <service-name>
   ```

2. Check container logs:
   ```bash
   docker logs <container-name>
   ```

3. Verify port mapping:
   ```bash
   docker port <container-name>
   ```

4. Test connectivity:
   ```bash
   curl http://localhost:<port>
   ```

## Network Architecture

```
Internet
   ↓
[Nginx :80/:443]
   ↓
   ├─→ [Rica UI :3000]
   ├─→ [Rica API :3001]
   ├─→ [Rica Landing :80]
   ├─→ [OpenCTI :2020]
   ├─→ [OpenBAS :2021]
   ├─→ [Activepieces :2022]
   └─→ [Code Server :2023]
   
Internal Network (rica-network)
   ├─→ [PostgreSQL :5432]
   ├─→ [Redis :6379]
   ├─→ [Elasticsearch :9200]
   ├─→ [MinIO :9000/:9001]
   ├─→ [RabbitMQ :5672/:15672]
   └─→ [Ollama :11434]
```

## Environment-Specific Ports

### Development
- All services accessible on localhost
- No SSL/TLS required
- Direct port access

### Staging
- Services behind reverse proxy
- SSL/TLS recommended
- IP whitelisting for admin services

### Production
- All services behind reverse proxy with SSL/TLS
- Strict firewall rules
- VPN required for admin access
- Rate limiting enabled
- DDoS protection active

## Quick Reference

Access services in Rica UI:
- **Swarm Browser**: Main navigation → Browser
- **Threat Intelligence**: Main navigation → Fabric (port 2020)
- **Simulations**: Main navigation → Sims (port 2021)
- **Automation**: Main navigation → Auto (port 2022)
- **Teams**: Main navigation → Teams

Direct access URLs:
- Rica UI: http://localhost:3000
- Rica API: http://localhost:3001/api
- OpenCTI: http://localhost:2020
- OpenBAS: http://localhost:2021
- Activepieces: http://localhost:2022
- Code Server: http://localhost:2023
- Ollama: http://localhost:11434
