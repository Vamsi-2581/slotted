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
- Fatia 7: itens 19, 30, 3.
- Fatia 8: itens 29, 23, 11.
- Fatia 9: itens 31, 26, 18.
- Fatia 10: itens 22, 4, 5.

## Testes
- React: segmented-control browser 2/2, dialog browser 5/5, entity-picker unit 42/42; build com `package-boundary.verify.mjs` exit 0.
- Angular: entity-picker 30/30.
- React: 12 famílias de link + render-props 406/406; tsc 0. Styles prompt-composer 10/10.
- Fatia 3: styles data-grid/data-list/page-header 81/81; React progress+page-header unit 73/73, browser page-header 2/2, data-grid 3/3, perf busy 1/1; Angular progress+page-header 61/61.
- Fatia 4: React data-grid 98/98, sparkline 19/19 + browser 2/2, progress browser 2/2; Angular sparkline+data-grid 103/103; styles sparkline/tokens/motion/data-list 35/35; contratos 64/64.
- Fatia 5: theme vitest 99/99, node 109/109; themes 91/91; CSS da escada de dados conferido no Chromium.
- Fatia 6: styles 1701/1701; contratos 2180/2180; React famílias de tom 824/824, tsc 0; Angular famílias de tom 575/575, `ng build` development exit 0; agent-docs 137/137; theme 99 + 109; themes 92.
- Fatia 7: styles 1707/1707; React avatar+entity-picker 103/103, browser avatar 2/2, glyph 1/1; core glyph+entity-picker 34/34; Angular avatar/entity-picker/text-field/otp/icon 133/133, `ng build` ok; themes 92/92.
- Fatia 8: core presence 29/29, chart 67/67, tsc 0; React dialog/drawer 202/202 + browser 7/7, inline-message 20/20, chart 28/28, tsc 0; Angular dialog/drawer 106/106, inline-message 21/21, `ng build` ok; package-layers ok.
- Fatia 9: React entity-picker 42/42 + browser 2/2, form browser 1/1, form/inline-message unit; Angular entity-picker 31/31, form 27/27, `ng build` ok; styles 1707/1707; agent-docs 137/137.
- Fatia 10: React prompt-composer 23/23 + browser 1/1; Angular prompt-composer 16/16, `ng build` ok; styles 1707/1707; contratos 2181/2181; agent-docs 137/137.

## Em curso
- Fatia 11: itens 14, 10.

## Problemas conhecidos
- Nenhum.

## Próxima ação exata
Item 14: linha da receita em `tools/agent-docs/content/skills/theme-app/SKILL.md`, secção "1. Choose the level"; depois item 10 (CSS por família).
