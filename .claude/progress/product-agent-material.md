# Checkpoint — material de agente do produto, subprojeto 2

- Plano: `docs/history/plans/2026-10-16-tokens-and-own-elements.md`; spec `docs/history/designs/2026-10-16-tokens-and-own-elements-design.md`.
- Concluídas: Tasks 1–10. Avaliação: `docs/history/evals/2026-10-17-agent-docs.md` (a0176fba), feita pela sessão das skills de produto (`.claude/progress/product-skills.md`).
- HEAD: `b7cf30fd`, ramo `main`, igual a `origin/main`; CI 39063683179 verde.
- Árvore: `.claude/progress/current.md` com alteração de outra sessão, não commitada.
- npm: dist-tag `beta` parado em `0.1.0-beta.0` nos seis pacotes; `latest` em `0.1.0-beta.1`. A sessão não tem credencial npm (só OIDC no workflow).
- Próximas ações, em ordem:
  1. `pnpm release --dry-run` com `current.md` em stash, mostrado ao usuário.
  2. Com aprovação do usuário: `pnpm release`, `gh run watch <id>`, `npm view @slotted/<p>@<versão> dist-tags --prefer-online` nos seis pacotes.
  3. Usuário, com login npm: `for p in styles theme core themes angular react; do npm dist-tag rm @slotted/$p beta; done`.
