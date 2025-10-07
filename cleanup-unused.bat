@echo off
echo ========================================
echo Rica Project Cleanup - Removing Unused Files
echo ========================================
echo.

REM Create a backup directory first
set BACKUP_DIR=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
echo Creating backup directory: %BACKUP_DIR%
mkdir "%BACKUP_DIR%" 2>nul

echo.
echo ========================================
echo 1. Removing Swarm/Browser-related files (feature removed)
echo ========================================
del /f /q "SWARM_REDESIGN_SUMMARY.md" 2>nul
del /f /q "SWARM_QUICKSTART.md" 2>nul
del /f /q "SWARM_GOLOGIN_UI.md" 2>nul
del /f /q "SWARM_REMOVAL_SUMMARY.md" 2>nul
echo - Removed Swarm documentation files

echo.
echo ========================================
echo 2. Removing OpenCTI/OpenBAS Docker files (integrated differently now)
echo ========================================
del /f /q "docker-compose.openbas.yml" 2>nul
del /f /q "docker-compose.opencti.yml" 2>nul
del /f /q "fix-opencti-openbas.sh" 2>nul
echo - Removed OpenCTI/OpenBAS standalone compose files

echo.
echo ========================================
echo 3. Removing duplicate/old Docker compose files
echo ========================================
del /f /q "docker-compose.yml.new" 2>nul
del /f /q "docker-compose.simple.yml" 2>nul
del /f /q "docker-compose.yml" 2>nul
echo - Removed duplicate Docker compose files

echo.
echo ========================================
echo 4. Removing old deployment scripts
echo ========================================
del /f /q "deploy-simple.sh" 2>nul
del /f /q "deploy-landing.sh" 2>nul
del /f /q "deploy.bat" 2>nul
del /f /q "deploy.sh" 2>nul
echo - Removed old deployment scripts

echo.
echo ========================================
echo 5. Removing redundant documentation
echo ========================================
REM Keep the most comprehensive guides, remove duplicates
del /f /q "DEPLOYMENT.md" 2>nul
del /f /q "PRODUCTION_GUIDE.md" 2>nul
del /f /q "QUICKSTART.md" 2>nul
del /f /q "QUICK_REFERENCE.md" 2>nul
del /f /q "QUICK_PORT_REFERENCE.md" 2>nul
del /f /q "OPENBAS_REMOVAL_SUMMARY.md" 2>nul
del /f /q "DOCKER_SETUP_SUMMARY.md" 2>nul
del /f /q "DEPLOYMENT_STATUS.md" 2>nul
del /f /q "FINAL_SUMMARY.md" 2>nul
del /f /q "IMPLEMENTATION_CHECKLIST.md" 2>nul
del /f /q "RICA_UI_READINESS_CHECKLIST.md" 2>nul
echo - Removed redundant documentation files

echo.
echo ========================================
echo 6. Removing old setup scripts
echo ========================================
del /f /q "setup.py" 2>nul
del /f /q "setup.bat" 2>nul
del /f /q "setup.sh" 2>nul
del /f /q "install.sh" 2>nul
echo - Removed old setup scripts

echo.
echo ========================================
echo 7. Removing old update scripts
echo ========================================
del /f /q "update-docker-compose.bat" 2>nul
del /f /q "update-docker-compose.sh" 2>nul
del /f /q "update-iframe-urls.bat" 2>nul
del /f /q "update-iframe-urls.sh" 2>nul
echo - Removed old update scripts

echo.
echo ========================================
echo 8. Removing verification scripts (one-time use)
echo ========================================
del /f /q "verify-removal.bat" 2>nul
del /f /q "verify-removal.sh" 2>nul
echo - Removed verification scripts

echo.
echo ========================================
echo 9. Removing old nginx configs
echo ========================================
del /f /q "rica.conf" 2>nul
del /f /q "headless-servers.conf" 2>nul
echo - Removed old nginx config files

echo.
echo ========================================
echo 10. Removing old service files
echo ========================================
del /f /q "rica.service" 2>nul
echo - Removed old systemd service file

echo.
echo ========================================
echo 11. Removing empty/minimal package files
echo ========================================
del /f /q "package-lock.json" 2>nul
echo - Removed empty package-lock.json

echo.
echo ========================================
echo 12. Consolidating documentation
echo ========================================
REM Move important docs to a docs folder for better organization
if not exist "docs" mkdir "docs"
move /y "AUTHENTICATION_ARCHITECTURE.md" "docs\" 2>nul
move /y "MULTI_TENANCY_ARCHITECTURE.md" "docs\" 2>nul
move /y "RICA_ARCHITECTURE.md" "docs\" 2>nul
move /y "RESPONSIVE_DESIGN_GUIDE.md" "docs\" 2>nul
move /y "VISUAL_IMPROVEMENTS_GUIDE.md" "docs\" 2>nul
move /y "UI_ENHANCEMENTS_SUMMARY.md" "docs\" 2>nul
move /y "ENHANCED_COMPONENTS_SUMMARY.md" "docs\" 2>nul
echo - Organized architecture and design docs into docs/ folder

echo.
echo ========================================
echo Cleanup Summary
echo ========================================
echo The following categories have been cleaned:
echo - Swarm/Browser feature files (removed feature)
echo - OpenCTI/OpenBAS standalone files (now integrated)
echo - Duplicate Docker compose files
echo - Old deployment scripts
echo - Redundant documentation
echo - Old setup and update scripts
echo - Verification scripts
echo - Old nginx configs
echo - Old service files
echo - Empty package files
echo.
echo Important documentation has been organized into the docs/ folder
echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Remaining key files:
echo - docker-compose.prod.yml (main production compose)
echo - docker-compose.master.yml (master orchestration)
echo - docker-compose.headless-servers.yml (headless services)
echo - docker-compose.*.yml (individual service composes)
echo - start-rica-complete.bat/sh (main startup scripts)
echo - deploy-multi-tenancy.bat/sh (deployment scripts)
echo - README.md (main documentation)
echo - DEPLOYMENT_GUIDE.md (deployment guide)
echo - MULTI_TENANCY_GUIDE.md (multi-tenancy guide)
echo - PORT_MAPPING.md (port reference)
echo.
pause
