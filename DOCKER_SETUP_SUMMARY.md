# Rica Docker Setup Summary

This document provides an overview of all the files created for the Rica Docker setup.

## Docker Compose Files

| File | Description |
|------|-------------|
| `docker-compose.master.yml` | Master Docker Compose file for all Rica components |
| `docker-compose.rica-ui.yml` | Docker Compose file for Rica UI components only |
| `docker-compose.headless-servers.yml` | Docker Compose file for all headless servers |
| `docker-compose.opencti.yml` | Docker Compose file for OpenCTI (Fabric) |
| `docker-compose.openbas.yml` | Docker Compose file for OpenBAS (Simulations) |
| `docker-compose.activepieces.yml` | Docker Compose file for Activepieces (Auto) |
| `docker-compose.code-server.yml` | Docker Compose file for Code Server |
| `docker-compose.ollama.yml` | Docker Compose file for Ollama |

## Nginx Configuration Files

| File | Description |
|------|-------------|
| `rica-complete.conf` | Complete Nginx configuration for all Rica services |
| `headless-servers.conf` | Nginx configuration for headless servers only |
| `nginx/conf.d/cors.conf` | CORS configuration for headless servers integration |

## Scripts

| File | Description |
|------|-------------|
| `start-rica-complete.bat/sh` | Script to manage all Rica components |
| `start-headless-servers.bat/sh` | Script to manage headless servers only |
| `setup-headless-servers.bat/sh` | Script to set up directories for headless servers |
| `update-iframe-urls.bat/sh` | Script to update iframe URLs in Rica UI components |
| `update-headless-integration.bat/sh` | Script to update headless server integration with Rica UI |

## Documentation

| File | Description |
|------|-------------|
| `RICA_ARCHITECTURE.md` | Comprehensive overview of the Rica system architecture |
| `HEADLESS_SERVERS_README.md` | Detailed information about the headless servers |
| `QUICKSTART.md` | Quick start guide for getting Rica up and running |
| `DOCKER_SETUP_SUMMARY.md` | This document |

## Other Files

| File | Description |
|------|-------------|
| `.env.example` | Example environment variables for Rica |

## Usage Instructions

### Complete System

To start the complete Rica system:

```bash
# Windows
start-rica-complete.bat all

# Linux
./start-rica-complete.sh all
```

### Rica UI Only

To start only the Rica UI components:

```bash
# Windows
start-rica-complete.bat ui

# Linux
./start-rica-complete.sh ui
```

### Headless Servers Only

To start only the headless servers:

```bash
# Windows
start-rica-complete.bat headless

# Linux
./start-rica-complete.sh headless
```

### Individual Components

To start individual components:

```bash
# Windows
start-rica-complete.bat opencti
start-rica-complete.bat openbas
start-rica-complete.bat activepieces
start-rica-complete.bat code-server
start-rica-complete.bat ollama

# Linux
./start-rica-complete.sh opencti
./start-rica-complete.sh openbas
./start-rica-complete.sh activepieces
./start-rica-complete.sh code-server
./start-rica-complete.sh ollama
```

### Stopping the System

To stop all components:

```bash
# Windows
start-rica-complete.bat stop

# Linux
./start-rica-complete.sh stop
```

### Checking Status

To check the status of all components:

```bash
# Windows
start-rica-complete.bat status

# Linux
./start-rica-complete.sh status
```

### Updating Iframe URLs

To update the iframe URLs in the Rica UI components to match the standardized port mapping:

```bash
# Windows
update-iframe-urls.bat

# Linux
./update-iframe-urls.sh
```

## Integration Components

The following components have been added to integrate the headless servers with the Rica UI:

| Component | Description |
|-----------|-------------|
| `HeadlessServerContainer.js` | React component that provides a unified interface for all headless servers |
| `HeadlessServerContainer.css` | Styling for the HeadlessServerContainer component |
| `rica-ui/.env` | Environment variables for the Rica UI with headless server URLs |

## Next Steps

1. Review the `RICA_ARCHITECTURE.md` document for a comprehensive overview of the Rica system architecture.
2. Follow the instructions in the `QUICKSTART.md` document to get Rica up and running quickly.
3. Refer to the `HEADLESS_SERVERS_README.md` document for detailed information about the headless servers.
4. Run the `update-headless-integration.bat/sh` script to ensure proper integration between Rica UI and headless servers.
5. Start the Rica system using the `start-rica-complete.bat/sh` script.
