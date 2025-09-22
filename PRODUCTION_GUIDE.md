# Rica Production Deployment Guide

This guide outlines the steps taken to make Rica production-ready and provides instructions for deployment.

## Changes Made for Production Readiness

### 1. Docker Configuration
- Updated Dockerfile for rica-ui with multi-stage build and optimizations
- Updated Dockerfile for rica-api with security enhancements and non-root user
- Added proper NGINX configuration for serving the React application
- Configured health checks for both services

### 2. Environment Configuration
- Created production-specific environment files (.env.production)
- Added example environment files (.env.example) for reference
- Configured environment variables for different deployment scenarios

### 3. Security Enhancements
- Added Helmet for HTTP security headers
- Implemented rate limiting to prevent abuse
- Added input validation for all API endpoints
- Configured CORS for production environments
- Removed hardcoded credentials and API keys
- Added proper error handling to prevent information leakage

### 4. Performance Optimizations
- Added compression middleware
- Configured NGINX for static asset caching
- Disabled source maps in production builds
- Optimized Docker image sizes

### 5. Logging and Monitoring
- Implemented Winston logger for structured logging
- Added request logging with performance metrics
- Configured separate log files for errors and general logs
- Added proper error handling and reporting

### 6. Deployment Infrastructure
- Created Kubernetes deployment manifests
- Added Docker Compose configuration for simpler deployments
- Created deployment scripts for both Windows and Linux/Mac
- Added configuration for secrets management

### 7. Data Persistence
- Added persistent volume claims for data storage
- Implemented file-based persistence for wallet data
- Added periodic data saving to prevent data loss

## Deployment Instructions

### Option 1: Docker Compose Deployment

1. Configure environment variables:
   ```
   # Edit rica-api/.env
   API_KEY=your-secure-api-key
   DEEPSEEK_API_KEY=your-deepseek-api-key
   
   # Edit rica-ui/.env.production
   REACT_APP_API_URL=https://your-domain.com/api
   ```

2. Build and deploy:
   ```
   # On Windows
   build.bat
   deploy.bat
   
   # On Linux/Mac
   ./build.sh
   ./deploy.sh
   ```

3. Access the application:
   - UI: http://localhost (port 80)
   - API: http://localhost:3001

### Option 2: Kubernetes Deployment

1. Configure Kubernetes secrets and config maps:
   ```
   # Edit k8s/rica-config.yaml with your values
   ```

2. Deploy to Kubernetes:
   ```
   # On Windows
   deploy.bat k8s
   
   # On Linux/Mac
   ./deploy.sh k8s
   ```

3. Access the application via the configured Ingress host

## Monitoring and Maintenance

### Logs
- API logs: `/app/logs/` in the rica-api container
- UI logs: NGINX logs in the rica-ui container

### Health Checks
- API: http://localhost:3001/api/health
- UI: http://localhost/

### Scaling
- For higher traffic, increase the replica count in Kubernetes manifests
- For better performance, allocate more resources to the containers

## Troubleshooting

### Common Issues
1. API connection errors:
   - Check if the API is running and accessible
   - Verify CORS configuration
   - Check API_KEY configuration

2. UI not loading:
   - Check NGINX configuration
   - Verify that the build completed successfully
   - Check browser console for errors

3. Database persistence issues:
   - Check volume mounts and permissions
   - Verify that data directories exist and are writable

## Security Best Practices

1. Regularly update dependencies:
   ```
   npm audit fix
   ```

2. Rotate API keys periodically
3. Monitor logs for suspicious activity
4. Keep Docker images updated with security patches
5. Use network policies to restrict communication between services
