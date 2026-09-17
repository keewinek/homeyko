# Architektura

## Stack technologiczny

- **Strona:** czysty HTML (`public/index.html`, `public/kontakt.html`,
  `public/admin.html`, `public/kontakt/pomysl.html`,
  `public/kontakt/pytania.html`), serwowana pod czystymi URL-ami bez
  `.html` (`cleanUrls` w `vercel.json`): `/`, `/kontakt`, `/kontakt/pomysl`,
  `/kontakt/pytania`, `/admin`
- **Style:** [Tailwind CSS](https://tailwindcss.com/) v4 (CLI), źródło w
  `src/input.css`, kompilowane do `public/css/styles.css`
- **JS (front):** vanilla JavaScript (`public/js/*.js`): menu mobilne,
  paralaksa tła w hero, formularz kontaktowy, panel admina
- **Backend:** Vercel Serverless Functions (Node.js, CommonJS) w `api/`
- **Baza danych:** Postgres przez Neon (integracja Vercel Marketplace),
  klient `@neondatabase/serverless`
- **Hosting:** Vercel (build command `npm run build`, output dir `public`).
  Wybrany zamiast Netlify, bo darmowy plan Vercela ma limit 100
  deployów/dzień (reset codziennie), a Netlify free to ~20 deployów na cały
  **miesiąc** (limit kredytowy) i po przekroczeniu zamraża wszystkie
  projekty na koncie do końca miesiąca. Zbyt ryzykowne przy częstych,
  szybkich poprawkach.

## Struktura repozytorium

```
public/                # publikowany katalog (output dir na Vercel)
  index.html              # strona główna
  kontakt.html             # domyślny formularz (typ "pomysl")
  kontakt/pomysl.html       # "Zgłoś pomysł" pod czystym URL /kontakt/pomysl
  kontakt/pytania.html      # "Zadaj pytanie" pod czystym URL /kontakt/pytania
  admin.html                # panel admina (logowanie + lista zgłoszeń)
  css/styles.css             # skompilowany CSS (generowany, zacommitowany)
  js/main.js                 # menu mobilne + paralaksa (strona główna)
  js/kontakt.js               # obsługa formularza kontaktowego
  js/admin.js                  # logowanie + lista/usuwanie zgłoszeń
  images/                        # zdjęcia i logotypy kampanii
  favicon.ico
api/                    # Vercel Serverless Functions (Node.js)
  submit.js                # POST, zapis zgłoszenia (publiczne)
  login.js                  # POST, login+hasło; pierwsze logowanie na
                             #   dany login ustawia to hasło jako docelowe
  logout.js                  # POST, czyści cookie sesji
  me.js                       # GET, zwraca username zalogowanego (401 jeśli brak)
  submissions.js               # GET/DELETE, lista/usuwanie (wymaga loginu)
lib/
  db.js                   # klient Neon (@neondatabase/serverless) + schema
  auth.js                  # podpisywanie/weryfikacja cookie sesji (HMAC),
                            #   token niesie username
  password.js                # hashowanie/weryfikacja haseł (scrypt + sól)
scripts/
  manage-users.js          # CLI: dodawanie/reset/usuwanie loginów sztabu
                            #   (uruchamiane lokalnie, wymaga DATABASE_URL)
src/input.css           # źródło Tailwinda (@import "tailwindcss" + custom CSS)
package.json            # dependencies: @neondatabase/serverless;
                         # devDependencies: tailwindcss, @tailwindcss/cli
vercel.json              # build/deploy + cleanUrls
.env.example             # wymagane zmienne środowiskowe
```

## Komendy

- `npm install`: instaluje zależności (Tailwind + klient Neon)
- `npm run build`: buduje `public/css/styles.css` z `src/input.css`
- `npm run watch`: buduje w trybie watch podczas developmentu

## Deploy

**Vercel + Git:** połącz repo w panelu Vercel ("Add New Project" → Import z
GitHub → wybierz `keewinek/homeyko`). Vercel wykryje `vercel.json` (build
command `npm run build`, output directory `public`) i katalog `api/` jako
Serverless Functions, i będzie deployował automatycznie po każdym pushu.
Domena własna (np. homeyko.pl) konfigurowana w ustawieniach projektu na
Vercelu (Domains).

### Środowiska: produkcja vs preview

- **`main`** to branch produkcyjny, spięty z `homeyko.pl`. Do czasu
  oficjalnego release'u zawiera tylko pustą stronę (`public/index.html`
  bez treści kampanii), żeby nie zdradzać programu przed startem.
