@echo off
chcp 65001 >nul
REM Library Management System 중지 스크립트 (Windows)

echo ========================================
echo   도서관 관리 시스템 중지
echo ========================================
echo.

echo Docker 컨테이너 중지 중...
docker-compose down

echo.
echo ========================================
echo       중지 완료!
echo ========================================
echo.
echo 시작하려면: start.bat
echo.
pause

