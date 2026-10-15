# `tour` — inventário e design

Data: 2026-09-24. Família nova da onda 11 (`docs/process/build-order.md`). Compõe os
módulos de `packages/core` que `popover` e `dialog` compõem — `positioner`,
`dismissable-layer`, `focus`, `presence`, `portal`, `live-announcer` — e a semântica das
duas famílias: a etapa ancorada é um diálogo não modal como `popover`, a etapa centrada é
um diálogo como `dialog`. Os botões são `button`. A lógica de etapas é
`@slotted/core/tour`.

## 1. Inventário de capacidades

### 1.1 Surveyed

| Implementação   | Nome                        | Fonte lida em 2026-09-24                                        |
| --------------- | --------------------------- | --------------------------------------------------------------- |
| Ark UI 5.39     | `Tour`                      | ark-ui.com/docs/components/tour                                 |
| Zag 1.44        | `tour` (máquina)            | zagjs.com/components/react/tour                                 |
| Ant Design 6.6  | `Tour`                      | ant.design/components/tour                                      |
| Shepherd.js     | `Tour`, `Step`              | docs.shepherdjs.dev/api/step/interfaces/stepoptions             |
| Driver.js       | `driver()`                  | driverjs.com/docs/configuration                                 |
| WAI-ARIA APG    | (sem padrão)                | w3.org/WAI/ARIA/apg/patterns/dialog-modal/ como fonte mais próxima |

Ark é a ligação React de Zag; contam como uma só fonte de comportamento e duas de API.
Fluent `TeachingPopover` não foi lido: a página de documentação exige script e o texto
não carregou.

### 1.2 Table stakes

