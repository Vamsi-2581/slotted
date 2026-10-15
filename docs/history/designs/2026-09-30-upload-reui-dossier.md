# Dossiê ReUI — upload

## 0. Cabeçalho

- Família: `upload`
- Modo: `polish`, promovido a `build` pelas linhas `contrato` da secção 8 (autorização do utilizador na invocação: "pode usar polish, build, tudo que for necessário").
- Data: 2026-09-30
- HEAD: `0e804609` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/specimen/{c-attachment-1,…,c-attachment-6,c-file-upload-3,c-file-upload-4,c-file-upload-5,c-file-upload-6,c-file-upload-9}/` e `tools/harness/out/specimen/upload/`
- Fontes dos exemplos: `https://reui.io/r/styles/base-nova/c-<item>.json` (registo MIT, `/r/<item>.json` responde 307 para esse caminho). O primitivo `attachment` não tem fonte pública: `/r/styles/base-nova/attachment.json` e `/docs/components/base/attachment.md` respondem 404. As regras do primitivo foram lidas nos specimens.

## 1. Seleção

Cobertura: `direta`. O ReUI publica 10 exemplos `c-file-upload-*` sobre o hook `use-file-upload` e 6 exemplos `c-attachment-*` sobre o primitivo `Attachment`, que desenha a linha de um ficheiro fora e dentro de um envio.

Termos pesquisados em `llms-full.txt`: `upload` 23, `attach` 22, `file-upload` 10, `dropzone` 1, `drop zone` 0, `drag and drop` 15 (13 em kanban e grelhas, fora do âmbito).

Os blocos Pro com upload (`dialog-9`, `form-12`, `schedule-6`) não foram capturados: o registo de blocos responde 401 e os três compõem `use-file-upload`, já medido nos exemplos livres. O papel dos blocos Pro — a família em contexto de produto — é coberto por `c-attachment-2` (bandeja de composer) e `c-attachment-5` (fila de envio com contagem).

| Item               | Tipo         | Rota                                     | Parte ou interação Slotted que informa                          | Capturas                                                                 |
| ------------------ | ------------ | ---------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `c-attachment-1`   | Free example | `/preview/base/example/c-attachment-1`   | ficheiro numa resposta, ação de descarga                        | `light-1280`; estados `attachment` e `attachment-action`                 |
| `c-attachment-2`   | Free example | `/preview/base/example/c-attachment-2`   | bandeja de composer, `remove`, contagem "3 of 6 attached"      | `light-1280`                                                             |
| `c-attachment-3`   | Free example | `/preview/base/example/c-attachment-3`   | `layout="grid"`: miniatura vertical, faixa com scroll           | `light-1280`, `dark-1280`, `light-1280-motion-reduce`; estados `attachment` |
| `c-attachment-4`   | Free example | `/preview/base/example/c-attachment-4`   | `size` (default, sm, xs)                                        | `light-1280`                                                             |
| `c-attachment-5`   | Free example | `/preview/base/example/c-attachment-5`   | `item` nos cinco estados, `retry`, `remove`, resumo             | `light-1280`, `dark-1280`, `light-1280-motion-reduce`; estados `attachment-action` |
| `c-attachment-6`   | Free example | `/preview/base/example/c-attachment-6`   | `trigger` a encher uma bandeja                                  | `light-1280`                                                             |
| `c-file-upload-3`  | Free example | `/preview/base/example/c-file-upload-3`  | `dropzone`                                                      | `light-1280`; estados da região                                         |
| `c-file-upload-4`  | Free example | `/preview/base/example/c-file-upload-4`  | `layout="grid"`, `clear`                                        | `light-1280`                                                             |
| `c-file-upload-5`  | Free example | `/preview/base/example/c-file-upload-5`  | `dropzone`, `summary`, `clear`, `item`                          | `light-1280`, `dark-1280`, `light-1280-motion-reduce`; estados da região e de `button` |
| `c-file-upload-6`  | Free example | `/preview/base/example/c-file-upload-6`  | lista em tabela                                                 | `light-1280`                                                             |
| `c-file-upload-9`  | Free example | `/preview/base/example/c-file-upload-9`  | cartão de ficheiro                                              | `light-1280`                                                             |

