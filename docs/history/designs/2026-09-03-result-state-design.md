# Result State design

Decisions taken before either binding was written, and the cost of each. The
inventory that produced them is
`docs/history/designs/2026-09-03-result-state-capability-inventory.md`.

## What the family is

One region that stands in for content that is not there, and says what to do
next. It replaces the content; it does not sit beside it.

That is the line between the three message families the library now has.

| Family           | Sits                                   | Is                        |
| ---------------- | -------------------------------------- | ------------------------- |
| `inline-message` | under one control                      | a line of text            |
| `alert`          | beside the content it is about         | a message                 |
| `result-state`   | where the content would have been      | the content's replacement |

The guide's section 17 requires `empty-state` and `error-state` to become one
visual family with distinct semantics. The distinct semantics are the `status`
axis; the one visual family is everything else.

## Anatomy

```html
<section
  data-ui="result-state"
  data-part="root"
  data-status="empty"
  data-reach="section"
  data-align="center"
  data-live="polite"
  tabindex="-1"
  aria-labelledby="r1-title"
>
  <div data-part="media" aria-hidden="true"></div>
  <div data-part="content" role="status">
    <div data-part="title" id="r1-title">No projects yet</div>
    <p data-part="description">Create a project to start collecting runs.</p>
  </div>
  <div data-part="actions">
    <button data-ui="button">Create project</button>
  </div>
  <div data-part="footer">
    <a data-ui="link" href="/docs/projects">What is a project?</a>
  </div>
</section>
```

Seven parts, one member. None of the six inner parts means anything outside the
box, so none of them is a family: a `ResultStateTitle` rendered on its own is a
`div`. It is the shape `alert`, `card` and `kbd` all ship.

## The decisions

### The box is a landmark and the text is the live region

The root is a `section`. Named by its own title through `aria-labelledby`, a
`section` is a `region` landmark a reader can jump to; unnamed it is a plain
grouping element that costs nothing. The APG's region landmark practice states
that "a region landmark must have a label", so the attribute is written only
once a title has said it exists — a dangling `aria-labelledby` would leave the
element with no accessible name and no landmark either.

`content` carries the live role and holds the title and the description alone.
MDN's `alert` role reference states the role "should only be used for text
content, not interactive elements such as links or buttons", and this family
has a row of buttons in it. `media`, `actions` and `footer` are `content`'s
siblings, outside the region, so a reader hearing the message is not read two
button labels in the middle of it.

This is `alert`'s shape, deliberately. Two neighbouring families that answered
the same question differently would be two answers to one question.

**Cost.** A consumer who puts their own text outside `content` gets no
announcement for it. The reference page says so, and the anatomy table on both
pages names `content` as the part that announces.

### It announces by default, and `alert` does not

`live` is `off`, `polite` or `assertive`, the axis `alert` and
`inline-message` already speak. The default here is `polite`; `alert`'s is
`off`.

The reason is in WCAG 2.2's Understanding document for SC 4.1.3, which names
this family's own text as its example: "brief text messages displayed about the
completion or status of the search, such as 'Searching…', '18 results returned'
or 'No results returned' would be status updates if they do not take focus or
cause a page refresh." A result state is by definition the outcome of an
operation. An alert may be a standing notice that was on the page before it
loaded, which is why `alert` defaults to silence.

None of the seven surveyed implementations writes a live role of any kind.

**Cost.** A consumer whose results region is already inside their own live
region will hear the message twice. `live="off"` is the opt-out and the
reference page says when to reach for it.

### Seven statuses, each with a tone and a silhouette

