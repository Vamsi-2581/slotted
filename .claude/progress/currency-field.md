# Checkpoint — currency-field (`/reui currency-field polish` + `/component currency-field` para `scrub`)

- Plano: `docs/history/designs/2026-10-01-currency-field-reui-dossier.md` (dossiê, decisão da parte `scrub`, autoavaliação).
- Ramo `review/implementation-pass-1`. Outras sessões editam o tree em paralelo; `docs/history/designs/README.md` e `docs/process/build-order.md` commitados só com o hunk da família (blob do HEAD com a inserção).

## Concluído

- `c90b1107`: steppers concêntricos (`split` 24 × 24 inset 4 raio 2; `stacked` metades 24 × 14 com alvo até à moldura), sem separadores; dossiê ReUI.
- `07cd8fc2`: parte `scrub` (contrato, CSS, token, harness, React `CurrencyFieldScrub`, Angular `slCurrencyFieldScrub`, páginas de referência, testes).
- Reabertura do montante de destaque registada em `docs/process/build-order.md`.

## Testes

Contrato 31/31; React da família 72/72; Angular da família 51/51; estilos da família 26/26; `test:contracts` 2157/2157; `test:docs`, `typecheck`, `eslint` verdes. `audit.mjs` Angular limpo a 1280 e 620.

## Problemas conhecidos

- Storybook React (6006) não inicializa o preview em nenhuma página (`body` sem classe, `#storybook-root` vazio), mesmo depois de reiniciado; os módulos respondem 200. A página React do `currency-field` não foi lida nem auditada.
- Fora da família: estilos `kbd` (field-surface) e `cascader` (marca); Prettier em `packages/core/src/i18n/messages/` (ficheiros por versionar de outra sessão).
- Por verificar: `number-field` com marca `scrub` de mais de um carácter pode inverter em rtl, como `R$` invertia aqui antes de `unicode-bidi: plaintext`.

## Próxima ação

Quando a 6006 desenhar páginas: `node tools/harness/audit.mjs "http://localhost:6006/iframe.html?viewMode=docs&id=components-currencyfield--reference"` e `--width 620`.
