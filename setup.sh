#!/bin/bash

echo "Setting up Rica with DeepSeek Coder..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python is not installed! Please install Python 3.8 or later."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed! Please install Node.js 14 or later."
    exit 1
fi

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Run the setup script
python3 setup.py

# Install frontend dependencies
cd rica-ui
npm install

# Install backend dependencies
cd ../rica-api
npm install

# Install server dependencies
cd ../rica-server
pip install -r requirements.txt

echo
echo "Setup complete! To start Rica:"
echo
echo "Terminal 1 (Model Server):"
echo "cd rica-server"
echo "python server.py"
echo
echo "Terminal 2 (API Server):"
echo "cd rica-api"
echo "npm start"
echo
echo "Terminal 3 (Frontend):"
echo "cd rica-ui"
echo "npm start"
echo
echo "The application will be available at http://localhost:3000"
