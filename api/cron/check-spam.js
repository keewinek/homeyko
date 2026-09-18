const crypto = require("crypto");
const { sql, ensureSchema } = require("../../lib/db");
const { isSpam } = require("../../lib/spam-detector");

// Ile zgłoszeń sprawdzamy jednorazowo, żeby nie przekroczyć limitu czasu
// wykonania funkcji serverless (nowe zgłoszenia i tak poczekają do kolejnego
// uruchomienia crona, co godzinę).
const BATCH_SIZE = 20;

// Vercel Cron dokłada nagłówek "Authorization: Bearer $CRON_SECRET"
// automatycznie, jeśli w projekcie ustawiona jest zmienna CRON_SECRET.
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

    let checked = 0;
    let spamFound = 0;

    await Promise.all(
      pending.map(async (row) => {
        try {
          const spam = await isSpam(row.message);
          await sql`
            UPDATE submissions
            SET is_spam = ${spam}, spam_checked_at = now()
            WHERE id = ${row.id}
          `;
          checked += 1;
          if (spam) spamFound += 1;
        } catch (err) {
          // Zostawiamy spam_checked_at = null, żeby ponowić przy kolejnym
          // uruchomieniu crona zamiast fałszywie uznać zgłoszenie za czyste.
          console.error(`Spam check failed for submission ${row.id}:`, err);
        }
      })
    );

    res.status(200).json({ ok: true, pending: pending.length, checked, spamFound });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
