@echo off
set "NODE_ROOT=%~dp0.local-node\node-v24.17.0-win-x64"
if not exist "%NODE_ROOT%\npm.cmd" (
  echo Local npm was not found at "%NODE_ROOT%\npm.cmd" 1>&2
  exit /b 1
)
set "PATH=%NODE_ROOT%;%PATH%"
call "%NODE_ROOT%\npm.cmd" %*
exit /b %ERRORLEVEL%
