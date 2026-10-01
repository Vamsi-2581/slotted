# carousel — autoavaliação

Desenho e inventário em `2026-10-01-carousel-design.md`; medidas ReUI em `2026-10-01-carousel-reui-dossier.md`. Os dois gates foram registados sem espera, a pedido do utilizador (execução autónoma).

## Onze dimensões

| Dimensão | Evidência | Mudança que mais melhoraria | Feita |
| --- | --- | --- | --- |
| Icons | `chevron-right` (mirrored pelo `Icon directional`, rodado 180° em `previous` e ±90° em vertical), `pause` e `play` como `Glyph`; nenhum ícone pintado em CSS (`glyph-element.test.mjs`). Captura RTL vertical. | As setas verticais em RTL apontavam ao contrário (espelho antes da rotação). | Sim: `scale: none` nas setas verticais sob `:dir(rtl)`. |
| Motion | Scroll em `--slotted-duration-long` e `--slotted-easing-standard` (708 de 830 px aos 150 ms, Chrome); `fade` com entrada `enter`/long e saída `exit`/medium; tecla repetida sem animação; pressão em `instant`. | Uma mudança de `prefers-reduced-motion` com a página aberta não é ouvida pela rotação; só o arranque a lê. | Não: o movimento do scroll já colapsa pelo token em tempo real; a rotação lida no arranque basta para WCAG 2.2.2, porque o controlo de rotação está sempre presente. |
| Responsiveness | `--slotted-carousel-slide-min-size` dá um piso ao cartão; a barra quebra linha; capturas a 240, 420, 720; `audit.mjs` limpo a 1280 e 620 nas duas páginas. | A barra quebrava em overflow numa coluna de 200 px (achado do `audit.mjs`). | Sim: `flex-wrap: wrap`. |
| Refinement | Pontos a 24 px de centro (eram 22); controlos dentro da pílula sem moldura própria; tempo a encher a partir de um ponto; contador isolado em `ltr`. | O enchimento começava como um traço de 1 px. | Sim. |
| Tokens | `carousel.tokens.json` gerado da folha; nenhum literal de tempo; duas propriedades de runtime registadas; literais `0.94`, `0.66`, `0.6`, `0.85` documentados junto da regra. | Os quatro literais de escala e opacidade não têm escala na fundação. | Não: nenhuma outra família os lê; abrir uma escala para um uso é o que a fundação recusa. |
| Patterns | APG Carousel item a item em §5 do desenho; seletor como Tabs; nome e papel localizados. | Os slides ficam `group` com indicadores (partida escrita e custo). | Registado, não alterado. |
| Accessibility | `inert` fora de vista, anúncio único do pedido do leitor, `aria-disabled` nas pontas com foco preservado, rotação pára por foco de teclado; testes nos dois bindings. | O nome do viewport ("Slides") repete-se em cada carrossel da página. | Não: mensagem configurável por instância e por provider. |
| Native API | Partes com tipos nativos (`ComponentPropsWithRef`), `render` em todas, handlers compostos; Angular `input`/`output`, `HostAttributeToken` para `aria-label`. | As props de `render` usam `as never` no React. | Não: o mesmo padrão das outras famílias; tipar `ref` nas props de `render` é uma mudança do workbench. |
| Capability | Inventário completo; `slidesPerMove`, pontos adaptativos, miniaturas, `fade`, loop sem clones, clique no vizinho. | Clones para um loop visual infinito. | Recusado com razão escrita (`declined.clones`). |
| Ecosystem integration | `CarouselDefaultsProvider` / `provideCarouselDefaults()`, `handleRef` / `exportAs`, `[(page)]` e `[(playing)]`, `ng-template` para miniaturas. | — | — |
| Documentation | Dezassete cenas por binding, lidas renderizadas a 1280 (light) e 720 (dark) React, 1280 Angular; snippets formatados; quatro defeitos de página corrigidos (piso estreito, esqueleto circular, vazio a contar 1/1, segmento Angular). | O contador do cenário vazio mostrava `1 / 1` porque o estado vazio era um slide. | Sim: o `ResultState` fica no viewport fora de um slide. |

