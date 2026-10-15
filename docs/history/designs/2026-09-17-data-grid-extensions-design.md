# Desenho — extensões de `data-grid`

Adenda a `docs/history/designs/2026-09-16-data-grid-design.md`, escrita
depois das rondas de refino. Fonte de comparação: a página de features de
MUI X Data Grid (Community, Pro, Premium), lida em 17 de setembro de 2026.
Cada peça abaixo é uma extensão da família existente; nenhuma altera uma
decisão do desenho de origem, e as duas reaberturas de §9 (spanning, paste)
ficam para um desenho próprio.

Ordem de execução: onda 1 (peças 1–4, pequenas, refinam o que existe); onda
2 (tree data, row reordering); onda 3 (row pinning, data source).

---

## Onda 1

### 1. Autofit de todas as colunas

`handle.autofit()` sem argumento já existe e está errado: cada coluna pedia
um estado calculado a partir do mesmo `effectiveState`, e só a última largura
sobrevivia. Correção: medir todas, construir **um** estado com todas as
larguras e pedir uma vez, `change: 'width'`, razão `programmatic`. A cena
`resize` ganha o botão "Fit columns".

### 2. Destaque de célula alterada (`highlightChanges`)

Prop `highlightChanges?: boolean | number` (milissegundos; `true` = 1200).
Quando `rows` muda, a grelha compara, **só nas linhas montadas**, o valor de
cada coluna visível com o valor anterior da mesma linha (pela chave). Uma
célula cujo valor mudou recebe `data-changed` durante o prazo; a folha pinta
a transição de `--slotted-data-grid-changed-surface` (accent subtle) até
transparente com `--slotted-data-grid-changed-duration`. Em
`prefers-reduced-motion` a tinta é estática e sai no fim do prazo. Uma linha
que entra na janela durante o prazo não pisca: a comparação é entre dois
`rows` consecutivos, não contra um histórico. Cena `realtime`: dez mil
linhas, vinte alteradas a cada 400 ms.

Custo: uma comparação por célula montada por atualização de `rows`.

### 3. Vista persistida

- `@slotted/core/grid`: `GridView = { columns: GridColumnState; query: GridQuery }`;
  `serializeGridView(view, columns?)` escreve `toGridParams(query)` mais
  `columns=<serializeColumnState>` como uma `URLSearchParams` em texto;
  `parseGridView(text, { columns?, defaultPageSize? })` lê o inverso, total:
  texto malformado dá a vista vazia, e o estado de colunas é normalizado
  contra o modelo quando este é dado.
- React: `usePersistedGridView({ key, columns, storage?, defaultQuery?,
  defaultColumnState? })` devolve `{ query, onQueryChange, columnState,
  onColumnStateChange, reset }` para espalhar na grelha. `storage` é
  `localStorage` por omissão, lido e escrito dentro de `try`; sem storage
  (SSR, modo privado que lança) a vista vive em memória. A escrita acontece
  num efeito, uma por commit.
- Angular: `persistedGridView({ key, columns, storage?, injector? })` devolve
  `{ query: WritableSignal, columnState: WritableSignal, reset }`; um
  `effect` escreve a vista.
- A cena `column-state` passa a usar a vista persistida.

Recusado: persistir seleção, cursor e expansão. São estado de sessão, não
de vista; MUI X também não os exporta.

### 4. Exportação

- `@slotted/core/grid`: `toCsv(rows, columns, { delimiter?, header?, bom?,
  locale?, timeZone? })`, RFC 4180 (aspas dobradas, campo com delimitador,
  aspas ou quebra de linha entre aspas, CRLF), o texto de cada célula pelo
  mesmo formatador da grelha (`format` da coluna, depois o do tipo).
- `handle.exportCsv({ filename?, rows?: 'visible' | 'selected', columns?:
  'visible' | 'all', ...opções de toCsv })` constrói o ficheiro e descarrega
  por `Blob` + âncora. `visible` são as linhas que a query deixou (todas as
  páginas em modo cliente; as recebidas em modo servidor) e as colunas não
  escondidas, na ordem do leitor.
- Impressão: `@media print` na folha — moldura à altura do conteúdo, scroll
  visível, sticky estático, controlos (menu, resizer, gatilho de filtro,
  resizer) escondidos, cores forçadas. Uma grelha com janela imprime as
  linhas montadas; a docs diz isso e aponta `virtualize={false}` para
  imprimir tudo.
- Cena `export`: botões "CSV", "CSV (selected)" e "Print".

Recusado: Excel (`xlsx`) — um consumidor com SheetJS escreve
`aoa_to_sheet(toCsv rows)` em duas linhas; a família não carrega a
dependência.

## Onda 2

### 5. Tree data

Linhas hierárquicas, à maneira de MUI X Pro (`treeData`) e AG Grid
(`getDataPath`), mas por chave de pai, não por caminho: uma linha diz quem é
o pai e o pai está em `rows`. Um caminho serve para inventar nós que os dados
não têm; aqui um nó é sempre uma linha, e uma linha cujo pai não está em
`rows` é raiz.

- **Modelo.** `tree?: { parentKey: (row) => string | null; column?: string;
  hasChildren?: (row) => boolean }`. `column` é a coluna que leva o recuo e o
  botão de abrir; por omissão a primeira coluna visível que não é a de seleção.
  `hasChildren` diz que uma linha tem filhos que ainda não estão em `rows`
  (carregamento sob pedido).
- **Estado.** Os ramos abertos são `expanded` — a capacidade `open` que o
  detalhe já usa. Uma linha com filhos abre os filhos; uma folha com detalhe
  abre o detalhe; uma linha com as duas coisas não existe (o detalhe é para
  folhas). `defaultExpanded: []` — fechado, como MUI X.
