# Ordem de construção

Sequência de invocações de `/component`, da camada mais primitiva para fora.
Deriva de `docs/component-features.md` (guia de features) e do estado atual de
`specs/components/`.

O passe 1 — ondas 0 a 8, 79 famílias — está registrado em
`docs/archive/build-order-pass-1.md`, com o escopo escrito de cada família. Este
arquivo lista o que foi entregue e começa o passe 2 na onda 9.

## Como ler

- **Onda** é uma barreira. Nenhum item de uma onda começa antes de todos os
  itens da onda anterior estarem aprovados no gate humano.
- Dentro de uma onda, itens ligados por `→` têm dependência e seguem a ordem
  escrita. Itens em linhas separadas são independentes entre si.
- Cada linha é uma invocação. Um par na mesma linha é uma invocação única,
  justificada por uma decisão de arquitetura compartilhada.
- **Modo:** `novo` cria a família. `reabrir` volta a uma família entregue para
  acrescentar uma capacidade prometida por escrito. `infra` entrega um módulo
  de `packages/core` sem UI.
- **Guia** é a seção de `docs/component-features.md` de onde o escopo deriva.
- **Escopo por família.** A invocação lê o escopo escrito aqui. Se a família não
  tem escopo escrito, a sessão o deriva da seção do guia e o escreve aqui como
  parte do trabalho.

## Passe 1 — entregue

| Onda | Famílias                                                                                                                                                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | contrato de tokens, tema, esquemas, densidades, modelo de estado, ratchet, harness, skill                                                                                                                                                         |
| 1    | `typography`, `icon`, `visually-hidden`, `divider`, `stack inline grid`, `container`, `card`                                                                                                                                                      |
| 2    | `button icon-button`, `button-group`, `link`, `badge`, `tag`, `avatar avatar-group`, `kbd`, `skeleton`, `progress-indicator`, `status-indicator`, `alert`, `inline-message`                                                                       |
| 3    | `field field-group`, `text-field`, `textarea`, `checkbox checkbox-group radio-group`, `switch`, `number-field`, `slider`, `form`, `currency-field`                                                                                                |
| 4    | `tabs`, `breadcrumb`, `pagination`, `collapsible accordion`, `stepper`, `description-list`, `list list-item`, `prose`, `result-state`, `toolbar`                                                                                                  |
| 5    | `presence`, `dismissable-layer`, `portal`, `positioner`, `live-announcer` (infra); `tooltip`, `popover`, `dialog alert-dialog`, `drawer`, `menu menubar`, `toast`, `loading-overlay`                                                              |
| 6    | `collection` (infra); `listbox`, `select`, `combobox`, `multi-select`, `tree`, `table`                                                                                                                                                            |
| 7    | `date-field calendar date-picker`, `time-field time-picker datetime-field datetime-picker`, `upload`, `page page-header section`, `app-shell`, `action-bar`                                                                                       |
| 8    | `splitter`, `scroll-area`, `toggle-group segmented-control`, `timeline`, `date-range-picker`, `tags-input`, `filter-bar code-block`; reabertura de `table` (operandos `time`, `datetime`, `date-range-picker`, `tags-input` no filtro por coluna) |

Famílias do guia entregues dentro de outra: `alert-dialog` em `dialog`;
`icon-button` em `button`; `filter-builder` em `filter-bar` (parte `builder`).
`highlight` foi folha partilhada em `packages/styles/src/highlight` até a onda
10, quando virou família.

Módulos de `packages/core` entregues: `clipboard`, `code`, `collection`,
`commands` (onda 9), `count`, `currency`, `date`, `disclosure`, `dismissable-layer`, `drag` (onda
9), `extent`, `files`, `filter`, `focus`, `form`, `identity`, `keys`,
`live-announcer`,
`loading`, `measure`, `number`, `overflow`, `pagination`, `pointer-intent`,
`portal`, `positioner`, `presence`, `progress`, `slider`, `state`, `steps`,
`sticky-header`, `tags`, `text` (onda 9), `timeline`, `toast`, `typeahead`,
`upload`.

## Reaberturas prometidas por escrito

Cada linha é uma volta a uma família entregue, registrada no escopo do passe 1
ou numa autoavaliação. Não são defeitos: são capacidades adiadas até existir a
família de que dependem. A coluna "depois de" nomeia a barreira.

