# Prose design

Decisions taken for the family before either binding was written. The inventory
they answer is
`docs/history/designs/2026-09-04-prose-capability-inventory.md`.

---

## 1. What the family is

A region of content the application did not author element by element. It
arrives as a tree — from a Markdown renderer, a CMS, or a language model — and
the page never gets to put an attribute on the `h2`. Prose is the typography
that region is read in.

**Anti-use.** Text the application does author is `typography`: `<Text>` and
`<Heading>` carry a size, a weight and a tone per element, and a page that wraps
two authored paragraphs in prose has chosen a recipe over a decision. The
boundary is who wrote the tags.

**Not a sanitiser.** `docs/component-features.md` section 10 states it in the
family's own sentence: prose "não sanitiza conteúdo por conta própria". A
component that both styled and sanitised would hide which of the two failed, and
the renderer that produced the tree is where a sanitiser belongs.

---

## 2. Anatomy

One member, six parts.

| Part        | Element                                | What it is                                                          |
| ----------- | -------------------------------------- | ------------------------------------------------------------------- |
| `root`      | `div`, or the consumer's own element   | The region. Everything below is a descendant rule of it.            |
| `lead`      | `p`                                    | The opening paragraph, one step up and in the muted tone.           |
| `anchor`    | `a`                                    | A heading's permalink. The link is the consumer's; the placement, the target size and the reveal are the family's. |
| `scroll`    | `div`                                  | A wrapper that lets one wide block scroll instead of overflowing.   |
| `exclude`   | any                                    | A subtree prose does not style.                                     |
| `footnotes` | `section`                              | What GitHub Flavored Markdown emits at the end of a document.       |

The root is a `div` because a `div` claims nothing. `article`, `section` and
`main` are claims the page makes, through `render` in React and by writing the
attribute selector on its own element in Angular — the same arrangement
`container` already ships.

Every part except `root` is written by the consumer's renderer, on the
consumer's own element. That is what makes them usable from a component map:
`components={{ table: ProseScroll, p: ProseLead }}` in MDX reaches every part
without the family owning a renderer.

---

## 3. Losing on purpose: the specificity of every content rule

Prose styles bare tags — `p`, `h2`, `a`, `table`. Two other things also style
those elements, and both must win:

- a Slotted family placed inside the region, selected by `[data-ui='…']`, at
  specificity 0-1-0;
- the consumer's own rule.

So every content rule is written `[data-ui='prose'] :where(p)` — 0-1-0 from the
root and 0-0-0 from the guard. A `[data-ui='link']` rule inside is 0-1-0 with
one more component, and wins. Tailwind and Typeset both reach for `:where()` for
the second reason alone; here the first is what makes it structural.

**`@scope` was the better tool and was refused on a date.** `@scope
([data-ui='prose']) to ([data-part='exclude'])` expresses both the region and the
exclusion exactly, and MDN records that a bare selector inside it behaves as
`:where(:scope) p` — 0-0-1, lower still. It reached Baseline in **March 2026**,
six months before this family, and an `@scope` block a browser cannot parse
drops the whole stylesheet rather than one declaration. The exclusion is
`data-part='exclude'` under either mechanism, so the stylesheet can move to
`@scope` later without touching the contract.

Until then the exclusion is a donut written on each rule:

```css
[data-ui='prose'] :where(p):not(:where([data-part='exclude'], [data-part='exclude'] *))
```

`:not(:where(…))` takes the specificity of its argument, which is zero, so the
guard costs nothing.

---

## 4. Two axes, and the three that were refused

### `size`: `md`, `lg`, `xl` — default `lg`

Named for the type-scale step the body text takes, as `typography`'s own axis is.
`lg` is `--slotted-font-size-lg`, one rem, because reading text is not control
text: `--slotted-font-size-md` is 0.875rem and is the size a button label is set
in.

Tailwind's five steps and Typeset's free `--typeset-size` were both adapted down
to three. The foundation already owns a type scale, and a second one inside a
family is what `docs/token-foundation.md` calls a parallel scale.

