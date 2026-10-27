# Checkpoint

- Plano: `docs/history/plans/2026-10-27-stat-card-trend-and-equori.md` (8 itens).
- Tarefas concluídas: 1 (tendência do stat-card), 2 (dashboard-grid descobre widgets em wrappers e fragmentos), 3 (`rows="auto"` em sub-linhas: `DASHBOARD_SUBROWS` = 12), 4 (OV-07, OV-08), 5 (Reset pede o `defaultLayout`), 6 (gráfico preenche o corpo do widget), 7 (`--slotted-page-scrollport-block-size`), 8 (compose-screen encaminha sticky para LA-06). Antes do plano: tipagem genérica de `Chart`.
- Em curso: `pnpm check:affected` em segundo plano (log em scratchpad `affected3.log`).
- Git: branch main, HEAD `10a1b5d5`, nada commitado.
- Testes: `pnpm check` verde depois do item 8. `check:affected` anterior: core falhou só por timeout de `chart-echarts.test.ts` sob carga (23/23 isolado); React e Angular não correram nessa execução.
- Ajustes de escopo: o equori põe `StatCardComparison` fora de `StatCardFigure` em `web/src/ui/figure-card.tsx`. Cache de `tsc` dá TS2502 falsos depois de mudar `*.docs.ts`.
- Problemas conhecidos: demo Nexora Angular tipa séries como `readonly ChartSeries[]`; após `pnpm demo:refresh` pede `as const`. Evals `review-overview` e `sticky-summary` não executados (`pnpm eval:agent-docs` corre na release). Item 7 sem teste Angular de browser (o pacote Angular não tem projeto de browser); a lógica é a mesma do React.
- Próxima ação: ler `affected3.log`; depois, decisão do utilizador sobre o commit.
