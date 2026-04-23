# Deployment — Rymdakademin

Det här dokumentet beskriver hur Rymdakademin körs i produktion bakom Cloudflare Tunnel och Cloudflare Access. Det är både en runbook (när du ska sätta upp eller ändra något) och en artefakt för ISO 27001 (dokumenterad åtkomstkontroll, A.9.1.2).

## Innehåll

1. Arkitektur
2. Förutsättningar
3. Konfigurera Cloudflare Tunnel
4. Konfigurera Cloudflare Access
5. SSL/TLS
6. Verifiera deploymenten
7. Administrera betatestare
8. Lokal utveckling vs. produktion
9. Felsökning
10. ISO 27001-anteckningar

---

## 1. Arkitektur

```
Användare → Cloudflare edge → Cloudflare Tunnel → Docker-host → Express (port 3001)
            [Access + SSL]     [QUIC/TLS]          [localhost]    [helmet + CSP]
```

**Tre krypterade sträckor:**

1. **Browser → Cloudflare edge:** HTTPS via Cloudflare Universal SSL (automatisk).
2. **Cloudflare edge → cloudflared:** krypterad tunnel över QUIC/HTTP2 + TLS.
3. **cloudflared → Express:** HTTP över loopback inuti samma host. Ej krypterad men inte exponerad.

**Access-autentisering** sker vid Cloudflare edge innan requesten når tunneln. En användare som inte godkänns av policyn ser aldrig tunneln eller servern.

**Postgres** är bundet till `127.0.0.1:5433` och exponeras aldrig publikt (säkerhet H3 från phase 1).

---

## 2. Förutsättningar

- Domänen `rymdakademin.se` ligger på Cloudflare (Full Setup, ej Partial).
- En befintlig Cloudflare Tunnel (`unixsolutions_prod`) körs på Docker-hosten.
- Cloudflare Zero Trust är aktiverat på kontot. Free-planen räcker (50 användare).
- Docker Compose körs och tjänsten lyssnar på `localhost:3001`.

---

## 3. Konfigurera Cloudflare Tunnel

Rymdakademin delar den befintliga `unixsolutions_prod`-tunneln. Ingen ny tunnel behöver skapas.

**Steg i Cloudflare Zero Trust-dashboarden:**

1. Gå till **Networks → Tunnels → unixsolutions_prod → Configure**.
2. Öppna fliken **Public Hostnames**.
3. Klicka **Add a public hostname** och fyll i:
   - **Subdomain:** *(tom för root, eller `www`)*
   - **Domain:** `rymdakademin.se`
   - **Type:** HTTP
   - **URL:** `localhost:3001`
4. Klicka **Save hostname**.

Cloudflare skapar automatiskt ett CNAME-record i DNS som pekar på tunnel-UUID:et (`<uuid>.cfargotunnel.com`). Ingen manuell DNS-konfiguration krävs.

**Verifiera:**

```bash
dig rymdakademin.se CNAME +short
# → <uuid>.cfargotunnel.com
```

---

## 4. Konfigurera Cloudflare Access

### 4.1 Skapa en Access Application

1. Gå till **Access → Applications → Add an application**.
2. Välj **Self-hosted**.
3. Fyll i:
   - **Application name:** `Rymdakademin`
   - **Session duration:** `24 hours`
   - **Application domain:** `rymdakademin.se`
4. Klicka **Next**.

### 4.2 Konfigurera identity provider

Under **Identity providers**, aktivera:

- **One-time PIN** (rekommenderas för familj/vänner utan företagskonton — Cloudflare skickar en 6-siffrig kod via email).
- **Google** och/eller **Microsoft** *(valfritt — smidigare för återkommande användare med befintliga konton)*.

### 4.3 Skapa policy

Under **Policies**, skapa:

- **Policy name:** `Rymdakademin Beta Testers`
- **Action:** `Allow`
- **Session duration:** `Same as application`
- **Configure rules → Include:**
  - **Selector:** `Emails`
  - **Value:** en email-adress per rad, t.ex.:
    ```
    emil@example.com
    familj1@example.com
    familj2@example.com
    ```

Spara application + policy.

### 4.4 Testa omedelbart

Gå till `https://rymdakademin.se` i en **inkognito-flik** (för att inte förvirras av cachade sessioner).

