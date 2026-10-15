# `dashboard-grid` — inventário e design

Data: 2026-09-24. Família nova da onda 11 (`docs/process/build-order.md`). Compõe `card`,
`button`, `menu`, `result-state` e `skeleton`; o arraste é `@slotted/core/drag`, o anúncio é
`@slotted/core/live-announcer`, a aritmética do layout é `@slotted/core/dashboard-grid`.

## 1. Inventário de capacidades

### 1.1 Surveyed

| Implementação                   | Nome                               | Fonte lida em 2026-09-24                                                                                     |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| react-grid-layout 2             | `GridLayout`, `ResponsiveGridLayout` | `README.md` no ramo `master` de `react-grid-layout/react-grid-layout`                                        |
| gridstack.js 14                 | `GridStack`                        | `README.md` no ramo `master` de `gridstack/gridstack.js`                                                     |
| angular-gridster2               | `gridster`                         | `README.md` no ramo `master` de `tiberiuzuld/angular-gridster2`                                              |
| Kendo UI (Angular e React)      | `TileLayout`                       | telerik.com/kendo-angular-ui/components/layout/api/tilelayoutcomponent, `/tilelayout/accessibility`; telerik.com/kendo-react-ui/components/layout/tilelayout/keyboard-navigation |
| Syncfusion EJ2                  | `DashboardLayout`                  | ej2.syncfusion.com/documentation/dashboard-layout/accessibility                                               |
| Grafana 13                      | dashboard, painel, "auto grid" e "custom" | grafana.com/docs/grafana/latest/dashboards/build-dashboards/create-dashboard/                         |
| WAI-ARIA APG                    | Listboxes with Rearrangeable Options; Menu Button | w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-rearrangeable/, w3.org/WAI/ARIA/apg/patterns/menu-button/ |
| WCAG 2.2                        | SC 2.5.7 Dragging Movements        | w3.org/WAI/WCAG22/Understanding/dragging-movements.html                                                       |

Três famílias de resposta. react-grid-layout, gridstack, gridster2, Syncfusion e o modo
"custom" do Grafana guardam `x`, `y`, `w`, `h` por item e compactam para cima por omissão
(`verticalCompactor`, `mode: 'top'`). Kendo `TileLayout` e o "auto grid" do Grafana guardam a
ordem e o tamanho, e a grelha CSS coloca. O APG não tem padrão de painel de widgets; o exemplo
de listbox reordenável dá os atalhos de mover, o destino do foco e a confirmação.

### 1.2 Table stakes

