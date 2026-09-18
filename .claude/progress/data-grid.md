# Checkpoint — `data-grid`

## Plano

Skill `/component`, modo `create`. Desenho em
`docs/superpowers/specs/2026-09-16-data-grid-design.md`; inventário em
`docs/superpowers/specs/2026-09-16-data-grid-capability-inventory.md`.
Progresso desta família fica neste arquivo (não em `current.md`, que outra
sessão pode escrever).

## Tarefas concluídas

1. Passos 1–5: leitura da lei; inventário (onze fontes, quatro secções);
   padrão APG transcrito; desenho com as duas tabelas de integração.
2. Passo 6: `columns` em `specs/contract.schema.mjs` (commit `84a9984`);
   `specs/components/data-grid/contract.json` + `contract.test.mjs`, 19/19
   (commit `d8e995a`).
3. Passo 7–8: `packages/styles/src/data-grid/{data-grid.css, data-grid.tokens.json,
   data-grid.harness.html, data-grid.styles.test.mjs}`; registo em
   `packages/styles/package.json`; propriedades de runtime em
   `runtime-properties.mjs` + `tokens.test.mjs` (commit `f9ac5d9`); folha e
   harness (commit `e199d0f`). Testes partilhados de `packages/styles`: 170/170;
   família 11/11.
4. Capturas lidas em
   `/tmp/claude-1000/-home-dreco-dev-slotted/0773a9ae-c3f4-4bc6-a56b-877521eb00c9/scratchpad/shots/`:
   anatomy (light 720/420, dark 420, hc 420, rtl 420, 240), filter-row (light
   720, dense), filter-panel (light 420, três iterações), editing (light 720),
   grouping, detail, empty-and-loading, content, reorder-resize,
   column-groups, cursor com `--focus` (light e dark), range dark.

5. Gate visual aprovado depois de um refino (commit `9a6acf9`: track de
   linha, chooser fixo, acções de linha da família, track de preenchimento,
   réguas nas linhas).
6. Passo 10 (motor + React): `packages/core/src/grid/` (commit `668a137`,
   18/18); `packages/react/src/data-grid/` (commit `2d2a472`, 35/35).
7. Passo 11 (React): docs + stories (commit `709513e`); `audit.mjs` limpo a
   1280 e 620 em 6006; lido em claro 1280 e escuro 720. Workbench:
   `virtualization` aceita `rowHeight` (commit `3adb5e1`).

8. Passo 10–11 (Angular): `packages/angular/data-grid/` (commit `8b9524b`):
   `SlDataGrid` (host `sl-data-grid`, `exportAs slDataGrid`), controlos,
   templates, defaults; 32 specs; docs + 33 stories; teste que renderiza cada
   template de história por JIT (`data-grid.stories.spec.ts`). Janela
   provisória (600 px) antes de medir o scroller, nas duas bindings.

9. Passo 12: `pnpm check` — typecheck, contratos e camadas verdes; falhas fora
   da família registadas na autoavaliação §3 (lint `toggle-group`, prettier
   `nexora`/`stat-card`, docs `detail-panel`, styles `alert`/`breadcrumb`/
   `tag`/`text-field`/`tabs`, tokens `Geist`, React `calendar`/`table`,
   Angular `table`, bundle `context-menu`). Angular `ng build` prod pass.
10. Passo 13: autoavaliação
    (`docs/superpowers/specs/2026-09-16-data-grid-self-assessment.md`),
    build-order (entregue + três reaberturas), tema `funnel`, snippets
    literais nos docs (commits `0a7ac80`, `954d4af`, `13698c7`).

11. Rondas de refino ao vivo depois do gate (commits `67d88b1`, `afe736e`,
    `5fe7cfe`, `519cf05`, `ee46a0a`, `cb9b45f`, `d1bd8c5`): zona fixa e
    goteiras, track da linha, aresta com sombra (tinta do scrim), controlos
    dentro do anel em qualquer densidade, filtros com pickers e range pickers,
    linha de filtro (operador com ar, recorte, anel único), painel com a
    própria inserção e medida por espécie, multi-select para `set`, seleção
    de texto, tab stop sempre, reordenar por ponteiro (um contentor), popups
    com `width="content"`, esqueleto até à moldura, estado vazio `sticky`
    fora do body, badge com tamanho próprio, linhas auto ao topo,
    `manageable` no Angular. Fora da família, pela raiz: date-field,
    time-field, datetime-field e date-range-picker numa linha (contrato de
    datetime-field `wrapping` → `overflow`); multi-select (placeholder só
    vazio; ficha de contagem fora das unidades).

