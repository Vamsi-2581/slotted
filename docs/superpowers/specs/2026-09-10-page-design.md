# Desenho — `page`, `page-header`, `section`

Escrito antes de qualquer código, como o passo 5 de
`.claude/skills/component/skill.md` e `references/frameworks.md` exigem. Regista
as decisões e o que cada uma custa; o inventário que as produziu é
`docs/superpowers/specs/2026-09-10-page-capability-inventory.md`.

---

## 1. Três famílias, uma casca

| Família       | `data-ui`     | Elemento raiz                         | O que é                                                                                          |
| ------------- | ------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `page`        | `page`        | `main`, ou `div` com `landmark="none"` | A coluna de um ecrã: quem rola, a medida do conteúdo, o rodapé flutuante, o padding vertical.     |
| `page-header` | `page-header` | `header`                              | A área de título que fica, a área de cabeçalho que encolhe, os controlos, as abas.               |
| `section`     | `section`     | `section`                             | A unidade de conteúdo dentro da página: título no nível certo, descrição, ações, corpo.           |

Três contratos e não um com três membros, porque um consumidor seleciona
`[data-ui='page-header']` sem uma página à volta — dentro de um `drawer`, de
um `dialog`, do painel de detalhe de um mestre-detalhe — e `section` vive em
qualquer superfície. Um membro partilha o `data-ui` do pai, que é a forma
errada para três coisas que se usam separadas.

### Anatomia de `page`

```
main[data-ui=page][data-scroll=ancestor|self][data-fill]
├─ div[data-part=scroll]            ← em self, é o rolador; em ancestor, cresce
│  ├─ header[data-ui=page-header]   ← filho direto: o sticky precisa disto (§2)
│  └─ div[data-part=body]
│     └─ div[data-ui=container]     ← a medida; page passa width e inset
└─ footer[data-part=footer]         ← em ancestor, sticky no fundo; em self, fora do rolador
   └─ div[data-ui=container]
```

Partes: `root`, `scroll`, `body`, `footer`. Não há parte `header`: o cabeçalho
é a família `page-header` colocada como primeiro filho de `scroll`. Uma parte
`header` seria um invólucro exatamente da altura do cabeçalho, e um elemento
`sticky` não sai do bloco que o contém — a Sirius regista o mesmo aviso no
comentário de `sirius-page`.

### Anatomia de `page-header`

```
header[data-ui=page-header][data-expanded][data-loading][data-size][data-collapse]
└─ div[data-ui=container]                       ← as linhas alinham à medida da página
   ├─ div[data-part=title-area]                 ← sticky em 0 dentro da raiz (§2)
   │  ├─ div[data-part=nav]
   │  │  ├─ a|button[data-part=back]
   │  │  └─ nav[data-ui=breadcrumb][data-part=breadcrumbs]
   │  ├─ div[data-part=title-row]
   │  │  ├─ span[data-part=visual]
   │  │  ├─ div[data-part=title]
   │  │  │  ├─ h1[data-part=heading]             ← ou o elemento do consumidor
   │  │  │  ├─ span[data-part=marks]
   │  │  │  └─ p[data-part=subheading]
   │  │  ├─ div[data-part=actions]
   │  │  └─ div[data-part=navigation]
   ├─ div[data-part=header-area] role=region aria-label id
   │  ├─ div[data-part=figure]
   │  └─ div[data-part=content]
   │     └─ p[data-part=description]
   ├─ div[data-part=controls]                   ← linha de altura zero na aresta da chrome
   │  ├─ button[data-part=toggle] aria-expanded aria-controls
   │  └─ button[data-part=pin] aria-pressed
   └─ div[data-part=tabs]
```

`controls` vem depois da área de cabeçalho e antes das abas, e por isso está
na aresta inferior da chrome em todos os estados sem mudar de lugar no DOM: em
repouso, sob a área de cabeçalho; presa, sob a área de título, porque a área de
cabeçalho está então debaixo dela. A Sirius movia o pill entre duas vagas por
`ngTemplateOutlet`.

