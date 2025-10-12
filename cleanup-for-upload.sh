#!/bin/bash

echo "Rica Codebase Cleanup Script"
echo "============================="
echo
echo "This script will clean up the codebase and prepare it for upload."
echo

# Create a timestamp for backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "Step 1: Removing temporary and build files..."
echo

# Remove node_modules (will be reinstalled from package.json)
if [ -d "rica-ui/node_modules" ]; then
    echo "Removing rica-ui/node_modules..."
    rm -rf rica-ui/node_modules
fi

if [ -d "rica-api/node_modules" ]; then
    echo "Removing rica-api/node_modules..."
    rm -rf rica-api/node_modules
fi

if [ -d "rica-landing/node_modules" ]; then
    echo "Removing rica-landing/node_modules..."
    rm -rf rica-landing/node_modules
fi

# Remove build artifacts
if [ -d "rica-ui/build" ]; then
    echo "Removing rica-ui/build..."
    rm -rf rica-ui/build
fi

if [ -d "rica-api/dist" ]; then
    echo "Removing rica-api/dist..."
    rm -rf rica-api/dist
fi

# Remove package-lock files (will be regenerated)
if [ -f "rica-ui/package-lock.json" ]; then
    echo "Removing rica-ui/package-lock.json..."
    rm -f rica-ui/package-lock.json
fi

if [ -f "rica-api/package-lock.json" ]; then
    echo "Removing rica-api/package-lock.json..."
    rm -f rica-api/package-lock.json
fi

if [ -f "rica-landing/package-lock.json" ]; then
    echo "Removing rica-landing/package-lock.json..."
    rm -f rica-landing/package-lock.json
fi

echo
echo "Step 2: Removing backup and temporary files..."
echo

# Remove backup files
find . -type f \( -name "*.backup" -o -name "*.bak" -o -name "*.tmp" -o -name "*.old" -o -name "*.orig" \) -delete

# Remove .DS_Store files (Mac)
find . -type f -name ".DS_Store" -delete

# Remove Thumbs.db files (Windows)
find . -type f -name "Thumbs.db" -delete

echo
echo "Step 3: Removing log files..."
echo

# Remove log files
find . -type f -name "*.log" -delete

echo
echo "Step 4: Cleaning Docker volumes and containers..."
echo

echo "Stopping all Rica containers..."
docker-compose -f docker-compose.master.yml down 2>/dev/null || true

echo
echo "Step 5: Removing sensitive files..."
echo

# Check for .env file and warn user
if [ -f ".env" ]; then
    echo "WARNING: .env file found. This contains sensitive information."
    echo "Please review and remove sensitive data before uploading."
    echo "Consider using .env.example instead."
    echo
fi

# Remove any credential files
if [ -f "credentials.json" ]; then
    echo "Removing credentials.json..."
    rm -f credentials.json
fi

if [ -f "secrets.json" ]; then
    echo "Removing secrets.json..."
    rm -f secrets.json
fi

echo
echo "Step 6: Organizing documentation..."
echo

# Create docs directory if it doesn't exist
if [ ! -d "docs" ]; then
    mkdir -p docs
    echo "Created docs directory"
fi

# Move documentation files to docs directory
[ -f "INTEGRATION_COMPLETE.md" ] && mv -f "INTEGRATION_COMPLETE.md" "docs/INTEGRATION_COMPLETE.md"
[ -f "HEADLESS_INTEGRATION_SUMMARY.md" ] && mv -f "HEADLESS_INTEGRATION_SUMMARY.md" "docs/HEADLESS_INTEGRATION_SUMMARY.md"
[ -f "OLLAMA_PORT_UPDATE.md" ] && mv -f "OLLAMA_PORT_UPDATE.md" "docs/OLLAMA_PORT_UPDATE.md"
[ -f "DOCKER_SETUP_SUMMARY.md" ] && mv -f "DOCKER_SETUP_SUMMARY.md" "docs/DOCKER_SETUP_SUMMARY.md"
[ -f "HEADLESS_SERVERS_README.md" ] && mv -f "HEADLESS_SERVERS_README.md" "docs/HEADLESS_SERVERS_README.md"
[ -f "DEVICE_LINKING_GUIDE.md" ] && mv -f "DEVICE_LINKING_GUIDE.md" "docs/DEVICE_LINKING_GUIDE.md"
[ -f "DEVICE_LINKING_README.md" ] && mv -f "DEVICE_LINKING_README.md" "docs/DEVICE_LINKING_README.md"
[ -f "AUTOMATION_README.md" ] && mv -f "AUTOMATION_README.md" "docs/AUTOMATION_README.md"
[ -f "PORT_MAPPING.md" ] && mv -f "PORT_MAPPING.md" "docs/PORT_MAPPING.md"

