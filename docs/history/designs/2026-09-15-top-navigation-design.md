# Desenho — `top-navigation`

Inventário: `2026-09-15-top-navigation-capability-inventory.md`. Padrão:
Landmark Regions (a barra) e Disclosure Navigation Menu (os destinos e o
painel de «more»). Lido em 15 de setembro de 2026.

---

## 1. Anatomia

| Parte           | Elemento           | Sempre presente          | Para quê                                                                                                                                                                                                  |
| --------------- | ------------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`          | `header`, ou `div` | sim                      | O contentor de consulta (`slotted-top-navigation`, `inline-size`). `header` sozinha, o landmark `banner`; `div` dentro da parte `banner` de `app-shell`, que já é o `header`.                            |
| `skip`          | `a`                | só com `skipTo`          | O primeiro focável: visível ao focar, salta para `#<skipTo>`.                                                                                                                                              |
| `brand`         | `div`              | sim                      | O aglomerado do início: o `nav-toggle` da casca, quando há, e `home`. Lê `--slotted-app-shell-row-inset` para ficar sobre as marcas da coluna.                                                             |
| `home`          | `a`, ou `span`     | não                      | A marca ligada ao início (`a` com `href`) ou só a marca (`span`).                                                                                                                                          |
| `mark`          | `span`             | não                      | A caixa do logótipo, quadrada, a altura de um controlo `md`.                                                                                                                                              |
| `name`          | `span`             | não                      | O nome do produto. Abaixo de 480 px sai do olho e não do DOM (`visually-hidden`), e o nome acessível de `home` não muda.                                                                                   |
| `context`       | `div`              | não                      | O que a aplicação é neste momento: workspace, loja, ambiente. Conteúdo do consumidor. Abaixo de 480 px passa para o topo do `panel`.                                                                       |
| `nav`           | `nav`              | não                      | O landmark de navegação, com `aria-label` de `messages.navigation` quando o consumidor não dá um.                                                                                                          |
| `list`          | `ul`               | com `nav`                | Os destinos da barra.                                                                                                                                                                                      |
| `item`          | `li`               | com `list`               | Um destino ou uma secção. Leva `priority` (`data-priority`), `data-collapsed`, `data-current`, `data-disabled`.                                                                                            |
| `link`          | `a`                | não                      | O destino. `aria-current="page"` quando corrente; `aria-disabled` e ativação recusada quando desativado.                                                                                                   |
| `trigger`       | `button`           | não                      | Uma secção que abre: o consumidor envolve-o com `menu`. `indicator` no fim.                                                                                                                                |
| `indicator`     | `span`             | com `trigger`            | O chevron `--slotted-icon-chevron-down`, meia volta enquanto `[data-open]`.                                                                                                                                |
| `more`          | `button`           | enquanto algo recolhe    | O gatilho Disclosure do `panel`: `--slotted-icon-ellipsis`, `aria-expanded`, `aria-controls`, `data-overflow` com a contagem, `data-current` enquanto contém o destino corrente. Fica no fim de `list`, dentro de um `li`. |
| `panel`         | `div`              | enquanto algo recolhe    | O que não coube, na ordem: `context`, `panel-list` (`ul`) com os `item` recolhidos, `help`. Dentro da raiz, a seguir a `more` na ordem do DOM, absolutamente posicionado sob a barra. `presence` e `dismissable-layer`. |
| `panel-list`    | `ul`               | com `panel`              | A lista que recebe os `item` recolhidos.                                                                                                                                                                   |
| `search`        | `div`              | não                      | A região da procura, com o `text-field` do consumidor dentro. Cresce no meio da barra até `--slotted-top-navigation-search-size`. Abaixo de 768 px só existe enquanto `searchOpen`, e toma a barra inteira. |
| `search-toggle` | `button`           | com `search`, < 768 px   | `--slotted-icon-search`; pede `searchOpen` verdadeiro. Visível só abaixo de 768 px e enquanto a procura está fechada.                                                                                       |
| `search-close`  | `button`           | com `search`, < 768 px   | `--slotted-icon-x` no fim de `search`, só enquanto aberta em largura estreita; pede `searchOpen` falso.                                                                                                     |
| `actions`       | `div`              | não                      | O aglomerado do fim. A ordem do DOM é a do consumidor; a página de referência prescreve procura, ajuda, notificações, conta.                                                                               |
| `help`          | `a`, ou `button`   | não                      | `--slotted-icon-circle-question`; um destino (`a`) ou um gatilho (`button`) que o consumidor envolve. Abaixo de 480 px passa para o fim do `panel`, como uma fila com rótulo.                                |
| `notifications` | `button`           | não                      | `--slotted-icon-bell` (glifo novo) com `count` no canto. Nunca recolhe: um contador que some é um contador perdido.                                                                                        |
| `count`         | `span`             | não                      | Algarismos tabulares num círculo `--slotted-tone-accent-solid`; pílula a partir de dois algarismos. Faz parte do nome acessível do botão.                                                                  |
| `account`       | `button`           | não                      | O `avatar` do consumidor e, opcionalmente, o nome. Nunca recolhe: é a saída.                                                                                                                                |

