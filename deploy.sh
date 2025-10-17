#!/bin/bash
# Library Management System 배포 스크립트 (대화형)

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  도서관 관리 시스템 배포"
echo "========================================"
echo ""

# 배포 방법 선택
echo "배포 방법을 선택하세요:"
echo "1) 독립 Docker 실행 (포트 8080)"
echo "2) 기존 Nginx에 통합 (library.kontrack.kr)"
echo "3) MySQL만 실행"
echo ""
read -p "선택 (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}독립 Docker 실행 모드${NC}"
        echo ""
        
        # Docker 확인
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}Docker가 설치되어 있지 않습니다.${NC}"
            exit 1
        fi
        
        # Docker Compose 실행
        echo "Docker Compose 실행 중..."
        docker-compose up -d
        
        echo ""
        echo "상태 확인 중..."
        sleep 3
        docker-compose ps
        
        echo ""
        echo -e "${GREEN}배포 완료!${NC}"
        echo "📍 http://localhost:8080"
        echo ""
        echo "유용한 명령어:"
        echo "  상태 확인: ./health.sh"
        echo "  로그 확인: ./logs.sh"
        echo "  중지:      ./stop.sh"
        ;;
        
    2)
        echo ""
        echo -e "${GREEN}기존 Nginx 통합 모드${NC}"
        echo ""
        
        # 파일 복사 위치 확인
        read -p "public 폴더를 복사할 경로를 입력하세요 (예: /usr/share/nginx/html/library): " TARGET_PATH
        
        if [ -z "$TARGET_PATH" ]; then
            echo -e "${RED}경로를 입력해야 합니다.${NC}"
            exit 1
        fi
        
        # 디렉토리 생성
        echo "디렉토리 생성 중..."
        sudo mkdir -p "$TARGET_PATH"
        
        # 파일 복사
        echo "파일 복사 중..."
        sudo cp -r public/* "$TARGET_PATH/"
        
        echo ""
        echo -e "${YELLOW}다음 단계:${NC}"
        echo "1. nginx-library-config.txt의 내용을 Nginx 설정에 추가"
        echo "2. root 경로를 '$TARGET_PATH'로 수정"
        echo "3. SSL 인증서 발급 (아직 없는 경우):"
        echo "   sudo certbot certonly --nginx -d library.kontrack.kr"
        echo "4. Nginx 테스트 및 재시작:"
        echo "   sudo nginx -t && sudo systemctl reload nginx"
        echo ""
        
        # MySQL 실행 여부
        read -p "MySQL 컨테이너를 실행하시겠습니까? (y/n): " run_mysql
        if [ "$run_mysql" = "y" ] || [ "$run_mysql" = "Y" ]; then
            echo "MySQL 컨테이너 실행 중..."
            docker-compose up -d library-mysql
            echo -e "${GREEN}MySQL 실행 완료 (포트 3307)${NC}"
        fi
        ;;
        
    3)
        echo ""
        echo -e "${GREEN}MySQL만 실행${NC}"
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
echo "  배포 스크립트 종료"
echo "========================================"
echo ""

