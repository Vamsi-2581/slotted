# Ordem de construção

Sequência de invocações de `/component`, da camada mais primitiva para fora.
Deriva de `docs/component-features.md` (guia de features) e do estado atual de
`specs/components/`.

O passe 1 — ondas 0 a 8, 79 famílias — está registrado em
`docs/archive/build-order-pass-1.md`, com o escopo escrito de cada família. Este
arquivo lista o que foi entregue e começa o passe 2 na onda 9.

## Como ler

- **Onda** é uma barreira. Nenhum item de uma onda começa antes de todos os
  itens da onda anterior estarem aprovados no gate humano.
- Dentro de uma onda, itens ligados por `→` têm dependência e seguem a ordem
  escrita. Itens em linhas separadas são independentes entre si.
- Cada linha é uma invocação. Um par na mesma linha é uma invocação única,
  justificada por uma decisão de arquitetura compartilhada.
- **Modo:** `novo` cria a família. `reabrir` volta a uma família entregue para
  acrescentar uma capacidade prometida por escrito. `infra` entrega um módulo
  de `packages/core` sem UI.
- **Guia** é a seção de `docs/component-features.md` de onde o escopo deriva.
- **Escopo por família.** A invocação lê o escopo escrito aqui. Se a família não
  tem escopo escrito, a sessão o deriva da seção do guia e o escreve aqui como
  parte do trabalho.

## Passe 1 — entregue

| Onda | Famílias                                                                                                                                                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | contrato de tokens, tema, esquemas, densidades, modelo de estado, ratchet, harness, skill                                                                                                                                                         |
| 1    | `typography`, `icon`, `visually-hidden`, `divider`, `stack inline grid`, `container`, `card`                                                                                                                                                      |
| 2    | `button icon-button`, `button-group`, `link`, `badge`, `tag`, `avatar avatar-group`, `kbd`, `skeleton`, `progress-indicator`, `status-indicator`, `alert`, `inline-message`                                                                       |
| 3    | `field field-group`, `text-field`, `textarea`, `checkbox checkbox-group radio-group`, `switch`, `number-field`, `slider`, `form`, `currency-field`                                                                                                |
| 4    | `tabs`, `breadcrumb`, `pagination`, `collapsible accordion`, `stepper`, `description-list`, `list list-item`, `prose`, `result-state`, `toolbar`                                                                                                  |
| 5    | `presence`, `dismissable-layer`, `portal`, `positioner`, `live-announcer` (infra); `tooltip`, `popover`, `dialog alert-dialog`, `drawer`, `menu menubar`, `toast`, `loading-overlay`                                                              |
| 6    | `collection` (infra); `listbox`, `select`, `combobox`, `multi-select`, `tree`, `table`                                                                                                                                                            |
| 7    | `date-field calendar date-picker`, `time-field time-picker datetime-field datetime-picker`, `upload`, `page page-header section`, `app-shell`, `action-bar`                                                                                       |
| 8    | `splitter`, `scroll-area`, `toggle-group segmented-control`, `timeline`, `date-range-picker`, `tags-input`, `filter-bar code-block`; reabertura de `table` (operandos `time`, `datetime`, `date-range-picker`, `tags-input` no filtro por coluna) |

Famílias do guia entregues dentro de outra: `alert-dialog` em `dialog`;
`icon-button` em `button`; `filter-builder` em `filter-bar` (parte `builder`);
`highlight` como folha partilhada em `packages/styles/src/highlight`, sem
binding.

Módulos de `packages/core` entregues: `clipboard`, `code`, `collection`,
`count`, `currency`, `date`, `disclosure`, `dismissable-layer`, `extent`,
`files`, `filter`, `focus`, `form`, `identity`, `keys`, `live-announcer`,
`loading`, `measure`, `number`, `overflow`, `pagination`, `pointer-intent`,
`portal`, `positioner`, `presence`, `progress`, `slider`, `state`, `steps`,
`sticky-header`, `tags`, `timeline`, `toast`, `typeahead`, `upload`.

## Reaberturas prometidas por escrito

Cada linha é uma volta a uma família entregue, registrada no escopo do passe 1
ou numa autoavaliação. Não são defeitos: são capacidades adiadas até existir a
família de que dependem. A coluna "depois de" nomeia a barreira.

