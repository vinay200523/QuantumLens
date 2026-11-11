@echo off
echo ========================================================
echo Starting QuantumLens React Frontend...
echo ========================================================
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing node modules...
    npm install
)
echo.
echo Launching Vite development server on http://localhost:5173 ...
npm run dev
pause
