# Rica Server Deployment Guide

## Complete Production Server Deployment

**Target:** Linux/Ubuntu Server (VPS/Cloud)  
**Last Updated:** October 6, 2025

---

## 📋 Prerequisites

### Server Requirements
- **OS:** Ubuntu 20.04 LTS or 22.04 LTS
- **RAM:** Minimum 8GB (16GB recommended)
- **CPU:** 4+ cores
- **Storage:** 50GB+ SSD
- **Network:** Static IP address
- **Domain:** Registered domain name (optional but recommended)

### Local Requirements
- SSH client installed
- Server SSH access (root or sudo user)
- Domain DNS configured (if using domain)

---

## 🚀 Step-by-Step Deployment

### Step 1: Initial Server Setup

#### 1.1 Connect to Server
```bash
# From your local machine
ssh root@your-server-ip

# Or if using key-based auth
ssh -i /path/to/key.pem ubuntu@your-server-ip
```

#### 1.2 Update System
```bash
# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git vim ufw
```

#### 1.3 Create Non-Root User (if using root)
```bash
# Create new user
adduser rica

# Add to sudo group
usermod -aG sudo rica

# Switch to new user
su - rica
```

#### 1.4 Configure Firewall
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Rica ports
sudo ufw allow 2020/tcp  # Activepieces
sudo ufw allow 2021/tcp  # Code Server
sudo ufw allow 2022/tcp  # Ollama
sudo ufw allow 3000/tcp  # Rica UI
sudo ufw allow 3001/tcp  # Rica API
sudo ufw allow 3030/tcp  # Rica Landing

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

### Step 2: Install Docker

#### 2.1 Install Docker Engine
```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Verify installation
sudo docker --version
```

#### 2.2 Install Docker Compose
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

#### 2.3 Configure Docker Permissions
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Test Docker without sudo
docker ps
```

---

### Step 3: Install Node.js

#### 3.1 Install Node.js 18 LTS
```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

#### 3.2 Install PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

---

### Step 4: Clone Rica Project

#### 4.1 Create Project Directory
```bash
# Create directory
sudo mkdir -p /var/www/rica
sudo chown -R $USER:$USER /var/www/rica

# Navigate to directory
cd /var/www/rica
```

#### 4.2 Clone Repository
```bash
# Option 1: Clone from Git (if you have a repo)
git clone https://github.com/yourusername/rica.git .

# Option 2: Upload files via SCP (from local machine)
# On your local machine:
# scp -r c:\Users\kelvin\Desktop\Rica/* user@server-ip:/var/www/rica/
```

#### 4.3 Set Permissions
```bash
# Set ownership
sudo chown -R $USER:$USER /var/www/rica

# Set permissions
chmod -R 755 /var/www/rica
```

---

### Step 5: Configure Environment Variables

#### 5.1 Create Main .env File
```bash
cd /var/www/rica

# Copy example file
cp .env.example .env

# Edit .env file
nano .env
```

**Update these values:**
```bash
# PostgreSQL
POSTGRES_PASSWORD=YourSecurePassword123!
POSTGRES_USER=rica
POSTGRES_DB=rica

# Activepieces
AP_API_KEY=$(openssl rand -hex 32)
AP_ENCRYPTION_KEY=$(openssl rand -hex 32)
AP_JWT_SECRET=$(openssl rand -hex 32)
AP_POSTGRES_PASSWORD=YourActivepiecesPassword123!
AP_FRONTEND_URL=http://your-domain.com:2020

# Redis
REDIS_PASSWORD=$(openssl rand -hex 32)

# Code Server
CODE_SERVER_PASSWORD=YourCodeServerPassword123!
CODE_SERVER_SUDO_PASSWORD=YourSudoPassword123!

# Ollama
OLLAMA_MODEL=deepseek-r1:1.5b

# Production URLs
DOMAIN=your-domain.com
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

#### 5.2 Create Rica-UI .env
```bash
cd /var/www/rica/rica-ui

# Copy example
cp .env.example .env

# Edit file
nano .env
```

**Update:**
```bash
REACT_APP_API_URL=http://your-domain.com:3001/api
REACT_APP_AUTO_URL=http://your-domain.com:2020
REACT_APP_CODE_SERVER_URL=http://your-domain.com:2021
REACT_APP_OLLAMA_URL=http://your-domain.com:2022
```

#### 5.3 Create Rica-Landing .env
```bash
cd /var/www/rica/rica-landing

# Copy example
cp .env.example .env

# Edit file
nano .env
```

**Update with your Firebase and ClickPesa credentials:**
```bash
# Firebase
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# ClickPesa
REACT_APP_CLICKPESA_API_KEY=your-clickpesa-api-key
REACT_APP_CLICKPESA_COLLECTION_ACCOUNT=your-collection-account