Vinte e uma partes. Cada uma que o consumidor não escreve não é renderizada, e a
folha não deixa uma vaga vazia: `:has()` e `:empty` decidem, sem
`MutationObserver`.

### Anatomia de `section`

```
section[data-ui=section][data-size][data-ground][data-divider] aria-labelledby
├─ div[data-part=header][data-sticky]
│  ├─ div[data-part=title]
│  │  ├─ span[data-part=eyebrow]
│  │  ├─ h2[data-part=heading]
│  │  └─ p[data-part=description]
│  └─ div[data-part=actions]
└─ div[data-part=body]
```

---

## 2. A mecânica do encolher, em CSS

A Sirius fixa a área de título com `position: sticky` e faz o host
`display: contents` para que a área tenha a coluna da página como bloco
contentor. O host perde a caixa, e com ela o fundo, a sombra, a container
query e a raiz que um `ref` devolve.

Esta família guarda a caixa. A raiz é `sticky` com um deslocamento negativo
igual à altura da área de cabeçalho, e a área de título é `sticky` em `0`
dentro da raiz:

```css
[data-ui='page-header'] {
  position: sticky;
  inset-block-start: calc(-1 * var(--slotted-page-header-collapse, 0px));
}
[data-ui='page-header'] [data-part='title-area'] {
  position: sticky;
  inset-block-start: 0;
}
```

`--slotted-page-header-collapse` é a altura medida da área de cabeçalho,
escrita pelo binding por `ResizeObserver` na raiz. Ao rolar `s` píxeis, a raiz
sobe até `-H` e para; a área de título, presa a `0` dentro da caixa da raiz,
fica no topo; a área de cabeçalho passa por baixo dela, coberta pelo fundo
opaco e pelo `z-index` da área de título; as abas, últimas na raiz, ficam
visíveis sob o título sem regra própria. Fixado ou reaberto no lugar, o
deslocamento passa a `0` e a raiz inteira fica.

Quatro situações, uma variável e três atributos na raiz — o estado
`data-expanded`, o estado `data-revealed` e o facto medido `data-scrolled`:

| Situação                                      | Atributos                                  | `inset-block-start` da raiz | Área de cabeçalho          |
| --------------------------------------------- | ------------------------------------------ | --------------------------- | -------------------------- |
| Em repouso, não rolado                        | `data-expanded`                            | `-H`                        | Em fluxo, visível          |
| Rolado além de `H`                            | `data-scrolled`                            | `-H` (presa)                | Sob a área de título       |
| Fixado, ou reaberto no lugar depois de rolar  | `data-expanded` + `pin[data-pressed]`, ou `data-expanded data-revealed data-scrolled` | `0` | Presa sob a área de título |
| Recolhido pelo controlo                       | nenhum                                     | `-0` (H mediu 0)            | `grid-template-rows: 0fr`  |

`data-scrolled` vem de um `IntersectionObserver` sobre a área de cabeçalho,
com o rolador ancestral como `root`, `threshold: 0` e sem `rootMargin`: presa
a `-H`, a área está inteira acima do rolador e `isIntersecting` é `false`. Sem
viés de píxeis, porque o elemento observado não é o que anima. Enquanto
`revealed`, o binding congela o facto: a raiz a `0` traz a área de volta ao
rolador e o observador desfaria a reabertura que acabou de causar.

O deslocamento da raiz tem transição (`--slotted-duration-medium`): reabrir
desliza a área para dentro sob o título, e a rolagem que a fecha desliza-a para
fora. Durante uma rolagem comum o deslocamento é constante, então a transição
nunca compete com a rolagem.

`revealed` termina na rolagem seguinte, com `expanded` a `false` e razão
`scroll` — a regra da Sirius, e não a do `sap.f`, que mantém a área aberta até
a rolagem chegar ao topo: um leitor que abriu o cabeçalho a meio de uma lista
quer-lhe fora do caminho assim que continua a ler. Soltar o fixador com a raiz
presa a `0` também revela, em vez de deixar a raiz cair a `-H` debaixo do
leitor. Recolher pelo controlo enquanto fixado solta o fixador primeiro, com
razão `programmatic`, como o UI5.

