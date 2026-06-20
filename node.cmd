@echo off
set "NODE_ROOT=%~dp0.local-node\node-v24.17.0-win-x64"
if not exist "%NODE_ROOT%\node.exe" (
  echo Local Node was not found at "%NODE_ROOT%\node.exe" 1>&2
  exit /b 1
)
"%NODE_ROOT%\node.exe" %*
exit /b %ERRORLEVEL%