| Família                         | O que entra                                                                                                                                     | Depois de                                 | Registro                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `table`                         | `time-range-picker` e `datetime-range-picker` como operando único de `between` nas espécies `time` e `datetime`                                 | `time-range-picker datetime-range-picker` | `docs/archive/build-order-pass-1.md`, onda 8                             |
| `table`                         | célula com controle `plain` cede a inserção ao controle (`padding-inline: 0` na célula, `--slotted-control-padding-inline-*` no controle)       | —                                         | `docs/archive/build-order-pass-1.md`, onda 7; `docs/build-briefing.md`   |
| `multi-select`                  | ler `splitValues`, `admitValues` e `constraintVerdict` de `@slotted/core/tags` no lugar das duas cópias locais; `commitOnBlur` com três valores | —                                         | `docs/archive/build-order-pass-1.md`, onda 8                             |
| `prose`, `table`, `tabs`        | substituir a medida de rolagem própria por `scroll-area`                                                                                        | —                                         | `docs/archive/build-order-pass-1.md`, onda 8                             |
| `scroll-area`                   | véu por `animation-timeline: scroll()`                                                                                                          | —                                         | `2026-09-13-scroll-area-design.md` §5                                    |
| `listbox`, `tree`, `tags-input` | reordenar por arrasto                                                                                                                           | `drag-and-drop`                           | inventários de `listbox` (l. 125), `tree` (l. 101), `tags-input` (l. 90) |

As reaberturas sem barreira entram no passe de revisão (`docs/implementation-review.md`).
As que têm barreira entram na onda em que a barreira cai.

## Onda 9 — o que a onda 8 deixou

Famílias listadas na onda 8 do passe 1 e não construídas, mais a infraestrutura
que três autoavaliações pediram.

| Invocação                                 | Modo  | Guia |
| ----------------------------------------- | ----- | ---- |
| `drag-and-drop`                           | infra | 3    |
| `side-navigation`                         | novo  | 7    |
| `top-navigation`                          | novo  | 7    |
| `command-palette`                         | novo  | 5    |
| `time-range-picker datetime-range-picker` | novo  | 6    |
| `drag-and-drop` → `data-grid`             | novo  | 12   |

`drag-and-drop` primeiro. As outras cinco linhas são independentes entre si;
`data-grid` depende de `drag-and-drop` pelo reordenamento de colunas.

### Escopo por família — onda 9

- `drag-and-drop` — módulo `@slotted/core/drag`, sem UI. Pointer, touch e
  teclado; pré-visualização, alça, zonas válidas, auto-scroll, cancelamento por
  Escape e anúncio pelo `live-announcer`. O evento carrega itens, origem,
  destino, posição e operação permitida; o modelo de dados é o do consumidor e
  não a geometria do DOM. A alternativa por teclado (pegar, mover com setas,
  soltar) é construída primeiro e o ponteiro deriva dela. Consumidores
  previstos: `data-grid` (colunas), `listbox`, `tree`, `tags-input`,
  `dashboard-grid`.
- `side-navigation` — itens e grupos aninhados, `expanded` e `selected`, ícone
  opcional, `badge`, modo compacto. A seleção deriva da rota e a expansão é
  independente dela. Em tela estreita vira `drawer` e devolve o foco ao gatilho.
  Ícones sem rótulo só em modo compacto, com `tooltip`. Ocupa a região `nav` de
  `app-shell` e lê `collapsedTo="rail"` dela. Constrói sobre `list-item`,
  `collapsible` e `@slotted/core/disclosure`; a marca de região reutiliza
  `--slotted-icon-panel-open`/`-close`, virada por lado e por direção.
- `top-navigation` — regiões de marca, navegação, busca, contexto, ajuda,
  notificações e conta, com prioridade de colapso por container query. Ocupa a
  região `header` de `app-shell`. Landmarks e skip link; a barra não é um
  `toolbar` com uma parada de tabulação por região. Compõe `text-field`,
  `avatar`, `menu` e `badge`; não define nenhum deles.
- `command-palette` — `dialog` com `combobox` + `listbox` dentro. Itens com
  `id`, `label`, `keywords`, `group`, `disabled` e handler ou destino; `query`
  controlável; `loading` e `empty`; atalhos, histórico, ações assíncronas e
  subcomandos como página empilhada. A ordenação é um adaptador substituível;
  o padrão é o `typeahead` de `packages/core`. Não executa item `disabled`;
  anuncia o número de resultados pelo `live-announcer`. Recusa registrada em
  `menu` (inventário, l. 119): um menu filtrado por texto é esta família.
