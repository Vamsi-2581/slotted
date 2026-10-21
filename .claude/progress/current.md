# Checkpoint

- Plano: `docs/history/plans/2026-10-21-equori-second-review.md` (32 findings do equori, beta.9).
- Branch: main. Base `4fb7c5b5`.

## Concluído
- Fatia 1: itens 1, 2, 32.
- Fatia 2: itens 20, 27, 21.

## Testes
- React: segmented-control browser 2/2, dialog browser 5/5, entity-picker unit 42/42; build com `package-boundary.verify.mjs` exit 0.
- Angular: entity-picker 30/30.
- React: 12 famílias de link + render-props 406/406; tsc 0. Styles prompt-composer 10/10.

## Em curso
- Fatia 3: itens 7, 6, 28.

## Problemas conhecidos
- Nenhum.

## Próxima ação exata
Ler as quatro regras `aria-busy` (page-header, data-grid, data-list, event-calendar) em `packages/styles/src` e escrever o benchmark de recalc.