### `flow`: `tight`, `normal`, `loose` — default `normal`

The space between blocks, which is the one number Typeset proves governs the
whole page. `tight` is a chat message, `normal` a documentation page, `loose` an
article.

### Refused: a maximum measure

`docs/build-briefing.md` decided it before this family existed — measure belongs
to `container`, and to it alone. The composition is one element:

```tsx
<Container size="measure">
  <Prose>{rendered}</Prose>
</Container>
```

Tailwind bakes `65ch` in and ships `max-w-none` to remove it. Typeset reached
this library's conclusion independently and gives the maximum to the layout.

### Refused: density

`flow` is this family's answer to the question density would ask, and two
answers to one question is what `container` refused for its own inset: how
tightly a form packs its controls is not a decision about how a paragraph is
read. A prose region inside a dense application still contains controls — a
`kbd`, a `checkbox` in a task list — and each of those answers density itself.

### Refused: a colour theme for the body text

`prose-gray`, `prose-slate` and the rest are Tailwind's answer to having one
scheme. This library has three, and the region simply inherits `--slotted-text`.
A consumer who wants muted body text sets `color` on the region.

---

## 5. The heading ladder is a ratio, and the reason it is a literal

The foundation's type scale stops at `--slotted-font-size-3xl`, 1.5rem, because
no control needs more. An `h1` opening an article does, and at `size="xl"` a
1.5rem heading over 1.125rem body is a hierarchy of 1.33 — a title that does not
read as one.

So the ladder is stated as a ratio to the body step, through family tokens whose
fallbacks are literals:

| Token                        | Fallback  |
| ---------------------------- | --------- |
| `--slotted-prose-h1-size`    | `2em`     |
| `--slotted-prose-h2-size`    | `1.5em`   |
| `--slotted-prose-h3-size`    | `1.25em`  |
| `--slotted-prose-h4-size`    | `1.125em` |
| `--slotted-prose-h5-size`    | `1em`     |
| `--slotted-prose-h6-size`    | `0.875em` |

This is the exemption `docs/token-foundation.md` rule 1 grants a family token
whose reason is recorded, and it is the exemption `container` already used for
its three page widths. The reason here: **a heading in editorial content is
sized relative to the text it introduces**, which is what lets one `size` axis
move a whole page and is why the family needs no fourth step on the foundation
scale. Adding a `4xl` step would change ground thirty-four families stand on to
serve one.

Everything else — every colour, radius, border width, duration, easing and font
family — is a foundation token. The ladder and the three `flow` steps are the
family's only literals.

---

## 6. Reflow

The root declares `container-type: inline-size` and its own `container-name`.
The query restyles descendants only and never the root's own tracks, so the
family needs one element rather than the two `docs/build-briefing.md` requires of
a family that resizes its own grid.

Two literal breakpoints, because CSS forbids a custom property in a container
condition:

- **below 34rem** the display ratios step down: `h1` to 1.6em, `h2` to 1.35em.
  A 2em heading in a 400-pixel column is six words a line.
- **below 22rem** the anchor stops hanging outside the text column, because
  there is no column to hang outside of, and the blockquote inset halves.

Nothing else changes. A table and a `pre` are held by the `scroll` part at every
width rather than by a breakpoint.

---

## 7. Stability while content is appended

A page rendering a language model's answer appends blocks continuously. Typeset
is the only surveyed implementation that states the consequence; this family
adopts it and holds it with a test:

- **no `:last-child`, `:has()` or `:empty` in a layout rule.** Each of their
  matches changes when a block arrives, so the block already on screen restyles
  under the reader's eye.
- **spacing runs one way.** Every gap is `margin-block-start` on the arriving
  block. `> :first-child { margin-block-start: 0 }` is the one structural
  selector used, and it is stable: appending never changes which element is
  first.
- **table rules sit on the cell that arrives**, so a new row does not restyle the
  row above it.

