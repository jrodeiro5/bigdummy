@echo off
echo Starting BigDummy Development Environment...
echo.
echo [1/2] Starting Flask Backend...
start cmd /k "cd /d %~dp0 && python -m api.app"
echo.
echo [2/2] Starting React Frontend...
start cmd /k "cd /d %~dp0 && npm run dev"
echo.
echo BigDummy Dev Environment is starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to stop all services...
pause > nul
taskkill /f /im cmd.exe