| Família                         | O que entra                                                                                                                                                                                                                                                       | Depois de                                 | Registro                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------- |
| `table`                         | `time-range-picker` e `datetime-range-picker` como operando único de `between` nas espécies `time` e `datetime`                                                                                                                                                   | `time-range-picker datetime-range-picker` | `docs/archive/build-order-pass-1.md`, onda 8                               |
| `date-range-picker`             | a moldura de uma linha de `time-range-picker` (`summary`, campos na banda do painel): dois campos na moldura quebram-na em duas linhas numa coluna de formulário e contrariam a altura partilhada dos controlos                                                   | —                                         | `docs/history/designs/2026-09-15-time-range-design.md`                     |
| `table`                         | célula com controle `plain` cede a inserção ao controle (`padding-inline: 0` na célula, `--slotted-control-padding-inline-*` no controle)                                                                                                                         | —                                         | `docs/archive/build-order-pass-1.md`, onda 7; `docs/build-briefing.md`     |
| `multi-select`                  | ler `splitValues`, `admitValues` e `constraintVerdict` de `@slotted/core/tags` no lugar das duas cópias locais; `commitOnBlur` com três valores                                                                                                                   | —                                         | `docs/archive/build-order-pass-1.md`, onda 8                               |
| `prose`, `table`, `tabs`        | substituir a medida de rolagem própria por `scroll-area`                                                                                                                                                                                                          | —                                         | `docs/archive/build-order-pass-1.md`, onda 8                               |
| `scroll-area`                   | véu por `animation-timeline: scroll()`                                                                                                                                                                                                                            | —                                         | `2026-09-13-scroll-area-design.md` §5                                      |
| `listbox`, `tree`, `tags-input` | reordenar por arrasto                                                                                                                                                                                                                                             | `drag-and-drop`                           | inventários de `listbox` (l. 125), `tree` (l. 101), `tags-input` (l. 90)   |
| `tags-input`, `multi-select`    | o `Alt`+seta passa a `moveBy` de `@slotted/core/drag`, emitindo o mesmo evento que o arrasto                                                                                                                                                                      | —                                         | `2026-09-15-drag-design.md` §1                                             |
| `app-shell`                     | `[data-ui='app-shell'] [data-part='brand']` passa a `> [data-part='banner'] > [data-part='brand']`: o seletor descendente alcança o `brand` de `top-navigation` dentro do `banner`                                                                                | —                                         | `2026-09-15-top-navigation-design.md` §9; `top-navigation.styles.test.mjs` |
| `dialog`                        | `sl-dialog` aceitar `ariaLabel` como input; hoje o `aria-label` do host é estático e `command-palette` nomeia o diálogo por um `<h2 slDialogTitle hidden>`                                                                                                        | —                                         | `2026-09-15-command-palette-self-assessment.md` §8                         |
| `combobox`                      | adotar `createRanker` de `@slotted/core/collection` como ordenação padrão, no lugar de `filter` mais a ordem do consumidor                                                                                                                                        | —                                         | `2026-09-15-command-palette-design.md` §2                                  |
| `time-range-picker`             | `wrap`: um turno que atravessa a meia-noite não é `order`; a duração conta pela meia-noite e a lista de fim não risca as horas antes do início. `table` passa-o no `between` da espécie `time`, cujo motor já lê `22:00 – 02:00` como janela noturna              | —                                         | `2026-09-16-table-range-operands-design.md` §1                             |
| `number-field`                  | `text-align: inherit` no `input` (fora da guarda `:dir(rtl)`), para um campo `plain` numa célula numérica alinhar os dígitos ao fim como `text-field` já faz                                                                                                      | —                                         | `2026-09-16-table-range-operands-design.md` §2                             |
| `currency-field`                | montante de destaque (36 px, peso 600, sem moldura, alinhado ao fim) como forma de tamanho do contrato, visto no passo 2 de `wizard-7` do ReUI                                                                                                                    | —                                         | `2026-10-01-currency-field-reui-dossier.md` § 6                            |
| `popover`, `tooltip`            | seta com `--slotted-border-width-medium` (1,5 px): a aresta de 1 px do quadrado rodado 45° é antialiasada em dois meios-pixels e lê-se mais fina que a borda do painel; o `hover-card` a expõe ao lado de um link e não a altera                                  | —                                         | gate visual de `context-menu hover-card`, 2026-09-16                       |
| `positioner`                    | `inline`: um link que quebra em duas linhas mede como a caixa em volta das duas, e um `hover-card` pode apontar para o vão entre elas; o middleware `inline()` do Floating UI responde e o módulo não o expõe                                                     | —                                         | `2026-09-16-context-menu-hover-card-capability-inventory.md` §6            |
| `typography`                    | ler o passo `4xl` (`--slotted-font-size-4xl`, `--slotted-line-height-4xl`) que `stat-card` abriu para `size="lg"`                                                                                                                                                 | —                                         | `2026-09-16-stat-card-sparkline-design.md` §2                              |
| `chart`                         | a rampa sequencial e o par divergente que a escala de dados não tem; a textura como segundo canal sob `forced-colors`; tooltip e realce por ponto que `sparkline` recusou                                                                                         | `chart` (onda 12)                         | `2026-09-16-stat-card-sparkline-design.md` §1; inventário §2               |
| `chart` (fatia 2)               | heatmap, radar, funil, treemap, gauge, sankey e candlestick, cada um como um chunk do adaptador sob o mesmo contrato de série; seleção de intervalo (brush) como um segundo valor mutável, distinto de `zoom`, com teclado próprio                                | `chart` (onda 12)                         | `2026-09-23-chart-capability-inventory.md` §2, linhas 34 e 35              |
| `table`, `filter-bar`           | a forma compacta do filtro de `data-grid`: painel de 24 rem, uma condição por linha (operador de 7 rem e operando, em `sm`), o join segmentado na segunda linha, Clear/Apply em `sm`; `set` como `select` `multiple`; o operador em símbolo na linha              | —                                         | `2026-09-16-data-grid-design.md` §5                                        |
| `table`                         | expor `columnState` (`GridColumnState`) para `column-manager` servir às duas famílias; hoje as colunas de `table` são marcação do consumidor e o contrato não declara o modelo                                                                                    | —                                         | `2026-09-23-column-management-design.md` §1 (Gaps)                         |
| `data-grid`                     | vista de impressão: uma folha `@media print` que desliga a janela virtual, a moldura e a altura, e imprime as linhas que a query deixou                                                                                                                           | —                                         | `2026-09-16-data-grid-self-assessment.md` §1 (9)                           |
| `menu`                          | deixar de importar `highlight/highlight.css` (React e Angular): a família importa a sua folha e um `mark` num item vem de `Highlight` / `[slHighlight]`; o arquivo estava em edição por `context-menu hover-card` na mesma rodada                                 | —                                         | `2026-09-16-highlight-design.md` §5                                        |
| `tree`                          | o `<mark>` sem identificador da busca passa a `Highlight` / `[slHighlight]` dentro do rótulo, e a folha `highlight/highlight.css` deixa de ser importada                                                                                                          | —                                         | `2026-09-16-highlight-design.md` §5                                        |
| `toggle-group`                  | o `item` passa a ser a família `toggle` deferindo ao contexto do grupo (a forma de Base UI); a pintura do item, escrita em `toggle-group.css` e em `toggle.css` sob dois prefixos, sai de uma das duas; o grupo continua o único dono do valor                    | —                                         | `2026-09-16-split-button-toggle-design.md` §2                              |
| `prose`                         | `scroll-margin-block-start` dos headings soma `--slotted-page-sticky-top` ao ar de `_flow`, como `section` lê a propriedade: um salto nativo (`#id` na URL) aterra sob a chrome de `page`; `table-of-contents` compensa ao rolar por si                           | —                                         | `2026-09-16-table-of-contents-design.md` §5                                |
| `page-header`, `section`        | `deferTo: "anchor-nav"` nos três ponteiros dos contratos passa a `table-of-contents`, o nome com que a família foi entregue                                                                                                                                       | —                                         | `2026-09-16-table-of-contents-capability-inventory.md` §5                  |
| `list-item`                     | hover e press de uma linha cujo alvo é um descendente esticado (`title::after` de `data-list`) sem que outra família escreva `--_fill`: um atributo ou uma parte pública que a linha leia                                                                         | —                                         | `2026-09-24-data-list-self-assessment.md` §5                               |
| `chart`                         | a tela cheia própria (`requestFullscreen` no host, camada fixa) passa a `@slotted/core/fullscreen`: restauro de contexto, `webkit`, portal que segue e erro emitido                                                                                               | —                                         | `2026-09-24-fullscreen-design.md` §7                                       |
| `upload`                        | saída animada da linha removida: o binding retém a linha depois de `onFilesChange` até ao fim de uma transição de `opacity` e `translate` em `--slotted-easing-exit`, sem um segundo estado ao lado de `files` controlado; a entrada já está em `@starting-style` | —                                         | `docs/history/designs/2026-09-30-upload-reui-dossier.md`, secção 5         |
| `filter-bar`                    | menu por linha no construtor (duplicar, envolver num grupo), quando `data-grid` decidir o construtor em linha; hoje `Add group` compõe o envolver e os operadores negados cobrem negar                                                                            | `data-grid`                               | `2026-09-30-filter-bar-reui-dossier.md` §6                                 |
| `badge`                         | `size="sm"` lê `--slotted-control-inner-size` quando um contentor o escreve, como `tag` e `kbd`: em denso o emblema mede 18.8 px e a linha do rótulo de `field` 17.39, e a fila do cabeçalho cresce 1.41 px                                                       | —                                         | `docs/history/designs/2026-09-30-field-label-row-design.md` §3             |

As reaberturas sem barreira entram no passe de revisão (`docs/process/implementation-review.md`).
As que têm barreira entram na onda em que a barreira cai.

## Onda 9 — o que a onda 8 deixou

Famílias listadas na onda 8 do passe 1 e não construídas, mais a infraestrutura
que três autoavaliações pediram.

| Invocação                                 | Modo  | Guia |
| ----------------------------------------- | ----- | ---- |
| `drag-and-drop`                           | infra | 3    |
| `side-navigation`                         | novo  | 7    |
| `top-navigation`                          | novo  | 7    |
| `command-palette`                         | novo  | 5    |
| `time-range-picker datetime-range-picker` | novo  | 6    |
| `drag-and-drop` → `data-grid`             | novo  | 12   |

`drag-and-drop` primeiro. As outras cinco linhas são independentes entre si;
`data-grid` depende de `drag-and-drop` pelo reordenamento de colunas.

### Escopo por família — onda 9

- `drag-and-drop` — módulo `@slotted/core/drag`, sem UI. Pointer, touch e
  teclado; pré-visualização, alça, zonas válidas, auto-scroll, cancelamento por
  Escape e anúncio pelo `live-announcer`. O evento carrega itens, origem,
  destino, posição e operação permitida; o modelo de dados é o do consumidor e
  não a geometria do DOM. A alternativa por teclado (pegar, mover com setas,
  soltar) é construída primeiro e o ponteiro deriva dela. Consumidores
  previstos: `data-grid` (colunas), `listbox`, `tree`, `tags-input`,
  `dashboard-grid`.

  Entregue em 2026-09-15. Inventário em
  `docs/history/designs/2026-09-15-drag-capability-inventory.md`, decisões em
  `docs/history/designs/2026-09-15-drag-design.md`, autoavaliação em
  `docs/history/designs/2026-09-15-drag-self-assessment.md`. A sessão é o
  desenho: `pickUp`, `move`, `drop`, `cancel` sobre posições (`between`, `on`,
  `root`) derivadas de `items()` do consumidor; o ponteiro resolve um ponto para
  a mesma posição. `moveBy` é a sessão em uma chamada, para o `Alt`+seta que
  `tags-input` e `multi-select` já pressionam. O módulo fica fora de
  `packages/core/src/index.ts`, como `filter`. O harness de core —
  `node tools/harness/core.mjs drag` — empacota o módulo na página e o revisor
  o dirige por teclado e ponteiro. O que os consumidores herdam: o binding
  renderiza `data-dragging`, `data-drop-target` e `data-drop-invalid` a partir
  de `state` (o módulo não escreve atributo em elemento registrado); a tecla
  que **abre** a sessão é da família; `Escape` é tomado em `window` na fase de
  captura e não chega a `dismissable-layer`.

- `side-navigation` — itens e grupos aninhados, `expanded` e `selected`, ícone
  opcional, `badge`, modo compacto. A seleção deriva da rota e a expansão é
  independente dela. Em tela estreita vira `drawer` e devolve o foco ao gatilho.
  Ícones sem rótulo só em modo compacto, com `tooltip`. Ocupa a região `nav` de
  `app-shell` e lê `collapsedTo="rail"` dela. Constrói sobre `list-item`,
  `collapsible` e `@slotted/core/disclosure`; a marca de região reutiliza
  `--slotted-icon-panel-open`/`-close`, virada por lado e por direção.

  Entregue em 2026-09-15. Inventário em
  `docs/history/designs/2026-09-15-side-navigation-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-15-side-navigation-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-15-side-navigation-self-assessment.md`. Dezassete
  partes; três modelos (`value`, `expanded`, `flyout`); a calha lida pela
  largura da própria raiz (`compactAt: 96`) e não pelo contexto da casca, com
  `landmark` resolvido pelo contexto (`nav` sozinha, `div` na região `nav`);
  o flyout composto de `portal`, `positioner`, `presence` e
  `dismissable-layer`; `truncate: end | middle | none` com o corte pelo meio
  em `@slotted/core/text` e o tooltip a carregar o texto inteiro; `count` como
  parte própria, o `badge` em `end`. O item de comando é um `button` na parte
  `link`. As demonstrações de `app-shell` montam a navegação com a família.
  Recusado por escrito: barra de estado na aresta (R1), drawer próprio
  (`app-shell`), horizontal (`top-navigation`), reordenar (reabertura depois
  de `drag-and-drop`), pesquisa (`text-field` + filtro do consumidor).

