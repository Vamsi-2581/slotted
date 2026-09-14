# Inventário de capacidades — `timeline`

Produzido antes de qualquer desenho ou código, como
`.claude/skills/component/references/capability.md` exige. A família é nova:
`specs/components/timeline/` não existe.

`docs/build-order.md` lista `timeline` na onda 8 sem parágrafo de escopo. O
escopo deriva de `docs/component-features.md` §10, _Timeline / Activity Feed
`[Extended]`_, e é escrito em `docs/build-order.md` como parte deste trabalho:

- eventos ordenados com timestamp, ator, título, descrição, ícone/status e
  conteúdo expansível;
- contrato: orientação, agrupamento por período, loading incremental e
  marcador atual;
- ordem temporal e timezone explícitos; o visual da linha não substitui lista
  nem heading semânticos; um activity feed oferece novos itens, filtros e
  ações apenas quando necessárias.

Fontes lidas em 14 de setembro de 2026.

---

## 1. Pesquisadas

Oito fontes, escolhidas para discordarem sobre as três perguntas que esta
família tem de responder: o que é a semântica de uma linha do tempo (lista,
feed ou nada), de que lado da linha vive o conteúdo, e o que acontece quando
há mais eventos do que os carregados.

| Fonte                        | Nome                                    | Onde foi lida                                                                                              |
| ---------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| WAI-ARIA APG                 | _Feed Pattern_                          | <https://www.w3.org/WAI/ARIA/apg/patterns/feed/>                                                           |
| WAI-ARIA 1.2                 | `feed` role, `article` role             | <https://www.w3.org/TR/wai-aria-1.2/#feed>                                                                 |
| Ant Design 6.6               | `Timeline`                              | <https://ant.design/components/timeline>                                                                   |
| Material UI (lab)            | `Timeline`, `TimelineItem`, …           | <https://mui.com/material-ui/react-timeline/>                                                              |
| Primer React                 | `Timeline`, `Timeline.Item`, …          | <https://primer.style/components/timeline/react/latest>, `packages/react/src/Timeline/Timeline.tsx` (main) |
| Chakra UI v3                 | `Timeline.Root`, `Timeline.Item`, …     | <https://chakra-ui.com/docs/components/timeline>                                                           |
| Mantine 8                    | `Timeline`, `Timeline.Item`             | <https://mantine.dev/core/timeline/>                                                                       |
| SAP UI5 Web Components fiori | `ui5-timeline`, `ui5-timeline-item`, `ui5-timeline-group-item` | `packages/fiori/src/Timeline.ts` (main)                                                       |
| Nuxt UI v4                   | `UTimeline`                             | <https://ui.nuxt.com/docs/components/timeline>                                                             |

Radix, Base UI, Ark UI, React Aria, Angular CDK, Angular Material, Fluent,
Carbon, Polaris e shadcn/ui não têm a família. O APG não tem um padrão
_timeline_; o padrão _Feed_ é o que cobre a metade _activity feed_ do escopo, e
uma lista ordenada com headings cobre a outra.

### O que cada fonte decide

- **Semântica.** Ant, MUI, Chakra e Nuxt renderizam `ul`/`li` sem papel
  adicional. Mantine renderiza `div`. Primer renderiza `div` e documenta que
  `Timeline.Break` é decorativo e invisível a leitores de ecrã. UI5 renderiza
  `role="list"` com `role="listitem"` e navegação por setas própria. Nenhuma
  fonte usa `role="feed"`; o APG é a única que responde à pergunta do
  carregamento incremental com semântica.
- **Lado do conteúdo.** Ant `mode: start | alternate | end`; MUI
  `position: left | right | alternate | alternate-reverse`; Mantine
  `align: left | right`; Chakra, Primer e Nuxt fixam o conteúdo depois da
  linha. Ant e MUI dão um segundo lado — `title` no Ant, `TimelineOppositeContent`
  no MUI — para o timestamp ficar do lado oposto ao conteúdo.
