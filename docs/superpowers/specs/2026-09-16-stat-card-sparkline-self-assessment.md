# Autoavaliação — `stat-card` e `sparkline`

Contra `.claude/skills/component/references/rubric.md` e
`docs/component-features.md` §18. Inventário em
`2026-09-16-stat-card-sparkline-capability-inventory.md`; desenho em
`2026-09-16-stat-card-sparkline-design.md`.

Capturas lidas em
`/tmp/claude-1000/-home-dreco-dev-slotted/77fe03d3-d507-48b1-a9a5-f3e4460481ad/scratchpad/shots/`:
`sparkline-{light,dark,high-contrast}-comfortable-ltr-{420,720}`,
`sparkline-light-comfortable-ltr-240`, `sparkline-light-dense-ltr-420`,
`sparkline-light-comfortable-rtl-420`, as cenas `tone`, `types`, `in-table`;
`stat-card-*` nas mesmas seis combinações e as cenas `anatomy`, `good-when`,
`sizes`, `fill`, `layout`, `loading`, `status`, `row`, `content`, `tone` em
light, dark e high-contrast; `sb-stat-card-{1280,b,c,row}.png`,
`sb-sparkline-b.png` (React Storybook, 1280, light).

## Padrão de acessibilidade (passo 4)

Não há padrão APG para sparkline nem para estatística
(<https://www.w3.org/WAI/ARIA/apg/patterns/>, lidos os trinta padrões). A
fonte é WAI-ARIA 1.2, `img` (<https://www.w3.org/TR/wai-aria-1.2/#img>):
elemento com nome acessível obrigatório, filhos presentacionais. Itens:

| Requisito                                    | Resposta                                                                                  | Evidência                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `role="img"` com nome                        | Root `role="img"`, `aria-label` gerado; `description` e `aria-label` do consumidor vencem | `sparkline.test.tsx` "is an image named by what it shows"; `sparkline.spec.ts` |
| Filhos presentacionais                       | `svg aria-hidden="true" focusable="false"`                                                | idem                                                                         |
| Sem foco, sem teclado                        | Nada focável; sem `tabindex`                                                              | contrato: `states: ["default"]`                                              |
| Cor não é o único canal                      | Direção na descrição; barra atual pela posição; tom é segundo canal                       | `sparkline.styles.test.mjs` "dims every bar but the current one"             |
| `forced-colors`                              | Escala → `CanvasText`; barras `GrayText`/`CanvasText`; área retirada; anel `Canvas`       | `sparkline.styles.test.mjs` "answers forced colours"                         |
| `stat-card`: região nomeada                  | `role="group"` + `aria-labelledby` do `label`; `aria-label` do consumidor vence           | `stat-card.test.tsx`, `stat-card.spec.ts`                                    |
| Delta legível sem o sinal                    | Palavra oculta antes do número (`up`/`down`/`unchanged`); indicador `aria-hidden`         | `stat-card.test.tsx` "reads the delta as a signed percentage"                |
| `loading`                                    | `aria-busy="true"` no root; placeholders `skeleton` (`aria-hidden`, `inert`)              | `stat-card.test.tsx` "stands every part in with a placeholder"               |

Afastamento deliberado: nenhum.

## As onze dimensões

1. **Icons.** `--slotted-icon-trending-up` (Lucide `trending-up`), virado por
   `scale` para a queda; `--slotted-icon-minus` para o plano; máscara sobre
   `currentcolor` com `forced-color-adjust: none` no bloco `forced-colors`.
   Mudança que mais melhoraria: um glifo próprio para "sem variação" com a
   mesma métrica do `trending-up` — não feita; `minus` a stroke 3 é mais pesado
   que o `trending-up` a stroke 2 por um pixel visual, medido na captura
   `good-when` e aceite.
2. **Motion.** `d`, `fill`, `cx`/`cy` transitam pela escala quando os dados
   mudam (`--slotted-duration-medium`); nada anima ao montar. Mudança:
   transitar a altura das barras num `resize` — não feita; a medida muda o
   `viewBox` inteiro e um `d` interpolado sobre grelhas diferentes desenha um
   caminho intermédio falso.
3. **Responsiveness.** `stat-card` é contentor (`stat-card`) com um degrau
   literal a 219 px; `trend` é contentor (`stat-card-trend`) com um degrau a
   39 px; `sparkline` mede-se por `ResizeObserver`. Capturas a 240 e a 200
   (`content`). Mudança: um segundo degrau do card (~320 px) que baixasse o
   valor um passo antes de empilhar — não feita; a 280 px o delta cai para
   baixo do valor e a leitura mantém-se.
4. **Refinement.** Figura no topo da linha que cresce, `trend` centrado ao
   lado ou no fundo, filas niveladas (`row`); marcador redondo sob qualquer
   grelha; unidade a um passo abaixo na linha de base do valor;
   `letter-spacing: -0.02em` no valor. Mudança feita nesta sessão: o cabeçalho
   alinhado pela linha de base e o piso de 10 rem do label. O detalhe que
   mudaria com mais uma hora: o `action` que cai sozinho para a segunda linha
   quando o label ocupa a primeira com o `status` (captura
   `stat-card-light-comfortable-ltr-240`); um agrupamento `status`+`action`
   pediria uma parte a mais.
5. **Tokens.** `sparkline.tokens.json` (40) e `stat-card.tokens.json` (94)
   lidos da folha; dois literais documentados no lugar:
   `--slotted-sparkline-area-opacity: 0.18` e
   `--slotted-sparkline-bar-share: 62%` (nenhuma escala da fundação guarda uma
   opacidade de preenchimento lido por transparência). `--slotted-sparkline-color`
   e `--slotted-sparkline-ring-color` são a entrega do contentor, como
   `--slotted-control-inner-size`. A escala de dados e os passos `4xl` e o
   glifo entraram na fundação com tabela e teste. Mudança: promover a
   opacidade da área a token semântico partilhado com `chart` — adiada para a
   onda 12, quando houver dois leitores.
6. **Patterns.** Tabela acima. Mudança: nenhuma pendente.
7. **Accessibility.** Nome gerado e localizado; direção do delta em texto;
   `group` nomeado; `aria-busy`; RTL espelha série, indicador e sinal
   (`unicode-bidi: plaintext`); `forced-colors` respondido. Não verificado
   nesta máquina: leitor de tela real. Mudança: `aria-describedby` do root do
   card para a descrição do sparkline — não feita; o `group` já contém a
   imagem nomeada e a duplicação leria o mesmo texto duas vezes.
8. **Native API.** React: `ComponentPropsWithRef` por parte, `render` em cada
   parte, `ref` composto com o do observador; Angular: `input()`, `computed`,
   `host`, `HostAttributeToken` para `aria-label`/`aria-labelledby`/`id`,
   `afterNextRender` + `DestroyRef` para o observador. Mudança: `model()` —
   não aplicável, nada é mutável.
9. **Capability.** Inventário §2: 26 linhas, 4 `decline` com dono nomeado
   (`chart` para tooltip; composição para legenda, alinhamento e contagem
   regressiva). Adicionado além do escopo: `series` (oito posições),
   `curve`, `area`, `marker`, `min`/`max`, `description`/`valueFormatter`,
   `format` e segundo `delta`, `plain`, `layout`, `status` com `message`,
   `unit` por composição. Mudança: `sparkline` com duas séries (atual e
   comparação num só root) — declinada; é o `chart`.
10. **Ecosystem integration.** Tabelas do desenho §5 e §6 respondidas linha a
    linha; providers em ambos (`SparklineDefaultsProvider`/`provideSparklineDefaults`,
    `StatCardDefaultsProvider`/`provideStatCardDefaults`). Assimetria
    registada: Angular recebe `aria-label` escrito pelo consumidor por
    `HostAttributeToken`; React pelo spread. Sem formulário em nenhum dos dois.
11. **Documentation.** Páginas React lidas a 1280 (light) em
    `sb-stat-card-*.png` e `sb-sparkline-b.png`; `tools/harness/audit.mjs`
    a 1280 e 620 em ambas: 0 achados (33 e 21 palcos). Angular: porta 6007
    sem resposta nesta sessão; página não lida. Mudança: a tabela de anatomia
    corta a coluna `purpose` à direita a 1280 — é o workbench (a página de
    `skeleton` corta igual), reportado, não corrigido aqui.

## §18

1. Propósito, casos, antiuso: docs `description`, cenas `in-table`, `row`;
   antiuso registado no inventário (tooltip → `chart`; contagem regressiva).
2. Anatomia estável: contratos (8 e 15 partes).
3. Contrato controlado: nenhuma capacidade mutável; sem `stateModel` por
   decisão (`measurement`, `status`, `loading` são do consumidor).
4. Matriz de estados: `stat-card` `loading` × `status` (loading > error >
   empty); `data-tone`, `data-trend`; `sparkline` `data-current` na última
   barra. `states.test.mjs` sem regras de hover a reter.
5. Teclado: nenhum; foco: nenhum; ARIA acima.
6. `size`, `fill`, `layout`, `tone`, `series` por tokens.
7. Responsivo, RTL, locale (`Intl.NumberFormat`, mensagens), reduced motion
   (transições da escala).
8. `loading`, `empty`, `error`, valor extremo (`content`), 400 pontos, `null`,
   série constante, um ponto, série vazia.
9. SSR: grelha nominal antes da medida, `useId`/contador; sem leitura de
   layout no render.
10. Exemplos: 11 + 10 cenas com fonte.
11. Testes: `sparkline.test.tsx` (14), `stat-card.test.tsx` (14),
    `sparkline.spec.ts` (9), `stat-card.spec.ts` (9), motor (29), folhas
    (14 + 17), contratos (19).
12. Família nova; sem migração.
