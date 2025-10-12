# Rica Ubuntu Server Deployment Guide

## Prerequisites
- Ubuntu 22.04 LTS
- Docker installed
- Docker Compose installed

## Deployment Steps

1. **Transfer Files**
```bash
scp -r Rica/ user@your-server:/opt/
```

2. **SSH into Server**
```bash
ssh user@your-server
cd /opt/Rica
```

3. **Set Permissions**
```bash
chmod +x deploy-prod.sh
```

4. **Run Deployment**
```bash
./deploy-prod.sh
```

5. **Verify Services**
```bash
docker ps
docker logs rica_firebase-sync_1
```

## Post-Deployment Checks
1. Access Rica UI: http://your-server-ip
2. Test user signup
3. Verify PostgreSQL user sync:
```bash
docker exec postgres-primary psql -U postgres -d rica -c "SELECT * FROM users;"
```

## Maintenance
- **Backups**: Daily backups to /backups
- **Updates**: Run `docker-compose pull` then restart
- **Monitoring**: Access Prometheus at http://your-server-ip:9090
