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
}

module.exports = { sql, ensureSchema };
