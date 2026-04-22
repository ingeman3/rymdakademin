# Rymdakademin

Rymdakademin är en svensk lärplattform för barn med rymdtema. Den aktiva versionen innehåller ett spel: **Solsystemsresan**, där barnet utforskar planeter, löser enkla matteuppdrag med tal mellan 0 och 10 och samlar stjärnor.

Framtida spel kan läggas till under samma plattform, till exempel Bokstavsjakten, Stavningsraketen, Rymdminnet och Sifferstationen.

## Teknik

- Frontend: HTML, CSS och vanilla JavaScript
- Backend: Node.js och Express
- Databas: PostgreSQL
- Deployment: Docker Compose

## Projektstruktur

```text
frontend/
  index.html
  styles/
    app.css
  js/
    app.js
    shared/
      math.js
    games/
      solar-system/
        solar-system-data.js
        solar-system-game.js
        solar-system-ui.js
assets/
backend/
  src/
    db.js
    server.js
  schema.sql
  package.json
  Dockerfile
docker-compose.yml
README.md
```

## Aktivt spel

### Solsystemsresan

Solsystemsresan är ett 2D-rymdäventyr. Spelaren startar på Jorden, väljer planeter i valfri ordning, flyger dit med ett rymdskepp och löser ett matteuppdrag på varje planet. När alla planetuppdrag är klara får spelaren återvända hem till Jorden.

Spelet kör helt i webbläsaren och använder ingen databas för själva spelomgången ännu.

## Kör med Docker Compose

Starta appen:

```bash
docker compose up --build
```

Öppna sedan:

```text
http://localhost:3001
```

PostgreSQL publiceras på host-port `5433` och kör på port `5432` inne i Docker-nätverket. Schemat i `backend/schema.sql` laddas automatiskt första gången databasen skapas.

## Miljövariabler

Backend använder följande variabler:

```text
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_NAME=rymdakademin
DB_USER=rymd_user
DB_PASSWORD=rymd_password
```

För lokal körning utan Docker kan du kopiera `backend/.env.example` till `backend/.env` och justera värdena.

## Lokal backend utan Docker

Kräver Node.js 20 eller senare och en körande PostgreSQL-databas.

```bash
cd backend
npm install
npm start
```

Skapa tabellerna manuellt om du kör utan Docker:

```bash
psql "$DATABASE_URL" -f schema.sql
```

## API

- `GET /api/health` kontrollerar server och databas
- `GET /api/games` listar aktiva och planerade spel
- `GET /api/games/:gameId` hämtar metadata för ett spel

## Lägga till fler spel

Nya spel bör läggas under:

```text
frontend/js/games/<game-id>/
```

Varje spel kan ha egna filer för data, UI och spelregler. `frontend/js/app.js` är den nuvarande startpunkten och kan senare byggas ut med routing eller en spelmeny.