Elementos de lista com a semântica nativa e sem papel ARIA: `nav > ul > li >
(a | button)` é o exemplo do APG Disclosure Navigation Menu.

Os botões só de ícone (`search-toggle`, `search-close`, `help`,
`notifications`, `account`, `more`) compõem `tooltip` com o texto de `messages`
(ou o `aria-label` que o consumidor escreveu), aberto por hover e por foco
visível.

## 2. Estado

```json
"stateModel": {
  "open": {
    "more":   { "controlled": "moreOpen",   "uncontrolled": "defaultMoreOpen",   "request": "onMoreOpenChange",   "reasons": ["pointer", "keyboard", "select", "escape", "outsidePress", "resize", "programmatic"] },
    "search": { "controlled": "searchOpen", "uncontrolled": "defaultSearchOpen", "request": "onSearchOpenChange", "reasons": ["pointer", "keyboard", "escape", "blur", "resize", "programmatic"] }
  },
  "current": { "controlled": "value", "uncontrolled": "defaultValue", "request": "onValueChange", "reasons": ["pointer", "keyboard", "programmatic"] }
}
```

- `moreOpen`: `select` é um `link` do painel premido; `resize` é o conjunto
  recolhido a esvaziar-se; `escape` e `outsidePress` vêm de `dismissable-layer`
  com `more` como ramo. Escape devolve o foco a `more`.
- `searchOpen`: só tem efeito abaixo de 768 px; acima, o campo está sempre
  visível e o atributo `data-search-open` não é escrito. `blur` é o foco a sair
  de `search`; `resize` é a largura a passar os 768 px com a procura aberta.
  Abrir move o foco para o primeiro `input` de `search`; fechar devolve-o a
  `search-toggle`.
- `value`: o `value` do destino corrente; um `link` com `current` explícito
  ou `aria-current` do router vence, como em `side-navigation`.
- `overflow` (não mutável): `data-collapsed` no `item`, `data-overflow` em
  `more` e `onCollapseChange(values, "resize")` quando o conjunto muda.
- Precedência: `disabled` > `current` > `active` > `hover` > `focus-visible`.
  `open` é estado de `more`, de `trigger` e da raiz (`data-search-open`); não
  compete com a fila.

## 3. Colapso por container query

Três degraus literais, declarados no contrato como `collapseAt` e comparados
pelo teste de estilo com as condições `@container`:

| Largura da raiz | O que recolhe                                                                   |
| --------------- | ------------------------------------------------------------------------------- |
| `< 1024px`      | `item[data-priority='low']`                                                     |
| `< 768px`       | `item[data-priority='medium']` (a omissão); `search` vira `search-toggle`; `context` para o `panel`; nome da conta oculto |
| `< 480px`       | `item[data-priority='high']`; `help` para o `panel`; `name` oculto; gaps a `--slotted-space-2` |

