# Gestão de colunas e de vistas do `data-grid` — design

Data: 2026-09-23. Âmbito: família nova `column-manager`, família nova `saved-views`,
extensões de `data-grid` e de `@slotted/core/grid`, e a demo Nexora Angular.

As duas paragens da skill `component` (Step 9 e Step 14) não bloqueiam esta sessão: o
pedido exige execução de ponta a ponta com validação única no fim. Cada decisão que uma
paragem levaria ao revisor está registada neste documento.

## 1. Inventário de capacidades

### Surveyed

AG Grid (Columns Tool Panel, Column Chooser), MUI X Data Grid (Columns panel,
`columnVisibilityModel`, `initialState`), Kendo Grid (Column Chooser, Column Menu),
DevExtreme DataGrid (Column Chooser em modo `select` e `dragAndDrop`, `stateStoring`),
TanStack Table (`columnVisibility`, `columnOrder`, `columnPinning`), Airtable e Notion
(vistas nomeadas com indicador de alteração), Linear (vistas com "Reverter").

### Table stakes

- Lista de colunas com checkbox de visibilidade e busca por nome (AG Grid, MUI X, Kendo,
  DevExtreme).
- Reordenação por arraste na lista (AG Grid, DevExtreme `dragAndDrop`).
- "Mostrar todas" e "Restaurar" (MUI X, AG Grid).
- Coluna obrigatória não ocultável (MUI X `hideable: false`, AG Grid `lockVisible`).
- Estado de colunas serializável e restaurável (MUI X `exportState`, DevExtreme
  `stateStoring`).
- Vistas nomeadas: salvar, salvar como, renomear, excluir, vista padrão (Airtable,
  Notion, Linear).

### Differentiators

- Reordenação por teclado com anúncio da posição (nenhum dos quatro grids inspecionados o
  oferece no painel).
- Política `apply: 'live' | 'confirm'` por instância.
- Colunas ocultas por espaço listadas à parte das ocultas pelo leitor.
- Contagem de colunas ocultas no nome acessível do gatilho.
- Indicador de vista alterada com "Reverter" (Linear, Notion), ligado à comparação textual
  do `GridView` serializado.
- Ajuda por coluna ligada ao `columnheader` por `aria-describedby`.

### Gaps

- `table` não expõe `GridColumnState`: o seu contrato não declara `columnState`, e as
  colunas de `table` são marcação do consumidor. `column-manager` serve apenas ao
  `data-grid`. A reabertura fica registada em `docs/process/build-order.md`.
- Grupos de colunas (`columnGroups`) não aparecem como secções no `column-manager`: a
  lista segue as zonas de fixação, que são factos do estado.

## 2. `@slotted/core/grid`

### 2.1 `GridColumn`

| Campo         | Tipo      | Significado                                                                                                |
| ------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `description` | `string`  | Texto curto sobre a coluna. Origem do `aria-describedby` do cabeçalho, do menu e da linha do manager.      |
| `priority`    | `number`  | Prioridade responsiva. Menor valor = mais importante. Uma coluna sem `priority` nunca é ocultada por espaço. |

### 2.2 Ocultação por espaço

`columnsHiddenBySpace(resolved, available, options?) → string[]` em `columns.ts`.

- Entrada: as colunas resolvidas (já sem as ocultas pelo leitor), a largura interior do
  frame em pixels e `leading` (as calhas).
- Largura exigida por coluna: `minWidth` para uma coluna com `flex`; `width` nas demais.
- Remove colunas com `priority` definida, da maior `priority` para a menor; em empate, a
  declarada mais tarde sai primeiro. Para quando a soma cabe em `available`.
- Nunca remove a última coluna visível.
- `available <= 0` (frame ainda não medido) devolve `[]`.

### 2.3 Diferença de estados

`columnStateChanges(previous, next) → GridColumnStateChange[]`: as chaves de
`GridColumnState` que diferem, na ordem `order`, `width`, `hidden`, `pinned`. Usado pelo
`column-manager` para preencher `change` e `changes`.

### 2.4 `GridView` com densidade, versionado

```ts
type GridDensity = 'comfortable' | 'compact' | 'dense';
interface GridView {
  readonly columns: GridColumnState;
  readonly query: GridQuery;
  readonly density: GridDensity | null;
}
```

