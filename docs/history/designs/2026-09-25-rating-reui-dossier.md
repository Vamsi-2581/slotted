# `rating` — dossiê ReUI

## 0. Cabeçalho

Família `rating`, modo `build`, 2026-09-25, HEAD `2607c830`. Espécimes em
`tools/harness/out/specimen/` (abreviado `S/`), lidos com `tools/harness/specimen.mjs`.
Largura ReUI 1280; Slotted 420, `comfortable`, `light` salvo indicação.

## 1. Seleção

Cobertura `direta`. Termos em `llms-full.txt`: `rating` 70, `star` 60, `review` 66, `stars` 2,
`score` 14. O primitivo `rating` e nove exemplos `c-rating-*` existem.

| Item | Tipo | Rota | Parte ou interação Slotted que informa | Capturas |
| --- | --- | --- | --- | --- |
| `rating` | primitivo | `https://reui.io/r/rating.json` | anatomia, API | fonte MIT |
| `c-rating-2` | exemplo | `/preview/base/example/c-rating-2` | `fill` parcial | `S/c-rating-2/c-rating-2-light-1280.json` |
| `c-rating-3` | exemplo | idem | `value` | `S/c-rating-3/c-rating-3-light-1280.json` |
| `c-rating-4` | exemplo | idem | `item` interativo, hover, press | `S/c-rating-4/c-rating-4-{light,dark}-1280-div-relative-d93c58.json`, `…-motion-reduce.json` |
| `c-rating-5` | exemplo | idem | tamanhos | `S/c-rating-5/c-rating-5-light-1280.json` |
| `c-rating-8` | exemplo | idem | alvo com fundo, foco | `S/c-rating-8/c-rating-8-{light,dark}-1280-button-7b7fcc.json` |
| `review-3` | bloco Pro | `/preview/base/review-3` | `ratingDisplay` em contexto, `sm` | `S/review-3/review-3-light-1280.json` |
| `product-card-9` | bloco Pro | `/preview/base/product-card-9` | `ratingDisplay` em grelha de produto | `S/product-card-9/product-card-9-light-1280.json` |

## 2. Anatomia

| `data-slot` ReUI | Parte Slotted | Estado |
| --- | --- | --- |
| `rating` | `root` | igual |
| — (`div.flex`) | `symbols` | só no Slotted |
| — (`div.relative`) | `item` | só no Slotted como parte |
| — | `input` | só no Slotted (o ReUI não tem controlo focável) |
| `rating-star-empty` | `symbol` | igual |
| `rating-star-filled` | `fill` | igual |
| `rating-value` | `value` | igual |
| — | `count` | só no Slotted |

## 3. Medidas

| Parte | Propriedade | ReUI | Slotted hoje | Alvo | Veredicto |
| --- | --- | --- | --- | --- | --- |
| `symbol` | tamanho sm/md/lg | 16 / 20 / 24 (`c-rating-5`) | 16 / 20 / 24 | `--slotted-space-6/7/8` | adotar: três implementações medem o mesmo |
| `item` (entrada) | caixa | 20 × 20, sem alvo mínimo (`c-rating-4`) | 24 × 24 (`S/rating/slotted-light-420-…default….json`) | `max(--slotted-target-min, símbolo + 2 × --slotted-space-1)` | superar: WCAG 2.5.8 |
| `symbols` | intervalo entre itens (display) | 0 | 2 px | `--slotted-space-1` | adaptar: 2 px entre caixas repõe o intervalo visual de 5 px do ReUI com glifo centrado |
| `symbols` | intervalo (entrada) | 0 | 0 | 0 | igual |
| `root` | intervalo até `value` | 10 (`gap-2.5`, `c-rating-3`) | 8 | `--slotted-control-gap-md` | adaptar: passo de controlo, segue a densidade (4 em `dense`) |
| `value` | fonte | 14 px, 400, `oklch(0.556 0 0)` | 13 px; display 500 `--slotted-text`; entrada 400 `--slotted-text-muted` | `--slotted-control-font-size-md` | adaptar: número com peso, palavra discreta |
| `value` | largura | 20 px fixos (`w-5`) | conteúdo, `tabular-nums` | — | superar: `w-5` corta "10,0" |
| `fill` | cor | `lab(83.27 8.65 106.9)` = `#facc15` | `#facc15` | `--slotted-tone-warning-solid` | adotar |
| `fill` | contorno | `#facc15` (1,53:1) | `#854d0e` (6,85:1) | `--slotted-tone-warning-text` | superar: 1.4.11 |
| `symbol` | contorno | `oklab(0.556 0 0 / 0.3)` | `#78899c` (3,59:1) | `--slotted-border-strong` | superar: o número de símbolos faz parte do valor |
| `input` | raio | — | 4 px | `--slotted-radius-sm` | só no Slotted |

