#!/bin/bash
# 모든 스크립트에 실행 권한 부여

echo "========================================="
echo "  스크립트 실행 권한 설정"
echo "========================================="
echo ""

SCRIPTS=(
    "deploy.sh"
    "update.sh"
    "start.sh"
    "restart.sh"
    "rebuild.sh"
    "stop.sh"
    "health.sh"
    "logs.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        chmod +x "$script"
        echo "✅ $script 실행 권한 부여됨"
    else
        echo "⚠️  $script 파일을 찾을 수 없습니다"
    fi
done

echo ""
echo "========================================="
echo "  완료!"
echo "========================================="
echo ""
echo "사용 가능한 명령어:"
echo "  ./start.sh      - 시작"
echo "  ./stop.sh       - 중지"
echo "  ./restart.sh    - 재시작"
echo "  ./rebuild.sh    - 재빌드"
echo "  ./update.sh     - 업데이트"
echo "  ./health.sh     - 상태 확인"
echo "  ./logs.sh       - 로그 보기"
echo "  ./deploy.sh     - 배포"
echo ""

