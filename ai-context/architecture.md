# Architektura

## Stack technologiczny

- **Strona:** czysty HTML (`public/index.html`, `public/kontakt.html`,
  `public/admin.html`)
- **Style:** [Tailwind CSS](https://tailwindcss.com/) v4 (CLI), źródło w
  `src/input.css`, kompilowane do `public/css/styles.css`
- **JS (front):** vanilla JavaScript (`public/js/*.js`) — menu mobilne,
  paralaksa tła w hero, formularz kontaktowy, panel admina
- **Backend:** Vercel Serverless Functions (Node.js, CommonJS) w `api/`
- **Baza danych:** Postgres przez Neon (integracja Vercel Marketplace),
  klient `@neondatabase/serverless`
- **Hosting:** Vercel (build command `npm run build`, output dir `public`) —
  wybrany zamiast Netlify, bo darmowy plan Vercela ma limit 100
  deployów/dzień (reset codziennie), a Netlify free to ~20 deployów na cały
  **miesiąc** (limit kredytowy) i po przekroczeniu zamraża wszystkie
  projekty na koncie do końca miesiąca — zbyt ryzykowne przy częstych,
  szybkich poprawkach.

## Struktura repozytorium

```
public/                # publikowany katalog (output dir na Vercel)
  index.html              # strona główna
  kontakt.html             # formularz "Zgłoś pomysł" / "Zadaj pytanie"
  admin.html                # panel admina (logowanie + lista zgłoszeń)
  css/styles.css             # skompilowany CSS (generowany, zacommitowany)
  js/main.js                 # menu mobilne + paralaksa (strona główna)
  js/kontakt.js               # obsługa formularza kontaktowego
  js/admin.js                  # logowanie + lista/usuwanie zgłoszeń
  images/                        # zdjęcia i logotypy kampanii
  favicon.ico
api/                    # Vercel Serverless Functions (Node.js)
  submit.js                # POST — zapis zgłoszenia (publiczne)
  login.js                  # POST — logowanie admina, ustawia cookie sesji
  logout.js                  # POST — czyści cookie sesji
  submissions.js               # GET/DELETE — lista/usuwanie (wymaga loginu)
lib/
  db.js                   # klient Neon (@neondatabase/serverless) + schema
  auth.js                  # podpisywanie/weryfikacja cookie sesji (HMAC)
src/input.css           # źródło Tailwinda (@import "tailwindcss" + custom CSS)
package.json            # dependencies: @neondatabase/serverless;
                         # devDependencies: tailwindcss, @tailwindcss/cli
vercel.json              # konfiguracja builda/deployu na Vercel
.env.example             # wymagane zmienne środowiskowe
```

## Komendy

- `npm install` — instaluje zależności (Tailwind + klient Neon)
- `npm run build` — buduje `public/css/styles.css` z `src/input.css`
- `npm run watch` — buduje w trybie watch podczas developmentu

## Deploy

**Vercel + Git:** połącz repo w panelu Vercel ("Add New Project" → Import z
GitHub → wybierz `keewinek/homeyko`). Vercel wykryje `vercel.json` (build
command `npm run build`, output directory `public`) i katalog `api/` jako
Serverless Functions, i będzie deployował automatycznie po każdym pushu do
`main`. Domena własna (np. homeyko.pl) konfigurowana w ustawieniach
projektu na Vercelu (Domains).

### Wymagana konfiguracja przed pierwszym użyciem formularzy/admina

1. W panelu Vercel: **Storage → Marketplace → Neon** — dodaje bazę
   Postgres i sam wstrzykuje `DATABASE_URL` do projektu.
2. W **Settings → Environment Variables** dodać ręcznie:
   - `ADMIN_PASSWORD` — hasło do `/admin.html`
   - `ADMIN_SESSION_SECRET` — dowolny długi losowy ciąg (sekret do
     podpisywania cookie sesji)
3. Tabela `submissions` tworzy się sama przy pierwszym zapytaniu
   (`CREATE TABLE IF NOT EXISTS` w `lib/db.js`) — nie trzeba nic ręcznie
   migrować.

Zobacz `.env.example`.

## Uwagi

- Wcześniej był to szkielet Fresh/Deno; przepisany na statyczny
  HTML/Tailwind/JS, bo strona kampanii samorządowej nie potrzebowała
  backendu — backend (Vercel Functions + Postgres) doszedł tylko pod
  formularze "Zgłoś pomysł"/"Zadaj pytanie" i panel admina.
- Panel `/admin.html` używa prostego, jednego hasła (bez kont
  użytkowników) — wystarczające dla jednej osoby zarządzającej stroną.
  Sesja to podpisany HMAC-em cookie z 7-dniowym wygaśnięciem.
- `api/submit.js` ma honeypot (`website`) jako podstawową ochronę
  antyspamową — bez CAPTCHA.
