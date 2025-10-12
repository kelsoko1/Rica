@echo off
setlocal enabledelayedexpansion

echo Rica Headless Server Health Endpoints Update Script
echo ================================================
echo.
echo This script will update the Docker Compose files to add health check endpoints
echo for all headless servers.
echo.

REM Check if the required files exist
if not exist "docker-compose..yml" (
    echo ERROR: docker-compose..yml not found.
    echo Please make sure you're running this script from the Rica root directory.
    goto :eof
)

if not exist "docker-compose..yml" (
    echo ERROR: docker-compose..yml not found.
    echo Please make sure you're running this script from the Rica root directory.
    goto :eof
)

if not exist "docker-compose.activepieces.yml" (
    echo ERROR: docker-compose.activepieces.yml not found.
    echo Please make sure you're running this script from the Rica root directory.
    goto :eof
)

echo Creating health check endpoints for headless servers...

REM Create directory for health check endpoints
if not exist "nginx\health" (
    mkdir nginx\health
    echo Created nginx\health directory
)

REM Create health check endpoint for 
echo Creating health check endpoint for  (Fabric)...
echo #  (Fabric) Health Check > nginx\health\fabric.conf
echo. >> nginx\health\fabric.conf
echo location /health/fabric { >> nginx\health\fabric.conf
echo     access_log off; >> nginx\health\fabric.conf
echo     add_header Content-Type application/json; >> nginx\health\fabric.conf
echo     return 200 '{"status":"ok","service":"fabric"}'; >> nginx\health\fabric.conf
echo } >> nginx\health\fabric.conf

REM Create health check endpoint for 
echo Creating health check endpoint for  (Simulations)...
echo #  (Simulations) Health Check > nginx\health\sims.conf
echo. >> nginx\health\sims.conf
echo location /health/sims { >> nginx\health\sims.conf
echo     access_log off; >> nginx\health\sims.conf
echo     add_header Content-Type application/json; >> nginx\health\sims.conf
echo     return 200 '{"status":"ok","service":"sims"}'; >> nginx\health\sims.conf
echo } >> nginx\health\sims.conf

REM Create health check endpoint for Activepieces
echo Creating health check endpoint for Activepieces (Auto)...
echo # Activepieces (Auto) Health Check > nginx\health\auto.conf
echo. >> nginx\health\auto.conf
echo location /health/auto { >> nginx\health\auto.conf
echo     access_log off; >> nginx\health\auto.conf
echo     add_header Content-Type application/json; >> nginx\health\auto.conf
echo     return 200 '{"status":"ok","service":"auto"}'; >> nginx\health\auto.conf
echo } >> nginx\health\auto.conf

REM Create health check endpoint for Code Server
echo Creating health check endpoint for Code Server...
echo # Code Server Health Check > nginx\health\code.conf
echo. >> nginx\health\code.conf
echo location /health/code { >> nginx\health\code.conf
echo     access_log off; >> nginx\health\code.conf
echo     add_header Content-Type application/json; >> nginx\health\code.conf
echo     return 200 '{"status":"ok","service":"code"}'; >> nginx\health\code.conf
echo } >> nginx\health\code.conf

REM Create health check endpoint for Ollama
echo Creating health check endpoint for Ollama...
echo # Ollama Health Check > nginx\health\ollama.conf
echo. >> nginx\health\ollama.conf
echo location /health/ollama { >> nginx\health\ollama.conf
echo     access_log off; >> nginx\health\ollama.conf
echo     add_header Content-Type application/json; >> nginx\health\ollama.conf
echo     return 200 '{"status":"ok","service":"ollama"}'; >> nginx\health\ollama.conf
echo } >> nginx\health\ollama.conf

REM Create health check endpoint for Vircadia
echo Creating health check endpoint for Vircadia...
echo # Vircadia Health Check > nginx\health\metaverse.conf
echo. >> nginx\health\metaverse.conf
echo location /health/metaverse { >> nginx\health\metaverse.conf
echo     proxy_pass http://vircadia:3020/health; >> nginx\health\metaverse.conf
echo     proxy_set_header Host $host; >> nginx\health\metaverse.conf
echo     proxy_set_header X-Real-IP $remote_addr; >> nginx\health\metaverse.conf
echo     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; >> nginx\health\metaverse.conf
echo     proxy_set_header X-Forwarded-Proto $scheme; >> nginx\health\metaverse.conf
echo } >> nginx\health\metaverse.conf

REM Update headless-servers.conf to include health check endpoints
echo Updating headless-servers.conf to include health check endpoints...
powershell -Command "(Get-Content 'headless-servers.conf') -replace '# Direct port access configuration', '# Health check endpoints\ninclude /etc/nginx/health/*.conf;\n\n# Direct port access configuration' | Set-Content 'headless-servers.conf'"

REM Update rica-complete.conf to include health check endpoints
echo Updating rica-complete.conf to include health check endpoints...
powershell -Command "(Get-Content 'rica-complete.conf') -replace '# Rica Application Server', '# Health check endpoints\ninclude /etc/nginx/health/*.conf;\n\n# Rica Application Server' | Set-Content 'rica-complete.conf'"

REM Update Docker Compose files to include health check volume
echo Updating Docker Compose files to include health check volume...

REM Update docker-compose.headless-servers.yml
powershell -Command "(Get-Content 'docker-compose.headless-servers.yml') -replace 'volumes:\s*- ./nginx/nginx.conf:/etc/nginx/nginx.conf\s*- ./nginx/conf.d:/etc/nginx/conf.d\s*- ./certs:/etc/nginx/certs\s*- ./nginx/ssl-dhparams.pem:/etc/nginx/ssl-dhparams.pem', 'volumes:\n      - ./nginx/nginx.conf:/etc/nginx/nginx.conf\n      - ./nginx/conf.d:/etc/nginx/conf.d\n      - ./nginx/health:/etc/nginx/health\n      - ./certs:/etc/nginx/certs\n      - ./nginx/ssl-dhparams.pem:/etc/nginx/ssl-dhparams.pem' | Set-Content 'docker-compose.headless-servers.yml'"

REM Update docker-compose.master.yml
powershell -Command "(Get-Content 'docker-compose.master.yml') -replace 'volumes:\s*- ./nginx/nginx.conf:/etc/nginx/nginx.conf\s*- ./nginx/conf.d:/etc/nginx/conf.d\s*- ./certs:/etc/nginx/certs\s*- ./nginx/ssl-dhparams.pem:/etc/nginx/ssl-dhparams.pem', 'volumes:\n      - ./nginx/nginx.conf:/etc/nginx/nginx.conf\n      - ./nginx/conf.d:/etc/nginx/conf.d\n      - ./nginx/health:/etc/nginx/health\n      - ./certs:/etc/nginx/certs\n      - ./nginx/ssl-dhparams.pem:/etc/nginx/ssl-dhparams.pem' | Set-Content 'docker-compose.master.yml'"

echo.
echo Update complete.
echo.
echo The following changes have been made:
echo 1. Created health check endpoints for all headless servers
echo 2. Updated headless-servers.conf and rica-complete.conf to include health check endpoints
echo 3. Updated Docker Compose files to include health check volume
echo.
echo You should restart the services for the changes to take effect:
echo   start-rica-complete.bat all
echo.
