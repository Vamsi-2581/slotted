# Checkpoint — correções da revisão de telas da Nexora

- Plano: `docs/history/plans/2026-09-24-nexora-screen-review-fixes.md`
- Ramo `review/implementation-pass-1`. Nada commitado. Outras sessões editam o tree em paralelo (entity-picker, event-calendar, transfer, data-list).

## Concluído (itens 1–16)

- Pacote: 1 filter-bar, 2 page-header/toolbar, 5 page/page-header compacto, 10 chart, 11 list-item, 12 scroller principal, 16 alvos de toque dos controlos internos (R2.6), splitter Angular observa o contentor depois do render, exemplos de loading da side-navigation.
- Demo: 3 `slPage [loading]` em 16 registos e Refresh em 6, 4 `cellAlign="start"`, 7 oito date-pickers, 8 `slSkeletonRegion`, 9 larguras por tipo de página, 13 paginação, 14 splitter, 15 shell sem skeleton, LP-12 (`flex-basis: auto` abaixo de 600 em `styles.css`).
- Backend: `storedFilter` em `listStockMovements` e `listInventory`; 43/43.
- Guidelines: LA-05, OV-05, FM-16, AF-07, CP-07, LP-12 (LP-07 retirada); index atualizado.
- Ledger: 16 linhas novas na tabela principal e 1 em `## Backend`.
- `demo:refresh` feito às 18:40; dev server :4250 reiniciado.

## Verificação

- Styles: 1490/1491 (falha `table` plain-variant, causada por entity-picker de outra sessão).
- `test:contracts` 1920/1920, `test:docs` 25/25, backend 43/43.
- Specs da demo tocados: shell-layout, contacts, skus, customer-page 22/22. Suite completa da demo não executada.
- Cenários: splitter PASS; filter-bar 1440/1600; page-header 1400→600→1400 PASS; 375×667 header não sticky e grid com altura das linhas; 1400×900 fill intacto; nenhum controlo mais alto do que largo a 360 px.

## Pendências

- Páginas de referência e contratos ainda não descrevem o halo de toque do item 16.
- Legenda do chart continua a listar séries em erro.
- Shimmer do skeleton anima `background-position`; semeadura do backend é uma tarefa de 1,8 s.
- Regra da `@container page-header (width < 600px)` na própria raiz nunca se aplica (achado do agente do item 5).

## Próxima ação

`cd demos/nexora/angular && npx ng test` com a máquina pouco carregada; depois `pnpm check`.
