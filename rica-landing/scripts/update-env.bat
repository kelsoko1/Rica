@echo off
REM Script to update env.js in a running container
REM Usage: update-env.bat <container_name> [env_file]

setlocal enabledelayedexpansion

set CONTAINER_NAME=%1
set ENV_FILE=%2

if "%ENV_FILE%"=="" set ENV_FILE=.env.production

REM Check if container name is provided
if "%CONTAINER_NAME%"=="" (
  echo Error: Container name is required
  echo Usage: update-env.bat ^<container_name^> [env_file]
  exit /b 1
)

REM Check if env file exists
if not exist "%ENV_FILE%" (
  echo Error: Environment file %ENV_FILE% not found
  exit /b 1
)

echo Updating env.js in container %CONTAINER_NAME% using %ENV_FILE%

REM Load environment variables
for /f "tokens=*" %%a in ('type "%ENV_FILE%" ^| findstr /v "^#" ^| findstr /r "="') do (
  set "%%a"
)

REM Create temporary env.js file
set TEMP_FILE=%TEMP%\env.js
echo /**> %TEMP_FILE%
echo  * Environment variables for browser>> %TEMP_FILE%
echo  * Generated on: %DATE% %TIME%>> %TEMP_FILE%
echo  * This file is auto-generated and should not be modified directly>> %TEMP_FILE%
echo  */>> %TEMP_FILE%
echo.>> %TEMP_FILE%
echo window.env = {>> %TEMP_FILE%
echo   "NODE_ENV": "%NODE_ENV%",>> %TEMP_FILE%
echo   "REACT_APP_API_URL": "%REACT_APP_API_URL%",>> %TEMP_FILE%
echo   "REACT_APP_CLICKPESA_API_KEY": "%REACT_APP_CLICKPESA_API_KEY%",>> %TEMP_FILE%
echo   "REACT_APP_ENCRYPTION_KEY": "%REACT_APP_ENCRYPTION_KEY%",>> %TEMP_FILE%
echo   "REACT_APP_ANALYTICS_KEY": "%REACT_APP_ANALYTICS_KEY%",>> %TEMP_FILE%
echo   "REACT_APP_SENTRY_DSN": "%REACT_APP_SENTRY_DSN%">> %TEMP_FILE%
echo };>> %TEMP_FILE%

REM Update env.js in the container
type %TEMP_FILE% | docker exec -i %CONTAINER_NAME% sh -c "cat > /usr/share/nginx/html/env.js"

REM Clean up
del %TEMP_FILE%

echo env.js updated successfully in container %CONTAINER_NAME%
