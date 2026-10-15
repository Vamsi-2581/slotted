# `entity-picker` — inventário e design

Onda 11, modo `novo`, guia §11. Escopo em `docs/process/build-order.md`. Fontes lidas em
2026-09-24.

`entity-picker` escolhe um ou vários registos de uma coleção remota — pessoas, clientes,
recursos — a partir de um campo de texto. O valor público é o `id`; a busca, a paginação e
a resolução de `id` em registo são adaptadores. Antiuso: um conjunto conhecido e curto
(`select`); texto livre como valor (`combobox` com `allowsCustomValue`); um conjunto de
strings que o leitor escreve (`multi-select`, `tags-input`); seleção em árvore
(`hierarchical-picker`).

## 1. Inventário de capacidades

### 1.1 Surveyed

| Implementação | Nome | Fonte |
| --- | --- | --- |
| Salesforce `lightning-record-picker` e SLDS Lookup | Record Picker, Lookup | <https://developer.salesforce.com/docs/component-library/bundle/lightning-record-picker/documentation>, <https://www.lightningdesignsystem.com/components/lookups/> |
| Fluent UI v8 `BasePicker` / `NormalPeoplePicker` | People Picker | `packages/react/src/components/pickers/BasePicker.types.ts` em <https://github.com/microsoft/fluentui> (master) |
| Fluent UI v9 `TagPicker` | TagPicker (receita People Picker) | `packages/react-components/react-tag-picker/library/src/components/TagPicker/TagPicker.types.ts` (master) |
| Microsoft Graph Toolkit `mgt-people-picker` | People picker | <https://learn.microsoft.com/en-us/graph/toolkit/components/people-picker> |
| MUI `Autocomplete` v9.4 | Autocomplete | <https://mui.com/material-ui/react-autocomplete/> |
| React Aria `Autocomplete` | Autocomplete | <https://react-spectrum.adobe.com/react-aria/Autocomplete.html> |
| Ant Design `Select` v6.6 (busca remota) | Select | <https://ant.design/components/select> |
| WAI-ARIA APG | Combobox Pattern | <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/> |

As fontes discordam no essencial. Salesforce e MGT são donos da busca (o componente chama
o servidor); MUI, Ant e React Aria deixam a busca ao consumidor e recebem a lista. Fluent
v8 fica no meio: o componente chama `onResolveSuggestions` e aceita uma `Promise`.

### 1.2 Table stakes

