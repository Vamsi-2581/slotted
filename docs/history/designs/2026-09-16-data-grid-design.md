# Desenho — `data-grid`

Decisões tomadas antes de a família ser escrita, a partir de
`docs/history/designs/2026-09-16-data-grid-capability-inventory.md`. A
família é nova. Cada decisão abaixo é a que o contrato, a folha de estilo, o
motor e as duas ligações são obrigados a cumprir; onde uma decisão custa
alguma coisa, o custo está escrito ao lado.

---

## 1. O que a família é

`docs/history/designs/2026-09-09-table-design.md` §1 traçou a linha: uma
tabela é uma estrutura estática e cada controlo dentro dela é uma paragem de
Tab; uma grelha é um widget composto com um cursor de célula, uma paragem de
Tab e setas entre células. Esta família é a segunda.

A segunda diferença é quem possui os dados. `table` recebe linhas como filhos
e reporta ordenação e filtro; esta família recebe `rows` e `columns` como
dados, possui o modelo e **aplica** a query: `createFilterGroupPredicate`,
`createSearchPredicate`, o comparador por tipo, o agrupamento e a página. Em
`mode="server"` reporta a query e desenha o que recebe, com o mesmo objeto.

Três consequências, decididas uma vez:

- **O DOM é `div` com papéis explícitos, não `table`.** Uma grelha virtualiza
  os dois eixos e redimensiona colunas ao vivo; `display: grid` com uma track
  por coluna dá as duas coisas a uma linha e `table-layout` não dá nenhuma. A
  APG admite as duas construções. O custo é escrever `role="grid"`, `row`,
  `columnheader`, `rowheader` e `gridcell` à mão, e é o contrato que os fixa.
- **A grelha possui a altura.** `table` rola de lado e nunca para cima; uma
  grelha virtualizada precisa de uma janela, e a janela é o `scroll`. O
  consumidor dá uma altura ao `root` (ou `--slotted-data-grid-block-size`);
  sem altura a grelha cresce até ao conteúdo, continua correcta e não
  virtualiza, porque a janela é o conjunto inteiro.
- **Uma query, um objeto.** `sort`, `filter`, `search`, `page` e `group` são
  campos de `GridQuery`; um servidor recebe um pedido, uma URL guarda um
  estado, uma vista guardada restaura um objeto. Modelos separados (MUI X:
  `sortModel`, `filterModel`, `paginationModel`) obrigam o consumidor a
  juntá-los antes de cada pedido e a escolher qual muda primeiro quando o
  filtro repõe a página a zero; aqui a grelha faz as duas coisas numa
  transição e o pedido diz o que mudou.

## 2. Padrão, com fonte

Lido em 16 de setembro de 2026 da página renderizada.

- Padrão: <https://www.w3.org/WAI/ARIA/apg/patterns/grid/>, secção "Data
  Grids For Presenting Tabular Information".
- Exemplos: <https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/>
  e <https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/advanced-data-grid/>.
- Prática: <https://www.w3.org/WAI/ARIA/apg/practices/grid-and-table-properties/>.

### 2.1 Teclado

A tabela do padrão, transcrita, e a resposta da família. `source: "pattern"`
é uma tecla do padrão; `"pattern-selection"` uma das "commonly used for these
functions"; `"pattern-inside"` uma da secção "Editing and Navigating Inside a
Cell"; `"departure"` uma tecla que o padrão não tem, com o custo em §9.