Slotted: `slotted-{light,dark,high-contrast}-720`, `-motion-reduce`, `-forced-colors-active`, `-dense`; estados de `trigger` (`52db46`), `clear` (`026a8e`), `remove` (`71f814`), `button[data-part=filename]` (`eabbb8`), `viewerNext` (`b02b44`), `item` (`df4063`). Cenas a 720 em `tools/harness/out/shots/upload-before/`, mais `default` escuro, alto contraste, dense e rtl a 420.

## 2. Anatomia

| `data-slot` ReUI                    | Parte Slotted                     | Estado                 |
| ----------------------------------- | --------------------------------- | ---------------------- |
| região com `border-dashed` (sem `data-slot`) | `dropzone`               | igual                  |
| `input.sr-only`                     | `input`                           | igual                  |
| `button` "Select files"             | `trigger`                         | igual (o Slotted usa `label`, contrato › `anatomy.reason`) |
| título e contagem acima da lista    | `summary`                         | igual                  |
| `button` "Clear all"                | `clear`                           | igual                  |
| `attachment`                        | `item`                            | igual                  |
| `attachment-media`                  | `preview`                         | igual                  |
| `attachment-content`                | `body`                            | igual                  |
| `attachment-title`                  | `filename` (`name` + `extension`) | igual                  |
| `attachment-description`            | `detail` (`meta` + `status`)      | igual                  |
| `attachment-actions`                | `actions`                         | igual                  |
| `attachment-action`                 | `start`, `pause`, `retry`, `cancel`, `remove` | igual      |
| `attachment-group`                  | `list`                            | igual                  |
| `attachment-trigger`                | `filename` como `button`          | igual                  |
| —                                   | `progress`, `message`, `viewer*`  | só no Slotted          |

## 3. Medidas

Largura de página: ReUI 1280 (linha de 576 em `c-attachment-5`), Slotted 720. Nenhuma propriedade abaixo varia com a largura da página, exceto o `rect` da miniatura em grelha, comparado pela proporção.

