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
Passo 11 concluído; passo 12 (gates) e 13 (auto-avaliação) em curso.

- Passo 10 concluído — React, Angular, `@slotted/core/sticky-header`.
- Passo 11 — páginas de referência lidas por cena (capturas em `$SCRATCH/sb/*`),
  sondas comportamentais no browser (`$SCRATCH/behaviour.mjs`): React 36/36,
  Angular 33/33 (recolher por rolagem, revelar, fixar, manual, teclado,
  navegação de registos, rodapé, cabeçalhos de secção sob o chrome, estreito).
  Defeitos encontrados e corrigidos: `IntersectionObserver` sem margem
  superior (nunca marcava `data-scrolled` no Chrome), `stuck()` ignorava a
  borda do scroller, regra `collapse="manual"` em falta na folha, rodapé de
  `page` com presença não controlada, `<div>` de skeleton dentro de `<p>`,
  `ToolbarOverflow` em falta nas demos React, coluna das cenas alargada por um
  code drawer aberto (workbench), tabela `stickyTo="page"` a alargar páginas
  estreitas (demos passam a duas colunas; dívida registada em `build-order`).
- Storybooks privados: 6016 (React) e 6017 (Angular), logs em `$SCRATCH/sb-*.log`.
  Os partilhados 6006/6007 devolvem 404 para as pastas novas (cache de
  directório do Vite) e precisam de reinício pelo dono da outra sessão.

## Estado do repositório
- Branch `review/implementation-pass-1`; dez commits desta família, de `5a9eabe` a `HEAD` (`docs(page)`), só com caminhos e hunks próprios.
- Testes: React 50/50 (6 suites), Angular 41/41, core sticky-header 12/12,
  folhas page 11 / page-header 17 / section 10, contratos 16 / 21 / 13,
  workbench 35/35.
- `$SCRATCH` = `/tmp/claude-1000/-home-dreco-dev-slotted/059546e4-5393-4621-a0af-e6929feeebcb/scratchpad`.
- Ficheiros da outra sessão (não desta): `docs/BUILD-LOG.md`, `docs/build-schedule.md`,
  `packages/styles/src/calendar/`, `datetime-*`, `toggle-group`, `segmented-control`,
  `apps/demos/`, `.claude/progress/current.md`.

## Decisões tomadas
- Três famílias, três contratos; `page-header` como filho direto de `page > scroll`.
- Raiz `sticky` com deslocamento `-H` medido; área de título `sticky` a `0`
  dentro da raiz; sem `display: contents`.
- Estados `expanded` (capacidade `open`, razões pointer/keyboard/scroll/programmatic),
  `pinned` (capacidade `pressed`), `revealed`; facto medido `data-scrolled` com
  margem superior do observador igual ao que está acima da área.
- `data-when="expanded|snapped"` em partes; regra com seis atributos.
- Placeholder é de `skeleton` com raiz `span`; a folha só diz a largura.
- Ponte `--slotted-table-sticky-offset` ← `--slotted-page-sticky-top` na raiz de `page`.
- Nível de título por `typography` (`HeadingLevel` / `SlHeadingLevel`).
- Âncoras diferidas para `anchor-nav`.
- Angular: helpers de template usados por `@Component` de demonstração são
  `function` declarations sem `??`.

## Problemas conhecidos
- `core/overflow.reveal` rolava todos os antepassados (`scrollIntoView`);
  corrigido para rolar só o contentor no seu eixo (commit próprio).
- Tabela `stickyTo="page"` é `max-content` (fora desta família; registado).

## Próxima ação exata
Passo 14 — gate de lançamento entregue ao revisor. Depois da resposta: nada
pendente nesta família; os achados de `pnpm check` restantes pertencem a
`datetime-*`, `toggle-group` e `segmented-control` (outra sessão). Os
Storybooks partilhados 6006/6007 precisam de reinício para servir as pastas
novas; os privados 6016/6017 ficam no ar até serem parados.
