# Integritet i Rymdakademin

*Denna text är inte juridisk rådgivning. Den beskriver hur
Rymdakademin faktiskt fungerar idag och hur vi förhåller oss
till svensk dataskyddsreglering.*

## Sammanfattning

**Rymdakademin samlar inte in några personuppgifter.** Spelet
körs helt i barnets webbläsare. Det finns ingen inloggning,
inga konton, ingen profil, inga resultat som sparas någonstans,
och ingen data lämnar barnets enhet.

Konkret betyder det att **ingen av följande teknik används**:

- Inga kakor (cookies).
- Ingen `localStorage` eller `sessionStorage` som identifierar
  barnet.
- Ingen analysmjukvara (Google Analytics, Plausible, Matomo,
  eller liknande).
- Inga tredjepartsskript eller externa tjänster (inga
  typsnitt från Google Fonts, inga inbäddade videor, inga
  "gilla"-knappar, inga CDN:er).
- Ingen IP-adresslogg utöver det som är absolut tekniskt
  nödvändigt för att webbservern ska fungera.
- Ingen profilering, ingen riktad reklam, ingen ansiktsigenkänning.
- Inga API-anrop som lämnar vår egen server.

## Varför detta är viktigt för ett spel för barn

Rymdakademin är riktat till barn, bland annat barn under 13 år.
Enligt **dataskyddslagen 3 kap. 1 §** är åldersgränsen för barns
eget samtycke till informationssamhällets tjänster i Sverige satt
till **13 år** (GDPR art. 8 kompletterad av dataskyddslagen). För
yngre barn krävs vårdnadshavarens samtycke.

Det säkraste sättet att hantera den regeln är att inte samla in
några personuppgifter alls, vilket är den hållning Rymdakademin
har idag. Ingen personuppgiftsbehandling sker – alltså behövs
heller inget samtycke.

Vi följer också principen om **dataminimering** (GDPR art. 5.1 c):
även när vi en dag lägger till funktioner som behöver data, ska vi
bara samla in det som är absolut nödvändigt.

## När denna policy behöver uppdateras

Detta dokument är korrekt så länge listan ovan stämmer. Följande
framtida ändringar skulle innebära att vi behandlar personuppgifter
och att dokumentet **måste** skrivas om innan ändringen släpps:

- **Framsteg/stjärnor sparas mellan besök** – även om det bara är
  en anonym `localStorage`-nyckel räknas det ofta som "kaka eller
  liknande teknik" enligt LEK 9 kap. 28 §, och en slumpvis
  identifierare kan i vissa fall räknas som en personuppgift.
- **Inloggning, konton eller profiler** – kräver i princip alltid
  GDPR-K-anpassad samtyckesflöde med vårdnadshavarens godkännande
  om användaren kan vara under 13.
- **Analysverktyg eller felrapportering** (Google Analytics,
  Sentry, Hotjar, LogRocket m.fl.) – samlar in IP-adress,
  användaragent och sessionshistorik. Särskilt svårt att göra
  GDPR-kompatibelt för ett barn under 13.
- **Tredjepartsinbäddningar** (YouTube, Vimeo, Google Fonts,
  inbäddade kartor, "gilla"-knappar) – sätter kakor och/eller
  lämnar ut IP till tredje part.
- **Topplistor, kommentarer, delning mellan barn** – innebär ofta
  profilering av barn och ökar risken för kränkande behandling;
  kräver tydlig rättslig grund och särskild skyddsnivå.
- **Riktad reklam eller marknadsföring** – förbjudet mot barn i
  EU enligt Digital Services Act och GDPR art. 22.
- **Byte av driftmiljö utanför EU/EES** – kräver bedömning av
  tredjelandsöverföring och eventuellt standardavtalsklausuler
  (SCC).

När något av dessa steg tas ska detta dokument uppdateras med:

1. Vilken personuppgift som samlas in och varför.
2. Rättslig grund (för barn: i praktiken vårdnadshavarens
   samtycke eller berättigat intresse efter noggrann bedömning).
3. Lagringstid och rätt till radering.
4. Om personuppgiftsbiträde finns, vem det är och vilket land
   datan hamnar i.

## Kontakt

Frågor om denna text eller om Rymdakademins hantering av
personuppgifter ska kunna besvaras av projektansvarig innan
produkten används i skolmiljö eller görs tillgänglig för
allmänheten.

---

*Senast granskad: se git-historiken för detta dokument.*
