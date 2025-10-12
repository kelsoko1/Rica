@echo off
REM =================================================================
REM Vircadia Web Integration Script for Rica
REM =================================================================
REM This script starts the Vircadia Web client along with
REM the existing Rica infrastructure
REM
REM Usage: start-vircadia-web.bat
REM
REM Requirements:
REM - Docker and Docker Compose installed
REM - Rica network created (run setup-network.bat first)
REM =================================================================

echo.
echo 🚀 Starting Vircadia Web Integration for Rica
echo ================================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if network exists
docker network ls | findstr rica-network >nul 2>&1
if errorlevel 1 (
    echo ❌ Rica network not found. Please run setup-network.bat first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Build the Vircadia Web image
echo 🔨 Building Vircadia Web Docker image...
docker-compose -f docker-compose.headless-servers.yml build vircadia-web
if errorlevel 1 (
    echo ❌ Failed to build Vircadia Web image
    pause
    exit /b 1
)

echo ✅ Vircadia Web image built successfully
echo.

REM Start all headless servers (including Vircadia Web)
echo 🌐 Starting all headless servers with Vircadia Web...
docker-compose -f docker-compose.headless-servers.yml up -d

if errorlevel 1 (
    echo ❌ Failed to start services
    pause
    exit /b 1
)

echo ✅ All services started successfully
echo.

REM Wait a moment for services to initialize
timeout /t 5 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
echo.

REM Check Vircadia Web
docker ps --filter "name=vircadia_web_client" --filter "status=running" | findstr vircadia_web_client >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Vircadia Web container not running properly
) else (
    echo ✅ Vircadia Web: http://localhost:2024
)

REM Check Vircadia headless
docker ps --filter "name=vircadia_world_server" --filter "status=running" | findstr vircadia_world_server >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Vircadia headless container not running properly
) else (
    echo ✅ Vircadia Headless: http://localhost:2023
)

echo.
echo 🎉 Vircadia Web Integration Complete!
echo ======================================
echo.
echo Access your metaverse at:
echo 🌐 http://localhost:2024
echo.
echo To add to Rica UI, use the Metaverse.jsx component:
echo 📁 Metaverse.jsx and Metaverse.css are ready to use
echo.
echo To stop all services:
echo 🛑 docker-compose -f docker-compose.headless-servers.yml down
echo.

pause
