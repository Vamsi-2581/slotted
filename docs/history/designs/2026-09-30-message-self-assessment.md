# message e message-scroller — autoavaliação

Famílias novas. O inventário e as decisões estão em `2026-09-30-message-design.md`, e as medidas ReUI em `2026-09-30-message-reui-dossier.md`. Contratos: `specs/components/message/contract.json` e `specs/components/message-scroller/contract.json`. Specimens: `tools/harness/out/specimen/message/` e `tools/harness/out/specimen/message-scroller/`. Capturas de harness: `tools/harness/out/message.html` e `tools/harness/out/message-scroller.html`.

## 1. Craft bar

| Critério | Número que decide | Specimen | Veredicto |
| --- | --- | --- | --- |
| Pixel grid | Bolha de uma linha com 39 de altura (linha de 21, padding 8, borda 1). Cabeçalho 17; `meta` 20 com dígitos e marca de 14 em y inteiro (180, 183, 285). Reação 24, `more` 24, versões 24, `retry` 24 × 24, `jump` 34 | `message/slotted-light-720.json`, `message/slotted-light-720-dense.json`, `message-scroller/slotted-light-420.json` | passa; ReUI falha (bolha 40.75, `c-bubble-2`) |
| Hover | `content` interativo: ΔL 0.045 (soft accent). `retry`: `#dc2626` → `oklab(0.636)`, ΔL 0.059. `jump`: ΔL 0.048 em `light` (1 → 0.952) e 0.047 em `dark` (0.205 → 0.252). Tinta sobre accent sólido: ΔL 0.030 | `message/slotted-light-720-data-part-retry-d33276.json`, `message-scroller/slotted-{light,dark}-420-data-part-jump-data-acti-6bd427.json`, `message/slotted-light-720-data-part-content-is-but-7e4f01.json` | passa |
| Press | `retry`: `solid-active` `#991b1b`, diferente da mistura do hover. `jump`: 0.905 contra 0.952 do hover, com `translate` de 2 px. Reação premida: mistura de 12 % contra 6 % | os mesmos | passa; ReUI falha (press igual ao hover) |
| Focus | Anel de 2 px em `--slotted-focus-ring-color`, com `outline-offset` de 2 px. `#2563eb` sobre branco dá 5.2:1 e `#60a5fa` sobre `rgb(23,23,25)` dá 7.0:1; em `high-contrast` o anel é preto sobre branco | `…-jump-…-6bd427.json` nos três esquemas; `…-content-is-but-7e4f01-*-focus.png` | passa |
| Transition | `background-color`, `border-color`, `color`, `opacity`, `translate` e `scale` listados, sem `all`; as durações são tokens (`motion.test.mjs`) | `message.css`, `message-scroller.css` | passa |
| Motion | `jump` entra em `medium`/`enter` e sai em `short`/`exit`. `item` novo e rasto de `typing` entram por `@starting-style`. Destaque `current` apaga-se em `long` | `message-scroller.css`; cenário `tools/harness/scenarios/message-scroller-live.mjs` | falha parcial: saída de uma mensagem removida não animada (secção 5) |
| Reduced motion | Pontos de `typing`, `caret`, relógio de `sending`, faixa do passo corrente e entrada de linha param; `scrollToMessage` passa de `smooth` a `auto` (`resolveBehavior`) | `message/slotted-light-720-motion-reduce.json`; teste `resolveBehavior` em `message-scroller.test.ts` | passa |
| Disabled | Reação desativada em `--slotted-disabled-foreground`, sem `opacity` | cena `reactions` | passa |
| Schemes | `soft` com aresta em `high-contrast`; `meta` a 8.39:1; em forced-colors as bolhas ganham aresta `CanvasText` e a reação premida fica em `Highlight` | `message/slotted-light-720-forced.json`, `…-high-contrast-720-…-7e4f01.json` | passa |
| Density e RTL | Padding da bolha 8/6/4, raio 16/12/8, avatar 28/26/24, gap do scroller 20/15/10. Em RTL o lado, os cantos da corrida, os chevrons de versões, o `retry` e o `translate` do `jump` espelham; citação em `unicode-bidi: plaintext` | `message/slotted-light-720-dense.json`; capturas `rtl` da harness | passa |
| Target size | Reação, `more`, versões e `retry` ≥ 24 (`--slotted-target-min`); `jump` 34 | rects nos specimens acima | passa |
| Intent | Literais com razão escrita ao lado: 6 %/12 % dos state layers, 14 % no hover de `retry`, 90 % da tinta de `meta` (4.50:1 no accent escuro), rotação de -45deg, 80 % de largura máxima, 1600 ms de `data-current` (motor, não CSS) | `message.css`, `message-scroller.css`, desenho §7 e §8 | passa |

## 2. Onze dimensões

