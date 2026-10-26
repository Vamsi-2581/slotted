# Achados do equori pendentes — triagem e plano

Fontes:

- `../equori/docs/slotted-findings.md`: registo de 80 títulos. Só o título faz fé; o estado de cada linha
  segue os comentários de workaround em `../equori/web` e não a versão instalada.
- `findings.v4`: 15 achados sobre `0.1.0-beta.15`, recebidos em 2026-10-24. O ficheiro foi apagado; o texto
  foi recuperado de `~/.findings.v4.swp` e está transcrito no Apêndice.

Base: `87775ab7` (`v0.1.0-beta.15`). O equori instala a beta.15.

Verificação de 2026-10-26: os 60 títulos dados como corrigidos pelos planos `2026-10-19-equori-findings.md`,
`2026-10-21-equori-owner-review.md` e `2026-10-21-equori-second-review.md`, pelos checkpoints v2 e v3 e
por `ef08d483` têm a correção presente no código da base. Os 20 itens abaixo não têm. A presença foi conferida
por identificador no código; o comportamento não foi reexecutado.

Regras da sessão: uma fatia fecha até três itens. Cada defeito leva o teste que falha antes da mudança. React
e Angular recebem a mesma mudança de contrato.

## Triagem

| #   | Título no registo do equori                                                                            | Origem   | Tipo     | Evidência na base                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------ | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The drawer header has no slot for actions beside the title                                             | v4       | feature  | Não existe `DrawerActions` em `packages/react/src/drawer`.                                                                                             |
| 2   | — (sem linha no registo)                                                                               | v4       | defeito  | Bottom sheet `size="full"`: `drawer.css:692` só tira borda e raio; o painel não ganha a altura do layer.                                                |
| 3   | An overlay sheet draws side borders at the width of the screen                                         | registo  | defeito  | `drawer.css:588` aplica `border-inline-width` em qualquer largura.                                                                                    |
| 4   | A drawer's slide duration has no token                                                                 | registo  | feature  | `drawer.css:139` e `:180` usam `--_slide` privado. A reescrever contra `affafaf5`: abrir e fechar passaram a ser scroll suave da camada.                |
| 5   | A message scroller in a bottom sheet keeps a pull at its top from moving the sheet                      | v4       | defeito  | `message-scroller.css:50` tem `overscroll-behavior: contain`.                                                                                         |
| 6   | A message scroller without items keeps its content hidden                                              | v4       | defeito  | `message-scroller.tsx:200` escreve `data-pending` fora de `defaultPosition="start"`; o core só limpa ao receber linhas.                                |
| 7   | A markdown tree in a message bubble collapses the bubble to its padding                                | v4       | defeito  | Sem commit depois da v4.                                                                                                                               |
| 8   | The markdown family needs an outside parser for plain CommonMark                                       | v4       | feature  | `markdown.types.ts` não tem `source`.                                                                                                                  |
| 9   | A full-screen dialog without a body places its footer in the stretched row                             | registo  | defeito  | `dialog.css:298` define `auto minmax(0, 1fr) auto`; a regra do footer (`dialog.css:1006`) não fixa `grid-row`.                                         |
| 10  | The prompt composer's ring glow is cut by its own mask and overflows its container                     | v4       | defeito  | `prompt-composer.css:624` e `:635` usam a máscara `content-box exclude`.                                                                              |
| 11  | The prompt composer has no dictation action                                                            | v4       | feature  | Não existe `PromptComposerDictate` em `packages/react/src/prompt-composer`; o core não tem glifo `mic`.                                                 |
| 12  | Dashboard-grid picks its column class from its own width, so a 1280 px window loses the layout         | v4       | defeito  | Sem prop `expandedFrom`.                                                                                                                               |
| 13  | Dashboard-grid rows have a fixed height and a widget cannot size to its content                        | v4       | feature  | Sem `rows="auto"`.                                                                                                                                     |
| 14  | Dashboard-grid widget headings default to level 3 under a page heading of level 1                      | v4       | melhoria | `dashboard-grid-defaults.tsx:11` define `headingLevel: 3`.                                                                                            |
| 15  | Dashboard-grid widget detail link cannot render a router link                                          | v4       | melhoria | Não existe `renderDetail` nem `render` na parte `detail`.                                                                                             |
| 16  | A link in a card, chart or section action takes the slot's font size and has no size axis              | v4       | melhoria | `link.tsx` não tem eixo `size`.                                                                                                                        |
| 17  | A pinned table cell has no ground, so the cells that scroll under it show through                      | v4       | defeito  | `table.css:732` e `:750` definem `background-color: inherit`; numa linha transparente o resultado é transparente.                                     |
| 18  | A calendar day cannot carry a mark of what falls on it                                                 | v4       | feature  | `calendar.tsx` não tem `renderDay` nem `marks`.                                                                                                        |
| 19  | Attachment preview thumbnail is not lazy-loaded                                                        | registo  | defeito  | `attachment-parts.tsx:50` tem `<img>` sem `loading="lazy"`.                                                                                           |
| 20  | a dialog or drawer mounted open plays no enter transition, and one unmounted on close plays no exit     | registo  | a decidir | A entrada foi corrigida em `9269f4a2`. Continua sem saída o overlay que o consumidor desmonta ao fechar. Falta decidir se é defeito do pacote ou uso; o workaround está em `../equori/web/src/ui/presence.tsx`. |

