# Avaliação do material de agente — 2026-10-20, caminhos relativos

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

Alteração avaliada desde `v0.1.0-beta.4`: os caminhos de `skills/*/SKILL.md` e das diretrizes
passaram a ser relativos ao próprio ficheiro (`../../guidelines/composition.md`), e os dois snippets
abrem com a base dos caminhos ("Paths below are relative to the directory that holds node_modules.").
O texto de `content/` não mudou. Execução restrita a um caso, `orders-list` (skill `compose-screen`),
com o snippet, uma execução por binding (`--runs 1 --case orders-list --condition with`), sobre as
tarballs de `08fa74a1`: confirma que um agente segue os caminhos relativos até às diretrizes.

| Caso        | Binding | Disparo | Conformidade | Custo (USD) |
| ----------- | ------- | ------- | ------------ | ----------- |
| orders-list | react   | sim     | 4/4          | 0.65        |
| orders-list | angular | sim     | 4/4          | 0.88        |

| Skill          | Execuções com snippet | Disparo com | Conformidade com | Custo (USD) | Veredito |
| -------------- | --------------------- | ----------- | ---------------- | ----------- | -------- |
| compose-screen | 2                     | 1.00        | 1.00             | 1.53        | atende   |
