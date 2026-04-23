# Integritet i Rymdakademin

*Denna text är inte juridisk rådgivning. Den beskriver hur
Rymdakademin faktiskt fungerar idag och hur vi förhåller oss
till svensk dataskyddsreglering.*

## Sammanfattning

Rymdakademin är byggt för att behandla så lite data som möjligt
om barnet som spelar. Spelet använder **inga kakor, ingen
analys, inga tredjepartsskript, ingen reklam och ingen
profilering**. De fakta är oförändrade sedan plattformens
start och är kärnan i hur vi tänker om barn och integritet.

Från och med plattformsuppdateringen våren 2026 lagras dock
viss progressions-data även på vår server – pilotnamnen (som
barnet själv hittar på), hur många stjärnor varje pilot har
samlat, vilken rank piloten har nått, och tidpunkt för senaste
spel. Detta lagras under den e-postadress som
vårdnadshavaren/kontoinnehavaren autentiserar sig med via
Cloudflare Access.

**Därför är Rymdakademin nu personuppgiftsansvarig (controller)**
för de uppgifter som lagras på servern. Även om pilotnamnen i
sig är pseudonyma (barnet kan skriva vad som helst) är
kombinationen *autentiserad e-post + pilotnamn + spelhistorik*
en uppgift som kan kopplas till en identifierad person
(kontoinnehavaren) och räknas därmed som personuppgifter enligt
GDPR. Vi är öppna med det – tidigare formuleringar som lutade
mot "det här är inte personuppgifter" tog inte höjd för
kopplingen mellan e-post och innehåll.

Konkret betyder det fortfarande att **ingen av följande teknik
används**:

- Inga kakor (cookies) utöver det strikt nödvändiga för
  Cloudflare Access autentisering (CF_Authorization). Dessa
  är funktionella kakor som krävs för att inloggningen ska
  fungera och är undantagna från samtyckeskrav enligt
  ePrivacy/LEK.
- Ingen analysmjukvara (Google Analytics, Plausible, Matomo
  eller liknande).
- Inga tredjepartsskript eller externa tjänster (inga
  typsnitt från Google Fonts, inga inbäddade videor, inga
  "gilla"-knappar, inga CDN:er utöver Cloudflare som fungerar
  som reverse proxy).
- Ingen IP-adresslogg utöver det som är absolut tekniskt
  nödvändigt för att webbservern och rate-limitern ska
  fungera.
- Ingen profilering, ingen riktad reklam, ingen
  ansiktsigenkänning.

## Vilka uppgifter vi hanterar

### På barnets enhet (localStorage)

- Nycklarna `rymdakademin.progress.v1` (fullständig progression
  inkl. pilotnamn, stjärnor, rank, speldatum) och tidigare
  `rymdakademin.pilots.v1` / `rymdakademin.selectedPilot.v1`
  (migreras till den nya nyckeln vid första besök efter
  uppdateringen).
- Lagras tills användaren själv rensar webbläsardata.

### På vår server (Postgres)

| Uppgift | Varför | Rättslig grund |
|---------|--------|----------------|
| Kontoinnehavarens e-postadress (från Cloudflare Access-JWT) | Nyckel i `progress_snapshots`-tabellen så vi vet vems progression vi lagrar | GDPR art. 6.1.f — berättigat intresse att tillhandahålla tjänsten + kontoinnehavarens implicita samtycke genom att registrera sig för åtkomst |
| Pilotnamn (självvalda smeknamn) | Visas i UI, återställs mellan enheter | Samma som ovan |
| Stjärnor, rank, speltidpunkter per pilot och spel | Progression mellan enheter och sessioner | Samma som ovan |

**Datalokalisering:** Postgres körs på en virtuell server i
Sverige (EU). All data stannar inom EU/EES.

**Retention:** Data raderas på begäran (se nedan). Automatisk
radering av hela snapshotten sker efter **24 månaders
inaktivitet**, räknat från fältet `updated_at` i
`progress_snapshots`.

**Personuppgiftsbiträden:** Cloudflare (som CDN/reverse proxy
och för Access-autentisering) är personuppgiftsbiträde för
trafiklogg och autentiseringshändelser. Ett DPA finns via
Cloudflares Data Processing Addendum.

## Dina rättigheter som kontoinnehavare

