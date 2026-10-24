# Plano — `drawer` bottom sheet sobre scroll nativo

Desenho: `docs/history/designs/2026-10-23-drawer-sheet-native-scroll-design.md`.

## Fatia 1 — protótipo e decisão

1. Página de teste mínima (DOM puro, sem família) com a estrutura de §2.1 do desenho.
2. Cenários de browser para os riscos 1, 4 e 5 e para o fling que fecha e o que avança de
   detent, com as asserções de §3.
3. Relatório ao usuário com as medidas. O plano continua só com os riscos 1 e 4 confirmados.

## Fatia 2 — `@slotted/styles` e `@slotted/core`

1. `drawer.css`: parte `sheet-scroller`, marcadores `stop`, scrim por `animation-timeline`,
   prolongamento do fundo, `overflow` do corpo abaixo do detent mais alto.
2. `@slotted/core/extent`: `attachSheetScroll(scroller, panel, options)` — detents para
   posições, `scrollend` (com fallback) para detent e fecho, `scrollTo` para teclado e
   puxador, `data-undimmed`, `expanded`.
3. Testes de unidade do core e de stylesheet.

## Fatia 3 — React

1. `DrawerPanel` renderiza o scroller e os marcadores na folha; o caminho por toque e
   `createSheetMotion` saem da folha.
2. `DrawerResizer`: toque passa ao scroll; rato escreve `scrollTop`; tap e teclado por
   `scrollTo`.
3. Cenários de browser de §3 em `drawer.browser.test.tsx`; unit tests ajustados.

## Fatia 4 — Angular

1. As mesmas três tarefas da fatia 3 em `packages/angular/drawer`.

## Fatia 5 — contrato e fecho

1. `specs/components/drawer/contract.json` (`sheet.*`), páginas de referência, docs.
2. Remoção de `createSheetMotion`, `attachSheetDrag` e exports sem uso em `@slotted/core`.
3. `pnpm check:full`; release só a pedido.
