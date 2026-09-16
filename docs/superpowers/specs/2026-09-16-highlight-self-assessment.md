# Highlight — autoavaliação

Contra `.claude/skills/component/references/rubric.md` e
`docs/component-features.md` §18. Inventário em
`2026-09-16-highlight-capability-inventory.md`; desenho em
`2026-09-16-highlight-design.md`.

## As onze dimensões

| Dimensão                | Estado | A mudança que mais melhoraria                                                                                                                                                                 | Feita                                                                                                                                       |
| ----------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Icons                | n/a    | A família não desenha glifo nenhum; o `mark` é texto.                                                                                                                                         | —                                                                                                                                           |
| 2. Motion               | passa  | Nenhuma transição: a marca muda a cada tecla e uma transição de fundo atrasaria a resposta ao que o leitor acabou de escrever. `current` a saltar entre ocorrências é a rolagem do consumidor. | Decisão registada; nenhuma animação, nenhuma regra `reduced-motion` a escrever.                                                             |
| 3. Responsiveness       | passa  | Nenhuma query de contêiner: a família é inline e quebra com o texto. Cena `wrapping` a 240 px; `box-decoration-break: clone` nas duas metades.                                                | Feita (harness a 240, captura lida).                                                                                                        |
| 4. Refinement           | passa  | A régua do `current` era invisível dentro do preenchimento sólido: retirada. O detalhe com mais uma hora: um passo de ar inline dentro do preenchimento do `current`, que a regra de métrica zero proíbe. | A régua retirada; o ar não, por CB6.                                                                                                        |
| 5. Tokens               | passa  | Os seis tokens da família caem em tokens da fundação (`accent-text`, `accent-border`, `accent-solid`, `accent-on-solid`, `highlight-tint-opacity`); nenhum literal fora das isenções.        | `tokens.json` com catorze entradas; `tokens.test.mjs` passa.                                                                                |
| 6. Patterns             | passa  | Sem padrão APG; o elemento é `mark` como o HTML define. A tabela de exigências está no desenho §1.                                                                                            | Feita.                                                                                                                                      |
| 7. Accessibility        | passa  | O texto original é o único conteúdo; nenhum `aria-*`; `Mark`/`MarkText` e `Highlight`/`HighlightText` sob cores forçadas. A decisão de não injetar anúncio está no contrato.                  | Feita. O que esta máquina não verifica: NVDA e JAWS com o anúncio de `mark` ligado.                                                         |
| 8. Native API           | passa  | React: `ComponentPropsWithRef<'span'>`, `ref` na raiz, `render`. Angular: componente em seletor de atributo no elemento do consumidor, `input()`/`computed()`, `exportAs`, sem `render` porque o elemento é o do consumidor. | Feita.                                                                                                                                      |
| 9. Capability           | passa  | Doze linhas de table stakes com veredito; dois declines nomeiam a alternativa. `current` e a normalização a grafemas são os dois que nenhum surveyed tem.                                       | Feita.                                                                                                                                      |
| 10. Ecosystem           | passa  | React: provider de defaults, `render`, `ref`, props nativos, sem estado mutável logo sem evento. Angular: `provideHighlightDefaults`, `exportAs`, atributos do host preservados; sem forms, porque não é controle. | Feita. Assimetria: Angular expõe `runs()` pela instância; React não expõe — o consumidor conta com `matchRanges` do core (cena `current`). |
| 11. Documentation       | passa  | Onze cenas nos dois bindings; página React lida a 1280 (claro) e 720 (escuro), `audit.mjs` limpo a 1280 e 620. A página Angular não foi lida renderizada: 6007 estava em baixo.               | Feita para React; Angular pendente de um Storybook em execução.                                                                             |

## §18

1. **Propósito e antiuso.** Marcar os trechos de um texto que uma query
   encontrou, dentro de um host ou sob uma barra de busca. Antiuso: ênfase
   editorial (é `<mark>` do consumidor, sem a família), destaque de linhas de
   código (`code-block`, `marks`).
2. **Anatomia.** `root` (`span`, ou o elemento do consumidor) e `match`
   (`mark`, um por trecho contíguo).
3. **Contrato controlado/não controlado.** Nenhum valor mutável: `text`,
   `query`, `ranges`, `current` e `disabled` são do consumidor; a família não os
   move e não emite pedido. `stateModel` ausente por isso.
4. **Matriz de estados.** `default`; `current` na marca; `disabled` na raiz ou
   herdado. `disabled` vence `current` (regra escrita depois, especificidade
   igual). Sob cores forçadas: `Mark`/`MarkText`; `current` em
   `Highlight`/`HighlightText`.
5. **Teclado, foco, ARIA.** Nenhum: conteúdo, não controle. O host tem o papel.
6. **Recipes.** Eixos `occurrences` e `sensitivity`; nenhum `size` — a marca
   herda o tipo do texto.
7. **Responsivo, RTL, locale, reduced motion.** Inline; índices lógicos (cena
   `rtl`); `locale` na comparação; sem animação.
8. **Loading, empty, error, extremo.** Query vazia → texto puro; intervalo
   malformado → sem marca; 10 000 caracteres com query de um caractere medido
   abaixo de 500 ms no teste do motor; grafemas estendidos.
9. **SSR.** Motor puro; nenhum id; `Intl.Segmenter` disponível no Node.
10. **Exemplos.** Onze cenas: playground, query, multiple, occurrences, ranges,
    matcher, current, states, context, content, accessibility.
11. **Testes partilhados.** `highlight.test.ts` (motor, 20), `highlight.test.tsx`
    (React, 8), `highlight.spec.ts` (Angular, 8), `highlight.styles.test.mjs`
    (10), `contract.test.mjs` (10), stories test em cada binding (4 + 4).
12. **Quebra de contrato.** `combobox`, `select`, `multi-select` e
    `command-palette`: o `mark` deixa de levar `data-ui='highlight'` e passa a
    viver dentro de `span[data-ui='highlight'][data-part='root']` no `label`;
    todas as ocorrências em vez da primeira. Um consumidor que selecionava
    `mark[data-ui='highlight']` passa a `[data-ui='highlight'] [data-part='match']`.
    `collection.splitByMatch` devolve todas as ocorrências. O `ng-template` de
    item do `command-palette` Angular continua a receber `runs`; o padrão
    documentado passa a `query` + `[slHighlight]`.

## Evidência

- Capturas: `/tmp/claude-1000/-home-dreco-dev-slotted/e24f7894-a26e-4c45-860b-83cfc626a4a3/scratchpad/shots/highlight-*.png`
  (light/dark/high-contrast 420, light 240, dense, rtl, cena `current` nos três
  esquemas) e `react-docs-1280-light-*.png`, `react-docs-720-dark-*.png`.
- `pnpm check`: `format:check`, `lint`, `test:docs` e `test:contracts` limpos
  nos arquivos desta família; falhas restantes em `context-menu`, `hover-card`,
  `toggle-group`, `image`, `stat-card`, `aspect-ratio` e `docs/nexora-op-demo-domain.md`
  (outras sessões). `typecheck` limpo. Styles 1228/1234 (seis falhas fora da
  família: `alert`, `breadcrumb`, `image`, `tabs`, `tag`, `text-field`). React
  2748/2750 (duas em `table`, outra sessão). Angular: `highlight` 8/8 + stories
  4/4; hosts `combobox`, `select`, `multi-select`, `command-palette`, `listbox`
  166/166; `ng build slotted-angular` passa; `bundle.styles.test.mjs` falha só em
  `context-menu`.
