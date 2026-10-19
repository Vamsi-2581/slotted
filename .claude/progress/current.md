# Checkpoint

- Plano: `docs/history/plans/2026-10-19-mount-cost-and-features.md` (tabela Resultado preenchida, itens 1–6).
- Ramo `main`, HEAD `f0c4e25d`. Árvore com 52 caminhos alterados ou novos, não commitados: fatias 1 e 2.
- Concluído: fatias 1 (itens 1, 2, 3) e 2 (itens 4, 5, 6). Cada item tem teste que falha antes da mudança.
- Testes: `pnpm check` exit 0; core 2183/2183; React 4063/4063 (259 ficheiros); `@slotted/styles` 1681; `@slotted/themes` 90; `@slotted/theme` vitest 95 e node 109; agent-docs 200; Angular chart 16, page-header 24, filter-bar 39, button 57; build do `@slotted/react` com `package-boundary.verify.mjs` exit 0.
- Não corrido: suite Angular completa; `pnpm check:full`.
- Ajustes de escopo: `observeChartTheme` deixa de reler em `fonts.ready` com fontes carregadas; `end` do Button sob `justify="between"` toma a largura do conteúdo.
- Problemas conhecidos: legenda do chart mede no `useLayoutEffect`; `findScrollParent` lê estilo na construção do sticky-header; famílias não leem os tokens de material; `usePressSelection` sem equivalente Angular; skill `theme-app` sem caso de avaliação novo.
- Próxima ação: decisão do utilizador sobre commit (`git add -A && git commit`) e sobre `pnpm check:full`.
