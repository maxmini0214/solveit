# AGENTS.md — 에이전트 작업 규칙
> 마지막 업데이트: 2026-03-15

## 첫 진입점

1. **ARCHITECTURE.md** 먼저 읽어라 — 프로젝트 전체 구조 파악
2. 이 파일로 작업 규칙 확인
3. 코드 수정 시작

## 작업 전 필수 확인

- [ ] `npm test` 통과 확인 (현재 41개 테스트)
- [ ] `npm run build` 성공 확인
- [ ] ARCHITECTURE.md에서 관련 섹션 확인

## 코드 변경 규칙

### 1. 테스트 필수
```bash
npm test        # 변경 전후 반드시 실행
npm run build   # 빌드도 깨지면 안 됨
```
- 기존 테스트 깨뜨리면 **절대** 커밋하지 마
- 새 기능은 **fixture → 테스트 → 구현** 순서

### 2. 문서 업데이트 체크리스트
코드 변경할 때 아래 해당 항목 반드시 같이 업데이트:

| 변경 내용 | 업데이트할 문서 |
|-----------|----------------|
| 파일/폴더 추가 | ARCHITECTURE.md 디렉토리 맵 |
| API 엔드포인트 추가/변경 | ARCHITECTURE.md + docs/api-reference.md |
| DB 스키마 변경 | ARCHITECTURE.md + docs/supabase.md + migration 파일 생성 |
| 환경변수 추가 | ARCHITECTURE.md 환경변수 섹션 + docs/setup.md |
| 의존성 추가 | ARCHITECTURE.md 기술 스택 |
| 배포 설정 변경 | docs/deployment.md |
| 모든 변경 | CHANGELOG.md에 한 줄 추가 |

### 3. 새 기능 개발 프로세스
```
1. tests/fixtures/ 에 fixture 데이터 추가
2. tests/unit/ 에 테스트 작성 → 실패 확인 (TDD)
3. 기능 구현
4. npm test 통과 확인
5. npm run build 확인
6. 문서 업데이트
7. CHANGELOG.md 업데이트
```

### 4. Supabase 관련 코드 규칙
- 환경변수 없으면 **JSON 파일 fallback** 필수
- `src/lib/supabase.ts`의 `getSupabaseClient()` 사용
- RLS 정책 변경 시 `docs/supabase.md` 업데이트
- 새 마이그레이션: `supabase/migrations/YYYYMMDD_설명.sql`

### 5. 컴포넌트 규칙
- UI 컴포넌트는 `src/components/ui/` (shadcn/ui)
- 비즈니스 컴포넌트는 `src/components/` 에 직접
- 서버 컴포넌트 기본, 클라이언트 필요시 `"use client"` 명시

## 금지 사항

- ❌ `.env.local`에 실제 키 값 커밋
- ❌ 테스트 없이 API 변경
- ❌ 문서 업데이트 없이 구조 변경
- ❌ `data/submissions.json` 삭제 (fallback 용도)
- ❌ Supabase 원격 프로젝트 직접 생성/연결 (max 승인 필요)
