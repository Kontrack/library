#!/bin/bash
# Library Management System 업데이트 스크립트

set -e

echo "========================================"
echo "  도서관 관리 시스템 업데이트"
echo "========================================"
echo ""

echo "[1/5] Git 상태 확인..."
git status

echo ""
echo "[2/5] 최신 코드 가져오기..."
git pull git@github.com:Kontrack/library.git main

echo ""
echo "[3/5] Docker 컨테이너 중지..."
docker-compose down

echo ""
echo "[4/5] Docker 이미지 재빌드..."
docker-compose build

echo ""
echo "[5/5] Docker 컨테이너 시작..."
docker-compose up -d

echo ""
echo "상태 확인 중..."
sleep 3
docker-compose ps

echo ""
echo "========================================"
echo "      업데이트 완료!"
echo "========================================"
echo ""
echo "📍 http://localhost:8080"
echo "📍 https://library.kontrack.kr"
echo ""
echo "로그 확인: ./logs.sh"
echo "상태 확인: ./health.sh"
echo ""

