# Dossiê ReUI — navigation-menu

## 0. Cabeçalho

- Família: `navigation-menu`
- Modo: `build` (família nova)
- Data: 2026-10-01
- HEAD: `6ff5651c` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/specimen/{c-navigation-menu-1,c-navigation-menu-2,c-navigation-menu-3,c-navigation-menu-4,navbar-12}/` e `tools/harness/out/specimen/navigation-menu/`
- Fontes: `tools/harness/out/specimen/reui-c-navigation-menu-{1..4}.json` (MIT) e `shadcn-base-nova-navigation-menu.json` (primitivo shadcn/ui sobre Base UI; `https://reui.io/r/navigation-menu.json` responde 404)

## 1. Seleção

Cobertura: `direta`. O ReUI publica 4 exemplos `c-navigation-menu-*` sobre o primitivo `navigation-menu` do shadcn/ui; um bloco Pro compõe a família.

Termos pesquisados em `llms-full.txt` (2188 linhas): `navigation-menu` 4, `Navigation Menu` 5, `NavigationMenu` 1, `mega` 1, `navbar` 16, `flyout` 0.

| Item                 | Tipo         | Rota                                        | Parte ou interação Slotted que informa                         | Capturas                                                                      |
| -------------------- | ------------ | ------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `navigation-menu`    | Primitivo    | fonte `shadcn-base-nova-navigation-menu.json` | anatomia, viewport, movimento entre secções                    | fonte                                                                         |
| `c-navigation-menu-1` | Free example | `/preview/base/example/c-navigation-menu-1` | `trigger`, `link` do topo                                      | `*-{light,dark}-1280-data-slot-navigation-men-9af888.json`, `-motion-reduce`  |
| `c-navigation-menu-2` | Free example | `/preview/base/example/c-navigation-menu-2` | `links` em duas colunas, `label`, `description`                | `*-light-1280-click-*-5f4086.json`                                            |
| `c-navigation-menu-3` | Free example | `/preview/base/example/c-navigation-menu-3` | `icon` num link de painel                                      | `*-light-1280-click-*-5f4086.json`                                            |
| `c-navigation-menu-4` | Free example | `/preview/base/example/c-navigation-menu-4` | link rico, `footer`, `viewport`                                | `*-light-1280-click-*-93e80f.json` (estados), `*-dark-*-0-rest.png`           |
| `navbar-12`          | Pro block    | `/preview/base/navbar-12`                   | a família numa barra de marketing, ao lado de marca e chamada  | `navbar-12-{light,dark}-1280.json`, `-light-1280-click-*-5f4086.json`         |

Um único bloco Pro compõe a família; a seleção mínima de dois não é alcançável. A captura de estados do link de painel em `dark` falha duas vezes com `element 0 left the page`: o hover forçado do specimen move o ponteiro e o Base UI fecha o painel. A linha de `light` mede os mesmos tokens.

Estilo `nova` em todos os itens.

## 2. Anatomia

| `data-slot` ReUI            | Parte Slotted                                      | Estado                                                                              |
| --------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `navigation-menu` (`nav`)   | `root`                                             | igual                                                                               |
| `navigation-menu-list`      | `list`                                             | igual                                                                               |
| `navigation-menu-item`      | `item`                                             | igual                                                                               |
| `navigation-menu-trigger`   | `trigger` + `indicator`                            | igual; o chevron é parte nomeada no Slotted                                         |
| `navigation-menu-link`      | `link`                                             | igual                                                                               |
| `navigation-menu-content`   | `content`                                          | igual; no Slotted fica no `li`, no ReUI é portado para o viewport                   |
| Popup + Viewport (sem slot) | `viewport`                                         | igual                                                                               |
| `navigation-menu-indicator` | `arrow`                                            | igual; o ReUI exporta-o e não o usa em nenhum item capturado                        |
| —                           | `links`, `group`, `group-label`, `icon`, `label`, `description`, `footer` | só no Slotted; no ReUI são `ul`, `div` e classes do consumidor        |

## 3. Medidas

Largura: ReUI 1280, Slotted 720. Densidade confortável, esquema claro. Nenhuma propriedade da tabela depende da largura.

