const { sql, ensureSchema } = require("../../lib/db");
const { getSessionUsername } = require("../../lib/auth");
const { isAdministrator } = require("../../lib/permissions");

module.exports = async function handler(req, res) {
  const username = getSessionUsername(req);
  if (!username) {
    res.status(401).json({ error: "Wymagane logowanie" });
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    await ensureSchema();

    if (!(await isAdministrator(username))) {
      res.status(403).json({ error: "Brak uprawnień" });
      return;
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const rows = await sql`
      SELECT id, actor_username, action, target, details, created_at
      FROM admin_activity_log
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const totalRows = await sql`SELECT COUNT(*)::int AS count FROM admin_activity_log`;

    res.status(200).json({ logs: rows, total: totalRows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
