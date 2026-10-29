# Avaliação do material de agente — 2026-10-29, superfícies da tabela do chart

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

Alteração avaliada desde `v0.1.0-beta.26`: o passo 3 do skill `theme-app` nomeia `--slotted-chart-table-surface` e `--slotted-chart-table-header-surface`, e fixa `--slotted-chart-surface` como opaco (`0e02b2cc`). Execução restrita ao caso `brand-theme`, o único que exercita o skill, uma execução por binding e por condição (`--runs 1 --case brand-theme`), sobre as tarballs de `0dbe255b`.

| Caso        | Binding | Condição | Disparo | Conformidade | Custo (USD) |
| ----------- | ------- | -------- | ------- | ------------ | ----------- |
| brand-theme | react   | com      | sim     | 4/4          | 0.25        |
| brand-theme | react   | sem      | sim     | 4/4          | 0.36        |
| brand-theme | angular | com      | sim     | 4/4          | 0.30        |
| brand-theme | angular | sem      | sim     | 4/4          | 0.32        |

| Skill     | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) | Veredito |
| --------- | --------------------- | ----------- | ---------------- | ----------- | ---------------- | ----------- | -------- |
| theme-app | 2                     | 1.00        | 1.00             | 1.00        | 1.00             | 1.24        | atende   |
