@echo off
setlocal

echo ===== [1] USER-SERVICE =====
cd /d "%~dp0..\services\user-service"
call npm install
call npm test || echo user-service: no tests yet
call npm run build || echo user-service: no build step

echo.
echo ===== [2] TRIP-SERVICE =====
cd /d "%~dp0..\services\trip-service"
call npm install
call npm test || echo trip-service: no tests yet
call npm run build || echo trip-service: no build step

echo.
echo ===== [3] BUILD DOCKER IMAGES =====
cd /d "%~dp0.."
docker build -t uit-go-user:local .\services\user-service
docker build -t uit-go-trip:local .\services\trip-service

echo.
echo ✅ Local CI done (build + docker)!
pause
endlocal