| Tecla                      | Padrão                                                                          | Família                                                                                                                      | Foco depois                          |
| -------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `Tab`                      | entra na grelha; uma só célula está na sequência                                | entra na célula `current` (a última visitada, ou a primeira célula do corpo); sai da grelha para o próximo controlo da página | a célula `current`, ou o widget dela |
| `ArrowRight`               | uma célula para a direita; na última, não se move                               | idem; espelhado em `dir="rtl"` (a seta anda no sentido visual)                                                               | a célula                             |
| `ArrowLeft`                | uma célula para a esquerda; na primeira, não se move                            | idem, espelhado                                                                                                              | a célula                             |
| `ArrowDown`                | uma célula para baixo; na última, não se move                                   | idem; do cabeçalho desce à linha de filtro (se existir) e depois ao corpo; monta a célula se estiver fora da janela virtual  | a célula                             |
| `ArrowUp`                  | uma célula para cima; na primeira, não se move                                  | idem; da primeira linha do corpo sobe à linha de filtro e ao cabeçalho                                                       | a célula                             |
| `PageDown`                 | desce um número de linhas definido pelo autor, rolando                          | desce uma vista (`floor(viewport / rowHeight)` linhas); na última linha não se move                                          | a célula                             |
| `PageUp`                   | sobe o mesmo                                                                    | idem                                                                                                                         | a célula                             |
| `Home`                     | primeira célula da linha                                                        | idem                                                                                                                         | a célula                             |
| `End`                      | última célula da linha                                                          | idem                                                                                                                         | a célula                             |
| `Ctrl+Home`                | primeira célula da primeira linha                                               | primeira célula da primeira linha **do corpo**; o cabeçalho alcança-se com `ArrowUp`                                          | a célula                             |
| `Ctrl+End`                 | última célula da última linha                                                   | idem, da última linha da query (monta-a se estiver fora da janela)                                                            | a célula                             |
| `Ctrl+Space`               | seleciona a coluna com o foco (`pattern-selection`)                             | em `selectionMode="range"`, seleciona o intervalo da coluna inteira; noutros modos, nada                                     | a célula                             |
| `Shift+Space`              | seleciona a linha com o foco; atalho da checkbox quando o foco não está nela    | em `single` e `multiple`, alterna a linha; em `range`, seleciona o intervalo da linha                                        | a célula                             |
| `Ctrl+A`                   | seleciona todas as células                                                      | em `multiple`, seleciona todas as linhas que a query deixou; em `range`, todas as células; noutros modos, nada               | a célula                             |
| `Shift+Arrow*`             | estende a seleção uma célula                                                    | em `range`, estende o intervalo a partir da âncora; em `multiple`, estende a seleção de linhas (`ArrowUp`/`ArrowDown`)      | a célula                             |
| `Enter`                    | desliga a navegação e entra na célula (editor, ou primeiro widget)              | célula editável: abre o editor; célula com widgets: foca o primeiro; célula de texto numa linha ativável: `onActivate`      | o editor ou o widget                 |
| `F2`                       | entra; um segundo `F2` restaura a navegação                                     | idem, sem confirmar nem cancelar: o segundo `F2` confirma o rascunho e volta à célula                                        | o editor, depois a célula            |
| tecla alfanumérica         | entra e coloca a tecla no editor                                                | célula editável de espécie `text`, `number`: abre o editor com a tecla como primeiro caractere                               | o editor                             |
| `Escape`                   | restaura a navegação                                                            | no editor: cancela o rascunho e volta à célula; num widget: volta à célula; com um intervalo: limpa-o; num arrasto: `drag` toma-o | a célula                             |
| `Enter` (no editor)        | pode restaurar a navegação ou mover para a célula vizinha                       | confirma e desce uma linha na mesma coluna (`editMode="cell"`); confirma a linha (`editMode="row"`)                         | a célula de baixo, ou a mesma        |
| `Tab` (no editor)          | —                                                                               | confirma e avança à próxima célula editável da linha; `Shift+Tab` recua; na última, confirma e fica                          | a próxima célula                     |
| `Space` (numa célula de seleção) | —                                                                         | alterna a checkbox da linha; `Shift+Space` estende da âncora                                                                 | a célula                             |
| `Enter`/`Space` (num `columnheader`) | —                                                                     | ordena (asc → desc → nada); `Shift+Enter` acrescenta à ordenação em vez de substituir; `Ctrl+Enter` abre o menu da coluna    | a célula                             |
| `Ctrl+Shift+ArrowLeft/Right` (num `columnheader`) | —                                                        | redimensiona a coluna um passo (`departure`, §9); anunciado                                                                   | a célula                             |
| `Ctrl+Shift+Enter` (num `columnheader`) | —                                                                  | ajusta a largura ao conteúdo visível (`departure`)                                                                           | a célula                             |
| `Alt+ArrowLeft/Right` (num `columnheader`) | —                                                               | move a coluna uma posição, por `drag.moveBy` (`departure`, decidida em `drag`)                                               | a célula                             |
| `ArrowRight`/`ArrowLeft` numa linha de grupo | —                                                             | abre / fecha o grupo, como em tree-grid; numa linha de detalhe expansível, o mesmo na célula do `expander`                   | a célula                             |
| `Ctrl+C`                   | —                                                                               | copia o intervalo (ou a célula corrente) como TSV para a área de transferência (`departure`)                                 | a célula                             |

### 2.2 Papéis, propriedades e estados

