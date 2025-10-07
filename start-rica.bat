@echo off
echo Starting Rica applications...

echo.
echo Checking Docker network...
docker network inspect rica-network >nul 2>&1
if %errorlevel% neq 0 (
    echo Creating rica-network...
    docker network create rica-network --driver bridge --subnet 172.25.0.0/16 --gateway 172.25.0.1
    echo Network created!
) else (
    echo Network already exists - OK!
)

echo.
echo Starting Rica UI...
start cmd /k "cd c:\Users\kelvin\Desktop\Rica\rica-ui && npm start"

echo.
echo Starting Rica Landing Page...
start cmd /k "cd c:\Users\kelvin\Desktop\Rica\rica-landing && npm run dev"

echo.
echo Rica applications are starting...
echo.
echo Rica UI will be available at: http://localhost:3000
echo Rica Landing Page will be available at: http://localhost:3030
echo.
echo Press any key to exit this window...
pause > nul
