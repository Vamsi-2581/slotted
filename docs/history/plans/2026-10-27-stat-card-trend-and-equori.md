# Tendência do stat-card e achados abertos do equori

Base: `10a1b5d5` (`v0.1.0-beta.16`), com a tipagem genérica de `Chart` por fazer commit na árvore.

## Itens

| #   | Item                                                                                      | Tipo     |
| --- | ----------------------------------------------------------------------------------------- | -------- |
| 1   | Tendência do stat-card: posição, altura, curva e área do sparkline dentro do cartão        | melhoria |
| 2   | Dashboard grid reads widget props only from its direct children                           | defeito  |
| 3   | A dashboard widget with automatic rows rounds its height up to whole rows of 4.5rem       | melhoria |
| 4   | The overviews guideline does not lead to the dashboard grid                               | melhoria |
| 5   | Reset requests the empty layout, not the grid's defaultLayout                             | defeito  |
| 6   | A chart in a widget keeps its size step instead of filling the body                        | melhoria |
| 7   | page publishes the scroller's block size for consumers' sticky elements                    | feature  |
| 8   | compose-screen routes a sticky element of the screen's own to LA-06                        | agente   |

## Item 1 — diagnóstico

Cena `Row` e `Layout` do stat-card, tema default, cartão de 300 px:

- `inline`: caixa fixa de 6rem × 2rem centrada na vertical da linha da figura; vão acima e abaixo.
- `stacked`: a linha fica dentro do inset, com 2rem de altura; a área termina no inset.
- curva `linear` por omissão: polilinha serrilhada em 12 pontos; a área é opt-in.

Mudança:

- `inline`: a região estica à altura da figura e o sparkline ocupa essa altura, com o passo do tamanho como mínimo.
- `stacked`: a região sangra até as bordas laterais e inferior do cartão (margens negativas iguais ao inset), com o raio do cartão nos cantos inferiores; altura de um passo acima do sparkline (`md` 3rem).
- dentro de `StatCardTrend` / `slStatCardTrend`, o sparkline de linha usa `curve="monotone"` e `area` por omissão; um default da aplicação e uma prop explícita continuam a vencer.
- o placeholder de carregamento ocupa as mesmas caixas.

## Fatias

1. Item 1 (React, Angular, styles, docs da família).
2. Itens 2, 3, 4.

## Resultado

| #   | Estado   | Teste que falhava antes                                                                                                                                                               |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | feito    | `stat-card.test.tsx` › "smooths and washes a line…" e `stat-card.spec.ts` › "SlStatCardTrend"; `stat-card.styles.test.mjs` › "sizes the trend to the figure beside it and bleeds it…" |
| 2   | feito    | `dashboard-grid.test.tsx` › "widget discovery" (2 casos) e `dashboard-grid.spec.ts` › "widget discovery" — falham com o código da base                                              |
| 3   | feito    | `dashboard-grid.browser.test.tsx` › "is as tall as its content to a twelfth of a row…" (74,5 px de vão com o código da base); `dashboard-grid.test.ts` (core) › "draws a shorter content at its height…"                                                                                                                                                                                     |
| 4   | feito    | caso de eval `review-overview` (não executado; `pnpm eval:agent-docs` corre na release)                                                                                              |
| 5   | feito    | `dashboard-grid.test.tsx` › "resets to the layout the grid was given" e `dashboard-grid.spec.ts` › o mesmo — falham com `EMPTY_LAYOUT` |
| 6   | feito    | `dashboard-grid.browser.test.tsx` › "draws its plot as tall as the widget leaves it" (corpo de 514 px para 296 com `size="lg"`) |
| 7   | feito    | `page.browser.test.tsx` › "caps itself by the scroller the page publishes…" (959 px contra um scroller que acaba em 888) |
| 8   | feito    | caso de eval `sticky-summary` (não executado; corre na release) |

Item 2: React lê `value` do filho e atravessa fragmentos; um filho sem `value` recebe `DashboardWidgetHostContext` e o widget declara-se no `useLayoutEffect`, por isso é posicionado depois da primeira pintura. Angular: `SlDashboardWidgetHost`, fornecido pela grade; o widget declara-se no construtor; a grade junta `contentChildren` e os declarados.

Item 3 — decisão. A masonry nativa (`display: grid-lanes`) só é estável no Safari em 2026; Gridstack (`sizeToContent`) e as grades do modelo react-grid-layout/Grafana ajustam ao conteúdo arredondando à célula, e o ajuste é fino porque a célula é pequena. Aqui a unidade de layout fica em linhas (teclado, arraste, persistência, anúncios) e o desenho passa a sub-linhas: `DASHBOARD_SUBROWS` (12) sub-linhas por passo de linha, trilha `(row + gap) / 12`, `row-gap: 0`, gap emulado pelo `padding-block-end` do widget. O core calcula, depois do layout lógico, uma passada de desenho em sub-linhas: um widget `rows="auto"` mede `contentSpan` sub-linhas e é desenhado com essa altura (piso de uma sub-linha, ou `minRows` quando o widget o declara; teto `maxRows`), e a gravidade corre em sub-linhas, por isso o widget de baixo sobe até ele. `tileStyle` escreve `top`/`span` em sub-linhas; `y`/`h` continuam lógicos. `tracksOf` deriva a linha lógica de `grid-auto-rows × 12 − gap`. Vão máximo: uma sub-linha (7,3 px com os tokens padrão).

Item 5: Reset pede o `defaultLayout` da grade (controlada ou não); sem ele, `[]`. `usePersistedDashboardLayout` devolve `defaultLayout`, que o spread entrega à grade; `persistedDashboardLayout` devolve-o para `[defaultLayout]`.

Item 6: o corpo do widget fixa o piso do plot nos três passos (`--slotted-chart-plot-block-size`, `-sm`, `-lg`); o plot cresce para o resto do corpo.

Item 7: `page` escreve `--slotted-page-scrollport-block-size` (o `clientHeight` do que rola: o scroller ancestral, ou a parte `scroll` sob `scroll="self"`) no mesmo `ResizeObserver` de `--slotted-page-sticky-bottom`. LA-06, `page.docs.ts`, o contrato `runtime` e `docs/build-briefing.md` citam-no; o catálogo do agent-docs passa a ler a secção `runtime` dos contratos.
