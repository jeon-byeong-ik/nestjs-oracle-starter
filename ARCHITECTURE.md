# 아키텍처 설계 문서

## 📐 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP Client                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express Application                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │         LoggingInterceptor (모든 요청 기록)              ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Controller Layer                         │
│  (HTTP 요청 처리, 파라미터 검증, 응답 형식화)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  (비즈니스 로직, 트랜잭션 관리, 에러 처리)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Repository Layer                            │
│  (데이터베이스 접근, SQL 실행)                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Database Service (Connection Pool)             │
│  (Oracle/Tibero 연결 풀 관리)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             Oracle Database / Tibero                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 데이터 흐름

### 사용자 생성 예제

```
POST /users
  │
  ├─> UserController.create()
  │     ├─> CreateUserDto 검증
  │     └─> UserService.create() 호출
  │
  ├─> UserService.create()
  │     ├─> 로깅 (info)
  │     └─> UserRepository.create() 호출
  │
  ├─> UserRepository.create()
  │     ├─> DatabaseService.getConnection()
  │     ├─> SQL INSERT 실행
  │     ├─> 연결 종료
  │     └─> 결과 반환
  │
  └─> HTTP 200 Created
      └─> JSON 응답
```

## 📦 모듈 구조

### 1. DatabaseModule
데이터베이스 연결 관리

```typescript
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
```

**책임**:
- Connection Pool 생성/관리
- 연결 획득/반환
- 모듈 종료 시 Pool 정리

### 2. HealthModule
헬스 체크 엔드포인트

```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
```

**책임**:
- 애플리케이션 상태 확인
- 데이터베이스 연결 상태 확인

### 3. UserModule
사용자 관리 기능

```typescript
@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
```

**책임**:
- 사용자 CRUD 기능
- 비즈니스 로직 처리
- 데이터베이스 접근

## 🏛️ 레이어별 책임

### Controller Layer
- **책임**: HTTP 요청/응답 처리
- **기능**:
  - HTTP 메서드 매핑
  - 경로 매핑
  - 파라미터 추출
  - DTO 검증 (class-validator)
  - 응답 직렬화

```typescript
@Controller('users')
export class UserController {
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(createUserDto);
  }
}
```

### Service Layer
- **책임**: 비즈니스 로직 처리
- **기능**:
  - 요청 유효성 검사 (비즈니스 규칙)
  - 비즈니스 로직 실행
  - 예외 처리
  - 트랜잭션 관리
  - 로깅

```typescript
@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    this.logger.info(`새 사용자 생성: ${createUserDto.email}`);
    return this.userRepository.create(createUserDto);
  }
}
```

### Repository Layer
- **책임**: 데이터베이스 접근
- **기능**:
  - SQL 실행
  - 연결 관리
  - 데이터 변환 (DB ↔ DTO)
  - 에러 처리

```typescript
@Injectable()
export class UserRepository {
  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const connection = await this.databaseService.getConnection();
    try {
      const result = await connection.execute(
        'INSERT INTO USERS...'
      );
      return mapToUserDto(result);
    } finally {
      await connection.close();
    }
  }
}
```

## 🔐 의존성 주입 (DI) 패턴

```typescript
// UserModule에서:
@Module({
  imports: [DatabaseModule],
  providers: [
    UserService,
    UserRepository,
  ],
})

// UserService는 UserRepository를 주입받음:
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
}

// UserRepository는 DatabaseService를 주입받음:
@Injectable()
export class UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}
}
```

**이점**:
- 느슨한 결합 (Loose Coupling)
- 테스트 시 Mock 객체 사용 용이
- 코드 재사용성 증가
- 의존성 추적 용이

## 🛡️ 에러 처리

### 전역 예외 필터 (Global Exception Filter)

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    // 예외 처리 및 통일된 응답 포맷
  }
}
```

**처리 흐름**:
1. Controller → Service → Repository에서 예외 발생
2. GlobalExceptionFilter가 예외를 캡처
3. 예외 타입에 따라 HTTP 상태 코드 결정
4. 통일된 JSON 응답 반환

### 응답 포맷

```json
{
  "statusCode": 400,
  "message": "사용자를 찾을 수 없습니다",
  "error": "Not Found",
  "timestamp": "2026-05-17T10:00:00.000Z",
  "path": "/users/999"
}
```

## 📝 로깅 전략

### 로그 레벨

- **ERROR**: 예외, 시스템 오류
- **WARN**: 경고, 비정상 상황
- **INFO**: 비즈니스 이벤트 (사용자 생성, 삭제 등)
- **DEBUG**: 개발용 상세 정보

### 로그 위치

```
logs/
├── error.log      # ERROR 레벨 로그만
└── combined.log   # 모든 레벨 로그
```

### 로깅 예제

```typescript
// 중요한 비즈니스 로직
this.logger.info(`사용자 생성: ${email}`);

