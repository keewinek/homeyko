const { sql, ensureSchema } = require("../lib/db");

const ALLOWED_TYPES = new Set(["pomysl", "pytanie"]);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { type, message, contact, website } = req.body || {};

  // Honeypot: pole niewidoczne dla ludzi, wypełniane tylko przez boty.
  if (website) {
    res.status(200).json({ ok: true });
    return;
  }

  if (!ALLOWED_TYPES.has(type)) {
    res.status(400).json({ error: "Nieprawidłowy typ zgłoszenia" });
    return;
  }

  const trimmedMessage = String(message || "").trim();
  if (!trimmedMessage || trimmedMessage.length > 2000) {
    res.status(400).json({ error: "Wiadomość jest wymagana (max 2000 znaków)" });
    return;
  }

  const trimmedContact = contact ? String(contact).trim().slice(0, 200) : null;

  try {
    await ensureSchema();
    await sql`
      INSERT INTO submissions (type, message, contact)
      VALUES (${type}, ${trimmedMessage}, ${trimmedContact})
    `;
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera, spróbuj ponownie później" });
  }
};
