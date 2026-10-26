# Checkpoint

- Plano: `docs/history/plans/2026-10-26-equori-pending.md` (20 itens, 7 fatias).
- Tarefas concluídas: fatia 1 (`73255a80`), fatia 2 (`a8f24ea8`), fatia 3 (itens 7, 8, 9) no commit seguinte.
- Em curso: fatia 4 (itens 10, 11).
- Git: branch main. Árvore limpa depois do commit da fatia 2.
- Testes: fatia 3 — React dialog+message+markdown unit 202/202, browser dialog 10/10 e message 1/1; core markdown 33/33; Angular markdown+dialog+message 95/95; `pnpm check` verde.
- Ajustes de escopo: o hash de cada fatia entra na tabela Resultado na fatia seguinte. Os testes Angular leem `@slotted/core` de `dist`: uma mudança no core pede `pnpm build:core` antes deles.
- Problemas conhecidos: a cache incremental de `tsc` (`node_modules/.cache/tsc/root.tsbuildinfo`) dá erros falsos TS2502 em stories depois de mudar `*.docs.ts`; apagá-la resolve.
- Próxima ação: item 10 — escrever o teste de browser do repro do anel (scrollHeight == clientHeight do contentor; alfa < 0.05 na borda) em `packages/react/src/prompt-composer/`.
