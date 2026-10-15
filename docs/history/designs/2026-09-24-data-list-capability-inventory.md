# Inventário de capacidades — `data-list`

Produzido antes de qualquer desenho ou código, como
`.claude/skills/component/references/capability.md` exige. A família é nova:
`specs/components/data-list/` não existe.

Escopo escrito (`docs/process/build-order.md`, onda 10): o recipe responsivo de
um conjunto tabular pequeno quando a tabela não cabe; cada item mostra rótulos e
valores prioritários; mantém ordenação, filtros e seleção do modelo de dados;
não oferece navegação de grelha; compõe `list-item` e `description-list`.
`table` sob `text="wrap"` continua a resposta para o conjunto que cabe; o pop-in
de `data-grid` cobre a coleção de `data-grid` num telefone.
`docs/component-features.md` §12 repete o escopo; §2.7 lista "visão em lista"
entre as respostas responsivas de uma tabela. `docs/product/prd.md` não nomeia a
família.

A invocação acrescenta uma fronteira: a família começa onde `table` sob `wrap`
não cabe.

Fontes lidas em 24 de setembro de 2026.

---

## 1. Pesquisadas

| Implementação | Nome da família | Onde foi lida |
| --- | --- | --- |
| PatternFly 6 | `DataList`, `DataListItem`, `DataListItemRow`, `DataListCell`, `DataListCheck`, `DataListToggle`, `DataListContent`, `DataListAction` | <https://www.patternfly.org/components/data-list/>; <https://raw.githubusercontent.com/patternfly/patternfly-react/main/packages/react-core/src/components/DataList/DataList.tsx> |
| Shopify Polaris | `ResourceList`, `ResourceItem`; `IndexTable` com `condensed` | <https://raw.githubusercontent.com/Shopify/polaris/main/polaris-react/src/components/ResourceList/ResourceList.tsx>; <https://raw.githubusercontent.com/Shopify/polaris/main/polaris-react/src/components/IndexTable/IndexTable.tsx> |
| MUI X Data Grid Pro v8 | `listView`, `listViewColumn` | <https://mui.com/x/react-data-grid/list-view/> |
| SAP UI5 | `sap.m.ObjectListItem` em `sap.m.List` | <https://raw.githubusercontent.com/SAP/openui5/master/src/sap.m/src/sap/m/ObjectListItem.js> |
| Salesforce Lightning 1 | `.slds-max-medium-table_stacked`, `.slds-max-medium-table_stacked-horizontal` | <https://v1.lightningdesignsystem.com/components/data-tables/> |
| Carbon | `StructuredList` (selecionável) | <https://carbondesignsystem.com/components/structured-list/usage/> |
| Ant Design 6 | `List`, `List.Item`, `List.Item.Meta` | <https://ant.design/components/list> |
| React Aria | `GridList` | <https://react-spectrum.adobe.com/react-aria/GridList.html> |

As fontes discordam em três pontos que decidem a família:

- **Quem define o item.** MUI X e SLDS derivam o item das colunas da tabela:
  a mesma definição de colunas serve às duas formas. PatternFly, Polaris, Ant e
  React Aria recebem o item escrito pelo consumidor (`renderItem`, filhos). UI5
  fixa a anatomia do item (`title`, `number`, `numberUnit`, `intro`, `icon`,
  `attributes`, `firstStatus`, `secondStatus`).
- **Semântica e teclado.** PatternFly e Polaris escrevem `ul role="list"` e
  deixam o Tab percorrer os controlos. React Aria (`GridList`) e Carbon
  selecionável ligam as setas; React Aria troca o papel para `grid`.
- **Onde fica a ordenação.** Polaris desenha um `Select` de opções de ordenação
  no cabeçalho da lista (`sortOptions`, `sortValue`, `onSortChange`). MUI X lê a
  ordenação da grelha e perde o cabeçalho na forma de lista. PatternFly e Ant
  não ordenam.

## 2. Table stakes

