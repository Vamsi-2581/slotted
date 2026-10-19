# Custo de montagem e três features — triagem e plano

Fonte: seis pedidos recebidos em 2026-10-19 sobre `main` (`f0c4e25d`). Uma fatia fecha até três
tarefas. Cada melhoria e cada feature leva o teste que falha antes da mudança. React e Angular
recebem a mesma mudança de contrato quando a família existe nos dois.

## Triagem

| #   | Família        | Tipo     | Estado na triagem                                                                                                                                                                                                                                                  |
| --- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | chart          | melhoria | Confirmado em parte. `useState(null)`, não há leitura no render. `readChartTheme` corre num `useLayoutEffect` e chama `setTheme` antes da pintura (`chart.tsx`). Angular lê em `afterNextRender` (`chart.ts`). Sem cache entre instâncias.                   |
| 2   | page-header    | melhoria | Confirmado. `createStickyHeader` chama `publish()`, `observeArea()` e `scrollTop()` na construção (`sticky-header.ts`); a ligação React constrói-o num `useLayoutEffect`.                                                                                       |
| 3   | filter-bar     | melhoria | Confirmado. `useNarrow` chama `read()` em `useLayoutEffect` além do observer; o efeito `sticky` chama `publish()` síncrono. Angular repete as duas chamadas em `afterNextRender`.                                                                               |
| 4   | theme          | feature  | `--slotted-surface-material` e `--slotted-material-backdrop` no grupo surface; opaco sob `prefers-reduced-transparency: reduce` e `forced-colors: active`.                                                                                                       |
| 5   | react utility  | feature  | `usePressSelection` em `@slotted/react`. Só React: o pedido nomeia o pacote React.                                                                                                                                                                              |
| 6   | button         | feature  | `justify="center" \| "between"` em Button, ButtonLink e ToggleButton; `data-justify` na raiz.                                                                                                                                                                  |

## Desvios registados na triagem

- Item 1: `readChartTheme` chama `getComputedStyle` duas vezes por leitura (o elemento e a sonda). O
  teste conta leituras de tema: as chamadas de uma montagem com cache são zero; a primeira montagem
  faz uma leitura.
- Item 1: a chave do cache é a assinatura do contexto (atributos `data-slotted-*`, `dir`, `class` e
  o `style` sem geometria de cada ancestral, mais o estado das três media queries e a geração de
  tema). Um wrapper que sobrescreve um token muda a chave.

## Fatias

1. Custo de montagem: 1, 2, 3.
2. Features: 4, 6, 5.

## Resultado

| #   | Estado |
| --- | ------ |
| 1   | Feito: `cachedChartTheme`/`chartThemeKey` no core; React lê em `useEffect` (cache) ou no frame seguinte; Angular em `afterRenderEffect`. A releitura em `fonts.ready` só corre com fontes a carregar. O ajuste da legenda continua em `useLayoutEffect` (lê `columnGap` e larguras). |
| 2   | Feito: `createStickyHeader` mede no primeiro relatório do `ResizeObserver` (sem observer: no primeiro frame); antes disso `refresh`, `expandedChanged` e `pinnedChanged` não medem. `findScrollParent` continua na construção (lê estilo, não caixa). |
| 3   | Feito: `useNarrow` em `useEffect` sem leitura síncrona; `publish` do sticky só no relatório do observer; Angular igual. |
| 4   | Feito: `--slotted-surface-material` (scheme; 72 % light, 68 % dark, opaco em high-contrast; `Canvas` sob forced colours) e `--slotted-material-backdrop` (base, `saturate(1.6) blur(20px)`). Campo `reducedTransparency` no contrato; `render.ts` emite o bloco `prefers-reduced-transparency: reduce`. Nenhuma família lê os tokens ainda. O skill `theme-app` mudou sem caso novo em `eval/cases.json`. |
| 5   | Feito: `usePressSelection` em `@slotted/react/press-selection`; um `select` substituído não corre o seu `commit`; o valor premido cede quando `current` muda para qualquer valor. Exemplos em top-navigation, side-navigation e tabs (React). Sem equivalente Angular. Uma navegação cancelada sem mudança de `current` deixa o valor premido. |
| 6   | Feito: `justify` em Button, ButtonLink e ToggleButton (React e Angular), `data-justify` sempre escrito, eixo no contrato. `between`: `space-between`, rótulo com `flex: 1 1 auto` e `text-align: start`, `end` com a largura do conteúdo. A resolução de `justify-content` é verificada contra o texto da folha (o jsdom não aplica folhas em camadas). |
