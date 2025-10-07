@echo off
echo ========================================
echo Rica Network Setup
echo ========================================
echo.

echo Checking if Docker is running...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo Docker is running!
echo.

echo Creating Rica network...
docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1 2>nul

if %errorlevel% == 0 (
    echo SUCCESS: Network 'rica-network' created successfully!
    echo.
    echo Network Details:
    echo   Name: rica-network
    echo   Driver: bridge
    echo   Subnet: 172.25.0.0/16
    echo   Gateway: 172.25.0.1
) else (
    echo INFO: Network 'rica-network' already exists.
    echo This is fine - the network is ready to use!
)

echo.
echo Verifying network...
docker network ls | findstr rica-network
if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo Network setup complete!
    echo You can now start Rica services with:
    echo   docker-compose up -d
    echo ========================================
) else (
    echo.
    echo ERROR: Network verification failed!
    echo Please check Docker logs for details.
)

echo.
pause
