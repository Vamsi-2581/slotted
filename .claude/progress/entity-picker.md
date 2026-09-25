# Checkpoint — `entity-picker` (onda 11)

- Plano: skill `component`, invocação `entity-picker`; escopo em `docs/process/build-order.md`, onda 11.
- `.claude/progress/current.md` pertence à sessão paralela e não é escrito por esta.
- Ramo `review/implementation-pass-1`. Família concluída: passos 1–15, gates visual e de release aprovados.

## Commits

- `ffe8e55e` core (`@slotted/core/entity-picker` + registos do core).
- `c72e3832` contrato, folha, tokens, harness, desenho, listas dos testes de estilo partilhados, registo em `packages/styles/package.json`.
- `93d3f4f5` React (+ registos `package.json`, `vite.config.ts`, `src/index.ts`).
- `585b44ba` Angular.
- `1740f443` autoavaliação, índice de desenhos, entrega em `build-order.md`.
- Ficheiros partilhados commitados só com as linhas desta família (índice escrito por `git update-index`); as linhas de outras sessões ficaram na árvore.

## Estado

- Testes: contrato 14, core 35, React 29, Angular 17, estilos partilhados verdes; `lint` da família, `typecheck`, `test:*` e build Angular passam.
- Falhas fora da família: `format:check` (`chart.css`, `event-calendar.css`, `filter-bar.styles.test.mjs`, `upload.css`) e testes de `table` (React, Angular, estilos).

## Pendente

- Storybook Angular (6007) precisa de reinício para compilar a story nova; a página Angular não foi lida renderizada.
- Leitor de ecrã não verificado.

## Próxima ação

Nenhuma para esta família. Depois do reinício do Storybook Angular: `node tools/harness/audit.mjs "http://localhost:6007/iframe.html?viewMode=docs&id=components-entity-picker--reference"` a 1280 e 620.