| Status       | Tone        | Glyph                            | Means                                             |
| ------------ | ----------- | -------------------------------- | ------------------------------------------------- |
| `empty`      | `secondary` | `--slotted-icon-inbox`           | the collection exists and holds nothing           |
| `no-results` | `secondary` | `--slotted-icon-search-x`        | a query or a filter matched nothing               |
| `not-found`  | `secondary` | `--slotted-icon-circle-question` | the thing that was asked for is not here          |
| `error`      | `danger`    | `--slotted-icon-circle-alert`    | a failure the reader can act on                   |
| `forbidden`  | `warning`   | `--slotted-icon-lock`            | the reader is not allowed to see it               |
| `offline`    | `warning`   | `--slotted-icon-cloud-off`       | the connection is gone                            |
| `success`    | `success`   | `--slotted-icon-circle-check`    | the flow finished and there is nothing left to do |

The three tones and three glyphs that already exist are the ones `alert`,
`inline-message` and `status-indicator` draw for the same meanings, so a status
light, a banner and a result state about the same thing draw the same mark.

`status` is not `tone`. The five tones are how the library paints; the seven
statuses are what a region can be reporting, and two of them share a tone.
Naming the axis `tone` would have made `forbidden` and `offline` the same
value.

**Cost: four glyph tokens the foundation does not hold.** They are listed with
their reasons in section 5 of the inventory. Without them, five of the seven
statuses draw the same circle and the axis fails the greyscale reading it
exists to pass — WCAG 2.2 SC 1.4.1, and under `forced-colors`, where every tone
ground becomes one system colour and the silhouette is all that is left. This
is the one decision in this family that changes ground other families stand on,
and it is presented at the visual gate, where reversing it costs the
stylesheet.

### `reach`, not `size`

`inline`, `section`, `page` — the same three words, with the same meaning, that
`alert` uses. The axis says which scope the message applies to, and the
geometry follows. A size axis would say the same message can be drawn large or
small, which is not the choice a consumer is making.

- `inline` is a row: the mark at control-glyph size, the text beside it, no
  illustration box. It is the state the guide requires for "card, painel e
  célula", and it is what keeps an illustration from dominating a dense
  operational screen.
- `section` is the default: a column inside a card or a panel.
- `page` is the whole route: a larger mark and a larger title.

**Cost.** Three reaches is three sets of geometry to look at in six schemes and
three densities, rather than one. The harness scene list carries all three.

### `align`

`center` or `start`, at every reach. Carbon left-aligns its empty states inside
data-dense views; the other six centre unconditionally. Both readings are real,
and one axis is cheaper than a second family.

### No mutable state, and the reason is written down

The contract declares no `stateModel`, because the family holds no mutable
value. Which status a region is in is a fact about the consumer's own data; a
result state that decided it would be deciding whether the fetch failed.

That is also why Radix Primitives, Base UI and React Aria ship no such
component: there is no behaviour to hold. The contract test asserts the absence
together with this reason, so a later reader finds the decision rather than an
omission.

### The title's element belongs to the page

`title` renders a `div`. A heading puts the region in the document outline,
which is right for a full-page 404 and wrong for the empty state of one card in
a grid of twelve — and only the page knows which. React says so with `render`;
Angular says so by writing the directive on its own `<h2>`.

Atlassian's `headingLevel` prop, one to six, is the field's answer. It invites a
skipped level, which the guide's section 10 forbids.

### Measure belongs to `container`

The text block has no maximum width. Polaris caps at 400 pixels and Atlassian
ships a `width: narrow`; the briefing's standing decision is that measure
belongs to `container` and to it alone, because two families offering a maximum
measure would be two answers to one question. A consumer who wants a narrow
column writes one around the region, and the reference page demonstrates it.

### The media box is decorative, and it holds its geometry

`media` carries `aria-hidden="true"`. The title and the description already say
what the picture says; an illustration that adds information is not decorative,
and what it adds belongs in the description. Polaris reaches the same
conclusion by hardcoding `alt=""` and `role="presentation"` on its image.

The box takes its size from the reach, so a raster illustration that has not
loaded reserves the space it will occupy and nothing below it moves when the
image arrives. Atlassian spends four props on this and Polaris a `useEffect`
and a skeleton.

### Density, and where it reaches

