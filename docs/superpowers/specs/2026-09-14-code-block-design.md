# `code-block` — design

Decisions taken from
`docs/superpowers/specs/2026-09-14-code-block-capability-inventory.md`, before
the contract, the stylesheet and the two bindings were written. Round 11 of
`docs/build-schedule.md`, in one session with `filter-bar`.

---

## 1. Tokens in, never HTML

The family takes lines of tokens and draws them. It never receives HTML and
never writes `innerHTML`.

```ts
type CodeScope =
  | 'comment' | 'keyword' | 'string' | 'number' | 'function' | 'type'
  | 'variable' | 'property' | 'punctuation' | 'tag' | 'attribute' | 'constant';

interface CodeToken { readonly text: string; readonly scope?: CodeScope }
type CodeLine = readonly CodeToken[];
type CodeHighlighter = (code: string, language: string) => CodeLine[] | Promise<CodeLine[]>;
```

`@slotted/core/code` is a new entry — an export in `packages/core/package.json`
and an entry in `vite.config.ts`, appended — holding the types, `plainLines`,
`parseLineRanges`, `lineMarks`, `copyText`, and two mappings that import
nothing: `fromPrismTokens` walks Prism's `(string | Token)[]` and folds
`type` and `alias` onto the twelve scopes through one table; `fromShikiTokens`
walks `codeToTokens(..., { includeExplanation: 'scopeName' })` and folds the
last TextMate scope of each token the same way. Twelve scopes rather than
Prism's sixteen or TextMate's hundreds, because twelve is what a theme can
give distinct colours to on one ground at 4.5:1 and a reader can tell apart.

The engine is asynchronous by default and the block is not: it draws
`plainLines(code)` first and replaces each line's spans when the highlighter
resolves. A line is a grid row whose height comes from the text, so the swap
moves nothing. A rejected highlighter leaves the plain text and reports through
`onHighlightError(error)`.

## 2. The scope palette is a theme scale

Twelve tokens in the component layer, scheme axis, root, forced colour
`CanvasText`:

`--slotted-code-comment`, `-keyword`, `-string`, `-number`, `-function`,
`-type`, `-variable`, `-property`, `-punctuation`, `-tag`, `-attribute`,
`-constant`.

The bar for the component layer is written under **Avatar size** and **File
kind** in `docs/token-foundation.md`: a family may not alias a semantic token
there and may not restate a scale that exists. The five tones give five hues,
and a language has more than five kinds of word; reaching for `danger` to
paint a keyword would make one tone mean two things on a page that also has an
error. Every value is measured by `packages/themes/default/test/default-theme.test.mjs`
against the block's ground — `--slotted-surface-sunken` — at 4.5:1 in `light`
and `dark` and 7:1 in `high-contrast`, the same ratios the scheme promises
text. Under forced colours the whole scale is `CanvasText`: the system owns
the palette, and code is then read by its shape, which is what `prose` already
decided for a fence.

This is a shared-tool change — `packages/tokens/src/contract.json`,
`packages/themes/default/src/theme.json`, the theme test and the token
foundation document — and it goes in its own commit before the family's.

## 3. Anatomy

```
root                div[data-ui=code-block]        data-language, data-wrap, data-revealed, data-loading
├─ header           div                            drawn when title, language or a control exists
│  ├─ icon          span                           file-kind glyph beside a filename
│  ├─ title         span
│  ├─ language      span                           the language name, at the end
│  └─ actions       div
│     ├─ wrap       button aria-pressed            drawn while a line overflows
│     └─ copy       button                         description-list's control
├─ body             scroll-area (root, viewport, content) worn as data-ui
│  └─ pre           pre
│     └─ code       code.language-<x>
│        └─ line*   span[data-line=n][data-mark]  a grid row
│           ├─ number  span aria-hidden user-select:none   the counter
│           ├─ marker  span aria-hidden                    + / − / • for add, remove, highlight
│           └─ token*  span[data-token=scope]
└─ reveal           button                         drawn when collapseAfter is set
```

The root is a `div`, not a `figure`: a figure with no caption is announced as
an unnamed figure, and most blocks have no title. `body` is `scroll-area`'s
three elements and nothing of this family's: the region role, the tab stop
and the name exist only while the code overflows, and the name is the title,
then `aria-label`, then `labels.region`.

