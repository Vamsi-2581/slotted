# `drawer` — reabertura como bottom sheet nativa

Data: 2026-09-25. Reabertura prometida em `docs/process/build-order.md`, secção
_Reaberturas prometidas por escrito_, linha `drawer`; rodada 23 de
`docs/process/build-schedule.md`. O desenho de 2026-09-04
(`2026-09-04-drawer-design.md`) continua a valer em tudo o que este documento não
substitui. A linha `action-sheet` da mesma secção depende desta e é a sessão seguinte.

Uma **bottom sheet** é o painel de `drawer` com `mode="overlay"` e `side="bottom"`.
Um **detent** é uma altura de repouso da folha: uma fração da camada, ou a altura do
conteúdo.

## 1. Inventário

### 1.1 Surveyed

Fontes lidas em 2026-09-25.

| Implementação                                | Nome                                                              | Fonte                                                                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| UIKit e SwiftUI                              | `UISheetPresentationController`, `presentationDetents`            | `developer.apple.com/tutorials/data/documentation/uikit/uisheetpresentationcontroller.json` e páginas SwiftUI irmãs; HIG _Sheets_          |
| Material Components Android                  | `BottomSheetBehavior`, `BottomSheetDragHandleView`                | `material-components-android@master`, `lib/java/.../bottomsheet/BottomSheetBehavior.java`; `docs/components/BottomSheet.md`               |
| Jetpack Compose Material 3                   | `ModalBottomSheet`, `SheetState`                                  | `androidx-main`, `compose/material3/.../SheetDefaults.kt`, `ModalBottomSheet.kt`, `tokens/*`                                               |
| Vaul                                         | `Drawer`                                                          | `emilkowalski/vaul@main`, `src/index.tsx`, `constants.ts`, `helpers.ts`, `use-snap-points.ts`                                              |
| Ionic 8                                      | `ion-modal` com `breakpoints`                                     | `ionic-framework@main`, `core/src/components/modal/modal.tsx`, `gestures/sheet.ts`                                                         |
| @gorhom/react-native-bottom-sheet 5          | `BottomSheet`                                                     | `gorhom/react-native-bottom-sheet@master`, `src/constants.ts`, `utilities/snapPoint.ts`, `components/bottomSheetBackdrop/constants.ts`      |
| react-modal-sheet, MUI                       | `Sheet`; `SwipeableDrawer`                                        | `Temzasse/react-modal-sheet@main`, `src/constants.ts`; `mui/material-ui@master`, `SwipeableDrawer.js`                                      |
| Plataforma web                               | `visualViewport`, VirtualKeyboard API, `touch-action`, `interpolate-size` | MDN: `VisualViewport/resize_event`, `VirtualKeyboard_API`, `touch-action`, `overscroll-behavior`, `meta/name/viewport`             |

As fontes discordam no arraste pelo corpo. UIKit, Material, Compose, Vaul, Ionic e gorhom
arrastam a folha pelo corpo e passam o gesto ao scroll do conteúdo. O desenho de
2026-09-04 recusou-o (`declined.panelDrag`); esta reabertura revoga a recusa.

### 1.2 Table stakes

Estado antes da reabertura: folha de `24rem` em `md`, largura total, arraste só pelo
`resizer`, projeção por velocidade (`projectExtent`) e fecho abaixo de `minExtent` ou
acima de `0,5` camada/s.