| Capacidade | Quem entrega | Veredicto | Razão |
| --- | --- | --- | --- |
| Item derivado de um modelo de colunas partilhado com a forma tabular | MUI X (`listViewColumn` sobre `columns`), SLDS (`data-label` por célula), UI5 (`attributes`) | adapt | O item lê `GridColumn<Row>` de `@slotted/core/grid`: o mesmo `columns` que `data-grid`, `column-manager` e `saved-views` leem. `rowHeader` dá o título; `priority` ordena os campos; `popin: false` deixa a coluna fora do item, como deixa fora do pop-in. |
| Título do item e texto secundário | UI5 (`title`, `intro`), Ant (`Meta.title`, `Meta.description`), PatternFly (célula primária) | adopt | `title` é a coluna `rowHeader`, ou a primeira visível; `subtitle` nomeia uma coluna opcional, desenhada em `list-item` › `description`. |
| Valor à direita, lido de relance | UI5 (`number`, `numberUnit`), Ant (`extra`), Polaris (`shortcutActions` no fim) | adopt | `trailing` nomeia uma coluna, desenhada em `list-item` › `end`. `list-item` já move `end` para baixo do título abaixo de 22rem. |
| Pares rótulo/valor por prioridade | SLDS (`data-label`), UI5 (`attributes`), MUI X (pop-in no `renderCell`) | adopt | Os campos seguem `priority` (menor primeiro, depois a ordem declarada); `fields` limita quantos aparecem antes da divulgação. |
| Mídia à esquerda (avatar, miniatura, ícone) | UI5 (`icon`), Ant (`Meta.avatar`), Polaris (`media`) | adopt | Modelo de mídia por linha (`renderMedia` / `ng-template[slDataListMedia]`) em `list-item` › `start`, depois da caixa de seleção. |
| Seleção única e múltipla com caixa de seleção | Polaris (`selectable`, `selectedItems`), PatternFly (`DataListCheck`), Carbon (selecionável) | adopt | `selectionMode` `none` \| `single` \| `multiple`; `value`/`defaultValue`/`onValueChange` com `nextSelection` de `@slotted/core/collection`, a mesma união de `table` (`string \| null`, `readonly string[]`). Shift estende a partir da âncora, como em `table`. |
| Selecionar tudo com contagem no nome acessível | Polaris (`a11yCheckboxSelectAllMultiple` com `itemsLength`) | adopt | `select-all` no cabeçalho cobre as linhas que a query deixou e diz a contagem no nome; indeterminado com seleção parcial. É a regra de `data-grid`. |
| Ordenação sem cabeçalho de coluna | Polaris (`sortOptions`), Nexora `list-view-tools` (menu "Ordenar") | adapt | `sort` é um `menu` com dois grupos de rádio: a coluna (colunas `sortable`, mais "Sem ordenação") e a direção. Escreve a primeira chave de `query.sort` com razão `pointer`/`keyboard`; lê as restantes. Anuncia a ordem por `live-announcer`, como `table`. |
| Filtro e busca do mesmo modelo | Polaris (`filterControl`, `isFiltered`), MUI X (filtro da grelha) | adapt | `query.filter` (`FilterGroup`) e `query.search` são avaliados por `applyQuery`; o controlo que os edita é `filter-bar` e o `text-field` do consumidor, ligados à mesma query. Declinado desenhar um filtro próprio: `filter-bar` é a família dona (`<FilterBar value={query.filter} onValueChange={…}/>`). |
| Estado vazio e sem resultados distintos | Polaris (`emptyState`, `emptySearchState`), React Aria (`renderEmptyState`), Ant (`locale.emptyText`) | adopt | `empty` compõe `result-state`: `empty`, `no-results` (com "Limpar filtros", razão `clear`), `error` (com "Tentar de novo"). A família aplica a query, logo sabe qual dos três é. |
| Carregamento | Polaris (`loading`), Ant (`loading`), React Aria (`renderEmptyState` com spinner) | adopt | Primeira carga: `loader` desenha itens-esqueleto com a anatomia do item (skill `loading-states`). Recarga: `aria-busy` na raiz, itens atenuados, nada se move. |
| Carregar mais | Ant (`loadMore`), Polaris (`hasMoreItems`), React Aria (`GridListLoadMoreItem`) | adopt | `hasMore` e `onLoadMore` / `(loadMore)`; um `button` "Carregar mais" em `footer`. Declinado o scroll infinito: um rodapé que foge sob o ponteiro não é alcançável pelo teclado. |
| Paginação | Ant (`pagination`), Polaris (`pagination`) | adapt | `query.page` é aplicado pela família em modo cliente; o controlo é `pagination` do consumidor em `footer`, ligado à mesma query. |
| Item expansível | PatternFly (`DataListToggle`, `DataListContent`, `isExpanded`) | adapt | O que expande são os campos além de `fields`: `more` é um `button` com `aria-expanded` e `aria-controls`; `expanded`/`defaultExpanded`/`onExpandedChange` como conjunto de chaves, os nomes de `table` e `data-grid`. |
| Ação do item (abrir o registo) | PatternFly (`onSelectDataListItem`, clickable rows), React Aria (`onAction`), Polaris (`url`, `onClick`) | adopt | `href(row)` torna o título um `a`; `onActivate` / `(activate)` torna-o um `button`. A área de toque cobre o item; a caixa de seleção, `more` e as ações ficam acima dela. |
| Ações por item | PatternFly (`DataListAction`), Ant (`actions`), Polaris (`shortcutActions`) | adopt | A coluna `kind: 'actions'` é desenhada em `list-item` › `actions` pelo seu modelo, irmã do conteúdo. |
| Item desativado | PatternFly (`isDisabled` na caixa), Polaris (`ResourceItem` `disabled`) | adopt | `disabledKeys`: `list-item` com `disabled`, caixa desativada, ativação recusada, `nextSelection` salta a chave. |
| Grupos com cabeçalho | React Aria (`GridListSection`, `GridListHeader`), Ant (não), PatternFly (não) | adopt | `query.group` produz secções de `list` (`section`, `section-label`, `section-list`), com a contagem no rótulo. Uma fonte, mas `list` já as desenha e `applyQuery` já agrupa: o custo é o mapeamento. |
| Densidade | PatternFly (`isCompact`), Carbon (`condensed`) | adopt | Pelo eixo `density` do tema, lido por `list-item`; `size` de `list-item` (`sm`, `md`, `lg`) passa pela família. |
| Controlo do texto longo | PatternFly (`wrapModifier` `nowrap` \| `truncate` \| `breakWord`) | adapt | O título lê `truncate` de `list-item`; o valor de um campo quebra (`overflow-wrap: anywhere`) e nunca trunca, a regra do pop-in de `data-grid`. |
| Arrastar para reordenar | PatternFly (`DragDropSort`), Ant (drag sorting), React Aria (`dragAndDropHooks`) | defer to `data-grid` | Reordenar registos é uma ordem manual que um `sort` desfaz; num conjunto pequeno com ordenação por coluna, a ordem manual pertence à grelha com `row-handle` e `@slotted/core/drag`. |
| Navegação por setas e typeahead | React Aria (`GridList`), Carbon (↑/↓ selecionável) | decline | O escopo recusa a navegação de grelha. `role="list"` não admite setas (`list`, `keyboardDeparture`). A coleção com setas é `listbox` (opções simples) ou `data-grid` (registos). |
| Camada `layout="grid"` (itens em cartões) | React Aria (`layout="grid"`), Ant (`grid`) | defer to `grid` | Cartões em colunas são `grid` em volta de `card`: `<Grid columns={3}>{rows.map(r => <Card …/>)}</Grid>`. |