| Capacidade                                            | Quem entrega                    | Veredito | Razão                                                                                                                       |
| ----------------------------------------------------- | ------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| Etapas com alvo, título, descrição                    | todos                           | adopt    | É a família. O alvo é um elemento, um seletor ou uma função.                                                                |
| Etapa sem alvo, centrada                              | Zag (`dialog`), Ant, Shepherd   | adopt    | Etapa sem `target`. Abertura e fecho de um tour são quase sempre centrados.                                                 |
| Placement por etapa e por tour                        | todos                           | adopt    | `side` e `align` do vocabulário de `popover`; `flip` e `shift` do `positioner`.                                              |
| Seta                                                  | Ant, Ark, Shepherd, Driver      | adopt    | Parte `arrow`, desenhada como a de `popover`.                                                                               |
| Spotlight com recorte, margem e raio                  | todos                           | adopt    | Partes `spotlight` e `backdrop`; margem e raio são tokens, não números do script.                                            |
| Alternativa sem spotlight                             | Ant (`mask: false`), Zag, Driver | adopt   | Eixo `spotlight`. O âmbito o exige.                                                                                         |
| Anterior, próximo, concluir, pular, fechar            | todos                           | adopt    | Partes `prev`, `next`, `skip`, `close`; `next` diz "Done" na última etapa.                                                  |
| Progresso em texto                                    | Zag, Driver                     | adopt    | Parte `progress`, "2 of 5", substituível por provider.                                                                       |
| Etapa atual controlada                                | Ant (`current`), Zag (`setStep`) | adopt   | `step` / `defaultStep` / `onStepChange`, por id, não por índice: uma etapa condicional não desloca as outras.               |
| Aberto controlado                                     | Ant (`open`), Zag (`start`)     | adopt    | `open` / `defaultOpen` / `onOpenChange`.                                                                                    |
| Distinguir concluir, pular e fechar                   | Zag (`status`), Ant (`onFinish`) | adopt   | O pedido de fecho carrega `outcome`: `complete`, `skip`, `close`, `unavailable` — como `dialog` carrega `result`.           |
| Teclado: setas entre etapas, Escape                   | Zag, Ant, Shepherd, Driver      | adopt    | `ArrowRight`/`ArrowLeft` espelhadas em RTL, só com o foco no conteúdo; `Escape` pela camada.                                |
| Fechar com clique fora                                | Zag, Driver                     | adapt    | Eixo `closeOnOutsidePress`, desligado por omissão: um clique no scrim não deve apagar o progresso do leitor.                 |
| Bloquear a página                                     | Zag (`preventInteraction`), Driver | adapt | Eixo `modal`: página `inert` e foco contido, não só `pointer-events`.                                                       |
| Alvo interativo                                       | Shepherd, Ant, Driver           | adopt    | `interactive` por etapa; a etapa passa a não modal (§4.3).                                                                  |
| Avançar numa ação do leitor                           | Shepherd (`advanceOn`), Zag (`wait`) | adopt | `advanceOn`: nome de evento DOM no alvo; avança com razão `pointer` ou `keyboard`.                                         |
| Preparação assíncrona antes de mostrar                | Shepherd (`beforeShowPromise`), Zag (`effect`) | adopt | `prepare(signal)`; `next` fica `loading` enquanto espera.                                                    |
| Condição de disponibilidade                           | Shepherd (`showOn`)             | adopt    | `when()` por etapa, lida ao navegar; o âmbito o exige.                                                                       |
| Esperar o alvo aparecer                               | Shepherd (`waitForElement`)     | adopt    | `targetTimeout` em ms, com `MutationObserver`.                                                                              |
| Alvo ausente                                          | Shepherd (`skipMissingElement`), Zag (`not-found`) | adopt | `missing: 'center' \| 'skip'`, `center` por omissão.                                                          |
| Rolar o alvo para a vista                             | Ant, Shepherd, Driver           | adopt    | Eixo `scrollIntoView`, ligado; suave só sem `prefers-reduced-motion`.                                                       |
| Imagem ou vídeo na etapa                              | Ant (`cover`)                   | adopt    | Parte `media`. Uma só fonte, e custa uma parte sem eixo.                                                                    |
| Textos traduzíveis                                    | Zag (`translations`), Driver    | adopt    | Provider e instância.                                                                                                       |
| Ações por etapa                                       | Zag (`actions`), Ant (`actionsRender`) | adapt | Composição: o consumidor arranja as partes (`footer` com os seus botões) em vez de uma lista de ações em dados.         |
| Indicadores em pontos                                 | Ant (`indicatorsRender`)        | decline  | Uma fonte. Composição: `useTour()` / `slTour` expõem `position` e `total`; três linhas desenham os pontos.                   |
| Tipo `primary` (cartão na cor de acento)              | Ant (`type`)                    | decline  | Uma fonte. Os tokens `--slotted-tour-surface` e `--slotted-tour-text` retintam o cartão.                                    |
| Etapas dinâmicas (`addStep`, `removeStep`)            | Zag                             | adapt    | `steps` é dado; mudar o array é a API.                                                                                      |

### 1.3 Differentiators

- **Página `inert` sob o tour modal.** Os cinco inspecionados bloqueiam o ponteiro com a
  máscara e deixam a página na árvore de acessibilidade; um leitor de ecrã percorre o
  fundo. Aqui o modal é o de `dialog`, pela `dismissable-layer`.
- **Foco que segue o leitor, não o tour.** A mudança de etapa move o foco para o novo
  conteúdo só quando o foco estava no conteúdo anterior; com o leitor no alvo, a etapa nova
  é anunciada pela live region e o foco fica onde está.
- **Recorte e margem em CSS.** O script publica o retângulo do alvo; o recorte, a margem e
  o raio são tokens, por isso a densidade e o tema mudam o spotlight sem script.
- **O spotlight desliza de um alvo ao seguinte** na escala de motion; colapsa em
  `prefers-reduced-motion`.
- Três esquemas, três densidades, RTL com setas e placement espelhados, e duas ligações.

### 1.4 Gaps

- **Alvo que desaparece a meio da etapa** (a linha foi apagada, a rota mudou): nenhuma
  fonte responde. A família observa o alvo; quando sai do documento, a etapa passa a
  centrada com `data-missing` e o leitor continua.
- **Tour sem nenhuma etapa disponível**: o pedido de abertura é recusado com o fecho
  `outcome: 'unavailable'`, e o tour não pisca.
