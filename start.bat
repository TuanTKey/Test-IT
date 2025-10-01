@echo off
echo Starting Coding Platform...

:: Start Backend in a new window
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

:: Start Frontend in a new window
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==========================================
echo Backend running at: http://localhost:5000
echo Frontend running at: http://localhost:5173
echo ==========================================
echo.
pause
