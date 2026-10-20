# Checkpoint

- Plano: `docs/history/plans/2026-10-20-fifth-iteration.md` (nove itens, cinco fatias).
- Concluído: fatia 1 (itens 1, 2, 3), commits `83c572ad`, `96683c54`, `a15a86cb`, `b23bda38`, `cc4df34a`.
- Em curso: fatia 2 (itens 7, 8, 9), não iniciada.
- Git: ramo `main`, HEAD `cc4df34a`, à frente de `origin/main`; árvore limpa.
- Testes: `pnpm check:affected` falhou só em `@slotted/styles#verify` (anel do navegador não suprimido, seletor partido pelo prettier); após a correção, `pnpm --filter @slotted/styles verify` passa (1684), lint e prettier dos ficheiros alterados passam. As outras tarefas do `check:affected` passaram antes da correção de CSS.
- Ajustes de âmbito: `focusTarget` e `createFocusOrigin` em `@slotted/core/focus`; supressão do anel do navegador nas três regiões; `focus-ring.test.mjs` ignora `[data-focus-origin]`.
- Problemas conhecidos: ver o plano (item 3 sem verificação no Chrome).
- Próxima ação: item 7 — em `tools/agent-docs/src/skills.ts`, renderizar `{{docsDir}}` dos `SKILL.md` como `../..`; acrescentar a frase de base aos dois `agents-snippet.*.md`; escrever o teste que resolve os caminhos em `tools/agent-docs/src/`.
