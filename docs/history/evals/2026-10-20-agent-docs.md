# Avaliação do material de agente — 2026-10-20

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

Alteração avaliada desde `v0.1.0-beta.3`: CP-09 em `content/guidelines/composition.md` (a troca de
região adia o render pesado), LP-14 em `content/guidelines/list-pages.md` (uma lista que pode passar
de cem linhas é `data-grid`) e dois passos de `content/skills/compose-screen/SKILL.md` (CP-09 e LP-14
em "4. Compose"; medição com CPU 4× em "6. Done"). Execução restrita aos cinco casos de
`compose-screen`, um `--case` por vez, nos dois bindings, sobre as tarballs de `a99c525c`.

| Caso            | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) |
| --------------- | --------------------- | ----------- | ---------------- | ----------- | ---------------- | ----------- |
| orders-list     | 6                     | 1.00        | 0.96             | 1.00        | 1.00             | 8.74        |
| customer-record | 6                     | 1.00        | 1.00             | 1.00        | 1.00             | 8.13        |
| customer-form   | 6                     | 1.00        | 1.00             | 1.00        | 0.83             | 4.75        |
| sales-overview  | 6                     | 1.00        | 1.00             | 1.00        | 1.00             | 4.91        |
| own-element     | 6                     | 1.00        | 1.00             | 1.00        | 1.00             | 8.03        |

| Skill          | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) | Veredito |
| -------------- | --------------------- | ----------- | ---------------- | ----------- | ---------------- | ----------- | -------- |
| compose-screen | 30                    | 1.00        | 0.99             | 1.00        | 0.97             | 34.56       | atende   |

Falhas: uma sessão React de `orders-list` com snippet reprovou em `no-literal`; quatro sessões de
`customer-form` sem snippet (três React, uma Angular) reprovaram em `mentions` `loading`.
