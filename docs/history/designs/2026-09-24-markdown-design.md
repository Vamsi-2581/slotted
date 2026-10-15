# `markdown` — inventory and design

Wave 11 of `docs/process/build-order.md`, guide section 10 of
`docs/component-features.md`. New family. The scope paragraph: an allowlist of
elements and URLs, headings with stable IDs, external links, tables, code
through `code-block`, empty and error content; sanitisation is mandatory,
plugins are opt-in, the typography is `prose`, and the parser is an adapter —
the family receives a tree and never HTML, as `code-block` receives tokens.

`prose` declined five things to "the renderer" (`specs/components/prose/contract.json`
`declined`): element components, task lists, sanitisation, syntax
highlighting and table behaviour. This family is that renderer, so four of the
five land here; table behaviour stays with `table`.

---

## 1. Capability inventory

### Surveyed

| Implementation | Version / source | Calls it | Shape |
| --- | --- | --- | --- |
| react-markdown | `remarkjs/react-markdown` readme, main, read 2026-09-24 | `Markdown` | string in, unified pipeline, `components` map by tag name, `allowedElements` / `disallowedElements` / `unwrapDisallowed` / `allowElement`, `skipHtml`, `urlTransform` with `defaultUrlTransform` (http, https, irc, ircs, mailto, xmpp, relative) |
| Streamdown | `vercel/streamdown` `packages/streamdown/README.md`, main | `Streamdown` | react-markdown replacement for model output: unterminated-block repair (`remend`), `rehype-harden`, Shiki code with copy, Mermaid, KaTeX, `isAnimating`, `allowedTags`, `fallbackComponent` |
| ngx-markdown | `jfcere/ngx-markdown` README, master | `markdown` component, `MarkdownService` | marked to an HTML string, Angular `DomSanitizer` with `SecurityContext.HTML` by default, Prism, KaTeX, Mermaid, clipboard, `provideMarkdown()` |
| Ant Design X | `x.ant.design/x-markdowns/introduce`, 2.0.0 | `XMarkdown` | marked underneath, "no dangerouslySetInnerHTML", component replacement per element, streaming rendering, plugins (LaTeX, custom) |
| mdast + mdast-util-to-hast | `syntax-tree/mdast` readme; `syntax-tree/mdast-util-to-hast` readme | the tree spec and its HTML mapping | node types for CommonMark and GFM; footnote section with `footnoteLabel`, `footnoteBackLabel`, `sr-only` heading; clobber prefix on generated ids |
| rehype-sanitize | `rehypejs/rehype-sanitize` readme | GitHub schema | allowlist of tags, attributes and protocols; `user-content-` prefix on every `id` and `name` against DOM clobbering |
| marked | `markedjs/marked` `docs/USING_PRO.md` | `Lexer` tokens | token tree from `lexer.lex()`, extensions, `walkTokens` |

### Table stakes

| Capability | Who ships it | Verdict | Reason |
| --- | --- | --- | --- |
| CommonMark block and inline set | all | adopt | paragraphs, six heading levels, lists, blockquote, fence, thematic break, emphasis, strong, inline code, break, link, image |
| GFM: tables, strikethrough, task lists, autolinks | react-markdown (remark-gfm), Streamdown, ngx-markdown, XMarkdown | adopt | tables through `ProseScroll`; autolinks arrive as ordinary `link` nodes from the adapter |
| GFM footnotes | react-markdown, mdast-util-to-hast, GitHub | adopt | numbered by first reference, back references labelled, section headed for assistive technology; unreferenced definitions are dropped as GitHub does |
| Raw HTML refused by default | react-markdown (escaped unless rehype-raw), XMarkdown, rehype-sanitize | adopt | an `html` node renders nothing; a consumer who wants it registers a renderer for `html` and owns that decision |
| Element allowlist, deny list, unwrap | react-markdown, Streamdown `allowedTags` | adapt | by node type rather than tag name, because the input is a tree: `allow` and `unwrapDisallowed` |
| URL policy | react-markdown `urlTransform`, rehype-sanitize protocols, Streamdown `rehype-harden` | adopt | `transformUrl(url, kind, node)`; default links http, https, mailto, tel and relative; images http, https and relative; a refused link renders its text, a refused image its alt text |
| Component replacement per element | react-markdown `components`, Streamdown, XMarkdown | adopt | `renderers` keyed by node kind in React; `ng-template[slMarkdownNode]` in Angular |
| Plugins | all | adapt | parse-time plugins belong to the adapter the consumer already runs (remark-gfm, remark-math); render-time plugins are renderers for custom node types. An unknown type renders nothing until a renderer names it |
| Code highlighting and copy | Streamdown (Shiki), ngx-markdown (Prism, clipboard), XMarkdown | defer to `code-block` | a fence becomes `CodeBlock`; the highlighter is `code-block`'s defaults |
| Heading IDs | GitHub, rehype-slug, mdast-util-to-hast | adopt | github-slugger's algorithm, duplicates suffixed `-1`, `-2`, `idPrefix` on every generated id |
| Streaming output | Streamdown, XMarkdown | adopt | `completeMarkdown(source)` closes what a partial answer leaves open; blocks keep their keys as content is appended, so earlier blocks never remount; `streaming` sets `aria-busy` |
| Math and diagrams | Streamdown, ngx-markdown, XMarkdown | defer to the consumer's renderer | KaTeX and Mermaid are engines of hundreds of kilobytes; `math` and `inlineMath` nodes from remark-math are custom types a renderer names. The reference page shows the composition |
| Sanitising an HTML string | ngx-markdown (`DomSanitizer`) | decline | the family never holds an HTML string, so there is nothing to sanitise; the tree boundary replaces the sanitiser |