12. Sessão de refino 2 (commits `e39bc3c`, `1e3e2a0`, `08a6b3e`): `canDrag`
    em `DraggableOptions` (core/drag) — a pressão no resizer começava um
    reorder; guia de reorder segue o viewport (`--slotted-data-grid-drop-scroll`)
    e o hit test horizontal do drag espelha em rtl (`direction` no
    `MeasuredContainer`); rodapé com o pager ao fim da linha e histórias/
    snippets na barra de tabela de `pagination` (page size, status, anterior,
    seguinte; `showRange` desligado).

13. Sessão de refino 2, segunda fatia (commits `99ad443`, `078e3c8`):
    `autoScroll.axis` no core/drag e eixo `x` na grelha (reorder alcança
    colunas fora do viewport); `rowHeight` numérico escreve
    `--slotted-data-grid-row-block-size`; `--slotted-data-grid-head-block-size`
    separa cabeça/filtro/resumo/rodapé da linha do corpo; cena `media`
    (contrato, React, Angular) com avatar + miniatura e dez mil linhas de
    56 px; `--slotted-data-grid-drop-scroll` como propriedade de runtime.

14. Extensões (desenho em
    `docs/superpowers/specs/2026-09-17-data-grid-extensions-design.md`),
    onda 1, fatia 1 (commits `10deddd`, `458d516`, `a9b6780`): autofit total
    num só pedido e medido por Range; `highlightChanges` com cena `realtime`;
    vista persistida (`core/grid/view.ts`, `usePersistedGridView`,
    `persistedGridView`) na cena `column-state`.

15. Onda 1 peça 4 e onda 2 (commits `toCsv/exportCsv`, `tree`, `row
    reordering`, glyph `grip-vertical`): exportação CSV + `@media print`;
    tree data (motor + duas bindings + folha + harness); row reordering
    (segundo controlador de drag, alça, Alt+↑/↓). Correções de caminho:
    `pagination` (margem do intervalo), histórias Angular (props que
    colidiam com membros da grelha: `status`, `setFilter`).

16. Onda 3 (commits `pinned rows`, `data source`): `pinnedRows` com
    rowgroups sticky às alturas medidas; `dataSource` com cache por query,
    abort, erro/retry e `reload()`. Desenho das extensões fechado.

## Tarefa em curso

Nenhuma. As três ondas do desenho de extensões estão entregues. Candidatos
seguintes: spanning (reabertura de §9), paste (reabertura de §9), list view
(depende de família de lista), lazy loading por janela na fonte.

Onda 1, peça 4 — exportação: `toCsv` em `core/grid`, `handle.exportCsv`
(React) e `exportCsv()` (Angular), `@media print` na folha, cena `export`
(contrato + docs nas duas bindings). Depois onda 2 (tree data, row
reordering) e onda 3 (row pinning, data source), cada uma com desenho
detalhado antes do código.

Refino contínuo da data-grid em sessão própria. Ferramentas de sessão em
`/tmp/claude-1000/-home-dreco-dev-slotted/388c36de-ad51-41c7-a63e-41147be23922/scratchpad/`
(`sb-probe.mjs` com `DRAGDX`/`DRAGDY`/`DRAGHOLD`; `format-snippets.mjs` e
`format-angular-snippets.mjs` correm de dentro do repo, pois importam
`prettier`). Origem:
`/tmp/claude-1000/-home-dreco-dev-slotted/0773a9ae-c3f4-4bc6-a56b-877521eb00c9/scratchpad/`:
`sb-probe.mjs` (navega a uma história do Storybook, `CLICK`/`HOVER`/`DRAG`/
`SCROLL`/`KEYS`/`AFTER` por env, JS de relatório, recorte por selector),
`sb-profile.mjs` (perfil CPU de uma ação), `sb-trace.mjs` (timeline). O
diretório é da sessão: copiar para o scratchpad da nova sessão antes de usar.

## Regra desta família (aprendida à custa)

Cada ajuste é verificado ao vivo nas **duas** páginas, 6006 e 6007, antes de
commitar. A binding Angular aloja partes em elementos host próprios
(`display: contents`): painel de filtro, operando da linha de filtro,
controlo do editor e dos operandos. Uma regra CSS com combinador de filho
(`>`) que atravesse um desses hosts vale só no React;
`data-grid.styles.test.mjs` recusa-as, e uma parte alojada é alcançada por
dois seletores (filho, e filho de um elemento sem parte), nunca por `:is()`
com combinador.

