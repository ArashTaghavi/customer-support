@echo off
echo Stopping Aiverse services...

for %%P in (8000 8002 8080 5173) do (
    for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
        taskkill /PID %%A /T /F >nul 2>&1
    )
)

echo Done!
pause