- **Preparação que falha** (`prepare` rejeita): trata-se como alvo ausente.
- **Título longo, traduzido, de palavra única**: `overflow-wrap: anywhere`, como `popover`.
- **Alvo maior do que a janela**: o spotlight mantém-se e o cartão fica centrado (§4.7).
- **Diálogo aberto a meio do tour**: nenhuma fonte o trata; o diálogo fica por cima e torna o
  tour inerte. Aqui o tour volta ao topo (§4.8).
- **Telemóvel**: as fontes reduzem o cartão até ao ilegível ou deixam-no sair do ecrã; aqui a
  composição muda abaixo de 600 px (§4.6).

## 2. Padrão

O APG não tem padrão de tour. As fontes mais próximas são o padrão Dialog (Modal), em
w3.org/WAI/ARIA/apg/patterns/dialog-modal/, para a etapa modal, e o diálogo não modal que
`popover` já responde (`specs/components/popover/contract.json`) para a etapa com alvo
interativo.

Teclado do padrão Dialog (Modal), transcrito:

| Tecla     | Efeito                                                                          | Na família                                        |
| --------- | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| Tab       | próximo elemento focável do diálogo; do último volta ao primeiro                | modal: contido; não modal: sai pelo `focus-guard` |
| Shift+Tab | elemento focável anterior; do primeiro vai ao último                            | idem                                              |
| Escape    | fecha o diálogo                                                                 | pedido com `reason: 'escape'`, `outcome: 'close'` |

Papéis e propriedades: `role="dialog"` no conteúdo; `aria-modal="true"` só quando a
página está `inert`; `aria-labelledby` para o título; `aria-describedby` para a
descrição. Foco inicial: o conteúdo (`tabindex="-1"`), como `popover`, para o leitor ouvir
o nome antes dos botões. Retorno: o elemento que tinha o foco ao abrir.

Teclas da família (fonte `family`): `ArrowRight` e `ArrowLeft` avançam e recuam, com o foco
no conteúdo e fora de um campo de texto; em RTL, `ArrowLeft` avança.

## 3. Anatomia

```
root ─ data-ui="tour", fixed, a moldura portalada
├─ backdrop      só quando modal; recebe o ponteiro fora do recorte
├─ spotlight     o recorte pintado à volta do alvo; o scrim é a sua sombra
└─ surface       a camada posicionada (data-side), como a raiz de popover
   ├─ focus-guard ×2   só quando não modal
   ├─ arrow
   └─ content    role="dialog"
      ├─ media
      ├─ header  ▸ progress · close
      ├─ title
      ├─ description
      ├─ body     conteúdo livre da etapa
      └─ footer  ▸ skip ··· prev · next
```

Estados: `open` na raiz; `loading` em `next` enquanto `prepare` ou `targetTimeout` correm;
os pseudo-estados de `button` nos quatro botões. Atributos de composição, não estados:
`data-side`, `data-align`, `data-placement="anchored|centered"`, `data-modal`,
`data-missing`, `data-spotlight`.

## 4. Decisões

### 4.1 Composição de `popover` e `dialog`

O âmbito diz "compõe `popover` e `dialog`". `popover` ancora-se a um `PopoverAnchor` que
envolve o elemento do consumidor, e não a um elemento qualquer da página que muda a cada
etapa. Compor a família exigiria mudar o contrato público de `popover`, fora desta sessão.
O `tour` compõe então os mesmos módulos de `packages/core` e herda a geometria visual de
`popover` (camada com `padding` como distância, seta a 45°) e o scrim de `dialog`
(`--slotted-scrim`). Custo: duas folhas de estilo desenham um cartão ancorado.

### 4.2 Estado

- `open`: `open` / `defaultOpen` / `onOpenChange`. Razões: `pointer`, `keyboard`,
  `dismiss` (parte `close`), `escape`, `outsidePress`, `back`, `programmatic`. O pedido de
  fecho carrega `outcome`.
- `current`: `step` / `defaultStep` / `onStepChange`, valor = id da etapa. Razões:
  `pointer`, `keyboard`, `programmatic`. `advanceOn` emite a razão do evento que o
  disparou.
- Navegar salta etapas com `when()` falso e, com `missing: 'skip'`, as de alvo ausente.
  `progress` conta só as etapas disponíveis.

### 4.3 Modal e alvo interativo