| Capacidade                                            | Quem entrega                                                                                     | Veredito | Resposta                                                                                                                                                                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Detent pela altura do conteúdo                        | UIKit (`.fitted`, resolver), Material (`fitToContents`), Compose, gorhom (`enableDynamicSizing`), react-modal-sheet (`detent='content'`) | adopt | `size="content"`: a folha mede o conteúdo até `100% - --slotted-space-12`. É a omissão de `size` em `top` e `bottom`; `start` e `end` continuam em `md`. §2.1                                                                                              |
| Vários detents, em fração                             | UIKit, Vaul, Ionic, gorhom, react-modal-sheet, Material (`halfExpandedRatio`)                     | adopt    | já existia: `snapPoints`. Com `size="content"` a altura do conteúdo é uma paragem implícita, como em gorhom. §2.2                                                                                                                                           |
| Arrastar pelo corpo                                   | UIKit, Material, Compose, Vaul, Ionic, gorhom, react-modal-sheet, MUI                             | adopt    | `drag="panel"`, a omissão numa folha `bottom` sobreposta. Toque apenas; rato e caneta arrastam o `resizer`. Revoga `declined.panelDrag`. §2.3                                                                                                             |
| Passagem entre scroll e arrasto                       | UIKit, Material (`canScrollVertically(-1)`), Compose, Vaul (`scrollTop===0`), Ionic, gorhom        | adopt    | decidida no início do gesto: para baixo com o conteúdo no topo, arrasta; para cima abaixo da paragem mais alta, arrasta; o resto rola. §2.3                                                                                                                |
| Expandir antes de rolar                               | UIKit (`prefersScrollingExpandsWhenScrolledToEdge`), Material, Compose, Ionic (`expandToScroll`), gorhom | adopt | a segunda regra da linha anterior                                                                                                                                                                                                                           |
| Snap por velocidade                                   | Material (500 px/s), Compose (125 dp/s), Vaul (400 px/s), gorhom (projeção), MUI (450 px/s)        | adapt    | `settleExtent` em `@slotted/core/extent`: acima de 500 px/s vai à paragem seguinte no sentido do gesto; abaixo, à paragem mais próxima da posição projetada. Fechado é a paragem `0`. §2.4                                                                 |
| Scrim por detent                                      | UIKit (`largestUndimmedDetentIdentifier`), Vaul (`fadeFromIndex`), Ionic (`backdropBreakpoint`), gorhom (`appearsOnIndex`) | adopt | `scrimFrom`, uma fração: abaixo dela o scrim não é pintado e não recebe o toque. §2.5                                                                                                                                                                      |
| Largura máxima em ecrã largo                          | Material e Compose (640 dp), UIKit (form/page no iPad), Ionic (600 px)                            | adopt    | `inline-size: min(100%, --slotted-drawer-sheet-inline-size)`, `40rem`, centrada. §2.6                                                                                                                                                                       |
| Teclado virtual                                       | Vaul e react-modal-sheet (`visualViewport`), gorhom (`keyboardBehavior`), Compose (`imePadding`)   | adopt    | `observeKeyboardInset` em `@slotted/core/measure`; a camada escreve `--slotted-keyboard-inset` e recua o fundo por ele. §2.7                                                                                                                                           |
| Grabber que percorre os detents ao toque              | HIG, Ionic (`handleBehavior='cycle'`), Vaul, Material (`BottomSheetDragHandleView`)                | adopt    | um toque sem movimento no `resizer` sobe à paragem seguinte e dá a volta à mais baixa. O teclado mantém o padrão Window Splitter. §2.8                                                                                                                      |
| Resistência acima do máximo                           | Compose (`BoundaryDampeningZone`), Vaul (`dampenValue`), Ionic, gorhom (`overDragResistanceFactor`) | adopt   | `dampenExtent` em `@slotted/core/extent`: acima da paragem mais alta a folha segue a mão com atrito logarítmico e volta ao soltar                                                                                                                          |
| Fechar arrastando para baixo                          | todos                                                                                              | adopt    | já existia pelo `resizer`; passa ao corpo com `drag="panel"`                                                                                                                                                                                               |
| Recusar o fecho                                       | UIKit (`isModalInPresentation`), Compose (`confirmValueChange`), Vaul (`dismissible`), Ionic (`canDismiss`) | adopt | já existia: `request.cancel()`; a folha volta à paragem mais baixa                                                                                                                                                                                          |
| Scroll do conteúdo sem encadear na página              | Vaul, Ionic, plataforma (`overscroll-behavior`)                                                    | adopt    | `overscroll-behavior: contain` no `body` da folha, que também suprime o pull-to-refresh                                                                                                                                                                    |
| Área segura                                           | Material (`paddingBottomSystemWindowInsets`), Compose (`safeDrawing`), react-modal-sheet            | adopt    | já existia no rodapé; passa também ao corpo quando não há rodapé                                                                                                                                                                                            |
| Voltar do sistema                                     | Material (`bottomSheetBackCallback`), Vaul, Ionic                                                  | adopt    | já existia: `back`                                                                                                                                                                                                                                          |
| Folhas aninhadas                                      | UIKit, Vaul (`nested`), Ionic, gorhom (`stackBehavior`)                                            | adapt    | já existia pela pilha de `dismissable-layer`. O recuo do pai (Vaul, 16 px) é recusado pela razão de `declined.parentPush`                                                                                                                                   |
| Escalar o fundo                                       | Vaul (`shouldScaleBackground`), react-modal-sheet (`modalEffectRootId`)                            | decline  | a família nunca escreve num elemento que não é dela. Três linhas do consumidor: `body:has([data-ui='drawer'][data-side='bottom'][data-open]) #app { scale: 0.96; transition: scale var(--slotted-duration-medium) }`                                        |
| Folha presa à borda em altura compacta                | UIKit (`prefersEdgeAttachedInCompactHeight`)                                                       | decline  | uma implementação só. A largura máxima já dá a forma num telefone deitado                                                                                                                                                                                   |

