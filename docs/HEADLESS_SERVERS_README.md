# Rica Headless Servers

This document provides instructions for setting up and managing the headless servers used by Rica.

## Integration with Rica UI

The headless servers are now directly integrated into the Rica UI, allowing users to access them without having to navigate to specific ports. The integration is handled by the `HeadlessServerContainer` component, which provides a unified interface for all headless servers.

## Overview

Rica integrates with several headless servers to provide various functionalities:

| Service | Port | Description | UI Tab |
|---------|------|-------------|--------|
| OpenCTI | 2020 | Threat intelligence platform | Fabric |
| OpenBAS | 2021 | Security simulation platform | Sims |
| Activepieces | 2022 | Automation/workflow platform | Auto |
| Code Server | 2023 | VS Code in browser | N/A |
| Ollama | 11434 | DeepSeek AI model server | N/A |

## Directory Structure

```
Rica/
├── docker-compose.headless-servers.yml  # Master Docker Compose file for all servers
├── docker-compose.opencti.yml           # Docker Compose file for OpenCTI
├── docker-compose.openbas.yml           # Docker Compose file for OpenBAS
├── docker-compose.activepieces.yml      # Docker Compose file for Activepieces
├── docker-compose.code-server.yml       # Docker Compose file for Code Server
├── docker-compose.ollama.yml            # Docker Compose file for Ollama
├── headless-servers.conf                # Nginx configuration for headless servers
├── start-headless-servers.bat           # Windows script to manage headless servers
├── start-headless-servers.sh            # Linux script to manage headless servers
└── init-db.sh                           # Database initialization script
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- At least 8GB of RAM available
- At least 20GB of free disk space
- Node.js and npm (for Rica UI development)

### Environment Variables

Create a `.env` file in the Rica directory with the following variables:

```
# PostgreSQL
POSTGRES_PASSWORD=your_secure_password

# OpenCTI
OPENCTI_ADMIN_PASSWORD=your_secure_password
OPENCTI_ADMIN_TOKEN=your_secure_token

# OpenBAS
OPENBAS_JWT_SECRET=your_secure_secret
OPENBAS_POSTGRES_PASSWORD=your_secure_password

# Activepieces
AP_API_KEY=your_secure_api_key
AP_ENCRYPTION_KEY=your_secure_encryption_key
AP_JWT_SECRET=your_secure_jwt_secret
AP_POSTGRES_PASSWORD=your_secure_password

# Code Server
CODE_SERVER_PASSWORD=your_secure_password
CODE_SERVER_SUDO_PASSWORD=your_secure_password

# Shared Services
REDIS_PASSWORD=your_secure_password
MINIO_SECRET_KEY=your_secure_key
RABBITMQ_PASSWORD=your_secure_password
```

### Starting the Servers

#### Windows

```
# Start all headless servers
start-headless-servers.bat all

# Start a specific server
start-headless-servers.bat opencti
start-headless-servers.bat openbas
start-headless-servers.bat activepieces
start-headless-servers.bat code-server
start-headless-servers.bat ollama

# Stop all servers
start-headless-servers.bat stop

# Check server status
start-headless-servers.bat status
```

#### Linux

```bash
# Make the script executable
chmod +x start-headless-servers.sh

# Start all headless servers
./start-headless-servers.sh all

# Start a specific server
./start-headless-servers.sh opencti
./start-headless-servers.sh openbas
./start-headless-servers.sh activepieces
./start-headless-servers.sh code-server
./start-headless-servers.sh ollama

# Stop all servers
./start-headless-servers.sh stop

# Check server status
./start-headless-servers.sh status
```

## Accessing the Services

### Direct Access

You can access the headless servers directly at:

- OpenCTI (Fabric): http://localhost:2020
- OpenBAS (Simulations): http://localhost:2021
- Activepieces (Auto): http://localhost:2022
- Code Server: http://localhost:2023
- Ollama: http://localhost:11434

### Integrated Access

You can also access the headless servers directly from the Rica UI:

1. Start the Rica UI: `start-rica-complete.bat ui` (Windows) or `./start-rica-complete.sh ui` (Linux)
2. Navigate to http://localhost:3000
3. Click on the corresponding sidebar item:
   - Fabric: OpenCTI threat intelligence platform
   - Simulations: OpenBAS security simulation platform
   - Auto: Activepieces automation platform

## Nginx Configuration

The `headless-servers.conf` file provides a complete Nginx configuration for all headless servers. It includes:

- Server blocks for each headless server
- Security headers
- Gzip compression
- Proxy settings
- SSL configuration (commented out by default)

To use this configuration:

1. Make sure Nginx is installed
2. Copy the `headless-servers.conf` file to `/etc/nginx/conf.d/` (Linux) or the appropriate Nginx configuration directory
3. Restart Nginx

## Integration Setup

To ensure proper integration between the Rica UI and the headless servers, run the update script:

```bash
# Windows
update-headless-integration.bat

# Linux
chmod +x update-headless-integration.sh
./update-headless-integration.sh
```

This script will:

1. Update Docker Compose network configuration for proper service communication
2. Create CORS configuration for Nginx to allow cross-origin requests
3. Update headless-servers.conf to include the CORS configuration
4. Create environment file for Rica UI with headless server URLs

After running the script, rebuild the Rica UI and restart the services:

```bash
# Rebuild Rica UI
cd rica-ui
npm run build
cd ..

# Restart services
start-rica-complete.bat all  # Windows
./start-rica-complete.sh all  # Linux
```

## Troubleshooting

### Container won't start

Check the logs:

```bash
docker logs <container_name>
```

### Service is unreachable

1. Check if the container is running:
   ```bash
   docker ps | grep <service_name>
   ```

2. Check container logs:
   ```bash
   docker logs <container_name>
   ```

3. Verify port mapping:
   ```bash
   docker port <container_name>
   ```

4. Test connectivity:
   ```bash
   curl http://localhost:<port>
   ```

### Database issues

1. Check PostgreSQL logs:
   ```bash
   docker logs postgres
   ```

2. Connect to PostgreSQL:
   ```bash
   docker exec -it postgres psql -U postgres
   ```

## Security Considerations

- Change all default passwords in the `.env` file
- Use SSL/TLS in production (uncomment and configure the SSL sections in `headless-servers.conf`)
- Implement proper firewall rules
- Consider using VPN for administrative access
- Enable audit logging for all services
- Regularly update all services

## Additional Resources

- [OpenCTI Documentation](https://docs.opencti.io/)
- [OpenBAS Documentation](https://docs.openbas.io/)
- [Activepieces Documentation](https://www.activepieces.com/docs)
- [Code Server Documentation](https://github.com/coder/code-server)
- [Ollama Documentation](https://ollama.ai/docs)
