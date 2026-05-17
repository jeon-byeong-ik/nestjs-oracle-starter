# MCP Server 설정 가이드

이 프로젝트에는 개발을 돕는 3개의 MCP Server와 2개의 Built-in 도구가 포함되어 있습니다.

## 🔗 MCP Server란?

MCP(Model Context Protocol)는 Claude가 외부 도구, API, 데이터베이스에 접근할 수 있게 해주는 프로토콜입니다.

---

## 📍 활성화된 MCP Server (프로젝트 스코프)

### 1️⃣ **Context7** - 문서 검색 서버 ⭐ 강력 추천

**타입**: HTTP Server
**용도**: 최신 프레임워크 및 라이브러리 문서 검색
**설정 파일**: `.mcp.json`

#### 사용 예제

```
Context7에서 NestJS의 최신 데코레이터를 검색해줘.
```

```
TypeScript strict mode에 대해 Context7에서 찾아줘.
```

```
Oracle/Tibero 드라이버 node-oracledb의 API 문서를 검색해줘.
```

#### 활용 사례

**🔍 문서 검색**
- NestJS 데코레이터 및 모듈 찾기
- TypeScript 고급 타입 시스템
- Express 미들웨어 API
- Node.js 최신 기능

**💡 코드 예제**
- 특정 기능의 구현 예제 검색
- Best Practice 패턴 조회
- 성능 최적화 가이드

**📚 API 레퍼런스**
- 함수 시그니처 확인
- 파라미터 옵션 조회
- 반환 타입 확인

#### 장점
- ✅ 실시간 문서 접근
- ✅ 정확한 API 정보
- ✅ 최신 버전 지원
- ✅ 빠른 검색

---

### 2️⃣ **Sequential Thinking** - 복잡한 문제 분석

**타입**: Stdio Server (npx)
**용도**: 복잡한 문제를 단계별로 분석
**설정 파일**: `.mcp.json`

#### 사용 예제

```
이 복잡한 알고리즘을 Sequential Thinking으로 분석해줘.
```

```
데이터베이스 아키텍처를 단계별로 설계해줘.
```

```
성능 최적화 전략을 단계별로 제안해줘.
```

#### 활용 사례

**🧠 복잡한 문제 해결**
- 알고리즘 분석
- 아키텍처 설계
- 성능 최적화
- 버그 분석

**📊 단계별 계획**
- 마이그레이션 전략
- 리팩토링 계획
- 성능 개선 로드맵

**🔬 기술 검토**
- 설계 패턴 분석
- 보안 이슈 분석
- 코드 품질 검토

#### 장점
- ✅ 체계적인 분석
- ✅ 단계별 설명
- ✅ 깊이 있는 이해
- ✅ 논리적 구조화

---

### 3️⃣ **Playwright** - 브라우저 자동화

**타입**: Stdio Server (npx)
**용도**: 브라우저 자동화 및 테스트
**설정 파일**: `.mcp.json`

#### 사용 예제

```
Playwright로 API 엔드포인트의 응답을 테스트해줘.
```

```
웹페이지의 성능을 Playwright로 측정해줘.
```

```
구글 홈페이지를 열고 스크린샷을 찍어줘.
```

#### 활용 사례

**🧪 E2E 테스트**
- API 엔드포인트 테스트
- 데이터 흐름 테스트
- 통합 테스트

**📸 웹 스크래핑**
- 웹페이지 정보 추출
- 데이터 수집
- 콘텐츠 모니터링

**⚡ 성능 측정**
- 응답 시간 측정
- 페이지 로드 성능
- 메모리 사용량 분석

#### 장점
- ✅ 브라우저 자동화
- ✅ 정확한 성능 측정
- ✅ E2E 테스트 작성
- ✅ 스크린샷/비디오 캡처

---

## 🛠️ Built-in 도구 (Claude Code 기본 제공)

### 4️⃣ **web-search** - 웹 검색

**타입**: Built-in (Claude Code 기본 제공)
**용도**: 최신 정보 웹 검색

#### 사용 예제

```
Oracle Database 최신 보안 패치를 web-search로 찾아줘.
```

```
NestJS 성능 벤치마크를 검색해줘.
```

#### 활용 사례
- 최신 버그 정보
- CVE 보안 정보
- 성능 벤치마크
- 기술 뉴스

---

### 5️⃣ **Memory** - 프로젝트 메모리

**타입**: Built-in (Claude Code 기본 제공)
**용도**: 프로젝트 컨텍스트 저장 및 관리

#### 사용 예제

```
이 아키텍처 결정을 메모리에 저장해줘.
```

```
팀이 결정한 코딩 스타일을 기록해줘.
```

#### 활용 사례
- 개발 중 중요한 결정 기록
- 팀 지식 공유
- 진행 상황 추적
- 결정 이유 문서화

---

## 📂 MCP Server 설정 파일

**파일**: `.mcp.json`

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp"
    },
    "sequential-thinking": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

---

