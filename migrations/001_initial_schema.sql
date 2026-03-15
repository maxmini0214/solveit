-- 001_initial_schema.sql
-- Baseline schema for SolveIt as of 2026-03-15
-- This migration is recorded as already applied.

-- ══════════════════════════════════════════════
-- submissions
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  email TEXT,
  category TEXT,
  tags TEXT[],
  size TEXT,
  status TEXT DEFAULT 'pending',
  votes INTEGER DEFAULT 0,
  ai_analysis JSONB,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ai_category TEXT,
  ai_tags TEXT[],
  ai_processed BOOLEAN DEFAULT FALSE
);

-- ══════════════════════════════════════════════
-- votes
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id),
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- issues
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'open',
  vote_count INTEGER DEFAULT 0,
  submission_count INTEGER DEFAULT 0,
  urgency TEXT,
  ai_summary TEXT,
  ai_confidence DOUBLE PRECISION,
  merged_into UUID REFERENCES issues(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- solutions
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  title TEXT,
  description TEXT,
  type TEXT,
  status TEXT DEFAULT 'planned',
  config JSONB,
  content TEXT,
  metrics JSONB,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- junction tables
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS submission_issues (
  submission_id UUID REFERENCES submissions(id),
  issue_id UUID REFERENCES issues(id),
  similarity_score DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (submission_id, issue_id)
);

CREATE TABLE IF NOT EXISTS issue_solutions (
  issue_id UUID REFERENCES issues(id),
  solution_id UUID REFERENCES solutions(id),
  PRIMARY KEY (issue_id, solution_id)
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'planned',
  demo_url TEXT,
  repo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_projects (
  submission_id UUID REFERENCES submissions(id),
  project_id UUID REFERENCES projects(id),
  PRIMARY KEY (submission_id, project_id)
);
