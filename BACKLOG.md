# SolveIt BACKLOG — 스케일 대비 필수 작업

> 생성일: 2026-03-15
> 우선순위: 🔴 즉시 / 🟡 이번 주 / 🟢 다음 주 / ⚪ 나중

## 🔴 즉시 (구조 잡은 직후)

- [ ] **Rate Limit 영속화** — 현재 Edge 메모리 = 사실상 무효. Cloudflare KV 또는 Supabase로 IP별 카운트 영속 저장. 전 세계 엣지 노드에서 동일하게 적용되어야 함.
- [ ] **DB 마이그레이션 시스템** — 어떤 SQL이 언제 실행됐는지 추적 불가. `migrations/` 디렉토리에 번호별 SQL 파일 관리. 실행 이력 테이블(`schema_migrations`) 추가.

## 🟡 이번 주

- [ ] **AI 분류 비용 통제** — 접수 1건 = Claude API 1콜 = 💸. 대책:
  - 텍스트 유사도 먼저 체크 (embedding 또는 keyword match) → 80%+ 매칭이면 AI 스킵
  - 배치 처리 (5분마다 모아서 1콜)
  - 일일 API 콜 상한 설정
  - 비용 모니터링 대시보드
- [ ] **미디어 업로드 설계** — 유저 스크린샷 첨부. submissions에 `media_urls JSONB` 컬럼 지금 추가해두기. 스토리지: Cloudflare R2 (S3 호환, 무료 10GB) 또는 Supabase Storage.
- [ ] **투표 테이블 스케일링** — 유저 10만 × 이슈 5천 = 최대 5억 행. 대책:
  - 오래된 투표 아카이브 (90일+)
  - vote_count는 issues 테이블에 캐시 (매번 COUNT 안 함)
  - 파티셔닝 또는 시계열 압축 검토

## 🟢 다음 주

- [ ] **모니터링/에러 추적** — API 에러, 응답 시간 감지. 후보: Sentry (무료 5K events/월), Cloudflare Analytics, LogFlare
- [ ] **SEO 구조** — /solved/ 페이지 구글 노출 필수 (유입 경로):
  - sitemap.xml 자동 생성 (솔루션 추가될 때마다)
  - 각 솔루션 페이지 meta tags + OG image
  - robots.txt
  - Google Search Console 등록
- [ ] **검색 고도화** — ILIKE → Supabase Full-text Search (GIN index + to_tsvector). 10만 건+ 대비.
- [ ] **환경 분리** — staging 브랜치 + Cloudflare Pages preview URL로 테스트 후 프로덕션 배포

## ⚪ 유저 성장 후

- [ ] **알림 시스템** — 접수한 불편함 해결 시 이메일 알림. SendGrid/Resend 무료 티어.
- [ ] **i18n (다국어)** — 한/영 지원. next-intl 또는 자체 dict 시스템. 모든 문자열 분리.
- [ ] **API 버저닝** — `/api/v1/submit` 패턴. 기존 클라이언트 호환성 유지.
- [ ] **대규모 모더레이션** — 자동 필터링 (욕설/스팸/중복), 신고 자동 처리, 커뮤니티 모더레이터
- [ ] **Google 로그인** — 투표/신고에 계정 연동 (접수는 영원히 로그인 불필요)
- [ ] **데이터 백업** — Supabase 자동 백업 + 주간 pg_dump 크론

---

> 이 파일은 스케일 대비 체크리스트. 하나씩 완료하면 [x]로 체크.
> 새 이슈 발견 시 여기에 추가.
