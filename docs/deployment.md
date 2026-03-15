# Vercel 배포 가이드
> 마지막 업데이트: 2026-03-15

## 사전 준비

1. [Vercel](https://vercel.com) 계정
2. GitHub 레포 연결
3. Supabase 프로젝트 (선택 — 없으면 JSON fallback)

## 배포 설정

### 환경변수 (Vercel Dashboard → Settings → Environment Variables)

| 변수 | 값 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 |

### vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs"
}
```

## 배포 프로세스

```
git push origin main
→ Vercel 자동 감지
→ npm run build
→ 프로덕션 배포 (solveit.vercel.app)
```

### PR 프리뷰
- PR을 열면 Vercel이 자동으로 프리뷰 URL 생성
- 프리뷰에서 테스트 후 머지

## 주의사항

- `data/submissions.json`은 Vercel에서 읽기 전용 (파일시스템 쓰기 불가)
- **프로덕션에서는 반드시 Supabase 필요** (JSON fallback은 개발용)
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 `NEXT_PUBLIC_` 접두사 붙이지 마

## 빌드 확인

```bash
npm run build   # 로컬에서 먼저 확인
```

빌드 성공 = Vercel 배포 가능.
