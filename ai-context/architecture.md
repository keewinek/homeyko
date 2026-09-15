# Architektura

## Stack technologiczny

- **Runtime:** Deno
- **Framework:** [Fresh](https://fresh.deno.dev/) 2.3.3 (`jsr:@fresh/core`)
- **UI:** Preact + `@preact/signals`
- **Bundler/dev server:** Vite (`@fresh/plugin-vite`)
- **Język:** TypeScript / TSX

## Struktura repozytorium

```
main.ts              # punkt wejścia aplikacji Fresh (app.fsRoutes(), staticFiles())
client.ts            # wejście dla klienta (hydratacja)
utils.ts             # `define` helper (define.page itd.) i typ `State`
vite.config.ts        # konfiguracja Vite + plugin Fresh
deno.json             # zadania (tasks), importy, opcje kompilatora
routes/               # routing oparty na systemie plików (fs-routes)
  _app.tsx             # wspólny layout HTML (<html>, <head>, <body>)
  index.tsx            # strona główna "/"
assets/               # zasoby przetwarzane przez build (np. styles.css)
static/               # pliki serwowane bezpośrednio (favicon, logo.svg)
```

## Routing

Fresh używa routingu opartego na plikach w `routes/`. Nowe strony dodaje się
jako pliki `.tsx` w tym katalogu (np. `routes/program.tsx` → `/program`).

## Komendy (deno.json → tasks)

- `deno task dev` — uruchamia serwer developerski (Vite)
- `deno task build` — buduje aplikację produkcyjnie
- `deno task start` — uruchamia zbudowaną aplikację (`deno serve -A _fresh/server.js`)
- `deno task check` — `deno fmt --check`, `deno lint`, `deno check`
- `deno task update` — aktualizacja Fresh (`jsr:@fresh/update`)

## Uwagi

- Projekt nie ma jeszcze warstwy danych/backendu (brak bazy danych, API) —
  obecnie to statyczna/prosta strona SSR.
