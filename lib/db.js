const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      contact TEXT,
      ip_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Tabela mogła powstać przed dodaniem tej kolumny (starsze deploye).
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ip_hash TEXT`;

  // Moderacja spamu: is_spam ustawiane przez cron (api/cron/check-spam.js) po
  // sprawdzeniu treści przez AI. spam_checked_at = null oznacza "jeszcze nie
  // sprawdzone", więc cron bierze na warsztat tylko te zgłoszenia.
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS spam_checked_at TIMESTAMPTZ`;

  // Pod zapytanie limitu zgłoszeń (ip_hash + okno czasowe) w api/submit.js.
  await sql`
    CREATE INDEX IF NOT EXISTS submissions_ip_hash_created_at_idx
    ON submissions (ip_hash, created_at)
  `;

  // Pod zapytanie crona: "zgłoszenia jeszcze nie sprawdzone pod kątem spamu".
  await sql`
    CREATE INDEX IF NOT EXISTS submissions_spam_checked_at_idx
    ON submissions (spam_checked_at)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sztab_users (
      username TEXT PRIMARY KEY,
      password_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      password_set_at TIMESTAMPTZ
    )
  `;

  // Poziom uprawnień: 1 = moderator (domyślny), 2 = administrator (dostęp do
  // panelu "Administracja": lista sztabu i log aktywności).
  await sql`ALTER TABLE sztab_users ADD COLUMN IF NOT EXISTS permission_level INTEGER NOT NULL DEFAULT 1`;
  await sql`ALTER TABLE sztab_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ`;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_activity_log (
      id SERIAL PRIMARY KEY,
      actor_username TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT,
      details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Pod listę logów w panelu "Administracja", sortowaną od najnowszych.
  await sql`
    CREATE INDEX IF NOT EXISTS admin_activity_log_created_at_idx
    ON admin_activity_log (created_at DESC)
  `;
}

module.exports = { sql, ensureSchema };
