# Checkpoint — rodada 16: `drag-and-drop` (`@slotted/core/drag`)

## Plano

`docs/build-schedule.md`, rodada 16 (bloco único). Sem arquivo de plano. Skill
`/component`, modo `infra`: sem contrato em `specs/components`, sem stylesheet,
sem binding, sem página de referência.

## Tarefas concluídas

1. Inventário, desenho e autoavaliação em
   `docs/superpowers/specs/2026-09-15-drag-{capability-inventory,design,self-assessment}.md`.
2. Módulo `packages/core/src/drag/` — `types`, `positions`, `keys`, `geometry`,
   `messages`, `drag`, `index`, quatro testes (70/70). Registro em
   `packages/core/package.json` (`./drag`) e `vite.config.ts`; fora de
   `src/index.ts`.
3. Harness de core: `tools/harness/core.mjs` (+ `core.test.mjs`, `vite` como
   devDependency de `@slotted/harness`), fragmento
   `packages/core/src/drag/drag.harness.html`, página em
   `tools/harness/out/drag.html`. Capturas lidas; ponteiro e teclado dirigidos
   em Chrome por `scratchpad/{drive,keys}.mjs`.
4. Docs: `docs/build-order.md` (módulo entregue, parágrafo da onda 9, linha de
   reabertura `tags-input`/`multi-select` → `moveBy`), `docs/build-briefing.md`
   (decisão `Escape` em `window`; harness de core no visual loop).
5. Verificação: `turbo run verify` em `@slotted/core` (68/1317) e
   `@slotted/harness` (85); `typecheck`, `test:contracts` (1552),
   `test:package-layers`, `test:docs` limpos; prettier nos caminhos deste
   módulo. `format:check` e `lint` globais falham fora do módulo
   (`side-navigation`, outra sessão; `toggle-group`, já em `HEAD`).

## Tarefa em curso

Gate aprovado ("continue"). Depois do gate: anel de foco do harness
(`z-index: 1`), alça opcional por contentor (`data-grip`), guarda de controle
interativo sem alça, menor contentor vence, `resolveTarget` opcional,
`touch-action` fora da alça. 72/72. Commits em curso.

## Git

Branch `review/implementation-pass-1`, HEAD `7627cd6`. Nada no índice. Árvore
com os arquivos acima mais `pnpm-lock.yaml` (entrada de `tools/harness` e
snapshots duplicados removidos pelo `pnpm add`). Não deste módulo:
`packages/styles/src/overlay-motion.test.mjs`, `side-navigation/*`,
`apps/demos/`.

## Ajustes de escopo

- `blocked` removido das mensagens.
- Soltar na identidade, em nada ou em posição recusada é cancelamento.
- A pré-visualização é clonada antes de a sessão ser publicada; `dropped` é
  anunciado antes de `onDrop`.

## Problemas conhecidos

Nenhum neste módulo.

## Próxima ação

Commits por passo, caminhos explícitos —
(1) `tools/harness/core.mjs core.test.mjs package.json pnpm-lock.yaml`;
(2) `packages/core/src/drag packages/core/package.json packages/core/vite.config.ts`;
(3) `docs/superpowers/specs/2026-09-15-drag-* docs/build-order.md docs/build-briefing.md`.
