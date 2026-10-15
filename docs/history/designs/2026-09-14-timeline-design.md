# Desenho — `timeline`

Decisões tomadas antes de escrever o contrato, o stylesheet ou qualquer
binding. O inventário que as alimenta está em
`docs/history/designs/2026-09-14-timeline-capability-inventory.md`.

O leitor deste documento é a família que herda as decisões.

---

## 1. O que a família é

Uma lista ordenada de eventos, cada um com um marcador sobre uma linha
contínua, um timestamp de máquina e um conteúdo. Em `mode="feed"` a mesma
lista é o padrão _Feed_ do APG: cresce sozinha, cada evento é um artigo, e o
teclado salta de artigo em artigo.

O que a família **não** é: um fluxo com passos que o leitor percorre
(`stepper`), uma lista genérica com seleção (`list`, `listbox`), uma
disclosure por item (`collapsible`, composta dentro do conteúdo), um
calendário (`calendar`) nem uma vista de Gantt (`docs/component-features.md`
§16).

---

## 2. Anatomia

| Parte             | `mode="list"`         | `mode="feed"`                  | Existe quando                                                   |
| ----------------- | --------------------- | ------------------------------ | --------------------------------------------------------------- |
| `root`            | `div`                 | `div`                          | sempre; `data-ui="timeline"`, contentor de query                |
| `fresh`           | `button`              | `button`                       | `freshCount > 0`; antes de `list`, fora do feed                 |
| `list`            | `ol`                  | `div[role="feed"]`             | sempre                                                          |
| `group`           | `li`                  | `div`                          | o consumidor agrupa                                             |
| `group-label`     | `h2`…`h6` por `level` | `h2`…`h6` por `level`          | dentro de `group`                                               |
| `group-trigger`   | `button`              | `button`                       | dentro de `group-label`, grupo `collapsible`                    |
| `group-indicator` | `span`                | `span`                         | dentro de `group-trigger`; chevron de `--slotted-icon-chevron-down` |
| `group-list`      | `ol`                  | `div`                          | dentro de `group`; `hidden` quando fechado                      |
| `item`            | `li`                  | `article` com `tabindex="0"`   | um por evento                                                   |
| `opposite`        | `div`                 | `div`                          | o consumidor projeta conteúdo                                   |
| `rail`            | `div`                 | `div`                          | sempre, dentro de `item`; a coluna do marcador e da linha       |
| `marker`          | `span`                | `span`                         | sempre, dentro de `rail`                                        |
| `connector`       | `span` `aria-hidden`  | `span` `aria-hidden`           | dentro de `rail`, exceto no último item da sua lista            |
| `content`         | `div`                 | `div`                          | sempre, dentro de `item`                                        |
| `title`           | `div`                 | `div`                          | o consumidor projeta ou passa `title`                           |
| `actor`           | `div`                 | `div`                          | o consumidor projeta ou passa `actor`                           |
| `time`            | `time[datetime]`      | `time[datetime]`               | o consumidor passa `time`                                       |
| `description`     | `div`                 | `div`                          | o consumidor projeta ou passa `description`                     |
| `actions`         | `div`                 | `div`                          | o consumidor projeta ou passa `actions`                         |
| `more`            | `div` ou `button`     | `div` ou `button`              | `growing !== 'none'`; depois de `list`, fora do feed            |
| `empty`           | `div`                 | `div`                          | sem itens e sem `loading`                                       |

`root` e `list` são dois elementos porque a família muda as próprias faixas
com uma query de contentor, que é a decisão já tomada em
`docs/build-briefing.md` para `stepper` e `description-list`.

Em `feed`, `list` é `div[role="feed"]` e não `ol[role="feed"]`: um `li` não
admite `role="article"` pela tabela _ARIA in HTML_, e `article` é o elemento
que o padrão pede. `group` e `group-list` são `div` genéricos nesse modo, para
os artigos continuarem descendentes do feed sem um papel intermédio; o
`group-label` continua a ser um heading, e é a partida deliberada registada em
§9.

`rail` existe para a coluna do marcador ter uma largura fixa em token: o
marcador centra-se nela e a linha passa pelo centro dos dois, o que é o que
resolve a lacuna do ponto e do avatar na mesma lista.

