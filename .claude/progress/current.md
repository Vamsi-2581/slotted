# Checkpoint

- Plano: `docs/history/plans/2026-10-19-fourth-iteration.md` (13 itens concluídos; Resultado e Problemas conhecidos preenchidos).
- Ramo `main`, igual a `origin/main`. Iteração em commits de `015558e1` a `320d486b`, mais este checkpoint.
- Tarefa em curso: release `v0.1.0-beta.4`.
- Concluído no release: build dos bindings; `pack-beta`; `pnpm eval:agent-docs` dos cinco casos de `compose-screen` (atende; relatório `docs/history/evals/2026-10-20-agent-docs.md`); `pnpm check:full` local exit 0; CI verde em `320d486b` (run 39360504382).
- Correções feitas durante o release: `SlDatePicker` genérico sobre o tipo do valor (os exemplos de dia não compilavam com strictTemplates); contrato gerado de `@slotted/theme` regenerado para `--slotted-table-edge-inset`; saem os testes de tempo de relógio da tabela e do accordion.
- Árvore: limpa, exceto `.swp` não rastreado (swap de um vim aberto pelo utilizador, pid 3337605), que faz `pnpm release` recusar a árvore.
- Problemas conhecidos: ver o plano (NG0953 no CI sem linha de base).
- Próxima ação: com o vim fechado e o CI deste checkpoint verde, `pnpm release --dry-run` e depois `pnpm release`; acompanhar com `gh run watch` o workflow Release da tag.
