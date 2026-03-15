-- Schema migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO schema_migrations (version, name) VALUES ('001', 'initial_schema')
ON CONFLICT (version) DO NOTHING;
INSERT INTO schema_migrations (version, name) VALUES ('002', 'schema_migrations')
ON CONFLICT (version) DO NOTHING;