| Parte                 | Propriedade          | ReUI                         | Slotted hoje                         | Alvo                                                  | Veredicto                                                                                          |
| --------------------- | -------------------- | ---------------------------- | ------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| trigger               | altura               | 36                           | 34                                   | `--slotted-control-height-md`                         | recusar: a barra e um campo ao lado têm a altura da escala de controlo                             |
| trigger               | padding em linha     | 10                           | 13                                   | `--slotted-control-padding-inline-md`                 | recusar: mesma razão                                                                               |
| trigger               | font-size / peso     | 14 / 500                     | 13 / 500                             | `--slotted-control-font-size-md`, `--slotted-font-weight-medium` | adaptar: o peso coincide; o tamanho é o do tema                                         |
| trigger               | raio                 | 10                           | 4                                    | `--slotted-control-radius`                            | recusar: 10 não tem passo; o raio de controlo é o de `top-navigation`                              |
| trigger               | gap rótulo–chevron   | `ml-1` 4                     | 6 − 4 de margem final                | `--slotted-control-gap-sm`                            | adaptar                                                                                            |
| indicator             | tamanho              | 12                           | 16                                   | `--slotted-control-icon-size-md`                      | recusar: a escala de glifo do controlo                                                             |
| viewport              | distância à barra    | 8 (`sideOffset`)             | 4                                    | `--slotted-space-2`                                   | adaptar: o passo de `menu`; ponte transparente cobre o intervalo                                   |
| viewport              | raio                 | 10                           | 8                                    | `--slotted-radius-lg`                                 | adaptar: 10 não tem passo                                                                          |
| viewport              | borda                | `ring-1` foreground/10       | 1 `--slotted-border-subtle`          | `--slotted-border-subtle`                             | adotar o papel                                                                                     |
| content               | inset                | 4                            | 4                                    | `--slotted-space-2`                                   | adotar                                                                                             |
| link de painel (rico) | altura               | 56,5 (c-4), 54,33 (navbar-12) | 56                                  | `--slotted-space-4` × 2 + 20 + 2 + 18                 | superar: linhas em píxel inteiro                                                                   |
| link de painel (rico) | padding              | 12                           | 8 bloco, 8 linha                     | `--slotted-space-4`; linha = padding de controlo − borda − inset | adaptar: o texto do painel começa na coluna do rótulo do gatilho                         |
| link de painel        | gap ícone–texto      | 8                            | 8                                    | `--slotted-control-gap-md`                            | adotar                                                                                             |
| link de painel        | raio                 | 8                            | 4                                    | `--slotted-control-radius`                            | adaptar                                                                                            |
| links                 | gap entre células    | 4 (`gap-1`)                  | 4                                    | `--slotted-space-2`                                   | adotar                                                                                             |
| links                 | largura de coluna    | 248                          | 240                                  | `--slotted-navigation-menu-column-size` 15rem         | adaptar                                                                                            |

## 4. Coreografia de estados

| Parte          | Estado        | Delta ReUI                                                                 | Delta Slotted hoje                                                                 | Alvo                       |
| -------------- | ------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------- |
| trigger        | hover         | `background-color` transparente → `oklch(0.97 0 0)`                        | transparente → `rgb(241 245 249)` (`--slotted-tone-secondary-subtle-hover`)        | atingido                   |
| trigger        | active        | igual ao hover                                                             | transparente → `rgb(226 232 240)` (`-subtle-active`)                               | atingido (superar)         |
| trigger        | focus-visible | fundo de hover + anel 3 px `oklab(0.708 0 0 / 0.5)` + outline 1 px         | outline 2 px `rgb(37 99 235)`, offset 2                                            | atingido (superar)         |
| trigger        | open          | `bg-muted/50`                                                              | chão de hover mantido; chevron meia volta                                          | atingido                   |
| link de painel | hover         | transparente → `oklch(0.97 0 0)`                                           | transparente → `rgb(241 245 249)`                                                  | atingido                   |
| link de painel | active        | igual ao hover                                                             | → `rgb(226 232 240)`                                                               | atingido (superar)         |
| link de painel | focus-visible | anel 0 px (`focus:ring-0` no conteúdo)                                     | outline 2 px `rgb(37 99 235)`, offset 0                                            | atingido (superar)         |
| link           | current       | `data-active:bg-muted/50`                                                  | `--slotted-tone-accent-surface` + tinta `-accent-text` + `--slotted-current-edge`  | atingido                   |
| trigger        | current       | ausente                                                                    | tinta `--slotted-tone-accent-text`                                                 | só no Slotted              |
| trigger, link  | disabled      | `opacity: 0.5`                                                             | `--slotted-disabled-foreground`, cursor `not-allowed`                              | atingido (superar)         |

## 5. Movimento

| Transição                 | ReUI                                                                                   | Slotted                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| popup entra               | `opacity` 0→1, `scale` 0.9→1, 350 ms `cubic-bezier(0.22,1,0.36,1)`                     | keyframe `opacity` + `translate` 0 −4 px, `--slotted-duration-medium`, `--slotted-easing-enter` (R7) |
| popup sai                 | `opacity`, `scale` 0.9, 150 ms                                                          | `opacity`, `translate`, `--slotted-duration-short`, `--slotted-easing-exit`                          |
| troca de secção           | popup `width`/`height` 350 ms; conteúdo `translate` ±50 % + `opacity`                   | geometria registada (`@property`) transitada na raiz, `medium`/`standard`; conteúdo ±16 px + fade, entrada `medium`/`enter`, saída `short`/`exit`; painel recortado à caixa do balão |
| posição do popup          | `top`/`left` 350 ms                                                                     | parte da mesma interpolação                                                                           |
| chevron                   | `rotate` 300 ms Tailwind                                                                | `rotate` `medium`/`standard`                                                                          |
| hover                     | `all` 150 ms                                                                            | `background-color`, `color`, `--slotted-control-transition-*`; press `instant`                       |
| movimento reduzido        | durações mantidas (0,15 s em `-motion-reduce.json`)                                     | durações colapsam a 1 ms; deslocações retiradas, fades mantidos                                       |

