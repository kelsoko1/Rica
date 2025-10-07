# Rica Deployment Checklist

## Pre-Deployment

### Server Preparation
- [ ] Ubuntu 20.04/22.04 LTS server provisioned
- [ ] Minimum 8GB RAM, 4 CPU cores, 50GB storage
- [ ] Static IP address assigned
- [ ] SSH access configured
- [ ] Domain name registered (optional)
- [ ] DNS A records configured

### Local Preparation
- [ ] Rica project files ready
- [ ] Firebase project created (for rica-landing)
- [ ] ClickPesa account setup (for payments)
- [ ] SSL certificates obtained (or ready for Let's Encrypt)
- [ ] Environment variables documented

---

## Installation Phase

### System Setup
- [ ] System updated (`sudo apt update && sudo apt upgrade`)
- [ ] Essential tools installed (curl, wget, git, vim, ufw)
- [ ] Non-root user created (if needed)
- [ ] Firewall configured (ports 22, 80, 443, 2020-2022, 3000-3001, 3030)

### Docker Installation
- [ ] Docker Engine installed
- [ ] Docker Compose installed
- [ ] User added to docker group
- [ ] Docker tested without sudo

### Node.js Installation
- [ ] Node.js 18 LTS installed
- [ ] npm verified
- [ ] PM2 installed globally
- [ ] serve package installed globally

---

## Project Setup

### File Transfer
- [ ] Project directory created (`/var/www/rica`)
- [ ] Permissions set correctly
- [ ] Files uploaded/cloned to server
- [ ] File ownership verified

### Environment Configuration
- [ ] Main `.env` file created and configured
- [ ] Rica-UI `.env` file created
- [ ] Rica-Landing `.env` file created
- [ ] Firebase credentials added
- [ ] ClickPesa credentials added
- [ ] All passwords changed from defaults
- [ ] Secrets generated (AP_API_KEY, AP_ENCRYPTION_KEY, etc.)

### Docker Network
- [ ] rica-network created
- [ ] Network verified (`docker network ls`)
- [ ] Subnet configured (172.25.0.0/16)

---

## Dependencies

### Docker Images
- [ ] nginx:alpine pulled
- [ ] postgres:15-alpine pulled
- [ ] redis:7-alpine pulled
- [ ] activepieces/activepieces:latest pulled
- [ ] codercom/code-server:latest pulled
- [ ] ollama/ollama:latest pulled

### Node Packages
- [ ] Rica-UI dependencies installed
- [ ] Rica-UI built for production
- [ ] Rica-Landing dependencies installed
- [ ] Rica-Landing built for production

---

## Service Deployment

### Docker Services
- [ ] PostgreSQL started and healthy
- [ ] Redis started and healthy
- [ ] Activepieces started and healthy
- [ ] Code Server started and healthy
- [ ] Ollama started and healthy
- [ ] All services verified (`docker-compose ps`)

### Ollama Configuration
- [ ] DeepSeek model downloaded
- [ ] Model verified (`docker exec ollama ollama list`)
- [ ] Ollama API responding

### PM2 Applications
- [ ] ecosystem.config.js created
- [ ] Rica-UI started with PM2
- [ ] Rica-Landing started with PM2
- [ ] PM2 apps verified (`pm2 status`)
- [ ] PM2 configuration saved
- [ ] PM2 startup configured

---

## Web Server

### Nginx Configuration
- [ ] Nginx installed
- [ ] Site configuration created
- [ ] Reverse proxy configured for all services
- [ ] Configuration tested (`sudo nginx -t`)
- [ ] Nginx restarted
- [ ] Nginx enabled on boot

### SSL/TLS
- [ ] Certbot installed
- [ ] SSL certificates obtained
- [ ] HTTPS redirect configured
- [ ] Auto-renewal tested
- [ ] All domains secured

---

## Security

### Firewall
- [ ] UFW enabled
- [ ] Required ports opened
- [ ] Unnecessary ports blocked
- [ ] Firewall rules verified

### SSH Hardening
- [ ] Root login disabled
- [ ] Password authentication disabled (if using keys)
- [ ] SSH port changed (optional)
- [ ] Fail2Ban installed and configured

### Application Security
- [ ] All default passwords changed
- [ ] Strong passwords used
- [ ] Secrets properly secured
- [ ] Environment variables not exposed
- [ ] CORS configured properly

### System Security
- [ ] Automatic security updates enabled
- [ ] System logs monitored
- [ ] Fail2Ban configured
- [ ] Rate limiting configured

---

## Monitoring & Maintenance

### Logging
- [ ] Log rotation configured
- [ ] Docker logs accessible
- [ ] PM2 logs accessible
- [ ] Nginx logs accessible
- [ ] Application logs configured

### Monitoring
- [ ] Health check script created
- [ ] Cron job for health checks configured
- [ ] Monitoring alerts setup (optional)
- [ ] Uptime monitoring configured (optional)

### Backups
- [ ] Backup script created
- [ ] Daily backup cron job configured
- [ ] Backup directory created
- [ ] Backup retention policy set
- [ ] Restore procedure tested

### Systemd Services
- [ ] Rica systemd service created
- [ ] Service enabled on boot
- [ ] Service tested (start/stop/restart)

---

## Testing

### Service Accessibility
- [ ] Rica UI accessible (http://domain.com)
- [ ] Rica Landing accessible (http://landing.domain.com)
- [ ] Activepieces accessible (http://auto.domain.com)
- [ ] Code Server accessible (http://code.domain.com)
- [ ] Ollama API responding

### Functionality Testing
- [ ] User can login/register
- [ ] Starry AI responds
- [ ] Project Explorer loads Code Server
- [ ] Auto tab loads Activepieces
- [ ] Payment system works
- [ ] Firebase auth works
- [ ] All tabs/features functional

### Performance Testing
- [ ] Page load times acceptable
- [ ] API response times good
- [ ] No memory leaks
- [ ] CPU usage normal
- [ ] Disk space sufficient

### Security Testing
- [ ] HTTPS working
- [ ] SSL certificates valid
- [ ] No mixed content warnings
- [ ] CORS working properly
- [ ] Authentication working
- [ ] Authorization working

---

## Documentation

### Technical Documentation
- [ ] Server specifications documented
- [ ] Port mappings documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide created

### Operational Documentation
- [ ] Restart procedures documented
- [ ] Backup/restore procedures documented
- [ ] Update procedures documented
- [ ] Monitoring procedures documented
- [ ] Incident response plan created

### User Documentation
- [ ] User guides created
- [ ] Admin guides created
- [ ] FAQ updated
- [ ] Support contact information provided

---

## Post-Deployment

### Verification
- [ ] All services running
- [ ] All health checks passing
- [ ] No errors in logs
- [ ] Performance metrics normal
- [ ] Security scan passed

### Handover
- [ ] Credentials shared securely
- [ ] Documentation provided
- [ ] Training completed
- [ ] Support plan established
- [ ] Escalation procedures defined

### Optimization
- [ ] Performance tuning completed
- [ ] Caching configured
- [ ] CDN setup (if applicable)
- [ ] Database optimized
- [ ] Monitoring fine-tuned

---

## Emergency Contacts

### Technical Contacts
- Server Provider: _______________
- Domain Registrar: _______________
- SSL Provider: _______________
- Backup Service: _______________

### Application Contacts
- Firebase Support: _______________
- ClickPesa Support: _______________
- Docker Support: _______________

---

## Rollback Plan

### Rollback Checklist
- [ ] Previous version backed up
- [ ] Rollback procedure documented
- [ ] Rollback tested in staging
- [ ] Rollback time estimated
- [ ] Stakeholders notified

### Rollback Steps
1. Stop current services
2. Restore previous Docker images
3. Restore previous code
4. Restore database backup
5. Restart services
6. Verify functionality
7. Notify stakeholders

---

## Sign-Off

### Deployment Team
- [ ] Developer Sign-off: _____________ Date: _______
- [ ] DevOps Sign-off: _____________ Date: _______
- [ ] QA Sign-off: _____________ Date: _______
- [ ] Security Sign-off: _____________ Date: _______

### Stakeholders
- [ ] Project Manager: _____________ Date: _______
- [ ] Product Owner: _____________ Date: _______
- [ ] Client/Sponsor: _____________ Date: _______

---

## Notes

### Deployment Date: _________________
### Deployment Time: _________________
### Deployed By: _________________
### Server IP: _________________
### Domain: _________________

### Issues Encountered:
```
[List any issues and how they were resolved]
```

### Deviations from Plan:
```
[List any deviations from the deployment plan]
```

### Lessons Learned:
```
[Document lessons learned for future deployments]
```

---

**Checklist Version:** 1.0  
**Last Updated:** October 6, 2025
