# Architektura

## Stack technologiczny

- **Strona:** czysty HTML (`public/index.html`)
- **Style:** [Tailwind CSS](https://tailwindcss.com/) v4 (CLI), źródło w
  `src/input.css`, kompilowane do `public/css/styles.css`
- **JS:** vanilla JavaScript (`public/js/main.js`) — obsługa mobilnego menu
  i efektu paralaksy tła w hero
- **Hosting:** Netlify (build command `npm run build`, publish dir `public`)

## Struktura repozytorium

```
public/                # publikowany katalog (to jest publish dir na Netlify)
  index.html             # cała strona
  css/styles.css          # skompilowany CSS (generowany, ale zacommitowany
                           # dla wygody Netlify Drop)
  js/main.js              # menu mobilne + paralaksa
  images/                 # zdjęcia i logotypy kampanii
  favicon.ico
src/input.css           # źródło Tailwinda (@import "tailwindcss" + custom CSS)
package.json            # devDependencies: tailwindcss, @tailwindcss/cli
netlify.toml            # konfiguracja builda/deployu na Netlify
```

## Komendy

- `npm install` — instaluje Tailwind CSS
- `npm run build` — buduje `public/css/styles.css` z `src/input.css`
- `npm run watch` — buduje w trybie watch podczas developmentu

## Deploy

Dwie opcje, obie korzystają z tego samego `public/`:

1. **Netlify + Git (zalecane):** połącz repo w panelu Netlify — build command
   `npm run build`, publish directory `public` (już w `netlify.toml`), deploy
   automatyczny po każdym pushu do `main`.
2. **Netlify Drop:** przeciągnij zawartość folderu `public/` na
   https://app.netlify.com/drop — działa od razu, bo `public/css/styles.css`
   jest już zbudowany i zacommitowany.

## Uwagi

- Projekt nie ma warstwy danych/backendu — to w pełni statyczna strona.
  Wcześniej był to szkielet Fresh/Deno; przepisany na statyczny stack, bo
  strona kampanii samorządowej go nie potrzebuje.