| Capacidade                                         | Quem entrega                                           | Veredito | Razão |
| -------------------------------------------------- | ------------------------------------------------------ | -------- | ----- |
| Posição do widget escolhida pelo leitor            | todos                                                  | adapt    | A posição é um lugar na ordem de leitura, não uma célula `x`/`y`; §3.1. |
| Compactação para cima                              | react-grid-layout, gridstack (`top`), gridster2, Syncfusion | adopt | É o fluxo da grelha CSS sem `dense`: nenhum buraco sobrevive a uma mudança. |
| Colunas e altura de linha configuráveis            | todos                                                  | adopt    | `columns` e `--slotted-dashboard-grid-row-size`. |
| Colunas por largura                                | react-grid-layout (`cols` por breakpoint), gridstack (`columnOpts`), Grafana (móvel numa coluna) | adapt | Três classes de tamanho do próprio contentor, 600 e 1024 px; um só layout serve as três; §3.2. |
| Layout por breakpoint                              | react-grid-layout (`layouts`)                          | decline  | Só react-grid-layout guarda um layout por breakpoint; o modelo em fluxo deriva as classes estreitas do mesmo layout. |
| Tamanho mínimo e máximo por widget                 | react-grid-layout, gridstack, gridster2                | adopt    | `minColumns`, `maxColumns`, `minRows`, `maxRows` no widget. |
| Widget fixo                                        | react-grid-layout (`static`), gridstack (`locked`, `noMove`), gridster2 | adapt | `movable` e `resizable` por widget; um widget que não se move mantém o índice quando outro passa por ele. |
| Arrastar para mover                                | todos                                                  | adopt    | `@slotted/core/drag`, contentor `grid`; pela pega ou pelo cabeçalho do cartão. |
| Redimensionar pelo canto                           | todos                                                  | adopt    | Parte `resize-handle`, passo de coluna e de linha, pré-visualização viva. |
| Alça de arraste declarada                          | react-grid-layout (`handle`), gridstack, gridster2     | adopt    | A pega `handle` e o cabeçalho; controles dentro do cabeçalho recusam o arraste. |
| Mover e redimensionar pelo teclado                 | Kendo, APG (mover)                                     | adopt    | `Alt`+setas move (APG), `Shift`+setas redimensiona; §4.1. |
| Alternativa sem arraste (SC 2.5.7)                 | WCAG 2.2, Kendo pelo teclado                           | adopt    | O menu da pega: mover, redimensionar, esconder, com um clique cada. |
| Evento de mudança cancelável                       | Kendo (`reorder`, `resize` preveníveis), react-grid-layout (`onLayoutChange`) | adopt | `onLayoutChange(layout, request)` com `reason` e `change`; `request.cancel()`. |
| Evento só no fim do gesto                          | react-grid-layout (`onDragStop`, `onResizeStop`), Kendo | adopt   | A pré-visualização é estado local; o pedido sai no largar. |
| Serializar e restaurar                             | gridstack (`save`, `load`), react-grid-layout (exemplo com `localStorage`) | adopt | `serializeDashboardLayout`, `parseDashboardLayout` total e `usePersistedDashboardLayout` / `persistedDashboardLayout`, como `persistedGridView`. |
| Modo de edição explícito                           | Grafana (Edit, Save, Discard), gridstack (`staticGrid`), react-grid-layout (`isDraggable`) | adopt | Modelo `editing`; barra de edição com Concluir, Cancelar, Repor e Adicionar. |
| Descartar alterações                               | Grafana (Discard)                                      | adopt    | Cancelar restaura o layout de quando a edição começou. |
| Adicionar e remover widgets                        | gridstack (`addWidget`, `removeWidget`), Grafana, react-grid-layout | adapt | Esconder é `hidden` no layout; a barra lista os escondidos em "Adicionar widget". O catálogo de widgets novos é do produto. |
| Guias de coluna em edição                          | gridstack, Grafana, Syncfusion (`showGridLines`)       | adopt    | A grelha desenha as colunas enquanto edita. |
| Cabeçalho do widget com título e ações             | Grafana, Syncfusion (`header`), Kendo (`header`)       | adopt    | É um `card`: `header`, `title`, `actions`. |
| Estados carregando, vazio e erro por widget        | Grafana (painel sem dados, erro, barra de carregamento) | adopt   | `loading`, `busy`, `status` `ready`/`empty`/`error`, com tentar de novo. |
| Ação de detalhe                                    | Grafana (View), escopo da onda                         | adopt    | Parte `detail`: ligação ou botão com `external`. |
| Semântica de lista                                 | Syncfusion (`list`, `listitem`)                        | adopt    | `ul role=list`, `li`, `article` com título. |
| Posição livre com buracos                          | react-grid-layout (`noCompactor`), gridstack (`float`) | decline  | A ordem de leitura divergiria da ordem visual a cada buraco; um espaço deliberado é um widget sem conteúdo do consumidor. |
| Arrastar de fora para dentro                       | gridstack (`setupDragIn`), react-grid-layout (`isDroppable`) | decline | O catálogo é do produto; um `onClick` que acrescenta a chave ao layout compõe a mesma adição sem arraste. |
| Grelhas aninhadas e grupos recolhíveis              | gridstack (`subGrid`), Grafana (linhas)                | decline  | `section` recolhível com uma `dashboard-grid` dentro. |

