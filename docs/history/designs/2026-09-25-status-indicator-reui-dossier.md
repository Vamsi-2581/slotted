# Dossiê ReUI — status-indicator

## 0. Cabeçalho

- Família: `status-indicator`
- Modo: `polish`
- Data: 2026-09-25
- HEAD: `8abe84b2` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/reui/<item>/` e `tools/harness/out/reui/status-indicator/`

## 1. Seleção

Cobertura: `análogo`. O ReUI não publica um primitivo de indicador de estado; desenha o ponto de estado com rótulo dentro de blocos Pro e de um exemplo de `badge`.

Termos pesquisados em `llms-full.txt` (2188 linhas): `status` 102, `status dot` 3, `dot` 38, `pulse`/`pulsing` 3, `online` 1, `c-badge` 25.

| Item               | Tipo         | Rota                                     | Parte ou interação Slotted que informa   | Capturas                                                                       |
| ------------------ | ------------ | ---------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| `card-8`           | Pro block    | `/preview/base/card-8`                   | `mark` (ponto) e `gap` num cartão        | `nova-light-1280*`, `nova-dark-1280*`, estados do ponto e do contentor         |
| `card-27`          | Pro block    | `/preview/base/card-27`                  | `mark` e `gap` numa coluna de metadados  | `nova-light-1280*`, estados do ponto e do contentor                            |
| `data-grid-base-6` | Pro block    | `/preview/base/data-grid-base-6`         | `mark`, `gap` e `label` numa célula      | `nova-light-1280*`, `nova-dark-1280*`, estados do ponto e do contentor         |
| `timeline-1`       | Pro block    | `/preview/base/timeline-1`               | `mark` de aviso                          | `nova-light-1280.json`                                                         |
| `chart-6`          | Pro block    | `/preview/base/chart-6`                  | pulso (keyframes)                        | `nova-light-1280`, `nova-dark-1280`, `nova-light-1280-motion-reduce`           |
| `c-badge-22`       | Free example | `/preview/base/example/c-badge-22`       | ponto dentro de um chip                  | `nova-light-1280.json`, fonte `src/c-badge-22.json`                            |

Os pontos de `card-8`, `card-27` e `data-grid-base-6` não têm `data-slot`; entram no specimen por `--states '[class*="rounded-full"][class*="size-"]:empty'` (ficheiros `*-dc4b4d.json`) e o contentor por `--states ':has(> [class*="rounded-full"][class*="size-"]:empty)'` (`*-795ff6.json`). `card-27` escuro não renderiza o ponto com esse seletor.

## 2. Anatomia

| `data-slot` ReUI                                  | Parte Slotted  | Estado                |
| ------------------------------------------------- | -------------- | --------------------- |
| contentor `flex items-center gap-*` (sem slot)    | `root`         | igual                 |
| `span.size-1.5.rounded-full` (sem slot)           | `mark` (dot)   | igual                 |
| texto irmão do ponto                              | `label`        | igual                 |
| —                                                 | `mark` (icon)  | só no Slotted         |
| —                                                 | `announcement` | só no Slotted         |
| —                                                 | pulso `::after`| só no Slotted         |

## 3. Medidas

Largura: ReUI 1280, Slotted 720. Nenhuma propriedade da tabela depende da largura da página. Densidade confortável, esquema claro, tamanho `md`.

| Parte  | Propriedade                  | ReUI                                                              | Slotted hoje                                                        | Alvo                                                                 | Veredicto                                                                                                          |
| ------ | ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| mark   | tamanho (rect 1×)            | 6 × 6 (`card-8`, `card-27`, `data-grid-base-6`, `timeline-1`)     | 9,48 × 9,48 (`1cap`); `sm` 8,75; escuro 9                           | `sm` `--slotted-space-3` (6px); `md` e `lg` `--slotted-space-4` (8px) | adaptar: o ReUI mede 0,43 em ao lado de 14px; 8px mede 0,62 em ao lado de 13px e fica em píxeis inteiros           |
| mark   | border-width                 | 0px                                                               | 1px                                                                 | 1px, mesma cor do preenchimento salvo `warning`                      | adaptar: aro só onde o preenchimento fica abaixo de 3:1 (secção 7)                                                 |
| mark   | border-color (claro)         | —                                                                 | neutral `#172033` sobre `#78899c`; warning `#854d0e` sobre `#facc15`; danger `#b91c1c` sobre `#dc2626` | `var(--_solid)`; warning `--slotted-tone-warning-border`             | adaptar: aro de outro tom desenha um alvo concêntrico                                                              |
| mark   | border-color (escuro)        | —                                                                 | neutral `#fafafa` sobre `#71717a`; warning `#fde68a` sobre `#facc15`; accent `#93c5fd` sobre `#2563eb` | idem                                                                 | adaptar: o aro claro em todos os tons é o defeito visível mais extenso (`slotted-dark-720.png`)                    |
| mark   | background (claro)           | `lab(59.1 -58.7 41.3)` verde, `lab(44.1 29 -86)` azul              | `--_solid` do tom; neutral `--slotted-border-strong`                | sem mudança                                                          | superar: preenchimentos por papel de tom, não por cor literal                                                      |
| mark   | unknown border-color         | —                                                                 | `#172033` tracejado                                                  | `--slotted-border-strong` tracejado                                  | adaptar: o anel vazio passa a ter o mesmo peso do ponto `neutral` (3,59:1 claro, 3,84:1 escuro)                    |
| mark | halo | nenhum (`box-shadow: none`) | nenhum | `box-shadow: 0 0 0 3px` (`sm` 2px) em `color-mix(in oklab, <aro> 20%, transparent)`; nenhum em `unknown` | superar: o ponto lê-se como luz acesa, sem alterar o contraste do disco |
| mark   | margin-block-start           | centrado por `items-center`                                       | `calc((1lh - 9,48px) / 2)` = 5px, escuro 5,25px                      | `round(nearest, (1lh - tamanho) / 2, 1px)`                           | adaptar: precedente `alert.css:419`                                                                                |
| root | gap (mark → label) | 6px (`card-27`), 4px (`card-8`), 8px (`data-grid-base-6`) | 6px (`--slotted-space-3`); `sm` 4px | `md` e `lg` `--slotted-space-4` (8px); `sm` `--slotted-space-3` (6px) | adotar `data-grid-base-6`: o halo de 3px deixa 5px até à primeira letra |
| root   | font-size / line-height      | 14px / 20px (`data-grid-base-6`)                                  | 13px / 19,5px                                                       | sem mudança                                                          | outra família: escala de controlo do tema                                                                          |
| label  | color                        | tom (`card-8`) ou texto (`data-grid-base-6`)                      | `rgb(15, 23, 42)` (texto)                                           | sem mudança                                                          | recusar a variante tingida: o texto mantém a leitura de uma coluna de estados                                      |
| root `<a>` | color                    | —                                                                 | `rgb(0, 0, 238)` claro, `rgb(158, 158, 255)` escuro (cor de link do UA) | `inherit`                                                            | adaptar: a cor do UA substitui a do texto da página                                                                |
| mark icon | tamanho                   | sem análogo capturado                                             | 16 × 16                                                             | sem mudança                                                          | —                                                                                                                  |