- `top-navigation` — regiões de marca, navegação, busca, contexto, ajuda,
  notificações e conta, com prioridade de colapso por container query. Ocupa a
  região `header` de `app-shell`. Landmarks e skip link; a barra não é um
  `toolbar` com uma parada de tabulação por região. Compõe `text-field`,
  `avatar`, `menu` e `badge`; não define nenhum deles.

  Entregue em 2026-09-15. Inventário em
  `docs/history/designs/2026-09-15-top-navigation-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-15-top-navigation-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-15-top-navigation-self-assessment.md`. Vinte
  e quatro partes; três modelos (`moreOpen`, `searchOpen`, `value`); o colapso
  em três degraus literais (`collapseAt`: 1024, 768, 480) sobre `priority` por
  item, decidido pela folha antes do script; o painel de `more` é Disclosure
  dentro da raiz, com o mesmo DOM movido (Angular) ou portado (React); a
  procura vira gatilho abaixo de 768 e toma a barra aberta; `context` recolhe
  para o painel abaixo de 768 e `help` abaixo de 480, `notifications` e
  `account` nunca;
  `frame` e `landmark` resolvidos pelo contexto da casca; o glifo
  `--slotted-icon-bell` entra na escala. Recusado por escrito: `sticky`
  (duas linhas do consumidor), resultados de procura (`combobox`,
  `command-palette`), switcher próprio (`menu`), `display: stack`
  (`page-header`), `menubar` (a advertência do APG), ações extra recolhíveis
  (reabertura se um produto pedir).

- `command-palette` — `dialog` com `combobox` + `listbox` dentro. Itens com
  `id`, `label`, `keywords`, `group`, `disabled` e handler ou destino; `query`
  controlável; `loading` e `empty`; atalhos, histórico, ações assíncronas e
  subcomandos como página empilhada. A ordenação é um adaptador substituível;
  o padrão é o `typeahead` de `packages/core`. Não executa item `disabled`;
  anuncia o número de resultados pelo `live-announcer`. Recusa registrada em
  `menu` (inventário, l. 119): um menu filtrado por texto é esta família.

  Entregue em 2026-09-16. Inventário em
  `docs/history/designs/2026-09-15-command-palette-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-15-command-palette-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-15-command-palette-self-assessment.md`.
  Vinte e seis partes; cinco modelos (`open`, `query`, `current` como
  conjunto `item` + `page`, `recent` sob `queue`). Compõe a família `dialog`
  (`surface="plain"`, `placement="top"`, `escape="none"`) e `kbd` (keycaps
  `outline` em `inherit`); `presentation="inline"` é o menu filtrado que
  `menu` recusou. A ordem da lista é `@slotted/core/commands`
  (`resolveCommands`, `createCommandRanker`), sobre o novo `createRanker` de
  `collection/filter` — o `typeahead` que o escopo nomeava não pontua; o
  atalho de abertura usa os novos `matchesShortcut` e `isEditableTarget` de
  `keys`. Recusado por escrito: parte `close` (scrim e `Escape`), atalhos por
  item ligados pela família (`matchesShortcut` no consumidor), modos por
  prefixo (composição), virtualização (`collection`), `vimBindings`.

- `time-range-picker datetime-range-picker` — uma sessão: dois `time-picker`,
  ou dois `datetime-picker`, com o `max` de um ligado ao `min` do outro, atrás
  de um gatilho. Herdam de `date-range-picker` a banda com o comprimento dito
  enquanto o intervalo é desenhado, `minLength`/`maxLength`, `contiguous`, a
  parte `preset` e o rascunho que nunca chega a um formulário. O motor é
  `@slotted/core/date` (`date-range.ts` estendido a `PlainTime` e
  `PlainDateTime`). A reabertura de `table` que substitui os dois pickers do
  `between` é uma sessão separada, na onda 10.
  Entregue em 2026-09-16. Inventário em
  `docs/history/designs/2026-09-15-time-range-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-15-time-range-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-15-time-range-self-assessment.md`. Vinte e
  seis / vinte e oito partes; três modelos (`value`, `open`, `current` como
  conjunto `position` + `highlighted`). A moldura é uma linha na altura de
  controlo — `summary` com o valor em texto, `clear`, dois `hidden-input` —
  e o painel é uma ponta de cada vez: duas abas (Início / Fim), o campo da
  ponta corrente (só em ponteiro fino), `hint` com o que falta ou o que está
  errado, e a lista dessa ponta (**[DT]** ao lado da grelha em modo
  intervalo); escolher uma ponta leva à outra, a segunda fecha, `done` é a
  saída da folha. As duas listas lado a lado da primeira volta foram
  recusadas no gate de lançamento. A duração em cada linha
  (`option-duration`; **[DT]** só no mesmo dia). Motor em `@slotted/core/date/time-range.ts`
  (`timeRangeProblems`, `dateTimeRangeProblems`, `durationLabel`,
  `runRefusal`, `openingIndex`). Aditivo fora da família: `label` em
  `time-field` e `datetime-field` Angular; os três campos Angular não repõem
  os segmentos durante uma sequência de dígitos.
- `data-grid` — a família que **aplica** o descritor de `@slotted/core/filter`:
  possui o modelo de dados e chama `createFilterPredicate`; `table` reporta e o
  consumidor filtra. Herda as quatro capacidades que `table` recusou pelo papel
  ARIA: redimensionar coluna, virtualização de linha e coluna, ordenação por
  várias chaves e ativação de linha. `role="grid"` com cursor de célula, setas,
  Home/End/Page. Colunas com `id`, `label`, `type`, `align`, `width/min/max`,
  `sortable`, `filterable`, `editable`, `hidden`, `pinned`, renderer, editor e
  accessor. Query serializável única para cliente e servidor: ordenação
  múltipla, filtros tipados, busca, paginação por página ou cursor,
  agrupamento. Seleção `single | multiple | range`, select-all do conjunto
  filtrado, ativação de linha separada da seleção. Edição por célula ou linha,
  validação sync/async, commit/cancel, conflito, atualização otimista; um erro
  não descarta o valor digitado. Reordenar, mostrar/ocultar, fixar e ajustar
  colunas por `@slotted/core/drag` e teclado. Rodapé agregado e linha de
  detalhe. Exportação, gráficos e pivot ficam fora. O gerenciador de colunas
  como painel é `column-manager`, onda 10; a grelha expõe o modelo que ele
  edita.
  Entregue em 2026-09-17. Inventário em
  `docs/history/designs/2026-09-16-data-grid-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-16-data-grid-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-16-data-grid-self-assessment.md`. Trinta e
  seis partes; `role="grid"` em `div`, cada linha um `display: grid` sobre a
  template que o binding escreve; sete modelos (`query` partilhado por `sort`
  e `filter`, `columnState` na capacidade nova `columns`, `value` e `range`
  para a seleção, `current`, `expanded` e `expandedGroups`) e a edição como
  sessão pelo handle. Motor em `@slotted/core/grid` (`applyQuery`, cursor,
  colunas, query serializável). A forma compacta do filtro — painel de 24 rem
  com uma condição por linha e a linha de filtro com o operador em símbolo —
  é a que `table` e `filter-bar` herdam (reabertura). O glifo
  `--slotted-icon-funnel` entra no tema. Angular: `sl-data-grid` com
  `model()` para os sete valores e `ControlValueAccessor` na seleção.

## Onda 10 — composições Core em falta e Extended sobre o que existe

Cada família compõe famílias entregues. Nenhuma traz motor novo em
`packages/core`, exceto onde o escopo diz.

| Invocação             | Modo    | Guia  |
| --------------------- | ------- | ----- |
| `table`               | reabrir | 12    |
| `data-entry-form`     | novo    | 15    |
| `crud-list`           | novo    | 15    |
| `context-menu`        | novo    | 8     |
| `hover-card`          | novo    | 8     |
| `split-button`        | novo    | 5     |
| `toggle`              | novo    | 5     |
| `otp-input`           | novo    | 6     |
| `highlight`           | novo    | 10    |
| `aspect-ratio image`  | novo    | 4, 14 |
| `stat-card sparkline` | novo    | 13    |
| `table-of-contents`   | novo    | 7     |
| `selection-toolbar`   | novo    | 11    |
| `column-manager`      | novo    | 12    |
| `data-list`           | novo    | 12    |

Independentes entre si. `crud-list` depende de `selection-toolbar` e de
`data-grid` (onda 9) e fecha a onda.

### Escopo por família — onda 10