`modal` por omissão verdadeiro: página `inert`, foco contido, `backdrop` recebe o ponteiro.
Uma etapa `interactive` é não modal: `inert` aplicado a toda a página excepto o alvo
exigiria à `dismissable-layer` excluir o caminho do alvo, e o foco contido no cartão não
deixaria o `Tab` chegar ao alvo. A etapa interativa deixa a página alcançável, o spotlight
continua a escurecer com `pointer-events: none`, e os `focus-guard` levam o foco ao alvo.
Custo: numa etapa interativa um leitor de ecrã alcança o resto da página.

### 4.4 Foco

Abrir com `autoFocus` (ligado) foca o conteúdo. Mudar de etapa move o foco para o novo
conteúdo só se estava no conteúdo anterior ou no `body`; noutro caso anuncia o título pela
live region, `polite`. Fechar devolve o foco ao elemento que o tinha ao abrir, ou a
`finalFocus`.

### 4.5 Geometria do spotlight

O script publica `--slotted-tour-target-x`, `-y`, `-width` e `-height` na raiz (valores de
runtime, nome que diz o que são). O CSS soma `--slotted-tour-spotlight-padding` e desenha o
recorte com `--slotted-tour-spotlight-radius`. O scrim é `box-shadow` do spotlight com
`--slotted-scrim`, o que dá cantos arredondados. O `spotlight` é filho do `backdrop`, que
desvanece o scrim com o par de `dialog` (`scrim-motion.test.mjs`). Numa etapa modal o
`backdrop` inteiro recebe o ponteiro, sem recorte: o alvo de uma etapa modal está `inert`
com a página. Uma etapa sem alvo, ou com `spotlight={false}`, pinta o scrim no próprio
`backdrop`.

### 4.6 Telemóvel

O tour funciona no telemóvel, que é onde a orientação mais falta faz. Abaixo de 600 px de
viewport (`COMPACT_BELOW`, o limiar de classe de tamanho da biblioteca) a raiz recebe
`data-compact`: um lado lateral passa a `bottom` (`compactSide`), e o cartão ocupa a largura
que o `positioner` diz sobrar, limitada a `--slotted-tour-measure-compact` (32rem). O eixo
`layout` (`auto`, `compact`, `regular`) força uma das composições. O cartão centrado fica
dentro de `env(safe-area-inset-*)`. Os botões são `button`, que cresce para 44 px sob
`pointer: coarse`. Uma folha inferior foi recusada: separa o cartão do alvo que aponta.
Um produto que não queira o tour no telemóvel não o abre, ou marca passos com `when()`.

### 4.7 Cantos, bordas e alvos grandes

Um alvo num canto é resolvido pelo `positioner` (`flip`, `shift`, `collisionPadding`,
`arrowPadding`). Um alvo que não deixa 140 px acima ou abaixo, nem 240 px ao lado num viewport
regular (`cardFits`, `TOUR_ROOM`), mantém o spotlight e recebe o cartão centrado. O
acompanhamento do retângulo ouve o scroll de qualquer contentor, o redimensionamento, o fim
de animações e transições, os primeiros frames até o retângulo parar, e o `visualViewport`
(teclado virtual, zoom).

### 4.8 Camadas: diálogos dinâmicos

O tour entra na pilha única da `dismissable-layer`. Três mudanças partilhadas em
`packages/core` respondem ao tour sobre outra camada:

- `focus-scope` deixa o foco ir para uma camada aberta, ou levantada, por cima de um âmbito
  que contém o foco; o `dialog` deixa de puxar o foco para fora do cartão.
- `dismissable-layer.raise()` e `portal.raise()` repõem uma camada no topo, no documento e na
  pilha, e reaplicam o seu `inert`.
- O tour chama os dois quando o alvo do passo vive numa camada aberta depois dele: um diálogo
  aberto pelo `prepare` fica `inert` por baixo do tour, e não o contrário.

O foco volta ao cartão depois de uma navegação iniciada nele, mesmo que o diálogo aberto
entretanto o tenha tomado. Custo: as entradas de histórico mantêm a ordem, e o gesto de voltar
chega primeiro ao diálogo.

### 4.9 Origem do tema

