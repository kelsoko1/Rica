@echo off
REM Rica Multi-Tenancy Deployment Script for Windows
REM This script sets up the multi-tenancy infrastructure

echo ================================================
echo Rica Multi-Tenancy Deployment
echo ================================================
echo.

REM Configuration
set DOCKER_REGISTRY=localhost:5000
set DOMAIN=rica.example.com
set NAMESPACE_PREFIX=rica-tenant

REM Check prerequisites
echo Checking prerequisites...

where kubectl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] kubectl not found. Please install kubectl.
    exit /b 1
)
echo [OK] kubectl found

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js.
    exit /b 1
)
echo [OK] Node.js found

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found. Please install npm.
    exit /b 1
)
echo [OK] npm found

echo.

REM Install dependencies
echo Installing dependencies...

echo Installing rica-api dependencies...
cd rica-api
call npm install @kubernetes/client-node js-yaml express cors helmet compression
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install rica-api dependencies
    exit /b 1
)
cd ..
echo [OK] rica-api dependencies installed

echo Installing rica-landing dependencies...
cd rica-landing
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install rica-landing dependencies
    exit /b 1
)
cd ..
echo [OK] rica-landing dependencies installed

echo.

REM Setup Kubernetes
echo Setting up Kubernetes infrastructure...

kubectl get namespace ingress-nginx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing ingress-nginx...
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
    echo [OK] ingress-nginx installed
) else (
    echo [OK] ingress-nginx already installed
)

kubectl get namespace cert-manager >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing cert-manager...
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
    echo [OK] cert-manager installed
) else (
    echo [OK] cert-manager already installed
)

kubectl get deployment metrics-server -n kube-system >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing metrics-server...
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    echo [OK] metrics-server installed
) else (
    echo [OK] metrics-server already installed
)

echo.

REM Configure environment
echo Configuring environment variables...

if not exist "rica-api\.env" (
    echo NODE_ENV=production> rica-api\.env
    echo PORT=3001>> rica-api\.env
    echo DOCKER_REGISTRY=%DOCKER_REGISTRY%>> rica-api\.env
    echo DOMAIN=%DOMAIN%>> rica-api\.env
    echo [OK] rica-api .env created
) else (
    echo [OK] rica-api .env already exists
)

if not exist "rica-landing\.env" (
    echo REACT_APP_TENANT_API_URL=https://api.%DOMAIN%/api/tenants> rica-landing\.env
    echo REACT_APP_DOMAIN=%DOMAIN%>> rica-landing\.env
    echo [OK] rica-landing .env created
) else (
    echo [OK] rica-landing .env already exists
)

echo.

REM Print next steps
echo ================================================
echo Deployment Complete!
echo ================================================
echo.
echo Next Steps:
echo.
echo 1. Configure DNS:
echo    - Add wildcard DNS record: *.%DOMAIN% -^> Ingress Controller IP
echo    - Get Ingress IP: kubectl get svc -n ingress-nginx
echo.
echo 2. Start rica-api server:
echo    cd rica-api ^&^& npm start
echo.
echo 3. Build and deploy rica-landing:
echo    cd rica-landing ^&^& npm run build
echo.
echo 4. Test tenant provisioning:
echo    - Sign up at https://%DOMAIN%
echo    - Purchase credits
echo    - Provision a tenant
echo.
echo 5. Monitor tenants:
echo    kubectl get namespaces ^| findstr %NAMESPACE_PREFIX%
echo.
echo Documentation: MULTI_TENANCY_GUIDE.md
echo.

pause
