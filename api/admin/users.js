const { sql, ensureSchema } = require("../../lib/db");
const { getSessionUsername } = require("../../lib/auth");
const { isAdministrator } = require("../../lib/permissions");
const { logAdminActivity } = require("../../lib/admin-log");

const USERNAME_RE = /^[a-z0-9_.-]{2,32}$/;

module.exports = async function handler(req, res) {
  const username = getSessionUsername(req);
  if (!username) {
    res.status(401).json({ error: "Wymagane logowanie" });
    return;
  }

  try {
    await ensureSchema();

    if (!(await isAdministrator(username))) {
      res.status(403).json({ error: "Brak uprawnień" });
      return;
    }

    if (req.method === "GET") {
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
      return;
    }

    if (req.method === "POST") {
      const targetUsername = String((req.body || {}).username || "").trim().toLowerCase();
      if (!USERNAME_RE.test(targetUsername)) {
        res.status(400).json({
          error: "Nieprawidłowy login: dozwolone tylko litery a-z, cyfry, '.', '-' i '_', 2-32 znaki",
        });
        return;
      }

      try {
        await sql`INSERT INTO sztab_users (username) VALUES (${targetUsername})`;
      } catch (err) {
        if (err.code === "23505") {
          res.status(409).json({ error: "Ten login już istnieje" });
          return;
        }
        throw err;
      }

      await logAdminActivity({ actorUsername: username, action: "user_create", target: targetUsername });
      res.status(201).json({ ok: true });
      return;
    }

    if (req.method === "DELETE") {
      const targetUsername = String(req.query.username || "").trim().toLowerCase();
      if (!targetUsername) {
        res.status(400).json({ error: "Brak loginu" });
        return;
      }
      if (targetUsername === username) {
        res.status(400).json({ error: "Nie możesz usunąć własnego konta" });
        return;
      }
      await sql`DELETE FROM sztab_users WHERE username = ${targetUsername}`;
      await logAdminActivity({ actorUsername: username, action: "user_delete", target: targetUsername });
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === "PATCH") {
      const { username: rawTargetUsername, action } = req.body || {};
      const targetUsername = String(rawTargetUsername || "").trim().toLowerCase();
      if (!targetUsername) {
        res.status(400).json({ error: "Brak loginu" });
        return;
      }
      if (targetUsername === username) {
        res.status(400).json({ error: "Nie możesz zmienić własnego konta" });
        return;
      }

      if (action === "reset_password") {
        await sql`
          UPDATE sztab_users SET password_hash = NULL, password_set_at = NULL
          WHERE username = ${targetUsername}
        `;
        await logAdminActivity({
          actorUsername: username,
          action: "user_password_reset",
          target: targetUsername,
        });
        res.status(200).json({ ok: true });
        return;
      }

      if (action === "grant_admin" || action === "revoke_admin") {
        const level = action === "grant_admin" ? 2 : 1;
        await sql`UPDATE sztab_users SET permission_level = ${level} WHERE username = ${targetUsername}`;
        await logAdminActivity({
          actorUsername: username,
          action: action === "grant_admin" ? "user_permission_grant" : "user_permission_revoke",
          target: targetUsername,
        });
        res.status(200).json({ ok: true });
        return;
      }

      res.status(400).json({ error: "Nieznana akcja" });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
