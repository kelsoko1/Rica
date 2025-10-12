# Vircadia Web Integration Guide for Rica

## 🎯 Overview

This guide explains how to integrate the **Vircadia Web client** into your Rica platform, providing users with direct access to the metaverse through a beautiful, responsive interface.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Rica UI       │    │  Vircadia Web    │    │ Vircadia Server │
│                 │    │   (Port 2024)    │    │   (Port 2023)   │
│ • Metaverse Tab │◄──►│                  │◄──►│                 │
│ • Credit System │    │ • Web Interface  │    │ • 3D World      │
│ • User Auth     │    │ • Real-time Comm │    │ • Multiplayer   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- ✅ Vircadia headless server running (Port 2023)
- ✅ Docker and Docker Compose installed
- ✅ Rica network created (`rica-network`)
- ✅ Vircadia Web source code in `vircadia-web-2024.2.1/`

## 🚀 Quick Start

### 1. Start the Integration

```bash
# Windows
start-vircadia-web.bat

# Linux/Mac
./start-vircadia-web.sh
```

This will:
- ✅ Build the Vircadia Web Docker image
- ✅ Start all headless servers
- ✅ Configure Nginx routing

### 2. Access the Metaverse

🌐 **http://localhost:2024**

## 🔧 Manual Setup

### 1. Build Docker Image

```bash
cd vircadia-web-2024.2.1
docker build -t rica-vircadia-web:latest -f Dockerfile .
```

### 2. Start Services

```bash
# Start Vircadia Web client
docker run -d \
  --name vircadia-web \
  --network rica-network \
  -p 2024:80 \
  -e NODE_ENV=production \
  -e VITE_API_URL=http://vircadia:3020/api \
  rica-vircadia-web:latest

# Ensure Vircadia headless is running
docker run -d \
  --name vircadia-server \
  --network rica-network \
  -p 2023:3020 \
  vircadia/vircadia-world:latest
```

### 3. Configure Nginx (if needed)

Add to your `rica-complete.conf`:

```nginx
# Include the vircadia-web.conf
include vircadia-web.conf;
```

## 🎨 UI Integration

### Add Metaverse Tab to Rica UI

1. **Copy Components**
   ```bash
   # Copy to your Rica UI components directory
   cp Metaverse.jsx rica-ui/src/components/
   cp Metaverse.css rica-ui/src/components/
   ```

2. **Add to Navigation**
   ```jsx
   // In your App.js or main navigation component
   import Metaverse from './components/Metaverse';

   // Add to your routes or tabs
   <Route path="/metaverse" component={Metaverse} />
   ```

3. **Add Navigation Button**
   ```jsx
   // In your sidebar navigation
   <NavItem to="/metaverse" icon="🌐">
     Spatial Reality
   </NavItem>
   ```

## 💰 Credit Integration

The metaverse integrates with Rica's credit system:

```jsx
// In Metaverse.jsx - deduct credits on access
useEffect(() => {
  // Deduct 5 credits for 30 minutes of metaverse access
  deductCredits('spatial_session', 5);
}, []);
```

## 🔒 Security Features

- **CORS Protection**: Properly configured headers
- **Iframe Security**: Same-origin policy compliance
- **WebSocket Security**: Secure real-time communication
- **Resource Limits**: Docker resource constraints

## 🛠️ Customization

### Environment Variables

```bash
# In docker-compose.headless-servers.yml
environment:
  - NODE_ENV=production
  - VITE_API_URL=http://vircadia:3020/api
  - VITE_WS_URL=ws://vircadia:3020
```

### Nginx Configuration

Customize `nginx.conf` in the Vircadia Web container:

```nginx
# Custom routes or middleware can be added here
location /custom/ {
    # Add custom logic
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"Vircadia Web not accessible"**
   - Check if container is running: `docker ps | grep vircadia-web`
   - Verify port 2024 is not in use
   - Check logs: `docker logs vircadia-web`

2. **"Cannot connect to Vircadia server"**
   - Ensure Vircadia headless is running on port 2023
   - Check network connectivity: `docker network ls`
   - Verify API endpoints are accessible

3. **"Build fails"**
   - Ensure Node.js 20+ is available in container
   - Check package.json dependencies
   - Verify build context path

### Health Checks

```bash
# Check Vircadia Web health
curl http://localhost:2024/health

# Check Vircadia server health
curl http://localhost:2023/health

# View container logs
docker logs vircadia-web
docker logs vircadia_world_server
```

## 📊 Monitoring

### Service Status
```bash
# Check all running containers
docker ps --filter "network=rica-network"

# Check resource usage
docker stats vircadia-web vircadia_world_server
```

### Logs
```bash
# View Vircadia Web logs
docker logs -f vircadia-web

# View Vircadia server logs
docker logs -f vircadia_world_server
```

## 🚀 Production Deployment

### Kubernetes

```yaml
# Add to your tenant deployment
- name: vircadia-web
  image: rica-vircadia-web:latest
  ports:
  - containerPort: 80
  env:
  - name: NODE_ENV
    value: "production"
```

### SSL/HTTPS

Add to Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name spatial.rica.io;

    ssl_certificate /etc/nginx/certs/rica.crt;
    ssl_certificate_key /etc/nginx/certs/rica.key;

    location / {
        proxy_pass http://vircadia-web:80;
        # ... rest of config
    }
}
```

## 🎯 Next Steps

1. **Add to Multi-Tenant**: Extend for per-tenant metaverse instances
2. **Enhanced UI**: Add more metaverse controls and features
3. **VR Support**: Integrate with VR headsets
4. **Social Features**: Add user presence and avatars
5. **Content Creation**: Enable world building tools

## 📞 Support

- **Documentation**: `VIRCADIA_INTEGRATION.md`
- **Issues**: Check container logs and health endpoints
- **Community**: Join Vircadia Discord for metaverse-specific help

---

🎉 **Congratulations!** You now have a fully integrated metaverse platform within Rica! Users can access virtual worlds directly through your interface with proper credit management and security.