### 1.3 Differentiators

- **Um layout para três larguras.** A ordem e o tamanho são guardados uma vez; a classe
  média divide as colunas por dois e a compacta usa uma. react-grid-layout pede um layout por
  breakpoint e o leitor que reordena no telemóvel desfaz o do monitor.
- **Ordem de leitura igual à ordem visual**, em todas as larguras. Nenhum sistema `x`/`y`
  garante: a ordem do DOM é a de inserção.
- **Um único alvo de teclado por widget.** A pega é botão de menu (Enter), atalho de mover
  (`Alt`+setas) e de redimensionar (`Shift`+setas), com `aria-keyshortcuts`. Kendo exige
  foco no bloco inteiro e esconde os atalhos.
- **Leitura do tamanho durante o redimensionar** ("6 × 3") e anúncio educado de cada
  mudança.
- **Três esquemas, três densidades, RTL** pelos tokens da fundação; a pega de
  redimensionar espelha para o canto inicial em RTL.

### 1.4 Gaps

| Caso                                           | Resposta |
| ---------------------------------------------- | -------- |
| Título de widget longo ou traduzido            | Duas linhas no cabeçalho, depois reticências; o nome acessível mantém o texto inteiro. |
| Widget mais largo do que a classe atual        | O tamanho é limitado às colunas da classe; o layout guardado não muda. |
| Chave no layout sem widget                     | Mantida no valor, não desenhada; retirá-la mudaria o valor sem pedido. |
| Widget sem entrada no layout                   | Acrescentado no fim com o tamanho de omissão. |
| Todos os widgets escondidos                    | Parte `empty` com a ação de adicionar em edição. |
| Texto persistido corrompido ou de outra versão | `parseDashboardLayout` devolve `null`; o layout volta ao de omissão. |
| Gesto interrompido (`Escape`, perda de ponteiro) | Cancela; nada é pedido. |
| Conteúdo mais alto do que o widget             | O corpo rola dentro do cartão; o cartão não cresce. |
| Atualização de dados já mostrados              | `busy`: o conteúdo fica, `aria-busy`, uma linha indeterminada no topo do cartão. |

## 2. Padrão

O APG não tem padrão de painel de widgets. Fontes aplicadas, lidas em 2026-09-24:

- Listboxes with Rearrangeable Options: `Alt+ArrowUp` e `Alt+ArrowDown` movem, `Delete`
  remove, `aria-keyshortcuts` nos controlos, o foco fica no item movido, uma live region
  confirma.
- Menu Button: `button` com `aria-haspopup=menu` e `aria-expanded`; `Enter`, `Space` e
  `ArrowDown` abrem e focam o primeiro item; `ArrowUp` abre no último. É a família `menu`.
- WCAG 2.2 SC 2.5.7: tudo o que o arraste faz tem um caminho de ponteiro sem arraste — o
  menu da pega.

Não é `grid` (APG Layout Grid): o conteúdo dos widgets tem controlos próprios, e um
`gridcell` por widget sequestraria as setas dentro de gráficos e tabelas.

| Requisito                                     | Estado           | Evidência |
| --------------------------------------------- | ---------------- | --------- |
| Mover com `Alt`+setas, foco no item movido     | pass (planeado)  | contrato `keyboard`, testes de binding |
| Remover com `Delete`                          | pass (planeado)  | esconde quando `removable` |
| `aria-keyshortcuts` nos controlos              | pass (planeado)  | pega |
| Confirmação por live region                   | pass (planeado)  | `live-announcer`, `labels.moved`, `labels.resized`, `labels.hidden` |
| Menu Button: papéis e teclas                  | pass (composto)  | família `menu` |
| SC 2.5.7                                      | pass (planeado)  | itens do menu da pega |

## 3. Decisões

### 3.1 O modelo é a ordem

