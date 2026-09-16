const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      contact TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

module.exports = { sql, ensureSchema };
