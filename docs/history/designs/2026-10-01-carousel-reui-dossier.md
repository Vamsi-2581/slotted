# Dossiê ReUI — `carousel`

## 0. Cabeçalho

Família `carousel`, modo `build`, 2026-10-01, HEAD `03a02542` (mais o commit do schema `playback`).

## 1. Seleção

Cobertura `direta`: o ReUI publica o primitivo `Carousel` do shadcn sobre Embla e onze exemplos livres. Termos pesquisados em `tools/harness/out/specimen/reui-llms-full.txt`: `carousel` 29, `gallery` 12, `thumbnail` 16, `marquee` 2, `slider` 23 (todos de `slider` de valor), `slideshow` 0, `swipe` 0. O registo `https://reui.io/r/carousel.json` responde 404; a forma do primitivo lê-se dos exemplos (`https://reui.io/r/c-carousel-{1..11}.json`).

| Item | Tipo | Rota | Parte ou interação Slotted que informa | Capturas |
| --- | --- | --- | --- | --- |
| `c-carousel-1` | exemplo | `/preview/base/example/c-carousel-1` | `previous`, `next`, estados | `specimen/c-carousel-1/` (light, dark, `--motion reduce`, estados de `next`) |
| `c-carousel-3` | exemplo | `/preview/base/example/c-carousel-3` | vários por vista | `specimen/c-carousel-3/` |
| `c-carousel-9` | exemplo | `/preview/base/example/c-carousel-9` | miniaturas (duas instâncias sincronizadas) | `specimen/c-carousel-9/` |
| `c-carousel-11` | exemplo | `/preview/base/example/c-carousel-11` | pontos | `specimen/c-carousel-11/` |
| `review-5` | Pro | `/preview/base/review-5` | pontos com rotação | `specimen/review-5/` |
| `product-card-7` | Pro | `/preview/base/product-card-7` | trilho de quatro cartões | `specimen/product-card-7/` |
| `blog-3` | Pro | `/preview/base/blog-3` | linha de progresso, botões de 40 | `specimen/blog-3/` |
| `product-detail-1` | Pro | `/preview/base/product-detail-1` | galeria com miniaturas de 64 | `specimen/product-detail-1/` |

## 2. Anatomia

| `data-slot` ReUI | Parte Slotted | Estado |
| --- | --- | --- |
| `carousel` | `root` | igual |
| `carousel-content` | `viewport` | igual |
| `carousel-item` | `slide` | igual |
| `carousel-previous` | `previous` | igual |
| `carousel-next` | `next` | igual |
| — (botões do consumidor em `c-carousel-11`, `review-5`) | `indicators`, `indicator` | só no Slotted |
| — (consumidor em `c-carousel-9`) | `indicators` `variant="thumbnails"` | só no Slotted |
| — | `autoplay` | só no Slotted |
| — | `controls` | só no Slotted |
| — (texto do consumidor em `blog-3`) | `counter` | só no Slotted |

## 3. Medidas

ReUI a 1280 px; Slotted a 720 px. Nenhuma propriedade comparada depende da largura da página.

| Parte | Propriedade | ReUI | Slotted hoje | Alvo | Veredicto |
| --- | --- | --- | --- | --- | --- |
| `next` | caixa | 28 × 28 | 34 × 34 | `--slotted-control-height-md` | superar: 28 fica abaixo do passo `sm` (30) da escala; sobre uma fotografia o alvo maior é o que se acerta |
| `next` | glifo | 16 | 16 | `--slotted-control-icon-size-md` | igual |
| `next` | raio | 9999 px | 9999 px | `--slotted-radius-full` | igual |
| `next` | borda | 1 px `oklch(0.922 0 0)` | 1 px `rgb(191 199 209)` | `--slotted-control-border-color` | adaptar: a aresta de controlo da fundação |
| `next` | fundo | `oklch(1 0 0)` | `rgb(255 255 255)` | `--slotted-control-surface` | igual |
| `next` | sombra | `none` | `0 1px 2px rgb(0 0 0 / 0.06)` | `--slotted-control-shadow` | superar: sobre uma imagem clara o círculo sem sombra não se separa |
| `next` | posição `inset` | −48 px fora do viewport | 12 px dentro | `--slotted-space-5` | adaptar: `arrows="outside"` dá a forma de fora em colunas próprias, sem posição absoluta |
| `indicator` (ponto) | marca | 8 × 8 | 8 × 8 | `--slotted-space-4` | igual |
| `indicator` (atual) | marca | 16 × 8 (`c-carousel-11`), 28 × 6 (`review-5`) | 24 × 8 | `--slotted-space-8` | adaptar: três pontos de comprimento, forma e não só cor |
| `indicator` | caixa de acerto | 8 × 8 | 20 × 24, centros a 24 | `--slotted-target-min` | superar: WCAG 2.5.8 |
| `indicator` | cor em repouso | `oklch(0.556 0 0)` a 30 % | `rgb(120 137 156)` | `--slotted-border-strong` | superar: 3:1 sem opacidade |
| miniatura | caixa | 64 × 64 | 64 × 64 | `--slotted-carousel-thumbnail-size` → `--slotted-space-12` | igual |
| `counter` | tipo | 14 px | 13 px, algarismos tabulares | `--slotted-font-size-sm` | adaptar |

## 4. Coreografia de estados

| Parte | Estado | Delta ReUI | Delta Slotted hoje | Alvo |
| --- | --- | --- | --- | --- |
| `next` | hover | fundo `oklch(1 0 0)` → `oklch(0.97 0 0)` | fundo `#ffffff` → `#f1f5f9` | `--slotted-tone-secondary-subtle-hover` |
| `next` | active | o mesmo fundo do hover, `translate 0 1px` | fundo `#e2e8f0`, `scale 0.94`, sombra `none` | `--slotted-tone-secondary-subtle-active` |
| `next` | focus-visible | anel `0 0 0 3px` a 50 % de alfa | `outline` 2 px `#2563eb`, offset 2 px | anel da fundação |
| `next` | disabled | `opacity: 0.5` | tinta `--slotted-disabled-foreground`, aresta `--slotted-disabled-border`, foco mantido | — |
| `indicator` | hover | — (sem regra) | `#78899c` → `#5b6b7f` | `--slotted-text-muted` |
| `indicator` | active | — | → `#0f172a` | `--slotted-text` |
| `indicator` | current | 8 → 16 px de largura | 20 → 36 px de caixa, marca 8 → 24 | — |
| miniatura | hover | — | imagem 0.6 → 0.85, anel `--slotted-border-subtle` → `--slotted-border-strong` | — |
| miniatura | active | — | anel 2 px `--slotted-border-strong` | — |
| miniatura | current | `ring` do consumidor | imagem 1, anel interior 2 px `--slotted-text` | — |

## 5. Movimento

ReUI: o scroll é a física do Embla (`duration` 25, sem token); botões `transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1)`; pontos `all 500ms`. Movimento reduzido: a captura `--motion reduce` mantém as mesmas durações.

Slotted: o scroll é animado pelo motor com `--slotted-duration-long` (320 ms) e `--slotted-easing-standard`, lidos do estilo calculado do viewport, e colapsa para 1 ms com movimento reduzido; aos 150 ms o percurso vai em 708 de 830 px (medido no Chrome). Botões: `background-color`, `border-color`, `box-shadow`, `color`, `scale` em `--slotted-control-transition-duration`; a pressão entra em `--slotted-duration-instant`. Pontos: `inline-size` em `--slotted-duration-medium`. `fade`: entra em `--slotted-duration-long` com `--slotted-easing-enter`, sai em `--slotted-duration-medium` com `--slotted-easing-exit`. Tempo da rotação: animação linear de largura com a duração do próprio atraso, pausada por `data-paused`.

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| --- | --- | --- | --- | --- | --- | --- |
| Pontos | `c-carousel-11`, `review-5` | botões escritos pelo consumidor com `api.scrollTo` e `api.on('select')` | `CarouselIndicators` / `slCarouselIndicators` | estado e teclado da família, `tablist` com foco móvel | adotar | — |
| Miniaturas | `c-carousel-9`, `c-carousel-10`, `product-detail-1` | segunda instância de Embla sincronizada por `setApi` | `variant="thumbnails"` com função ou `ng-template` | uma instância, nada a sincronizar, faixa que mantém a atual à vista | adotar | — |
| Rotação | `c-carousel-5`, `review-5`, `review-6` | `plugins={[Autoplay({ delay })]}` | `autoplay` + `CarouselAutoplay` | controlo de rotação do APG, paragem por foco de teclado, pausa com o tempo restante | adotar | — |
| Vários por vista | `c-carousel-3`, `product-card-7` | `basis-1/3` no item | `slidesPerView` + páginas medidas | uma container query muda a vista e as páginas | adaptar | — |
| Vertical | `c-carousel-2` | `orientation="vertical"` | `orientation="vertical"` | coincidem | adotar | — |
| Centro e loop | `c-carousel-6` | `opts={{ align: 'center', loop: true }}` | `align="center"`, `loop` | loop sem clones | adaptar | — |
| Contador | `blog-3` | texto do consumidor | `CarouselCounter` | isolado em `ltr`, algarismos tabulares | adotar | — |
| Faixa de logótipos | `cta-7`, `cta-11` | animação contínua | — | — | recusar: movimento decorativo; composição em três linhas no desenho | — |

## 7. Superar

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| --- | --- | --- | --- | --- |
| Pixel grid | 28 | 34, 24, 64 | inteiros | espécime light 720 |
| Hover | fundo 1 → 0.97 L | delta em `next`, pontos e miniaturas | delta não vazio | espécimes light, dark, high-contrast |
| Press | igual ao hover mais 1 px | difere do hover em fundo, sombra e escala | difere | idem |
| Focus | 3 px a 50 % de alfa | 2 px sólido, offset 2 px; pontos com offset −2 px dentro da caixa de 24 | ≥ 2 px, 3:1 | idem |
| Transition | `all` | propriedades nomeadas, tokens | sem `all` | `carousel.css` |
| Motion | física sem token | scroll e `fade` em tokens, saída não mais longa que a entrada | tokens | §5 |
| Reduced motion | sem alteração | 0.001 s | colapsa | espécime `--motion reduce` |
| Disabled | `opacity: 0.5` | tinta e aresta do estado desativado | sem opacidade nua | `carousel.css` |
| Schemes | sem alto contraste | `high-contrast` e `forced-colors` lidos | o mesmo componente | capturas |
| Density e RTL | — | `dense` encolhe os controlos; RTL espelha trilho, setas e pontos | — | capturas |
| Target size | 28 e 8 | 34 e 20 × 24 a 24 de centro | § Target size | espécime |
| Intent | — | literais só nos documentados (`0.94`, `0.66`, `0.6`, `0.85`) | — | `carousel.css` |

## 8. Delta

| # | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | --- | --- | --- | --- |
| 1 | `packages/styles/src/carousel/carousel.css` | família nova com as medidas de §3 e a coreografia de §4 | §3, §4, §5 | `tools/harness/out/carousel.html`, espécimes `specimen/carousel/` |
| 2 | `specs/components/carousel/contract.json` (contrato) | anatomia, estados, `playback` | §2, §6 | `contract.test.mjs` |