## 4. Coreografia de estados

`root` só é interativo quando renderizado como `<a>` (cena `focusable`). Specimens: `slotted-{light,dark,high-contrast}-720-a-data-ui-status-indicat-4ee571.json`. Os pontos ReUI não são interativos: hover `{}`, active `{}`, focus `null` (`*-dc4b4d.json`).

| Parte      | Estado         | Delta ReUI | Delta Slotted hoje                                                                    | Alvo                                                                               |
| ---------- | -------------- | ---------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| root `<a>` | hover          | —          | `{}`                                                                                  | `label` `text-decoration-color` `transparent` → `currentColor`                     |
| root `<a>` | active         | —          | `color` `rgb(0,0,238)` → `rgb(255,0,0)` (vermelho de `:active` do UA)                 | `label` `color` → `--slotted-text-muted`, sublinhado mantido                       |
| root `<a>` | focus-visible  | —          | `outline` `none` → `2px solid rgb(37,99,235)`, offset 2px                             | sem mudança                                                                        |
| root       | pulse          | —          | `::after` anel na cor `--_text`                                                       | anel na cor do aro em `dot`; `--_text` em `icon`                                   |

## 5. Movimento

- ReUI: `ping` (`75%, 100% { opacity: 0; transform: scale(2) }`) e `dot-pulse` (`0% opacity 0 scale 1`, `30% opacity 1`, `100% opacity 0 scale 1.8`), declarados em `chart-6/nova-light-1280.json` › `keyframes`. Nenhum elemento capturado com animação ativa; nenhuma regra de movimento reduzido observada.
- Slotted hoje: `slotted-status-indicator-pulse`, `opacity 0.5 → 0`, `scale 1 → 2.2`, `--slotted-duration-loop-slow` (1,6s), `--slotted-easing-standard`, infinito; removido sob `prefers-reduced-motion: reduce` e `forced-colors: active`.
- Alvo: onda preenchida por baixo da marca (`z-index: -1`, raiz com `isolation: isolate`) em vez de anel de 1px. `from { opacity: var(--_wave-opacity); scale: 1 }`, `70%, to { opacity: 0; scale: var(--_wave-scale) }`: ponto 0,45 → escala 3; ícone 0,22 → escala 1,75. `--slotted-duration-loop-slow`, `--slotted-easing-enter`. O repouso de 30% final corresponde aos 25% de `ping`. Cor: `--_ring` (aro no ponto, glifo no ícone). O `capture.mjs` finaliza as animações antes da leitura; o instante intermédio não tem specimen. Transição nova do rótulo linkado: `color` e `text-decoration-color`, `--slotted-duration-short`, `--slotted-easing-standard`.