A descrição dos itens de origem "registo" está no comentário de workaround que cita o título, no equori:

- item 3: `web/src/theme/equori.theme.ts:144`;
- item 4: `equori.theme.ts:160`;
- item 9: `equori.theme.ts:135`;
- item 19: `web/src/features/transactions/attachments-section.tsx:101`;
- item 20: `web/src/ui/presence.tsx:7`.

## Fatias

1. drawer: 1, 2, 3.
2. drawer e message-scroller: 4, 5, 6.
3. message, markdown e dialog: 7, 8, 9.
4. prompt-composer: 10, 11.
5. dashboard-grid: 12, 13, 14.
6. dashboard-grid, link e table: 15, 16, 17.
7. calendar, attachment e presence: 18, 19, 20.

## Resultado

O commit de cada fatia é registado na fatia seguinte, porque o hash só existe depois do commit.

| #   | Estado    | Commit | Teste que falhava antes | Desvio da API proposta |
| --- | --------- | ------ | ----------------------- | ---------------------- |
| 1   | corrigido | `73255a80` | `drawer.browser.test.tsx` › "a drawer header with actions" (falhava na importação: `DrawerActions` não existia) | `DrawerActions` / `slDrawerActions` como proposto. Os botões mantêm o tamanho dado pelo consumidor: o drawer não reescreve o tamanho do `Button`, que é privado da família `button`. |
| 2   | corrigido | `73255a80` | `drawer.browser.test.tsx` › "a full bottom sheet with a short body" (rodapé a 161 px, esperado 844) | Com `drag="panel"`, o rodapé ocupa a última linha da grelha, a que recebe o espaço livre, alinhado ao fim. O corpo não estica, porque a altura do conteúdo é a soma das partes (`affafaf5`). |
| 3   | corrigido | `73255a80` | `drawer.browser.test.tsx` › "an overlay sheet as wide as the screen" (`1px`, esperado `0px`, no telefone e sob `size="full"`) | A borda lateral compara `100vw` com `--slotted-drawer-sheet-inline-size`; a regra de `full` ganhou especificidade (`[data-mode]`). |
| 4   | corrigido | `a8f24ea8` | `drawer.browser.test.tsx` › "the slide of a side drawer" (`0.1s`, esperado `0.24s`) | Reavaliado contra `affafaf5`: o bottom sheet com `drag` abre e fecha por `scrollTo` suave, cuja duração é do browser e não lê token; o workaround do equori (transição de `translate` em `[data-drag]`) já não atua. Os tokens `--slotted-drawer-slide-duration` (entrada, por omissão `--slotted-duration-long`) e `--slotted-drawer-slide-exit-duration` (saída, por omissão `--slotted-duration-medium`) regem o deslize por transição: start, end, top e bottom sem `drag`. A saída também dita o `content-visibility` diferido. |
| 5   | corrigido | `a8f24ea8` | `drawer.browser.test.tsx` › "a message scroller in a bottom sheet" (`scrollTop` da camada ficou em 915) | Nem regra em `[data-ui="drawer"]` no message-scroller nem token: o drawer, sob `drag="panel"`, dá `overscroll-behavior-y: auto` a todo o elemento dentro do painel, o que cobre qualquer família; `data-drawer-drag="none"` continua a conter. |
| 6   | corrigido | `a8f24ea8` | `message-scroller.test.tsx` › "shows content that holds no item, without a pending state" (React) e o espelho em `message-scroller.spec.ts` (Angular) | — (correção no core: conteúdo sem itens limpa `pending`; os primeiros itens ainda aplicam a posição de abertura). |
| 7   | corrigido | `673bac04` | `message.browser.test.tsx` › "a bubble holding a markdown tree" (24 px, esperado > 150) | — (causa: a raiz de `prose` é `container-type: inline-size`, sem largura intrínseca; dentro de uma bolha passa a `normal`). |
| 8   | implementado | `673bac04` | `parse.test.ts` (core), `markdown.test.tsx` › "Markdown from source" (React) e `markdown.spec.ts` › "SlMarkdown from source" (Angular) | `source` e `allow` como propostos, com `parseMarkdown` exportado de `@slotted/core/markdown`. `allow` mantém a semântica de tipos mdast já existente: o critério de aceitação passa a nomear também `text` e `listItem`. Com `streaming`, `completeMarkdown` fecha a fonte antes da leitura. O contrato deixa de excluir o parsing por inteiro: CommonMark além do subconjunto e GFM continuam no adaptador. |
| 9   | corrigido | `673bac04` | `dialog.browser.test.tsx` › "a full-screen dialog without a body" (botão a 510 px, esperado 915) | O corpo também fixa a sua linha (2), para um painel sem cabeçalho. |
| 10  | corrigido | fatia 4 | `prompt-composer.browser.test.tsx` › "the glow of the emphasis ring" (`scrollHeight` 223, esperado 200) | O critério de amostrar o alfa da borda passa a asserções estruturais verificáveis sem captura de ecrã: a caixa do brilho é a do compositor, sem máscara, com `filter: blur`. O halo é tinta do blur (não conta para overflow); a superfície do compositor repete-se em `::after`, acima do brilho. |
| 11  | implementado | fatia 4 | `prompt-composer.test.tsx` › "PromptComposerDictate" (React), `prompt-composer.spec.ts` › "slPromptComposerDictate" (Angular), `dictation.test.ts` (core) | `PromptComposerDictate` / `slPromptComposerDictate`, glifo `mic`, razão `dictation` (acrescentada ao vocabulário fechado: core, schema, `docs/state-and-events.md`) e motor em `@slotted/core/dictation`. `lang` cai para o atributo `lang` mais próximo, não só o do documento. Mensagens `dictate` e `listening`; sem `stopDictating`, porque o nome de um botão de alternância com `aria-pressed` não muda com o estado (APG). Sem motor, o React não desenha nada e o Angular esconde o botão do consumidor. |

