@echo off
setlocal enabledelayedexpansion

REM Rica Multi-Tenant SaaS Deployment Script for Windows
REM Usage: deploy-rica.bat [environment] [action]

set "ENVIRONMENT=%~1"
if "%ENVIRONMENT%"=="" set "ENVIRONMENT=production"

set "ACTION=%~2"
if "%ACTION%"=="" set "ACTION=deploy"

set "NAMESPACE=rica-platform"

echo [$(date +'%Y-%m-%d %H:%M:%S')] Starting Rica deployment for %ENVIRONMENT% environment

REM Check prerequisites
call :check_prerequisites
if errorlevel 1 exit /b 1

REM Execute action
if "%ACTION%"=="deploy" (
    call :create_secrets
    call :build_images
    call :deploy_kubernetes
    call :setup_monitoring
    echo SUCCESS: Rica deployment completed successfully!
) else if "%ACTION%"=="secrets" (
    call :create_secrets
) else if "%ACTION%"=="build" (
    call :build_images
) else if "%ACTION%"=="tenant" (
    call :create_sample_tenant
) else if "%ACTION%"=="destroy" (
    echo Destroying Rica deployment...
    kubectl delete namespace %NAMESPACE% --ignore-not-found=true 2>nul
    echo SUCCESS: Rica deployment destroyed
) else (
    echo ERROR: Unknown action: %ACTION%. Available actions: deploy, secrets, build, tenant, destroy
    exit /b 1
)

goto :eof

:check_prerequisites
echo Checking prerequisites...

REM Check if kubectl is installed
kubectl version --client >nul 2>&1
if errorlevel 1 (
    echo ERROR: kubectl is not installed. Please install kubectl first.
    exit /b 1
)

REM Check if Docker is available
docker --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: docker is not installed. You may need to use pre-built images.
)

REM Check cluster connectivity
kubectl cluster-info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Cannot connect to Kubernetes cluster. Please check your kubeconfig.
    exit /b 1
)

echo Prerequisites check completed
goto :eof

:create_secrets
echo Creating secrets for %ENVIRONMENT% environment...

REM Generate secure passwords if they don't exist
if not exist ".secrets-%ENVIRONMENT%.env" (
    echo Generating secure secrets...
    echo # Auto-generated secrets for %ENVIRONMENT% environment>.secrets-%ENVIRONMENT%.env
    echo # Generated on: %date% %time%>>.secrets-%ENVIRONMENT%.env
    echo.>>.secrets-%ENVIRONMENT%.env

    REM Generate random passwords using PowerShell
    for /f "delims=" %%i in ('powershell -command "[Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))"') do set "POSTGRES_PASSWORD=%%i"
    for /f "delims=" %%i in ('powershell -command "[Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))"') do set "REDIS_PASSWORD=%%i"
    for /f "delims=" %%i in ('powershell -command "[Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))"') do set "API_KEY=%%i"
    for /f "delims=" %%i in ('powershell -command "[Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))"') do set "JWT_SECRET=%%i"

    echo POSTGRES_PASSWORD=%POSTGRES_PASSWORD%>>.secrets-%ENVIRONMENT%.env
    echo REDIS_PASSWORD=%REDIS_PASSWORD%>>.secrets-%ENVIRONMENT%.env
    echo API_KEY=%API_KEY%>>.secrets-%ENVIRONMENT%.env
    echo JWT_SECRET=%JWT_SECRET%>>.secrets-%ENVIRONMENT%.env
    echo.>>.secrets-%ENVIRONMENT%.env
    echo # Database connection details>>.secrets-%ENVIRONMENT%.env
    echo DATABASE_URL=postgresql://rica:%POSTGRES_PASSWORD%@postgres:5432/rica>>.secrets-%ENVIRONMENT%.env
    echo REDIS_URL=redis://:%REDIS_PASSWORD%@redis:6379/0>>.secrets-%ENVIRONMENT%.env

    echo SUCCESS: Generated .secrets-%ENVIRONMENT%.env
)