- **Carregamento incremental.** UI5 `growing: Button | Scroll | None` com um
  evento `load-more`. Ant `item.loading` desenha um último nó fantasma com um
  spinner. As restantes fontes não têm.
- **Agrupamento.** UI5 `ui5-timeline-group-item` com `groupName` e
  `collapsed`. As restantes fontes não têm.
- **Marcador atual.** Mantine `active` (índice; os anteriores ficam
  realçados) e `reverseActive`; Nuxt `modelValue`/`defaultValue` (o item ativo
  e os anteriores, `reverse` inverte); Ant e MUI não têm.
- **Orientação.** Ant, Nuxt e UI5 têm `horizontal`; MUI, Chakra, Mantine e
  Primer só vertical.
- **Marcador.** Chakra `variant: subtle | solid | outline | plain` na raiz;
  MUI `TimelineDot variant: filled | outlined` e `color`; Ant `item.color` e
  `item.icon`; Mantine `bullet` (ícone, avatar) e `bulletSize`; Primer
  `Timeline.Badge`; Nuxt `icon` ou `avatar` por item.
- **Linha.** Mantine `lineVariant: solid | dashed | dotted` por item e
  `lineWidth`; MUI `TimelineConnector`; Chakra `Separator`.
- **Tamanho.** Chakra `size: sm | md | lg | xl`; Nuxt nove passos; Mantine
  `bulletSize` em pixels.
- **Ordem.** Ant `reverse`, Nuxt `reverse`, MUI `alternate-reverse`: as três
  invertem a ordem visual do array do consumidor.
- **Timestamp.** Nuxt `date` (string já formatada); Mantine e Primer deixam
  ao consumidor; UI5 `titleText` e `subtitleText`; nenhuma fonte escreve
  `<time datetime>`, nenhuma declara fuso horário.

---

## 2. Requisitos de base

Capacidades que duas ou mais fontes entregam. Vocabulário de veredito:
`adotar`, `adaptar`, `recusar`, `diferir para <família>`.

