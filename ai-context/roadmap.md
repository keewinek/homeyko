# Roadmap

## Harmonogram wyborów (rok szkolny 2026/2027)

**Faza I** (za nami)
- 15-18.09: zbieranie podpisów
- 21-22.09: rejestracja podpisów

**Faza II** (trwa)
- 23-25.09: kampanie wyborcze
- 28.09: debata kandydatów

**Faza III**
- 28-29.09: cisza wyborcza
- 29.09: głosowanie i wyniki

## Gdzie jesteśmy (stan na 23.09.2026)

- **Strona jest opublikowana.** Premiera: północ 23.09.2026. `main` i
  `homeyko.pl` serwują pełną stronę kampanii, `preview` i
  `preview.homeyko.pl` to wersja robocza.
- **Kampania trwa i kończy się w piątek 25.09.2026.** Strona po kampanii
  zostaje online na stałe.
- **Po 25.09 nie dodajemy na stronę nowych treści kampanijnych** (nowe
  sekcje, nowe postulaty, nowe materiały promocyjne). Poprawki techniczne,
  literówki, bugfixy i moderacja zgłoszeń działają normalnie dalej.
- Wszystko, co dotyczy publikacji (kto, kiedy i jak wypycha na `main`),
  jest w `CLAUDE.md`. Ten plik nie powtarza tych zasad, tylko do nich
  odsyła.

## Etapy

1. **Szkielet techniczny** ✅: strona statyczna (HTML/Tailwind/JS) na
   Vercelu, hero, sekcja programu, formularze i panel admina gotowe.
2. **Treść merytoryczna kampanii**:
   - sekcja "Dlaczego Filip" ✅ (szablon, treść do dopracowania)
   - sekcja "Sztab" ✅ (szablon: zdjęcie grupowe i dane pozostałych osób
     do uzupełnienia)
   - sekcja "Kontakt" ✅
   - galeria, aktualności / newsy z kampanii: **tylko do 25.09**, po
     kampanii nowych treści już nie dodajemy
3. **Identyfikacja wizualna** ✅: logo, kolory, zdjęcia kampanijne gotowe.
4. **Wdrożenie / publikacja** ✅: strona działa na homeyko.pl od 23.09.

## Co zostało z okresu przed premierą (kontekst historyczny)

- Do 23.09 na `main` było odliczanie do startu kampanii
  (`public/countdown.html`, `public/js/countdown.js`), a treść kampanijna
  leżała wyłącznie na `preview`, żeby nie zdradzić programu przed startem.
  **To embargo już nie obowiązuje**, treść jest publiczna.
- Publikację o północy zrobił jednorazowy workflow
  `.github/workflows/publish-campaign-launch.yml`. Jest już zużyty (jego
  `schedule` dotyczył 22/23.09.2026) i nie należy odtwarzać takich
  automatów pushujących na `main`.
- Pliki odliczania zostały w repo jako pamiątka, nic ich już nie
  linkuje, mają `noindex`.
