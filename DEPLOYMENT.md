# Rica Simplified Deployment

This guide explains how to deploy Rica with essential services using Docker Compose.

## Prerequisites

- Docker
- Docker Compose
- Node.js (for development only)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Rica
   ```

2. **Make the deployment script executable**
   ```bash
   chmod +x deploy-simple.sh
   ```

3. **Start the services**
   ```bash
   ./deploy-simple.sh start
   ```

   This will:
   - Build the Rica UI and API containers
   - Start the Ollama service for DeepSeek
   - Initialize the DeepSeek model

## Accessing Services

- **Rica UI**: http://localhost:3000
- **Rica API**: http://localhost:3001
- **Ollama API**: http://localhost:11434

## Managing Services

- **Start services**: `./deploy-simple.sh start`
- **Stop services**: `./deploy-simple.sh stop`
- **Restart services**: `./deploy-simple.sh restart`
- **View logs**: `./deploy-simple.sh logs`
- **Check status**: `./deploy-simple.sh status`

## Environment Variables

Edit the `.env` file to configure the following:

```
# Rica Configuration
API_KEY=your_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Service Ports
RICA_UI_PORT=3000
RICA_API_PORT=3001
OLLAMA_PORT=11434

# Ollama Configuration
OLLAMA_MODEL=deepseek-coder:latest
```

## Troubleshooting

1. **Port conflicts**
   - Ensure ports 3000, 3001, and 11434 are available
   - Or update the ports in the `.env` file

2. **Build issues**
   - Make sure Docker has enough resources (CPU, memory)
   - Run `docker system prune` to clean up unused resources

3. **Ollama model not loading**
   - Check the logs: `./deploy-simple.sh logs`
   - Manually pull the model: `docker exec -it ollama ollama pull deepseek-coder:latest`

## Production Considerations

- Configure HTTPS using a reverse proxy like Nginx or Traefik
- Set up proper secrets management for API keys
- Configure backups for persistent data
- Set up monitoring and logging
- Consider using a container orchestration system for production deployments
