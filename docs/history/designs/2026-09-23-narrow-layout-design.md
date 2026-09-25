# Layout estreito: classes de tamanho, pop-in do `data-grid`, `page` e `page-header` compactos — design

Data: 2026-09-23. Âmbito: `@slotted/core` (`measure`, `sticky-header`, `grid`), famílias
`app-shell`, `detail-panel`, `page`, `page-header`, `data-grid`, `column-manager`, e a demo
Nexora Angular.

O pedido exige execução de ponta a ponta com validação única no fim. Cada decisão que uma
paragem de revisão levaria ao utilizador está registada neste documento.

## 1. Problemas

1. O `page-header` ocupa parte da altura de um telefone que não se recupera. Abaixo de
   640px só os breadcrumbs saem. As ações descem para uma linha própria.
2. Com `page` em `fill` não há scroll exterior. O `page-header` só colapsa com esse
   scroll, logo fica expandido, e o corpo recebe a altura que sobra.
3. As colunas que não cabem são descartadas: `columnsHiddenBySpace` no core e
   `PHONE_COLUMN_IDS` na Nexora. A tela perde a informação que existe para mostrar.
4. Uma linha `activatable` só ativa com duplo clique ou Enter. Num ecrã tátil, o duplo
   toque não é o gesto de abrir um registo.
5. Os limiares de largura das famílias de página divergem (640, 768) sem contrato comum.
   `docs/component-features.md` §"Não perpetuar" proíbe esse estado.

## 2. Fontes

| Regra adotada | Fonte |
| --- | --- |
| Colunas que não cabem passam para uma área dentro da linha como pares rótulo/valor; o rótulo é o do cabeçalho, acima do valor | SAP Fiori, Responsive Table (`popinDisplay=Block`, `popinLayout=GridSmall`) |
| A decisão responde à largura do contentor, não à janela | UI5 `sap.m.Table#contextualWidth` |
| Ordem de saída por importância, da direita para a esquerda; a coluna identificadora nunca sai | Fiori (`importance`, `autoPopinMode`) |
| Uma coluna pode ser ocultada em vez de passar para a área | UI5 `hiddenInPopin` |
| Linha de navegação: um toque abre o registo | Fiori `type=Navigation`; Roselli, "Don't turn a table into an ARIA grid just for a clickable row" |
| Classes de tamanho: compacto < 600px, expandido ≥ 1024px | Fiori size classes (S ≤ 600, L ≥ 1025); Material 3 window size classes (compact < 600) |
| Header de telefone: título colapsado com no máximo 2 linhas, ações excedentes num menu, sem pin | Fiori Dynamic Page |
| Snap do header ao rolar o conteúdo | Fiori Dynamic Page (snap on scroll); Material 3 app bar |
| Alvo de toque ≥ 44px em ponteiro grosso | Apple HIG; WCAG 2.5.8; já em `theme.json` (`max(x, 44px)` sob `pointer: coarse`) |

## 3. Contrato de classes de tamanho

Classe de tamanho: a faixa de largura do contentor que decide a composição de uma superfície
de página.

| Classe | Largura do contentor |
| --- | --- |
| compacta | `< 600px` |
| média | `600px` a `1023px` |
| expandida | `>= 1024px` |

- `@slotted/core/measure` exporta `COMPACT_BELOW = 600` e `EXPANDED_FROM = 1024`.
- As famílias de superfície de página usam apenas estes dois limiares nos seus `@container`:
  `app-shell`, `detail-panel`, `page`, `page-header`.
  - `app-shell`: `768px` → `600px`. `APP_SHELL_OVERLAY_AT` passa a valer `COMPACT_BELOW`
    nos dois bindings.
  - `detail-panel`: `640px` → `600px`.
  - `page-header`: `640px` → `600px`.
  - `sticky-header`: `NARROW_WIDTH` é removida; o módulo lê `COMPACT_BELOW`.
- `top-navigation`: o passo `medium` passa de `768px` a `600px`. O contrato da família fixa-o
  igual ao `overlayAt` do `app-shell`. Os passos `low` (1024px) e `high` (480px) mantêm-se.
- O reflow do conteúdo de um componente (`card`, `list-item`, `alert`, …) mantém limiares
  literais próprios. Esses limiares respondem ao conteúdo do componente, não
  à composição da página.
- `packages/styles/src/size-classes.test.mjs` rejeita, nas quatro famílias, um `@container`
  de largura com limiar diferente de `600px` ou `1024px`.
- `docs/token-foundation.md` (regra 4) e `docs/component-features.md` (§2.7) registam o
  contrato.

## 4. `data-grid`: pop-in

Pop-in: a área dentro da linha que mostra, como pares rótulo/valor, as colunas que não cabem
na largura do grid.

### 4.1 Core (`@slotted/core/grid`)

