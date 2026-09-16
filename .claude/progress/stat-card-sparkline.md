# Checkpoint — onda 10: `stat-card sparkline`

## Plano

`docs/build-order.md`, onda 10, `stat-card sparkline`. Skill `/component`, modo
`create`, uma sessão para as duas famílias. Sem arquivo de plano.

## Tarefas concluídas

1. Passos 1–5: inventário e desenho em
   `docs/superpowers/specs/2026-09-16-stat-card-sparkline-{capability-inventory,design}.md`.
2. Fundação: `--slotted-data-1…8`, `--slotted-font-size-4xl`,
   `--slotted-line-height-4xl`, `--slotted-icon-trending-up`
   (`packages/tokens/src/contract.json`, `packages/themes/default/src/{theme,glyphs}.json`,
   `docs/token-foundation.md`, `scripts/verify-token-foundation.test.mjs`,
   `packages/themes/default/test/default-theme.test.mjs`).
3. Passo 6: contratos e testes (19/19).
4. Motor `packages/core/src/sparkline/` (29/29), registado em core.
5. Passo 7–8: folhas, harness, testes de estilo (14 + 17); capturas lidas.
6. Passo 9: gate visual aprovado ("pode seguir"); piso de 10 rem acrescentado
   depois da pergunta sobre a quebra por carácter.
7. Passo 10: React (`packages/react/src/{sparkline,stat-card}`, 28 testes) e
   Angular (`packages/angular/{sparkline,stat-card}`, 18 specs), registados em
   `packages/react/{package.json,src/index.ts,vite.config.ts}` e
   `packages/styles/package.json`.
8. Passo 11: docs + stories + stories tests em ambos (React 36 testes com as
   stories; Angular 26). Workbench: `measurement` aceita `value` ou `data`
   (`packages/storybook-workbench/src/scenarios.{tsx,test.ts}`). React
   Storybook (6006) lido a 1280; `audit.mjs` a 1280 e 620 nas duas páginas:
   0 achados. Angular Storybook (6007) sem resposta.
9. Passo 12: `pnpm lint/typecheck/test:contracts/test:package-layers/test:docs`
   passam; `format:check` falha em `docs/nexora-op-demo-domain.md` (outra
   lane); `turbo run verify --affected --continue` em curso (log em
   `scratchpad/verify2.log`).
10. Passo 13: `docs/superpowers/specs/2026-09-16-stat-card-sparkline-self-assessment.md`.
11. `docs/build-order.md`: reaberturas `typography` (4xl) e `chart`.

## Tarefa em curso

Passo 14 — gate de lançamento.

## Git

Branch `review/implementation-pass-1`, HEAD `c2d5ceb`. Nada no índice.

## Problemas conhecidos

- `packages/tokens/test/resolve.test.mjs` falha em HEAD (Geist); anterior.
- Cinco testes de estilo de `alert`/`breadcrumb`/`tabs`/`tag`/`text-field` e
  dois de lint em `toggle-group` falham na outra lane.
- A tabela de anatomia do workbench corta a coluna `purpose` a 1280 em todas
  as páginas (verificado em `skeleton`).

## Próxima ação

Depois do gate: passo 15, commits por passo, em ordem: fundação (tokens,
tema, docs, testes); workbench (`scenarios`); contratos; motor; folhas +
harness + testes; React; Angular; docs/stories; build-order + specs +
checkpoint. `git add` com caminhos explícitos.
