@echo off
setlocal enabledelayedexpansion

echo Rica Headless Servers Management Script
echo ======================================
echo.

if "%1"=="" (
    goto :help
) else if "%1"=="all" (
    goto :start_all
) else if "%1"=="opencti" (
    goto :start_opencti
) else if "%1"=="openbas" (
    goto :start_openbas
) else if "%1"=="activepieces" (
    goto :start_activepieces
) else if "%1"=="code-server" (
    goto :start_code_server
) else if "%1"=="ollama" (
    goto :start_ollama
) else if "%1"=="stop" (
    goto :stop_all
) else if "%1"=="status" (
    goto :status
) else if "%1"=="help" (
    goto :help
) else (
    echo Unknown command: %1
    echo.
    goto :help
)

:start_all
echo Starting all headless servers...
docker-compose -f docker-compose.headless-servers.yml up -d
echo.
echo All headless servers started successfully.
echo.
echo Access the services at:
echo - OpenCTI (Fabric): http://localhost:2020
echo - OpenBAS (Simulations): http://localhost:2021
echo - Activepieces (Auto): http://localhost:2022
echo - Code Server: http://localhost:2023
echo - Ollama: http://localhost:11434
goto :eof

:start_opencti
echo Starting OpenCTI (Fabric)...
docker-compose -f docker-compose.opencti.yml up -d
echo.
echo OpenCTI started successfully. Access at http://localhost:2020
goto :eof

:start_openbas
echo Starting OpenBAS (Simulations)...
docker-compose -f docker-compose.openbas.yml up -d
echo.
echo OpenBAS started successfully. Access at http://localhost:2021
goto :eof

:start_activepieces
echo Starting Activepieces (Auto)...
docker-compose -f docker-compose.activepieces.yml up -d
echo.
echo Activepieces started successfully. Access at http://localhost:2022
goto :eof

:start_code_server
echo Starting Code Server...
docker-compose -f docker-compose.code-server.yml up -d
echo.
echo Code Server started successfully. Access at http://localhost:2023
goto :eof

:start_ollama
echo Starting Ollama...
docker-compose -f docker-compose.ollama.yml up -d
echo.
echo Ollama started successfully. Access at http://localhost:11434
goto :eof

:stop_all
echo Stopping all headless servers...
docker-compose -f docker-compose.headless-servers.yml down
echo.
echo All headless servers stopped successfully.
goto :eof

:status
echo Checking status of headless servers...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr /i "opencti openbas activepieces code-server ollama"
goto :eof

:help
echo Usage: start-headless-servers.bat [command]
echo.
echo Commands:
echo   all           Start all headless servers
echo   opencti       Start OpenCTI (Fabric)
echo   openbas       Start OpenBAS (Simulations)
echo   activepieces  Start Activepieces (Auto)
echo   code-server   Start Code Server
echo   ollama        Start Ollama
echo   stop          Stop all headless servers
echo   status        Check status of headless servers
echo   help          Show this help message
echo.
echo Examples:
echo   start-headless-servers.bat all
echo   start-headless-servers.bat opencti
echo   start-headless-servers.bat stop
goto :eof