Enligt GDPR har du rätt att:

- **få ett utdrag** av den data vi lagrar om dig (art. 15),
- **få uppgifter rättade** om något är fel (art. 16),
- **få uppgifterna raderade** (art. 17),
- **få uppgifterna utlämnade** i ett maskinläsbart format
  (art. 20),
- **invända mot behandlingen** (art. 21).

**Så utövar du rättigheterna:** maila **emil@ingeman.nu** från
den e-postadress du autentiserar med via Cloudflare Access.

Radering sker tekniskt genom att vi kör en authenticated
`DELETE /api/progress` mot kontot eller tar bort raden direkt i
databasen. Vi bekräftar raderingen skriftligt. Eventuell data i
backup-system raderas vid nästa backup-rotation (som sker
inom 30 dagar).

Du kan när som helst själv rensa den lokala kopian genom att
rensa webbplatsdata i webbläsaren:

- Chrome/Edge: *Inställningar → Sekretess och säkerhet →
  Rensa webbplatsdata.*
- Safari: *Inställningar → Sekretess → Hantera
  webbplatsdata.*
- Firefox: *Inställningar → Sekretess och säkerhet → Kakor
  och webbplatsdata → Rensa data.*

## Varför detta är viktigt för ett spel för barn

Rymdakademin är riktat till barn, bland annat barn under 13 år.
Enligt **dataskyddslagen 3 kap. 1 §** är åldersgränsen för
barns eget samtycke till informationssamhällets tjänster i
Sverige satt till **13 år** (GDPR art. 8 kompletterad av
dataskyddslagen). För yngre barn krävs vårdnadshavarens
samtycke.

Rymdakademin hanterar den regeln genom att:

1. Ingen självregistrering finns. Åtkomsten går via Cloudflare
   Access och beviljas endast till e-postadresser som har
   bjudits in — i praktiken vårdnadshavare. Barnet självt
   registrerar inget och accepterar inga villkor.
2. Pilotnamn är självvalda smeknamn, inte riktiga namn eller
   andra identifierare. Vi efterfrågar inte riktigt namn,
   ålder, e-post, personnummer eller plats för barnet.
3. Ingen profilering sker (GDPR art. 22). Stjärnor och rank är
   enbart en uppmuntrande återkoppling i spelet, inte underlag
   för automatiserade beslut.
4. Ingen marknadsföring, ingen tredjepartsanalys.

Vi följer också principen om **dataminimering** (GDPR art. 5.1
c) — endast det som är nödvändigt för att progressionen ska
fungera mellan enheter.

## När denna policy behöver uppdateras

Följande framtida ändringar skulle innebära att vi behandlar
personuppgifter på ett nytt sätt och att dokumentet **måste**
skrivas om innan ändringen släpps:

- **Analysverktyg eller felrapportering** (Google Analytics,
  Sentry, Hotjar, LogRocket m.fl.) – samlar in IP-adress,
  användaragent och sessionshistorik.
- **Tredjepartsinbäddningar** (YouTube, Vimeo, Google Fonts,
  inbäddade kartor, "gilla"-knappar) – sätter kakor och/eller
  lämnar ut IP till tredje part.
- **Topplistor, kommentarer, delning mellan barn** – innebär
  ofta profilering av barn och ökar risken för kränkande
  behandling.
- **Riktad reklam eller marknadsföring** – förbjudet mot barn i
  EU enligt Digital Services Act och GDPR art. 22.
- **Byte av driftmiljö utanför EU/EES** – kräver bedömning av
  tredjelandsöverföring och eventuellt standardavtalsklausuler
  (SCC).
- **Uppsamling av riktiga namn, e-post, ålder eller plats för
  barn** – kräver explicit vårdnadshavarsamtycke och en
  särskild GDPR-K-bedömning.

När något av dessa steg tas ska detta dokument uppdateras med:

1. Vilken ny personuppgift som samlas in och varför.
2. Ev. ny rättslig grund.
3. Eventuellt ändrad retention.
4. Nya personuppgiftsbiträden.

## Kontakt

Dataskyddsfrågor och begäran om utdrag/radering:
**emil@ingeman.nu**

Personuppgiftsansvarig: Emil Johansson, privatperson som driver
Rymdakademin.

---

*Senast granskad: se git-historiken för detta dokument.*
