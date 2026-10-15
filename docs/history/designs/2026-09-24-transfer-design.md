# `transfer` — inventário e design

Data: 2026-09-24. Família nova da onda 11 (`docs/process/build-order.md`). Compõe
`listbox`, `checkbox`, `text-field`, `button` e `segmented-control`; o arraste é
`@slotted/core/drag`, a busca é `createFilter` de `@slotted/core/collection`, o anúncio é
`@slotted/core/live-announcer`.

## 1. Inventário de capacidades

### 1.1 Surveyed

| Implementação                              | Nome                                  | Fonte lida em 2026-09-24                                                                                           |
| ------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Ant Design 6.6                             | `Transfer`                            | `components/transfer/index.en-US.md` no repositório `ant-design/ant-design`, ramo `master`                         |
| PrimeNG                                    | `PickList`                            | `packages/primeng/src/picklist/picklist.ts` no ramo `master`; tabela de teclado em primeng.org/picklist            |
| Kendo UI for Angular                       | `ListBox` ligado (`connectedWith`)    | telerik.com/kendo-angular-ui/components/listbox e `/listbox/keyboard-navigation`                                   |
| Salesforce Lightning                       | `lightning-dual-listbox`              | developer.salesforce.com, component-library `lightning-dual-listbox/documentation`                                  |
| PatternFly 6                               | `DualListSelector`                    | patternfly.org/components/dual-list-selector                                                                       |
| MUI Material                               | Transfer List (receita, sem componente) | mui.com/material-ui/react-transfer-list                                                                          |
| WAI-ARIA APG                               | Listboxes with Rearrangeable Options  | w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-rearrangeable/ (exemplo 2: multisseleção com Add e Remove)   |

O APG não tem padrão próprio para lista dupla. O exemplo de listbox reordenável é a fonte
mais próxima e é o único que define atalhos de movimento, destino do foco depois de mover
e confirmação por live region.

### 1.2 Table stakes

| Capacidade                                              | Quem entrega                                  | Veredito | Razão                                                                                                                                  |
| ------------------------------------------------------- | --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Duas listas, mover selecionados nos dois sentidos       | todos                                         | adopt    | É a família.                                                                                                                           |
| Mover todos                                             | PrimeNG, Kendo, PatternFly, MUI               | adapt    | Move os visíveis e habilitados do painel; com busca ativa, move só o que o leitor vê.                                                  |
| Seleção múltipla com Shift, Ctrl, Ctrl+A, typeahead     | PrimeNG, Kendo, Salesforce, APG               | adopt    | Vem de `listbox`, sem código novo.                                                                                                     |
| Busca por painel                                        | Ant, PrimeNG, PatternFly                      | adopt    | `createFilter` sensível ao locale, sobre rótulo e descrição; `filter` do consumidor substitui.                                          |
| Contagem por painel ("2 of 12 selected")                | Ant, PatternFly, MUI                          | adopt    | Parte `count`.                                                                                                                         |
| Selecionar todos por painel, tri-estado                 | Ant, MUI                                      | adopt    | `checkbox` com `indeterminate`; atua sobre os visíveis e habilitados.                                                                   |
| Item desabilitado                                       | Ant, PrimeNG, Salesforce (`required-options`) | adopt    | Não seleciona, não move, não entra em "mover todos"; fica no painel onde está.                                                          |
| Ordem do destino reordenável                            | PrimeNG, Kendo, Salesforce, APG               | adopt    | Eixo `reorderable`; botões `move-up`/`move-down`, `Alt+ArrowUp`/`Alt+ArrowDown`, arraste.                                              |
| Arrastar entre listas e dentro do destino               | PrimeNG, Kendo, PatternFly                    | adopt    | `@slotted/core/drag`, dois contentores; o teclado tem alternativa completa.                                                             |
| Atalhos de movimento no teclado                         | Kendo, Salesforce, APG                        | adopt    | `Enter` e `Delete` do APG; `Ctrl+ArrowRight`/`ArrowLeft` de Kendo e Salesforce.                                                         |
| Rótulos e textos substituíveis                          | Ant (`locale`, `titles`), PrimeNG, PatternFly | adopt    | `labels` por instância e por provider.                                                                                                 |
| Render do item                                          | todos                                         | adopt    | `renderItem` em React, `ng-template` em Angular; ícone, descrição e meta são partes de `listbox`.                                       |
| Rodapé por painel                                       | Ant (`footer`), PatternFly (`actions`)        | adopt    | Parte `pane-footer`, conteúdo do consumidor por lado.                                                                                   |
| Estado de validação                                     | Ant (`status`), Salesforce (`required`, `min`, `max`) | adapt | `invalid` e `required`; Angular `Validator` com `required`. `min`/`max` só em Salesforce: o consumidor escreve `invalid={keys.length > max}`. |
| Desabilitar o todo                                      | todos                                         | adopt    | `disabled`, também herdado de `field`.                                                                                                 |
| Paginação ou volume grande                              | Ant (`pagination`), PrimeNG (`scrollHeight`)  | adapt    | `virtual` e `itemSize` de `listbox` no lugar da paginação; um painel com janela não precisa de páginas.                                 |
| Carregamento remoto                                     | Ant (FAQ), Kendo                              | adopt    | `loading`, `hasMore`, `onLoadMore` no painel de origem, entregues ao `listbox`.                                                         |
| Formulário                                              | Salesforce, Kendo (Angular forms)             | adopt    | `ControlValueAccessor` + `Validator` em Angular; `name` com um `input hidden` por chave em React.                                      |
| Árvore no painel de origem                              | Ant (Tree Transfer), PatternFly (`isTree`)    | decline  | `hierarchical-picker` (onda 11) é a seleção em árvore; um painel com `tree` exigiria um segundo modelo de seleção por nós.              |
| Tabela no painel                                        | Ant (Table Transfer)                          | decline  | Só Ant entrega; `renderItem` com `listbox` `meta` cobre colunas curtas.                                                                 |
| Modo de sentido único (`oneWay`)                        | Ant                                           | decline  | Só Ant; o botão `move-to-source` cumpre a mesma remoção.                                                                                |

