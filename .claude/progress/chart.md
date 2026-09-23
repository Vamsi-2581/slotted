# Checkpoint — família `chart` (ECharts como motor)

- Skill: `/component chart`. Estado: família entregue. Gate de release aprovado ("pode seguir"); passo 15 commitado.
- HEAD `e4458ca0`, ramo `review/implementation-pass-1`. Nada commitado. Outra sessão (data-grid, `.claude/progress/current.md`) escreve na mesma worktree.

## Concluído

- Passo 3: `docs/history/designs/2026-09-23-chart-capability-inventory.md`.
- Passo 5: `docs/history/designs/2026-09-23-chart-design.md`.
- Passo 6: capacidades `visibility` e `zoom` em `specs/contract.schema.mjs` (+ teste); `specs/components/chart/contract.json` + `contract.test.mjs`.
- Núcleo: `packages/core/src/chart` (modelo, navegação, tooltip, tabela/CSV, tema lido do CSS, anunciador do último ponto) e `packages/core/src/chart-echarts` (motor, 11 chunks por `import()`), 45 testes vitest; `echarts@6.1.0` devDependency + peer opcional; subpaths em `packages/core/{package.json,vite.config.ts}`.
- Passo 7: `packages/styles/src/chart/{chart.css,chart.tokens.json}`; runtime props `--slotted-chart-{x,y,band-start,band-size,frame-start,frame-size}` em `runtime-properties.mjs` + `tokens.test.mjs`.
- Ferramenta: `tools/harness/script.mjs` (+ testes), `build.mjs` aceita `<style>`/`<script type=module>` e restringe o estilo de legenda a `.cell > figcaption`, `shoot.mjs` espera `window.slottedHarnessReady`.
- Passo 8: `packages/styles/src/chart/chart.harness.html` (37 cenas, playground, registo de eventos). Capturas em scratchpad `shots/{l420,axes,states,final}`. Cenário de comportamento com 24 asserções: scratchpad `probe-behaviour.mjs` (alturas de dashboard, tabela no plot, tela cheia, menu estreito incluídos).
- `docs/process/build-order.md` › Reaberturas: linha `chart` (fatia 2).

- Passo 10 (React): `packages/react/src/chart/{chart.tsx,chart.types.ts,chart-defaults.tsx,index.ts,chart.test.tsx}` — 20 testes; registos em `packages/react/{package.json,vite.config.ts,src/index.ts}` e `packages/styles/package.json`. Core ganhou `placeLayer`/`trackModality` (49 testes).

- Passo 10 (Angular): `packages/angular/chart/{ng-package.json,src/{chart.ts,chart.html,chart-defaults.ts,chart-templates.ts,public-api.ts,chart.spec.ts}}` — 14 testes; motor injetável por `CHART_ENGINE`. `pnpm build` Angular constrói `@slotted/angular/chart`.
- Harness: `update()` relê o tema (paleta/variante); sonda com 25 asserções.
- Passo 11: `packages/react/src/chart/chart.{docs.ts,stories.tsx,stories.test.ts}` (4 testes) e `packages/angular/chart/src/chart.{docs.ts,stories.ts,stories.spec.ts}` (4 testes); 42 cenas cada. `specs/reference-pages.test.mjs` e `story-layout.test.mjs` passam. Storybook não está a correr: páginas não lidas renderizadas.

## Verificação

- `npx vitest run src/chart src/chart-echarts` (core): 45 passam. `tsc` core: sem erros em `src/chart*`.
- `node --test specs/contract.schema.test.mjs specs/components/chart/*.test.mjs`: 51 passam.
- `node --test packages/styles/src/*.test.mjs`: 170 passam. `tools/harness` testes: 91 passam.

## Problemas conhecidos

- `ng test slotted-angular` completo não compila por `column-manager` (outra sessão: `outOfSpace`, `hiddenBySpace`). Specs do chart correm com tsconfig temporário `{"extends":"./tsconfig.spec.json","include":["chart/src/**/*.spec.ts","**/src/**/*.d.ts"]}` + `--ts-config` + `--include`, removido depois.
- `entry-points.source.test.mjs`: falha `context-menu renders no element carrying its own identifier` (outra família).

- `pnpm-lock.yaml` reflete também as specs Angular 22.1.7 dos manifestos não commitados de outra sessão; `specs/contract.schema.mjs` e `.test.mjs` têm hunks de outra sessão. Commit exige staging por hunk.

## Correções da fatia D (passos 11–13)

- `packages/core/src/chart-echarts/loader.ts` `replaceableComponents()` + `engine.ts`; teste `chart-echarts.registry.test.ts`.
- `tools/harness/audit.mjs` retira conteúdo SVG dos achados de overflow (+ teste em `audit.test.mjs`).
- `chart.css`: rótulos x do esqueleto encolhem.
- `.docs.ts`: cada cena chama `defineSnippet` literalmente (exigência de `verify-docs-snippets`); id `chart-theming` no Angular.

## Próxima ação

Nenhuma nesta família. Fora do commit, por pertencerem a outra sessão: trechos de `pnpm-lock.yaml` do registo da demo (Angular 22.1.7 e `slotted-core` com peer `echarts`), que reconcilia quem commitar esse trabalho.
