# 훅(Hooks) 설정 가이드

이 프로젝트에는 개발 워크플로우를 자동화하는 5개의 훅이 설정되어 있습니다.

## 📋 활성화된 훅 목록

### PostToolUse 훅 (파일 저장 후 자동 실행)

#### 1️⃣ 자동 포맷팅
**이벤트**: TypeScript 파일 저장 후
**동작**: Prettier + ESLint 자동 실행
**파일**: `Edit|Write` 매처

```bash
# 자동 실행되는 명령어
npx prettier --write <file_path>  # 코드 스타일 정리
npx eslint --fix <file_path>      # ESLint 자동 수정
```

**효과**:
- ✅ 코드 스타일 자동 통일
- ✅ 세미콜론 자동 추가/제거
- ✅ 들여쓰기 자동 정렬
- ✅ ESLint 규칙 자동 수정

**예제**:
```bash
# TypeScript 파일을 수정하면
/users/user.service.ts 저장
    ↓
자동으로 Prettier 실행
    ↓
자동으로 ESLint 실행
    ↓
포맷된 파일 저장 완료
```

---

#### 2️⃣ TypeScript 타입 검사
**이벤트**: TypeScript 파일 수정 후
**동작**: `tsc --noEmit` 자동 실행
**파일**: `Edit` 매처

```bash
# 자동 실행되는 명령어
npx tsc --noEmit <file_path>
```

**효과**:
- ✅ 타입 에러 조기 발견
- ✅ 컴파일 전 오류 확인
- ✅ any 타입 사용 감지

**예제**:
```bash
# TypeScript 파일을 수정하면
/users/user.controller.ts 수정
    ↓
자동으로 타입 검사
    ↓
타입 에러가 있으면 경고 표시
    ↓
컴파일 없이 에러 확인
```

---

### PreToolUse 훅 (파일/명령어 실행 전 보호)

#### 3️⃣ 중요 파일 보호
**이벤트**: 파일 수정 시도 시
**동작**: 보호된 파일이면 수정 차단
**파일**: `Edit|Write` 매처

**보호 대상**:
- `.env` - 환경 변수 파일
- `package-lock.json` - 패키지 락 파일
- `.git/` - Git 내부 폴더

**효과**:
- ✅ `.env` 파일 실수 수정 방지
- ✅ `package-lock.json` 실수 수정 방지
- ✅ `.git` 폴더 손상 방지

**예제**:
```bash
# .env 파일을 수정하려고 하면
Edit .env
    ↓
훅이 감지: "보호된 파일입니다"
    ↓
수정 차단 (exit code 2)
    ↓
사용자에게 경고 메시지
```

**우회 방법** (필요시):
```bash
# 주의: 매우 신중하게 사용
# 1. 수동으로 파일 편집 (텍스트 에디터)
# 2. Git에서 제외 확인
# 3. 변경사항 커밋 전 검토
```

---

#### 4️⃣ 위험한 명령어 차단
**이벤트**: Bash 명령어 실행 시도 시
**동작**: 위험한 명령어면 실행 차단
**파일**: `Bash` 매처

**차단 대상 명령어**:
- `git push --force` - 강제 푸시 (원격 히스토리 손상)
- `rm -rf` - 재귀적 삭제 (데이터 손실)
- `git reset --hard` - 강제 리셋 (변경사항 손실)
- `sudo` - 관리자 권한 (시스템 영향)

**효과**:
- ✅ 실수로 인한 Git 히스토리 손상 방지
- ✅ 파일 실수 삭제 방지
- ✅ 로컬 변경사항 손실 방지
- ✅ 시스템 영향 명령어 차단

**예제**:
```bash
# 위험한 명령어를 실행하려고 하면
git push --force origin main
    ↓
훅이 감지: "위험한 명령어입니다"
    ↓
실행 차단 (exit code 2)
    ↓
사용자에게 경고 메시지
```

**우회 방법** (필요시):
```bash
# 정말 필요한 경우 명령어 약간 변경
# 예: git push --force-with-lease origin main
# 또는: 중요한 작업은 조심스럽게 수동으로 수행
```

---

#### 5️⃣ Bash 명령어 로깅
**이벤트**: 모든 Bash 명령어 실행 시
**동작**: 명령어를 로그 파일에 기록
**파일**: `Bash` 매처

**로그 파일**: `.claude/logs/bash-commands.log`

