# 도서관 관리 시스템 (Library Management System)

## 프로젝트 개요
도서관 관리를 위한 웹 애플리케이션 (서버 배포용)

GitHub: https://github.com/Kontrack/library

## 기술 스택
- 프론트엔드: HTML5, CSS3, JavaScript (Vanilla)
- 백엔드: 추후 구현 예정
- 데이터베이스: MySQL 8.0
- 인프라: Docker, Nginx

## 빠른 시작

### 1. 초기 배포
```bash
chmod +x *.sh
./deploy.sh
# 옵션 1 선택 (프로덕션 배포)
```

### 2. 일상 사용
```bash
./start.sh      # 시스템 시작
./stop.sh       # 시스템 중지
./health.sh     # 상태 확인
./logs.sh       # 로그 확인
```

### 3. 업데이트
```bash
./update.sh     # Git pull + 재배포
```

## 프로젝트 구조
```
release/
├── deploy.sh              # 배포 스크립트
├── start.sh               # 시작
├── stop.sh                # 중지
├── restart.sh             # 재시작
├── rebuild.sh             # 재빌드
├── update.sh              # 업데이트
├── health.sh              # 상태 확인
├── logs.sh                # 로그 확인
├── setup-permissions.sh   # 권한 설정
├── docker-compose.yml     # Docker 설정
├── nginx-library-config.txt   # Nginx 설정
├── public/                # 웹 파일
│   ├── index.html         # 로그인
│   ├── register.html      # 회원가입
│   ├── main.html          # 메인
│   ├── css/
│   └── js/
└── README.txt             # 이 파일
```

## 주요 기능
- 로그인/회원가입 (프론트엔드)
- 서적 목록 및 검색
- 인기 도서 차트
- 대출/반납 관리
- 관리자 페이지

## 접속 정보
- 웹: https://library.kontrack.kr
- MySQL: localhost:3307
- Database: library
- User: root
- Password: library2024

## 관리 스크립트

### start.sh
MySQL 컨테이너 시작

### stop.sh
MySQL 컨테이너 중지

### restart.sh
MySQL 컨테이너 재시작

### rebuild.sh
MySQL 이미지 재빌드

### update.sh
GitHub에서 최신 코드 받아서 자동 배포

### health.sh
시스템 상태 종합 확인
- MySQL 상태
- 웹서버 응답
- 리소스 사용량

### logs.sh
로그 확인 (대화형)
- MySQL 로그
- Nginx 로그
- 실시간 로그

### deploy.sh
프로덕션 배포
- 웹 파일 배포
- Nginx 설정
- SSL 인증서 설정
- MySQL 시작

## 워크플로우

### 매일 아침
```bash
./start.sh && ./health.sh
```

### 코드 업데이트
```bash
# 로컬에서 개발 후
git push

# 서버에서
./update.sh
```

### 문제 발생 시
```bash
./health.sh   # 상태 확인
./logs.sh     # 로그 확인
./restart.sh  # 재시작
```

### 퇴근 시
```bash
./stop.sh
```

## 주의사항
1. 모든 .md 파일은 .gitignore에 포함됨
2. 현재는 프론트엔드만 구현됨
3. 백엔드 API는 추후 구현 예정
4. MySQL 포트 3307 사용 (기존 3306 충돌 방지)

## 문제 해결

### 권한 오류
```bash
chmod +x *.sh
```

### Git pull 실패
```bash
# SSH 키 확인
ssh -T git@github.com
```

### MySQL 접속 안됨
```bash
./logs.sh    # 옵션 1 선택
./restart.sh
```

### Nginx 오류
```bash
sudo nginx -t
sudo systemctl status nginx
```

## 추가 정보
- README-DEPLOYMENT.txt: 상세 배포 가이드
- PROJECT-SUMMARY.txt: 프로젝트 전체 요약
- GitHub사용가이드.md: Git/GitHub 사용법

## 라이선스
Educational Project - Database Assignment #2
