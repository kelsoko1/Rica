# Rica Project Cleanup Plan

## Overview
This document outlines the cleanup of unused files, folders, and scripts from the Rica project at its current stage.

## Files to be Removed

### 1. Swarm/Browser Feature Files (Feature Removed)
These files are from the removed Swarm browser anti-detect feature:
- `SWARM_REDESIGN_SUMMARY.md`
- `SWARM_QUICKSTART.md`
- `SWARM_GOLOGIN_UI.md`
- `SWARM_REMOVAL_SUMMARY.md`

**Reason**: The Swarm browser feature and CamouFox anti-detect engine were completely removed from the application.

### 2. OpenCTI/OpenBAS Standalone Files
These files are no longer needed as the services are now integrated differently:
- `docker-compose.openbas.yml`
- `docker-compose.opencti.yml`
- `fix-opencti-openbas.sh`

**Reason**: OpenCTI and OpenBAS are now integrated through the main docker-compose files and don't need standalone configurations.

### 3. Duplicate/Old Docker Compose Files
- `docker-compose.yml.new`
- `docker-compose.simple.yml`
- `docker-compose.yml`

**Reason**: These are duplicates or old versions. The project now uses:
- `docker-compose.prod.yml` (main production)
- `docker-compose.master.yml` (orchestration)
- `docker-compose.headless-servers.yml` (headless services)
- Individual service compose files (activepieces, code-server, ollama, etc.)

### 4. Old Deployment Scripts
- `deploy-simple.sh`
- `deploy-landing.sh`
- `deploy.bat`
- `deploy.sh`

**Reason**: Replaced by more comprehensive deployment scripts:
- `deploy-multi-tenancy.bat/sh`
- `deploy-prod.sh`
- `deploy-server.sh`
- `start-rica-complete.bat/sh`

### 5. Redundant Documentation
These are duplicate or outdated documentation files:
- `DEPLOYMENT.md` (superseded by DEPLOYMENT_GUIDE.md)
- `PRODUCTION_GUIDE.md` (superseded by PRODUCTION_DEPLOYMENT.md)
- `QUICKSTART.md` (superseded by MULTI_TENANCY_QUICKSTART.md)
- `QUICK_REFERENCE.md` (superseded by PORT_MAPPING.md)
- `QUICK_PORT_REFERENCE.md` (superseded by PORT_MAPPING.md)
- `OPENBAS_REMOVAL_SUMMARY.md` (historical, no longer needed)
- `DOCKER_SETUP_SUMMARY.md` (superseded by comprehensive guides)
- `DEPLOYMENT_STATUS.md` (temporary status file)
- `FINAL_SUMMARY.md` (temporary summary file)
- `IMPLEMENTATION_CHECKLIST.md` (completed checklist)
- `RICA_UI_READINESS_CHECKLIST.md` (completed checklist)

**Reason**: These are either duplicates of better documentation or temporary files from the development process.

### 6. Old Setup Scripts
- `setup.py`
- `setup.bat`
- `setup.sh`
- `install.sh`

**Reason**: The project now uses Docker-based deployment, making these manual setup scripts obsolete.

### 7. Old Update Scripts
- `update-docker-compose.bat/sh`
- `update-iframe-urls.bat/sh`

**Reason**: These were one-time migration scripts that are no longer needed.

### 8. Verification Scripts
- `verify-removal.bat/sh`

**Reason**: One-time verification scripts used during feature removal.

### 9. Old Nginx Configs
- `rica.conf`
- `headless-servers.conf`

**Reason**: Replaced by `rica-complete.conf` and `nginx.conf` which are more comprehensive.

### 10. Old Service Files
- `rica.service`

**Reason**: The project now uses Docker-based deployment instead of systemd services.

### 11. Empty/Minimal Package Files
- `package-lock.json` (83 bytes - essentially empty)

**Reason**: This is at the root level and not needed. Individual projects (rica-ui, rica-landing, rica-api) have their own package files.

## Documentation Reorganization

### Moving to docs/ Folder
The following architecture and design documents will be moved to a `docs/` folder for better organization:
- `AUTHENTICATION_ARCHITECTURE.md`
- `MULTI_TENANCY_ARCHITECTURE.md`
- `RICA_ARCHITECTURE.md`
- `RESPONSIVE_DESIGN_GUIDE.md`
- `VISUAL_IMPROVEMENTS_GUIDE.md`
- `UI_ENHANCEMENTS_SUMMARY.md`
- `ENHANCED_COMPONENTS_SUMMARY.md`

## Files to Keep

### Essential Docker Files
- `docker-compose.prod.yml` - Main production compose file
- `docker-compose.master.yml` - Master orchestration
- `docker-compose.headless-servers.yml` - Headless services
- `docker-compose.activepieces.yml` - Activepieces service
- `docker-compose.code-server.yml` - Code Server service
- `docker-compose.ollama.yml` - Ollama service
- `docker-compose.rica-ui.yml` - Rica UI service
- `docker-compose.network.yml` - Network configuration

