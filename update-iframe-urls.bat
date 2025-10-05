@echo off
setlocal enabledelayedexpansion

echo Rica UI Iframe URL Update Script
echo ==============================
echo.
echo This script will update the iframe URLs in the Rica UI components to match the standardized port mapping.
echo.

set "FABRIC_FRAME=rica-ui\src\components\FabricFrame.js"
set "SIMS_FRAME=rica-ui\src\components\SimsFrame.js"
set "AUTO_FRAME=rica-ui\src\components\AutoFrame.js"

echo Checking for component files...

if not exist "%FABRIC_FRAME%" (
    echo ERROR: %FABRIC_FRAME% not found.
    echo Please make sure you're running this script from the Rica root directory.
    goto :eof
)

if not exist "%SIMS_FRAME%" (
    echo ERROR: %SIMS_FRAME% not found.
    echo Please make sure you're running this script from the Rica root directory.
    goto :eof
)

if not exist "%AUTO_FRAME%" (
    echo WARNING: %AUTO_FRAME% not found. Will skip updating AutoFrame.
)

echo.
echo Updating iframe URLs...

echo Updating %FABRIC_FRAME%...
powershell -Command "(Get-Content '%FABRIC_FRAME%') -replace 'http://localhost:4000', 'http://localhost:2020' | Set-Content '%FABRIC_FRAME%'"
if %errorlevel% neq 0 (
    echo ERROR: Failed to update %FABRIC_FRAME%.
) else (
    echo Successfully updated %FABRIC_FRAME%.
)

echo Updating %SIMS_FRAME%...
powershell -Command "(Get-Content '%SIMS_FRAME%') -replace 'http://localhost:3000', 'http://localhost:2021' | Set-Content '%SIMS_FRAME%'"
if %errorlevel% neq 0 (
    echo ERROR: Failed to update %SIMS_FRAME%.
) else (
    echo Successfully updated %SIMS_FRAME%.
)

if exist "%AUTO_FRAME%" (
    echo Updating %AUTO_FRAME%...
    powershell -Command "(Get-Content '%AUTO_FRAME%') -replace 'http://localhost:[0-9]+', 'http://localhost:2022' | Set-Content '%AUTO_FRAME%'"
    if %errorlevel% neq 0 (
        echo ERROR: Failed to update %AUTO_FRAME%.
    ) else (
        echo Successfully updated %AUTO_FRAME%.
    )
)

echo.
echo Update complete.
echo.
echo The iframe URLs have been updated to use the standardized port mapping:
echo - OpenCTI (Fabric): http://localhost:2020
echo - OpenBAS (Simulations): http://localhost:2021
echo - Activepieces (Auto): http://localhost:2022
echo.
echo You should rebuild the Rica UI for the changes to take effect.
echo.