- `serializeGridView` escreve `density=<valor>` quando a densidade não é `null`, e
  `v=1` sempre que o texto não é vazio.
- `parseGridView` é total: `density` fora do conjunto dá `null`; `v` ausente é lido como
  versão 1; `v` maior do que a versão conhecida lê as chaves conhecidas e ignora as
  restantes; `v` não numérico é ignorado.
- `GRID_VIEW_VERSION = 1` é exportado.
- `persistedGridView` (Angular) e `usePersistedGridView` (React) ganham `density`
  (`WritableSignal<GridDensity | null>` / valor e `onDensityChange`) e
  `defaultDensity`.

### 2.5 Vistas salvas

`saved-views.ts` em `@slotted/core/grid`:

```ts
interface SavedView {
  readonly id: string;
  readonly name: string;
  /** O GridView serializado por serializeGridView. */
  readonly view: string;
}
interface SavedViewsState {
  readonly views: readonly SavedView[];
  /** A vista aplicada ao abrir a página; `null` = a vista embutida. */
  readonly defaultId: string | null;
  /** A vista aplicada por último; `null` = a vista embutida. */
  readonly activeId: string | null;
}
```

- `BUILT_IN_VIEW_ID = '__default'`: a vista embutida "Padrão". Não está em `views`;
  não se renomeia, não se sobrescreve, não se exclui.
- `serializeSavedViews(state) → string` (JSON com `v: 1`); `parseSavedViews(text)` total:
  JSON inválido, entradas sem `id` ou `name` string, ids repetidos e `defaultId` /
  `activeId` que não nomeiam uma vista são descartados.
- `withViewSaved`, `withViewCreated(state, name, view, id)`, `withViewRenamed`,
  `withViewDeleted` (se era a ativa ou a padrão, volta a `null`),
  `withDefaultView`, `withActiveView`: funções puras.
- `sameGridView(a, b, columns)`: igualdade pelo texto de `serializeGridView`, que já
  normaliza ordem omitida e larguras não tocadas.

## 3. Família `column-manager`

### 3.1 Responsabilidade

Edita um `GridColumnState` com a lista das colunas. Não conhece o `data-grid`: recebe as
colunas, o estado e o conjunto oculto por espaço. O `data-grid` não compõe o manager; a
aplicação liga `manageColumns` / `onManageColumns` a `open`.

### 3.2 Anatomia

| Parte         | Elemento   | Papel / nota                                                                                  |
| ------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `root`        | `div`      | `data-ui="column-manager"`, `role="group"`, `aria-labelledby` = título.                        |
| `header`      | `div`      | Título e contagem visível de colunas.                                                         |
| `title`       | `h2`       | Rótulo `title`.                                                                               |
| `search`      | `div`      | Composto: `text-field` `type="search"`, tamanho `sm`.                                         |
| `list`        | `div`      | Rolador das secções.                                                                          |
| `section`     | `div`      | Uma por zona com colunas: início, meio, fim. `role="group"`, `aria-labelledby` = `section-label`. |
| `section-label` | `div`    | Nome da zona.                                                                                 |
| `item`        | `div`      | Uma coluna. `data-column`, `data-hidden`, `data-locked`, `data-space-hidden`, `data-pinned`, `data-dragging`, `data-drop-target`. |
| `handle`      | `button`   | Alça: arraste por ponteiro, `Alt+ArrowUp/Down` por teclado. `aria-label` = `reorder`.          |
| `visibility`  | `span`     | Composto: `checkbox`. Nome = rótulo da coluna; descrição por `aria-describedby`.              |
| `description` | `span`     | Texto de `GridColumn.description`. Sempre no DOM quando existe.                               |
| `status`      | `span`     | "Obrigatória" (`hideable: false`) ou "Oculta por espaço".                                     |
| `pin`         | `button`   | Composto: gatilho de `menu` com "Fixar no início", "Fixar no fim", "Soltar".                  |
| `drop-indicator` | `div`   | Linha de destino durante o arraste.                                                           |
| `empty`       | `div`      | A busca não encontrou coluna.                                                                 |
| `footer`      | `div`      | Ações.                                                                                        |
| `show-all`    | `button`   | "Mostrar todas": remove `hidden` inteiro, exceto nada a manter.                               |
| `reset`       | `button`   | "Restaurar padrão": pede `defaultColumnState` normalizado.                                   |
| `cancel`      | `button`   | Só em `confirm`.                                                                              |
| `apply`       | `button`   | Só em `confirm`.                                                                              |
| `trigger`     | `button`   | Diretiva/componente do consumidor. Abre o manager.                                            |
| `count`       | `span`     | Contagem de colunas ocultas no gatilho; `aria-hidden`, e a mesma frase num `visually-hidden`. |