- `GridColumn.priority?: number`. Um número menor fica mais tempo na linha.
- `GridColumn.popin?: boolean`, por omissão `true`. Com `false`, a coluna que não cabe é
  ocultada em vez de passar para o pop-in.
- `columnsOutOfSpace(resolved, available, { leading })` substitui `columnsHiddenBySpace`.
  - Soma a necessidade de cada coluna: `minWidth` numa coluna flexível, `width` numa fixa,
    mais `leading`.
  - Nunca retira a coluna identificadora nem uma coluna `kind: 'actions'`. A coluna
    identificadora é a primeira coluna visível com `rowHeader: true`; sem ela, a primeira
    coluna visível de dados.
  - Ordem de saída: primeiro as colunas sem `priority`, da última declarada para a primeira;
    depois as numeradas, do maior número para o menor, e no empate a última declarada
    primeiro.
  - Pára quando a soma cabe. Se só restarem colunas que nunca saem, o grid rola na
    horizontal.
- `GridOutOfSpace { popin: readonly string[]; hidden: readonly string[] }`, pela ordem das
  colunas resolvidas. `popin` recebe as colunas com `popin !== false`; `hidden`, as
  restantes.
- `POPIN_COLUMN_ID = '$popin'`: a coluna virtual do cursor para a célula de pop-in.

### 4.2 Bindings

| | Angular | React |
| --- | --- | --- |
| Política | input `columnOverflow: 'auto' \| 'popin' \| 'scroll'` | prop `columnOverflow` |
| Estado | signal público `outOfSpace()` | `ref.getOutOfSpace()` |
| Evento | output `outOfSpaceChange` | `onOutOfSpaceChange` |

- `columnOverflow` vale `'auto'` por omissão, através dos defaults injetáveis.
  - `'auto'`: pop-in quando a largura do grid é menor que `COMPACT_BELOW` (600px), ou quando
    o ponteiro principal é grosso (`(pointer: coarse)`) e a largura do grid é menor que
    `EXPANDED_FROM` (1024px). Nos restantes casos, comporta-se como `'scroll'`. Com rato ou
    trackpad num ecrã largo, o scroll horizontal preserva o layout de colunas; o pop-in serve
    telefones e tablets pequenos.
  - `'popin'`: pop-in em qualquer largura.
  - `'scroll'`: nenhuma coluna sai e o grid rola na horizontal. É a política de uma tarefa de
    comparação.
- Core: `resolveColumnOverflow(policy, width, coarse): 'popin' | 'scroll'`. Os bindings leem
  `(pointer: coarse)` por `matchMedia` e reagem à sua mudança.
- O host escreve `data-popin="<n>"` quando `outOfSpace().popin` tem n > 0.
- `hiddenBySpace`, `hiddenBySpaceChange`, `onHiddenBySpaceChange`, `getHiddenBySpace()` e
  `data-space-hidden` são removidos.
- `column-manager`: o input/prop `hiddenBySpace` passa a `outOfSpace: GridOutOfSpace`. Uma
  coluna em `popin` mostra o estado "Shown in row" (chave `inRow`). Uma coluna em `hidden`
  mantém "Hidden for space" (chave `hiddenBySpace`).

### 4.3 Renderização

- Uma linha de dados com pop-in recebe, como último filho, a parte `[data-part=popin]`.
  - Tem `role=gridcell`, `aria-colindex` igual ao último índice e `grid-column: 1 / -1` na
    segunda linha da grelha CSS da linha.
  - A linha de cabeçalho recebe a contraparte `[data-part=popin-header]`: `columnheader`
    visualmente oculto, sem track, com o rótulo `popinHeader` "Details".
  - `aria-colcount` conta essa coluna.
- Conteúdo: um `[data-part=popin-field]` por coluna em `popin`, pela ordem das colunas
  resolvidas. Cada campo tem:
  - `[data-part=popin-label]` com `column.label`, omitido quando o cabeçalho da coluna não
    mostra texto;
  - `[data-part=popin-value]`, renderizado pelo mesmo template/renderer de célula e com o
    mesmo contexto (`value`, `text`, `row`, `column`).
- Uma coluna editável no pop-in mostra o valor só para leitura. A edição continua na célula
  visível, no detalhe ou no registo.
