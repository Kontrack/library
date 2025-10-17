@echo off
chcp 65001 >nul
REM Library Management System 시작 스크립트 (Windows)

echo ========================================
echo   도서관 관리 시스템 시작
echo ========================================
echo.

echo Docker 컨테이너 시작 중...
docker-compose up -d

echo.
echo 상태 확인 중...
timeout /t 3 >nul
docker-compose ps

echo.
echo ========================================
echo       시작 완료!
echo ========================================
echo.
echo 📍 http://localhost:8080
echo 📍 https://library.kontrack.kr
echo.
echo 로그 확인: logs.bat
echo 상태 확인: health.bat
echo 중지: stop.bat
echo.
pause