### 3.3 Regras

- Uma coluna com `hideable: false` tem o checkbox marcado e desativado, `data-locked`, e
  `status` = rótulo `required`.
- A última coluna visível tem o checkbox desativado: o manager nunca pede um estado sem
  colunas visíveis.
- `hiddenBySpace` (ids): a linha mantém o checkbox no valor do leitor e mostra
  `status` = `hiddenBySpace`.
- Busca: filtra por rótulo e por `description`, sem diferença de maiúsculas nem de
  acentos (`normalize('NFD')` sem marcas). Durante uma busca não vazia, a alça fica
  desativada: a posição num subconjunto não diz a posição na lista.
- Reordenação dentro da zona, como no `data-grid` (`withColumnMoved` e `zoneOf` lógicos
  sobre `state.order` e `state.pinned`). Arraste por `@slotted/core/drag`, contentor
  vertical por secção. `Alt+ArrowUp/Down` na alça é `moveBy(-1/+1)`. Anúncio
  `moved` pelo live announcer.
- `apply: 'live'`: cada ação emite um pedido. `apply: 'confirm'`: as ações editam um
  rascunho; Aplicar emite um pedido único com razão `submit`; Cancelar, Escape e o
  fecho da camada descartam o rascunho.
- `presentation: 'popover'` compõe `popover` ancorado no gatilho, largura
  `--slotted-column-manager-inline-size`; `presentation: 'drawer'` compõe `drawer` no
  lado `end`, tamanho `sm`.

### 3.4 Modelo de estado

| Capacidade | Controlado    | Não controlado       | Pedido                                                   | Razões                                                  |
| ---------- | ------------- | -------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| `columns`  | `columnState` | `defaultColumnState` | `columnStateChangeRequest` / `onColumnStateChange`       | `pointer`, `keyboard`, `clear`, `submit`, `programmatic` |
| `open`     | `open`        | `defaultOpen`        | `openChangeRequest` / `onOpenChange`                     | `pointer`, `keyboard`, `escape`, `outsidePress`, `programmatic` |

O pedido de colunas é o do `data-grid` mais `changes`:

```ts
interface ColumnManagerRequest extends ChangeRequest<GridColumnState> {
  readonly change: GridColumnStateChange;           // changes[0]
  readonly changes: readonly GridColumnStateChange[]; // columnStateChanges(previous, value)
}
```

`defaultColumnState` tem dois papéis: estado inicial no modo não controlado, e alvo de
"Restaurar padrão" (razão `clear`) nos dois modos. "Mostrar todas" usa `pointer` ou
`keyboard` conforme o evento.

### 3.5 API

Angular (`@slotted/angular/column-manager`):

```html
<button slButton slColumnManagerTrigger [slColumnManagerTriggerFor]="manager">Colunas</button>
<sl-column-manager
  #manager="slColumnManager"
  [columns]="columns"
  [columnState]="view.columnState()"
  (columnStateChangeRequest)="view.columnState.set($event.value)"
  [defaultColumnState]="defaults"
  [hiddenBySpace]="grid.hiddenBySpace()"
  presentation="popover"
  apply="live"
/>
<sl-data-grid #grid="slDataGrid" manageable (manageColumns)="manager.show()" … />
```

Entradas: `columns`, `columnState` (model), `defaultColumnState`, `hiddenBySpace`,
`presentation`, `apply`, `open` (model), `labels`. Saídas:
`columnStateChangeRequest`, `openChangeRequest`. Métodos: `show()`, `hide()`.
`provideColumnManagerDefaults({ presentation, apply, labels })`. `exportAs:
'slColumnManager'`. A diretiva `[slColumnManagerTrigger]` escreve `aria-haspopup`,
`aria-expanded`, `aria-controls` e projeta a parte `count` depois do conteúdo.

React (`@slotted/react/column-manager`):

