# Layout estreito — plano

Design: `docs/history/designs/2026-09-23-narrow-layout-design.md` (as secções citadas abaixo
são desse documento). Checkpoint: `.claude/progress/narrow-layout.md`.

Regras de execução:
- TDD: o teste que falha vem antes da implementação.
- Verificação por tarefa: só os testes da família tocada. `pnpm check` corre na T7.
- O working tree tem trabalho do utilizador por commitar. Nenhuma tarefa reverte, formata em
  massa ou faz stage de ficheiros fora da sua lista. Nada é commitado.

## T1 — Core

Ficheiros:
- `packages/core/src/measure/size-class.ts` e o export em `measure/index.ts`: `COMPACT_BELOW`,
  `EXPANDED_FROM`.
- `packages/core/src/sticky-header/sticky-header.ts`: `NARROW_WIDTH` removida, uso de
  `COMPACT_BELOW`, opção `contained`, `CONTAINED_COLLAPSE_AT` (§5.2).
- `packages/core/src/grid/{types,columns}.ts` e o index: `popin`, a nova semântica de
  `priority`, `columnsOutOfSpace`, `GridOutOfSpace`, `POPIN_COLUMN_ID` (§4.1).
  `columnsHiddenBySpace` é removida.
- Testes em `sticky-header.test.ts` e `grid/*.test.ts`.

Pronto quando: `npx vitest run src/grid src/sticky-header src/measure` em `packages/core`
passa e `pnpm --filter @slotted/core build` conclui.

## T2 — Contrato de classes de tamanho (depende de T1)

- `app-shell`: CSS `768px` → `600px`; `APP_SHELL_OVERLAY_AT = COMPACT_BELOW` nos dois
  bindings; textos de docs e stories que citam 768.
- `detail-panel` e `page-header`: `640px` → `600px` no CSS, nos docs e nas stories.
- `packages/styles/src/size-classes.test.mjs` (§3).
- `docs/token-foundation.md` regra 4 e `docs/component-features.md` §2.7.

Pronto quando: `node --test` dos testes de styles tocados passa, e os specs/testes de
`app-shell` e `detail-panel` nos dois bindings passam.

## T3 — `data-grid` Angular, CSS partilhado, `column-manager` Angular (depende de T1)

- `packages/angular/data-grid/src/*`: §4.2, §4.3, §4.4, §4.5.
- `packages/styles/src/data-grid/data-grid.css` e o seu teste: partes `popin`,
  `popin-header`, `popin-field`, `popin-label`, `popin-value` (§4.3).
- `packages/angular/column-manager/src/*`: `outOfSpace`, chave `inRow`.
- Docs e stories das duas famílias.

Pronto quando: os specs de `data-grid` e `column-manager` Angular e o teste de styles do
`data-grid` passam.

## T4 — `data-grid` e `column-manager` React (depende de T3)

- `packages/react/src/data-grid/*` e `packages/react/src/column-manager/*`: paridade com T3.
  O CSS vem de T3.

Pronto quando: `vitest run src/data-grid src/column-manager` em `packages/react` e `tsc`
passam.

## T5 — `page` e `page-header` (depende de T1 e T2)

- `packages/styles/src/page/page.css` e o seu teste (§5.1).
- `packages/styles/src/page-header/page-header.css` e o seu teste (§5.3).
- Bindings Angular e React do `page-header`: `contained` (§5.2).
- Docs das duas famílias.

Pronto quando: os testes de styles de `page` e `page-header`, o spec Angular e o teste React
do `page-header` passam.

## T6 — Nexora (depende de T2–T5)

- §6, com triagem registada no ledger.
- `pnpm demo:refresh`.

Pronto quando: `ng test` e `ng build` da demo passam.

## T7 — Verificação de entrega

- `pnpm check`.
- Os testes das famílias alteradas nos três pacotes.
- `docs/process/build-order.md` e `docs/history/designs/README.md` indexam o design.