### 1.3 Differentiators

- **Cada detent é operável por teclado.** O `resizer` é um separador do padrão Window
  Splitter e as setas percorrem as mesmas paragens que o dedo, incluindo a do conteúdo.
  Vaul e Ionic só as alcançam pelo ponteiro; UIKit, pelo VoiceOver.
- **Cada detent chega ao consumidor com razão e pode ser recusado.** `onExtentChange`
  leva `pointer`, `keyboard` ou `programmatic`, e um fecho por arrasto é um pedido
  cancelável com a razão `pointer`.
- **O gesto respeita quem já o reclamou.** Um elemento cujo `touch-action` calculado não
  admite `pan-y` (um `slider`, um canvas, um mapa) fica com o gesto sem atributo próprio;
  `data-drawer-drag="none"` cobre o resto. Vaul exige `data-vaul-no-drag` em cada um.
- **Três esquemas, três densidades e RTL** sem segunda folha, como no resto da família.

### 1.4 Gaps

| Caso                                                        | Resposta                                                                                                                                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O conteúdo muda de altura com a folha aberta                | `interpolate-size: allow-keywords` no painel: a altura `auto` transiciona. Um navegador sem a propriedade (Firefox, Safari em 2026-09) salta, sem outro efeito                                  |
| Um carrossel horizontal dentro da folha                     | o eixo decide-se ao passar 8 px (o touch slop do Android); um gesto mais horizontal que vertical nunca é da folha                                                                                |
| Texto selecionado                                           | um arraste que começa com seleção ativa é do navegador, como em Vaul                                                                                                                           |
| Scroll que chega ao topo a meio do gesto                    | não passa ao arrasto. O `touchmove` deixa de ser cancelável quando o scroll começou, e o gesto seguinte arrasta. O custo: Material passa a meio do gesto, esta família precisa de um segundo    |
| Campo focado com o teclado aberto                           | a camada recua pelo teclado e o navegador rola o campo para a vista; a altura máxima da folha encolhe com a camada                                                                              |
| Uma aplicação com `interactive-widget=resizes-content`      | o viewport de layout já encolhe, `visualViewport` coincide com ele e o recuo é `0`                                                                                                              |

## 2. Decisões

### 2.1 `size="content"`, e a omissão por lado

`size` ganha o passo `content`: `block-size: auto` e
`max-block-size: calc(100% - var(--slotted-space-12))`, 64 px de scrim acima da folha
para o toque fora. Num lado inline, `content` é `inline-size: max-content` com o mesmo
limite, que é o que uma lista de filtros curta pede.

A omissão depende do lado: `content` em `top` e `bottom`, `md` em `start` e `end`. Um
passo nomeado num painel vertical é o que Ant, Fluent e MUI fazem; uma altura fixa numa
folha é o que nenhuma folha nativa faz. O contrato declara `size: "md"` nos
`defaults` e a regra do lado em `sheet.content`: o verificador das páginas de referência
exige uma linha de API por omissão declarada, e a regra do lado não é uma prop.
`resolution.size` continua `prop`, `defaults`, `family`, e a omissão da família é a que o
lado dá.

