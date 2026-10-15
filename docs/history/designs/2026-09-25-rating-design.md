# `rating` — desenho

Data: 2026-09-25. Modo `build` (`/component rating` com `/reui rating`). HEAD lido: `2607c830`.
Dossiê de medidas: [2026-09-25-rating-reui-dossier.md](2026-09-25-rating-reui-dossier.md).

`rating` é um valor ordinal desenhado como uma fila de símbolos. Três membros partilham o contrato,
a folha e `data-ui="rating"`: `rating`, o valor que o leitor escolhe; `ratingDisplay`, o valor que
a página reporta, com as variantes `compact` e `histogram`; e `ratingSummary`, o agregado de muitas
avaliações, em barras por nível (`bars`) ou em espectro (`spectrum`: histograma sobre o eixo 1–5,
média, intervalo de 95% e uma conclusão). O espectro e o histograma foram aprovados em 2026-09-28
(dossiê ReUI, secção "Alternativa proposta").

Revisão de 2026-09-28, depois do gate visual: o revisor recusou a pintura (contorno castanho,
estrelas vazias em contorno), a escala no hover (1,12 e 0,88), a meia estrela (o rádio inteiro
cobria o rádio da metade e recebia todos os toques) e a falta de resumo. As secções abaixo
registam o estado depois da revisão.

## 1. Inventário de capacidades

### Levantadas

| Implementação | Nome | Fonte lida |
| --- | --- | --- |
| WAI-ARIA APG | Rating Radio Group Example; Rating Slider Example | `https://www.w3.org/WAI/ARIA/apg/patterns/radio/examples/radio-rating/`, `…/slider/examples/slider-rating/` |
| Ark UI / Zag | `RatingGroup` | `https://ark-ui.com/docs/components/rating-group`; `zag/packages/machines/rating-group/src/rating-group.types.ts` (main) |
| MUI | `Rating` | `https://mui.com/material-ui/react-rating/` |
| Fluent UI v9 | `Rating`, `RatingDisplay` | `react-rating/library/src/components/{Rating,RatingDisplay}/*.types.ts` (master) |
| Mantine | `Rating` | `https://mantine.dev/core/rating/` |
| ReUI | `Rating` (primitivo), `c-rating-1…9`, `review-3`, `product-card-9` | `https://reui.io/r/rating.json`; espécimes em `tools/harness/out/specimen/` |

### Requisitos mínimos

| Capacidade | Quem implementa | Veredicto | Razão |
| --- | --- | --- | --- |
| Valor controlado e não controlado | Ark, MUI, Fluent, Mantine | adotar | `value`/`defaultValue`/`onValueChange` com razão `pointer`, `keyboard`, `clear`. |
| Máximo (`count`, `max`) | todas | adotar | `max`, padrão 5. |
| Meio passo | Ark `allowHalf`, MUI `precision`, Fluent `step`, Mantine `fractions` | adaptar | `step` 1 ou 0,5; um segundo rádio cobre a metade inicial do símbolo. Frações menores recusadas: um terço de 20 px fica abaixo do alvo mínimo. |
| Só leitura | Ark, MUI, Mantine | adotar | `readOnly`: focável, `aria-readonly`, sem pré-visualização. |
| Desativado | todas | adotar | rádios `disabled`, valor legível. |
| Exibição não interativa | Fluent `RatingDisplay`, MUI `readOnly`, ReUI | adotar | membro `ratingDisplay`, `role="img"`, frações livres. |
| Pré-visualização ao passar o ponteiro | Ark, MUI, Mantine, ReUI | adotar | CSS a partir de `:hover` nos rádios; evento `onPreviewChange`. |
| Rótulo acessível por valor | MUI `getLabelText`, Fluent `itemLabel`, Mantine `getSymbolLabel`, Ark `translations` | adotar | mensagem `{value} de {max}` por provider e por instância. |
| Formulário (`name`, `form`, `required`) | Ark, MUI, Fluent | adotar | rádios nativos; `ControlValueAccessor` no Angular. |
| Limpar ao premir o valor atual | MUI | adotar | `clearable`, padrão verdadeiro; também `Backspace`/`Delete`. |
| Tamanhos | MUI, Fluent, Mantine, ReUI | adotar | `sm`, `md`, `lg`. |
| Cor | Fluent `color`, Mantine `color` | adaptar | eixo `tone` sobre o vocabulário partilhado, sem `secondary` (§3). |
| Ícone substituível | MUI `icon`/`emptyIcon`, Mantine `emptySymbol`/`fullSymbol`, Fluent `iconFilled`/`iconOutline` | adaptar | o símbolo é a parte `symbol`/`fill` que o binding deixa compor; nenhuma prop por ícone. |
| Destacar só o selecionado | MUI, Mantine `highlightSelectedOnly` | recusar | escala de reações (ReUI `c-rating-8`) é uma escolha nominal: `radio-group` com a variante `tile` ou `segmented-control`. |
| Valor e contagem ao lado | Fluent `valueText`/`countText`, ReUI `showValue` | adotar | partes `value` e `count`. |
| Resumo com distribuição | ReUI `c-rating-6`, `review-3` (composição com `Progress`) | adotar | membro `ratingSummary`: agregado, contagem, uma barra por nível. |
| Filtro por nível | ReUI `review-2` (filtros por tópico) | adaptar | níveis como botões `aria-pressed`, modelo `selection` (`selectedLevels`). |
| Exibição compacta | Fluent `RatingDisplay compact` | adotar | `variant="compact"`: uma estrela, número, contagem. |
| Arrasto por toque | Ark (`pointermove`), Mantine | adotar | `ratingAtPoint` em `@slotted/core/rating`; `touch-action: pan-y` na fila. |

