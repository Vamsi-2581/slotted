# Checkpoint

- Plano: `docs/history/plans/2026-10-21-equori-second-review.md` (32 findings do equori, beta.9).
- Branch: main. Base `4fb7c5b5`.

## Concluído
- Fatia 1: itens 1, 2, 32.
- Fatia 2: itens 20, 27, 21.
- Fatia 3: itens 7, 6, 28.
- Fatia 4: itens 8, 9, 25.
- Fatia 5: itens 15, 16, 17.

## Testes
- React: segmented-control browser 2/2, dialog browser 5/5, entity-picker unit 42/42; build com `package-boundary.verify.mjs` exit 0.
- Angular: entity-picker 30/30.
- React: 12 famílias de link + render-props 406/406; tsc 0. Styles prompt-composer 10/10.
- Fatia 3: styles data-grid/data-list/page-header 81/81; React progress+page-header unit 73/73, browser page-header 2/2, data-grid 3/3, perf busy 1/1; Angular progress+page-header 61/61.
- Fatia 4: React data-grid 98/98, sparkline 19/19 + browser 2/2, progress browser 2/2; Angular sparkline+data-grid 103/103; styles sparkline/tokens/motion/data-list 35/35; contratos 64/64.
- Fatia 5: theme vitest 99/99, node 109/109; themes 91/91; CSS da escada de dados conferido no Chromium.

## Em curso
- Fatia 6: itens 12, 24, 13.

## Problemas conhecidos
- Nenhum.

## Próxima ação exata
Adicionar o tom `info` (seed `--slotted-seed-info`): `packages/theme/src/seeds.ts`, `contract.json`, receita `standard.ts` (nove papéis por esquema) e o eixo `tone` das famílias.
