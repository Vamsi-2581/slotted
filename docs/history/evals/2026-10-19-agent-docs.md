# Avaliação do material de agente — 2026-10-19

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

Alteração avaliada desde `v0.1.0-beta.2`: `content/skills/theme-app/SKILL.md` ganhou o passo 4 da
secção "One region" (uma barra da aplicação sobre conteúdo que rola lê
`--slotted-surface-material` e `--slotted-material-backdrop`). Execução restrita ao caso desse
skill: `pnpm eval:agent-docs --case brand-theme`, nos dois bindings, sobre as tarballs de
`d7bd74d7`.

| Skill     | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) | Veredito |
| --------- | --------------------- | ----------- | ---------------- | ----------- | ---------------- | ----------- | -------- |
| theme-app | 6                     | 1.00        | 1.00             | 1.00        | 1.00             | 3.40        | atende   |