## 6. Capacidades

| Capacidade                  | Onde aparece no ReUI | Forma no ReUI                                      | Forma no Slotted                           | Em que a forma Slotted é melhor                                        | Veredicto              | Família dona, se não esta |
| --------------------------- | -------------------- | -------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------- | ---------------------- | ------------------------- |
| Ponto dentro de um chip     | `c-badge-22`         | `span` filho de `Badge` com `bg-[currentColor]`    | `badge` com ponto próprio                  | parte declarada no contrato de `badge`, não um `span` do consumidor    | adiar para `badge`     | `badge`                   |
| Rótulo na cor do tom        | `card-8`             | classe de cor no texto                             | rótulo na cor do texto, tom na marca       | a coluna de estados mantém o contraste de leitura do texto da página   | recusar                | —                         |

## 7. Superar

| Critério        | ReUI                                                   | Slotted hoje                                                                                                  | Alvo                                                                         | Fonte                                                             |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Pixel grid      | passa: ponto 6 × 6                                     | falha: marca 9,48 × 9,48 (`md`), 8,75 × 8,75 (`sm`)                                                           | 6 e 8 px inteiros; deslocamento arredondado a 1px                            | `slotted-light-720.json` parts 1, `sm` warning                    |
| Hover           | n/a (não interativo)                                   | falha: raiz `<a>` com hover `{}`                                                                              | delta de `text-decoration-color` no rótulo                                   | `slotted-light-720-a-…-4ee571.json`                               |
| Press           | n/a                                                    | falha: active = vermelho do UA `rgb(255,0,0)`                                                                 | `color` `--slotted-text-muted`, diferente do hover                           | idem                                                              |
| Focus           | n/a                                                    | passa: 2px, 5,17:1 claro, 7,29:1 escuro, 21:1 high-contrast, offset 2px                                       | sem mudança                                                                  | idem, `deltas.focus`                                              |
| Transition      | n/a                                                    | falha: `transition-property: all`, `0s` na raiz `<a>`                                                         | `color` e `text-decoration-color` no rótulo, tokens de movimento            | idem, `rest`                                                      |
| Reduced motion  | sem regra observada                                    | passa: pulso removido                                                                                         | superar, sem mudança                                                         | `slotted-light-720-motion-reduce.json`                            |
| Disabled        | n/a                                                    | n/a: sem estado disabled no contrato                                                                          | —                                                                            | `contract.json` › `states`                                        |
| Schemes         | só claro e escuro                                      | passa: high-contrast e forced-colors com a mesma anatomia                                                     | superar; warning em high-contrast com aro `#000000`                          | `slotted-high-contrast-720-…png`, `slotted-light-720-forced.json` |
| Density e RTL   | n/a                                                    | passa: dense 12px/18px, marca 8,75; rtl espelhado                                                             | dense mantém 8px em `md`                                                     | `slotted-light-720-dense.json`, `slotted-light-720-rtl.json`      |
| Target size     | n/a                                                    | passa pela exceção de espaçamento da WCAG 2.5.8: raiz `<a>` 19,5px de altura, 16px entre alvos na horizontal | sem mudança                                                                  | `slotted-light-720-a-…-4ee571.json` rects                         |
| Motion          | `ping` sem regra de movimento reduzido                 | passa: laço em tokens                                                                                         | sem mudança                                                                  | secção 5                                                          |
| Intent          | valores Tailwind literais                              | falha: `1cap` sem registo de valor inteiro                                                                    | tokens de espaço e `round()` registados neste dossiê                         | `status-indicator.css`                                            |
| Contraste da marca (1.4.11) | warning `timeline-1` ≈ 2,1:1 sobre branco  | 3:1 garantido pelo aro de texto em todos os tons                                                              | preenchimento sozinho ≥ 3:1 em todos os tons e esquemas, salvo warning claro: aro `#ca8a04` 2,94:1 | `packages/theme-default/src/theme.json`, cálculo WCAG             |