- `table` (reabrir) — `time-range-picker` como operando único de `between` na
  espécie `time` e `datetime-range-picker` na espécie `datetime`, no lugar dos
  dois pickers que `TableTimeFilter` e `TableDateTimeFilter` desenham. O
  descritor, o predicado, o codec e o resumo não mudam; o que troca é o
  controle dentro de `filter-operand`. Na mesma sessão, a regra de célula
  pendente: uma célula com controle `plain` cede a inserção ao controle.

  Entregue em 2026-09-16. Inventário em
  `docs/history/designs/2026-09-16-table-range-operands-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-16-table-range-operands-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-16-table-range-operands-self-assessment.md`.
  `between` de `time` e `datetime` é um range picker com `presets`, marcado
  `data-range`; `Enter` no gatilho abre o picker e não aplica. A célula cede
  também o inset de bloco: o controle `plain` recebe a altura mínima da linha
  pelos tokens `--slotted-control-height-*`, e a linha não cresce. O seletor
  enumera as catorze famílias `plain`; `table.styles.test.mjs` lê a lista de
  `plain-variant.test.mjs`. Duas reaberturas ficam registradas acima: `wrap`
  em `time-range-picker` (a janela noturna que o motor aceita e o picker marca
  `order`) e `text-align: inherit` no `input` de `number-field`.

- `data-entry-form` — seções com headings, grade responsiva por `grid`, ajuda
  contextual, validação por `form`, estado sujo, autosave opcional, ações por
  `action-bar` e resumo de erros com foco no primeiro campo. Campos condicionais
  derivam validade do modelo e não da visibilidade; ao ocultar, a política de
  manter ou limpar o valor é declarada. Envio duplicado é bloqueado; sair com
  mudanças pede confirmação por `alert-dialog` só quando há perda real. É uma
  composição: `form`, `field-group`, `section`, `grid`, `action-bar`,
  `inline-message`. Motor novo: nenhum; `@slotted/core/form` ganha o estado
  sujo por campo se ainda não o tem.
- `crud-list` — `page-header` + `filter-bar` + `data-grid` ou `table` +
  `pagination` + `selection-toolbar` + `result-state`, com criação, edição e
  detalhe em `drawer` ou rota. Estado de query único e serializável (o codec de
  URL de `filter-bar` mais ordenação e página); o retorno do detalhe preserva
  filtros, página, seleção e posição de rolagem. É a página de referência que
  mostra as outras famílias em uso real.
- `context-menu` — o núcleo de `menu`, aberto por clique secundário, tecla de
  contexto ou Shift+F10 sobre um alvo. Posicionamento por ponto via âncora
  virtual do `positioner` (inventário de `tooltip`, l. 71). Devolve o foco ao
  alvo. As ações também existem por outro caminho: a família documenta o
  requisito e a página de referência o mostra.

  Entregue em 2026-09-16, numa sessão com `hover-card`. Inventário em
  `docs/history/designs/2026-09-16-context-menu-hover-card-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-16-context-menu-hover-card-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-16-context-menu-hover-card-self-assessment.md`.
  A raiz é o alvo (`div`, `render` para uma linha); a superfície é `menu` sem
  reexportar nada, como `menubar`. `menu` ganhou `anchor` e `finalFocus`, que
  o seu inventário (l. 117) e o seu contrato (`focus.finalFocus`) prometiam.
  Abre por `contextmenu`, long press (500 ms, limiar 10 px) e `Shift+F10`/
  `ContextMenu` ancorado ao alvo; o foco volta ao elemento focado na abertura.

- `hover-card` — pré-visualização de link ou entidade que abre em hover e foco
  com atraso e área de tolerância; o gatilho continua um `link` ou elemento
  focável; conteúdo navegável opcional. Toque abre por clique. `tooltip` recusou
  `openOnHover` para esta família (inventário, l. 116). Compõe `popover` com
  `positioner` e `presence`; não substitui `dialog`.

  Entregue em 2026-09-16, na sessão de `context-menu` (mesmos três documentos).
  A raiz é o gatilho (`a`, `render` para `Link`); a superfície é `popover` sem
  reexportar nada, com `autoFocus` desligado e `sideOffset` 4 px por
  `overrides` do contrato. `popover` passou a honrar o `role` explícito do
  consumidor: o painel é `presentation` até `navigable`, quando vira `dialog`
  e o link recebe `aria-haspopup`. Atrasos 600/300 ms, grace por
  `pointer-intent`, foco abre sem atraso em `:focus-visible`, toque abre no
  primeiro tap. Reaberturas registradas acima: seta de `popover`/`tooltip` e
  `inline` no `positioner`.

- `split-button` — ação principal e menu de alternativas; partes `primary` e
  `menu-trigger` com nomes acessíveis distintos. Compõe `button`, `button-group`
  (variante unida) e `menu`. A escolha no menu só atualiza a ação principal sob
  uma opção declarada (`remember`), porque a atualização silenciosa muda o que
  o próximo clique faz.

  Entregue em 2026-09-16, numa sessão com `toggle`. Inventário em
  `docs/history/designs/2026-09-16-split-button-toggle-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-16-split-button-toggle-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-16-split-button-toggle-self-assessment.md`.
  A raiz é um `div[role=group]`; as duas metades são elementos de `button`
  (Button e IconButton como gatilho de `menu`) a carregar as partes `primary` e
  `menu-trigger` — `button` seleciona-se por `data-ui` apenas e a vaga da parte
  é da família que compõe. A junção reescreve a de `button-group` para dois
  filhos; o chevron é `--slotted-icon-chevron-down` e não gira. `loading` na
  raiz: o primary mostra o indicador de `button`, o gatilho fica
  `aria-disabled`, focável e pintado no tom. `remember` liga `value`/
  `defaultValue`/`onValueChange` ao grupo de rádio de `menu` por
  `SplitButtonChoices` / `slSplitButtonChoices`. O nome do gatilho é
  obrigatório (tipo em React, verificação de `SlIconButton` em Angular).
  `@slotted/angular/button` passou a exportar `BUTTON_WAIT`, `resolveInertness`,
  `resolveLoadingIndicator`, `stateAttribute` e `blockActivation`, para uma
  família estender um membro sem alcançar a sua fonte; o gatilho Angular
  hospeda `slMenuTriggerFor` por `hostDirectives`. Na mesma sessão, `menu`
  passou a desenhar a mão nos itens (`cursor: pointer`; `not-allowed` no item
  indisponível): a seta seguia os menus da plataforma, e a superfície é um
  `div` na página como a de `select`.

- `toggle` — um `button` com `aria-pressed` fora de grupo. O item que
  `toggle-group` já desenha, publicado como família própria para a barra de
  ferramentas e para o controle avulso (`wrap` de `code-block` é um). Não
  substitui `checkbox` em formulário.

  Entregue em 2026-09-16, na sessão de `split-button` (mesmos três documentos).
  Um modo — Bold, Wrap, Pin — verdadeiro no instante em que é premido, neutro
  até ligar e de uma cor só quando ligado (o par de acento); `ToggleButton` de
  `button` continua a ação que persiste e espera. Partes `root`, `icon`,
  `label`; eixos `size` e `variant` (`outline`, `ghost`); modelo `pressed`
  idêntico ao de `ToggleButton`; sem `loading`, sem tons, sem `value`, sem
  `ControlValueAccessor`. Dentro de `toolbar` a barra é dona da parada de
  tabulação. A pintura é a do item de `toggle-group`, escrita sob prefixo
  próprio; a reabertura acima faz do item esta família.

- `otp-input` — valor único distribuído em N caixas; comprimento, tipo
  numérico ou alfanumérico, colagem completa, `autocomplete="one-time-code"`,
  máscara opcional. Uma parada de foco lógica: o input real é um só, oculto, e
  as caixas são pintura; erro e leitura por leitor de tela descrevem um campo.
  `field` para rótulo e mensagem; `ControlValueAccessor` e `name`.

  Entregue em 2026-09-16. Inventário em
  `docs/history/designs/2026-09-16-otp-input-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-16-otp-input-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-16-otp-input-self-assessment.md`. Partes
  `root`, `input`, `group`, `separator`, `slot`; `length`, `type`, `pattern`,
  `transform`, `groups`, `attached`, `placeholder`, `mask` (o input passa a
  `type="password"`), `autoSubmit`, `webOtp` (opt-in), `onComplete`,
  `onRejected`; seleção normalizada a um carácter, toda a tecla nativa; a fila
  é sempre LTR. Motor puro em `@slotted/core/otp` (`sanitize`,
  `normalizeSelection`, `currentSlots`, `spreadPlaceholder`). Angular:
  `[slOtpInput]` + `input[slOtpInputControl]` com `ControlValueAccessor`.

- `highlight` — a folha partilhada em `packages/styles/src/highlight` vira
  família com binding: recebe `ranges` ou um `matcher` substituível, preserva o
  texto original e diacríticos, não injeta HTML e não marca quando a query é
  vazia. `combobox`, `select`, `listbox` e `menu` passam a usar a família no
  lugar da folha. Motor: `@slotted/core/highlight` com a normalização que
  `typeahead` já faz.

  Entregue em 2026-09-16. Inventário em
  `docs/history/designs/2026-09-16-highlight-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-16-highlight-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-16-highlight-self-assessment.md`. A raiz é
  o elemento que segura o texto e a marca é `[data-part='match']` dentro dela;
  todas as ocorrências por padrão (`occurrences`); `current` para localizar
  na página, pintado com o par sólido do acento; `disabled` próprio ou herdado.
  `@slotted/core/highlight` tem `findMatch`, `matchRanges`, `normalizeRanges`,
  `splitRanges` e `highlightRuns`; `collection/filter` importa o scan daqui.
  Migraram `combobox`, `select`, `multi-select` e `command-palette` nos dois
  bindings e `listbox` deixou de importar a folha. `menu` e `tree` ficam
  registrados acima.

