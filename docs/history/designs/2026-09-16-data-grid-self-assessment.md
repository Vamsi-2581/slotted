# Data grid — autoavaliação

Inventário em `2026-09-16-data-grid-capability-inventory.md`; desenho em
`2026-09-16-data-grid-design.md`. Harness em
`packages/styles/src/data-grid/data-grid.harness.html` (dezasseis cenas).
Capturas em
`/tmp/claude-1000/-home-dreco-dev-slotted/0773a9ae-c3f4-4bc6-a56b-877521eb00c9/scratchpad/shots/`:
`data-grid-anatomy-{light-720, light-240, light-rtl-420, dark-420,
dark-dense-420, high-contrast-420}`, `filter-row-{light-720, light-dense-420,
dark-420}`, `filter-panel-light-420`, `editing-{light-420, light-720}`,
`grouping-{420, 720}`, `detail-{420, 720}`, `range-{light-720, dark-420}`,
`cursor-focus-data-current-{light, dark}-420`, `reorder-resize-420`,
`column-groups-420`, `content-420`, `empty-and-loading-420`; hover por
`probe-hover-{header,row}.png`; página React em `sb-docs*.png` (1280 claro,
`sb-docs-dark-720.png` a 720 escuro) e `sb-playground.png`.

## 1. As onze dimensões

| Dimensão          | Estado | A mudança que mais a melhorava                                                                                                                                                                                                                                                                                                       | Feita                                                                                                                                                                                                                             |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Ícones         | passa  | Quatro glifos em máscara (`chevron-down` na ordenação, `chevron-right` no expansor e no toggle de grupo, `ellipsis` no menu de coluna, `funnel` no gatilho de filtro), `forced-color-adjust: none` (G15); o `chevron-right` é o único artwork direcional e vira por `rotate` sob `:dir(rtl)`. O `funnel` é novo no tema e o centrador do gerador move-o (`verify-token-foundation.test.mjs`). | —                                                                                                                                                                                                                                 |
| 2. Movimento      | passa  | O menu de coluna e o gatilho de filtro revelam-se em `--slotted-duration-short`; a célula em edição não anima (o editor substitui o valor no mesmo frame); a linha de drop não anima. Faltava: a linha que desaparece sob um filtro não esbate.                                                                                        | Não: a janela virtual remonta linhas a cada scroll e um esbatimento por linha custaria um frame por linha em dez mil.                                                                                                              |
| 3. Responsividade | passa  | A grelha não reflui pela largura: rola nos dois eixos dentro da própria moldura, com `data-overflowing`/`data-at-start`/`data-at-end` pelo `scroll-affordance`. A 240 px a coluna fixa e o checkbox mantêm-se e o resto rola (`anatomy-light-240`). O rodapé embrulha (`flex-wrap`).                                                    | —                                                                                                                                                                                                                                 |
| 4. Refinamento    | passa  | Track de linha por `grid-auto-rows` (34/28/26 px) e não pela caixa, para nenhum botão de 30 px esticar a linha; réguas e grounds na linha e não na célula, para a faixa de preenchimento não abrir um buraco à esquerda; cursor em repouso como sombra interna a 60% do anel e o anel do tema em `:focus-visible`; arestas do intervalo por `::before` sobre a régua. A hora a mais: o gatilho de filtro só quando a coluna está filtrada, para o rótulo de uma coluna de 132 px não perder metade. | Sim (commit `9a6acf9` e a folha atual).                                                                                                                                                                                           |
| 5. Tokens         | passa  | 82 tokens de componente com fallback para a fundação (`data-grid.tokens.json`); nenhuma duração literal; sete propriedades de runtime declaradas em `runtime-properties.mjs`. Nenhum token novo na fundação além do glifo.                                                                                                              | —                                                                                                                                                                                                                                 |
| 6. Padrões        | passa  | APG Grid (data grids) transcrito no desenho §2: um tab stop, setas/Home/End/Page, Ctrl+Home/End, foco no widget único, Enter/F2/Escape para dentro e fora da célula. Departure registada: Tab dentro de uma célula com mais de um widget circula pelos widgets (APG permite as duas leituras).                                            | —                                                                                                                                                                                                                                 |
| 7. Acessibilidade | passa  | `aria-rowcount`/`aria-colcount` sempre, `aria-rowindex`/`aria-colindex` em cada linha e célula (a janela nunca é o conjunto); `aria-sort` só na primeira chave e a ordem inteira anunciada; `aria-readonly` na célula que não edita enquanto outras editam; `aria-invalid` + `title`; `aria-selected` na linha e na célula em intervalo; o nome do checkbox de cabeçalho diz quantas linhas cobre. Não verificado: leitor de ecrã real. | —                                                                                                                                                                                                                                 |
| 8. API nativa     | passa  | React: `ComponentPropsWithRef<'div'>` na raiz, `onKeyDown` do consumidor primeiro, `handle` por ref. Angular: host `sl-data-grid` com `id`/`class`/`(keydown)` do consumidor, `model()` para os sete valores, `*ChangeRequest` com `ChangeRequest`, `ControlValueAccessor` na seleção, `exportAs`, `provideDataGridDefaults`.             | —                                                                                                                                                                                                                                 |
| 9. Capacidade     | passa  | Inventário: 68 linhas de table stakes, 54 adotadas e 4 adaptadas, 7 recusadas com dono (`column-manager`, `filter-bar`, `pagination`, paste, exportação, gráficos, pivot). Diferenciadores: um descritor para três famílias, filtro compacto em três lugares, cursor APG com widget único, coluna por teclado com anúncio, conflito de edição. Lacuna que ficou: impressão (`domLayout="print"`). | Não: uma vista de impressão é uma folha `@media print` que desliga a janela virtual e a moldura; fica registada como reabertura, não é uma capacidade da grelha em ecrã.                                                          |
| 10. Integração    | passa  | Ambas as tabelas de `frameworks.md` respondidas no desenho §8. `applyQuery` no cliente e a mesma query reportada ao servidor; `toGridParams`/`fromGridParams` para URL; `serializeColumnState`/`parseColumnState` para vista guardada; `filter-bar` e `pagination` compostas nas cenas. Assimetria registada: React substitui superfícies por `render*` e mapas por coluna; Angular por sete `ng-template` com nome de coluna. | —                                                                                                                                                                                                                                 |
| 11. Documentação  | passa  | 33 cenas por 33 cenários em cada binding, mesmo domínio (remessas: oito, cinquenta, dez mil linhas; servidor simulado a 400 ms; barra de filtros; paginação; carregar mais). Página React lida a 1280 claro e 720 escuro, `audit.mjs` limpo a 1280 e 620. A página Angular não foi lida renderizada: 6007 em baixo; cada template de história é compilado e renderizado por JIT em `data-grid.stories.spec.ts`. | Parcial: a leitura da página Angular fica para o gate, com o Storybook 6007 levantado pelo reviewer.                                                                                                                              |

## 2. Contra `docs/component-features.md` §18

1. **Propósito.** Dados tabulares grandes e interativos: um cursor por
   célula, uma query aplicada ou reportada, colunas arranjadas pelo leitor,
   edição no lugar. Antiuso: dados que se leem e não se operam (`table`),
   uma lista de registos com um campo (`list`), um formulário em linhas.
2. **Anatomia.** Trinta e seis partes, contrato `anatomy`;
   `data-ui="data-grid"` na raiz e no painel de filtro (renderizado fora da
   raiz).
3. **Contrato de estado.** `sort` e `filter` partilham `query`/`defaultQuery`/
   `onQueryChange` com `change: sort | filter | search | page | group`;
   `columns`: `columnState`/`defaultColumnState`/`onColumnStateChange` com
   `change: order | width | hidden | pinned`; `selection` em dois modelos
   (`value` para linhas, `range` para células); `current`; `open` em dois
   (`expanded` para detalhe, `expandedGroups` para grupos). Razões por
   modelo no contrato. Angular: `model()` para os sete e `*ChangeRequest`.
   Edição é sessão por `handle`/`exportAs`, não modelo: um rascunho não é um
   valor que o consumidor possua.
4. **Matriz de estados.** Linha: `hover`, `selected`, `current`, `expanded`,
   `editing`, `disabled`, `striped`; célula: `current` (repouso e
   `:focus-visible`), `in-range` com `range-edge`, `editing`, `invalid`,
   `loading`, `readonly`, `pinned`/`pin-edge`; cabeçalho: `sortable`,
   `sorted`, `filtered`, `dragging`, `drop-target`, `resizing`. Precedência:
   `invalid` > `editing` > `current` > `selected` > `hover` > `striped`
   (regras na folha, por ordem de origem, sem `!important`).
5. **Teclado, foco, ARIA.** Tabela de teclas no desenho §2 (quarenta e duas
   combinações com destino de foco); testes em `data-grid.test.tsx` (35) e `data-grid.spec.ts`
   (32): setas, Home/End, Ctrl+Home/End, Enter/F2/Escape, Tab entre células
   editáveis, Shift+Space, Ctrl+A, Ctrl+C, Ctrl+Space, Alt+setas,
   Ctrl+Shift+setas, Ctrl+Enter, ArrowLeft/Right em grupo e em expansor.
   Toque: sob ponteiro grosso o menu de coluna, o gatilho de filtro e as
   ações de linha ficam sempre visíveis, e os controlos crescem com a escala
   de controlo do tema.