# API
REACT_APP_API_URL=http://your-domain.com:3001/api
```

---

### Step 6: Create Docker Network

#### 6.1 Create Rica Network
```bash
cd /var/www/rica

# Create network
docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1

# Verify
docker network ls | grep rica-network
```

---

### Step 7: Install Dependencies

#### 7.1 Install Rica-UI Dependencies
```bash
cd /var/www/rica/rica-ui

# Install packages
npm install --production

# Build for production
npm run build
```

#### 7.2 Install Rica-Landing Dependencies
```bash
cd /var/www/rica/rica-landing

# Install packages
npm install --production

# Build for production
npm run build
```

---

### Step 8: Pull Docker Images

#### 8.1 Pull All Required Images
```bash
cd /var/www/rica

# Pull images
docker pull nginx:alpine
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull activepieces/activepieces:latest
docker pull codercom/code-server:latest
docker pull ollama/ollama:latest
```

---

### Step 9: Start Docker Services

#### 9.1 Start Infrastructure Services
```bash
cd /var/www/rica

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose ps
```

#### 9.2 Verify Services
```bash
# Check logs
docker-compose logs -f

# Check individual service
docker-compose logs activepieces
docker-compose logs code-server
docker-compose logs ollama
```

---

### Step 10: Initialize Ollama

#### 10.1 Download AI Model
```bash
# Pull DeepSeek model
docker exec ollama ollama pull deepseek-r1:1.5b

# Verify
docker exec ollama ollama list
```

**Expected output:**
```
NAME                    ID              SIZE
deepseek-r1:1.5b       abc123def       1.5 GB
```

---

### Step 11: Configure PM2 for Node Apps

#### 11.1 Create PM2 Ecosystem File
```bash
cd /var/www/rica

