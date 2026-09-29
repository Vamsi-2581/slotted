# Dossiê ReUI — toast

## 0. Cabeçalho

- Família: `toast`
- Modo: `polish`
- Data: 2026-09-29
- HEAD: `ff5fe279` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/specimen/{c-sonner-4,c-sonner-6,c-sonner-18,rx-c-sonner-6,rx-settings-1,rx-profile-7}/` e `tools/harness/out/specimen/toast/`
- Fontes dos exemplos: `https://reui.io/r/c-sonner-<n>.json` (registo MIT), lidas sem cópia no repositório

## 1. Seleção

Cobertura: `direta`. O ReUI publica 21 exemplos `c-sonner-*`. O primitivo é o `Sonner` do shadcn/ui: `https://reui.io/r/sonner.json` responde `404 … sonner is part of shadcn/ui, not a ReUI item`. As regras `nova` do primitivo foram lidas nos specimens.

Termos pesquisados em `llms-full.txt`: `sonner` 22, `Sonner` 22, `toast` 8, `Toast` 1, `Toaster` 1, `notification` 17, `snackbar` 0.

A rota `/preview/base/example/c-sonner-6` perdeu as folhas de estilo depois do clique numa das capturas (34 tokens na raiz contra 523 nas restantes, `c-sonner-6-light-1280-click-button-7b7fcc-data-sonner-toast-data-s-65bbd0.json`). Essa captura foi substituída pela rota `radix` (`rx-c-sonner-6`). `form-7` não renderizou toast depois de editar e guardar um campo (`--states … no rendered element matches`, duas tentativas); `profile-7` ocupa o lugar do segundo bloco Pro.

| Item           | Tipo         | Rota                                     | Parte ou interação Slotted que informa                              | Capturas                                                                   |
| -------------- | ------------ | ---------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `c-sonner-4`   | Free example | `/preview/base/example/c-sonner-4`       | `icon` por tom (`success`, `danger`, `loading`)                     | `light-1280` (cliques 2, 3, 6), `dark-1280` (clique 2); estados `65bbd0`   |
| `c-sonner-6`   | Free example | `/preview/radix/example/c-sonner-6`      | `title`, `description`, `actions` (Undo)                            | `rx-…-light-1280`, `dark-1280`, `light-1280-motion-reduce`; estados `65bbd0` |
| `c-sonner-18`  | Free example | `/preview/base/example/c-sonner-18`      | `close`                                                             | `light-1280`, `dark-1280`; estados `65bbd0`                                |
| `settings-1`   | Pro block    | `/preview/radix/settings-1`              | aviso de limite num passo de assistente; título e descrição         | `light-1280`, `dark-1280` após três cliques em checkbox; estados `65bbd0`  |
| `profile-7`    | Pro block    | `/preview/radix/profile-7`               | confirmação de gravação; pilha em movimento                         | `light-1280`, `dark-1280` após clique em Save; estados `65bbd0`            |

Slotted: `slotted-{light,dark,high-contrast}-720` com estados de `item`, `close`, `title`, `description`, `icon` (`cce436`, 40 elementos); `-motion-reduce`, `-forced` (com estados), `-dense`, `-rtl`.

## 2. Anatomia

| `data-slot` / atributo ReUI | Parte Slotted | Estado              |
| --------------------------- | ------------- | ------------------- |
| `[data-sonner-toaster]` (`ol`) | `root` + `list` | igual (o Slotted separa a região `section` da lista `ol`) |
| `[data-sonner-toast]` (`li`) | `item`       | igual               |
| `[data-icon]`               | `icon`        | igual               |
| `[data-content]`            | `content`     | igual               |
| `[data-title]`              | `title`       | igual               |
| `[data-description]`        | `description` | igual               |
| `[data-button][data-action]`, `[data-cancel]` | `actions` | igual (o Slotted recebe botões da família `button`) |
| `[data-close-button]`       | `close`       | igual               |
| —                           | `progress`    | só no Slotted       |

## 3. Medidas

Largura de página: ReUI 1280, Slotted 720. A mensagem mede 356 no ReUI e 384 (`24rem`) no Slotted nas duas larguras; nenhuma propriedade abaixo varia com a largura da página.

