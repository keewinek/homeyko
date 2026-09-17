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

  // Pod zapytanie limitu zgłoszeń (ip_hash + okno czasowe) w api/submit.js.
  await sql`
    CREATE INDEX IF NOT EXISTS submissions_ip_hash_created_at_idx
    ON submissions (ip_hash, created_at)
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
