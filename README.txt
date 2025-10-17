# 도서관 관리 시스템 (Library Management System)

## 프로젝트 개요
도서관 관리를 위한 웹 애플리케이션 (프론트엔드)

## 기술 스택
- HTML5, CSS3, JavaScript (Vanilla)
- Docker & Docker Compose
- Nginx
- MySQL 8.0

## 빠른 시작

### 1. 독립 실행 (Docker)
```bash
chmod +x deploy.sh
./deploy.sh
# 또는
docker-compose up -d
```
접속: http://localhost:8080

### 2. 기존 Nginx 통합
```bash
# 1. 파일 복사
sudo mkdir -p /usr/share/nginx/html/library
sudo cp -r public/* /usr/share/nginx/html/library/

# 2. Nginx 설정 추가
sudo nano /etc/nginx/nginx.conf
# nginx-library-config.txt의 내용 추가

# 3. SSL 인증서 발급
sudo certbot certonly --nginx -d library.kontrack.kr

# 4. Nginx 재시작
sudo nginx -t
sudo systemctl reload nginx
```
접속: https://library.kontrack.kr

## 프로젝트 구조
```
release/
├── docker-compose.yml          # Docker 설정
├── nginx.conf                  # Nginx 설정
├── nginx-library-config.txt    # 기존 Nginx용 설정
├── deploy.sh                   # 배포 스크립트
├── .gitignore
├── public/                     # 웹 파일
│   ├── index.html              # 로그인
│   ├── register.html           # 회원가입
│   ├── main.html               # 메인
│   ├── css/
│   └── js/
└── README.txt
```

## 주요 기능
- 로그인/회원가입 (프론트엔드만, 백엔드 미구현)
- 서적 목록 및 검색
- 인기 도서 차트
- 대출/반납 관리
- 관리자 페이지 (서적/카테고리/회원 관리)

## 포트 정보
- 3307: MySQL (library)
- 8080: Nginx (독립 실행 시)
- 80/443: 기존 Nginx 통합 시

## 환경 변수
.env 파일 생성:
```
MYSQL_ROOT_PASSWORD=your_password
```

## 문제 해결

### Docker 관련
```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f

# 재시작
docker-compose restart

# 정지 및 삭제
docker-compose down
```

### Nginx 관련
```bash
# 설정 테스트
sudo nginx -t

# 에러 로그
sudo tail -f /var/log/nginx/error.log

# 재시작
sudo systemctl reload nginx
```

## 추가 문서
- README-DEPLOYMENT.txt: 상세 배포 가이드
- nginx-library-config.txt: Nginx 통합 설정
- GitHub사용가이드.md: Git/GitHub 사용법 (gitignore됨)

## 주의사항
1. 현재는 프론트엔드만 구현됨
2. 백엔드 API는 추후 구현 예정
3. 로그인 기능은 임시로 구현됨 (실제 인증 없음)

## 라이선스
Educational Project

## 작성자
Database Assignment #2