**Custo.** Duas medições por `ResizeObserver` — a área de cabeçalho para `H` e
a chrome fixa para a altura publicada (§5) — coalescidas num `requestAnimationFrame`,
porque recolher pelo controlo anima a altura e republicar por frame invalida a
subárvore inteira do rolador, o que a Sirius mediu como queda de FPS.

**O que não se anima.** Encolher por rolagem não anima altura: a rolagem é o
movimento. Recolher pelo controlo anima `grid-template-rows` de `1fr` a `0fr`
com `--slotted-duration-medium` e `--slotted-easing-standard`, como
`collapsible`. Reabrir no lugar depois de ter rolado não anima: a área aparece
presa sob o título. `overflow-anchor: none` nas duas áreas para o browser não
reancorar a posição de rolagem quando a área muda de altura, que é o que a
Sirius absorvia com um temporizador de 200 ms.

**A área mais alta que o rolador.** Se `H` for maior do que 60 % da altura do
rolador, reabrir no lugar rola ao topo em vez de prender a área sob o título.
`sap.f` toma a mesma regra em
`_headerBiggerThanAllowedToBeExpandedInTitleArea`.

---

## 3. Os estados

### `expanded` — capacidade `open`

```json
"open": {
  "controlled": "expanded",
  "uncontrolled": "defaultExpanded",
  "request": "onExpandedChange",
  "reasons": ["pointer", "keyboard", "scroll", "programmatic"]
}
```

`true` enquanto a área de cabeçalho está à vista: em fluxo, fixada ou reaberta
no lugar. `false` quando rolou para fora ou foi recolhida pelo controlo. Uma
transição por rolagem carrega `scroll`; pelo `toggle`, `pointer` ou
`keyboard`; pela aplicação, `programmatic`.

`scroll` é razão nova em `specs/contract.schema.mjs` e em
`packages/core/src/state/state.ts`, em commit próprio. UI5 dispara o mesmo
`title-toggle` para a rolagem e para o clique, e um produto que guarda a
preferência do leitor tem de adivinhar qual foi. `pointer` não serve — a
rolagem por roda, por teclado e por toque é uma só coisa e nenhuma delas é um
clique no controlo; `programmatic` não serve — a aplicação não pediu nada.

Um pedido cancelado com razão `scroll` deixa o valor: a área continua rolada
para fora, porque a família não escreve a posição de rolagem. O que o
cancelamento impede é o atributo e o `aria-expanded` mudarem, e o contrato
regista que cancelar `scroll` só faz sentido para um consumidor que force
`expanded` de volta a `true` no frame seguinte — o que reabre a área presa sob
o título, porque `expanded=true` com a área fora de vista é o estado "reaberta
no lugar".

Recolhida por rolagem, a área de cabeçalho não é `inert`: um controlo dentro
dela que receba foco é rolado para a vista pelo browser, e o observador emite
`scroll` para `true`. Recolhida pelo controlo, é `inert` e `aria-hidden`,
porque `0fr` deixa os controlos no DOM e fora de vista.

### `pinned` — capacidade `pressed`

```json
"pressed": {
  "controlled": "pinned",
  "uncontrolled": "defaultPinned",
  "request": "onPinnedChange",
  "reasons": ["pointer", "keyboard", "programmatic"]
}
```

O `pin` é um botão de alternância com `aria-pressed`, que é o estado `pressed`
do vocabulário, escrito nele como `data-pressed`. A folha lê-o na raiz por
`:has([data-part='pin'][data-pressed])`, e nenhum estado novo entra no
vocabulário. Fixar põe `expanded` a `true` com razão `programmatic` quando
estava `false`; soltar não muda `expanded`.

### `loading`

