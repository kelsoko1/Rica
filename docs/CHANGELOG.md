# Changelog

All notable changes to the Rica Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Headless server integration with Rica UI
  - HeadlessServerContainer component for unified server access
  - Direct iframe integration for OpenCTI, OpenBAS, and Activepieces
  - Seamless navigation between headless servers from Rica UI
- Health monitoring system
  - HeadlessServerHealthService for automatic health checks
  - HeadlessServerStatusManager React context
  - HeadlessServerStatusIndicator component in topbar
  - Dual health check approach (dedicated endpoints + direct checks)
- Standardized port mapping (2020-2024)
  - Port 2020: OpenCTI (Fabric)
  - Port 2021: OpenBAS (Simulations)
  - Port 2022: Activepieces (Auto)
  - Port 2023: Code Server
  - Port 2024: Ollama
- Health check endpoints for all headless servers
  - Nginx health endpoints (/health/fabric, /health/sims, /health/auto, /health/code, /health/ollama)
  - Automatic health endpoint setup scripts
- Integration and management scripts
  - update-headless-integration.bat/sh for integration setup
  - update-health-endpoints.bat/sh for health check setup
  - cleanup-for-upload.bat/sh for codebase cleanup
- Comprehensive documentation
  - INTEGRATION_COMPLETE.md - Complete integration guide
  - HEADLESS_INTEGRATION_SUMMARY.md - Integration overview
  - OLLAMA_PORT_UPDATE.md - Ollama port change details
  - QUICK_REFERENCE.md - Quick reference guide
  - UPLOAD_CHECKLIST.md - Pre-upload checklist
  - CONTRIBUTING.md - Contribution guidelines
- CORS configuration for cross-origin requests
- Environment variable templates (.env.example)
- Comprehensive .gitignore file

### Changed
- Updated Ollama port from 11434 to 2024
- Updated all Docker Compose files with standardized port mappings
- Updated Nginx configuration with CORS and health endpoints
- Organized documentation into docs/ directory
- Updated FabricFrame, SimsFrame, and AutoFrame components with error handling
- Updated App.js with HeadlessServerStatusProvider integration
- Updated all documentation files with new port mappings

### Fixed
- Port conflicts by standardizing port mapping
- CORS issues with proper configuration
- Health check reliability with dual approach
- Error handling in iframe components

## [1.0.0] - Initial Release

### Added
- Rica UI - Main user interface
- Rica API - Backend API service
- Rica Landing - Landing page
- OpenCTI (Fabric) integration - Threat intelligence platform
- OpenBAS (Simulations) integration - Security simulation platform
- Activepieces (Auto) integration - Automation/workflow platform
- Code Server integration - VS Code in browser
- Ollama integration - DeepSeek AI model server
- Device linking system
  - DeviceLinkingService for device discovery and connection
  - DeviceDiscoveryAPI for backend communication
  - DeviceManager component for UI
- Docker Compose configuration
  - Master compose file for all services
  - Individual compose files for each service
  - Modular architecture
- Nginx reverse proxy configuration
- PostgreSQL database with multiple database support
- Redis cache
- Elasticsearch for data indexing
- MinIO for object storage
- RabbitMQ for message queuing
- Production-ready features
  - Multi-stage Docker builds
  - Security headers (Helmet)
  - Rate limiting
  - Input validation
  - Proper error handling
  - Structured logging (Winston)
  - Health checks for all services
- Management scripts
  - start-rica-complete.bat/sh for service management
  - setup-headless-servers.bat/sh for directory setup
- Documentation
  - RICA_ARCHITECTURE.md - System architecture
  - QUICKSTART.md - Quick start guide
  - PORT_MAPPING.md - Port reference
  - README.md - Project overview

### Security
- Environment-based configuration
- Secret management
- Non-root Docker containers
- Proper CORS configuration
- Input validation
- Rate limiting

---

## Version History

- **Unreleased** - Headless server integration and health monitoring
- **1.0.0** - Initial release with core features

## Upgrade Guide

### From 1.0.0 to Unreleased

1. Run the integration setup script:
   ```bash
   # Windows
   update-headless-integration.bat
   
   # Linux
   ./update-headless-integration.sh
   ```

2. Run the health endpoints setup script:
   ```bash
   # Windows
   update-health-endpoints.bat
   
   # Linux
   ./update-health-endpoints.sh
   ```

3. Rebuild the Rica UI:
   ```bash
   cd rica-ui
   npm run build
   cd ..
   ```

4. Restart all services:
   ```bash
   # Windows
   start-rica-complete.bat all
   
   # Linux
   ./start-rica-complete.sh all
   ```

5. Verify the new port mappings:
   - OpenCTI (Fabric): http://localhost:2020
   - OpenBAS (Simulations): http://localhost:2021
   - Activepieces (Auto): http://localhost:2022
   - Code Server: http://localhost:2023
   - Ollama: http://localhost:2024

## Breaking Changes

### Unreleased

- **Ollama port changed from 11434 to 2024**
  - Update any external integrations to use the new port
  - Update environment variables if using custom configuration
  
- **Documentation reorganized into docs/ directory**
  - Update any links to documentation files
  - Check automation scripts that reference documentation

## Deprecations

None at this time.

## Known Issues

None at this time.

## Contributors

Thank you to all contributors who have helped make Rica Platform better!

See [CONTRIBUTORS.md](CONTRIBUTORS.md) for a full list of contributors.
