# Checkpoint — `/reui filter-bar build` (chip segmentado)

- Plano: `/component filter-bar` passos 1–9, alimentado por `docs/history/designs/2026-09-30-filter-bar-reui-dossier.md`; decisões em `docs/history/designs/2026-09-30-filter-bar-segmented-design.md`.
- Ramo `review/implementation-pass-1`, HEAD `29603ff7`. Nada commitado desta sessão.

## Concluído (passos 1–8)

- Contrato: `chips` sai; `chip-field`, `chip-operator`, `chip-value`, `chip-remove`; `readOnly`/`readonly`; `data-pinned`, `data-incomplete`, `data-compact`; composição de duas linhas (sai `data-bar-wrapped`); teclado de um só toolbar. `contract.test.mjs` 18/18.
- Folha, harness (cenas `default`, `empty`, `revealed`, `manual`, `states`, `editor`, `builder`), `tokens.json`, `filter-bar.styles.test.mjs` 19/19; `packages/styles/src/*.test.mjs` e `specs/*.test.mjs` sem falhas.
- Especímenes Slotted em light, dark, high-contrast, reduce, forced, dense, rtl (`tools/harness/out/specimen/filter-bar/*74df84*`, `*-dense`, `*-rtl`, `*-forced`, `*-motion-reduce`); barra de craft cumprida (dossiê §7).
- `docs/history/designs/README.md` e `docs/process/build-order.md` (reabertura do menu por linha) atualizados.

## Segunda volta (pedido do revisor: telefone e construtor)

- Contrato: `rule-summary`, estado `expanded`, `builderCards`, `surfaces.narrow`, gaveta de baixo abaixo de 36 rem de viewport; `contract.test.mjs` 19/19.
- Folha: linha que desliza abaixo de 36 rem (chip de três alvos, `summary` primeiro no DOM); construtor em cartões abaixo de 30 rem do construtor (grupos com contentor `slotted-filter-bar-group`); trilho nos grupos aninhados; par aninhado `ghost`; `clear` no rodapé do construtor.
- Testes: família, `packages/styles/src/*.test.mjs` e `specs/*.test.mjs` — 333 passam, 0 falham.
- Design §9 «Telefone»; dossiê linhas 7–8 do delta.

## Estado dos ficheiros

Alterados por esta sessão: `specs/components/filter-bar/contract.{json,test.mjs}`, `packages/styles/src/filter-bar/filter-bar.{css,harness.html,tokens.json,styles.test.mjs}`, os dois documentos de 2026-09-30, `docs/history/designs/README.md`, `docs/process/build-order.md`. Gerador do harness: scratchpad `gen_harness.py` (não versionado).

## Terceira volta (passos 10–13)

- Core: `spokenOperator` em `@slotted/core/filter` (teste em `describe.test.ts`), core construído.
- React: binding, testes 35/35 (+ stories 4/4), docs e histórias; auditoria de `components-filterbar--reference` a 1280 e 620 sem achados.
- Angular (agente): binding e spec 36/36; docs e histórias por esta sessão; spec + stories 40/40 com tsconfig temporário (o build de testes por omissão falha em `field`/`field-group` de outra sessão).
- `pnpm check:affected`: format e lint passam; typecheck falha só em `field`/`field-group` (`requiredMark`, outra sessão). `test:contracts` 2081/2081, `test:package-layers` 12/12, `test:docs` 26/26.
- Storybook Angular (6007) serve o TypeScript antigo; pedir reinício ao revisor.
- Autoavaliação: `docs/history/designs/2026-09-30-filter-bar-self-assessment.md`.

## Problemas conhecidos

- Demo Nexora consome o pacote publicado; `pnpm demo:refresh` depois do commit.

## Commits

- `289da8c8` core: `spokenOperator`.
- `f4528f73` contrato, folha, harness, dossiê, desenho, autoavaliação, índice e reabertura.
- `22b71a29` binding React, testes, docs e histórias.
- `0a710137` binding Angular, spec, docs e histórias.

## Demo

`pnpm demo:refresh` corrido; `ng build --configuration development` da Nexora passa com a barra nova.

## Próxima ação

Reiniciar o Storybook Angular (6007), com a aprovação do revisor, e correr `node tools/harness/audit.mjs "http://localhost:6007/iframe.html?viewMode=docs&id=components-filterbar--reference"` a 1280 e com `--width 620`.
