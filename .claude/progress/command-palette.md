# Checkpoint — `command-palette` (onda 9)

Ficheiro próprio porque `current.md` pertence a outra sessão nesta worktree
(rodada 16, `drag`).

## Plano

`docs/process/build-order.md`, onda 9, item `command-palette`. Skill `/component`, modo
criar. Inventário e desenho em
`docs/history/designs/2026-09-15-command-palette-{capability-inventory,design}.md`.

## Tarefas concluídas

1. Passos 1–5: leitura da lei, inventário (4 secções), desenho, tabelas de
   integração React e Angular.
2. Passo 6: `specs/components/command-palette/contract.json` + `contract.test.mjs`
   (21/21). Adições a `packages/core` commitadas em `70ec5a7`
   (`createRanker` em `collection/filter.ts`; `matchesShortcut`,
   `isEditableTarget` em `keys/keys.ts`).
3. Passos 7–8: `packages/styles/src/command-palette/{command-palette.css,
   .harness.html, .tokens.json}`; harness gerado por
   `/tmp/claude-1000/-home-dreco-dev-slotted/180c6b84-1dec-4bf2-bdad-cc132e997bd3/scratchpad/gen-harness.py`.
   Capturas lidas: light/dark/high-contrast 420 (`default`), light 240, dense,
   rtl (`pages`), `query` com foco em `clear`, `content` dark, `states`, `sizes`.
   Testes partilhados de `packages/styles` passam para esta família (a falha
   restante é `top-navigation`, de outra sessão).

## Tarefas concluídas (continuação)

4. Passo 10: `@slotted/core/commands` (`c2a7fee`); React
   `packages/react/src/command-palette/` (27 testes); Angular
   `packages/angular/command-palette/` (17 testes); registos em
   `packages/styles/package.json`, `packages/react/{package.json,vite.config.ts,src/index.ts}`.
5. Passo 11: docs e stories em ambos (20 cenas; testes de página 4+4 passam).
   Páginas **não lidas renderizadas**: Storybook React não vê a nova
   exportação de styles; Angular não está no ar.
6. Passo 12: React test/build ok; Angular build + bundle tests ok; core ok;
   contratos ok; falhas fora da família: lint em `toggle-group`, docs-snippets
   em `top-navigation`, styles em `alert`/`breadcrumb`/… (rodada R2 de outra
   sessão).
7. Passo 13: `docs/history/designs/2026-09-15-command-palette-self-assessment.md`.

## Tarefa em curso

Nenhuma. Família entregue: commits `5ffa6dd`, `ef80746`, `fb7c45b`,
`43ba9ab`, `3e2f931`, `f51759b` (núcleo em `70ec5a7`, `c2a7fee`). Pendentes
para outra sessão: página Angular por ler (6007 em baixo); reaberturas de
`dialog` (`ariaLabel`) e `combobox` (`createRanker`) em `docs/process/build-order.md`.

## Git

Branch `review/implementation-pass-1`; HEAD `70ec5a7`. Árvore com ficheiros
não rastreados desta família (specs, styles, docs) e ficheiros de outras
sessões (`top-navigation`, `time-range-picker`, `demos`, tokens/tema).

## Testes

- `node --test specs/components/command-palette/*.test.mjs` — 21 pass.
- `node --test packages/styles/src/*.test.mjs` — 163 pass, 1 fail
  (`top-navigation`, não é desta família).
- `packages/core` vitest — 185 pass.

## Ajustes de escopo

- Breakpoint do contêiner 400px → 360px (a 420px o painel ficava sem descrição).
- Trilho de estado na borda inicial recusado por R1 (`state-rail.test.mjs`);
  a linha corrente usa chão + anel inset, como `combobox`.
- `busy` também aparece no item pendente (coluna 5).
- `meta` sem `shortcut` ocupa as colunas 3–4.
- Revisão 1 do portão visual: os atalhos do harness omitiam
  `data-legend="symbol"` (o binding real de `kbd` escreve-o); corrigido no
  gerador. Tamanho do `kbd` segue o passo da paleta (`sm|md|lg`), rodapé em `sm`.
- O diálogo do harness passou a `fullScreen="narrow"`; abaixo de 30rem do
  contêiner do diálogo a raiz fixa-se à camada (`position: absolute; inset: 0`)
  e perde raio, borda lateral e sombra — um painel `plain` não é limitado pelo
  diálogo e o rodapé saía do ecrã.

## Problemas conhecidos

- O harness limita a cena fixa a 420px de altura; a lista (22rem) + cabeçalho
  + rodapé excede e o corte é do harness, não da família.
- `packages/styles/package.json` já está modificado por outra sessão; a
  entrada `./command-palette/command-palette.css` ainda não foi inserida.

## Próxima ação exata

Após o portão de release: passo 15 — commits por passo, ficheiros explícitos; inserir a linha de `command-palette` em `docs/process/build-order.md` (entregue na onda 9). Antes disso, se o revisor reiniciar o Storybook: Criar `packages/react/src/command-palette/`
(`command-palette.tsx`, `command-palette.types.ts`, `command-palette-defaults.tsx`,
`command-palette-items.tsx`, `index.ts`, `command-palette.test.tsx`) compondo
`../dialog` (`Dialog`, `DialogContent`, `DialogTrigger`) e `../kbd` (`Shortcut`);
registar `./command-palette/command-palette.css` em `packages/styles/package.json`
e a exportação em `packages/react/src/index.ts`, `packages/react/package.json`,
`packages/react/vite.config.ts`.