- `aspect-ratio image` — uma sessão: `aspect-ratio` reserva proporção antes da
  mídia carregar e não corta; `image` compõe sobre ela com `src`/`srcset`,
  `alt`, `fit`, `position`, `loading`, fallback e estado de erro. Zoom e
  pré-visualização são capacidade separada (`dialog`). `avatar` e `upload`
  passam a ler `image` quando forem reabertos; não muda nada nesta sessão.

  Entregue em 2026-09-16. Inventário em
  `docs/history/designs/2026-09-16-aspect-ratio-image-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-16-aspect-ratio-image-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-16-aspect-ratio-image-self-assessment.md`.
  `aspect-ratio` é `aspect-ratio` nativo com cinco nomes (`square`,
  `landscape`, `portrait`, `video`, `wide`) e número ou par; a moldura cresce
  quando o conteúdo não cabe e ajusta filho substituído com `contain`. `image`
  renderiza a raiz de `aspect-ratio` dentro da sua quando há `ratio`; três
  layouts (`intrinsic`, `fill`, `framed`); `status` derivado sem modelo;
  `fallbackSrc` antes de `error`; `sources` para `<picture>`; glifo novo
  `--slotted-icon-image-off`. `card` lê `image` na sua parte `media` quando
  for reaberto.

- `stat-card sparkline` — uma sessão: `stat-card` com rótulo, valor, unidade,
  delta, período, tendência, comparação, status e ação de detalhe; o tom deriva
  da semântica da métrica e não do sinal matemático (`goodWhen: up | down`).
  `sparkline` é a tendência compacta dentro do card e da célula de tabela:
  `data`, `line | bar`, referência, tom e descrição textual do último valor e
  da tendência. Sem eixos interativos. `loading` e erro preservam o layout por
  `skeleton`. É o primeiro SVG desenhado pela biblioteca; a paleta de dados
  é uma escala nova da camada semântica.
  Entregue em 2026-09-16. Inventário em
  `docs/history/designs/2026-09-16-stat-card-sparkline-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-16-stat-card-sparkline-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-16-stat-card-sparkline-self-assessment.md`.
  A escala `--slotted-data-1…8` (semântica, ordem fixa medida nos três
  esquemas), os passos `4xl` e o glifo `trending-up` entraram na fundação.
  `sparkline`: oito partes, `type`, `size`, `curve`, `tone`, `series`,
  `reference`, `min`/`max`, descrição gerada e localizada; geometria em
  `@slotted/core/sparkline`, medida por `ResizeObserver`, marcador e anel como
  traços de comprimento zero. `stat-card`: quinze partes, `goodWhen` que
  deriva o tom do delta e o entrega ao `trend`, `fill` com `plain`, `layout`,
  `status` com `message`, `loading` por `skeleton`, piso de 10 rem, grelha que
  nivela filas. Sem estado mutável em nenhuma das duas.
- `table-of-contents` — links para headings com estado ativo por
  `IntersectionObserver`, offset de rolagem lido de `--slotted-page-sticky-top`,
  atualização de URL opcional. Foco após navegação; reduced motion respeitado.
  Em tela estreita colapsa em `select` ou `popover`. Responde à capacidade que
  `page` adiou (inventário, l. 154).

  Entregue em 2026-09-17. Inventário em
  `docs/history/designs/2026-09-16-table-of-contents-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-16-table-of-contents-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-17-table-of-contents-self-assessment.md`.
  Doze partes, três layouts (`vertical`, `horizontal` para a vaga `tabs` de
  `page-header`, `collapsed` com gatilho e camada por `dismissable-layer`),
  `items`, `source` (headings lidos por `@slotted/core/outline`, `id` escrito
  nos que não têm), `sticky`, `history` (`push`, `replace`, `none`),
  `numbered`, `levels`, `offset`, `loading`, vazio escondido. Modelos `current`
  (`value`, razões `scroll`, `pointer`, `keyboard`, `programmatic`) e `open`.
  `@slotted/core/scroll-spy`: corrente por geometria com `IntersectionObserver`
  e `scroll` coalescido, último alvo no fim do rolador, primeiro no início;
  `landOn` lê `--slotted-page-sticky-top` do rolador e soma a
  `scroll-margin` menor do que a chrome; `focusTarget`. A rolagem é conduzida
  pela família e a URL escrita por `history.pushState`/`replaceState`: `:target`
  e `hashchange` não respondem. O colapso é uma camada em fluxo sob o gatilho,
  sem `select`. Duas reaberturas ficam registradas acima: `prose`
  (`scroll-margin` com a chrome) e os ponteiros `anchor-nav` de `page-header` e
  `section`. Defeito partilhado corrigido: a tabela de API do workbench
  chaveava linhas pelo nome e perdia a segunda de duas props homónimas em
  partes diferentes.

- `selection-toolbar` — aparece quando existe seleção: contagem, select-all do
  conjunto filtrado, limpar, ações permitidas. Distingue "itens desta página" de
  "todos os resultados"; ação destrutiva confirma o escopo por `alert-dialog`.
  Compõe `toolbar` e `action-bar`; lê a seleção de `table`, `data-grid`,
  `listbox` ou `tree` por um modelo comum de `@slotted/core/collection`.
- `column-manager` — lista pesquisável de colunas com visibilidade, ordem, fixar
  e restaurar; impede ocultar coluna obrigatória. Aplica ao vivo ou em
  confirmação, política única por instância. Preferências serializáveis e
  versionadas. Edita o modelo de colunas de `data-grid` e de `table`; abre em
  `popover` ou `drawer`. Reordenar por `@slotted/core/drag` e teclado.

  Entregue em 2026-09-23 com `saved-views` (vistas nomeadas sobre `GridView`) e
  as extensões de `data-grid` (ajuda por coluna, prioridade responsiva,
  densidade por grelha, ajustar todas, anúncio ao ocultar). Decisões em
  `docs/history/designs/2026-09-23-column-management-design.md`. Serve só a
  `data-grid`: a reabertura de `table` está na tabela acima.

  Em 2026-09-23 a prioridade responsiva passou a pop-in: a coluna que não cabe
  entra na linha como par rótulo/valor em vez de ser descartada. Decisões em
  `docs/history/designs/2026-09-23-narrow-layout-design.md`.

- `data-list` — o recipe responsivo de um conjunto tabular pequeno quando a
  tabela não cabe: cada item mostra rótulos e valores prioritários. Mantém
  ordenação, filtros e seleção do modelo de dados; não oferece navegação de
  grelha. Compõe `list-item` e `description-list`; `table` sob `wrap` continua
  a resposta para conjuntos que cabem. Uma coleção tabular em `data-grid` já
  não precisa dela em telefone: o pop-in do `data-grid` cobre esse caso.

  Entregue em 2026-09-24. Lê `GridColumn` e `GridQuery` de `@slotted/core/grid`
  e compõe `list` e `list-item`; os pares usam a geometria do pop-in de
  `data-grid` em vez de `description-list`. Decisões em
  `docs/history/designs/2026-09-24-data-list-design.md`.

## Onda 11 — Extended de custo médio

Cada família traz um modelo próprio ou um adaptador de dados. Nenhuma depende
de outra da mesma onda.

| Invocação             | Modo | Guia |
| --------------------- | ---- | ---- |
| `transfer`            | novo | 11   |
| `entity-picker`       | novo | 11   |
| `hierarchical-picker` | novo | 6    |
| `master-detail`       | novo | 4    |
| `dashboard-grid`      | novo | 4    |
| `wizard`              | novo | 15   |
| `detail-panel`        | novo | 15   |
| `notification-center` | novo | 15   |
| `markdown`            | novo | 10   |
| `tour`                | novo | 7    |
| `action-sheet`        | novo | 8    |
| `fullscreen`          | novo | 8    |

### Escopo por família — onda 11

- `transfer` — dois `listbox` com busca, contagens, seleção em massa,
  `disabled` e ordem opcional. Contrato: `sourceItems`, `targetKeys`,
  `selectedKeys` por painel e um evento de movimento com direção e razão. Em
  tela estreita vira duas etapas. As ações têm rótulo além da seta.

  Entregue em 2026-09-24. Inventário e decisões em
  `docs/history/designs/2026-09-24-transfer-design.md`, autoavaliação em
  `docs/history/designs/2026-09-24-transfer-self-assessment.md`. `items` substitui
  `sourceItems` (a coleção desenha os dois lados); `selectedKeys` é um conjunto e cada
  painel lê a sua interseção. Aritmética em `@slotted/core/transfer`.

