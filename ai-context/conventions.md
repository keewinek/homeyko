# Konwencje projektu

## Styl kodu

- Formatowanie i lint przez wbudowane narzędzia Deno: `deno fmt`, `deno lint`
  (reguły: `fresh`, `recommended` — patrz `deno.json`).
- Przed commitem warto uruchomić `deno task check` (fmt + lint + typecheck).
- TypeScript / TSX, komponenty funkcyjne Preact.
- JSX: `jsxImportSource: preact`, tryb `precompile`.

## Język

- Treść strony (UI, teksty widoczne dla użytkownika) — **po polsku** (projekt
  dotyczy polskiej szkoły).
- Kod, nazwy zmiennych/plików, commity — po angielsku, zgodnie z ogólną
  konwencją Claude Code (chyba że ustalimy inaczej).

## Routing / pliki

- Nowe strony dodawać jako pliki w `routes/` zgodnie z konwencją fs-routes
  Fresh.
- Współdzielony layout w `routes/_app.tsx`.
- Statyczne assety (favicon, obrazy niewymagające przetwarzania) → `static/`.
- Assety przetwarzane przez build (style, itp.) → `assets/`.

## Ogólne zasady pracy nad kodem

- Minimalne, punktowe zmiany — bez nadmiarowych abstrakcji na tym wczesnym
  etapie projektu.
- Brak jeszcze ustalonych konwencji nazewnictwa komponentów / commitów —
  do uzupełnienia w miarę rozwoju projektu.