| Parte         | Propriedade            | ReUI                                            | Slotted hoje                                                 | Alvo                                                         | Veredicto                                                                                          |
| ------------- | ---------------------- | ----------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `item`        | rect, uma linha        | 356 × 37.25 (`c-sonner-4`)                      | 384 × 45.5 (`tones`)                                         | 384 × 46                                                     | `adaptar`: a linha de 19.5 põe as duas alturas fora da grelha (linha seguinte)                     |
| `item`        | rect, título e descrição | 356 × 55.75 (`c-sonner-18`), 72.25 (`rx-c-sonner-6`) | 384 × 69 (`default`), 88.5 e 84.5 (`content`)          | 384 × 70; `content` em píxel inteiro                          | `adaptar`: idem                                                                                    |
| `item`        | line-height            | 19.5 (13 × 1.5)                                  | 19.5 (13 × 1.5)                                              | `round(nearest, calc(var(--_line-height) * 1em), 2px)`: 20 a 13, 18 a 12 | `adaptar`: regra de `alert.css` (`alert` dossiê 2026-09-25)                                        |
| `item`        | padding bloco / linha  | 8 / 12                                          | 12 / 16                                                      | sem mudança                                                  | `recusar`: 8 deixa 8 entre o texto e a borda de uma superfície flutuante; `alert` usa 12 / 16       |
| `item`        | gap marca–texto        | 8                                               | 8 (margem da marca)                                          | sem mudança                                                  | igual                                                                                              |
| `item`        | font-size              | 13                                              | 13 (`--slotted-control-font-size-md`)                        | sem mudança                                                  | igual                                                                                              |
| `item`        | radius                 | 10                                              | 8                                                            | `--slotted-radius-lg`                                        | `recusar`: 10 não tem degrau                                                                       |
| `item`        | border                 | 1px `oklch(0.922 0 0)`; escuro `oklch(1 0 0 / 0.1)` | 1px `rgb(216,222,230)` (`--slotted-border-subtle`)       | sem mudança                                                  | igual por papel                                                                                    |
| `item`        | sombra                 | `0 4px 12px rgba(0,0,0,0.1)`, igual no escuro   | `--slotted-shadow-md` (duas camadas a 0.08)                   | sem mudança                                                  | `recusar`: o token existe; o gap de 12 foi medido contra ele (comentário de `--_gap`)               |
| `item`        | gap entre mensagens    | não medido: uma mensagem por captura             | 12 (`--slotted-space-5`)                                     | sem mudança                                                  | sem comparação                                                                                     |
| `title`       | font-size / weight / linha | 14 / 500 / 19.25                             | 13 / 600 / 19.5                                              | 13 / 600 / 20                                                | `recusar` tamanho e peso: o título segue a escala de controlo por densidade; linha pela linha 3     |
| `description` | font-size / linha / cor | 12 / 16.5 / `rgb(63,63,63)`                    | 13 / 19.5 / `rgb(91,107,127)` (`--slotted-text-muted`)        | 13 / 20                                                      | `recusar` tamanho: 12 abaixo de 13 no corpo da mensagem; linha pela linha 3                         |
| `icon`        | caixa                  | 16 × 16, contorno                               | 13 × 13 (`1em`), contorno                                    | decisão do gate (§ 8, linha 5)                                | `adaptar` ou `recusar`: `status-mark.test.mjs` fixa `1em` para `toast` e `round(nearest, 1.2em, 2px)` para `alert` |
| `icon`        | posição no rect        | y + 1.63 dentro de uma linha de 19.25            | margem `(1lh − 13) / 2` = 3.25                              | com linha 20: 3.5 (marca 13) ou 2 (marca 16)                  | ligado à linha anterior                                                                           |
| `close`       | rect / radius          | 20 × 20, `50%`, fora do canto (translate −7, −7) | 24 × 24, 4, dentro da grelha                                | sem mudança                                                  | `superar`: 20 < 24 (WCAG 2.5.8); o Slotted chega a 44 sob `pointer: coarse`                        |
| `close`       | border                 | 1px `rgb(237,237,237)`, fundo `oklch(1 0 0)`    | nenhuma, fundo transparente                                  | sem mudança                                                  | `recusar`: um círculo a cavalo no canto sai da caixa que o `item` recorta (`overflow: hidden`)      |
| `actions`     | botão                  | 24 alto, padding 8, 12/500, radius 4, sólido escuro, ao lado do texto | 30 alto (`button` `sm`), linha própria sob o texto | sem mudança                                    | `outra família`: `button`; posição `recusar` (comentário de `actions` em `toast.css`)              |
| `progress`    | rect                   | —                                               | 2 alto, `--_solid` do tom                                   | sem mudança                                                  | só no Slotted                                                                                      |

## 4. Coreografia de estados

