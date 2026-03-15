# API Reference
> 마지막 업데이트: 2026-03-15

## POST /api/submit

새로운 불편/문제를 접수합니다.

### Request

```
POST /api/submit
Content-Type: application/json
```

```json
{
  "text": "배달앱에서 리뷰 사진만 모아서 보고 싶은데 왜 안 돼요",
  "email": "user@example.com"   // 선택
}
```

### 보안

| 검증 | 설명 |
|------|------|
| CSRF | Origin/Referer 헤더 검증 (허용 목록) |
| Rate Limit | IP당 5회/분 (인메모리) |
| Input Validation | text 필수, 2000자 이하, HTML 태그 제거 |
| Email Validation | 형식 검증, 320자 이하 (선택 필드) |

### Response

**성공 (200)**
```json
{
  "success": true,
  "id": "uuid-string"
}
```
Headers: `X-RateLimit-Remaining: 4`

**에러**
| Status | Body | 원인 |
|--------|------|------|
| 400 | `{ "error": "Text is required" }` | 입력 검증 실패 |
| 403 | `{ "error": "Forbidden" }` | CSRF 검증 실패 |
| 429 | `{ "error": "Too many requests..." }` | Rate limit 초과 |
| 500 | `{ "error": "Internal server error" }` | 서버 오류 |

---

## GET /api/submit

접수된 문제 목록을 조회합니다. 최신순 정렬, email 필드 제외.

### Request

```
GET /api/submit
```

### Response (200)

```json
[
  {
    "id": "uuid",
    "text": "불편 내용...",
    "category": null,
    "tags": [],
    "size": null,
    "status": "open",
    "votes": 0,
    "createdAt": "2026-03-15T12:00:00.000Z"
  }
]
```

### 참고
- `email` 필드는 공개 응답에서 제거됨 (프라이버시)
- Supabase 연결 시 DB에서, 미연결 시 JSON 파일에서 조회
