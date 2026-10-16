@echo off
REM ============================================================
REM  PlacementPrep - Start the portable MongoDB 7.0 (no admin)
REM
REM  Usually you do NOT need this script anymore:
REM  `npm start` and `npm run seed` auto-start MongoDB themselves.
REM
REM  Use this only if you want the database running separately.
REM ============================================================

set "MONGO_BIN=C:\Users\LENOVO\MongoDB-Portable\bin\mongod.exe"
set "DATA_DIR=C:\Users\LENOVO\MongoDB-Portable\data"

if not exist "%MONGO_BIN%" (
  echo [ERROR] mongod.exe not found at:
  echo         %MONGO_BIN%
  pause
  exit /b 1
)

echo Starting MongoDB on port 27017 ...
start "MongoDB" "%MONGO_BIN%" --dbpath "%DATA_DIR%" --port 27017 --bind_ip 127.0.0.1

echo.
echo MongoDB is starting in the background.
echo First launch can take several minutes while antivirus scans the binary.
echo Verify with:  Test-NetConnection 127.0.0.1 -Port 27017
echo.
pause