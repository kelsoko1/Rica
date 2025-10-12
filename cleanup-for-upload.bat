@echo off
setlocal enabledelayedexpansion

echo Rica Codebase Cleanup Script
echo =============================
echo.
echo This script will clean up the codebase and prepare it for upload.
echo.

REM Create a timestamp for backup
set TIMESTAMP=%date:~-4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo Step 1: Removing temporary and build files...
echo.

REM Remove node_modules (will be reinstalled from package.json)
if exist "rica-ui\node_modules" (
    echo Removing rica-ui/node_modules...
    rmdir /s /q "rica-ui\node_modules"
)

if exist "rica-api\node_modules" (
    echo Removing rica-api/node_modules...
    rmdir /s /q "rica-api\node_modules"
)

if exist "rica-landing\node_modules" (
    echo Removing rica-landing/node_modules...
    rmdir /s /q "rica-landing\node_modules"
)

REM Remove build artifacts
if exist "rica-ui\build" (
    echo Removing rica-ui/build...
    rmdir /s /q "rica-ui\build"
)

if exist "rica-api\dist" (
    echo Removing rica-api/dist...
    rmdir /s /q "rica-api\dist"
)

REM Remove package-lock files (will be regenerated)
if exist "rica-ui\package-lock.json" (
    echo Removing rica-ui/package-lock.json...
    del /f /q "rica-ui\package-lock.json"
)

if exist "rica-api\package-lock.json" (
    echo Removing rica-api/package-lock.json...
    del /f /q "rica-api\package-lock.json"
)

if exist "rica-landing\package-lock.json" (
    echo Removing rica-landing/package-lock.json...
    del /f /q "rica-landing\package-lock.json"
)

echo.
echo Step 2: Removing backup and temporary files...
echo.

REM Remove backup files
for /r %%i in (*.backup *.bak *.tmp *.old *.orig) do (
    echo Removing %%i
    del /f /q "%%i"
)

REM Remove .DS_Store files (Mac)
for /r %%i in (.DS_Store) do (
    echo Removing %%i
    del /f /q "%%i"
)

REM Remove Thumbs.db files (Windows)
for /r %%i in (Thumbs.db) do (
    echo Removing %%i
    del /f /q "%%i"
)

echo.
echo Step 3: Removing log files...
echo.

REM Remove log files
for /r %%i in (*.log) do (
    echo Removing %%i
    del /f /q "%%i"
)

echo.
echo Step 4: Cleaning Docker volumes and containers...
echo.

echo Stopping all Rica containers...
docker-compose -f docker-compose.master.yml down 2>nul

echo.
echo Step 5: Removing sensitive files...
echo.

REM Check for .env file and warn user
if exist ".env" (
    echo WARNING: .env file found. This contains sensitive information.
    echo Please review and remove sensitive data before uploading.
    echo Consider using .env.example instead.
    echo.
)

REM Remove any credential files
if exist "credentials.json" (
    echo Removing credentials.json...
    del /f /q "credentials.json"
)

if exist "secrets.json" (
    echo Removing secrets.json...
    del /f /q "secrets.json"
)

echo.
echo Step 6: Organizing documentation...
echo.

REM Create docs directory if it doesn't exist
if not exist "docs" (
    mkdir docs
    echo Created docs directory
)

REM Move documentation files to docs directory
if exist "INTEGRATION_COMPLETE.md" (
    move /y "INTEGRATION_COMPLETE.md" "docs\INTEGRATION_COMPLETE.md" >nul
)

if exist "HEADLESS_INTEGRATION_SUMMARY.md" (
    move /y "HEADLESS_INTEGRATION_SUMMARY.md" "docs\HEADLESS_INTEGRATION_SUMMARY.md" >nul
)

if exist "OLLAMA_PORT_UPDATE.md" (
    move /y "OLLAMA_PORT_UPDATE.md" "docs\OLLAMA_PORT_UPDATE.md" >nul
)

if exist "DOCKER_SETUP_SUMMARY.md" (
    move /y "DOCKER_SETUP_SUMMARY.md" "docs\DOCKER_SETUP_SUMMARY.md" >nul
)

if exist "HEADLESS_SERVERS_README.md" (
    move /y "HEADLESS_SERVERS_README.md" "docs\HEADLESS_SERVERS_README.md" >nul
)

if exist "DEVICE_LINKING_GUIDE.md" (
    move /y "DEVICE_LINKING_GUIDE.md" "docs\DEVICE_LINKING_GUIDE.md" >nul
)

if exist "DEVICE_LINKING_README.md" (
    move /y "DEVICE_LINKING_README.md" "docs\DEVICE_LINKING_README.md" >nul
)

if exist "AUTOMATION_README.md" (
    move /y "AUTOMATION_README.md" "docs\AUTOMATION_README.md" >nul
)

