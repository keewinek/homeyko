# Homeyko — przegląd projektu

## Co to jest

Strona internetowa kampanii wyborczej partii **Homeyko**, której kandydatem
jest **Filip Gałązka**, startujący w wyborach na przewodniczącego samorządu
uczniowskiego **CXXII LO im. Ignacego Domeyki w Warszawie**.

## Cel strony

Strona ma promować kandydata i kampanię wśród uczniów szkoły — docelowo m.in.:
przedstawienie kandydata, program wyborczy, aktualności z kampanii i sposób
kontaktu / poparcia.

## Stack

Statyczna strona: czysty HTML (`public/index.html`) + Tailwind CSS
(kompilowany z `src/input.css` do `public/css/styles.css`) + vanilla
JavaScript (`public/js/main.js`). Hostowana na Netlify (build command
`npm run build`, publish dir `public`). Projekt wcześniej był aplikacją
Fresh/Deno — przepisany na statyczny stack, bo kampania samorządowa nie
potrzebuje backendu/serwera; ewentualna przyszła strona samorządu z
kalendarzem/rezerwacjami będzie osobnym projektem.

## Do ustalenia (TODO)

- Docelowe podstrony/sekcje (Zespół, Galeria, Kontakt — linki w nawigacji
  na razie prowadzą donikąd poza `#program`).
- Data wyborów i harmonogram kampanii (do uzupełnienia w `roadmap.md`).
