# Dossiê ReUI — result-state

## 0. Cabeçalho

- Família: `result-state`
- Modo: `build` (a linha 1 do delta edita `contract.json`)
- Data: 2026-09-25
- HEAD: `2607c830` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/specimen/<item>/<item>-<tema>-1280.json` (ReUI) e `tools/harness/out/specimen/result-state/slotted-light-720.json` (Slotted)
- Fontes MIT: `https://reui.io/r/icon-stack.json`, `https://reui.io/r/icon-tile.json`, `https://reui.io/r/c-empty-{1..20}.json`

## 1. Seleção

Cobertura: `direta`. O ReUI publica vinte exemplos `c-empty-*` sobre o `Empty` do shadcn, catorze blocos Pro `empty-state-*` e dois primitivos de ilustração, `IconStack` e `IconTile`.

Termos pesquisados em `llms-full.txt` (2188 linhas): `empty` 54, `c-empty` 20, `icon tile` 37, `onboarding` 31, `icon stack` 8, `illustration` 6, `zero state` 3, `no results` 3.

| Item             | Tipo         | Rota                                   | Parte ou interação Slotted que informa                    | Capturas                           |
| ---------------- | ------------ | -------------------------------------- | --------------------------------------------------------- | ---------------------------------- |
| `icon-stack`     | Primitivo    | `r/icon-stack.json`                    | ilustração `stack`: geometria das camadas, inclinação     | fonte                              |
| `icon-tile`      | Primitivo    | `r/icon-tile.json`                     | ilustração `tile`: anel, recuo, cartão interior           | fonte                              |
| `c-icon-stack-1` | Free example | `/preview/base/example/c-icon-stack-1` | ilustração `stack` isolada                                | `light-1280`                       |
| `c-empty-4`      | Free example | `/preview/base/example/c-empty-4`      | `media` com glifo em mosaico, `reach="section"`           | `light-1280`                       |
| `c-empty-15`     | Free example | `/preview/base/example/c-empty-15`     | ilustração `cards`: cartões empilhados                    | `light-1280`                       |
| `empty-state-1`  | Pro block    | `/preview/base/empty-state-1`          | `cards` numa página de registos vazia, ações, rodapé      | `{light,dark}-1280`                |
| `empty-state-2`  | Pro block    | `/preview/base/empty-state-2`          | `status="no-results"` com cartões                         | `light-1280`                       |
| `empty-state-9`  | Pro block    | `/preview/base/empty-state-9`          | `stack` com glifo, `reach="page"`, duas ações             | `{light,dark}-1280`                |

Os exemplos `c-empty-13` a `c-empty-20` desenham uma ilustração SVG própria por exemplo (interruptor, quadro isométrico, bolhas de conversa, cartão de crédito, nós, calendário). Cada um é arte do consumidor e informa apenas o caminho `illustration="none"` com `media` preenchido.

## 2. Anatomia

| `data-slot` ReUI                 | Parte Slotted                                   | Estado               |
| -------------------------------- | ----------------------------------------------- | -------------------- |
| `empty`                          | `root`                                          | igual                |
| `empty-header`                   | —                                               | em falta no Slotted  |
| `empty-icon` (`EmptyMedia`)      | `media`                                         | igual                |
| `icon-stack`, `icon-tile`        | `media` com `data-illustration`                 | em falta no Slotted  |
| `icon-stack-content`             | filho de `media` (o glifo do consumidor)        | igual                |
| `empty-title`                    | `title`                                         | igual                |
| `empty-description`              | `description`                                   | igual                |
| `empty-content`                  | `actions`                                       | igual                |
| link `variant="link"` em `empty-content` | `footer`                                | igual                |
| —                                | `content` (região viva)                         | só no Slotted        |

`empty-header` agrupa ilustração e texto para lhes dar um intervalo menor do que o que separa o texto das ações. No Slotted o mesmo ritmo resulta de dois intervalos no grid da raiz (§ 3, linha `actions`), sem elemento novo.

## 3. Medidas

