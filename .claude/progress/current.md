# Checkpoint

- Plano: nenhum plano escrito; tarefa pedida em sessão — desempenho do arrasto do `DashboardGrid` na consola de `apps/docs` (Overview, página inicial).
- HEAD: `85b33910`, ramo `main`, igual a `origin/main`. Commits: `0eed1bde` perf(dashboard-grid), `6ff09ae3` fix(progress-indicator), `85b33910` fix(tabs). CI run `38923025655` passou (Validate, 19m22s).
- Árvore, ficheiros desta tarefa: `packages/core/src/chart/theme{,.test}.ts`; `packages/react/src/dashboard-grid/dashboard-grid{,.test}.tsx`, `dashboard-widget.tsx`; `packages/react/src/chart/chart{,.test}.tsx`; `packages/angular/dashboard-grid/src/dashboard-grid{,.spec}.ts`; `packages/styles/src/dashboard-grid/dashboard-grid{.css,.styles.test.mjs,.harness.html}`; `specs/components/dashboard-grid/contract.json`. Fora desta tarefa (outra sessão): `packages/styles/src/tabs/*`, `packages/*/progress-indicator/*`.
- Concluído (cada um com teste RED antes):
  1. Widget em mão movido por `translate`/`inset-*`/`inline-size`/`block-size` inline, sem `--_dg-lift-*`/`--_dg-origin-*` (React, Angular, CSS).
  2. `observeChartTheme` ignora mutações de `style` que só mudam geometria, `grid-*`, `order` e propriedades privadas `--_*`.
  3. `@property` sem herança e `syntax: '*'` para `--_dg-x/y/w/h/span-medium` (CSS).
  4. React: capacidades do menu (`can`) num memo fora do gesto; slots com identidade estável; corpo do widget em `memo` (`WidgetView`).
  5. React: widgets desenhados sob `Fragment key={value}` — JSX estático sem key remontava o conteúdo ao mudar de ordem.
  6. React: `order` só nas classes medium/compact.
  7. `data-gesture` passa da raiz para o `ul` da grelha (CSS, harness, contrato, React, Angular). No React passa a valer também no redimensionamento.
  8. React `Chart`: `x`, `y`, `series`, `annotations` estabilizados por conteúdo (`useSameShape`).
- Testes: core chart 59; React dashboard-grid 37, chart 26; Angular dashboard-grid + chart 48; styles dashboard-grid 3; `pnpm check` passa. `turbo run verify --affected` em curso (log em scratchpad `verify.log`).
- Medição (`drag-perf.mjs` no scratchpad; long tasks por fase), dev, CPU 1x, fundo parado: HEAD 20 long tasks durante o arrasto (máx. 133 ms), pegar 127 ms, largar 580+53 ms → agora 0 durante, pegar sem long task, largar ~195 ms. Produção, CPU 1x, fundo parado: 0 durante, largar 120–150 ms.
- Custo restante: `apps/docs/src/lib/rays.ts` (fundo da página inicial). Produção, página parada: 1,03 s de script em 2,2 s, ~37 fps; parado 13 ms e 60 fps. Canvas light 533×320 = 170 560 píxeis por frame com `getImageData`/`putImageData` e dithering; o comentário do ficheiro diz ~20 000.
- Não medido: Angular durante o arrasto (nenhum consumidor Angular do dashboard-grid).
- Causa transversal registada: uma propriedade custom herdada em `<html>` custa 275 ms na página de docs (~415 variáveis por elemento).
- Próxima ação: decisão do utilizador sobre `rays.ts` (resolução, frame rate, ou pausa durante interação na consola).