`connector` é um elemento e não um pseudo-elemento porque `dashed` é por item
e o consumidor pode estilizar a linha de um item sem estilizar as outras.

### A grelha do item

Vertical, `placement="end"`: `[opposite] [rail] [content]` em três colunas;
`opposite` tem largura `--slotted-timeline-opposite-size` e existe como coluna
só quando algum item da lista a projeta, que a folha lê com
`[data-part='list']:has([data-part='opposite'])`. `placement="start"`:
`[content] [rail] [opposite]`. `placement="alternate"`: a coluna do meio é o
`rail` e os itens pares trocam de lado por `:nth-child(even)`; um item que
declara `data-side` ganha. Nenhum dos dois é escrito por um binding.

Horizontal: a mesma grelha transposta, com `rail` em cima do `content`, os
itens em `grid-auto-flow: column` de largura `--slotted-timeline-track-min` e
a lista a rolar no eixo inline. Abaixo de `--slotted-timeline-reflow-breakpoint`
a lista volta a coluna, salvo `reflow={false}`.

O marcador alinha à primeira linha do título pela regra que `toast` e
`alert` desenham as suas marcas: `rail` é uma coluna flex esticada à linha,
com o `line-height` do título, e o marcador é empurrado do topo por
`calc((1lh - <size>) / 2)`. O `vertical-align` com `1cap`/`1ex` do briefing
não alcança a linha do título de outra célula, e `toast` já voltou a esta
regra e diz porquê. A distância entre dois eventos é a margem do item, para o
anel de foco de um artigo envolver o evento e não o ar; a linha atravessa a
margem.

---

## 3. Estado

| Valor           | Onde vive          | Mutável | Modelo                                                                    |
| --------------- | ------------------ | ------- | ------------------------------------------------------------------------- |
| `open`          | cada `group`       | sim     | `open` / `defaultOpen` / `onOpenChange(open, reason)`; `pointer`, `keyboard`, `programmatic` |
| `loading`       | `root` e `item`    | não     | facto do consumidor; `aria-busy` no feed, marcador a rodar no item        |
| `current`       | `item`             | não     | facto do consumidor; `aria-current="true"`                                |
| `complete`      | `item`             | não     | facto do consumidor, ou derivado por `autoComplete`                       |
| `freshCount`    | `root`             | não     | facto do consumidor; `onReveal(reason)` é um pedido sem valor             |
| `onLoadMore`    | `root`             | não     | pedido sem valor, com `pointer`, `keyboard` ou `scroll`                   |

`open` é o único valor mutável e o único que tem modelo. `growing` e `fresh`
são pedidos de ação: a família não tem "mais itens" nem "itens novos" para
segurar; o consumidor tem, e é ele que os acrescenta ao array.

`autoComplete` usa `order`: em `oldest-first` são `complete` os itens antes do
`current` na ordem do DOM; em `newest-first`, os depois dele. Um item que
declara `complete` ganha sempre.

### Precedência

`loading` > `current` > `complete` > `hover` > `focus-visible`, pela ordem de
`STATE_PRECEDENCE`. Um item `loading` não pinta `current`. Só `group-trigger`,
`fresh` e `more` em modo `button` têm `hover` e `active`; um `item` em `feed`
tem `focus-visible` e nada mais, porque um artigo não é um controlo.

---

## 4. Teclado, foco e ARIA

### Feed — tabela do APG transcrita

Fonte: _Feed Pattern_, <https://www.w3.org/WAI/ARIA/apg/patterns/feed/>, lida
em 14 de setembro de 2026.

| Tecla              | Efeito                                                | Foco                                           | Estado    |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------- | --------- |
| `PageDown`         | move o foco para o artigo seguinte                    | o artigo                                       | família   |
| `PageUp`           | move o foco para o artigo anterior                    | o artigo                                       | família   |
| `Control+End`      | move o foco para o primeiro focável depois do feed    | fora do feed                                   | família   |
| `Control+Home`     | move o foco para o primeiro focável antes do feed     | fora do feed                                   | família   |
| `Tab`              | atravessa os artigos e os controlos dentro deles      | plataforma                                     | plataforma |