## 6. Capacidades

| Capacidade                     | Onde aparece no ReUI     | Forma no ReUI                                   | Forma no Slotted                                                   | Em que a forma Slotted é melhor                                   | Veredicto |
| ------------------------------ | ------------------------ | ----------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- | --------- |
| Link rico (ícone, título, descrição) | c-2, c-4, navbar-12 | `div` e classes do consumidor dentro do `Link`  | partes `icon`, `label`, `description`                              | alinhamento do ícone ao texto e clamp de duas linhas pela família | adotar    |
| Grelha de colunas              | c-2, c-4                 | `ul` com `grid-cols-2` e `w-[500px]`            | `data-columns` no `content`, contentor de consulta                 | cai para uma coluna abaixo de 480 px sem consulta de viewport     | adaptar   |
| Rodapé com chamada             | c-4                      | `div` + `Button` do consumidor                  | parte `footer` com régua                                           | alinhamento à coluna dos links                                    | adotar    |
| Viewport partilhado            | primitivo                | conteúdo portado para o Popup                   | conteúdo no `li`, superfície partilhada                            | ordem de Tab do APG sem sentinelas                                | adaptar   |
| Indicador                      | primitivo (não usado)    | `NavigationMenuIndicator`                       | `arrow` na aresta do viewport                                      | segue o gatilho dentro da mesma interpolação                      | adaptar   |
| Alinhamento do popup           | primitivo (`align`)      | `align` no Root                                 | início do gatilho, deslocado até caber                             | o texto do painel começa na coluna do rótulo                      | adaptar   |

## 7. Superar

| Critério         | ReUI                                                         | Slotted hoje                                                         | Alvo           | Fonte                                                    |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- | -------------- | -------------------------------------------------------- |
| Pixel grid       | falha: link rico 56,5 (c-4)                                  | passa: trigger 34, link 56/34, viewport e content inteiros           | passa          | `slotted-light-720-data-part-trigger-52db46.json`        |
| Hover            | passa                                                        | passa: `rgb(241 245 249)`                                            | passa          | specimens de estados                                     |
| Press            | falha: active = hover                                        | passa: `rgb(226 232 240)` ≠ hover                                    | passa          | idem                                                     |
| Focus            | falha: anel `oklab(0.708 0 0 / 0.5)` sobre branco, abaixo de 3:1 | passa: 2 px, `#2563eb` 5,17:1 em light, `#60a5fa` em dark, preto em high-contrast | passa | idem                                                |
| Transition       | falha: `transition-property: all`                            | passa: `background-color, color`                                     | passa          | idem                                                     |
| Motion           | passa parcial: entrada e saída com a mesma curva             | passa: enter/exit em tokens, saída mais curta                        | passa          | `navigation-menu.css`                                    |
| Reduced motion   | falha: 0,15 s mantidos                                       | passa: 1 ms                                                          | passa          | `slotted-light-720-motion-reduce.json`                   |
| Disabled         | falha: `opacity: 0.5`                                        | passa: `--slotted-disabled-foreground`                               | passa          | `navigation-menu.css`                                    |
| Schemes          | sem high-contrast nem forced-colors                          | passa: borda preta em high-contrast; `ButtonBorder`/`CanvasText` em forced | passa    | `slotted-light-720-forced.json`, captura high-contrast   |
| Density and RTL  | sem densidade                                                | passa: 30/34/38 por tamanho, densa pela escala; rtl espelha painel e seta | passa     | capturas dense e rtl                                     |
| Target size      | passa: 36                                                    | passa: 34 (≥ 24), 44 em ponteiro grosso pelo tema                    | passa          | specimen                                                 |
| Intent           | —                                                            | passa: literais `15rem`, `10rem`, `11rem` com razão escrita          | passa          | `navigation-menu.css`                                    |

## 8. Delta

Família nova: o delta é a folha inteira, escrita no passo 7 de `/component`. As linhas abaixo registam as correções feitas depois da primeira captura.

| #   | Ficheiro                                       | Mudança                                                                                   | Linhas do dossiê que resolve | Captura que o prova                                     |
| --- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------- |
| 1   | `navigation-menu.css`                          | regra base do topo em `:where()`; corrente e desativado vencem                            | 4 (current, disabled)        | `navigation-menu-light-comfortable-ltr-420.png`, cena `states` |
| 2   | `navigation-menu.css`                          | consulta de contentor com o seletor completo; grupos em `auto-fit`                        | 6 (grelha)                   | cena `groups` a 420                                     |
| 3   | `navigation-menu.css`, `@slotted/core/navigation-menu` | `data-placement="below"` numa coluna sem espaço                                | 5                            | `navigation-menu-vertical-light-comfortable-ltr-240.png` |
| 4   | `navigation-menu.css`                          | geometria registada e transitada na raiz; painel recortado ao balão                       | 5 (troca de secção)          | `tools/harness/scenarios/navigation-menu-switch.mjs`    |
| 5   | `navigation-menu.css`                          | divisória do segundo nível na raiz aninhada                                               | —                            | idem; cena `nested` a 1024                              |
