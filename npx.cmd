@echo off
set "NODE_ROOT=%~dp0.local-node\node-v24.17.0-win-x64"
if not exist "%NODE_ROOT%\npx.cmd" (
  echo Local npx was not found at "%NODE_ROOT%\npx.cmd" 1>&2
  exit /b 1
)
set "PATH=%NODE_ROOT%;%PATH%"
call "%NODE_ROOT%\npx.cmd" %*
exit /b %ERRORLEVEL%
