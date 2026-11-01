@echo off
setlocal
cd /d "%~dp0"
rem Clear a stale app process if it owns the usual local port.
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":3001 .*LISTENING"') do taskkill /F /PID %%P >nul 2>&1
timeout /t 1 /nobreak >nul
echo Building the app for reliable local startup...
call npm.cmd run build
if errorlevel 1 (
  echo Build failed. See the error above and keep this window open.
  pause
  exit /b 1
)
set "GURUKUL_PORT=3001"
call :start_server
if errorlevel 1 (
  echo Port 3001 is not available. Trying port 3002...
  set "GURUKUL_PORT=3002"
  call :start_server
)
if errorlevel 1 (
  echo Gurukul server did not start. Check the server window for the error.
  pause
  exit /b 1
)
start "" "http://localhost:%GURUKUL_PORT%/?restart=%RANDOM%"
exit /b 0

:start_server
start "Gurukul AI server" /D "%~dp0" cmd /k "set NODE_ENV=production && set PORT=%GURUKUL_PORT% && npm.cmd run dev"
for /l %%i in (1,1,15) do (
  powershell.exe -NoProfile -Command "try { $r = Invoke-RestMethod -Uri 'http://localhost:%GURUKUL_PORT%/api/health' -TimeoutSec 1; if ($r.release -eq 'gurukul-startup-fix-2') { exit 0 }; exit 1 } catch { exit 1 }"
  if not errorlevel 1 exit /b 0
  timeout /t 1 /nobreak >nul
)
exit /b 1
endlocal
