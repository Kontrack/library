@echo off
chcp 65001 >nul
REM 도서관 관리 시스템 배포 스크립트 (Windows)

echo ======================================
echo 도서관 관리 시스템 배포 스크립트
echo ======================================
echo.

REM Docker 확인
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker가 설치되어 있지 않습니다.
    echo Docker Desktop을 설치하세요: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo 배포 방법을 선택하세요:
echo 1) 독립 Docker 실행 (포트 8080)
echo 2) MySQL만 실행
echo 3) 전체 중지
echo.
set /p choice="선택 (1-3): "

if "%choice%"=="1" (
    echo.
    echo [INFO] 독립 Docker 실행 모드
    echo.
    
    echo Docker Compose 실행 중...
    docker-compose up -d
    
    echo.
    echo [SUCCESS] 배포 완료!
    echo 접속 주소: http://localhost:8080
    echo.
    echo 유용한 명령어:
    echo   - 컨테이너 상태 확인: docker-compose ps
    echo   - 로그 확인: docker-compose logs -f
    echo   - 중지: docker-compose down
    echo.
    
) else if "%choice%"=="2" (
    echo.
    echo [INFO] MySQL만 실행
    echo.
    
    docker-compose up -d library-mysql
    
    echo.
    echo [SUCCESS] MySQL 실행 완료!
    echo 접속 정보:
    echo   Host:     localhost
    echo   Port:     3307
    echo   Database: library
    echo   User:     root
    echo   Password: library2024 (기본값)
    echo.
    echo 유용한 명령어:
    echo   - 상태 확인: docker-compose ps
    echo   - 로그 확인: docker-compose logs -f library-mysql
    echo   - 중지: docker-compose stop library-mysql
    echo.
    
) else if "%choice%"=="3" (
    echo.
    echo [INFO] 전체 중지
    echo.
    
    docker-compose down
    
    echo.
    echo [SUCCESS] 모든 컨테이너가 중지되었습니다.
    echo.
    
) else (
    echo.
    echo [ERROR] 잘못된 선택입니다.
    echo.
)

echo ======================================
echo 배포 스크립트 종료
echo ======================================
echo.
pause