## Apêndice — texto da v4 (recuperado de `~/.findings.v4.swp`)

```text
Feature — markdown: parse text.
Need: equori renders language model answers, which arrive as CommonMark text; the family only takes a tree. Proposed API: <Markdown source={text} allow={["paragraph","list","strong","link"]} /> parsing the allowed subset, any other syntax kept as literal text, links passed to the existing link renderer.
Acceptance: a test renders source "- **a** [b](/c)" as a list with a strong and a link, and "# t" as literal text.

Bug — message-scroller: pending state with no items.
Observed: <MessageScroller defaultPosition="end"> whose content holds no MessageScrollerItem keeps data-pending and hides its content forever. Expected: with no item to position, pending clears and the content shows. Repro: <MessageScroller defaultPosition="end"><MessageScrollerViewport><MessageScrollerContent><p>Notice</p></MessageScrollerContent></MessageScrollerViewport></MessageScroller>.
Acceptance: a test renders that repro and finds the notice visible (no data-pending on root).

Bug — message: Bubble/BubbleContent holding a Markdown tree.
Observed: a Bubble whose BubbleContent holds <Markdown> shrinks to its padding (content 26px, markdown root 0px), so text wraps one letter per line. Expected: the bubble sizes to the markdown's text like plain text, up to its max-width. Repro: <Message align="start"><MessageBody><Bubble><BubbleContent><Markdown tree={paragraph("Hello world, a long answer")} /></BubbleContent></Bubble></MessageBody></Message> in a 340px column.
Acceptance: a browser test measures the bubble's width above 150px for that repro.

Feature — drawer: header actions.
Need: a drawer used as a side panel (an assistant, an inspector) carries one or two icon actions beside its title, such as "history" and "new". The header grid has only title and close, so an extra child wraps to a second row.
Proposed API: DrawerActions, a part placed inside DrawerHeader between DrawerTitle and DrawerClose, laid out on the title's row (grid-template-columns: minmax(0,1fr) auto auto), gap from the header's own gap, icon buttons sized to the close button.
Acceptance: a test renders DrawerHeader with DrawerTitle, DrawerActions holding two IconButtons and DrawerClose, and asserts all four share the first row's top edge.

Feature — prompt-composer: dictation.
Need: a chat composer offers voice input; the family has attach and submit but no dictation, and the glyph set has no microphone.
Proposed API: PromptComposerDictate, a footer button that runs the browser's SpeechRecognition in the composer's lang (prop `lang`, default the document's), appends each final phrase to the value through onValueChange with reason "dictation", is aria-pressed while listening, announces "Listening" once, and renders nothing when no recognition engine exists; a `mic` glyph; messages { dictate, stopDictating, listening }.
Acceptance: a test with a fake SpeechRecognition presses the button, delivers a final result "hello", and finds the value "hello" with the button aria-pressed until the engine ends; without the engine the button is absent.

Bug — prompt-composer: ring glow.
Observed: with emphasis="ring", the glow part is blurred and then masked with `linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)`; the hard-edged mask cuts the blur, so the glow is a solid band with sharp inner and outer edges. The part also sits at inset: calc(-1 * reach), outside the composer's box, so a scrolling ancestor gains overflow and clips the glow into a rectangle. Expected: a soft halo that fades to transparent and does not change the layout box of the composer's container. Repro: <div style="overflow:auto;height:200px;display:grid;align-content:end"><PromptComposer emphasis="ring"><PromptComposerInput aria-label="m" /></PromptComposer></div>.
Acceptance: a browser test of that repro finds the container's scrollHeight equal to its clientHeight, and samples the glow's outer edge with alpha falling below 0.05 within the reach instead of a step.

Feature — calendar, day part.
Need: a planning agenda shows a month calendar beside a list of dated items and must mark the days that hold items (a dot or a count), without using selection to fake it.
Proposed API: `renderDay?: (date: PlainDate) => ReactNode` drawn inside the `day` part under the number, or `marks?: ReadonlyMap<string /* ISO date */, { count?: number; tone?: 'accent'|'info'|'success'|'warning'|'danger' }>` drawn as a `mark` part; the mark is included in the cell's accessible name ("12, 2 items"). Composes with every selectionMode, min/max and outsideDays.
Acceptance: a test renders a calendar with a mark on one date and asserts the `mark` part exists only in that cell and that the cell's accessible name includes the count; the test fails before the change.

Bug — table, pinned cells (sticky="end" and "start").
Observed: in a framed table wider than its scroller, a TableColumnHeader or TableCell with sticky="end" computes background-color rgba(0, 0, 0, 0); the cells that scroll under it show through, and the header text overlaps the next column's header.
Expected: a pinned cell paints the ground of its row (the header surface for header cells, the row surface including hover, selection and stripe for body cells), so nothing shows through.
Repro: <Table columns={7} variant="framed"> inside a 372px-wide container, seven text columns, the last TableColumnHeader and TableCell with sticky="end"; scroll horizontally.
Acceptance: a test renders that table and asserts the computed background-color of th[data-sticky="end"] and td[data-sticky="end"] is not transparent, in the light and dark schemes; the test fails before the change.

Bug — message-scroller, viewport part, inside a drawer bottom sheet.
Observed: the viewport sets overscroll-behavior: contain, so inside <Drawer side="bottom" drag="panel"> a downward pull at the top of the scroller does not chain to the sheet's scroll and the sheet does not move. Expected: inside a bottom sheet whose drag is "panel", the scroller's block-axis overscroll chains to the sheet, so a pull at the top of the list drags the sheet down, as the drawer's rule "a region inside data-drawer-drag='none' keeps its scroll from passing on to the sheet" implies for every other region. Repro: <Drawer open side="bottom" size="full"><DrawerPanel><DrawerBody><MessageScroller><MessageScrollerViewport><MessageScrollerContent>{30 items}</MessageScrollerContent></MessageScrollerViewport></MessageScroller></DrawerBody></DrawerPanel></Drawer>; scroll the list to its top and drag down on it with touch.
Proposed fix: let the viewport's block-axis overscroll-behavior be auto when it sits in [data-ui="drawer"][data-drag="panel"], or expose a token --slotted-message-scroller-overscroll.
Acceptance: a browser test opens the repro, scrolls the viewport to 0, dispatches a touch pull downward on it and asserts that the drawer root's scrollTop decreases; it fails on 0.1.0-beta.15.

Bug — dashboard-grid, column class.
Observed: a grid inside a 970 px wide container renders the "medium" class (halves) although the page is in the expanded size class, so a stored layout of twelve columns is ignored. Expected: a way to state the width from which the expanded class applies (for example `expandedFrom`, in pixels, default 1024), or a threshold that follows the viewport. Repro: render a DashboardGrid with a 12-column layout in a container 970 px wide inside a 1280 px window; widgets flow in halves.
Acceptance: a test that renders the grid at 970 px of its own width with `expandedFrom={900}` and asserts the widgets stand at their stored cells; it fails before the change.

Feature — dashboard-grid, DashboardWidget height.
Need: widgets whose content length depends on data (a list of rows, a figure row) must not clip or scroll inside the card. Proposed API: `rows="auto"` (or `minRows` read from the content) so the widget takes the rows its content measures, and the grid reflows what is below it; resizing still works as a minimum. Composes with `minRows`/`maxRows`.
Acceptance: a test with a widget of 6 list items and `rows="auto"` asserts its body has scrollHeight equal to clientHeight; it fails before the change.

Improvement — dashboard-grid, headingLevel default.
Current text (dashboard-grid.md, props table): `headingLevel` default 3. Replacement: default 'auto', following the heading outline as Section does (h2 directly in a page body, one deeper inside another section), with 2 to 6 still explicit.
Acceptance: a test that renders DashboardGrid inside Page (h1) and asserts each widget title is an h2; it fails before the change.

Improvement — dashboard-grid, DashboardWidget detail action.
Need: the corner link of a widget must navigate through the application's router. Proposed API: `renderDetail={(props) => <RouterLink {...props} />}` (or a `render` on the `detail` part), spreading every attribute including `href`, as `render` does on other parts.
Acceptance: a test that renders a widget with `renderDetail` returning a client-side link and asserts a click does not trigger a document navigation; it fails before the change.

Improvement — link family and the action slots of stat-card, section and chart.
Need: the same Link placed in StatCardAction, SectionActions and a Chart's `actions` renders 12, 16 and 14 px, because each slot sets its own text size and the Link inherits it. Proposed API: a `size` axis on Link ('xs' | 'sm' | 'md', default 'inherit' to keep today's behaviour), and a documented rule that an action slot sets one size for the interactive controls it holds (for example `sm`). Composes with Button, which already has `size`.
Acceptance: a test that renders a Link in each of the three slots and asserts the same computed font size; it fails before the change.

Bug — drawer, bottom sheet with size="full".
Observed: the panel is as tall as its content, so a short body leaves the footer in the middle of the screen. Expected: size="full" gives the sheet the height of the screen, the body takes the free space, and the footer rests at the bottom. Repro: <Drawer side="bottom" size="full"> with a one-paragraph DrawerBody and a DrawerFooter in a 390 px viewport.
Acceptance: a test that renders that drawer and asserts the footer's bottom edge equals the viewport's bottom edge fails before the change and passes after.
```
