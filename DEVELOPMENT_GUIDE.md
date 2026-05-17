# 개발 가이드

## 🎯 새로운 기능 추가하기

### Step 1: Module 생성

```bash
mkdir -p src/modules/products
```

### Step 2: 폴더 구조

```
src/modules/products/
├── dto/
│   ├── create-product.dto.ts
│   └── product.dto.ts
├── product.module.ts
├── product.controller.ts
├── product.service.ts
└── product.repository.ts
```

### Step 3: DTO 작성

```typescript
// create-product.dto.ts
import { IsString, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  description!: string;
}
```

```typescript
// product.dto.ts
export class ProductDto {
  id!: number;
  name!: string;
  price!: number;
  description!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
```

### Step 4: Repository 작성

```typescript
// product.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Logger } from '../../common/logger/logger';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductRepository {
  private logger = new Logger('ProductRepository');

  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDto> {
    const connection = await this.databaseService.getConnection();

    try {
      const now = new Date();
      const result = await connection.execute(
        `INSERT INTO PRODUCTS (NAME, PRICE, DESCRIPTION, CREATED_AT, UPDATED_AT)
         VALUES (:name, :price, :description, :createdAt, :updatedAt)
         RETURNING ID INTO :id`,
        {
          name: createProductDto.name,
          price: createProductDto.price,
          description: createProductDto.description,
          createdAt: now,
          updatedAt: now,
          id: { type: 'NUMBER', dir: 3 },
        },
        { autoCommit: true },
      );

      this.logger.info(
        `상품 생성 완료: ${createProductDto.name}`
      );

      return {
        id: result.outBinds.id[0],
        ...createProductDto,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      this.logger.error(`상품 생성 실패`, error);
      throw error;
    } finally {
      await connection.close();
    }
  }

  async findAll(): Promise<ProductDto[]> {
    const connection = await this.databaseService.getConnection();

    try {
      const result = await connection.execute(
        `SELECT ID, NAME, PRICE, DESCRIPTION, CREATED_AT, UPDATED_AT
         FROM PRODUCTS
         ORDER BY CREATED_AT DESC`,
      );

      return (result.rows || []).map((row) => ({
        id: row[0],
        name: row[1],
        price: row[2],
        description: row[3],
        createdAt: row[4],
        updatedAt: row[5],
      }));
    } catch (error) {
      this.logger.error('상품 목록 조회 실패', error);
      throw error;
    } finally {
      await connection.close();
    }
  }
}
```

### Step 5: Service 작성

```typescript
// product.service.ts
import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { Logger } from '../../common/logger/logger';

@Injectable()
export class ProductService {
  private logger = new Logger('ProductService');

  constructor(private readonly productRepository: ProductRepository) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDto> {
    this.logger.info(`상품 생성 시작: ${createProductDto.name}`);
    return this.productRepository.create(createProductDto);
  }

  async findAll(): Promise<ProductDto[]> {
    this.logger.info('상품 목록 조회');
    return this.productRepository.findAll();
  }
}
```

### Step 6: Controller 작성

```typescript
// product.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductDto> {
    return this.productService.create(createProductDto);
  }

  @Get()
  async findAll(): Promise<ProductDto[]> {
    return this.productService.findAll();
  }
}
```

### Step 7: Module 작성

```typescript
// product.module.ts
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
```

### Step 8: App Module에 등록

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { ProductModule } from './modules/products/product.module'; // 추가

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
    UserModule,
    ProductModule, // 추가
  ],
})
export class AppModule {}
```

## 🗄️ 데이터베이스 마이그레이션

### 테이블 생성

```sql
CREATE TABLE PRODUCTS (
  ID NUMBER PRIMARY KEY,
  NAME VARCHAR2(100) NOT NULL,
  PRICE NUMBER(10, 2) NOT NULL,
  DESCRIPTION CLOB,
  CREATED_AT DATE NOT NULL DEFAULT SYSDATE,
  UPDATED_AT DATE NOT NULL DEFAULT SYSDATE
);

-- 시퀀스 생성
CREATE SEQUENCE PRODUCTS_SEQ
  START WITH 1
  INCREMENT BY 1
  NOCACHE;