REM Create Kubernetes namespace
kubectl create namespace %NAMESPACE% --dry-run=client -o yaml | kubectl apply -f -

REM Create Kubernetes secrets
kubectl create secret generic rica-secrets --namespace %NAMESPACE% --from-env-file=".secrets-%ENVIRONMENT%.env" --dry-run=client -o yaml | kubectl apply -f -

echo SUCCESS: Secrets created
goto :eof

:build_images
echo Building Docker images...

REM Build credit metering service
docker build -t rica/credit-metering:latest -f Dockerfile.credit-metering .
if errorlevel 1 (
    echo ERROR: Failed to build credit-metering image
    exit /b 1
)

docker tag rica/credit-metering:latest rica/credit-metering:%ENVIRONMENT%

REM Build resource collector
docker build -t rica/resource-collector:latest -f Dockerfile.collector .
if errorlevel 1 (
    echo ERROR: Failed to build resource-collector image
    exit /b 1
)

docker tag rica/resource-collector:latest rica/resource-collector:%ENVIRONMENT%

REM Push images if registry is configured
if defined DOCKER_REGISTRY (
    docker push rica/credit-metering:%ENVIRONMENT%
    docker push rica/resource-collector:%ENVIRONMENT%
    echo SUCCESS: Images pushed to registry
) else (
    echo WARNING: DOCKER_REGISTRY not set, skipping image push
)

echo SUCCESS: Docker images built
goto :eof

:deploy_kubernetes
echo Deploying to Kubernetes...

REM Apply the main deployment
kubectl apply -f k8s-rica-multi-tenant.yml
if errorlevel 1 (
    echo ERROR: Failed to apply Kubernetes manifests
    exit /b 1
)

echo Waiting for deployments to be ready...
kubectl wait --for=condition=available --timeout=300s deployment/credit-metering-service --namespace %NAMESPACE%
kubectl wait --for=condition=available --timeout=300s deployment/resource-collector --namespace %NAMESPACE%
kubectl wait --for=condition=available --timeout=300s statefulset/postgres --namespace %NAMESPACE%

echo SUCCESS: Kubernetes deployment completed
goto :eof

:setup_monitoring
REM Setup monitoring (optional)
echo Setting up monitoring...

REM Check if helm is available
helm version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Helm not available, skipping monitoring setup
    goto :eof
)

REM Add prometheus-community repo if not exists
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>nul

REM Update helm repos
helm repo update >nul 2>&1

REM Install kube-prometheus-stack
if defined GRAFANA_PASSWORD (
    helm upgrade --install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace --set grafana.adminPassword="%GRAFANA_PASSWORD%" --set prometheus.serviceMonitorSelectorNilUsesHelmValues=false
    echo SUCCESS: Monitoring setup completed
) else (
    echo WARNING: GRAFANA_PASSWORD not set, skipping monitoring setup
)
goto :eof

:create_sample_tenant
echo Creating sample tenant...

REM Generate tenant ID
for /f "delims=" %%i in ('powershell -command "Get-Date -UFormat '%%s'"') do set "TENANT_ID=demo-%%i"

REM Create tenant namespace and quota
(
echo apiVersion: v1
echo kind: Namespace
echo metadata:
echo   name: tenant-%TENANT_ID%
echo   labels:
echo     rica-tenant: "true"
echo     tenant-id: "%TENANT_ID%"
echo     subscription-tier: "personal"
echo ---
echo apiVersion: v1
echo kind: ResourceQuota
echo metadata:
echo   name: tenant-quota
echo   namespace: tenant-%TENANT_ID%
echo spec:
echo   hard:
echo     requests.cpu: "2000m"
echo     requests.memory: "4Gi"
echo     persistentvolumeclaims: "20"
echo     pods: "10"
) > tenant-sample.yml

kubectl apply -f tenant-sample.yml
del tenant-sample.yml

echo SUCCESS: Sample tenant created (ID: %TENANT_ID%)
goto :eof
