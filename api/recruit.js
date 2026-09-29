const crypto = require("crypto");
const { sql, ensureSchema } = require("../lib/db");

const NAME_MIN = 2;
const NAME_MAX = 40;
const CLASS_MIN = 1;
const CLASS_MAX = 10;
const CONTACT_MIN = 3;
const CONTACT_MAX = 100;
const MOTIVATION_MIN = 10;
const MOTIVATION_MAX = 1000;

// Te same znaki co w api/submit.js: litery (także polskie), cyfry, białe
// znaki i podstawowa interpunkcja. Klientowi nie ufamy, filtrujemy też tu.
const ALLOWED_CHARS_REGEX = /[^\p{L}\p{N}\s.,!?:;'"()\-/%&+]/gu;

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = "1 hour";
const RATE_LIMIT_MESSAGE = "Co za dużo, to niezdrowo! Spróbuj ponownie później.";

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

// Nie trzymamy surowego IP, tylko keyowany hash (tak samo jak w submit.js).
function hashIp(ip) {
  const secret = process.env.ADMIN_SESSION_SECRET || "homeyko-fallback-pepper";
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

function clean(value, max) {
  return String(value || "")
    .replace(ALLOWED_CHARS_REGEX, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};

  // Honeypot: pole niewidoczne dla ludzi, wypełniane tylko przez boty.
  if (body.website) {
    res.status(200).json({ ok: true });
    return;
  }

  const firstName = clean(body.firstName, NAME_MAX);
  const lastName = clean(body.lastName, NAME_MAX);
  const className = clean(body.className, CLASS_MAX);
  const contact = clean(body.contact, CONTACT_MAX);
  // Motywację zostawiamy z nowymi liniami, tylko przycinamy.
  const motivation = String(body.motivation || "")
    .replace(ALLOWED_CHARS_REGEX, "")
    .trim();

  if (firstName.length < NAME_MIN || lastName.length < NAME_MIN) {
    res.status(400).json({ error: "Podaj imię i nazwisko" });
    return;
  }
  if (className.length < CLASS_MIN) {
    res.status(400).json({ error: "Podaj klasę" });
    return;
  }
  if (contact.length < CONTACT_MIN) {
    res.status(400).json({ error: "Zostaw kontakt do siebie" });
    return;
  }
  if (motivation.length < MOTIVATION_MIN || motivation.length > MOTIVATION_MAX) {
    res.status(400).json({
      error: `Odpowiedź musi mieć od ${MOTIVATION_MIN} do ${MOTIVATION_MAX} znaków`,
    });
    return;
  }

  const ipHash = hashIp(getClientIp(req));

  try {
    await ensureSchema();

    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count
      FROM recruitment_applications
      WHERE ip_hash = ${ipHash}
        AND created_at > now() - ${RATE_LIMIT_WINDOW}::interval
    `;

    if (count >= RATE_LIMIT_MAX) {
      res.status(429).json({ error: RATE_LIMIT_MESSAGE, rateLimited: true });
      return;
    }

    await sql`
      INSERT INTO recruitment_applications
        (first_name, last_name, class_name, contact, motivation, ip_hash)
      VALUES (${firstName}, ${lastName}, ${className}, ${contact}, ${motivation}, ${ipHash})
    `;
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera, spróbuj ponownie później" });
  }
};