- **`preview`** to branch roboczy z pełną, aktualną wersją strony. Spięty
  z domeną `preview.homeyko.pl` (Settings → Domains → Environment:
  Preview → Git Branch: `preview`).
- Merge `preview` → `main` dopiero na wyraźną decyzję o publikacji.

**Uwaga o `rewrites` w `vercel.json`:** próba przepisania `/kontakt/:typ`
na `/kontakt.html` (dynamiczna i jawna wersja) 404owała w produkcji mimo
poprawnej składni. Zamiast tego czyste URL-e formularza są zrealizowane
jako prawdziwe pliki (`public/kontakt/pomysl.html`,
`public/kontakt/pytania.html`) mapowane przez `cleanUrls`, tym samym
mechanizmem co `/admin`.

### Wymagana konfiguracja przed pierwszym użyciem formularzy/admina

1. W panelu Vercel: **Storage → Marketplace → Neon**. Dodaje bazę
   Postgres i sam wstrzykuje `DATABASE_URL` do projektu.
2. W **Settings → Environment Variables** dodać ręcznie:
   - `ADMIN_SESSION_SECRET`: dowolny długi losowy ciąg (sekret do
     podpisywania cookie sesji)
3. Tabele `submissions` i `sztab_users` tworzą się same przy pierwszym
   zapytaniu (`CREATE TABLE IF NOT EXISTS` w `lib/db.js`). Nie trzeba nic
   ręcznie migrować.
4. Dodać loginy członków sztabu (lokalnie, z `DATABASE_URL` w env):
   ```
   DATABASE_URL="..." node scripts/manage-users.js add kasia piotr ania ...
   ```
   Loginy zaczynają bez hasła, każda osoba ustawia je sama przy
   pierwszym logowaniu na `/admin` (wpisuje swój login i nowe hasło;
   to hasło zostaje zapisane jako docelowe).

Zobacz `.env.example`.

## Logowanie do panelu admina

- Jeden login to jeden członek sztabu, w tabeli `sztab_users`
  (`username`, `password_hash`, brak innych danych osobowych).
- Hasła nigdy nie są przechowywane w postaci jawnej ani jako sam
  SHA-256. Używany jest `scrypt` (wbudowany w Node.js `crypto`, solony,
  "memory-hard", odporny na ataki brute-force/rainbow tables),
  `lib/password.js`.
- Flow logowania (`api/login.js`) jest "self-service": administrator
  najpierw dodaje sam **login** (`scripts/manage-users.js add ...`) bez
  hasła; dana osoba wchodzi na `/admin`, wpisuje swój login i nowe
  hasło. Jeśli login istnieje i nie ma jeszcze hasła, to podane hasło
  zostaje zapisane jako docelowe. Kolejne logowania wymagają już zgodnego
  hasła.
  **Uwaga:** to oznacza, że kto pierwszy wpisze dany (jeszcze
  nieaktywowany) login i ustawi hasło, ten go przejmuje. Loginy trzeba
  rozdać sztabowi prywatnie i poprosić o rejestrację od razu.
  `scripts/manage-users.js reset <login>` kasuje ustawione hasło (login
  można wtedy przejąć/zarejestrować od nowa), przydatne przy zapomnianym
  haśle albo błędnej rejestracji.
- Sesja to cookie podpisane HMAC-em (`lib/auth.js`), niosące username i
  ważne 7 dni. `GET /api/me` zwraca zalogowany login (panel pokazuje
  "Zalogowano jako: ...").

## Uwagi

- Wcześniej był to szkielet Fresh/Deno, przepisany na statyczny
  HTML/Tailwind/JS, bo strona kampanii samorządowej nie potrzebowała
  backendu. Backend (Vercel Functions + Postgres) doszedł tylko pod
  formularze "Zgłoś pomysł"/"Zadaj pytanie" i panel admina.
- `api/submit.js` ma honeypot (`website`) jako podstawową ochronę
  antyspamową, bez CAPTCHA.
- **Styl treści:** nigdy nie używamy długiego myślnika (—) w tekstach na
  stronie ani w dokumentacji projektu. Zamiast tego: przecinek, kropka,
  dwukropek albo nawiasy, w zależności od kontekstu.
