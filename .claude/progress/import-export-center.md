# Checkpoint — import-export-center concluído; search-results em fila

- Plano: skill `component`, invocação `/component import-export-center, search-results`. Escopo na onda 12 de `docs/process/build-order.md`.
- Ramo `review/implementation-pass-1`. Commits desta sessão: `6b456f70` (styles, contrato, desenho), `e53df7db` (core), `f14ee4ee` (react), `3ffb644d` (angular), `bc2cf0c1` (docs).

## Concluído

- `import-export-center`, passos 1–15. Gate visual aprovado; páginas lidas a 1280 e 720 px em claro e escuro, `audit.mjs` limpo a 1280 e 620 nos dois bindings.

## Problemas conhecidos

- Os commits dependem do elemento `Icon`/`Glyph` ainda não commitado pela outra sessão (`@slotted/core/glyph`, `Glyph` em `packages/react/src/icon`, `SlGlyph` em `packages/angular/icon`, `tools/harness/glyph.mjs`). Um checkout limpo destes commits não compila até esse commit entrar.
- A tabela de anatomia da workbench corta a coluna Purpose a 1280 px em todas as famílias (defeito partilhado de `tools/storybook-workbench`, aberto pela outra sessão).

## Próxima ação

`/component search-results`, escopo na onda 12 de `docs/process/build-order.md`.
