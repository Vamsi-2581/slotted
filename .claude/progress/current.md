# Checkpoint

- Plano: `docs/history/plans/2026-10-21-equori-second-review.md` (32 findings do equori, beta.9).
- Branch: main. Base `4fb7c5b5`.

## Concluído
- Fatia 1: itens 1, 2, 32.
- Fatia 2: itens 20, 27, 21.
- Fatia 3: itens 7, 6, 28.
- Fatia 4: itens 8, 9, 25.
- Fatia 5: itens 15, 16, 17.
- Fatia 6: itens 12, 24, 13.

## Testes
- React: segmented-control browser 2/2, dialog browser 5/5, entity-picker unit 42/42; build com `package-boundary.verify.mjs` exit 0.
- Angular: entity-picker 30/30.
- React: 12 famílias de link + render-props 406/406; tsc 0. Styles prompt-composer 10/10.
- Fatia 3: styles data-grid/data-list/page-header 81/81; React progress+page-header unit 73/73, browser page-header 2/2, data-grid 3/3, perf busy 1/1; Angular progress+page-header 61/61.
- Fatia 4: React data-grid 98/98, sparkline 19/19 + browser 2/2, progress browser 2/2; Angular sparkline+data-grid 103/103; styles sparkline/tokens/motion/data-list 35/35; contratos 64/64.
- Fatia 5: theme vitest 99/99, node 109/109; themes 91/91; CSS da escada de dados conferido no Chromium.
- Fatia 6: styles 1701/1701; contratos 2180/2180; React famílias de tom 824/824, tsc 0; Angular famílias de tom 575/575, `ng build` development exit 0; agent-docs 137/137; theme 99 + 109; themes 92.

## Em curso
- Fatia 7: itens 19, 30, 3.

## Problemas conhecidos
- Nenhum.

## Próxima ação exata
Autofill do text-field e afins: ler a regra `:autofill` em `packages/styles/src/text-field/text-field.css` e mover a tinta para a raiz.
