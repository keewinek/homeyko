// Klasyfikacja zgłoszeń pod kątem spamu przez darmowe API AI (Groq,
// https://console.groq.com). Model szybki i tani/darmowy w ramach limitów,
// wystarczający do prostej klasyfikacji tak/nie.
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

const SYSTEM_PROMPT =
  "Jesteś moderatorem treści na stronie kampanii wyborczej. Dostajesz " +
  "zgłoszenie (pytanie albo pomysł) wysłane przez mieszkańca przez formularz " +
  "na stronie. Oceń, czy to spam: reklama, losowy/bezsensowny tekst, treść " +
  "obraźliwa, linki afiliacyjne albo próba wyłudzenia, a nie prawdziwe " +
  "pytanie lub pomysł od mieszkańca. Odpowiedz TYLKO jednym słowem: SPAM " +
  "albo OK, bez żadnego dodatkowego tekstu.";

// Zwraca true/false. W razie błędu API rzuca wyjątek, żeby wołający mógł
// zdecydować, czy zostawić zgłoszenie jako niesprawdzone (retry przy kolejnym
// uruchomieniu crona) zamiast fałszywie oznaczać je jako "nie spam".
async function isSpam(message) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Brak GROQ_API_KEY");

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0,
      max_tokens: 5,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Groq API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const answer = (data.choices && data.choices[0] && data.choices[0].message.content) || "";
  return answer.trim().toUpperCase().startsWith("SPAM");
}

module.exports = { isSpam };
