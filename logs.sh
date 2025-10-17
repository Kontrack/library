#!/bin/bash
# Library Management System 로그 확인 스크립트

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "  도서관 관리 시스템 로그 확인"
echo "========================================"
echo ""

# MySQL 컨테이너 실행 확인
if ! docker-compose ps library-mysql | grep -q "Up"; then
    echo -e "${RED}❌ MySQL 컨테이너가 실행 중이지 않습니다.${NC}"
    echo ""
    echo "MySQL을 시작하려면: ./start.sh"
    exit 1
fi

echo "어떤 로그를 확인하시겠습니까?"
echo ""
echo "1) MySQL 로그"
echo "2) Nginx 로그 (시스템)"
echo "3) 실시간 MySQL 로그 (tail -f)"
echo "4) 최근 50줄만 보기"
echo ""
read -p "선택 (1-4): " choice

echo ""

case $choice in
    1)
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}🗄️  MySQL 로그${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        docker-compose logs library-mysql
        ;;
        
    2)
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}🌐 Nginx 로그 (시스템)${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        sudo tail -50 /var/log/nginx/access.log
        echo ""
        echo "에러 로그:"
        sudo tail -20 /var/log/nginx/error.log
        ;;
        
    3)
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}📡 실시간 MySQL 로그 (Ctrl+C로 종료)${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        docker-compose logs -f library-mysql
        ;;
        
    4)
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}📋 최근 50줄${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        docker-compose logs --tail=50 library-mysql
        ;;
        
    *)
        echo -e "${RED}잘못된 선택입니다.${NC}"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 팁: 직접 명령어 사용"
echo "   docker-compose logs library-mysql"
echo "   docker-compose logs -f library-mysql"
echo "   sudo tail -f /var/log/nginx/access.log"
echo "   sudo tail -f /var/log/nginx/error.log"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

