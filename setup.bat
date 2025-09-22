@echo off
echo Setting up Rica with DeepSeek Coder...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed! Please install Python 3.8 or later.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed! Please install Node.js 14 or later.
    exit /b 1
)

REM Create and activate virtual environment
python -m venv venv
call venv\Scripts\activate

REM Run the setup script
python setup.py

REM Install frontend dependencies
cd rica-ui
call npm install

REM Install backend dependencies
cd ..\rica-api
call npm install

REM Install server dependencies
cd ..\rica-server
pip install -r requirements.txt

echo.
echo Setup complete! To start Rica:
echo.
echo Terminal 1 (Model Server):
echo cd rica-server
echo python server.py
echo.
echo Terminal 2 (API Server):
echo cd rica-api
echo npm start
echo.
echo Terminal 3 (Frontend):
echo cd rica-ui
echo npm start
echo.
echo The application will be available at http://localhost:3000
