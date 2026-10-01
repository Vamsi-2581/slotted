# Checkpoint — fila das entradas (item 2: `textarea` + `prompt-composer`)

- Item 1 `text-field` entregue (`b7d84ef6`, `5b914ec5`, `5ecee204`).
- Item 2: desenho, dossiê e autoavaliação em `docs/history/designs/2026-09-30-prompt-composer-*.md`; escopo em `docs/process/build-order.md` (Specialized). Nada commitado.

## Concluído (passos 1–13)

- Contrato `specs/components/prompt-composer/` 11/11.
- Estilos `packages/styles/src/prompt-composer/` (8/8) e export em `packages/styles/package.json`; exceção R7 `prompt-composer/submit` em `packages/styles/src/text-scale.test.mjs`.
- Glifos `arrow-up`, `stop`, `paperclip`: `glyphs.json`, `glyphs.ts`, `theme.json`, `tokens/contract.json` (primitivos 120), `token-foundation.md`, `verify-token-foundation.test.mjs`. Ficheiros partilhados misturados com outras sessões: construir o índice a partir de HEAD; nunca `git commit -- <paths>`.
- React `packages/react/src/prompt-composer/` 21/21; export em `packages/react/src/index.ts`.
- Angular `packages/angular/prompt-composer/` 14/14.
- `audit.mjs` React 1280/620 sem achados. `typecheck`, `test:docs`, `test:contracts` verdes; `lint` falha em `message-demo.tsx` (outra sessão); `field-surface.test.mjs` falha em `kbd` (outra sessão).

## Bloqueio

Storybook Angular (6007, de outra sessão) arrancou antes de `packages/angular/prompt-composer` existir e serve os ficheiros sem compilar decoradores. Reinício pedido no gate.

## Próxima ação

Gate de lançamento (passo 14). Depois: commit dos glifos (índice construído), depois a família, depois `docs/history/designs/README.md` e `build-order.md` só com as minhas linhas.
