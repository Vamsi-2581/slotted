# List and List Item design

Decisions taken before either binding was written, from
`docs/history/designs/2026-09-03-list-and-list-item-capability-inventory.md`.
Both families are new. Nothing here restates the inventory; what is written
here is what the inventory left to decide.

## Pattern source

The WAI-ARIA Authoring Practices publish **no pattern for a static list**: the
patterns index at <https://www.w3.org/WAI/ARIA/apg/patterns/> names Listbox and
Grid for interactive collections and nothing between them and plain content.
The governing sources are therefore the platform and the roles model:

- HTML `ul`, `ol`, `li` — <https://html.spec.whatwg.org/multipage/grouping-content.html>
- ARIA 1.2 `list` role — required owned element `listitem`; `aria-busy` is
  required on the container while its owned elements have not arrived
  (§5.2.6).
- ARIA 1.2 `listitem` role — base concept `<li>`; required context `list`;
  supported properties `aria-level`, `aria-posinset`, `aria-setsize`.
  **`aria-disabled`, `aria-invalid`, `aria-errormessage` and `aria-haspopup`
  are deprecated on this role.** `aria-current` is inherited and is not.

Everything the platform already supplies is left to it: the role of the
container and of every row, the reading order of an `ol`, the marker, the
nesting level, `Tab` and `Shift+Tab`, `Enter` on a link, `Enter` and `Space` on
a button, and the modified click a browser gives an anchor.

### Keyboard

There is no family keyboard model, and that is the decision rather than an
omission.

| Key         | Effect                                                                     | Focus                     | Source   |
| ----------- | -------------------------------------------------------------------------- | ------------------------- | -------- |
| `Tab`       | moves to the next focusable element; every row control is in the sequence  | the next focusable        | platform |
| `Shift+Tab` | the same, backwards                                                        | the previous focusable    | platform |
| `Enter`     | follows a `list-item-link`; activates a `list-item-button`                 | stays                     | platform |
| `Space`     | activates a `list-item-button`; scrolls the page elsewhere                 | stays                     | platform |

Arrows, `Home`, `End` and typeahead are **not** bound. A `role="list"` that
answers arrow keys is the invented keyboard `docs/component-features.md` §10
refuses, and the roving focus that would make it correct belongs to `listbox`
and `table` in wave 6. The cost: a reader tabbing through a hundred-row list
presses `Tab` a hundred times. That is the platform's own behaviour for a page
of links, and the family's answer is `list-item-link` inside a `nav` the page
labels, which every screen reader can jump between by landmark and by list.

## Two families, one relationship

`list` is the set, `list-item` is the member — the relationship `accordion` and
`collapsible` already have, and the rule that came with it holds here too:
**no rule in `list.css` reaches `[data-ui='list-item']`.** The set hands its
resolved values to the rows through the binding — React context, Angular
injection — and selects nothing inside them.

What the set hands down: `variant`, `size`, `marker`, `inset`. What it does
not: `tone`, `align`, `truncate`, `selected`, `current`, `disabled`, `loading`,
all of which are facts about one row.

Resolution order for every value a row can inherit: **the row's own prop, then
the list, then the defaults provider, then the fallback.** The consumer's
explicit value always wins.

## `list`

One member, five parts.

| Part            | Element         | Always | For                                                                     |
| --------------- | --------------- | ------ | ----------------------------------------------------------------------- |
| `root`          | `ul` or `ol`    | yes    | The set. Carries `data-ui="list"`.                                      |
| `section`       | `li`            | no     | One group: a heading and the rows under it.                             |
| `section-label` | `h1`–`h6`, `div` | no     | The group's name.                                                       |
| `section-list`  | `ul` or `ol`    | no     | The rows of one group, nested where HTML already nests them.            |
| `empty`         | `li`            | no     | What the set says when it holds nothing.                                |

### Axes