Papéis e propriedades do padrão, e onde cada um é respondido:

| Requisito                                                     | Resposta                                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| o contentor tem `role="feed"`                                 | `list` em `mode="feed"`                                                                           |
| o feed tem `aria-labelledby` ou `aria-label`                  | `label` ou `labelledBy` na raiz; sem nenhum, a família escreve na consola em desenvolvimento      |
| cada unidade é um `article`                                   | `item` em `mode="feed"`                                                                           |
| `article` tem `aria-labelledby` para um rótulo distintivo     | `title`, senão `actor`, senão `time`; ids gerados por `@slotted/core/identity`                     |
| `article` tem `aria-describedby` (recomendado)                | `description`, quando existe                                                                      |
| `article` tem `aria-posinset`                                 | índice na lista inteira, contando grupos, a partir de 1                                           |
| `article` tem `aria-setsize`                                  | `count` da raiz; sem ele, o número de itens carregados; `-1` quando `count` é `Infinity`          |
| `aria-busy="true"` no feed enquanto carrega                   | `loading` na raiz                                                                                 |
| artigos focáveis                                              | `tabindex="0"` no artigo, como no exemplo do APG                                                  |
| `Control+Home` / `Control+End` saem do feed                   | `@slotted/core/focus` (`focusableElements`) a partir de `root`                                    |

Em `mode="list"` nenhuma linha acima se aplica: a lista é uma `ol` e o
teclado é o da plataforma.

### Grupo colapsável — Disclosure

Fonte: _Disclosure Pattern_, <https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/>.

| Tecla / propriedade         | Resposta                                                  |
| --------------------------- | --------------------------------------------------------- |
| `Enter`, `Space` no botão   | plataforma: `button`                                      |
| `aria-expanded`             | `group-trigger`                                           |
| `aria-controls`             | `group-trigger` → `group-list`                            |
| o conteúdo fechado sai do fluxo | `group-list` recebe `hidden`; em `feed`, `aria-setsize` continua a contar os itens fechados e `aria-posinset` não muda |

### Nome acessível do item

Em `list` um `li` não precisa de nome. Em `feed` o rótulo é a concatenação
por `aria-labelledby` na ordem `title`, `actor`, `time`, que é o que um leitor
ouve ao aterrar: _Deploy concluído, Ana Ribeiro, há duas horas_. O estado
`current` acrescenta a mensagem `current` numa `visually-hidden` dentro do
título, porque `aria-current` não é lido por todos os leitores de ecrã dentro
de um artigo.

---

## 5. Eixos e resolução

| Eixo          | Valores                                  | Omissão        | Resolução                        |
| ------------- | ---------------------------------------- | -------------- | -------------------------------- |
| `mode`        | `list`, `feed`                           | `list`         | prop, defaults, omissão          |
| `orientation` | `vertical`, `horizontal`                 | `vertical`     | prop, defaults, omissão          |
| `placement`   | `end`, `start`, `alternate`              | `end`          | prop, defaults, omissão          |
| `order`       | `oldest-first`, `newest-first`           | `oldest-first` | prop, defaults, omissão          |
| `variant`     | `solid`, `outline`, `subtle`, `plain`    | `subtle`       | item, raiz, defaults, omissão    |
| `tone`        | os cinco tons                            | `secondary`    | item, raiz, defaults, omissão    |
| `size`        | `sm`, `md`, `lg`                         | `md`           | prop, defaults, omissão          |
| `connector`   | `solid`, `dashed`, `none`                | `solid`        | item; `dashed` derivado por `autoComplete` para o lado futuro |
| `growing`     | `none`, `button`, `scroll`               | `none`         | prop, defaults, omissão          |
| `timeFormat`  | `absolute`, `relative`                   | `absolute`     | `time`, raiz, defaults, omissão  |
| `level`       | `2`…`6`                                  | `3`            | grupo, raiz, omissão             |

`variant` omite `subtle`: ver «Marcador: ponto e emblema» em §6.

`reflow` é booleano na raiz, omissão `true`, e só tem efeito em `horizontal`.

---

## 6. Timestamp

