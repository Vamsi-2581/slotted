# Checkpoint

- Plano: `docs/history/plans/2026-10-20-fifth-iteration.md` (onze itens, seis fatias).
- Concluído: fatias 1–5 (itens 1, 2, 3, 5, 6, 7, 8, 9, 10, 11). HEAD `715bd3c3` antes deste checkpoint.
- Em curso: fatia 6 — item 4 (CSS por família, React).
- Git: ramo `main`, à frente de `origin/main`.
- Testes: verificação escopada por mudança (pedido do utilizador); `pnpm check` e o verify completo ficam para antes do push. Últimos verdes: core positioner 37/37, React select+field 124/124, Angular select 60/60, Angular stat-card 14/14, styles raiz+stat-card 282/282, cenários `select-open.mjs --assert`, `stat-card-nested.mjs`, `tabs-marker.mjs`.
- Problemas conhecidos: ver o plano.
- Próxima ação: item 4 — ler `packages/react/vite.config.ts` (`cssFileName: 'styles'`) e `layer-order.build.mjs`; desenhar a saída `dist/styles/<família>.css` a partir de `packages/styles/src/<família>/<família>.css` e as dependências pelo grafo de imports de `packages/react/src/<família>/*.tsx`.
