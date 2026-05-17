# NestJS + Oracle/Tibero Starter Kit

엔터프라이즈급 백엔드 API 서버를 빠르게 개발하기 위한 NestJS 스타터 킷입니다.

## 📦 기술 스택

- **Runtime**: Node.js 20+
- **Framework**: NestJS 10
- **Language**: TypeScript 5.2
- **Database**: Oracle Database / Tibero
- **Testing**: Jest
- **Linting**: ESLint + Prettier
- **Logging**: Winston
- **Validation**: class-validator + class-transformer

## ✨ 주요 기능

### 아키텍처
- **레이어드 아키텍처**: Controller → Service → Repository → Database
- **의존성 주입 (DI)**: NestJS 내장 DI 컨테이너
- **DTO 패턴**: 입출력 데이터 검증 및 변환
- **리포지토리 패턴**: 데이터베이스 접근 계층 분리

### 데이터베이스
- **Connection Pool**: node-oracledb 기반 최적화된 커넥션 풀
- **예제 Entity**: User 모듈 포함
- **트랜잭션 관리**: 자동 커밋 설정 및 수동 트랜잭션 지원
- **초기화 스크립트**: SQL 초기화 스크립트 제공

### 에러 처리 및 로깅
- **글로벌 Exception Filter**: 통일된 에러 응답 포맷
- **Winston Logging**: 파일 및 콘솔 로깅
- **Logging Interceptor**: HTTP 요청/응답 로깅
- **상세한 에러 메시지**: 비즈니스 로직 에러 추적

### 유효성 검증
- **DTO Validation**: class-validator를 이용한 자동 검증
- **Custom Validators**: 비즈니스 로직 검증 가능
- **타입 안정성**: TypeScript strict mode 활성화

### 테스트
- **Unit Testing**: Jest 기반 단위 테스트
- **Mock 패턴**: 의존성 모킹 지원
- **Coverage 리포트**: 테스트 커버리지 측정

## 🚀 빠른 시작

### 1. 프로젝트 복제 및 의존성 설치

```bash
git clone <repository-url>
cd nestjs-oracle-starter
npm install
```

### 2. 환경 변수 설정

`.env.example`을 참고하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:
```env
NODE_ENV=development
APP_PORT=3000
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=1521
DB_SERVICE_NAME=ORCL
```

### 3. 데이터베이스 설정

Docker Compose를 이용한 Oracle XE 실행:

```bash
docker-compose up -d
```

또는 기존 Oracle/Tibero 데이터베이스 사용 시:

1. 데이터베이스 접속
2. `init-db.sql` 실행하여 테이블 생성

### 4. 애플리케이션 실행

```bash
# 개발 모드 (핫 리로드)
npm run start:dev

# 프로덕션 모드
npm run build
npm run start:prod
```

## 📚 API 엔드포인트

### Health Check
```
GET /health
```

응답:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-17T10:00:00.000Z",
  "database": "connected"
}
```

### 사용자 API

#### 사용자 생성
```
POST /users
Content-Type: application/json

{
  "name": "김철수",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

응답:
```json
{
  "id": 1,
  "name": "김철수",
  "email": "user@example.com",
  "createdAt": "2026-05-17T10:00:00.000Z",
  "updatedAt": "2026-05-17T10:00:00.000Z"
}
```

#### 사용자 목록 조회
```
GET /users?page=1&limit=10
```

응답:
```json
{
  "data": [
    {
      "id": 1,
      "name": "김철수",
      "email": "user@example.com",
      "createdAt": "2026-05-17T10:00:00.000Z",
      "updatedAt": "2026-05-17T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### 사용자 조회
```
GET /users/{id}
```

#### 사용자 삭제
```
DELETE /users/{id}
```

## 🏗️ 프로젝트 구조

```
src/
├── main.ts                 # 애플리케이션 진입점
├── app.module.ts           # 루트 모듈
├── common/
│   ├── dto/               # 공통 DTO (페이지네이션 등)
│   ├── filters/           # 글로벌 예외 필터
│   ├── interceptors/      # 로깅 인터셉터
│   └── logger/            # Winston 로거
├── database/
│   ├── database.module.ts
│   └── database.service.ts # Oracle 연결 풀 관리
└── modules/
    ├── health/            # Health Check 모듈
    └── user/              # 사용자 관리 모듈
        ├── user.module.ts
        ├── user.controller.ts
        ├── user.service.ts
        ├── user.repository.ts
        └── dto/
```

## 🧪 테스트

```bash
# 단위 테스트 실행
npm run test

# Watch 모드 (파일 변경 시 자동 재실행)
npm run test:watch

# 커버리지 리포트
npm run test:cov
```

## 📝 코드 스타일

```bash
# ESLint 검사 및 자동 수정
npm run lint

# Prettier 포맷팅
npm run format
```

## 🐳 Docker 빌드 및 배포

### 이미지 빌드
```bash
docker build -t nestjs-oracle-app:latest .
```

### 컨테이너 실행
```bash
docker run -p 3000:3000 \
  -e DB_USER=user \
  -e DB_PASSWORD=password \
  -e DB_HOST=localhost \
  -e DB_PORT=1521 \
  -e DB_SERVICE_NAME=ORCL \
  nestjs-oracle-app:latest
```

## 🔒 보안 모범 사례

### 환경 변수 관리
- 절대로 `.env` 파일을 Git에 커밋하지 않음
- `.env.example`에는 예제 값만 포함
- 프로덕션 환경에서는 환경 변수로 설정 주입

### 데이터베이스 보안
- Prepared Statement (Bind Variable) 사용으로 SQL Injection 방지
- 최소 권한 원칙 (Principle of Least Privilege) 적용
- Connection Pool 타임아웃 설정으로 리소스 낭비 방지

### API 보안
- 입력 값 검증 (class-validator)
- HTTPS 사용 (프로덕션)
- CORS 설정 (필요시)
- 레이트 리미팅 (필요시)

## 📊 성능 최적화

### Database
- **Connection Pool**: 최적 크기 설정 (min=10, max=50)
- **Prepared Statement Caching**: 자동 활성화
- **인덱싱**: 자주 조회하는 컬럼에 인덱스 생성
- **SQL 튜닝**: EXPLAIN PLAN 분석

### Application
- **Logging 레벨**: 프로덕션에서 info 이상으로 설정
- **메모리 누수**: 연결 종료 시 리소스 정리
- **의존성 최소화**: 필요한 모듈만 import

## 🚨 트러블슈팅

### Oracle 연결 실패
```
Error: ORA-12514: TNS:listener does not currently know of service requested in connect descriptor
```

**해결 방법:**
- DB_SERVICE_NAME이 올바른지 확인
- Oracle/Tibero 서버 상태 확인
- Connection Pool 설정 검토

### Connection Pool 고갈
```
Error: Connection pool queue limit exceeded
```

**해결 방법:**
- DATABASE_POOL_MAX 값 증가
- 불필요한 장시간 연결 종료
- 쿼리 최적화

## 📖 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com)
- [node-oracledb 문서](https://github.com/oracle/node-oracledb)
- [Oracle Database 성능 튜닝](https://docs.oracle.com/cd/B19306_01/server.102/b14211/intro.htm)
- [TypeScript strict mode](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## 📄 라이센스

MIT

## ✍️ 기여 가이드

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**작성일**: 2026-05-17
**최신 업데이트**: 2026-05-17
