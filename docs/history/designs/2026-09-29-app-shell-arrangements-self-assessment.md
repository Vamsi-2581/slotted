# Autoavaliação — `app-shell`, arranjos (terceira passagem)

Desenho: `2026-09-29-app-shell-arrangements-design.md`. Dossiê: `2026-09-29-app-shell-reui-dossier.md`. Harness: `tools/harness/out/app-shell.html`, cenas `arrangements`, `floating`, `panel`, `primary-main`, `nav-rail`, `dark-nav`, `frame-image` (1280) e `compact` (420).

## Onze dimensões

| Dimensão | Resultado | Evidência | Melhoria mais valiosa | Feita |
| -------- | --------- | --------- | --------------------- | ----- |
| Icons | passa | nenhum ícone novo pintado pela família; o trilho da demo usa `IconButton` com `Glyph`/`ng-icon` | — | — |
| Motion | passa | o trilho explícito fecha pela transição de largura de `nav` (`--_duration`, `--_easing`) e a coluna sai por `visibility` `step-end`/`step-start`; o cartão `::before` não anima, por decisão | animar a opacidade da coluna ao fechar para o trilho, para não depender só do recorte | não: o recorte acompanha a largura e a opacidade somaria um segundo movimento à mesma mudança |
| Responsiveness | passa | cena `compact` a 420: `floating` e `panel` em camada perdem cartão e margem; o `::before` lê a consulta do contentor da raiz no primeiro paint | o `panel` antes da medição estreita mantém o padding da raiz durante um frame | não: a raiz não consulta a própria largura; custo escrito no CSS |
| Refinement | passa | ciclo visual: seis defeitos corrigidos, incluindo o recuo das linhas em `flush`, o alinhamento banner/marcas em `flush`, `floating` e `panel`, e a regra do rodapé de ponta a ponta | alinhar as marcas da camada sobreposta com o controlo do banner (9 px, igual em todos os planos antes desta passagem) | não: diferença anterior a esta passagem, registada |
| Tokens | passa | `--slotted-app-shell-tone-surface`, `--slotted-app-shell-frame-image` em `app-shell.tokens.json`; tom composto de `--slotted-surface` e `--slotted-text`; `tokens.test.mjs` e `fallbacks.test.mjs` verdes | expor `--_nav-inset` como token público | não: é o `row-inset` publicado por plano, e um segundo nome seria uma segunda resposta |
| Patterns | passa | Landmark Regions e Disclosure sem alteração; `nav-rail` fica dentro do único `nav` | — | — |
| Accessibility | passa | um landmark `navigation` com trilho; a coluna fechada sai do tab order por `visibility`; cores forçadas redesenham a regra sob `tone`; ordem de foco igual nos três `primary` | teste de cores forçadas no browser | não: afirmado pela regra `@media (forced-colors: active)` e pelo teste de estilos, sem captura `--forced-colors active` |
| Native API | passa | React `separation` e `AppShellNavRail` com `render`; Angular `separation` input e `SlAppShellNavRail` diretiva | — | — |
| Capability | passa | secção 6 do dossiê: 15 arranjos observados, 11 expressáveis, 2 adiados para `splitter`, 1 recusado com dono | predefinições no pacote | recusado: a lista de arranjos é do produto (demo) |
| Ecosystem integration | passa | `AppShellDefaultsProvider separation`, `provideAppShellDefaults({ separation })`; testes de provider nos dois bindings | — | — |
| Documentation | passa com pendência | cenas `canvas` (4), `separation` (3), `primary` (3), `navRail` (4), `theming` (3) nos dois bindings; `audit.mjs` React 1280 e 620: 0 achados | página Angular auditada com o Storybook reiniciado | não: o Storybook 6007 serve o módulo anterior até reiniciar |

## Craft bar

| Critério | Número | Fonte |
| -------- | ------ | ----- |
| Pixel grid | cartões com borda de 1 px e raio `--_radius`; `--_inner-radius` = raio − borda | `app-shell.css` |
| Hover | numa região com tom, hover recalculado a 4 % de `--slotted-text`: Δ L ≈ 0.030 contra o fundo | derivação; `app-shell.styles.test.mjs` |
| Press | active a 7 %: Δ L ≈ 0.053, diferente do hover | idem |
| Focus | sem alteração dos controlos da família | passagem anterior |
| Transition | largura de `nav` e `visibility` das partes da coluna em tokens de movimento | `motion.test.mjs` verde |
| Motion | enter `step-start`, exit `step-end` na coluna do trilho | `app-shell.css` |
| Reduced motion | tokens de duração colapsam pelo tema | `motion.test.mjs` |
| Disabled | não aplicável | — |
| Schemes | tom 0.036 L em light (`oklab(0.9643)` contra `#fff`) e dark (`0.2239` contra `#131316`) | `tools/harness/out/specimen/app-shell-panel/` |
| Density and RTL | `floating` denso e `panel`/`nav-rail` RTL com a anatomia intacta | capturas `floating-light-dense`, `nav-rail`/`panel` rtl |
| Target size | controlos inalterados | — |
| Intent | cada valor novo com comentário ao lado da regra | `app-shell.css` |

## Secção 18

- Anatomia: parte nova `nav-rail`; o resto inalterado.
- Estado: sem estado novo; o módulo do trilho é estado do produto.
- Matriz: 4 `canvas` × 3 `primary` × 2 `separation`, cena `arrangements`.
- Densidade e direção: propriedades lógicas; `--_nav-inset` compõe `--_row-inset`.
- Quebra: `dividers` → `separation`; `data-dividers` → `data-separation`; consumidor único, a demo, atualizado.
