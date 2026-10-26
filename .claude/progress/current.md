# Checkpoint

- Plano: `docs/history/plans/2026-10-26-equori-pending.md` (22 itens, 8 fatias) — concluído.
- Tarefas concluídas: fatias 1 (`73255a80`), 2 (`a8f24ea8`), 3 (`673bac04`), 4 (`be700ecb`), 5 (`be0c8b1c`), 6 (`51d03b0a`), 7 (`7516d6ef`); correção do calendário e fecho em `fdc953b0`; fatia 8 (itens 21, 22, list-item) no commit seguinte.
- Em curso: nenhuma.
- Git: branch main, sem push. Árvore limpa depois do commit de fecho.
- Testes: fatia 8 — React list-item+list+data-list 140, Angular list-item+list+data-list 54, `list-item-docs.test.ts` 2/2, `pnpm check` verde; sem `check:full` depois da fatia 8. Antes: `pnpm check:full` — gates de topo verdes; React verify verde; Angular 3271/3271 depois da correção do calendário, com um erro não tratado intermitente fora do escopo (ver Problemas); `test:perf` verde na segunda execução.
- Ajustes de escopo: item 20 registado como uso, sem mudança no pacote; a simplificação de `web/src/ui/presence.tsx` fica do lado do equori.
- Problemas conhecidos: (1) `awaitTraversal` em `packages/core/src/dismissable-layer/dismissable-layer.ts:191` deixa um `setTimeout` de 500 ms que dispara depois do teardown do jsdom em `drawer.spec.ts` (intermitente, anterior a este plano). (2) `data-grid.perf.browser.test.tsx` excedeu 60 s uma vez. (3) A cache incremental de `tsc` dá erros falsos TS2502 em stories depois de mudar `*.docs.ts`; apagar `node_modules/.cache/tsc/root.tsbuildinfo` resolve. (4) Os testes Angular leem `@slotted/core` de `dist`: mudar o core pede `pnpm build:core`.
- Próxima ação: decisão do utilizador sobre `pnpm sync:equori` (não executado) e sobre a remoção dos workarounds no equori.
