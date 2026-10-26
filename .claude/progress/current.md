# Checkpoint

- Plano: `docs/history/plans/2026-10-26-equori-pending.md` (20 itens, 7 fatias).
- Tarefas concluídas: fatias 1 (`73255a80`), 2 (`a8f24ea8`), 3 (`673bac04`); fatia 4 (itens 10, 11) no commit seguinte.
- Em curso: fatia 5 (itens 12, 13, 14).
- Git: branch main. Árvore limpa depois do commit da fatia 2.
- Testes: fatia 4 — React prompt-composer unit 25/25, browser 2/2; core dictation+state+glyph+i18n 54/54; Angular prompt-composer+icon 36/36; theme 105 + node 111, themes 92; `pnpm check` verde.
- Ajustes de escopo: o hash de cada fatia entra na tabela Resultado na fatia seguinte. Os testes Angular leem `@slotted/core` de `dist`: uma mudança no core pede `pnpm build:core` antes deles.
- Problemas conhecidos: a cache incremental de `tsc` (`node_modules/.cache/tsc/root.tsbuildinfo`) dá erros falsos TS2502 em stories depois de mudar `*.docs.ts`; apagá-la resolve.
- Próxima ação: item 12 — teste da grelha a 970 px de largura própria com `expandedFrom={900}` em `packages/react/src/dashboard-grid/`, depois a prop em React e Angular.
