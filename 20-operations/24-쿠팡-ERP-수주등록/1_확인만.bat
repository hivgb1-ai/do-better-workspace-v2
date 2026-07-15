@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8

py -3 "%~dp0fill_otoo_to_erp.py" %*

echo.
echo (dry-run: 아직 아무 파일도 수정 안 됨. 내용 확인 후 2_실제입력.bat 실행)
pause >nul