### Essential Scripts
- `start-rica-complete.bat/sh` - Main startup scripts
- `start-headless-servers.bat/sh` - Headless servers startup
- `setup-headless-servers.bat/sh` - Headless servers setup
- `setup-network.bat/sh` - Network setup
- `deploy-multi-tenancy.bat/sh` - Multi-tenancy deployment
- `deploy-prod.sh` - Production deployment
- `deploy-server.sh` - Server deployment
- `update-headless-integration.bat/sh` - Headless integration updates
- `update-health-endpoints.bat/sh` - Health endpoint updates
- `cleanup-for-upload.bat/sh` - Repository cleanup scripts

### Essential Documentation
- `README.md` - Main project documentation
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- `MULTI_TENANCY_GUIDE.md` - Multi-tenancy guide
- `MULTI_TENANCY_QUICKSTART.md` - Quick start guide
- `MULTI_TENANCY_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `README_MULTI_TENANCY.md` - Multi-tenancy README
- `PORT_MAPPING.md` - Port reference guide
- `AUTOMATION_README.md` - Automation guide
- `DEVICE_LINKING_README.md` - Device linking guide
- `HEADLESS_SERVERS_README.md` - Headless servers guide
- `HEADLESS_INTEGRATION_SUMMARY.md` - Integration summary
- `HEADLESS_SERVER_INTEGRATION_SUMMARY.md` - Server integration
- `HEADLESS_SERVERS_REMOVAL_SUMMARY.md` - Removal summary
- `INTEGRATION_COMPLETE.md` - Integration completion
- `DOCKER_NETWORK_FIX_SUMMARY.md` - Network fix documentation
- `NETWORK_FIX_GUIDE.md` - Network troubleshooting
- `OLLAMA_PORT_UPDATE.md` - Port update documentation
- `PORT_REORGANIZATION_SUMMARY.md` - Port reorganization
- `REMOVED_FEATURES.md` - Removed features documentation
- `PRODUCTION_DEPLOYMENT.md` - Production deployment guide
- `SERVER_DEPLOYMENT_GUIDE.md` - Server deployment guide
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - Contribution guidelines
- `CONTRIBUTORS.md` - Contributors list
- `SECURITY.md` - Security policy
- `CLEANUP_SUMMARY.md` - Previous cleanup summary
- `README_API.md` - API documentation

### Essential Configuration
- `.env.example` - Environment template
- `.gitignore` - Git ignore rules
- `nginx.conf` - Nginx configuration
- `rica-complete.conf` - Complete Rica nginx config
- `init-db.sh` - Database initialization
- `generate-ssl.sh` - SSL generation
- `build.bat` - Build script
- `start-rica-ui.bat` - UI startup
- `start-rica.bat` - Rica startup
- `start-rica-with-payments.bat` - Rica with payments
- `start-payment-server.bat` - Payment server startup

### Project Folders
- `rica-ui/` - Main UI application
- `rica-landing/` - Landing page application
- `rica-api/` - API server
- `k8s/` - Kubernetes configurations

## Execution

Run the cleanup script:

**Windows:**
```bash
cleanup-unused.bat
```

**Linux/Mac:**
```bash
chmod +x cleanup-unused.sh
./cleanup-unused.sh
```

## Post-Cleanup Structure

After cleanup, the project will have a cleaner structure:

```
Rica/
├── docs/                          # Architecture and design docs
├── k8s/                           # Kubernetes configurations
├── rica-api/                      # API server
├── rica-landing/                  # Landing page
├── rica-ui/                       # Main UI
├── docker-compose.*.yml           # Docker compose files
├── start-rica-complete.bat/sh     # Main startup scripts
├── README.md                      # Main documentation
├── DEPLOYMENT_GUIDE.md            # Deployment guide
├── MULTI_TENANCY_GUIDE.md         # Multi-tenancy guide
└── [Other essential files]
```

## Benefits

1. **Reduced Clutter**: Removes ~40+ unused files
2. **Better Organization**: Documentation organized into docs/ folder
3. **Clearer Purpose**: Only essential files remain
4. **Easier Navigation**: Developers can find what they need faster
5. **Reduced Confusion**: No duplicate or outdated files
6. **Smaller Repository**: Easier to clone and manage

## Safety

- A backup directory is created before any deletions
- Only truly unused files are removed
- All essential functionality is preserved
- Can be reversed if needed

## Next Steps

After running the cleanup:
1. Test that all services still start correctly
2. Verify documentation is accessible
3. Commit the cleaned structure to version control
4. Update any external references to removed files
