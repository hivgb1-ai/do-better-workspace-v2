@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8

py -3 "%~dp0fill_otoo_to_erp.py" --write %*

echo.
echo 완료. ERP 위탁수주 파일에 새 시트가 추가되었는지 확인하세요.
pause >nul
