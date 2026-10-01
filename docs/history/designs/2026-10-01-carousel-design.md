# carousel — inventário e decisões

Estado: passos 3 a 13 do `/component` concluídos; gates registados em §10 e na autoavaliação. Invocação `/component carousel` e `/reui carousel` em modo `build`, com o pedido "carousel e coisas do tipo".

## Nome e âmbito

`docs/component-features.md` §14 descreve `Carousel` `[Specialized]`: slides, índice ativo, loop, autoplay opcional, controlos, indicadores, orientação e arrasto; pausa por interação, hover e foco; reduced motion; anterior e seguinte por teclado; conteúdo essencial nunca acessível só por swipe; autoplay nunca é omissão em produto operacional.

"Coisas do tipo" lê-se no campo como quatro composições do mesmo motor: o slideshow de um slide (banner, depoimento), o trilho de vários cartões por vista com paginação (produtos, artigos, KPIs), a galeria com miniaturas sincronizadas (detalhe de produto, anexos) e o slideshow que roda sozinho com barra de tempo (onboarding, novidades). As quatro são uma família, `carousel`, com um membro. O ReUI chega à mesma conclusão no sentido inverso: as miniaturas de `c-carousel-9` e `c-carousel-10` são duas instâncias de Embla sincronizadas pelo consumidor através de `setApi`.

`marquee` (faixa contínua de logótipos, ReUI `cta-7` e `cta-11`) fica fora: é movimento decorativo sem estado nem ação, que o rubric recusa (dimensão 2), e um produto operacional não o tem. Um consumidor que o queira escreve uma animação de `translate` sobre conteúdo duplicado com `aria-hidden`; nada nesta família o ajuda nem o impede.

## 1. Surveyed

| Implementação | Nome | Fonte | Forma |
| --- | --- | --- | --- |
| WAI-ARIA APG | Carousel (Slide Show or Image Rotator) | `https://www.w3.org/WAI/ARIA/apg/patterns/carousel/` | Contentor `region` ou `group` com `aria-roledescription="carousel"`; slides `group` com `aria-roledescription="slide"` e nome "3 of 10"; controlo de rotação, anterior, seguinte, seletor de slide como `tablist` na variante com separadores. |
| Zag / Ark UI / Chakra v3 | `carousel` | `https://zagjs.com/components/react/carousel` (1.44) | Scroll-snap nativo. `page`/`defaultPage`/`onPageChange`, `slidesPerPage`, `slidesPerMove` (`number \| 'auto'`), `loop`, `autoplay` (`boolean \| { delay }`, 4000 ms), `allowMouseDrag`, `spacing`, `padding`, `autoSize`, `inViewThreshold`, `translations`; partes `item-group`, `item`, `control`, `prev-trigger`, `next-trigger`, `indicator-group`, `indicator`, `autoplay-trigger`; `onDragStatusChange`, `onAutoplayStatusChange`. |
| Fluent UI v9 | `Carousel` | `https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-carousel` (`Carousel.types.ts`, `CarouselContext.types.ts`) | Embla. `activeIndex`/`defaultActiveIndex`/`onActiveIndexChange`, `align`, `circular`, `groupSize` (`number \| 'auto'`), `draggable`, `whitespace`, `motion` (`slide` / `fade`), `announcement`, `autoplayInterval`; `CarouselNav` com função por índice; `selectPageByElement` move a página quando o foco entra num cartão. |
| shadcn/ui e ReUI | `Carousel` | `https://ui.shadcn.com/docs/components/carousel`, `https://reui.io/r/c-carousel-{1..11}.json`, blocos Pro `review-5`, `product-card-7`, `blog-3`, `product-detail-1` | Embla com `opts` e `plugins`; partes `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`; pontos, miniaturas e contador escritos pelo consumidor com `setApi`. Demonstração viva com a melhor imagem do survey; espécimes em `tools/harness/out/specimen/{c-carousel-*,review-5,product-card-7,blog-3,product-detail-1}/`. |
| Splide 4 | `Splide` | `https://splidejs.com/guides/options/` | `type` (`slide` / `loop` / `fade`), `rewind`, `perPage`, `perMove`, `gap`, `padding`, `focus`, `autoplay`, `interval`, `pauseOnHover`, `pauseOnFocus`, `pagination`, `arrows`, `drag`, `live`, `i18n`, barra de progresso do autoplay, sincronização de miniaturas por `sync`. |
| CSS Overflow 5 (Chrome 135+) | `::scroll-button()`, `::scroll-marker`, `scroll-marker-group` | `https://developer.chrome.com/blog/carousels-with-css` | A resposta da plataforma: botões e marcadores gerados por CSS sobre um scroller com snap. Só no Chromium; o conteúdo dos botões e o nome acessível dos marcadores vêm de `content`. |
| Material 3 | Carousel | `https://m3.material.io/components/carousel/guidelines` | Layouts `multi-browse`, `uncontained`, `hero`, `full-screen`; itens que encolhem na borda. |

React Aria, Radix, Base UI, Angular CDK, Angular Material, Carbon e Primer não publicam carrossel.

## 2. Table stakes

| Capacidade | Quem publica | Veredicto | Razão |
| --- | --- | --- | --- |
| Anterior e seguinte | todos | `adopt` | Partes `previous` e `next`, `button` nativo, glifo `chevron-right` espelhado. |
| Indicadores por página | Zag, Fluent, Splide, ReUI (consumidor), APG | `adopt` | Parte `indicators` como `tablist` (APG, variante com separadores) e `indicator` como `tab` com foco móvel. |
| Índice ativo controlado e não controlado | Zag `page`, Fluent `activeIndex` | `adopt` | `page` / `defaultPage` / `onPageChange` com razão. |
| Vários slides por vista | Zag `slidesPerPage`, Fluent `groupSize`, Splide `perPage`, shadcn `basis-1/3` | `adapt` | `slidesPerView` escreve `--slotted-carousel-slides-per-view`; a largura de um slide fica em CSS, por isso uma container query do consumidor muda-a sem script. As páginas medem-se do DOM, não se calculam do número. |
| Avanço por grupo | Zag `slidesPerMove`, Fluent `groupSize`, Splide `perMove` | `adopt` | `slidesPerMove`: número ou `page` (omissão: os slides inteiramente visíveis). |
| Loop | Zag, Fluent `circular`, Splide `loop`/`rewind`, Embla | `adapt` | `loop` liga as pontas da navegação: seguinte na última página vai à primeira. Não há clones: o movimento atravessa as páginas de volta, como o `rewind` do Splide. Custo escrito em §6. |
| Autoplay com pausa | Zag, Fluent, Splide, shadcn (plugin), APG | `adopt` | `autoplay` (número de ms ou `true`, 5000 ms); hover e documento escondido pausam; foco por teclado para; o controlo de rotação é o primeiro da sequência. |
| Controlo de rotação | APG, Zag `autoplay-trigger`, Splide | `adopt` | Parte `autoplay`: o nome muda entre "Parar" e "Retomar", sem `aria-pressed`, como o APG pede. |
| Orientação vertical | Zag, shadcn, ReUI `c-carousel-2` | `adopt` | `orientation="vertical"`. |
| Espaço entre slides | Zag `spacing`, Splide `gap`, ReUI `c-carousel-7` | `adapt` | `--slotted-carousel-gap`, token, não prop. |
| Espreitar os vizinhos | Zag `padding`, Splide `padding`, M3 `uncontained` | `adapt` | `--slotted-carousel-peek`, padding e scroll-padding do viewport. |
| Alinhamento ao centro | Fluent `align`, Embla `align`, ReUI `c-carousel-6` | `adopt` | `align="start" \| "center"`. |
| Arrasto com rato | Zag `allowMouseDrag`, Fluent `draggable`, Embla, Splide `drag` | `adopt` | `draggable` (omissão `true`). Toque e trackpad são do scroller nativo. |
| Transição por fade | Fluent `motion="fade"`, Splide `type: 'fade'` | `adopt` | `transition="fade"`: slides empilhados, sem scroller, swipe por ponteiro. |
| Mensagens localizadas | Zag `translations`, Splide `i18n`, Fluent `announcement` | `adopt` | `messages` com `{page}`, `{count}`, por instância e por provider. |
| Anúncio da mudança | APG (live region), Splide `live`, Fluent `announcement` | `adapt` | `@slotted/core/live-announcer`, educado, só quando o leitor muda a página; nada durante a rotação. |
| Miniaturas | ReUI `c-carousel-9`/`10` e `product-detail-1`, Splide `sync` | `adapt` | `indicators` com `variant="thumbnails"`: o conteúdo de cada `indicator` é do consumidor; a faixa rola sozinha para manter a atual à vista. Uma instância, nenhuma sincronização. |
| Estado dos slides visíveis | Zag `inViewThreshold`, Fluent | `adopt` | `data-inview` por slide; os que não estão à vista ficam `inert`. |
| Contador "3 / 8" | ReUI `blog-3` (consumidor), Zag `progressText` | `adopt` | Parte `counter`. |

