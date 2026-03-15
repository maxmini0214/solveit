# Supabase 설정 가이드
> 마지막 업데이트: 2026-03-15

## 개요

SolveIt은 Supabase (PostgreSQL)를 메인 DB로 사용합니다.
환경변수가 없으면 `data/submissions.json` 파일로 fallback합니다.

## 테이블 구조

### submissions
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| text | TEXT | 불편 내용 (필수) |
| email | TEXT | 알림용 이메일 (선택) |
| category | TEXT | AI 분류 카테고리 |
| tags | TEXT[] | 태그 배열 |
| size | TEXT | XS/S/M/L/XL |
| status | TEXT | open/in-progress/solved/archived |
| votes | INTEGER | 투표 수 (기본 0) |
| ai_analysis | JSONB | AI 분석 결과 |
| ip_hash | TEXT | IP 해시 (원본 저장 금지) |
| created_at | TIMESTAMPTZ | 생성 시각 |
| updated_at | TIMESTAMPTZ | 수정 시각 |

### projects
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| title | TEXT | 프로젝트 제목 (필수) |
| description | TEXT | 설명 |
| status | TEXT | planning/in-progress/review/shipped/archived |
| demo_url | TEXT | 데모 링크 |
| repo_url | TEXT | 레포 링크 |
| created_at | TIMESTAMPTZ | 생성 시각 |
| updated_at | TIMESTAMPTZ | 수정 시각 |

### submission_projects (N:M junction)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| submission_id | UUID (FK) | submissions.id |
| project_id | UUID (FK) | projects.id |

### votes (중복 방지)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| submission_id | UUID (FK) | submissions.id |
| ip_hash | TEXT | IP 해시 |
| created_at | TIMESTAMPTZ | 생성 시각 |
| UNIQUE | (submission_id, ip_hash) | 중복 투표 방지 |

## RLS (Row Level Security) 정책

```sql
-- submissions
-- 누구나 읽기 가능
CREATE POLICY "Public read" ON submissions FOR SELECT USING (true);
-- 누구나 생성 가능 (email은 서버에서만 설정)
CREATE POLICY "Public insert" ON submissions FOR INSERT WITH CHECK (true);
-- 업데이트는 서비스키만
CREATE POLICY "Service update" ON submissions FOR UPDATE USING (false);

-- votes
-- 누구나 읽기/생성 가능
CREATE POLICY "Public read" ON votes FOR SELECT USING (true);
CREATE POLICY "Public insert" ON votes FOR INSERT WITH CHECK (true);

-- projects
-- 누구나 읽기 가능, 생성은 서비스키만
CREATE POLICY "Public read" ON projects FOR SELECT USING (true);
CREATE POLICY "Service insert" ON projects FOR INSERT WITH CHECK (false);
```

## 마이그레이션

마이그레이션 파일: `supabase/migrations/20260315_init.sql`

새 마이그레이션 추가 시:
1. `supabase/migrations/YYYYMMDD_설명.sql` 파일 생성
2. `docs/supabase.md` 테이블 구조 업데이트
3. `ARCHITECTURE.md` DB 스키마 섹션 업데이트

## 클라이언트 코드

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 환경변수 없으면 null 반환 → JSON fallback 사용
export function getSupabaseClient() { ... }
export function getSupabaseAdmin() { ... }  // 서비스키 (서버 전용)
```