| Capacidade                                          | Quem entrega                                          | Veredito                    | Razão                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ----------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lista de eventos com marcador, linha e conteúdo     | as oito fontes                                        | adotar                      | Partes `root`, `list`, `item`, `marker`, `connector`, `content`, `title`, `description`. A lista é `<ol>` com `<li>`: a ordem temporal é uma ordem, e `docs/component-features.md` §10 pede lista semântica por baixo do visual da linha.                                                                                                                                                  |
| Semântica de feed para carregamento incremental     | APG Feed, ARIA 1.2                                    | adotar como eixo            | Eixo `mode` com `list` e `feed`. Em `feed` a lista é `role="feed"`, cada item é `<article>` com `aria-posinset`, `aria-setsize`, `aria-labelledby` e `aria-describedby`, e a raiz carrega `aria-busy` enquanto carrega. É a única semântica pesquisada que diz a um leitor de ecrã que a lista cresce sozinha.                                                                             |
| Teclado do feed                                     | APG Feed                                              | adotar                      | Em `mode="feed"`: `PageDown` e `PageUp` movem o foco entre artigos; `Control+End` e `Control+Home` movem o foco para o primeiro focável depois e antes do feed. Em `mode="list"` não há teclado próprio: o `Tab` da plataforma atravessa os links e botões do conteúdo.                                                                                                                     |
| Lado do conteúdo                                    | Ant `mode`, MUI `position`, Mantine `align`           | adotar                      | Eixo `placement` com `end`, `start` e `alternate`. `end` é a omissão de todas as fontes. Propriedades lógicas: `start` num documento `dir="rtl"` é a mesma linha espelhada.                                                                                                                                                                                                                  |
| Conteúdo do lado oposto ao conteúdo                 | Ant `title`, MUI `TimelineOppositeContent`, PrimeNG `opposite` | adotar             | Parte `opposite`. Em `placement="end"` é uma coluna antes da linha, de largura fixa em token, onde o timestamp vive na leitura clássica _hora à esquerda, linha, evento à direita_. Em `alternate` ocupa o lado que o conteúdo não ocupa.                                                                                                                                                  |
| Timestamp                                           | Nuxt `date`, UI5 `subtitleText`, Mantine (demo)       | adaptar                     | Parte `time` em `<time datetime>`. O valor é um `PlainDateTime` ou uma string ISO 8601; o texto é formatado por `Intl.DateTimeFormat` com `locale` e `timeZone` explícitos, ou substituído pelo consumidor. `docs/component-features.md` §2.9 pede valor de domínio e não string formatada; §10 pede fuso horário explícito. Nenhuma fonte escreve `datetime`.                             |
| Tempo relativo                                      | Mantine (demo), Primer/GitHub (`relative-time`)       | adotar como eixo            | Eixo `timeFormat` com `absolute` e `relative`. `relative` escreve _há 2 horas_ por `Intl.RelativeTimeFormat` e mantém o valor absoluto em `datetime` e em `title`. O instante de referência é a entrada `now` da raiz ou dos defaults; sem ela, o relógio na renderização, e o custo em SSR está escrito no desenho.                                                                        |
| Ator                                                | o parágrafo de escopo §10, Nuxt `avatar`, Mantine (demo) | adotar                   | Parte `actor`: uma linha com `avatar` composto e o nome. Em `mode="feed"` entra em `aria-labelledby` do artigo a seguir ao título, que é o que o APG pede a um rótulo distintivo.                                                                                                                                                                                                            |
| Marcador com ícone, avatar ou ponto                 | Ant `icon`, MUI `TimelineDot`, Mantine `bullet`, Nuxt `icon`/`avatar`, Primer `Badge` | adotar | Parte `marker` com conteúdo projetado. Vazia, desenha um ponto; com um `icon` ou um `avatar` dentro, dimensiona-se à volta dele. O tamanho do marcador é uma proporção do tipo, como em `stepper`, e não uma escala nova.                                                                                                                                                              |
| Aparência do marcador                               | Chakra `variant`, MUI `variant`, Primer `condensed`   | adotar                      | Eixo `variant` com `solid`, `outline`, `subtle` e `plain` na raiz, herdado pelos itens e substituível por item. `plain` é o ponto sem anel, para uma fila de eventos pequenos — uma lista de commits, um log — onde um anel por linha é um anel a mais; a caixa mantém o tamanho para a linha ficar no mesmo centro.                                                                          |
| Tom por item                                        | Ant `color`, MUI `color`, Nuxt `color`, Mantine `color` | adaptar                   | Eixo `tone` por item com os cinco tons da foundation. Cor arbitrária é recusada por `docs/component-features.md` §2.4. A raiz também aceita `tone` como omissão dos itens.                                                                                                                                                                                                                  |
| Estado da linha entre dois itens                    | Mantine `lineVariant`, MUI `TimelineConnector`        | adotar                      | Eixo `connector` por item com `solid`, `dashed` e `none`. `dashed` é o que Mantine usa para "ainda não aconteceu", e é o que a família desenha por omissão depois do item `current` quando a ordem é `oldest-first`.                                                                                                                                                                       |
| Item atual e itens já passados                      | Mantine `active`, Nuxt `modelValue`, `stepper` desta biblioteca | adotar            | Estados `current` e `complete` por item, com `aria-current` no item atual. `autoComplete` na raiz marca `complete` os itens que ficam do lado passado do atual, e é a ordem declarada que diz qual é esse lado.                                                                                                                                                                              |
| Ordem                                               | Ant `reverse`, Nuxt `reverse`, MUI `alternate-reverse` | adaptar                    | Eixo `order` com `oldest-first` e `newest-first`. A família não reordena o array do consumidor: uma inversão visual que discorda da ordem do DOM é uma ordem de leitura que mente. A ordem declarada decide onde `autoComplete` corta, onde o controlo de carregar mais assenta, e escreve `data-order` para o estilo.                                                                    |
| Item pendente no fim                                | Ant `item.loading`, `pending`                         | adotar                      | Estado `loading` no item: o marcador desenha `--slotted-icon-loader-circle` a rodar e o conteúdo fica esbatido. O consumidor escreve o item; a família não inventa um nó fantasma.                                                                                                                                                                                                          |
| Carregar mais                                       | UI5 `growing`, APG Feed                               | adotar                      | Eixo `growing` com `none`, `button` e `scroll`, parte `more` e pedido `onLoadMore(reason)` com `pointer`, `keyboard` ou `scroll`. Em `scroll` um `IntersectionObserver` na parte `more` pede quando ela entra no rolador; em `button` a parte é um `button`. A raiz carrega `aria-busy` enquanto `loading`.                                                                                  |
| Novos itens no topo                                 | o parágrafo de escopo §10, GitHub/X (_N new posts_)   | adotar                      | Parte `fresh`: um `button` no início da lista, desenhado quando `freshCount > 0`, com a mensagem `freshItems(count)` e pedido `onReveal(reason)`. Anunciado em `polite` uma vez por mudança de contagem. Sem ele, um feed que recebe eventos enquanto o leitor está a meio empurra o que ele estava a ler.                                                                                  |
| Agrupamento por período                             | o parágrafo de escopo §10, UI5 `ui5-timeline-group-item` | adotar                   | Partes `group`, `group-label` e `group-list`. O grupo é `<li>` com um heading de nível declarado (`level`) e uma `<ol>` aninhada. A família não agrupa por si: o consumidor agrupa, porque o período é do domínio (dia, semana, sprint, mês fiscal).                                                                                                                                       |
| Grupo colapsável                                    | UI5 `collapsed`, GitHub (_N hidden items_)            | adotar                      | Capacidade `open` com modelo de estado: `open`/`defaultOpen`/`onOpenChange` com `pointer`, `keyboard` e `programmatic`, por grupo, sobre `@slotted/core/disclosure`. Um grupo `collapsible` faz do seu heading um `button` com `aria-expanded` e `aria-controls`.                                                                                                                          |
| Orientação                                          | Ant, Nuxt, UI5                                        | adotar                      | Eixo `orientation` com `vertical` e `horizontal`. Horizontal rola no eixo inline e reflui para vertical abaixo de um ponto de quebra de contentor, como `stepper`.                                                                                                                                                                                                                          |
| Tamanho                                             | Chakra `size`, Nuxt `size`, Mantine `bulletSize`      | adotar                      | Eixo `size` com `sm`, `md` e `lg` sobre a escala de controlo. A densidade restata a escala; o tamanho escolhe o passo.                                                                                                                                                                                                                                                                       |
| Ações por item                                      | o parágrafo de escopo §10, `list-item` desta biblioteca | adotar                    | Parte `actions` no fim do conteúdo. Um item com ações não é todo acionável: cada ação é um alvo independente, pela regra de `list-item`.                                                                                                                                                                                                                                                    |
| Conteúdo expansível                                 | o parágrafo de escopo §10                             | recusar, com composição     | `collapsible` já tem `open`, teclado e `mount`. Dentro de `content`: `<Collapsible.Root variant="plain"><Collapsible.Trigger>Ver diff</Collapsible.Trigger><Collapsible.Panel>…</Collapsible.Panel></Collapsible.Root>`. Uma segunda disclosure por item seria duas respostas a uma pergunta.                                                                                                |
| Quebra decorativa                                   | Primer `Timeline.Break`                               | recusar                     | Uma fonte, e a própria Primer documenta que é invisível a leitores de ecrã. A parte `group` com um `group-label` é a separação com significado.                                                                                                                                                                                                                                             |
| Título clicável                                     | UI5 `nameClickable`                                   | adotar por `render`         | `title` aceita `render` no React e é uma diretiva no Angular, para o título ser um `<a>` de `link`. Nenhuma prop `href` na família.                                                                                                                                                                                                                                                         |
| Largura da linha e do marcador em pixels            | Mantine `lineWidth`, `bulletSize`                     | recusar                     | Tokens da família: `--slotted-timeline-connector-thickness` e a proporção do marcador. Um número por instância é uma escala paralela, que `docs/token-foundation.md` recusa.                                                                                                                                                                                                              |
| Cor arbitrária                                      | Ant `color` (hex)                                     | recusar                     | `docs/component-features.md` §2.4. O tom por item cobre o que um produto diz com cor.                                                                                                                                                                                                                                                                                                       |
| Estado vazio                                        | `list` desta biblioteca                               | adotar                      | Parte `empty`, desenhada quando a lista não tem itens e não está a carregar; conteúdo do consumidor, com `result-state` como composição esperada.                                                                                                                                                                                                                                           |
| Esqueleto de carregamento inicial                   | —                                                     | recusar, com composição     | `skeleton` existe. Um consumidor escreve três `<Timeline.Item loading>` com `<Skeleton>` no conteúdo, ou um `result-state`. A família dá `loading` na raiz, `aria-busy` e o item pendente.                                                                                                                                                                                                  |
| Filtros                                             | o parágrafo de escopo §10                             | diferir para `filter-bar`   | `filter-bar` é da onda 8 e edita o descritor de `@slotted/core/filter`. Um feed filtrado é um feed com outro array.                                                                                                                                                                                                                                                                         |
| Virtualização                                       | —                                                     | diferir para `data-grid`    | Nenhuma fonte virtualiza uma linha do tempo. `growing` é a resposta desta família a mais eventos do que os carregados; a janela de `@slotted/core/collection` fica para a família que a pede primeiro.                                                                                                                                                                                       |
| Defaults da aplicação numa vez                      | Ant `ConfigProvider` (parcial)                        | adotar                      | `TimelineDefaults` no React e `provideTimelineDefaults()` no Angular: `orientation`, `placement`, `variant`, `size`, `mode`, `order`, `locale`, `timeZone`, `timeFormat`, `now` e mensagens.                                                                                                                                                                                                |

