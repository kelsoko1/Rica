@echo off
REM Rica Production Deployment Script for Windows

echo [92mRica Production Deployment[0m

REM Configuration
set REGISTRY=localhost:5000
set TAG=latest
set ENV=production
set NAMESPACE=rica

if not "%1"=="" (
    set REGISTRY=%1
)
if not "%2"=="" (
    set TAG=%2
)

echo Registry: %REGISTRY%
echo Tag: %TAG%
echo Environment: %ENV%
echo Namespace: %NAMESPACE%
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [91mDocker is not installed. Please install Docker first.[0m
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [91mDocker Compose is not installed. Please install Docker Compose first.[0m
    exit /b 1
)

if "%1"=="k8s" (
    call :deploy_kubernetes
) else (
    call :deploy_docker_compose
)

exit /b 0

:deploy_docker_compose
echo [92mDeploying with Docker Compose...[0m

REM Set environment variables
set NODE_ENV=%ENV%

REM Build and run
docker-compose build
docker-compose up -d

echo [92mDeployment completed successfully![0m
echo Rica UI: http://localhost
echo Rica API: http://localhost:3001
exit /b 0

:deploy_kubernetes
echo [92mDeploying with Kubernetes...[0m

REM Check if kubectl is installed
where kubectl >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [91mkubectl is not installed. Please install kubectl first.[0m
    exit /b 1
)

REM Create namespace if it doesn't exist
kubectl get namespace %NAMESPACE% >nul 2>nul || kubectl create namespace %NAMESPACE%

REM Build and push Docker images
echo [93mBuilding and pushing Docker images...[0m
docker build -t %REGISTRY%/rica-api:%TAG% ./rica-api
docker build -t %REGISTRY%/rica-ui:%TAG% ./rica-ui
docker push %REGISTRY%/rica-api:%TAG%
docker push %REGISTRY%/rica-ui:%TAG%

REM Replace variables in Kubernetes manifests
echo [93mApplying Kubernetes manifests...[0m
powershell -Command "(Get-Content k8s\rica-api-deployment.yaml) -replace '\${REGISTRY}', '%REGISTRY%' | Set-Content k8s\rica-api-deployment.yaml"
powershell -Command "(Get-Content k8s\rica-ui-deployment.yaml) -replace '\${REGISTRY}', '%REGISTRY%' | Set-Content k8s\rica-ui-deployment.yaml"

REM Apply Kubernetes manifests
kubectl apply -f k8s/rica-config.yaml -n %NAMESPACE%
kubectl apply -f k8s/rica-api-deployment.yaml -n %NAMESPACE%
kubectl apply -f k8s/rica-ui-deployment.yaml -n %NAMESPACE%

echo [92mDeployment completed successfully![0m
echo Check the status with: kubectl get pods -n %NAMESPACE%
exit /b 0
