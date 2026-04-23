const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createRemoteJWKSet, jwtVerify } = require('jose');
require('dotenv').config();

const { query, pool } = require('./db');

// Hard mode gate. Startup refuses unless NODE_ENV is explicitly set to
// one of the recognised values — prevents a container with an
// accidentally unset NODE_ENV from silently enabling the dev-mode auth
// fallback. docker-compose.yml sets production; `npm run dev` sets
// development locally.
const MODE = process.env.NODE_ENV === 'production' ? 'production'
  : process.env.NODE_ENV === 'development' ? 'development'
    : null;
if (MODE === null) {
  // eslint-disable-next-line no-console
  console.error(
    'Refusing to start: NODE_ENV must be "production" or "development".\n' +
    'Docker Compose sets production by default; locally use `npm run dev`.'
  );
  process.exit(1);
}
const IS_PRODUCTION = MODE === 'production';

const app = express();
const port = Number(process.env.PORT || 3000);
const frontendPath = path.join(__dirname, '..', '..', 'frontend');

// Exactly one hop through cloudflared in production. Makes req.ip
// reflect the real client IP so the rate limiter keys per-user rather
// than per-CF-edge. In dev (direct connection) this is still correct
// because there is no upstream proxy adding forwarded headers to
// believe.
app.set('trust proxy', 1);

// ---- Cloudflare Access JWT verification ---------------------------------
// In production every request reaches Express only via cloudflared, and
// Cloudflare Access adds a signed JWT in Cf-Access-Jwt-Assertion. We
// verify the signature against Cloudflare's published JWKS, check the
// audience claim matches our application AUD, and extract the email
// claim. The raw Cf-Access-Authenticated-User-Email header is NOT
// trusted on its own — anyone who reaches the port could forge it.
//
// In development (NODE_ENV=development) we additionally accept an
// X-Dev-Email header when no JWT is present, so a developer running
// `npm run dev` without cloudflared in front can still hit these
// endpoints. Mutually exclusive with JWT verification: if a JWT is
// sent it is verified; fallback only kicks in when JWT is absent.
const CF_TEAM = 'beervision';
const CF_AUDIENCE = 'a7683715317a9b9e3456523ac47b88f591ffa9285f90996e1e0af3b172ee4048';
const CF_CERTS_URL = new URL(`https://${CF_TEAM}.cloudflareaccess.com/cdn-cgi/access/certs`);
const CF_ISSUER = `https://${CF_TEAM}.cloudflareaccess.com`;
const CF_JWKS = createRemoteJWKSet(CF_CERTS_URL, {
  cacheMaxAge: 60 * 60 * 1000,
  cooldownDuration: 30 * 1000,
});

async function verifyCfAccessJwt(token) {
  try {
    const { payload } = await jwtVerify(token, CF_JWKS, {
      audience: CF_AUDIENCE,
      issuer: CF_ISSUER,
    });
    return typeof payload.email === 'string' ? payload.email.toLowerCase() : null;
  } catch (_) {
    return null;
  }
}

function isValidEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}

async function requireEmail(req, res, next) {
  const jwt = req.header('cf-access-jwt-assertion');
  if (jwt) {
    const email = await verifyCfAccessJwt(jwt);
    if (email) {
      req.email = email;
      return next();
    }
    return res.status(401).json({ message: 'Ej autentiserad.' });
  }
  if (!IS_PRODUCTION) {
    const dev = req.header('x-dev-email');
    if (isValidEmail(dev)) {
      req.email = dev.toLowerCase();
      return next();
    }
  }
  return res.status(401).json({ message: 'Ej autentiserad.' });
}

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
app.use(express.static(frontendPath));

app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Narrower limit for writes against the progression store. Keyed by
// req.ip which, thanks to trust proxy, is the real client as CF sees it.
const progressWriteLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// JSON parser is attached per-route rather than globally so the rest
// of the API cannot be probed with JSON bodies. 64 KB is enough for a
// large roster of pilots with full game history and safely below any
// DoS threshold.
const jsonParser = express.json({ limit: '64kb' });

function validateSnapshotShape(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return 'snapshot saknas eller är felaktig.';
  }
  if (typeof snapshot.schemaVersion !== 'number') {
    return 'snapshot.schemaVersion måste vara ett tal.';
  }
  if (!snapshot.pilots || typeof snapshot.pilots !== 'object' || Array.isArray(snapshot.pilots)) {
    return 'snapshot.pilots måste vara ett objekt.';
  }
  if (snapshot.selectedPilot !== null && typeof snapshot.selectedPilot !== 'string') {
    return 'snapshot.selectedPilot måste vara en sträng eller null.';
  }
  return null;
}

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error' });
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

app.get('/api/progress', requireEmail, async (req, res) => {
  try {
    const result = await query(
      'SELECT snapshot, updated_at FROM progress_snapshots WHERE account_email = $1',
      [req.email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ingen progression sparad.' });
    }
    const row = result.rows[0];
    return res.json({
      snapshot: row.snapshot,
      updatedAt: row.updated_at.toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('GET /api/progress failed:', err);
    return res.status(500).json({ message: 'Serverfel.' });
  }
});

app.put('/api/progress', requireEmail, progressWriteLimiter, jsonParser, async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ message: 'Ogiltig body.' });
  }
  const shapeError = validateSnapshotShape(body.snapshot);
  if (shapeError) {
    return res.status(400).json({ message: shapeError });
  }
  try {
    const result = await query(
      `INSERT INTO progress_snapshots (account_email, snapshot, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (account_email) DO UPDATE
         SET snapshot = EXCLUDED.snapshot,
             updated_at = NOW()
       RETURNING updated_at`,
      [req.email, body.snapshot]
    );
    return res.json({
      ok: true,
      updatedAt: result.rows[0].updated_at.toISOString(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('PUT /api/progress failed:', err);
    return res.status(500).json({ ok: false, message: 'Serverfel.' });
  }
});

// Translate express.json's PayloadTooLargeError into a typed 413 for
// the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({ message: 'För stor body.' });
  }
  return next(err);
});

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Hittades inte.' });
});

app.get('/solsystemsresan', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'solsystemsresan.html'));
});

// Any other path falls through to the start page. Keeps deep links and
// typos landing somewhere sensible instead of showing the game chrome.
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Rymdakademin körs på port ${port} (${MODE})`);
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  // eslint-disable-next-line no-console
  console.log(`${signal} mottagen, stänger ner...`);

  const forceExit = setTimeout(() => {
    // eslint-disable-next-line no-console
    console.error('Graceful shutdown timed out after 10s, forcing exit.');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  server.close((err) => {
    // eslint-disable-next-line no-console
    if (err) console.error('HTTP server close error:', err);
    pool.end().then(
      () => {
        clearTimeout(forceExit);
        process.exit(0);
      },
      (poolErr) => {
        // eslint-disable-next-line no-console
        console.error('Pool end error:', poolErr);
        clearTimeout(forceExit);
        process.exit(1);
      }
    );
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
