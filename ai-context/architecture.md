# Architektura

## Stack technologiczny

- **Strona:** czysty HTML (`public/index.html`, `public/kontakt.html`,
  `public/admin.html`, `public/kontakt/pomysl.html`,
  `public/kontakt/pytania.html`, `public/admin/zgloszone_pomysly.html`,
  `public/admin/zgloszone_pytania.html`), serwowana pod czystymi URL-ami
  bez `.html` (`cleanUrls` w `vercel.json`): `/`, `/kontakt`,
  `/kontakt/pomysl`, `/kontakt/pytania`, `/admin`,
  `/admin/zgloszone_pomysly`, `/admin/zgloszone_pytania`
- **Style:** [Tailwind CSS](https://tailwindcss.com/) v4 (CLI), źródło w
  `src/input.css`, kompilowane do `public/css/styles.css`
- **JS (front):** vanilla JavaScript (`public/js/*.js`): menu mobilne,
  paralaksa tła w hero, formularz kontaktowy, panel admina (logowanie +
  dashboard menu, lista/usuwanie zgłoszeń na podstronach dashboardu)
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
  admin.html                # panel admina: logowanie + dashboard menu
  admin/zgloszone_pomysly.html # lista zgłoszonych pomysłów (wymaga loginu)
  admin/zgloszone_pytania.html # lista zgłoszonych pytań (wymaga loginu)
  css/styles.css             # skompilowany CSS (generowany, zacommitowany)
  js/main.js                 # menu mobilne + paralaksa (strona główna)
  js/kontakt.js               # obsługa formularza kontaktowego
  js/admin.js                  # logowanie (z loading spinnerem) + dashboard menu
  js/admin-list.js              # lista/usuwanie zgłoszeń na podstronach
                                 #   dashboardu, ze skeleton loadingiem i
                                 #   stronicowaniem (po 50, przycisk "Załaduj więcej")
  images/                        # zdjęcia i logotypy kampanii
  favicon.ico
api/                    # Vercel Serverless Functions (Node.js)
  submit.js                # POST, zapis zgłoszenia (publiczne)
  login.js                  # POST, login+hasło; pierwsze logowanie na
                             #   dany login ustawia to hasło jako docelowe
  logout.js                  # POST, czyści cookie sesji
  me.js                       # GET, zwraca username zalogowanego (401 jeśli brak)
  submissions.js               # GET/DELETE, lista/usuwanie (wymaga loginu);
                                #   GET przyjmuje opcjonalne ?type=, ?limit=
                                #   (domyślnie 50, max 100), ?offset=, zwraca
                                #   też total (całkowitą liczbę zgłoszeń);
                                #   sortowanie: nie-spam najpierw, potem
                                #   najnowsze
  cron/
    check-spam.js               # GET, wywoływane co godzinę przez Vercel
                                  #   Cron (chronione CRON_SECRET), sprawdza
                                  #   nowe zgłoszenia (spam_checked_at IS
                                  #   NULL) przez API Groq i ustawia is_spam
lib/
  db.js                   # klient Neon (@neondatabase/serverless) + schema
  auth.js                  # podpisywanie/weryfikacja cookie sesji (HMAC),
                            #   token niesie username
  password.js                # hashowanie/weryfikacja haseł (scrypt + sól)
  spam-detector.js           # klasyfikacja treści spam/nie spam przez
                              #   darmowe API Groq (chat completions)
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
- **Cron (`vercel.json` → `crons`) działa tylko na deployu Produkcyjnym**
  (branch `main`), Vercel nie odpala cronów na Preview. Dlatego
  `api/cron/check-spam.js` jest wywoływany na `preview.homeyko.pl`
  wyłącznie przez GitHub Actions (`.github/workflows/moderation-cron.yml`,
  co godzinę, przez `curl` z nagłówkiem `Authorization: Bearer
  $CRON_SECRET`), niezależnie od Vercela.
- **Pułapka: wpis w `vercel.json` → `crons` z harmonogramem częstszym niż
  raz dziennie wywalał WSZYSTKIE deploye (Preview i Produkcję), nie tylko
  Cron.** Darmowy plan Vercela (Hobby) dopuszcza cron jobs, ale tylko
  z harmonogramem nie częstszym niż raz na dobę; próba dodania wpisu
  `"schedule": "0 * * * *"` (co godzinę) do `vercel.json` powodowała, że
  Vercel odrzucał każdy nowy deploy jeszcze przed budową (żaden branch,
  żaden commit, bez widocznego błędu w GitHubie), bo `vercel.json` jest
  walidowany dla każdego deploya niezależnie od tego, czy cron miałby się
  tam w ogóle uruchomić. Efekt: `preview.homeyko.pl` przestało się
  aktualizować mimo zielonych pushy i działającego workflow syncującego.
  Rozwiązanie na razie: cron moderacji jest tylko w GitHub Actions (patrz
  wyżej), a `vercel.json` nie ma sekcji `crons`. Jeśli kiedyś wraca
  potrzeba crona w Vercelu, harmonogram musi być `"0 0 * * *"` (raz
  dziennie) albo trzeba przejść na plan Pro.

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
   - `CRON_SECRET`: dowolny długi losowy ciąg. Vercel Cron sam dokłada go
     jako nagłówek `Authorization: Bearer ...` do wywołań
     `api/cron/check-spam.js`, jeśli zmienna nosi dokładnie tę nazwę
   - `GROQ_API_KEY`: klucz do darmowego API Groq
     (https://console.groq.com/keys), używany przez moderację spamu
3. Tabele `submissions` i `sztab_users` tworzą się same przy pierwszym
   zapytaniu (`CREATE TABLE IF NOT EXISTS` w `lib/db.js`), podobnie jak
   kolumny `is_spam`/`spam_checked_at` (`ALTER TABLE ... ADD COLUMN IF NOT
   EXISTS`). Nie trzeba nic ręcznie migrować.
4. Dodać loginy członków sztabu (lokalnie, z `DATABASE_URL` w env):
   ```
   DATABASE_URL="..." node scripts/manage-users.js add kasia piotr ania ...
   ```
   Loginy zaczynają bez hasła, każda osoba ustawia je sama przy
   pierwszym logowaniu na `/admin` (wpisuje swój login i nowe hasło;
   to hasło zostaje zapisane jako docelowe).

Zobacz `.env.example`.

**WAŻNE, częsta pułapka: integracja Neon ↔ Vercel tworzy osobną gałąź
bazy danych (Neon branch) per gałąź gita.** Projekt Neon nazywa się
"Homeyko" (`shiny-pond-15395839`). Gałąź `main`/produkcja używa Neon
brancha `production` (domyślny/primary), a gałąź `preview` używa
osobnego Neon brancha o nazwie `preview`. Każdy branch roboczy
`claude/...` dostaje też własny, tymczasowy Neon branch
(`preview/claude/...`). To znaczy, że zapytanie SQL wykonane bez
podania `branch_id` (np. przez Neon MCP) trafia domyślnie do brancha
`production`, a NIE do tego, którego używa `preview.homeyko.pl`. Przy
ręcznych operacjach na danych (np. dodawanie loginów sztabu przez SQL
zamiast `scripts/manage-users.js` z prawdziwym `DATABASE_URL`) trzeba
jawnie wskazać właściwy branch (`preview` dla preview.homeyko.pl,
`production` dla homeyko.pl), inaczej zmiana nie będzie widoczna tam,
gdzie się jej testuje.

## Logowanie do panelu admina

- Hasło (nowe, ustawiane przy pierwszym logowaniu) musi mieć min. 8
  znaków (`api/login.js`), niezależnie od tego, czy login już ma
  zapisane hasło. To sprawdzenie działa zanim padnie zapytanie do bazy,
  więc krótkiego "tymczasowego" hasła (np. "admin") nie da się w ogóle
  wysłać.
- `ADMIN_SESSION_SECRET` (Vercel → Settings → Environment Variables)
  musi być ustawiony dla **każdego** środowiska osobno (Production,
  Preview, Development), inaczej `/api/login` zwraca 500 ("Missing
  ADMIN_SESSION_SECRET env var"). Zmienna trafia do już zbudowanych
  funkcji dopiero po nowym deployu, więc samo zapisanie jej w panelu
  nie naprawia aktualnie działającego deploya, trzeba go redeployować
  (uważać, żeby redeployować właściwy branch/projekt, nie np. `main`
  zamiast `preview`).
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

### Aktualny skład sztabu (loginy w `sztab_users`)

Dodane 2026-09-17, na podstawie zrzutów ekranu z listą sztabu (bez haseł,
każdy ustawia swoje przy pierwszym logowaniu na `/admin`). Login to
imię.nazwisko, małymi literami, bez polskich znaków:

- filip.galazka (administrator kampanii)
- alicja.janaszek
- diana.koronevich
- julia.stawczyk
- karolina.opara
- natalia.holubowicz
- waleria.wroblewska
- wojciech.kolacz
- alicja.skrzymowska
- hanna.bialas
- kamil.kamyk
- maria.grzyb
- marta.debek
- natasza.kurpiewska
- zosia.piskorz

Uwaga: "Administrator" przy Filipie na zrzutach to etykieta/rola w innej
aplikacji (ekran "znajomi" z przyciskami "Dodaj znajomego"), niepowiązana
z tym panelem, tabela `sztab_users` nie ma pojęcia roli, wszystkie loginy
są równorzędne.

## Uwagi

- Wcześniej był to szkielet Fresh/Deno, przepisany na statyczny
  HTML/Tailwind/JS, bo strona kampanii samorządowej nie potrzebowała
  backendu. Backend (Vercel Functions + Postgres) doszedł tylko pod
  formularze "Zgłoś pomysł"/"Zadaj pytanie" i panel admina.
- `api/submit.js` ma honeypot (`website`) jako podstawową ochronę
  antyspamową, bez CAPTCHA.
- **Moderacja spamu przez AI (dodane 2026-09-17):** cron
  `api/cron/check-spam.js`, odpalany co godzinę przez Vercel Cron
  (`vercel.json` → `crons`), bierze zgłoszenia jeszcze nie sprawdzone
  (`spam_checked_at IS NULL`), klasyfikuje treść przez darmowe API Groq
  (`lib/spam-detector.js`) i ustawia `is_spam`/`spam_checked_at`. Panel
  admina (`public/js/admin-list.js`) pokazuje takie zgłoszenia na końcu
  listy (`ORDER BY is_spam ASC` w `api/submissions.js`) z etykietą "Wykryto
  spam" i wyszarzeniem karty, a usuwanie ich nie wymaga potwierdzenia
  popupem (w przeciwieństwie do zwykłych zgłoszeń). Błąd wywołania AI
  zostawia zgłoszenie niesprawdzone (retry przy kolejnym uruchomieniu
  crona), zamiast fałszywie oznaczać je jako "nie spam".
- **Styl treści:** nigdy nie używamy długiego myślnika (—) w tekstach na
  stronie ani w dokumentacji projektu. Zamiast tego: przecinek, kropka,
  dwukropek albo nawiasy, w zależności od kontekstu.
