# Checkpoint

- Plano: `docs/history/plans/2026-10-19-fourth-iteration.md` (13 itens, 5 fatias; tabela Resultado e Problemas conhecidos preenchidos).
- Ramo `main`, HEAD `d06d8cf8`. Árvore com as mudanças das cinco fatias, não commitadas.
- Concluído: itens 1 a 13.
- Testes: `pnpm check` exit 0 depois da fatia 5; core 2191/2191, React 4078/4078, Angular 3211/3211; `node tools/harness/scenarios/table-edges.mjs` ok; `@slotted/styles` 1681/1681; typecheck Angular exit 0; React `tsc --noEmit` limpo após `pnpm --filter @slotted/core build`.
- Não corrido: build do site `apps/docs` (os testes `page-sections` leem `apps/docs/dist` desatualizado); `pnpm check:full`; `pnpm eval:agent-docs`.
- Ajustes de escopo: item 2 sem teste de razão que falhe antes; item 8 só React; item 10 nomeia API de React por exigência do critério de aceite; item 12 só React.
- Problemas conhecidos: ver a seção do plano.
- Próxima ação: pedir ao utilizador a decisão sobre commit (`git add -A && git commit`) e sobre o build do site para `page-sections`.
