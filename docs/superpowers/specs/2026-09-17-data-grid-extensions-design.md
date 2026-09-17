# Desenho — extensões de `data-grid`

Adenda a `docs/superpowers/specs/2026-09-16-data-grid-design.md`, escrita
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

## Onda 2 (a detalhar antes de escrever)

- **Tree data**: linhas com `parentKey` (ou `getTreePath`), `aria-level`,
  `aria-expanded` na célula de expansão, setas Left/Right nas células da
  coluna de árvore, filhos carregados sob pedido (`onLoadChildren`),
  filtro que mantém antepassados. Reutiliza `expanded`/`open`.
- **Row reordering**: `rowsReorderable`, alça na coluna de seleção ou uma
  coluna `drag`, `core/drag` com contentor vertical e a mesma guia de
  destino; `onRowsReorder({ key, to })`. Só sem ordenação e sem agrupamento
  ativos (MUI X, a mesma regra).

## Onda 3 (a detalhar antes de escrever)

- **Row pinning**: `pinnedRows: { top: keys[], bottom: keys[] }`, linhas
  fora da janela e do resumo, sticky nas duas arestas.
- **Data source**: `dataSource: { getRows(query) => Promise<{ rows, total }> }`
  com cache por query, janela de carregamento (`lazy`), e `onError`; a
  grelha guarda a query e pede.