`time` aceita `value: PlainDateTime | string`. Uma string com designador de
fuso (`Z` ou `±hh:mm`) é um instante e é formatada no `timeZone` declarado;
uma string sem designador, ou um `PlainDateTime`, é um valor de parede e é
formatado sem conversão. `datetime` recebe a string tal como foi dada, ou o
ISO do `PlainDateTime`.

Em `absolute`, o texto é `Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone })`.
Em `relative`, o texto é `Intl.RelativeTimeFormat(locale, { numeric: 'auto' })`
na maior unidade inteira, e `title` recebe o texto absoluto. O instante de
referência é `now` (época em milissegundos) do `time`, da raiz ou dos
defaults; sem nenhum, `Date.now()` na renderização.

Custo escrito: `relative` sem `now` em SSR produz um texto no servidor e outro
no cliente, e o React avisa da divergência. O remédio é `now` nos defaults, e a
página de referência mostra-o.

A lógica vive em `@slotted/core/timeline`: `formatTimestamp`, `isInstant`,
`relativeUnit`, `feedFocusTarget`, `sideOf`, `isCompleteBefore`. Nada nela
toca o DOM.

---

### Marcador: ponto e emblema

Revisto em 24 de setembro de 2026, em duas rodadas da revisão visual. O
primeiro desenho tinha um marcador vazio de 24 pixels (anel de 2, ponto de 12)
a 8 pixels do título: uma coluna de botões de rádio. A segunda rodada mediu a
linha um pixel de dispositivo fora do centro de um ponto de 8 pixels e pediu o
ponto do tamanho do spinner.

| Marcador | Quando                                  | `md`, `comfortable` |
| -------- | --------------------------------------- | ------------------- |
| ponto    | `marker` vazio, ou com um spinner       | 13 px, núcleo 5 px  |
| emblema  | `marker` com glifo ou avatar            | 21 px, glifo 12 px  |

- **Paridade.** Toda largura em que a linha se centra — ponto, núcleo,
  emblema, coluna — é a espessura da linha mais um número par de pixels,
  arredondado para cima com `round()`. A linha fica um número inteiro de
  pixels dentro de cada uma. Com um ponto de 8 e uma linha de 1, a linha ficava
  a 3,5 pixels, o navegador arredondava o meio pixel, e a linha era desenhada
  1 pixel de dispositivo fora do centro a 100%, 150% e 200% (medido no
  harness). Depois da mudança, o desvio medido em fatores de escala reais de
  0,67 a 3 é no máximo 0,19 pixel de dispositivo. O zoom CSS do harness
  (`--zoom`) ainda mostra 1 pixel em alguns fatores fracionários, porque a
  espessura da borda é arredondada para baixo e a caixa não; o zoom do
  navegador não passa por esse caminho.
- **Tamanho.** O ponto é o glifo do emblema arredondado para a paridade da
  linha: 12 → 13. O spinner de `loading` tem o tamanho do ponto e não alarga
  a coluna do marcador.
- **Coluna do marcador.** Tem a largura do ponto; um emblema com glifo ou
  avatar alarga-a na timeline inteira, por `:has()` na raiz.
- O texto fica a `control-gap + space-2` da coluna do marcador (12 px); a
  distância entre eventos é essa mais um passo (16 px).
- A linha tem `border-width-thin` e corre do meio da primeira linha de um item
  ao meio da primeira linha do seguinte. O marcador fica acima dela com um
  halo do fundo (`--slotted-timeline-line-gap`, `space-1`).
- A tinta do ponto é o degrau `border` do tom; em `secondary`,
  `--slotted-border-strong`.

| `variant`          | ponto                                     | emblema                                      |
| ------------------ | ----------------------------------------- | -------------------------------------------- |
| `subtle` (omissão) | núcleo sólido num disco suave do tom (16%) | fundo do tom com aresta fina, glifo `text`   |
| `outline`          | anel oco de `border-width-medium`         | fundo da página, aresta fina, glifo na tinta |
| `solid`            | disco cheio                               | fundo `solid` do tom, glifo `on-solid`       |
| `plain`            | só o núcleo, sobre a linha                | só o glifo, sobre o fundo                    |

