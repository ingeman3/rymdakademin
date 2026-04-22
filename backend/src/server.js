const path = require('path');
const cors = require('cors');
const express = require('express');
require('dotenv').config();

const { query } = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);
const frontendPath = path.join(__dirname, '..', '..', 'frontend');

const games = [
  {
    id: 'solar-system',
    name: 'Solsystemsresan',
    status: 'active',
    path: '/',
    description: 'Ett barnvänligt matteäventyr genom solsystemet.',
  },
  { id: 'letter-hunt', name: 'Bokstavsjakten', status: 'planned' },
  { id: 'spelling-rocket', name: 'Stavningsraketen', status: 'planned' },
  { id: 'space-memory', name: 'Rymdminnet', status: 'planned' },
  { id: 'number-station', name: 'Sifferstationen', status: 'planned' },
];

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', app: 'Rymdakademin', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Databasen svarar inte.' });
  }
});

app.get('/api/games', (_req, res) => {
  res.json(games);
});

app.get('/api/games/:gameId', (req, res) => {
  const game = games.find((entry) => entry.id === req.params.gameId);

  if (!game) {
    return res.status(404).json({ message: 'Spelet finns inte.' });
  }

  return res.json(game);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

async function ensureDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      path TEXT,
      description TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const game of games) {
    await query(
      `INSERT INTO games (id, name, status, path, description, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id)
       DO UPDATE SET
         name = EXCLUDED.name,
         status = EXCLUDED.status,
         path = EXCLUDED.path,
         description = EXCLUDED.description,
         updated_at = NOW()`,
      [game.id, game.name, game.status, game.path || null, game.description || null]
    );
  }
}

ensureDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Rymdakademin körs på port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Kunde inte starta Rymdakademin:', error);
    process.exit(1);
  });
