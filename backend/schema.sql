CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  path TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO games (id, name, status, path, description)
VALUES
  ('solar-system', 'Solsystemsresan', 'active', '/', 'Ett barnvänligt matteäventyr genom solsystemet.'),
  ('letter-hunt', 'Bokstavsjakten', 'planned', NULL, NULL),
  ('spelling-rocket', 'Stavningsraketen', 'planned', NULL, NULL),
  ('space-memory', 'Rymdminnet', 'planned', NULL, NULL),
  ('number-station', 'Sifferstationen', 'planned', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  path = EXCLUDED.path,
  description = EXCLUDED.description,
  updated_at = NOW();
