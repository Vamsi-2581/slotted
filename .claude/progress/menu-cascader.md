# Checkpoint — `/reui menu` e `/component cascader`

`current.md` pertence à sessão da revisão de telas da Nexora; este ficheiro não o substitui.

- Ramo `review/implementation-pass-1`.
- Menu: commit `65963cd3`.
- Cascader: commit `37c423bc` (41 ficheiros; em `build-order.md`, `designs/README.md`, `styles/package.json`, `runtime-properties.mjs`, `tokens.test.mjs` e `text-scale.test.mjs` só os hunks do cascader — o resto pertence a outras sessões e ficou por commitar no working tree).

## Estado

Ambas as invocações concluídas. Nada em curso.

## Pendências registadas

- Storybook Angular em 6007 precisa de reinício para compilar o entry point `cascader`.
- Cascader: recalcular a janela ao redimensionar com o popup aberto; `aria-describedby` de um campo envolvente no binding Angular (autoavaliação).
- `packages/core/dist` foi reconstruído localmente para as specs Angular (artefacto, não versionado).