`pre` keeps `white-space: pre` and takes `pre-wrap` under `data-wrap`;
`direction: ltr` on it whatever the page's direction, `prose`'s rule, while
the header keeps the page's. A line is `display: grid` with the gutter
columns, so a wrapped continuation stays under the code and not under the
number; its `text-indent` is the negative of its leading whitespace and its
`padding-inline-start` the positive, measured once per line in `ch`, so the
continuation aligns with the code's own indent.

## 4. State

| Capability | Model                                                 | Reasons                          | Where it shows                                        |
| ---------- | ----------------------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| `pressed`  | `wrap` / `defaultWrap` / `onWrapChange`               | `pointer`, `keyboard`, `programmatic` | `data-wrap` on the root, `aria-pressed` on the control |
| `revealed` | `revealed` / `defaultRevealed` / `onRevealedChange`   | `pointer`, `keyboard`, `escape`, `programmatic` | `data-revealed` on the root; the block's `max-block-size` |
| `copyable` | not mutable — `onCopy(outcome, request)`              | `pointer`, `keyboard`            | `data-complete` on the control for two seconds        |

`marks`, `lineNumbers`, `start`, `collapseAfter`, `maxLines`, `copy`,
`copyRemoved`, `title`, `language`, `loading` are axes and values, not state.

## 5. Marks

`marks: { highlight?, add?, remove?, focus?, error?, warning? }`, each a
`string` such as `'1,4-6'` or a `number[]`, parsed by `parseLineRanges`. A
line takes one `data-mark`, resolved in the order `remove`, `add`, `error`,
`warning`, `highlight`; `focus` is separate — it dims every line **outside**
its range, `data-dim` on those lines — because it composes with the others.
The dim lifts on hover and on focus-within of the body, transitioning on
`--slotted-duration-medium`, and is dropped under forced colours.

`add` and `remove` paint `--slotted-tone-success-surface` and
`--slotted-tone-danger-surface` behind the line and `+` / `−` in the marker
column in the tone's text colour; `highlight` paints `--slotted-tone-accent-surface`
with an accent bar at the inline start, the pair the foundation asks a chosen
state to carry; `error` and `warning` are `danger` and `warning` with the bar.

Magic comments are not parsed. A Markdown pipeline that has them hands the
family `marks`.

## 6. Copy

`copyText(code, marks, { includeRemoved })` builds the string: the lines of
`code`, minus the `remove` lines unless `copyRemoved`. The control is
`description-list`'s in every measure — `@slotted/core/clipboard`,
`data-complete` for `--slotted-duration-long × 6` (two seconds, stated as a
multiple of the scale), the check glyph in place of the two sheets, the
outcome announced politely through `labels.copied` and `labels.copyFailed`,
and a refused write leaving the text selectable. `copy: false` removes the
control.

## 7. Collapse

`collapseAfter` in lines; below it nothing is drawn differently. Above it the
body takes `max-block-size` of that many line boxes plus the inset, the last
visible line fades into the `reveal` control through a mask, and `reveal`
reads `labels.reveal(hidden)` — "Show 24 more lines". `revealed` releases the
limit; `Escape` with focus inside the revealed block collapses it and keeps
focus on the block. The hidden lines are in the DOM and in a selection.

`maxLines` is the other bound: the body scrolls past it and never collapses.
The two compose — a block collapsed to eight lines and, once revealed, scrolled
past forty.

## 8. Loading and empty

`loading`: the frame at the height `collapseAfter` gives, or six lines,
`aria-busy` on the root, no copy control, `skeleton` lines inside. An empty
`code` draws one empty line with its number and `data-empty` on the root.

## 9. Keyboard

The APG index holds no code pattern, and the contract records the absence
with the requirements that govern the block instead — WCAG 2.2 SC 2.1.1 and
`scrollable-region-focusable`, which `scroll-area` already answers, and SC
1.4.10 Reflow, which the wrap control answers.

| Key            | Where          | Effect                                            | Source                 |
| -------------- | -------------- | ------------------------------------------------- | ---------------------- |
| `Tab`          | page           | the copy control, the wrap control, then the body when it overflows | the platform  |
| arrows, `Page`, `Home`, `End`, `Space` | body | the platform's scroll                         | `scroll-area`: none written |
| `Enter`, `Space` | copy, wrap, reveal | the button                                  | the platform           |
| `Escape`       | a revealed block | collapse, keep focus                            | this family            |

No role on the block: it is text. Carbon's `role="textbox"` with
`aria-readonly` is refused, and the reason is in the inventory.

## 10. React