### 1.3 Differentiators

- **Etapas em largura estreita**, decididas por container query e forçáveis por `layout`.
  Nenhuma implementação inspecionada troca de composição: PrimeNG empilha os painéis num
  `breakpoint` de viewport, as restantes estreitam as colunas até ao ilegível.
- **Anúncio do movimento** pelo live announcer partilhado ("3 items moved to Chosen"), que
  só o exemplo APG faz.
- **Botões com rótulo visível**, não só seta, e `aria-keyshortcuts` com o atalho de cada
  um (APG).
- **Um só pedido por transição**, com `direction` (`target`, `source`, `reorder`), `keys`
  movidas e `reason`; Ant separa `onChange` de `onSelectChange` sem razão.
- Três esquemas, três densidades, `dir="rtl"` com as setas e os atalhos espelhados.

### 1.4 Gaps

- Uma chave de `targetKeys` sem item em `items` (item remoto ainda não carregado):
  nenhuma implementação responde. A família desenha a opção com a chave como rótulo e
  `data-unresolved`, em vez de a descartar, porque descartar mudaria o valor do formulário
  sem pedido.
- Painel que esvazia enquanto tem o foco: o exemplo APG manda o foco para a opção
  seguinte, e não define o caso sem opção seguinte. A família move o foco para a lista do
  outro painel.
- Rótulo longo, traduzido ou de palavra única: a opção quebra linha (`listbox` já o faz) e
  os botões de ação quebram o rótulo em duas linhas antes de cortar.

## 2. Padrão

Fonte: exemplo APG "Listboxes with Rearrangeable Options", exemplo 2, e o padrão Listbox
já transcrito em `specs/components/listbox/contract.json`.

| Item APG                                                                  | Resposta                                                                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Cada lista é `role="listbox"`, `aria-multiselectable="true"`, nomeada      | `listbox` em `selectionMode="multiple"`, `aria-labelledby` o título do painel                    |
| `aria-selected` verdadeiro ou falso em cada opção                          | `listbox`                                                                                        |
| "Add": `Enter` na lista disponível                                        | `Enter` em qualquer painel move a seleção para o outro. Partida registada em §4.1                 |
| "Remove": `Delete` na lista escolhida                                     | `Delete` e `Backspace` no painel de destino                                                       |
| "Up"/"Down": `Alt+ArrowUp`/`Alt+ArrowDown`, foco fica na opção movida      | Igual, só com `reorderable`                                                                       |
| `aria-keyshortcuts` nos botões                                            | Igual                                                                                            |
| Depois de mover, foco na primeira opção seguinte ainda presente            | Regra de remoção de `listbox`; painel vazio → lista do outro painel (§1.4)                         |
| Live region confirma a ação                                               | `@slotted/core/live-announcer`, `labels.moved`                                                    |
| Quatro botões agrupados como toolbar numa só paragem de tab (exemplo 1)    | Partida: cada botão é uma paragem. Os botões têm atalho na lista; um toolbar esconderia os seis. |

## 3. Anatomia

