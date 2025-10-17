# 도서관 관리 시스템 배포 가이드

## 프로젝트 구조
```
release/
├── docker-compose.yml     # Docker 설정 파일
├── nginx.conf             # 독립 실행용 Nginx 설정
├── nginx-library-config.txt  # 기존 Nginx에 추가할 설정
├── .gitignore
├── public/                # 웹 프론트엔드 파일
│   ├── index.html         # 로그인 페이지
│   ├── register.html      # 회원가입 페이지
│   ├── main.html          # 메인 페이지
│   ├── css/
│   │   ├── common.css
│   │   ├── login.css
│   │   ├── register.css
│   │   └── main.css
│   └── js/
│       ├── login.js
│       ├── register.js
│       └── main.js
└── README-DEPLOYMENT.txt  # 이 파일
```

## 배포 방법

### 방법 1: 기존 Nginx에 통합 (권장)

1. 프론트엔드 파일을 서버에 배치:
   ```bash
   # public 폴더를 적절한 위치에 복사 (예: /usr/share/nginx/html/library)
   sudo mkdir -p /usr/share/nginx/html/library
   sudo cp -r public/* /usr/share/nginx/html/library/
   ```

2. Nginx 설정 추가:
   ```bash
   # nginx-library-config.txt의 내용을 기존 nginx.conf에 추가
   # 또는 별도 설정 파일 생성
   sudo nano /etc/nginx/conf.d/library.conf
   # nginx-library-config.txt의 server 블록들을 복사하여 붙여넣기
   
   # root 경로를 실제 경로로 수정:
   # root /usr/share/nginx/html/library;
   ```

3. Nginx 설정 테스트 및 재시작:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. MySQL 컨테이너만 실행 (필요시):
   ```bash
   docker-compose up -d library-mysql
   ```

### 방법 2: 독립 Docker 실행

1. Docker Compose로 전체 실행:
   ```bash
   docker-compose up -d
   ```

2. 접속:
   - http://localhost:8080 (HTTP)
   - 또는 별도 리버스 프록시 설정

## SSL 인증서 발급

library.kontrack.kr 도메인에 대한 SSL 인증서가 아직 없는 경우:

```bash
# Let's Encrypt 인증서 발급
sudo certbot certonly --nginx -d library.kontrack.kr

# 또는 웹루트 방식
sudo certbot certonly --webroot -w /usr/share/nginx/html/library -d library.kontrack.kr
```

## 포트 사용 현황

현재 사용 중인 포트:
- 3306: MySQL (kontrack)
- 5000: Flask (kontrack)
- 8000: Chat server
- 9000: SER server
- 80, 443: Nginx

도서관 시스템 포트:
- 3307: MySQL (library) - 기존 3306과 충돌 방지
- 8080: Nginx (독립 실행 시) - 또는 기존 Nginx 활용
- 80, 443: 기존 Nginx에 library.kontrack.kr 추가

## 데이터베이스 설정

MySQL 접속 정보:
- Host: localhost
- Port: 3307 (독립 실행 시)
- Database: library
- User: root
- Password: .env 파일의 MYSQL_ROOT_PASSWORD (기본값: library2024)

## 환경 변수

.env 파일 생성 (선택사항):
```
MYSQL_ROOT_PASSWORD=your_secure_password
```

## 접속 주소

- 기존 Nginx 통합 시: https://library.kontrack.kr
- 독립 실행 시: http://localhost:8080

## 문제 해결

1. 포트 충돌:
   ```bash
   # 포트 사용 확인
   sudo netstat -tlnp | grep :8080
   
   # docker-compose.yml에서 포트 변경
   ```

2. Nginx 설정 오류:
   ```bash
   # 설정 테스트
   sudo nginx -t
   
   # 로그 확인
   sudo tail -f /var/log/nginx/error.log
   ```

3. Docker 컨테이너 확인:
   ```bash
   docker-compose ps
   docker-compose logs library-nginx
   docker-compose logs library-mysql
   ```

## 주의사항

1. 현재는 프론트엔드만 구현되어 있습니다.
2. 백엔드 API는 추후 구현 예정입니다.
3. 모든 .md 파일은 .gitignore에 포함되어 있습니다.

