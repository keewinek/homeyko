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

    const rows = await sql`
      SELECT
        username,
        permission_level,
        (password_hash IS NOT NULL) AS password_set,
        created_at,
        last_login_at
      FROM sztab_users
      ORDER BY username
    `;

    res.status(200).json({ users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
