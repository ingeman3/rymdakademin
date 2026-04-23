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

-- Server-side backup of a player's full progression snapshot. The
-- authenticated Cloudflare Access account email keys each row. The
-- snapshot column holds the exact object produced by progress.js on
-- the client (schemaVersion, selectedPilot, pilots{}) — validated for
-- shape and size at the route level, then stored verbatim so future
-- schema versions can migrate client-side without a DB migration.
CREATE TABLE IF NOT EXISTS progress_snapshots (
  account_email TEXT PRIMARY KEY,
  snapshot JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
