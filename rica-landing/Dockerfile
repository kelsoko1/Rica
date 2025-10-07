# Multi-stage build for Rica Landing Page

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create production env.js file
RUN echo "/**\n * Environment variables for browser\n * Generated during build process\n */\n\nwindow.env = {\n  NODE_ENV: 'production',\n  REACT_APP_API_URL: '${REACT_APP_API_URL:-/api}',\n  REACT_APP_CLICKPESA_API_KEY: '${REACT_APP_CLICKPESA_API_KEY}',\n  REACT_APP_ENCRYPTION_KEY: '${REACT_APP_ENCRYPTION_KEY}',\n  REACT_APP_ANALYTICS_KEY: '${REACT_APP_ANALYTICS_KEY}',\n  REACT_APP_SENTRY_DSN: '${REACT_APP_SENTRY_DSN}',\n  // Firebase configuration\n  REACT_APP_FIREBASE_API_KEY: '${REACT_APP_FIREBASE_API_KEY}',\n  REACT_APP_FIREBASE_AUTH_DOMAIN: '${REACT_APP_FIREBASE_AUTH_DOMAIN}',\n  REACT_APP_FIREBASE_PROJECT_ID: '${REACT_APP_FIREBASE_PROJECT_ID}',\n  REACT_APP_FIREBASE_STORAGE_BUCKET: '${REACT_APP_FIREBASE_STORAGE_BUCKET}',\n  REACT_APP_FIREBASE_MESSAGING_SENDER_ID: '${REACT_APP_FIREBASE_MESSAGING_SENDER_ID}',\n  REACT_APP_FIREBASE_APP_ID: '${REACT_APP_FIREBASE_APP_ID}'\n};" > ./public/env.js

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:stable-alpine

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 -G nginx-user

# Set ownership of the application files
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