---

## 3. Diferenciadores

| Diferenciador                                             | Porquê só aqui                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Um feed que é um feed                                     | Nenhuma fonte escreve `role="feed"`. Em `mode="feed"` a família entrega o padrão do APG inteiro: artigos rotulados e descritos, posição e tamanho do conjunto, `aria-busy` durante o carregamento, e as quatro teclas. Um leitor de ecrã sabe que a lista cresce e pode saltar de artigo em artigo.                                                          |
| `<time datetime>` com fuso explícito                      | Nenhuma fonte escreve o valor de máquina. A parte `time` escreve sempre `datetime`, formata pelo `locale` e pelo `timeZone` declarados, e em `relative` mantém o absoluto em `title`. Uma linha do tempo de um sistema com utilizadores em três fusos deixa de mostrar três horas para o mesmo evento sem dizer qual.                                          |
| A ordem é declarada, nunca invertida                      | Ant, Nuxt e MUI invertem o array e a ordem de leitura discorda do DOM. `order` diz o que a lista é, e é o que decide onde `autoComplete` corta e onde `more` e `fresh` assentam: `more` fica no fim do DOM em qualquer ordem, porque o fim do DOM é onde o leitor chega a rolar.                                                                              |
| Grupos que fecham sem perder o feed                       | UI5 tem `collapsed` e não tem semântica de feed. Aqui um grupo colapsável é `@slotted/core/disclosure`, o mesmo motor de `accordion` e `collapsible`, com o modelo de estado que `docs/state-and-events.md` exige.                                                                                                                                              |
| Três esquemas, três densidades e RTL numa linha           | `placement="start"` num documento `dir="rtl"` é a mesma linha espelhada, porque a grelha é lógica. Ant e MUI desenham `left` e `right` literais.                                                                                                                                                                                                              |
| O marcador alinha ao texto e não à caixa de linha         | A regra de `docs/build-briefing.md` para uma marca ao lado de uma linha de texto: o marcador é um `inline-block` na primeira linha do título, centrado em `calc((1cap + 1ex) / 2)`. Todas as fontes centram o marcador na caixa de linha, e um tema com descendente mais fundo deixa-o para trás.                                                             |
| A linha horizontal reflui em vez de esmagar               | Ant e Nuxt horizontais a 320 px são cinco colunas de duas letras. Um ponto de quebra de contentor devolve a coluna, como `stepper`; um consumidor que quer rolagem horizontal em vez de refluxo declara `reflow={false}`.                                                                                                                                      |

