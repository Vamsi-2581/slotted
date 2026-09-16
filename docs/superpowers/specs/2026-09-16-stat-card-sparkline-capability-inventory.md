# Inventário de capacidades — `stat-card` e `sparkline`

Produzido antes de qualquer desenho ou código, como
`.claude/skills/component/references/capability.md` exige. As duas famílias
são novas: nem `specs/components/stat-card/` nem `specs/components/sparkline/`
existem. O parágrafo de escopo está em `docs/build-order.md`, onda 10:
`stat-card` com rótulo, valor, unidade, delta, período, tendência, comparação,
status e ação de detalhe, com o tom derivado da semântica da métrica
(`goodWhen: up | down`); `sparkline` como tendência compacta dentro do card e
da célula de tabela, com `data`, `line | bar`, referência, tom e descrição
textual do último valor e da tendência, sem eixos interativos; `loading` e erro
preservam o layout por `skeleton`; o primeiro SVG da biblioteca e a primeira
escala de cor de dados. `docs/component-features.md` §13 acrescenta: o
sparkline comunica último valor e tendência fora da forma visual; o card
distingue aumento de "bom".

§2 marca com **[S]** a linha que só `stat-card` carrega, **[K]** a que só
`sparkline` carrega, e sem marca a que as duas carregam.

Fontes lidas em 16 de setembro de 2026.

---

## 1. Pesquisadas

Nove fontes, escolhidas para discordarem sobre as três perguntas que decidem o
par: se a cor da tendência vem do sinal do delta ou da semântica da métrica;
se o sparkline se desenha em coordenadas medidas ou num `viewBox` esticado; e
o que um leitor de tela ouve no lugar da forma.

| Implementação             | Chama-lhe                                                                                                                                                                                                                               | Lida em                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTML / WAI-ARIA           | Não há padrão APG. `role="img"` com nome acessível para um gráfico sem interação; `figure`/`figcaption` quando a legenda é visível; o módulo WAI-ARIA Graphics para `graphics-document`.                                                 | <https://www.w3.org/TR/wai-aria-1.2/#img>, <https://www.w3.org/TR/graphics-aria-1.0/>                                                                         |
| Chakra UI v3              | `Stat`: `Stat.Root`, `Stat.Label`, `Stat.ValueText` (`formatOptions`), `Stat.ValueUnit`, `Stat.HelpText`, `Stat.UpIndicator`, `Stat.DownIndicator`; `size` sm/md/lg. Sem sparkline próprio; o exemplo compõe Recharts.                    | <https://chakra-ui.com/docs/components/stat>                                                                                                                  |
| Ant Design 5/6            | `Statistic`: `title`, `value`, `precision`, `prefix`, `suffix`, `formatter`, `loading`, `valueStyle`, separadores de grupo e decimal; `Statistic.Countdown`/`Timer`. Sem delta nem sparkline.                                             | <https://ant.design/components/statistic>                                                                                                                     |
| Elastic EUI               | `EuiStat`: `title`, `description`, `titleColor` (default, subdued, primary, success, accent, danger), `titleSize` (xxxs…l), `textAlign`, `isLoading`, `reverse`, elementos semânticos do título e da descrição.                            | <https://eui.elastic.co/docs/components/display/stat/>                                                                                                        |
| Tremor                    | `Card` + `Metric` + `BadgeDelta` (`deltaType` increase/moderateIncrease/unchanged/moderateDecrease/decrease, `isIncreasePositive`) + `SparkAreaChart`/`SparkLineChart`/`SparkBarChart` (`curveType`, `connectNulls`, `showGradient`, `minValue`/`maxValue`, `autoMinValue`). | <https://www.tremor.so/docs/ui/badge-delta>, <https://www.tremor.so/docs/visualizations/spark-chart>                                                          |
| SAP UI5                   | `sap.m.NumericContent`: `value`, `scale`, `indicator` (Up/Down/None), `valueColor` (Neutral/Good/Critical/Error), `truncateValueTo`; `sap.suite.ui.microchart.LineMicroChart` (`threshold`, `showThresholdLine`, `showPoints`, cor `above`/`below` do limiar) e `ColumnMicroChart`. | <https://ui5.sap.com/#/api/sap.m.NumericContent>, <https://ui5.sap.com/#/api/sap.suite.ui.microchart.LineMicroChart>                                           |
| MUI X Charts              | `SparkLineChart`: `data`, `plotType` line/bar, `area`, `curve`, `color`, `baseline`, `xAxis`/`yAxis` (`min`/`max`), `showTooltip`, `showHighlight`, `valueFormatter`, `width`/`height` por `ResizeObserver`.                              | <https://mui.com/x/react-charts/sparkline/>                                                                                                                   |
| Polaris Viz               | `SparkLineChart` (série com `isComparison` desenhada tracejada), `SparkBarChart` (`targetLine`), `accessibilityLabel`, `offsetLeft`/`offsetRight`, `isAnimated`.                                                                          | <https://polaris-viz.shopify.com/?path=/docs/polaris-viz-charts-sparklinechart--docs>, `…-sparkbarchart--docs`                                                |
| Fluent UI React Charting  | `Sparkline`: `data` (`IChartProps`), `showLegend`, `valueTextWidth`, `width`/`height`, `culture`; desenha área sob a linha e o valor à direita.                                                                                            | <https://developer.microsoft.com/en-us/fluentui#/controls/web/sparkline>                                                                                      |
| shadcn/ui (bloco)         | `SectionCards`: `Card` + `CardDescription` (rótulo) + `CardTitle` (valor, `tabular-nums`) + `Badge` com `IconTrendingUp`/`IconTrendingDown` + `CardFooter` com a leitura em prosa da tendência.                                          | <https://ui.shadcn.com/blocks> (`dashboard-01`)                                                                                                               |

