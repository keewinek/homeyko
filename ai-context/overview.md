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

- Sekcje "Dlaczego Filip", "Sztab" i "Kontakt" na stronie głównej mają na
  razie treść szablonową (zdjęcie sztabu, dane pozostałych członków, opis
  ekipy): do uzupełnienia realnymi zdjęciami i tekstami.
- Docelowa podstrona/sekcja Galeria: link w nawigacji na razie prowadzi
  donikąd poza `#program`.
- Harmonogram wyborów i stan kampanii: patrz `roadmap.md` (strona żyje od
  23.09.2026, kampania kończy się 25.09.2026, potem bez nowych treści).