ReUI a 1280 px; Slotted a 720 px. Nenhuma das propriedades abaixo varia com a largura da página em nenhum dos lados.

| Parte               | Propriedade             | ReUI                                                  | Slotted hoje                         | Alvo                                                                 | Veredicto |
| ------------------- | ----------------------- | ----------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------- | --------- |
| `title` (page)      | tamanho / peso / linha  | 24–30px / 600 / 32–36px (`empty-state-1`, `-9`)       | 24px / 600 / 31.2px                  | `--slotted-font-size-3xl` / semibold, sem mudança                     | superar: a escala Slotted já dá 24; 30 não tem degrau |
| `title` (page, section) | letter-spacing      | −0.6px a 24px, −0.75px a 30px (−0.025em)              | normal                               | `-0.01em`                                                            | adaptar: −0.01em é o valor de `page-header` e `section` para títulos; −0.025em fecha as letras de Inter a 18px |
| `title` (section)   | tamanho / peso          | 14px / 500 (`c-empty-4`, `-15`)                       | 18px / 600                           | sem mudança                                                          | recusar: dois degraus entre título e descrição, decisão já registada no CSS |
| `description`       | tamanho / linha / cor   | 14px / 22.75px / `oklch(0.556 0 0)`                   | 14px / 21px / `--slotted-text-muted` | sem mudança                                                          | igual     |
| `content`           | intervalo título→descrição | 8px (`empty-header` interno)                       | 6px                                  | `--slotted-space-4` (8px)                                            | adotar: 6px cola a descrição ao título a 18 e 24px |
| `media` → `content` | intervalo               | 16px (`empty-state-1`), 24px (`empty-state-9`)        | 16px section, 24px page              | sem mudança                                                          | igual     |
| `content` → `actions` | intervalo             | 28px (`empty`, os três blocos)                        | 16px section, 24px page (o mesmo que acima) | `--slotted-space-8` (24px) section, `--slotted-space-9` (32px) page | adaptar: ReUI separa a mensagem das ações um degrau acima da ilustração; 28 não tem degrau |
| ilustração `tile`   | caixa / glifo / raio    | 32×32, glifo 16, raio 10 (`c-empty-4`); `IconTile frame` 40/18, recuo 3 | inexistente | exterior `--slotted-control-height-lg` + 2×`--slotted-space-2` (46/40/38), interior `--slotted-control-height-lg`, glifo `--slotted-control-icon-size-lg`, raio interior `--slotted-radius-lg`, exterior raio interior + recuo | adaptar: o anel duplo do `frame`, na escala de controlo que já varia por densidade |
| ilustração `stack`  | caixa / camadas         | 72×80; três camadas, deslocamento (13.65, 6.04) por camada; opacidade 0.4 / 0.6 / 0.8; traço 0.5 a 20–30 % de `currentColor`; inclinação `matrix(1, −0.4877, 0, 1, 0, 0)` = skewY(−26°), scaleX(0.9); glifo 24 em `oklch(0.556 0 0)` | inexistente | lado S = `--slotted-control-height-lg` + `--slotted-space-2` (42/36/34); deslocamento local (−0.36 S, −0.3 S), que depois de skewY(−26°) scaleX(0.9) dá o (13.65, 6.04) medido a S = 42; borda `--slotted-border-width-thin` em `--slotted-border-subtle`, frente em `--slotted-control-border-color`; glifo `--slotted-control-icon-size-lg` em `--slotted-text-muted` | adotar a geometria; adaptar o traço (0.5px a 20 % desaparece em alto contraste) |
| ilustração `cards`  | caixa / cartões         | 208×96; cartão da frente 64 de altura, `px-4`, miniatura 32, linhas 10 e 8 a 75 % e 50 %, intervalo 6 e 12; cartões de trás a 12 e 24 de recuo lateral, 12 de degrau (`c-empty-15`, fonte) | inexistente | largura 4×`--slotted-space-11` + `--slotted-space-6` (208); frente `--slotted-control-height-sm` + 2×`--slotted-space-6` (62/58/56); miniatura `--slotted-control-height-sm`; linhas `--slotted-space-4` e `--slotted-space-3`; degrau e recuo `--slotted-space-5` | adotar |

