# Avaliação do material de agente — 2026-10-27

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

Alteração avaliada desde `v0.1.0-beta.16`: `overviews.md` ganhou OV-07 (uma visão geral que o leitor arranja é uma `dashboard-grid`) e OV-08 (dentro de uma moldura, a figura é `plain`); `review-screen` ganhou as duas linhas de varredura; LA-06 limita a altura de um sticky próprio por `--slotted-page-scrollport-block-size`; `compose-screen` encaminha um sticky próprio para LA-06 nos passos 3, 5 e 7. Execução restrita aos dois casos novos, com o snippet, uma execução por binding (`--runs 1 --case <caso> --condition with`), sobre as tarballs de `a9f485e6`.

| Caso            | Binding | Disparo | Conformidade | Custo (USD) |
| --------------- | ------- | ------- | ------------ | ----------- |
| review-overview | react   | sim     | 2/2          | 0.40        |
| review-overview | angular | sim     | 2/2          | 0.43        |
| sticky-summary  | react   | sim     | 2/2          | 0.61        |
| sticky-summary  | angular | sim     | 2/2          | 0.49        |

| Skill          | Execuções com snippet | Disparo com | Conformidade com | Custo (USD) | Veredito |
| -------------- | --------------------- | ----------- | ---------------- | ----------- | -------- |
| review-screen  | 2                     | 1.00        | 1.00             | 0.83        | atende   |
| compose-screen | 2                     | 1.00        | 1.00             | 1.10        | atende   |