## 4. Coreografia de estados

| Parte | Estado | Delta ReUI | Delta Slotted hoje | Alvo |
| --- | --- | --- | --- | --- |
| `item`/`input` | hover | vazio (`c-rating-4`; a pré-visualização é estado React nos filhos) | `background-color` transparente → `rgb(241 245 249)`; filhos: `scale` 1 → 1,12 e `--_fill` até ao item | atual |
| `item`/`input` | active | vazio | `background-color` → `rgb(226 232 240)`; `scale` 0,88 | atual |
| `input` | focus-visible | `null` (não focável) | anel no `item`, 2 px `--slotted-focus-ring-color`, deslocamento −2 px | atual |
| `button` (`c-rating-8`) | hover / active | `oklch(0.97 0 0)` nos dois | — | recusar: press igual a hover |
| `button` (`c-rating-8`) | focus | `outline: auto 1px` | — | recusar: 1 px, anel do navegador |
| `root` | disabled | — | `--slotted-disabled-foreground` aceso, `--slotted-disabled-border` apagado | atual |
| `root` | readonly | — | sem hover, sem pré-visualização, cores plenas | atual |
| `root` | invalid | — | apagado `--slotted-tone-danger-border`; anel `--slotted-focus-ring-color-invalid` | atual |

Escuro: hover `rgb(34 34 37)`, active `rgb(39 39 42)` sobre `rgb(19 19 22)`
(`S/rating/slotted-dark-420-…default….json`). Alto contraste: `rgb(230 230 230)` e `rgb(204 204 204)`.

## 5. Movimento

| Lado | Transição | Movimento reduzido |
| --- | --- | --- |
| ReUI `c-rating-4` | `all 0s`: nenhuma | igual |
| ReUI `c-rating-8` | `all 150ms cubic-bezier(0.4, 0, 0.2, 1)`, `scale-110` no selecionado | não medido: duração literal |
| Slotted `fill` | `clip-path` 200 ms (`--slotted-duration-medium`), `--slotted-easing-enter` ao acender, `--slotted-easing-exit` ao apagar; `scale` 120 ms enter/exit; `color` 120 ms standard | 1 ms (`S/rating/slotted-light-420-motion-reduce.json`) |
| Slotted `symbol` | `scale` 120 ms enter no hover, standard no press, exit ao sair | 1 ms |
| Slotted `input` | `background-color` 120 ms standard | 1 ms |

Nenhuma animação infinita.

## 6. Capacidades

| Capacidade | Onde aparece no ReUI | Forma no ReUI | Forma no Slotted | Em que a forma Slotted é melhor | Veredicto | Família dona, se não esta |
| --- | --- | --- | --- | --- | --- | --- |
| Editável | `c-rating-4`, `-7`, `-9` | `editable` + `rating` + `onRatingChange(n)` | membro `rating`, `value`/`defaultValue`/`onValueChange(v, reason, e)` | teclado, formulário, razão, modo não controlado | adaptar | — |
| Meio passo | `c-rating-7` | decimal por clique inteiro | `step={0.5}`, rádio na metade | o meio passo é escolhível | adaptar | — |
| Mostrar valor | `c-rating-3` | `showValue` com `toFixed(1)` | parte `value`, texto do consumidor com locale | vírgula decimal, palavras | adaptar | — |
| Tamanhos | `c-rating-5` | `size` | `size` | coincidem | adotar | — |
| Resumo de avaliações | `c-rating-6`, `review-3` | composição com `Progress` | composição com `progress-indicator` | coincidem | adotar | — |
| Reações por emoji | `c-rating-8` | botões soltos | escolha nominal | semântica de rádio e teclado | adiar para `radio-group` (`tile`) | `radio-group` |
| Contagem | `review-3` (texto solto) | — | parte `count` | nome acessível inclui a contagem | adotar | — |

## 7. Superar

| Critério | ReUI | Slotted hoje | Alvo | Fonte |
| --- | --- | --- | --- | --- |
| Grelha de píxel | 20 × 20 | `item` 24 × 24, `symbol` 20 × 20 | inteiro | `S/rating/slotted-light-420-…default….json` |
| Hover | vazio | 0,02+ OKLab L (`secondary-subtle-hover`, conformidade do tema) | não vazio | idem |
| Press | vazio | `rgb(226 232 240)` ≠ hover | ≠ hover | idem |
| Foco | inexistente | 2 px; 5,17:1 (`light`), 7,29:1 (`dark`), 21:1 (`high-contrast`) contra `ground` | ≥ 2 px, ≥ 3:1 | três espécimes `default` |
| Transição | `all 0s` | `background-color`, `scale`, `clip-path`, `color`, `fill` listados | todos listados | idem |
| Movimento | nenhum | `clip-path` enter/exit | enter/exit | §5 |
| Movimento reduzido | — | 1 ms | colapsa | `…motion-reduce.json` |
| Desativado | — | aceso `#64748b` 4,76:1 | valor do token | §3 |
| Esquemas | só claro e escuro | alto contraste e cores forçadas com forma distinta | mesmo componente | `…forced.json`, capturas `high-contrast` |
| Densidade e RTL | — | `dense`: símbolo 20, texto 12, intervalo 4; `rtl`: primeiro item em x = 451 | anatomia igual | `…dense.json`, `…rtl.json` |
| Alvo | 20 px | 24 px, 44 px em ponteiro grosso | § Target size | CSS |
| Intenção | classes Tailwind | cada valor é token ou está nesta tabela | — | `rating.tokens.json` |

## 8. Delta

| # | Ficheiro | Mudança | Linhas do dossiê que resolve | Captura que o prova |
| --- | --- | --- | --- | --- |
| 1 | `packages/theme-default/src/glyphs.json` e três registos | glifo `star` (commit `c3bfcbd7`) | §2 `symbol` | `glyphs.ts` |
| 2 | `specs/components/rating/contract.json` | contrato novo, dois membros (`contrato`) | §2, §6 | `contract.test.mjs` |
| 3 | `packages/styles/src/rating/rating.css` | folha nova | §3, §4, §5, §7 | `tools/harness/out/rating-shots/` |
| 4 | `packages/styles/src/rating/rating.harness.html` | oito cenas | §4 | idem |

## Revisão de 2026-09-28

Depois do gate visual, as linhas abaixo substituem as das secções 3, 4 e 7 que nomeiam.
Espécimes em `S/rating/slotted-{light,dark,high-contrast}-420-data-scene-{default,half}-*.json`.

| Secção | Linha | Antes | Depois | Razão |
| --- | --- | --- | --- | --- |
| 3 | `fill` contorno | `#854d0e`, traço 2 | aresta `--slotted-rating-edge` (`transparent` em `light`/`dark`, `#000000` em `high-contrast`), traço 1,5 | recusa do revisor: contorno pesado |
| 3 | `symbol` | contorno `--slotted-border-strong` | forma cheia `--slotted-tone-secondary-surface` (`#e2e8f0`, `#27272a`, `#ffffff`) | leitura de cinco marcas iguais, como Salesforce, Airbnb e Fluent |
| 3 | `input` raio | 4 px | círculo | halo e anel circulares à volta da estrela |
| 4 | hover | `scale` 1,12 e fundo quadrado | pré-visualização do valor e halo circular `secondary-subtle-hover`; sem escala | recusa do revisor: escala exagerada |
| 4 | active | `scale` 0,88 | `scale` 0,94 e `secondary-subtle-active` | idem |
| 4 | meia estrela | o rádio inteiro cobria o da metade | rádio da metade a `z-index: 1`; recorte do hover em `S/rating/slotted-light-420-data-scene-half-*-2-hover.png` mostra 1,5 | defeito de empilhamento |
| 6 | resumo | composição do consumidor | membro `ratingSummary` com filtro por nível | pedido do revisor; ReUI `c-rating-6`, `review-3` |
| 6 | compacta | — | `variant="compact"` | Fluent `RatingDisplay compact` |
| 7 | Esquemas | forma distinta por contorno | forma cheia em `light`/`dark`; aresta preta e trilho com aresta em `high-contrast` | capturas em `tools/harness/out/rating-shots/` |
| 7 | Contraste não textual | 6,85:1 | 1,53:1 aceso e 1,2:1 apagado em `light`; `high-contrast` mantém o contorno preto | decisão registada em `docs/token-foundation.md` › Rating edge |

## Alternativa proposta — espectro e micro-histograma (2026-09-28, `survey`)

Estudo na harness (`rating.harness.html`, cenas `spectrum` e `histogram`, estilos no bloco
`<style>` do fragmento). Nada disto está em `rating.css` nem no contrato até ser aprovado.

