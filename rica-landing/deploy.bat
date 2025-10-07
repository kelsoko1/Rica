@echo off
:: Rica Landing Deployment Script for Windows

:: Display help message
if "%1"=="" (
  echo Rica Landing Deployment Script
  echo Usage: deploy.bat [options]
  echo.
  echo Options:
  echo   --firebase    Deploy to Firebase Hosting
  echo   --docker      Deploy using Docker
  echo   --both        Deploy to both Firebase and Docker
  echo   --help        Display this help message
  echo.
  exit /b 1
)

:: Parse arguments
set DEPLOY_FIREBASE=false
set DEPLOY_DOCKER=false

:parse_args
if "%1"=="" goto end_parse_args
if "%1"=="--firebase" (
  set DEPLOY_FIREBASE=true
  shift
  goto parse_args
)
if "%1"=="--docker" (
  set DEPLOY_DOCKER=true
  shift
  goto parse_args
)
if "%1"=="--both" (
  set DEPLOY_FIREBASE=true
  set DEPLOY_DOCKER=true
  shift
  goto parse_args
)
if "%1"=="--help" (
  echo Rica Landing Deployment Script
  echo Usage: deploy.bat [options]
  echo.
  echo Options:
  echo   --firebase    Deploy to Firebase Hosting
  echo   --docker      Deploy using Docker
  echo   --both        Deploy to both Firebase and Docker
  echo   --help        Display this help message
  echo.
  exit /b 0
)
echo Unknown option: %1
exit /b 1

:end_parse_args

:: Build the application
echo Building Rica Landing application...
call npm run build

:: Deploy to Firebase if requested
if "%DEPLOY_FIREBASE%"=="true" (
  echo Deploying to Firebase Hosting...
  call firebase deploy --only hosting
)

:: Deploy using Docker if requested
if "%DEPLOY_DOCKER%"=="true" (
  echo Deploying using Docker...
  docker-compose build
  docker-compose up -d
)

echo Deployment completed successfully!