- `time-range-picker datetime-range-picker` — uma sessão: dois `time-picker`,
  ou dois `datetime-picker`, com o `max` de um ligado ao `min` do outro, atrás
  de um gatilho. Herdam de `date-range-picker` a banda com o comprimento dito
  enquanto o intervalo é desenhado, `minLength`/`maxLength`, `contiguous`, a
  parte `preset` e o rascunho que nunca chega a um formulário. O motor é
  `@slotted/core/date` (`date-range.ts` estendido a `PlainTime` e
  `PlainDateTime`). A reabertura de `table` que substitui os dois pickers do
  `between` é uma sessão separada, na onda 10.
- `data-grid` — a família que **aplica** o descritor de `@slotted/core/filter`:
  possui o modelo de dados e chama `createFilterPredicate`; `table` reporta e o
  consumidor filtra. Herda as quatro capacidades que `table` recusou pelo papel
  ARIA: redimensionar coluna, virtualização de linha e coluna, ordenação por
  várias chaves e ativação de linha. `role="grid"` com cursor de célula, setas,
  Home/End/Page. Colunas com `id`, `label`, `type`, `align`, `width/min/max`,
  `sortable`, `filterable`, `editable`, `hidden`, `pinned`, renderer, editor e
  accessor. Query serializável única para cliente e servidor: ordenação
  múltipla, filtros tipados, busca, paginação por página ou cursor,
  agrupamento. Seleção `single | multiple | range`, select-all do conjunto
  filtrado, ativação de linha separada da seleção. Edição por célula ou linha,
  validação sync/async, commit/cancel, conflito, atualização otimista; um erro
  não descarta o valor digitado. Reordenar, mostrar/ocultar, fixar e ajustar
  colunas por `@slotted/core/drag` e teclado. Rodapé agregado e linha de
  detalhe. Exportação, gráficos e pivot ficam fora. O gerenciador de colunas
  como painel é `column-manager`, onda 10; a grelha expõe o modelo que ele
  edita.

## Onda 10 — composições Core em falta e Extended sobre o que existe

Cada família compõe famílias entregues. Nenhuma traz motor novo em
`packages/core`, exceto onde o escopo diz.

| Invocação             | Modo    | Guia  |
| --------------------- | ------- | ----- |
| `table`               | reabrir | 12    |
| `data-entry-form`     | novo    | 15    |
| `crud-list`           | novo    | 15    |
| `context-menu`        | novo    | 8     |
| `hover-card`          | novo    | 8     |
| `split-button`        | novo    | 5     |
| `toggle`              | novo    | 5     |
| `otp-input`           | novo    | 6     |
| `highlight`           | novo    | 10    |
| `aspect-ratio image`  | novo    | 4, 14 |
| `stat-card sparkline` | novo    | 13    |
| `table-of-contents`   | novo    | 7     |
| `selection-toolbar`   | novo    | 11    |
| `column-manager`      | novo    | 12    |
| `data-list`           | novo    | 12    |

Independentes entre si. `crud-list` depende de `selection-toolbar` e de
`data-grid` (onda 9) e fecha a onda.

### Escopo por família — onda 10

- `table` (reabrir) — `time-range-picker` como operando único de `between` na
  espécie `time` e `datetime-range-picker` na espécie `datetime`, no lugar dos
  dois pickers que `TableTimeFilter` e `TableDateTimeFilter` desenham. O
  descritor, o predicado, o codec e o resumo não mudam; o que troca é o
  controle dentro de `filter-operand`. Na mesma sessão, a regra de célula
  pendente: uma célula com controle `plain` cede a inserção ao controle.
- `data-entry-form` — seções com headings, grade responsiva por `grid`, ajuda
  contextual, validação por `form`, estado sujo, autosave opcional, ações por
  `action-bar` e resumo de erros com foco no primeiro campo. Campos condicionais
  derivam validade do modelo e não da visibilidade; ao ocultar, a política de
  manter ou limpar o valor é declarada. Envio duplicado é bloqueado; sair com
  mudanças pede confirmação por `alert-dialog` só quando há perda real. É uma
  composição: `form`, `field-group`, `section`, `grid`, `action-bar`,
  `inline-message`. Motor novo: nenhum; `@slotted/core/form` ganha o estado
  sujo por campo se ainda não o tem.
