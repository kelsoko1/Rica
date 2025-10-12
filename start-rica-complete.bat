@echo off
setlocal enabledelayedexpansion

echo Rica Complete Management Script
echo ==============================
echo.

if "%1"=="" (
    goto :help
) else if "%1"=="all" (
    goto :start_all
) else if "%1"=="ui" (
    goto :start_ui
) else if "%1"=="headless" (
    goto :start_headless
) else if "%1"=="" (
    goto :start_
) else if "%1"=="" (
    goto :start_
) else if "%1"=="activepieces" (
    goto :start_activepieces
) else if "%1"=="code-server" (
    goto :start_code_server
) else if "%1"=="ollama" (
    goto :start_ollama
) else if "%1"=="vircadia" (
    goto :start_vircadia
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
echo Starting all Rica components...
docker-compose -f docker-compose.master.yml up -d
echo.
echo All Rica components started successfully.
echo.
echo Access the services at:
echo - Rica UI: http://localhost:3030
echo - Rica API: http://localhost:3001
echo - Rica Landing: http://localhost:3000
echo - Activepieces (Auto): http://localhost:2020
echo - Code Server: http://localhost:2021
echo - Ollama: http://localhost:2022
echo - Vircadia (Metaverse): http://localhost:2023
goto :eof

:start_ui
echo Starting Rica UI components...
docker-compose -f docker-compose.rica-ui.yml up -d
echo.
echo Rica UI components started successfully.
echo.
echo Access the services at:
echo - Rica UI: http://localhost:3000
echo - Rica API: http://localhost:3001
goto :eof

:start_headless
echo Starting all headless servers...
docker-compose -f docker-compose.headless-servers.yml up -d
echo.
echo All headless servers started successfully.
echo.
echo Access the services at:
echo - Activepieces (Auto): http://localhost:2020
echo - Code Server: http://localhost:2021
echo - Ollama: http://localhost:2022
echo - Vircadia (Metaverse): http://localhost:2023
goto :eof

:start_
echo Starting  (Fabric)...
docker-compose -f docker-compose..yml up -d
echo.
echo  started successfully. Access at http://localhost:2020
goto :eof

:start_
echo Starting  (Simulations)...
docker-compose -f docker-compose..yml up -d
echo.
echo  started successfully. Access at http://localhost:2021
goto :eof

:start_activepieces
echo Starting Activepieces (Auto)...
docker-compose -f docker-compose.activepieces.yml up -d
echo.
echo Activepieces started successfully. Access at http://localhost:2020
goto :eof

:start_code_server
echo Starting Code Server...
docker-compose -f docker-compose.code-server.yml up -d
echo.
echo Code Server started successfully. Access at http://localhost:2021
goto :eof

:start_ollama
echo Starting Ollama...
docker-compose -f docker-compose.ollama.yml up -d
echo.
echo Ollama started successfully. Access at http://localhost:2022
goto :eof

:start_vircadia
echo Starting Vircadia (Metaverse)...
docker-compose -f docker-compose.vircadia.yml up -d
echo.
echo Vircadia started successfully. Access at http://localhost:2023
goto :eof

:stop_all
echo Stopping all Rica components...
docker-compose -f docker-compose.master.yml down
echo.
echo All Rica components stopped successfully.
goto :eof

:status
echo Checking status of Rica components...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr /i "rica activepieces code-server ollama vircadia"
goto :eof

:help
echo Usage: start-rica-complete.bat [command]
echo.
echo Commands:
echo   all           Start all Rica components
echo   ui            Start Rica UI components only
echo   headless      Start all headless servers
echo   activepieces  Start Activepieces (Auto)
echo   code-server   Start Code Server
echo   ollama        Start Ollama
echo   vircadia      Start Vircadia (Metaverse)
echo   stop          Stop all Rica components
echo   status        Check status of Rica components
echo   help          Show this help message
echo.
echo Examples:
echo   start-rica-complete.bat all
echo   start-rica-complete.bat ui
echo   start-rica-complete.bat headless
echo   start-rica-complete.bat vircadia
echo   start-rica-complete.bat stop
goto :eof