## 🚀 사용 시작하기

### 1️⃣ MCP Server 상태 확인

Claude Code 실행:
```bash
claude
```

MCP 연결 확인:
```
/mcp
```

### 2️⃣ Context7로 문서 검색

```
Context7에서 NestJS @Controller 데코레이터를 검색해줘.
```

응답:
- NestJS Controller 사용 방법
- 파라미터 옵션
- 사용 예제
- 관련 문서 링크

### 3️⃣ Sequential Thinking으로 복잡한 문제 분석

```
이 데이터베이스 설계를 단계별로 검토해줘.
```

응답:
- Step 1: 현재 설계 분석
- Step 2: 문제점 식별
- Step 3: 개선 방안 제시
- Step 4: 구현 계획

### 4️⃣ Playwright로 자동화 테스트

```
Playwright로 API 헬스체크 엔드포인트를 테스트해줘.
```

응답:
- 테스트 코드 생성
- 성능 측정
- 결과 분석

---

## 💡 MCP Server 선택 가이드

### Context7을 사용해야 할 때
- ✅ 최신 프레임워크 문서 필요
- ✅ API 레퍼런스 확인
- ✅ 코드 예제 찾기
- ✅ 라이브러리 사용법 학습

### Sequential Thinking을 사용해야 할 때
- ✅ 복잡한 문제 분석
- ✅ 아키텍처 설계
- ✅ 성능 최적화 계획
- ✅ 깊이 있는 설명 필요

### Playwright를 사용해야 할 때
- ✅ 자동화 테스트 필요
- ✅ 웹 성능 측정
- ✅ 데이터 수집
- ✅ E2E 테스트

### web-search를 사용해야 할 때
- ✅ 최신 정보 필요
- ✅ 보안 정보 확인
- ✅ 버그 정보 검색
- ✅ 기술 뉴스 확인

### Memory를 사용해야 할 때
- ✅ 중요한 결정 기록
- ✅ 팀 지식 공유
- ✅ 컨텍스트 유지
- ✅ 진행 상황 추적

---

## 🔧 MCP Server 추가/제거

### 새로운 MCP Server 추가

```bash
# HTTP Server 추가
claude mcp add --transport http --scope project <server-name> <url>

# Stdio Server 추가
claude mcp add --transport stdio --scope project <server-name> -- npx <package>
```

### MCP Server 제거

`.mcp.json` 파일에서 해당 서버 제거

---

## 📊 MCP Server 비교표

| 기능 | Context7 | Sequential Thinking | Playwright | web-search | Memory |
|------|----------|-------------------|-----------|------------|--------|
| 문서 검색 | ✅ | ❌ | ❌ | ✅ | ❌ |
| 단계별 분석 | ❌ | ✅ | ❌ | ❌ | ❌ |
| 브라우저 자동화 | ❌ | ❌ | ✅ | ❌ | ❌ |
| 웹 검색 | ❌ | ❌ | ❌ | ✅ | ❌ |
| 메모리 저장 | ❌ | ❌ | ❌ | ❌ | ✅ |
| 실시간 정보 | ✅ | ❌ | ✅ | ✅ | ❌ |
| 오프라인 사용 | ❌ | ✅ | ✅ | ❌ | ✅ |

---

## 🎯 개발 시나리오별 MCP Server 활용

### 시나리오 1: 새 API 엔드포인트 개발

```
1. Context7로 NestJS 데코레이터 문서 검색
2. Sequential Thinking으로 아키텍처 설계
3. Playwright로 테스트 코드 작성
4. Memory에 결정 사항 저장
```

### 시나리오 2: 성능 최적화

```
1. Sequential Thinking으로 병목 지점 분석
2. Context7로 최적화 기법 검색
3. Playwright로 성능 측정
4. web-search로 최신 기법 조사
```

### 시나리오 3: 버그 분석

```
1. Sequential Thinking으로 원인 단계별 분석
2. Context7로 관련 API 문서 검색
3. web-search로 알려진 버그 확인
4. Memory에 해결 방법 저장
```

---

## ⚙️ 문제 해결

### Q: Context7이 연결되지 않습니다

**A**: 
1. 인터넷 연결 확인
2. 방화벽 설정 확인
3. `.mcp.json` URL 확인 (https://mcp.context7.com/mcp)

### Q: Sequential Thinking이 실행되지 않습니다

**A**:
1. Node.js 설치 확인
2. npm 설치 확인
3. `npx` 명령어 실행 가능 확인

### Q: Playwright가 느립니다

**A**:
1. 브라우저 버전 업데이트
2. 네트워크 속도 확인
3. 시스템 리소스 확인

---

## 📚 추가 리소스

- Context7 공식 문서: https://mcp.context7.com/
- Playwright 공식 문서: https://playwright.dev/
- MCP 프로토콜: https://modelcontextprotocol.io/
- 다른 MCP Server: https://smithery.ai/

---

**마지막 업데이트**: 2026-05-17