- **Motor.** `applyQuery` recebe `tree`. Filtro e pesquisa: uma linha fica se
  cumpre ou se um descendente cumpre; os antepassados de uma linha que fica
  ficam também, mesmo sem cumprir. Ordenação: entre irmãos. Página: sobre os
  nós visíveis depois da expansão, achatados — o que MUI X faz. `group` é
  ignorado quando `tree` existe (as duas hierarquias não se somam; docs). O
  nó de linha ganha `level` (1 na raiz), `parent` (chave ou `null`),
  `childCount` (filhos em `rows`) e `open`.
- **Papéis.** `role="treegrid"` no root quando `tree` existe; `aria-level`
  e, numa linha com filhos, `aria-expanded` na linha (APG treegrid).
- **Teclado.** Com o cursor na coluna da árvore: ArrowRight abre um ramo
  fechado; ArrowLeft fecha um ramo aberto, e numa folha ou ramo fechado
  sobe ao pai. Nas outras células as setas movem o cursor como sempre.
- **Desenho.** A célula da coluna da árvore recua `--_indent × (level − 1)`
  e leva `[data-part='tree-toggle']` (um `button` com `aria-expanded`, não
  uma tab stop: o cursor está na célula) antes do valor; uma folha leva o
  mesmo espaço vazio para o texto alinhar.
- **Sob pedido.** Abrir uma linha com `hasChildren` e sem filhos em `rows`
  emite `onLoadChildren({ key, row })` e marca a linha `data-loading`
  (spinner no toggle) até chegarem filhos ou até fechar.
- **Seleção.** Selecionar um pai não seleciona os filhos (MUI X). Intervalo
  e cursor tratam os nós achatados como linhas.
- **Cena** `tree`: locais → armazéns → zonas, 3 níveis, um ramo por pedido.

Recusado: nós inventados por caminho; agregados por ramo (o resumo é do
conjunto); mover uma linha para outro pai por arrasto.

### 6. Row reordering

- **Modelo.** `rowsReorderable?: boolean`. A grelha não guarda a ordem: as
  linhas são os dados do consumidor, e um arrasto emite
  `onRowsReorder({ key, from, to, reason, event })` com `from`/`to` índices
  em `rows`; o consumidor move e devolve `rows`. Sem estado próprio, sem
  segunda fonte de verdade.
- **Quando.** Só com a query em repouso — sem `sort`, `filter`, `search`,
  `group`, `page` — e sem `tree`: numa lista ordenada ou filtrada a posição
  visual não é a posição em `rows`. Fora disso a alça fica `aria-disabled` e
  o docs diz porquê (a regra de MUI X Pro).
- **Alça.** Coluna reservada `DRAG_COLUMN` (`data-column="__drag"`, 40 px),
  a seguir à de seleção, com `[data-part='row-handle']` — um `button` com o
  nome "Reorder {row}", tab stop só quando é a célula corrente. O ponteiro
  arrasta a partir da alça (`handle` do `core/drag`); o teclado move a linha
  com Alt+ArrowUp/ArrowDown a partir de qualquer célula dela, a mesma
  departure que Alt+ArrowLeft/Right é para as colunas, com anúncio
  "{row} moved to position {position}".
- **Contentor.** Um segundo controlador de `core/drag` (o eixo do autoscroll
  é do controlador) com um contentor `rows`, vertical, sobre o `body`; itens
  = chaves das linhas montadas; `autoScroll: { axis: 'y' }`.
  A guia é a mesma `drop-indicator`, com `data-axis="row"`, horizontal na
  fenda de destino e à largura do viewport.
- **Anúncio.** As mensagens do controlador com o rótulo da linha (a coluna
  `rowHeader`, ou a chave).
- **Cena** `reorder-rows`: oito linhas, a ordem escrita por baixo.

## Onda 3

### 7. Row pinning

- **Modelo.** `pinnedRows?: { top?: string[]; bottom?: string[] }` por chave,
  na ordem dada. Uma linha presa sai da query — nem ordenada, nem filtrada,
  nem paginada — e fica sempre em ecrã, sob a cabeça e sobre o resumo.
- **DOM.** Dois rowgroups `[data-part='pinned-rows'][data-edge='top'|'bottom']`
  fora do `body` e da janela, sticky às alturas que a binding mede para a
  cabeça e o resumo (`ResizeObserver` → `--slotted-data-grid-pinned-*-offset`
  no scroller). A folha trata `pinned-rows` como um grupo do corpo em todas
  as regras de linha (track, réguas, hover, seleção, cursor).
- **Linhas.** São linhas do corpo: o cursor atravessa-as (topo → corpo →
  fundo), selecionam-se, editam-se, exportam-se e contam em
  `aria-rowcount`/`aria-rowindex`.

### 8. Data source

- **Modelo.** `dataSource: { getRows(query, { signal }) => Promise<{ rows,
  total?, hasMore? }>; cacheSize? }`. Com fonte a grelha está em modo
  servidor e `rows`, `totalCount`, `loading`, `error` e `onRetry` são da
  fonte, não lidos das props (`rows` passa a opcional).
- **Ciclo.** Um pedido por query, o anterior abortado pelo `AbortSignal`;
  a resposta guardada pela query serializada (`cacheSize`, 20 por omissão,
  0 desliga); uma página presente fica, escurecida (`aria-busy`), enquanto a
  seguinte chega; uma rejeição que não é abort é o estado de erro com a
  mensagem lançada; "Try again" repete a query; `handle.reload()` /
  `reload()` despeja a cache.
- **Recusado.** Carregamento por janela (chunks) e cursor infinito pela
  fonte: `hasMore` + `onLoadMore` sobre `rows` continuam a ser do consumidor.