A maior discordância do campo é a primeira pergunta. Tremor (`isIncreasePositive`)
e SAP (`valueColor` explícito) separam a semântica do sinal; Chakra
(`UpIndicator`/`DownIndicator`), shadcn e EUI deixam a cor ao consumidor;
Ant não tem delta. §2 adota a separação, com o nome que o escopo já deu:
`goodWhen`.

A segunda pergunta divide MUI e Polaris (medem o contentor e desenham em
píxeis) de Fluent (largura declarada). §2 mede, porque um traço de 2 px e um
marcador redondo só existem em coordenadas de píxel; um `viewBox` esticado com
`preserveAspectRatio="none"` deforma o marcador numa elipse e o raio de topo
de uma barra num arco.

A terceira pergunta só Polaris (`accessibilityLabel`) e MUI (`aria-label` no
`svg`) respondem, e ambas deixam o texto ao consumidor. §2 gera a descrição
a partir dos dados — último valor, sentido e variação — e o consumidor a
substitui.

O que a biblioteca já possui e este inventário toma como dado:

- `skeleton`, com a parte `region` que sincroniza a fase de todos os
  placeholders de uma área — é o que preserva o layout em `loading`;
- `badge` e `status-indicator`, os dois recipes que o `status` do card compõe;
- `card`, cuja moldura (`outline`, `elevated`, `subtle`) o card de métrica
  repete com tokens próprios, porque não é um `card`: não tem `media`, `body`
  nem `link`, e a sua composição interna é fixa;
- `@slotted/core/number` (`createNumberFormat` sobre `Intl.NumberFormat`), que
  formata valor, delta e último ponto;
- `@slotted/core/measure` (`createWidthGate`), o padrão de medição por
  `ResizeObserver` que o sparkline segue;
- os cinco tons do tema e os seus nove papéis; a paleta de dados de §3 é uma
  escala nova, não um sexto tom.

---

## 2. Table stakes