| Axis      | Values                                     | Default | What it decides                                              |
| --------- | ------------------------------------------ | ------- | ------------------------------------------------------------ |
| `variant` | `plain`, `ruled`, `framed`, `separated`    | `plain` | How the rows are told apart. The vocabulary is `accordion`'s. |
| `size`    | `sm`, `md`, `lg`                           | `md`    | The row's own inset and type step.                            |
| `marker`  | `none`, `bullet`, `number`                 | `none`  | What is painted in the marker column.                         |

`ordered`, `inset`, `loading`, `label` and `labelledBy` are values rather than
axes: none of them selects a visual recipe on its own.

### `role="list"`, written always, and why the marker is the family's

Safari and VoiceOver drop list semantics whenever CSS removes the marker
(<https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html>), and the
article's own answer is `role="list"` on the element.

The family always removes it. A row is a content box beside its independent
targets, so the `li` has to lay its children out along the inline axis, and CSS
has no `display` that is both `list-item` and a grid: `display` accepts
`list-item` only alongside `flow` or `flow-root`. The native `::marker` is
therefore unavailable to any list whose rows carry a trailing control, which is
most of them.

So the marker becomes the family's:

- `bullet` is the `--slotted-icon-dot` glyph as a mask. A character is never an
  icon — `docs/token-foundation.md` rule 3 — so it is drawn geometry rather
  than a `•` in a `content` string, and it takes the row's own text colour.
- `number` is a CSS counter, `slotted-list-item`, which `list` resets on the
  root and on every `section-list`, and `list-item` increments. That counter
  name is the only thing the two stylesheets share; neither selects the other's
  `data-ui`.

And `role="list"` is written on the root and on every nested `section-list`,
unconditionally, because the cause is unconditional. MUI never writes it and
loses the semantics in Safari; Angular Material writes it and says nothing
about why.

The cost: a consumer who wants the browser's own `::marker` — for a
`list-style-image`, say — cannot have it, and `marker="bullet"` is the family's
answer instead.

### The empty row

`empty` is an `li` inside the list, not a sibling of it. A message outside the
`ul` is outside the box the family paints, and the reader hears "list, 0 items"
followed by nothing. Inside, the reader hears "list, 1 item" and then the
message, which is the true thing the list has to say. `aria-busy` is not used
for it: an empty list is not a loading one.

The family supplies the box and the row height; the words are the page's, and
`result-state` is what goes in it.

## `list-item`

One member, eight parts. Three content elements.

| Part          | Element                | Always | For                                                                  |
| ------------- | ---------------------- | ------ | -------------------------------------------------------------------- |
| `root`        | `li`                   | yes    | The row. Carries `data-ui="list-item"` and every state attribute.    |
| `content`     | `div`, `button` or `a` | yes    | The box that is read, hovered, focused and — for two of the three — activated. |
| `start`       | `div`                  | no     | The leading column: an icon, an avatar, a checkbox, a number.        |
| `body`        | `div`                  | no     | The text column. Owns `min-inline-size: 0`.                          |
| `label`       | `div`                  | no     | The title. Owns truncation and bidi isolation.                       |
| `description` | `div`                  | no     | The secondary lines.                                                 |
| `end`         | `div`                  | no     | Trailing metadata that is part of what the row says.                 |
| `actions`     | `div`                  | no     | Independent targets. **A sibling of `content`, never a child.**      |

### Why `actions` is a sibling

Interactive content may not nest inside `a` or `button`. A row that navigates
and also carries a delete control has to place the two side by side; a row that
nests them produces HTML no browser can make focusable and every surveyed
implementation allows it. Making the arrangement the only one the parts express
is what stops the mistake being possible, and it is the same decision `tag`
took for `remove`.

### The three content elements

| Component            | `content` renders | For                                                     |
| -------------------- | ----------------- | ------------------------------------------------------- |
| `ListItemContent`    | `div`             | A row that is read, not activated. It may hold `actions`. |
| `ListItemButton`     | `button`          | A row that is one command.                              |
| `ListItemLink`       | `a`               | A row that is one destination.                          |

Three components rather than one `as` prop: they are three different
accessibility trees, and a string that picks between them turns a typo into a
`div` no reader can reach. Each takes `render`, so the anchor can become a
router link and the button a form's submit without losing the wiring.