---

## 4. Lacunas

| Lacuna                                                        | O que nenhuma fonte faz bem                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Novos eventos enquanto o leitor lê                            | Nenhuma fonte. Um feed que insere no topo empurra o que o leitor está a ler; a parte `fresh` segura os eventos atrás de um botão até o leitor os pedir, e anuncia a contagem em `polite`.                                                                                                                 |
| Carregar mais que falha                                       | UI5 dispara `load-more` e não diz o que acontece quando falha. A parte `more` é conteúdo do consumidor: com `loading` desenha o spinner e a mensagem; sem ele, o consumidor projeta o botão de repetir ou um `inline-message`.                                                                             |
| Foco depois de carregar mais                                  | Nenhuma fonte. Em `growing="button"` o foco fica no botão, que continua no DOM depois dos novos itens; em `feed` o `aria-setsize` muda e o leitor ouve a posição nova ao avançar. Em `growing="scroll"` nada muda de foco, porque nada foi pressionado.                                                   |
| Timestamp relativo em SSR                                     | Nenhuma fonte. `relative` sem `now` lê o relógio na renderização, e o servidor e o cliente lêem horas diferentes: o custo está no desenho e o remédio é `now` nos defaults, que uma aplicação com SSR passa uma vez.                                                                                       |
| Um título de nove palavras traduzido, em `alternate`          | Ant e MUI dão metade da largura a cada lado; a 420 px cada lado tem 180 px. Abaixo do ponto de quebra `alternate` cai para `end`, e a coluna `opposite` passa a linha acima do conteúdo.                                                                                                                  |
| Cem eventos num só grupo                                      | A lista é uma `<ol>`: cem `<li>` pintam sem observador nenhum. O que a família acrescenta é `growing`, para que cem não sejam mil.                                                                                                                                                                       |
| Um evento sem título                                          | Em `feed` o artigo precisa de um rótulo. Sem `title`, `aria-labelledby` aponta ao `actor` e, sem ele, ao `time`; um artigo sem nenhum dos três é um defeito do consumidor e a família escreve-o na consola em desenvolvimento.                                                                          |
| O marcador com avatar e o marcador com ponto na mesma lista    | Mantine desenha os dois com `bulletSize` fixo e o ponto fica gigante. Aqui o ponto tem o seu tamanho e um marcador com conteúdo cresce à volta do conteúdo; a linha passa pelo centro dos dois porque a coluna do marcador tem largura fixa e o marcador centra-se nela.                                   |

---

## 5. O que este inventário acrescenta ao parágrafo de escopo

O parágrafo pede orientação, agrupamento, loading incremental e marcador atual.
O inventário acrescenta, com a razão em cada linha da secção 2: o eixo `mode`
com a semântica de feed do APG e o seu teclado; `placement` e a parte
`opposite`; `order` declarada em vez de `reverse`; `timeFormat` relativo; a
parte `fresh`; grupos colapsáveis com modelo de estado; `variant`, `tone`,
`connector` e `size`; a parte `empty`; e os defaults da aplicação numa vez.

A capacidade que ninguém pediu e que a família entrega é `fresh`: a secção 4
diz porquê.
