# `data-list` — desenho

Data: 2026-09-24. Inventário: `2026-09-24-data-list-capability-inventory.md`.

`data-list` desenha um conjunto tabular pequeno como uma lista de registos. Cada
registo é um `list-item` com título, texto secundário, valor à direita e os campos
de maior prioridade como pares rótulo/valor. A família lê o modelo de `data-grid`:
`GridColumn<Row>` para as colunas, `GridQuery` para ordenação, filtro, busca e
página, e a união de seleção de `table`.

Uso: um contentor onde `table` sob `text="wrap"` não cabe — telefone, gaveta,
coluna mestre de um mestre–detalhe. Antiuso: um conjunto que precisa de janela
virtual, edição em célula, ordem manual ou teclado de grelha (`data-grid`); um
conjunto que cabe numa tabela (`table`); opções escolhidas num formulário
(`listbox`).

## 1. Responsabilidade

| Pergunta | Dono |
| --- | --- |
| Que colunas o item mostra e em que lugar | `data-list`, a partir de `GridColumn` |
| Aplicar a query em modo cliente | `data-list`, por `applyQuery` de `@slotted/core/grid` |
| Editar o filtro e a busca | `filter-bar` e o `text-field` do consumidor, na mesma `query` |
| Editar a ordenação | `data-list`, parte `sort` (um `menu`) |
| Paginação | `data-list` aplica `query.page`; o controlo é `pagination` em `footer` |
| Geometria da linha, `start`/`end`/`actions`, estados da linha | `list-item` |
| `ul role="list"`, secções de grupo | `list` |
| Caixa de seleção | `checkbox` |
| Vazio, sem resultados, erro | `result-state` |
| Primeira carga | `skeleton` |
| Alternar entre `table` e `data-list` por largura | a aplicação, com `createWidthGate` em `COMPACT_BELOW` |

## 2. Anatomia

```
div[data-ui=data-list][data-part=root]            contentor de consulta slotted-data-list
  div[data-part=header]
    span[data-part=select-all] > checkbox          só em selectionMode multiple
    span[data-part=count]                           "12 customers" · "3 of 12 selected"
    span[data-part=sort] > button (gatilho de menu) só com uma coluna ordenável
  ul[data-ui=list]                                  role=list, aria-label = label
    li[data-ui=list-item]                           um por registo
      div[data-part=content]                        list-item estático (div)
        div[data-part=start]  > checkbox, mídia
        div[data-part=body]
          div[data-part=label] > a|button|span[data-part=title]
          div[data-part=description]                coluna subtitle
        div[data-part=end] > span[data-part=trailing]  coluna trailing
        dl[data-part=fields]                        da coluna do texto ao fim da linha
          div[data-part=field] > dt[data-part=field-label] + dd[data-part=field-value]
        button[data-part=more]                      só quando há campos além de fields
      div[data-part=actions]                        coluna kind: 'actions'
    li[data-part=section] …                         secções de list sob query.group
  div[data-part=empty] > result-state
  div[data-part=loader] > skeleton region, itens-esqueleto
  div[data-part=footer]
    span[data-part=load-more] > button              só com hasMore
    (pagination do consumidor)
```

`data-part` pertence ao elemento que a família escreve. Os elementos de `list`,
`list-item`, `checkbox`, `menu`, `result-state` e `skeleton` mantêm o seu
`data-ui` e as suas partes; a folha de `data-list` alcança-os por
`[data-ui='data-list'] [data-ui='list-item']`.

### 2.1 Atribuição das colunas

A partir das colunas visíveis (`columnState.hidden` fora, `columnState.order`
aplicada):

1. `title`: a coluna nomeada por `title`; por omissão, a primeira com
   `rowHeader: true`; por omissão, a primeira coluna de dados.
2. `subtitle`, `trailing`: as colunas nomeadas; nenhuma por omissão.
3. `actions`: todas as colunas `kind: 'actions'`, na ordem declarada.
4. Campos: as restantes, sem `popin: false`. Ordem: as numeradas por `priority`
   crescente, empate pela ordem declarada; depois as sem `priority`, pela ordem
   declarada. É a ordem inversa da saída de `columnsOutOfSpace`.
