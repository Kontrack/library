@echo off
chcp 65001 >nul
REM Library Management System 로그 확인 스크립트 (Windows)

echo ========================================
echo   도서관 관리 시스템 로그 확인
echo ========================================
echo.

REM 컨테이너 실행 확인
docker-compose ps | find "Up" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] 실행 중인 컨테이너가 없습니다.
    echo.
    echo 컨테이너를 시작하려면: start.bat
    pause
    exit /b 1
)

echo 어떤 로그를 확인하시겠습니까?
echo.
echo 1^) 전체 로그 (모든 컨테이너^)
echo 2^) Nginx 로그
echo 3^) MySQL 로그
echo 4^) 실시간 로그 (Ctrl+C로 종료^)
echo 5^) 최근 50줄만 보기
echo.
set /p choice="선택 (1-5): "

echo.

if "%choice%"=="1" (
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo 📋 전체 로그
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    docker-compose logs
    
) else if "%choice%"=="2" (
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo 🌐 Nginx 로그
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    docker-compose logs library-nginx
    
) else if "%choice%"=="3" (
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo 🗄️  MySQL 로그
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    docker-compose logs library-mysql
    
) else if "%choice%"=="4" (
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo 📡 실시간 로그 (Ctrl+C로 종료^)
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    docker-compose logs -f
    
) else if "%choice%"=="5" (
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo 📋 최근 50줄
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    docker-compose logs --tail=50
    
) else (
    echo [ERROR] 잘못된 선택입니다.
    pause
    exit /b 1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 💡 팁: 특정 컨테이너 로그만 보려면
echo    docker-compose logs library-nginx
echo    docker-compose logs library-mysql
echo.
echo    실시간 로그: docker-compose logs -f
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause

