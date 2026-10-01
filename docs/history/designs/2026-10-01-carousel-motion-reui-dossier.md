# Dossiê ReUI — `carousel`, passe de movimento

## 0. Cabeçalho

Família `carousel`, modo `polish` (passa a tocar `contract.json`: uma propriedade de runtime, `data-moving`, `motion` e `pointer.release`/`pointer.edges`), 2026-10-01, HEAD `f3368218`. Pedido: "as transições/animações não estão bem feitas, no drag principalmente, e slide".

## 1. Seleção

Cobertura `direta`, a mesma do dossiê de construção (`2026-10-01-carousel-reui-dossier.md` §1). O movimento ao longo do tempo não é um valor calculado que `specimen.mjs` registe; o lado ReUI lê-se da documentação do motor que o primitivo usa (Embla, `https://www.embla-carousel.com/docs/api/options`, opções `duration` e `dragFree`), e o lado Slotted de um traço por frame no Chrome (`scratchpad/trace.mjs`: posição do scroll, `scroll-snap-type` e `translate` do primeiro slide em cada `requestAnimationFrame`, na story `components-carousel--keyboard`, 900 × 900).

| Item | Tipo | Rota | Parte ou interação Slotted que informa | Capturas |
| --- | --- | --- | --- | --- |
| Embla `duration` | documentação | `/docs/api/options#duration` | scroll de uma página pedida | — |
| Embla `dragFree` | documentação | `/docs/api/options#dragfree` | soltura de um arrasto | — |
| `c-carousel-1` | exemplo | `/preview/base/example/c-carousel-1` | botões, já medidos | `specimen/c-carousel-1/` |

## 2. Anatomia

Sem alteração. A parte `viewport` passa a carregar `data-moving` enquanto o motor ou a mão a movem, e `--slotted-carousel-overscroll` enquanto uma ponta está puxada.

## 3. Medidas

Sem alteração aos valores estáticos medidos no dossiê de construção.

## 4. Coreografia de estados

| Parte | Estado | Delta ReUI | Delta Slotted antes | Alvo |
| --- | --- | --- | --- | --- |
| `viewport` | arrasto | segue o ponteiro; a soltura conserva a força do arrasto ("duration is then determined by the drag force") | segue o ponteiro; `scroll-snap-type` ainda `x mandatory` no primeiro frame do gesto (escrito por um render do framework) | snap desligado no mesmo task do gesto |
| `viewport` | soltura | atração física a partir da velocidade da mão | **salto**: 1110 → 1660 px num frame (o binding recolocava a página "de imediato" e cancelava a animação do motor) | mola lançada à velocidade da soltura |
| `viewport` | arrasto além de uma ponta | o Embla resiste | parede: `translate: none`, o ponteiro afasta-se do conteúdo | resistência elástica e regresso em mola |
| `viewport` | página pedida (botão, tecla) | atração física, `duration` 25 (não em ms) | curva `standard` (0.2, 0, 0, 1): 0 px aos 54 ms, 24 px aos 70 ms, pico 9,2 px/ms aos 105 ms, fim aos 370 ms | arranque imediato, cauda curta |

## 5. Movimento

Antes (`trace-before.json`): o scroll pedido seguia uma curva que arranca com velocidade zero; a soltura de um arrasto saltava para a página; um segundo pedido a meio recomeçava do repouso.

Depois (`trace-after3.json`):

| Gesto | Medida |
| --- | --- |
| Botão seguinte, 830 px | 40 px aos 60 ms, pico 125 px num frame, fim aos 389 ms; sem rastejo final (antes 818 → 830 em 130 ms com rigidez 7) |
| Arrasto de 280 px a 0,6 px/ms, soltura | a página seguinte, 1110 → 1660 px contínuo: 0,67 → 4,9 px/ms → 0; nenhum frame com salto acima de 83 px |
| Puxão de 150 px além do início | `translate` 75 px (resistência 0,55 do viewport); regresso 75 → 0 px em 270 ms, sem salto |
| Movimento reduzido | `--_scroll-duration` colapsa para 1 ms; a rigidez dá 0 e o scroll aterra de imediato |

A mola é criticamente amortecida, com rigidez `8 / --_scroll-duration` (`--slotted-duration-long`, 320 ms): à duração fica 0,3 % do caminho. É lançada à velocidade que o scroller já tem — a da mão que solta, ou a de um movimento que interrompe — limitada à que aterra sem passar o alvo. Um pedido da página que já está em voo mantém o voo. A curva `--_scroll-easing` deixou de ser lida e saiu da folha.

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| --- | --- | --- | --- | --- | --- | --- |
| Soltura com inércia | Embla em todos os `c-carousel-*` | física interna, `duration` sem unidade | mola com rigidez derivada de um token de duração | colapsa com o movimento reduzido do tema e um tema retoma-a por `--slotted-carousel-duration` | adaptar | — |
| Avanço por flick | Embla (força do arrasto), Swiper | implícito | acima de 0,25 px/ms na soltura, uma página no sentido da mão; nunca mais de uma | regra escrita no contrato e testável | adotar | — |
| Resistência nas pontas | Embla | física interna | `rubberBand` com a constante 0,55 das vistas de scroll da plataforma, aplicada ao `translate` dos slides | o scroller nativo continua dono do scroll; só a parte que ele não pode desenhar é desenhada | adotar | — |
| Movimento livre (`dragFree`) | Embla | opção | — | — | recusar: um carrossel de páginas para numa página; uma faixa livre é `scroll-area` | `scroll-area` |

## 7. Superar

| Critério | ReUI | Slotted antes | Slotted agora | Fonte |
| --- | --- | --- | --- | --- |
| Motion | física contínua | soltura com salto de 550 px; arranque com 54 ms parado | contínuo; primeiro movimento no primeiro frame do efeito | `trace-before.json`, `trace-after3.json` |
| Reduced motion | sem alteração (dossiê de construção §5) | colapsa | colapsa | `--motion reduce` |
| Transition | — | snap desligado um frame tarde | snap desligado no mesmo task (`data-moving`) | `trace-after3.json` coluna `scroll-snap-type` |

## 8. Delta

| # | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | --- | --- | --- | --- |
| 1 | `packages/core/src/carousel/carousel.ts` | `springAt`, `springLaunch`, `rubberBand`, `SPRING_STIFFNESS`, `FLICK_SPEED`; mola com velocidade herdada; pedido da página em voo mantém o voo; `data-moving` síncrono; janela de 100 ms para a velocidade de soltura; flick | §4 soltura, página pedida, arrasto | `trace-after3.json` |
| 2 | `packages/styles/src/carousel/carousel.css` | `[data-moving]` desliga o snap; `translate: var(--slotted-carousel-overscroll)` nos slides; sai `--_scroll-easing` | §4 arrasto, ponta | `trace-after3.json` |
| 3 | `specs/components/carousel/contract.json` (contrato) | `--slotted-carousel-overscroll`, `data-moving`, `motion`, `pointer.release`, `pointer.edges` | §2, §5 | `contract.test.mjs` |
| 4 | `packages/styles/src/runtime-properties.mjs`, `tokens.test.mjs` | regista `--slotted-carousel-overscroll` | §2 | `tokens.test.mjs` |
| 5 | páginas React e Angular | legendas da transição `slide` | §5 | `test:docs` |