### Diferenciais

| Capacidade | Razão |
| --- | --- |
| Fila que encolhe em vez de quebrar | Dez símbolos a 240 px continuam uma fila; cada item fica quadrado e o glifo segue `100cqi`. Nenhuma implementação levantada o faz: todas transbordam. |
| Estado visual derivado da plataforma | O preenchimento, a pré-visualização e o meio passo são CSS sobre `:checked`/`:hover` dos rádios; a harness mostra um controlo funcional sem script. |
| Contraste não textual do símbolo aceso | O contorno do símbolo aceso usa o passo `text` do tom (6,85:1 em `light`); o ReUI pinta `yellow-400` a 1,53:1 sem contorno contrastante. |
| Três esquemas e cores forçadas | Forma acesa e apagada distintas em `high-contrast` e sob `forced-colors`; o ReUI não tem nenhum dos dois. |
| Densidade sem perda de leitura | O símbolo não segue a densidade (precedente: geometria de seleção); o texto segue. |

### Lacunas

| Caso | Resposta |
| --- | --- |
| Formulário crítico sem opção "não se aplica" (`component-features.md`) | Composição com `checkbox` "Não se aplica" que desativa o `rating`; cena `field` nas páginas de referência. |
| Valor fora do intervalo (7 de 5, −1, `NaN`) | O binding limita a `[0, max]` e arredonda ao passo no membro de entrada; `NaN` é vazio. |
| Contagem com milhões | `count` é texto formatado pelo consumidor com o locale; `tabular-nums`. |
| Legenda longa ou traduzida | `value` do membro de entrada quebra dentro da linha (`overflow-wrap: anywhere`). |

## 2. Padrão APG

Fonte: APG Rating Radio Group Example e Rating Slider Example (URLs acima).

| Item APG | Decisão | Evidência |
| --- | --- | --- |
| `radiogroup` no contentor, nome por `aria-labelledby` | adotado; `aria-label` ou `aria-labelledby` por `field` | `contract.json` `rootRole`, `wiring` |
| `radio` por valor com nome "N estrelas" | adotado com rádio nativo e `aria-label` `{value} de {max}` | `itemLabel` |
| Tab entra no marcado, ou no primeiro | plataforma | `keyboard[Tab]` |
| Space marca o focado | plataforma | `keyboard[Space]` |
| Setas movem e marcam, com volta ao início | partida deliberada: sem volta | `wraps: false`; custo em §5 |
| Home/End (exemplo slider) | adotado | `keyboard[Home|End]` |
| PageUp/PageDown (exemplo slider) | recusado | `declined.PageUp` |
| SVG `role="none"`/`aria-hidden` | `Glyph` sempre `aria-hidden` | decisão do briefing |
| `aria-valuetext` com o significado (exemplo slider) | coberto por `aria-label` por rádio; o significado em palavras vai na parte `value` | `itemLabel` |

## 3. Anatomia e decisões

```
root (div, role=radiogroup | img)
├─ symbols            fila que não quebra
│  └─ item × max      quadrado; --slotted-rating-fill no display
│     ├─ input        rádio nativo (inteiro); input[data-half] (meio)
│     ├─ symbol       glifo star, contorno --slotted-border-strong
│     └─ fill         o mesmo glifo cheio, recortado a --_fill
├─ value              número (display) ou palavra (entrada)
└─ count              só display

root (section, data-variant=summary)
├─ aggregate          value (4xl) · scale · ratingDisplay sm · count
└─ distribution (ul)  li > level (button aria-pressed | div)
                           ├─ level-label   número + glifo
                           ├─ track > indicator   --slotted-rating-share
                           └─ level-count
```

