# Avaliação do material de agente — 2026-10-29, disposição de um form

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

Alteração avaliada desde `v0.1.0-beta.24`: `guidelines/forms.md` ganha FM-18 a FM-24 (coluna na medida do form, dois campos numa linha só quando são uma resposta, largura do campo, secções por tópico, conjunto de escolhas como pergunta, necessity dita uma vez, ajuda junto da pergunta). Execução restrita ao caso `customer-form`, uma execução por binding e por condição (`--runs 1 --case customer-form`), sobre as tarballs de `4d1c5030`.

| Caso          | Binding | Condição | Disparo | Conformidade | Custo (USD) |
| ------------- | ------- | -------- | ------- | ------------ | ----------- |
| customer-form | react   | com      | sim     | 4/4          | 0.41        |
| customer-form | react   | sem      | sim     | 3/4          | 0.44        |
| customer-form | angular | com      | sim     | 3/4          | 0.46        |
| customer-form | angular | sem      | sim     | 4/4          | 0.35        |

| Skill          | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) | Veredito |
| -------------- | --------------------- | ----------- | ---------------- | ----------- | ---------------- | ----------- | -------- |
| compose-screen | 2                     | 1.00        | 0.88             | 1.00        | 0.88             | 1.66        | atende   |

As duas falhas são a mesma asserção, `mentions loading`, uma com snippet e outra sem; nenhuma asserção do caso mede a disposição dos campos, por isso a amostra confirma que as regras novas não regridem o caso e não mede o seu efeito.
