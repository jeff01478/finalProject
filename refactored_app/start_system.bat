@echo off
title Bed Information System Launcher
echo ==========================================
echo   Starting Bed Information System
echo ==========================================

echo [1/2] Starting Web Server (FastAPI)...
start "Bed System Server" conda run -n bed_system --no-capture-output python run.py

echo Waiting for server to initialize...
timeout /t 5 /nobreak >nul

echo [2/2] Starting IoT Simulator...
start "IoT Simulator" conda run -n bed_system --no-capture-output python iot_simulator.py

echo.
echo ==========================================
echo   System is RUNNING!
echo   Open your browser to: http://127.0.0.1:8001
echo ==========================================
echo.
pause
