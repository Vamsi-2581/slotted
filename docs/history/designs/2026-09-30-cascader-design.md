# cascader — inventário e decisões

Estado: passos 3 a 13 do `/component` concluídos; à espera do gate de release (passo 14).

## Nome e âmbito

`docs/process/build-order.md` (onda 11) reserva `hierarchical-picker` para "seleção em árvore ou cascata", com "TreeSelect e Cascader como dois recipes do mesmo núcleo" e navegação por níveis em tela estreita. A invocação é `/component cascader`.

Decisão: a família chama-se `cascader` e cumpre o âmbito inteiro de `hierarchical-picker`. O eixo `layout` (`columns`, `drill`, `tree`) é o recipe; o núcleo, o valor, a pesquisa e o carregamento são um só. O ReUI chega à mesma forma: um primitivo `Cascader` com `mode="drill" | "columns" | "tree"`. A linha `hierarchical-picker` de `build-order.md` passa a apontar para `cascader` no commit da família.

Custo de reverter no gate visual: renomear diretórios e `data-ui`; nenhum binding existe ainda.

## 1. Surveyed

| Implementação | Nome | Fonte | Forma |
| --- | --- | --- | --- |
| ReUI | `Cascader` | `https://reui.io/docs/components/base/cascader.md` (cópia em `tools/harness/out/specimen/reui-src/cascader.md`), 20 exemplos `c-cascader-*`, bloco Pro `data-grid-columns-5` | Primitivo composto sobre o combobox do Base UI: `CascaderTrigger`, `CascaderValue`, `CascaderContent`, `CascaderPanel`, `CascaderNav`, `CascaderInput`, `CascaderBreadcrumb`, `CascaderList`, `CascaderItems`, `CascaderEmpty`, `CascaderStatus`, `CascaderFooter`, `CascaderAction`, `CascaderColumns`, `CascaderVirtualItems`, `CascaderChips`. Cinco estados controláveis: `value`, `path`, `expanded`, `open`, `inputValue`. Demonstração viva com a melhor imagem do survey. |
| Ant Design 5 | `Cascader`, `Cascader.Panel` | `https://ant.design/components/cascader` | Componente configurado por `options`: `changeOnSelect`, `expandTrigger`, `loadData`, `multiple`, `showCheckedStrategy`, `showSearch` (`filter`, `render`, `limit`), `displayRender`, `optionRender`, `fieldNames`, `maxTagCount`; painel embutido em `Cascader.Panel`. |
| Element Plus | `el-cascader`, `el-cascader-panel` | `https://element-plus.org/en-US/component/cascader.html` | `props` com `expandTrigger`, `multiple`, `checkStrictly`, `emitPath`, `lazy`/`lazyLoad`, `leaf`; `filterable` e `filter-method`, `show-all-levels`, `separator`, `collapse-tags`, `clearable`. |
| PrimeNG | `p-cascadeSelect` | `https://primeng.org/cascadeselect` | Angular com `ControlValueAccessor`; `role="combobox"` no controlo e `role="tree"` / `treeitem` / `group` no popup; teclado próprio (setas abrem e fecham níveis, Enter e Space escolhem). |
| NG-ZORRO | `nz-cascader` | `https://ng.ant.design/components/cascader/en` | Angular: `nzLoadData` (Promise ou Observable), `nzChangeOnSelect`, `nzChangeOn` (predicado), `nzExpandTrigger`, `nzLabelRender` (template), `nzMouseEnterDelay` 150. |
| Slotted `tree`, `select`, `entity-picker` | — | `specs/components/{tree,select,entity-picker}/contract.json`, `packages/core/src/collection/tree.ts` | Núcleo já existente: `createTreeCollection`, `cascadeSelection`, `indeterminateKeys`, filtro com antepassados, janela virtual; `select` com `tags`/`summary`; `entity-picker` com pesquisa atrasada, cache por id e resolução em lote. |

Radix, Base UI, Ark, React Aria, Angular CDK, Fluent, Carbon e Primer não publicam cascader. React Aria compõe `Menu` com submenus e `Tree`; o `menu` Slotted cobre esse análogo (dossiê `2026-09-30-menu-reui-dossier.md`).