| Estado     | Forma                                                                  |
| ---------- | ---------------------------------------------------------------------- |
| pendente   | a do `variant`                                                         |
| `complete` | disco cheio com o check vazado na cor do fundo; linha seguinte no tom |
| `current`  | disco cheio com anel (`box-shadow`); `outline` em `forced-colors`      |
| `loading`  | o spinner, do tamanho do ponto, na tinta do tom                        |

A omissão passa de `outline` a `subtle`: um anel oco em todos os eventos lia-se
como uma coluna de botões de rádio, e um disco cheio em todos não deixa nada
mais forte para `complete` e `current`.

O núcleo e o check são um `::after` com `inset` inteiro: não há caixa menor
centrada por aritmética. O anel de `current` é uma sombra, porque `outline` é o
anel de foco (`focus-ring.test.mjs`). Na lista horizontal, que rola, a lista
reserva `--_reach` acima e antes do primeiro marcador para o anel não ser
cortado. Em `forced-colors` o núcleo usa a tinta do próprio marcador
(`currentColor`) com `forced-color-adjust: none`.

Custo: saem `--slotted-timeline-marker-ratio`, `--slotted-timeline-glyph-ratio`,
`--slotted-timeline-complete-icon` e `--slotted-timeline-dot-ratio`; o único
literal é `--slotted-timeline-core-ratio`. A omissão de `variant` muda em
React (`timeline.tsx`) e em Angular (`TIMELINE_DEFAULT_VARIANT`); quem quer o
anel oco declara `variant="outline"`.

## 7. Stylesheet e tokens

Tokens da família, todos sobre a foundation:

- geometria: `--slotted-timeline-core-ratio` (literal registado),
  `--slotted-timeline-connector-thickness` (`--slotted-border-width-thin`),
  `--slotted-timeline-line-gap` (`--slotted-space-1`), `--slotted-timeline-gap`
  (`--slotted-control-gap-*` + `--slotted-space-2`), `--slotted-timeline-item-gap`
  (o gap + `--slotted-space-2`), `--slotted-timeline-opposite-size` (literal registado),
  `--slotted-timeline-track-min` (horizontal), `--slotted-timeline-reflow-breakpoint`
  (literal, regra 4 da foundation);
- cor: `--slotted-timeline-connector-color` (`--slotted-border-subtle`),
  `--slotted-timeline-connector-color-complete` (tom do item),
  `--slotted-timeline-marker-*` por `variant` e por tom;
- tipo: título em `--slotted-control-font-size-*` com `--slotted-font-weight-medium`,
  descrição em `--slotted-font-size-sm` com `--slotted-text-muted`, `time` em
  `--slotted-font-size-xs` com números tabulares.

Movimento: o marcador `loading` roda em `--slotted-duration-loop` e para sob
`prefers-reduced-motion`; a linha muda de cor em
`--slotted-control-transition-duration`; o painel de um grupo abre e fecha por
`hidden` sem transição, porque uma lista de vinte eventos a deslizar é uma
página a saltar.

`forced-colors`: nenhuma regra própria. O marcador lê `--slotted-border-strong`
para a aresta e o glyph é uma máscara sobre `currentColor`; a linha lê
`--slotted-border-subtle`, que o tema mapeia a `ButtonBorder`.

---

## 8. Integração — React