| Capacidade | Quem entrega | Veredito | Razão |
| --- | --- | --- | --- |
| Busca remota chamada pelo componente | Fluent v8 (`onResolveSuggestions`), MGT, Salesforce, React Aria (`useAsyncList`) | adopt | `source.search(request, { signal })`, no molde de `DataGridDataSource.getRows`. |
| Atraso antes de buscar | Fluent v8 (`resolveDelay`), Ant (exemplo `DebounceSelect`) | adopt | `searchDelay`, omissão 250 ms. `combobox` recusa `debounce` porque a busca é do consumidor; aqui a busca é da família. |
| Resposta velha descartada | React Aria (`signal`), MUI (flag `active` no exemplo), Ant (`fetchRef`) | adopt | `AbortController` por pedido; só a resposta do pedido mais recente pinta. |
| Carregando no popup | todos | adopt | Linhas de esqueleto na anatomia da linha de registo; anel `busy` no controlo; `aria-busy` no `listbox`. |
| Sem resultados | Fluent (`noResultsFoundText`), MUI (`noOptionsText`), Ant (`notFoundContent`) | adopt | Parte `empty`, `emptyLabel`. |
| Sugestões com a busca vazia | Fluent (`onEmptyResolveSuggestions`), Salesforce/SLDS (itens recentes), MGT (lista ao focar) | adopt | Secções `favorites` e `recent`, mais os resultados de `''` quando `minQueryLength` é 0. |
| Resultado rico | Fluent (Persona), MGT, Salesforce (`display-info.primaryField` + `additionalFields`), MUI (`renderOption`) | adopt | `Entity`: `label`, `description` (identificador), `meta` (texto curto ao fim), `avatar`. |
| `id` resolvido em registo | MGT (`defaultSelectedUserIds`), Salesforce (`value` = `recordId`) | adopt | `source.resolve(ids, { signal })`; registos já vistos ficam em cache. |
| Seleção simples ou múltipla | MGT (`selectionMode`), MUI (`multiple`), Ant (`mode`), Fluent v8 (`itemLimit`) | adopt | `selectionMode`: `single` \| `multiple`. |
| Chips com avatar e remoção | Fluent v9 TagPicker, Fluent v8, MGT, MUI (`renderTags`) | adopt | Cada chip é um `tag` com `avatar` na parte `start`. |
| Limite de escolhidos | Fluent v8 (`itemLimit`), MGT (`showMax` limita a lista, não o valor) | adopt | `max`; opções não escolhidas com `aria-disabled` e estado `complete`, como `multi-select`. |
| Mais resultados | Fluent v8 (`onGetMoreResults`, "Search for more"), React Aria (`loadMore`) | adopt | `hasMore` no resultado; a página seguinte pede-se quando a última opção entra à vista. `page` e `cursor` no pedido. |
| Criação | MGT (`allowAnyEmail`), Fluent v8 (`createGenericItem`), MUI (`freeSolo` com "Add") | adopt | `onCreate(query)`; se devolve `Promise<Entity>`, o registo é escolhido com razão `submit`. |
| Filtro de âmbito | Salesforce (`filter`, object switcher do SLDS), MGT (`type`, `groupId`) | adopt | `scopes` e o modelo `filter`; o âmbito vai no pedido. O seletor é um `select` composto, antes do campo. |
| Identidade por chave | MUI (`getOptionKey`, `isOptionEqualToValue`), Ant (`labelInValue`) | adopt | `id` é a chave; dois registos com o mesmo nome continuam distintos. |
| Conteúdo substituível | Fluent v8 (`onRenderSuggestionsItem`, `onRenderItem`), MUI (`renderOption`, `renderTags`) | adapt | `renderOption` e `renderChip` (React), `ng-template` (Angular). O esqueleto da linha e do chip é da família. |
| Escolhidos fora dos resultados | Fluent v8 (passa `selectedItems` ao resolver), MGT | adapt | Os escolhidos ficam na lista com a marca de escolha e alternam, como em `multi-select`; `selected` vai no pedido para a fonte que prefira excluí-los. Uma opção que desaparece ao ser escolhida não pode ser desescolhida na lista. |
| Grupos | MUI (`groupBy`), Fluent (cabeçalhos), MGT (pessoas e grupos) | adopt | `Entity.group` agrupa os resultados pela ordem da primeira ocorrência. |
| Formulário | Salesforce, MUI, Ant `Form` | adopt | React: um `input` oculto por `id`. Angular: `ControlValueAccessor` e `Validator`. |
| `disabled`, `readOnly`, `required`, `invalid` | todos | adopt | Também herdados de `field`. |
| Teclado do combobox | todos | adopt | §2. |
| Completar o texto em linha | MUI (`autoSelect`), Ant (`AutoComplete`) | decline | Dois registos podem ter o mesmo nome; completar o texto afirmaria uma identidade que só a lista mostra. `aria-autocomplete="list"`. |
| Texto livre como valor | MUI (`freeSolo`), Ant (`AutoComplete`) | decline | `combobox` com `allowsCustomValue`. O valor desta família é um `id`. |
| Virtualização | MUI (exemplo com `react-window`) | defer to `collection` | Como `combobox`; `hasMore` é a resposta incremental. |
| Cartão da pessoa ao pairar | MGT (`personCardInteraction`) | decline | `renderChip` compõe `hover-card` à volta do chip; a família não decide o que um cartão mostra. |

### 1.3 Differentiators

| Capacidade | Razão |
| --- | --- |
| Registo por resolver visível | Um `id` sem registo mostra-se como chip ou seleção em esqueleto enquanto `resolve` corre, e como "Unavailable" com o `id` no nome acessível quando a fonte não o devolve. Nenhuma fonte descreve o `id` de um registo apagado; MGT não o desenha. |
| Criação que termina escolhida | `onCreate` devolve o registo criado e a família escolhe-o. `combobox` não o faz porque a coleção é do consumidor; aqui o valor é um `id` e o registo novo chega com ele. |
| Repetir a busca pelo teclado | O erro é uma frase mais uma opção `retry`: `ArrowDown` alcança-a e `Enter` repete o pedido, pela mesma máquina da opção de criação. |
| Secções sem repetição | Um favorito não reaparece em recentes nem nos resultados da busca vazia. |
| O nome acessível do chip inclui o identificador | "Ana Silva, ana.silva@acme.com": dois chips com o mesmo nome distinguem-se sem ver a lista. |
| Uma máquina, duas ligações | Busca, cache, resolução, secções e decisão de tecla vivem em `@slotted/core/entity-picker`, testadas uma vez. |
| Esquemas, densidades, RTL | O avatar alinha-se à faixa do texto (decisão do briefing sobre marcas), e o nome e o identificador são ordenados pelo próprio conteúdo (`unicode-bidi: plaintext`) e alinhados com a página. |