O portal herda tema, esquema, densidade e direção da origem. Um primeiro passo centrado não
tem alvo; a origem é então o elemento com foco ao abrir, ou o primeiro alvo resolúvel das
etapas (React), ou o próprio `<sl-tour>` (Angular).

### 4.10 Movimento

O cartão entra e sai só por opacidade, como o painel do `dialog` (DG4): texto movido por
frações de pixel é reamostrado a cada frame. Sai no passo curto e na curva de saída; entra no
passo longo e na curva standard, e só é desenhado depois de colocado (`data-ready`).

O recorte não tem transição em repouso — acompanha scroll e resize sem arrasto. `data-spot`
nomeia os três movimentos que o olho segue, todos no passo longo e na curva standard:
`travel` entre dois alvos, `light` quando um recorte abre (o buraco clareia a partir da tinta do
scrim), `close` antes de uma etapa centrada (o buraco enche com o scrim antes de o recorte sair).
O recorte da primeira etapa "vinha do céu" porque transitava do canto 0,0.

A sequência de uma mudança de etapa está em `stageStep` (`@slotted/core/tour`): o cartão antigo
sai; a página rola com o recorte parado no alvo antigo; o recorte move-se; o cartão novo entra no
passo médio, enquanto o recorte termina o movimento. A abertura traz scrim e cartão juntos, com
`data-open` escrito um frame depois de o quadro existir. O fecho declara a saída como transição
de `visibility`, que é o que a `presence` mede antes de retirar o quadro. Medido no Storybook,
frame a frame: abertura ~300 ms, passagem entre alvos visíveis ~500 ms, fecho ~150 ms.

## 5. Integração

### React

| Pergunta                         | Resposta                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| Par controlado com razão         | `open`/`defaultOpen`/`onOpenChange(open, request)`; `step`/`defaultStep`/`onStepChange`          |
| Defaults por aplicação           | `TourDefaultsProvider` e `useTourDefaults`                                                       |
| Substituir o elemento das partes | `render` em cada parte; `root` e `backdrop` fixos (moldura portalada)                            |
| Handler do consumidor corre      | compõe `onClick`/`onKeyDown` em todas as partes                                                  |
| Ref e ação imperativa            | `ref` do conteúdo; `TourHandle`: `start(id?)`, `next()`, `prev()`, `close(outcome)`, `reposition()` |
| SSR                              | `useId`; nada é medido durante o render; fechado não renderiza                                  |
| Estados no DOM                   | `data-open`, `data-loading`, `data-side`, `data-placement`, `data-modal`, `data-missing`         |
| Props nativas                    | `ComponentPropsWithRef<'div'>` / `<'button'>` / `<'img'>` por parte                              |

Sem filhos, `Tour` desenha a anatomia completa. Com filhos, o consumidor arranja as partes
(`TourContent`, `TourTitle`, …), que leem a etapa atual do contexto; `useTour()` expõe
`step`, `position`, `total`, `next`, `prev`.

### Angular

| Pergunta                   | Resposta                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------- |
| Valor em sinal             | `open = model()`, `step = model()`; `openChange`/`stepChange` com o pedido e a razão    |
| Formulários                | não: um tour não é um valor de formulário                                               |
| Defaults por aplicação     | `SL_TOUR_DEFAULTS` e `provideTourDefaults()`                                            |
| Instância                  | `exportAs: 'slTour'`                                                                    |
| Conteúdo projetado e lazy  | `ng-template slTourStep="<id>"` por etapa, renderizado só quando é a atual              |
| Zoneless e OnPush          | sinais; nenhum `markForCheck`                                                           |
| Teardown                   | `DestroyRef` para camada, posicionador, observador e escuta de `advanceOn`             |
| Atributo estático          | `HostAttributeToken` para `aria-label` escrito pelo consumidor no conteúdo              |
| Entry point                | `@slotted/angular/tour`, importa `@slotted/angular/button`                              |

## 6. Custo de uma resposta errada no gate visual

A anatomia (moldura, spotlight, cartão) e a posição dos botões são a base das duas
ligações e das duas páginas de referência. Mudar a ordem do rodapé ou juntar `progress` a
`footer` custa hoje a folha de estilo e o harness; depois do passo 13 custa as duas
ligações, os testes e as duas páginas.