## 2. Table stakes

| Capacidade | Quem publica | Veredicto | Razão |
| --- | --- | --- | --- |
| Colunas lado a lado, uma por nível | Ant, Element, PrimeNG, NG-ZORRO, ReUI (`columns`) | `adopt` | Forma canónica do cascader. |
| Painel embutido sem popup | Ant `Cascader.Panel`, Element `el-cascader-panel`, ReUI `inline` | `adopt` | Parte `panel` utilizável fora de `content`, como `calendar` fora de `date-picker`. |
| Escolha de folha ou de qualquer nível | Ant `changeOnSelect`, Element `checkStrictly`, NG-ZORRO `nzChangeOn`, ReUI `selectable` | `adapt` | `selectable: 'leaf' \| 'any' \| (node) => boolean`; um nome, três formas. |
| Seleção múltipla com checkbox | Ant, Element, ReUI | `adopt` | `selectionMode="multiple"` com o vocabulário de `tree` e `listbox`. |
| Propagação pai-filho e estado indeterminado | Ant `showCheckedStrategy`, Element (omissão), ReUI `cascade` | `adopt` | `cascadeSelection` e `indeterminateKeys` já existem em `@slotted/core/collection`. |
| Estratégia de apresentação dos marcados | Ant `SHOW_PARENT`/`SHOW_CHILD`, Element `emitPath` | `adapt` | `checkedStrategy: 'all' \| 'parent' \| 'child'` decide o valor emitido, não só o desenho. |
| Carregamento preguiçoso por nó | Ant `loadData`, Element `lazyLoad`, NG-ZORRO `nzLoadData`, ReUI `getChildren` | `adapt` | Nós com `hasChildren`; o pedido de carga sai como evento com razão, como em `tree`; estados `loading` e erro por nível com repetição. |
| Pesquisa através dos níveis com o caminho no resultado | Ant `showSearch`, Element `filterable`, ReUI `searchScope="deep"` | `adopt` | O resultado mostra o caminho e realça a correspondência (`matchRanges`). |
| Filtro próprio | Ant `showSearch.filter`, Element `filter-method`, ReUI `filter` | `adopt` | `filter(node, query)` sobre a omissão de `createFilter`, sensível ao locale. |
| Abrir nível por hover | Ant, Element, NG-ZORRO `expandTrigger`, ReUI | `adopt` | `expandOn: 'press' \| 'hover'`, com atraso de `pointer-intent`; hover nunca confirma. |
| Caminho no gatilho e separador | Ant `displayRender`, Element `show-all-levels` e `separator`, ReUI `CascaderValue` | `adapt` | Parte `value` com segmentos (`value-segment`, `value-separator`) e colapso do meio quando não cabe. |
| Etiquetas e contagem no múltiplo | Ant `maxTagCount`, Element `collapse-tags`, ReUI `CascaderChips` | `adapt` | Mesma forma de `select`: `tags` com `overflow="collapse"` e "+N". |
| Limpar | Element `clearable`, Ant (omissão), ReUI | `adopt` | Parte `clear`, como `select`. |
| Nó desativado | todos | `adopt` | Fica visível, `aria-disabled`, fora da confirmação. |
| Formulário | PrimeNG, NG-ZORRO (CVA), ReUI `name`/`required` | `adopt` | Angular `ControlValueAccessor` + `Validator`; React inputs escondidos por chave, como `tree`. |
| Mapeamento de campos | Ant `fieldNames`, Element `props.value/label/children`, NG-ZORRO `nzLabelProperty` | `adapt` | `getKey`, `getLabel`, `getChildren` de `createTreeCollection`, e lista plana com `getParent` (ReUI). |
| Renderização de opção e de valor | Ant `optionRender`/`displayRender`, NG-ZORRO templates, ReUI `renderLabel`/`renderItem` | `adapt` | Partes (`icon`, `label`, `description`, `meta`) no lugar de uma função que substitui a linha; `render` na linha como saída de emergência. |
| Estados `open`, `value` e `path` controláveis | ReUI (cinco), Ant/Element (`open`, `value`) | `adopt` | Pares controlado e não controlado com `reason` para `value`, `open`, `path`, `query`, `expanded`. |
| Teclado de níveis | PrimeNG, ReUI | `adopt` | Setas horizontais entram e saem de níveis com espelho em RTL; `Home`/`End` e typeahead por coluna. |