```tsx
<ColumnManagerTrigger manager={ref}>Colunas</ColumnManagerTrigger>
<ColumnManager
  ref={ref}
  columns={columns}
  columnState={view.columnState}
  onColumnStateChange={view.onColumnStateChange}
  defaultColumnState={defaults}
  hiddenBySpace={hidden}
  presentation="popover"
  apply="live"
/>
```

`ColumnManager` e `ColumnManagerTrigger` partilham o estado `open` por um
`ColumnManagerRoot` opcional ou pelo `ref` (`ColumnManagerHandle`: `show()`, `hide()`,
`toggle()`). `ColumnManagerProvider` define os padrões.

### 3.6 Rótulos

`title` "Columns", `search` "Search columns", `noResults` "No columns match",
`showAll` "Show all", `reset` "Restore defaults", `apply` "Apply", `cancel` "Cancel",
`pinnedStart` "Pinned to start", `unpinned` "Columns", `pinnedEnd` "Pinned to end",
`pin` "Pin {column}", `pinStart` "Pin to start", `pinEnd` "Pin to end", `unpin` "Unpin",
`reorder` "Reorder {column}", `moved` "{column} moved to position {position}",
`required` "Required", `hiddenBySpace` "Hidden for space", `hiddenCountOne`
"1 hidden column", `hiddenCountOther` "{count} hidden columns", `visibleCount`
"{visible} of {total} shown". A aplicação traduz por `labels` ou pelo provider.

### 3.7 Teclado

| Tecla              | Onde        | Efeito                                                     |
| ------------------ | ----------- | ---------------------------------------------------------- |
| `Tab`              | camada      | Ordem nativa: busca, cada linha (checkbox, alça, fixar), rodapé. |
| `Space`            | checkbox    | Alterna a visibilidade.                                    |
| `Alt+ArrowUp/Down` | alça        | Move a coluna uma posição na zona; foco fica na alça.      |
| `Escape`           | durante arraste | Cancela o arraste (`@slotted/core/drag`).              |
| `Escape`           | camada      | Fecha; em `confirm`, descarta o rascunho.                  |
| `Enter` / `Space`  | `pin`       | Abre o menu de fixação.                                    |

A ordem nativa dá três paragens por linha. Um `role="grid"` de disposição reduziria as
paragens a uma e obrigaria a um modelo de cursor próprio; a lista inspecionada do AG Grid
e do MUI X usa ordem nativa, e a busca reduz a lista antes do `Tab`.

### 3.8 Tokens

`--slotted-column-manager-inline-size` (camada de componente, `22rem`),
`--slotted-column-manager-list-max-block-size` (`min(60vh, 28rem)`). Tudo o resto lê
tokens de fundação: espaço, `--slotted-control-*`, `--slotted-text-muted`,
`--slotted-border-subtle`, `--slotted-focus-ring-*`.

### 3.9 Decisões de implementação

- `presentation` ganha o valor `inline`: o root fica no lugar onde é escrito, para um
  hospedeiro que a aplicação já possui (painel lateral próprio, página de definições). Em
  `inline` com `apply: 'confirm'`, o rascunho existe desde a primeira ação e Aplicar e
  Cancelar não fecham camada nenhuma.
- Partes novas `summary` (a contagem "7 of 9 shown" do cabeçalho) e `search-icon` (o
  glifo no slot inicial do `text-field`, como em `filter-bar`).
- `visibility` é um `div`: envolve o root `div` do `checkbox`.
- `status` fica dentro do rótulo do checkbox, depois do nome da coluna e de um espaço: o
  nome acessível é "Order Required" e "Região Hidden for space". `description` é a
  descrição do próprio `checkbox` (`description` em React, `slCheckboxDescription` em
  Angular), que já escreve o `aria-describedby`.
- Uma secção sozinha recebe `data-sole` e o seu rótulo fica apenas para leitores de
  ecrã: "Columns" sob o título "Columns" repetiria a palavra.
- O gatilho é selecionado por `data-column-manager-trigger`, atributo que a família
  escreve no botão do consumidor: o botão é o root de outra família (`button`), e a
  `data-part="trigger"` que a família reescreve não basta para o identificar.
- A alça desativada usa `aria-disabled` e mantém a paragem de `Tab`, para o leitor saber
  porque não se move. `Alt+ArrowUp/Down` na borda da zona não faz nada nem anuncia.
