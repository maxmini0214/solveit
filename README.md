# SolveIt

> Tell us what bugs you. We'll build a fix.

사용자가 일상의 불편함을 제출하면, AI가 분류/우선순위를 매기고, 실제 솔루션을 만들어 제공하는 플랫폼.

## Features

- 💬 **불편 접수** — 로그인 없이 자유롭게 문제 제출 (한국어/영어)
- 🤖 **AI 분류** — 자동 카테고리 분류 + 크기 추정 (TODO)
- 📊 **Problem Board** — 투표로 우선순위 결정
- 🛠️ **솔루션 추적** — 문제 → 프로젝트 → 해결 파이프라인

## Quick Start

```bash
# 의존성 설치
npm install

# 개발 서버 (http://localhost:3000)
npm run dev

# 테스트
npm test

# 빌드
npm run build
```

## 환경변수

`.env.example`을 `.env.local`로 복사:

```bash
cp .env.example .env.local
```

Supabase 변수 없이도 동작합니다 (JSON 파일 fallback).

상세: [docs/setup.md](docs/setup.md)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Database**: Supabase (PostgreSQL) / JSON fallback
- **Testing**: Vitest + Testing Library
- **Deployment**: Vercel

## 문서

| 문서 | 설명 |
|------|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | 기술 아키텍처 전체 지도 |
| [AGENTS.md](AGENTS.md) | 에이전트/개발자 작업 규칙 |
| [CHANGELOG.md](CHANGELOG.md) | 변경 이력 |
| [docs/setup.md](docs/setup.md) | 로컬 셋업 가이드 |
| [docs/supabase.md](docs/supabase.md) | Supabase 설정 + 스키마 |
| [docs/deployment.md](docs/deployment.md) | Vercel 배포 가이드 |
| [docs/api-reference.md](docs/api-reference.md) | API 상세 문서 |

## License

Private
