# Checkpoint

- Plano: `docs/history/plans/2026-10-20-fifth-iteration.md` (onze itens, seis fatias).
- Concluído: fatias 1–4 (itens 1, 2, 3, 6, 7, 8, 9, 10, 11; item 5 no select, React e Angular). HEAD `0e6f1f92` antes deste checkpoint.
- Em curso: fatia 5 — item 5 nas outras quinze famílias.
- Git: ramo `main`, à frente de `origin/main`.
- Testes: verificação escopada por mudança (pedido do utilizador); `pnpm check` e o verify completo ficam para antes do push. Últimos verdes: core positioner 37/37, React select+field 124/124, Angular select 60/60, Angular stat-card 14/14, styles raiz+stat-card 282/282, cenários `select-open.mjs --assert`, `stat-card-nested.mjs`, `tabs-marker.mjs`.
- Problemas conhecidos: ver o plano.
- Próxima ação: generalizar `tools/harness/scenarios/select-open.mjs` para uma tabela de famílias (entrada React, seletor do gatilho e do positioner) e medir multi-select, combobox, popover, menu; aplicar a cada uma o padrão do select (`packages/react/src/select/select-parts.tsx`, função `place` e efeitos vizinhos).
