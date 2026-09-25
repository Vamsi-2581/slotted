# O ícone de uma família é o elemento `Glyph`

Data: 2026-09-25. Decisão do revisor, depois do gate de `event-calendar`: um ícone
desenhado em `::before` com `mask-image` não é um ícone. A regra anterior
(`token-foundation.md` › Glyph, rubric §1) prescrevia exatamente isso, e 69
folhas de estilo seguiam-na.

## Decisão

Um ícone próprio de uma família — o X de fechar, as setas de um paginador, o
limpar e o revelar de um campo, o visto de uma caixa — é um elemento real:

| Binding | Marcação |
| --- | --- |
| React | `<Icon size="sm"><Glyph name="x" /></Icon>` (`../icon`) |
| Angular | `<span slIcon size="sm"><svg slGlyph name="x"></svg></span>` (`@slotted/angular/icon`) |
| Harness | `<span data-ui="icon" data-part="root" data-size="sm" aria-hidden="true"><svg data-part="glyph" data-glyph="x"></svg></span>` — o build desenha o `<svg>` vazio |

- A geometria vem de `@slotted/core/glyph` (`GLYPHS`), gerada por
  `scripts/generate-icon-glyphs.mjs` do mesmo `glyphs.json` que os tokens; o
  nome é o token sem `--slotted-icon-`.
- `Icon` é a caixa: tamanho (`size` ou `--slotted-icon-size` no contentor), cor
  herdada (`color` no contentor), alinhamento, espelho em RTL (`directional`),
  nome acessível. `Glyph` é só o desenho, sempre `aria-hidden`.
- Marca de tom sólida (disco ou triângulo cheio com o símbolo recortado):
  `<Glyph name="circle-alert" solid />` / `<svg slGlyph name="circle-alert" solid>` /
  `<svg data-glyph="circle-alert" data-solid></svg>` na harness. A primeira
  forma do glifo é preenchida e o resto recortado por um `<mask>` SVG interno,
  por isso o fundo aparece no símbolo em qualquer variante.
- Nenhuma folha de estilo pinta um ícone: sem `mask-image` de token de glifo,
  sem pseudo-elemento a fazer de ícone, sem hook de família com um token de
  glifo como recurso. `packages/styles/src/glyph-element.test.mjs` recusa-o
  fora da lista `PENDING`, que só diminui.

## Receita de migração de uma família

1. Encontrar cada uso: `grep -n "var(--slotted-icon-" packages/styles/src/<f>/<f>.css`
   (ignorar `--slotted-icon-size` e `--slotted-icon-baseline-shift`, que não são
   glifos). Anotar o elemento que pinta, o glifo e a condição (estado, lado,
   variante) de cada regra.
2. React: renderizar `<Icon …><Glyph name="…" /></Icon>` no elemento que
   pintava — como filho do botão ou da parte, na posição onde o pseudo-elemento
   estava (`::before` → primeiro filho, `::after` → último). O glifo que muda
   com o estado (visto/traço, olho/olho riscado, seta aberta/fechada) é escolhido
   no binding a partir do estado, não no CSS. Um filho que o consumidor passa
   substitui o glifo por omissão (`children ?? <Icon>…</Icon>`).
3. Angular: a mesma marcação. Uma diretiva sobre um elemento do consumidor que
   precisa de conter o glifo passa a componente com conteúdo por omissão:
   `template: '<ng-content><span slIcon …><svg slGlyph name="…"></svg></span></ng-content>'`
   (ou o glifo antes/depois de `<ng-content />` quando o conteúdo é o rótulo).
   Importar `SlGlyph, SlIcon` de `@slotted/angular/icon`.
4. CSS: apagar as regras de máscara, os pseudo-elementos que só existiam para
   o ícone e o bloco `forced-colors` desse pseudo-elemento. Dimensionar pela
   caixa (`data-size` ou `--slotted-icon-size` no contentor); a cor já é
   herdada; rotações e translações passam para `> [data-ui='icon']`. Um hook de
   família que trocava o ícone por CSS (`--slotted-upload-close-icon`) é
   removido: a troca faz-se pelos filhos da parte. Regenerar o `tokens.json`.
5. Harness: escrever a marcação da tabela acima em cada lugar onde o ícone
   aparece; o build desenha-o.
6. Testes: atualizar os testes do binding que liam o ícone por CSS; acrescentar
   um que encontra o `<svg data-glyph>` certo em cada estado.
7. Retirar a família de `PENDING`.

## Custos

- Um `<svg>` por ícone no DOM, em vez de zero nós: a medida de uma lista longa
  (tabela, árvore) acrescenta um nó por linha.
- A troca de ícone por tema deixa de existir; faz-se por conteúdo.
