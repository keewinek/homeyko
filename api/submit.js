const crypto = require("crypto");
const { sql, ensureSchema } = require("../lib/db");

const ALLOWED_TYPES = new Set(["pomysl", "pytanie"]);

const MIN_MESSAGE_LENGTH = 3;
const MAX_MESSAGE_LENGTH = 500;

// Dozwolone: litery (także polskie znaki), cyfry, białe znaki i
// podstawowa interpunkcja. Filtrujemy też na serwerze, bo klientowi
// (JS w przeglądarce) nie ufamy, to tylko wygoda dla użytkownika.
const ALLOWED_CHARS_REGEX = /[^\p{L}\p{N}\s.,!?:;'"()\-/%&+]/gu;

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

  const filteredMessage = String(message || "").replace(ALLOWED_CHARS_REGEX, "");
  const trimmedMessage = filteredMessage.trim();
  if (
    trimmedMessage.length < MIN_MESSAGE_LENGTH ||
    trimmedMessage.length > MAX_MESSAGE_LENGTH
  ) {
    res.status(400).json({
      error: `Wiadomość musi mieć od ${MIN_MESSAGE_LENGTH} do ${MAX_MESSAGE_LENGTH} znaków`,
    });
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