## 4. Coreografia de estados

`--states` não foi passado a nenhum item ReUI: nenhuma parte do `Empty` é interativa, e os botões pertencem à família `button`. O Slotted declara `default` e `focus-visible`; o foco da raiz é o anel `--slotted-focus-ring-*` a 2px com afastamento de 2px, inalterado.

| Parte   | Estado        | Delta ReUI                                  | Delta Slotted hoje       | Alvo                      |
| ------- | ------------- | ------------------------------------------- | ------------------------ | ------------------------- |
| `root`  | focus-visible | inexistente: a raiz não recebe foco         | `outline` 2px, offset 2px | sem mudança (superar)     |
| `media` | hover         | vazio                                       | vazio                    | vazio: a ilustração é decorativa e `aria-hidden`; um hover num elemento sem ação anuncia uma ação que não existe |

## 5. Movimento

ReUI: nenhum keyframe próprio nem transição nas partes do `Empty`; a ilustração é estática. Os únicos `transition` do specimen são dos botões (`all 0.15s`).

Slotted, alvo:

- Entrada: só com `live` diferente de `off`, pela mesma razão que `alert` (a chegada é a mensagem; `@starting-style` aplica-se também ao primeiro paint). A raiz entra em `opacity` com `--slotted-duration-short` e `--slotted-easing-enter`. As camadas de trás de `stack` e os cartões de trás de `cards` partem da posição da frente e abrem até à posição de repouso em `--slotted-duration-long` com `--slotted-easing-enter`; a segunda camada atrasa `--slotted-duration-short`. O anel de `tile` parte de `scale: 0.96`.
- Saída: `[hidden]` na raiz, `opacity` e `display` com `--slotted-duration-short` e `--slotted-easing-exit`, `transition-behavior: allow-discrete`.
- Movimento reduzido: as durações vêm da escala de movimento, que o tema reduz; nenhuma animação infinita.

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| ---------- | -------------------- | ------------- | ---------------- | ------------------------------- | --------- | ------------------------- |
| Ilustração de camadas com glifo | `empty-state-8` a `-14`, `c-icon-stack-*` | componente `IconStack` com SVG de caminhos fixos, glifo como filho, posição por variáveis `--icon-stack-content-x/y` | `illustration="stack"` na raiz; o glifo é o `media` que já existe | uma prop em vez de um segundo componente e de variáveis de posição; densidade, RTL (inclinação espelhada) e alto contraste pela folha | adotar | — |
| Glifo em mosaico emoldurado | `c-empty-4` a `-12`, `empty-state-4` e `-5` | `EmptyMedia variant="icon"` ou `IconTile` com cinco variantes e cinco tamanhos | `illustration="tile"`; tamanho pela `reach` | o tamanho segue a `reach` e a densidade; as variantes de tom de `IconTile` (`soft`, `solid`) ficam de fora por R5 | adaptar | — |
| Cartões empilhados | `empty-state-1`, `-2`, `c-empty-15`, `-16` | SVG ou `div` escritos à mão em cada exemplo, com gradiente para `bg-background` | `illustration="cards"`; o glifo, quando existe, ocupa a miniatura | nenhum código de ilustração no consumidor; funciona sobre qualquer superfície, porque não pinta um gradiente para uma cor de fundo suposta | adotar | — |
| Esvanecer inferior dos cartões | `c-empty-15`, `-16` | gradiente para `--background` | nenhum | — | recusar: o gradiente supõe a cor do fundo e mancha um `result-state` dentro de um `card` ou de uma superfície `sunken`; uma máscara recortaria os cartões de trás, que ficam fora da caixa | — |
| Ilustração por cenário (calendário, cartão, conversa) | `c-empty-13` a `-20` | SVG próprio por exemplo | `illustration="none"` com a arte em `media` | o caminho já existe; a família reserva a altura da caixa antes de a imagem chegar | adiar para a página | — |
| Moldura tracejada de carregamento | `c-empty-6` | `border-dashed` no `Empty` | nenhum | — | adiar para `upload` | `upload` |
| Sugestões em pílula sob as ações | `empty-state-2` | botões arredondados abaixo do bloco | filhos do `footer` | o `footer` já é o lugar do que não é chamada à ação | igual | — |

