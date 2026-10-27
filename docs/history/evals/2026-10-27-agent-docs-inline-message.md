# Avaliação do material de agente — 2026-10-27, mensagens de região

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

Alteração avaliada desde `v0.1.0-beta.17`: `composition.md` ganhou CP-11 (a mensagem de uma região é um `alert`; a de um controle é um `inline-message`); `errors-and-conflicts.md` nomeia `alert` ao lado de `inline-message`; `reports.md` e `reading-permissions.md` trocam `inline-message` por `alert` nas famílias, e PM-02 põe a declaração num `alert`. Execução restrita ao caso novo `section-notices`, com o snippet, uma execução por binding (`--runs 1 --case section-notices --condition with`), sobre as tarballs de `19ba0d82`.

| Caso            | Binding | Disparo | Conformidade | Custo (USD) |
| --------------- | ------- | ------- | ------------ | ----------- |
| section-notices | react   | sim     | 2/2          | 0.49        |
| section-notices | angular | sim     | 2/2          | 0.45        |

| Skill          | Execuções com snippet | Disparo com | Conformidade com | Custo (USD) | Veredito |
| -------------- | --------------------- | ----------- | ---------------- | ----------- | -------- |
| compose-screen | 2                     | 1.00        | 1.00             | 0.94        | atende   |