- Estado mutável: `value: number | null`; `null` é vazio. Pedido `onValueChange(value, reason, event)`.
- `onPreviewChange(value | null)` é evento, não modelo de estado: não altera nada que o consumidor possua.
- Tom padrão `warning` (`#facc15`, o `yellow-400` do ReUI). `secondary` fica fora do eixo: o passo `solid` é um fundo, e uma estrela acesa nele lê-se apagada.
- Pintura: estrela acesa cheia no passo `solid` do tom; estrela apagada cheia em `--slotted-tone-secondary-surface`; traço de 1,5 unidades na aresta `--slotted-rating-edge` (`transparent` em `light` e `dark`, `#000000` em `high-contrast`, `CanvasText` sob cores forçadas). Em `light` a acesa mede 1,53:1 e a apagada 1,2:1 contra o branco; a leitura assenta na forma, na contagem e no valor escrito ou no nome acessível, como `--slotted-control-border-color`. O esquema que promete 3:1 é `high-contrast`.
- Hover: a fila pré-visualiza o valor e um halo circular neutro (`secondary-subtle-hover`) fica sob a estrela; nada cresce. Press: 0,94 e `secondary-subtle-active`.
- Meia estrela: o rádio da metade tem `z-index: 1`, acima do rádio inteiro (`z-index: 0`); símbolos a `z-index: 2`, sem ponteiro.
- O texto ao lado das estrelas (`value`, `count`, o número e a contagem de cada nível) é centrado na tinta com `text-box: trim-both cap alphabetic`, a decisão de `badge`: antes, as caixas de linha estavam centradas ao píxel e as letras ficavam altas. O agregado do resumo fica na linha de base. A raiz ganha `row-gap` de `--slotted-space-3` para o texto que quebra de linha.
- O teclado das setas é da família (`ratingForKey`), para parar nas pontas e servir RTL.
- `--slotted-rating-fill` e `--slotted-rating-share` são propriedades de execução (`runtime-properties.mjs`).
- O comportamento partilhado está em `@slotted/core/rating`: `normaliseRating`, `ratingAtPoint`, `ratingForKey`, `ratingFills`, `summariseRatings`, `formatRating`, `ratingLabel`.

## 4. Integração

### React

| Pergunta | Resposta |
| --- | --- |
| Par controlado com razão | `value`/`defaultValue`/`onValueChange(value, reason, event)` |
| Padrões por aplicação | `RatingProvider` (`size`, `tone`, `max`, `clearable`, `messages`) |
| Substituir elemento | `render` na raiz; o símbolo por `renderSymbol(state)` no item |
| Handler do consumidor | `onKeyDown`, `onChange`, `onPointerEnter` compostos |
| Ref e ação imperativa | `ref` na raiz; `focus()` leva ao rádio marcado |
| SSR | `useId` para `name`; nenhuma leitura de layout |
| Estados no DOM | `data-checked`, `data-disabled`, `data-readonly`, `data-invalid`, `data-size`, `data-tone` |
| Tipos | `ComponentPropsWithRef<'div'>` estendido |

### Angular

| Pergunta | Resposta |
| --- | --- |
| Valor em signal | `model<number \| null>()` e `output` `valueChange` com razão |
| Forms | `ControlValueAccessor`; `Validator` para `required` |
| Padrões | `SL_RATING_DEFAULTS` e `provideRating()` |
| Instância | `exportAs: 'slRating'` |
| Conteúdo | `ng-template` `slRatingSymbol` para o símbolo |
| Zoneless/OnPush | signals em todo o estado |
| Teardown | listeners no `host`; nenhum listener global |
| Atributo estático | `HostAttributeToken` para `aria-label` |
| Ponto de entrada | `@slotted/angular/rating` |

## 5. Custos

- Sem volta ao início nas setas: quem conhece o exemplo APG de rádio espera a volta; a família segue o exemplo slider, Ark, MUI e Mantine.
- Dois rádios por símbolo no meio passo: dez paragens de seta para cinco estrelas.
- O símbolo não encolhe com a densidade: uma tabela densa tem estrelas de 20 px em linhas de 26.
- Em `light` e `dark` as estrelas não cumprem 3:1 contra a página; o valor fica sempre escrito ou no nome acessível, e `high-contrast` cumpre.
- O resumo vazio não mostra número: uma média ausente não é zero.
- Em ponteiro grosso, cada alvo cresce para 44 px e a fila de cinco ocupa 220 px.

## 6. API dos bindings

A marcação de cada membro é a de `packages/styles/src/rating/rating.harness.html`, parte por
parte e atributo por atributo; o comportamento vem de `@slotted/core/rating`. Mensagens em
português por omissão, substituíveis por provider e por instância; números com
`Intl.NumberFormat` do `locale` (padrão: o do documento).

### Mensagens (`RatingMessages`)