| Parte       | Propriedade          | ReUI                                          | Slotted hoje                                   | Alvo                                                     | Veredicto |
| ----------- | -------------------- | --------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------- | --------- |
| `root`      | line-height          | 20 (14 × 1.43)                                | 19.5 (13 × 1.5)                                | `round(up, calc(1em * var(--slotted-line-height-md)), 1px)`: 20 a 13 | `adaptar`: a regra de `timeline.css` (`--_leading`); 19.5 põe `item` em 59.5 |
| `item`      | rect                 | 576 × 58                                      | 720 × 59.5 (`default`); 79.5, 97.5 com mensagem | 720 × 58; alturas inteiras com mensagem                  | `adaptar`: consequência da linha anterior |
| `item`      | padding bloco / linha | 8 / 8                                        | 8 / 12                                         | sem mudança                                              | `recusar`: 12 alinha a margem com a da `dropzone` (16) e a de `list-item` |
| `item`      | gap interno          | 8                                             | 8 (`--slotted-control-gap-md`)                 | sem mudança                                              | igual |
| `item`      | radius               | 14                                            | 4 (`--slotted-radius-sm`)                      | `--slotted-radius-md` (6)                                | `adaptar`: 14 não tem degrau; 6 é o de `list-item` e da `dropzone` da própria família |
| `item`      | border               | 1px `oklch(0.922 0 0)`; `idle` tracejada      | 1px `--slotted-border-subtle`, sólida em todos | tracejada em `ready`                                     | `adotar`: tracejado diz "ainda não enviado" sem cor, compatível com a regra da família de não dar cor a quem não foi enviado |
| `list`      | gap entre linhas     | 8 (y 28 → 94, altura 58)                      | 4 (`--slotted-space-2`)                        | `--slotted-space-4` (8)                                  | `adotar`: a 4 as bordas de duas linhas leem-se como uma régua dupla (`statuses`) |
| `preview`   | tamanho / radius     | 40 / 10                                       | 32 / 4                                         | sem mudança                                              | `recusar`: 32 é `2 × --_glyph-size` e escala com a densidade; raio concêntrico com a linha a 6 |
| `preview`   | fundo                | `oklch(0.97 0 0)` com marca escura            | azulejo sólido da cor do tipo                  | sem mudança                                              | `superar`: decisão da família (`upload.css` › The chip), contraste medido em `default-theme.test.mjs` |
| `preview` (grelha) | rect          | 102 × 102 (vertical)                          | 157 × 117.66 e 123.66 (`aspect-ratio: 4/3`)    | altura `round(down, 75cqi, 1px)`                         | `adaptar`: a proporção sobre uma coluna fracionária dá altura fracionária |
| `name`      | font-size / weight / linha | 14 / 500 / 17.5                         | 13 / 400 / 19.5                                | 13 / 500 / 20                                            | `adotar` o peso: o nome é o título da linha; `recusar` o tamanho (escala de controlo por densidade) |
| `detail`    | font-size / linha    | 12 / 16                                       | 12 / 18                                        | 12 / 18 declarado                                        | igual; a linha passa a ser declarada porque a raiz deixa de herdar um número |
| `detail`    | separador            | ponto de 4 px a `oklab(0.556 0 0 / 0.4)`      | `·` em texto                                   | sem mudança                                              | `recusar`: o carácter é pontuação e quebra com a linha (`upload.css` › meta) |
| `actions` > controlo | tamanho / radius / glifo | 24 / 8 / 12                          | 24 / 4 / 16                                    | sem mudança                                              | igual no alvo; glifo de 12 fica abaixo do mínimo de 14 da família |
| `trigger`   | altura / peso / radius | 32 / 500 / 10 (preenchido)                  | 34 / 600 / 4 (contorno)                        | sem mudança                                              | `recusar`: segue `--slotted-control-*`, como `button` |
| `dropzone`  | rect / padding        | 672 × 428 / 48                              | 720 × 161.5 / 32 16                            | 720 × 162                                                | `adaptar`: pela linha da raiz |
| `dropzone`  | border               | 1px tracejada `oklab(0.556 0 0 / 0.25)`       | 1.5px tracejada `--slotted-border-strong`      | sem mudança                                              | `superar`: 1.5 contra 1 e cor opaca a 3.6 : 1 contra a página |
| `summary`, `clear` | altura        | 28 (`clear` como botão)                       | 23.5                                           | 24                                                       | `adaptar`: pela linha da raiz |
| `viewerHeader` | altura            | sem análogo                                   | 57.5                                           | 58                                                       | `adaptar`: pela linha da raiz |

## 4. Coreografia de estados