| Requisito                                                        | Quem satisfaz                     | Onde                                                                                                                                     |
| ---------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `grid` no contentor                                              | a família                         | `root`                                                                                                                                   |
| `row` em cada linha, dentro de `rowgroup`                        | a família                         | `head`, `body`, `summary` são `rowgroup`; `row`, `group-row`, `detail`, `filter-row` são `row`                                          |
| `columnheader`, `rowheader`, `gridcell`                          | a família                         | `column-header`; a coluna `rowHeader: true` desenha `rowheader`; o resto `gridcell`; `selection`, `expander-cell`, `filter-cell` são `gridcell` |
| nome acessível                                                   | o consumidor                      | `aria-label` ou `aria-labelledby` no `root`, exigidos pela tipagem (`label` \| `labelledBy`)                                             |
| descrição                                                        | o consumidor                      | `aria-describedby` passa intacto                                                                                                         |
| `aria-sort`                                                      | a família                         | no `columnheader` da **primeira** chave de ordenação; nas restantes, o índice visível e nenhuma propriedade (a prática diz que mais de um `aria-sort` é ambíguo) |
| `aria-selected`                                                  | a família                         | `true` na linha selecionada (`single`/`multiple`); nas células do intervalo (`range`)                                                    |
| `aria-multiselectable`                                           | a família                         | `true` no `root` em `multiple` e `range`                                                                                                 |
| `aria-readonly`                                                  | a família                         | `true` no `root` quando nenhuma coluna edita; `true` numa célula que não edita quando outras editam                                     |
| `aria-rowcount` / `aria-rowindex`                                | a família                         | sempre: a grelha virtualiza e o DOM nunca é o conjunto; `aria-rowcount` é o total da query (ou `-1` quando desconhecido), `aria-rowindex` conta o cabeçalho |
| `aria-colcount` / `aria-colindex`                                | a família                         | sempre: colunas escondidas e virtualizadas ficam fora do DOM; `aria-colcount` conta as colunas visíveis do modelo                       |
| `aria-colspan` / `aria-rowspan`                                  | a família                         | `aria-colspan` num grupo de cabeçalho e numa célula de detalhe ou de grupo                                                               |
| `aria-level`, `aria-expanded` numa linha de grupo                | a família                         | `group-row`                                                                                                                              |
| `aria-expanded`, `aria-controls` no `expander`                   | a família                         | Disclosure, como em `table`                                                                                                              |
| `aria-busy`                                                      | a família                         | `root` enquanto carrega sobre linhas já mostradas                                                                                        |
| `aria-invalid`, `aria-errormessage` numa célula em erro          | a família                         | a célula em edição cujo rascunho falhou a validação                                                                                      |
| `aria-describedby` com as instruções de arrasto                  | a família, por `drag`             | o `columnheader` de uma coluna reordenável                                                                                               |
| um só `tabindex="0"`                                             | a família                         | a célula `current` (ou o widget único dentro dela); `-1` nas restantes montadas                                                          |

### 2.3 Célula ou widget

