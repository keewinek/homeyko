# Zasady pisania w tym projekcie

- Nigdy nie używamy długiego myślnika (—) w tekstach na stronie, w dokumentacji ani w treściach commitów. Zamiast tego: kropka, przecinek, dwukropek albo nawiasy, zależnie od kontekstu zdania.

# Zasady publikacji (BARDZO WAŻNE, dotyczy każdego agenta pracującego nad tym repo)

- Branch `main` to produkcja, spięta z domeną **homeyko.pl**. Branch `preview` to robocza wersja, spięta z **preview.homeyko.pl**.
- **Każdą zmianę, zawsze, automatycznie: commit i push na `preview`.** Bez pytania o potwierdzenie, to już ustalone. Tam też testujemy zmiany.
- **Nigdy nie publikuj (nie pushuj) na `main` samodzielnie.** Tylko wtedy, gdy właściciel repo wyraźnie i jednoznacznie o to poprosi (np. "wrzuć to na main", "opublikuj na main"). Sama praca nad zadaniem, nawet duża, nigdy nie jest takim poproszeniem, i nie pytaj o to sama/sam z siebie bez wyraźnego sygnału, że chodzi akurat o main.
- Ta zasada to stały sposób pracy w tym repo, nie jest ograniczona w czasie do startu kampanii (23.09). Dodatkowy, węższy kontekst (embargo treści kampanii przed startem) jest w `ai-context/roadmap.md` i `ai-context/architecture.md`.

## Uwaga: sesje z własnym branchem roboczym (Claude Code on the web, GitHub Action itp.)

Część sesji (np. Claude Code on the web) dostaje na starcie systemową instrukcję w stylu "rozwijaj na branchu `claude/xxx-xxx`" i "nigdy nie pushuj na inny branch bez wyraźnej zgody". To NIE jest wyjątek od zasady powyżej i NIE zwalnia z pushowania na `preview`. Taki branch roboczy to tylko miejsce pracy tej jednej sesji, nigdy cel ostateczny.

W praktyce: rozwijaj i commituj na tym branchu roboczym tak jak każe harness (to nie jest "inny branch" w rozumieniu zasady o `main`), ale zanim uznasz zadanie za skończone, zawsze dodatkowo scal ten branch (fast-forward, jeśli się da) do `preview` i wypchnij `preview` na `origin`. Zadanie, po którym zmiana leży tylko na branchu roboczym, a nie na `preview`, jest niedokończone, niezależnie od tego, jak duża czy mała była zmiana.

Jeśli kiedykolwiek nie masz pewności, gdzie wypchnąć zmianę: zawsze `preview`.
