# Breadcrumb — autoavaliação da reconstrução

Desenho: `2026-09-29-breadcrumb-rebuild-design.md`. Dossiê ReUI:
`2026-09-29-breadcrumb-reui-dossier.md`. Capturas do harness em
`tools/harness/out/shots/breadcrumb/`, specimens em
`tools/harness/out/specimen/breadcrumb/`.

## Dimensões

| Dimensão | Resultado e evidência | Mudança que mais a melhoraria | Feita |
| --- | --- | --- | --- |
| 1. Ícones | `ellipsis` e chevron do `trigger` são `Glyph` (`<Icon><Glyph name="chevron-down" />`, `<span slIcon><svg slGlyph>`); o separador é geometria; nenhum glifo pintado por CSS (`glyph-element.test.mjs` passa) | chevron rodado em rtl: `chevron-down` é simétrico, não precisa de `directional` | não aplicável |
| 2. Movimento | hover e press em `color`/`text-decoration-color` 120ms; reticência `background-color`; crumbs revelados `opacity` 200ms `easing-enter` por `@starting-style`; chevron `rotate` 120ms; recolher sem transição, motivo ao lado da regra; `reduce` → 1ms (`slotted-light-720-motion-reduce-*.json`) | entrada do `ellipsis` quando a largura o faz aparecer | não: aparece durante um redimensionamento, movimento repetido |
| 3. Responsividade | colapso por largura medido no `ol` (`createCollapse`), não por viewport; 240, 420, 720 e salas de 375/640 nas stories | `@container` para reduzir o `gap` abaixo de 240px | não: a dobra já responde antes de o `gap` pesar |
| 4. Refinamento | linha 20px (dense 18) em todas as partes emolduradas; reticência a 4px dos separadores com anel para dentro; seletor aberto sublinhado; desnível de 1px da página removido | espaço ótico do glifo `ellipsis` (pontos com 2px de apoio lateral) | não: pertence ao desenho do glifo em `@slotted/core/glyph` |
| 5. Tokens | `breadcrumb.tokens.json` igual às leituras do stylesheet; token novo `--slotted-breadcrumb-content-gap`; literais: ângulo do separador (contrato) e `180deg` do chevron (forma) | — | — |
| 6. Padrões | APG Breadcrumb item a item no desenho §2; o `trigger` herda o teclado de `menu` | — | — |
| 7. Acessibilidade | `aria-current` mantido no seletor da página; crumbs dobrados fora da árvore e contados no nome da reticência; foco para o primeiro revelado nos dois bindings e nos dois colapsos (testes) | leitor de ecrã real sobre a trilha dobrada | não verificável nesta máquina |
| 8. API nativa | React: `ComponentPropsWithRef<'button'>`, `render`, `ref`, handler composto com o de `MenuTrigger` (teste); Angular: componente no `button` do consumidor, `HostAttributeToken` para `type` e `aria-current`, `data-part` reposto após `slMenuTriggerFor` (teste) | — | — |
| 9. Capacidade | inventário do desenho §1: seletor, colapso por largura, glifo/contagem no crumb adotados; `disabled` e `collapsedState` recusados com dono | relatar a contagem dobrada por evento, como `toolbar` | não: `data-collapsed` e o nome da reticência já a expõem; nenhum consumidor da demo precisa do evento |
| 10. Ecossistema | `overflow` no `BreadcrumbDefaultsProvider` e em `provideBreadcrumbDefaults`; `createCollapse` libertado no cleanup do efeito e no `DestroyRef` | — | — |
| 11. Documentação | cenários `switcher` e `overflow` nas duas páginas; anatomia `trigger`; `overflow` e `current` nas tabelas; React lido renderizado a 1280 claro e escuro, `audit.mjs` sem achados a 1280 e 620 | ler a página Angular renderizada | pendente: o Storybook Angular serve o módulo anterior e precisa de reinício |

## Craft bar

| Critério | Número | Fonte |
| --- | --- | --- |
| Pixel grid | `link`, `page`, `trigger`, `ellipsis` 20px; dense 18px; separador 12/11px | `slotted-light-720-*collapsed*.json`, `-dense-*` |
| Hover | link ΔL 0,22; reticência ΔL 0,032 claro, 0,065 escuro, 0,075 high-contrast; seletor aberto sem delta (já está no estado mais forte) | `states[].deltas.hover` |
| Press | link e seletor → `--slotted-text`; seletor da página → mistura de hover; reticência ΔL 0,071 | `states[].deltas.active` |
| Focus | 2px; 5,17:1 claro, 7,29:1 escuro, 21:1 high-contrast, 19,04:1 forced; offset 1px nos crumbs, −2px na reticência | `states[].deltas.focus` |
| Transition | todas as propriedades pintadas listadas; tokens de duração e easing | `rest.style` |
| Motion | entrada `medium`/`enter`; recolher sem transição (motivo escrito) | `breadcrumb.css` |
| Reduced motion | 1ms | `-motion-reduce-*.json` |
| Disabled | n/a no contrato | `contract.json` |
| Schemes | high-contrast e forced-colors com a mesma anatomia | `breadcrumb-high-contrast-*.png`, `-forced-*.json` |
| Density e RTL | dense 12/18px; rtl espelhado, separador −20°, chevron à esquerda do texto | `breadcrumb-light-dense-*`, `-rtl-*` |
| Target size | linhas a 24px de centro a centro nas três densidades; reticência com halo de 24 | `list` › `row-gap` |
| Intent | cada valor é token ou literal registado ao lado da regra | `breadcrumb.css` |

## Secção 18

- Anatomia: oito partes; `trigger` novo.
- Controlado e não controlado: `expanded` / `defaultExpanded` / `onExpandedChange` (`expandedChange`), razões `pointer` e `keyboard`. O conjunto dobrado pela largura não tem par: é lido do layout.
- Estados: `default`, `hover`, `active`, `focus-visible`, `expanded`, `open` (do `menu`).
- Densidade e direção: tamanhos pela escala de controlo; separador e trilha espelham por `:dir(rtl)`.
- Conteúdo extremo: palavra composta, identificador sem quebra e árabe com `overflow="wrap"`; trilha de um crumb; oito crumbs a 375px.
- Loading, empty, error: recusados para `skeleton` no contrato.

## Defeito encontrado

O binding Angular desenhava a reticência dentro do crumb que o colapso esconde, e o `display: none` do crumb escondia o controlo que o revela. O spec não o via, porque o jsdom não calcula `display`. A reticência passou a ser um `li` próprio criado pela lista; um spec novo verifica que o seu item não tem `hidden` e não contém o crumb seguinte.