### Premissa

A média esconde a forma. 3,3 de 5 lê-se "morno" e pode ser metade de uns e metade de cincos; 4,9
com 7 avaliações lê-se melhor do que 4,7 com 1.284 e vale menos. Nenhum item levantado mostra
nenhuma das duas coisas: o resumo em barras horizontais (ReUI `c-rating-6`, `review-3`; Amazon;
Google Play) dá a distribuição sem posição da média e sem incerteza, e ReUI `comparison-4` dá
pontuação por dimensão (barra geral de 8 px, barras de 6 px, trilho `oklch(0.97 0 0)`,
`S/comparison-4/comparison-4-light-1280.json`), não a forma de uma única pontuação.

### Espectro (`ratingSummary` com `variant="spectrum"`)

| Parte | Leitura | Medida no estudo |
| --- | --- | --- |
| `aggregate` | média, "de 5", uma conclusão (`insight`) e a contagem com a margem | figura `--slotted-font-size-4xl`; conclusão em pílula do tom |
| `columns` > `column` > `bar` | histograma vertical sobre o eixo 1–5: altura = parte do nível ÷ maior parte; cada coluna é um botão de filtro | área `--slotted-space-12` (64 px); barra até `--slotted-space-10` (40 px) de largura, centrada; nível sem avaliações não desenha barra |
| `mean` + `mean-label` | linha de 2 px e pílula invertida na posição exata da média sobre o mesmo eixo das colunas | `left = coluna/2 + (média − 1) × (coluna + intervalo)` |
| `interval` | faixa atrás das colunas com o intervalo de 95% da média | tinta `--slotted-text` a `--slotted-highlight-tint-opacity` |
| `axis` > `tick` | número, estrela e percentagem de cada nível | `--slotted-font-size-xs` na percentagem |
| `sentiment` > `bucket` | positivas (4–5), neutras (3), negativas (1–2) com ponto do tom | `success`, `secondary`, `danger` |

Conclusões (`insight`), por ordem, a primeira que se aplica:

1. `Opiniões divididas` (`warning`): negativas ≥ 25% e positivas ≥ 25%.
2. `Poucas avaliações` (`secondary`): menos de 30 avaliações, ou margem ≥ 0,5.
3. `Consenso forte` (`success`): positivas ≥ 80%.
4. `Opiniões variadas` (`secondary`): os restantes casos.

A margem é `1,96 × desvio ÷ √n` (aproximação normal), limitada a [1, 5]. Com 1.284 avaliações é
± 0,04 e a faixa é uma linha; com 8 é 2,0 a 4,5 e a faixa ocupa três colunas. O texto diz
"margem de ± 0,04" ou "média incerta, entre 2,0 e 4,5", sem jargão estatístico.

### Micro-histograma (`ratingDisplay` com `variant="histogram"`)

Estrela, média, cinco colunas de 4 px com 1 px de intervalo sobre uma linha de base
`--slotted-border-strong`, altura `1cap + 0.5em`, e a contagem. Para uma célula de `data-grid`
ou uma linha de lista: duas linhas a 3,3 com formas diferentes deixam de parecer iguais. O nome
acessível inclui a conclusão ("Média 3,3 de 5, 8 avaliações, opiniões divididas").

### O que entraria no contrato e no core

- `ratingSummary.variant`: `bars` (atual) e `spectrum`; `ratingDisplay.variant`: `full`, `compact`,
  `histogram`.
- Partes novas: `insight`, `plot`, `field`, `columns`, `column`, `bar`, `interval`, `mean`,
  `mean-label`, `axis`, `tick`, `tick-label`, `tick-share`, `sentiment`, `bucket`, `histogram`.
- Propriedades de execução: `--slotted-rating-mean`, `--slotted-rating-low`,
  `--slotted-rating-high`.
- `summariseRatings` ganha `deviation`, `margin`, `interval`, `buckets` e `insight`, com os
  limiares acima; mensagens por provider.
- Filtro: o mesmo modelo `selectedLevels`, nas colunas.

### Custos

- A margem por aproximação normal subestima a incerteza com menos de ~10 avaliações numa escala
  limitada; a faixa é limitada a [1, 5] e a conclusão `Poucas avaliações` cobre o caso.
- Uma conclusão automática é uma afirmação da biblioteca sobre os dados do consumidor; os
  limiares e as mensagens ficam configuráveis por provider, e a conclusão pode ser omitida.
- O espectro precisa de ~180 px de altura contra ~170 px do resumo em barras.
