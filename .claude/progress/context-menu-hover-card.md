# Checkpoint — rodada 18: `context-menu hover-card`

## Plano

`docs/process/build-schedule.md`, rodada 18, bloco `context-menu hover-card`. Skill
`/component`, modo `create`, uma sessão para as duas famílias. Sem arquivo de
plano. Outras sessões na mesma worktree (`highlight`, `stat-card sparkline`,
`table`): só arquivos das duas famílias, do núcleo alterado e os registros
append-only são escritos.

## Tarefas concluídas

1. Passos 1–5: inventário, desenho (`docs/history/designs/2026-09-16-context-menu-hover-card-*.md`).
2. Passo 6: contratos `specs/components/{context-menu,hover-card}/` — 13 + 17.
3. Passo 7: `packages/styles/src/{context-menu,hover-card}/`; `packages/styles/package.json`.
4. Passos 8–9: capturas no scratchpad (`shots/`); gate visual aprovado
   ("pode seguir") com `sideOffset` 4 px no hover-card.
5. Núcleo, commitado: `a7da316` (menu: `anchor`, `finalFocus`), `f20042e`
   (popover: `role` do consumidor).
6. Passo 10: `packages/react/src/{context-menu,hover-card}/` (15 + 13 testes);
   `packages/angular/{context-menu,hover-card}/` (10 + 10 specs);
   registros React (`package.json`, `vite.config.ts`, `src/index.ts`).
7. Passo 11: docs, stories, stories tests em ambos os frameworks (4 + 4 + 4 + 4).
   Páginas React lidas em 6006 a 1280 claro e 720 escuro; `audit.mjs` limpo a
   1280 e 620. 6007 em baixo: Angular não lida renderizada.
8. Passo 12: `test:contracts` 1726/1726, `test:package-layers`, `test:docs`
   25/25, styles 170/170, React vitest (famílias + núcleo) 112/112.
   `pnpm check` falha em `format:check` só em `demos/nexora/domain.md` e
   `packages/styles/src/stat-card/stat-card.harness.html` (outras sessões).
   `lint`, `typecheck` e `ng build` completos: em curso em segundo plano.
9. Passo 13: `2026-09-16-context-menu-hover-card-self-assessment.md`;
   `docs/process/build-order.md` com "Entregue" e duas reaberturas.

## Tarefa em curso

Nenhuma. Gate de release aprovado ("finalize"); passo 15 fechado em cinco
commits: `e466bbd` (specs), `b58c8fa` (styles), `379031b` (react), `6b0e4d8`
(angular), `0c2baab` (docs). Núcleo antes: `a7da316` (menu), `f20042e`
(popover). Depois do gate, a marca `open` do alvo passou a `::after`
sobreposto (só os cantos apareciam sob um card) e os tiles das páginas são o
próprio alvo.

## Git

Branch `review/implementation-pass-1`, HEAD `0c2baab`. Nada desta família fora do índice.

## Problemas conhecidos

- Angular: `slContextMenuTriggerFor` e `slHoverCardTrigger` são componentes
  (carregam o CSS); não coexistem com `a[slLink]`/`button[slButton]` no mesmo
  elemento. Registrado na autoavaliação (dim. 8) e na página Angular.
- Um `sl-menu` tem um só elemento de gatilho: dois gatilhos (região + botão)
  usam dois `sl-menu` sobre um `ng-template` de comandos.