- `entity-picker` — `combobox` orientado a entidades remotas: busca, resultado
  rico (`avatar`, identificadores suficientes para desambiguar), filtros,
  criação opcional, recentes e favoritos, seleção simples ou múltipla. O valor
  público é o ID ou o objeto normalizado; query, paginação e resolução de IDs
  são adaptadores.

  Entregue em 2026-09-24. Inventário e decisões em
  `docs/history/designs/2026-09-24-entity-picker-design.md`, autoavaliação em
  `docs/history/designs/2026-09-24-entity-picker-self-assessment.md`. Implementação própria
  (não compõe `combobox` nem `multi-select`) sobre `@slotted/core/entity-picker`: busca com
  atraso e cancelamento, cache por id, resolução em lote, secções `chosen`/`favorites`/
  `recent`/resultados e decisão de tecla. O campo fica numa linha num formulário (gate
  visual): `overflow` `collapse` (omissão, chip "+N") | `wrap`, âmbito como `select` colado à
  frente. React `EntityPicker` (`source` ou `items`, `onCreate`, `renderOption`,
  `renderChip`); Angular `sl-entity-picker` (`[createEntity]`, templates de opção e de chip,
  `ControlValueAccessor` + `Validator` com `unresolved`).

- `hierarchical-picker` — seleção em árvore ou cascata sem expor `tree` +
  `select`. Nós com `id`, `parent`/`children`, carregamento preguiçoso, seleção
  de folha ou ancestral, caminho visível e busca. TreeSelect e Cascader são dois
  recipes do mesmo núcleo. Em tela estreita navega por níveis.

  Entregue em 2026-10-01 como `cascader`, que cumpre este âmbito inteiro: o eixo
  `layout` (`auto`, `columns`, `drill`, `tree`) é o recipe e o núcleo
  `@slotted/core/cascader` é um só. Inventário e decisões em
  `docs/history/designs/2026-09-30-cascader-design.md`, autoavaliação em
  `docs/history/designs/2026-10-01-cascader-self-assessment.md`. React `Cascader` e
  `CascaderPanel`; Angular `sl-cascader` (`ControlValueAccessor` + `Validator`) e
  `sl-cascader-panel`.
- `master-detail` — coordena lista ou grelha e detalhe: seleção por URL ou ID,
  estado vazio e retorno de foco. Desktop usa painéis (`splitter`); tela
  estreita usa navegação ou `drawer` com retorno previsível. O detalhe preserva
  contexto e posição da lista.
- `dashboard-grid` — layout responsivo de widgets com tamanho mínimo,
  reordenação e redimensionamento opcionais por `@slotted/core/drag` e teclado,
  persistência e modo de edição explícito. Cada widget é um `card` com heading,
  estados vazio/erro/carregando e ação de detalhe.

  Entregue em 2026-09-24. Inventário e decisões em
  `docs/history/designs/2026-09-24-dashboard-grid-design.md`, autoavaliação em
  `docs/history/designs/2026-09-24-dashboard-grid-self-assessment.md`. O layout é uma lista
  ordenada `{ key, columns, rows, hidden? }` que serve as três classes de tamanho do próprio
  contentor (600, 1024); sem `x`/`y`. Modelos `layout` e `editing`; capacidades e estado
  `editing` novos no schema; glifo `--slotted-icon-resize`. Aritmética em
  `@slotted/core/dashboard-grid`. React `DashboardGrid` + `DashboardWidget`
  (`usePersistedDashboardLayout`); Angular `[slDashboardGrid]` + `sl-dashboard-widget`
  (conteúdo em templates, à maneira de `mat-tab`; `persistedDashboardLayout`).

- `wizard` — etapas com dados acumulados, validação por etapa, voltar/avançar/
  enviar, rascunho, retomada e erro global. O estado vive fora de `stepper`,
  que só o desenha. Navegação direta depende de etapas concluídas; URL, reload
  e recuperação são políticas declaradas.

  Entregue em 2026-09-25. Inventário e decisões em
  `docs/history/designs/2026-09-25-wizard-design.md`, autoavaliação em
  `docs/history/designs/2026-09-25-wizard-self-assessment.md`. Cada etapa é um `form` de
  `form`; o valor são as respostas aceites por `name` de etapa; as etapas são as que o
  consumidor renderiza, e o destino depois de aceitar uma etapa decide-se depois do render
  dele. Aritmética e rascunho em `@slotted/core/wizard` (`storagePersistence`). React
  `Wizard`, `WizardStep`, `WizardEdit`, `WizardComplete`, ações em `Button`; Angular
  `[slWizard]`, `ng-template[slWizardStep]`, `form[slWizardForm]` do consumidor.

- `detail-panel` — resumo, metadados, status, `tabs` ou seções, ações e
  histórico (`timeline`). Abre em página, `drawer` ou `master-detail` conforme
  a profundidade; URL e foco tornam a abertura compartilhável e reversível. Não
  hospeda fluxo longo de edição.

  Entregue em 2026-09-17. Inventário em
  `docs/history/designs/2026-09-17-detail-panel-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-17-detail-panel-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-17-detail-panel-self-assessment.md`. Um
  `article` cujo topo é `page-header` sem invólucro; partes `root`, `body`,
  `banner`, `columns`, `main`, `section`, `section-actions`, `aside`,
  `message`, `footer`. Eixos `layout` (`stacked` | `tabs`), `aside` (`end` |
  `start` | `none`), `level`, `size`, `scroll` (`ancestor` | `self`), `mount`,
  `status` (`ready` | `not-found` | `error`); estado `loading`; modelo `current`
  (`section` / `defaultSection` / `onSectionChange` com `pointer`, `keyboard`,
  `programmatic`). A faixa é `tabs` só com a lista, no slot do cabeçalho; as
  secções são os tabpanels ligados por id (o injector do Angular é a razão). O
  painel fornece os defaults de `page-header` (`level`, `size`) à sua
  subárvore; `recordKey` muda e o foco vai ao heading. Sem `close` (drawer),
  sem aside fixo ou escondido; scroll-spy diferido a `table-of-contents`.
  React: `DetailPanel` (`footer`), `DetailPanelBody` (`banner`, `aside`,
  `message`), `DetailPanelSection`, `DetailPanelTabs`. Angular:
  `[slDetailPanel]`, `[slDetailPanelBody]`, `ng-template[slDetailPanelSection]`,
  `[slDetailPanelTabs]` (host directive `slPageHeaderTabs`),
  `aside[slDetailPanelAside]`, `[slDetailPanelBanner]`, `[slDetailPanelMessage]`,
  `footer[slDetailPanelFooter]`.

- `notification-center` — lista persistente com lido/não lido, grupos, filtros,
  marcar tudo, ações e paginação incremental. `badge`, `popover` e página
  completa compartilham o modelo; atualizações ao vivo não roubam foco nem
  reordenam enquanto o leitor lê (a parte `fresh` de `timeline`).

  Entregue em 2026-09-18. Inventário em
  `docs/history/designs/2026-09-17-notification-center-capability-inventory.md`,
  decisões em `docs/history/designs/2026-09-17-notification-center-design.md`,
  autoavaliação em
  `docs/history/designs/2026-09-17-notification-center-self-assessment.md`.
  Uma `section` (região nomeada pelo próprio título) com o Feed da APG por
  dentro; partes `root`, `header`, `title`, `count`, `mark-all`, `actions`,
  `views`, `fresh`, `feed`, `group`, `group-label`, `item`, `visual`,
  `content`, `description`, `time`, `controls`, `read-toggle`, `dismiss`,
  `more`, `empty`, `footer`. Eixos `size` (`sm` | `md`), `level` (2–4),
  `growing` (`none` | `button` | `scroll`), `arrivals` (`hold` | `show`),
  `timeFormat`, `controls` (`both` | `read` | `dismiss` | `none`), `tone` por
  item; estados `read` (novo no vocabulário, 24cfc95) e `loading`; modelo
  `current` (`view` / `defaultView` / `onViewChange`, vistas embutidas `all` e
  `unread`). A família não guarda factos: `onReadChange({ keys, read })`,
  `onRemove`, `onOpen` (cancelável antes da navegação), `onReveal`,
  `onLoadMore` pedem com razão e a loja responde pelo array; `onUnreadChange`
  é facto para o sino. Chegadas ficam retidas atrás de `fresh` enquanto o foco
  está no feed ou o scroller passou do início. Não lida é o lavado na
  tonalidade e o título semibold — quatro marcas recusadas na porta visual; um
  item com tonalidade e sem visual recebe o glifo da tonalidade num círculo
  (triângulos recusados na biblioteca inteira, ver briefing). `sm` declara
  largura mínima de 22rem para o popover. A faixa é `tabs` só com a lista e o
  feed como painel único: `Tab` ganhou `controls` nos dois bindings. Sem
  `badge` (a contagem é chip próprio), sem sino (`top-navigation`), sem
  abrir/fechar (`popover`), sem seleção em massa (`selection-toolbar`), sem
  grupos colapsáveis. React: `NotificationCenter` (`items`, `renderItem`,
  `actions`, `footer`, `empty`, `groupBy`, `ref` com `focus`/`reveal`/
  `markAllRead`). Angular: `section[slNotificationCenter]`, `[(view)]`,
  `ng-template[slNotificationItem | slNotificationVisual |
slNotificationActions]`, `[slNotificationCenterActions | Footer | Empty]`,
  `provideNotificationCenterDefaults()`. Correção partilhada: o workbench
  endereçava todo `h2` da página de referência e alcançava o título da
  família; a regra passou a `.slotted-reference-page__section > h2`.