| Parte    | Estado        | Delta ReUI                                                                    | Delta Slotted hoje                                                                                      | Alvo                                                                        |
| -------- | ------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `close`  | hover         | fundo `oklch(1 0 0)` → `rgb(248,248,248)`, borda → `rgb(232,232,232)`; ΔL 0.021 claro | fundo → `currentcolor` 8%; ΔL 0.056 `raised` claro, 0.035 `soft`, **0.019 `solid` `danger` claro e escuro** | `currentcolor` 10% (`--slotted-toast-state-layer-hover`): ΔL ≥ 0.025 em `solid` |
| `close`  | active        | igual ao hover                                                                | fundo → `currentcolor` 14%; ΔL 0.037 em `solid` `danger`                                                | `currentcolor` 16%                                                          |
| `close`  | focus-visible | `outline: auto 1px` + anel `0 0 0 2px rgba(0,0,0,0.2)` (≈ 1.6:1 sobre branco) | outline 2px `--slotted-focus-ring-color`, offset −2: 5.17:1 claro, 7.04:1 escuro; em `solid` o halo `on-solid` interior dá 5.17:1 | sem mudança                                                                 |
| `item`   | hover         | vazio; em pilha fechada, abre a pilha (`profile-7`: opacity 0.41 → 1, translate −33 → 0) | vazio; a região marca `data-expanded` e pausa o temporizador                                     | sem mudança no item; ver a linha seguinte                                   |
| `item`   | hover no gap entre mensagens | o Sonner preenche o gap com um pseudo-elemento em cada toast (`emil-design-eng`, The Sonner Principles, 4) | `section` e `ol` com `pointer-events: none`: o ponteiro no gap de 12 sai da região, `pointerleave` limpa a pausa, a pilha fecha e o temporizador retoma (`toast.tsx` `onPointerLeave`, `toast.ts` `(pointerleave)`) | a lista recebe o ponteiro enquanto a região está `data-expanded`             |
| `item`   | focus-visible | anel `0 0 0 2px rgba(0,0,0,0.2)` (≈ 1.6:1)                                     | outline 2px, offset 2, fora da mensagem: 5.17:1 claro, 7.04:1 escuro, preto em alto contraste           | sem mudança                                                                 |
| `action` | hover / active | vazio (`rx-c-sonner-6`, índice 3)                                             | família `button`                                                                                        | `outra família`: `button`                                                   |
| `action` | focus-visible | anel `0 0 0 2px rgba(0,0,0,0.4)`                                              | família `button`                                                                                        | `outra família`: `button`                                                   |

## 5. Movimento

| Lado         | Parte      | Entrada                                                         | Saída                                                          | Movimento reduzido                                                   |
| ------------ | ---------- | --------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| ReUI         | toast      | `transform` translateY(−100%) → 0 e `opacity` 0 → 1, 400ms `ease` | o mesmo caminho invertido, 400ms `ease`; swipe por `@keyframes swipe-out-*` | `transition: none` (`-motion-reduce`: durações 0s)                   |
| ReUI         | pilha      | `transform`, `opacity`, `height` 400ms `ease`; `box-shadow` 200ms | idem                                                          | idem                                                                 |
| Slotted hoje | `item`     | `opacity` e `translate` 20 px → 0, 200ms `--slotted-easing-enter` | `opacity` e `translate`, 120ms `--slotted-easing-exit`        | 0.001s                                                               |
| Slotted hoje | pilha      | `block-size`, `opacity`, `translate` 200ms `--slotted-easing-standard` | idem                                                     | 0.001s                                                               |
| Slotted hoje | `progress` | `slotted-toast-countdown` na duração da mensagem                 | —                                                              | `animation-play-state: paused` e `inline-size: 100%`; a cena `timing` (atraso −1s) fica a 305.59 de 382: a animação com `fill-mode: forwards` sobrepõe-se ao `inline-size` declarado |
| Slotted alvo | `progress` | sem mudança                                                     | —                                                              | `animation-name: none`: a régua cheia que o comentário descreve       |

A saída do ReUI dura o mesmo que a entrada, com a mesma curva. O Slotted sai em 120ms contra 200ms de entrada.

## 6. Capacidades

