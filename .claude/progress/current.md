# Checkpoint

- Plano: `docs/history/plans/2026-10-21-equori-second-review.md` (32 findings do equori, beta.9).
- Branch: main. Base `4fb7c5b5`.

## Concluído
- Fatia 1: itens 1, 2, 32.

## Testes
- React: segmented-control browser 2/2, dialog browser 5/5, entity-picker unit 42/42; build com `package-boundary.verify.mjs` exit 0.
- Angular: entity-picker 30/30.

## Em curso
- Fatia 2: itens 20, 27, 21.

## Problemas conhecidos
- Nenhum.

## Próxima ação exata
Ler `packages/react/src/button/` (ButtonLink render props) e escrever o teste de tipo sob `exactOptionalPropertyTypes`.
