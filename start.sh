#!/bin/bash
# Library Management System 시작 스크립트

echo "========================================"
echo "  도서관 관리 시스템 시작"
echo "========================================"
echo ""

echo "Docker 컨테이너 시작 중..."
docker-compose up -d

echo ""
echo "상태 확인 중..."
sleep 3
docker-compose ps

echo ""
echo "========================================"
echo "      시작 완료!"
echo "========================================"
echo ""
echo "📍 http://localhost:8080"
echo "📍 https://library.kontrack.kr"
echo ""
echo "로그 확인: ./logs.sh"
echo "상태 확인: ./health.sh"
echo "중지: ./stop.sh"
echo ""

