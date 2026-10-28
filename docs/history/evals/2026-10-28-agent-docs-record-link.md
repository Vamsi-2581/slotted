# Avaliação do material de agente — 2026-10-28, link do roteador

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

Alteração avaliada desde `v0.1.0-beta.18`: a linha de `render` do `agents-snippet.react.md` diz que um link do roteador nunca é desenhado sozinho, só como o elemento que o `render` de uma família devolve, `Link` para um link. Execução restrita ao caso novo `record-link`, uma execução por binding e por condição (`--runs 1 --case record-link`), sobre as tarballs de `590dab38`.

| Caso        | Binding | Condição | Disparo | Conformidade | Custo (USD) |
| ----------- | ------- | -------- | ------- | ------------ | ----------- |
| record-link | react   | com      | sim     | 2/2          | 0.32        |
| record-link | react   | sem      | sim     | 2/2          | 0.27        |
| record-link | angular | com      | sim     | 2/2          | 0.24        |
| record-link | angular | sem      | não     | 0/2          | 0.17        |

| Skill          | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) | Veredito |
| -------------- | --------------------- | ----------- | ---------------- | ----------- | ---------------- | ----------- | -------- |
| compose-screen | 2                     | 1.00        | 1.00             | 0.50        | 0.50             | 1.00        | atende   |

A execução React sem snippet também atende: o caso não separa, nesta amostra, o snippet novo do antigo, porque a condição "sem" retira o snippet inteiro e não só a linha alterada.