## Git

Branch `review/implementation-pass-1`. Commits desta sessão: `84a9984`,
`d8e995a`, `f9ac5d9`, `e199d0f`, `9a6acf9`, `668a137`, `2d2a472`, `3adb5e1`,
`709513e`, `8b9524b`. Tema `funnel` commitado em `0a7ac80` (a sessão de `image` já tinha
commitado `image-off`). Nada da família fica por commitar; `docs/build-order.md`
mantém hunks de outras sessões (`dialog`, `prose`, `page-header`,
`table-of-contents`, `detail-panel`).

## Estado dos testes

`node --test specs/components/data-grid/*.test.mjs` 19/19.
`node --test packages/styles/src/*.test.mjs` 170/170.
`node --test packages/styles/src/data-grid/*.test.mjs` 11/11.
`node --test specs/*.test.mjs`: 1 falha fora da família (`otp-input` Angular
sem docs) e, a partir de agora, `data-grid` sem páginas de referência
(esperado até ao passo 11).

## Ajustes de escopo

- Marca de ordenação só na coluna ordenada (sem revelação em hover): a marca
  reservada custava metade do nome numa coluna de 132 px.
- Gatilho de filtro no cabeçalho só enquanto a coluna está filtrada; o menu
  da coluna reserva um alvo e revela-se em hover/cursor.
- Espécie `set` na linha e no painel: `select` com `multiple` (resumo no
  gatilho), não `multi-select`.
- Cursor em repouso: `box-shadow` inset (não `outline`), para a regra R3 do
  anel de foco; sob `:focus-visible` o anel do tema.
- `--slotted-icon-funnel` novo no tema (Lucide `funnel`).
- `unicode-bidi: plaintext` nos valores das células.

## Problemas conhecidos

Nenhum na família. `otp-input` (outra sessão) falha `specs/*.test.mjs`.
Storybook Angular (6007): todas as cenas de data-grid falham com "Component
'SlFilterBar' is not resolved" — `packages/angular/filter-bar/src/filter-bar.ts`
declara `styleUrls: STYLES` (constante, não literal), que o JIT do Storybook
não resolve; ficheiro de outra família, por reportar.

## Aberto (candidatos para a sessão de refino)

- Persistência: um `usePersistedGridState(key)` (React) e equivalente
  Angular sobre `serializeColumnState`/`toGridParams`, ou manter a decisão
  de que o storage é da aplicação; decidir com o utilizador.
- Column/row spanning: reabertura de desenho (conflita com janela de
  linhas, intervalo e ordenação); não consta de §9.
- Realtime: medir `applyQuery` a 10 Hz com 10k linhas; "flash" de célula
  alterada; atualização incremental por linha.

- Medir a grelha fora do Storybook (o addon a11y e a Performance track do
  React em dev dominam o INP medido): uma página de bancada em
  `apps/` ou o harness com o bundle de produção.
- "Cascading Update" de 80 ms depois de ordenar (um efeito que escreve estado
  após o commit); identificar e fundir.
- Select com `width="content"` e itens curtos (Yes/No) abre a 69 px; decidir
  se a família `select` merece um mínimo de medida para listas.
- Autoavaliação e `docs/build-order.md` ainda descrevem o estado anterior às
  rondas de refino (e.g. `set` como `select multiple`); atualizar.
- A página Angular (6007) continua por ler renderizada.

## Próxima ação

Ler o Storybook Angular (6007) cena a cena quando o `filter-bar` da outra
lane compilar; medir `applyQuery` a 10 Hz com 10k linhas na cena
`realtime`; atualizar `docs/superpowers/specs/2026-09-16-data-grid-self-assessment.md`
e `docs/build-order.md` com as extensões.


Peça 4: escrever `packages/core/src/grid/export.ts` com `toCsv(rows, columns,
options)` (RFC 4180, texto pelo formatador da coluna e do tipo — ver
`textOf` em `apply.ts`), teste em `grid.test.ts`; depois `exportCsv` no
handle React (`data-grid.types.ts`, `data-grid.tsx`) e no `SlDataGrid`;
`@media print` em `data-grid.css`; cena `export` em `contract.json`,
histórias e docs.


Na nova sessão: ler este ficheiro, `git log --oneline -12`, e a lista acima;
abrir 6006 (`http://localhost:6006/iframe.html?viewMode=story&id=components-data-grid--<cena>`)
e verificar cada cena com `sb-probe.mjs` antes de mexer.
