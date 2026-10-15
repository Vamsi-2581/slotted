# Design — `chart`

Decisões da família `chart`, tomadas depois do inventário
(`2026-09-23-chart-capability-inventory.md`) e antes do contrato. Cada secção
registra a decisão e o seu custo.

## 1. Três camadas, e o que cada uma possui

| Camada | Módulo | Possui | Não possui |
| --- | --- | --- | --- |
| Modelo | `@slotted/core/chart` | normalização de dados e séries, slots de cor, pilha a 100 %, domínio visível, navegação por teclado, contexto de tooltip, resumo textual, tabela e CSV, formatação `Intl`, leitura do tema a partir do CSS, colocação do tooltip | qualquer import de `echarts` |
| Motor | `@slotted/core/chart-echarts` | carga sob demanda do ECharts e de cada tipo, tradução modelo → `option`, ciclo de vida da instância, ponte de eventos (ponteiro → ponto ativo, zoom), posição em pixels de um ponto, `toDataURL` | DOM de legenda, tooltip, tabela e estados |
| Moldura | `packages/styles/src/chart/chart.css` + bindings | cabeçalho, legenda, plot focável, tooltip, centro da rosca, esqueleto, vazio, erro, tabela | geometria das marcas |

O ECharts é dependência de pares opcional de `@slotted/core`
(`peerDependenciesMeta.echarts.optional: true`), importado só por
`src/chart-echarts`, e marcado como externo no build. Nenhum tipo ou nome de
opção do ECharts aparece em superfície pública fora de `extendOption`, que
vive no módulo do motor e é tipado como `(option: Record<string, unknown>) =>
Record<string, unknown>`. É o precedente do `@floating-ui/dom`
(`docs/build-briefing.md`), com uma diferença registrada: o ECharts é par, não
dependência, porque uma aplicação sem gráfico não o deve instalar.

Custo: `@slotted/core` passa a declarar duas coisas externas em vez de uma.
Um consumidor que importa `@slotted/core/chart-echarts` sem instalar o
`echarts` recebe um erro de resolução no build dele, não em runtime.

## 2. Bundle

Medido em `2026-09-23-chart-capability-inventory.md` §1: o piso do ECharts é
108 KB gzip. Três decisões controlam o resto:

1. **Carga sob demanda.** O motor entra por `import()` dinâmico quando o
   primeiro plot monta. A moldura e o esqueleto desenham sem ele. O custo é um
   quadro de esqueleto na primeira montagem de uma página. Nas montagens
   seguintes o chunk já está em memória e a promessa resolve no mesmo tick de
   microtarefa. `preloadChartEngine(kinds)` elimina o quadro para quem o
   quiser.
2. **Um chunk por tipo.** `line` e `area` partilham `LineChart`; `bar`,
   `pie` e `scatter` têm um cada. A grade está no chunk `cartesian`, e `markLine`/`markArea`, o `dataZoom`
   interno, o `aria` e o `LabelLayout` têm um chunk cada, carregado só pela
   vista que os usa. O
   renderizador canvas é um chunk à parte, carregado só por `renderer:
   'canvas'` ou por `auto` acima do limiar.
3. **Sem componentes que a família substitui.** `TooltipComponent`,
   `LegendComponent`, `TitleComponent` e `ToolboxComponent` nunca são
   registrados: a família desenha os quatro em HTML.

O tipo é texto (`kind: 'line'`), não uma função importada, porque o custo em
bytes descarregados é o mesmo e a configuração fica serializável.

## 3. Tema pelos tokens

O stylesheet declara, no root, as propriedades privadas que o motor
lê: `--_chart-slot-1` … `--_chart-slot-8`, `--_chart-tone-<tom>`,
`--_chart-grid`, `--_chart-axis`, `--_chart-label`, `--_chart-label-size`,
`--_chart-line-width`, `--_chart-marker-size`, `--_chart-bar-radius`,
`--_chart-area-opacity`, `--_chart-surface`, `--_chart-duration`,
`--_chart-easing`. `readChartTheme(element)` resolve cada uma por um elemento
sonda (`probe.style.color = valor`; `getComputedStyle(probe).color`), porque o
ECharts não interpreta `var()`, `color-mix()` nem cores de sistema.