`data-loading` na raiz e `aria-busy="true"`. Enquanto carrega, o binding
renderiza `skeleton` com a forma `text` dentro de `heading`, `subheading` e
`description`, no lugar do texto; a folha desta família diz só quanto cada um
mede — `24ch`, `32ch` e `40ch` — através de `--slotted-skeleton-inline-size`,
e o placeholder é desenhado pela folha de `skeleton`. É a regra SL6/CB5 que
`packages/styles/src/waiting.test.mjs` prende: uma família que espera não pinta
o próprio placeholder. A altura fica estável porque cada linha do placeholder
mede `1lh` no tamanho de texto que substitui, que é o que
`docs/component-features.md` §4 pede. As ações e a navegação ficam operáveis.

### O que `section` e `page` não têm

Nenhum estado mutável. `page` tem `loading` (`aria-busy` no `body`). Os eixos
são do consumidor e não do leitor.

---

## 4. Quem rola

Eixo `scroll` de `page`:

| Valor      | Raiz                                      | `scroll`                                       | `footer`                                  |
| ---------- | ----------------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| `ancestor` | `min-block-size: 100%`, coluna flex       | `flex: 1 0 auto`, sem overflow                 | `position: sticky; inset-block-end: 0`    |
| `self`     | `block-size: 100%`, coluna flex           | `flex: 1 1 auto; min-block-size: 0; overflow: auto` | Em fluxo, fora do rolador            |

`page-header` procura o rolador ancestral mais próximo — o primeiro ancestral
com `overflow-y` `auto` ou `scroll`, ou o documento — e é nele que observa e
publica. Em `self` é a parte `scroll`; em `ancestor` é o que a aplicação
tiver. A família não decide por ela.

Eixo `fill`: `body` passa a `display: flex; flex-direction: column` com
`min-block-size: 0`, e o `container` dentro estica. Com `scroll="self"` e
`fill`, o corpo tem altura exata e nada rola fora dele, então o cabeçalho não
encolhe por rolagem; o contrato diz isto e a demonstração mestre-detalhe
mostra-o.

---

## 5. A geometria fixa, publicada

Propriedades de runtime, escritas no rolador ancestral (ou em
`document.documentElement`), registadas em
`packages/styles/src/runtime-properties.mjs`:

| Propriedade                        | Quem escreve  | Valor                                                                                       |
| ---------------------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| `--slotted-page-header-collapse`   | `page-header` | A altura da área de cabeçalho, na própria raiz. Lida só pela folha da família (§2).         |
| `--slotted-page-sticky-top`        | `page-header` | A altura da chrome que fica no topo: área de título mais abas, mais área de cabeçalho quando fixada ou reaberta. |
| `--slotted-page-sticky-bottom`     | `page`        | A altura do rodapé enquanto está montado, em `scroll="ancestor"`; `0px` em `self`.          |

Quem lê: `section` com `sticky` (`inset-block-start: var(--slotted-page-sticky-top, 0px)`);
`section` sempre (`scroll-margin-block-start` na raiz, para um salto de âncora
aterrar sob a chrome); e `table` com `stickyTo="page"`, por esta ponte na folha
de `page`:

```css
[data-ui='page'] {
  --slotted-table-sticky-offset: var(--slotted-page-sticky-top, 0px);
  --slotted-table-sticky-offset-end: var(--slotted-page-sticky-bottom, 0px);
}
```

A página é o único elemento que sabe onde a chrome acaba, e sem a ponte cada
consumidor escreveria as duas linhas. Uma folha a escrever o token de outra
família é um precedente, e o custo é este: um tema que fixe
`--slotted-table-sticky-offset` para toda a aplicação perde-o dentro de uma
`page`. Registado em _Decisions already taken_ ao lado da regra das
propriedades de runtime.

---

## 6. `data-when`

Qualquer filho de `title-area` pode carregar `data-when="expanded"` ou
`data-when="snapped"`:

```css
[data-ui='page-header'][data-expanded] [data-when='snapped'],
[data-ui='page-header']:not([data-expanded]) [data-when='expanded'] {
  display: none;
}
```

Um título encolhido é `<PageHeaderHeading>` duas vezes, uma com cada valor. A
folha escolhe; nenhuma parte é duplicada no contrato e a árvore de
acessibilidade tem um título de cada vez, porque `display: none` retira o
outro. Sem o atributo, o filho aparece nos dois estados.

**Custo.** Dois elementos no DOM para um título que muda. Um só elemento com
texto trocado por script era a alternativa, e obriga o binding a saber o texto,
que é do consumidor.

---

## 7. O nível de título é de `typography`

`typography` já tem o mecanismo: `HeadingLevel` e `useHeadingLevel` no React,
`SlHeadingLevel` no Angular, um contexto que começa em `1` e sobe um por
secção. Esta família compõe-o e não o reescreve.

- `page-header`: `heading` toma `level` do eixo (`1`, `2`, `3`, omissão `1`).
  Renderiza `h<level>` por si — não `typography`'s `Heading`, porque a escala
  do título de página é da família e não da tabela `SIZE_OF_LEVEL`.
- `page`: envolve `body` em `HeadingLevel`, então uma `section` direta toma
  `2`.
- `section`: `heading` toma `useHeadingLevel()`, ou `level` quando escrito;
  envolve `body` em `HeadingLevel`, então uma secção aninhada toma o seguinte.
  Angular: `hostDirectives: [SlHeadingLevel]` no `body` da secção.

Um `h2` nunca aparece sob um `h4` por acidente, e o aviso de salto que
`typography` já emite em desenvolvimento cobre o consumidor que escreve `level`
errado.

---

## 8. As âncoras entre secções são de `anchor-nav`

`docs/component-features.md` §7 lista _Table of Contents / Anchor Nav_ como
família Extended. É ela que observa quais secções estão à vista, marca a
corrente e rola para uma. `section` e `page-header` entregam o que ela precisa
e nada mais:

- `section`: `id` estável na raiz (`useId` ou o do consumidor) e
  `scroll-margin-block-start: var(--slotted-page-sticky-top, 0px)`.
- `page-header`: a parte `tabs`, que é a vaga onde a barra se senta e fica à
  vista sob o título.

Uma barra de âncoras dentro de `page` seria `sap.uxap.ObjectPageLayout`, que
regista secções, gere `selectedSection`, e é a família mais pesada do
`sap.uxap`. Um consumidor que precise dela antes da onda 8 compõe `tabs` com
`href` nos itens e `scroll-margin` já está.

---

## 9. `section`

Eixos: `size` (`sm`, `md`, `lg`), `level` (`auto`, `1`…`6`), `divider`
(`false`, `true`), `ground` (`none`, `surface`), `sticky` (`false`, `true`).

`ground="surface"` pinta `--slotted-surface-raised`, aresta
`--slotted-border-subtle`, raio `--slotted-radius-lg` e inset
`--slotted-space-6`; sem sombra, sem hover, sem ação. É uma superfície e não
um cartão, que é a distinção que §4 do guia pede.

`sticky` prende o `header` da secção sob a chrome da página. Sem `page`, a
propriedade cai para `0px` e o cabeçalho prende ao topo do rolador.

A raiz é `region` só quando tem título: `aria-labelledby` aponta ao `heading`
quando existe. Uma secção sem título não recebe nome, e um `section` sem nome
não é landmark, como a APG diz.

---

## 10. Tokens e glifos

Tokens de família, cada um a apontar para a foundation:

- `page`: `--slotted-page-background` (`sunken` → `--slotted-surface-sunken`,
  `surface` → `--slotted-surface`), `--slotted-page-padding-block`
  (`--slotted-space-8`), `--slotted-page-footer-background`
  (`--slotted-surface`), `--slotted-page-footer-border`
  (`--slotted-border-subtle`), `--slotted-page-footer-padding-block`
  (`--slotted-space-4`), `--slotted-page-footer-shadow` (`--slotted-shadow-sm`).
