#!/bin/bash
# Library Management System 상태 확인 스크립트

echo "========================================"
echo "  도서관 관리 시스템 상태 확인"
echo "========================================"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  MySQL 데이터베이스 상태"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker-compose ps library-mysql | grep -q "Up"; then
    echo "✅ MySQL 실행 중 (포트 3307)"
    
    # MySQL 접속 테스트
    if docker-compose exec -T library-mysql mysqladmin ping -h localhost -u root -plibrary2024 2>/dev/null | grep -q "alive"; then
        echo "✅ MySQL 응답 정상"
        
        # 데이터베이스 목록
        echo ""
        echo "📊 데이터베이스 목록:"
        docker-compose exec -T library-mysql mysql -u root -plibrary2024 -e "SHOW DATABASES;" 2>/dev/null | grep -v "Database\|information_schema\|performance_schema\|mysql\|sys"
    else
        echo "❌ MySQL 응답 없음"
    fi
else
    echo "❌ MySQL 중지됨"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 웹서버 상태 (library.kontrack.kr)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# HTTPS 접속 테스트
if curl -s -o /dev/null -w "%{http_code}" https://library.kontrack.kr 2>/dev/null | grep -q "200"; then
    echo "✅ HTTPS 응답 정상 (200 OK)"
    echo "📍 https://library.kontrack.kr"
else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://library.kontrack.kr 2>/dev/null)
    echo "⚠️  HTTPS 응답: ${HTTP_CODE:-N/A}"
fi

# Nginx 상태 확인
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx 서비스 실행 중"
else
    echo "❌ Nginx 서비스 중지됨"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Docker 볼륨 정보"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker volume ls | grep library

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 리소스 사용량"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose ps -q library-mysql 2>/dev/null) 2>/dev/null || echo "MySQL 컨테이너가 실행 중이지 않습니다."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 유용한 명령어"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "로그 확인:   ./logs.sh"
echo "재시작:      ./restart.sh"
echo "중지:        ./stop.sh"
echo "업데이트:    ./update.sh"
echo ""

