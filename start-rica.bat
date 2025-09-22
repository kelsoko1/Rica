@echo off
echo Starting Rica applications...

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
