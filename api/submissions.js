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
      const rows = await sql`
        SELECT id, type, message, contact, created_at
        FROM submissions
        ORDER BY created_at DESC
      `;
      res.status(200).json({ submissions: rows });
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
