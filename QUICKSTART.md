# Rica Quick Start Guide

This guide provides step-by-step instructions to quickly get the Rica platform up and running.

## Prerequisites

- Docker and Docker Compose installed
- At least 8GB of RAM available
- At least 20GB of free disk space

## Quick Start Steps

### 1. Set Up Environment and Integration

Create a `.env` file with the necessary environment variables:

```bash
# Windows
copy .env.example .env

# Linux
cp .env.example .env
```

You can use the default values for testing, but for production, make sure to change all passwords.

Run the integration setup script to ensure proper communication between Rica UI and headless servers:

```bash
# Windows
update-headless-integration.bat

# Linux
chmod +x update-headless-integration.sh
./update-headless-integration.sh
```

### 2. Set Up Directories

Run the setup script to create the necessary directories:

```bash
# Windows
setup-headless-servers.bat

# Linux
chmod +x setup-headless-servers.sh
./setup-headless-servers.sh
```

### 3. Start the System

#### Option 1: Start Everything at Once

```bash
# Windows
start-rica-complete.bat all

# Linux
chmod +x start-rica-complete.sh
./start-rica-complete.sh all
```

#### Option 2: Start Only What You Need

Start only the Rica UI components:

```bash
# Windows
start-rica-complete.bat ui

# Linux
./start-rica-complete.sh ui
```

Start only the headless servers:

```bash
# Windows
start-rica-complete.bat headless

# Linux
./start-rica-complete.sh headless
```

Start individual components:

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

### 4. Access the Services

#### Direct Access

You can access the services directly at:

- Rica UI: http://localhost:3000
- Rica API: http://localhost:3001
- OpenCTI (Fabric): http://localhost:2020
- OpenBAS (Simulations): http://localhost:2021
- Activepieces (Auto): http://localhost:2022
- Code Server: http://localhost:2023
- Ollama: http://localhost:2024

#### Integrated Access

You can also access the headless servers directly from the Rica UI:

1. Navigate to http://localhost:3000
2. Click on the corresponding sidebar item:
   - Fabric: OpenCTI threat intelligence platform
   - Simulations: OpenBAS security simulation platform
   - Auto: Activepieces automation platform

This integrated approach provides a seamless experience without having to switch between different browser tabs or windows.

### 5. Stop the System

To stop all components:

```bash
# Windows
start-rica-complete.bat stop

# Linux
./start-rica-complete.sh stop
```

### 6. Check Status

To check the status of all components:

```bash
# Windows
start-rica-complete.bat status

# Linux
./start-rica-complete.sh status
```

## Default Credentials

### OpenCTI (Fabric)
- Username: admin@opencti.io
- Password: ChangeMeInProduction123!

### Code Server
- Password: ChangeMeInProduction123!

## Next Steps

For more detailed information about the Rica system architecture and deployment options, see the following documents:

- [RICA_ARCHITECTURE.md](RICA_ARCHITECTURE.md) - Comprehensive overview of the Rica system architecture
- [HEADLESS_SERVERS_README.md](HEADLESS_SERVERS_README.md) - Detailed information about the headless servers

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

### Memory Issues

If you're experiencing memory issues, try starting only the components you need rather than the entire system at once.