`context` vai ao painel no degrau médio e não no alto: medida com a barra de
referência (marca e nome, seletor de espaço de trabalho, cinco destinos, campo,
quatro controlos), 640 px não segura um seletor e um campo lado a lado — o
seletor partia uma letra por linha. Entre os degraus, o que cede é a `search`
até ao seu piso (`--slotted-top-navigation-search-min`, 10rem, com peso de
encolhimento 10000) e depois o `name` até à elipse; `context`, `nav` e
`actions` são `flex: 0 0 auto`. Um piso para o nome (`min-inline-size: 6ch`)
foi tentado e revertido: a contribuição de conteúdo mínimo de uma cadeia sem
quebra fez a barra transbordar no seu fim.

A folha decide a imagem sozinha: `display: none` no `item` recolhido dentro de
`list`, `search` oculta, `name` `visually-hidden`. O script decide o resto: um
`ResizeObserver` na raiz escreve `data-collapsed` nos `item` (`priority` contra
o degrau), `data-overflow` em `more`, e liga o `panel`. Antes da hidratação a
barra já está recolhida e `more` já existe no DOM (o script decide só
`data-overflow` e o painel), porque um botão «more» que aparece um quadro
depois é a falha mais visível das duas.

O `panel` é o mesmo DOM. Angular move os `li` recolhidos para `panel-list` ao
abrir e devolve-os a `list` quando `presence` termina; React porta cada `Item`
recolhido por `createPortal` para `panel-list` enquanto o painel está presente.
`context` e `help` seguem a mesma regra. Custo escrito: no React um `Item`
perde o estado local dos filhos ao mudar de sítio, e a família não guarda nenhum
(`current` e `open` vivem na raiz); no Angular o `li` movido continua a ser a
mesma instância.

O `panel` fica dentro da raiz e não no contentor de portal: a ordem do DOM
(`more` › `panel`) é o que faz Tab entrar no painel, que o APG Disclosure
assume e que o flyout de `side-navigation` pagou por estar fora. Custo: um
consumidor que recorta a raiz (`overflow: hidden` na `header`) corta o painel;
dentro de `app-shell` a parte `banner` não recorta.

Abaixo de 480 px o `panel` toma a largura da raiz; acima, alinha-se ao fim e
mede `--slotted-top-navigation-panel-size`. Cada fila do painel lê a geometria
de fila que `app-shell` publica, com a escala de controlo como recurso, para
que o leitor reconheça a lista de `side-navigation`.

## 4. Teclado

Transcrito de
<https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/>,
secção _Keyboard Support_, sem a opção das setas: a barra é uma linha de
controlos que Tab atravessa, e o escopo recusa uma paragem por região.

| Tecla                        | APG                                                                        | Família                                                                                                             | Veredito  |
| ---------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------- |
| `Tab` / `Shift+Tab`          | entre os botões de topo e os links, e pelos links de um painel aberto      | plataforma: `skip`, `home`, cada `link` e `trigger`, `more`, o `panel` aberto, `search`, `help`, `notifications`, `account` | passa     |
| `Enter` / `Space` em `more`  | alterna a visibilidade do painel                                           | plataforma: `button`; a família pede `moreOpen` com `keyboard`                                                     | passa     |
| `Enter` em `link`            | ativa o link                                                               | plataforma: `a`; a família pede `value` com `keyboard` em `click` com `detail === 0`                                | passa     |
| `Space` em `link`            | ativa o link (o exemplo faz script)                                        | a plataforma vence; `side-navigation` e `list-item` tomaram a mesma decisão                                         | departure |
| `Escape`                     | fecha o painel aberto e foca o botão que o controla                        | `dismissable-layer` fecha o `panel` e devolve o foco a `more`; em `search` aberta, fecha e devolve a `search-toggle` | passa     |
| `Enter` / `Space` em `trigger` | abre a secção                                                            | `menu` do consumidor                                                                                                | passa     |
| Setas, `Home`, `End`         | opcionais                                                                  | não adotadas: cada controlo já é uma paragem, e a linha tem menos de dez                                            | passa (opcional) |

