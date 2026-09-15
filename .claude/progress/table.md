# Estado atual — /component table, rodada 12 (operandos do filtro)

Ficheiro próprio em vez de `current.md`: outra sessão trabalha nesta worktree e
`current.md` regista `app-shell`.

Plano: a skill `/component`, passos 1 a 15. Família entregue; modo: refazer,
âmbito restrito aos três operandos da rodada 12 em `docs/build-schedule.md`.

## Tarefas concluídas

1–9. Lei, modo, inventário, padrão, desenho, contrato e teste, motor, folha,
harness, gate visual (aprovado: «ok»).
10. Bindings. React: `packages/react/src/table/{table-filter.tsx,table.types.ts,index.ts,table.test.tsx}`
— `TableTimeFilter`, `TableDateTimeFilter`, `DateRangePicker` no `between`
de `TableDateFilter` com `presets`, `operand="tags"` em `TableSetFilter`;
`setOperands` no shell, `data-range` e `data-operand` em `filter-operand`.
Angular: `packages/angular/table/src/{table-filter.ts,public-api.ts,table.spec.ts}`
— os mesmos quatro, `setBoth` no contexto do operando, `presets` como
`TemplateRef`, `#operandTemplate` no filtro de conjunto (o `#operand`
sombreava o input).
11. Páginas: quatro cenas por página (`filter-time`, `filter-datetime`,
`filter-range`, `filter-tags`) em `table.stories.tsx`/`table.stories.ts`,
`table.docs.ts` dos dois, ligadas em `bindScenes`; linhas de API `operand`,
`presets`, `granularity`, `value` alargado, `options` `[]`.
12. Gates automáticos: ver estado dos testes.
13. Autoavaliação em
`docs/superpowers/specs/2026-09-14-table-filter-operands-self-assessment.md`.
`docs/build-order.md`: parágrafo da rodada 12 no `table`, pendentes em
`time-range-picker` e `datetime-range-picker`.

## Tarefa em curso

Passo 14: gate de release. À espera do revisor.

## Git

HEAD `d300090`, ramo `review/implementation-pass-1`. Nada desta passagem está
commitado. Ficheiros desta passagem:
`packages/core/src/filter/{operators,descriptor,predicate,serialize,index}.ts`
e quatro `*.test.ts`; `specs/components/table/contract.json`,
`contract.test.mjs`; `packages/styles/src/table/table.css`,
`table.harness.html`; `packages/react/src/table/{table-filter.tsx,table.types.ts,index.ts,table.test.tsx,table.stories.tsx,table.docs.ts}`;
`packages/angular/table/src/{table-filter.ts,public-api.ts,table.spec.ts,table.stories.ts,table.docs.ts}`;
`docs/build-order.md` (inserções); os três documentos
`docs/superpowers/specs/2026-09-14-table-filter-operands-*.md`; este ficheiro.
Tudo o mais na árvore é da outra faixa.

## Estado dos testes

- `node --test specs/components/table/*.test.mjs` — 37/37.
- `packages/core`: `vitest run src/filter` — 104/104; `tsc --noEmit` limpo.
- `packages/react`: `table.test.tsx` 38/38; `table.stories.test.ts` 4/4;
  `tsc` limpo em `src/table`; suite completa 2504/2504 (167 ficheiros).
- `packages/core`: `pnpm verify` — 1247/1247, typecheck e build limpos.
- `eslint --max-warnings=0` nos caminhos da passagem — limpo.
- `pnpm typecheck` (raiz) — limpo. `pnpm test:contracts` — 1538/1538.
  `pnpm test:package-layers` — 12/12.
- `pnpm test:docs` — 24/25; a falha (`snippet id naming the framework`)
  aponta `segmented-control`, `splitter`, `toggle-group`, `action-bar` — outra
  faixa.
- `turbo run verify --affected` — abortado por `@slotted/tokens#verify`
  (`--slotted-control-font-family` mudou para `'Geist Variable'`, da
  alteração do workbench de outra faixa).
- Suite completa de Angular (`ng test`): morta duas vezes pelo sistema por
  falta de memória (22 GB em uso por outros processos); só os specs de
  `table` correram, 25/25 e 4/4.
- `packages/angular`: `table.spec.ts` 25/25; `table.stories.spec.ts` 4/4
  (`ng test --include`).
- `packages/styles`: 135/136; a falha (`page-header tokens.json`) é de outra
  faixa.
- `pnpm check:affected`: parou em `format:check` por quatro ficheiros de outra
  faixa (`packages/core/src/code/*`, `packages/react/src/filter-bar/*`,
  `specs/components/filter-bar/contract.json`). Os passos seguintes correram
  em separado; resultado em `scratchpad/check2.log` desta sessão e no gate.
- `audit.mjs` React 1280 e 620: 40 palcos; achados só na cena `content`
  (`text="truncate"` e `text="nowrap"`, por desenho), não tocada.
- Página Angular: o Storybook em 6007 não importa `table.stories.ts` no
  browser (o módulo serve por HTTP); `@slotted/angular/tags-input` nasceu
  depois do arranque do servidor. Precisa de reinício — pedido no gate.

## Problemas conhecidos

- `time-picker`, `datetime-picker` e `date-picker` (React) escrevem o
  `aria-label` recebido na raiz e não no `role="group"` do campo: os operandos
  de data, hora e data-hora não têm nome acessível próprio. Defeito das três
  famílias, reportado no gate; `date-range-picker` reencaminha bem.
- Avisos pré-existentes na página React: chaves duplicadas `value` na tabela
  de API (três linhas `value` já existiam) e `key` em `ExpansionDemo`.

## Próxima ação executável

Depois da resposta ao gate: passo 15, commits por passo de substância, com
caminhos explícitos:

1. `git add packages/core/src/filter specs/components/table/contract.json specs/components/table/contract.test.mjs` — `feat(filter): as espécies time e datetime`.
2. `git add packages/styles/src/table/table.css packages/styles/src/table/table.harness.html` — `feat(table): a folha e o harness dos operandos novos`.
3. `git add packages/react/src/table/table-filter.tsx packages/react/src/table/table.types.ts packages/react/src/table/index.ts packages/react/src/table/table.test.tsx` — React.
4. `git add packages/angular/table/src/table-filter.ts packages/angular/table/src/public-api.ts packages/angular/table/src/table.spec.ts` — Angular.
5. `git add packages/react/src/table/table.stories.tsx packages/react/src/table/table.docs.ts packages/angular/table/src/table.stories.ts packages/angular/table/src/table.docs.ts` — páginas.
6. `git add docs/superpowers/specs/2026-09-14-table-filter-operands-*.md docs/build-order.md .claude/progress/table.md` — docs.
