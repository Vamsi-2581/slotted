# Field — autoavaliação

Passagem `/reui field build`, 2026-09-30. Desenho:
`2026-09-30-field-label-row-design.md`. Dossiê:
`2026-09-30-field-reui-dossier.md`. Espécimes em
`tools/harness/out/specimen/field/`.

## Barra de craft

| Critério | Número que decide | Resultado |
| -------- | ----------------- | --------- |
| Pixel grid | `help` 22 × 22, `action` 24 de altura, cabeçalho 18.84–18.88 com e sem itens (`slotted-light-720.json`) | passa; o cabeçalho é texto e não pinta caixa |
| Hover | `help` ΔL do fundo 0.032 claro, 0.065 escuro, 0.075 alto contraste; `action` ΔL da tinta −0.098 claro, 0.062 escuro | passa |
| Press | `help` ΔL 0.071 contra 0.032; `action` −0.182 contra −0.098 | passa |
| Focus | anel de 2 px, afastamento de 2 px; 5.17:1 claro, 7.29:1 escuro, 21:1 alto contraste | passa |
| Transition | `help` anima `background-color`; `action` anima `color` e `text-decoration-color`; ambos em `--slotted-control-transition-*` | passa |
| Motion | a dica entra e sai por `tooltip`; nada no cabeçalho aparece ou move | passa |
| Reduced motion | durações medidas 0.001 s (`slotted-light-720-motion-reduce-*.json`) | passa |
| Disabled | rótulo, marca e contador em `--slotted-disabled-foreground`; `help` e `action` ativos por contrato | passa |
| Schemes | alto contraste e `forced-colors` mantêm a anatomia; em `forced-colors` o fundo do hover da ajuda não muda (ΔL 0) e o anel continua | passa, com o hover entregue ao sistema |
| Density e RTL | denso: cabeçalho 17.39 com ajuda; rtl: a ação latina lê-se na ordem das suas palavras | passa |
| Target size | `help` halo de 24, 44 em ponteiro grosso (`inner-control.test.mjs`); `action` caixa de 24 | passa |
| Intent | cada valor em token ou com a razão ao lado da regra | passa |

Linhas do dossiê: § 3 e § 4 estão no alvo com os números acima; a linha
`indicator` › altura do emblema fica em `badge` (`docs/process/build-order.md`,
Reaberturas).

## As onze dimensões

| Dimensão | A mudança que mais melhoraria | Feita |
| -------- | ----------------------------- | ----- |
| Icons | `circle-question` como `Glyph` nos dois bindings e no harness | sim |
| Motion | a dica abre por pressão num ecrã tátil, onde `tooltip` só abria por pressão longa | sim |
| Responsiveness | contador no mesmo sítio em disposição lateral com e sem cabeçalho; filhos laterais sem esticar | sim |
| Refinement | glifo na banda do texto e fila sem crescer com ajuda, emblema ou ação | sim; a ajuda ainda pode ficar separada da última palavra do rótulo numa coluna estreita, porque é um item flex |
| Tokens | `field.tokens.json` regenerado; o único literal novo é o piso de 14 px do glifo, token de família | sim |
| Patterns | APG Tooltip e WCAG 1.4.13 via `tooltip`; nome e descrição pela prática APG | sim |
| Accessibility | contador, ajuda e indicador em `aria-describedby`, na ordem do contrato | sim |
| Native API | `FieldAction` e `slFieldAction` escrevem `type="button"` só num botão sem tipo | sim |
| Capability | `optional`, ajuda, indicador, ação e cabeçalho | sim |
| Ecosystem integration | `[(open)]` e `(openChangeRequest)` expostos a partir do `SlTooltip` composto; `helpLabel` no fornecedor dos dois bindings | sim |
| Documentation | cena `header`, anatomia, tabela de eventos; coluna de 280 px no workbench para mostrar o reflow | sim |

## `component-features.md` §18

- Anatomia: `root`, `header`, `label`, `mark`, `help`, `indicator`, `action`,
  `counter`, `control`, com as mensagens de `inline-message`.
- Controlado e não controlado: só a dica tem estado — `open`/`defaultOpen`/`onOpenChange`
  (React), `[(open)]`/`(openChangeRequest)` (Angular); o resto é dito ao campo.
- Matriz de estados: `disabled` acima de `invalid` no contador; `help` com
  `hover`, `active`, `focus-visible`, `open`; `action` com `hover`, `active`,
  `focus-visible`, `disabled` próprio.
- Densidade e direção: medidas acima; propriedades lógicas em todo o cabeçalho.
- Carregamento, vazio, erro, extremos: o campo não carrega; rótulo longo, emblema
  e ação quebram por linhas (cena `header`, coluna de 280 px); contador acima do
  limite antes do erro.
- Quebra de contrato: `requiredMark` → `necessity`, `text` → `words`,
  `data-required-mark` → `data-necessity` (tabela no desenho, § 6).

## Verificação

Contratos `field` e `field-group` 41/41; `field.styles.test.mjs` 25/25;
`inner-control.test.mjs` 88/88; React `src/field` e `src/field-group` 44/44;
Angular `field` e `field-group` 44/44; `audit.mjs` sem achados em 6006 e 6007
a 1280 e 620 px.