```
div[data-ui=transfer][data-part=root][role=group]         container transfer
  div[data-part=switch] > segmented-control                só em etapas
  div[data-part=body]
    div[data-part=pane][data-side=source][role=group]      aria-labelledby title
      div[data-part=pane-header]
        span[data-part=select-all] > checkbox
        span[data-part=title]
        span[data-part=count]
      div[data-part=search] > text-field (span[data-part=search-icon])
      div[data-part=list]
        listbox (plain, multiple) > option…
          div[data-part=empty]                            conteúdo do listbox vazio
        div[data-part=drop-indicator]                     só durante arraste
      div[data-part=pane-footer]
    div[data-part=actions][role=group]
      button[data-part=move-to-target]  button[data-part=move-all-to-target]
      button[data-part=move-to-source]  button[data-part=move-all-to-source]
      div[data-part=reorder][role=group]                   só com reorderable
        button[data-part=move-up]  button[data-part=move-down]
    div[data-part=pane][data-side=target] …
  input[type=hidden][name]…                               React, uma por chave de destino
```

`items` é a coleção inteira, os dois lados; o âmbito da onda chama-lhe `sourceItems`, e o
nome foi trocado porque o painel de destino também é desenhado a partir dela.

## 4. Decisões

### 4.1 Teclado

As teclas de `listbox` valem em cada painel. A família captura antes do `listbox`, na fase
de captura do painel:

| Tecla                               | Onde                              | Efeito                                                                                   |
| ----------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
| `Enter`                             | lista de qualquer painel          | move os selecionados habilitados do painel para o outro; sem seleção, a opção ativa       |
| `Delete`, `Backspace`               | lista de destino                  | move para a origem, com a mesma regra                                                    |
| `Ctrl`/`Cmd`+`ArrowRight`           | lista de qualquer painel          | move para o painel do lado inline-end (destino em LTR); espelhado em RTL                 |
| `Ctrl`/`Cmd`+`ArrowLeft`            | lista de qualquer painel          | move para o painel do lado inline-start                                                   |
| `Alt+ArrowUp`, `Alt+ArrowDown`      | lista de destino, `reorderable`   | sobe ou desce os selecionados uma posição; foco fica na opção ativa                       |

Partida de `listbox`: `Enter` deixa de alternar a seleção dentro de `transfer`. Custo: o
leitor que usava `Enter` para selecionar usa `Space`. Razão: o exemplo APG de lista dupla
atribui `Enter` a "Add", e é a única tecla que move sem modificador.

### 4.2 Estado

| Capacidade  | Controlado      | Não controlado          | Pedido                  | Razões                                             |
| ----------- | --------------- | ----------------------- | ----------------------- | -------------------------------------------------- |
| `value`     | `targetKeys`    | `defaultTargetKeys`     | `onTargetKeysChange`    | `pointer`, `keyboard`, `programmatic`              |
| `selection` | `selectedKeys`  | `defaultSelectedKeys`   | `onSelectedKeysChange`  | `pointer`, `keyboard`, `select`, `programmatic`    |
| `filter`    | `sourceQuery` / `targetQuery` | `defaultSourceQuery` / `defaultTargetQuery` | `onSourceQueryChange` / `onTargetQueryChange` | `keyboard`, `clear`, `programmatic` |
| `current`   | `pane`          | `defaultPane`           | `onPaneChange`          | `pointer`, `keyboard`, `programmatic`              |

- O pedido de `targetKeys` leva `direction` (`target`, `source`, `reorder`) e `keys`.
- `selectedKeys` é um só conjunto; a seleção de cada painel é a interseção com as suas
  chaves. Uma chave pertence a um painel de cada vez, então o conjunto não é ambíguo.
- As chaves movidas saem da seleção, no mesmo gesto e com a mesma razão (Ant, MUI).
- Sem `reorderable`, o destino é desenhado na ordem de `items` e o valor pedido segue essa
  ordem. Com `reorderable`, o destino segue a ordem de `targetKeys` e as chaves movidas
  entram no fim, na ordem de `items`, ou na posição do arraste.
- `pane` é o painel mostrado em etapas; em colunas não muda nada visível.

### 4.3 Largura estreita

`layout`: `auto` | `columns` | `steps`, omissão `auto`. Em `auto`, o root é contentor
`transfer` e abaixo de `36rem` a família passa a etapas: a parte `switch` (um
`segmented-control` com "Available (12)" e "Chosen (3)") escolhe o painel; o outro painel
sai do layout (`display: none`); `actions` passa para baixo do painel e mostra só as ações
do painel atual. 36rem é a soma de dois painéis de 13rem, da coluna de ações e dos dois
intervalos. `columns` e `steps` fixam o resultado para um teste determinístico.

### 4.4 Arraste

