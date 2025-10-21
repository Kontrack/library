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
echo "[3/5] 웹 파일 업데이트..."
# 기존 Kontrack Nginx 마운트 활용: /home/ -> /usr/share/nginx/html
sudo cp -r public/* /home/library/
sudo chown -R www-data:www-data /home/library/

echo ""
echo "[4/5] 컨테이너 재시작..."
docker-compose restart

echo ""
echo "[5/5] 서비스 상태 확인..."
sleep 5
docker-compose ps

echo ""
echo "========================================"
echo "      업데이트 완료!"
echo "========================================"
echo ""
echo "📍 https://library.kontrack.kr"
echo "📍 MySQL: localhost:3307"
echo "📍 웹 파일: /home/library/ (자동 매핑됨)"
echo ""
echo "로그 확인: ./logs.sh"
echo "상태 확인: ./health.sh"
echo ""