echo
echo "Step 7: Creating .gitignore file..."
echo

# Create comprehensive .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json

# Build outputs
build/
dist/
*.min.js
*.min.css

# Environment files
.env
.env.local
.env.*.local

# Docker
docker-compose.override.yml

# Data directories
data/
logs/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
*.bak
*.backup
*.old
*.orig

# Certificates
*.pem
*.key
*.crt
certs/

# Secrets
secrets/
credentials.json
secrets.json
EOF

echo "Created .gitignore file"

echo
echo "Step 8: Creating README.md..."
echo

# Create main README.md if it doesn't exist
if [ ! -f "README.md" ]; then
    cat > README.md << 'EOF'
# Rica Platform

A comprehensive security platform integrating threat intelligence, security simulations, and automation workflows.

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

## Documentation

- [Quick Reference](QUICK_REFERENCE.md) - Quick reference guide
- [Architecture](RICA_ARCHITECTURE.md) - System architecture
- [Port Mapping](docs/PORT_MAPPING.md) - Port reference
- [Integration Guide](docs/INTEGRATION_COMPLETE.md) - Complete integration guide

## Features

- **Threat Intelligence**:  integration
- **Security Simulations**:  integration
- **Automation**: Activepieces workflows
- **AI Integration**: Ollama/DeepSeek support
- **Code Editor**: VS Code in browser

## License

See LICENSE file for details.
EOF
    echo "Created README.md"
fi

echo
echo "Step 9: Validating configuration files..."
echo

# Check for required files
MISSING_FILES=0

if [ ! -f "docker-compose.master.yml" ]; then
    echo "WARNING: docker-compose.master.yml not found"
    MISSING_FILES=1
fi

if [ ! -f "QUICKSTART.md" ]; then
    echo "WARNING: QUICKSTART.md not found"
    MISSING_FILES=1
fi

if [ ! -f ".env.example" ]; then
    echo "WARNING: .env.example not found - creating one..."
    cat > .env.example << 'EOF'
# Rica Platform Environment Variables
# Copy this file to .env and update with your values

# API Keys
API_KEY=changeme_in_production
DEEPSEEK_API_KEY=

# Database
POSTGRES_PASSWORD=changeme

# 
_ADMIN_PASSWORD=changeme

# 
_ADMIN_PASSWORD=changeme

# Activepieces
AP_API_KEY=changeme
AP_ENCRYPTION_KEY=changeme
AP_JWT_SECRET=changeme
EOF
fi

echo
echo "Step 10: Creating upload checklist..."
echo

cat > UPLOAD_CHECKLIST.md << 'EOF'
# Rica Upload Checklist

## Pre-Upload Checklist

- [ ] All sensitive data removed from .env files
- [ ] No hardcoded passwords or API keys in code
- [ ] .gitignore file is present and comprehensive
- [ ] README.md is complete and up-to-date
- [ ] All documentation is in the docs/ directory
- [ ] node_modules directories are removed
- [ ] Build artifacts are removed
- [ ] Log files are removed
- [ ] Temporary files are removed
- [ ] Docker volumes are cleaned
- [ ] All scripts have proper permissions
- [ ] .env.example file is present
- [ ] LICENSE file is present

## Files to Review

- [ ] .env (should NOT be uploaded)
- [ ] docker-compose files (check for hardcoded values)
- [ ] Configuration files (check for sensitive data)
- [ ] Scripts (check for hardcoded paths)

## Recommended Actions

1. Review all .env files and remove sensitive data
2. Ensure .env.example has all required variables
3. Add a LICENSE file if not present
4. Update README.md with project description
5. Test the setup from scratch using QUICKSTART.md
6. Create a GitHub repository and push the code

## Upload Commands

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Rica Platform"

# Add remote repository
git remote add origin https://github.com/yourusername/rica.git

# Push to GitHub
git push -u origin main
```
EOF

echo "Created UPLOAD_CHECKLIST.md"

echo
echo "============================="
echo "Cleanup Complete!"
echo "============================="
echo
echo "Summary:"
echo "- Removed temporary and build files"
echo "- Removed log files"
echo "- Organized documentation in docs/ directory"
echo "- Created .gitignore file"
echo "- Created/updated README.md"
echo "- Created .env.example"
echo "- Created UPLOAD_CHECKLIST.md"
echo
echo "Next Steps:"
echo "1. Review UPLOAD_CHECKLIST.md"
echo "2. Check .env file for sensitive data"
echo "3. Review all configuration files"
echo "4. Test the setup from scratch"
echo "5. Upload to your repository"
echo
echo "WARNING: Please review the following before uploading:"
if [ -f ".env" ]; then
    echo "- .env file exists - DO NOT upload this file"
fi
echo "- Check all configuration files for sensitive data"
echo "- Ensure all passwords are changed from defaults"
echo