### Differentiators

| Capability | Reason |
| --- | --- |
| Two adapters, one tree | the family's input is mdast by shape, so `fromMarkdown` from mdast-util-from-markdown is passed through untouched; `fromMarkedTokens` maps marked's lexer output. Both import nothing, as `fromPrismTokens` and `fromShikiTokens` do in `@slotted/core/code` |
| One document model for both bindings | `prepareMarkdown(tree, options)` in `@slotted/core/markdown` resolves references, applies the URL policy and the allowlist, numbers footnotes, slugs headings and reads alerts once; React and Angular only map kinds to elements |
| GitHub alerts | `> [!NOTE]` and its four siblings become `alert` at `reach="section"`, `live="off"`, in the tones accent, success, secondary, warning, danger |
| Interactive task lists | `onTaskChange({ index, checked, offset })` enables the checkboxes, as a GitHub issue does; without it they are read-only `checkbox` |
| Fence metadata | `title="…"`, `{1,4-6}` and `showLineNumbers` in a fence's info string reach `code-block` as `title`, `marks.highlight` and `lineNumbers`; the design of `code-block` §5 asked the Markdown pipeline for exactly this |
| The outline | `prepareMarkdown(...).headings` is the list `table-of-contents` takes, with the ids the page renders |
| Heading offset | `headingOffset` moves `#` to `h3` when the region sits under an `h2`, clamped at `h6` |
| Three schemes, three densities, RTL | inherited from `prose` and the composed families; table alignment is logical (`left` → `start`, `right` → `end`) |

### Gaps

| Gap | Answer |
| --- | --- |
| A hostile string: `jAvAsCrIpT:`, `java\tscript:`, a data URL, a protocol hidden behind control characters | `safeUrl` removes ASCII control characters and whitespace before reading the scheme, and compares it case-insensitively against the list |
| Two regions on one page with the same heading text (two chat answers with `## Summary`) | duplicate ids across instances; `idPrefix` separates them, and the reference page's thread scene sets it per message |
| DOM clobbering through generated ids | ids are written only on headings, footnotes and footnote references, each through `idPrefix` |
| A partial answer: an open fence, an odd count of backticks, `**` without its pair, a link cut at `](` | `completeMarkdown` repairs the four before the adapter parses |
| Empty input: whitespace only, or only definitions | `data-empty` and the `empty` part, with `labels.empty` or the consumer's node |
| The source failed to load | `status="error"` renders `inline-message` in `danger` with `labels.error` and, when `onRetry` is given, a retry button |
| Loading | `SkeletonRegion` with a heading line and a paragraph of varied line lengths at the body step, `aria-busy` on the region, `delay` and `minDuration` from `skeleton` |
| Unresolved reference `[text][missing]` | rendered as the source text, as CommonMark's reference implementation does |
| An image without dimensions | `loading="lazy"`, `decoding="async"`; the reserved box cannot be known from Markdown and is the adapter's when it knows it |
| Print | an external link prints its address after its text |

---

## 2. Anatomy

```
root              div[data-ui=markdown]           data-status, data-flow, data-loading, data-empty, data-streaming, aria-busy
├─ (region)       div[data-ui=prose]              prose's root and prose's part; size and flow pass through
│  ├─ h1–h6       heading[id]                     prose's anchor part, when headingAnchors
│  ├─ embed       div                             holds a code-block or an alert and gives it the region's flow
│  │  └─ alert › description › alert-body          the blocks of a GitHub alert; its first block starts flush
│  ├─ task-list   ul                              at least one item is a task
│  │  └─ task     li                              a two-column grid: checkbox, then task-body
│  │     └─ task-body  div
│  ├─ table       prose's scroll part › table     cell alignment in data-align (start, center, end)
│  └─ footnotes   section                         prose's part; visually hidden heading from labels.footnotes
│     └─ backref  a                               one per reference, arrow-left turned a quarter
├─ empty          p
└─ error          div › inline-message (danger) + button (retry, when onRetry)
```

The root is a second element because `prose` owns `data-ui` and `data-part`
on the region, and the empty, error and loading states are drawn outside the
region's typography. The root repeats the region's `flow`, because `prose`
spaces only the elements it knows and an `embed` reads `prose`'s public flow
tokens through it.

The task's box ends where an ordinary item's marker ends, so the task's text
starts on the same edge as the ordinary item's text beside it; the box is
centred on the item's first line box.

## 3. State