`layout` é uma lista ordenada de `{ key, columns, rows, hidden? }`. A ordem é a ordem de
leitura; a grelha CSS coloca com `grid-auto-flow: row`, sem `dense`. Custo: um widget que não
cabe no resto de uma linha deixa esse resto vazio; o leitor fecha o buraco reordenando ou
redimensionando. Não há `x`/`y`.

### 3.2 Três classes de tamanho

O contentor é a raiz; a grelha é o `ul` um elemento abaixo (decisão do briefing sobre
container queries). Expandida (`>= 1024px`): `columns` (omissão 12). Média: `ceil(columns / 2)`,
cada span `ceil(span / 2)`. Compacta (`< 600px`): uma coluna. `columns` aceita também
`{ expanded, medium, compact }`. O script calcula os três spans e escreve-os como
propriedades privadas no `li`; o CSS escolhe por container query, sem medir. SSR não diverge.

### 3.3 Edição

`editing` tem par controlado e pedido. Ao entrar, a família guarda o layout; Cancelar pede-o
de volta (`change.kind = cancel`, razão `dismiss`) e sai; Concluir sai com razão `submit`;
Repor pede o layout vazio (todos os widgets no tamanho de omissão, na ordem dos filhos).
`Escape` fora de um gesto não cancela a edição: perder um trabalho de edição por uma tecla
é o erro mais caro do modo. O botão que entra em edição é do consumidor. Ao sair, o foco que
estava na barra volta ao elemento que o tinha quando a edição começou.

### 3.4 Pedido

`onLayoutChange(layout, request)`; `request` é `ChangeRequest<DashboardLayout>` com
`change: { kind: 'move' | 'resize' | 'hide' | 'show' | 'reset' | 'cancel', key }`. Um gesto é
um pedido, no fim. A pré-visualização (ordem por `order` CSS, spans vivos) é estado local;
nenhum nó do DOM muda de lugar durante o gesto, e o foco não se perde. O que o ponteiro
carrega é a parte `drag-preview`: um `div` com `data-ui="dashboard-grid"` em volta de um
clone do widget, anexado ao `body`, porque um contentor com `contain` ou `transform` seria
o bloco de contenção de um elemento fixo.

### 3.5 Widget

`li` (parte `widget`) com um `article` que é o `card` (`fill` omissão `outline`). O
cabeçalho é chrome já pintado: título e ações ficam durante `loading`. O corpo:

- `loading`: o `skeleton` do consumidor (`skeleton` / `slDashboardWidgetSkeleton`), ou um
  bloco que ocupa a caixa do corpo — a caixa é conhecida porque a grelha a fixa.
- `status="empty"`: `result-state` `reach=section`, centrado, com a ação do consumidor.
- `status="error"`: `result-state` `status=error`, com "Tentar de novo" quando há `onRetry`.
- `busy`: conteúdo mantido, `aria-busy`, linha indeterminada no topo do corpo.

`delay` e `minDuration` do `loading` vêm do `skeleton`.

### 3.6 Vocabulário partilhado

Três palavras novas em `specs/contract.schema.mjs`, levantadas no gate visual porque mudam
terreno de outras famílias:

- capacidade `layout` (mutável): a disposição de blocos que o leitor fez — ordem, tamanho,
  escondidos. Não é `columns` (colunas de uma grelha de dados), nem `arrangement` (imutável).
- capacidade `editing` (mutável): o modo em que o leitor rearranja uma superfície. Não é
  `open` nem `pressed`.
- estado `editing` → `data-editing`.

Um glifo novo, `--slotted-icon-resize` = Lucide `move-diagonal-2`, para a pega de
redimensionar.

## 4. Anatomia e teclado

### 4.1 Teclado da pega

