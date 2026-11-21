@echo off
setlocal
title Aiverse Development
cd /d "%~dp0app"

echo Preparing Laravel...

php artisan optimize:clear
if errorlevel 1 goto :failed

php artisan package:discover --no-interaction
if errorlevel 1 goto :failed

php artisan list --raw >nul
if errorlevel 1 goto :failed

echo Starting all services...

call yarn concurrently ^
  --kill-others ^
  --names "SERVER,QUEUE,REVERB,VITE,FASTAPI" ^
  --prefix-colors "blue,yellow,magenta,green,cyan" ^
  "php artisan serve" ^
  "php artisan queue:work --tries=1 --timeout=150" ^
  "php artisan reverb:start --debug" ^
  "yarn dev" ^
  "cd /d ..\ai && uv run fastapi dev --port=8002"

pause
exit /b 0

:failed
echo Laravel preparation failed!
pause
exit /b 1