# Create ecosystem file
nano ecosystem.config.js
```

**Add this configuration:**
```javascript
module.exports = {
  apps: [
    {
      name: 'rica-ui',
      cwd: '/var/www/rica/rica-ui',
      script: 'npx',
      args: 'serve -s build -l 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'rica-landing',
      cwd: '/var/www/rica/rica-landing',
      script: 'npx',
      args: 'serve -s build -l 3030',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

#### 11.2 Install Serve Package
```bash
# Install serve globally
sudo npm install -g serve
```

#### 11.3 Start Applications with PM2
```bash
cd /var/www/rica

# Start apps
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

---

### Step 12: Configure Nginx Reverse Proxy

#### 12.1 Install Nginx
```bash
sudo apt install -y nginx
```

#### 12.2 Create Nginx Configuration
```bash
# Create config file
sudo nano /etc/nginx/sites-available/rica
```

**Add this configuration:**
```nginx
# Rica UI
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Rica Landing
server {
    listen 80;
    server_name landing.your-domain.com;

    location / {
        proxy_pass http://localhost:3030;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Activepieces
server {
    listen 80;
    server_name auto.your-domain.com;

    location / {
        proxy_pass http://localhost:2020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Code Server
server {
    listen 80;
    server_name code.your-domain.com;

    location / {
        proxy_pass http://localhost:2021;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 12.3 Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/rica /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable on boot
sudo systemctl enable nginx
```

---

### Step 13: Setup SSL/TLS with Let's Encrypt

#### 13.1 Install Certbot
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

#### 13.2 Obtain SSL Certificates
```bash
# Get certificates for all domains
sudo certbot --nginx -d your-domain.com -d landing.your-domain.com -d auto.your-domain.com -d code.your-domain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

#### 13.3 Test Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot will auto-renew before expiry
```

---

### Step 14: Configure Monitoring

#### 14.1 Setup Log Rotation
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/rica
```

**Add:**
```
/var/www/rica/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

#### 14.2 Setup Health Monitoring Script
```bash
# Create monitoring script
nano /var/www/rica/health-check.sh
```

**Add:**
```bash
#!/bin/bash

echo "Rica Health Check - $(date)"
echo "================================"

# Check Docker services
echo "Docker Services:"
docker-compose -f /var/www/rica/docker-compose.prod.yml ps

# Check PM2 apps
echo -e "\nPM2 Applications:"
pm2 status

# Check ports
echo -e "\nPort Status:"
nc -zv localhost 2020 && echo "✓ Activepieces (2020)" || echo "✗ Activepieces (2020)"
nc -zv localhost 2021 && echo "✓ Code Server (2021)" || echo "✗ Code Server (2021)"
nc -zv localhost 2022 && echo "✓ Ollama (2022)" || echo "✗ Ollama (2022)"
nc -zv localhost 3000 && echo "✓ Rica UI (3000)" || echo "✗ Rica UI (3000)"
nc -zv localhost 3030 && echo "✓ Rica Landing (3030)" || echo "✗ Rica Landing (3030)"

echo "================================"
```

**Make executable:**
```bash
chmod +x /var/www/rica/health-check.sh
```

#### 14.3 Setup Cron Job for Monitoring
```bash
# Edit crontab
crontab -e

# Add this line (runs every 5 minutes)
*/5 * * * * /var/www/rica/health-check.sh >> /var/www/rica/logs/health.log 2>&1
```

---

### Step 15: Verify Deployment

#### 15.1 Check All Services
```bash
# Run health check
/var/www/rica/health-check.sh

# Check Docker
docker ps

# Check PM2
pm2 status

# Check Nginx
sudo systemctl status nginx
```

#### 15.2 Test URLs
```bash
# Test from server
curl http://localhost:3000
curl http://localhost:3030
curl http://localhost:2020/api/v1/flags
curl http://localhost:2021/healthz
curl http://localhost:2022/api/version

# Test from browser (your local machine)
# http://your-domain.com
# http://landing.your-domain.com
# http://auto.your-domain.com
# http://code.your-domain.com
```

---

### Step 16: Security Hardening

#### 16.1 Configure Fail2Ban
```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Copy default config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit config
sudo nano /etc/fail2ban/jail.local

# Enable SSH protection (find [sshd] section and set):
# enabled = true
# maxretry = 3

# Start Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

#### 16.2 Disable Root Login
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Set these values:
# PermitRootLogin no
# PasswordAuthentication no  # If using SSH keys

# Restart SSH
sudo systemctl restart sshd
```

#### 16.3 Setup Automatic Security Updates
```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Enable automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

### Step 17: Backup Configuration

#### 17.1 Create Backup Script
```bash
# Create backup script
nano /var/www/rica/backup.sh
```

**Add:**
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/rica"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup Docker volumes
docker run --rm -v activepieces_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/activepieces-$DATE.tar.gz /data
docker run --rm -v code_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/code-server-$DATE.tar.gz /data
docker run --rm -v ollama_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/ollama-$DATE.tar.gz /data

# Backup environment files
tar czf $BACKUP_DIR/env-$DATE.tar.gz /var/www/rica/.env /var/www/rica/rica-ui/.env /var/www/rica/rica-landing/.env

# Backup database
docker exec postgres pg_dump -U rica rica > $BACKUP_DIR/database-$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
```

**Make executable:**
```bash
chmod +x /var/www/rica/backup.sh
```

#### 17.2 Schedule Daily Backups
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/rica/backup.sh >> /var/www/rica/logs/backup.log 2>&1
```

---

## 🔄 Maintenance Commands

### Restart Services
```bash
# Restart Docker services
cd /var/www/rica
docker-compose -f docker-compose.prod.yml restart

# Restart PM2 apps
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx
```

### Update Rica
```bash
# Pull latest code
cd /var/www/rica
git pull

# Rebuild UI
cd rica-ui
npm install
npm run build

# Rebuild Landing
cd ../rica-landing
npm install
npm run build

# Restart apps
pm2 restart all
```

### View Logs
```bash
# Docker logs
docker-compose logs -f

# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

---

## 🚨 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs <service-name>
pm2 logs <app-name>

# Check ports
sudo netstat -tulpn | grep LISTEN

# Restart service
docker-compose restart <service-name>
pm2 restart <app-name>
```

### Out of Memory
```bash
# Check memory usage
free -h
docker stats

# Increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### SSL Certificate Issues
```bash
# Renew certificates
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## ✅ Deployment Checklist

- [ ] Server provisioned and accessible
- [ ] Docker and Docker Compose installed
- [ ] Node.js and PM2 installed
- [ ] Rica project cloned/uploaded
- [ ] Environment variables configured
- [ ] Docker network created
- [ ] Dependencies installed
- [ ] Docker services started
- [ ] Ollama model downloaded
- [ ] PM2 apps running
- [ ] Nginx configured
- [ ] SSL certificates obtained
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Security hardening complete
- [ ] All services accessible
- [ ] Health checks passing

---

## 🎉 Deployment Complete!

Your Rica server is now deployed and running at:

- **Main App:** https://your-domain.com
- **Landing:** https://landing.your-domain.com
- **Auto:** https://auto.your-domain.com
- **Code:** https://code.your-domain.com

**Next Steps:**
1. Test all functionality
2. Configure DNS records
3. Setup monitoring alerts
4. Document custom configurations
5. Train users

---

**Server Deployment Guide Version:** 1.0  
**Last Updated:** October 6, 2025
