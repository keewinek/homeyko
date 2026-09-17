# Zasady pisania w tym projekcie

- Nigdy nie używamy długiego myślnika (—) w tekstach na stronie, w dokumentacji ani w treściach commitów. Zamiast tego: kropka, przecinek, dwukropek albo nawiasy, zależnie od kontekstu zdania.

# Zasady publikacji (BARDZO WAŻNE, dotyczy każdego agenta pracującego nad tym repo)

- Branch `main` to produkcja, spięta z domeną **homeyko.pl**. Branch `preview` to robocza wersja, spięta z **preview.homeyko.pl**.
- **Każdą zmianę, zawsze, automatycznie: commit i push na `preview`.** Bez pytania o potwierdzenie, to już ustalone. Tam też testujemy zmiany.
- **Nigdy nie publikuj (nie pushuj) na `main` samodzielnie.** Tylko wtedy, gdy właściciel repo wyraźnie i jednoznacznie o to poprosi (np. "wrzuć to na main", "opublikuj na main"). Sama praca nad zadaniem, nawet duża, nigdy nie jest takim poproszeniem, i nie pytaj o to sama/sam z siebie bez wyraźnego sygnału, że chodzi akurat o main.
- Ta zasada to stały sposób pracy w tym repo, nie jest ograniczona w czasie do startu kampanii (23.09). Dodatkowy, węższy kontekst (embargo treści kampanii przed startem) jest w `ai-context/roadmap.md` i `ai-context/architecture.md`.
