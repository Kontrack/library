#!/bin/bash
# Library Management System 재시작 스크립트

echo "========================================"
echo "  도서관 관리 시스템 재시작"
echo "========================================"
echo ""

echo "[1/2] Docker 컨테이너 중지 중..."
docker-compose down

echo ""
echo "[2/2] Docker 컨테이너 시작 중..."
docker-compose up -d

echo ""
echo "상태 확인 중..."
sleep 3
docker-compose ps

echo ""
echo "========================================"
echo "      재시작 완료!"
echo "========================================"
echo ""
echo "📍 http://localhost:8080"
echo "📍 https://library.kontrack.kr"
echo ""
echo "로그 확인: ./logs.sh"
echo ""

