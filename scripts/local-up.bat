@echo off
setlocal

echo ===== UIT-Go Local Deploy =====

REM Nhảy về thư mục gốc project
cd /d "%~dp0.."

echo.
echo [1] Stopping old containers...
docker compose down || docker-compose down

echo.
echo [2] Starting new containers (build + up -d)...
docker compose up -d --build || docker-compose up -d --build

echo.
echo  UIT-Go local deploy done!
echo - User-service: http://localhost:3000
echo - Trip-service: http://localhost:3001
pause
endlocal