6. **Recipes.** `variant`, `striped`, `stickyHeader`, `stickyTo`, `rowHeight`,
   `height`; por coluna `align`, `numeric`, `text`, `width`/`minWidth`/
   `maxWidth`/`flex`; 82 tokens de componente.
7. **Responsivo, RTL, locale, reduced motion.** Capturas `240`, `rtl`, `dense`;
   valores com `unicode-bidi: plaintext`; collator e formatos por `locale`;
   `timeZone`; mensagens por provider e por instância; nenhuma animação além
   das revelações em `short`.
8. **Loading, empty, error, extremo.** `loading` (skeleton sem linhas,
   `aria-busy` e corpo esbatido com linhas); `empty`, `no-results` (com Clear
   filters) e `error` (com Try again) por `result-state`; nome de cem
   caracteres truncado com `title`, token sem quebra embrulhado por `wrap`,
   nome RTL, célula vazia numérica, linha desativada (cena `content`).
9. **SSR, performance.** `useId` / `SlDataGridIdFactory`; a janela é
   provisória (600 px) até o scroller ser medido, para dez mil linhas nunca se
   montarem todas; scroll coalescido a um frame; colunas do meio viradas
   acima de vinte; `ResizeObserver` guardado. Medido: recálculo de estilo
   ~1 ms com cinquenta linhas (`probe-perf.png`), igual a `table`.
10. **Exemplos.** 33 cenas na Nexora: remessas com transportadora, estado,
    peso, custo, ETA; barra de filtros, busca, servidor, paginação,
    carregar mais, vista guardada.
11. **Testes partilhados.** Contrato (19), styles (11), core `grid` (18),
    React (35 + 4), Angular (32 + 5, um deles renderiza cada história),
    workbench (`virtualization` aceita `rowHeight`).
12. **Changelog.** Família nova; `columns` entra em `KNOWN_CAPABILITIES` e
    `MUTABLE_CAPABILITIES`; `--slotted-icon-funnel` entra no tema. Sem quebra.

## 3. Verificação

- `node --test specs/components/data-grid/*.test.mjs` — 19 pass.
- `node --test packages/styles/src/data-grid/*.test.mjs` — 11 pass.
- `pnpm --filter @slotted/core verify` — pass (1485).
- `pnpm --filter @slotted/storybook-workbench verify` — pass (57).
- `packages/react`: `vitest run src/data-grid` — 39 pass; suite inteira 2945
  pass, 3 falhas noutras famílias (`calendar`, `table` ×2), de outra sessão.
- `packages/angular`: `ng build slotted-angular --configuration development`
  pass; `ng test --include='**/data-grid/**'` — 37 pass; `tsc -p
  tsconfig.storybook.json` sem erro na família.
- `pnpm typecheck` (raiz) — pass. `pnpm test:contracts` — pass.
  `pnpm test:package-layers` — pass.
- `pnpm lint` — 2 erros em `toggle-group`, de outra sessão. `pnpm
  format:check` — 2 ficheiros de outra sessão (`demos/nexora/domain.md`,
  `stat-card.harness.html`). `pnpm test:docs` — 2 falhas em `detail-panel`
  (id de snippet css nomeia framework), de outra sessão; a família passa.
- `turbo run verify --affected` — `tokens` (fonte `Geist Variable` e escalas),
  `styles` (`alert`, `breadcrumb`, `tag`, `text-field`, `tabs`) de outra
  sessão; `core` e `workbench` cancelados pelo turbo e verdes a sós.
- `tools/harness/audit.mjs` na página React — limpo a 1280 e a 620.

## 4. Decisões tomadas fora do que o escopo escrevia

- A marca de ordenação só na coluna ordenada e o gatilho de filtro só na
  coluna filtrada: o espaço reservado custava metade do rótulo numa coluna
  de 132 px; o menu de coluna reserva o único alvo e revela-se em hover e sob
  o cursor.
- A espécie `set` usa `select` com `multiple` na linha e no painel: o
  `multi-select` da biblioteca não cabe em 28 px de linha de filtro.
- O cursor em repouso é `box-shadow` inset e não `outline`, pela regra R3 do
  anel de foco; o anel do tema aparece sob `:focus-visible`.
- A coluna de seleção está sempre fixa ao início, mesmo sem outra coluna
  fixa: uma linha escolhida que perde o checkbox ao rolar perde a escolha.
- A janela virtual é provisória antes de medir o scroller, nas duas bindings:
  o primeiro paint montava as dez mil linhas.
- `slMenuTriggerFor` apaga o `data-part` do botão que o hospeda; a família
  restaura-o depois do primeiro render por `slDataGridPart`, como `toolbar`
  já fazia à mão.
- Reaberturas: `table` e `filter-bar` herdam a forma compacta do filtro
  (painel de 24 rem, uma condição por linha, operador em símbolo na linha);
  `column-manager` (onda 10) edita `columnState` e responde a
  `onManageColumns`.
