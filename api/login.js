const { sql, ensureSchema } = require("../lib/db");
const { hashPassword, verifyPassword } = require("../lib/password");
const { createSessionToken, sessionCookieHeader } = require("../lib/auth");

const USERNAME_RE = /^[a-z0-9_-]{2,32}$/;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { username, password } = req.body || {};
  const normalizedUsername = String(username || "").trim().toLowerCase();

  if (!USERNAME_RE.test(normalizedUsername)) {
    res.status(400).json({ error: "Nieprawidłowy login" });
    return;
  }

  const rawPassword = String(password || "");
  if (rawPassword.length < 8) {
    res.status(400).json({ error: "Hasło musi mieć co najmniej 8 znaków" });
    return;
  }

  try {
    await ensureSchema();

    const rows = await sql`
      SELECT username, password_hash FROM sztab_users WHERE username = ${normalizedUsername}
    `;
    const user = rows[0];

    if (!user) {
      res.status(401).json({ error: "Nieznany login. Skontaktuj się z administratorem sztabu" });
      return;
    }

    if (!user.password_hash) {
      // Pierwsze logowanie na ten login: ustawiamy podane hasło jako docelowe.
      const hash = hashPassword(rawPassword);
      await sql`
        UPDATE sztab_users
        SET password_hash = ${hash}, password_set_at = now()
        WHERE username = ${normalizedUsername}
      `;
    } else if (!verifyPassword(rawPassword, user.password_hash)) {
      res.status(401).json({ error: "Nieprawidłowe hasło" });
      return;
    }

    const token = createSessionToken(normalizedUsername);
    res.setHeader("Set-Cookie", sessionCookieHeader(token));
    res.status(200).json({ ok: true, username: normalizedUsername });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