### 1.4 Gaps

| Caso | Resposta |
| --- | --- |
| Resposta lenta de "ana" chega depois de "an" | O pedido anterior é abortado e a sua resposta ignorada por número de sequência. |
| Fonte offline ou com erro | `error` + opção `retry`; os resultados anteriores não ficam à vista como se fossem desta busca. |
| Diretório de cem mil pessoas | `minQueryLength`; abaixo dele, `status` diz "Type {count} or more characters". |
| Registo apagado ainda no valor | Chip "Unavailable" removível; o `Validator` Angular reporta `unresolved`. |
| Nome longo, traduzido ou RTL | `label` corta em duas linhas; `description` numa linha com reticências e texto inteiro no nome acessível; ambos ordenados pelo próprio conteúdo e alinhados com a página. |
| Dois registos com o mesmo nome | `description` é o desambiguador; o nome acessível da opção e do chip inclui-a. |

### 1.5 Delta face a `combobox` e `multi-select`

A família não compõe `combobox` nem `multi-select`. `sl-combobox-item` recebe `label` e
`icon` como strings e não projeta conteúdo, então um avatar não entra numa opção em
Angular; e a coluna de ícone das duas famílias mede 16 px numa linha, onde o avatar mede
24 px ou mais em duas. Mudar as duas famílias é trabalho de outra invocação, e a folha de
estilo de ambas está em edição por outra sessão. Custo: o modelo de teclado do combobox
existe pela terceira vez. Para que a terceira cópia não derive, a decisão de tecla vive em
`@slotted/core/entity-picker` e as tabelas de §2 repetem as de `combobox` e
`multi-select` linha a linha.

## 2. Padrão

