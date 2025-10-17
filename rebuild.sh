#!/bin/bash
# Library Management System 재빌드 스크립트

echo "========================================"
echo "  도서관 관리 시스템 재빌드"
echo "========================================"
echo ""

echo "[1/3] MySQL 컨테이너 중지 및 삭제..."
docker-compose down library-mysql

echo ""
echo "[2/3] MySQL 이미지 재빌드..."
docker-compose build --no-cache library-mysql

echo ""
echo "[3/3] MySQL 컨테이너 시작..."
docker-compose up -d library-mysql

echo ""
echo "상태 확인 중..."
sleep 3
docker-compose ps library-mysql

echo ""
echo "========================================"
echo "      재빌드 완료!"
echo "========================================"
echo ""
echo "📍 https://library.kontrack.kr"
echo "📍 MySQL: localhost:3307"
echo ""
echo "로그 확인: ./logs.sh"
echo ""

