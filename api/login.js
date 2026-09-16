const { createSessionToken, sessionCookieHeader } = require("../lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(500).json({ error: "Panel admina nie jest skonfigurowany" });
    return;
  }

  const { password } = req.body || {};
  if (password !== adminPassword) {
    res.status(401).json({ error: "Nieprawidłowe hasło" });
    return;
  }

  const token = createSessionToken();
  res.setHeader("Set-Cookie", sessionCookieHeader(token));
  res.status(200).json({ ok: true });
};
