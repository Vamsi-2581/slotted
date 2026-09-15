# Checkpoint — reorganização de `docs/` para o passe 2

## Plano

Sem arquivo de plano. Escopo aprovado em chat: índice `docs/README.md`,
`docs/archive/` para o passe 1 e prompts de uso único, `build-order.md` e
`build-schedule.md` reescritos para as ondas 9 a 12, `implementation-review.md`
do passe 2 com triagem por família, índice de `docs/superpowers/specs/`,
limpeza de `.claude/progress/`.

## Tarefas concluídas

1. `docs/archive/`: 8 arquivos movidos por `git mv`.
2. `docs/build-order.md`: passe 1 em tabela, reaberturas prometidas, ondas 9–12
   com escopo por família (6 + 15 + 12 + 6 invocações), Specialized fora.
3. `docs/build-schedule.md`: "Onde estamos — 2026-09-15", rodadas 13–22.
4. `docs/implementation-review.md`: triagem (67 linhas, veredito vazio),
   R1–R7 sem os diagnósticos do passe 1, 4 itens pré-registrados
   (MS-2.1, MS-2.2, SA-2.1, SA-2.2). `docs/implementation-review-log.md` criado.
5. `docs/README.md` e `docs/superpowers/specs/README.md` (66 temas).
6. `docs/build-briefing.md` e `.claude/skills/component/SKILL.md`: item pendente
   de família entregue vai para "Reaberturas prometidas por escrito".
7. `.claude/progress/`: 11 checkpoints de famílias entregues removidos;
   `filter-bar.md` e `plain-variant.md` mantidos (rodada 13 os lê).

## Tarefa em curso

Commit da reorganização.

## Git

Branch `review/implementation-pass-1`, HEAD `fcb026d`. Índice: só os arquivos
desta reorganização (hunks de `docs/build-briefing.md` da sessão filter-bar
ficaram fora do índice). Árvore de trabalho: trabalho por commitar da sessão
`filter-bar code-block` e da variante `plain` (57 arquivos modificados,
famílias untracked em `packages/`).

## Testes

`pnpm exec prettier --check` passa nos arquivos novos.
`node --test scripts/verify-docs-snippets.test.mjs` falha em 9 snippets de
`segmented-control`, `splitter`, `toggle-group`, `action-bar` (`.docs.ts` em
`packages/`), sem relação com esta reorganização.

## Ajustes de escopo

- `docs/decisions/README.md` não foi alterado: `PROJECT-PRD.md` existe na raiz.
- `.codex/skills/component/SKILL.md` não contém a frase alterada em
  `.claude/skills/component/SKILL.md`; não foi tocado.

## Problemas conhecidos

- A triagem em `docs/implementation-review.md` depende do veredito humano por
  família; até lá a rodada 15 só tem os 4 itens pré-registrados.

## Próxima ação

`git commit` com os arquivos já no índice, mensagem
`docs: reorganiza docs/ para o passe 2 — arquivo do passe 1, ondas 9–12, triagem`.
