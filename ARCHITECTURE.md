# ARCHITECTURE.md
> 마지막 업데이트: 2026-03-15

## 한 줄 요약

**SolveIt** — 사용자가 일상 불편함을 제출하면 AI가 분류하고, 개발팀이 실제 솔루션을 만들어 제공하는 플랫폼.

## 디렉토리 맵

```
solveit/
├── ARCHITECTURE.md          ← 📍 지금 여기 (에이전트 첫 진입점)
├── AGENTS.md                ← 에이전트 작업 규칙
├── CHANGELOG.md             ← 변경 이력
├── README.md                ← 프로젝트 소개 + 셋업 가이드
├── docs/
│   ├── setup.md             ← 로컬 개발 환경 셋업
│   ├── supabase.md          ← Supabase 설정 + 스키마 + RLS
│   ├── deployment.md        ← Vercel 배포 가이드
│   └── api-reference.md     ← API 엔드포인트 상세
├── data/
│   └── submissions.json     ← 로컬 JSON 파일 DB (fallback)
├── public/                  ← 정적 자산 (SVG 아이콘 등)
├── src/
│   ├── app/
│   │   ├── layout.tsx       ← 루트 레이아웃 (다크 테마, nav)
│   │   ├── page.tsx         ← 랜딩 페이지 (히어로 + CTA)
│   │   ├── globals.css      ← 글로벌 스타일 (Tailwind)
│   │   ├── favicon.ico
│   │   ├── submit/
│   │   │   └── page.tsx     ← 불편 접수 폼 (클라이언트 컴포넌트)
│   │   ├── board/
│   │   │   └── page.tsx     ← 문제 보드 (투표 + 목록)
│   │   ├── solved/
│   │   │   └── page.tsx     ← 해결된 문제 (Coming Soon)
│   │   └── api/
│   │       └── submit/
│   │           └── route.ts ← POST: 접수 / GET: 목록 조회
│   ├── components/
│   │   └── ui/              ← shadcn/ui 컴포넌트
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── textarea.tsx
│   └── lib/
│       ├── supabase.ts      ← Supabase 클라이언트 (서버/브라우저)
│       ├── csrf.ts          ← CSRF 방어 (Origin 검증)
│       ├── rate-limit.ts    ← 인메모리 rate limiter (IP 기반)
│       ├── validate.ts      ← 입력 검증 + XSS 새니타이징
│       └── utils.ts         ← 유틸리티 (cn 함수 등)
├── supabase/
│   ├── config.toml          ← Supabase 로컬 설정
│   └── migrations/
│       └── 20260315_init.sql← 초기 스키마 마이그레이션
├── tests/
│   ├── setup.ts             ← 테스트 환경 설정
│   ├── fixtures/
│   │   └── submissions.ts   ← 테스트 데이터 fixtures
│   └── unit/
│       ├── csrf.test.ts
│       ├── rate-limit.test.ts
│       └── validate.test.ts
├── .env.local               ← 환경변수 (git 제외)
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── next.config.ts
```

## 데이터 흐름

```
유저 접수                API                    DB                    보드
───────────────────────────────────────────────────────────────────────────
[Submit 폼]  ──POST──→ /api/submit           ┌─ Supabase (원격)
   │                    ├─ CSRF 검증           │   submissions table
   │                    ├─ Rate Limit 체크     │   votes table
   │                    ├─ Input 검증/새니타이징│   projects table
   │                    └─ INSERT ──────────→ ─┤
   │                                           └─ JSON 파일 (fallback)
   │
[Board 페이지] ←──GET── /api/submit           
   │                    └─ SELECT ──────────→  DB에서 조회
   ├─ 투표 기능 (TODO)
   └─ 카테고리 필터 (TODO)
```

**Supabase 전환 전략**: 환경변수(`NEXT_PUBLIC_SUPABASE_URL`)가 있으면 Supabase, 없으면 JSON 파일로 fallback.

## 기술 스택

| 카테고리 | 기술 | 버전 |
|---------|------|------|
| Framework | Next.js (App Router) | 16.1.6 |
| Runtime | React | 19.2.3 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| UI Components | shadcn/ui (base-ui) | @base-ui/react ^1.3.0 |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js (준비) |
| Database (fallback) | JSON 파일 | — |
| Testing | Vitest + Testing Library | vitest ^4.1.0 |
| Deployment | Vercel | (준비) |

## 환경변수

| 변수 | 설명 | 필수 | 어디서 |
|------|------|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | No (없으면 JSON fallback) | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 anon 키 | No | `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (서버 전용) | No | `.env.local` |
| `ANTHROPIC_API_KEY` | Claude API 키 (AI 분류용, TODO) | No | `.env.local` |

## DB 스키마

> 상세: [docs/supabase.md](docs/supabase.md)

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────┐
│    projects       │       │  submission_projects  │       │  submissions  │
├──────────────────┤       ├──────────────────────┤       ├──────────────┤
│ id (PK, UUID)    │◀──┐   │ submission_id (FK)    │──────▶│ id (PK, UUID)│
│ title            │   └───│ project_id (FK)       │       │ text         │
│ description      │       │ (composite PK)        │       │ email        │
│ status           │       └──────────────────────┘       │ category     │
│ demo_url         │                                       │ tags[]       │
│ repo_url         │       ┌──────────────────────┐       │ size         │
│ created_at       │       │       votes           │       │ status       │
│ updated_at       │       ├──────────────────────┤       │ votes        │
└──────────────────┘       │ id (PK, UUID)        │       │ ai_analysis  │
                           │ submission_id (FK)    │──────▶│ ip_hash      │
                           │ ip_hash              │       │ created_at   │
                           │ created_at           │       │ updated_at   │
                           │ UNIQUE(sub_id,ip)    │       └──────────────┘
                           └──────────────────────┘
```

**관계**: submissions ←N:M→ projects (via submission_projects), submissions ←1:N→ votes

## API 엔드포인트

> 상세: [docs/api-reference.md](docs/api-reference.md)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/api/submit` | 새 불편 접수 | 없음 (rate limit + CSRF) |
| `GET` | `/api/submit` | 접수 목록 조회 (email 제외) | 없음 |

## 배포 구조

```
[개발] localhost:3000 (npm run dev)
   ↓ git push
[빌드] Vercel CI (npm run build)
   ↓ 자동 배포
[프로덕션] solveit.vercel.app
   ↓ API calls
[DB] Supabase (PostgreSQL + RLS)
```

- **Preview**: PR마다 Vercel 프리뷰 배포
- **Production**: main 브랜치 자동 배포
- **DB**: Supabase 원격 프로젝트 (max가 생성 예정)