| Capacidade                                                                          | Quem a entrega                                       | Veredito              | Razão                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[S]** Rótulo, valor e unidade como partes separadas                               | Chakra, Ant (`prefix`/`suffix`), EUI, SAP (`scale`)  | adopt                 | Partes `label`, `value`, `unit`. A unidade fica onde o consumidor a põe dentro de `value` (`$` antes, `%` depois), o que substitui o par `prefix`/`suffix` de Ant por composição.                                                    |
| **[S]** Valor numérico formatado por `Intl` (`formatOptions`, `precision`, compacto) | Chakra, Ant, SAP (`truncateValueTo`)                 | adopt                 | `value` aceita número + `formatOptions` (`notation: 'compact'` cobre 12.9K); `children` substitui a formatação. Dígitos proporcionais no valor; `tabular-nums` só na célula de tabela.                                               |
| **[S]** Delta com sinal, sentido e tom                                              | Tremor, SAP, shadcn, Chakra (`Up/DownIndicator`)     | adapt                 | Parte `delta` com `indicator`: número + `format` (`percent` \| `decimal`), `data-trend` (up/down/flat) e `data-tone`. O tom deriva de `goodWhen`, não do sinal.                                                                     |
| **[S]** `goodWhen` / `isIncreasePositive`                                           | Tremor, SAP (`valueColor` explícito)                 | adopt                 | `goodWhen: up \| down \| none` no root, herdado por cada `delta`. `none` (uma métrica sem valência, como "sessões") pinta o delta neutro.                                                                                            |
| **[S]** Período e comparação em prosa ("vs. mês anterior", "de 1.204")              | Chakra (`HelpText`), shadcn (footer), Tremor         | adopt                 | Partes `comparison` e `period`.                                                                                                                                                                                                     |
| **[S]** Tamanho do valor                                                            | Chakra (`size`), EUI (`titleSize`)                   | adapt                 | `size: sm \| md \| lg` sobre a escala de tipo; `lg` pede um passo novo (`4xl`), justificado em §3.                                                                                                                                  |
| **[S]** Tom do valor / do título                                                    | EUI (`titleColor`), SAP (`valueColor`)               | adapt                 | `tone` explícito no root pinta o `value`; sem `tone`, o valor fica em `--slotted-text` e só o delta carrega cor. Cor no número inteiro é a exceção, não a regra (dataviz: texto não veste a cor da série).                           |
| **[S]** Estado `loading` que preserva o layout                                      | Ant, EUI, Tremor (`Skeleton`)                        | adopt                 | `data-loading` no root; cada parte de texto rende um `skeleton` com a sua própria altura de linha; `trend` rende um bloco. Uma `skeleton` `region` no root sincroniza a fase.                                                       |
| **[S]** Estado de erro e vazio                                                      | (nenhuma nas nove; `docs/build-order.md` exige)      | adopt                 | Axis `status: ready \| empty \| error`; o `value` mostra `—`; a parte `message` recebe o texto. O layout não muda.                                                                                                                  |
| **[S]** Ação de detalhe                                                             | SAP (`GenericTile` pressável), shadcn (link no footer) | adapt               | Parte `action` no `header` (fim) com `render`, para um `link` ou `button`. O card inteiro como link é composição: `fill="plain"` dentro de `card` com `card`'s `link`.                                                              |
| **[S]** Status ao lado do rótulo                                                    | SAP (`valueColor`), escopo                           | adopt                 | Parte `status`, um slot ao lado do rótulo para `badge` ou `status-indicator`.                                                                                                                                                       |
| **[S]** Moldura: contorno, elevada, subtil, nenhuma                                 | Tremor (`Card`), shadcn (`Card`), EUI (sem moldura)  | adopt                 | `fill: outline \| elevated \| subtle \| plain`. `plain` é o card numa célula ou numa fila com `divider` entre as métricas.                                                                                                          |
| **[S]** Sparkline dentro do card                                                    | Tremor, Fluent, shadcn (ad hoc)                      | adopt                 | Parte `trend`, que recebe um `sparkline`. O card diz o tom ao sparkline por uma propriedade que ele lê quando não tem tom próprio.                                                                                                  |
| **[K]** `data: (number \| null)[]`                                                  | MUI, Tremor, Polaris, Fluent, SAP                    | adopt                 | `null` é uma falha na série: a linha interrompe-se, a barra não se desenha. `connectNulls` de Tremor não é adotado; ligar por cima de um buraco inventa dados.                                                                       |
| **[K]** `line` e `bar`                                                              | MUI (`plotType`), Polaris, SAP, Tremor               | adopt                 | Axis `type: line \| bar`.                                                                                                                                                                                                           |
| **[K]** Área sob a linha                                                            | Tremor (`SparkAreaChart`), Fluent, MUI (`area`)      | adopt                 | `area: boolean`, um degradê do tom a 16 % para 0.                                                                                                                                                                                  |
| **[K]** Curva                                                                       | MUI (`curve`), Tremor (`curveType`)                  | adopt                 | `curve: linear \| monotone`. `linear` por omissão: uma curva suave passa por onde não há ponto.                                                                                                                                     |
| **[K]** Linha de referência                                                         | SAP (`threshold`), Polaris (`targetLine`, comparação), MUI (`baseline`) | adopt  | `reference: number`, uma linha tracejada de um píxel no neutro da escala de dados. A referência entra no domínio.                                                                                                                  |
| **[K]** Domínio explícito                                                           | MUI (`yAxis.min/max`), Tremor (`minValue`/`maxValue`) | adopt                | `min`/`max`. Por omissão a linha usa a extensão dos dados; a barra inclui o zero.                                                                                                                                                   |
| **[K]** Cor por série e cor semântica                                               | MUI (`color`), Tremor (`colors`), SAP (`above`/`below`) | adapt              | `series: 1…8` (identidade, a escala de §3) e `tone: neutral \| accent \| success \| warning \| danger` (significado). O tom vence a série; sem os dois, o sparkline lê o tom que o contentor lhe diz, senão a série 1.               |
| **[K]** Marcador do último ponto                                                    | SAP (`showPoints`), Fluent, MUI (`showHighlight`)    | adapt                 | `marker: boolean`, só no último ponto, com anel da cor da superfície. Um ponto em cada valor é ruído.                                                                                                                               |
| **[K]** Tamanho pela largura do contentor                                           | MUI, Polaris (`ResizeObserver`)                      | adopt                 | O root ocupa a inline size do contentor; a altura vem de `size: sm \| md \| lg`. O plot mede-se e desenha em píxeis; antes da medida, desenha no tamanho nominal do passo.                                                          |
| **[K]** Descrição textual                                                           | Polaris (`accessibilityLabel`), MUI (`aria-label`)   | adapt                 | Gerada: "{label}: {último valor}, {sentido} {variação} desde {primeiro valor}". `label`, `valueFormatter` e mensagens substituem cada peça; `description` substitui o todo.                                                          |
| **[K]** Tooltip e realce por ponto                                                  | MUI (`showTooltip`, `showHighlight`)                 | decline               | `chart`, onda 12. O escopo diz "sem eixos interativos"; um sparkline com tooltip é um gráfico de linha pequeno, e a família que o desenha é essa.                                                                                   |
| **[K]** Animação de entrada                                                         | Polaris (`isAnimated`), Tremor (`showAnimation`)     | decline               | Movimento sem informação. Uma linha que se desenha ao montar não diz nada que a linha parada não diga.                                                                                                                              |
| **[K]** Legenda e valor ao lado                                                     | Fluent (`showLegend`, `valueTextWidth`)              | decline               | É o `stat-card`: rótulo, valor e sparkline lado a lado é a família que este inventário desenha. Numa célula de tabela, a coluna vizinha é o valor.                                                                                  |
| **[S]** Alinhamento do texto                                                        | EUI (`textAlign`)                                    | decline               | Um card lê-se pelo início; centrar um valor numa moldura de largura variável desalinha uma fila. RTL espelha por propriedades lógicas.                                                                                              |
| **[S]** Contagem regressiva                                                         | Ant (`Countdown`/`Timer`)                            | decline               | Um relógio não é uma métrica; o consumidor passa `children` a `value` com o texto que quiser.                                                                                                                                       |