5. As primeiras `fields` (por omissão 4) aparecem; as restantes aparecem com o
   item expandido.

A lógica vive em `@slotted/core/data-list` (`resolveItemColumns`), partilhada
pelos dois bindings.

### 2.2 Campos

- `dl` com um `div` por par (HTML Standard 4.4.9, a forma de
  `description-list`), filho de `content` de `list-item`, colocado de `body`
  ao fim da grelha (`grid-column: 2 / -1`); abaixo dos 22rem de `list-item`,
  desde o início (`1 / -1`). Dentro de `body`, a coluna `end` tirava ~100 px a
  cada linha de campos.
- Uma coluna de campos entre 12rem e 19rem: rótulo ao lado do valor, trilha
  `min(7.5rem, 35%)`. Abaixo de 12rem: rótulo sobre o valor.
- Geometria do pop-in de `data-grid` (`2026-09-23-narrow-layout-design.md`
  §4.3): `grid-template-columns: repeat(auto-fill, minmax(min(9rem, 100%), 1fr))`,
  `column-gap` passo 4, `row-gap` passo 2; rótulo acima do valor em
  `font-size-xs` com `text-muted`; abaixo de 19rem de `fields`, rótulo ao lado
  do valor (`minmax(0, 7.5rem) minmax(0, 1fr)`).
- O valor quebra (`overflow-wrap: anywhere`) e nunca trunca; um valor vazio
  desenha a marca de `description-list` (`placeholder`) com `labels.empty` para
  leitor de ecrã.
- O valor é desenhado pelo modelo de célula da coluna, com o contexto
  `{ column, row, value, text }` — o mesmo de `data-grid`.

Decisão sobre `description-list`: ver inventário §5.

### 2.3 Ativação

- `href(row)` → o título é um `a`. `activatable` → o título é um `button`,
  que emite `activate` com `{ key, row, reason, event }`.
- A área de toque cobre o item: `::after` do título com `inset: 0` sobre o
  `li`, `position: relative`. A caixa de seleção, `more`, as ações e qualquer
  controlo dentro de um valor ficam acima (`position: relative; z-index: 1`).
- O nome acessível do link é o título; os campos ficam fora do elemento
  interativo, porque um `dl` não é conteúdo de frase e não pode estar dentro de
  um `button`.
- Custo: o texto dos campos deixa de ser selecionável com o ponteiro num item
  ativável; a cópia continua pelo teclado e pelo registo aberto.
- `current`: a chave do registo aberto ao lado (mestre–detalhe); o item recebe
  `current` de `list-item` e `aria-current="true"`, ou `"page"` com `href`.

### 2.4 Ordenação

- `sort` é o gatilho de um `menu` com dois grupos de rádio: a coluna (as
  colunas `sortable`, mais `labels.sortNone`) e a direção (`labels.ascending`,
  `labels.descending`; desativado sem coluna).
- Escolher uma coluna substitui `query.sort` por `[{ column, direction }]` com a
  direção atual, ou `ascending`. Escolher a direção reescreve a primeira chave.
  Razão: `pointer` ou `keyboard`, do evento de seleção do `menu`.
- O gatilho mostra `labels.sort` e a coluna da primeira chave; com mais chaves,
  `labels.sortMore` ("+{count}"). O nome acessível diz a ordem inteira.
- O anúncio, por `live-announcer`, polido: `labels.sortedBy` com a ordem inteira,
  ou `labels.sortCleared`.

### 2.5 Seleção

- `selectionMode` `none` | `single` | `multiple`; `value` `string | null` ou
  `readonly string[]`, a união de `table`. `nextSelection` de
  `@slotted/core/collection`; Shift estende a partir da âncora; `disabledKeys`
  não entram.
- A caixa em `start` tem o nome `labels.selectRow` com o título
  (`Select {title}`). `aria-selected` não existe em `listitem`: o item pinta
  `selected` e a caixa anuncia, a divisão que `list` e `table` registaram.