Du ska se:

1. En Cloudflare Access-inloggningssida.
2. Ett val av identity provider.
3. Efter inloggning: spelets startsida.

Om någon som inte finns i listan försöker logga in ska de få ett "You do not have access"-meddelande.

---

## 5. SSL/TLS

**Ingen manuell SSL-konfiguration krävs.** Cloudflare hanterar certifikat automatiskt.

**Kontrollera ändå en gång:**

1. Gå till **SSL/TLS → Overview** i Cloudflare-dashboarden för `rymdakademin.se`.
2. Säkerställ att **SSL/TLS encryption mode** är `Full` eller `Full (strict)`.
3. Säkerställ INTE att det står `Flexible` (det skulle vara osäkert).

**HSTS-headern** sätts automatiskt av `helmet` i Express (phase 2 security M2). Webbläsaren tvingar HTTPS för domänen efter första besöket.

---

## 6. Verifiera deploymenten

Kör följande checklista efter varje större ändring i tunneln eller Access-policyn:

### 6.1 DNS + tunnel

```bash
dig rymdakademin.se CNAME +short
# Förväntat: <uuid>.cfargotunnel.com
```

### 6.2 Access-redirect

```bash
curl -I https://rymdakademin.se
```

Förväntat:

- `HTTP/2 302` eller `HTTP/2 401` (Access redirect)
- `cf-ray: ...` (Cloudflare-trafik)
- Location-header pekar mot `rymdakademin.cloudflareaccess.com`

### 6.3 Login-flöde

Öppna `https://rymdakademin.se` i inkognito och verifiera:

- Access-sidan visas
- One-time PIN-mailet kommer inom 30 sekunder
- Efter inloggning: spelets startsida laddas utan fel
- Webbläsaren visar grönt hänglås
- DevTools Console: 0 errors, 0 CSP violations

### 6.4 End-to-end

Efter lyckad inloggning, verifiera hela spelet:

- Välj pilot → persistens fungerar
- Klicka Solsystemsresan → navigering till `/solsystemsresan`
- Spela igenom en planet → rätt/fel-feedback fungerar
- `/api/health` returnerar `{"status":"ok"}`

### 6.5 Icke-auktoriserad åtkomst

Testa från en email-adress som **inte** står på listan (t.ex. en annan gmail). Access ska blockera. Om den släpper igenom: granska policyn — troligen fel matching-regel.

---

## 7. Administrera betatestare

### 7.1 Lägga till en ny testare

1. Gå till **Access → Applications → Rymdakademin → Policies**.
2. Öppna `Rymdakademin Beta Testers`.
3. Lägg till email-adressen i **Include → Emails**.
4. Spara. Ändringen gäller omedelbart — ingen ny deploy krävs.
5. Skicka en länk till `https://rymdakademin.se` till den nya testaren.

### 7.2 Ta bort en testare

Samma procedur. Ta bort email-adressen från policyn. Om testaren har en aktiv session avslutas den automatiskt efter session-durationens utgång (24h enligt nuvarande konfiguration).

För att avsluta omedelbart: gå till **Access → Users**, hitta användaren, klicka **Revoke access**.

### 7.3 Granska vem som loggat in

**Access → Logs → Access** visar alla autentiseringsförsök (lyckade och misslyckade) med email, tidpunkt och källa. Denna logg är tillgänglig 24 timmar på Free-planen (längre på betalda planer).

För ISO 27001-ändamål: exportera loggen månatligen eller konfigurera Logpush (kräver betalplan).

---

## 8. Lokal utveckling vs. produktion

| Aspekt | Lokalt | Produktion |
|---|---|---|
| URL | `http://localhost:3001` | `https://rymdakademin.se` |
| SSL | Ingen | Cloudflare Universal SSL |
| Access | Ingen | Cloudflare Access med email-policy |
| Postgres | `127.0.0.1:5433` | `127.0.0.1:5433` (samma, ej publik) |
| Env-variabler | `.env` i repo-roten | `.env` på produktionshost (ej i git) |
| Start | `docker compose up --build` | `docker compose up -d --build` (detached) |

**Viktigt:** Lokal utveckling går helt utanför Cloudflare. Det är så det ska vara — du ska kunna iterera snabbt utan att involvera tunneln.