---

## 3. Diferenciadores

| Capacidade                                            | O que esta biblioteca oferece que o campo não                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Escala de cor de dados validada nos três esquemas     | `--slotted-data-1…8` (identidade, ordem fixa) e `--slotted-data-neutral`, na camada semântica, validados por `scripts/validate_palette.js` da skill `dataviz` em `light` e `dark` (separação CVD ≥ 8, visão normal ≥ 15, ≥ 3:1 sobre a superfície) e a 3:1 em `high-contrast`. MUI e Tremor pintam do Tailwind e não medem. |
| Tom por contentor                                     | O card escreve `--slotted-sparkline-color` na parte `trend`; um sparkline sem `tone`/`series` lê-o. Uma `table` pode fazer o mesmo numa coluna. Nenhuma das nove implementações liga a cor do sparkline à semântica do card sem o consumidor repetir a cor duas vezes.                                                        |
| Três densidades e RTL sem reconfigurar                | O card lê o passo de espaço e de tipo por densidade; o sparkline mede-se e nunca pede `width`/`height` ao consumidor. Em RTL a série lê-se da direita para a esquerda, como o texto; a linha de referência e o marcador seguem.                                                                                                |
| Descrição gerada e localizada                         | Último valor, sentido e variação em prosa, com `Intl.NumberFormat` e as mensagens do provider da família. Polaris e MUI recebem uma string pronta.                                                                                                                                                                             |
| `skeleton` com fase partilhada                        | Uma fila de oito cards em `loading` cintila em uníssono, porque cada root é uma `region` do `skeleton` e a fase é uma propriedade herdada.                                                                                                                                                                                     |
| Um passo novo na escala de tipo, `4xl`                | `--slotted-font-size-4xl` (2rem) e `--slotted-line-height-4xl` (1.2) para `size="lg"`. A escala parava em `3xl` (1.5rem), o tamanho de um `h2`; um KPI principal de um painel lê-se a 32 px em Vercel, Stripe e Tremor (`text-3xl` = 30 px). O passo fica disponível para `typography` e para `chart`.                        |