// 에러 처리
this.logger.error(`연결 실패: ${error.message}`, error);

// 외부 API 호출
this.logger.info(`외부 API 호출: GET ${url}`);
```

## 🗄️ 데이터베이스 설계

### USERS 테이블

```sql
CREATE TABLE USERS (
  ID NUMBER PRIMARY KEY,              -- 사용자 ID (시퀀스)
  NAME VARCHAR2(50) NOT NULL,         -- 사용자명
  EMAIL VARCHAR2(100) NOT NULL UNIQUE,-- 이메일 (유니크)
  PASSWORD VARCHAR2(255) NOT NULL,    -- 해시된 비밀번호
  CREATED_AT DATE NOT NULL,           -- 생성 날짜
  UPDATED_AT DATE NOT NULL            -- 수정 날짜
);
```

### 인덱스 전략

```sql
-- 빈번한 조회: 이메일로 사용자 검색
CREATE INDEX IDX_USERS_EMAIL ON USERS(EMAIL);

-- 정렬 성능: 생성일 기준 내림차순
CREATE INDEX IDX_USERS_CREATED_AT ON USERS(CREATED_AT DESC);
```

### Connection Pool 설정

```typescript
{
  poolMin: 10,           // 최소 연결 수
  poolMax: 50,           // 최대 연결 수
  poolIncrement: 1,      // 증가 단위
  poolTimeout: 60,       // 대기 타임아웃 (초)
  waitTimeout: 60000,    // 연결 대기 시간 (ms)
  queueTimeout: 60000,   // 큐 대기 시간 (ms)
}
```

**성능 고려사항**:
- poolMin: 동시 사용자 수의 20-30% 정도
- poolMax: 동시 사용자 수의 50-70% 정도
- 초과 요청은 큐에서 대기

## ✅ 검증 전략

### DTO 검증 (class-validator)

```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### 비즈니스 로직 검증 (Service Layer)

```typescript
async create(createUserDto: CreateUserDto): Promise<UserDto> {
  // 이메일 중복 확인
  const existingUser = await this.userRepository.findByEmail(
    createUserDto.email
  );
  if (existingUser) {
    throw new ConflictException('이미 존재하는 이메일입니다');
  }

  return this.userRepository.create(createUserDto);
}
```

## 🔄 트랜잭션 관리

### 자동 커밋 (Auto Commit)

```typescript
await connection.execute(
  'INSERT INTO USERS ...',
  { /* 바인드 변수 */ },
  { autoCommit: true }  // 자동 커밋
);
```

### 수동 트랜잭션

```typescript
const connection = await this.databaseService.getConnection();

try {
  await connection.execute(
    'INSERT INTO USERS ...',
    { /* 바인드 변수 */ },
    { autoCommit: false }  // 자동 커밋 비활성화
  );

  await connection.execute(
    'UPDATE ACCOUNTS SET BALANCE = ...',
    { /* 바인드 변수 */ },
    { autoCommit: false }
  );

  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.close();
}
```

## 🧪 테스트 전략

### 단위 테스트 (Unit Test)

- **대상**: Service 계층
- **방식**: Mock Repository 사용
- **목표**: 비즈니스 로직 검증

```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('사용자를 생성할 수 있어야 함', async () => {
    const result = await service.create(createUserDto);
    expect(result.id).toBeDefined();
  });
});
```

### 통합 테스트

- **대상**: Controller → Service → Repository
- **방식**: 실제 또는 테스트 데이터베이스 사용
- **목표**: 엔드투엔드 기능 검증

```typescript
describe('UserController (e2e)', () => {
  it('POST /users는 새 사용자를 생성해야 함', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);

    expect(response.body.id).toBeDefined();
  });
});
```

## 📈 성능 최적화

### 1. 데이터베이스 최적화

- **쿼리 최적화**: EXPLAIN PLAN 분석
- **인덱싱**: 자주 조회하는 컬럼 인덱싱
- **파티셔닝**: 대용량 테이블 분할
- **배치 처리**: BULK INSERT/UPDATE 사용

### 2. 애플리케이션 최적화

- **Caching**: 자주 조회하는 데이터 캐싱
- **Lazy Loading**: 필요한 데이터만 로드
- **Connection Pool 튜닝**: 최적 크기 설정
- **메모리 누수 방지**: 리소스 정리

### 3. 모니터링

- **로그 분석**: 느린 쿼리 식별
- **메트릭 수집**: 응답 시간, 처리량 등
- **알림**: 임계값 초과 시 통보

---

**작성일**: 2026-05-17
