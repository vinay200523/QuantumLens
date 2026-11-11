@echo off
echo ========================================================
echo Starting QuantumLens FastAPI Backend...
echo ========================================================
cd /d "%~dp0backend"
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Launching Uvicorn server on http://localhost:8000 ...
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