| Tecla | Efeito | Foco |
| ----- | ------ | ---- |
| `Enter`, `Space`, `ArrowDown` | abre o menu do widget | primeiro item |
| `Alt+ArrowLeft` / `Alt+ArrowRight` | um lugar antes / depois na ordem de leitura, espelhado em RTL | fica na pega |
| `Alt+ArrowUp` / `Alt+ArrowDown` | para o lugar do widget acima / abaixo, medido | fica na pega |
| `Alt+Home` / `Alt+End` | primeiro / último lugar | fica na pega |
| `Shift+ArrowRight` / `Shift+ArrowLeft` | uma coluna mais largo / estreito, espelhado em RTL | fica na pega |
| `Shift+ArrowDown` / `Shift+ArrowUp` | uma linha mais alto / baixo | fica na pega |
| `Delete` | esconde (`removable`) | pega do seguinte, senão do anterior, senão "Adicionar widget" |
| `Escape` | durante arraste ou redimensionar pelo ponteiro: cancela | fica |

### 4.2 Foco

O foco segue o widget movido: o `li` muda de lugar no DOM ao confirmar, e a família devolve o
foco à pega depois do commit. O redimensionar não move nós.

## 5. Integração

### React

| Pergunta | Resposta |
| -------- | -------- |
| Par controlado e pedido com razão | `layout`/`defaultLayout`/`onLayoutChange(layout, request)`; `editing`/`defaultEditing`/`onEditingChange(editing, request)` |
| Omissões uma vez | `DashboardGridDefaultsProvider` e `useDashboardGridDefaults`: `columns`, `labels`, `headingLevel`, `editBar` |
| Substituir o elemento | `render` na raiz e no widget (o `li`); `DashboardWidget` aceita `cardProps`; a grelha é `ul` fixo porque a semântica de lista é o contrato |
| Handler do consumidor | `onKeyDown`, `onPointerDown` compostos |
| Elemento nativo e ações | `ref` na raiz; `DashboardGridHandle` com `focusWidget(key)`, `cancelEditing()`, `commitEditing()` |
| SSR | `useId`; spans calculados sem medir; container queries fazem o resto |
| Estados no DOM | `data-editing`, `data-dragging`, `data-resizing` (atributo da família), `data-loading`, `data-status`, `data-drop-target` |
| Tipos | `ComponentPropsWithRef<'div'>` na raiz, `ComponentPropsWithRef<'li'>` no widget |

### Angular

| Pergunta | Resposta |
| -------- | -------- |
| Valor two-way | `model()` para `layout` e `editing`; `output()` `layoutChangeRequest` e `editingChangeRequest` com a razão |
| Forms | não: o layout é uma preferência, não um valor submetido |
| Omissões | `DASHBOARD_GRID_DEFAULTS` e `provideDashboardGridDefaults()` |
| Instância | `exportAs: 'slDashboardGrid'`, `'slDashboardWidget'` |
| Conteúdo | `ng-content` para o corpo; `ng-template` `slDashboardWidgetActions`, `slDashboardWidgetSkeleton`, `slDashboardWidgetEmpty` |
| Zoneless e `OnPush` | sinais em todo o estado; o gesto escreve sinais |
| Limpeza | `DestroyRef` desliga o controlador de arraste e os ouvintes de ponteiro |
| Atributo estático | `aria-label` e `aria-labelledby` do host são inputs que nomeiam a lista; o host deixa de os ter. A raiz não tem papel próprio a proteger |
| Ponto de entrada | `@slotted/angular/dashboard-grid` |

Assimetria registada: React expõe `usePersistedDashboardLayout` (hook), Angular
`persistedDashboardLayout()` (função com sinais), como `data-grid`.

## 6. Custo de uma resposta errada no gate visual

A anatomia (ordem em fluxo, `li` + `card`, uma pega por widget) sustenta os dois bindings, o
módulo de core e as páginas. Mudar para `x`/`y` depois do gate troca o módulo de core, o
teclado e metade dos testes. Mudar a aparência da edição (guias, pega, cantos) custa o
stylesheet.