Foco visível: anel exterior `--slotted-focus-ring-*` em cada controlo. `skip`
desenha-se ao focar, dentro da barra, no início.

## 5. Landmark e moldura

`landmark` resolve `prop → app-shell → omissão (true)`. React lê
`useAppShellIfPresent()`; Angular injeta `SlAppShellBanner` com `optional:
true`. Com `landmark` falso a raiz é `div`.

`frame` resolve `prop → app-shell (false) → omissão (true)`: com moldura, a raiz
pinta `--slotted-top-navigation-surface`, uma régua inferior e o inset
`--slotted-top-navigation-inset`; sem moldura não pinta nada, porque a parte
`banner` da casca já pinta e já dá o inset. A raiz leva `data-frame`.

O inset não é `padding` da raiz: a condição `@container` mede a caixa de
conteúdo e o `ResizeObserver` (`createWidthGate`) mede a caixa de borda, e com
12 px de `padding` os dois liam larguras diferentes no mesmo degrau. A raiz
publica `--_edge` (`0px`; o inset com `data-frame`) e `brand` e `actions`
somam-no ao seu `padding-inline`; o painel alinha-se por `inset-inline-end:
var(--_edge)`.

## 6. Geometria e tokens

| Valor              | Lê                                        | Recurso                                            |
| ------------------ | ----------------------------------------- | -------------------------------------------------- |
| altura do controlo | `--slotted-control-height-{sm,md,lg}`     | por `size`                                         |
| inset do início    | `--slotted-app-shell-row-inset`           | `0`                                                |
| fila do painel     | `--slotted-app-shell-row-*`               | escala de controlo, como `side-navigation`         |
| gap entre controlos | `--slotted-control-gap-{sm,md,lg}`       | por `size`                                         |
| largura da procura | `--slotted-top-navigation-search-size`    | `28rem`                                            |
| largura do painel  | `--slotted-top-navigation-panel-size`     | `20rem`                                            |
| nome máximo        | `--slotted-top-navigation-name-max`       | `16rem`                                            |
| superfície         | `--slotted-top-navigation-surface`        | `--slotted-surface`                                |
| régua              | `--slotted-top-navigation-border-color`   | `--slotted-border-subtle`                          |

Link corrente: `--slotted-tone-accent-surface` sob `--slotted-tone-accent-text`,
o par que a fundação calibra e que `side-navigation` já usa — uma barra e uma
coluna com dois modos de dizer «estás aqui» é uma biblioteca com duas
respostas. Hover e press são `--slotted-tone-secondary-subtle-{hover,active}`.
R1 recusa a barra sob o link.

Motion: o `panel` entra e sai em `--slotted-duration-medium` (R7, como um
submenu); `indicator` roda em `--slotted-duration-medium`; `search` a tomar a
barra não anima (é uma troca de layout, não um movimento a seguir); press em
`--slotted-duration-instant`.

Glifo novo: `--slotted-icon-bell` (Lucide `bell`, stroke 2). Justificação para
o gate: as duas fontes com notificações na barra (Carbon, UI5) desenham um sino, e nada na escala o substitui — `inbox` diz «recebido», o
ponto diz «há algo» sem dizer o quê.

## 7. Integração — React