if exist "PORT_MAPPING.md" (
    move /y "PORT_MAPPING.md" "docs\PORT_MAPPING.md" >nul
)

echo.
echo Step 7: Creating .gitignore file...
echo.

REM Create comprehensive .gitignore
echo # Dependencies > .gitignore
echo node_modules/ >> .gitignore
echo npm-debug.log* >> .gitignore
echo yarn-debug.log* >> .gitignore
echo yarn-error.log* >> .gitignore
echo package-lock.json >> .gitignore
echo. >> .gitignore
echo # Build outputs >> .gitignore
echo build/ >> .gitignore
echo dist/ >> .gitignore
echo *.min.js >> .gitignore
echo *.min.css >> .gitignore
echo. >> .gitignore
echo # Environment files >> .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo .env.*.local >> .gitignore
echo. >> .gitignore
echo # Docker >> .gitignore
echo docker-compose.override.yml >> .gitignore
echo. >> .gitignore
echo # Data directories >> .gitignore
echo data/ >> .gitignore
echo logs/ >> .gitignore
echo *.log >> .gitignore
echo. >> .gitignore
echo # IDE >> .gitignore
echo .vscode/ >> .gitignore
echo .idea/ >> .gitignore
echo *.swp >> .gitignore
echo *.swo >> .gitignore
echo *~ >> .gitignore
echo. >> .gitignore
echo # OS >> .gitignore
echo .DS_Store >> .gitignore
echo Thumbs.db >> .gitignore
echo. >> .gitignore
echo # Temporary files >> .gitignore
echo *.tmp >> .gitignore
echo *.temp >> .gitignore
echo *.bak >> .gitignore
echo *.backup >> .gitignore
echo *.old >> .gitignore
echo *.orig >> .gitignore
echo. >> .gitignore
echo # Certificates >> .gitignore
echo *.pem >> .gitignore
echo *.key >> .gitignore
echo *.crt >> .gitignore
echo certs/ >> .gitignore
echo. >> .gitignore
echo # Secrets >> .gitignore
echo secrets/ >> .gitignore
echo credentials.json >> .gitignore
echo secrets.json >> .gitignore

echo Created .gitignore file

echo.
echo Step 8: Creating README.md...
echo.

REM Create main README.md if it doesn't exist
if not exist "README.md" (
    echo # Rica Platform > README.md
    echo. >> README.md
    echo A comprehensive security platform integrating threat intelligence, security simulations, and automation workflows. >> README.md
    echo. >> README.md
    echo ## Quick Start >> README.md
    echo. >> README.md
    echo See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions. >> README.md
    echo. >> README.md
    echo ## Documentation >> README.md
    echo. >> README.md
    echo - [Quick Reference](QUICK_REFERENCE.md) - Quick reference guide >> README.md
    echo - [Architecture](RICA_ARCHITECTURE.md) - System architecture >> README.md
    echo - [Port Mapping](docs/PORT_MAPPING.md) - Port reference >> README.md
    echo - [Integration Guide](docs/INTEGRATION_COMPLETE.md) - Complete integration guide >> README.md
    echo. >> README.md
    echo ## Features >> README.md
    echo. >> README.md
    echo - **Threat Intelligence**:  integration >> README.md
    echo - **Security Simulations**:  integration >> README.md
    echo - **Automation**: Activepieces workflows >> README.md
    echo - **AI Integration**: Ollama/DeepSeek support >> README.md
    echo - **Code Editor**: VS Code in browser >> README.md
    echo. >> README.md
    echo ## License >> README.md
    echo. >> README.md
    echo See LICENSE file for details. >> README.md
    
    echo Created README.md
)

echo.
echo Step 9: Validating configuration files...
echo.

REM Check for required files
set MISSING_FILES=0

if not exist "docker-compose.master.yml" (
    echo WARNING: docker-compose.master.yml not found
    set MISSING_FILES=1
)

if not exist "QUICKSTART.md" (
    echo WARNING: QUICKSTART.md not found
    set MISSING_FILES=1
)

if not exist ".env.example" (
    echo WARNING: .env.example not found - creating one...
    echo # Rica Platform Environment Variables > .env.example
    echo # Copy this file to .env and update with your values >> .env.example
    echo. >> .env.example
    echo # API Keys >> .env.example
    echo API_KEY=changeme_in_production >> .env.example
    echo DEEPSEEK_API_KEY= >> .env.example
    echo. >> .env.example
    echo # Database >> .env.example
    echo POSTGRES_PASSWORD=changeme >> .env.example
    echo. >> .env.example
    echo #  >> .env.example
    echo _ADMIN_PASSWORD=changeme >> .env.example
    echo. >> .env.example
    echo #  >> .env.example
    echo _ADMIN_PASSWORD=changeme >> .env.example
    echo. >> .env.example
    echo # Activepieces >> .env.example
    echo AP_API_KEY=changeme >> .env.example
    echo AP_ENCRYPTION_KEY=changeme >> .env.example
    echo AP_JWT_SECRET=changeme >> .env.example
)