- O `moveBy` do controlador de arraste é silencioso; a família anuncia `moved` uma vez.
  Num arraste por ponteiro, a mensagem `dropped` do controlador é o rótulo `moved`, e a
  mensagem `moved` passo a passo fica vazia.
- React: `ColumnManagerTrigger` encontra o manager pelo `ref` (`manager={ref}`) ou por um
  `ColumnManagerRoot` à volta de ambos; sem `render`, desenha um `Button` secondary
  outline. O popover e o drawer recebem o gatilho da família como `triggerNode` e como
  origem do portal, respetivamente.
- Angular: `[slColumnManagerTrigger]` é uma diretiva e não projeta conteúdo; acrescenta
  ao host, depois da primeira renderização, o `span` `count` e a frase `visually-hidden`,
  e mantém-nos a partir de `hiddenCount()`.
- Abaixo de `20rem` de largura própria (`@container column-manager`), o rodapé dispõe as
  quatro ações duas a duas.

## 4. Família `saved-views`

### 4.1 Nome

`saved-views`: não colide com nenhuma família, com `data-ui` existente ou com
`docs/process/build-order.md`.

### 4.2 Anatomia

| Parte       | Elemento | Papel                                                                              |
| ----------- | -------- | ---------------------------------------------------------------------------------- |
| `root`      | `div`    | `data-ui="saved-views"`, `role="group"`, `aria-label` = `label`. `data-modified`.  |
| `trigger`   | `button` | Nome da vista ativa; abre a camada (`popover`).                                    |
| `modified`  | `span`   | Marca visível "Alterada" quando o `GridView` atual difere do da vista ativa.       |
| `revert`    | `button` | "Reverter": pede a vista ativa. Só com `data-modified`.                            |
| `panel`     | `div`    | Conteúdo da camada.                                                                |
| `list`      | `ul`     | `role="list"`.                                                                     |
| `item`      | `li`     | `data-active`, `data-default`, `data-built-in`.                                    |
| `apply`     | `button` | Aplica a vista. `aria-current="true"` na ativa.                                    |
| `default-mark` | `span` | Marca de vista padrão; texto oculto "padrão".                                     |
| `actions`   | `button` | Gatilho de `menu`: Renomear, Definir como padrão, Excluir. Ausente na embutida, exceto "Definir como padrão". |
| `form`      | `form`   | Nome da vista nova ou renomeada: `text-field` + Salvar/Cancelar.                   |
| `footer`    | `div`    | "Salvar" (sobrescreve a ativa; desativado na embutida e sem alteração) e "Salvar como…". |
| `confirm`   | `div`    | Confirmação inline de exclusão com o nome da vista.                                |

### 4.3 Modelo de estado

| Capacidade | Controlado | Não controlado | Pedido                                        | Razões                              |
| ---------- | ---------- | -------------- | --------------------------------------------- | ----------------------------------- |
| `views`    | `state` (`SavedViewsState`) | `defaultState` | `stateChangeRequest` / `onStateChange` | `pointer`, `keyboard`, `submit`, `remove`, `programmatic` |
| `open`     | `open`     | `defaultOpen`  | `openChangeRequest` / `onOpenChange`          | as do `popover`                     |

O pedido de `state` carrega `action: 'apply' | 'save' | 'create' | 'rename' | 'delete' |
'default' | 'revert'`. A família emite também `viewApply` / `onViewApply` com o
`GridView` a aplicar (após `apply` e `revert`): o consumidor escreve-o no grid.

Entradas: `current: GridView` (a vista em uso), `builtIn: GridView` (a vista "Padrão"),
`columns` (para a comparação e a serialização), `label`, `labels`.

### 4.4 Persistência

`persistedSavedViews({ key, storage, columns })` (Angular) e `usePersistedSavedViews`
(React), sobre a mesma `GridViewStorage` de `persistedGridView`: um sinal/valor
`state`, escrita após cada mudança, leitura total por `parseSavedViews`. A vista
padrão aplica-se na primeira leitura quando `activeId` é `null` e `defaultId` não.

### 4.5 Rótulos

