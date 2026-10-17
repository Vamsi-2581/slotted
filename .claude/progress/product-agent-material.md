# Checkpoint — material de agente do produto, subprojeto 2

- Plano: `docs/history/plans/2026-10-16-tokens-and-own-elements.md`; spec `docs/history/designs/2026-10-16-tokens-and-own-elements-design.md`.
- Concluídas: Tasks 1–10. Avaliação: `docs/history/evals/2026-10-17-agent-docs.md` (a0176fba).
- Release: `v0.1.0-beta.2` (990f54a5), workflow 39067580012 com sucesso. Os seis pacotes `@slotted/*` estão em `latest` = `0.1.0-beta.2` no npm. O tarball de `@slotted/react` contém `dist/docs/tokens.md`, `guidelines/index.md`, `skills/index.md` e cinco `SKILL.md`.
- HEAD: `990f54a5`, ramo `main`, igual a `origin/main`.
- Problema conhecido: dist-tag `beta` parado em `0.1.0-beta.0` nos seis pacotes. A sessão não tem credencial npm (só OIDC no workflow).
- Próxima ação (usuário, com login npm): `for p in styles theme core themes angular react; do npm dist-tag rm @slotted/$p beta; done`.
