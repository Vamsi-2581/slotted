# Checkpoint

- Plano: nenhum (pedido avulso: três findings da equori — `aside-resizer` com a marca do splitter, `minColumnWidth` da description-list, docs de inline-message e alert).
- Tarefas concluídas:
  - app-shell: `aside-resizer` renderiza `line`, `grip`, `line` nas duas bindings (Angular passa de `@Directive` a `@Component` de seletor de atributo); CSS desenha a marca em repouso com `--slotted-splitter-line-color` e `--slotted-splitter-line-active-color`; `--slotted-app-shell-resizer-color` removido (tokens.json, contract.ts regenerado); partes `line` e `grip` no contrato e nas duas docs.
  - description-list: `minColumnWidth: 'sm' | 'md'` (padrão `md`) nas duas bindings e nos providers de defaults; `data-min-column-width`; `sm` dobra 3→2 em 37.5rem e 2→1 em 25rem, `md` mantém 48rem e 34rem; contrato (`provides`, `resolution`, `defaults`, `reflow.breakpoints`) e docs.
  - inline-message/alert: regra CP-11 em `composition.md`; introdução e `families` de `errors-and-conflicts.md`; `alert` no lugar de `inline-message` em `reports.md` e `reading-permissions.md` (PM-02 nomeia `alert`); `size` descrito como "sm beside a compact field, md beside a large field" nas docs, tipos, stories e harness; primeira linha de Rules envia a mensagem de uma região para `alert`; teste `tools/agent-docs/src/inline-message-docs.test.ts`.
- Em curso: nenhuma.
- Git: branch main em `d4af53cd`; 58 ficheiros alterados sem commit, incluindo os 19 da sessão anterior (Nexora beta.17).
- Testes: React app-shell + description-list 96/96; React inline-message + field 71/71; Angular app-shell 43/43, description-list 27/27, inline-message 21/21; agent-docs 222/222; estilos e contratos verdes; `pnpm check` verde; `pnpm typecheck` com cache limpo 0 erros.
- Ajustes de escopo: a API proposta (`minColumnWidth` como comprimento CSS) não é implementável, porque uma condição `@container` não lê custom property; o dono escolheu degraus discretos. O resumo `catalog.summary` dos dois contratos ficou como estava.
- Problemas conhecidos: `pnpm typecheck` incremental emite 264 erros de inferência circular em `*.stories.tsx` quando um cache antigo encontra ficheiros editados; o mesmo programa com o cache apagado dá 0 erros. Layout real de `minColumnWidth="sm"` e da marca do resizer não verificado em navegador. `pnpm eval:agent-docs` não executado (obrigatório antes da release, porque `content/` mudou). Herdado: `analytics-routes.spec.ts` da Nexora falha em `executive`.
- Eval: `section-notices` 2/2 nas duas bindings, relatório em `docs/history/evals/2026-10-27-agent-docs-inline-message.md`. Resumos `catalog.summary` de inline-message e alert reescritos (limite de 56 caracteres).
- Próxima ação: CI verde em `main`, `pnpm release --dry-run`, `pnpm release` (0.1.0-beta.18).
