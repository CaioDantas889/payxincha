@echo off
setlocal
chcp 65001 >nul
title Atualizar e publicar Paychinxa
set "PAYCHINXA_REPO=%~dp0"
if not exist "%PAYCHINXA_REPO%scripts\deploy-paychinxa.ps1" set "PAYCHINXA_REPO=C:\Users\carlo\dev\paychinxa\payxincha\"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%PAYCHINXA_REPO%scripts\deploy-paychinxa.ps1" %*
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" echo O processo foi interrompido. Confira o erro acima.
pause
exit /b %RESULT%