`label` "Views", `builtIn` "Default", `modified` "Modified", `revert` "Revert",
`save` "Save", `saveAs` "Save as new view…", `name` "View name", `create` "Save view",
`rename` "Rename", `setDefault` "Set as default", `isDefault` "default",
`delete` "Delete", `confirmDelete` "Delete “{name}”?", `cancel` "Cancel",
`applied` "View {name} applied", `saved` "View {name} saved", `deleted`
"View {name} deleted", `duplicate` "A view with this name already exists".

### 4.6 Teclado e ARIA

Ordem nativa dentro do `popover`. `Escape` no formulário cancela o formulário antes de a
camada fechar (a regra do `dismissable-layer` em `docs/build-briefing.md`: a família
recusa o pedido de fecho enquanto o formulário está aberto). Cada ação anuncia o
resultado pelo live announcer. O nome duplicado marca o campo `invalid` com a
mensagem `duplicate`.

### 4.7 Tokens

`--slotted-saved-views-panel-inline-size` (`18rem`). Marca `modified`: ponto de
`--slotted-tone-accent-solid` com o texto.

### 4.8 Decisões de implementação

- `views` entra em `KNOWN_CAPABILITIES` e `MUTABLE_CAPABILITIES` de
  `specs/contract.schema.mjs`: o modelo de estado de §4.3 não era exprimível sem a palavra.
- O item marca a vista em uso com `data-current`, não `data-active`: `active` é o
  pseudo-estado de pressão no vocabulário partilhado. O `apply` leva `aria-current="true"`.
- O painel leva `data-ui="saved-views"` além do `data-part="panel"`, porque a camada é
  portada para fora da raiz. A largura é uma faixa `minmax(0, token)`: o painel estreita
  quando o `popover` tem menos de `18rem`.
- Rótulos acrescentados a §4.5: `actions` ("Actions for {name}", nome do gatilho do menu
  por linha), `renamed`, `defaultChanged` (anúncios das duas ações que §4.5 não cobria) e
  `empty` ("Enter a name for the view"). O nome da vista embutida também conta como
  duplicado.
- `apply` e `save` fecham a camada; o foco volta ao gatilho. `revert` move o foco para o
  gatilho, porque o próprio botão desaparece. Formulário submetido foca o `apply` da
  linha; formulário cancelado foca o controlo que o abriu; exclusão confirmada foca o
  `apply` da linha anterior.
- Excluir a vista em uso não emite `viewApply`: o grid conserva o arranjo, que passa a
  ler-se como alterado face à vista embutida.
- `revert`, e `apply` da vista já em uso, não emitem pedido de estado (o estado não muda);
  `viewApply` é emitido com o pedido não emitido, `action: 'revert'` ou `'apply'`.
- Marca da vista padrão: glifo `pin` (o conjunto não tem estrela) e a palavra oculta,
  separada do nome por um espaço para o nome acessível ler "Late orders default".
- Persistência: `persistedSavedViews` / `usePersistedSavedViews` aceitam `columns` e
  devolvem `openedDefault: GridView | null` — a vista padrão aplicada na primeira leitura
  (§4.4), para o consumidor a escrever no grid uma vez.
- Angular: o pedido de fecho do `popover` é sempre recusado e reemitido como
  `openChangeRequest` da família, para a camada seguir um único estado `open`.

## 5. Extensões do `data-grid`

### 5.1 Ajuda por coluna

- Parte nova `column-help` (`button`) em `column-actions`, antes de `filter` e do menu.
  Aparece quando a coluna tem `description`, `slDataGridColumnHelp` (Angular) ou
  `help` (React).
- Abre um `popover` ao clique, `Enter` e `Space`, nunca por hover. Sempre visível
  (não revelado por hover), porque um ponteiro grosso não tem hover; o tamanho segue a
  regra `controls.size` do contrato.
- Parte nova `column-description` (`span`, `visually-hidden`) no `columnheader`, com o
  texto de `description`. O `columnheader` recebe `aria-describedby` com o seu id, antes
  do id das instruções de arraste.
- Teclado: o `columnheader` é uma célula com vários widgets. `F2` entra na célula e foca
  o primeiro widget de `column-actions`; `Tab` percorre os widgets da célula; `Escape`
  volta à célula (`cursor.focusInside`). `Enter` no cabeçalho continua a ordenar.
- O menu de coluna mostra a `description` como texto no topo (parte
  `column-menu-description`, `aria-hidden`) e a lê por `aria-describedby` do menu.
