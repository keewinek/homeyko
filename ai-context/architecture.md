# Architektura

## Stack technologiczny

- **Strona:** czysty HTML (`public/index.html`)
- **Style:** [Tailwind CSS](https://tailwindcss.com/) v4 (CLI), źródło w
  `src/input.css`, kompilowane do `public/css/styles.css`
- **JS:** vanilla JavaScript (`public/js/main.js`) — obsługa mobilnego menu
  i efektu paralaksy tła w hero
- **Hosting:** Vercel (build command `npm run build`, output dir `public`) —
  wybrany zamiast Netlify, bo darmowy plan Vercela ma limit 100
  deployów/dzień (reset codziennie), a Netlify free to ~20 deployów na cały
  **miesiąc** (limit kredytowy) i po przekroczeniu zamraża wszystkie
  projekty na koncie do końca miesiąca — zbyt ryzykowne przy częstych,
  szybkich poprawkach.

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
vercel.json              # konfiguracja builda/deployu na Vercel
```

## Komendy

- `npm install` — instaluje Tailwind CSS
- `npm run build` — buduje `public/css/styles.css` z `src/input.css`
- `npm run watch` — buduje w trybie watch podczas developmentu

## Deploy

**Vercel + Git:** połącz repo w panelu Vercel ("Add New Project" → Import z
GitHub → wybierz `keewinek/homeyko`). Vercel wykryje `vercel.json` (build
command `npm run build`, output directory `public`) i będzie deployował
automatycznie po każdym pushu do `main`. Domena własna (np. homeyko.pl)
konfigurowana w ustawieniach projektu na Vercelu (Domains).

## Uwagi

- Projekt nie ma warstwy danych/backendu — to w pełni statyczna strona.
  Wcześniej był to szkielet Fresh/Deno; przepisany na statyczny stack, bo
  strona kampanii samorządowej go nie potrzebuje.