| Chave | Padrão |
| --- | --- |
| `itemLabel` | `{value} de {max}` |
| `displayLabel` | `Avaliação {value} de {max}` |
| `displayLabelWithCount` | `Avaliação {value} de {max}, {count} avaliações` |
| `scale` | `de {max}` |
| `summaryCount` | `Com base em {count} avaliações` |
| `summaryEmpty` | `Ainda sem avaliações` |
| `spectrumCount` | `{count} avaliações · margem de ± {margin}` |
| `spectrumUncertain` | `{count} avaliações · média incerta, entre {low} e {high}` |
| `levelLabel` | `{level} estrelas: {count} avaliações, {share}` |
| `distributionLabel` | `Distribuição por estrelas` |
| `positive`, `neutral`, `negative` | `{share} positivas`, `{share} neutras`, `{share} negativas` |
| `divided`, `few`, `consensus`, `mixed` | `Opiniões divididas`, `Poucas avaliações`, `Consenso forte`, `Opiniões variadas` |

A margem usa o texto `spectrumUncertain` quando `margin ≥ 0,5`, e `spectrumCount` nos outros casos.

### `rating` (entrada)

| Conceito | React | Angular |
| --- | --- | --- |
| elemento | `Rating`, `div` | `div[slRating]`, componente com template, `exportAs: 'slRating'` |
| valor | `value` / `defaultValue: number \| null`, `onValueChange(value, request)` | `value = model<number \| null>()`, `valueChangeRequest` com o pedido; `ControlValueAccessor` e `Validator` de `required` |
| razões | `pointer`, `keyboard`, `clear` | idem |
| pré-visualização | `onPreviewChange(value \| null)` | `previewChange` |
| escala | `max` (5), `step` (`1` \| `0.5`), `clearable` (`true`) | idem |
| estado | `disabled`, `readOnly`, `required`, `invalid`, herdados de `field` como em `radio-group` | idem |
| forma | `size`, `tone` (`accent`, `success`, `warning`, `danger`) | idem |
| formulário | `name` (gerado com `useId`), `form` | idem |
| legenda | `caption?: ReactNode \| ((state: { value, preview }) => ReactNode)`, na parte `value` | conteúdo projetado com `[slRatingCaption]`, ou `ng-template` com `value` e `preview` |
| símbolo | `renderSymbol?: (state: { index, fill }) => ReactNode`; padrão `<Icon><Glyph name="star" /></Icon>` | `ng-template slRatingSymbol` |
| imperativo | `handle` com `focus()` (padrão de `slider`) | método `focus()` |

Teclado com `ratingForKey` no `keydown` da raiz (compondo o do consumidor); `Tab` e `Space`
são da plataforma. Premir o rádio marcado com `clearable` pede `null` com `clear`. Toque ou
caneta arrastados em `symbols` (`setPointerCapture`) pedem o valor de `ratingAtPoint`, marcam
`data-dragging` na raiz e só pedem quando o valor muda. `readOnly` recusa o `click`.
`data-checked` no item que tem o rádio marcado.

### `ratingDisplay`

`RatingDisplay` / `div[slRatingDisplay]`, `role="img"`, `aria-label` de `displayLabel` ou
`displayLabelWithCount`. Entradas: `value: number`, `max`, `size`, `tone`,
`variant` (`full` | `compact` | `histogram`), `count?`, `distribution?: readonly number[]`
(contagens do nível mais baixo ao mais alto, para `histogram`), `showValue` (`true`),
`locale`. `--slotted-rating-fill` por item a partir de `ratingFills`; `compact` e `histogram`
desenham uma estrela; `histogram` escreve `--slotted-rating-share` por barra (parte ÷ maior parte).

### `ratingSummary`

`RatingSummary` / `section[slRatingSummary]`. Entradas: `counts: readonly number[]` (do nível
mais baixo ao mais alto), `variant` (`bars` | `spectrum`), `filterable` (`false`),
`selectedLevels` / `defaultSelectedLevels` / `onSelectedLevelsChange(levels, request)`
(Angular: `selectedLevels = model<readonly number[]>()`), `insightThresholds`, `showInsight`
(`true`), `size`, `tone`, `locale`, `aria-label`. Tudo de `summariseRatings`. Com
`filterable`, cada nível ou coluna é `button aria-pressed` (e `disabled` com zero avaliações);
sem ele, um `div role="group"` com `aria-label`. Com zero avaliações, o agregado não mostra
número nem escala. `spectrum` escreve `--slotted-rating-mean`, `-low` e `-high` na raiz.

### Padrões por aplicação

React `RatingProvider` e `useRatingDefaults`; Angular `SL_RATING_DEFAULTS` e `provideRating()`.
Chaves: `size`, `tone`, `max`, `clearable`, `messages`, `insightThresholds`, `locale`. O valor
explícito da instância vence sempre.