| Capacidade                                  | Onde aparece no ReUI                     | Forma no ReUI                                              | Forma no Slotted                                                                           | Em que a forma Slotted é melhor                                                               | Veredicto | Família dona, se não esta |
| ------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | --------- | ------------------------- |
| Mensagem que se atualiza pelo id            | `c-sonner-21`, `c-sonner-7` (`toast.promise`) | `toast(…, { id })`; `toast.promise(p, { loading, success, error })` | `dedupe` por id no `queueing`; `loading` como estado e `progress-indicator` na marca      | as duas formas coincidem                                                                      | `adotar`  | —                         |
| Botão de ação e botão de cancelar           | `c-sonner-6`, `c-sonner-8`               | opções `action` e `cancel` com `label` e `onClick`          | parte `actions` com botões da família `button`                                             | composição: qualquer número de botões nativos com a variante da família `button`                | `adaptar` | —                         |
| Conteúdo livre (`toast.custom`)             | `c-sonner-9` a `-17`, `-20`              | `toast.custom((id) => <JSX/>)`                              | `content` com nós do consumidor (`declined.customToast`)                                   | as partes da família continuam a dar posição, foco e fecho ao conteúdo livre                   | `recusar` | —                         |
| Contagem decrescente visível                | `c-sonner-16`                            | texto `Ns` atualizado por `setInterval` no JSX              | `progress`, lido de `--slotted-toast-duration` e `--slotted-toast-play-state`               | a barra e o temporizador leem o mesmo número e pausam juntos                                   | `adaptar` | —                         |
| Upload com progresso                         | `c-sonner-10`                            | `toast.custom` com barra desenhada à mão                    | `progress-indicator` dentro de `content`                                                    | a barra tem papel e valor acessíveis da família dona                                          | `adiar para progress-indicator` | `progress-indicator` |
| Botão de fecho fora do canto                | `c-sonner-18`                            | `closeButton` + classes de posição                          | `close` dentro da grelha                                                                   | alvo de 24 (44 em toque) sem sair da caixa recortada                                           | `recusar` | —                         |
| Seis posições                               | `c-sonner-3`                             | `position` físico (`top-left`…)                            | `placement` lógico (`top-start`…)                                                           | espelha em RTL sem segunda regra                                                              | `adotar`  | —                         |

## 7. Superar

| Critério        | ReUI                                                             | Slotted hoje                                                                                           | Alvo                                                          | Fonte                                                    |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------- |
| Pixel grid      | falha: toast 37.25, 55.75, 72.25                                 | falha: `item` 45.5, 88.5, 84.5 (confortável); `dense` passa (44, 66, 102)                              | `item` em píxel inteiro em todas as cenas                      | `slotted-light-720-…-cce436`, `-dense`                   |
| Hover           | falha: `action` com delta vazio                                   | falha: `close` ΔL 0.019 em `solid` `danger`, claro e escuro                                            | ΔL ≥ 0.025                                                    | estados `65bbd0`, `cce436`                               |
| Press           | falha: `close` active = hover                                     | passa: 14% contra 8%                                                                                    | 16% contra 10%                                                | idem                                                     |
| Focus           | falha: anel 2px a 0.2 de preto (≈ 1.6:1)                          | passa: 5.17:1 claro, 7.04:1 escuro, preto em alto contraste; halo em `solid`                            | `superar`                                                     | estados `focus`, três esquemas                           |
| Transition      | passa: `background` e `border-color` listados no `close`          | passa: `background-color`, `color` em motion tokens                                                     | `superar` nos tokens                                           | estados                                                  |
| Motion          | falha: saída com a duração e a curva da entrada (400ms `ease`)     | passa: entrada 200ms `--slotted-easing-enter`, saída 120ms `--slotted-easing-exit`                     | `superar`                                                     | `rest` de `item` nos dois lados                          |
| Reduced motion  | passa: `transition: none`                                          | passa nas transições (0.001s); a barra congela a 80% na cena `timing`                                  | régua cheia (`animation-name: none`)                           | `-motion-reduce` dos dois lados                          |
| Disabled        | não se aplica: nenhum controlo desativado                          | não se aplica                                                                                          | —                                                             | —                                                        |
| Schemes         | sem alto contraste nem cores forçadas                              | passa: borda preta em alto contraste; `-forced` com borda, marca, fecho e barra em `CanvasText`          | `superar`                                                     | `slotted-high-contrast-720`, `-forced`                   |
| Density and RTL | sem eixo                                                           | passa: `dense` reduz `item` de 69 para 66 e botões para 24; `rtl` espelha marca e fecho                 | `superar`                                                     | `-dense`, `-rtl`                                         |
| Target size     | falha: `close` 20 × 20                                             | passa: `close` 24, 44 sob `pointer: coarse`                                                            | `superar`                                                     | estados                                                  |
| Intent          | classes Tailwind sem razão escrita                                 | passa; o comentário da marca afirma que segue a regra de `alert`, que passou a `round(nearest, 1.2em, 2px)` | comentário corrigido com a decisão do gate               | `toast.css` (marca), `alert.css` (`--_mark-size`)        |

## 8. Delta

