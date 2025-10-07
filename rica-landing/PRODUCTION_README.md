# Rica Landing Page - Production Guide

## Overview

This document provides comprehensive guidance for deploying and maintaining the Rica Landing Page in a production environment. The landing page has been optimized for security, performance, and reliability.

## Table of Contents

1. [Production Features](#production-features)
2. [Deployment Options](#deployment-options)
3. [Environment Configuration](#environment-configuration)
4. [Security Considerations](#security-considerations)
5. [Performance Optimizations](#performance-optimizations)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)

## Production Features

The Rica Landing Page includes the following production-ready features:

### Security
- HTTP security headers via Nginx configuration
- Content Security Policy (CSP) implementation
- Rate limiting for API endpoints and application routes
- Non-root user in Docker container
- Secure environment variable handling
- Cross-Origin Resource Sharing (CORS) protection

### Performance
- Multi-stage Docker builds for smaller image size
- Static asset compression (gzip and brotli)
- Optimized cache control headers
- Code splitting and bundle optimization
- Tree shaking for smaller bundle sizes
- Preloading of critical resources

### Reliability
- Health check endpoint for monitoring
- Graceful error handling
- Kubernetes-ready deployment configuration
- Rolling update strategy for zero-downtime deployments
- Proper resource allocation and limits

## Deployment Options

### Docker Compose

The simplest way to deploy the Rica Landing Page is using Docker Compose:

```bash
# Build the landing page image
docker-compose build rica-landing

# Start all services
docker-compose up -d
```

### Kubernetes

For production environments, we recommend using Kubernetes:

```bash
# Apply the Kubernetes configuration
kubectl apply -f k8s/rica-landing-deployment.yaml
```

### Manual Deployment

For manual deployment:

1. Build the application:
   ```bash
   npm run build
   ```

2. Serve the built files using Nginx:
   ```bash
   cp -r dist/* /usr/share/nginx/html/
   cp nginx.conf /etc/nginx/conf.d/default.conf
   ```

## Environment Configuration

The Rica Landing Page uses environment variables for configuration. In production, these are injected into the `env.js` file during the build process.

### Required Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | `production` |
| REACT_APP_API_URL | URL for API requests | `/api` |
| REACT_APP_CLICKPESA_API_KEY | ClickPesa API key | - |
| REACT_APP_ENCRYPTION_KEY | Key for data encryption | - |
| REACT_APP_ANALYTICS_KEY | Google Analytics key | - |
| REACT_APP_SENTRY_DSN | Sentry error reporting URL | - |

### Updating Environment Variables

To update environment variables in a running container:

```bash
# For Linux/macOS
./scripts/update-env.sh rica-landing .env.production

# For Windows
scripts\update-env.bat rica-landing .env.production
```

## Security Considerations

### API Keys and Secrets

Never hardcode API keys or secrets in the codebase. Use environment variables and secrets management:

- In Docker Compose, use environment variables or `.env` files
- In Kubernetes, use Secrets
- For manual deployments, use environment-specific configuration files

### HTTPS

Always use HTTPS in production. The Nginx configuration is set up to work with SSL/TLS:

- For Kubernetes, use cert-manager for automatic certificate management
- For manual deployments, configure Nginx with SSL certificates

### Content Security Policy

The application includes a strict Content Security Policy to prevent XSS attacks. Review and adjust the CSP in `nginx.conf` if you need to allow additional resources.

## Performance Optimizations

### Bundle Analysis

To analyze the bundle size:

```bash
npm run build:analyze
```

This generates a `stats.html` file in the `dist` directory with a visualization of the bundle size.

### Caching Strategy

The Nginx configuration includes optimal cache headers for static assets:

- JavaScript and CSS files: 30 days
- Images and fonts: 30 days
- HTML files: no cache (for immediate updates)

## Monitoring & Logging

### Health Check Endpoint

The application provides a health check endpoint at `/health.json` that returns:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-09-21T20:45:30Z",
  "service": "rica-landing"
}
```

Use this endpoint for monitoring and alerting.

### Logging

In production, console logs are disabled. For logging:

- Use Nginx access and error logs
- Configure log rotation to prevent disk space issues
- Consider integrating with a centralized logging system

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Applied

If environment variables are not applied:

- Check if `env.js` is properly generated
- Verify the file is served correctly
- Use the update-env script to update variables

#### 2. Rate Limiting Issues

If legitimate traffic is being rate-limited:

- Adjust the rate limit settings in `nginx.conf`
- Increase the `burst` parameter for higher traffic spikes

#### 3. Content Security Policy Blocking Resources

If CSP is blocking legitimate resources:

- Check browser console for CSP violation reports
- Update the CSP directive in `nginx.conf` to allow necessary resources

#### 4. Performance Issues

If the application is slow:

- Check network waterfall in browser dev tools
- Verify that compression is working
- Ensure caching headers are properly set
- Review bundle size with the analyzer tool
