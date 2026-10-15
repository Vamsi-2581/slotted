# `filter-bar` — autoavaliação da reconstrução segmentada

Reconstrução de 2026-09-30, com as decisões em
`2026-09-30-filter-bar-segmented-design.md` e as medidas em
`2026-09-30-filter-bar-reui-dossier.md`. Especímenes em
`tools/harness/out/specimen/filter-bar/`.

## 1. As onze dimensões

| Dimensão | Estado | Mudança que mais a melhoraria | Feita |
| --- | --- | --- | --- |
| Icons | Cada glifo é `Glyph` numa caixa `icon`: lupa, `plus` do pill e do `add`, `x` do chip e da regra, `chevron-down` do cartão, `trash` do grupo, `funnel` do `summary`, o glifo do campo. Nenhum pintado em CSS. | Glifo do campo no `select` de campo do construtor, como no chip. | Não: o `select` não expõe um adorno por opção no valor; fica para `select`. |
| Motion | Hover e pressão em `--slotted-control-transition-*`; chip, pill e controles de um cartão aberto entram por `@starting-style` com `--slotted-easing-enter`; chevron do cartão roda. Saída do chip sem animação, com razão escrita (§8 do desenho). | Saída animada do chip com o foco já no vizinho. | Não: um chip retido seria uma paragem das setas que já não existe. |
| Responsiveness | Duas linhas acima de 36 rem, linha que desliza abaixo; construtor em cartões abaixo de 30 rem do construtor; gaveta de baixo abaixo de 36 rem de viewport. Capturas a 240, 420, 720. | Cabeçalho do grupo numa linha a 240 px. | Não: a 375 px cabe; a 240 px «of the following» quebra. |
| Refinement | Grelha de píxel inteira em confortável e denso; chevron e × centrados na frase do cartão (corrigido depois do reparo do revisor). | Um chip de campo com glifo ocupa quase toda a largura de um telefone. | Não: o glifo é do consumidor. |
| Tokens | Tokens de família com fallback na fundação; literais `12rem`, `9rem`, `36rem`, `30rem` com razão no contrato. | `--slotted-filter-bar-value-max-narrow` no contrato de literais. | Sim. |
| Patterns | Toolbar do APG com a nota de várias linhas; `Delete` num segmento remove. | Teste de `Home`/`End` na barra. | Não. |
| Accessibility | Chip `role=group` com frase; `aria-haspopup` por segmento; `aria-expanded`/`aria-controls` no cartão; controles ocultos saem do anel por `visibility`; anéis para dentro na linha que desliza. | Verificação com leitor de ecrã real. | Não: esta máquina não tem um. |
| Native API | React: props nativas na raiz, `ref` com `focusSearch()` e `open(path)`; `IconButton` para os controles só de glifo. Angular: `exportAs: 'slFilterBar'` com `focusSearch()` e `openBuilder(path?)` — `open` já é o nome do `model()` do construtor; `moreValues` é uma função `(count) => string`, como os outros rótulos contados do binding. Os dois mantêm a paragem de um segmento `aria-disabled` (`includeAriaDisabled`). | Um nome só para o handle nos dois bindings. | Não: renomear o `model()` `open` quebraria `[(open)]`, que é o idioma Angular do par controlado. |
| Capability | Condição incompleta, `readOnly`, glifo por campo, cartões no telefone, operador separado do valor. | Menu por linha no construtor. | Não: reabertura em `docs/process/build-order.md`. |
| Ecosystem integration | Provider de defaults e labels nos dois bindings; `open(path)` expande o cartão. | — | — |
| Documentation | Páginas de referência com a anatomia nova, cenas de telefone numa sala de 375 px, `readOnly` nos estados; auditoria a 1280 e 620 px sem achados (React). | A folha de baixo não é demonstrável numa sala: o lado da gaveta lê o viewport. | Não. |

## 2. Barra de acabamento

| Critério | Número |
| --- | --- |
| Pixel grid | chip 34, segmento 32, pill 34, cartão 36; denso 26/24 |
| Hover | ΔL 0.032 / 0.065 / 0.075 (light / dark / high-contrast), segmentos e `rule-summary` |
| Press | ΔL 0.071 / 0.086 / 0.155 |
| Focus | 2 px; 5.17:1 / 7.29:1 / 21:1; offset −2 nos segmentos e na linha do telefone |
| Reduced motion | 0 s / 0.001 s |
| Target size | segmentos 32; `more` e a × da regra com halo em `pointer: coarse` |

## 3. Secção 18

- Anatomia: contrato, 35 partes.
- Controlado e não controlado: `value`, `query`, `preset`, `open`, `revealed`, sem mudança; a condição incompleta é estado da barra e nunca é emitida.
- Estados: `disabled` > `loading` > `readonly` > `invalid`; `data-incomplete`, `data-pinned`, `data-compact`, `data-expanded`.
- Densidade e direção: capturas `dense` e `rtl`; a linha do telefone começa no início em linha também em rtl.
- Casos: vazio (pills tracejados, `add` com rótulo), carregar (spinner na contagem), erro (campo desconhecido, obrigatório sem valor), conteúdo extremo (lista de onze valores, valor longo, rótulo árabe).
