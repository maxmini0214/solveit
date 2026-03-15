-- SolveIt Initial Schema
-- 2026-03-15

-- projects 테이블 (submissions보다 먼저 생성 — FK 참조)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in-progress', 'review', 'shipped', 'archived')),
  demo_url TEXT,
  repo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- submissions 테이블
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  email TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  size TEXT CHECK (size IN ('XS', 'S', 'M', 'L', 'XL')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'solved', 'archived')),
  votes INTEGER DEFAULT 0,
  ai_analysis JSONB,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- submission_projects junction (N:M)
CREATE TABLE submission_projects (
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (submission_id, project_id)
);

-- votes 테이블 (중복 투표 방지)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, ip_hash)
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_projects ENABLE ROW LEVEL SECURITY;

-- submissions: 누구나 읽기/생성 가능
CREATE POLICY "submissions_select" ON submissions FOR SELECT USING (true);
CREATE POLICY "submissions_insert" ON submissions FOR INSERT WITH CHECK (true);

-- projects: 누구나 읽기 가능, 쓰기는 서비스키만
CREATE POLICY "projects_select" ON projects FOR SELECT USING (true);

-- votes: 누구나 읽기/생성 가능
CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (true);

-- submission_projects: 누구나 읽기 가능
CREATE POLICY "submission_projects_select" ON submission_projects FOR SELECT USING (true);

-- 인덱스
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_votes_submission_id ON votes(submission_id);
