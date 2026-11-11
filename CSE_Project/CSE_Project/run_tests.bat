@echo off
echo ========================================================
echo Running QuantumLens Pytest Backend Test Suite...
echo ========================================================
cd /d "%~dp0backend"
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)
pytest -v tests/test_api.py
pause
