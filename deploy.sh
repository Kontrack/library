#!/bin/bash
# Library Management System 서버 배포 스크립트

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "  도서관 관리 시스템 서버 배포"
echo "========================================"
echo ""

# 배포 방법 선택
echo "배포 방법을 선택하세요:"
echo "1) 프로덕션 배포 (library.kontrack.kr)"
echo "2) MySQL만 실행 (데이터베이스만)"
echo ""
read -p "선택 (1-2): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}프로덕션 배포 모드 (library.kontrack.kr)${NC}"
        echo ""
        
        # 기본 경로 설정
        TARGET_PATH="/usr/share/nginx/html/library"
        
        echo -e "${BLUE}1단계: 웹 파일 배포${NC}"
        echo "디렉토리 생성 중..."
        sudo mkdir -p "$TARGET_PATH"
        
        echo "파일 복사 중..."
        sudo cp -r public/* "$TARGET_PATH/"
        sudo chown -R www-data:www-data "$TARGET_PATH"
        
        echo ""
        echo -e "${BLUE}2단계: MySQL 데이터베이스 시작${NC}"
        docker-compose up -d library-mysql
        
        echo ""
        echo "상태 확인 중..."
        sleep 3
        docker-compose ps library-mysql
        
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}배포 완료!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "📍 다음 단계를 수동으로 진행하세요:"
        echo ""
        echo "1. Kontrack docker-compose.yml에 볼륨 마운트 추가:"
        echo "   sudo nano ~/kontrack/upbit_auto_trading/docker-compose.yml"
        echo ""
        echo "   nginx service의 volumes 섹션에 다음 라인 추가:"
        echo "   - /usr/share/nginx/html/library:/usr/share/nginx/html/library:ro"
        echo ""
        echo "2. Nginx 설정 추가:"
        echo "   sudo nano ~/kontrack/upbit_auto_trading/nginx.conf"
        echo ""
        echo "   nginx-library-config.txt의 내용을 복사하여"
        echo "   http { } 블록 내 마지막 server 블록 다음에 붙여넣기"
        echo ""
        echo "3. Kontrack Nginx 컨테이너 재시작:"
        echo "   cd ~/kontrack/upbit_auto_trading"
        echo "   docker-compose up -d nginx"
        echo "   cd ~/library"
        echo ""
        echo "4. 확인:"
        echo "   https://library.kontrack.kr"
        echo ""
        echo "유용한 명령어:"
        echo "  상태 확인: ./health.sh"
        echo "  로그 확인: ./logs.sh"
        echo "  업데이트:  ./update.sh"
        echo ""
        ;;
        
    2)
        echo ""
        echo -e "${GREEN}MySQL 데이터베이스만 실행${NC}"
        echo ""
        
        docker-compose up -d library-mysql
        
        echo ""
        echo "상태 확인 중..."
        sleep 2
        docker-compose ps library-mysql
        
        echo ""
        echo -e "${GREEN}MySQL 실행 완료!${NC}"
        echo ""
        echo "접속 정보:"
        echo "  Host:     localhost"
        echo "  Port:     3307"
        echo "  Database: library"
        echo "  User:     root"
        echo "  Password: library2024 (기본값)"
        echo ""
        echo "유용한 명령어:"
        echo "  상태: docker-compose ps"
        echo "  로그: ./logs.sh"
        echo "  중지: ./stop.sh"
        ;;
        
    *)
        echo ""
        echo -e "${RED}잘못된 선택입니다.${NC}"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "  서버 배포 완료"
echo "========================================"
echo ""