- `markdown` — renderização com allowlist de elementos e URLs, headings com IDs
  estáveis, links externos, tabelas, código por `code-block`, conteúdo vazio e
  erro. Sanitização obrigatória; plugins opt-in. A tipografia é `prose`. O
  parser é um adaptador: a família recebe uma árvore e nunca HTML, como
  `code-block` recebe tokens.

  Entregue em 2026-09-24. Inventário e decisões em
  `docs/history/designs/2026-09-24-markdown-design.md`, autoavaliação em
  `docs/history/designs/2026-09-24-markdown-self-assessment.md`. A entrada é
  mdast por forma (a saída do remark passa sem conversão; `fromMarkedTokens`
  mapeia o lexer do marked) e `prepareMarkdown` em `@slotted/core/markdown`
  decide tudo o que não é elemento: tipos permitidos (`allow`, sem `html`),
  política de URL (`transformUrl`; links http, https, mailto, tel e relativos,
  imagens http, https e relativos), ids pelo github-slugger com `idPrefix`,
  notas numeradas pela primeira referência, alertas `> [!NOTE]` em `alert`
  (`live="off"`), metadados da cerca (`title="…"`, `{1,4-6}`,
  `showLineNumbers`) para `code-block`, tabelas com alinhamento lógico.
  `completeMarkdown` fecha uma fonte cortada durante o streaming. Sem modelo de
  estado: tarefas e repetir são pedidos com razão. Partes `root`, `embed`,
  `alert-body`, `task-list`, `task`, `task-body`, `backref`, `empty`, `error`,
  em volta da região de `prose`. React `Markdown` (`renderers`, `extensions`,
  `onTaskChange`, `onRetry`); Angular `[slMarkdown]`
  (`ng-template[slMarkdownNode]`, `[slMarkdownChildren]`, `[slMarkdownEmpty]`,
  `editableTasks`, `retryable`).

- `tour` — etapas com âncora, título, conteúdo, placement, progresso,
  próximo/anterior/pular e condição de disponibilidade. Move o foco só quando
  apropriado, tem alternativa sem spotlight e recupera de âncora ausente.
  Persistência e versionamento são do produto. Compõe `popover` e `dialog`.

  Entregue em 2026-09-24. Inventário e decisões em
  `docs/history/designs/2026-09-24-tour-design.md`, autoavaliação em
  `docs/history/designs/2026-09-24-tour-self-assessment.md`. Compõe os módulos de core de
  `popover` e `dialog`, não as famílias (`popover` não ancora num alvo externo). Navegação em
  `@slotted/core/tour`; `dismissable-layer.raise()`, `portal.raise()` e `focus-scope` passam a
  servir uma camada que volta ao topo sobre um diálogo aberto a meio do tour.

- `action-sheet` — variante de `menu` para toque: ações curtas, cancelamento
  explícito, safe area, modal opcional. Compõe `drawer` com `side="bottom"`.
  Não duplica `dialog` com formulário.

  Entregue em 2026-09-24. Inventário e decisões em
  `docs/history/designs/2026-09-24-action-sheet-design.md`, autoavaliação em
  `docs/history/designs/2026-09-24-action-sheet-self-assessment.md`. Diálogo que contém um
  `menu`; compõe os módulos de `drawer` (`portal`, `dismissable-layer`, `presence`, `focus`)
  em vez das suas partes, e a recomposição sobre `drawer` está nas reaberturas. React
  `ActionSheet` e partes; Angular `sl-action-sheet` e `SL_ACTION_SHEET`.

- `fullscreen` — pede e sai de fullscreen nativo, expõe estado e erro, restaura
  o contexto; rótulo e ícone acompanham o estado. Fallback "expandir no layout"
  quando a API não existe. Nunca bloqueia Escape do navegador. Motor:
  `@slotted/core/fullscreen`.

  Entregue em 2026-09-24. Inventário e decisões em
  `docs/history/designs/2026-09-24-fullscreen-design.md`, autoavaliação em
  `docs/history/designs/2026-09-24-fullscreen-self-assessment.md`. `mode` é
  `auto | layout`: a recusa da API entra em `layout` e emite o erro. Correção
  partilhada: a raiz de `@slotted/core/portal` segue o elemento em tela cheia.

## Onda 12 — Extended de custo alto

Cada família traz um subsistema. Uma sessão por família.

| Invocação              | Modo | Guia |
| ---------------------- | ---- | ---- |
| `chart`                | novo | 13   |
| `event-calendar`       | novo | 16   |
| `audit-log`            | novo | 15   |
| `workflow-tracker`     | novo | 15   |
| `import-export-center` | novo | 15   |
| `search-results`       | novo | 15   |

### Escopo por família — onda 12

- `chart` — o sistema de gráficos da seção 13 do guia: tipos base (linha, barra,
  área, pizza/donut, dispersão), eixos, legendas, tooltip, seleção, zoom,
  estados vazio/erro/carregando, tabela de dados equivalente e descrição
  textual. A paleta de dados é a escala que `sparkline` abriu na onda 10. O
  motor de desenho é um adaptador; o contrato de dados e a acessibilidade são
  da família.
- `event-calendar` — vistas mês/semana/dia/lista, fuso horário, eventos,
  dia inteiro, recorrência, navegação temporal, filtros e abertura de detalhe.
  Não deriva de `date-picker`; reutiliza `@slotted/core/date` e a grelha de
  `calendar` só na vista de mês. Eventos sobrepostos e DST têm política
  declarada. Tela estreita prioriza a vista de lista.
- `audit-log` — evento imutável com ator, ação, alvo, timestamp com fuso,
  origem e diff acessível com versão textual. Busca, filtro e exportação são
  adaptadores. Compõe `timeline`, `table` e `filter-bar`.
- `workflow-tracker` — etapas atuais, concluídas e bloqueadas, responsáveis,
  prazos, transições e histórico. Visão de progresso, não editor de workflow;
  ação inválida explica a pré-condição. `stepper` e `timeline` são os recipes
  visuais.
- `import-export-center` — jobs com tipo, arquivo, progresso, status, erros por
  linha, cancelar/repetir e download do resultado. A operação continua fora da
  página; `toast` aponta para o job. Compõe `upload`, `progress-indicator`,
  `table` e `result-state`.

  Entregue em 2026-09-25. Inventário e decisões em
  `docs/history/designs/2026-09-25-import-export-center-design.md`, autoavaliação em
  `docs/history/designs/2026-09-25-import-export-center-self-assessment.md`. Cinco estados
  (`queued`, `running`, `succeeded`, `failed`, `canceled`) e o desfecho `partial` derivado das
  contagens; controlos por estado, disponibilidade dos arquivos (prazo, permissão), texto do
  progresso, estimativa de tempo, transições, avisos e destino do foco em
  `@slotted/core/import-export-center`. Modelos `current` (vista) e `open` (detalhes). A partir de
  42rem a lista é uma grelha e cada job uma subgrelha. `upload` entra pelo diálogo de importação no
  slot `actions`, não no cabeçalho. React `ImportExportCenter` e `useJobToasts`; Angular
  `section[slImportExportCenter]`, `[(view)]`, `[(expanded)]` e `jobToasts`.

- `search-results` — query, escopo, filtros, ordenação, facets, sugestões,
  resultados com `highlight`, paginação ou carga contínua e estados sem
  resultado e erro. Mantém URL e foco; anuncia a contagem; oferece correção da
  query sem substituir silenciosamente. Compõe `filter-bar`, `list`,
  `pagination` e `result-state`.

## Fora do passe 2 — Specialized

Vinte e cinco famílias do guia marcadas `[Specialized]`: `floating-action-button`,
`color-picker`, `rating`, `navigation-rail`, `floating-window`, `tree-grid`,
`pivot-grid`, `spreadsheet`, `gauge`, `map`, `diagram`, `carousel`,
`rich-text-editor`, `code-editor`, `document-viewer`, `media-player`,
`barcode`, `permission-matrix`, `resource-scheduler`, `kanban`, `gantt`,
`org-chart`, `ai-conversation`, `prompt-composer`, `speech-input`. Entram por
decisão de produto, uma por vez, com escopo escrito aqui antes da invocação.
Duas já têm capacidade adiada para elas por escrito: `floating-window` (arrasto
e redimensionamento de `dialog`) e `gauge` (arco de `progress-indicator`).

