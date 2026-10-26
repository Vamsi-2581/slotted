# Checkpoint

- Plano: `docs/history/plans/2026-10-26-equori-pending.md` (20 itens, 7 fatias).
- Tarefas concluídas: fatias 1 (`73255a80`), 2 (`a8f24ea8`), 3 (`673bac04`), 4 (`be700ecb`), 5 (`be0c8b1c`); fatia 6 (itens 15, 16, 17) no commit seguinte.
- Em curso: fatia 7 (itens 18, 19, 20).
- Git: branch main. Árvore limpa depois do commit da fatia 2.
- Testes: fatia 6 — React dashboard-grid+link+table unit 147, browser table 5/5, link 2/2; Angular link+dashboard-grid 57/57; styles table+link+stat-card+section+chart 63; theme 105 + node; `pnpm check` verde (typecheck com a cache apagada).
- Ajustes de escopo: o hash de cada fatia entra na tabela Resultado na fatia seguinte. Os testes Angular leem `@slotted/core` de `dist`: uma mudança no core pede `pnpm build:core` antes deles.
- Problemas conhecidos: a cache incremental de `tsc` (`node_modules/.cache/tsc/root.tsbuildinfo`) dá erros falsos TS2502 em stories depois de mudar `*.docs.ts`; apagá-la resolve.
- Próxima ação: item 18 — teste de `marks` no calendário (parte `mark` só na célula marcada, contagem no nome acessível) em `packages/react/src/calendar/calendar.test.tsx`.
