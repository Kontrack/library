@echo off
chcp 65001 >nul
REM Library Management System 상태 확인 스크립트 (Windows)

echo ========================================
echo   도서관 관리 시스템 상태 확인
echo ========================================
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📦 Docker 컨테이너 상태
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
docker-compose ps

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🗄️  MySQL 데이터베이스 상태
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

docker-compose ps library-mysql | find "Up" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MySQL 실행 중 (포트 3307^)
    
    REM MySQL 응답 테스트
    docker-compose exec -T library-mysql mysqladmin ping -h localhost -u root -plibrary2024 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ MySQL 응답 정상
        
        echo.
        echo 📊 데이터베이스 목록:
        docker-compose exec -T library-mysql mysql -u root -plibrary2024 -e "SHOW DATABASES;" 2>nul | findstr /V "Database information_schema performance_schema mysql sys"
    ) else (
        echo ❌ MySQL 응답 없음
    )
) else (
    echo ❌ MySQL 중지됨
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🌐 Nginx 웹서버 상태
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

docker-compose ps library-nginx | find "Up" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Nginx 실행 중 (포트 8080^)
    
    REM HTTP 접속 테스트
    curl -s -o nul -w "%%{http_code}" http://localhost:8080 2>nul | find "200" >nul
    if %errorlevel% equ 0 (
        echo ✅ HTTP 응답 정상 (200 OK^)
        echo 📍 http://localhost:8080
    ) else (
        echo ⚠️  HTTP 응답 확인 필요
    )
) else (
    echo ❌ Nginx 중지됨
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 💾 Docker 볼륨 정보
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
docker volume ls | find "library"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🔍 유용한 명령어
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 로그 확인:   logs.bat
echo 재시작:      restart.bat
echo 중지:        stop.bat
echo 업데이트:    update.bat
echo.
pause