`packages/styles/src/prose/prose.styles.test.mjs` rejects the three forward
selectors in this stylesheet. It is a family test rather than a shared one
because the rule is about content that grows, and most families' content does
not.

---

## 8. The scroll part is the family's one piece of behaviour

A `pre` or a `table` wider than the column has to scroll sideways. None of the
four surveyed implementations makes that scroller reachable without a pointer:
Typeset's `typeset-scroll` is a `div` with `overflow: auto` and no `tabindex`,
and GitHub's table wrapper is the same.

The axe rule `scrollable-region-focusable` (WCAG 2.2 A) says a scrollable region
needs a focusable element, and Adrian Roselli's "Under-Engineered Responsive
Tables" says what follows from that: anything that takes focus needs a name and
a role, or it fails SC 4.1.2. His pattern is
`<div role="region" aria-labelledby tabindex="0">`.

This family ships it **conditionally**, which is the part that is new:

- `overflow: auto` and the container query are unconditional and cost nothing.
- `role="region"`, `tabindex="0"` and the name are written **only while the
  block actually overflows**, measured by `createScrollAffordance` from
  `@slotted/core/overflow` — the module `tabs` already uses, with its
  `ResizeObserver`, its scroll listener and its right-to-left normalisation.
- A tab stop on a block that fits is a tab stop that does nothing, and a reader
  tabbing a documentation page hits one per table.

The name resolves in one order, and the last step is why a renderer's component
map can use the part with no arguments at all:

1. `labelledBy`, when the consumer names an element — the block's own `caption`
   is the good answer, and it is Roselli's;
2. `label`, when the consumer writes a string;
3. `scrollLabel` from the defaults, whose fallback is `"Scrollable content"` —
   the same shape as `link`'s `externalHint`, and localised the same way.

The stylesheet paints the focus ring on `[data-part='scroll'][tabindex]`, which
is Roselli's own trick: the ring appears only on markup that is actually
operable. He writes `:focus`; this family writes `:focus-visible`, because a
pointer press inside a `tabindex="0"` box focuses it and a ring drawn then is a
ring nobody asked for.

`refresh()` is exposed on both bindings. Content that streams in arrives after
the observer's last measurement in the frame it lands, and a consumer whose
renderer replaces children wholesale needs to say so.

---

## 9. What prose does not paint, and what it borrows

**No selector in this stylesheet reaches another family's `data-ui`.** That is
the rule `accordion` and `collapsible` set, and it is what keeps a `<Link>`
inside a prose region a link rather than a link prose disagrees with.

A **bare** tag is a different matter, and three of them read another family's
tokens rather than inventing their own:

| Bare element | Reads                  | Because                                                                    |
| ------------ | ---------------------- | -------------------------------------------------------------------------- |
| `a`          | `--slotted-link-*`     | A Markdown link and a `<Link>` on one page are otherwise two colours.      |
| `hr`         | `--slotted-divider-*`  | The rule Markdown emits and the `divider` family are one theme decision.   |
| `kbd`        | `--slotted-kbd-*`      | The same, for a key in a documentation page.                               |

Reading a token is not reaching into a family: the token is the theme's, and the
family that named it does not own it.

**The native `::marker` is kept.** `list-item` draws its own because its row is a
grid and CSS has no `display` that is both `list-item` and a grid; an editorial
`li` is not a grid, and removing the marker would cost the list semantics Safari
drops with it — the defect
<https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html> records and
`list` already answered for its own case.

---

## 10. The heading anchor

Hidden with `opacity: 0`, never with `display: none` or `visibility: hidden`:
the anchor stays in the tab sequence and in the accessible tree, so a keyboard
reader reaches it and a screen-reader reader hears it. It becomes visible when
the heading is hovered **or** when the anchor itself is focus-visible; a control
that appears on hover alone is a control a keyboard cannot find.

