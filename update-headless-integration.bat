@echo off
setlocal enabledelayedexpansion

echo Rica Headless Server Integration Update Script
echo ============================================
echo.
echo This script will update the Docker Compose files to ensure proper integration
echo between the Rica UI and the headless servers.
echo.

REM Check if the required files exist
if not exist "docker-compose.master.yml" (
    echo ERROR: docker-compose.master.yml not found.
    echo Please make sure you're running this script from the Rica root directory.
    goto :eof
)

if not exist "docker-compose.headless-servers.yml" (
    echo ERROR: docker-compose.headless-servers.yml not found.
    echo Please make sure you're running this script from the Rica root directory.
    goto :eof
)

echo Updating Docker Compose files...

REM Add network configuration to ensure all services can communicate
powershell -Command "(Get-Content 'docker-compose.rica-ui.yml') -replace 'networks:\s+rica-network:\s+driver: bridge', 'networks:\n  rica-network:\n    name: rica-network\n    driver: bridge' | Set-Content 'docker-compose.rica-ui.yml'"

powershell -Command "(Get-Content 'docker-compose.headless-servers.yml') -replace 'networks:\s+rica-network:\s+driver: bridge', 'networks:\n  rica-network:\n    name: rica-network\n    driver: bridge' | Set-Content 'docker-compose.headless-servers.yml'"

powershell -Command "(Get-Content 'docker-compose.master.yml') -replace 'networks:\s+rica-network:\s+driver: bridge', 'networks:\n  rica-network:\n    name: rica-network\n    driver: bridge' | Set-Content 'docker-compose.master.yml'"

echo.
echo Updating Nginx configuration...

REM Create a directory for Nginx configuration if it doesn't exist
if not exist "nginx" (
    mkdir nginx
    echo Created nginx directory
)

if not exist "nginx\conf.d" (
    mkdir nginx\conf.d
    echo Created nginx\conf.d directory
)

REM Create a CORS configuration file for Nginx
echo Creating CORS configuration for Nginx...
echo # CORS configuration for Rica headless servers > nginx\conf.d\cors.conf
echo. >> nginx\conf.d\cors.conf
echo # Allow CORS from Rica UI >> nginx\conf.d\cors.conf
echo add_header 'Access-Control-Allow-Origin' 'http://localhost:3000' always; >> nginx\conf.d\cors.conf
echo add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always; >> nginx\conf.d\cors.conf
echo add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always; >> nginx\conf.d\cors.conf
echo add_header 'Access-Control-Allow-Credentials' 'true' always; >> nginx\conf.d\cors.conf
echo. >> nginx\conf.d\cors.conf
echo # Handle preflight requests >> nginx\conf.d\cors.conf
echo if ($request_method = 'OPTIONS') { >> nginx\conf.d\cors.conf
echo     add_header 'Access-Control-Allow-Origin' 'http://localhost:3000' always; >> nginx\conf.d\cors.conf
echo     add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always; >> nginx\conf.d\cors.conf
echo     add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always; >> nginx\conf.d\cors.conf
echo     add_header 'Access-Control-Allow-Credentials' 'true' always; >> nginx\conf.d\cors.conf
echo     add_header 'Access-Control-Max-Age' 1728000; >> nginx\conf.d\cors.conf
echo     add_header 'Content-Type' 'text/plain; charset=utf-8'; >> nginx\conf.d\cors.conf
echo     add_header 'Content-Length' 0; >> nginx\conf.d\cors.conf
echo     return 204; >> nginx\conf.d\cors.conf
echo } >> nginx\conf.d\cors.conf

echo.
echo Updating headless-servers.conf...

REM Update the headless-servers.conf to include the CORS configuration
powershell -Command "(Get-Content 'headless-servers.conf') -replace '# Security headers', '# Security headers\n    include /etc/nginx/conf.d/cors.conf;' | Set-Content 'headless-servers.conf'"

echo.
echo Creating environment file for Rica UI...

REM Create .env file for Rica UI if it doesn't exist
if not exist "rica-ui\.env" (
    echo # Rica UI Environment Variables > rica-ui\.env
    echo REACT_APP_FABRIC_URL=http://localhost:2020 >> rica-ui\.env
    echo REACT_APP_SIMS_URL=http://localhost:2021 >> rica-ui\.env
    echo REACT_APP_AUTO_URL=http://localhost:2022 >> rica-ui\.env
    echo REACT_APP_CODE_SERVER_URL=http://localhost:2023 >> rica-ui\.env
    echo Created rica-ui\.env file
)

echo.
echo Update complete.
echo.
echo The following changes have been made:
echo 1. Updated Docker Compose network configuration for proper service communication
echo 2. Created CORS configuration for Nginx to allow cross-origin requests
echo 3. Updated headless-servers.conf to include the CORS configuration
echo 4. Created environment file for Rica UI with headless server URLs
echo.
echo You should rebuild the Rica UI for the changes to take effect:
echo   cd rica-ui
echo   npm run build
echo.
echo Then restart the services:
echo   start-rica-complete.bat all
echo.
