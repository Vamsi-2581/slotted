# Checkpoint — rodada 18: `highlight`

`.claude/progress/current.md` pertence à sessão da rodada 17; este arquivo é o
checkpoint desta sessão.

## Plano

`docs/process/build-schedule.md`, rodada 18, bloco `highlight`. Skill `/component`,
modo `create` (a folha existia; o contrato não). Sem arquivo de plano.

## Tarefas concluídas

1. Passos 1–5: inventário em
   `docs/history/designs/2026-09-16-highlight-capability-inventory.md`;
   desenho em `docs/history/designs/2026-09-16-highlight-design.md`.
2. Passo 6: `specs/components/highlight/{contract.json,contract.test.mjs}`;
   blocos `mark` de `combobox`, `multi-select`, `command-palette` apontam para
   a família; `select.search.highlight` e `combobox.filtering.highlight`
   reescritos; testes dos hosts ajustados. 106/106 nas cinco suítes.
3. Motor: `packages/core/src/highlight/{highlight.ts,index.ts,highlight.test.ts}`
   (20/20); `collection/filter.ts` importa `findMatch` e reexporta
   `matchRanges`/`splitByMatch` (todas as ocorrências); `packages/core/package.json`
   e `vite.config.ts` com a entrada `highlight`. `eslint` e `tsc` limpos.
4. Passos 7–8: folha com seletor `[data-ui='highlight'] [data-part='match']`,
   estado `current` (fundo `accent-solid`, tinta `on-solid`, sem régua) e
   `disabled` próprio ou herdado; `tokens.json`; harness com seis cenas;
   fragmentos de `combobox`, `select`, `multi-select`, `command-palette`
   reescritos para a anatomia da família. Styles 181/181. Capturas em
   `/tmp/claude-1000/-home-dreco-dev-slotted/e24f7894-a26e-4c45-860b-83cfc626a4a3/scratchpad/shots/`.

## Tarefas concluídas (continuação)

5. Passo 10: React `packages/react/src/highlight/` (8/8 + stories 4/4);
   Angular `packages/angular/highlight/` (8/8 + stories 4/4). Hosts migrados:
   `combobox`, `select`, `multi-select`, `command-palette` nos dois bindings
   (React 112/112 nas duas suítes tocadas; Angular 166/166 nas seis);
   `listbox` sem a folha nos dois bindings.
6. Passo 11: páginas de referência nos dois bindings; React lida em 6006 a
   1280 claro e 720 escuro; `audit.mjs` limpo a 1280 e 620. 6007 em baixo.
7. Passo 12: `format:check`, `lint`, `typecheck`, `test:contracts` (1726/1726),
   `test:package-layers`, `test:docs` limpos nesta família; falhas restantes
   noutras lanes (`context-menu`, `hover-card`, `toggle-group`, `image`,
   `table`, `stat-card`, `aspect-ratio`). Builds de core, react e angular passam.
8. Passo 13: `docs/history/designs/2026-09-16-highlight-self-assessment.md`;
   `docs/process/build-order.md` com "Entregue" e as reaberturas de `menu` e `tree`.

## Tarefa em curso

Passo 14 — gate de lançamento. Mensagem entregue; aguardar.

## Git

Branch `review/implementation-pass-1`. Nada desta sessão no índice. Arquivos
desta sessão:

- `docs/history/designs/2026-09-16-highlight-capability-inventory.md`
- `docs/history/designs/2026-09-16-highlight-design.md`
- `specs/components/highlight/contract.json`, `contract.test.mjs`
- `specs/components/{combobox,multi-select,command-palette,select}/contract.json`;
  `specs/components/{combobox,command-palette}/contract.test.mjs`
- `packages/core/src/highlight/*`, `packages/core/src/collection/filter.ts`,
  `packages/core/package.json`, `packages/core/vite.config.ts`
- `packages/styles/src/highlight/*`;
  `packages/styles/src/{combobox,select,multi-select,command-palette}/*.harness.html`

Fora desta sessão, sujos no working tree: `menu` (React e Angular),
`popover`, `app-shell`, `avatar`, `date-field`, `time-field`, `datetime-field`,
`packages/react/{package.json,vite.config.ts,src/index.ts}`,
`packages/styles/package.json`, `docs/process/build-order.md`.

## Próxima ação

Após o gate: passo 15, um commit por passo, caminhos explícitos. Para
`docs/process/build-order.md`, `packages/react/package.json`, `packages/react/vite.config.ts`
e `packages/react/src/index.ts` (sujos por outra sessão), montar o patch só com
os hunks desta família e `git apply --cached`.