It hangs in the start gutter above 22rem and sits inline below it. The reveal
transitions on `--slotted-duration-short`, from the motion scale, so the theme's
reduced-motion query collapses it.

---

## 11. No state model

The family holds no mutable value. Nothing here is opened, selected, checked or
edited: `size` and `flow` are appearance the consumer states, the scroll part's
`tabindex` is a measurement rather than a value a consumer could own, and the
content belongs to the renderer.

`contract.json` therefore declares no `stateModel`, and the contract test
asserts the absence with this reason — the shape `result-state` established, so
that an omission cannot be mistaken for a capability nobody wrote.

---

## 12. React integration

| Question                                                   | Answer                                                                                                                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, request with a reason    | **no** — section 11: the family holds no mutable value.                                                                                                                    |
| Defaults set once for the application                      | **yes** — `ProseDefaultsProvider` and `useProseDefaults`, carrying `size`, `flow` and `scrollLabel`. An explicit prop always wins.                                          |
| Substitute the rendered element of each part               | **yes** — `render` on `Prose` and on every part, the `container` signature.                                                                                                |
| The consumer's own handler still runs                      | **yes** — parts spread `nativeProps` last-in-first-out and add no listener of their own. `ProseScroll` observes through `@slotted/core/overflow`, not through `onScroll`.   |
| Native element, and the imperative action                  | **yes** — `ref` on every part, and `ProseScrollHandle.refresh()` for content that arrives after the last measurement.                                                       |
| Renders on the server with no hydration mismatch           | **yes** — `useId` for the region's generated name; the overflow measurement runs in `useLayoutEffect`, never during render. Before it runs the block is a plain scroller, which is the correct server output. |
| Every state a consumer may style is in the DOM             | **yes** — `data-size`, `data-flow`, `data-part`, and `tabindex` on the scroll part, which is the selector the focus ring uses.                                              |
| Props type is the native element's, extended               | **yes** — `ComponentPropsWithRef<'div'>` and `<'a'>`, in `prose.types.ts`.                                                                                                  |

## 13. Angular integration

| Question                                       | Answer                                                                                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form               | **no** — section 11. `input()` throughout, no `model()`.                                                                                                                       |
| Reactive Forms and template forms              | **no** — a region of rendered text is not a form control and has no value to write back.                                                                                       |
| Defaults set once for the application          | **yes** — `provideProseDefaults()` over `PROSE_DEFAULTS`, read by `injectProseDefaults()`.                                                                                      |
| A template can reach the instance              | **yes** — `exportAs: 'slProse'` and `'slProseScroll'`; the second is how a template calls `refresh()`.                                                                          |
| Substitute projected content, kept lazy        | **yes** — one default `ng-content`. The parts are attribute selectors the consumer writes on its own elements, so nothing is re-projected and nothing needs `NgTemplateOutlet`. |
| Correct zoneless and `OnPush`                  | **yes** — `input()`/`computed()` throughout; the scroll part holds one signal the affordance's `onChange` sets. No `markForCheck`.                                              |
| Every subscription and listener torn down      | **yes** — `DestroyRef` calls `ScrollAffordanceHandle.destroy()`, which releases the `ResizeObserver` and the scroll listener.                                                   |
| A static attribute the consumer wrote survives | **yes** — the scroll directive reads `role` and `aria-label` with `HostAttributeToken` before binding either, so a consumer who wrote its own name keeps it.                    |
| One entry point, one class                     | **yes** — `@slotted/angular/prose`, exporting the region, the five parts and the defaults provider.                                                                            |

---

## 14. What is still true for someone reading this later

The one decision most likely to be revisited is section 5: the heading ladder in
`em` rather than three more steps on the foundation type scale. The cost of the
choice is that a theme retuning prose's headings retunes a ratio, not a step,
and that prose is the only family whose type sizes are not scale tokens. The
cost of the alternative is a foundation change for one consumer. If a second
family ever needs display type — a marketing hero, an empty-state title larger
than `3xl` — the scale is the right place and this section is where the trade
was written down.
