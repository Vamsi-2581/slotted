# `drawer` — bottom sheet sobre scroll nativo

Data: 2026-10-23. Substitui, para `mode="overlay"` e `side="bottom"`, o mecanismo de gesto
de `2026-09-25-drawer-bottom-sheet-design.md` (`sheet.drag`, `sheet.gesture`,
`sheet.settle`, `sheet.overdrag`). O resto desse desenho continua a valer: paradas,
`scrimFrom`, `size="content"`, `expanded`, teclado virtual, toque no puxador, teclado do
separador.

Uma **bottom sheet** é o painel de `drawer` com `mode="overlay"` e `side="bottom"`. Um
**detent** é uma altura de repouso da folha. O **scroller da folha** é o elemento da
família, entre a camada e o painel, cujo `scrollTop` é a altura visível do painel.

## 1. Problema medido

Cenário `packages/react/src/drawer/repro.browser.test.tsx` (Chromium, toque por CDP):

| Caso                                                     | Medida                                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Fling pelo cabeçalho, 30 px/frame, CPU 1×                | primeiro frame após soltar: 16 px; volta a 30 px/frame em 6 frames                                     |
| O mesmo, CPU 6× e aplicação que renderiza 40 ms no fecho | eventos a ~60 ms; velocidade abaixo de 500 px/s; a folha volta ao repouso em vez de fechar             |
| Arraste pelo `resizer` e pelo corpo, mesma folha         | o `resizer` pousa onde a mão larga (sem snap points); o corpo pousa na parada de conteúdo ou fecha     |

Causas:

1. Cada `touchmove` é não passivo e escreve `translate` na main thread. Qualquer trabalho
   da aplicação atrasa o frame seguinte do dedo.
2. A soltura troca a posição escrita por JS por uma transição CSS. A transição começa no
   recálculo de estilo seguinte e chega ao compositor um frame depois; `close()` renderiza
   a aplicação na mesma tarefa e atrasa esse início. A velocidade da mão perde-se nesse
   intervalo.
3. A velocidade é estimada de eventos que a main thread entrega; com a main thread ocupada,
   um fling lê-se como arraste lento.
4. Corpo e `resizer` pousam com regras diferentes.

## 2. Mecanismo

O navegador move a folha. O dedo desloca o scroller da folha; o compositor segue o dedo,
calcula o fling e assenta no snap point, sem passar pela main thread. A família só lê o
resultado (`scrollend`) e escreve estado.

### 2.1 Estrutura

A camada é o scroller da folha: nenhum elemento novo entre camada e painel, e as regras
`[data-ui-drawer] > [data-part-panel]` continuam a valer.

```
[data-ui=drawer] (camada)            overflow-y: auto; scroll-snap-type: y mandatory
├── ::before                         block-size: 100% da camada (o espaço acima da folha)
├── [data-part=backdrop]             position: fixed
├── [data-part=panel]                scroll-snap-align: end (start quando é mais alto que a camada)
└── [data-part=stops]
    └── [data-part=stop] × n         marcadores de 0 px, scroll-snap-align: start
```

- `scrollTop = v` mostra os `v` píxeis de cima do painel. `scrollTop = 0` é a folha fechada.
- A camada tem `pointer-events: none`; o scrim e o painel recebem a pressão, e o toque no
  painel desloca a camada.
- `drag="panel"`: um único scroll para a folha e o conteúdo. O painel tem a altura do
  conteúdo; o corpo não tem scroll próprio; puxador e cabeçalho ficam `sticky` no topo e o
  rodapé no fundo. Acima do topo, o conteúdo é lido com o snap desligado
  (`data-sheet-content`) e, sem dedo, com o espaçador dobrado (`data-sheet-anchored`).
- `drag="resizer"`: o painel tem a altura da parada mais alta e o corpo rola por dentro,
  só nessa parada.

### 2.2 Comportamentos e onde ficam

| Comportamento                                   | Como fica                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Seguir o dedo, fling, pouso                     | scroll nativo com snap obrigatório, no compositor                                                                               |
| Fecho por arraste                               | `scrollend` em 0 pede `close('pointer')`; a recusa é lida 300 ms depois e devolve a folha ao repouso                            |
| Passagem folha ↔ conteúdo                       | no mesmo gesto, por ser um só scroll                                                                                            |
| Fling vindo do conteúdo                         | pára no início do conteúdo: com o espaçador dobrado, esse é o limite do que rola                                                |
| Re-snap por layout com conteúdo rolado          | não acontece: snap desligado enquanto o conteúdo é lido                                                                         |
| Sobre-arraste acima do topo                     | overscroll da plataforma; o painel pinta a sua superfície 50vh abaixo da borda                                                  |
| Abrir e fechar por botão, Escape, pressão fora  | scroll suave nativo até ao repouso e até 0; a camada é retida `long + medium`                                                   |
| `scrimFrom`, opacidade do scrim                 | listener `scroll` passivo para `data-undimmed`; `animation-timeline: scroll()` para o véu                                        |
| Toque no puxador, setas, Home, End              | `scrollTo` suave para a parada                                                                                                  |
| Arraste com rato no puxador                     | `scrollTop` escrito com o snap desligado; pousa na parada mais próxima                                                          |
| Teclado virtual                                 | `padding-block-end` da camada, `scroll-padding-block-end` e o `inset` do rodapé                                                 |

`createSheetMotion`, `attachSheetDrag` e `dampenExtent` saem de `@slotted/core/extent`.
Os lados `start`, `end`, `top` e `mode="inline"` não mudam.

### 2.3 Riscos

1. Scroll de um ancestral com `pointer-events: none` a partir de um toque no painel:
   confirmado no Chromium.
2. Snap obrigatório com fling no WebKit de iOS: não verificado.
3. `animation-timeline: scroll()` no Safari: não verificado; sem ele o véu não acompanha o
   scroll e o scrim abre e fecha pela sua transição.
4. `scrollend`: Chrome 114, Firefox 109, Safari 26.2; antes disso, `scroll` com 150 ms sem
   evento.
5. Rolar livre dentro de um painel maior que a camada (área de snap maior que o snapport):
   confirmado no Chromium; não verificado no WebKit.

## 3. Verificação

Cenários de browser com toque por CDP (`Input.dispatchTouchEvent`), cada um com asserção:

- fling para baixo fecha, e a posição por frame após soltar é monotónica e nunca mais lenta
  que a do último frame do dedo em mais de 10 %;
- fling para cima vai ao detent seguinte; arraste lento pousa no detent mais próximo;
- o mesmo fling com CPU 6× e 40 ms de trabalho no `onOpenChange` fecha;
- puxador e corpo pousam no mesmo detent para o mesmo gesto;
- fecho recusado devolve a folha ao detent anterior;
- reabertura no detent de repouso.
