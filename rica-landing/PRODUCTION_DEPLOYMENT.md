# Rica Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Rica application to production, including the landing page, UI, and API services. It covers environment setup, security considerations, performance optimization, and monitoring.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Security Considerations](#security-considerations)
4. [Performance Optimization](#performance-optimization)
5. [Deployment Process](#deployment-process)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Backup and Recovery](#backup-and-recovery)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to production, ensure you have the following:

- Node.js 16+ installed on the production server
- Access to production environment variables and secrets
- SSL certificate for secure HTTPS connections
- Database for persistent storage (replacing localStorage)
- ClickPesa API production credentials
- Monitoring tools set up (e.g., Sentry, New Relic)

## Environment Configuration

### Environment Variables

Create a `.env.production` file with the following variables:

```
# Application
NODE_ENV=production
REACT_APP_API_URL=https://api.rica.io

# Security
REACT_APP_ENCRYPTION_KEY=your-secure-encryption-key

# Payment
REACT_APP_CLICKPESA_API_KEY=your-production-clickpesa-api-key
REACT_APP_CLICKPESA_API_URL=https://api.clickpesa.com/v1

# Analytics
REACT_APP_ANALYTICS_KEY=your-analytics-key

# Error Reporting
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

### Configuration File

The `environment.js` file already contains production-specific configuration. Review and update the following settings:

- `recurringPayments.maxRetryAttempts`: Adjust based on your retry policy
- `recurringPayments.retryDelayMs`: Set appropriate delay between retry attempts
- `recurringPayments.batchDelayMs`: Configure rate limiting between batch processing
- `recurringPayments.maxBatchSize`: Set batch size based on server capacity

## Security Considerations

### Data Encryption

The recurring payments feature includes basic encryption for sensitive data. For production:

1. Replace the basic Base64 encoding with a proper encryption library:

```javascript
// In recurringPaymentService.js
const encryptData = (data) => {
  // Replace with proper encryption
  const crypto = require('crypto');
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decryptData = (encryptedData) => {
  // Replace with proper decryption
  const crypto = require('crypto');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};
```

### API Security

1. Implement proper authentication for API calls:

```javascript
// Example API call with authentication
fetch(`${config.apiBaseUrl}/recurring-payments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`
  },
  body: JSON.stringify(encryptedPayments)
});
```

2. Set up CORS properly on the server:

```javascript
// Server-side CORS configuration
app.use(cors({
  origin: 'https://rica.io',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Input Validation

All inputs are validated in the recurring payments feature. Review validation rules in:

- `recurringPaymentService.js`: For service-level validation
- `RecurringPaymentManager.jsx`: For UI-level validation

## Performance Optimization

### Batch Processing

The recurring payments feature includes batch processing with rate limiting. Configure these settings based on your server capacity:

```javascript
// In environment.js
recurringPayments: {
  maxRetryAttempts: 5,
  retryDelayMs: 3600000, // 1 hour
  batchDelayMs: 5000,    // 5 seconds between batches
  maxBatchSize: 20       // Process 20 payments per batch
}
```

### Caching

Enable caching for frequently accessed data:

```javascript
// In environment.js
cacheEnabled: true,
cacheTTL: 3600, // 1 hour
```

### Database Integration

Replace localStorage with a proper database:

1. Create database models for recurring payments
2. Update the recurring payment service to use the database
3. Implement proper indexing for efficient queries

## Deployment Process

### Build Process

1. Install dependencies:
   ```bash
   npm ci
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Test the production build:
   ```bash
   npm run preview
   ```

### Docker Deployment

1. Create a production Dockerfile:

```dockerfile
# Build stage
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create an optimized nginx.conf:

```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Compression
    gzip on;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Build and run the Docker container:

```bash
docker build -t rica-landing:production .
docker run -p 80:80 rica-landing:production
```

### Kubernetes Deployment

1. Create a Kubernetes deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rica-landing
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rica-landing
  template:
    metadata:
      labels:
        app: rica-landing
    spec:
      containers:
      - name: rica-landing
        image: rica-landing:production
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "0.5"
            memory: "512Mi"
          requests:
            cpu: "0.2"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

2. Create a Kubernetes service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: rica-landing
spec:
  selector:
    app: rica-landing
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

3. Apply the Kubernetes manifests:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## Monitoring and Logging

### Error Tracking

The application is configured to use Sentry for error tracking:

```javascript
// In environment.js
errorReporting: {
  enabled: true,
  service: 'sentry',
  dsn: process.env.REACT_APP_SENTRY_DSN
}
```

### Analytics

The analytics service is configured to track important events:

- Payment events
- Subscription events
- Recurring payment events
- User interactions

### Logging

The application includes structured logging for production:

```javascript
// Example production logging
if (config.isProd) {
  console.info(`[${new Date().toISOString()}] Processing recurring payment ${paymentId} for user ${recurringPayment.userId}`);
}
```

For a more robust solution, integrate with a logging service like Logstash or CloudWatch.

## Backup and Recovery

### Data Backup

1. Set up regular backups of the database
2. Store backups in a secure location
3. Test the restore process regularly

### Disaster Recovery

1. Document the recovery process
2. Set up automated recovery procedures
3. Conduct regular disaster recovery drills

## Troubleshooting

### Common Issues

1. **Payment Processing Failures**
   - Check the payment provider status
   - Verify API credentials
   - Review error logs for specific error messages

2. **Scheduler Not Running**
   - Check if the scheduler service is initialized
   - Verify that the scheduler interval is running
   - Check for errors in the scheduler logs

3. **Performance Issues**
   - Review batch processing settings
   - Check server resources
   - Optimize database queries

### Debugging Tools

1. **Browser DevTools**
   - Check the console for errors
   - Review network requests
   - Analyze performance metrics

2. **Server Logs**
   - Check application logs
   - Review server error logs
   - Analyze performance metrics

3. **Monitoring Tools**
   - Review Sentry error reports
   - Check analytics data
   - Monitor server resources