`observeChartTheme(element, onChange)` observa `data-slotted-scheme`,
`data-slotted-theme`, `data-slotted-density`, `class` e `style` no documento
por `MutationObserver`, e observa `prefers-color-scheme`, `forced-colors` e
`prefers-reduced-motion` por `matchMedia`. Uma mudança relê o tema e chama
`setTheme` quando o resultado difere. É uma ligação só por tema, não por
gráfico.

A precedência de cor por série é a do `sparkline`: `tone` vence `slot`, e
`slot` vence a posição. Os slots são atribuídos em sequência e nunca ciclam.
A série nove em diante recebe `--slotted-text-muted` e textura (inventário,
§4).

Sob `forced-colors: active`, o tema resolve `CanvasText`, `Canvas` e
`GrayText`, e o motor liga `aria.decal`. A textura é o segundo canal de
identidade que `docs/token-foundation.md` (Data) deixou à família.

## 4. Direção

O plot não se espelha em RTL: eixos, tempo e barras horizontais mantêm o
sentido LTR, como a Material Design 1 lista entre o que não se espelha
("Charts and graphs"). Cabeçalho, legenda, tooltip e tabela são HTML e seguem
`dir` sem regra própria. As setas do teclado seguem o sentido visual do plot:
`ArrowRight` é o ponto seguinte nas duas direções. O custo é um leitor RTL que
espera o tempo da direita para a esquerda. Espelhar exigiria inverter também o
eixo de valor horizontal, e isso contradiz a convenção numérica que o mesmo
guia preserva.

## 5. Anatomia

```text
figure [data-ui=chart]                       root           (data-variant, data-palette, data-toolbar, data-fullscreen)
  figcaption [data-part=header]              header
    div                                      (bloco do título)
      [data-part=title]                      title
      button [data-part=help]                help           (abre help-content)
      [data-part=help-content]               help-content   (popover)
      [data-part=description]                description
    [data-part=actions]                      actions        (controles do consumidor)
    div [data-part=toolbar] role=toolbar     toolbar
      button [data-part=zoom-reset]          zoom-reset     (só com zoom ativo)
      button [data-part=view-toggle]         view-toggle    (aria-pressed = tabela no plot)
      button [data-part=fullscreen-toggle]   fullscreen-toggle
      button [data-part=menu-trigger]        menu-trigger   (abre menu)
      [data-part=menu] role=menu             menu           (popover)
        button [data-part=menu-item]         menu-item
  div [data-part=legend] role=toolbar        legend         (uma linha)
    button [data-part=legend-item]           legend-item    (aria-pressed = visível)
      span [data-part=legend-marker]         legend-marker  (forma pela kind)
      span [data-part=legend-label]          legend-label
      span [data-part=legend-value]          legend-value   (valor no ponto ativo)
    button [data-part=legend-more]           legend-more    (+N, abre as entradas que não cabem)
  div [data-part=plot] tabindex=0            plot           (role=group, aria-roledescription)
    div [data-part=crosshair]                crosshair
    div [data-part=canvas] aria-hidden       canvas         (montagem do motor)
    div [data-part=marker]                   marker         (um por série no ponto ativo; data-selected)
    div [data-part=center]                   center         (centro da rosca: center-value, center-label)
    div [data-part=tooltip] aria-hidden      tooltip        (data-docked abaixo de 360 px)
      [data-part=tooltip-title]
      [data-part=tooltip-item]               (um por série; data-current na ativa)
        [data-part=tooltip-marker] [data-part=tooltip-label] [data-part=tooltip-value]
      [data-part=tooltip-total]
    div [data-part=table-region]             table-region   (a vista de tabela, na caixa do plot)
      table [data-part=table]                table
    div [data-part=skeleton]                 skeleton       (só em loading)
    div [data-part=empty]                    empty          (sem dados; todas ocultas)
    div [data-part=error]                    error
    p [data-part=summary]                    summary        (visualmente oculto)
```

`figure` dá ao gráfico o nome do `figcaption`. O plot é `role="group"` com
`aria-roledescription` localizado ("chart"), `aria-labelledby` no título e
`aria-describedby` no resumo. O tooltip é `aria-hidden`, porque o mesmo
conteúdo é anunciado por `@slotted/core/live-announcer` quando o ponto ativo
muda por teclado. Anunciar os dois duplicaria a leitura.