```bash
# 로그 형식
[2026-05-17 12:30:45] npm install
[2026-05-17 12:31:12] npm run build
[2026-05-17 12:32:00] npm test
```

**효과**:
- ✅ 모든 명령어 실행 기록
- ✅ 타임스탬프 포함
- ✅ 디버깅 및 감시 용이
- ✅ 작업 추적 가능

**로그 확인**:
```bash
# 모든 명령어 확인
cat .claude/logs/bash-commands.log

# npm 명령어만 확인
grep "npm" .claude/logs/bash-commands.log

# 최근 10개 명령어 확인
tail -10 .claude/logs/bash-commands.log
```

---

## 🔧 훅 설정 위치

훅 설정 파일: `.claude/settings.json`

```json
{
  "hooks": {
    "PostToolUse": [...],  // 파일 저장 후 자동 실행
    "PreToolUse": [...]    // 파일/명령어 실행 전 자동 실행
  }
}
```

---

## 📊 훅 작동 흐름도

```
사용자 작업
    ↓
┌─────────────────────────┐
│  파일 Edit/Write        │
└─────────────────────────┘
    ↓
PreToolUse 훅 실행
├─ 중요 파일 보호 체크
└─ 위험한 명령어 체크
    ↓
(통과하면)
    ↓
파일 실제 변경
    ↓
PostToolUse 훅 실행
├─ 자동 포맷팅 (Prettier + ESLint)
├─ 타입 검사 (TypeScript)
└─ 로깅
    ↓
작업 완료
```

---

## ⚙️ 훅 커스터마이징

### 훅 비활성화하기

`.claude/settings.json`에서 해당 훅 제거:

```json
{
  "hooks": {
    "PostToolUse": [
      // 이 부분을 제거하면 자동 포맷팅 비활성화
      // { "matcher": "Edit|Write", "command": "..." }
    ]
  }
}
```

### 새로운 훅 추가하기

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "새로운 명령어",
        "description": "훅 설명"
      }
    ]
  }
}
```

---

## 🐛 트러블슈팅

### Q: 훅이 작동하지 않습니다

**A**: 다음을 확인하세요:
1. `.claude/settings.json` 파일이 존재하는가?
2. JSON 형식이 올바른가? (`jq . .claude/settings.json`으로 검증)
3. Claude Code가 최신 버전인가?
4. 프로젝트 설정으로 저장되었는가? (전역 설정이 아닌)

---

### Q: Prettier/ESLint 명령어를 찾을 수 없습니다

**A**: 의존성을 설치하세요:
```bash
npm install --save-dev prettier eslint
```

---

### Q: 로그 파일이 생성되지 않습니다

**A**: 로그 디렉토리를 수동으로 생성하세요:
```bash
mkdir -p .claude/logs
```

---

### Q: 위험한 명령어를 정말 실행해야 합니다

**A**: 
1. 정말 필요한지 다시 확인하세요
2. 변경사항을 먼저 커밋하세요
3. 백업을 생성하세요
4. 명령어를 약간 변경해보세요 (예: `--force-with-lease`)
5. 정말 필요하면 `.claude/settings.json`에서 훅을 임시로 제거하세요

---

## 📋 일일 체크리스트

```
매일 확인할 것:
□ 자동 포맷팅이 제대로 작동하는가?
□ 중요 파일이 실수로 수정되지 않았는가?
□ 로그 파일이 커지지는 않는가?
  (주기적으로 정리: rm .claude/logs/bash-commands.log)
□ 타입 에러가 조기에 감지되는가?
```

---

## 🎯 모범 사례

### ✅ 좋은 습관
- 파일을 저장하면 자동으로 포맷되니 신경 쓰지 말기
- 의심스러운 명령어는 실행 전에 2번 확인하기
- 로그 파일을 주기적으로 검토하기
- 타입 에러 조기 감지 활용하기

### ❌ 피해야 할 것
- 훅을 자주 비활성화하기 (설계 취약)
- 보호된 파일을 강제로 수정하기
- 위험한 명령어를 무시하고 실행하기
- 로그 파일을 무시하기

---

## 📈 훅 추가 계획

추후에 추가할 수 있는 훅들:

```
□ Database 마이그레이션 자동 검증
□ 테스트 자동 실행 (package.json 수정 시)
□ 의존성 감시 (npm audit)
□ 커밋 메시지 검증
□ 배포 전 체크리스트
□ 성능 측정 자동화
```

---

**마지막 업데이트**: 2026-05-17
