@echo off
del /F /Q "src\components\StarrySidebar.js"
timeout /t 1 /nobreak > nul
copy /Y "src\components\StarrySidebarClean.js" "src\components\StarrySidebar.js"
echo File replaced successfully