- `crud-list` — `page-header` + `filter-bar` + `data-grid` ou `table` +
  `pagination` + `selection-toolbar` + `result-state`, com criação, edição e
  detalhe em `drawer` ou rota. Estado de query único e serializável (o codec de
  URL de `filter-bar` mais ordenação e página); o retorno do detalhe preserva
  filtros, página, seleção e posição de rolagem. É a página de referência que
  mostra as outras famílias em uso real.
- `context-menu` — o núcleo de `menu`, aberto por clique secundário, tecla de
  contexto ou Shift+F10 sobre um alvo. Posicionamento por ponto via âncora
  virtual do `positioner` (inventário de `tooltip`, l. 71). Devolve o foco ao
  alvo. As ações também existem por outro caminho: a família documenta o
  requisito e a página de referência o mostra.
- `hover-card` — pré-visualização de link ou entidade que abre em hover e foco
  com atraso e área de tolerância; o gatilho continua um `link` ou elemento
  focável; conteúdo navegável opcional. Toque abre por clique. `tooltip` recusou
  `openOnHover` para esta família (inventário, l. 116). Compõe `popover` com
  `positioner` e `presence`; não substitui `dialog`.
- `split-button` — ação principal e menu de alternativas; partes `primary` e
  `menu-trigger` com nomes acessíveis distintos. Compõe `button`, `button-group`
  (variante unida) e `menu`. A escolha no menu só atualiza a ação principal sob
  uma opção declarada (`remember`), porque a atualização silenciosa muda o que
  o próximo clique faz.
- `toggle` — um `button` com `aria-pressed` fora de grupo. O item que
  `toggle-group` já desenha, publicado como família própria para a barra de
  ferramentas e para o controle avulso (`wrap` de `code-block` é um). Não
  substitui `checkbox` em formulário.
- `otp-input` — valor único distribuído em N caixas; comprimento, tipo
  numérico ou alfanumérico, colagem completa, `autocomplete="one-time-code"`,
  máscara opcional. Uma parada de foco lógica: o input real é um só, oculto, e
  as caixas são pintura; erro e leitura por leitor de tela descrevem um campo.
  `field` para rótulo e mensagem; `ControlValueAccessor` e `name`.
- `highlight` — a folha partilhada em `packages/styles/src/highlight` vira
  família com binding: recebe `ranges` ou um `matcher` substituível, preserva o
  texto original e diacríticos, não injeta HTML e não marca quando a query é
  vazia. `combobox`, `select`, `listbox` e `menu` passam a usar a família no
  lugar da folha. Motor: `@slotted/core/highlight` com a normalização que
  `typeahead` já faz.
- `aspect-ratio image` — uma sessão: `aspect-ratio` reserva proporção antes da
  mídia carregar e não corta; `image` compõe sobre ela com `src`/`srcset`,
  `alt`, `fit`, `position`, `loading`, fallback e estado de erro. Zoom e
  pré-visualização são capacidade separada (`dialog`). `avatar` e `upload`
  passam a ler `image` quando forem reabertos; não muda nada nesta sessão.
- `stat-card sparkline` — uma sessão: `stat-card` com rótulo, valor, unidade,
  delta, período, tendência, comparação, status e ação de detalhe; o tom deriva
  da semântica da métrica e não do sinal matemático (`goodWhen: up | down`).
  `sparkline` é a tendência compacta dentro do card e da célula de tabela:
  `data`, `line | bar`, referência, tom e descrição textual do último valor e
  da tendência. Sem eixos interativos. `loading` e erro preservam o layout por
  `skeleton`. É o primeiro SVG desenhado pela biblioteca; a paleta de dados
  é uma escala nova da camada semântica.
- `table-of-contents` — links para headings com estado ativo por
  `IntersectionObserver`, offset de rolagem lido de `--slotted-page-sticky-top`,
  atualização de URL opcional. Foco após navegação; reduced motion respeitado.
  Em tela estreita colapsa em `select` ou `popover`. Responde à capacidade que
  `page` adiou (inventário, l. 154).
- `selection-toolbar` — aparece quando existe seleção: contagem, select-all do
  conjunto filtrado, limpar, ações permitidas. Distingue "itens desta página" de
  "todos os resultados"; ação destrutiva confirma o escopo por `alert-dialog`.
  Compõe `toolbar` e `action-bar`; lê a seleção de `table`, `data-grid`,
  `listbox` ou `tree` por um modelo comum de `@slotted/core/collection`.
