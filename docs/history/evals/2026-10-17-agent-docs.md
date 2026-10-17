# Avaliação do material de agente — 2026-10-17

Modelo: `claude-sonnet-5-5`. Limiares: disparo ≥ 0.9, conformidade ≥ 0.85.

| Skill             | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) | Veredito |
| ----------------- | --------------------- | ----------- | ---------------- | ----------- | ---------------- | ----------- | -------- |
| build-own-element | 6                     | 1.00        | 0.96             | 0.67        | 0.67             | 3.77        | atende   |
| compose-screen    | 30                    | 1.00        | 0.99             | 1.00        | 0.97             | 33.80       | atende   |
| review-screen     | 6                     | 1.00        | 1.00             | 1.00        | 1.00             | 5.42        | atende   |
| theme-app         | 6                     | 1.00        | 0.83             | 0.83        | 1.00             | 3.03        | abaixo   |
| waiting-states    | 24                    | 1.00        | 0.98             | 0.96        | 0.91             | 12.84       | atende   |

## Reexecução de theme-app — 2026-10-17

Na execução acima, o runner lia só `.ts`, `.tsx`, `.html`, `.css` e `.scss`; o tema compilado por `extendTheme` em `src/theme/brand.theme.mjs`, a via que `theme-app` indica, ficava fora da leitura, e duas sessões Angular com snippet reprovaram em `seed-accent` e `0f766e`. O runner passou a ler `.js`, `.mjs`, `.cjs`, `.jsx` e `.json`, e o caso `brand-theme` rodou de novo nos dois bindings:

| Skill     | Execuções com snippet | Disparo com | Conformidade com | Disparo sem | Conformidade sem | Custo (USD) | Veredito |
| --------- | --------------------- | ----------- | ---------------- | ----------- | ---------------- | ----------- | -------- |
| theme-app | 6                     | 1.00        | 1.00             | 1.00        | 1.00             | 3.12        | atende   |
