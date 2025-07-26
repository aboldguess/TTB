@echo off
REM host.bat - Launch the Transport Tycoon Basic server on Windows.
REM Usage: host.bat [PORT]
REM The optional PORT argument sets the HTTP port. Defaults to 3000.

REM Choose provided port or default value
SET PORT=%1
IF "%PORT%"=="" SET PORT=3000

REM Install dependencies on first run
IF NOT EXIST node_modules (
  echo Installing dependencies...
  npm install
)

REM Optional migration step
call npm run migrate >NUL 2>&1

REM Optional build step
call npm run build >NUL 2>&1

REM Launch the server on the specified port
SET PORT=%PORT%
node server.js
