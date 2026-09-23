# Konwencje projektu

## Styl pisania (bardzo ważne)

- **Nigdy nie używamy długiego myślnika (—) ani innych "AI slop" znaków
  przestankowych w tekstach na stronie, w dokumentacji ani w treściach
  commitów.** Zamiast tego: kropka, przecinek, dwukropek albo nawiasy,
  w zależności od kontekstu zdania.
- Krótkie, proste zdania. Bez sztucznego napuszenia.

## Styl kodu

- Vanilla JavaScript (bez frameworków na froncie), CommonJS w `api/` i `lib/`.
- Tailwind CSS do nowych elementów UI. Bespoke CSS w `src/input.css` tylko
  tam, gdzie utility classes nie wystarczają (hero, gradienty, animacje).
- Prosty, czytelny kod bez nadmiarowych abstrakcji.

## Język

- Treść strony (UI, teksty widoczne dla użytkownika): po polsku (projekt
  dotyczy polskiej szkoły).
- Kod, nazwy zmiennych/plików, commity: po angielsku, zgodnie z ogólną
  konwencją Claude Code.

## Struktura plików

- Statyczne strony i assety w `public/` (to jest output dir na Vercel).
- Backend jako Vercel Serverless Functions w `api/`, współdzielona logika
  w `lib/`.
- Skrypty administracyjne (uruchamiane lokalnie) w `scripts/`.

## Ogólne zasady pracy nad kodem

- Minimalne, punktowe zmiany. Bez nadmiarowych abstrakcji.
- Każda zmiana wizualna testowana w przeglądarce (Playwright) przed
  wgraniem, na desktopie i mobile.
- Każda zmiana od razu commitowana i pushowana na **`preview`** (bez
  pytania o potwierdzenie, ustalone raz na zawsze). Nigdy na `main`:
  `main` to produkcja (homeyko.pl) i trafia tam wyłącznie całe drzewo
  z `preview`, po wyraźnym poleceniu właściciela repo. Pełne zasady:
  `CLAUDE.md`, sekcja "Zasady publikacji".
