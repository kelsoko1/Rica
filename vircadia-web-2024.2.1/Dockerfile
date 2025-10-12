# ==========================================================
# RICA-VIRCADIA WEB - PRODUCTION DOCKERFILE
# ==========================================================
# This builds the Vircadia Web client and serves it via Nginx
# Designed to work with Rica's existing Vircadia headless server

# Stage 1: Build the web client
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY quasar.config.js ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve via NGINX
FROM nginx:stable-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy build output to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create health check endpoint
RUN echo "OK" > /usr/share/nginx/html/health

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