- `carousel` — invocada em 2026-10-01 com "e coisas do tipo": slideshow, trilho de cartões, galeria
  com miniaturas e rotação são uma família com um membro, `data-ui="carousel"`. Viewport nativo com
  scroll-snap (toque, trackpad e teclado do browser), páginas medidas das caixas dos slides
  (`slidesPerView` escreve `--slotted-carousel-slides-per-view`, `slidesPerMove` número ou `page`,
  piso `--slotted-carousel-slide-min-size`), `align` `start`/`center`, `orientation`,
  `transition` `slide`/`fade`, `arrows` `inset`/`outside`, `size`; `loop` sem clones; arrasto com
  rato; clique num slide que espreita. Partes `viewport`, `slide`, `previous`, `next`, `controls`
  (`below`/`overlay`), `autoplay`, `indicators` (`dots`/`line`/`thumbnails`, pontos adaptativos a partir
  de oito páginas), `indicator`, `counter`. Estados `page`/`defaultPage`/`onPageChange` e
  `playing`/`defaultPlaying`/`onPlayingChange` (capacidade nova `playback`); rotação do APG: nunca por
  omissão, não arranca com movimento reduzido, pausa no hover e com o separador escondido, pára no
  foco de teclado, tempo no indicador atual por `--slotted-carousel-autoplay-delay`. Comportamento em
  `@slotted/core/carousel`. React `Carousel` e partes, `CarouselDefaultsProvider`, `handleRef`;
  Angular `section[slCarousel]` com `[(page)]`, `[(playing)]`, `exportAs`, `slCarouselIndicatorTemplate`,
  `provideCarouselDefaults()`. `marquee` recusado (movimento decorativo). Desenho em
  `docs/history/designs/2026-10-01-carousel-design.md`.
- `rating` — invocada em 2026-09-25, revista em 2026-09-28. Três membros sob `data-ui="rating"`:
  `rating`, um `radiogroup` de rádios nativos (um por valor, dois por símbolo com `step` 0,5), com
  `value`/`defaultValue`/`onValueChange` e razões `pointer`, `keyboard`, `clear`, `clearable`,
  `readOnly`, `disabled`, `required`, `invalid`, pré-visualização por `:hover`, arrasto por toque e
  evento `onPreviewChange`; `ratingDisplay`, `role="img"`, frações livres por
  `--slotted-rating-fill`, partes `value` e `count`, variantes `compact` e `histogram`; `ratingSummary`,
  `bars` ou `spectrum` (média, intervalo de 95% e conclusão de `summariseRatings`), agregado e
  distribuição por nível com `selectedLevels`/`defaultSelectedLevels`/`onSelectedLevelsChange`.
  Setas sem volta ao início, `Home`/`End`, `Backspace`/`Delete` limpam. `size` `sm`/`md`/`lg` fora
  da densidade; `tone` sem `secondary`; aresta de esquema `--slotted-rating-edge`. Comportamento em
  `@slotted/core/rating`. React `Rating`, `RatingDisplay`, `RatingSummary`, `RatingProvider`;
  Angular `div[slRating]` com `ControlValueAccessor`, `div[slRatingDisplay]`,
  `section[slRatingSummary]`, `provideRating()`. Desenho em
  `docs/history/designs/2026-09-25-rating-design.md`.

- `attachment` — invocada em 2026-09-30, adiada pelo dossiê ReUI do `upload` (secção 6). Ficheiro
  que já pertence a uma mensagem, um registo ou uma bandeja: um membro sob `data-ui="attachment"`,
  com o conjunto como parte `group` (`ul`, `layout` `list`/`grid`/`strip`). Partes `preview` (azulejo
  da escala `--slotted-upload-kind-*` ou miniatura com recuo ao azulejo), `body`, `trigger` (`a` ou
  `button` esticado sobre a raiz), `filename`/`name`/`extension`, `detail`, `message`, `progress`
  (`ProgressBar`), `actions`, `action`, `remove`. Estados `invalid`, `loading`, `disabled`; `size`
  `sm`/`md`/`lg`, `orientation` `horizontal`/`vertical`. Remoção é pedido sem valor (`remove`,
  `keyboard`), com `Backspace`/`Delete` e foco por `removal-focus`. React `Attachment`,
  `AttachmentGroup` e partes, `AttachmentDefaultsProvider`; Angular `[slAttachment]`,
  `[slAttachmentGroup]`, `provideAttachmentDefaults()`. Desenho em
  `docs/history/designs/2026-09-30-attachment-design.md`, autoavaliação em
  `docs/history/designs/2026-09-30-attachment-self-assessment.md`. Saída animada de um anexo
  removido fica aberta, como a da linha do `upload`.

- `message` — invocada em 2026-09-30 pelo `/reui build` de mensagem, bolha e scroller. Dois membros
  sob `data-ui="message"`: `message` (`article` com `group`, `avatar`, `body`, `header`, `author`,
  `time`, `footer`, `receipt`, `actions`, `activity`, `activity-step`, `versions`) e `bubble` (raiz
  `data-part="bubble"`, com `content`, `meta`, `quote`, `more`, `stream`, `stream-chunk`, `caret`,
  `typing`, `retry`,
  `reactions`, `reaction`). `align` `start`/`end`, `layout` `bubble`/`thread`, `status`
  `sending`/`sent`/`delivered`/`read`/`failed`/`streaming`; `variant` `solid`/`soft`/`outline`/`plain`
  × `tone`, inferida pela linha quando omitida. Estados `current` (versões), `pressed` (reação),
  `revealed` (`maxLines`), com razão. Glifo `check-check` acrescentado à escala. React `Message`,
  `MessageGroup`, `Bubble` e partes, `MessageDefaultsProvider`; Angular `[slMessage]`,
  `[slMessageGroup]`, `[slBubble]` e partes, `provideMessageDefaults()`. Desenho em
  `docs/history/designs/2026-09-30-message-design.md`, dossiê em
  `docs/history/designs/2026-09-30-message-reui-dossier.md`, autoavaliação em
  `docs/history/designs/2026-09-30-message-self-assessment.md`. Saída animada de uma mensagem
  removida fica aberta. Texto em streaming entra palavra a palavra por `@slotted/core/text-stream`
  (revisão de 2026-10-01).

- `message-scroller` — invocada com `message`. Região focável à volta de um `log`: `root`,
  `viewport`, `content`, `item`, `separator` (fixo enquanto o dia está à vista), `unread`, `loader`,
  `jump`, `jump-count`. Sem valor mutável: eventos `reachStart`, `anchorChange`, `scrollableChange`
  com razão; comandos `scrollToMessage` (com destaque `data-current`), `scrollToEnd`,
  `scrollToStart`, `focus`. `follow`, `defaultPosition` `start`/`end`/`last-anchor`, `peek`,
  `scrollMargin`, `preserveOnPrepend`, `busy` anunciado pelo `live-announcer`. Motor em
  `@slotted/core/message-scroller` com `overflow-anchor: none` e referência restaurada pelo próprio
  motor. React `MessageScroller` com `ref` e partes; Angular `[slMessageScroller]` com `exportAs`.
  Desenho e autoavaliação partilhados com `message`.

- `prompt-composer` — invocada em 2026-09-30 pelo pedido das entradas (fila, item 2). Moldura de
  várias linhas sob `data-ui="prompt-composer"`: `root` (`form`), `header`, `input` (`textarea`
  com `field-sizing: content`, `rows` piso e `maxRows` teto), `footer`, `action`, `attach`,
  `submit`. `value`/`defaultValue`/`onValueChange` com razões `keyboard` e `submit`;
  `onValueSubmit` cancelável; `submitOn` `enter`/`mod-enter` com guarda IME; `status`
  `ready`/`submitted`/`streaming`/`error` do consumidor, com envio a virar parar e `onStop`;
  `onAttach` por botão, colar e largar, validado por `selectFiles` de `@slotted/core/upload`;
  anexos desenhados pelo consumidor com `attachment`. React `PromptComposer` e partes,
  `PromptComposerDefaultsProvider`; Angular `form[slPromptComposer]`,
  `textarea[slPromptComposerInput]` com `ControlValueAccessor`, `providePromptComposerDefaults()`.
  Desenho em `docs/history/designs/2026-09-30-prompt-composer-design.md`.

- `color-picker` — invocada em 2026-10-01 pelo pedido das entradas (fila, item 3). Dois membros
  sob `data-ui="color-picker"`: `colorPicker` (área de saturação e brilho, canais `hue` e `alpha`,
  `swatch` e `previous`, texto do valor numa moldura de `text-field`, `format` por `menu`,
  `eyedropper` onde existe `EyeDropper`, `presets` em `radiogroup`, `contrast` contra
  `contrastWith`, `gamut`) e `colorField` (`text-field` com a amostra em `start` a abrir o painel
  num `popover`). Valor em string no formato atual (`hex`/`rgb`/`hsl`/`oklch`) com razões
  `pointer`, `keyboard`, `select`, `programmatic`; `format` com par próprio. Núcleo
  `@slotted/core/color`. React `ColorPicker` (partes por filhos) e `ColorField`; Angular
  `div[slColorPicker]` e `div[slColorField]` com `ControlValueAccessor`. Desenho em
  `docs/history/designs/2026-10-01-color-picker-design.md`.

## Regra de commit

Uma família por commit, `pnpm check` por família e `pnpm check:full` por onda.
Uma reabertura que muda um módulo de `packages/core` commita o módulo e os
consumidores tocados juntos, para que a árvore nunca tenha duas versões de um
vocabulário.
