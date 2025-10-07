# Rica Production Deployment Guide

This document provides instructions for deploying Rica in a production environment with all required services.

## Prerequisites

- Linux server with at least 8GB RAM (16GB recommended)
- Docker 20.10.0 or higher
- Docker Compose 2.0.0 or higher
- Ports 80, 3001, 4000, 8080, 9000, and 11434 open in your firewall

## Deployment Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/rica.git
   cd rica
   ```

2. **Make the Deployment Script Executable**
   ```bash
   chmod +x deploy-prod.sh
   ```

3. **Configure Environment Variables**
   Edit the `.env` file to set your configuration:
   ```bash
   nano .env
   ```
   
   Update at least these critical values:
   - `DEEPSEEK_API_KEY`: Your DeepSeek API key
   - `API_KEY`: A secure random string for API authentication
   - `OPENCTI_ADMIN_PASSWORD`: A strong password for OpenCTI admin
   - `OPENCTI_ADMIN_TOKEN`: A secure token for OpenCTI API access

4. **Start the Services**
   ```bash
   ./deploy-prod.sh start
   ```

5. **Verify the Deployment**
   ```bash
   ./deploy-prod.sh status
   ```

## Managing Services

- **Start services**: `./deploy-prod.sh start`
- **Stop services**: `./deploy-prod.sh stop`
- **Restart services**: `./deploy-prod.sh restart`
- **View logs**: `./deploy-prod.sh logs`
- **Check status**: `./deploy-prod.sh status`

## Running as a System Service

To ensure Rica starts on system boot and remains running:

1. Copy the service file:
   ```bash
   sudo cp rica.service /etc/systemd/system/
   ```

2. Update the paths in the service file:
   ```bash
   sudo nano /etc/systemd/system/rica.service
   ```
   Update `WorkingDirectory` and `ExecStart`/`ExecStop` paths to match your installation directory.

3. Reload systemd and enable the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable rica.service
   sudo systemctl start rica.service
   ```

## Accessing Services

- **Rica UI**: http://your-server-ip
- **Rica API**: http://your-server-ip:3001
- **OpenCTI**: http://your-server-ip:4000
- **Code Server**: http://your-server-ip:8080
- **MinIO Console**: http://your-server-ip:9001
- **RabbitMQ Management**: http://your-server-ip:15672

## Initial Setup

1. **OpenCTI**:
   - Access http://your-server-ip:4000
   - Log in with admin / [password from .env]
   - Complete the initial setup wizard

2. **Code Server**:
   - Access http://your-server-ip:8080
   - Log in with password: `ChangeMeInProduction123!`
   - Change the password immediately after first login

3. **DeepSeek**:
   - The DeepSeek model will be automatically downloaded on first run
   - Access it through the Rica UI or via the API at http://your-server-ip:11434

## Backup and Maintenance

### Backing Up Data

```bash
# Create a backup directory
mkdir -p ~/rica-backups/$(date +%Y%m%d)

# Backup PostgreSQL
docker exec postgres pg_dump -U openbas openbas > ~/rica-backups/$(date +%Y%m%d)/openbas.sql

# Backup Redis
docker exec redis redis-cli SAVE
cp -r /var/lib/docker/volumes/rica_redis_data ~/rica-backups/$(date +%Y%m%d)/

# Backup Elasticsearch
# (Note: This requires a more complex process with snapshots)

# Backup MinIO data
cp -r /var/lib/docker/volumes/rica_minio_data ~/rica-backups/$(date +%Y%m%d)/

# Backup configuration
cp .env ~/rica-backups/$(date +%Y%m%d)/
```

### Updating Services

1. Stop the services:
   ```bash
   ./deploy-prod.sh stop
   ```

2. Pull the latest changes:
   ```bash
   git pull origin main
   ```

3. Rebuild and restart:
   ```bash
   ./deploy-prod.sh start
   ```

## Security Considerations

1. **Change Default Credentials**:
   - Change all default passwords in the `.env` file
   - Update the code server password
   - Rotate API keys regularly

2. **Enable HTTPS**:
   - Set up a reverse proxy (Nginx/Apache) with Let's Encrypt
   - Configure SSL/TLS for all services

3. **Firewall Rules**:
   - Only expose necessary ports to the internet
   - Consider using a VPN for admin access

4. **Regular Updates**:
   - Keep Docker and the host system updated
   - Monitor for security advisories for all components

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   - Check if ports are already in use: `sudo lsof -i -P -n | grep LISTEN`
   - Update the port in `.env` and restart services

2. **Docker Permissions**:
   - Add your user to the docker group: `sudo usermod -aG docker $USER`
   - Log out and back in for changes to take effect

3. **Out of Memory**:
   - Increase server resources if possible
   - Adjust Java heap size in `docker-compose.prod.yml` under `elasticsearch` service

### Checking Logs

View logs for all services:
```bash
./deploy-prod.sh logs
```

Or for a specific service:
```bash
docker-compose -f docker-compose.prod.yml logs -f [service_name]
```

## Support

For issues not covered in this guide, please open an issue on our GitHub repository or contact support.
