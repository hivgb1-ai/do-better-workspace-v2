@echo off
cd /d "%~dp0..\app"
npm run dev >> "%~dp0..\dev.log" 2>&1