| Dimensão | Estado | Mudança que mais melhoraria | Feita |
| --- | --- | --- | --- |
| Icons | Marcas de recibo por glifo da escala; `check-check` acrescentado à escala partilhada | Seta vertical própria para o `jump` em vez de `arrow-left` rodado | não: a rotação dá a mesma geometria e uma seta nova só teria um consumidor |
| Motion | Entrada de linha, `jump`, rasto de escrita, destaque do salto | Saída de uma mensagem apagada | não: exige reter o nó depois da mudança da lista do consumidor, a mesma dívida de `attachment` e `upload` |
| Responsiveness | Bolha a 80 % da linha; `thread` com ações em fluxo sem `hover:hover`; nomes longos com reticências | Consulta de contentor que reduz a largura máxima para 90 % abaixo de 360 px | não: a 360 px uma bolha de 80 % ainda leva 36 caracteres por linha (captura do cenário `layout`) |
| Refinement | Cantos da corrida achatados a 4; `meta` dentro da bolha, em pixels inteiros; `retry` ao lado da bolha | Largura da última linha medida para `meta` não quebrar para uma linha própria quando cabe | não: exige medir o texto em JS; o `float` quebra só quando falta espaço real |
| Tokens | Fundação e `--slotted-message-*`; duas propriedades de runtime registadas | Tokens de componente para a cor de `read` | não: `--_read-ink` resolve para `on-solid` ou `accent-text` e nenhum tema pede outro valor |
| Patterns | APG: `log` dentro de `region` focável; `article` por mensagem; teclas de `feed` declinadas (desenho §5) | Teclas `PageDown`/`PageUp` entre artigos como em `feed` | não: o `region` focável já rola com as teclas nativas e `feed` exige `aria-setsize`, que uma conversa com histórico por pedido não conhece |
| Accessibility | Artigo nomeado pelo autor; recibo com palavra; `typing` com nome; `busy` e contagem anunciados pelo `live-announcer`; `jump` inerte quando inativo | Anunciar pelo `live-announcer` cada mensagem chegada fora de vista | não: o `log` já anuncia as adições; a contagem fica no nome do `jump` (`jumpCount` em ICU plural), lido quando o foco chega |
| Native API | `render`, `ref` com `scrollToMessage`/`scrollToEnd`/`scrollToStart`/`focus`; `aria-label` do consumidor prevalece sobre `aria-labelledby`; `HostAttributeToken` em Angular | — | — |
| Capability | Inventário completo: recibo, `retry`, `activity`, `typing`, versões, citação, reações, corte, âncora de turno, histórico anterior, salto, não lidas, separador fixo | Virtualização de listas longas | não: `content-visibility: auto` nos `item` cobre o custo de pintura; a virtualização muda o contrato de âncora e fica para quando uma demo medir o problema |
| Ecosystem | `MessageDefaultsProvider`, `MessageScrollerDefaultsProvider`, `provide*Defaults`, `exportAs`, `model()` com `…ChangeRequest`, handlers compostos | — | — |
| Documentation | Seis páginas de referência (Message, Bubble e MessageScroller nos dois frameworks), mais a página Overview da família `message`; `audit.mjs` com saída 0 a 1280 e 620 | Página de receita que compõe `message-scroller`, `message` e `prompt-composer` | não: `prompt-composer` está em construção noutra sessão, sem commit |

## 3. Correções feitas a partir das capturas

| Antes | Depois | Porquê |
| --- | --- | --- |
| Corte mostrava a linha seguinte no padding | `overflow: clip; overflow-clip-margin: content-box` | `-webkit-line-clamp` só corta o conteúdo, não a caixa |
| Raio fixo fazia da bolha densa uma pílula | Raio `calc(var(--_pad-block) * 2)` | o raio segue a densidade |
| `meta` a 68 % da tinta dava 3.24:1 | 90 % | 4.50:1 no accent escuro |
| Bolha falhada desbotada dava 4.2:1 | sem regra própria; `retry` e palavra no rodapé | o texto da mensagem mantém o contraste do tom |
| Separador fixo como referência da inserção no início | referência = primeira linha com `id`, por `offsetTop` | o separador fixo não se move com o conteúdo |
| Âncora medida durante a entrada | `offsetIn` por `offsetTop` quando o viewport é o `offsetParent` | o rect inclui o `translate` da entrada |
| Ações flutuantes de `thread` cobriam o texto em ecrã tátil | em fluxo, flutuantes só sob `(hover: hover)` | sem hover não há revelação |
| `jump` com `--slotted-control-border-color` | `--slotted-border-subtle` | `field-surface.test.mjs`: o `jump` não é um campo |

## 4. Secção 18

- **Anatomia:** `message` tem dezasseis partes, `bubble` doze e `message-scroller` nove. As tabelas estão nos contratos e nas páginas.
- **Controlado/não controlado:**
  - `current` (`version`/`defaultVersion`/`onVersionChange`), `pressed` e `revealed`, com razão, por `createControllable`.
  - `message-scroller` não tem valor mutável: reporta `reachStart`, `anchorChange` e `scrollableChange` com razão e obedece a comandos imperativos.
- **Matriz de estados:**
  - `status` `sending`/`sent`/`delivered`/`read`/`failed`/`streaming` em `data-status`.
  - `failed` junta `data-invalid`, palavra de perigo e `retry`.
  - `streaming` junta `caret` ou `activity`.
  - Reação `pressed` e `disabled`.
  - Scroller: `data-scrollable`, `data-following`, `data-pending`; `jump` `data-active`; `item` `data-current`.
- **Densidade e direção:** escalas de controlo e de avatar; propriedades lógicas; `align` espelha em RTL.
- **Loading, vazio, erro, extremo:**
  - Loading: `loader` e `busy` no scroller, `typing` e `activity` na mensagem.
  - Vazio: declinado para `result-state`.
  - Erro: `failed` com `retry`.
  - Extremo: nome de autor de 49 caracteres, resposta de cinco linhas com `maxLines`, histórico inserido no início sem salto (214 → 214 no cenário `message-scroller-live`).
- **Testes:**

  | Suite | Testes |
  | --- | --- |
  | Contrato | 13 + 10 |
  | Motor | 15 |
  | Estilos | 13 |
  | React | 30 |
  | Angular | 24 |
  | Harness | cenário `message-scroller-live` |

## 5. Limitações abertas

- Saída animada de uma mensagem removida.
- O Storybook React em 6006 não mostra as entradas novas sem reinício. As páginas foram lidas em 6016 (React) e 6007 (Angular).
- A revelação de texto em `streaming` pertence ao consumidor; a família dá o `caret` e o estado.
- A tabela de anatomia e props corta à direita a 620. A mesma ocorrência existe em `attachment`: é do workbench.
