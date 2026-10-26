# Checkpoint

- Plano: `docs/history/plans/2026-10-26-equori-pending.md` (20 itens, 7 fatias).
- Tarefas concluídas: fatias 1 (`73255a80`), 2 (`a8f24ea8`), 3 (`673bac04`), 4 (`be700ecb`), 5 (`be0c8b1c`), 6 (`51d03b0a`); fatia 7 (itens 18, 19, 20) no commit seguinte.
- Em curso: verificação final (`pnpm check:full`).
- Git: branch main. Árvore limpa depois do commit da fatia 2.
- Testes: fatia 7 — React calendar 50/50, attachment 22/22; Angular calendar 46/46, attachment 19/19; `pnpm check` verde.
- Ajustes de escopo: o hash de cada fatia entra na tabela Resultado na fatia seguinte. Os testes Angular leem `@slotted/core` de `dist`: uma mudança no core pede `pnpm build:core` antes deles.
- Problemas conhecidos: a cache incremental de `tsc` (`node_modules/.cache/tsc/root.tsbuildinfo`) dá erros falsos TS2502 em stories depois de mudar `*.docs.ts`; apagá-la resolve.
- Próxima ação: `pnpm check:full`; registar o hash da fatia 7 na tabela Resultado.
