const crypto = require("crypto");
const { sql, ensureSchema } = require("../lib/db");

const ALLOWED_TYPES = new Set(["pomysl", "pytanie"]);

// Antyspam: ta sama zasada dla wszystkich, także dla innych sztabów,
// które mogłyby próbować zalać nas zgłoszeniami. Rozsądny limit, nie
// blokujący normalnego użytkowania (np. całej szkoły za jednym IP NAT).
const RATE_LIMIT_MAX = 7;
const RATE_LIMIT_WINDOW = "1 hour";
const RATE_LIMIT_MESSAGE = "Co za dużo, to niezdrowo! Zwolnij trochę.";

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

// Nie trzymamy surowego IP, tylko keyowany hash (pieprz z sekretu sesji
// admina, który już mamy skonfigurowany), żeby dało się liczyć zgłoszenia
// z tego samego adresu bez przechowywania samego adresu.
function hashIp(ip) {
  const secret = process.env.ADMIN_SESSION_SECRET || "homeyko-fallback-pepper";
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

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
  const ipHash = hashIp(getClientIp(req));

  try {
    await ensureSchema();

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count
      FROM submissions
      WHERE ip_hash = ${ipHash}
        AND created_at > now() - ${RATE_LIMIT_WINDOW}::interval
    `;

    if (count >= RATE_LIMIT_MAX) {
      res.status(429).json({ error: RATE_LIMIT_MESSAGE, rateLimited: true });
      return;
    }

    await sql`
      INSERT INTO submissions (type, message, contact, ip_hash)
      VALUES (${type}, ${trimmedMessage}, ${trimmedContact}, ${ipHash})
    `;
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera, spróbuj ponownie później" });
  }
};