As duas combinações óptimas do padrão ("Whether to Focus on a Cell Or an
Element Inside It"), aplicadas por regra e não por prop:

- uma célula cujo conteúdo é **um só** elemento focável sem setas — `a`,
  `button`, `input[type=checkbox]`, `[role=switch]`, `[role=button]` — recebe
  o foco nesse elemento. A regra lê o DOM da célula montada; `renderCell` que
  devolve um `link` obtém isto sem declarar nada;
- qualquer outra célula recebe o foco em si própria; `Enter`/`F2` entram e
  `Escape` sai. Dentro, `Tab` circula pelos widgets da célula e não sai dela
  (`focus-trap` de `@slotted/core/focus`).

## 3. Anatomia

| Parte             | Elemento | Papel               | Sempre | O que é                                                                                                         |
| ----------------- | -------- | ------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| `root`            | `div`    | `grid`              | sim    | a moldura e o widget: `data-ui`, todos os eixos, `aria-*` da grelha, o `--_template` das tracks                |
| `scroll`          | `div`    | —                   | sim    | o rolador dos dois eixos; a janela da virtualização                                                             |
| `head`            | `div`    | `rowgroup`          | sim    | o cabeçalho: uma linha por nível de grupo, a linha de colunas, a linha de filtro                                |
| `header-row`      | `div`    | `row`               | sim    | uma linha do cabeçalho                                                                                          |
| `column-group`    | `div`    | `columnheader`      | não    | o cabeçalho de um grupo de colunas; `aria-colspan`                                                              |
| `column-header`   | `div`    | `columnheader`      | sim    | o nome de uma coluna e os seus controlos; `aria-sort`, `data-sorted`, `data-sort-index`, `data-filtered`, `data-pinned`, `data-dragging` |
| `sort`            | `span`   | —                   | não    | o indicador de ordenação e o índice; o `columnheader` é o controlo, não um `button` dentro dele                 |
| `column-actions`  | `span`   | —                   | não    | o lugar dos controlos da coluna à aresta final: o gatilho do menu e o do filtro                                 |
| `column-menu`     | `button` | —                   | não    | abre o `menu` da coluna                                                                                          |
| `resizer`         | `div`    | —                   | não    | a alça de redimensionar na aresta final; `aria-hidden`, alvo de `--slotted-target-min`                          |
| `drop-indicator`  | `div`    | —                   | não    | a linha entre duas colunas enquanto uma é arrastada                                                             |
| `filter-row`      | `div`    | `row`               | não    | a linha de filtro sob o cabeçalho                                                                               |
| `filter-cell`     | `div`    | `gridcell`          | não    | uma célula da linha de filtro: o operando compacto e o operador                                                 |
| `filter`          | `button` | —                   | não    | o gatilho do painel de filtro no `column-actions`; `data-filtered`                                              |
| `filter-panel`    | `div`    | —                   | não    | o painel: condições, junção, acções                                                                             |
| `filter-condition`| `div`    | —                   | não    | uma linha `[operador] [operando]`                                                                               |
| `filter-operator` | `div`    | —                   | não    | o `select` compacto do operador; dentro do campo na linha de filtro                                             |
| `filter-operand`  | `div`    | —                   | não    | o controlo do operando; `data-kind`, `data-range`, `data-operand`                                               |
| `filter-join`     | `div`    | —                   | não    | `segmented-control` de duas palavras entre as condições                                                         |
| `filter-actions`  | `div`    | —                   | não    | Limpar e Aplicar, `size="sm"`                                                                                    |
| `body`            | `div`    | `rowgroup`          | sim    | as linhas; leva `padding-block-start` e `block-size` da janela virtual                                          |
| `row`             | `div`    | `row`               | sim    | um registo; `aria-rowindex`, `aria-selected`, `data-selected`, `data-current`, `data-expanded`, `data-editing`, `data-disabled` |
| `row-header`      | `div`    | `rowheader`         | não    | a célula que identifica o registo                                                                               |
| `cell`            | `div`    | `gridcell`          | sim    | um valor; `aria-colindex`, `data-align`, `data-numeric`, `data-text`, `data-pinned`, `data-current`, `data-in-range`, `data-editing`, `data-invalid`, `data-loading`, `data-readonly` |
| `editor`          | `div`    | —                   | não    | o controlo de edição dentro da célula, `plain` e `size="sm"`                                                    |
| `selection`       | `div`    | `gridcell`          | não    | a célula da checkbox, no cabeçalho e em cada linha; `--slotted-data-grid-selection-size` de largura           |
| `expander`        | `button` | —                   | não    | abre e fecha o detalhe de uma linha                                                                             |
| `detail`          | `div`    | `row`               | não    | o detalhe aberto: uma célula `aria-colspan` sobre todas as colunas                                              |
| `group-row`       | `div`    | `row`               | não    | uma linha de grupo: `aria-level`, `aria-expanded`, o valor, a contagem, os agregados                            |
| `group-toggle`    | `button` | —                   | não    | abre e fecha o grupo                                                                                             |
| `summary`         | `div`    | `rowgroup`          | não    | a linha de agregados, fixa ao fim                                                                               |
| `summary-cell`    | `div`    | `gridcell`          | não    | um agregado                                                                                                     |
| `empty`           | `div`    | —                   | não    | `result-state`: sem dados, sem resultados, erro                                                                 |
| `loader`          | `div`    | `rowgroup`          | não    | linhas de esqueleto na primeira carga                                                                            |
| `footer`          | `div`    | —                   | não    | a barra sob a grelha e dentro da moldura: `pagination`, contagem, "carregar mais"                               |
| `actions`         | `div`    | —                   | não    | as acções de linha dentro da célula `kind: 'actions'`, visíveis em hover e por foco                             |

Trinta e seis partes. As dez partes de filtro de `table` reduzem-se a nove:
`filter-search`, `filter-list`, `filter-option` e `filter-empty` desaparecem
porque a espécie `set` desenha um `multi-select` compacto (busca, lista,
contagem e vazio são dele), e `filter-cell` e `filter-row` entram.

### 3.1 Layout

Cada linha é `display: grid; grid-template-columns: var(--_template)`. O
`root` escreve `--_template` por script: uma track por coluna visível, na
ordem do estado, `<width>px` ou `minmax(<min>px, <flex>fr)`. Uma célula
escreve `grid-column: <índice>` explícito, porque com virtualização de colunas
faltam células no DOM e a colocação automática deslocá-las-ia.

Uma coluna fixa é `position: sticky` com `inset-inline-start` (ou `-end`)
igual à soma das larguras fixas antes dela, escrito por script na célula como
`--_pin-offset`. O cabeçalho é fixo ao topo com `--slotted-data-grid-sticky-offset`.
Uma célula que é as duas coisas leva os dois offsets e o degrau de
empilhamento mais alto. `isolation: isolate` no `root`, como em `table`.

Virtualização de linhas: o `body` tem `block-size: <total>px` e
`padding-block-start: <startOffset>px`; as linhas montadas seguem-se em
fluxo. Sem `transform`, para que `position: sticky` das colunas fixas resolva
contra o `scroll` sem um contentor intermédio. A altura de linha é lida da
primeira linha montada (`ResizeObserver`) e antes disso é `rowHeight`;
`rowHeight: 'auto'` mede cada linha e usa `createRowMetrics`.

Virtualização de colunas: `virtualWindow` sobre as larguras acumuladas das
colunas não fixas; as fixas ficam sempre montadas. Ligada por `virtualize`
(`'auto'` liga linhas acima de 100 e colunas acima de 20).

## 4. Modelos

### 4.1 Coluna

```ts
interface GridColumn<Row> {
  id: string;
  label: string;
  kind?: FilterKind | 'actions' | 'custom'; // text
  accessor?: keyof Row | ((row: Row) => unknown); // row[id]
  format?: (value: unknown, row: Row) => string;
  compare?: (a: unknown, b: unknown, rows: [Row, Row]) => number;
  align?: 'start' | 'center' | 'end';
  numeric?: boolean;
  text?: 'wrap' | 'truncate' | 'nowrap'; // truncate
  width?: number; minWidth?: number; maxWidth?: number; flex?: number;
  sortable?: boolean; // true
  filterable?: boolean; // true, false em actions/custom
  searchable?: boolean; // true
  editable?: boolean | ((row: Row) => boolean); // false
  resizable?: boolean; // true
  reorderable?: boolean; // true
  hideable?: boolean; // true
  rowHeader?: boolean;
  options?: readonly { value: string; label: string }[]; // set
  aggregate?: 'sum' | 'avg' | 'min' | 'max' | 'count' | ((values: unknown[]) => unknown);
  validate?: (value: unknown, row: Row) => string | null | Promise<string | null>;
  parse?: (draft: unknown) => unknown;
}
interface GridColumnGroup { id: string; label: string; columns: readonly string[] }
```

### 4.2 Estado de colunas — a capacidade `columns`

```ts
interface GridColumnState {
  order: readonly string[];
  widths: Readonly<Record<string, number>>;
  hidden: readonly string[];
  pinned: { start: readonly string[]; end: readonly string[] };
}
```

É a disposição das colunas pelo leitor, e um consumidor pode possuí-la: uma
vista guardada restaura-a, `column-manager` (onda 10) edita-a. O vocabulário
partilhado não tinha palavra: `arrangement` e `size` são imutáveis por
definição, `extent` é a fracção de um painel, `value` é o texto de um controlo.
`columns` entra em `KNOWN_CAPABILITIES` e `MUTABLE_CAPABILITIES` no seu próprio
commit, como `sort` entrou por `table`; `tree-grid`, `pivot-grid` e
`column-manager` lêem a mesma palavra.

Modelo: `columnState` / `defaultColumnState` / `onColumnStateChange(state, { reason, change })`
com `change: 'order' | 'width' | 'hidden' | 'pinned'` e razões `pointer`,
`keyboard`, `programmatic`. `serializeColumnState` / `parseColumnState` são
totais; um estado que nomeia uma coluna que já não existe é normalizado em
silêncio, porque uma vista guardada sobrevive a uma coluna removida.

### 4.3 Query — as capacidades `sort` e `filter`

```ts
interface GridQuery {
  sort: readonly { column: string; direction: 'ascending' | 'descending' }[];
  filter: FilterGroup | null;
  search: string;
  page: { index: number; size: number } | { cursor: string | null; size: number } | null;
  group: readonly string[];
}
```

Modelo: `query` / `defaultQuery` / `onQueryChange(query, { reason, change })`
com `change: 'sort' | 'filter' | 'search' | 'page' | 'group'` e razões
`pointer`, `keyboard`, `clear`, `programmatic`. As capacidades `sort` e
`filter` declaram o **mesmo** modelo, com `scope` no contrato a dizer porquê:
a query é um objeto porque um servidor recebe um pedido. O contrato admite-o
(`assertStateModel` verifica a forma de cada modelo e não a unicidade entre
capacidades). Uma mudança de filtro, busca ou agrupamento repõe `page.index`
a zero na mesma transição.

`toGridParams(query, options)` / `fromGridParams(params, options)` compõem
`toFilterBarParams` para `filter` e `search` e acrescentam `sort=col:asc,col2:desc`,
`page=2`, `size=50`, `cursor=…`, `group=col`. Parsing total.

Em `mode="client"`, `applyQuery(rows, columns, query, { locale })` devolve
`{ rows, total, groups }`: filtra, busca, ordena, agrupa e pagina, nessa
ordem. Em `mode="server"` a grelha desenha `rows` e lê `totalCount`/`hasMore`.
`mode` resolve-se a `client` quando `totalCount` e `hasMore` são omitidos.

### 4.4 Seleção

Conjunto-modelo com dois membros: `rows` (`value` / `defaultValue` /
`onValueChange`, o de `table`) e `cells` (`range` / `defaultRange` /
`onRangeChange`, `{ anchor: Cell, focus: Cell } | null`). `selectionMode`:
`none | single | multiple | range`. `range` é seleção de células e exclui a
de linhas; a checkbox não é desenhada nesse modo.

`value` é `string | null` em `single` e `readonly string[]` em `multiple`.
`nextSelection` de `@slotted/core/collection` decide; as chaves são as linhas
que a query deixou, por todas as páginas em `client` e pela página em
`server`. O nome acessível da checkbox do cabeçalho diz o que cobre.

### 4.5 Cursor — a capacidade `current`

`current` / `defaultCurrent` / `onCurrentChange({ row, column } | null, reason)`.
`row` é a chave da linha (ou `'header'`, `'filter'`, `'summary'`, `group:<id>`),
`column` é o `id`. Quando a linha corrente desaparece (filtro, remoção, página),
o cursor fica no mesmo índice ou no último, na mesma coluna; num conjunto
vazio, o foco vai ao `empty`. O foco nunca cai no documento.

### 4.6 Expansão — a capacidade `open`

Conjunto-modelo com dois membros: `detail` (`expanded` / `defaultExpanded` /
`onExpandedChange`) e `groups` (`expandedGroups` / `defaultExpandedGroups` /
`onExpandedGroupsChange`), ambos conjuntos de chaves. Um grupo tem a chave
`<coluna>=<valor>` por nível, unida por `/`. Grupos começam **abertos**: o
valor `'all'` diz isso sem enumerar, e é o valor por defeito.

### 4.7 Edição

Uma sessão, não um modelo de estado. `startEdit(cell)`, `stopEdit({ commit })`
no handle; `onEditStart`, `onEditCommit`, `onEditCancel` como eventos. O
rascunho vive no editor; um rascunho controlado obrigaria o consumidor a
re-renderizar a grelha a cada tecla de um campo que não é seu. MUI X tem
`cellModesModel` e a sua documentação limita-o a gatilhos personalizados, que
`startEdit` cobre.

`onEditCommit({ key, column, value, previous, row, reason })` pode devolver
uma `Promise`. Enquanto pendente, a célula mostra o valor novo e
`data-loading`; se rejeitar, o valor anterior volta, o editor reabre com o
rascunho e a célula fica `data-invalid` com a mensagem do erro. Uma mudança em
`rows` na célula em edição marca `data-invalid` com `labels.editConflict` sem
tocar no rascunho. `editMode: 'cell' | 'row'`.

### 4.8 Ativação

`onActivate(key, { reason, event })`: duplo clique numa célula não editável,
ou `Enter` numa célula de texto de uma linha com `activatable: true` (defeito
`false`; com `true`, `Enter` numa célula editável edita e o duplo clique
ativa). Não é uma capacidade mutável: nada fica.

## 5. Filtro — a forma nova

A forma de `table` empilha, em `size="md"` e a toda a largura, o operador, o
operando, a junção e dois botões. Recusada por escrito na invocação. A forma
desta família, decidida aqui e herdada por `table` e `filter-bar` em
reaberturas registadas em `docs/process/build-order.md`:

- **Uma condição é uma linha.** `[operador ▾] [operando]`, controlos
  `size="sm"`, o operador com largura fixa de `--slotted-data-grid-filter-operator-size`
  (7 rem) e o operando a ocupar o resto; um `between` põe os dois operandos na
  mesma linha com um traço entre eles.
- **A junção é duas palavras.** `segmented-control` `size="sm"` com "E" /
  "Ou" à esquerda da segunda linha, no lugar do operador; a segunda linha
  aparece quando a primeira está ativa (AG Grid).
- **O rodapé é duas palavras.** "Limpar" em `variant="ghost"` e "Aplicar" em
  `variant="solid"`, os dois `size="sm"`, alinhados à direita. Sem título:
  o gatilho já diz a coluna, e o painel abre-se sob ela.
- **A linha de filtro é o operando sem o painel.** Cada `filter-cell` desenha
  o operando da espécie em `variant="plain"` e `size="sm"` a encher a célula,
  com o operador como um botão de símbolo no início do campo (`⊃`, `=`, `≠`,
  `>`, `≥`, `<`, `≤`, `↔`, `∅`, `∄`) que abre um `menu` com os nomes por
  extenso. A espécie `set` desenha um `multi-select` compacto; `boolean` um
  `select` de três valores (qualquer, sim, não); `date`/`time`/`datetime` o
  campo segmentado. O valor aplica-se ao sair do campo e em `Enter`, com um
  atraso de `filterDebounce` (300 ms) para texto e número.
- **A densidade da grelha é a do painel.** Os controlos lêem
  `--slotted-control-*-sm` e o painel tem `--slotted-space-4` de inset, não
  `space-6`.

Os símbolos de operador são texto e não glifos do tema: `⊃` e `≠` são
caracteres tipográficos com significado, não ícones — o mesmo critério que
deixa `kbd` escrever `⌘`. Um leitor de ecrã lê o nome por extenso pelo
`aria-label` do botão.

## 6. Eixos

| Eixo            | Valores                                   | Onde   | Defeito      |
| --------------- | ----------------------------------------- | ------ | ------------ |
| `variant`       | `plain`, `ruled`, `framed`                | root   | `ruled`      |
| `striped`       | `true`, `false`                           | root   | `false`      |
| `stickyHeader`  | `true`, `false`                           | root   | `true`       |
| `stickyTo`      | `scroll`, `page`                          | root   | `scroll`     |
| `selectionMode` | `none`, `single`, `multiple`, `range`     | root   | `none`       |
| `editMode`      | `cell`, `row`                             | root   | `cell`       |
| `mode`          | `client`, `server`                        | root   | inferido     |
| `filterRow`     | `true`, `false`                           | root   | `false`      |
| `virtualize`    | `auto`, `true`, `false`                   | root   | `auto`       |
| `rowHeight`     | número, `auto`                            | root   | densidade    |
| `activatable`   | `true`, `false`                           | root   | `false`      |
| `align`         | `start`, `center`, `end`                  | coluna | `start`      |
| `numeric`       | `true`, `false`                           | coluna | por `kind`   |
| `text`          | `wrap`, `truncate`, `nowrap`              | coluna | `truncate`   |

`stickyHeader` é `true` por defeito, ao contrário de `table`: a grelha possui a
altura, logo há sempre um rolador com um cabeçalho para fixar.

## 7. A imagem

Os tokens de `table` são o ponto de partida, sob o prefixo
`--slotted-data-grid-*`, para que as duas famílias leiam como uma: a banda do
cabeçalho a 8% da tinta, a risca a 5%, a linha `--slotted-border-subtle`, a
altura de linha em `--slotted-control-height-md`. O que a grelha acrescenta:

- **O cursor de célula** é um `outline` de `--slotted-focus-ring-width` em
  `--slotted-tone-accent-border`, desenhado **para dentro** (`outline-offset`
  negativo), porque uma célula não tem margem para um anel exterior e a linha
  seguinte cobri-lo-ia. O anel de foco do teclado (`:focus-visible`) e o cursor
  são o mesmo traço; a diferença entre um cursor visível sem foco (a grelha
  perdeu o foco para um popover) e com foco é a opacidade: `data-current` a
  60%, `:focus-visible` a 100%.
- **O intervalo** tinge as células com `--slotted-tone-accent-surface` e
  desenha a aresta exterior do rectângulo com `--slotted-tone-accent-border`;
  cada célula sabe que arestas são exteriores (`data-range-edge="start end"`).
- **O divisor** é invisível em repouso, uma linha de `--slotted-border-strong`
  em hover e `--slotted-tone-accent-border` durante o arrasto; o alvo é
  `--slotted-target-min` de largura centrado na aresta.
- **A coluna arrastada** baixa a opacidade a 50%; o `drop-indicator` é uma
  linha de `--slotted-border-width-thick` em `--slotted-tone-accent-border`.
- **O índice de ordenação** é um número em `--slotted-font-size-xs` ao lado do
  chevron, só quando há mais de uma chave.
- **A linha de grupo** tem o ground da banda a 4% e o texto em semibold; a
  indentação por nível é `--slotted-space-6` vezes `aria-level`.
- **A linha de filtro** tem o ground da banda a 4% e um traço acima.
- **A célula em edição** dá o inset ao controlo `plain` (a regra de célula de
  `table`) e não desenha o cursor; o controlo desenha o seu anel interior.
- **Hover actions** em `kind: 'actions'`: opacidade 0 em repouso, 1 em
  `:hover`, `:focus-within` e `[data-current]` na linha; com `pointer: coarse`,
  sempre 1.

## 8. Ligações

### 8.1 React

| Pergunta                                                        | Resposta                                                                                                                                                                                                                                                                                 |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Par controlado/não controlado e pedido com razão                | `query`/`defaultQuery`/`onQueryChange`; `columnState`/`defaultColumnState`/`onColumnStateChange`; `value`/`defaultValue`/`onValueChange`; `range`/`defaultRange`/`onRangeChange`; `current`/`defaultCurrent`/`onCurrentChange`; `expanded`/`defaultExpanded`/`onExpandedChange`; `expandedGroups`/`defaultExpandedGroups`/`onExpandedGroupsChange` |
| Defaults uma vez                                                | `DataGridDefaultsProvider` e `useDataGridDefaults`: `variant`, `striped`, `stickyHeader`, `stickyTo`, `selectionMode`, `editMode`, `filterRow`, `virtualize`, `rowHeight`, `overscan`, `pageSizes`, `filterDebounce`, `locale`, `labels`                                                                            |
| Substituir o elemento de uma parte                              | `renderCell`, `renderEditor`, `renderHeader`, `renderDetail`, `renderGroup`, `renderEmpty` por coluna ou por grelha; `render` no `root` e no `footer`. `row`, `cell` e `head` são fixos porque o layout e os papéis são deles                                                              |
| O handler do consumidor continua a correr                       | composto: `onKeyDown`, `onClick`, `onDoubleClick` do consumidor correm primeiro e `defaultPrevented` pára a família                                                                                                                                                                       |
| Elemento nativo e acção imperativa                              | `ref` no `root`; handle `DataGridHandle`: `focusCell`, `scrollToRow`, `scrollToColumn`, `scrollToCell`, `startEdit`, `stopEdit`, `autofit`, `getVisibleRows`, `selectAll`, `clearSelection`                                                                                             |
| SSR sem hidratação divergente                                   | `useId`; a primeira renderização monta `overscan` linhas a partir do início sem medir; a janela corrige-se num efeito                                                                                                                                                                     |
| Estados no DOM                                                  | `data-selected`, `data-current`, `data-in-range`, `data-range-edge`, `data-editing`, `data-invalid`, `data-loading`, `data-readonly`, `data-expanded`, `data-dragging`, `data-drop-target`, `data-disabled`, `data-sorted`, `data-sort-index`, `data-filtered`, `data-pinned`, `data-overflowing` |
| Props do elemento nativo, estendidas                            | `ComponentPropsWithRef<'div'>` no `root` e no `footer`; as partes internas não são componentes públicos porque a grelha as monta pela janela                                                                                                                                             |

A grelha React é **um** componente com `columns` e `rows` como dados, e não
uma composição de partes por JSX: uma linha virtualizada não pode ser um filho
escrito pelo consumidor. As partes substituíveis são funções de renderização
por coluna. É a forma de MUI X, AG Grid e Glide; React Aria compõe por JSX e
não virtualiza colunas.

### 8.2 Angular

| Pergunta                                                        | Resposta                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valor bidirecional na forma do ecossistema                      | `model()` para `query`, `columnState`, `value`, `range`, `current`, `expanded`, `expandedGroups`; `output()` `queryChange`, `columnStateChange`, `valueChange`, `rangeChange`, `currentChange`, `expandedChange`, `expandedGroupsChange` com razão; `editCommit`, `editStart`, `editCancel`, `activate`, `loadMore`, `retry` |
| Reactive Forms                                                  | `ControlValueAccessor` no `root` para a seleção de linhas, como `table`: um ecrã de acções em massa é um formulário reactivo                                                                                                                                                                  |
| Defaults uma vez                                                | `SL_DATA_GRID_DEFAULTS` e `provideDataGridDefaults()`                                                                                                                                                                                                                                       |
| Template alcança a instância                                    | `exportAs: 'slDataGrid'`                                                                                                                                                                                                                                                                      |
| Conteúdo projetado, mantido lento                               | `*slDataGridCell="let row; column: 'name'"`, `*slDataGridEditor`, `*slDataGridHeader`, `*slDataGridDetail`, `*slDataGridGroup`, `*slDataGridEmpty` como directivas estruturais lidas por `contentChildren`; renderizados por `NgTemplateOutlet` só para as células montadas; `<ng-content select="[slDataGridFooter]">` |
| Zoneless e `OnPush`                                             | signals; `computed` para a janela, a template, as linhas aplicadas; o `ResizeObserver` escreve num signal                                                                                                                                                                                    |
| Subscrições desfeitas                                           | `DestroyRef` para os observadores, o `drag`, o `focus-trap` e o `live-announcer`                                                                                                                                                                                                              |
| Atributo estático sobrevive                                     | `HostAttributeToken` para `data-part`, `role`, `aria-label`, `aria-labelledby`                                                                                                                                                                                                                |
| Ponto de entrada de classe única                                | `@slotted/angular/data-grid`; importa `checkbox`, `menu`, `popover`, `select`, `multi-select`, `segmented-control`, `button`, `text-field`, `number-field`, `date-field`, `time-field`, `datetime-field`, `result-state`, `skeleton` pelos seus pontos de entrada                                |

A assimetria registada: React recebe `renderCell` por coluna; Angular recebe
`*slDataGridCell` como template por coluna. React não tem forms; Angular tem
`ControlValueAccessor`.

## 9. Recusado e departures, com o custo

| Recusado / departure                       | Em vez disso                                                                       | Custo                                                                                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `table` como elemento                      | `div` com papéis                                                                   | os papéis são escritos à mão; `table.styles.test.mjs` não os cobre, o contrato desta família cobre                                                       |
| paste, fill handle                         | §12 Spreadsheet                                                                    | copiar está, colar não; um utilizador de folha de cálculo sente a falta e a razão é o produto que §12 nomeia                                              |
| exportação, gráficos, pivot                | `getVisibleRows()` no handle                                                       | duas linhas do consumidor para um CSV                                                                                                                    |
| chips e construtor de expressões           | `filter-bar` sobre a mesma query                                                   | uma composição na página de referência                                                                                                                   |
| painel de gestão de colunas                | `column-manager` (onda 10) sobre `columnState`                                     | até lá, o menu da coluna esconde uma coluna e o consumidor escreve o botão que a mostra                                                                  |
| arrastar entre zonas fixas                 | o menu da coluna fixa e desafixa                                                   | AG Grid deixa arrastar para a zona; aqui a zona é um facto do estado e o arrasto só muda a ordem dentro dela                                              |
| `Ctrl+Shift+Arrow` para redimensionar      | departure                                                                          | só age com o cursor no `columnheader`, onde não há editor; num editor aberto a combinação continua a ser a selecção por palavra do browser              |
| `Alt+Arrow` para mover a coluna            | departure, decidida em `drag`                                                      | `Alt+ArrowLeft` é "voltar" em alguns browsers; só age com o cursor no `columnheader`, e `preventDefault` trava a navegação                                |
| `Ctrl+C` do intervalo                      | departure                                                                          | rouba o copiar do texto selecionado na página enquanto o foco está na grelha; com uma selecção de texto não vazia, a família não intercepta               |
| `Enter` desce uma linha ao confirmar       | departure (Excel, AG Grid, MUI X)                                                  | um leitor que quer confirmar sem se mover usa `F2` ou `Tab`                                                                                              |
| controlar a sessão de edição               | `startEdit`/`stopEdit`                                                             | um consumidor que quisesse um rascunho controlado escreve o editor em `renderEditor` e possui o valor dentro dele                                          |
| `aria-sort` em todas as chaves             | só na primeira                                                                     | a prática diz que mais de um é ambíguo; o índice visível e o anúncio dizem o resto                                                                       |
| `size` como eixo                           | a densidade                                                                        | como `table`                                                                                                                                             |

## 10. O que uma resposta errada custa

No gate visual, a anatomia e a imagem são o que é barato mudar. Que o DOM é
`div` com `display: grid` decide a virtualização, o redimensionar e as colunas
fixas; voltar a `table` depois custa o motor de layout inteiro. Que a query é
um objeto decide as assinaturas de todos os eventos, a URL e o modo servidor.
Que `columns` entra no vocabulário partilhado decide o que `column-manager` e
`tree-grid` lêem. Que o filtro toma a forma de uma linha por condição decide a
reabertura de `table` e de `filter-bar`.
