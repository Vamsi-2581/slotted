# Avaliação do material de agente — 2026-10-28, filtros dos footers e overlays

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

Alteração avaliada desde `v0.1.0-beta.21`: o passo 3 do skill `theme-app` nomeia `--slotted-drawer-footer-surface` com `--slotted-drawer-footer-backdrop-filter` e `--slotted-chart-overlay-backdrop-filter` (`a8e54300`). Execução restrita ao caso `brand-theme`, o único que exercita o skill, uma execução por binding e por condição (`--runs 1 --case brand-theme`), sobre as tarballs de `b1b64637`.

| Caso        | Binding | Condição | Disparo | Conformidade | Custo (USD) |
| ----------- | ------- | -------- | ------- | ------------ | ----------- |
| brand-theme | react   | com      | sim     | 4/4          | 0.27        |
| brand-theme | react   | sem      | sim     | 4/4          | 0.31        |
| brand-theme | angular | com      | sim     | 4/4          | 0.39        |
| brand-theme | angular | sem      | sim     | 4/4          | 0.32        |

| Skill     | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) | Veredito |
| --------- | --------------------- | ----------- | ---------------- | ----------- | ---------------- | ----------- | -------- |
| theme-app | 2                     | 1.00        | 1.00             | 1.00        | 1.00             | 1.29        | atende   |
