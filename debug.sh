#!/bin/bash

# 도서관 시스템 API 404 에러 디버깅 스크립트

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}도서관 시스템 디버깅 시작${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 컨테이너 상태 확인
echo -e "${YELLOW}[1/6] 컨테이너 상태 확인${NC}"
docker-compose ps
echo ""

# 2. 백엔드 컨테이너 확인
echo -e "${YELLOW}[2/6] 백엔드 실행 상태${NC}"
if docker-compose ps library-backend | grep -q "Up"; then
    echo -e "${GREEN}✅ library-backend 컨테이너 실행 중${NC}"
else
    echo -e "${RED}❌ library-backend 컨테이너가 실행되지 않음!${NC}"
    echo -e "${RED}   해결: docker-compose up -d library-backend${NC}"
fi
echo ""

# 3. 백엔드 로그 확인
echo -e "${YELLOW}[3/6] 백엔드 로그 (최근 30줄)${NC}"
docker-compose logs --tail=30 library-backend
echo ""

# 4. MySQL 연결 확인
echo -e "${YELLOW}[4/6] MySQL 연결 확인${NC}"
if docker-compose logs library-backend | grep -q "MySQL 데이터베이스 연결 성공"; then
    echo -e "${GREEN}✅ MySQL 연결 성공${NC}"
else
    echo -e "${RED}❌ MySQL 연결 실패${NC}"
    echo -e "${RED}   백엔드 로그를 확인하세요${NC}"
fi
echo ""

# 5. Nginx API 프록시 설정 확인
echo -e "${YELLOW}[5/6] Nginx API 프록시 설정 확인${NC}"
if sudo grep -q "proxy_pass http://library-backend:3000" ~/kontrack/upbit_auto_trading/nginx.conf 2>/dev/null; then
    echo -e "${GREEN}✅ Nginx에 API 프록시 설정 있음${NC}"
    echo ""
    echo "설정 내용:"
    sudo grep -A 15 "location /api/" ~/kontrack/upbit_auto_trading/nginx.conf | head -20
else
    echo -e "${RED}❌ Nginx에 API 프록시 설정이 없습니다!${NC}"
    echo -e "${RED}   해결:${NC}"
    echo -e "${RED}   1. sudo nano ~/kontrack/upbit_auto_trading/nginx.conf${NC}"
    echo -e "${RED}   2. nginx-library-config.txt의 내용을 library.kontrack.kr 서버 블록에 추가${NC}"
    echo -e "${RED}   3. cd ~/kontrack/upbit_auto_trading && docker-compose restart nginx${NC}"
fi
echo ""

# 6. 네트워크 연결 확인
echo -e "${YELLOW}[6/6] Docker 네트워크 연결 확인${NC}"

# library-backend가 library 네트워크에 있는지
if docker network inspect library_library-network 2>/dev/null | grep -q "library-backend"; then
    echo -e "${GREEN}✅ library-backend가 library_library-network에 연결됨${NC}"
else
    echo -e "${RED}❌ library-backend가 library_library-network에 연결되지 않음${NC}"
fi

# kontrack-nginx가 library 네트워크에 있는지
if docker network inspect library_library-network 2>/dev/null | grep -q "kontrack-nginx"; then
    echo -e "${GREEN}✅ kontrack-nginx가 library_library-network에 연결됨${NC}"
else
    echo -e "${RED}❌ kontrack-nginx가 library_library-network에 연결되지 않음!${NC}"
    echo -e "${RED}   해결:${NC}"
    echo -e "${RED}   1. sudo nano ~/kontrack/upbit_auto_trading/docker-compose.yml${NC}"
    echo -e "${RED}   2. nginx service의 networks에 library-network 추가${NC}"
    echo -e "${RED}   3. 파일 맨 아래 networks 섹션에 library-network 정의 추가${NC}"
    echo -e "${RED}   4. cd ~/kontrack/upbit_auto_trading && docker-compose up -d nginx${NC}"
fi
echo ""

# 7. 백엔드 직접 테스트
echo -e "${YELLOW}[추가] 백엔드 API 직접 테스트${NC}"
if docker exec library-backend wget -q -O - http://localhost:3000/api 2>/dev/null | grep -q "Library Management System API"; then
    echo -e "${GREEN}✅ 백엔드 API 정상 응답${NC}"
else
    echo -e "${YELLOW}⚠️  백엔드 API 테스트 실패 (정상일 수도 있음)${NC}"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}디버깅 완료${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "💡 추가 확인 사항:"
echo "1. 브라우저에서 https://library.kontrack.kr/api 접속 테스트"
echo "2. 백엔드 로그 실시간 확인: docker-compose logs -f library-backend"
echo "3. Nginx 로그 확인: docker logs kontrack-nginx"
echo ""