Custo: `side="bottom"` sem `size` deixa de medir 24 rem. `app-shell`, `detail-panel` e
`master-detail` usam `start` e `end` e não mudam.

### 2.2 A paragem do conteúdo

`extent` continua a fração da camada, e `undefined` continua a ser "o passo decide". Com
`size="content"`, `undefined` é a altura do conteúdo, e essa altura é uma paragem para o
teclado, para o arraste e para o toque no grabber, medida no momento em que é precisa:

```
conteúdo = painel.offsetHeight − body.clientHeight + body.scrollHeight
```

Uma liberação que assenta na paragem do conteúdo pede `extent: undefined`, não a
fração medida: a folha volta a seguir o conteúdo quando ele cresce.

Com `snapPoints` vazios e um passo nomeado, o repouso do passo é a única paragem do
arraste pelo corpo, e a folha volta a ele ou fecha. O `resizer` de uma folha sem
paragens continua contínuo, porque num ecrã de secretária redimensionar é o que ele faz.

### 2.3 Arrastar pelo corpo

`drag: "panel" | "resizer"`, omissão `panel`, eixo novo com resolução
`prop → defaults → family`. Só uma folha `side="bottom"` com `mode="overlay"` o lê; nos
outros lados o `resizer` é o único alvo de arraste, como antes.

A mecânica vive em `@slotted/core/extent` (`attachSheetDrag`), partilhada pelos dois
bindings:

- Eventos de toque, com `touchmove` não passivo no painel. Os eventos de ponteiro não
  servem: com `touch-action` a admitir `pan-y` o navegador toma o gesto e emite
  `pointercancel`, e com `none` o corpo deixa de rolar.
- O gesto não começa sobre `input`, `textarea`, `select`, `[contenteditable]`, o
  `resizer` (que tem o seu), `[data-drawer-drag="none"]`, um elemento cujo `touch-action`
  calculado não admite `pan-y`, nem com texto selecionado.
- O eixo e o dono decidem-se ao passar 8 px: horizontal, nunca é da folha; para baixo com
  algum contentor rolável entre o alvo e o painel fora do topo, rola; para cima com a
  folha na paragem mais alta, rola; o resto arrasta, e o `touchmove` é cancelado.
- A soltura chama `settleExtent` (§2.4), a mesma função que o `resizer` passa a chamar.

Custo: um leitor de rato não arrasta o corpo, arrasta o `resizer`. Um arraste de texto
com o rato seria confundido com o gesto, que é a razão da recusa de 2026-09-04 e continua
válida para o rato. `side="top"` não ganha o gesto: a passagem inverte-se e nenhuma fonte
lida descreve uma folha de cima com scroll.

### 2.4 Onde a folha assenta

```ts
settleExtent({ from, fraction, velocity, span, stops, dismissible }): number | 'close'
```

- `stops` são as paragens ordenadas; `0` junta-se a elas quando `dismissible`.
- Uma velocidade acima de 500 px/s (`SHEET_FLING_PX_PER_S`, o limiar de
  `BottomSheetBehavior`) escolhe a primeira paragem além de `fraction` no sentido do
  gesto; `0` é `close`.
- Abaixo dela, a paragem mais próxima de `projectExtent({ fraction, velocity })`.

Substitui `DISMISS_VELOCITY` (`0,5` camada/s), que numa camada de 400 px eram 200 px/s e
fechava a folha num gesto lento.

### 2.5 `scrimFrom`

Uma fração, omissão `0`. Enquanto a extensão está abaixo dela a raiz escreve
`data-undimmed`: o `backdrop` tem `opacity: 0` e `pointer-events: none`, com a transição
de opacidade que já tinha. É a folha de mapa de UIKit e Ionic: pede `modal={false}` e
`outsidePress="none"`, porque um scrim ausente sobre uma página inerte seria a promessa
de uma página operável que não responde. A página de referência escreve as três props
juntas.

### 2.6 Largura

