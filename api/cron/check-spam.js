const crypto = require("crypto");
const { sql, ensureSchema } = require("../../lib/db");
const { isSpam } = require("../../lib/spam-detector");

// Ile zgłoszeń bierzemy na jeden przebieg crona. Reszta poczeka do kolejnego
// uruchomienia (co godzinę), więc to jest sufit przepustowości moderacji:
// 50 na godzinę, czyli 1200 na dobę.
const BATCH_SIZE = 50;

// Ile zapytań do Groqa leci równocześnie. Za dużo naraz to ryzyko limitu
// zapytań na minutę po stronie Groqa (i odrzuconych sprawdzeń), za mało to
// ryzyko przekroczenia czasu funkcji. Piątka mieści cały batch w kilkunastu
// sekundach, przy maxDuration ustawionym w vercel.json na 60 s.
const CONCURRENCY = 5;

// Vercel Cron dokłada nagłówek "Authorization: Bearer $CRON_SECRET"
// automatycznie, jeśli w projekcie ustawiona jest zmienna CRON_SECRET.
// Tak samo woła ten endpoint workflow .github/workflows/moderation-cron.yml.
function isAuthorizedCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = req.headers.authorization || "";
  const expected = `Bearer ${secret}`;

  const headerBuf = Buffer.from(header);
  const expectedBuf = Buffer.from(expected);
  if (headerBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(headerBuf, expectedBuf);
}

async function checkOne(row, stats) {
  try {
    const spam = await isSpam(row.message);
    await sql`
      UPDATE submissions
      SET is_spam = ${spam}, spam_checked_at = now()
      WHERE id = ${row.id}
    `;
    stats.checked += 1;
    if (spam) stats.spamFound += 1;
  } catch (err) {
    // Zostawiamy spam_checked_at = null, żeby ponowić przy kolejnym
    // uruchomieniu crona zamiast fałszywie uznać zgłoszenie za czyste.
    stats.failed += 1;
    console.error(`Spam check failed for submission ${row.id}:`, err);
  }
}

module.exports = async function handler(req, res) {
  if (!isAuthorizedCronRequest(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await ensureSchema();

    const pending = await sql`
      SELECT id, message
      FROM submissions
      WHERE spam_checked_at IS NULL
      ORDER BY created_at ASC
      LIMIT ${BATCH_SIZE}
    `;

    const stats = { checked: 0, spamFound: 0, failed: 0 };

    // Kolejka z ograniczoną równoległością: CONCURRENCY "pracowników" bierze
    // kolejne zgłoszenia z tej samej listy, aż się skończą.
    let next = 0;
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, pending.length) }, async () => {
        while (next < pending.length) {
          const row = pending[next++];
          await checkOne(row, stats);
        }
      })
    );

    res.status(200).json({ ok: true, pending: pending.length, ...stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