## Barra de craft

| Critério | Número | Fonte |
| --- | --- | --- |
| Pixel grid | controlos 30/34/38, indicador 24, miniatura 64, pílula 32 | espécime light 720 |
| Hover | `next` `#ffffff` → `#f1f5f9`; ponto `#78899c` → `#5b6b7f`; miniatura anel subtle → strong | espécimes light, dark, high-contrast |
| Press | `next` `#e2e8f0` + `scale 0.94` + sombra `none` (difere do hover) | idem |
| Focus | 2 px `#2563eb` light, `#60a5fa` dark, preto em high-contrast; offset 2 px, −2 px nos pontos | idem |
| Transition | sem `all`; propriedades nomeadas em tokens | `carousel.css` |
| Motion | entrada long/enter, saída medium/exit em `fade`; scroll long/standard | §5 do dossiê |
| Reduced motion | 0.001 s em todas as transições; o tempo da rotação não arranca | espécime `--motion reduce` |
| Disabled | tinta `--slotted-disabled-foreground`, aresta `--slotted-disabled-border`, sem opacidade | `carousel.css` |
| Schemes | high-contrast e `forced-colors` lidos: marca atual no destaque, repouso na linha | espécime `--forced-colors active`, captura high-contrast |
| Density e RTL | dense: controlos 26/24; RTL espelha trilho, setas, pontos e enchimento | capturas `dense`, `rtl` |
| Target size | 34 e 20 × 24 com centros a 24 | espécime |
| Intent | cada literal com a razão ao lado | `carousel.css` |

## Secção 18

1. Propósito: mostrar uma coleção uma página de cada vez — banner, trilho de cartões, galeria. Antiuso: conteúdo essencial que o leitor tem de ver todo (lista ou grelha); rotação num ecrã operacional.
2. Anatomia: dez partes estáveis (`root`, `viewport`, `slide`, `previous`, `next`, `controls`, `autoplay`, `indicators`, `indicator`, `counter`).
3. Estado: `page` e `playing`, cada um controlado e não controlado, pedidos com razão e cancelamento; a razão de controlar a página é o URL ou o detalhe de produto que a escolhe.
4. Estados: `current`, `disabled`, `dragging`, `data-playing`, `data-paused`, `data-inview`; `disabled` vence hover e pressão.
5. Teclado, foco, ARIA, toque e leitor de ecrã: §5 do desenho; testes React (24) e Angular (16); cenário no Chrome (7 verificações, os dois bindings).
6. Size e densidade por tokens; variantes por eixo de parte.
7. Responsivo pelo piso do slide e pela barra que quebra; RTL lógico; locale nas mensagens e no contador; movimento reduzido.
8. Vazio, carregamento e conteúdo extremo: cenas `empty` e `content`; cem slides pelos pontos adaptativos.
9. SSR: nada medido no render; snap nativo funciona antes da hidratação; o motor mede depois.
10. Exemplos básicos, composição em página de produto, casos-limite e theming nas duas páginas.
11. Testes de comportamento equivalentes nos dois bindings.
12. Família nova: nenhuma migração.

## Verificação

- `node --test specs/components/carousel/*.test.mjs`: 17/17.
- `packages/core` `vitest`: 2078/2078 (21 da família).
- `packages/react` `vitest src/carousel`: 24/24; suíte completa com 4 falhas em `date-picker`, `dialog` e `table`, reproduzidas isoladas e fora desta família.
- Angular `ng test --include carousel`: 16/16; `ng build` constrói `@slotted/angular/carousel`; `entry-points.source.test.mjs` falha em `context-menu`, fora desta família.
- `pnpm typecheck`, `test:contracts`, `test:package-layers`, `test:release`, `test:docs`: verdes. `eslint` nos ficheiros da família: verde; o `eslint .` completo falha em `message-demo.tsx`, fora desta família.
- `packages/styles`: os testes da família passam; `field-surface` (`kbd`) e o teste da marca (`cascader`) falham fora desta família.
