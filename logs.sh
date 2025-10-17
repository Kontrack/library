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

# 컨테이너 실행 확인
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ 실행 중인 컨테이너가 없습니다.${NC}"
    echo ""
    echo "컨테이너를 시작하려면: ./start.sh"
    exit 1
fi

echo "어떤 로그를 확인하시겠습니까?"
echo ""
echo "1) 전체 로그 (모든 컨테이너)"
echo "2) Nginx 로그"
echo "3) MySQL 로그"
echo "4) 실시간 로그 (tail -f)"
echo "5) 최근 50줄만 보기"
echo ""
read -p "선택 (1-5): " choice

echo ""

case $choice in
    1)
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}📋 전체 로그${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        docker-compose logs
        ;;
        
    2)
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}🌐 Nginx 로그${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        docker-compose logs library-nginx
        ;;
        
    3)
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}🗄️  MySQL 로그${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        docker-compose logs library-mysql
        ;;
        
    4)
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}📡 실시간 로그 (Ctrl+C로 종료)${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        docker-compose logs -f
        ;;
        
    5)
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}📋 최근 50줄${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        docker-compose logs --tail=50
        ;;
        
    *)
        echo -e "${RED}잘못된 선택입니다.${NC}"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 팁: 특정 컨테이너 로그만 보려면"
echo "   docker-compose logs library-nginx"
echo "   docker-compose logs library-mysql"
echo ""
echo "   실시간 로그: docker-compose logs -f"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