| Parte                 | Estado     | Delta ReUI                                              | Delta Slotted hoje                                              | Alvo |
| --------------------- | ---------- | ------------------------------------------------------- | --------------------------------------------------------------- | ---- |
| `dropzone`            | hover      | border `oklab(0.556 0 0 / 0.25)` → `/ 0.5`              | vazio                                                           | `data-browsable`: border → `--slotted-text-muted`; fundo → mistura de 4% do texto (ΔL 0.031) |
| `dropzone`            | active     | igual ao hover                                          | vazio                                                           | mistura de 8% (ΔL 0.062), distinta do hover |
| `trigger`             | hover      | fundo `oklch(0.205)` → `/ 0.8` (preenchido)             | fundo `#fff` → `#f1f5f9`                                        | sem mudança |
| `trigger`             | active     | hover + `translate 0 1px`                               | fundo → `#e2e8f0`                                               | fundo `#e2e8f0` + `translate 0 1px` em `--slotted-duration-instant`, como `button` |
| `trigger`             | focus      | anel 3px `oklab(0.708 0 0 / 0.5)`                       | contorno 2px `--slotted-focus-ring-color` via `:has(:focus-visible)` | sem mudança |
| `start` … `remove`    | hover      | fundo → `oklch(0.97)`                                   | fundo → `currentcolor` 8%                                       | sem mudança |
| `start` … `remove`    | active     | hover + `translate 0 1px`                               | fundo → `currentcolor` 14%                                      | sem mudança: camada de estado dos controlos internos (`alert`, `toast`) |
| `filename` (`button`) | hover      | cartão `attachment` inteiro: fundo → `oklab(0.97 / 0.5)` | sublinhado                                                     | sem mudança |
| `filename` (`button`) | active     | igual ao hover                                          | igual ao hover                                                  | sublinhado + `translate 0 1px` |
| `clear`               | hover / active | fundo `#fff` → `oklch(0.97)` / + `translate`        | `currentcolor` 8% / 14%                                         | sem mudança |
| `viewerPrevious`, `viewerNext` | hover | sem análogo                                        | fundo 92% → 100% da superfície (ΔL 0.002)                       | mistura de 8% do texto sobre a superfície (ΔL ≥ 0.06) |
| `viewerPrevious`, `viewerNext` | active | sem análogo                                       | igual ao hover                                                  | mistura de 14% + `translate 0 1px` |
| `item`                | `ready`    | `idle`: borda tracejada                                 | borda sólida                                                    | borda tracejada |
| `item`                | `error`    | borda `danger / 0.3`, `media` `danger / 0.1`, texto `danger / 0.8` | fundo, borda, palavra e frase em `danger`             | sem mudança: quatro sinais registados na folha (`upload.css` › three failures) |
| `item`                | processamento | título com `tw-shimmer` 2s infinito                  | sem estado equivalente                                          | `recusar`: a família não modela processamento no servidor; o adaptador resolve quando termina |
| todos os controlos    | forced-colors hover/active | sem esquema                             | fundo `currentcolor` achatado para `Canvas`: delta invisível    | `Highlight` / `HighlightText`, como `alert` › dismiss |

## 5. Movimento

| Transição                 | ReUI                                             | Slotted hoje                                    | Alvo |
| ------------------------- | ------------------------------------------------ | ----------------------------------------------- | ---- |
| Estados de cor            | `color, background-color, border-color, …` 150ms `cubic-bezier(0.4, 0, 0.2, 1)` | `background-color, border-color` em `--slotted-control-transition-*` | sem mudança; `translate` entra na lista do `trigger`, `filename` e controlos do visualizador |
| Linha que entra           | nenhuma                                          | nenhuma                                         | `@starting-style`: `opacity 0`, `translate 0 calc(-1 * --slotted-space-2)`; `--slotted-duration-medium` `--slotted-easing-enter` |
| Linha que sai             | nenhuma                                          | nenhuma                                         | aberta: exige que o binding retenha a linha depois de `onFilesChange`, incompatível com `files` controlado sem um segundo estado. Registada em `docs/process/build-order.md` › Reaberturas |
| Spinner / shimmer         | `spin` 1s e `tw-shimmer` 2s, infinitos; continuam com `--motion reduce` (`c-attachment-5-light-1280-motion-reduce.json`) | nenhuma animação infinita; barras determinadas de `progress-indicator` | `superar` |

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| --- | --- | --- | --- | --- | --- | --- |
| Ficheiro mostrado fora de um envio (resposta, linha do tempo, bandeja) | `c-attachment-1`, `-2`, `-4` | `<Attachment size orientation state>` com filhos `AttachmentMedia`, `AttachmentTitle`, `AttachmentAction` | família nova `attachment` | a definir no `/component attachment` | `adiar para attachment` | `attachment` |
| Tamanhos `default`, `sm`, `xs` | `c-attachment-4` | `size` na linha | `size` na raiz (`sm`, `md`, `lg`) | coincidem | igual | — |
| Miniatura vertical em faixa com scroll e esbatimento | `c-attachment-3`, `-2` | `orientation="vertical"` + `AttachmentGroup` com máscara de scroll | `layout="grid"` em grelha que quebra | a grelha mostra todos os ficheiros sem scroll horizontal | `recusar` para o upload; a faixa entra no `attachment` | `attachment` |
| Estado de processamento no servidor | `c-attachment-5` | `state="processing"` + shimmer | nenhum | — | `recusar`: o adaptador só resolve depois de o servidor aceitar; um estado a mais sem evento que o termine | — |
| Contagem "N of M" | `c-attachment-2`, `-5` | texto do exemplo | `summary` | a frase hoje é inglês fixo no binding (`upload.tsx:693-694`, `upload.ts:410-417`), contra `labels.reason` do contrato | `adaptar`: `describeSummary` e `describeSelection` no provider de defaults | — |
| Região clicável com hover | `c-file-upload-3`, `-5` | região inteira é o alvo; borda escurece | `clickToBrowse` encaminha o clique, sem sinal visual | o Slotted mantém o `trigger` como alvo do teclado; o hover passa a existir só quando o clique encaminha | `adaptar`: `data-browsable` | — |