- `select-all` cobre as chaves que a query deixou (todas as páginas em modo
  cliente; a página em modo servidor), indeterminado com seleção parcial, com a
  contagem no nome (`labels.selectAll`).
- `count` diz `labels.count` sem seleção e `labels.selectedCount` com seleção,
  numa `output` com `aria-live="polite"`. Os dois aceitam função
  `(slots) => string` para o plural.

### 2.6 Expansão

- `more` é um `button` com `aria-expanded` e `aria-controls` no `dl`. O texto é
  `labels.more` ("Show {count} more") ou `labels.less`.
- `expanded`/`defaultExpanded`/`onExpandedChange` como conjunto de chaves.
- Os campos além de `fields` não são renderizados enquanto fechado, como o
  detalhe de `data-grid`.

### 2.7 Carregamento, vazio, erro

- Primeira carga (`loading` sem linhas): `loader` com `skeleton` em modo região
  (`aria-busy`, um anúncio polido), `skeletonRows` itens (por omissão 5) com a
  anatomia do item: linha do título, linha do texto secundário quando há
  `subtitle`, valor à direita quando há `trailing`, e `fields` pares rótulo/valor
  na mesma grelha. Cabeçalho e rótulos de campo não são dados: o cabeçalho é
  desenhado com o gatilho desativado; os rótulos de campo aparecem reais.
  `delay` 200 ms e `minDuration` 400 ms pelos defaults da família.
- Recarga sobre linhas mostradas: `aria-busy` e `data-loading` na raiz; a
  lista mantém os valores e fica atenuada; nada se move.
- Carregar mais: `load-more` é um `button` de `button`, com `loading` enquanto
  `loading` e há linhas.
- `empty` compõe `result-state` (`reach="section"`): `empty`; `no-results`
  com "Limpar filtros" (esvazia `query.filter` e `query.search` numa mudança,
  razão `clear`); `error` com "Tentar de novo" (`retry`). Um `error` sobre linhas
  mostradas mantém as linhas e desenha a mensagem acima delas.

### 2.8 Grupos

`query.group` → `applyQuery` devolve nós de grupo; cada grupo é uma `section`
de `list` com `section-label` ("Status: Active · 4") e a sua `section-list`. Os
grupos estão sempre abertos: uma lista não tem a linha de grupo recolhível de
`data-grid`.

## 3. Estado

| Capacidade | Controlado | Não controlado | Pedido | Razões |
| --- | --- | --- | --- | --- |
| `sort`, `filter` | `query` | `defaultQuery` | `onQueryChange` com `change` | `pointer`, `keyboard`, `clear`, `programmatic` |
| `selection` | `value` | `defaultValue` | `onValueChange` | `pointer`, `keyboard`, `select`, `clear`, `programmatic` |
| `open` | `expanded` | `defaultExpanded` | `onExpandedChange` | `pointer`, `keyboard`, `programmatic` |

`sort` e `filter` declaram o mesmo modelo pela razão que `data-grid` escreve.
`current`, `columnState`, `disabledKeys`, `loadingKeys` são entradas: a família
nunca os move.

`mode`: `client` aplica a query; `server` desenha as linhas recebidas e lê
`totalCount`. Resolvido para `server` quando `totalCount` é dado.

## 4. Teclado

Nenhuma tecla própria. Tab percorre, por item: a caixa de seleção, o título
(quando é `a` ou `button`), `more`, as ações. Enter e Space são os do
elemento nativo. O cabeçalho: `select-all`, depois `sort` (padrão menu button:
Enter, Space, ArrowDown, ArrowUp abrem; o resto é de `menu`). A partida das
setas é a de `list` (`keyboardDeparture`).

Foco depois de uma remoção: quando o item com foco sai de `rows`, o foco vai
para o título do item seguinte, ou do anterior, ou para `empty`. A família
nunca deixa o foco no `body`.

## 5. Integração

### React