Contraste do preenchimento contra `--slotted-surface`, calculado dos valores de `theme.json`:

| Tom       | Claro                 | Escuro                | High-contrast        |
| --------- | --------------------- | --------------------- | -------------------- |
| neutral   | `#78899c` 3,59        | `#71717a` 3,84        | `#000000` 21         |
| info      | `#1d4ed8` 6,70        | `#2563eb` 3,59        | `#0b3a9c` 10,00      |
| success   | `#15803d` 5,02        | `#15803d` 3,70        | `#0a5227` 9,34       |
| warning   | `#facc15` 1,53        | `#facc15` 12,11       | `#facc15` 1,53       |
| danger    | `#dc2626` 4,83        | `#dc2626` 3,84        | `#94090c` 9,12       |

## 8. Delta

| #   | Ficheiro                                                        | Mudança                                                                                                                                              | Linhas do dossiê que resolve                        | Captura que o prova                                  |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| 1   | `packages/styles/src/status-indicator/status-indicator.css`     | `--_dot-size` por tamanho: `sm` `--slotted-space-3`, `md` e `lg` `--slotted-space-4`; remove `1cap`                                                   | 3 mark tamanho; 7 Pixel grid, Intent                | `slotted-light-720.json`, `-dense.json`              |
| 2   | idem                                                            | `--_rim` por omissão `var(--_solid)`; `warning` `--slotted-tone-warning-border`; `unknown` `--slotted-border-strong`; override do consumidor mantido | 3 border-color claro e escuro, unknown; 7 contraste | `slotted-{light,dark,high-contrast}-720.png`         |
| 3   | idem                                                            | `--_pulse-inset` com `round(nearest, …, 1px)`                                                                                                        | 3 margin-block-start; 7 Pixel grid                  | `slotted-light-720.json` rect da marca               |
| 4   | idem                                                            | anel do pulso: `--_ring` = aro em `dot`, `--_text` em `icon`                                                                                         | 4 pulse                                             | `slotted-dark-720.png`                               |
| 5   | idem                                                            | raiz `color: inherit`; rótulo em `:any-link` com sublinhado transparente, hover `currentColor`, active `--slotted-text-muted`, transição curta       | 3 root `<a>` color; 4 hover, active; 7 Hover, Press, Transition | `slotted-*-720-a-…-4ee571.json`                      |
| 6   | `packages/styles/src/status-indicator/status-indicator.tokens.json` | adiciona `--slotted-space-*`, `--slotted-tone-warning-border`, `--slotted-text-muted`, `--slotted-duration-short`                                 | 8 linhas 1, 2, 5                                    | teste de tokens da família                           |
| 8   | `packages/styles/src/status-indicator/status-indicator.css` | halo do ponto; `gap` `md` 8px e `sm` 6px; onda preenchida com repouso e `--slotted-easing-enter` | 3 halo, gap; 5 | `slotted-{light,dark}-720.png` |
| 7   | `packages/styles/src/status-indicator/status-indicator.styles.test.mjs` | asserções do tamanho, do aro, do anel e do link atualizadas                                                                                   | 8 linhas 1–5                                        | `pnpm check:affected`                                |

| 9   | `specs/components/status-indicator/contract.json`, constantes React e Angular, harness, docs e stories | `contrato`: `statusGlyphs.warning` `circle-alert`, `danger` `circle-x` — regra `No triangle glyph` de `docs/build-briefing.md`, o mesmo mapa de `alert` e `toast` | pedido após a revisão | `slotted-dark-720.png`, cena `marks` |
| 10  | `packages/styles/src/status-indicator/status-indicator.css` | marca `icon` sem pulso (`[data-mark='icon'][data-pulse]::after { content: none }`); cenas de pulso com ponto | pedido após a revisão | cena `pulse` |
| 11  | idem | anel de `unknown` num `::before` de 2px tracejado, borda exterior no fim do halo (14px `md`, 10px `sm`), caixa na linha mantida em 8 e 6 | pedido após a revisão | `slotted-light-720-data-status-unknown-data-4a3be2-0-rest.png` |

A linha 9 edita `contract.json`, o que passa a execução de `polish` a `build`.
