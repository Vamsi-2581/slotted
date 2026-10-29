# Avaliação do material de agente — 2026-10-29, secção de um form

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

Alteração avaliada desde `v0.1.0-beta.27`: `guidelines/forms.md`, regra de secções por tópico, passa a pedir cada tópico como `field-group` com `kind` igual a `section`. Execução restrita ao caso `customer-form`, uma execução por binding e por condição (`--runs 1 --case customer-form`), sobre as tarballs de `8d810e72`.

| Caso          | Binding | Condição | Disparo | Conformidade | Custo (USD) |
| ------------- | ------- | -------- | ------- | ------------ | ----------- |
| customer-form | react   | com      | sim     | 4/4          | 0.61        |
| customer-form | react   | sem      | sim     | 3/4          | 0.36        |
| customer-form | angular | com      | sim     | 4/4          | 0.55        |
| customer-form | angular | sem      | sim     | 3/4          | 0.46        |

| Skill          | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) | Veredito |
| -------------- | --------------------- | ----------- | ---------------- | ----------- | ---------------- | ----------- | -------- |
| compose-screen | 2                     | 1.00        | 1.00             | 1.00        | 0.75             | 1.97        | atende   |

As duas falhas são a asserção `mentions loading`, nas duas execuções sem snippet. Nenhuma asserção do caso mede `kind`: a amostra confirma que a regra reescrita não regride o caso, e não mede o seu efeito.
