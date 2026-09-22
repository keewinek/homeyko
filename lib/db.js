const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

// Ostatni obiekt tworzony przez transakcję ze schematem. Jeśli istnieje, to
// znaczy, że cała transakcja przeszła wcześniej do końca i nie ma czego
// dokładać. UWAGA: dokładając nowy obiekt do schemaStatements() trzeba
// zmienić ten marker na nowy "ostatni" obiekt, inaczej bazy, które mają już
// stary schemat, nigdy nie dostaną nowych kolumn ani indeksów.
const SCHEMA_MARKER = "public.admin_activity_log_created_at_idx";

// Stały klucz blokady doradczej. Przy pustej bazie (np. produkcja tuż po
// starcie kampanii) kilka funkcji może wystartować na zimno w tej samej
// chwili; blokada sprawia, że schemat tworzy tylko jedna z nich, a reszta
// czeka i widzi go już gotowego. Bez tego równoległe CREATE TABLE IF NOT
// EXISTS potrafią się wyłożyć na duplikacie w katalogu systemowym Postgresa.
const SCHEMA_LOCK_KEY = 8273041;

function schemaStatements() {
  return [
    sql`SELECT pg_advisory_xact_lock(${SCHEMA_LOCK_KEY})`,

    sql`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        contact TEXT,
        ip_hash TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `,

    // Tabela mogła powstać przed dodaniem tej kolumny (starsze deploye).
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ip_hash TEXT`,

    // Moderacja spamu: is_spam ustawiane przez cron (api/cron/check-spam.js) po
    // sprawdzeniu treści przez AI. spam_checked_at = null oznacza "jeszcze nie
    // sprawdzone", więc cron bierze na warsztat tylko te zgłoszenia.
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT false`,
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS spam_checked_at TIMESTAMPTZ`,

    // Pod zapytanie limitu zgłoszeń (ip_hash + okno czasowe) w api/submit.js.
    sql`
      CREATE INDEX IF NOT EXISTS submissions_ip_hash_created_at_idx
      ON submissions (ip_hash, created_at)
    `,

    // Pod zapytanie crona: "zgłoszenia jeszcze nie sprawdzone pod kątem spamu".
    sql`
      CREATE INDEX IF NOT EXISTS submissions_spam_checked_at_idx
      ON submissions (spam_checked_at)
    `,

    sql`
      CREATE TABLE IF NOT EXISTS sztab_users (
        username TEXT PRIMARY KEY,
        password_hash TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        password_set_at TIMESTAMPTZ
      )
    `,

    // Poziom uprawnień: 1 = moderator (domyślny), 2 = administrator (dostęp do
    // panelu "Administracja": lista sztabu i log aktywności).
    sql`ALTER TABLE sztab_users ADD COLUMN IF NOT EXISTS permission_level INTEGER NOT NULL DEFAULT 1`,
    sql`ALTER TABLE sztab_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ`,

    sql`
      CREATE TABLE IF NOT EXISTS admin_activity_log (
        id SERIAL PRIMARY KEY,
        actor_username TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT,
        details TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `,

    // Pod listę logów w panelu "Administracja", sortowaną od najnowszych.
    // To jest SCHEMA_MARKER: musi zostać ostatnim obiektem w tej liście.
    sql`
      CREATE INDEX IF NOT EXISTS admin_activity_log_created_at_idx
      ON admin_activity_log (created_at DESC)
    `,
  ];
}

async function checkAndApplySchema() {
  const rows = await sql`SELECT to_regclass(${SCHEMA_MARKER}) IS NOT NULL AS ready`;
  if (rows[0] && rows[0].ready) return;

  // Cały schemat w jednej transakcji, czyli w jednym zapytaniu HTTP do Neona.
  await sql.transaction(schemaStatements());
}

// Pamięć w obrębie instancji funkcji serverless. Instancja żyje między
// wywołaniami, więc schemat sprawdzamy raz na instancję, a nie przy każdym
// żądaniu. Wcześniej każde wywołanie API wysyłało 11 zapytań DDL, zanim
// zrobiło cokolwiek sensownego, a ALTER TABLE bierze na tabeli blokadę
// ACCESS EXCLUSIVE nawet wtedy, gdy kolumna już istnieje i nie ma nic do
// zrobienia. Przy kilkunastu żądaniach naraz ustawiała się kolejka po te
// blokady i wszystko za nią stało, aż do 504 po limicie czasu funkcji.
let schemaReady = null;

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = checkAndApplySchema().catch((err) => {
      // Nie zapamiętujemy nieudanej próby: kolejne żądanie ma spróbować
      // jeszcze raz, zamiast w kółko odrzucać ten sam zapamiętany błąd.
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

module.exports = { sql, ensureSchema };