- `page-header`: `--slotted-page-header-background` (`--slotted-surface`),
  `--slotted-page-header-border` (`--slotted-border-subtle`),
  `--slotted-page-header-shadow` (`--slotted-shadow-sm`),
  `--slotted-page-header-heading-size-{sm,md,lg}` (`--slotted-font-size-{xl,2xl,3xl}`),
  `--slotted-page-header-snapped-heading-size` (um passo abaixo),
  `--slotted-page-header-gap` (`--slotted-space-4`), `--slotted-page-header-padding-block`
  (`--slotted-space-5`), `--slotted-page-header-control-size`
  (`--slotted-control-height-sm`), `--slotted-page-header-description-measure`
  (`70ch`, literal registado: uma medida de prosa e não um passo de escala).
- `section`: `--slotted-section-gap` (`--slotted-space-5`),
  `--slotted-section-heading-size-{sm,md,lg}` (`--slotted-font-size-{md,lg,xl}`),
  `--slotted-section-surface` (`--slotted-surface-raised`),
  `--slotted-section-border` (`--slotted-border-subtle`),
  `--slotted-section-radius` (`--slotted-radius-lg`).

Glifos novos em `packages/themes/default/src/glyphs.json` e em
`packages/tokens/src/contract.json`, commit próprio:

| Token                       | Lucide      | Onde                                                          |
| --------------------------- | ----------- | ------------------------------------------------------------- |
| `--slotted-icon-arrow-left` | `arrow-left`| `back`, espelhado em RTL por `scale(-1, 1)`.                  |
| `--slotted-icon-pin`        | `pin`       | `pin` solto.                                                  |
| `--slotted-icon-pin-off`    | `pin-off`   | `pin` fixado.                                                 |

O `toggle` desenha `--slotted-icon-chevron-down`, rodado 180° quando
`expanded`, como `collapsible`. Nenhuma seta nova para cima.

---

## 11. Integração — React

### `page`

| Pergunta                                            | Resposta                                                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Valor mutável com par controlado e pedido com razão | Não. `page` não tem valor que o leitor mova; `loading` é um facto do consumidor.                             |
| Padrões da aplicação uma vez                        | `PageDefaultsProvider` e `usePageDefaults`: `width`, `inset`, `scroll`, `ground`, `landmark`, `messages`.     |
| Substituir o elemento de cada parte                 | `render` em `Page`, `PageBody`, `PageFooter`; `scroll` é fixo, porque é o rolador e trocá-lo trocaria o `overflow`. |
| O handler do consumidor continua a correr           | Nenhum handler da família em `page`; os nativos passam.                                                      |
| `ref` e ação imperativa                             | `ref` no `main`; `PageHandle.scrollTo({ top })` e `scrollElement()`, porque o rolador em `self` é interno.   |
| SSR sem mismatch                                    | `useId` para o `footer`; nenhuma leitura de layout na renderização.                                           |
| Estados no DOM                                      | `data-scroll`, `data-fill`, `data-ground`, `data-loading`, `data-width` (espelho do container).              |
| Tipos dos props                                     | `ComponentPropsWithRef<'main'>`, `'div'`, `'footer'`.                                                        |

### `page-header`

