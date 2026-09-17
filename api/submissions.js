const { sql, ensureSchema } = require("../lib/db");
const { isAuthenticated } = require("../lib/auth");

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Wymagane logowanie" });
    return;
  }

  try {
    await ensureSchema();

    if (req.method === "GET") {
      const type = req.query.type ? String(req.query.type) : null;
      const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
      const offset = Math.max(Number(req.query.offset) || 0, 0);

      const rows = type
        ? await sql`
            SELECT id, type, message, contact, created_at
            FROM submissions
            WHERE type = ${type}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : await sql`
            SELECT id, type, message, contact, created_at
            FROM submissions
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `;

      const totalRows = type
        ? await sql`SELECT COUNT(*)::int AS count FROM submissions WHERE type = ${type}`
        : await sql`SELECT COUNT(*)::int AS count FROM submissions`;

      res.status(200).json({ submissions: rows, total: totalRows[0].count });
      return;
    }

    if (req.method === "DELETE") {
      const id = Number(req.query.id);
      if (!id) {
        res.status(400).json({ error: "Brak id" });
        return;
      }
      await sql`DELETE FROM submissions WHERE id = ${id}`;
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
