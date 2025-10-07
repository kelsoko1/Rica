# Rica System Architecture

This document provides a comprehensive overview of the Rica system architecture and how to deploy and manage the various components.

## System Overview

Rica is a comprehensive security platform that integrates multiple components:

1. **Rica UI**: The main user interface for the platform
2. **Rica API**: Backend API service for the Rica UI
3. **Rica Landing**: Landing page for the platform
4. **Headless Servers** (directly integrated into Rica UI):
   - **OpenCTI (Fabric)**: Threat intelligence platform
   - **OpenBAS (Simulations)**: Security simulation platform
   - **Activepieces (Auto)**: Automation/workflow platform
   - **Code Server**: VS Code in browser
   - **Ollama**: DeepSeek AI model server

## Architecture Diagram

```
                                +----------------+
                                |                |
                                |  Nginx Proxy   |
                                |                |
                                +-------+--------+
                                        |
            +---------------------+-----+-----+---------------------+
            |                     |           |                     |
    +-------v-------+     +-------v-------+   |             +-------v-------+
    |               |     |               |   |             |               |
    |   Rica UI     |<--->|  Rica API     |   |             | Rica Landing  |
    |               |     |               |   |             |               |
    +-------+-------+     +-------+-------+   |             +---------------+
            |                     |           |
            |                     |           |
    +-------v-------+    +--------v----------v----+-----------+
    |               |    |           |       |   |            |
    | Headless      |    +-----------+---+---+---+----+-------+
    | Server        |                |       |   |        |           
    | Container     |        +-------v-----+ +---v---+ +-v---v--+ +---v----+ +----v-----+
    |               |        |             | |       | |        | |        | |          |
    +-------+-------+        |  OpenCTI    | |OpenBAS| |Active- | | Code   | | Ollama   |
            |                |  (Fabric)   | |(Sims) | |pieces  | | Server | |          |
            |                |             | |       | |(Auto)  | |        | |          |
            +--------------->+------+------+ +---+---+ +---+----+ +---+----+ +----+-----+
                                    |            |         |          |           |
                                    |            |         |          |           |
                             +------v------------v---------v----------v-----------v------+
                             |                                                           |
                             |                  Shared Services                          |
                             |   (Redis, PostgreSQL, Elasticsearch, MinIO, RabbitMQ)     |
                             |                                                           |
                             +-----------------------------------------------------------+
```

## Port Mapping

| Service | Internal Port | External Port | Description |
|---------|--------------|---------------|-------------|
| **Rica UI** | 80 | 3000 | Main Rica user interface |
| **Rica API** | 3001 | 3001 | Rica backend API |
| **Rica Landing** | 80 | 80 (via nginx) | Landing page |
| **OpenCTI** | 4000 | **2020** | Threat intelligence platform |
| **OpenBAS** | 3000 | **2021** | Security simulation platform |
| **Activepieces** | 80 | **2022** | Automation/workflow platform |
| **Code Server** | 8080 | **2023** | VS Code in browser |
| **Ollama** | 11434 | 11434 | DeepSeek AI model server |

## Directory Structure

```
Rica/
├── docker-compose.master.yml          # Master Docker Compose file for all components
├── docker-compose.rica-ui.yml         # Docker Compose file for Rica UI components
├── docker-compose.headless-servers.yml # Docker Compose file for all headless servers
├── docker-compose.opencti.yml         # Docker Compose file for OpenCTI
├── docker-compose.openbas.yml         # Docker Compose file for OpenBAS
├── docker-compose.activepieces.yml    # Docker Compose file for Activepieces
├── docker-compose.code-server.yml     # Docker Compose file for Code Server
├── docker-compose.ollama.yml          # Docker Compose file for Ollama
├── rica-complete.conf                 # Complete Nginx configuration for all services
├── headless-servers.conf              # Nginx configuration for headless servers only
├── nginx/
│   └── conf.d/
│       └── cors.conf                  # CORS configuration for headless servers integration
├── rica-ui/
│   ├── src/
│   │   └── components/
│   │       ├── HeadlessServerContainer.js  # Component for headless server integration
│   │       └── HeadlessServerContainer.css # Styling for the integration component
│   └── .env                           # Environment variables for Rica UI
├── start-rica-complete.bat/sh         # Script to manage all Rica components
├── start-headless-servers.bat/sh      # Script to manage headless servers only
├── setup-headless-servers.bat/sh      # Script to set up directories for headless servers
├── update-headless-integration.bat/sh # Script to update headless server integration
├── init-db.sh                         # Database initialization script
├── .env.example                       # Example environment variables
└── RICA_ARCHITECTURE.md               # This document
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- At least 8GB of RAM available
- At least 20GB of free disk space

### Environment Setup

1. Copy the example environment file:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file and set secure passwords for all services.

### Directory Setup

Run the setup script to create the necessary directories:

```bash
# Windows
setup-headless-servers.bat