## 3. Differentiators

| Capacidade | Onde existe | Forma Slotted |
| --- | --- | --- |
| Layout escolhido pela largura do próprio contentor | Nenhuma implementação; ReUI exige escolher `mode` | `layout="auto"` (omissão): `columns` quando a largura disponível do popup comporta duas colunas, `drill` abaixo; cumpre "em tela estreita navega por níveis" sem código do consumidor. |
| Três layouts sobre um núcleo | ReUI | `columns`, `drill`, `tree` sobre `createTreeCollection`; `tree` reutiliza o modelo de expansão da família `tree`. |
| Contagem de selecionados por ramo | ReUI (nome acessível "3 selected") | Parte `count` no ramo; o nome acessível diz o total e os selecionados em palavras. |
| Resolução de valor não carregado | ReUI `resolveValue` | Evento de resolução por lote reaproveitando o padrão de `entity-picker` (cache por id), para o gatilho mostrar o caminho antes de qualquer nível carregar. |
| Três esquemas, três densidades, RTL lógico, dois bindings | Nenhuma implementação publica os quatro | Tokens da fundação; setas espelhadas por `dir`; React e Angular idiomáticos. |
| Defaults por aplicação | Nenhuma | `CascaderDefaultsProvider` / `provideCascaderDefaults()`. |

## 4. Gaps

| Caso | Tratamento previsto |
| --- | --- |
| Nível com mil filhos | Janela virtual por coluna (`virtualWindow`), só em `columns` e `drill`; `tree` usa a janela plana de `tree`. |
| Falha de carga num nível | Parte `status` por coluna com mensagem e repetição fora do `listbox` (um botão dentro de `option` é `nested-interactive`). |
| Rótulo longo, traduzido ou sem espaços | Coluna com largura máxima e quebra; caminho do gatilho colapsa o meio com `…` e o nome acessível mantém o caminho inteiro. |
| Pesquisa sem resultados | Parte `empty` com a consulta; o caminho de navegação fica intacto e reaparece ao limpar. |
| Seleção anterior a um nó removido dos dados | O valor mantém-se, o gatilho mostra o id resolvido pelo evento de resolução, `Validator` Angular reporta `unresolved` como `entity-picker`. |
| Interação interrompida | Fechar a meio de uma carga cancela o pedido pelo `AbortSignal` do evento; reabrir volta ao nível do valor (`revealSelected`). |
| Hover diagonal entre colunas | `pointer-intent` impede que atravessar a coluna vizinha troque o ramo aberto. |

## 5. Padrão

Fontes lidas em 2026-09-30: Combobox Pattern (`https://www.w3.org/WAI/ARIA/apg/patterns/combobox/`, secções "Tree Popup Keyboard Interaction" e "Dialog Popup Keyboard Interaction") e Tree View Pattern (`https://www.w3.org/WAI/ARIA/apg/patterns/treeview/`).

Decisão: combobox cujo popup é `tree`, nos três layouts. PrimeNG usa o mesmo papel. O ReUI usa um `listbox` por nível e escreve `aria-haspopup` e `aria-expanded` em `option`, dois atributos que o ARIA não suporta nesse papel. Com `tree`, o ramo diz `aria-expanded`, o nível diz `aria-level`, e `aria-posinset`/`aria-setsize` contam os irmãos; nada precisa de ir para o nome acessível.

Precedente de `select`: sem pesquisa, o gatilho `button` tem `role="combobox"`, `aria-haspopup="tree"` e `aria-activedescendant` no nó ativo; com pesquisa, o popup é `dialog`, o foco DOM entra no `search-input` (`role="combobox"`, `aria-autocomplete="list"`) e o `aria-activedescendant` vive nele.