| Pergunta                                            | Resposta                                                                                                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valor mutável com par controlado e pedido com razão | `expanded`/`defaultExpanded`/`onExpandedChange(value, request)` e `pinned`/`defaultPinned`/`onPinnedChange(value, request)`, por `createControllable`. |
| Padrões da aplicação uma vez                        | `PageHeaderDefaultsProvider`: `size`, `level`, `collapse`, `messages` (`expand`, `collapse`, `pin`, `unpin`, `headerArea`).                            |
| Substituir o elemento de cada parte                 | `render` em todas as partes; `heading` com `render` recebe `data-part`, e o nível vem da família.                                                     |
| O handler do consumidor continua a correr           | `onClick` do `toggle` e do `pin` compõem com o da família; um `preventDefault` do consumidor cancela o pedido.                                        |
| `ref` e ação imperativa                             | `ref` no `header`; `PageHeaderHandle.expand()`, `collapse()`, `pin()`, `unpin()`, todos com razão `programmatic`.                                     |
| SSR sem mismatch                                    | `useId` para `header-area` e `aria-controls`; a medição corre em `useLayoutEffect` depois da hidratação; `--slotted-page-header-collapse` ausente no servidor dá `0px`, que é a raiz presa em `0` até medir. |
| Estados no DOM                                      | `data-expanded`, `data-loading`, `data-size`, `data-level`, `data-collapse`; `data-pressed` no `pin`.                                                  |
| Tipos dos props                                     | `ComponentPropsWithRef<'header'>`, `'button'` para `toggle` e `pin`, `'a'` ou `'button'` para `back` por `render`.                                     |

### `section`

| Pergunta                                            | Resposta                                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Valor mutável com par controlado e pedido com razão | Não. Nenhum estado.                                                                       |
| Padrões da aplicação uma vez                        | `SectionDefaultsProvider`: `size`, `divider`, `ground`, `sticky`.                          |
| Substituir o elemento de cada parte                 | `render` em todas; `heading` com `render` mantém o nível por `aria-level` quando o elemento não é `h*`. |
| O handler do consumidor continua a correr           | Nenhum handler da família.                                                                |
| `ref` e ação imperativa                             | `ref` no `section`; nenhuma ação imperativa.                                              |
| SSR sem mismatch                                    | `useId` para a raiz quando o consumidor não escreve `id`.                                 |
| Estados no DOM                                      | `data-size`, `data-ground`, `data-divider`, `data-sticky`, `data-level`.                    |
| Tipos dos props                                     | `ComponentPropsWithRef<'section'>` e `'div'`, `'p'`, `'span'` por parte.                  |

## 12. Integração — Angular

### `page`

| Pergunta                                       | Resposta                                                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Valor bidirecional em `model()`                | Não há valor.                                                                                               |
| Reactive Forms                                 | Não. `page` não é um controlo.                                                                              |
| Padrões da aplicação uma vez                   | `providePageDefaults()` e `SL_PAGE_DEFAULTS`.                                                               |
| Instância no template                          | `exportAs: 'slPage'`, com `scrollTo()` e `scrollElement()`.                                                 |
| Conteúdo projetado e preguiçoso                | `<sl-page>` projeta `[slPageHeader]` primeiro, o conteúdo padrão no corpo, e `[slPageFooter]` no rodapé; `NgTemplateOutlet` não é necessário. |
| Zoneless e `OnPush`                            | `input()` e `computed()` em tudo; a medição do rodapé escreve estilo e não estado.                          |
| Listeners desmontados                          | `DestroyRef` desliga o `ResizeObserver` e apaga a propriedade do rolador.                                   |
| Atributo estático sobrevive                    | `role` e `id` lidos por `HostAttributeToken` antes de escrever.                                             |
| Entry point único                              | `@slotted/angular/page`.                                                                                    |

### `page-header`

| Pergunta                                       | Resposta                                                                                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Valor bidirecional em `model()`                | `expanded = model<boolean>()` e `pinned = model<boolean>()`; `expandedChange` e `pinnedChange` do `model`; `expandedRequest` e `pinnedRequest` como `output<ChangeRequest<boolean>>` com a razão. |
| Reactive Forms                                 | Não. Nenhum valor de formulário.                                                                                                       |
| Padrões da aplicação uma vez                   | `providePageHeaderDefaults()` e `SL_PAGE_HEADER_DEFAULTS`.                                                                             |
| Instância no template                          | `exportAs: 'slPageHeader'`, com `expand()`, `collapse()`, `pin()`, `unpin()`.                                                          |
| Conteúdo projetado e preguiçoso                | Diretivas por parte no elemento do consumidor: `slPageHeaderHeading` no `h1` ou no `input` do consumidor, `slPageHeaderBack` num `a`. Os slots de conteúdo livre são `ng-content` com `select` por diretiva. |
| Zoneless e `OnPush`                            | Signals; o `IntersectionObserver` e o `ResizeObserver` escrevem em `signal` fora da zona e a vista deriva.                              |
| Listeners desmontados                          | `DestroyRef` para os dois observadores e o `rAF` pendente.                                                                              |
| Atributo estático sobrevive                    | `data-part` das diretivas escrito após a primeira deteção quando outra diretiva o apaga — a regra de `toolbar` na briefing; `aria-label` do consumidor em `toggle` e `pin` vence o das mensagens. |
| Entry point único                              | `@slotted/angular/page-header`; importa `@slotted/angular/container` e `@slotted/angular/typography`.                                  |