| #   | Ficheiro                                          | Mudança                                                                                                                                                                                 | Linhas do dossiê que resolve                             | Captura que o prova                                                          |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | `packages/styles/src/toast/toast.css`             | `item` com `line-height: round(nearest, calc(var(--_line-height) * 1em), 2px)`: 20 a 13, 18 a 12                                                                                        | § 3 `item` rect e line-height; § 7 Pixel grid             | `slotted-light-720-…-cce436`: nenhum `item` fracionário                       |
| 2   | idem                                              | `--slotted-toast-state-layer-hover` 8% → 10%, `-active` 14% → 16%                                                                                                                        | § 4 `close` hover e active; § 7 Hover, Press              | estados `cce436`: ΔL ≥ 0.025 em `solid` `danger`, claro e escuro              |
| 3   | idem                                              | `[data-ui='toast'][data-expanded] > [data-part='list'] { pointer-events: auto }`: o gap entre mensagens fica dentro da região enquanto ela está aberta                                     | § 4 hover no gap (modo `list`)                            | `toast.styles.test.mjs`: asserção nova; nenhuma captura mostra o hover no gap |
| 4   | idem                                              | `progress` sob `prefers-reduced-motion`: `animation-name: none` no lugar de `animation-play-state: paused`                                                                                | § 5 `progress`; § 7 Reduced motion                        | `-motion-reduce`: `progress` com a largura do `item` menos a borda            |
| 5   | `toast.css`, `status-mark.test.mjs`, `toast.harness.html`, `packages/react/src/toast/toast-parts.tsx`, `packages/angular/toast/src/toast-parts.ts` | marca de `alert` (decisão do gate): disco `solid` a `round(nearest, 1.2em, 2px)` (16 a 13, 14 a 12), caixa do glifo a 12/11, suspensa da linha de base por `round(nearest, (mark − 1cap) / 2, 1px)`; `content` em `align-self: baseline`; `Glyph` `solid` nas duas bindings e nas 23 marcas da harness | § 3 `icon`; § 7 Intent                                   | `slotted-light-720`: `icon` 16 × 16                                           |
| 6   | `packages/styles/src/toast/toast.styles.test.mjs` | asserções da linha par, do state layer 10/16, da lista com ponteiro em `data-expanded` e da régua cheia sob movimento reduzido                                                            | 8 linhas 1–4                                             | `pnpm check:affected`                                                        |
| 7   | `contract.json`, bindings — `contrato`             | modo `stack`: a lista tem altura 0 (mensagens absolutas), por isso a linha 3 não cobre o gap aberto. Exige uma altura total medida (`--slotted-toast-stack-height`) em `runtimeProperties` | § 4 hover no gap (modo `stack`)                           | não aplicado: move a correção para `build`                                   |
| 8   | `packages/styles/src/button/` — `outra família`   | nenhum: o delta de hover do botão de ação é da família `button`                                                                                                                          | § 4 `action`                                             | não aplicado                                                                 |

## Gate

2026-09-29: marca igual à de `alert` (linha 5, opção c); modo `stack` registado e adiado (linha 7).

## Recaptura

`slotted-{light,dark,high-contrast}-720-data-ui-toast-data-part-cce436.json`, `-motion-reduce`, `-forced`, `-dense`, `-rtl`, depois do delta.

| Linha do dossiê                     | Antes                                              | Depois                                                                     |
| ----------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| 3 `item` rect                       | 45.5, 69, 88.5, 84.5, 111                          | 46, 70, 90, 86, 112; `dense` 44, 66, 102 (sem mudança)                      |
| 3 `item` line-height                | 19.5                                               | 20; `dense` 18                                                             |
| 3 `icon` caixa                      | 13 × 13, contorno, y 409.25                        | 16 × 16, disco `solid`, y 405 (título em 405, linha 20); `dense` 14 × 14   |
| 4 `close` hover, `solid` `danger`   | ΔL 0.019 claro e escuro                            | ΔL 0.025 claro e escuro, 0.038 alto contraste; active 0.043                |
| 4 `close` hover, `raised`           | ΔL 0.056 claro, 0.077 escuro                       | ΔL 0.070 claro, 0.095 escuro                                               |
| 5 `progress` sob movimento reduzido | 305.59 de 382, `slotted-toast-countdown`           | 382, `animation-name: none`                                                |
| 7 Schemes                           | marca em contorno `CanvasText`                     | disco `CanvasText` com o símbolo recortado (`-forced`)                     |
| 7 Density and RTL                   | —                                                  | `rtl`: marca em x 410, à direita do título; nenhuma parte enquadrada fracionária |

O hover no gap (§ 4) não tem captura: o specimen não posiciona o ponteiro entre dois elementos. A asserção de `toast.styles.test.mjs` fixa a regra.

Não aplicados: linha 7 (`contrato`, modo `stack`) e linha 8 (`outra família`: `button`).
