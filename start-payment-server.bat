@echo off
echo Starting Rica Payment Server...

cd c:\Users\kelvin\Desktop\Rica\rica-landing\server

echo Installing dependencies...
call npm install

echo Starting server...
call npm start