Combobox Pattern (<https://www.w3.org/WAI/ARIA/apg/patterns/combobox/>) com popup
`listbox` (<https://www.w3.org/WAI/ARIA/apg/patterns/listbox/>); em `multiple`, os chips
são uma linha do Grid Pattern (<https://www.w3.org/WAI/ARIA/apg/patterns/grid/>), como em
`multi-select`. A transcrição completa está em
`docs/history/designs/2026-09-04-select-and-combobox-design.md` §4 e em
`specs/components/multi-select/contract.json`; as linhas abaixo são as que esta família
responde de outro modo ou acrescenta.

| Item | Resposta |
| --- | --- |
| `role="combobox"` no `input`, `aria-expanded` sempre escrito, `aria-controls` aberto | Igual a `combobox`. |
| `aria-autocomplete` | `list`, sempre (§1.2). |
| Foco DOM fica no `input`; opção ativa por `aria-activedescendant` | Igual. `data-current` na opção. |
| `aria-selected` na opção escolhida | Igual; em `multiple`, `aria-multiselectable="true"` no `listbox`. |
| Grupo nomeado por `aria-labelledby` | Secções e grupos com `group-label`. |
| `aria-setsize`/`aria-posinset` quando o conjunto não está todo no DOM | Escritos quando o resultado traz `total`. |
| `Enter` com opção ativa | `single`: escolhe e fecha. `multiple`: alterna, esvazia a busca, fica aberto. Na opção `create`: chama `onCreate`. Na opção `retry`: repete o pedido. |
| `Escape` | Aberto: fecha e mantém o texto. Fechado: `single` repõe o nome do escolhido, e esvazia a escolha quando o texto já era esse nome; `multiple` esvazia o texto. |
| `Backspace` com a busca vazia (`multiple`) | Primeiro toque leva o foco ao último chip; o segundo remove-o (regra de `multi-select`). |
| `ArrowLeft`/`ArrowRight` no início/fim da busca (`multiple`) | Passam aos chips; espelhados em RTL. |
| `Tab` | Fecha sem escolher e sai. |
| `PageUp`/`PageDown` | Dez opções, sem dar a volta. |
| Chip: `Delete`/`Backspace` remove; `Home`/`End`; carácter volta ao `input` | Regra de `multi-select`. Sem reordenar e sem editar. |

## 3. Anatomia

```
div[data-ui=entity-picker][data-part=root]                  container com scopes; role=group
  div[data-part=scope] > select (outline, junto ao controlo)  só com scopes
  div[data-part=control]                                       a moldura
    span[data-part=selection] > avatar                         single, com escolha
    input[data-part=input][role=combobox]                      single
    div[data-part=values][role=grid]                           multiple
      div[data-part=chips][role=row]
        span[data-ui=tag][data-part=root][role=gridcell]      um chip é um tag
          [start] > avatar   [label]   [remove]
        span[data-part=field][role=gridcell]
          input[data-part=input][role=combobox]
    button[data-part=clear]
    button[data-part=trigger][tabindex=-1] > span[data-part=arrow] | span[data-part=busy][data-ui=spinner]
  input[type=hidden]…                                          React, um por id

div[data-ui=entity-picker][data-part=positioner]               portal
  div[data-part=content][role=listbox]                         container
    div[data-part=group][role=group] > div[data-part=group-label]
      div[data-part=item][role=option]
        span[data-part=media] > avatar
        span[data-part=label] > highlight
        span[data-part=description]
        span[data-part=meta]
        span[data-part=indicator]
    div[data-part=item][data-create]                          "Create “{query}”"
    div[data-part=error]                                       frase do erro
    div[data-part=item][data-retry]                            "Try again"
    div[data-part=empty]
    div[data-part=placeholder] > esqueleto de linha ×3         aria-hidden
    div[data-part=more]                                        esqueleto de uma linha, página seguinte
    div[data-part=status][role=status]
```

Os escolhidos fora do popup são desenhados a partir da cache, não da lista visível: uma
busca nova não apaga o nome de um chip.

## 4. Decisões

### 4.1 Modelo

```ts
interface Entity {
  id: string;
  label: string;
  description?: string;      // identificador que desambigua: e-mail, número de conta
  meta?: string;             // texto curto ao fim da linha: tipo, estado
  avatar?: { src?: string; name?: string; shape?: 'circle' | 'square' } | null;
  group?: string;            // agrupa os resultados
  scope?: string;            // âmbito a que pertence, para favoritos e recentes
  disabled?: boolean;
}

interface EntitySource {
  search(request: EntitySearchRequest, options: { signal: AbortSignal }): Promise<EntitySearchResult>;
  resolve?(ids: readonly string[], options: { signal: AbortSignal }): Promise<readonly Entity[]>;
}
// EntitySearchRequest: { query, scope, page, cursor, selected }
// EntitySearchResult:  { items, total?, hasMore?, cursor? }
```

`items` em vez de `source` filtra localmente, pelo colador de `@slotted/core/collection`
sobre `label` e `description`; é um `EntitySource` como outro, construído por
`localEntitySource`. `avatar: null` tira a coluna de mídia a esse registo; omisso, o avatar
mostra as iniciais de `label`.

### 4.2 Estado

| Capacidade | Controlado | Não controlado | Pedido | Razões |
| --- | --- | --- | --- | --- |
| `selection` | `value` | `defaultValue` | `onValueChange` | `pointer`, `keyboard`, `select`, `remove`, `clear`, `submit`, `programmatic` |
| `value` | `inputValue` | `defaultInputValue` | `onInputValueChange` | `keyboard`, `select`, `clear`, `blur`, `programmatic` |
| `open` | `open` | `defaultOpen` | `onOpenChange` | `pointer`, `keyboard`, `escape`, `outsidePress`, `select`, `blur`, `programmatic` |
| `current` | `highlightedValue` | `defaultHighlightedValue` | `onHighlightedValueChange` | `pointer`, `keyboard`, `programmatic` |
| `filter` | `scope` | `defaultScope` | `onScopeChange` | `pointer`, `keyboard`, `programmatic` |

- `value` é `string | null` em `single` e `readonly string[]` em `multiple`. O pedido leva
  `entities`, os registos conhecidos do valor novo: o objeto normalizado chega ao
  consumidor sem uma segunda API.
- `submit` é a razão do registo criado por `onCreate`.
- A busca é o texto escrito desde a última escolha. Abrir com o nome do escolhido no campo
  busca `''`, e a lista mostra favoritos e recentes em vez de uma única linha.

### 4.3 Secções

Busca vazia: em `multiple`, `chosen` primeiro; depois `favorites`, `recent` e os resultados
de `''` (se `minQueryLength` é 0), sem repetir um `id`. `chosen` é onde o leitor alcança os
escolhidos que o chip "+N" esconde. Com âmbito, favoritos e recentes mostram só os
registos desse âmbito ou sem âmbito. Busca não vazia: só os resultados, agrupados por
`group`. Um cabeçalho só aparece quando há mais de uma secção ou grupo.

### 4.4 Espera, erro e resolução

`loading-states`: a primeira página espera como três linhas de registo em esqueleto
(círculo e duas linhas de texto); a página seguinte como uma linha em `more`, no fim, sem
mexer nas de cima; o controlo troca a seta pelo anel. Um `id` por resolver é um chip em
esqueleto com a largura de um nome curto (`multiple`) ou o anel no controlo com o campo
vazio e `aria-busy` (`single`).

### 4.5 Âmbito

`scopes: { id, label }[]` desenha um `select` antes do controlo, colado a ele como os
controlos de `button-group`: a folha tira os cantos da junta. O par fica numa linha a
qualquer largura, com o `select` a `min(11rem, 45%)` e o valor cortado por reticências.
Mudar de âmbito repete a busca com o texto atual.

### 4.6 Uma linha num formulário

Decidido no gate visual: um campo num formulário tem a altura dos vizinhos. `overflow`:
`collapse` (omissão) | `wrap`. Em `collapse`, `createCollapse` de `@slotted/core/overflow`
esconde (`hidden`) os chips que não cabem na linha do controlo, e um chip `tag` em contorno
com `data-count` diz "+N" e abre o popup na secção `chosen`. `wrap` mantém as três linhas de
`multi-select` para um painel onde a altura é livre.

### 4.7 Custo das decisões

| Decisão | Custo |
| --- | --- |
| Implementação própria em vez de compor `combobox`/`multi-select` | Terceira cópia do teclado do combobox; mitigada pela decisão de tecla em core. |
| A família é dona da busca | Um consumidor com a sua própria camada de dados escreve um `EntitySource` de duas linhas em vez de passar uma lista. `items` cobre a lista local. |
| Escolhidos continuam na lista | Uma fonte que os exclui lê `selected` do pedido. |
| Sem marca de favorito na linha | Não existe glifo `star` na fundação; o cabeçalho da secção diz "Favorites". Um glifo novo muda a fundação e não é justificado só por esta família. |
| Sem reordenar, editar, colar e delimitadores | `multi-select` segue dono de conjuntos ordenados de strings. Colar vários e-mails exige uma busca por token, que é do consumidor via `onCreate`. |

## 5. Integração

### React

| Pergunta | Resposta |
| --- | --- |
| Par controlado e pedido com razão | as cinco linhas de §4.2, `(value, request)` |
| Defaults uma vez | `EntityPickerDefaultsProvider` e `useEntityPickerDefaults` |
| Substituir o elemento de cada parte | `render` no root; `renderOption(entity, state)` substitui o conteúdo da opção; `renderChip(entity)` o rótulo do chip. As partes que ligam ARIA (`input`, `content`, `item`) não trocam de elemento |
| Handler do consumidor corre | `onKeyDown`, `onFocus`, `onBlur` do `input` compõem |
| Elemento nativo e ação imperativa | `ref` no `input`; `handleRef` com `focus()`, `open()`, `close()`, `refresh()` |
| SSR sem mismatch | `useId`; popup não existe fechado; nenhuma medição no render |
| Estados no DOM | `data-open`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, `data-loading`, `data-selected`, `data-current`, `data-complete`, `data-selection-mode`, `data-create`, `data-retry`, `data-unresolved` |
| Props nativas | `ComponentPropsWithRef<'input'>` no campo, sem `value` |

### Angular

| Pergunta | Resposta |
| --- | --- |
| Valor two-way em signal | `model()` para `value`, `inputValue`, `open`, `highlightedValue`, `scope`; `output()` para cada pedido |
| Reactive Forms e template forms | `ControlValueAccessor`; `Validator` com `required` e `unresolved` |
| Defaults uma vez | `ENTITY_PICKER_DEFAULTS` e `provideEntityPickerDefaults()` |
| `exportAs` | `slEntityPicker` |
| Conteúdo projetado e preguiçoso | `ng-template[slEntityPickerOption]`, `ng-template[slEntityPickerChip]`, dentro do `ng-template` do popup construído ao abrir |
| Zoneless e `OnPush` | signals; nenhum `markForCheck` |
| Listeners desmontados | `DestroyRef` para posicionador, camada, anunciador e o pedido em curso (abortado) |
| Atributo estático sobrevive | `HostAttributeToken` para `aria-label` e `id` |
| Entry point único | `@slotted/angular/entity-picker` |

Assimetria registada: React submete por `input` oculto; Angular pelo `ControlValueAccessor`.

## 6. Custo de uma resposta errada no gate visual

A anatomia de §3 decide o que o módulo de core devolve e o que as duas ligações escrevem.
Mudar a linha de registo (mídia, `meta`, duas linhas) ou o chip custa agora a folha e o
harness. Depois do passo 13 custa o módulo de core, as duas ligações, os testes e as duas
páginas de referência.