## 3. Differentiators

| Capacidade | Onde existe | Forma Slotted |
| --- | --- | --- |
| Barra de tempo dentro do indicador atual | Splide (barra separada), ReUI `review-5` não tem | O indicador atual enche durante o atraso do autoplay e congela quando a rotação pausa; o leitor vê quanto falta sem um segundo elemento. |
| Indicadores em linha segmentada | ReUI `blog-3` (linha de 1 px, consumidor) | `variant="line"`: segmentos iguais que ocupam a largura, com o mesmo enchimento temporal. |
| Pontos que se adaptam a muitas páginas | Swiper `dynamicBullets` | A partir de oito páginas, os pontos a mais de dois passos encolhem e os de fora da janela recolhem-se; continuam no anel do teclado. |
| Clique num slide que espreita traz a página | M3 | O slide `inert` deixa o clique ao viewport, que lê o slide sob o ponteiro e pede a página com razão `pointer`. |
| Páginas medidas, não declaradas | nenhuma (todas pedem `slidesPerPage` em número) | Uma container query do consumidor muda quantos slides cabem; a família lê as posições e refaz as páginas e os pontos. |
| Três esquemas, três densidades, RTL lógico, dois bindings, defaults por aplicação | nenhuma publica os cinco | Tokens da fundação; `CarouselDefaultsProvider` e `provideCarouselDefaults()`. |

## 4. Gaps

| Caso | Resposta |
| --- | --- |
| Nenhum slide | Sem páginas: anterior, seguinte e indicadores ficam `aria-disabled`, o contador diz `0 / 0`; o estado vazio é composição com `result-state` dentro do viewport. |
| Um slide | Uma página: os controlos ficam desativados e a rotação não arranca. |
| Cem slides | Pontos adaptativos (§3); o contador é a leitura completa. |
| A carregar | Slides com `skeleton` com a mesma anatomia (skill `loading-states`); o viewport mantém a altura. |
| Imagem que falha | Composição com `image` e o seu `fallback`. |
| Slides de alturas diferentes | O viewport toma a altura do mais alto e os slides esticam até ela, por isso uma fila de cartões fica alinhada pela base. |
| Redimensionar com a página a meio | A página mantém-se; se deixa de existir, o pedido sai com razão `resize`. |
| Rotação com movimento reduzido | Não arranca; o controlo de rotação mostra "Retomar". |
| Separador do browser escondido | A rotação pausa e retoma com o tempo que faltava. |
| Arrastar sobre um link | O clique depois do arrasto é cancelado. |

## 5. Padrão

APG Carousel, `https://www.w3.org/WAI/ARIA/apg/patterns/carousel/`, com a variante de separadores para os indicadores.

