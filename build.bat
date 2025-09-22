@echo off
echo [92mRica Production Build Script[0m

REM Set environment variables for production
set NODE_ENV=production
set GENERATE_SOURCEMAP=false
set CI=true

echo Building Rica API...
cd rica-api
call npm ci
echo.

echo Building Rica UI...
cd ..\rica-ui
call npm ci
call npm run build
echo.

echo [92mBuild completed successfully![0m
echo You can now deploy the application using deploy.bat
