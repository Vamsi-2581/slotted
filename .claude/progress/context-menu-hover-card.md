# Checkpoint — rodada 18: `context-menu hover-card`

## Plano

`docs/build-schedule.md`, rodada 18, bloco `context-menu hover-card`. Skill
`/component`, modo `create`, uma sessão para as duas famílias. Sem arquivo de
plano. Outras sessões na mesma worktree (`highlight`, `stat-card sparkline`,
`table`): só arquivos das duas famílias, do núcleo alterado e os registros
append-only são escritos.

## Tarefas concluídas

1. Passos 1–5: inventário, desenho (`docs/superpowers/specs/2026-09-16-context-menu-hover-card-*.md`).
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
   `pnpm check` falha em `format:check` só em `docs/nexora-op-demo-domain.md` e
   `packages/styles/src/stat-card/stat-card.harness.html` (outras sessões).
   `lint`, `typecheck` e `ng build` completos: em curso em segundo plano.
9. Passo 13: `2026-09-16-context-menu-hover-card-self-assessment.md`;
   `docs/build-order.md` com "Entregue" e duas reaberturas.

## Tarefa em curso

Passo 14 — gate de release.

## Próximo passo executável

Após o gate, passo 15: um commit por passo, caminhos explícitos:

- contratos: `specs/components/context-menu/*`, `specs/components/hover-card/*`
- estilos: `packages/styles/src/context-menu/*`, `packages/styles/src/hover-card/*`,
  `packages/styles/package.json` (só as quatro linhas)
- React: `packages/react/src/context-menu/*`, `packages/react/src/hover-card/*`,
  `packages/react/package.json`, `packages/react/vite.config.ts`,
  `packages/react/src/index.ts` (só as linhas das duas famílias)
- Angular: `packages/angular/context-menu/**`, `packages/angular/hover-card/**`
- docs: `docs/superpowers/specs/2026-09-16-context-menu-hover-card-*.md`,
  `docs/build-order.md` (só os hunks destas famílias),
  `.claude/progress/context-menu-hover-card.md`

Os registros partilhados têm linhas de outras sessões: `git diff` e
`git apply --cached` com o patch filtrado, nunca `git add` do arquivo inteiro.

## Git

Branch `review/implementation-pass-1`, HEAD `f20042e` (+ commits alheios).

## Problemas conhecidos

- Angular: `slContextMenuTriggerFor` e `slHoverCardTrigger` são componentes
  (carregam o CSS); não coexistem com `a[slLink]`/`button[slButton]` no mesmo
  elemento. Registrado na autoavaliação (dim. 8) e na página Angular.
- Um `sl-menu` tem um só elemento de gatilho: dois gatilhos (região + botão)
  usam dois `sl-menu` sobre um `ng-template` de comandos.