- Angular: `<ng-template slDataGridColumnHelp="colId">…</ng-template>`. React:
  `DataGridColumn.help?: ReactNode`.

### 5.2 Anúncio ao ocultar

Rótulo `columnHidden` "{column} hidden". `hide()` anuncia pelo live announcer que o grid
já usa. A receita de desfazer é da aplicação: `toast` com ação "Desfazer" que devolve o
`previous` do pedido `change: 'hidden'`.

### 5.3 Ajustar todas

- Item de menu `autofitAll` "Fit all columns", logo após `autofit`.
- `Shift` + duplo clique no `resizer` ajusta todas; duplo clique sem `Shift` ajusta a
  coluna.
- Razões: `pointer` para o duplo clique e para um item de menu escolhido por ponteiro;
  `keyboard` para `Ctrl+Shift+Enter` e para um item escolhido por teclado;
  `programmatic` para `autofit()` chamado pelo handle. `change` é `width`.

### 5.4 Rótulo truncado

O `columnheader` já compõe `tooltip` com `whenClipped`: abre só quando o rótulo mede mais
do que a caixa. Um teste por binding fixa o comportamento.

### 5.5 Prioridade responsiva

- `ResizeObserver` no frame. `hiddenBySpace` = `columnsHiddenBySpace(...)` sobre as
  colunas resolvidas.
- As colunas ocultas por espaço saem do DOM e da trilha como uma oculta; `aria-colcount`
  conta as restantes.
- Não entra em `columnState`, não é persistido, não emite `columnStateChangeRequest`.
- Angular: `readonly hiddenBySpace: Signal<readonly string[]>` público e saída
  `hiddenBySpaceChange`. React: `onHiddenBySpaceChange(ids)` e
  `DataGridHandle.getHiddenBySpace()`.
- Atributo `data-space-hidden="<n>"` no root quando há colunas ocultas por espaço.

### 5.6 Densidade

- Entrada `density: 'comfortable' | 'compact' | 'dense' | undefined`. Escreve
  `data-slotted-density` no root; ausente, o grid herda a densidade da página.
- Verificação: `packages/theme-default` emite cada bloco de densidade com o seletor
  descendente `[data-slotted-theme="default"] [data-slotted-density="…"]`, e os tokens
  de componente do `data-grid` são declarados no próprio root. O eixo já se escopa por
  elemento; nenhuma mudança no tema.
- Camadas abertas pelo grid (menu, filtro, ajuda) são portais fora do root e ficam na
  densidade da página.

### 5.7 Contrato

- `columnState.manager` passa a descrever a composição: a aplicação liga
  `manageColumns` ao `column-manager`.
- `declined.columnManagerPanel` sai; `composition.columnManager` regista a ligação.
- Partes novas: `column-help`, `column-description`, `column-menu-description`.
- Rótulos novos: `columnHidden`, `autofitAll`, `columnHelp` ("About {column}").
- `data.columns` inclui `description` e `priority`.
- Eixo novo `density`.

## 6. Demo Nexora Angular

Páginas: customers, contacts, orders, quotes, products, skus.

- `persistedGridView` por página (chave `nexora.<página>.view`) para colunas e
  densidade; a consulta continua do store da página, que a carrega do backend.
- Gatilho do `column-manager` na barra da página; `manageColumns` do grid abre o mesmo
  manager.
- Toast "Desfazer" em todo pedido `change: 'hidden'`.
- `saved-views` com `persistedSavedViews` (chave `nexora.<página>.views`).
- Controlo de densidade (`segmented-control`) no manager ou na barra.
- `description` nas colunas de valores calculados, estados e datas de referência.
- `priority` nas colunas, em vez de `PHONE_COLUMN_IDS`.

## 7. Custo de uma decisão errada

| Decisão                                   | Custo de a corrigir depois                           |
| ----------------------------------------- | ---------------------------------------------------- |
| Ordem nativa no manager                   | Troca de `role` e de modelo de foco no manager.      |
| `change` + `changes` no pedido do manager | Tipo público do pedido nos dois bindings.            |
| Prioridade opt-in                         | Nenhum consumidor quebra ao inverter o padrão.        |
| Densidade por atributo no root            | Nenhum: o tema já resolve o eixo por elemento.       |
| Vistas em JSON versionado                 | `parseSavedViews` lê a versão 1 para sempre.         |
