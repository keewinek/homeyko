const { sql, ensureSchema } = require("../lib/db");
const { isAuthenticated, getSessionUsername } = require("../lib/auth");
const { logAdminActivity } = require("../lib/admin-log");

module.exports = async function handler(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Wymagane logowanie" });
    return;
  }

  try {
    await ensureSchema();

    if (req.method === "GET") {
      const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
      const offset = Math.max(Number(req.query.offset) || 0, 0);

      const rows = await sql`
        SELECT id, first_name, last_name, class_name, contact, motivation, created_at
        FROM recruitment_applications
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const totalRows = await sql`SELECT COUNT(*)::int AS count FROM recruitment_applications`;

      res.status(200).json({ applications: rows, total: totalRows[0].count });
      return;
    }

    if (req.method === "DELETE") {
      const id = Number(req.query.id);
      if (!id) {
        res.status(400).json({ error: "Brak id" });
        return;
      }
      const existingRows = await sql`
        SELECT first_name, last_name, class_name FROM recruitment_applications WHERE id = ${id}
      `;
      const existing = existingRows[0];
      await sql`DELETE FROM recruitment_applications WHERE id = ${id}`;
      if (existing) {
        await logAdminActivity({
          actorUsername: getSessionUsername(req),
          action: "submission_delete",
          target: `rekrutacja:${id}`,
          details: `${existing.first_name} ${existing.last_name}, ${existing.class_name}`,
        });
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