# Linux
chmod +x setup-headless-servers.sh
./setup-headless-servers.sh
```

### Starting the System

You can start the entire Rica system or individual components:

#### Windows

```
# Start all components
start-rica-complete.bat all

# Start only Rica UI components
start-rica-complete.bat ui

# Start only headless servers
start-rica-complete.bat headless

# Start individual components
start-rica-complete.bat opencti
start-rica-complete.bat openbas
start-rica-complete.bat activepieces
start-rica-complete.bat code-server
start-rica-complete.bat ollama

# Stop all components
start-rica-complete.bat stop

# Check status
start-rica-complete.bat status
```

#### Linux

```bash
# Make the script executable
chmod +x start-rica-complete.sh

# Start all components
./start-rica-complete.sh all

# Start only Rica UI components
./start-rica-complete.sh ui

# Start only headless servers
./start-rica-complete.sh headless

# Start individual components
./start-rica-complete.sh opencti
./start-rica-complete.sh openbas
./start-rica-complete.sh activepieces
./start-rica-complete.sh code-server
./start-rica-complete.sh ollama

# Stop all components
./start-rica-complete.sh stop

# Check status
./start-rica-complete.sh status
```

## Accessing the Services

### Direct Access

You can access the services directly at:

- Rica UI: http://localhost:3000
- Rica API: http://localhost:3001
- OpenCTI (Fabric): http://localhost:2020
- OpenBAS (Simulations): http://localhost:2021
- Activepieces (Auto): http://localhost:2022
- Code Server: http://localhost:2023
- Ollama: http://localhost:2024

### Integrated Access

You can also access the headless servers directly from the Rica UI:

1. Navigate to http://localhost:3000
2. Click on the corresponding sidebar item:
   - Fabric: OpenCTI threat intelligence platform
   - Simulations: OpenBAS security simulation platform
   - Auto: Activepieces automation platform

This integrated approach provides a seamless experience without having to switch between different browser tabs or windows.

## Nginx Configuration

The `rica-complete.conf` file provides a complete Nginx configuration for all Rica services. It includes:

- Server blocks for each service
- Security headers
- Gzip compression
- Proxy settings
- SSL configuration (commented out by default)

To use this configuration:

1. Make sure Nginx is installed
2. Copy the `rica-complete.conf` file to `/etc/nginx/conf.d/` (Linux) or the appropriate Nginx configuration directory
3. Restart Nginx

## Component Details

### Rica UI

The main user interface for the Rica platform. It provides access to:

- Project Explorer
- Threat Intelligence
- Device Manager
- Teams Collaboration
- Profile Manager
- Integrated Headless Servers (Fabric, Simulations, Auto)

### OpenCTI (Fabric)

OpenCTI is a threat intelligence platform that helps organizations manage their cyber threat intelligence. It's integrated into Rica as the "Fabric" tab through the HeadlessServerContainer component, providing a seamless experience within the Rica UI.

### OpenBAS (Simulations)

OpenBAS is a breach and attack simulation platform that helps organizations test their security controls. It's integrated into Rica as the "Sims" tab through the HeadlessServerContainer component, providing a seamless experience within the Rica UI.

### Activepieces (Auto)

Activepieces is an automation platform that allows users to create workflows for security operations. It's integrated into Rica as the "Auto" tab through the HeadlessServerContainer component, providing a seamless experience within the Rica UI.

### Code Server

Code Server provides a VS Code environment in the browser, allowing users to develop and test code directly within the Rica platform.

### Ollama

Ollama is an AI model server that provides the DeepSeek model for AI-powered features in Rica.

## Shared Services

The Rica system uses several shared services:

- **Redis**: Used for caching and message queuing
- **PostgreSQL**: Database for OpenBAS and Activepieces
- **Elasticsearch**: Search engine for OpenCTI
- **MinIO**: Object storage for OpenCTI and OpenBAS
- **RabbitMQ**: Message broker for OpenCTI

## Production Deployment

For production deployment, consider the following:

1. **SSL/TLS**: Uncomment and configure the SSL sections in the Nginx configuration files
2. **Secure Passwords**: Change all default passwords in the `.env` file
3. **Firewall Rules**: Implement proper firewall rules to restrict access to sensitive services
4. **Backup Strategy**: Set up regular backups of volumes and databases
5. **Monitoring**: Implement monitoring and alerting for all services
6. **Resource Allocation**: Adjust resource limits based on expected load

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

## Additional Resources

- [OpenCTI Documentation](https://docs.opencti.io/)
- [OpenBAS Documentation](https://docs.openbas.io/)
- [Activepieces Documentation](https://www.activepieces.com/docs)
- [Code Server Documentation](https://github.com/coder/code-server)
- [Ollama Documentation](https://ollama.ai/docs)
