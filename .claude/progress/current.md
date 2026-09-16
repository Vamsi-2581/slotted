# Checkpoint — rodada 17: `time-range-picker datetime-range-picker`

## Plano

`docs/build-schedule.md`, rodada 17, bloco `time-range-picker
datetime-range-picker`. Skill `/component`, modo `create`, uma sessão para as
duas famílias. Sem arquivo de plano.

## Tarefas concluídas

1. Passos 1–5: inventário em
   `docs/superpowers/specs/2026-09-15-time-range-capability-inventory.md`;
   desenho em `docs/superpowers/specs/2026-09-15-time-range-design.md`.
2. Passo 6: `specs/components/{time-range-picker,datetime-range-picker}/`
   (24 + 27); `node --test specs/*.test.mjs specs/components/*range-picker/*.test.mjs`
   96/96.
3. Motor: `packages/core/src/date/time-range.ts` (+ teste 29/29; `openingIndex`
   novo), exportado por `packages/core/src/date/index.ts`; `@slotted/core`
   reconstruído.
4. Passos 7–9: folhas, tokens, harness, capturas em
   `/tmp/claude-1000/-home-dreco-dev-slotted/ee1827b8-d2f8-44b5-9e25-e2b5b9195f0e/scratchpad/shots/`;
   gate visual aprovado com a moldura de uma linha (campos na banda). Depois
   do gate: linhas das listas centradas (`line-height` = altura), painel
   **[DT]** com tecto de 38 rem, folha com `max-block-size: 100dvh` e rolagem,
   atalhos numa linha própria na folha.
5. Passo 10: React (`packages/react/src/{time-range-picker,datetime-range-picker}/`,
   67/67 com stories) e Angular (`packages/angular/{time-range-picker,datetime-range-picker}/`,
   48/48 com stories; `ng build slotted-angular` passa). Fora da família:
   `label` em `time-field`/`datetime-field` Angular; os três campos Angular
   não repõem segmentos durante uma sequência de dígitos.
6. Passo 11: quatro páginas de referência (`*.docs.ts`, `*.stories.*`);
   as React lidas em 6006 a 1280/720 claro/escuro; `audit.mjs` limpo a 1280 e
   620. 6007 em baixo: Angular não lida renderizada.
7. Passo 12: `pnpm typecheck`, `test:contracts`, `test:package-layers`,
   `test:docs` passam; `pnpm lint` falha só em `toggle-group` (outra sessão);
   `prettier --check` falha só em `docs/nexora-op-demo-domain.md` (outra
   sessão); styles: 5 falhas fora da família (`alert`, `breadcrumb`, `tabs`,
   `tag`, `text-field`).
8. Passo 13: `docs/superpowers/specs/2026-09-15-time-range-self-assessment.md`.
   `docs/build-order.md`: parágrafo "Entregue" e reabertura de
   `date-range-picker`.

## Tarefa em curso

Concluída. Gate de lançamento aprovado ("finalize"); commits por passo
feitos (core, campos Angular, contratos, estilos, React, Angular, docs).

## Git

Branch `review/implementation-pass-1`. Sete commits desta sessão sobre `c2d5ceb`; nada no índice.
Arquivos desta sessão (para o passo 15, um commit por passo, caminhos
explícitos):

- core: `packages/core/src/date/time-range.ts`, `time-range.test.ts`,
  `packages/core/src/date/index.ts`
- campos Angular: `packages/angular/{date-field,time-field,datetime-field}/src/*.ts`
- contratos: `specs/components/{time-range-picker,datetime-range-picker}/`
- estilos: `packages/styles/src/{time-range-picker,datetime-range-picker}/`,
  `packages/styles/src/plain-variant.test.mjs`, `packages/styles/package.json`
- React: `packages/react/src/{time-range-picker,datetime-range-picker}/`,
  `packages/react/package.json`, `packages/react/src/index.ts`,
  `packages/react/vite.config.ts`
- Angular: `packages/angular/{time-range-picker,datetime-range-picker}/`
- docs: `docs/superpowers/specs/2026-09-15-time-range-*.md`,
  `docs/build-order.md`, `.claude/progress/current.md`

Os registros partilhados (`packages/react/package.json`, `src/index.ts`,
`vite.config.ts`, `packages/styles/package.json`, `docs/build-order.md`)
também têm linhas de outras sessões: ao commitar, `git add -p` só as linhas
destas famílias.

## Ajustes de escopo

- `lengthLabel(seconds, locale)` / `limitLabel(min, max, locale)`: a omissão
  escrevia na locale do runtime.
- Cenas `panel` (**[DT]** e `completeness`) abrem já abertas dentro de
  `slotted-demo-viewport[data-size="screen"]`.

## Próxima ação

Nenhuma nesta família. A reabertura de `date-range-picker` (moldura de uma
linha) e a de `table` (`between` com os dois pickers) estão em
`docs/build-order.md`.