---

## 4. Lacunas

| Situação                                                           | Resposta                                                                                                                                                                                                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Série constante (todos os pontos iguais) ou com um só ponto        | Domínio degenerado: a linha desenha-se ao meio da altura; um ponto só desenha o marcador. Nenhuma das nove documenta o caso; MUI desenha uma linha no topo.                                                                    |
| Série com `NaN`, `Infinity` ou não numérica                        | Tratada como `null`: uma falha. A descrição diz "sem dados" quando nada resta.                                                                                                                                                 |
| Mil pontos numa célula de 80 px                                    | O motor não amostra: mil segmentos num `path` são baratos. As barras, com menos de 2 px de largura, deixam de ter gap e pintam-se contíguas, a 1 px no mínimo.                                                                  |
| Valor que não cabe na largura (`R$ 1.234.567.890,00` a 240 px)     | O `value` quebra por `overflow-wrap: anywhere` e não trunca — truncar um número é mentir. `formatOptions.notation: 'compact'` é a resposta do consumidor; a página de referência mostra-a.                                      |
| Rótulo longo ou traduzido                                          | O rótulo quebra em duas linhas e o `status` desce com ele; o `action` fica no fim da primeira linha.                                                                                                                             |
| Delta sem comparação (primeiro período)                            | `delta` omitido; `comparison` diz "sem período anterior" ou fica ausente. O card não inventa um zero.                                                                                                                          |
| Contentor com menos de 220 px                                      | Container query: `trend` desce para baixo do valor; o valor cai um passo de tipo. Uma fila de KPIs numa coluna de telemóvel continua a ler-se.                                                                                  |
| `forced-colors`                                                    | A escala de dados vai toda a `CanvasText` (uma série) e a área desaparece; a barra atual distingue-se das anteriores por `SelectedItem`, não por opacidade. O delta mantém o ícone e o sinal.                                    |
| `loading` que chega depois de um valor já mostrado                 | O valor anterior fica visível sob `data-loading`? Não: mostrar um número antigo como se fosse atual é o erro que um painel operacional não pode cometer. O skeleton substitui-o, com a mesma altura de linha.                    |