| Pergunta                              | Resposta                                                                                                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| par controlado/não + pedido com razão | `moreOpen`/`defaultMoreOpen`/`onMoreOpenChange`; `searchOpen`/`defaultSearchOpen`/`onSearchOpenChange`; `value`/`defaultValue`/`onValueChange`; cada um recebe `ChangeRequest`                             |
| omissões uma vez por aplicação        | `TopNavigationDefaultsProvider` e `useTopNavigationDefaults`: `size`, `landmark`, `frame`, `messages`                                                                                                     |
| substituir o elemento de cada parte   | `render` em `root`, `brand`, `home`, `mark`, `name`, `context`, `nav`, `list`, `item`, `link`, `trigger`, `search`, `actions`, `help`, `notifications`, `account`, `count`. Fixos: `skip` (o alvo é o seu), `indicator` (máscara), `more`, `panel`, `panel-list`, `search-toggle`, `search-close` (a família liga-os) |
| o handler do consumidor corre         | `onClick`, `onKeyDown`, `onFocus`, `onBlur` compostos; `event.defaultPrevented` cancela a parte da família                                                                                                 |
| ref e imperativo                      | `ref` em cada parte; `TopNavigationHandle` com `focus()` (o primeiro controlo), `focusSearch()`, `openMore()`, `closeMore()`                                                                               |
| SSR sem divergência                   | `useId` em `aria-controls`; `data-collapsed`, `data-overflow` e `data-search-open` só depois de montar; a folha decide a imagem pela largura                                                              |
| estados no DOM                        | `data-current`, `data-open`, `data-disabled`, `data-collapsed`, `data-overflow`, `data-search-open`, `data-priority`, `data-size`, `data-frame`                                                          |
| props = elemento nativo estendido     | `ComponentPropsWithRef<'header' \| 'div' \| 'nav' \| 'ul' \| 'li' \| 'a' \| 'button' \| 'span'>` por parte                                                                                                |

## 8. Integração — Angular

| Pergunta                   | Resposta                                                                                                                                                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| valor de duas vias         | `moreOpen = model<boolean>(false)`, `searchOpen = model<boolean>(false)`, `value = model<string \| null>(null)`; `moreOpenChangeRequest`, `searchOpenChangeRequest`, `valueChangeRequest` com `ChangeRequest`                                                              |
| Reactive Forms             | não: uma barra não é um controlo de formulário                                                                                                                                                                                                                             |
| omissões uma vez           | `TOP_NAVIGATION_DEFAULTS`, `provideTopNavigationDefaults()`, `injectTopNavigationDefaults()`                                                                                                                                                                              |
| `exportAs`                 | `slTopNavigation`, `slTopNavigationItem`, `slTopNavigationLink`, `slTopNavigationTrigger`, `slTopNavigationSearch`                                                                                                                                                       |
| conteúdo projetado         | diretivas sobre os elementos do consumidor; `help`, `notifications`, `account`, `search-toggle` e `more` são componentes com `<ng-content />` porque hospedam o `tooltip`; `more` e `panel` são renderizados pela raiz (`slTopNavigation` é componente com `<ng-content />` e o painel no template) |
| zoneless e `OnPush`        | signals; `computed` para o conjunto recolhido; nenhum `markForCheck`                                                                                                                                                                                                       |
| tear-down                  | `DestroyRef.onDestroy` desliga o `ResizeObserver`, `presence` e `dismissable-layer`                                                                                                                                                                                       |
| atributo estático sobrevive | `aria-label` do consumidor em `nav`, `help`, `notifications`, `account` lido com `HostAttributeToken`; `aria-current` do router lido do host; `data-part` reescrito depois da primeira deteção quando `slMenuTriggerFor` o apaga (regra do briefing)                    |
| entry point único          | `@slotted/angular/top-navigation`; importa `@slotted/angular/app-shell` e `@slotted/angular/tooltip` pelos seus entry points                                                                                                                                              |

Assimetria registada: Angular não expõe `defaultMoreOpen`, `defaultSearchOpen`
nem `defaultValue`; um `model()` é os dois lados, como em `side-navigation`.

## 9. Decisões e custos

- **O painel é Disclosure, não `menu`.** Custo: os recolhidos são movidos e
  não reconstruídos; no React, portados. A alternativa (`menu` com itens
  reconstruídos) perdia o `trigger` com sub-menu e qualquer conteúdo que não
  fosse rótulo e `href`.
- **O painel fica dentro da raiz.** Custo: uma raiz recortada corta-o. Ganho:
  Tab entra nele.