echo.
echo Step 10: Creating upload checklist...
echo.

echo # Rica Upload Checklist > UPLOAD_CHECKLIST.md
echo. >> UPLOAD_CHECKLIST.md
echo ## Pre-Upload Checklist >> UPLOAD_CHECKLIST.md
echo. >> UPLOAD_CHECKLIST.md
echo - [ ] All sensitive data removed from .env files >> UPLOAD_CHECKLIST.md
echo - [ ] No hardcoded passwords or API keys in code >> UPLOAD_CHECKLIST.md
echo - [ ] .gitignore file is present and comprehensive >> UPLOAD_CHECKLIST.md
echo - [ ] README.md is complete and up-to-date >> UPLOAD_CHECKLIST.md
echo - [ ] All documentation is in the docs/ directory >> UPLOAD_CHECKLIST.md
echo - [ ] node_modules directories are removed >> UPLOAD_CHECKLIST.md
echo - [ ] Build artifacts are removed >> UPLOAD_CHECKLIST.md
echo - [ ] Log files are removed >> UPLOAD_CHECKLIST.md
echo - [ ] Temporary files are removed >> UPLOAD_CHECKLIST.md
echo - [ ] Docker volumes are cleaned >> UPLOAD_CHECKLIST.md
echo - [ ] All scripts have proper permissions >> UPLOAD_CHECKLIST.md
echo - [ ] .env.example file is present >> UPLOAD_CHECKLIST.md
echo - [ ] LICENSE file is present >> UPLOAD_CHECKLIST.md
echo. >> UPLOAD_CHECKLIST.md
echo ## Files to Review >> UPLOAD_CHECKLIST.md
echo. >> UPLOAD_CHECKLIST.md
echo - [ ] .env (should NOT be uploaded) >> UPLOAD_CHECKLIST.md
echo - [ ] docker-compose files (check for hardcoded values) >> UPLOAD_CHECKLIST.md
echo - [ ] Configuration files (check for sensitive data) >> UPLOAD_CHECKLIST.md
echo - [ ] Scripts (check for hardcoded paths) >> UPLOAD_CHECKLIST.md
echo. >> UPLOAD_CHECKLIST.md
echo ## Recommended Actions >> UPLOAD_CHECKLIST.md
echo. >> UPLOAD_CHECKLIST.md
echo 1. Review all .env files and remove sensitive data >> UPLOAD_CHECKLIST.md
echo 2. Ensure .env.example has all required variables >> UPLOAD_CHECKLIST.md
echo 3. Add a LICENSE file if not present >> UPLOAD_CHECKLIST.md
echo 4. Update README.md with project description >> UPLOAD_CHECKLIST.md
echo 5. Test the setup from scratch using QUICKSTART.md >> UPLOAD_CHECKLIST.md
echo 6. Create a GitHub repository and push the code >> UPLOAD_CHECKLIST.md
echo. >> UPLOAD_CHECKLIST.md
echo ## Upload Commands >> UPLOAD_CHECKLIST.md
echo. >> UPLOAD_CHECKLIST.md
echo ```bash >> UPLOAD_CHECKLIST.md
echo # Initialize git repository >> UPLOAD_CHECKLIST.md
echo git init >> UPLOAD_CHECKLIST.md
echo git add . >> UPLOAD_CHECKLIST.md
echo git commit -m "Initial commit: Rica Platform" >> UPLOAD_CHECKLIST.md
echo. >> UPLOAD_CHECKLIST.md
echo # Add remote repository >> UPLOAD_CHECKLIST.md
echo git remote add origin https://github.com/yourusername/rica.git >> UPLOAD_CHECKLIST.md
echo. >> UPLOAD_CHECKLIST.md
echo # Push to GitHub >> UPLOAD_CHECKLIST.md
echo git push -u origin main >> UPLOAD_CHECKLIST.md
echo ``` >> UPLOAD_CHECKLIST.md

echo Created UPLOAD_CHECKLIST.md

echo.
echo =============================
echo Cleanup Complete!
echo =============================
echo.
echo Summary:
echo - Removed temporary and build files
echo - Removed log files
echo - Organized documentation in docs/ directory
echo - Created .gitignore file
echo - Created/updated README.md
echo - Created .env.example
echo - Created UPLOAD_CHECKLIST.md
echo.
echo Next Steps:
echo 1. Review UPLOAD_CHECKLIST.md
echo 2. Check .env file for sensitive data
echo 3. Review all configuration files
echo 4. Test the setup from scratch
echo 5. Upload to your repository
echo.
echo WARNING: Please review the following before uploading:
if exist ".env" (
    echo - .env file exists - DO NOT upload this file
)
echo - Check all configuration files for sensitive data
echo - Ensure all passwords are changed from defaults
echo.
pause