-- 트리거 생성
CREATE OR REPLACE TRIGGER PRODUCTS_BIR
BEFORE INSERT ON PRODUCTS
FOR EACH ROW
BEGIN
  IF :NEW.ID IS NULL THEN
    SELECT PRODUCTS_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
  END IF;
END;
/

-- 인덱스 생성
CREATE INDEX IDX_PRODUCTS_NAME ON PRODUCTS(NAME);
CREATE INDEX IDX_PRODUCTS_CREATED_AT ON PRODUCTS(CREATED_AT DESC);
```

## 🧪 단위 테스트 작성

### Service 테스트

```typescript
// product.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;

  const mockProductRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);
  });

  describe('create', () => {
    it('상품을 생성할 수 있어야 함', async () => {
      const createProductDto: CreateProductDto = {
        name: '테스트 상품',
        price: 10000,
        description: '설명',
      };

      const expectedResult = {
        id: 1,
        ...createProductDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductRepository.create.mockResolvedValue(expectedResult);

      const result = await service.create(createProductDto);

      expect(result).toEqual(expectedResult);
      expect(mockProductRepository.create).toHaveBeenCalledWith(
        createProductDto
      );
    });
  });

  describe('findAll', () => {
    it('모든 상품을 반환해야 함', async () => {
      const products = [
        {
          id: 1,
          name: '상품1',
          price: 10000,
          description: '설명1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProductRepository.findAll.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
      expect(mockProductRepository.findAll).toHaveBeenCalled();
    });
  });
});
```

## 🔍 디버깅

### 로깅 확인

```bash
# 애플리케이션 로그 확인
tail -f logs/combined.log

# 에러 로그만 확인
tail -f logs/error.log
```

### SQL 쿼리 디버깅

```typescript
// 로깅 인터셉터 추가
this.logger.debug(`SQL 실행: ${query}`, { bindings });

// 또는 node-oracledb 디버깅
process.env.DEBUG = 'oracledb:*';
```

### 데이터베이스 연결 테스트

```bash
# Database Health Check
curl http://localhost:3000/health
```

응답:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-17T10:00:00.000Z",
  "database": "connected"
}
```

## 📊 성능 최적화

### 1. 쿼리 최적화

#### 나쁜 예제
```typescript
// N+1 쿼리 문제
const users = await this.userRepository.findAll();
for (const user of users) {
  const orders = await this.orderRepository.findByUserId(user.id); // 반복 호출
}
```

#### 좋은 예제
```typescript
// JOIN으로 한 번에 조회
const result = await connection.execute(
  `SELECT u.ID, u.NAME, o.ID as ORDER_ID, o.TOTAL
   FROM USERS u
   LEFT JOIN ORDERS o ON u.ID = o.USER_ID
   ORDER BY u.ID`,
);
```

### 2. Connection Pool 모니터링

```typescript
// Pool 상태 확인
const pool = await this.databaseService.getPool();
console.log('활성 연결:', pool.connectionsOpen);
console.log('대기 연결:', pool.connectionsInUse);
```

### 3. 인덱스 최적화

```sql
-- Execution Plan 분석
EXPLAIN PLAN FOR
  SELECT * FROM USERS WHERE EMAIL = 'test@example.com';

SELECT PLAN_TABLE_OUTPUT
FROM TABLE(DBMS_XPLAN.DISPLAY());
```

## 🚀 배포 전 체크리스트

- [ ] 모든 테스트 통과 (`npm test`)
- [ ] ESLint 검사 통과 (`npm run lint`)
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 로깅 레벨 프로덕션 설정 (INFO 이상)
- [ ] 에러 처리 완료
- [ ] 보안 검토 완료
- [ ] 성능 테스트 완료
- [ ] 백업 계획 수립

## 📚 자주 묻는 질문 (FAQ)

### Q: Connection Pool이 고갈되었을 때는?
A: `DATABASE_POOL_MAX` 값을 증가하거나, 쿼리를 최적화하세요.

### Q: 동일한 SQL을 반복 실행할 때 성능을 개선하려면?
A: Prepared Statement를 사용하세요. node-oracledb에서 자동 캐싱됩니다.

### Q: 트랜잭션 롤백 후 재시도는?
A: Service 계층에서 재시도 로직을 구현하세요.

```typescript
async create(dto: CreateUserDto): Promise<UserDto> {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await this.userRepository.create(dto);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      this.logger.warn(`재시도 ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

---

**작성일**: 2026-05-17
