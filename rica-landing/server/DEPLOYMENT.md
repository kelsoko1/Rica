# Rica API Server Deployment Guide

This guide provides instructions for deploying the Rica API Server in a production environment, including the Device Linking System that integrates with  and .

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Configuration](#configuration)
3. [Deployment Options](#deployment-options)
   - [Docker Deployment](#docker-deployment)
   - [Kubernetes Deployment](#kubernetes-deployment)
   - [Manual Deployment](#manual-deployment)
4. [Security Considerations](#security-considerations)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying the Rica API Server, ensure you have the following:

- Node.js 16.x or later
- MongoDB 5.0 or later
-  instance (optional, for threat intelligence integration)
-  instance (optional, for security simulations)
- Docker and Docker Compose (for containerized deployment)
- Kubernetes cluster (for Kubernetes deployment)
- SSL certificate for HTTPS

## Configuration

The Rica API Server uses environment variables for configuration. Create a `.env` file in the server directory based on the `.env.example` file.

### Critical Configuration Variables

```
# Server Configuration
NODE_ENV=production
PORT=8080
CORS_ORIGINS=https://your-rica-ui-domain.com

# Security Configuration
JWT_SECRET=your-secure-jwt-secret
ENCRYPTION_KEY=your-secure-encryption-key

# Database Configuration
MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/rica

#  Configuration
_URL=https://your--instance.com
_API_KEY=your--api-key

#  Configuration
_URL=https://your--instance.com
_API_KEY=your--api-key
```

### Network Configuration for Device Discovery

For the device discovery feature to work properly, you need to configure the network ranges to scan:

```
# Device Discovery Configuration
NETWORK_RANGES=192.168.1.0/24,10.0.0.0/24
EXCLUDED_IPS=192.168.1.1,192.168.1.254
```

## Deployment Options

### Docker Deployment

The simplest way to deploy the Rica API Server is using Docker and Docker Compose.

1. Build and start the containers:

```bash
cd server
docker-compose up -d
```

2. Verify the deployment:

```bash
docker-compose ps
```

3. Check the logs:

```bash
docker-compose logs -f rica-api
```

### Kubernetes Deployment

For production environments, Kubernetes provides better scalability and reliability.

1. Create a Kubernetes secret for environment variables:

```bash
kubectl create secret generic rica-api-secrets \
  --from-literal=JWT_SECRET=your-secure-jwt-secret \
  --from-literal=ENCRYPTION_KEY=your-secure-encryption-key \
  --from-literal=MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/rica \
  --from-literal=_API_KEY=your--api-key \
  --from-literal=_API_KEY=your--api-key
```

2. Apply the Kubernetes manifests:

```bash
kubectl apply -f kubernetes/
```

3. Verify the deployment:

```bash
kubectl get pods
kubectl get services
```

### Manual Deployment

For manual deployment on a server:

1. Install dependencies:

```bash
npm ci --only=production
```

2. Set up environment variables in a `.env` file.

3. Start the server:

```bash
NODE_ENV=production node src/index.js
```

4. Use a process manager like PM2 for production:

```bash
npm install -g pm2
pm2 start src/index.js --name rica-api
pm2 save
```

## Security Considerations

### Network Security

- Use a firewall to restrict access to the server
- Only expose necessary ports (8080 for the API)
- Use HTTPS for all communications
- Set up proper network segmentation

### API Security

- Use strong JWT secrets and encryption keys
- Implement rate limiting to prevent abuse
- Validate all input data
- Use proper authentication and authorization
- Regularly rotate API keys

### Device Security

- Use secure authentication for device connections
- Encrypt all sensitive data
- Implement proper access control for device management
- Regularly audit device access logs

## Monitoring and Maintenance

### Logging

Logs are stored in the `logs` directory. In a containerized environment, they are also available via Docker logs:

```bash
docker-compose logs -f rica-api
```

### Health Checks

The API server provides a health check endpoint at `/health` that returns the current status of the server.

### Backup and Recovery

Regularly backup the MongoDB database:

```bash
mongodump --uri="mongodb://username:password@your-mongodb-host:27017/rica" --out=/backup/rica-$(date +%Y%m%d)
```

### Updates

To update the Rica API Server:

1. Pull the latest changes:

```bash
git pull origin main
```

2. Rebuild and restart the containers:

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

## Troubleshooting

### Common Issues

#### API Server Not Starting

- Check the logs for errors
- Verify environment variables are set correctly
- Ensure MongoDB is accessible

#### Device Discovery Not Working

- Check network connectivity
- Verify network range configuration
- Ensure proper permissions for network scanning

#### Data Collection Failing

- Check device connectivity
- Verify device credentials
- Ensure proper permissions for data collection

#### / Integration Issues

- Verify API endpoints are correct
- Check API keys
- Ensure proper network connectivity between services

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the logs for error messages
2. Review the documentation
3. Contact the Rica support team

---

For more information, refer to the [Device Linking Guide](../DEVICE_LINKING_GUIDE.md) and the [API Documentation](./API_DOCS.md).
