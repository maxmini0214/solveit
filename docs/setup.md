# 로컬 개발 환경 셋업 가이드
> 마지막 업데이트: 2026-03-15

## 필수 조건

- Node.js >= 20
- npm >= 10

## 셋업

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 편집 — Supabase 키 입력 (없으면 JSON fallback 사용)

# 3. 개발 서버
npm run dev
# → http://localhost:3000

# 4. 테스트
npm test

# 5. 빌드 확인
npm run build
```

## 환경변수

`.env.example` 참고. Supabase 변수 없이도 동작함 (JSON 파일 fallback).

| 변수 | 필수 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase 서비스 롤 키 (서버 전용) |
| `ANTHROPIC_API_KEY` | No | Claude API (AI 분류, 미구현) |

## Supabase 없이 개발

환경변수를 설정하지 않으면 자동으로 `data/submissions.json` 파일을 DB로 사용합니다.
접수(POST)와 조회(GET) 모두 동작합니다.

## Supabase로 전환

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `supabase/migrations/20260315_init.sql` 실행 (SQL Editor에서)
3. `.env.local`에 키 입력
4. 재시작 — 자동으로 Supabase 사용

상세: [supabase.md](supabase.md)