**Tips för att testa Access-flödet lokalt:** Det går inte bekvämt. Acceptera att Access-konfigurationen bara verifieras efter deploy, och använd `curl -I` + inkognito-browser för att snabbt testa ändringar.

---

## 9. Felsökning

### 9.1 "502 Bad Gateway" på `rymdakademin.se`

**Orsak:** Tunneln är uppe men servern på `localhost:3001` är nere eller lyssnar på fel port.

**Åtgärd:**

```bash
# Verifiera att servern lyssnar
ss -tlnp | grep 3001

# Kontrollera container-status
docker compose ps

# Titta på logs
docker compose logs -f app
```

### 9.2 "You do not have access" trots rätt email

**Orsak:** Policyn matchar inte email-adressen exakt (case-sensitivity, whitespace, eller fel IdP-selektor).

**Åtgärd:** Gå till **Access → Applications → Rymdakademin → Policies → Policy Tester**. Skriv in email-adressen och se vilken policy som matchar (eller inte).

### 9.3 Tunneln visar "Disconnected" i dashboarden

**Orsak:** `cloudflared`-processen har kraschat eller tappat nätverkskontakten.

**Åtgärd:**

```bash
# På Docker-hosten
systemctl status cloudflared  # eller docker ps om den körs i container
systemctl restart cloudflared
journalctl -u cloudflared -n 100
```

### 9.4 CSP-violations i browser-console efter Access-inloggning

**Orsak:** Cloudflare Access injicerar egna scripts/resurser som vår strikta CSP kan blockera.

**Åtgärd:** Sällan ett problem i praktiken, men om det händer:

1. Notera exakt vilken direktiv som triggade (t.ex. `script-src`).
2. Granska CSP i `backend/src/server.js`.
3. **Lös genom att whitelista Cloudflares domäner, inte genom att lägga till `'unsafe-inline'`.** Cloudflare Access-domäner följer mönstret `*.cloudflareaccess.com`.

### 9.5 HSTS-cache gör att lokalt testning strular

**Orsak:** Om du någon gång kör `rymdakademin.se` mot `127.0.0.1` via `/etc/hosts`, cachar webbläsaren HSTS-headern och vägrar sedan ansluta via HTTP lokalt.

**Åtgärd:** I Chrome, gå till `chrome://net-internals/#hsts`, sök på domänen, klicka **Delete domain security policies**. Använd helst inte `/etc/hosts`-tricket alls — kör lokalt på `localhost:3001` istället.

---

## 10. ISO 27001-anteckningar

**Relevanta kontrollpunkter:**

- **A.9.1.2 Access to networks and network services** — Cloudflare Access är den primära åtkomstkontrollmekanismen. Policyn är dokumenterad i avsnitt 4.3.
- **A.9.2.1 User registration and de-registration** — Avsnitt 7.1 och 7.2 beskriver processen.
- **A.9.2.3 Management of privileged access rights** — Alla användare har samma nivå (läsare av spelet). Ingen priviligerad access finns i applikationen.
- **A.9.4.1 Information access restriction** — Access-policyn baseras på email-verifiering via IdP. Deny-by-default: användare utanför Include-listan får ingen åtkomst.
- **A.10.1.1 Cryptographic controls** — TLS hanteras av Cloudflare (edge cert), Cloudflare Tunnel (edge→origin) och helmet HSTS (browser-enforcement). Ingen egen nyckelhantering krävs.
- **A.12.4.1 Event logging** — Cloudflare Access Logs visar autentiseringsförsök. Granska månatligen (avsnitt 7.3).
- **A.15.1.1 Information security policy for supplier relationships** — Cloudflare är en kritisk underleverantör. DPA finns att signera i Cloudflare-dashboarden under **Manage Account → Configurations → Data Processing Agreement**.

**Supplier register-poster att uppdatera:**

| Leverantör | Tjänst | Databehandling | DPA |
|---|---|---|---|
| Cloudflare | Tunnel, Access, SSL | Email-adresser vid autentisering, IP-adresser i loggar | Signerad YYYY-MM-DD |

---

## Ändringshistorik

| Datum | Version | Ändring |
|---|---|---|
| *(fyll i vid första commit)* | 1.0 | Initial deployment-dokumentation |