| Tecla | Padrão (tree popup) | `cascader` |
| --- | --- | --- |
| `ArrowDown` / `ArrowUp` no gatilho | abre o popup; foco no primeiro / último elemento | igual; com valor, o nó ativo é o valor e o caminho dele fica aberto |
| `ArrowRight` | nó fechado: abre; nó aberto: primeiro filho | igual; em `columns` e `drill` "abrir" mostra a coluna seguinte e move para o primeiro filho num só passo; espelha em RTL |
| `ArrowLeft` | nó aberto: fecha; filho: vai ao pai | igual; em `columns` e `drill` volta à coluna anterior no pai; espelha em RTL |
| `ArrowDown` / `ArrowUp` no popup | próximo / anterior nó visível | `tree`: igual. `columns` e `drill`: próximo / anterior irmão da coluna ativa (partida escrita abaixo) |
| `Home` / `End` | primeiro / último nó | `tree`: igual. `columns`/`drill`: primeiro / último da coluna ativa. Com pesquisa, o cursor do texto |
| `Enter` | aceita o valor e fecha | folha selecionável: confirma e fecha (`closeOnSelect`); ramo não selecionável: abre como `ArrowRight`; múltiplo: alterna e mantém aberto |
| `Space` | — | múltiplo: alterna sem fechar; sem pesquisa em simples: igual a `Enter` |
| `Escape` | fecha e devolve o foco | igual; com consulta ativa, o primeiro `Escape` limpa a consulta |
| Carácter imprimível | typeahead (tree view) | sem pesquisa: typeahead no nível ativo com `@slotted/core/typeahead`; com pesquisa: escreve no campo |
| `Tab` | — (dialog: ordem de tabulação do diálogo) | fecha e sai, como `select` |

Partida (custo escrito): em `columns` e `drill`, `ArrowDown`/`ArrowUp` ficam na coluna ativa em vez de descer para o primeiro filho do nó aberto. A ordem visível de uma árvore com o caminho ativo aberto é em profundidade, e a coluna seguinte aparece à direita; seguir a ordem da árvore faria o destaque saltar de coluna na seta vertical. Um leitor de ecrã ouve o nível e a posição do irmão (`aria-level`, `aria-posinset`) e navega nesse mesmo conjunto; a leitura linear pelo cursor virtual mantém a ordem em profundidade do DOM.

Seleção: um valor é `aria-selected` em simples. Em múltiplo a árvore tem `aria-multiselectable="true"` e cada nó selecionável `aria-checked` (`"mixed"` num ramo parcial), a regra que a família `tree` já escolheu para o seu indicador de checkbox.

## 6. Anatomia

| Parte | Elemento | Papel |
| --- | --- | --- |
| `root` | `div` | Campo, com a geometria de `select` (`data-size`, `data-invalid`, `data-disabled`, `data-open`) |
| `trigger` | `button` | `combobox`; contém `value` ou `placeholder`, `tags`/`summary` em múltiplo, `clear`, `busy`, `arrow` |
| `value` | `span` | Caminho selecionado; segmentos `value-segment` separados por `value-separator`; o meio colapsa em `…` quando não cabe e o nome acessível mantém o caminho inteiro |
| `positioner`, `content` | `div` | Camada e superfície, como `select`; `content` é `dialog` com pesquisa |
| `search`, `search-input` | `div`, `input` | Campo de pesquisa, como `select` |
| `breadcrumb` | `nav` | Só em `drill`: antepassados do nível mostrado, cada um um `button`; o último é `aria-current="location"` |
| `panel` | `div` | `role="tree"`; utilizável sem `content` (painel embutido) |
| `column` | `div` | `role="group"` nomeado pelo pai, um por nível em `columns`; um só em `drill` |
| `node` | `div` | `role="treeitem"`; em `tree`, os nós visíveis formam uma sequência plana (secção 9) |
| `indicator` | `span` | Marca de seleção: check em simples, checkbox em múltiplo |
| `icon`, `label`, `match`, `description`, `meta` | `span` | Vocabulário de `tree` e `listbox`; `meta` leva a contagem do ramo ou o total selecionado dentro dele |
| `expander` | `span` | Chevron do ramo; `aria-hidden`, o estado está em `aria-expanded` |
| `loader` | `div` | Linha de espera de um nível a carregar, com a anatomia de `node` |
| `status` | `div` | Vazio, erro e repetição de uma coluna ou da pesquisa; fora da árvore, com `button` real de repetição |
| `empty` | `div` | Sem resultados da consulta |

