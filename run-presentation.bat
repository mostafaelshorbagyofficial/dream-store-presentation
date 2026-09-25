@echo off
title DREAM STORE - Strategic Presentation (Presented by ProMedia)
cd /d "%~dp0"
echo ========================================================
echo   DREAM STORE - STRATEGIC ONLINE PRESENTATION
echo   Presented by ProMedia
echo ========================================================
echo.
echo Starting presentation server on http://localhost:3000 ...
start http://localhost:3000
node serve.js
pause
