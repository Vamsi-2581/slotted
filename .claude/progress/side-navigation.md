# Checkpoint — rodada 17: `side-navigation`

Escrito aqui e não em `current.md`, que a sessão de `drag-and-drop` ocupa nesta
mesma worktree.

## Plano

`docs/build-schedule.md`, rodada 17, bloco `side-navigation`. Skill
`/component`, modo `novo`.

## Tarefas concluídas

1. Inventário: `docs/superpowers/specs/2026-09-15-side-navigation-capability-inventory.md`.
2. Desenho: `docs/superpowers/specs/2026-09-15-side-navigation-design.md`.
3. Contrato e teste: `specs/components/side-navigation/` (14 testes passam).
4. Folha de estilo, tokens, harness e teste de estilo:
   `packages/styles/src/side-navigation/`.
5. Registo do flyout em `packages/styles/src/overlay-motion.test.mjs` (ferramenta partilhada; commit próprio).
6. Capturas lidas: default (light, dark, high-contrast, 240, dense, rtl, focus no trigger), hybrid, compact (light, dark com focus), flyout (light, dark), content, sizes, loading.

## Tarefa em curso

Passo 14 — gate de release. Passos 10–13 feitos: `@slotted/core/text`
(commit próprio), `useAppShellIfPresent()` em `app-shell` React, binding React
(19 testes + 4 de página), binding Angular (13 + 4), demonstrações de
`app-shell` nos dois bindings sobre a família, autoavaliação em
`docs/superpowers/specs/2026-09-15-side-navigation-self-assessment.md`.
Páginas de referência não lidas: os Storybooks precisam de reinício.

## Git

HEAD `041cf7a` (a sessão `drag` commitou três), ramo
`review/implementation-pass-1`. Nada commitado desta família. Árvore partilhada com a sessão `drag-and-drop` (`packages/core/src/drag/`,
`tools/harness/core.mjs`, `packages/core/package.json`, `pnpm-lock.yaml`).

## Testes

`node --test packages/styles/src/*.test.mjs packages/styles/src/side-navigation/*.test.mjs specs/components/side-navigation/*.test.mjs specs/*.test.mjs` → 230 passam.

## Ajustes de escopo

- Gate visual, primeira volta do revisor: chevron fechado aponta para a
  direita (`chevron-right`, um quarto de volta aberto, espelhado em RTL);
  parte `count` nova (algarismos tabulares, sem tom) ao lado de `end`; fila de
  duas linhas apertada (marca centrada no par, sem folga entre as linhas);
  recuo constante (`--slotted-side-navigation-indent-step`, 20 px) abaixo do
  nível com marca; plano de motion escrito no comentário de `item`.
- Segunda volta: descrição com folga de `--slotted-space-1` e tinta
  `--slotted-text` na fila corrente (a apagada mede 4,47:1 sobre o chão
  accent em light); eixo `truncate` (omissão `false`: o rótulo envolve;
  `true`: reticências e o binding abre o tooltip com o texto inteiro na fila
  que mediu cortada).
- Terceira volta: `truncate: end | middle | none`, omissão `end`; cinco
  decisões escritas em `contract.truncate` e no desenho §3b; `middle` exige
  `@slotted/core/text` (novo módulo, commit próprio, registo em
  `packages/core/package.json` — append-only, a sessão `drag` também o toca).

- Eixo `marker: fill | bar` retirado: `state-rail.test.mjs` (R1) recusa uma
  faixa de estado na aresta inicial. Registado em `declined.bar`.
- Aresta do item corrente: `--slotted-border-subtle`, não
  `--slotted-tone-accent-border` (lia-se como opção escolhida em `light`).

- Gate de release, primeira volta: `text-box: trim-both cap alphabetic` nos
  quatro textos, sob `@supports`, com padding de compensação.

- Segunda volta do gate: `align-content: start` no `item` (o trilho `auto`
  esticado saltava de 34 para 60 px a meio de cada abertura); a folga do
  grupo só no estado aberto; chevron em `medium`; `actions` com margem;
  cenas `size` e `content` a uma coluna. Página React lida (light, dark,
  1280, 620; audit limpo). Angular por ler: Storybook não escuta em 6007.
- Terceira volta: `section-label` com `margin-block-end` (token
  `--slotted-side-navigation-section-label-gap`, 4 px); a cena `default` do
  harness passa a ter a primeira fila corrente.

## Problemas conhecidos

- React precisa de `useAppShellIfPresent()` exportado de
  `packages/react/src/app-shell` (ficheiro de outra família; seis linhas).
- Angular: `link` e `trigger` serão componentes com `hostDirectives: [SlTooltip]`
  e `ng-template slTooltipLayer` sob `@if (compact())`.

## Próxima ação

Após o gate de release: passo 15, commits por passo (ordem em «Commits»).

## Commits a fazer

1. `packages/core/src/text/*`, `packages/core/package.json`, `packages/core/vite.config.ts` — módulo.
2. `packages/styles/src/overlay-motion.test.mjs` — registo do flyout.
3. `packages/react/src/app-shell/app-shell.tsx`, `index.ts` — `useAppShellIfPresent`.
4. `specs/components/side-navigation/*`, `docs/superpowers/specs/2026-09-15-side-navigation-*.md`, `packages/styles/src/side-navigation/*`, `packages/styles/package.json`, `packages/react/src/side-navigation/*`, `packages/react/src/index.ts`, `packages/react/package.json`, `packages/react/vite.config.ts`, `packages/angular/side-navigation/*` — a família.
5. `packages/react/src/app-shell/app-shell-demo/*`, `packages/angular/app-shell/src/app-shell.stories.ts` — demonstrações.
6. `docs/build-order.md` (pendente: mover `side-navigation` para entregue), `.claude/progress/side-navigation.md`.

Antiga «Após o gate: passo 10.» Criar `packages/react/src/side-navigation/` a partir de
`packages/react/src/collapsible/` (defaults, types, root, parts, index) e
`packages/angular/side-navigation/` a partir de `packages/angular/collapsible/`;
registar em `packages/react/src/index.ts`, `packages/react/package.json`,
`packages/react/vite.config.ts`, `packages/angular/tsconfig.base.json`,
`packages/styles/package.json` (append-only, reler antes).
