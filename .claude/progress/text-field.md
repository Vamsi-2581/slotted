# Checkpoint — fila das entradas (item 3: `color-picker`)

- Itens 1 e 2 entregues; correção de alinhamento `03a02542`.
- Item 3 completo até ao passo 13; nada commitado.

## Ficheiros do item 3

- Núcleo: `packages/core/src/color/` (10/10), registo em `packages/core/package.json` e `vite.config.ts`.
- Contrato: `specs/components/color-picker/` (8/8); capacidade `format` em `specs/contract.schema.mjs`.
- Glifo `pipette`: `glyphs.json`, `glyphs.ts`, `theme.json`, `tokens/contract.json` (121), `token-foundation.md`, `verify-token-foundation.test.mjs`.
- Estilos: `packages/styles/src/color-picker/` (7/7), export em `packages/styles/package.json`; `runtime-properties.mjs`, `tokens.test.mjs`, `text-scale.test.mjs`.
- React: `packages/react/src/color-picker/` (19/19), export em `packages/react/src/index.ts`.
- Angular: `packages/angular/color-picker/` (13/13).
- Documentos: `docs/history/designs/2026-10-01-color-picker-{design,reui-dossier,self-assessment}.md`.

Ficheiros partilhados com linhas de outras sessões: construir o índice a partir de HEAD; nunca `git commit -- <paths>`.

## Próxima ação

Gate de lançamento; depois commits: glifo `pipette`, esquema `format`, núcleo `color`, família.
