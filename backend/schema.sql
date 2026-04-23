-- The games catalogue lives in backend/src/server.js (array constant).
-- This table is created empty so future persistence features have a
-- place to land; the API does not read from it yet.
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  path TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
