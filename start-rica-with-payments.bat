@echo off
echo Starting Rica with payment integration...

echo.
echo Installing server dependencies...
cd c:\Users\kelvin\Desktop\Rica\rica-landing\server
npm install

echo.
echo Installing client dependencies...
cd c:\Users\kelvin\Desktop\Rica\rica-landing
npm install

echo.
echo Starting Rica applications...
npm run dev:all

echo.
echo Rica applications are starting...
echo.
echo Rica Landing Page will be available at: http://localhost:3030
echo Rica API Server will be available at: http://localhost:8080
echo.
echo Press Ctrl+C to stop all services...
