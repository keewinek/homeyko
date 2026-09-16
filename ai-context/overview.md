# Homeyko: przegląd projektu

## Co to jest

Strona internetowa kampanii wyborczej partii **Homeyko**, której kandydatem
jest **Filip Gałązka**, startujący w wyborach na przewodniczącego samorządu
uczniowskiego **CXXII LO im. Ignacego Domeyki w Warszawie**.

## Cel strony

Strona ma promować kandydata i kampanię wśród uczniów szkoły. Docelowo m.in.:
przedstawienie kandydata, program wyborczy, aktualności z kampanii i sposób
kontaktu / poparcia.

## Stack

Statyczna strona: czysty HTML (`public/`) + Tailwind CSS (kompilowany z
`src/input.css` do `public/css/styles.css`) + vanilla JavaScript. Backend
jako Vercel Serverless Functions (`api/`) z bazą Postgres (Neon), pod
formularze "Zgłoś pomysł"/"Zadaj pytanie" i panel admina (`/admin`).
Hostowana na Vercel (build command `npm run build`, output dir `public`).
Projekt wcześniej był aplikacją Fresh/Deno, przepisany na statyczny stack,
bo kampania samorządowa nie potrzebuje pełnego frameworka; ewentualna
przyszła strona samorządu z kalendarzem/rezerwacjami będzie osobnym
projektem.

## Do ustalenia (TODO)

- Docelowe podstrony/sekcje (Zespół, Galeria, Kontakt: linki w nawigacji
  na razie prowadzą donikąd poza `#program`).
- Data wyborów i harmonogram kampanii (do uzupełnienia w `roadmap.md`).