## 3. Diferenciais

| Capacidade | Porquê aqui |
| --- | --- |
| Uma query, três formas | `query` é `GridQuery`: o objeto que `data-grid`, `filter-bar` e `saved-views` já leem e que `toGridParams` já serializa. Trocar `data-grid` por `data-list` num contentor estreito mantém ordenação, filtro, busca, página e vista guardada sem conversão. Nenhuma fonte partilha o modelo entre uma lista e uma grelha sem ser a mesma grelha (MUI X). |
| Os mesmos campos que o pop-in | `priority`, `popin` e `columnState.hidden` decidem o item como decidem o pop-in de `data-grid`; os pares usam a geometria do pop-in (`auto-fill` de `9rem`, rótulo sobre valor, uma coluna rótulo-ao-lado abaixo de `19rem`). Um registo lê-se igual nas duas famílias num telefone. |
| Troca por classe de tamanho documentada | A página de referência mostra `createWidthGate` de `@slotted/core/measure` em `COMPACT_BELOW` a alternar `table` e `data-list` sobre o mesmo estado; a família não finge ser tabela quando larga. |
| Esquemas, densidades e RTL por composição | Três esquemas, três densidades e propriedades lógicas vêm de `list`, `list-item`, `checkbox`, `menu` e `result-state`; a família acrescenta só a grelha de campos e a área de toque. |

## 4. Lacunas

| Caso | Resposta |
| --- | --- |
| Valor vazio num campo | O mesmo marcador da célula de `data-grid`, com o texto `labels.empty` para leitor de ecrã. Um campo vazio nunca desaparece: a posição dos pares seria diferente de item para item. |
| Cem itens e um telefone | Declinada a virtualização: o escopo é um conjunto pequeno. `hasMore` e `query.page` limitam o DOM; um conjunto que precisa de janela é `data-grid`. |
| Ação que falha sobre um item | `loadingKeys`: o item fica `loading` (`aria-busy`, ação recusada, largura mantida) enquanto a aplicação grava; o erro é da aplicação (`toast`). |
| Valor sem espaços (hash, URL, e-mail) | `overflow-wrap: anywhere` no valor; o título quebra em `list-item` › `label`. |
| Seleção sobre itens que a query esconde | A seleção guarda chaves; um filtro não a apaga, e a contagem do cabeçalho diz quantas estão selecionadas no total e quantas estão visíveis. |
| Ordem de várias chaves vinda de `data-grid` | O menu edita a primeira chave e mostra "e mais N" no gatilho; o anúncio diz a ordem inteira. |

## 5. Anatomia herdada do escopo, revista

O escopo manda compor `description-list`. A família compõe `list` e `list-item`
e desenha os pares num `dl` próprio (`fields`, `field`, `field-label`,
`field-value`). `description-list` responde ao seu próprio contentor com
limiares de painel (três colunas a duas em 48rem, duas a uma em 34rem, linha a
pilha em 26rem): no corpo de um item de telefone, 17 a 20rem, dá sempre uma
coluna empilhada, duas linhas por campo. A geometria do pop-in de `data-grid`
dá duas colunas de campos a partir de 18rem. O custo: a regra do par rótulo/valor
passa a viver em três folhas (`description-list`, `data-grid` pop-in, `data-list`),
e a de `data-list` copia a do pop-in em vez de a importar.