No state model. The content belongs to the consumer, and every change the
reader asks for is a request against the consumer's source:

| Request | Payload | Reasons |
| --- | --- | --- |
| `onTaskChange` | `{ index, checked, offset }` — `offset` is the node's `position.start.offset` when the adapter kept positions | `pointer`, `keyboard` |
| `onRetry` | none | `pointer`, `keyboard` |

The checkbox does not change until the consumer's new tree arrives: the family
renders the tree it is given.

## 4. Axes

`size`, `flow` (to `prose`); `status`: `ready` | `error`; `loading`;
`streaming`; `external`: `new-tab` | `same-tab`; `headingAnchors`;
`headingOffset`; `idPrefix`; `alerts`; `allow`; `unwrapDisallowed`;
`transformUrl`; `isExternal`.

## 5. Keyboard

No APG pattern; the reasons are `prose`'s. Every operable element belongs to a
composed family: links, the heading anchor, a scrolling table, the code block's
controls, a task checkbox with `onTaskChange`, the footnote links, the retry
button. The family adds no key.

## 6. React

| Question | Answer |
| --- | --- |
| Controlled and uncontrolled pair with a reason | no value is held (§3); requests carry `reason` |
| Defaults once | `MarkdownDefaultsProvider`, `useMarkdownDefaults`: `labels`, `headingAnchors`, `external`, `alerts`, `transformUrl`, `isExternal`, `allow` |
| Substitute each part's element | `renderers[kind]({ element, children })` for every prepared kind, `extensions[type]` for a node type the family does not know; `render` on the root |
| Consumer's handler still runs | the root spreads native props; the family adds listeners only to the checkboxes and the retry button, both through the composed families |
| Native element and imperative action | `ref` on the root; no handle, nothing is imperative |
| Server render without mismatch | `prepareMarkdown` is synchronous and pure; ids come from the tree and `idPrefix`, never from `useId` |
| Every state in the DOM | `data-status`, `data-flow`, `data-loading`, `data-empty`, `data-streaming`, `data-align` |
| Props type | `ComponentPropsWithRef<'div'>` extended |

## 7. Angular

| Question | Answer |
| --- | --- |
| Two-way value | no `model()`; `taskChange` and `retry` are `output()` with a reason. An output cannot tell whether anyone listens, so `editableTasks` and `retryable` state in the template what React reads from the handler's presence |
| Forms | no — the region submits nothing |
| Defaults once | `provideMarkdownDefaults()` over `MARKDOWN_DEFAULTS` |
| Template reaches the instance | `exportAs: 'slMarkdown'`, exposing `document()` |
| Projected content, lazy | `ng-template[slMarkdownNode]="kind"` renderers; `[slMarkdownEmpty]` projected into the empty part; `ng-container[slMarkdownChildren]` renders a node's children inside a renderer without adding an element |
| Zoneless and `OnPush` | `input()` and `computed()`; the document is a computed of the tree and the options |
| Teardown | no subscription or listener is opened |
| Static attribute survives | the root writes no `role` or `aria-label`; `dir` and `lang` stay the consumer's |
| One entry point | `@slotted/angular/markdown`, importing `prose`, `link`, `code-block`, `alert`, `checkbox`, `inline-message`, `button`, `skeleton` through their public entries |

Recursion is one `ng-template` rendered through `NgTemplateOutlet`, never a
recursive component: a component host between a `ul` and its `li`, or between
the region and its first block, breaks `prose`'s child combinators.

## 8. Decisions taken while binding

- **The placeholder follows `skeleton`'s timing.** The document and the
  placeholder are two trees, so the family runs `@slotted/core/loading`'s
  machine itself with `skeleton`'s `delay` and `minDuration` defaults, and
  draws a `SkeletonRegion` only while that machine says the placeholder is
  painted. `SkeletonRegion` alone cannot swap between the two, because its
  painted state is private to `skeleton`.
- **A task's accessible name.** React writes `aria-label` on the input, which
  `Checkbox` forwards; Angular projects the item's text into the checkbox's
  label through `slVisuallyHidden`, which `slCheckbox` already reads as a
  hidden label. The name is the same text in both.
- **The workbench learned Markdown.** A snippet in Markdown source was refused
  by `snippetFormatErrors`, which knew four languages. `markdown` joined the
  parser map, the highlighter and the drawer's labels, with a test, in its own
  commit.
- **`marked@18.0.5` is a development dependency of both bindings**, for the
  reference pages and the binding tests. No published entry imports it.

## 9. What a wrong answer costs

- **mdast as the input shape.** A consumer on markdown-it writes a mapping of
  about forty lines. The alternative — an own tree — would oblige every remark
  user to map as well, and remark is the pipeline react-markdown, Streamdown and
  MDX run on.
- **Requests without state for tasks.** A checkbox that does not move until
  the consumer's tree changes. The alternative is a second copy of the source's
  truth inside the family, which diverges from the text on the first edit.
- **`idPrefix` empty by default.** `#installation` stays a readable URL; two
  regions on one page need a prefix, and the failure is a duplicate id that
  axe reports.