| Question                                                                                            | Answer                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does a mutable value ship a controlled and uncontrolled pair, plus the request carrying a reason?   | yes — `wrap`/`defaultWrap`/`onWrapChange`, `revealed`/`defaultRevealed`/`onRevealedChange`, through `createControllable`; `onCopy(outcome, request)`                     |
| Can an application set this family's defaults once, rather than per instance?                       | yes — `CodeBlockDefaultsProvider` with `highlight`, `lineNumbers`, `copy`, `labels`; `useCodeBlockDefaults`                                                              |
| Can a consumer substitute the rendered element of each public part?                                 | `renderLine(line, props)` for a line, `renderToken` for a token; `header` takes `children` for controls of the consumer's own. The body is `scroll-area`'s and fixed     |
| Does the consumer's own handler still run when the family handles the same event?                   | yes — composed on the root's `onKeyDown` and the controls' `onClick`                                                                                                     |
| Can a consumer reach the native element, and the imperative action it cannot express declaratively? | `ref` on the root; `CodeBlockHandle` with `copy()` and `scrollToLine(n)`                                                                                                 |
| Does it render on the server without a hydration mismatch?                                          | yes — `plainLines` is synchronous and deterministic; the highlighter runs in an effect; the overflow measure is `scroll-area`'s effect                                    |
| Does every state a consumer may style appear in the DOM?                                            | yes — `data-language`, `data-wrap`, `data-revealed`, `data-loading`, `data-empty`, `data-line-numbers`, `data-mark`, `data-dim`, `data-token`, `data-complete`, `data-pressed` |
| Is each part's props type the native element's, extended?                                           | yes — `ComponentPropsWithRef<'div'>` on the root, `'pre'` on the pre through `preProps`                                                                                   |

## 11. Angular

| Question                                                                           | Answer                                                                                                                                                      |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does a two-way value use the signal form the ecosystem expects?                    | yes — `wrap = model(false)`, `revealed = model(false)`, `wrapChange`, `revealedChange`, `copied = output<CodeBlockCopyRequest>()`                            |
| Does a control that belongs in a form work with Reactive Forms and template forms? | no — a code block holds no value a form submits                                                                                                             |
| Can an application set this family's defaults once, rather than per instance?      | yes — `provideSlCodeBlockDefaults({ highlight, lineNumbers, copy, labels })`                                                                                 |
| Can a template reach the instance?                                                 | yes — `exportAs: 'slCodeBlock'`, with `copy()` and `scrollToLine(n)`                                                                                        |
| Can a consumer substitute projected content, and keep it lazy?                     | yes — `<ng-content select="[slCodeBlockAction]">` into the header's actions; `<ng-template slCodeBlockLine>` for a line, rendered per line with `NgTemplateOutlet` |
| Is it correct with zoneless change detection and `OnPush`?                         | yes — signals throughout; the resolved lines are a signal set from the highlighter's promise; no `markForCheck`                                             |
| Is every subscription and listener torn down?                                      | yes — the copy feedback timer and a pending highlight through `DestroyRef`; the scroll measure is `scroll-area`'s                                            |
| Does a static attribute the consumer wrote survive the host bindings?              | yes — `aria-label` and `dir` read through `HostAttributeToken` before the family writes                                                                       |
| Does an entry point that others depend on stay a single class?                     | yes — `@slotted/angular/code-block`, importing `@slotted/angular/scroll-area`, `button`, `skeleton` through their public entries                             |

## 12. Tokens

The fence agrees with `prose`'s in every measure so a Markdown page that
upgrades a fence moves nothing: ground `--slotted-surface-sunken`, edge
`--slotted-border-subtle`, radius `--slotted-radius-md`, inset
`--slotted-space-5` by `--slotted-space-6`, the mono face at
`--slotted-font-size-sm` with `--slotted-line-height-md`. The gutter's width
is `calc(<digits>ch + 2 × --slotted-space-4)`, digits from the line count,
so a thousand-line block does not push its code sideways at line 100. The
type does not follow density; the inset and the gutter do.

## 13. What a wrong answer costs

- **Tokens in, not HTML.** If a consumer needs to hand the block HTML from an
  engine, the family cannot take it, by design; the mapping functions are the
  bridge, and writing one for a third engine is thirty lines. The alternative
  — accepting HTML — costs the scope palette and opens `innerHTML` to every
  code sample a product renders.
- **The palette in the theme.** Twelve tokens a theme author now has to state.
  The alternative is the engine's own theme, which no scheme switch reaches.
- **`scroll-area` for the body.** Three elements where one `pre` would do. The
  alternative is a fourth private scroll measure in the library, the debt
  `docs/build-order.md` already lists for three families.