## 7. Superar

| Critério        | ReUI | Slotted hoje | Alvo | Fonte |
| --------------- | ---- | ------------ | ---- | ----- |
| Pixel grid      | `empty-icon` 72×80, 208×96, 32×32: inteiros | nenhuma parte emoldurada | molduras de `tile`, `stack` e `cards` inteiras nas três densidades (valores do § 3) | specimen depois do delta |
| Hover           | sem parte interativa própria | sem parte interativa própria | não se aplica | § 4 |
| Press           | idem | idem | não se aplica | § 4 |
| Focus           | a raiz não recebe foco | 2px, `--slotted-focus-ring-color` sobre `--slotted-surface` | sem mudança | `result-state.css` › Focus |
| Transition      | nenhuma na família | nenhuma | só propriedades que se movem na entrada e na saída, em tokens | § 5 |
| Motion          | ilustração estática, sem entrada nem saída | nenhuma | entrada e saída do § 5 | § 5 |
| Reduced motion  | nada a reduzir | nada a reduzir | durações da escala | § 5 |
| Disabled        | não se aplica | não se aplica | não se aplica | — |
| Schemes         | sem alto contraste nem cores forçadas | sem ilustração para testar | camadas e cartões desenhados com borda, que sobrevive a `forced-colors`; `forced-color-adjust: none` na ilustração, porque o tema já mapeia os tokens para cores do sistema | captura `high-contrast` e `--forced-colors active` |
| Density and RTL | sem densidade; a pilha inclina sempre para a direita | a ilustração não existe | tamanhos na escala de controlo; inclinação e deslocamentos espelhados em `rtl` | capturas `dense` e `rtl` |
| Target size     | não se aplica | não se aplica | não se aplica | — |
| Intent          | valores Tailwind | tokens | cada literal novo (26°, 0.9, 0.36, 0.3, 0.96) tem a razão escrita junto da regra, com a medida deste dossiê | `result-state.css` |

## 8. Delta

| #   | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | -------- | ------- | ---------------------------- | ------------------- |
| 1   | `specs/components/result-state/contract.json`, `contract.test.mjs` | `contrato`: eixo `illustration` (`none`, `tile`, `stack`, `cards`), padrão `none`; cenário `illustration` | § 6 linhas 1–3 | teste do contrato |
| 2   | `packages/styles/src/result-state/result-state.harness.html` | cena `illustration`: os três desenhos com glifo, `cards` sem glifo, as três `reach`, `live="polite"` | § 3 linhas de ilustração | `result-state-*-illustration` |
| 3   | `packages/styles/src/result-state/result-state.css` | título a `-0.01em`; `content` com `--slotted-space-4`; intervalo antes de `actions` com `--slotted-space-8` / `-9` | § 3 linhas `title`, `content`, `content → actions` | specimen `slotted-light-720` |
| 4   | `packages/styles/src/result-state/result-state.css` | `tile`, `stack`, `cards` sobre tokens, espelho em `rtl`, `forced-color-adjust` | § 3, § 7 Schemes, Density and RTL | capturas dos seis cenários |
| 5   | `packages/styles/src/result-state/result-state.css` | entrada e saída do § 5 | § 5, § 7 Motion | specimen `--motion reduce` e leitura na página |
| 6   | `packages/styles/src/result-state/result-state.styles.test.mjs` | asserções do eixo, da entrada e da saída, em lugar de "animates nothing" | § 5 | `node --test` |
| 7   | bindings React e Angular, páginas de referência | prop e input `illustration`; demonstração por desenho | § 6 | Storybook, depois da porta visual |
