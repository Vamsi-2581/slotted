# Desenho — `side-navigation`

Inventário: `2026-09-15-side-navigation-capability-inventory.md`. Padrão:
Disclosure Navigation Menu with Top-Level Links (APG). Lido em 15 de setembro
de 2026.

---

## 1. Anatomia

| Parte           | Elemento               | Sempre presente | Para quê                                                                                                                                                         |
| --------------- | ---------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`          | `nav`, ou `div`        | sim             | O contentor de consulta (`slotted-side-navigation`, `inline-size`). `nav` com `aria-label` quando `landmark` resolve verdadeiro; `div` dentro da região `nav` de `app-shell`, que já é o landmark. |
| `section`       | `div`                  | não             | Um grupo de destinos com título. Várias sob uma raiz.                                                                                                             |
| `section-label` | `div`                  | não             | O título da secção. Em modo compacto, oculto e substituído por uma régua.                                                                                        |
| `list`          | `ul`                   | sim             | A lista de itens de um nível: a de topo, ou a de uma secção.                                                                                                     |
| `item`          | `li`                   | sim             | Uma fila: um `link`, ou um `trigger`, ou ambos, e opcionalmente `actions` e `group`. Leva `data-current`, `data-expanded`, `data-open`, `data-disabled`.         |
| `link`          | `a`, ou `button`       | não             | O destino (`a` com `href`), ou um comando na coluna — novo registo, sair, abrir um diálogo — como `button`, com a mesma fila. `aria-current="page"` quando corrente. `aria-disabled` e ativação recusada quando desativado. |
| `trigger`       | `button`               | não             | O botão Disclosure do `group`. Sozinho é a fila inteira; ao lado de um `link` é um botão só de marca, no fim da fila. `aria-expanded`, `aria-controls`.          |
| `icon`          | `span`                 | não             | A caixa da marca, a largura de `--slotted-app-shell-row-mark`. O que resta em modo compacto.                                                                     |
| `label`         | `span`                 | sim             | O texto da fila. Uma linha, cortada no fim ou no meio por `truncate`, e o `tooltip` com o texto inteiro na fila que o binding mediu cortada; `truncate="none"` envolve. Em compacto, oculto do olho e não do DOM. |
| `description`   | `span`                 | não             | A segunda linha. Oculta em compacto.                                                                                                                             |
| `end`           | `span`                 | não             | O sufixo com tom: `badge`, `kbd`. Oculto em compacto; a marca ganha um ponto enquanto ele existe.                                                                |
| `count`         | `span`                 | não             | Uma quantidade sem tom, desenhada pela família: algarismos tabulares no passo da descrição, tinta apagada, tinta do corrente quando corrente. Oculta em compacto, com ponto na marca. |
| `indicator`     | `span`                 | não             | O chevron do `trigger`: `--slotted-icon-chevron-right` fechado, um quarto de volta para baixo aberto; espelhado em RTL. Oculto em compacto.                       |
| `actions`       | `div`                  | não             | Controlos ao lado da fila, fora do `a` e do `button`. Ocultos em compacto.                                                                                       |
| `group`         | `ul`                   | não             | Os filhos de um `item`. Em linha, indentado, com uma guia; em compacto, dentro de `flyout`.                                                                       |
| `divider`       | `li` `role="separator"` | não            | Uma régua entre itens sem quebrar a lista.                                                                                                                       |
| `skeleton`      | `li` `aria-hidden`     | não             | Uma fila com a geometria de `item` cujas caixas são `skeleton`.                                                                                                  |
| `flyout`        | `div`                  | só em compacto  | A camada que apresenta um `group` ao lado da calha. Composta de `portal`, `positioner`, `presence` e `dismissable-layer`. Traz `data-ui="side-navigation"` própria, porque está fora da raiz. |

Elementos de lista mantidos com a sua semântica nativa, sem papel ARIA: a
estrutura `nav > ul > li > (a | button) + ul` é a do exemplo APG, e o leitor de
ecrã anuncia «lista de N itens» por nível sem que a família escreva nada.

## 2. Estado

```json
"stateModel": {
  "open": {
    "expanded": { "controlled": "expanded", "uncontrolled": "defaultExpanded", "request": "onExpandedChange", "reasons": ["pointer", "keyboard", "select", "escape", "programmatic"] },
    "flyout":   { "controlled": "flyout",   "uncontrolled": "defaultFlyout",   "request": "onFlyoutChange",   "reasons": ["pointer", "keyboard", "select", "escape", "outsidePress", "blur", "resize", "programmatic"] }
  },
  "current": { "controlled": "value", "uncontrolled": "defaultValue", "request": "onValueChange", "reasons": ["pointer", "keyboard", "programmatic"] }
}
```

- `expanded` é o conjunto de `value` de itens abertos em linha, sobre
  `@slotted/core/disclosure`: `multiple=false` fecha os irmãos com `select`.
  `escape` é o grupo que contém o foco a fechar pela tecla, como o APG manda.
  `select` também é o pai que abre porque `value` caiu dentro dele
  (`autoExpand`).
- `flyout` é o `value` do único item cujo grupo está na camada, ou `null`.
  Transitório: `blur` quando o foco sai da camada, `resize` quando o modo
  compacto termina, `select` quando um `link` da camada é premido. Nunca
  escreve em `expanded`.
- `value` é o `value` do destino corrente. A família escreve
  `aria-current="page"` no `link` cujo `value` coincide. Um `link` com
  `current` explícito (ou `aria-current` escrito por um router) vence o `value`
  da raiz, porque o valor explícito do consumidor vence sempre. Premir um
  `link` pede `value` com `pointer` ou `keyboard`; a navegação é do `a`.
- Um `item` pai leva `data-current` enquanto contém o destino corrente e o seu
  grupo está fechado, ou em modo compacto: aberto, a folha diz onde o leitor
  está. Só o `link` corrente leva `aria-current`.
- Precedência: `disabled` > `current` > `active` > `hover` > `focus-visible`.
  `expanded` e `open` são estados do `item`, não da fila, e não competem.

## 3. Modo compacto

`mode: auto | expanded | compact`. `auto` responde à largura da raiz:
`@container slotted-side-navigation (inline-size < 96px)` compacta as partes.
`compactAt: 96` é declarado no contrato e o teste de estilo compara o literal
da consulta com ele, o que `app-shell` já faz com `overlayAt`.

O que a folha decide sozinha, antes de qualquer script: `label`,
`description`, `end`, `actions`, `indicator` ocultos; `section-label` vira
régua; `item` centra a marca; `trigger` ao lado de um `link` some. O `link`
continua a navegar.

O que o script decide: um `ResizeObserver` na raiz escreve `data-compact`
quando a largura é inferior a `compactAt` (ou `mode="compact"`), e é
`data-compact` que liga o `tooltip` em cada fila e o `flyout` num `trigger`
sem `link`. Antes da hidratação a coluna já está compacta e ainda não tem
`tooltip`, que é a falha mais silenciosa das duas.

- **Tooltip.** Cada `link` e `trigger` compõe `tooltip` com
  `side="inline-end"`, `describes="description"`, aberto por hover e por
  foco visível, só enquanto `data-compact`. O conteúdo é o texto de `label`.
  React: `<Tooltip disabled={!compact}>` à volta da fila. Angular: `link` e
  `trigger` são componentes com `hostDirectives: [SlTooltip]` e um
  `ng-template slTooltipLayer` no próprio template sob `@if (compact())`; a
  fila despacha `pointerenter`, `pointerleave`, `focus` e `blur` para o
  `SlTooltip` só em compacto, e escreve `aria-describedby` só enquanto ele está
  aberto. `SlTooltipTrigger` não é usado porque as suas entradas
  (`openOn`, `disabled`) só se ligam do template do consumidor, e a família é
  quem decide quando a fila é um gatilho.
- **Flyout.** Em compacto, premir um `trigger` sem `link` pede `flyout` para o
  `value` do item. A camada é um `div[data-ui=side-navigation][data-part=flyout]`
  no contentor de portal, posicionada em `inline-end`/`start` do `item` por
  `positioner`, com `presence` para a saída e `dismissable-layer` para
  `escape` e `outsidePress` (o `trigger` é um ramo). O `group` é apresentado
  dentro dela: em React por `createPortal` do `ul`; em Angular o `ul` do
  consumidor é movido para a camada e devolvido ao `li` quando ela sai, que é o
  que `DomPortalOutlet` do CDK faz. Um `link` premido na camada pede `flyout`
  a `null` com `select`. Foco: `ArrowDown` no `trigger` entra na camada; o foco
  a sair dela fecha-a (`blur`) e `Escape` fecha e devolve o foco ao `trigger`.
  Custo escrito: `Tab` a partir do `trigger` segue para o item seguinte da
  coluna, não para a camada — a camada está fora do fluxo do DOM. O item
  híbrido (`link` + `trigger`) não tem flyout em compacto: a marca é o `link`,
  o `trigger` está oculto, e os filhos alcançam-se pela rota ou ao alargar.
- **Ponto na marca.** `item:has(> [data-part=end]) > … > [data-part=icon]::after`
  desenha um ponto em `--slotted-tone-accent-solid` no canto da marca só em
  compacto. É a capacidade que ninguém pediu: um contador que some quando a
  coluna encolhe é um número perdido.

## 3b. Truncamento

Cinco decisões, todas no contrato sob `truncate`:

1. **Onde cai o corte.** `truncate: end | middle | none`, omissão `end`.
   `end` é a folha de estilo (`text-overflow: ellipsis`). `middle` é o
   binding: mede o rótulo contra a própria caixa com `@slotted/core/text` e
   mantém o início e a cauda — a última palavra se curta, senão os últimos
   seis grafemas — para que dois nomes que só diferem no fim continuem dois
   nomes (`Relatório mensal · setembro` / `· outubro`). O texto inteiro é o
   `aria-label` da fila. `none` envolve, com `overflow-wrap: anywhere`; não é
   a omissão porque uma fila com o dobro da altura das vizinhas quebra o ritmo
   pelo qual a coluna se lê.
2. **Como se chega ao todo.** O binding mede cada rótulo e descrição no
   `ResizeObserver` da raiz e depois de `document.fonts.ready`; a fila cortada
   leva `data-clipped` e abre o mesmo `tooltip` do modo compacto, com o rótulo
   inteiro e a descrição inteira por baixo, ao passar, ao focar visivelmente e
   ao premir-e-segurar no toque. Uma fila que cabe não abre nada.
3. **O que cede primeiro.** Só o rótulo encolhe; marca, contador, sufixo,
   chevron e ações mantêm a largura. Um número nunca fica num dígito.
4. **O que nunca corta.** O `count` (o formato acima de mil é do produto) e o
   título de secção, que envolve: não é uma fila, não tem tooltip, e um título
   cortado sobre a lista que nomeia é um título perdido.
5. **Reticências, não esbatimento.** Um esbatimento esconde que falta algo.

## 4. Teclado

Transcrito de
<https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation-hybrid/>,
secção _Keyboard Support_. As setas, `Home` e `End` são opcionais no APG e
adotadas.

| Tecla                      | APG                                                                                                                                     | Família                                                                                                        | Veredito |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| `Tab` / `Shift+Tab`        | entre links e botões de topo e, se um grupo está aberto, pelos links dele                                                                | plataforma: cada `link` e `trigger` é uma paragem; um `group` fechado é `hidden`                              | passa    |
| `Enter` / `Space` no botão | alterna a visibilidade do grupo                                                                                                         | plataforma: `button`                                                                                          | passa    |
| `Enter` no link            | ativa o link e escreve `aria-current`                                                                                                   | plataforma: `a`; a família pede `value` com `keyboard` no `click` com `detail === 0`                          | passa    |
| `Space` no link            | ativa o link                                                                                                                            | plataforma: `Space` num `a` rola a página. A família não intercepta: `list-item` tomou a mesma decisão         | departure — a plataforma vence; custo: `Space` não navega |
| `Escape`                   | se um grupo está aberto, fecha-o e foca o botão que o controla                                                                          | o `group` que contém o foco fecha com `escape` e o foco vai ao seu `trigger`; no flyout, `dismissable-layer`  | passa    |
| `ArrowDown` / `ArrowRight` | para o próximo link ou botão de topo; num botão aberto, para o primeiro link do grupo; num link do grupo, para o próximo                | para o próximo `link` ou `trigger` visível na ordem do DOM, atravessando grupos abertos e o flyout            | passa (adaptado: a lista é plana e a família não distingue nível) |
| `ArrowUp` / `ArrowLeft`    | o inverso                                                                                                                               | o inverso                                                                                                      | passa    |
| `Home`                     | para o primeiro item de topo, ou o primeiro link do grupo                                                                               | para o primeiro `link` ou `trigger` visível da raiz                                                            | passa (adaptado) |
| `End`                      | para o último                                                                                                                           | para o último                                                                                                  | passa (adaptado) |

`ArrowLeft` e `ArrowRight` são sinónimos de cima e baixo no APG e não são
espelhados em `dir="rtl"`: não apontam para lado nenhum.

Foco visível: anel exterior `--slotted-focus-ring-*` na fila, com
`outline-offset` negativo porque a fila é uma linha dentro de uma coluna que
recorta (`nav-body` de `app-shell` tem `overflow: auto`).

## 5. Landmark

`landmark` resolve `prop → app-shell → omissão (true)`. React lê o contexto de
`app-shell` sem lançar por `useAppShellIfPresent()`, uma exportação nova de
`packages/react/src/app-shell` de seis linhas; Angular injeta `SlAppShellNav`
com `optional: true`. Quando a raiz é `div`, o `aria-label` não é escrito.
`messages.navigation` («Navegação») é o nome quando o consumidor não dá um.

## 6. Geometria e tokens

A fila lê as seis propriedades que `app-shell` publica, com a escala de controlo
como recurso:

| Valor           | Lê                                    | Recurso                                      |
| --------------- | ------------------------------------- | -------------------------------------------- |
| altura da fila  | `--slotted-app-shell-row-height`      | `--slotted-control-height-{sm,md,lg}` por `size` |
| caixa da marca  | `--slotted-app-shell-row-mark`        | a altura da fila                             |
| inset           | `--slotted-app-shell-row-inset`       | `--slotted-space-4`                          |
| gap             | `--slotted-app-shell-row-gap`         | `--slotted-control-gap-{sm,md,lg}`           |
| tipo            | `--slotted-app-shell-row-font-size`   | `--slotted-font-size-{xs,sm,md}`             |
| entrelinha      | `--slotted-app-shell-row-line-height` | `--slotted-line-height-sm`                   |

`size="md"` é o que lê a casca; `sm` e `lg` leem a sua própria escala, porque
um `size` explícito é um valor explícito do consumidor.

O texto é centrado pela tinta e não pela caixa de linha: `text-box: trim-both
cap alphabetic` no rótulo, na descrição, no contador e no título de secção,
sob `@supports`, com o meio-entrelinha devolvido por `padding-block` para que a
fila mantenha a altura — o tratamento de `button`, `badge`, `kbd` e `tag`.
Sem suporte, a caixa de linha é centrada e o texto fica um pixel alto em `md`.

Indentação de um `group` sob uma fila com marca: `--slotted-side-navigation-indent`,
omissão `calc(mark + gap)`, para que o rótulo do filho fique sob o rótulo do
pai, com a guia (`guides`) sob o centro da marca. Sob uma fila sem marca — o
segundo nível em diante — o passo é `--slotted-side-navigation-indent-step`
(20 px), com a guia na aresta do texto do pai. Cinco níveis: 42 + 4 × 20 =
122 px de recuo numa coluna de 240; o quinto rótulo fica com 110 px. Vaadin
recomenda três; a família não limita.

Motion: o trilho do grupo abre em `--slotted-duration-medium`; as filas
dentro dele entram em `--slotted-duration-short` depois de um passo curto e
saem antes de o trilho dobrar; o chevron roda em `--slotted-duration-medium`, a duração do trilho; o `item` empacota os trilhos no início, porque um trilho `auto` esticado toma o espaço livre a meio da transição e a fila salta;
o press responde em `--slotted-duration-instant`; a camada segue R7. O rótulo
a sair para a calha não anima: a largura da região é o que anima, em
`app-shell`.

Item corrente: `--slotted-tone-accent-surface` sob rótulo e marca em
`--slotted-tone-accent-text`, o par que a fundação calibra. A barra no início
da fila que Carbon e PatternFly desenham é recusada por
`packages/styles/src/state-rail.test.mjs` (R1) para toda a biblioteca. Hover e
press são `--slotted-tone-secondary-subtle-{hover,active}`. Tudo vira com
`dir`.



## 7. Integração — React

| Pergunta                                       | Resposta                                                                                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| par controlado/não + pedido com razão          | `expanded`/`defaultExpanded`/`onExpandedChange`; `flyout`/`defaultFlyout`/`onFlyoutChange`; `value`/`defaultValue`/`onValueChange`; cada um recebe `ChangeRequest`         |
| omissões uma vez por aplicação                 | `SideNavigationDefaultsProvider` e `useSideNavigationDefaults`: `size`, `mode`, `multiple`, `autoExpand`, `guides`, `truncate`, `landmark`, `compactAt`, `messages`          |
| substituir o elemento de cada parte            | `render` em `root`, `section`, `section-label`, `list`, `item`, `link`, `trigger`, `icon`, `label`, `description`, `end`, `actions`, `group`, `divider`. `indicator`, `skeleton` e `flyout` são fixos: o primeiro é uma máscara, o segundo desenha `skeleton`, o terceiro é a camada que o núcleo posiciona |
| o handler do consumidor corre                  | `onClick`, `onKeyDown`, `onFocus` e `onBlur` compostos; `event.defaultPrevented` cancela a parte da família                                                                 |
| ref e imperativo                               | `ref` em cada parte; `SideNavigationHandle` com `focus()` (primeiro `link` ou `trigger`), `expand(value)`, `collapse(value)`                                              |
| SSR sem divergência                            | `useId` nos `aria-controls`; `data-compact` só depois de montar; a folha decide o compacto pela largura                                                                    |
| estados no DOM                                 | `data-current`, `data-expanded`, `data-open`, `data-disabled`, `data-compact`, `data-mode`, `data-size`, `data-guides`                                    |
| props = elemento nativo estendido              | `ComponentPropsWithRef<'nav' \| 'ul' \| 'li' \| 'a' \| 'button' \| 'span' \| 'div'>` por parte                                                                            |

## 8. Integração — Angular

| Pergunta                                   | Resposta                                                                                                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| valor de duas vias                         | `expanded = model<string[]>`, `flyout = model<string \| null>`, `value = model<string \| null>`; `expandedChangeRequest`, `flyoutChangeRequest`, `valueChangeRequest` com `ChangeRequest` |
| Reactive Forms                             | não: uma navegação não é um controlo de formulário e não tem valor a submeter                                                                                            |
| omissões uma vez                           | `SIDE_NAVIGATION_DEFAULTS`, `provideSideNavigationDefaults()`, `injectSideNavigationDefaults()`                                                                           |
| `exportAs`                                 | `slSideNavigation`, `slSideNavigationItem`, `slSideNavigationLink`, `slSideNavigationTrigger`                                                                            |
| conteúdo projetado                         | diretivas sobre os elementos do consumidor (`nav`, `ul`, `li`, `a`, `button`, `span`); `link` e `trigger` são componentes com `<ng-content />` porque hospedam o `tooltip`; `slSideNavigationGroup` sobre o `ul` do consumidor, movido para a camada em compacto |
| zoneless e `OnPush`                        | signals; `computed` para tudo o que é derivado; nenhum `markForCheck`                                                                                                     |
| tear-down                                  | `DestroyRef.onDestroy` desliga o `ResizeObserver`, a camada, o `positioner` e o `dismissable-layer`                                                                       |
| atributo estático sobrevive                | `aria-label` do consumidor lido com `HostAttributeToken` antes de escrever `messages.navigation`; `aria-current` do router lido do host e não sobrescrito                  |
| entry point único                          | `@slotted/angular/side-navigation`; importa `@slotted/angular/app-shell`, `@slotted/angular/tooltip` e `@slotted/angular/skeleton` pelos seus entry points               |

Assimetria registada: Angular não expõe `defaultExpanded`, `defaultFlyout` nem
`defaultValue`; um `model()` é os dois lados. `app-shell` tomou a mesma decisão
e o contrato lista só os eixos em `defaults`, pela mesma razão.

## 9. Decisões e custos

- **`nav` ou `div` pelo contexto da casca.** Custo: uma exportação nova em
  `app-shell` (React). A alternativa — `landmark={false}` escrito pelo
  consumidor — falha em silêncio com dois landmarks aninhados.
- **A calha lida pela largura.** Custo: `data-compact` chega depois da
  hidratação e o `tooltip` com ele; o primeiro paint já está compacto. A
  alternativa — ler `open` e `collapsedTo` do contexto da casca — deixava uma
  coluna estreita fora da casca sem resposta.
- **Flyout composto do núcleo e não da família `popover`.** Custo: a família
  liga quatro módulos. A alternativa dava dois DOMs diferentes por binding
  (React com a raiz de `popover`, Angular sem template para a estampar) e uma
  folha de estilo que não podia desenhar os dois.
- **O `group` é movido no Angular e re-renderizado no React.** Mesmo DOM à
  chegada; o React perde o estado local dos filhos ao mudar de apresentação,
  que a família não guarda em lado nenhum: `expanded` e `value` vivem na raiz.
- **`Space` num `link` não navega.** A plataforma. `list-item` decidiu o mesmo.
- **Sem `tone`, sem barra, sem `variant` de superfície, sem cabeçalho e
  rodapé.** O tema retoca os tokens; a casca tem as extremidades; R1 recusa a
  barra.