### `section`

| Pergunta                                       | Resposta                                                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Valor bidirecional em `model()`                | Não há valor.                                                                                   |
| Reactive Forms                                 | Não.                                                                                            |
| Padrões da aplicação uma vez                   | `provideSectionDefaults()` e `SL_SECTION_DEFAULTS`.                                             |
| Instância no template                          | `exportAs: 'slSection'`.                                                                        |
| Conteúdo projetado e preguiçoso                | `slSectionHeading` no `h*` do consumidor; `slSectionBody` recebe `hostDirectives: [SlHeadingLevel]`. |
| Zoneless e `OnPush`                            | Signals.                                                                                        |
| Listeners desmontados                          | Nenhum listener.                                                                                |
| Atributo estático sobrevive                    | `id` e `aria-labelledby` por `HostAttributeToken`.                                              |
| Entry point único                              | `@slotted/angular/section`; importa `@slotted/angular/typography`.                              |

A assimetria registada: o Angular tem `model()` para `expanded` e `pinned`, e
o `ChangeRequest` sai por um `output` separado; o React tem uma função com os
dois. As duas chegam ao mesmo contrato.

---

## 13. Mensagens

`page-header` nomeia dois botões e uma região; `page` nomeia o rodapé. Quatro
cadeias, com omissão em português, substituíveis no provider e por instância
com `aria-label`:

| Chave        | Omissão                | Onde                                        |
| ------------ | ---------------------- | ------------------------------------------- |
| `expand`     | "Expandir cabeçalho"   | `toggle` enquanto `expanded` é `false`      |
| `collapse`   | "Recolher cabeçalho"   | `toggle` enquanto `expanded` é `true`       |
| `pin`        | "Fixar cabeçalho"      | `pin` enquanto `pinned` é `false`           |
| `unpin`      | "Soltar cabeçalho"     | `pin` enquanto `pinned` é `true`            |
| `headerArea` | "Cabeçalho da página"  | `aria-label` da região `header-area`        |
| `footer`     | "Ações da página"      | `aria-label` do `footer` de `page`          |

---

## 14. Recusas com custo

| Recusa                                     | Custo                                                                                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Alternar pelo clique na área de título     | Um alvo dedicado. Ganho: nenhum controlo aninhado; a faixa continua percorrível por Tab.                                                |
| `display: contents` na raiz                | Duas medições e um `IntersectionObserver`. Ganho: raiz com caixa, fundo, sombra, container query e `ref`.                              |
| Barra de âncoras própria                   | Até `anchor-nav` existir, um consumidor compõe `tabs` com `href`.                                                                       |
| Prop para esconder o `pin`                 | O `pin` existe quando é escrito. Um consumidor que o quer condicional escreve `{canPin && <PageHeaderPin />}`.                            |
| Transbordo próprio das ações               | `toolbar` com `overflow="menu"` dentro de `actions`. O cabeçalho não sabe quantas ações cabem; o toolbar sabe.                            |
| Modal "ver todas as marcas"                | `marks` quebra linha.                                                                                                                   |
| Esconder partes por faixa no contrato      | Uma container query na folha do consumidor.                                                                                             |