### Disabled, and where the attribute goes

`disabled` is stated on the row and paints from `[data-disabled]` on the `li`.
The attribute that means it goes on `content`:

- `ListItemButton` → the native `disabled` attribute on the `button`.
- `ListItemLink` → `aria-disabled="true"` and no `href`, because an anchor has
  no native disabled and an anchor with a destination will navigate.
- `ListItemContent` → nothing; a `div` refuses no interaction, and the row
  dims. Any control the page put in `actions` is the page's to disable, which
  is the rule `card` states for the same shape.

**`aria-disabled` is never written on the `li`.** ARIA 1.2 deprecates it on
`listitem`. This is the one place the family departs from every surveyed
implementation, and the cost is that a page reading `aria-disabled` off the row
element finds nothing; `data-disabled` is what it reads instead, and it is
contract.

### Loading

`loading` writes `aria-busy="true"` on the row and refuses the activation:
`ListItemButton` gets the native `disabled` for the duration, `ListItemLink`
loses its `href`. The row keeps its width, as
`docs/component-features.md` §2.5 requires, and the accessible name is
untouched — a busy row still says what it is.

The family draws no placeholder and no spinner. It reserves the label's line
box so the row does not change height while its content is replaced, and what
stands in the gap is `skeleton`, composed by the page. That is the decision
`collapsible` already took for a loading panel, and drawing a second set of
placeholder geometry here would be two answers to one question.

`loading` outranks `hover` and `active` and is outranked by `disabled`, which is
`STATE_PRECEDENCE`'s order and is what `packages/styles/src/states.test.mjs`
checks.

### Selected and current

`selected` is a paint, not a model. `aria-selected` is not valid on `listitem`;
the announcement belongs to the control that owns the selection — a `checkbox`
in `start`, which the page composes — and the row mirrors it through
`data-selected`. This is exactly `card`'s contract for the same problem.

`current` writes both `data-current` and `aria-current`, taking the token the
page states: `page`, `step`, `location`, `date`, `time` or `true`. It is the
one selection-shaped state a static list may announce itself, because ARIA 1.2
lists `aria-current` as inherited by `listitem` and does not deprecate it.

### `position` and `setSize`

Forwarded to `aria-posinset` and `aria-setsize` only when the page states them.
ARIA 1.2 is explicit that they are unnecessary while every row is in the DOM
and necessary the moment only part of the set is — a filtered list, a page of
results, a window. Writing them always would make every list disagree with
itself the moment a row was filtered out.

### Reflow

The row declares `container-type: inline-size` and the container name
`slotted-list-item`. Below **22rem** the trailing metadata leaves the row's
inline axis and sits under the title, and the independent targets take a line
of their own at the end of the row. The leading visual stays where it is: it is
the row's identity, and moving it says nothing.

`actions` moves because a target never shrinks — that is what makes it a
target — so on one line the box beside it shrinks instead. Measured on the
Angular reference page at 620 pixels, a row whose target carried a word rather
than a glyph left its content eighty-six pixels wide and a one-word timestamp
spilling out of the column it was in. The
breakpoint is a literal, because CSS forbids a custom property in a container
condition — `docs/token-foundation.md` rule 4.

`list` does **not** declare a container. It has no layout that answers its own
width; the rows do.

## Motion

Two transitions, both from the motion scale, both on a change the eye follows:

- `content`'s background and text colour on hover, press, selection and
  current, at `--slotted-control-transition-duration` with
  `--slotted-control-transition-easing`. A row that fills instantly in a list
  of forty reads as a flicker.
- The focus ring, on the same duration, so the outline and its shadow arrive
  together.

Nothing else moves. There is no enter or exit animation: rows arrive and leave
with the page's own data, and a family that animated them would be animating a
list the consumer re-ordered.

## Tokens

Family tokens live in `packages/styles/src/list/list.tokens.json` and
`packages/styles/src/list-item/list-item.tokens.json`, each falling back to a
foundation token. The row reads `--slotted-control-*` for its type, its gap and
its icon column — a row is a control-sized thing and the theme retunes it once —
and the surface, border and tone families for its paint. The marker column is a
proportion of the icon size rather than a sixth scale, which is the rule
`docs/token-foundation.md` states under **Avatar size**.

