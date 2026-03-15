# CHANGELOG
> 에이전트 작업 완료 시 반드시 한 줄 추가

## 2026-03-15
- [agent] 문서 아키텍처 구축: ARCHITECTURE.md, AGENTS.md, CHANGELOG.md, docs/ 생성
- [agent] Supabase 로컬 설정: `supabase init` + 초기 마이그레이션 스키마 + RLS 정책
- [agent] Supabase 클라이언트 코드: `src/lib/supabase.ts` (환경변수 없으면 JSON fallback)
- [agent] API route Supabase 전환: `/api/submit` POST/GET에 조건부 Supabase/JSON 분기
- [agent] Board 페이지 Supabase 전환: mock 데이터 → API fetch (SSR)
- [agent] README.md 전면 업데이트: 프로젝트 소개 + 셋업 가이드
- [agent] Vercel 배포 준비: vercel.json, .env.example 생성