- **Prioridade por degrau literal, não por medição.** Custo: uma barra com
  doze itens `high` transborda entre 480 e 768 px; o consumidor decide as
  prioridades. É a instrução da invocação.
- **`help` recolhe, `notifications` e `account` não.** A 240 px cabem o
  gatilho da casca, a marca, a procura, o sino, a conta e `more`; a ajuda é
  uma fila do painel.
- **A procura aberta em largura estreita toma a barra.** UI5 e Carbon; um
  campo de 120 px não serve.
- **Sem `sticky`, sem resultados de procura, sem switcher, sem `stack`.**
  Recusas no inventário, com as linhas do consumidor.

## 10. Decisões tomadas na implementação

- **`count` sobre o canto do sino, fora do fluxo.** O controlo mantém a
  largura do sino, como as caixas ao lado; o disco (`--_icon-size × 0.875`)
  centra-se no canto superior final do glifo, e uma pílula de três caracteres
  cresce por cima do gap até ao halo da conta. Abaixo de 480 px, com um só
  passo de espaço entre os controlos, o contador pendura-se da borda oposta
  do gap e cresce para o sino, para nunca cobrir o avatar. Uma versão no fluxo
  (que alargava o controlo) foi rejeitada na revisão: o contador não é
  conteúdo do botão.
- **`account` é uma pílula com halo.** `padding` de um passo de espaço em
  volta do avatar e `border-radius` total; o avatar esperado fica um passo
  abaixo do controlo (`xs` em `md`), para o chão do ponteiro guardar um halo
  de 5 px. O nome, quando presente, segue com `gap` de `--slotted-space-3`.
- **O rótulo de `help` são os filhos.** Cortado do olho na barra pela própria
  caixa (o texto é um nó de texto, que nenhum seletor de filho alcança), visível
  no painel. Um nome acessível nos dois sítios; `aria-label` só quando o
  consumidor o escreve.
- **Tinta de repouso dos links é `--slotted-text`.** A tinta apagada
  (`text-muted`) fica a um passo da tinta de desativado em `light`, e a fila
  desativada não se distinguia. Os botões de ícone ficam apagados (Carbon).
- **`data-open` do `trigger` é do `menu`.** A folha lê `data-open` no próprio
  `trigger`, que o gatilho de `menu` escreve no elemento em que é renderizado;
  a família não liga nada.
- **Ordem do painel pela folha.** `context` com `order: -1`, `help` com
  `order: 1`; as réguas entre os três são desenhadas do que o painel contém
  (`:has`), porque no React cada parte é portada na ordem em que montou.
- **Gaps a `--slotted-space-2` abaixo de 480.** Cinco controlos sozinhos cabem
  em 240; dentro da casca, com o gatilho e a margem da casca, a barra segura a
  partir de 300.
- **Nome da conta oculto abaixo de 768.** «Quando há espaço» é o degrau da
  procura.
- **`Home` sem `href` e `help` sem `href`** são `span` e `button`; o React
  decide pelo `href`, o Angular pelo elemento do consumidor.
- **Fechos por `resize` são transições.** Uma barra que monta estreita com
  `defaultMoreOpen` mantém o painel; só o conjunto recolhido a esvaziar-se, ou
  a largura a passar 768, fecham.
- **`aria-current="page"` é o estado.** A folha pinta
  `[data-part='link']:is([data-current], [aria-current='page'])`: um link de
  router renderizado por `render` no React escreve `aria-current` no elemento
  que a família não lê de volta, e é pintado corrente pelo atributo que o
  router possui.
- **Salas de largura declarada nas páginas de referência.** A coluna de docs
  mede 676 px a 1280 e 1030 px a 1920, e o degrau mais largo da barra é 1024:
  cada demonstração da barra fica numa `.slotted-demo-room[data-room]`
  (desktop 1024, laptop 900, tablet 640, phone 375) do workbench, uma por
  coluna, com `overflow-x: auto` quando a coluna é mais estreita do que a
  sala. Primitiva partilhada, com teste em
  `tools/storybook-workbench/src/workbench.styles.test.mjs`.