- `column-manager` — lista pesquisável de colunas com visibilidade, ordem, fixar
  e restaurar; impede ocultar coluna obrigatória. Aplica ao vivo ou em
  confirmação, política única por instância. Preferências serializáveis e
  versionadas. Edita o modelo de colunas de `data-grid` e de `table`; abre em
  `popover` ou `drawer`. Reordenar por `@slotted/core/drag` e teclado.
- `data-list` — o recipe responsivo de um conjunto tabular pequeno quando a
  tabela não cabe: cada item mostra rótulos e valores prioritários. Mantém
  ordenação, filtros e seleção do modelo de dados; não oferece navegação de
  grelha. Compõe `list-item` e `description-list`; `table` sob `wrap` continua
  a resposta para conjuntos que cabem.

## Onda 11 — Extended de custo médio

Cada família traz um modelo próprio ou um adaptador de dados. Nenhuma depende
de outra da mesma onda.

| Invocação             | Modo | Guia |
| --------------------- | ---- | ---- |
| `transfer`            | novo | 11   |
| `entity-picker`       | novo | 11   |
| `hierarchical-picker` | novo | 6    |
| `master-detail`       | novo | 4    |
| `dashboard-grid`      | novo | 4    |
| `wizard`              | novo | 15   |
| `detail-panel`        | novo | 15   |
| `notification-center` | novo | 15   |
| `markdown`            | novo | 10   |
| `tour`                | novo | 7    |
| `action-sheet`        | novo | 8    |
| `fullscreen`          | novo | 8    |

### Escopo por família — onda 11

- `transfer` — dois `listbox` com busca, contagens, seleção em massa,
  `disabled` e ordem opcional. Contrato: `sourceItems`, `targetKeys`,
  `selectedKeys` por painel e um evento de movimento com direção e razão. Em
  tela estreita vira duas etapas. As ações têm rótulo além da seta.
- `entity-picker` — `combobox` orientado a entidades remotas: busca, resultado
  rico (`avatar`, identificadores suficientes para desambiguar), filtros,
  criação opcional, recentes e favoritos, seleção simples ou múltipla. O valor
  público é o ID ou o objeto normalizado; query, paginação e resolução de IDs
  são adaptadores.
- `hierarchical-picker` — seleção em árvore ou cascata sem expor `tree` +
  `select`. Nós com `id`, `parent`/`children`, carregamento preguiçoso, seleção
  de folha ou ancestral, caminho visível e busca. TreeSelect e Cascader são dois
  recipes do mesmo núcleo. Em tela estreita navega por níveis.
- `master-detail` — coordena lista ou grelha e detalhe: seleção por URL ou ID,
  estado vazio e retorno de foco. Desktop usa painéis (`splitter`); tela
  estreita usa navegação ou `drawer` com retorno previsível. O detalhe preserva
  contexto e posição da lista.
- `dashboard-grid` — layout responsivo de widgets com tamanho mínimo,
  reordenação e redimensionamento opcionais por `@slotted/core/drag` e teclado,
  persistência e modo de edição explícito. Cada widget é um `card` com heading,
  estados vazio/erro/carregando e ação de detalhe.
- `wizard` — etapas com dados acumulados, validação por etapa, voltar/avançar/
  enviar, rascunho, retomada e erro global. O estado vive fora de `stepper`,
  que só o desenha. Navegação direta depende de etapas concluídas; URL, reload
  e recuperação são políticas declaradas.
- `detail-panel` — resumo, metadados, status, `tabs` ou seções, ações e
  histórico (`timeline`). Abre em página, `drawer` ou `master-detail` conforme
  a profundidade; URL e foco tornam a abertura compartilhável e reversível. Não
  hospeda fluxo longo de edição.
- `notification-center` — lista persistente com lido/não lido, grupos, filtros,
  marcar tudo, ações e paginação incremental. `badge`, `popover` e página
  completa compartilham o modelo; atualizações ao vivo não roubam foco nem
  reordenam enquanto o leitor lê (a parte `fresh` de `timeline`).
- `markdown` — renderização com allowlist de elementos e URLs, headings com IDs
  estáveis, links externos, tabelas, código por `code-block`, conteúdo vazio e
  erro. Sanitização obrigatória; plugins opt-in. A tipografia é `prose`. O
  parser é um adaptador: a família recebe uma árvore e nunca HTML, como
  `code-block` recebe tokens.
