# Checkpoint — onda 10: `table` (segunda reabertura)

`.claude/progress/current.md` pertence à sessão paralela de
`time-range-picker datetime-range-picker` (rodada 17); este arquivo é o
checkpoint desta sessão.

## Plano

`docs/build-schedule.md`, bloco `/component table` (onda 10). Skill
`/component`, modo `rebuild`. Sem arquivo de plano.

## Tarefas concluídas

1. Passos 1–9: inventário, desenho, contrato (39/39), folha, harness,
   capturas; gate visual aprovado ("siga").
2. Passo 10: `packages/react/src/table/{table-filter.tsx,table.types.ts,table.test.tsx}`
   (40/40); `packages/angular/table/src/{table-filter.ts,table.spec.ts}` (26/26).
3. Passo 11: stories e docs nos dois bindings (`filter-time`,
   `filter-datetime` com presets; cena `editing` nova); `table.stories.test.ts`
   4/4, `table.stories.spec.ts` 4/4. Página React lida a 1280 (light/dark) com
   o painel e o picker abertos; audit a 1280 e 620 sem achados nas três cenas.
   Porta 6007 sem resposta.
4. Passo 12: typecheck limpo; eslint e prettier limpos nos caminhos desta
   família; contracts 1664/1664, docs 25/25, package-layers 12/12.
   `pnpm check:affected` falha fora desta família (ver autoavaliação).
5. Passo 13: `docs/superpowers/specs/2026-09-16-table-range-operands-self-assessment.md`.
6. `docs/build-order.md`: entrega registrada no escopo da onda 10; duas
   reaberturas (`time-range-picker` `wrap`, `number-field` `text-align`).

## Tarefa em curso

Passo 14 — gate de release. Aguardar o revisor antes do passo 15 (commits).

## Git

Branch `review/implementation-pass-1`, HEAD `19f2309`. Nada no índice. Arquivos
desta sessão: `docs/superpowers/specs/2026-09-16-table-range-operands-*.md`
(3), `specs/components/table/*`,
`packages/styles/src/table/{table.css,table.harness.html,table.styles.test.mjs}`,
`packages/react/src/table/{table-filter.tsx,table.types.ts,table.test.tsx,table.stories.tsx,table.docs.ts}`,
`packages/angular/table/src/{table-filter.ts,table.spec.ts,table.stories.ts,table.docs.ts}`,
`docs/build-order.md` (duas linhas na tabela de reaberturas e o parágrafo
"Entregue" da onda 10), este arquivo.

## Problemas conhecidos

- Janela noturna: o picker marca `order`; `wrap` registrado.
- `number-field` `plain` em célula numérica alinha ao início; registrado.
- A superfície de `time-range-picker` aberta dentro do painel empilha os dois
  `panel` e a lista corre sob o `panel-label` (captura
  `scratchpad/sb/filter-time-light-1280-picker.png`); família da sessão
  paralela, ainda não commitada.

## Próxima ação

Depois do gate: passo 15, commits por passo, caminhos explícitos:
1. `spec(table): …` — os três specs de 2026-09-16 e `specs/components/table/*`.
2. `feat(styles): table — …` — os três arquivos de `packages/styles/src/table/`.
3. `feat(react): table — …` — os cinco arquivos React.
4. `feat(angular): table — …` — os quatro arquivos Angular.
5. `docs(build-order): table entregue na onda 10; …` — `docs/build-order.md`.
6. `chore(progress): table — checkpoint` — `.claude/progress/table.md`.