Dois contentores do controlador de `@slotted/core/drag`, um por painel. O item arrastado
leva a seleção do seu painel quando está selecionado, senão só ele. Origem → destino e
destino → origem movem; dentro do destino, só com `reorderable`, reordena; dentro da
origem, a posição é recusada. A linha de largada é a parte `drop-indicator`, posicionada
por `--_drop-offset`, que só o script mede. `Escape` durante o arraste é do arraste
(decisão da onda 9).

### 4.5 Foco

- Os botões de ação usam `focusableWhenDisabled` de `button`: o botão que acabou de mover
  fica sem seleção para mover e desabilita-se, e um `disabled` nativo largaria o foco no
  `body`.
- Painel que esvazia com o foco dentro: o foco vai para a lista do outro painel.

### 4.6 Decisões da implementação

- **`@slotted/core/transfer`.** A aritmética de mover, reordenar e selecionar todos é a
  mesma nas duas ligações e vive num módulo puro com testes, como `tags` para
  `tags-input`.
- **A opção ativa de cada lista é da família.** O `transfer` controla `activeKey` de cada
  `listbox`, para que um movimento mande o teclado para a primeira opção seguinte
  habilitada. Uma chave que saiu da lista não é passada, porque deixaria a lista sem
  paragem de Tab (verificado no navegador).
- **O clique que termina um arraste por ponteiro é engolido** na fase de captura da raiz.
  Com o ponteiro capturado, ele cai na opção carregada e alternaria a sua seleção. É o
  mesmo tratamento que `data-grid` dá ao clique que segue uma largada.
- **As marcas `data-dragging` e `data-unresolved` estão no indicador da opção.** O
  `listbox` em modo `items` desenha a própria opção e não recebe atributos; a folha lê as
  marcas com `:has()`.
- **Angular: o nome da caixa de selecionar todos é escrito no `input`.** `slCheckbox`
  toma o nome da `label` e não oferece um input para ele; uma frase visualmente oculta
  dentro da `label` levaria a largura e o halo da caixa. Custo: a família escreve num
  elemento de outra família. Um input `ariaLabel` em `slCheckbox` removeria isto.
- **`overscan`** é passado às duas listas, porque `virtualization` o exige como capacidade.

## 5. Integração

### React

| Pergunta                            | Resposta                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| Par controlado e pedido com razão   | as quatro linhas de §4.2, `(value, request)`                                                     |
| Defaults uma vez                    | `TransferDefaultsProvider` e `useTransferDefaults`                                               |
| Substituir o elemento de cada parte | `render` no root; itens por `renderItem`; `pane-footer` por `renderFooter(side)`. As partes internas compõem outras famílias e não trocam de elemento |
| Handler do consumidor corre         | `onKeyDown` e `onKeyDownCapture` do root compõem                                                  |
| Elemento nativo e ação imperativa   | `ref` no root; `handleRef` com `focus(side?)` e `scrollToKey(key)`                               |
| SSR sem mismatch                    | `useId`; container query em CSS, nenhuma medição no render                                       |
| Estados no DOM                      | `data-layout`, `data-side`, `data-current`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, `data-loading`, `data-dragging` |
| Props nativas                       | `ComponentPropsWithRef<'div'>` no root                                                           |

### Angular

| Pergunta                                | Resposta                                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| Valor two-way em signal                 | `model()` para `targetKeys`, `selectedKeys`, `sourceQuery`, `targetQuery`, `pane`; `output()` para os pedidos com razão |
| Reactive Forms e template forms         | `ControlValueAccessor` sobre `targetKeys`, `Validator` com `required`                    |
| Defaults uma vez                        | `TRANSFER_DEFAULTS` e `provideTransferDefaults()`                                         |
| `exportAs`                              | `slTransfer`                                                                             |
| Conteúdo projetado e preguiçoso         | `ng-template[slTransferItem]` e `ng-template[slTransferFooter]` por `NgTemplateOutlet`    |
| Zoneless e `OnPush`                     | signals; nenhum `markForCheck`                                                           |
| Listeners desmontados                   | `DestroyRef` para o controlador de arraste e os contentores                               |
| Atributo estático sobrevive             | `HostAttributeToken` para `role` e `aria-label` do host                                   |
| Entry point único                       | `@slotted/angular/transfer`                                                              |

## 6. Custo de uma resposta errada no gate visual

A anatomia de §3 decide as partes que as duas ligações escrevem. Mudar a coluna de ações
(por exemplo, reordenação no cabeçalho do destino em vez de na coluna) custa agora a folha
de estilo e o harness; depois do Step 13 custa as duas ligações, os testes e as duas
páginas de referência.