`side="top"` e `side="bottom"`: `inline-size: min(100%, var(--slotted-drawer-sheet-inline-size))`,
`justify-self: center`. `--slotted-drawer-sheet-inline-size` resolve em
`--slotted-drawer-extent-xl` (`40rem`, os 640 dp de Material 3). Numa camada mais larga os
dois cantos de cima arredondam-se e a folha fica sobre o scrim nos dois lados, como em
Material 3 num tablet.

### 2.7 Teclado virtual

Uma função nova em `@slotted/core/measure`, e não um subpath novo: `measure` já responde a quanto espaço um elemento tem, e um subpath novo obriga os dois Storybooks a reiniciar.

```ts
observeKeyboardInset(view: Window, onInset: (pixels: number) => void): () => void
```

O recuo é `innerHeight − (visualViewport.height + visualViewport.offsetTop)`, arredondado,
nunca negativo, relido em `resize` e `scroll` do `visualViewport`. Não liga
`navigator.virtualKeyboard.overlaysContent`: é um estado global da página e a API não é
Baseline.

A camada sobreposta escreve `--slotted-keyboard-inset` (propriedade de runtime, em
`packages/styles/src/runtime-properties.mjs`) enquanto está aberta, e a folha lê-o como
`padding-block-end` da raiz. A célula da grelha encolhe, o painel assenta acima do
teclado, e o seu limite (`100%`) encolhe com ela. Vale para os quatro lados: o rodapé de
um painel lateral também fica acima do teclado.

### 2.8 O toque no grabber

Um `click` no `resizer` que não foi precedido de arraste sobe à paragem seguinte e, da
mais alta, volta à mais baixa. Sem paragens além do repouso, não faz nada. `Enter`
mantém o comportamento do padrão Window Splitter.

### 2.9 Decididas durante a implementação

- **Premir o separador não move o painel.** O painel segue o ponteiro a partir do desvio
  em que foi agarrado; um toque que não percorre 3 px é o toque do §2.8. Antes, premir
  punha a aresta onde o ponteiro caía, e um toque no grabber era um redimensionamento.
- **Com `size="content"` o intervalo passa a última paragem.** A altura do conteúdo é uma
  paragem acima de `snapPoints`, e `extentBounds` prendia o intervalo em `[0.5]` a `0.5`.
- **`undefined` é o valor de partida de um pedido, não o piso.** `requestExtent` comparava
  o pedido com `extent ?? min`, e pedir o piso a partir da paragem do conteúdo era lido
  como nenhuma mudança. O cenário no navegador encontrou-o; o teste nos dois bindings
  reprodu-lo.
- **Sem scrim, a raiz também deixa passar o toque.** A camada é fixa sobre o viewport, e
  `pointer-events: none` só no `backdrop` deixava a raiz apanhar o toque destinado à
  página.
- **`measureSheetStops`, `stopAsExtent` e `sameStop` vivem em `@slotted/core/extent`.**
  Os dois bindings medem as paragens da mesma maneira, e a aritmética não tem idioma.

## 3. Anatomia

Sem partes novas. Estados novos no DOM: `data-undimmed` na raiz; `data-drag` e
`data-size="content"` como eixos.

## 4. Integração

As tabelas de `2026-09-04-drawer-design.md` §10 e §11 continuam válidas. Mudam três
linhas:

| Binding | Pergunta                  | Resposta                                                                                                             |
| ------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| React   | Defaults uma vez          | `DrawerDefaultsProvider` ganha `drag`; `scrimFrom` é por instância, como `minExtent`                                                                   |
| React   | Estados no DOM            | `data-undimmed`, `data-drag`                                                                                          |
| Angular | Defaults uma vez          | `provideDrawerDefaults()` ganha `drag`; `scrimFrom` é por instância                                                                  |
| Ambos   | Listeners desfeitos       | `attachSheetDrag` e `observeKeyboardInset` devolvem a função que os remove; React num efeito, Angular em `DestroyRef` |

## 5. Custo de uma resposta errada no gate visual

- `content` como omissão das folhas: uma linha do contrato e duas da folha antes dos
  bindings; depois, os testes de omissão dos dois.
- Largura máxima de 40 rem: um token.
- Arraste pelo corpo só ao toque: uma condição em `attachSheetDrag`; o rato passaria a
  exigir a mesma exclusão de texto que Vaul escreve.