| Pergunta | Resposta |
| --- | --- |
| Par controlado/não controlado com pedido e razão | `query`/`defaultQuery`/`onQueryChange(query, request)`; `value`/`defaultValue`/`onValueChange(value, request)`; `expanded`/`defaultExpanded`/`onExpandedChange(keys, request)` — a forma de `data-grid` |
| Defaults uma vez por aplicação | `DataListDefaultsProvider` e `useDataListDefaults`: `variant`, `size`, `fields`, `selectionMode`, `skeletonRows`, `loadingDelay`, `loadingMinDuration`, `labels` |
| Substituir o elemento de cada parte | `render` na raiz; as partes internas são fixas: são geradas a partir das colunas, e o seu conteúdo substitui-se por `renderCell`, `renderMedia`, `renderEmpty`, `footer` |
| O handler do consumidor corre | os `on*` nativos da raiz compõem-se com os da família; `onActivate` é chamado depois do clique nativo do título |
| Elemento nativo e ação imperativa | `ref` → `DataListHandle { root, focus(), focusKey(key), scrollToKey(key) }` |
| SSR sem divergência | `useId` para os ids de `dl` e rótulos; nenhuma medida durante o render |
| Estados estilizáveis no DOM | `data-selected`, `data-current`, `data-disabled`, `data-loading` nos itens (de `list-item`); `data-expanded` no item; `data-loading` na raiz |
| Tipo de props nativo, estendido | `DataListProps<Row>` estende `Omit<ComponentPropsWithRef<'div'>, 'defaultValue' \| 'onChange' \| …>` |

### Angular

| Pergunta | Resposta |
| --- | --- |
| Valor em duas vias com a forma de sinais | `model()` para `query`, `value`, `expanded`; `output()` `queryChangeRequest`, `valueChangeRequest`, `expandedChangeRequest` com `ChangeRequest`, a forma de `data-grid` |
| Reactive Forms e template forms | não: uma lista de registos não é um controlo de formulário; a seleção é estado de vista, como em `table` e `data-grid` |
| Defaults uma vez por aplicação | `provideDataListDefaults()` e `SL_DATA_LIST_DEFAULTS` |
| Instância no template | `exportAs: 'slDataList'` |
| Conteúdo projetado e preguiçoso | `ng-template[slDataListCell]="<coluna>"`, `ng-template[slDataListMedia]`, `ng-template[slDataListEmpty]`, com `NgTemplateOutlet`; `ng-content select="[slDataListFooter]"` |
| Zoneless e `OnPush` | sinais e `computed` em todo o estado |
| Listeners desmontados | `DestroyRef` para o anunciador e o `effect` de foco |
| Atributo estático do consumidor | `HostAttributeToken('aria-label')` lido antes de escrever `aria-label` na lista |
| Entrada única | `@slotted/angular/data-list`, que importa `list`, `list-item`, `checkbox`, `menu`, `button`, `result-state`, `skeleton` pelos seus entry points |

Assimetria: React substitui a raiz por `render`; Angular não, porque o host é o
elemento da diretiva.

## 6. Decisões e custo

1. **Modelo de `data-grid`, não o de `table`.** `table` guarda um descritor de
   ordenação e um filtro por coluna, e as linhas são filhos do consumidor.
   `data-list` precisa das colunas para atribuir lugares e para o menu de
   ordenação, logo lê `GridColumn`. Uma aplicação que alterna com `table`
   converte a ordenação (`sort ? [sort] : []`) e os filtros por coluna
   (`withRuleFor`) ao ligar as duas; a página de referência mostra as três
   linhas.
2. **Pares próprios em vez de `description-list`.** Inventário §5.
3. **Área de toque esticada.** §2.3; custo: seleção de texto por ponteiro.
4. **Uma chave de ordenação editada.** O menu edita a primeira chave; as outras
   são lidas e anunciadas. Um editor de várias chaves num telefone é o painel de
   `data-grid`.
5. **Módulo `@slotted/core/data-list`.** A atribuição de colunas e o texto de
   contagem são partilhados pelos dois bindings. Não é motor novo: lê `grid` e
   não guarda estado.
6. **Checkbox também em `single`.** A decisão de `table`, pelo mesmo motivo:
   o leitor que troca de uma forma para a outra encontra o mesmo controlo.
