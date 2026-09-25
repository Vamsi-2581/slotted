# Dossiê ReUI — alert

## 0. Cabeçalho

- Família: `alert`
- Modo: `polish`
- Data: 2026-09-25
- HEAD: `8abe84b2` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/reui/<item>/` e `tools/harness/out/reui/alert/`

## 1. Seleção

Cobertura: `direta`. O ReUI publica o primitivo `alert` (`Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`) e vinte exemplos `c-alert-*`.

Termos pesquisados em `llms-full.txt` (2188 linhas): `alert` 84, `c-alert` 34, `banner` 20, `callout` 6, `announcement` 6, `dismiss` 4, `notice` 2, `inline message` 0.

| Item         | Tipo         | Rota                               | Parte ou interação Slotted que informa                         | Capturas                                                                            |
| ------------ | ------------ | ---------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `alert`      | Primitivo    | `src/alert.json`, `src/alert.md`   | anatomia, API                                                  | fonte                                                                               |
| `c-alert-3`  | Free example | `/preview/base/example/c-alert-3`  | `root`, `icon`, `title`, `description`, `actions`              | `nova-{light,dark}-1280`, `-motion-reduce`, estados da raiz e das ações (`7ec886`)  |
| `c-alert-8`  | Free example | `/preview/base/example/c-alert-8`  | tom de perigo, `soft`                                          | `nova-{light,dark}-1280`, `-motion-reduce`, estados da raiz                         |
| `c-alert-9`  | Free example | `/preview/base/example/c-alert-9`  | variante `solid` (`invert` no ReUI)                            | `nova-{light,dark}-1280`, `-motion-reduce`, estados da raiz (`0ed13e`)              |
| `c-alert-18` | Free example | `/preview/base/example/c-alert-18` | `dismiss` (botão de ícone)                                     | `nova-{light,dark}-1280`, `-motion-reduce`, estados do `dismiss` (`f50ef2`)         |
| `dialog-3`   | Pro block    | `/preview/base/dialog-3`           | alerta `warning` com ações dentro de um diálogo                | `nova-{light,dark}-1280`, `-motion-reduce`, estados das ações                       |
| `coupon-5`   | Pro block    | `/preview/base/coupon-5`           | `reach="page"`: faixa de página dispensável                    | `nova-{light,dark}-1280`, `-motion-reduce`, estados da faixa e do `dismiss` (`0e799a`) |

Slotted: `slotted-{light,dark,high-contrast}-720`, `-motion-reduce`, `-forced`, `-dense`, `-rtl`; estados do `dismiss` (`7b4bf5`, 11 elementos, três esquemas) e da raiz (`c2c56b`).

## 2. Anatomia

| `data-slot` ReUI                      | Parte Slotted | Estado                |
| ------------------------------------- | ------------- | --------------------- |
| `alert`                               | `root`        | igual                 |
| `svg` filho direto de `alert`         | `icon`        | igual                 |
| `alert-title`                         | `title`       | igual                 |
| `alert-description`                   | `description` | igual                 |
| `alert-action`                        | `actions`     | igual                 |
| `button` de ícone em `alert-action`   | `dismiss`     | igual                 |
| —                                     | `content`     | só no Slotted         |

`content` é a região viva; o ReUI escreve `role="alert"` na raiz, que contém os botões (`src/alert.json`).

## 3. Medidas

Largura: ReUI 1280, Slotted 720. Nenhuma propriedade da tabela depende da largura da página. Densidade confortável, esquema claro, `reach="section"` salvo indicação.

| Parte    | Propriedade                  | ReUI                                                   | Slotted hoje                                                  | Alvo                                                                  | Veredicto                                                                                                     |
| -------- | ---------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| root     | altura, uma linha            | — (sem exemplo de uma linha)                           | 45,5px (`slotted-light-720.json` #17, #68, #79, #90, #223)    | 46px                                                                  | adaptar: altura de linha arredondada a 2px (linha seguinte)                                                   |
| root     | line-height                  | 20px a 14px (`c-alert-3` #2)                           | 19,5px a 13px; `page` 21px a 14px (#144)                      | `round(nearest, calc(var(--_line-height) * 1em), 2px)`: 20px; `page` 22px; `inline` e dense 18px | adaptar: a linha par centra o `dismiss` (24, 26) e as ações (30) em píxeis inteiros; precedente `round(…, 2px)` da marca, `alert.css:91` |
| root     | altura, `page`               | faixa 54px (`coupon-5` `0e799a` #0)                    | 77,5px (#144)                                                 | 79px (16 + 46 + 16 + borda inferior 1)                                                                  | adaptar: mesma causa                                                                                          |
| actions  | posição, `page` ≥ 40rem      | —                                                      | y 1386,25 (#152)                                              | y inteiro                                                             | adaptar: linha de 22 + 4 + 20 = 46px centra 30px a 8px                                                        |
| dismiss  | posição, `page` ≥ 40rem      | —                                                      | y 1389,5 (#155)                                               | y inteiro                                                             | adaptar: idem, 26px a 10px                                                                                    |
| dismiss  | margin-block-start           | `-mt-1` (−4px), `c-alert-18`                           | −2,25px (`(1lh − 24px) / 2`, #13)                             | −2px; `page` −2px; `inline` −3px                                      | adaptar: decorre da linha par, sem regra nova                                                                 |
| description | line-height, `page`       | —                                                      | 19,5px (#151)                                                 | 20px                                                                  | adaptar: a descrição arredonda sobre o seu próprio `em`                                                       |
| root     | padding block / inline       | 10px / 12px                                            | 12px / 16px; `inline` 8 / 12; `page` 16 / 20                  | sem mudança                                                           | recusar: 10px não tem passo (`translation.md`)                                                                |
| root     | border-radius                | 10px                                                   | 6px (`--slotted-radius-md`); `inline` 4px; `page` 0           | sem mudança                                                           | recusar: 10px não tem passo; `card` usa `--slotted-radius-lg` (8px) e o alerta dentro dele fica um passo abaixo |
| root     | border-width                 | 1px                                                    | 1px                                                           | sem mudança                                                           | igual                                                                                                         |
| icon     | tamanho                      | 16 × 16 (contorno)                                     | 16 × 16 (disco preenchido, `round(nearest, 1.2em, 2px)`)      | sem mudança                                                           | superar: o disco mantém a silhueta sob cores forçadas (secção 7)                                              |
| icon → texto | gap                      | 10px (`column-gap`)                                    | 8px (`--slotted-space-4`)                                     | sem mudança                                                           | recusar: 10px não tem passo                                                                                   |
| title    | font-size / weight           | 14px / 500                                             | 13px / 600                                                    | sem mudança                                                           | outra família: escala de controlo do tema; o peso 600 é a única hierarquia entre título e descrição           |
| title    | letter-spacing               | −0,35px (`tracking-tight`)                             | normal                                                        | sem mudança                                                           | recusar: `--slotted-control-letter-spacing` é 0 (`token-foundation.md:546`)                                   |
| title    | linhas                       | 1 (`line-clamp-1`)                                     | sem limite, `overflow-wrap: anywhere`                         | sem mudança                                                           | superar: a mensagem nunca é cortada                                                                           |
| title → description | gap               | 2px (`row-gap`)                                        | 4px (`--slotted-space-2`)                                     | sem mudança                                                           | recusar: 2px junta duas linhas de 20px                                                                        |
| description | color                     | `oklch(0.556 0 0)` (texto atenuado)                    | `--_text` do tom                                              | sem mudança                                                           | recusar: texto atenuado sobre a superfície do tom é um par que `contrast.test.mjs` não mede                   |
| dismiss  | tamanho                      | 28 × 28 (`c-alert-18`, `coupon-5`)                     | 24 × 24; `page` 26 × 26; ponteiro grosso 44 (`::after`)       | sem mudança                                                           | superar: 24px cumpre `--slotted-target-min` com margem −2px; 28px pede −4px ao lado de uma linha de 20px      |
| dismiss  | border-radius                | 8px                                                    | 4px (`--slotted-control-radius`)                              | sem mudança                                                           | outra família: raio de controlo do tema                                                                       |
| dismiss  | glifo                        | 14px (`c-alert-18`), 16px (`coupon-5`)                 | 16px (`--slotted-control-icon-size-md`)                       | sem mudança                                                           | igual a `coupon-5`                                                                                            |
| actions  | gap                          | 6px                                                    | 6px (`--slotted-space-3`)                                     | sem mudança                                                           | igual                                                                                                         |

Valores literais do stylesheet, registados aqui (critério Intent): `1.2em` e o passo `2px` da marca (`alert.css:91`), `12 / 11` da caixa do glifo (`alert.css:409`), `22rem` e `40rem` das consultas de contentor (`alert.css:632`, `:653`, permitidos por `token-foundation.md` para condições de contentor), `8%` e `14%` como recurso de `--slotted-alert-state-layer-*` (`alert.css:58`, `:63`), `2px` da altura de linha (linha 2 desta tabela).

## 4. Coreografia de estados

| Parte    | Estado        | Delta ReUI                                                                                              | Delta Slotted hoje                                                                                           | Alvo                                                                        |
| -------- | ------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| root     | hover, active | `{}` (`c-alert-3`, `c-alert-9`)                                                                         | `{}` (`c2c56b`)                                                                                              | sem mudança: a caixa não é interativa                                        |
| root     | focus-visible | `null` (não focável)                                                                                    | `outline` 2px `rgb(37,99,235)`, offset 2px (`tabindex="-1"`)                                                 | sem mudança                                                                 |
| dismiss  | hover         | `color` `oklch(0.556)` → `oklch(0.145)` (`c-alert-18`); `coupon-5` acrescenta `background-color` → `oklch(0.97)` | `background-color` → `currentcolor` 8%; ΔL mínimo 0,019 em `solid` `danger` claro e escuro (`7b4bf5` #4)     | `currentcolor` 10%: ΔL mínimo 0,025                                         |
| dismiss  | active        | hover + `translate 0 1px` (`c-alert-18`); igual ao hover (`coupon-5`)                                   | `background-color` → `currentcolor` 14%                                                                      | `currentcolor` 16%: ΔL mínimo 0,043                                         |
| dismiss  | focus-visible | anel `box-shadow 0 0 0 3px oklab(0.708 0 0 / 0.5)` + borda `oklch(0.708)` (`c-alert-18`); `outline: auto` 1px (`coupon-5`) | `outline` 2px interior; em `solid`, halo `inset 0 0 0 4px var(--_on-solid)`                                   | sem mudança                                                                 |
| dismiss  | disabled      | `opacity: 0.5`                                                                                          | `color: var(--slotted-disabled-foreground)`                                                                  | sem mudança                                                                 |
| root     | open → closed | desmontagem sem transição                                                                               | `opacity` 1 → 0, `translate` 0 → −4px, `display`, 120ms `--slotted-easing-exit`                              | sem mudança                                                                 |
| root     | closed → open | desmontagem sem transição                                                                               | sem entrada                                                                                                  | ver secção 5                                                                |

ΔL do hover e do press, calculado sobre o fundo composto em sRGB a partir de `theme.json` (`--slotted-tone-<tom>-solid` com `on-solid`), no pior caso de cada esquema:

| Força  | `danger` claro e escuro | `danger` high-contrast | `accent` escuro |
| ------ | ----------------------- | ---------------------- | --------------- |
| 8%     | 0,019                   | 0,030                  | 0,031           |
| 10%    | 0,025                   | 0,038                  | 0,039           |
| 14%    | 0,037                   | 0,056                  | 0,056           |
| 16%    | 0,043                   | 0,066                  | 0,064           |

Nas variantes `soft` e `outline` o ΔL a 8% já está entre 0,035 e 0,079 (`7b4bf5`, três esquemas).

## 5. Movimento

- ReUI: nenhuma transição de entrada ou saída; os botões declaram `transition-property: all` 150ms `cubic-bezier(0.4, 0, 0.2, 1)`, que continua a 150ms em `--motion reduce` (`c-alert-18/nova-light-1280-motion-reduce.json`). `coupon-5` lista as propriedades de cor e desmonta a faixa sem transição.
- Slotted hoje: saída em `opacity`, `translate` e `display`, `--slotted-duration-short` (120ms), `--slotted-easing-exit`, `allow-discrete`; `dismiss` em `background-color` e `color` com os tokens de transição de controlo. Em `--motion reduce` todas as durações ficam em 0,001s (`slotted-light-720-motion-reduce.json`). Sem entrada: `alert.styles.test.mjs:218` proíbe `@starting-style`, porque o estilo inicial também se aplica à primeira pintura.
- Alvo (gate): entrada só no alerta `polite` ou `assertive`, cuja chegada é a própria mensagem. `@starting-style` com `opacity: 0` e `translate: 0 calc(-1 * var(--slotted-space-2))`, o caminho inverso da saída; `--slotted-duration-short`, `--slotted-easing-enter` na raiz aberta; a saída passa para `[hidden]`, com `--slotted-easing-exit`. Um alerta `off` presente na primeira pintura não entra. Em `--motion reduce` as três durações ficam em 0,001s.

## 6. Capacidades

| Capacidade                          | Onde aparece no ReUI          | Forma no ReUI                                                   | Forma no Slotted                                                         | Em que a forma Slotted é melhor                                                      | Veredicto            | Família dona, se não esta |
| ----------------------------------- | ----------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------- | ------------------------- |
| Ações na linha do título            | `c-alert-3`, `dialog-3`       | `AlertAction` na coluna 3 a partir de `sm` (viewport)           | ações sob o texto; na linha só em `reach="page"` com o contentor ≥ 40rem | responde à largura da caixa, não à da janela                                          | recusar              | —                         |
| Variante invertida                  | `c-alert-9`, `c-alert-15`     | `variant="invert"`, um sétimo valor ao lado dos tons            | `variant="solid"` em qualquer `tone`                                     | tom e pintura são eixos separados: cinco tons × três pinturas                        | adaptar (já existe)  | —                         |
| Alerta sem bordas dentro de um painel | `c-alert-12` a `c-alert-17` | `className="border-0 shadow-none"` sobre `FramePanel`           | `variant="outline"` dentro de `card`                                     | nenhuma classe sobreposta; a variante sem fundo é declarada                          | adiar para `card`    | `card`                    |
| Avatar no lugar da marca            | `c-alert-19`, `c-alert-20`    | `Avatar` como primeiro filho, `grid-cols-[32px_1fr]`            | parte `icon` com conteúdo do consumidor                                  | a caixa da marca mantém a sua linha de base sem sobrepor a grelha                    | adaptar (já existe)  | —                         |
| Lista na descrição                  | `c-alert-4`                   | `ul` dentro de `AlertDescription` (`div`)                        | `render` de `AlertDescription` troca o `p` por um `div`                  | o elemento por omissão é o `p` de uma frase; a lista é pedida explicitamente          | adaptar (já existe)  | —                         |
| Dispensar por texto                 | `c-alert-3`, `dialog-3`       | botão `Dismiss` do consumidor dentro de `AlertAction`           | `dismissible` + `onOpenChange` com `reason: 'dismiss'` e foco restaurado | o fecho é um estado controlado/não controlado, com nome acessível e foco devolvido    | recusar              | —                         |

## 7. Superar

| Critério        | ReUI                                                                                         | Slotted hoje                                                                                                                                  | Alvo                                                                                     | Fonte                                                        |
| --------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Pixel grid      | falha: raiz 110,28px em `c-alert-18` (link de 20,28px); passa em `c-alert-3` (64px)          | falha: raiz de uma linha 45,5px; `page` 77,5px                                                                                                | 46px e 79px; ações e `dismiss` em y inteiro                                               | `slotted-light-720.json` #17, #144, #152, #155               |
| Hover           | passa em `coupon-5` (ΔL 0,03); `c-alert-18` só muda `color`                                  | falha: ΔL 0,019 no `dismiss` sobre `solid` `danger`, claro e escuro                                                                          | ΔL ≥ 0,025 em todos os fundos (secção 4)                                                  | `7b4bf5` #4, `theme.json`                                    |
| Press           | passa em `c-alert-18` (`translate`); falha em `coupon-5` (active = hover)                    | passa: 14% contra 8%                                                                                                                          | 16% contra 10%                                                                           | `0e799a` #2, `7b4bf5`                                        |
| Focus           | falha: anel a 50% ≈ 1,5:1 sobre branco, borda 1px 2,6:1 (`c-alert-18`); `outline: auto` 1px (`coupon-5`) | passa: anel 2px ≥ 4,23:1 em `soft`/`outline` claro, ≥ 6,58:1 escuro, 21:1 high-contrast; em `solid` o halo de 2px visível mede 4,83–10,00:1 contra o fundo | sem mudança                                                                              | `7b4bf5` `deltas.focus`, cálculo WCAG        |
| Transition      | falha: `transition-property: all` 150ms nos botões                                           | passa: `background-color`, `color`; tokens de controlo                                                                                        | sem mudança                                                                              | `7b4bf5` `rest`                                              |
| Reduced motion  | falha: 150ms mantidos                                                                        | passa: 0,001s                                                                                                                                 | sem mudança                                                                              | `*-motion-reduce.json`                                       |
| Disabled        | falha: `opacity: 0.5`                                                                        | passa: `--slotted-disabled-foreground`                                                                                                         | sem mudança                                                                              | `src/alert.json` (botão), `alert.css:565`                    |
| Schemes         | só claro e escuro                                                                            | falha em cores forçadas: `solid` `accent` pinta `Highlight` `rgba(5,0,73,0.8)` com texto `HighlightText` sobre a placa `Canvas` do texto (texto ilegível, #171); `solid` `danger` perde a borda (`rgb(255,255,255)`, #90) | as três variantes pintam `Canvas`, `CanvasText` e borda `CanvasText`                      | `slotted-light-720-forced.{json,png}`                        |
| Density e RTL   | n/a                                                                                          | passa: dense 44 / 66px, rtl espelhado com o `dismiss` à esquerda                                                                              | sem mudança                                                                              | `slotted-light-720-dense.json`, `-rtl.png`                   |
| Target size     | passa: `dismiss` 28px                                                                        | passa: 24px; 44px em ponteiro grosso                                                                                                          | sem mudança                                                                              | `7b4bf5` rects, `alert.css:573`                              |
| Motion          | falha: sem entrada nem saída                                                                 | falha: saída sem entrada                                                                                                                      | entrada só em `data-live` `polite` e `assertive`: `@starting-style` com `opacity: 0` e `translate: 0 -4px`, 120ms `--slotted-easing-enter`; `off` sem entrada, como exceção declarada                                                                                     | secção 5                                                     |
| Intent          | valores Tailwind literais                                                                    | passa com o registo da secção 3                                                                                                               | sem mudança                                                                              | secção 3                                                     |

## 8. Delta

| #   | Ficheiro                                              | Mudança                                                                                                                                                                                                   | Linhas do dossiê que resolve                                   | Captura que o prova                                  |
| --- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | `packages/styles/src/alert/alert.css`                 | raiz e `description`: `line-height: round(nearest, calc(var(--_line-height) * 1em), 2px)`                                                                                                                  | 3 root altura e line-height, `page`, actions, dismiss; 7 Pixel grid | `slotted-light-720.json` #17, #144, #152, #155       |
| 2   | idem                                                  | recurso de `--slotted-alert-state-layer-hover` 8% → 10%, de `-active` 14% → 16%                                                                                                                           | 4 dismiss hover e active; 7 Hover, Press                       | `slotted-{light,dark,high-contrast}-720-…-7b4bf5.json` |
| 3   | idem                                                  | `@media (forced-colors: active)`: `[data-ui='alert'][data-part='root'][data-variant]` com `background-color: Canvas`, `border-color: CanvasText`, `color: CanvasText`                                     | 7 Schemes                                                      | `slotted-light-720-forced.{json,png}` #90, #171      |
| 4   | idem e `alert.styles.test.mjs`                        | `@starting-style` só em `:is([data-live='polite'], [data-live='assertive'])`; a raiz aberta transita com `--slotted-easing-enter`, `[hidden]` com `--slotted-easing-exit`; `--slotted-easing-enter` em `alert.tokens.json` | 5; 7 Motion | `alert.styles.test.mjs` (o `capture.mjs` finaliza as transições antes da leitura) |
| 5   | `packages/styles/src/alert/alert.styles.test.mjs`     | asserções da altura de linha, da força do state layer e da regra de cores forçadas, da entrada e da centragem da linha 6                                                                                                                        | 8 linhas 1–3                                                   | `pnpm check:affected`                                |
| 6   | `packages/styles/src/alert/alert.css`                 | `reach="page"` ≥ 40rem: `dismiss` com `margin-block: 0` em vez de `margin-block-start: 0`; a margem inferior negativa deslocava o centro do controlo 1px (confortável) e 1,5px (dense) abaixo do das ações | encontrado na recaptura | `slotted-light-720{,-dense}.json`, raiz `page` |

Nenhuma linha edita `contract.json`.

### Recaptura

Specimens em `tools/harness/out/reui/alert/`; os anteriores em `before/`.

| Linha do dossiê                  | Antes                                   | Depois                                                                 |
| -------------------------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| 3 root, uma linha                | 45,5px                                  | 46px em claro, escuro, high-contrast, rtl e forçado; dense 44px        |
| 3 root, `page`                   | 77,5px                                  | 79px; dense 73px                                                       |
| 3 root, duas linhas / conteúdo longo | 69 / 111px                          | 70 / 112px; dense 66 / 102px; nenhuma raiz fracionária a 240px         |
| 3 actions e dismiss, `page`      | y 1386,25 e 1389,5; centros 38,25 e 39,5 | centros 39 e 39 (dense 36 e 36); nenhum `dismiss` ou `actions` em y fracionário |
| 4 dismiss hover, `solid` `danger`| ΔL 0,019                                | ΔL 0,025 (`oklab(1 0 0 / 0.1)`); active 0,043 (`/ 0.16`)                |
| 7 Schemes, `solid` forçado       | `rgba(5,0,73,0.8)` / texto `rgb(255,255,255)`; borda `rgb(255,255,255)` | fundo `rgb(255,255,255)`, texto e borda `rgb(0,0,0)` (#90, #171) |
| 7 Reduced motion                 | 0,001s                                  | 0,001s                                                                 |
| 7 Focus                          | sem mudança                             | sem mudança (`7b4bf5`)                                                 |