- Layout da linha com pop-in:
  - A grelha CSS da linha tem duas linhas: a primeira com a altura de linha da densidade,
    onde ficam as células visíveis, a calha de seleção e a coluna de ações, centradas nela;
    a segunda com o pop-in.
  - Pop-in: `display: grid; grid-template-columns: repeat(auto-fill, minmax(min(9rem, 100%),
    1fr))`, `column-gap` passo 4 e `row-gap` passo 2 da escala de espaço. Num telefone de
    360px a 430px isto dá duas colunas de campos.
  - Com o grid a partir de 600px, o início alinha com o texto da primeira coluna de dados:
    depois das calhas de seleção, arraste e expansão, mais o padding inline da célula. Abaixo
    de 600px, o início é o padding inline da linha, sob a calha de seleção. A 360px com calhas,
    a indentação de 88px deixava uma só coluna de campos.
  - Quando só cabe uma coluna de campos (pop-in com menos de 19rem), o rótulo fica ao lado
    do valor (`grid-template-columns: minmax(0, 7.5rem) minmax(0, 1fr)`), com uma linha por
    campo. O fim respeita o padding inline da
    célula. O padding de bloco inferior é o padding de bloco da célula.
  - O rótulo fica acima do valor, em `font-size-xs` com a cor de texto secundário, e quebra
    linha em vez de truncar. O valor usa o tamanho de texto da célula, alinha ao início
    (também em colunas numéricas) e quebra linha (`overflow-wrap: anywhere`), sem truncar.
  - Um valor vazio mostra o mesmo marcador que a célula mostra.
  - Os fundos de hover, seleção e linha corrente, e o separador entre linhas, cobrem a linha
    inteira, pop-in incluído. O anel de foco do pop-in fica dentro da sua caixa.
  - Nenhum conteúdo do pop-in excede a largura visível do grid (`max-inline-size: 100cqi`).
  - `position: sticky; inset-inline-start: 0; max-inline-size: 100cqi`, a regra que a linha
    de detalhe já usa.
- Enquanto `outOfSpace().popin` não está vazio, as linhas são medidas uma a uma, como em
  `rowHeight: 'auto'`, qualquer que seja `rowHeight`. O teto `--_row-max-block` não se aplica
  à linha do pop-in. A virtualização usa as medidas por `createRowMetrics`.
- As linhas fixadas (`pinnedRows`) recebem pop-in como as linhas de dados. A linha de
  resumo mostra em pop-in os agregados das colunas em `popin` que os têm.
- Célula de filtro e menu de coluna de uma coluna em `popin` não são renderizados. Filtrar
  essa coluna passa pela `filter-bar`.
- O cursor trata `POPIN_COLUMN_ID` como a última coluna. `Enter` nela ativa a linha, como em
  qualquer célula.

### 4.4 Ativação por toque

- Uma linha `activatable` ativa com um único `click` cujo `pointerdown` foi `touch` ou
  `pen`. A razão emitida é `'pointer'`.
- Não ativa quando o alvo está dentro de um elemento interativo (link, botão, campo,
  checkbox) nem quando a célula está em edição.
- O `dblclick` que chega até 500ms depois de uma ativação por toque é ignorado.
- O rato mantém o duplo clique. O teclado mantém `Enter`.

### 4.5 Menu de coluna por `contextmenu`

Fontes: Excel, Google Sheets e AG Grid Enterprise abrem o menu de coluna com o botão direito
no cabeçalho. O Google Sheets reserva `Shift` + botão direito para o menu do navegador.

- Um `contextmenu` numa célula de cabeçalho de coluna de dados abre o menu de coluna
  existente. O botão de menu (`column-menu`) e `Ctrl+Enter` mantêm-se: o gesto é um caminho
  adicional, nunca o único.
- O evento é `preventDefault()`-ado apenas quando o menu abre.
- O menu do navegador mantém-se:
  - com `Shift` premido;
  - quando o alvo é um campo editável: a linha de filtro, um editor ou um
    `contenteditable`.
- Origem por ponteiro, incluindo o toque longo do Android: o menu abre nas coordenadas do
  evento, pela âncora de ponto do `menu` (`anchor`, a mesma de `slContextMenuTriggerFor`), com
  razão `pointer`.
- Origem por teclado (`Shift+F10`, tecla Menu): o menu abre ancorado à célula de cabeçalho,
  como pelo botão, com razão `keyboard`. A origem é detetada pela janela temporal depois do
  `keydown`, a mesma técnica de `context-menu-trigger.ts`.
- Não se aplica a:
  - calhas de seleção, arraste e expansão;
  - `popin-header`;
  - colunas sem menu de coluna.
- O iOS Safari não dispara `contextmenu` num toque longo (não confirmado). O botão de menu
  continua a ser o caminho em telefone.

## 5. `page` e `page-header` compactos

### 5.1 `page`

- A raiz declara `container: slotted-page / inline-size`.
- Em `@container slotted-page (width < 600px)`, o inset dos contentores da página limita-se
  ao passo 4 da escala de espaço: `data-inset` 5 a 12 passam a `--slotted-space-4`.
- `fill` mantém-se em compacto. O `page-header` recupera a altura pelo snap da §5.2.

### 5.2 Snap por scroll contido (`@slotted/core/sticky-header`)

- Opção nova `contained?: () => HTMLElement | null`: o elemento cujos descendentes com scroll
  comandam o colapso.