## 7. Superar

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| --- | --- | --- | --- | --- |
| Pixel grid | falha: `attachment` vertical 145.5, título 17.5 (`c-attachment-3`) | falha: `item` 59.5, `dropzone` 161.5, `preview` em grelha 117.66, `viewerStage` 294.5 | todas as partes emolduradas em píxel inteiro | `slotted-light-720.json` |
| Hover | falha: linha com ação ΔL 0.015 (`oklab(0.97/0.5)` sobre branco); região só borda | falha: `viewerNext` ΔL 0.002; `dropzone` sem delta | ΔL ≥ 0.02 em todas | estados `b02b44`, `147a85` |
| Press | falha: região e cartão com active = hover | falha: `filename` e `viewerNext` com active = hover | active distinto em todas | estados `eabbb8`, `b02b44` |
| Focus | falha: anel 3px a `oklab(0.708 0 0 / 0.5)` sobre branco, 1.5 : 1 | passa: 2px `--slotted-focus-ring-color` (`focus-ring.test.mjs`) | sem mudança | estados `71f814` |
| Transition | passa | passa | `translate` listado onde entra | `upload.css` |
| Motion | falha: nenhuma entrada ou saída | falha: nenhuma entrada ou saída | entrada; saída reaberta (secção 5) | secção 5 |
| Reduced motion | falha: spinner e shimmer continuam | passa: 0 animações | sem mudança | `-motion-reduce.json` |
| Disabled | `opacity: 0.5` | `--slotted-disabled-*` | sem mudança | `upload.css` › disabled |
| Schemes | sem alto contraste nem forced-colors | falha: hover dos controlos invisível em forced-colors | `Highlight` / `HighlightText` | `-forced-colors-active.json` |
| Density e RTL | sem eixo | passa: anatomia igual; ordem de "248 kB" em RTL vem do texto inglês da harness | sem mudança | `upload-default-light-*-420.png` |
| Target size | 24 | 24, halo de 44 em ponteiro grosso | sem mudança | `upload.css` › coarse |
| Intent | — | 4% e 8% da região novos | razão escrita junto da regra | secção 8 |

## 8. Delta

| # | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | --- | --- | --- | --- |
| 1 | `packages/styles/src/upload/upload.css` | linha da raiz e do visualizador arredondada ao píxel; `detail`, `message`, `viewerTitle`, `viewerMeta` declaram a sua | 3 `root`, `item`, `dropzone`, `summary`, `viewerHeader`; 7 Pixel grid | `slotted-light-720.json` depois |
| 2 | `packages/styles/src/upload/upload.css` | `preview` em grelha: `item` como contentor, altura `round(down, 75cqi, 1px)` | 3 `preview` (grelha) | idem |
| 3 | `packages/styles/src/upload/upload.css` | `--_item-radius` → `--slotted-radius-md`; `--_item-gap` → `--slotted-space-4` | 3 `item` radius, `list` gap | cena `statuses` |
| 4 | `packages/styles/src/upload/upload.css` | `filename` a `--slotted-font-weight-medium` | 3 `name` | cena `default` |
| 5 | `packages/styles/src/upload/upload.css` | `item[data-status='ready']` com borda tracejada | 3 `item` border; 4 `ready` | cena `statuses` |
| 6 | `packages/styles/src/upload/upload.css` | `trigger`, `filename`, `viewerPrevious`, `viewerNext`: active com `translate 0 1px`; hover e active dos controlos do visualizador por mistura | 4; 7 Hover, Press | estados `52db46`, `eabbb8`, `b02b44` |
| 7 | `packages/styles/src/upload/upload.css` | entrada da linha por `@starting-style` | 5; 7 Motion | `upload.styles.test.mjs` |
| 8 | `packages/styles/src/upload/upload.css` | forced-colors: hover e active em `Highlight` | 4; 7 Schemes | `-forced-colors-active` com estados |
| 9 | `specs/components/upload/contract.json` (`contrato`) | estado `browsable` → `data-browsable` na `dropzone` | 4 `dropzone`; 6 região | `contract.test.mjs` |
| 10 | `packages/react/src/upload/upload.tsx`, `packages/angular/upload/src/upload.ts`, `upload.harness.html` | `data-browsable` quando `clickToBrowse` e a família aceita | 9 | testes dos bindings |
| 11 | `packages/styles/src/upload/upload.css` | `dropzone[data-browsable]`: hover e active | 4 `dropzone`; 7 Hover | estados `dropzone` |
| 12 | `specs/components/upload/contract.json` (`contrato`), defaults e bindings | `describeSummary` e `describeSelection` no provider; frase do resumo, "N files" e anúncio saem do código | 6 contagem | testes dos bindings |
| 13 | `docs/process/build-order.md` | reabertura: saída animada da linha | 5 saída | — |

## 9. Resultado

Recaptura `slotted-light-720.json` depois das linhas 1–12, e estados `0f2f60` (região), `52db46`, `eabbb8`, `b02b44`, `71f814` (forced-colors).

| Linha do dossiê | Antes | Depois |
| --- | --- | --- |
| 3 `item` rect | 59.5; 79.5; 97.5 | 60; 80; 98 (a linha de detalhe arredonda 18 e o corpo soma 42) |
| 3 `dropzone`, `summary`, `clear`, `viewerHeader`, `viewerStage` | 161.5; 23.5; 23.5; 57.5; 294.5 | 162; 24; 24; 58; 294 |
| 3 `preview` em grelha | 117.66 e 123.66 lado a lado | 111 nos três cartões |
| 3 `item` radius, `list` gap | 4; 4 | 6; 8 |
| 3 `name` | 400 / 19.5 | 500 / 20 (a captura desenha 400: a máquina não tem Geist e o DejaVu não tem o peso 500) |
| 4 `dropzone` hover / active | vazio | ΔL 0.031 / 0.062 no claro, 0.043 / 0.077 no escuro; borda `#78899c` → `#5b6b7f` |
| 4 `trigger` active | fundo | fundo + `translate 0 1px` |
| 4 `filename` active | igual ao hover | + `translate 0 1px` |
| 4 `viewerNext` hover / active | ΔL 0.002 / igual | ΔL 0.063 / 0.111 + `translate 0 1px` |
| 4 forced-colors | delta invisível | `Highlight` / `HighlightText` |
| 7 Pixel grid | 4 partes emolduradas fracionárias | 0; resta `body` em grelha (52.67, parte de texto isenta) |
| 7 Motion | sem entrada | entrada `@starting-style`; saída reaberta em `docs/process/build-order.md` |

Achados fora das linhas previstas, corrigidos no mesmo passe: a variante `field` pintava borda e fundo diretamente e não respondia a `invalid`, `disabled` nem ao veredicto do arraste (`--_zone-edge` e `--_zone-ground`); o anúncio "N files added" nunca era feito no React e contava as recusas no Angular (erro de sinal nos dois); o Angular não anunciava o fim da fila, a falha nem o cancelamento; o formatter `duration` faltava no Angular; o cartão em grelha distribuía a altura sobrante entre a miniatura e o nome (`align-content: start`).
