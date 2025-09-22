@echo off
echo Starting Rica UI with Device Linking System...
echo.
echo This will start both the UI and the mock API server.
echo.
echo Press any key to continue...
pause > nul

start cmd /k "cd %~dp0 && start-mock-api.bat"
timeout /t 2 > nul
start cmd /k "cd %~dp0 && npm start"

echo.
echo Services started! You can now access Rica UI with Device Linking at http://localhost:3000