| Requisito do APG | Resposta | Evidência prevista |
| --- | --- | --- |
| Rotação para quando um elemento recebe foco por teclado e só retoma pelo controlo | `onPlayingChange(false, 'keyboard')` no primeiro `focusin` com `:focus-visible` | testes React e Angular |
| Tab e Shift+Tab seguem a sequência da página | nenhum script para Tab | — |
| Botões não movem o foco | anterior e seguinte ficam com `aria-disabled` nas pontas, nunca `disabled`, para o foco não cair no `body` | testes |
| Controlo de rotação primeiro na sequência | a omissão da composição o põe primeiro; a página de referência di-lo | stories |
| Seletor com separadores segue o padrão Tabs | `createRovingTabindex` de `@slotted/core/focus`, ativação automática, sem volta nas pontas | testes |
| Contentor `region` ou `group`, `aria-roledescription="carousel"`, nome sem a palavra | `section` com `aria-label` ou `aria-labelledby` do consumidor | testes |
| Rotação: nome muda com a ação, sem `aria-pressed` | `messages.stop` / `messages.start` | testes |
| Slide: `group`, `aria-roledescription="slide"`, nome "3 de 10" | `messages.slide`; um `aria-label` do consumidor vence | testes |
| Slides fora de vista escondidos do leitor de ecrã | `inert` nos slides fora de vista | testes |
| Live region educada quando não roda | `live-announcer` a cada mudança pedida pelo leitor | testes |

Partida deliberada: os slides ficam `group` e não `tabpanel` quando há indicadores, porque uma página pode ter vários slides e um `tab` controla a página. O `tab` aponta com `aria-controls` para o primeiro slide da página. Custo: um leitor de ecrã não anuncia a relação separador-painel; o nome do slide já diz a posição.

Teclado do viewport (foco próprio, `tabindex="0"`): setas do eixo e `PageUp`/`PageDown` movem uma página, `Home`/`End` vão às pontas, espelhadas em RTL. Uma tecla repetida (`event.repeat`) não anima.

## 6. Anatomia

| Parte | Elemento | Sempre | Para quê |
| --- | --- | --- | --- |
| `root` | `section` | sim | Nome, eixos, `data-playing`, `data-paused`, `data-dragging`. |
| `viewport` | `div` | sim | Scroller com snap (ou pilha em `fade`); foco próprio e teclado. |
| `slide` | `div` | sim | `group` com nome; `data-current`, `data-inview`, `data-snap`, `inert` fora de vista. |
| `previous`, `next` | `button` | não | Inseridos no `root` sobrepõem-se às pontas do viewport (`arrows="inset"`) ou ficam fora dele (`arrows="outside"`); dentro de `controls` alinham-se na barra. |
| `controls` | `div` | não | Barra por baixo (`placement="below"`) ou sobre a imagem (`placement="overlay"`). |
| `autoplay` | `button` | não | Controlo de rotação, `pause` / `play`. |
| `indicators` | `div` `tablist` | não | `variant` `dots`, `line` ou `thumbnails`. |
| `indicator` | `button` `tab` | não | Uma página; o conteúdo é da família (ponto, segmento) ou do consumidor (miniatura). |
| `counter` | `span` | não | "3 / 8" em algarismos tabulares, `aria-hidden` porque o nome dos slides e o anúncio já dizem a posição. |

Loop sem clones: a última página volta à primeira atravessando o trilho. Clones duplicam o conteúdo do consumidor no DOM — `id`, foco, formulários, estado de componentes — e tornam o índice uma ficção. Custo: com `loop` num trilho longo, o salto de volta percorre-o em `--slotted-duration-long`; em `fade` não há percurso.

## 7. Estado

| Valor | Controlado | Não controlado | Pedido | Razões |
| --- | --- | --- | --- | --- |
| página atual | `page` | `defaultPage` (0) | `onPageChange(page, request)` | `pointer`, `keyboard`, `scroll`, `timeout`, `resize`, `programmatic` |
| rotação | `playing` | `defaultPlaying` (`true` com `autoplay`, `false` com movimento reduzido) | `onPlayingChange(playing, request)` | `pointer`, `keyboard`, `scroll`, `timeout`, `programmatic` |

`scroll` é um swipe, um trackpad ou uma roda; `pointer` é um botão, um indicador, um arrasto com rato ou um clique num slide que espreita; `timeout` é o avanço da rotação e a rotação que termina na última página sem `loop`. Um pedido recusado em modo controlado devolve o viewport à página do consumidor.

A rotação precisava de uma palavra no vocabulário: `playback` entra em `KNOWN_CAPABILITIES` e `MUTABLE_CAPABILITIES` de `specs/contract.schema.mjs`, num commit próprio. `media-player` lê a mesma palavra.

