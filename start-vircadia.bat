@echo off
REM Script to start the Vircadia server
REM This script starts the Vircadia server using Docker Compose

echo ======================================================
echo Rica - Vircadia Metaverse Server
echo ======================================================
echo.

REM Check if Docker is running
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running.
    echo Please start Docker Desktop or Docker Engine and try again.
    exit /b 1
)

REM Check if rica-network exists, create if not
docker network inspect rica-network > nul 2>&1
if %errorlevel% neq 0 (
    echo Creating rica-network...
    docker network create --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1 rica-network
    if %errorlevel% neq 0 (
        echo Error: Failed to create rica-network.
        exit /b 1
    )
    echo Rica network created successfully.
)

REM Start Vircadia server
echo Starting Vircadia server...
docker-compose -f docker-compose.vircadia.yml up -d

if %errorlevel% neq 0 (
    echo Error: Failed to start Vircadia server.
    exit /b 1
)

echo.
echo Vircadia server started successfully!
echo.
echo You can access Vircadia at:
echo http://localhost:2023
echo.
echo To view logs:
echo docker-compose -f docker-compose.vircadia.yml logs -f
echo.
echo To stop the server:
echo docker-compose -f docker-compose.vircadia.yml down
echo.
echo ======================================================