A legenda é `role="toolbar"` (APG Toolbar): um só ponto de tabulação, setas
entre itens, `Home` e `End`. Com `legend.interactive: false`, os itens são
`span` numa `role="list"`, e as mesmas partes se mantêm.

## 6. Teclado e padrão

A APG não tem padrão de gráfico
(<https://www.w3.org/WAI/ARIA/apg/patterns/>, consultado em 2026-09-23). A
referência mais próxima é a navegação do padrão Grid
(<https://www.w3.org/WAI/ARIA/apg/patterns/grid/>): as séries são as linhas e
os pontos são as colunas. A legenda segue o padrão Toolbar
(<https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/>).

Plot focado:

| Tecla | Efeito | Razão emitida |
| --- | --- | --- |
| `ArrowRight` / `ArrowLeft` | ponto seguinte / anterior na série ativa; para no fim, como no Grid | `keyboard` |
| `ArrowDown` / `ArrowUp` | série visível seguinte / anterior no mesmo ponto; para no fim | `keyboard` |
| `Home` / `End` | primeiro / último ponto da série ativa | `keyboard` |
| `PageDown` / `PageUp` | avança / recua um décimo dos pontos, pelo menos um | `keyboard` |
| `Enter` / `Space` | seleciona o ponto ativo (alterna, se já estiver selecionado) | `keyboard` |
| `+` / `-` | aproxima / afasta em torno do ponto ativo, com `zoom` ativo | `keyboard` |
| `0` | repõe o zoom | `keyboard` |
| `Escape` | limpa o ponto ativo; se já estiver limpo, repõe o zoom | `escape` |

O foco que entra no plot sem ponto ativo ativa o primeiro ponto da primeira
série visível. A saída de foco limpa o ponto ativo com `blur`. Na pizza,
`ArrowRight`/`ArrowLeft` percorrem as fatias e `ArrowUp`/`ArrowDown` não
fazem nada.

Legenda focada: `ArrowRight`/`ArrowLeft` movem o foco entre itens (espelhados
em RTL, porque a legenda é HTML); `Home`/`End`; `Enter`/`Space` alternam a
série; `Shift+Enter` e `Shift+clique` isolam a série, ou mostram todas se ela
já estiver isolada.

## 7. Estado

| Valor | Capacidade | Controlado | Não controlado | Pedido | Razões |
| --- | --- | --- | --- | --- | --- |
| séries ocultas | `visibility` (nova) | `hidden` | `defaultHidden` | `onHiddenChange` | `pointer`, `keyboard`, `programmatic` |
| ponto ativo | `current` | `activePoint` | `defaultActivePoint` | `onActivePointChange` | `pointer`, `keyboard`, `blur`, `escape`, `programmatic` |
| seleção | `selection` | `selection` | `defaultSelection` | `onSelectionChange` | `pointer`, `keyboard`, `escape`, `programmatic` |
| janela de zoom | `zoom` (nova) | `zoom` | `defaultZoom` | `onZoomChange` | `pointer`, `keyboard`, `clear`, `escape`, `programmatic` |
| vista de tabela | `open` | `tableOpen` | `defaultTableOpen` | `onTableOpenChange` | `pointer`, `keyboard`, `escape`, `programmatic` |
| tela cheia | `fullscreen` | `fullscreen` | `defaultFullscreen` | `onFullscreenChange` | `pointer`, `keyboard`, `escape`, `programmatic` |

Um ponto é `{ series, key }`. `key` é a categoria em texto, ou o índice do
registro na dispersão, ou o valor de `recordKey` quando o consumidor o nomeia.
Dados novos não movem um ponto guardado por chave (inventário, §4).

`zoom` é `{ start, end }` em fração do domínio da categoria (0 a 1).
`{ start: 0, end: 1 }` equivale a sem zoom e não é emitido de novo.

`visibility` e `zoom` são capacidades novas no vocabulário de
`specs/contract.schema.mjs`. `selection` não serve para as séries ocultas,
porque ocultar uma série não é escolhê-la para uma ação: um gráfico tem as
duas ao mesmo tempo, com sentidos opostos. `extent` não serve para o zoom,
porque mede a parte de uma camada que um painel ocupa, não a janela de um
domínio de dados. `docs/component-features.md` §13 pede zoom com reset e
anúncio, e as duas palavras entram com esse comentário.

## 8. Integração com os frameworks

### React

| Pergunta | Resposta |
| --- | --- |
| Par controlado e não controlado, com pedido e razão | sim: os cinco valores de §7, com `(value, reason, event)` |
| Padrões definidos uma vez | sim: `ChartDefaultsProvider` e `useChartDefaults` (locale, mensagens, renderer, formato, tooltip) |
| Substituir o elemento de cada parte | sim para o conteúdo: `renderTooltip`, `renderLegendItem`, `renderEmpty`, `renderError`, `renderCenter`. `plot` e `canvas` são fixos, porque o motor monta num `div` que ele mede |
| O handler do consumidor corre | sim: `onKeyDown`, `onFocus`, `onBlur` e `onPointerLeave` do plot são compostos |
| Elemento nativo e ação imperativa | sim: `ref` no `figure`; `ChartHandle` com `focus()`, `resetZoom()`, `toDataURL()`, `toCsv()` |
| Render no servidor sem divergência | sim: `useId`; o motor só monta em efeito, e o servidor desenha moldura e esqueleto |
| Estados no DOM | sim: `data-loading`, `data-current`, `data-selected`, `data-pressed`, `data-open`, `data-kind`, `data-size` |
| Props das partes estendem as nativas | sim: `ComponentPropsWithRef<'figure'>`, `<'div'>`, `<'button'>` |

### Angular

| Pergunta | Resposta |
| --- | --- |
| Valor bidirecional em forma de signal | sim: `model()` para os cinco valores, `output()` para o pedido com razão |
| Reactive Forms e template forms | não: um gráfico não é um controle de formulário. A seleção que alimenta um filtro passa pelo `model()` |
| Padrões definidos uma vez | sim: `provideChartDefaults()` sobre um `InjectionToken` |
| Instância acessível no template | sim: `exportAs: 'slChart'` |
| Conteúdo projetado e preguiçoso | sim: `ng-template` com `slChartTooltip`, `slChartLegendItem`, `slChartEmpty`, `slChartError`, `slChartCenter`, e slots `ng-content` em `header` e `actions` |
| Zoneless e `OnPush` | sim: signals do início ao fim; o motor corre fora do Angular e escreve em signals |
| Listeners desfeitos | sim: `DestroyRef` desmonta o motor, o observador de tema e o `ResizeObserver` |
| Atributo estático do consumidor sobrevive | sim: `HostAttributeToken` para `id` e `aria-label` |
| Ponto de entrada único | sim: `@slotted/angular/chart` |

## 9. API de dados

```ts
interface ChartSeries {
  id?: string;                 // padrão: field
  kind: 'line' | 'area' | 'bar' | 'pie' | 'scatter';
  field: string;
  label?: string;
  slot?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  tone?: 'neutral' | 'accent' | 'secondary' | 'success' | 'warning' | 'danger';
  stack?: string;
  axis?: 'start' | 'end';
  curve?: 'linear' | 'monotone' | 'step';
  stroke?: 'solid' | 'dashed';
  connectNulls?: boolean;
  markers?: 'none' | 'last' | 'all';
  labels?: boolean;
  sizeField?: string;          // dispersão: bolha
  innerRadius?: number;        // pizza: 0 a 0.9; > 0 é rosca
  format?: ChartFormat;
}
```

`x` nomeia o campo da categoria, do tempo ou do valor horizontal; `y` é um
eixo ou um par `[start, end]`. `orientation: 'horizontal'` troca os eixos das
barras. `stackMode`, `annotations`, `tooltip`, `legend`, `zoom`,
`renderer`, `sampling`, `texture`, `locale` e `messages` completam a
configuração.

## 10. Custos aceitos

- O esqueleto aparece durante a primeira carga do motor. Um consumidor que
  quer o gráfico no primeiro quadro chama `preloadChartEngine`.
- O texto dos eixos é desenhado pelo motor. A tipografia vem do tema (família,
  tamanho, cor), não do CSS da página, e uma fonte web ainda não carregada no
  primeiro desenho é aplicada no redesenho seguinte (`document.fonts.ready`).
- A navegação por teclado dentro do plot não é um padrão APG. É uma adaptação
  do Grid, registrada aqui.

## 11. Revisão do gate visual (2026-09-23)

O revisor apontou seis problemas: o esqueleto pesado, a altura que varia entre estados, a falta de tela cheia, a tabela aberta abaixo do gráfico, uma toolbar fraca e a cor sem personalização clara. Pediu também uso plano e em tiles de dashboard, e responsividade.

| Problema | Decisão | Custo |
| --- | --- | --- |
| Altura que varia | Todos os estados ocupam as mesmas caixas. A legenda tem uma linha, e o excesso vai para `legend-more` (`+N`), medido por `collapseState` de `@slotted/core/overflow`. `legendOverflow: 'wrap'` devolve a quebra de linha. | Uma entrada escondida pede um clique a mais. |
| Tabela abaixo do gráfico | A tabela é uma vista do plot: abre na caixa dele, rola dentro dele e mostra as séries visíveis. O CSV continua com todas. | A tabela tem a altura do plot, e uma tabela longa rola. |
| Tile de dashboard | `variant: 'card'` usa a superfície, a borda, o raio e o espaçamento do `card`, lidos dos mesmos tokens. O root preenche a célula e o plot cresce, com piso no passo de tamanho. Título e descrição ficam numa linha cada. A linha da descrição é reservada mesmo quando está vazia. | Um título longo trunca. O texto inteiro continua no DOM e no nome acessível. |
| Toolbar | Botões de ícone: repor zoom, tabela, tela cheia e "mais" (CSV, imagem). O modo `toolbar: 'hover'` vale para dispositivos com hover. A toolbar some quando não há nada a fazer (esperando, vazio ou falha). | Os downloads ficam a um clique a mais, dentro do menu. |
| Tela cheia | Estado `fullscreen`, que já existia no vocabulário. Usa a Fullscreen API quando a página pode, e senão uma camada fixa. O `Escape` sai dos dois modos, com razão `escape`. | Duas vias a manter. |
| Cor | A paleta é declarada no root. `--slotted-chart-color-1…8` personaliza as cores, e as paletas `sequential` e `focus` são misturas CSS de tokens do tema. `slot` e `tone` continuam por série. Nenhum valor de cor entra como prop (§2.4). | `sequential` separa no máximo quatro séries. |
| Esqueleto | Mostra os rótulos dos eixos, a grelha, barras com alturas variadas, uma linha em traço com lavagem e um anel mais fino. O preenchimento é de 9 % do texto sobre o fundo, o que funciona nos dois esquemas. A legenda aparece em esqueleto quando as entradas vêm com os dados. | O preenchimento do esqueleto é redefinido dentro do chart. |
| Responsividade | Abaixo de 480 px, a toolbar fica só com o menu, que passa a conter tabela e tela cheia. Abaixo de 360 px, o tooltip ancora como faixa no topo do plot (`placeTooltip`). Com ponteiro grosso, o alvo mínimo é `--slotted-target-comfortable`. Na impressão, controles e camadas saem. | Com o tooltip ancorado, o ponto é identificado pelo crosshair e não pela proximidade. |
| Ajuda | A parte `help` é um botão de informação ao lado do título, que abre `help-content` como popover. O botão não aumenta a linha do título. | Nenhum. |

## 12. Autoavaliação (passo 13)

Evidência comum a todas as linhas:

- Testes: core 51, contrato e specs 60, styles 174, harness 92, React 24 (20 de comportamento e 4 da página) e Angular 18 (14 e 4).
- Sonda determinística do harness: 25 asserções.
- `audit.mjs` sem achados nas duas páginas de referência, a 1280 e a 620 px.
- Varredura das 42 histórias em cada Storybook: só `error-state` mostra o estado de erro, por construção, e nenhuma escreve erro no console.

| Dimensão | Estado | Melhoria nomeada | Feita |
| --- | --- | --- | --- |
| Ícones | Os seis ícones da moldura vêm dos tokens de glifo por máscara (`ellipsis`, `rotate-ccw`, `file-spreadsheet`, `maximize`/`minimize`, `circle-info`). | `view-toggle` trocar para um glifo de gráfico enquanto a tabela está aberta. | Não. O conjunto de glifos não tem um ícone de gráfico, e adicioná-lo é uma mudança de fundação. `aria-pressed` e o fundo pressionado indicam o estado. |
| Movimento | As transições da moldura usam `--slotted-duration-short` e o easing padrão. As animações do motor usam a duração do tema e ficam em 0 com movimento reduzido. `update()` espera `finished` antes de posicionar o overlay. | O esqueleto deixar de fazer shimmer quando `delay` ainda não passou. | Não. O `delay`/`minDuration` é do consumidor (§4 de `loading-states`), e o chart recebe `loading` já temporizado. |
| Responsividade | Container `slotted-chart`: abaixo de 480 px só fica o menu, abaixo de 360 px o tooltip ancora e o card aperta o padding. Ponteiro grosso usa o alvo confortável. | O esqueleto do eixo x transbordava 27 px num tile de um quarto de largura. | Sim. Os rótulos encolhem juntos (`chart.css`), medido por `audit.mjs` a 620 px. |
| Refinamento | Linhas de dashboard com uma altura só (316 px nas seis), plots alinhados e estados na mesma caixa (349 px). | Os dois donuts da cena `donut` começavam em linhas diferentes. | Sim. As duas figuras passaram a ter descrição. |
| Tokens | 33 tokens próprios `--slotted-chart-*` entre os 111 que `chart.tokens.json` lista (os demais são de fundação). As paletas são misturas de tokens do tema, e o tema do motor é lido do CSS por sonda. | Expor a altura do tooltip ancorado como token. | Não. Nenhum consumidor a pediu, e a altura deriva de `--slotted-chart-inset`. |
| Padrões | Plot adaptado do APG Grid, legenda e toolbar pelo padrão Toolbar, menu por Menu Button, ajuda por Disclosure em popover. | Compor a família `menu` em vez do popover próprio. | Não. Uma família de dados arrastaria o menu para todo gráfico, e o popover nativo faz o mesmo com foco e setas (§10). |
| Acessibilidade | Nome, descrição gerada, anúncio só do último ponto, tabela completa, `forced-colors` com marcadores por máscara e textura como segundo canal. | O anúncio de zoom passar a dizer também quantos pontos ficaram. | Não. `describeZoom` diz o intervalo. A contagem exige uma mensagem nova em todas as línguas. |
| API nativa | React: props do `figure` passam, `ref` e `handleRef` separados, `render` substitui o root. Angular: `figure[slChart]`, `model()` para os seis estados, outputs `*ChangeRequest` canceláveis e `exportAs`. | Angular aceitar `title` como atributo sem que o `figure` mostre o tooltip nativo. | Sim. O binding remove o atributo e testa isso. |
| Capacidade | Os 39 itens básicos do inventário estão presentes. A fatia 2 (heatmap, radar, funil, treemap, gauge, sankey, candlestick, brush) está em `build-order.md` › Reaberturas. | Com um só gráfico não zoomável na página, o primeiro desenho falhava (`replaceMerge` com `dataZoom` não registrado). | Sim. `replaceableComponents()` em `loader.ts`, com teste em arquivo isolado. |
| Integração com o ecossistema | `ChartDefaultsProvider` e `provideChartDefaults`, `preloadChartEngine` para loaders e resolvers, token `CHART_ENGINE` para testes Angular, SSR sem `window`. | Um adaptador de dados de formulário não se aplica. O que falta é um exemplo de `preloadChartEngine` num loader de rota. | Não. Fica para a demo Nexora. |
| Documentação | Duas páginas com 42 cenas cada, anatomia das 40 partes, props, eventos, composição e acessibilidade. | As legendas diziam que o título trunca e que oito canais esperam no `+N` a 1280 px. As duas afirmações eram falsas na página renderizada. | Sim. Legendas corrigidas nas duas páginas. |

Contra `component-features.md` §18:

- **Anatomia:** §5 e as tabelas das duas páginas.
- **Controlado e não controlado:** todos os seis valores usam `createControllable`. O pedido é cancelável e leva uma razão. O React tem o par `valor`/`defaultValor`, e o Angular usa `model()`.
- **Estados:** a matriz está na §7.
- **Densidade:** muda os espaçamentos da moldura, não o plot.
- **Direção:** a moldura espelha e o plot não (§4).
- **Carga, vazio e erro:** mesma caixa (§11). O esqueleto tem a anatomia do tipo carregado.
- **Conteúdo extremo:** a cena `long-labels`, com markup como texto, e a cena `large-data`, com 12 000 pontos em canvas e amostragem.
