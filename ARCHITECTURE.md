# ARCHITECTURE.md
> 마지막 업데이트: 2026-03-15

## 한 줄 요약

**SolveIt** — 사용자가 일상 불편함을 제출하면 AI가 자동 분류·병합하여 이슈로 관리하고, 개발팀이 실제 솔루션을 만들어 제공하는 플랫폼.

## 디렉토리 맵

```
solveit/
├── ARCHITECTURE.md          ← 📍 지금 여기
├── .env.local               ← 환경변수 (git 제외)
├── src/
│   ├── app/
│   │   ├── layout.tsx       ← 루트 레이아웃 (다크 테마, nav)
│   │   ├── page.tsx         ← 랜딩 페이지
│   │   ├── globals.css
│   │   ├── submit/
│   │   │   └── page.tsx     ← 불편 접수 폼
│   │   ├── board/
│   │   │   ├── page.tsx     ← 이슈 보드 (카테고리 필터, 정렬, 투표)
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── detail.tsx ← 이슈 상세 (원본 접수 + 솔루션)
│   │   ├── solved/
│   │   │   └── page.tsx     ← 솔루션 목록 (타입별 필터)
│   │   └── api/
│   │       ├── submit/route.ts    ← POST: 접수 / GET: 목록
│   │       ├── classify/route.ts  ← POST: AI 분류 (Claude API)
│   │       ├── issues/
│   │       │   ├── route.ts       ← GET: 이슈 목록
│   │       │   └── [id]/route.ts  ← GET: 이슈 상세 + 연결 접수/솔루션
│   │       ├── solutions/
│   │       │   ├── route.ts       ← GET: 솔루션 목록
│   │       │   └── [slug]/route.ts← GET: 솔루션 상세
│   │       ├── vote/route.ts      ← GET/POST: 투표
│   │       └── my-submissions/route.ts
│   ├── components/ui/      ← shadcn/ui 컴포넌트
│   └── lib/
│       ├── csrf.ts          ← CSRF 방어
│       ├── supabase.ts      ← Supabase 클라이언트 (레거시, 미사용)
│       ├── rate-limit.ts
│       ├── validate.ts
│       └── utils.ts
```

## 핵심 데이터 흐름

```
[Submit 폼] ──POST──→ /api/submit ──INSERT──→ submissions
                         │
                         └──fire & forget──→ /api/classify
                                                │
                                  ┌─────────────┼─────────────┐
                                  │ Claude API로 분류          │
                                  │ (category, tags, title)    │
                                  ├─────────────┼─────────────┤
                                  │ 기존 이슈 유사도 검색      │
                                  │ score ≥ 0.8 → 병합        │
                                  │ score < 0.8 → 새 이슈 생성 │
                                  └─────────────┼─────────────┘
                                                │
                                    submission_issues 매핑
                                    submission.ai_processed = true

[Board 페이지] ←──GET── /api/issues ←── issues 테이블
[Issue 상세]   ←──GET── /api/issues/[id] ←── issues + submissions + solutions
[Solved 페이지]←──GET── /api/solutions ←── solutions 테이블
```

## DB 스키마 (v2 — 이슈 + 솔루션 확장)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  submissions  │     │ submission_issues │     │    issues     │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (PK)      │◀────│ submission_id(FK) │     │ id (PK)      │
│ text         │     │ issue_id (FK)     │────▶│ slug (UNIQUE)│
│ email        │     │ similarity_score  │     │ title        │
│ status       │     │ created_at        │     │ description  │
│ votes        │     └──────────────────┘     │ category     │
│ ip_hash      │                               │ subcategory  │
│ ai_category  │     ┌──────────────────┐     │ tags[]       │
│ ai_tags[]    │     │  issue_solutions  │     │ status       │
│ ai_processed │     ├──────────────────┤     │ vote_count   │
│ created_at   │     │ issue_id (FK)     │────▶│ submission_  │
│ updated_at   │     │ solution_id (FK)  │     │   count      │
└──────────────┘     └──────────────────┘     │ urgency      │
                               │               │ ai_summary   │
                     ┌─────────┘               │ ai_confidence│
                     ▼                         │ merged_into  │
              ┌──────────────┐                │ created_at   │
              │  solutions    │                │ updated_at   │
              ├──────────────┤                └──────────────┘
              │ id (PK)      │
              │ slug (UNIQUE)│     ┌──────────────────┐
              │ title        │     │      votes        │
              │ description  │     ├──────────────────┤
              │ type         │     │ id (PK)          │
              │ status       │     │ submission_id(FK)│
              │ config (JSON)│     │ ip_hash          │
              │ content      │     │ created_at       │
              │ metrics(JSON)│     └──────────────────┘
              │ category     │
              │ tags[]       │
              │ created_at   │
              │ updated_at   │
              └──────────────┘
```

**테이블 관계**:
- submissions ↔ issues: N:M (via submission_issues)
- issues ↔ solutions: N:M (via issue_solutions)
- submissions ← votes: 1:N

## API 엔드포인트

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `POST` | `/api/submit` | 새 불편 접수 (→ 자동 분류 트리거) | Turnstile + CSRF |
| `GET` | `/api/submit` | 접수 목록 (레거시) | 없음 |
| `POST` | `/api/classify` | AI 분류 (submission → issue 매핑) | 서버 내부 |
| `GET` | `/api/issues` | 이슈 목록 (필터: category, status, sort) | 없음 |
| `GET` | `/api/issues/[id]` | 이슈 상세 + 연결 접수/솔루션 | 없음 |
| `GET` | `/api/solutions` | 솔루션 목록 (필터: type, category) | 없음 |
| `GET` | `/api/solutions/[slug]` | 솔루션 상세 | 없음 |
| `GET/POST` | `/api/vote` | 투표 조회/토글 | IP 기반 |

## 기술 스택

| 카테고리 | 기술 |
|---------|------|
| Framework | Next.js 16 (App Router, Edge Runtime) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui (base-ui) |
| Database | Supabase (PostgreSQL + RLS) |
| AI | Claude API (분류/요약) |
| Deployment | Cloudflare Pages (via next-on-pages + wrangler) |
| CAPTCHA | Cloudflare Turnstile |

## 환경변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (서버) | Yes |
| `ANTHROPIC_API_KEY` | Claude API key (AI 분류) | No (없으면 기본 분류) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile 사이트 키 | Yes |
| `TURNSTILE_SECRET_KEY` | Turnstile 시크릿 키 | Yes |

## 배포

```bash
cd /Users/max/Desktop/agent/side-projects/solveit
npm run build
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static --project-name solveit --commit-dirty=true
```

## 제약사항
- **Edge Runtime 전용**: 모든 API route에 `export const runtime = "edge"` 필수
- **Supabase SDK 미사용**: 직접 `fetch`로 REST API 호출
- **RLS**: 읽기 정책만 공개, 쓰기는 service role key로
