# Checkpoint

- Plano: `docs/history/plans/2026-10-26-equori-pending.md` (20 itens, 7 fatias).
- Tarefas concluídas: fatia 1 (itens 1, 2, 3) em `73255a80`; fatia 2 (itens 4, 5, 6) no commit seguinte.
- Em curso: fatia 3 (itens 7, 8, 9).
- Git: branch main. Árvore limpa depois do commit da fatia 2.
- Testes: drawer browser 16/16; message-scroller React 12/12, core 14/14; Angular drawer + message-scroller 65/65; `pnpm check` verde.
- Ajustes de escopo: o hash de cada fatia entra na tabela Resultado na fatia seguinte. Os testes Angular leem `@slotted/core` de `dist`: uma mudança no core pede `pnpm build:core` antes deles.
- Problemas conhecidos: a cache incremental de `tsc` (`node_modules/.cache/tsc/root.tsbuildinfo`) dá erros falsos TS2502 em stories depois de mudar `*.docs.ts`; apagá-la resolve.
- Próxima ação: item 7 — escrever o teste de browser do repro (Bubble com Markdown numa coluna de 340 px, largura > 150 px) em `packages/react/src/message/`.