No token is added to `packages/tokens/src/contract.json`. Neither family meets
a size the semantic layer cannot be retuned to give.

## Integration — React

| Question                                                              | Answered by                                                                                                                                      |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| A controlled and uncontrolled pair, plus a request carrying a reason? | **No.** Neither family holds a mutable value. The selection model that would need one is deferred to `listbox` and `table`, wave 6, by name.      |
| Defaults set once for the whole application?                          | `ListDefaultsProvider` / `useListDefaults` and `ListItemDefaultsProvider` / `useListItemDefaults`.                                                |
| The rendered element of each public part substituted?                 | `render` on `List`, `ListSection`, `ListItem`, all three content components and every part component.                                            |
| The consumer's handler still runs?                                    | The family binds no handler on any part. `ListItemButton` and `ListItemLink` refuse activation by removing the capability — `disabled`, no `href` — not by swallowing an event. |
| The native element and the imperative action reached?                 | `ComponentPropsWithRef<'li' \| 'button' \| 'a' \| 'ul'>` throughout. **No imperative handle**: there is no action a consumer cannot express declaratively, and `scrollIntoView` on their own ref is the platform's. |
| Server rendering without a hydration mismatch?                        | `useId` for the section heading's id, which `section-list` names through `aria-labelledby`. No layout is read during render.                      |
| Every state a consumer may style in the DOM?                          | `data-selected`, `data-current`, `data-disabled`, `data-loading` on the row; `data-loading` on the list; plus `data-variant`, `data-size`, `data-marker`, `data-align`, `data-tone`, `data-inset`, `data-truncate`. |
| Each part's props type the native element's, extended?                | Yes; no hand-written subset.                                                                                                                     |

## Integration — Angular

| Question                                          | Answered by                                                                                                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A two-way value in the signal form?               | **No.** No mutable value, as above.                                                                                                                                  |
| Reactive Forms and template forms?                | **No.** No control here belongs in a form. The `checkbox` a page composes into `start` carries its own `ControlValueAccessor`.                                        |
| Defaults set once?                                | `provideListDefaults()` and `provideListItemDefaults()` over `LIST_DEFAULTS` / `LIST_ITEM_DEFAULTS`.                                                                  |
| A template reaching the instance?                 | `exportAs`: `slList`, `slListSection`, `slListItem`, `slListItemContent`.                                                                                            |
| Projected content substituted, and lazy?          | `ng-content` in every directive; the directive sits on the consumer's own element, so the element, its attributes and its `routerLink` are theirs. `NgTemplateOutlet` is the page's for content that must re-render. |
| Correct zoneless and `OnPush`?                    | `input()` and `computed()` throughout; no `markForCheck`.                                                                                                            |
| Every subscription and listener torn down?        | **None exist.** The family binds no listener and opens no subscription; there is nothing for `DestroyRef` to hold.                                                    |
| A static attribute the consumer wrote surviving?  | `HostAttributeToken` reads `role` on the list root and `aria-current` on the row before the host binding writes either, so a page that wrote its own keeps it.        |
| A single class per entry point?                   | `@slotted/angular/list` and `@slotted/angular/list-item`; neither reaches into the other's source.                                                                    |

### The Angular shape, and why it differs

React exports three content components. Angular exports **one directive**,
`slListItemContent`, written on the element the page chose:

```html
<li slListItem>
  <a slListItemContent [routerLink]="['/inbox']">…</a>
</li>
```

The directive reads the element it is on and supplies the wiring that element
needs — `disabled` for a `button`, `aria-disabled` and the withdrawn `href` for
an `a`, nothing for anything else. That is the ecosystem's own composition, and
it is the same choice `collapsible` made for its heading. The two bindings reach
the same accessibility tree; they do not reach it through the same number of
symbols, and the self-assessment records the asymmetry rather than levelling
React down to one component with a string.
