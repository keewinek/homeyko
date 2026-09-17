# Roadmap

## Harmonogram wyborów (rok szkolny 2026/2027)

**Faza I**
- 15-18.09: zbieranie podpisów
- 21-22.09: rejestracja podpisów

**Faza II**
- 23-25.09: kampanie wyborcze
- 28.09: debata kandydatów

**Faza III**
- 28-29.09: cisza wyborcza
- 29.09: głosowanie i wyniki

## Planowane etapy

1. **Szkielet techniczny** ✅: strona statyczna (HTML/Tailwind/JS) na
   Vercelu, hero, sekcja programu, formularze i panel admina gotowe.
2. **Treść merytoryczna kampanii**:
   - sekcja "Dlaczego Filip" ✅ (szablon, treść do dopracowania)
   - sekcja "Sztab" ✅ (szablon: zdjęcie grupowe i dane pozostałych osób
     do uzupełnienia)
   - sekcja "Kontakt" ✅
   - do zrobienia: galeria, aktualności / newsy z kampanii
3. **Identyfikacja wizualna** ✅: logo, kolory, zdjęcia kampanijne gotowe.
4. **Wdrożenie / publikacja** ✅: strona działa na homeyko.pl.

## Uwaga

Harmonogram jest napięty (kampania startuje 23.09, głosowanie 29.09).
Treść merytoryczna (etap 2, podstrony Zespół/Galeria/aktualności) powinna
być priorytetem.

## ⚠️ Zasada publikacji: embargo do startu kampanii (BARDZO WAŻNE)

Kampania startuje **23 września 2026, o północy czasu polskiego**
(00:00 CEST, czyli 22:00 UTC 22.09). Do tego momentu na domenie
**homeyko.pl (branch `main`) nie może pojawić się żadna treść
kampanijna** (program/postulaty, zespół, itd.), bo zdradziłoby to
program przed startem.

Konsekwencje dla pracy nad kodem:
- Wszystkie zmiany, cała bieżąca praca: commit i push na branch
  `preview` (preview.homeyko.pl). Nigdy na `main`, chyba że ktoś
  wyraźnie o to poprosi.
- `main` zostaje pusty (albo z odliczaniem, patrz niżej) aż do
  wyraźnej decyzji o publikacji, zgodnie z opisem w
  `architecture.md` ("Środowiska: produkcja vs preview").
- Do czasu startu na `main` ma być widoczne odliczanie do północy
  23.09. Po minięciu tego momentu odliczanie ma zniknąć i ustąpić
  miejsca normalnej stronie kampanii.
