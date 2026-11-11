@echo off
echo ========================================================
echo Launching QuantumLens Full-Stack System
echo ========================================================
start "QuantumLens Backend" cmd /k "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "QuantumLens Frontend" cmd /k "%~dp0start_frontend.bat"
echo.
echo Both servers launched!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
