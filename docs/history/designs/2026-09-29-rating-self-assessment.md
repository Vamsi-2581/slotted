# `rating` — autoavaliação

Data: 2026-09-29. Desenho: [2026-09-25-rating-design.md](2026-09-25-rating-design.md). Dossiê:
[2026-09-25-rating-reui-dossier.md](2026-09-25-rating-reui-dossier.md). Capturas:
`tools/harness/out/rating-shots/`; espécimes: `tools/harness/out/specimen/rating/`.

## Onze dimensões

| Dimensão | Estado | Evidência | Melhoria com mais uma hora | Feita |
| --- | --- | --- | --- | --- |
| Ícones | passa | glifo `star` pelo elemento `Glyph` nos dois bindings; nenhum ícone pintado em CSS (`glyph-element.test.mjs`) | um glifo `heart` para demonstrar o símbolo substituído | não: `renderSymbol` e `slRatingSymbol` já provam a composição |
| Movimento | passa | recorte a 200 ms, entrada `easing-enter` ao acender e saída `easing-exit` ao apagar; barras a 320 ms com `@starting-style`; sem escala no hover; press 0,94; 1 ms sob movimento reduzido (`slotted-light-420-motion-reduce.json`) | transição da média e do intervalo do espectro ao mudar de filtro, medida no browser | sim, transição declarada; não observada ao vivo |
| Responsividade | passa | fila que encolhe em vez de quebrar (10 símbolos a 240 px); resumo lado a lado quando cabe; legenda com `row-gap` | a contagem do display a 240 px pode ficar sozinha na linha | não |
| Refinamento | passa | texto centrado na tinta com `text-box: trim-both cap alphabetic` (centro a 0,01 px da estrela); rádio da metade acima do inteiro | contagem e valor presos na mesma linha | não |
| Tokens | passa | `rating.tokens.json` igual à folha; `--slotted-rating-edge` na camada de componente com linha na fundação; cinco propriedades de execução registadas | — | — |
| Padrões | passa | APG rating radio group e rating slider (desenho § 2); partida deliberada: setas sem volta | — | — |
| Acessibilidade | passa, com uma partida registada | nomes por rádio no locale, `role="img"` com nome completo, `aria-readonly/required/invalid`, anel inset 2 px (5,17:1, 7,29:1, 21:1); em `light` e `dark` a estrela acesa mede 1,53:1 e a apagada 1,2:1 (fundação › Rating edge) | leitura com leitor de ecrã real | não: indisponível nesta máquina |
| API nativa | passa | React `ComponentPropsWithRef<'div'>`, `render`, `handle.focus()`; Angular signals, `host`, `HostAttributeToken`, `exportAs` | — | — |
| Capacidade | passa | três membros; meio passo; limpar; toque; resumo em barras e espectro; compacta e histograma; filtro por nível; conclusões com limiares | escala numérica de 0 a 10 (NPS) | recusada para `segmented-control` (`declined.nps`) |
| Integração | passa | `RatingProvider` e `provideRating()`; `ControlValueAccessor` e `Validator`; handlers compostos; `useId` para o nome | — | — |
| Documentação | passa | oito páginas de referência, `audit.mjs` com exit 0 nas oito a 1280 px | leitura a 720 px e em dark | não |

## Barra de craft

| Critério | Número que decide | Fonte |
| --- | --- | --- |
| Grelha de píxel | item 24 × 24, símbolo 20 × 20, trilho 8 px | `slotted-light-420-data-scene-default-*.json` |
| Hover | `rgb(241 245 249)` em `light`, `rgb(34 34 37)` em `dark`, `rgb(230 230 230)` em `high-contrast` | espécimes `default` |
| Press | `rgb(226 232 240)` ≠ hover | idem |
| Foco | 2 px; 5,17:1, 7,29:1 e 21:1 contra `ground` | idem |
| Transição | `background-color`, `clip-path`, `scale`, `fill`, `stroke`, `inline-size` listados | folha |
| Movimento | entrada e saída em tokens distintos | folha |
| Movimento reduzido | 1 ms | `slotted-light-420-motion-reduce.json` |
| Desativado | aceso `#64748b`, 4,76:1 | fundação |
| Esquemas | aresta preta em `high-contrast`; forma cheia e contorno sob cores forçadas | capturas `high-contrast`, `slotted-light-420-forced.json` |
| Densidade e RTL | símbolo 20 em `dense`, texto 12, intervalo 4; espelho em `rtl` | `slotted-light-420-dense.json`, `slotted-light-420-rtl.json` |
| Alvo | 24 px, 44 px em ponteiro grosso | folha |
| Intenção | cada valor é token ou está no desenho ou no dossiê | `rating.tokens.json` |

## Secção 18

1. Propósito: avaliação ordinal; antiuso: escolha nominal (`radio-group`), escala numérica (`segmented-control`).
2. Anatomia: desenho § 3.
3. Controlado e não controlado: `value`/`defaultValue`/`onValueChange` com `pointer`, `keyboard`, `clear`; `selectedLevels` com `pointer`, `keyboard`, `clear`. `null` é o vazio.
4. Estados: `hover`, `active`, `focus-visible`, `disabled`, `readonly`, `invalid`, `checked`, `pressed`; precedência em `states.test.mjs`.
5. Teclado e foco: contrato `keyboard`; toque por `ratingAtPoint`.
6. Tamanho e tom por tokens; densidade move o texto, não o símbolo.
7. RTL por `:dir(rtl)` e `ratingForKey`; locale em todos os números e plurais (`formatRatingMessage`).
8. Vazio: "Ainda sem avaliações", sem número; erro: `invalid` com as estrelas apagadas no par `danger`; conteúdo extremo: dez símbolos, 12.408.117 avaliações, legenda longa.
9. SSR: `useId` no React; no Angular o nome é uma ligação de atributo com sequência partilhada pela página.
10–11. Exemplos e testes: React 59, Angular 49, core 31, contrato 17, folha 17.
12. Contrato novo; nenhum consumidor a migrar.

## Achados fora da família

- `SlRadioGroupIdFactory` conta por aplicação: duas stories de `radio-group` numa página de docs partilham o mesmo `name`, e marcar um rádio desmarca o outro. `rating` corrigiu o seu (`SlRatingIdFactory`); `radio-group` fica para quando for reaberto.
- A tabela de anatomia do workbench corta a coluna `Purpose` a 1280 px, em `rating` e em `radio-group`.
- `chart-echarts` › "draws a line, its area and three bars" esgota os 5 s sob `pnpm check:affected` e passa sozinho.
