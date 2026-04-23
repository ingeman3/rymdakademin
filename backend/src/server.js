const path = require('path');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
require('dotenv').config();

const { query, pool } = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);
const frontendPath = path.join(__dirname, '..', '..', 'frontend');

// Source of truth for the games catalogue. The `games` table in Postgres
// holds the same schema but is not read from yet; when a persistence
// feature ships, flip /api/games to query the DB instead of this array.
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

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
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

const server = app.listen(port, () => {
  console.log(`Rymdakademin körs på port ${port}`);
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} mottagen, stänger ner...`);

  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out after 10s, forcing exit.');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  server.close((err) => {
    if (err) console.error('HTTP server close error:', err);
    pool.end().then(
      () => {
        clearTimeout(forceExit);
        process.exit(0);
      },
      (poolErr) => {
        console.error('Pool end error:', poolErr);
        clearTimeout(forceExit);
        process.exit(1);
      }
    );
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