| Pergunta                                                                  | Resposta                                                                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Valor mutável com par controlado/não controlado e pedido com razão        | `Timeline.Group`: `open` / `defaultOpen` / `onOpenChange(open, reason, event)` sobre `@slotted/core/state`          |
| Defaults da aplicação numa vez                                            | `TimelineDefaultsProvider` e `useTimelineDefaults()` em `timeline-defaults.tsx`                                     |
| Substituir o elemento de cada parte pública                               | `render` em `Root`, `List`, `Group`, `Item`, `Content`, `Title`, `Description`, `Opposite`, `Actions`, `More`, `Empty`; `Marker`, `Connector`, `Time` e `GroupTrigger` são fixos: o marcador é geometria, a linha é decorativa, `time` é o elemento que escreve `datetime`, e o botão do grupo é o que dá `aria-expanded` |
| O handler do consumidor corre quando a família trata o mesmo evento       | `onKeyDown` da lista e `onClick` de `group-trigger`, `fresh` e `more` compostos, `defaultPrevented` respeitado      |
| Elemento nativo e ação imperativa                                         | `ref` em toda a parte; `useTimeline()` expõe `focusItem(index)` para o feed                                          |
| SSR sem divergência                                                       | `useId` para os ids; `IntersectionObserver` só em `useEffect`; `now` é o custo escrito em §6                        |
| Todo o estado estilizável está no DOM                                     | `data-open`, `data-loading`, `data-current`, `data-complete`, `data-side`, `data-order`, `data-mode`, `data-tone`… |
| Props de cada parte = elemento nativo estendido                           | `ComponentPropsWithRef<'ol' \| 'li' \| 'article' \| …>`                                                            |

## 9. Integração — Angular

| Pergunta                                                     | Resposta                                                                                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Valor bidirecional na forma esperada                         | `SlTimelineGroup`: `open = model<boolean>()` e `openChange` com razão via `openRequest = output<…>()`                      |
| Reactive Forms                                               | não: nenhuma parte é um controlo de formulário; uma linha do tempo não tem valor a submeter                               |
| Defaults da aplicação numa vez                               | `TIMELINE_DEFAULTS_TOKEN`, `provideTimelineDefaults()`                                                                    |
| A template alcança a instância                               | `exportAs: 'slTimeline'`, `'slTimelineGroup'`, `'slTimelineItem'`                                                          |
| Conteúdo projetado, e preguiçoso                             | `ng-content select` para `[slTimelineTitle]`, `[slTimelineActor]`, `[slTimelineDescription]`, `[slTimelineActions]`, `[slTimelineOpposite]`, `[slTimelineMarker]`; o conteúdo de um grupo fechado fica em `hidden` e não é destruído, porque um feed que perde os itens fechados perde a posição do leitor |
| Zoneless e `OnPush`                                          | sinais em todo o lado; o `IntersectionObserver` escreve num sinal                                                         |
| Subscrições desfeitas                                        | `DestroyRef` para o observador e para o listener de teclado                                                                |
| Atributo estático do consumidor sobrevive                    | `aria-label` lido com `HostAttributeToken` antes de a família escrever o seu                                              |
| Ponto de entrada de classe única                             | `@slotted/angular/timeline`                                                                                               |

A assimetria registada: o Angular tem `provideTimelineDefaults()` por DI e o
React tem um provider; nenhum dos dois tem forms, porque a família não tem
valor.

---

## 10. Recusas, com o que as substitui

| Recusado                         | O que o substitui                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| conteúdo expansível por item     | `collapsible` dentro de `content`                                                     |
| `reverse`                        | `order`; o consumidor ordena o array                                                  |
| cor arbitrária, tamanho em pixels | `tone`, `size`, tokens da família                                                     |
| `Timeline.Break` decorativo      | `group` com `group-label`                                                             |
| esqueleto inicial                | `skeleton` dentro de itens `loading`                                                  |
| filtros                          | `filter-bar`                                                                          |
| virtualização                    | `growing`                                                                             |
| agrupar por período por si       | o consumidor agrupa; o período é do domínio                                           |

---

## 11. Custos escritos

- Em `feed`, um `group-label` é um heading dentro do feed e fora de qualquer
  artigo, o que o padrão não prevê. Um leitor que navega por artigo não o ouve;
  um que navega por heading encontra-o. A alternativa — um artigo por grupo —
  faria de um período um evento.
- `relative` sem `now` diverge em SSR (§6).
- `placement="alternate"` abaixo do ponto de quebra cai para `end`, e a coluna
  `opposite` passa a linha acima do conteúdo. A composição muda; a ordem de
  leitura não.
- `growing="scroll"` sem `IntersectionObserver` (um ambiente sem DOM) não pede
  nada; o consumidor que precisa de um botão declara `button`.
- Um `item` em `feed` com `tabindex="0"` é mais uma paragem de `Tab` por
  evento. É o que o exemplo do APG faz, e é o que dá ao `PageDown` um ponto de
  partida.
