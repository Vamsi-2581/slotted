# Checkpoint — `/component dashboard-grid` (onda 11), reimaginação 2D

- Plano: `docs/history/plans/2026-09-25-dashboard-grid-reimagined.md` (fatias 1–6); skill `component`.
- Ramo `review/implementation-pass-1`, HEAD `f47438ef`. Nada commitado. Outras sessões editam o tree em paralelo.

## Concluído

- Fatia 1 (core 2D): `packages/core/src/dashboard-grid/`, 37/37. Classe média = metade ou inteiro (`mediumSpan`); mínimo por omissão 2 colunas × 2 linhas.
- Fatia 2 (estilos e harness): 243/243; grelha de pontos só na classe expandida, um ponto no centro de cada célula livre; harness gerado por `scratchpad/gen-harness2.mjs` (tabela com 7 linhas).
- Fatia 3 (contrato): 9/9; `specs/reference-pages.test.mjs` incluído, 12/12.
- Fatia 4 (React): 31/31; `tsc` limpo para a família; tabela de demonstração com 7 linhas.
- Workbench (commit próprio, antes da família): `data-size='content'`, `data-flow='stack'` com `flex-wrap: nowrap` (superfície de 1737px → 1129px), sala `wide` de 1280px; 48/48.
- Fatia 5 (verificação ao vivo, 6006): `scratchpad/dashboard-pointer2.mjs` PASS — mover para célula, borda final +2 colunas, borda inicial com borda final fixa, `Escape` sem pedido, toque em 375px reordena pelo handle. `audit.mjs` 1280 e 620: 0 achados.
- Capturas lidas: página de referência 1280 claro/escuro; histórias `responsive` (1280/640/375) e `keyboard` (escuro); harness `editing` 720, `drag` 1100, `resize` escuro 1100, `overview` 1100.

## Em curso

Gate de interação (fatia 5) apresentado ao utilizador; aguarda resposta.

## Conhecido

- `captureBeyondViewport` redimensiona a janela durante a captura e o sparkline fica com a largura anterior; a captura com `BEYOND=0` mostra o sparkline correto.
- Angular ainda no modelo 1D.
- Desenho, autoavaliação e nota em `build-order.md` ainda descrevem o modelo 1D.

## Próxima ação

Após aprovação do gate: reescrever `packages/angular/dashboard-grid/src/dashboard-grid.ts` e `dashboard-widget.ts` para o modelo 2D (fatia 6), seguindo `packages/react/src/dashboard-grid/dashboard-grid.tsx`.
