# Checkpoint

- Plano: `docs/history/plans/2026-10-20-fifth-iteration.md` (dez itens, cinco fatias).
- Concluído: fatia 1 (itens 1, 2, 3), fatia 2 (itens 7, 8, 9), fatia 3 (itens 6, 10). HEAD da fatia 3: `754210fa`.
- Em curso: gate `pnpm check:affected` da fatia 3; depois, fatia 4 (item 5).
- Git: ramo `main`, à frente de `origin/main`; árvore limpa após o commit deste checkpoint.
- Testes: fatia 2 — `pnpm check` exit 0 (após rebuild de `@slotted/theme`, cujo `dist/types` faltava). Fatia 3 — `@slotted/styles` verify exit 0, `test:contracts` exit 0, `typecheck` exit 0, tabs React 42/42, tabs Angular 33/33, core measure+focus 110/110, cenários `page-header-glass.mjs` e `tabs-marker.mjs` passam e falham com o CSS anterior.
- Ajustes de âmbito: `createIndicator` em `@slotted/core/measure`; exceção física de `logical.test.mjs` estendida ao marcador das tabs; exceção `tabs/item::after` removida de `text-scale.test.mjs`; a faixa das tabs passou de borda a sombra interna.
- Problemas conhecidos: ver o plano.
- Próxima ação: item 5 — medir no Chrome a abertura de um select de 62 itens (clique → `data-open`, `UpdateLayoutTree` na cadeia do clique) com um cenário em `tools/harness/scenarios/` sobre a página da demo ou um bundle React mínimo; ler `packages/core/src/positioner/positioner.ts`, `presence/presence.ts`, `portal/portal.ts` e `packages/react/src/select/select-parts.tsx:700-800`.
