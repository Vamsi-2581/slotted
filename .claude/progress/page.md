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
Segunda ronda de revisão (feedback do revisor no Storybook reiniciado), em
validação final antes de commitar.

- Corrigido: laço expandir/recolher depois de revelar (motor ignora o relato
  "dentro" enquanto a raiz volta ao deslocamento; ignora área com altura zero
  e "fora" com scrollTop 0); secção a subir por cima do cabeçalho fixado
  (raiz três passos acima na pilha sticky); aresta do chrome inconsistente
  (borda inferior da raiz, largura total, sem sombra; régua do pill acima das
  abas em largura total; track das abas transparente); área recolhida pelo
  controlo deixava 27 px; título/subtítulo/descrição sem limite (2/2/3
  linhas); transição de tamanho do título removida; voltar cede às migalhas;
  ícone do botão Imprimir no slot `start`; grelha das abas sem gap em torno de
  colunas vazias (`tabs.css`).
- Terceira ronda: abas a flutuar (grelha de `tabs` com gap sob a lista sem
  painel — uma linha explícita), oscilação ao rolar para cima com a área
  recolhida pelo controlo (dobra instantânea com compensação do scroll no
  motor, `$SCRATCH/stress.mjs` a zero flips espúrios), cena das camadas sticky
  nas duas páginas de `section`, nota do voltar na cena de anatomia.
- Novo: uma secção sticky mede o cabeçalho (`--slotted-section-header-size`)
  e o corpo republica `--slotted-page-sticky-top` = página + cabeçalho, e
  faz ponte para a tabela — camadas sticky somam-se sob um só nome.
- Testes: styles 61/61 (page-header 20, section 15, tabs 24, tokens, motion),
  core sticky-header 15/15, React 87/87 (page, page-header, section, tabs).

## Estado do repositório
- Branch `review/implementation-pass-1`; dez commits desta família até `997d702`;
  a ronda dois ainda não está commitada.
- `$SCRATCH` = `/tmp/claude-1000/-home-dreco-dev-slotted/059546e4-5393-4621-a0af-e6929feeebcb/scratchpad`.

## Próxima ação exata
Confirmar `ng test` (section, page, page-header, tabs), sondas
`$SCRATCH/behaviour.mjs` em 6016 e 6017 e `audit.mjs` nas seis páginas; depois
commits por passo com caminhos explícitos: core (motor + testes), styles
(page-header, section, tabs, runtime), react, angular, docs.