- `tour` — etapas com âncora, título, conteúdo, placement, progresso,
  próximo/anterior/pular e condição de disponibilidade. Move o foco só quando
  apropriado, tem alternativa sem spotlight e recupera de âncora ausente.
  Persistência e versionamento são do produto. Compõe `popover` e `dialog`.
- `action-sheet` — variante de `menu` para toque: ações curtas, cancelamento
  explícito, safe area, modal opcional. Compõe `drawer` com `side="bottom"`.
  Não duplica `dialog` com formulário.
- `fullscreen` — pede e sai de fullscreen nativo, expõe estado e erro, restaura
  o contexto; rótulo e ícone acompanham o estado. Fallback "expandir no layout"
  quando a API não existe. Nunca bloqueia Escape do navegador. Motor:
  `@slotted/core/fullscreen`.

## Onda 12 — Extended de custo alto

Cada família traz um subsistema. Uma sessão por família.

| Invocação              | Modo | Guia |
| ---------------------- | ---- | ---- |
| `chart`                | novo | 13   |
| `event-calendar`       | novo | 16   |
| `audit-log`            | novo | 15   |
| `workflow-tracker`     | novo | 15   |
| `import-export-center` | novo | 15   |
| `search-results`       | novo | 15   |

### Escopo por família — onda 12

- `chart` — o sistema de gráficos da seção 13 do guia: tipos base (linha, barra,
  área, pizza/donut, dispersão), eixos, legendas, tooltip, seleção, zoom,
  estados vazio/erro/carregando, tabela de dados equivalente e descrição
  textual. A paleta de dados é a escala que `sparkline` abriu na onda 10. O
  motor de desenho é um adaptador; o contrato de dados e a acessibilidade são
  da família.
- `event-calendar` — vistas mês/semana/dia/lista, fuso horário, eventos,
  dia inteiro, recorrência, navegação temporal, filtros e abertura de detalhe.
  Não deriva de `date-picker`; reutiliza `@slotted/core/date` e a grelha de
  `calendar` só na vista de mês. Eventos sobrepostos e DST têm política
  declarada. Tela estreita prioriza a vista de lista.
- `audit-log` — evento imutável com ator, ação, alvo, timestamp com fuso,
  origem e diff acessível com versão textual. Busca, filtro e exportação são
  adaptadores. Compõe `timeline`, `table` e `filter-bar`.
- `workflow-tracker` — etapas atuais, concluídas e bloqueadas, responsáveis,
  prazos, transições e histórico. Visão de progresso, não editor de workflow;
  ação inválida explica a pré-condição. `stepper` e `timeline` são os recipes
  visuais.
- `import-export-center` — jobs com tipo, arquivo, progresso, status, erros por
  linha, cancelar/repetir e download do resultado. A operação continua fora da
  página; `toast` aponta para o job. Compõe `upload`, `progress-indicator`,
  `table` e `result-state`.
- `search-results` — query, escopo, filtros, ordenação, facets, sugestões,
  resultados com `highlight`, paginação ou carga contínua e estados sem
  resultado e erro. Mantém URL e foco; anuncia a contagem; oferece correção da
  query sem substituir silenciosamente. Compõe `filter-bar`, `list`,
  `pagination` e `result-state`.

## Fora do passe 2 — Specialized

Vinte e cinco famílias do guia marcadas `[Specialized]`: `floating-action-button`,
`color-picker`, `rating`, `navigation-rail`, `floating-window`, `tree-grid`,
`pivot-grid`, `spreadsheet`, `gauge`, `map`, `diagram`, `carousel`,
`rich-text-editor`, `code-editor`, `document-viewer`, `media-player`,
`barcode`, `permission-matrix`, `resource-scheduler`, `kanban`, `gantt`,
`org-chart`, `ai-conversation`, `prompt-composer`, `speech-input`. Entram por
decisão de produto, uma por vez, com escopo escrito aqui antes da invocação.
Duas já têm capacidade adiada para elas por escrito: `floating-window` (arrasto
e redimensionamento de `dialog`) e `gauge` (arco de `progress-indicator`).

## Regra de commit

Uma família por commit, `pnpm check` por família e `pnpm check:full` por onda.
Uma reabertura que muda um módulo de `packages/core` commita o módulo e os
consumidores tocados juntos, para que a árvore nunca tenha duas versões de um
vocabulário.
