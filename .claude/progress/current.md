# Checkpoint

- Plano: `docs/history/plans/2026-10-26-equori-pending.md` (20 itens, 7 fatias).
- Tarefas concluídas: fatias 1 (`73255a80`), 2 (`a8f24ea8`), 3 (`673bac04`), 4 (`be700ecb`); fatia 5 (itens 12, 13, 14) no commit seguinte.
- Em curso: fatia 6 (itens 15, 16, 17).
- Git: branch main. Árvore limpa depois do commit da fatia 2.
- Testes: fatia 5 — React dashboard-grid unit 39/39, browser 2/2; core dashboard-grid 39/39; Angular dashboard-grid 34/34; `pnpm check` verde (typecheck com a cache apagada).
- Ajustes de escopo: o hash de cada fatia entra na tabela Resultado na fatia seguinte. Os testes Angular leem `@slotted/core` de `dist`: uma mudança no core pede `pnpm build:core` antes deles.
- Problemas conhecidos: a cache incremental de `tsc` (`node_modules/.cache/tsc/root.tsbuildinfo`) dá erros falsos TS2502 em stories depois de mudar `*.docs.ts`; apagá-la resolve.
- Próxima ação: item 15 — teste de `renderDetail` (clique num link de cliente não navega o documento) em `packages/react/src/dashboard-grid/dashboard-grid.test.tsx`.
