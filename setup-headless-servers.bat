@echo off
setlocal enabledelayedexpansion

echo Rica Headless Servers Setup Script
echo ================================
echo.

echo Creating required directories...

if not exist "nginx" (
    mkdir nginx
    echo Created nginx directory
)

if not exist "nginx\conf.d" (
    mkdir nginx\conf.d
    echo Created nginx\conf.d directory
)

if not exist "certs" (
    mkdir certs
    echo Created certs directory
    echo Note: You'll need to generate SSL certificates for production use
)

echo.
echo Copying configuration files...

copy headless-servers.conf nginx\conf.d\headless-servers.conf
echo Copied headless-servers.conf to nginx\conf.d\

if not exist "nginx\nginx.conf" (
    copy nginx.conf nginx\nginx.conf
    echo Copied nginx.conf to nginx\
)

if not exist "nginx\ssl-dhparams.pem" (
    echo Creating dummy ssl-dhparams.pem file...
    echo "# This is a placeholder file. Generate a proper dhparams file for production." > nginx\ssl-dhparams.pem
    echo "# Run: openssl dhparam -out ssl-dhparams.pem 2048" >> nginx\ssl-dhparams.pem
    echo Created placeholder ssl-dhparams.pem
)

echo.
echo Checking Docker...
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed or not in PATH.
    echo Please install Docker and Docker Compose before continuing.
    goto :eof
)

echo Docker is installed.
echo.
echo Docker Compose...
docker-compose --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Docker Compose is not installed or not in PATH.
    echo Please install Docker Compose before continuing.
    goto :eof
)

echo Docker Compose is installed.
echo.
echo Setup completed successfully.
echo.
echo Next steps:
echo 1. Create a .env file with your secure passwords (see HEADLESS_SERVERS_README.md)
echo 2. Run 'start-headless-servers.bat all' to start all headless servers
echo 3. Access the services at their respective ports (see HEADLESS_SERVERS_README.md)
echo.
echo For more information, see HEADLESS_SERVERS_README.md
