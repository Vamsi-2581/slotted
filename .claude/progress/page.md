# Checkpoint — page / page-header / section

Plano: `.claude/skills/component/skill.md`, onda 7 de `docs/build-order.md`.
`current.md` pertence à sessão de `datetime-*`; este ficheiro é o desta família.

## Tarefas concluídas
- Passos 1–2 — lei lida; modo criação (três famílias novas).
- Implementação do revisor lida: `~/dev/ASTI/libs/sirius-ui/src/components/{page,page-header,section}`.
- Passo 3 — `docs/superpowers/specs/2026-09-10-page-capability-inventory.md`.
- Passo 4 — APG Landmark Regions, Disclosure, Button lidos na fonte em 2026-09-10.
- Passo 5 — `docs/superpowers/specs/2026-09-10-page-design.md`, com as duas
  tabelas de integração por família.
- Passo 6 — três contratos e três testes (`specs/components/{page,page-header,section}`),
  escritos teste primeiro. Razão `scroll` em `specs/contract.schema.mjs` e em
  `packages/core/src/state/state.ts` (alteração partilhada, commit próprio).
- Passo 7 — três folhas, três `tokens.json`, três fragmentos de harness, três
  testes de folha. Glifos `arrow-left`, `pin`, `pin-off` em `glyphs.json`,
  `contract.json` e `docs/token-foundation.md` (commit próprio). Tema
  recompilado (48 glifos). Propriedades de runtime em
  `packages/styles/src/runtime-properties.mjs` + `tokens.test.mjs`.
  `packages/styles/package.json` com as seis exportações.
- Passo 8 — capturas lidas em quatro rondas; dez defeitos corrigidos.

## Tarefa em andamento
Nenhuma. A família está entregue: gate de lançamento respondido em sete
rondas de revisão no Storybook, tudo commitado até `f4e43f8`.

- Rondas: laço de recolher/revelar (motor), aresta e sombra, limites de texto,
  voltar cede às migalhas, camadas sticky em `section`, abas na aresta,
  dobra compensada, revelação mantida ao rolar para cima, `data-tall`,
  `inset="none"` no drawer, esqueletos com a largura das palavras, visual
  como ícone/imagem/iniciais.
- Sondas: `$SCRATCH/behaviour.mjs` (36 React, 33 Angular), `stress.mjs`,
  `trace.mjs`; auditoria a zero nas seis páginas.
- Storybooks privados 6016/6017 no ar; o 6006/6007 partilhados servem o
  mesmo código por HMR, mas o motor nasce num efeito — recarregar a página
  depois de uma mudança no core.

## Próxima ação exata
Nada nesta família. Ficheiros modificados restantes no worktree pertencem a
outras sessões (`action-bar`, `app-shell`, `datetime-*`, `toggle-group`,
`segmented-control`).
