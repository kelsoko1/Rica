# Ollama Port Update Summary

This document summarizes the changes made to update the Ollama port from 11434 to 2024 to align with the standardized port mapping scheme.

## Overview

The Ollama service has been updated to use port 2024 instead of 11434, making it consistent with the standardized port mapping scheme (2020-2024) used for all headless servers in the Rica platform.

## Files Updated

### Docker Compose Files

1. **docker-compose.ollama.yml**
   - Updated port mapping from `11434:11434` to `2024:11434`

2. **docker-compose.master.yml**
   - Updated port mapping from `11434:11434` to `2024:11434`
   - Updated Rica API environment variable `OLLAMA_URL` from `http://ollama:11434` to `http://ollama:2024`
   - Added `OLLAMA_EXTERNAL_URL=http://localhost:2024`

3. **docker-compose.headless-servers.yml**
   - Updated port mapping from `11434:11434` to `2024:11434`

4. **docker-compose.rica-ui.yml**
   - Updated Rica API environment variable `OLLAMA_URL` from `http://ollama:11434` to `http://ollama:2024`
   - Added `OLLAMA_EXTERNAL_URL=http://localhost:2024`

### Nginx Configuration Files

1. **headless-servers.conf**
   - Updated header comment from `# Ollama - Port 11434` to `# Ollama - Port 2024`
   - Updated proxy_pass from `http://ollama:11434` to `http://ollama:2024`

2. **nginx/health/ollama.conf** (new file)
   - Added health check endpoint for Ollama

### Scripts

1. **start-rica-complete.bat**
   - Updated Ollama URL from `http://localhost:11434` to `http://localhost:2024`

2. **start-rica-complete.sh**
   - Updated Ollama URL from `http://localhost:11434` to `http://localhost:2024` in multiple sections

3. **update-health-endpoints.bat**
   - Added Ollama health check endpoint
   - Updated port references from 11434 to 2024

4. **update-health-endpoints.sh**
   - Added Ollama health check endpoint
   - Updated port references from 11434 to 2024

### Documentation Files

1. **PORT_MAPPING.md**
   - Updated Ollama port from 11434 to 2024
   - Updated section title from "Standardized Port Mapping (2020-2023)" to "Standardized Port Mapping (2020-2024)"
   - Added Port 2024 - Ollama section
   - Updated firewall configuration instructions

2. **RICA_ARCHITECTURE.md**
   - Updated Ollama URL from `http://localhost:11434` to `http://localhost:2024`

3. **QUICKSTART.md**
   - Updated Ollama URL from `http://localhost:11434` to `http://localhost:2024`

### React Components

1. **HeadlessServerHealthService.js**
   - Added Ollama to server URLs with port 2024
   - Updated health check logic to use the new health endpoints

2. **HeadlessServerStatusManager.js**
   - Added Ollama to server status tracking

3. **HeadlessServerStatusIndicator.js**
   - Added Ollama to server status display

## Standardized Port Mapping

The Rica platform now uses a consistent port mapping scheme for all headless servers:

| Service | Port | Description |
|---------|------|-------------|
| OpenCTI (Fabric) | 2020 | Threat intelligence platform |
| OpenBAS (Simulations) | 2021 | Security simulation platform |
| Activepieces (Auto) | 2022 | Automation/workflow platform |
| Code Server | 2023 | VS Code in browser |
| Ollama | 2024 | DeepSeek AI model server |

## Next Steps

1. Run the `update-health-endpoints.bat/sh` script to create the health check endpoints
2. Restart the services using `start-rica-complete.bat/sh all`
3. Verify that Ollama is accessible at http://localhost:2024