## 7. Estado

| Valor | Controlado | Não controlado | Pedido | Razões |
| --- | --- | --- | --- | --- |
| seleção | `value` (`string \| null`; `readonly string[]` em múltiplo) | `defaultValue` | `onValueChange` / `valueChangeRequest` | `pointer`, `keyboard`, `select`, `clear`, `remove`, `programmatic` |
| aberto | `open` | `defaultOpen` | `onOpenChange` | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`, `dismiss`, `blur`, `programmatic` |
| caminho | `path` (`readonly string[]`) | `defaultPath` | `onPathChange` | `pointer`, `keyboard`, `back`, `programmatic` |
| nó ativo | `activeKey` | `defaultActiveKey` | `onActiveKeyChange` | `pointer`, `keyboard`, `programmatic` |
| expansão (`tree`) | `expandedKeys` | `defaultExpandedKeys` | `onExpandedKeysChange` | `pointer`, `keyboard`, `programmatic` |
| consulta | `searchValue` | `defaultSearchValue` | `onSearchValueChange` | `keyboard`, `select`, `clear`, `programmatic` |

Os nomes seguem `tree` (`expandedKeys`, `activeKey`) e `select` (`searchValue`); as razões são as do vocabulário partilhado de `specs/contract.schema.mjs`. Um clique num `crumb` é `pointer`; a revelação do valor ao abrir é `programmatic`.

Carregamento: a família não guarda coleção própria, como `tree`. Um ramo com `hasChildren` e sem filhos emite o pedido de caminho ou de expansão com a razão; o consumidor carrega e marca o nó `loading` ou `invalid`; a coluna desenha `loader` ou `status`. O pedido traz um `AbortSignal` que a família aborta quando o caminho muda ou o popup fecha.

Eixos: `size` (`sm`, `md`, `lg`), `layout` (`auto`, `columns`, `drill`, `tree`; omissão `auto`), `selectionMode` (`single`, `multiple`), `selectable` (`leaf`, `any`, predicado), `checkedStrategy` (`all`, `parent`, `child`), `expandOn` (`press`, `hover`), `closeOnSelect`, `search`, `clearable`, `variant`, `fullWidth`, `portal`, `disabled`, `invalid`, `readOnly`, `required`. Todos com `provideCascaderDefaults()` / `CascaderDefaultsProvider`.

`layout="auto"`: `columns` quando a largura disponível do popup comporta duas colunas (`2 × --slotted-cascader-column-measure` mais os insets), `drill` abaixo. A decisão é uma função pura em `@slotted/core/cascader`, testada sem DOM.

Núcleo novo `@slotted/core/cascader`: colunas a partir do caminho, decisão de tecla por layout, resultados de pesquisa com caminho (sobre `createFilter` e `matchRanges`), valor emitido por `checkedStrategy` (sobre `cascadeSelection`), decisão de layout. `createTreeCollection` fica como está; a lista plana com ponteiro para o pai é um adaptador (`getParent`) dentro do módulo novo.

## 8. Integração

### React

| Pergunta | Resposta |
| --- | --- |
| Par controlado e não controlado com razão | os cinco valores da secção 7 |
| Defaults uma vez | `CascaderDefaultsProvider` e `useCascaderDefaults` |
| Substituir o elemento de cada parte | `render` em `trigger`, `content`, `node`; `renderNode` e `renderValue` para o conteúdo da linha e do valor |
| Handler do consumidor corre | `compose`, como `select` |
| Elemento nativo e ação imperativa | `ref` no `button`; handle com `open()`, `close()`, `focus()`, `revealValue()` |
| SSR sem desencontro | `useId`; nenhuma medida em render; `layout="auto"` resolve depois de montar e começa em `drill` |
| Estados no DOM | `data-open`, `data-disabled`, `data-invalid`, `data-selected`, `data-checked`, `data-indeterminate`, `data-loading`, `data-active`, `data-layout` |
| Tipos das partes | `ComponentPropsWithRef<'button' \| 'div' \| 'input' \| 'nav'>` estendidos |

### Angular

| Pergunta | Resposta |
| --- | --- |
| Valor com sinal | `model()` para `value`, `open`, `path`, `expanded`, `query`; `output()` para cada pedido com razão |
| Formulários | `ControlValueAccessor` e `Validator` (`required`, `unresolved`), como `entity-picker` |
| Defaults uma vez | `CASCADER_DEFAULTS` e `provideCascaderDefaults()` |
| Instância no template | `exportAs: 'slCascader'` |
| Conteúdo projetado e preguiçoso | `ng-template` com `slCascaderNode` e `slCascaderValue`, via `NgTemplateOutlet` |
| Zoneless e `OnPush` | sinais em todo o estado |
| Limpeza | `DestroyRef` para o positioner, a camada e o `AbortController` da carga |
| Atributo estático do consumidor | `HostAttributeToken` para `aria-label` e `name` no hospedeiro |
| Entry point | `@slotted/angular/cascader` |

## 9. Decisões do stylesheet (passos 7–8)

- O controlo é o de `select`, regra a regra, sobre os mesmos tokens de controlo; `variant` (`outline`, `subtle`, `plain`) e `fullWidth` entram no contrato pela mesma razão.
- O layout `tree` desenha os nós visíveis como uma sequência plana de `treeitem` com `aria-level`, `aria-posinset` e `aria-setsize`. Um nó que contivesse os filhos pintaria o destaque sobre eles. O recuo é `--slotted-cascader-depth` × `--slotted-cascader-indent`; `--slotted-cascader-depth` entra em `packages/styles/src/runtime-properties.mjs`. A parte `group` sai do contrato.
- No layout `tree` cada nó tem as suas próprias faixas: com `subgrid`, a faixa inicial herdava o maior padding das linhas e todos os níveis ficavam no recuo mais fundo.
- Caminho aberto: fundo `--slotted-tone-secondary-surface` e rótulo a `--slotted-font-weight-semibold`. O peso é o sinal que resta no esquema de alto contraste, onde esse fundo é a própria superfície.
- Largura limitada e janela deslizante (revisto no gate visual, 2026-10-01). O popup mostra no máximo `cascaderFit` colunas: as que cabem na largura disponível, até `maxColumns` (omissão 3, `36rem`). Um caminho mais fundo desliza a janela (`cascaderWindow`) e os níveis deixados para trás passam para o breadcrumb, que em `columns` só aparece enquanto há um nível escondido. O painel nunca desliza no eixo inline: a primeira versão deslizava, e uma barra horizontal dentro de uma camada é invisível na maioria dos ponteiros e não existe no toque.
- Posição: a largura máxima que a janela pode atingir é conhecida na abertura; o binding posiciona a camada contra essa largura, para que um caminho que cresce nunca empurre a camada para trás sob o ponteiro (o `shift` do positioner sobre uma camada que alarga movia o conteúdo já lido).
- Breadcrumb numa linha, nunca quebrada; um trilho com mais de `maxCrumbs` (omissão 4) dobra o meio num `crumb` com `data-collapsed`, cuja pressão sobe ao nível mais fundo dobrado (`cascaderCrumbs`). A altura da linha é a mesma no segundo nível e no décimo.
- Colunas com `inline-size` igual à medida e `min-inline-size: 0`: entre um redimensionamento e a medição seguinte, as colunas encolhem juntas em vez de transbordar. Um `flex-basis` sozinho não entra na contribuição max-content e partia as palavras a 720 px.
- Segmentos do valor: pesos de encolhimento 50 / 100 / 1 (primeiro, meio, último). Com peso 0.001 no último, a regra do flex que distribui só a fração da falta quando a soma dos pesos livres é menor que 1 deixava o último segmento transbordar sem reticências.
- Colunas e níveis aparecem sem animação: a entrada num nível é movimento de teclas repetidas (`ArrowRight`), e o ponteiro chega ao mesmo estado.
- O anel de foco do `crumb` fica fora da caixa (`outline-offset: 0`); por dentro, tocava na primeira letra.
- Medidas lidas no specimen `tools/harness/out/specimen/cascader/`: todas as partes emolduradas com altura inteira em comfortable e dense.

## Próximo passo

Gate de release (passo 14), depois o commit (passo 15).