Prose sizes come from the type scale, which does not vary by density. Density
reaches the family through the two things that are geometry rather than prose:
the media box, which is a control-scale size at every reach, and the controls
inside `actions`, which are the consumer's own buttons and shrink themselves.

This is the cost `card` and `alert` both accepted, and it is stated here so the
dense captures are read as a decision: at `dense` a `section` result state
keeps its type and tightens its mark and its buttons.

### One container, one literal breakpoint

The family declares `container-type: inline-size` and the container name
`slotted-result-state`, because its one composition change answers the width of
the box rather than the width of the window: below `20rem` the row of actions
becomes a stretched column, and at `inline` reach the row becomes a column.
A container breakpoint cannot be a token, so the literal is the foundation's
own rule 4.

This puts the family on the list of those that answer their own width, which
means its reference-page stages take `data-layout="block"`.

## Framework integration

Both tables from `.claude/skills/component/references/frameworks.md`, answered
before either binding was written.

### React

| Question                                                                    | Answer                                                                                                                                                              |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason           | No mutable value. `contract.json` declares no `stateModel` and the contract test asserts the absence with its reason.                                                |
| Defaults set once for the application                                        | `ResultStateDefaultsProvider` and `useResultStateDefaults`, in `result-state-defaults.tsx`. It carries `status`, `reach`, `align` and `live`.                        |
| Substituting the rendered element of each public part                        | `render` on the root and on all six parts.                                                                                                                          |
| The consumer's own handler still runs                                        | The family binds no handler of its own. Every control in `actions` and `footer` is the consumer's, untouched.                                                        |
| Reaching the native element, and the imperative action                       | `ref` on every part. The root is `tabindex="-1"`, so `ref.current.focus()` sends the keyboard to the message after a filter empties a table.                         |
| Server rendering without a hydration mismatch                                | `useId` for the title identifier; nothing reads layout during render.                                                                                               |
| Every state a consumer may style appears in the DOM                          | `data-status`, `data-reach`, `data-align` and `data-live` on the root. The family declares no attribute states, because it is in none of them.                       |
| Each part's props type is the native element's, extended                     | `ComponentPropsWithRef<'section'>` for the root, `<'div'>` for five parts, `<'p'>` for the description.                                                              |

### Angular

| Question                                                    | Answer                                                                                                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A two-way value in the form the ecosystem expects            | No mutable value, so no `model()` and no `output()`. Same reason as React's first row.                                                                                         |
| Reactive Forms and template forms                            | Not a form control and holds no value, so no `ControlValueAccessor`.                                                                                                            |
| Defaults set once for the application                        | `RESULT_STATE_DEFAULTS` and `provideResultStateDefaults()`, read by `injectResultStateDefaults()`.                                                                              |
| A template reaching the instance                             | `exportAs: 'slResultState'`, and an `exportAs` on each part directive.                                                                                                          |
| Substituting projected content, and keeping it lazy          | `<ng-content select="[slResultStateMedia]" />` inside the media box, then one `<ng-content />` for the rest. The consumer's artwork lands in the box the family draws.           |
| Zoneless change detection and `OnPush`                       | `signal`, `input`, `computed` throughout; `ChangeDetectionStrategy.OnPush`; no `markForCheck`.                                                                                   |
| Subscriptions and listeners torn down                        | None are opened. The family binds no listener.                                                                                                                                  |
| A static attribute the consumer wrote survives host bindings | `tabindex` is read with `HostAttributeToken` before the host binding writes it, which is the correction `alert` made.                                                            |
| The entry point stays a single class                         | `@slotted/angular/result-state`, one `public-api.ts`.                                                                                                                           |

### Both

The consumer's explicit value beats the provider, which beats the fallback. The
platform is preferred before ARIA: a `section`, a `p`, and the consumer's own
`button` and `a`. The internal DOM is `data-part` and nothing else.

The two bindings are not levelled. Angular gets `provideResultStateDefaults()`
and `exportAs`; React gets `render` on seven parts, which Angular does not need
because the directive is already written on the consumer's element.