- O módulo escuta `scroll` em captura no documento. Considera só alvos dentro de
  `contained()` e diferentes do scroller do próprio header. Guarda o último `scrollTop` por
  alvo num `WeakMap`, e um evento sem variação de `scrollTop` é ignorado.
  - Com `collapse === 'scroll'`, sem pin, expandido, `scrollTop > CONTAINED_COLLAPSE_AT`
    (16px) e a descer: `onScrollRequest(false)`. O módulo marca o colapso como feito por
    scroll contido.
  - Colapsado por scroll contido e `scrollTop` a chegar a 0: `onScrollRequest(true)`.
  - Um colapso feito pelo controlo ou pela aplicação não é revertido pelo scroll contido.
- Os bindings Angular e React do `page-header` passam `contained`: a parte `body` da `page`
  ancestral mais próxima com `data-fill`, ou `null`.

### 5.3 `page-header` em `@container page-header (width < 600px)`

- Título expandido: no máximo 2 linhas (`line-clamp`). Título colapsado: 1 linha com
  reticências.
- Subtítulo: 1 linha com reticências.
- Com uma `toolbar` de `data-overflow='menu'` em `actions`, as ações ficam na linha do
  título:
  - a linha do título passa a `flex-wrap: nowrap`;
  - `actions` passa a `flex: 0 1 auto; min-inline-size: 0`, e a toolbar mede a largura que
    sobra e dobra o excedente no seu menu.
- Sem essa toolbar, o comportamento atual mantém-se: as ações passam para uma linha própria.
- A documentação da família recomenda `slToolbar overflow="menu"` com contrapartes em
  `actions`.

## 6. Nexora

- `core/layout/phone.ts`, `PHONE_QUERY`, `PHONE_COLUMN_IDS` e a troca de `columnState` por
  `matchMedia` são removidos das seis listas: customers, contacts, quotes, orders, products,
  skus.
- Cada lista declara a coluna identificadora (`rowHeader: true`) e `priority` nas colunas-chave.
  As colunas restantes entram no pop-in.
- As ações de `page-header` com mais de uma ação passam a `slToolbar overflow="menu"` com
  contrapartes. As trocas entre ação larga e estreita por `@container page-header (width <
  640px)` em customers e quotes são removidas.
- `list-view-tools` ganha um menu "Ordenar", visível quando `outOfSpace().popin` não está
  vazio, ligado a `query.sort` com ordenação múltipla.
  - Um item por coluna ordenável. Ativá-lo alterna nenhuma → ascendente → descendente →
    nenhuma. Uma coluna que entra na ordenação vai para o fim da lista de chaves, como o
    Shift + clique no cabeçalho.
  - Cada item mostra a direção e, com mais de uma chave, o nível. O nome acessível contém os
    mesmos dados.
  - "Limpar ordenação" no fim, desativado sem ordenação.
- `[hiddenBySpace]` → `[outOfSpace]` no `column-manager`.
- `demos/nexora/angular/LIBRARY-FEEDBACK.md` regista os defeitos de pacote (§1, itens 1–5) e
  o erro da demo (`PHONE_COLUMN_IDS`).
- `pnpm demo:refresh` depois das alterações de pacote.

## 7. Fora do âmbito

- A família `data-list`, para coleções que não são tabelas (`build-order.md`), fica por
  construir.
- Indicador de navegação (chevron) no fim da linha ativável.
- Altura da barra do `app-shell` em compacto.

## 8. Verificação

- Core: testes Vitest de `columnsOutOfSpace`, de `COMPACT_BELOW` no `sticky-header` e da
  opção `contained`.
- `data-grid` Angular e React: pop-in renderizado com rótulo e valor pelo mesmo template,
  `aria-colcount`, `columnOverflow` (`'auto'` com as duas condições, `'popin'`, `'scroll'`),
  `popin: false`, ativação por toque, `dblclick`
  ignorado depois de toque; menu de coluna por `contextmenu` (ponteiro nas coordenadas,
  teclado ancorado à célula, `Shift` e campo editável deixam o menu do navegador, calhas sem
  efeito).
- `column-manager`: estado "Shown in row".
- Styles: `size-classes.test.mjs`; regras compactas de `page-header` e `page`; pop-in no
  `data-grid.styles.test.mjs`.
- Harness do `data-grid` (`tools/harness`), cenas `popin` e `popin-variants`: capturas a
  300px, 360px, 420px, 720px e 1280px, com seleção, ações, colunas fixadas, variantes `plain`/`ruled`/`framed`, as três
  densidades e RTL. Critérios: nenhuma sobreposição, nenhum conteúdo além da largura do grid,
  alinhamento do pop-in com o texto da primeira coluna de dados.
- Entrega: `pnpm check`, os testes das famílias alteradas e o build da demo.
