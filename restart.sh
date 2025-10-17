#!/bin/bash
# Library Management System 재시작 스크립트

echo "========================================"
echo "  도서관 관리 시스템 재시작"
echo "========================================"
echo ""

echo "[1/2] MySQL 컨테이너 중지 중..."
docker-compose stop library-mysql

echo ""
echo "[2/2] MySQL 컨테이너 시작 중..."
docker-compose up -d library-mysql

echo ""
echo "상태 확인 중..."
sleep 3
docker-compose ps library-mysql

echo ""
echo "========================================"
echo "      재시작 완료!"
echo "========================================"
echo ""
echo "📍 https://library.kontrack.kr"
echo "📍 MySQL: localhost:3307"
echo ""
echo "로그 확인: ./logs.sh"
echo ""