Estados de ecrã: `data-current` (slide da página atual e indicador atual), `data-disabled` (anterior e seguinte nas pontas), `data-dragging` (raiz durante um arrasto com rato), e os atributos da família `data-playing`, `data-paused` (hover, documento escondido), `data-inview`.

## 8. Integração

### React

| Pergunta | Resposta |
| --- | --- |
| Par controlado e não controlado com razão | `page`/`defaultPage`/`onPageChange`, `playing`/`defaultPlaying`/`onPlayingChange`, com `createControllable`. |
| Defaults uma vez | `CarouselDefaultsProvider` e `useCarouselDefaults`. |
| Substituir o elemento de cada parte | `render` em todas as partes. |
| Handler do consumidor corre | `onClick`, `onKeyDown`, `onPointerDown`, `onFocus` compostos. |
| Elemento nativo e ação imperativa | `ref` em cada parte; `handleRef` com `scrollTo(page)`, `scrollToSlide(index)`, `refresh()`. |
| SSR sem diferença de hidratação | `useId`; nenhuma medida no render; o movimento reduzido lê-se num efeito. |
| Estados no DOM | `data-*` do contrato. |
| Tipos de props nativos | `ComponentPropsWithRef<'section' \| 'div' \| 'button' \| 'span'>`. |

### Angular

| Pergunta | Resposta |
| --- | --- |
| Valor de duas vias | `page = model()`, `playing = model()`, `pageChange`/`playingChange` com o pedido em `pageRequest`/`playingRequest` (`output()`). |
| Forms | Não: o carrossel não submete valor. |
| Defaults uma vez | `CAROUSEL_DEFAULTS` e `provideCarouselDefaults()`. |
| Instância no template | `exportAs: 'slCarousel'`. |
| Conteúdo projetado e preguiçoso | slides projetados; miniatura por `<ng-template slCarouselIndicatorTemplate let-page>`. |
| Zoneless e `OnPush` | signals; o motor escreve por callbacks em signals. |
| Teardown | `DestroyRef` destrói motor, rotação e roving. |
| Atributo estático do consumidor | `aria-label` de um slide lido por `HostAttributeToken`. |
| Entry point | `@slotted/angular/carousel`. |

Assimetria: nenhuma além dos idiomas.

## 9. Motor

`@slotted/core/carousel` contém o que os dois bindings fariam igual: as posições de snap medidas, a página mais próxima, o passo com e sem loop, a tecla para intenção, os slides à vista, o scroll numa mola criticamente amortecida com a rigidez lida da duração longa do tema, o arrasto com rato com resistência elástica nas pontas, o swipe de `fade` e o relógio da rotação com pausas por motivo. A mola substituiu uma curva `standard` no passe ReUI de movimento (`2026-10-01-carousel-motion-reui-dossier.md`). Os bindings são donos do estado e dos atributos.

## 10. Gate visual (passo 9)

O utilizador pediu execução autónoma sem gates humanos; a decisão fica registada aqui.

Harness `tools/harness/out/carousel.html`, onze cenas (`slideshow`, `rail`, `gallery`, `autoplay`, `paused`, `fade`, `center`, `vertical`, `adaptive`, `sizes`, `empty`). Capturas lidas: light, dark e high-contrast a 420; light a 240 e 720; dense; rtl; foco no indicador atual (light, `fade`), na miniatura atual (dark, `gallery`) e no seguinte (light, `slideshow`). Espécimes em `tools/harness/out/specimen/carousel/`.

Correções feitas a partir das imagens: pontos a 24 px centro a centro (o intervalo era 22); controlos dentro da pílula sobreposta sem moldura própria, à altura `--slotted-control-inner-size-*`; contador isolado em `ltr` (o RTL lia "5 / 1"); setas verticais sem espelho em RTL (o espelho antes da rotação invertia-as); `--slotted-carousel-slide-min-size` para um trilho de três por vista não descer a cartões de 64 px a 240 px; enchimento do tempo a partir de um ponto, não de um traço de 1 px; anel das miniaturas com delta próprio de hover e pressão.

Custo de uma correção depois deste ponto: a anatomia (partes, `controls` com `placement`, `indicators` com `variant`) é a que os dois bindings escrevem; mudar uma parte custa os dois bindings, as duas páginas e os testes.
