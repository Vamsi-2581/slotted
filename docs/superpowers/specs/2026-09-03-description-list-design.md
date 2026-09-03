# Description List — design

Written before the contract, as step 5 of `.claude/skills/component/SKILL.md`
requires. The capability inventory it answers is
`2026-09-03-description-list-capability-inventory.md`.

## What the family is

Pairs of a term and its description, read rather than edited. The library's
target is dense product applications, and the shape this family takes there is
the details panel: a resource's identifiers, dates, owners and states, beside a
table or inside a card.

It is not a table. A table has columns that mean the same thing down every row;
this has one term per value, and the terms differ.

It is not a form. Nothing here holds a value a consumer submits, which is why no
part is a control and no binding implements `ControlValueAccessor`.

## The element

`dl` for the root, `div` for the pair, `dt` for the term, `dd` for the value and
a second `dd` for the row action.

The HTML Standard permits a `dl` whose children are `div` elements, each holding
one or more `dt` followed by one or more `dd`. That form is what makes a pair a
single grid area, and it is what PatternFly and GOV.UK both render.

HTML-AAM 1.0 maps `dl` to `list`, `dt` to `term` and `dd` to `definition`. The
family writes none of those roles: MDN records that authoring the ARIA `term`
and `definition` roles by hand changes how VoiceOver announces the construct,
and the elements already carry the mapping.

Ant Design renders a `table` instead. A table announces rows, columns and a cell
count that mean nothing here, and section 10 of `docs/component-features.md`
requires `dl`/`dt`/`dd` or an equivalent semantic. The alignment a table buys is
bought below with subgrid instead.

## Anatomy

| Part          | Element  | Always | What it is                                                          |
| ------------- | -------- | ------ | ------------------------------------------------------------------- |
| `root`        | `dl`     | yes    | The list. Owns the arrangement, the container query and the tracks. |
| `item`        | `div`    | yes    | One name-value pair. The box a rule, a tint or a span applies to.   |
| `term`        | `dt`     | yes    | The name.                                                           |
| `hint`        | `span`   | no     | One line explaining the term, inside the `dt`.                      |
| `description` | `dd`     | yes    | The value's cell. Holds the value and the controls that reach it.   |
| `value`       | `span`   | yes    | The value itself. The part a clamp applies to.                      |
| `placeholder` | `span`   | no     | Drawn in place of a value that is missing.                          |
| `copy`        | `button` | no     | Puts the value on the clipboard.                                    |
| `toggle`      | `button` | no     | Reveals a clamped value, and clamps it again.                       |
| `action`      | `dd`     | no     | The row's own action: the consumer's link or button.                |

`value` is always present so that the clamp, the copy target and the controls
have one stable place, in every configuration. A `dd` that held the text
directly could not clamp its text without clamping the button beside it.

`action` is a second `dd` in the same group, which is GOV.UK's answer and the
platform's: a `dt` may be followed by more than one `dd`.

## The tracks, and why they are subgrid

The root declares the tracks and every item borrows them:

```css
[data-ui='description-list'][data-layout='row'][data-columns='1'] {
  grid-template-columns: fit-content(var(--slotted-description-list-term-width, 14rem)) minmax(0, 1fr) auto;
}
[data-ui='description-list'][data-layout='row'] [data-part='item'] {
  display: grid;
  grid-template-columns: subgrid;
}
```

`fit-content()` sizes the term column to the widest term in the list and stops
at a maximum a theme can retune. PatternFly needs a stated `termWidth` to line
two pairs up and Ant needs a real `table`; a `dl` of independent groups cannot
align without subgrid, and that is the one thing a reader of a details panel
notices first.

Three tracks per column, whatever the column count, so one set of rules places
every cell:

| Cell          | Column                                             |
| ------------- | -------------------------------------------------- |
| `term`        | `1`                                                |
| `description` | `2 / -2`                                           |
| `action`      | `-2 / -1`                                          |

An item that spans two columns borrows six tracks instead of three, and the same
three rules place its cells: the value simply stretches across the middle
tracks. No second placement exists for the spanning case.

The separation between the term and the value is padding on the cells, not
`column-gap`. A gap applies between tracks whether or not the action track has
any width, so a list with no actions would carry a trailing gap it never asked
for.

## Axes and their values

| Axis      | Values                       | Default | Meaning                                                        |
| --------- | ---------------------------- | ------- | -------------------------------------------------------------- |
| `layout`  | `row`, `stack`               | `row`   | The term beside the value, or above it.                        |
| `columns` | `1`, `2`, `3`                | `1`     | How many pairs stand side by side.                             |
| `variant` | `plain`, `ruled`, `framed`   | `plain` | Nothing between pairs, a rule between them, or a framed table. |

The three variant names are `collapsible`'s, for the same three ideas. One
technical term, one word.

`size` is declined: the theme restates the control scale at each of the three
densities, and a family-owned size step would be a second scale answering the
same question. `stepper` declined it for the same reason.

## Reflow

The root declares `container-type: inline-size` and the container name
`slotted-description-list`. Breakpoints are literals, because CSS forbids a
custom property in a container condition — rule 4 of `docs/token-foundation.md`.

| Below   | What changes                                                    |
| ------- | ---------------------------------------------------------------- |
| `48rem` | Three columns become two.                                       |
| `34rem` | Two columns become one.                                         |
| `26rem` | `row` becomes `stack`: the term moves above the value.          |

The order matters: a two-column `row` list at 30rem has 15rem per pair, of which
the term takes up to 14rem, and the value would break one word per line. The
column count collapses before the arrangement does, so the single-column `row`
form gets its full width before it gives up on the row.

Every threshold answers the component's own inline size. PatternFly and Ant both
key their equivalents on the viewport, which is wrong for the same list inside a
320-pixel drawer on a 1600-pixel screen.

## State

One mutable value: whether a clamped description is showing all of its text.

```json
"revealed": {
  "controlled": "revealed",
  "uncontrolled": "defaultRevealed",
  "request": "onRevealedChange",
  "reasons": ["pointer", "keyboard", "programmatic"]
}
```

The state belongs to the description, not to the list: two long values in one
list are revealed independently, and a list-level flag would be a second answer
to a question each row already has.

`revealed` is the vocabulary's word for a hidden value shown in the clear.
`specs/contract.schema.mjs` held the capability and no attribute for it, which
`text-field` did not need and this family does: the stylesheet has to select the
revealed state to release the clamp. `data-revealed` is added to the shared state
vocabulary in its own commit, before this family's work.

The toggle carries `aria-expanded`, which is the APG Disclosure pattern's
requirement — `w3.org/WAI/ARIA/apg/patterns/disclosure/`, read 2026-09-03: role
`button`, `aria-expanded` true while the content is visible, `aria-controls`
optional. `aria-expanded` is ARIA's word for what the toggle does to the DOM;
`revealed` is this family's word for the state, and the two are named
differently because they are addressed to different readers.

Clamping never removes text from the DOM. `docs/build-briefing.md` decided that
for the library, and section 10 states it for this family: a long value may be
copied or revealed, never truncated without access.

## Copying

`copy` is an action, not state: the clipboard belongs to the platform and the
family holds nothing of it. The control writes the value, then emits a request
carrying the text, the reason and the outcome, and announces the result through
`@slotted/core/live-announcer`.

The capability vocabulary had no word for it. `copyable` is added to
`KNOWN_CAPABILITIES` and deliberately not to `MUTABLE_CAPABILITIES`, in the same
shared-tool commit as `data-revealed`, with the comment naming the family that
found the gap — the way `value`, `validity` and `complete` were each added.

`navigator.clipboard.writeText` is the whole implementation. The
`document.execCommand('copy')` fallback is declined: it exists for insecure
contexts, and a details panel showing an account identifier over plain HTTP has
a larger problem than a copy button. When the write is refused, the control
returns to rest, the request carries the failure, and the value is still
selectable text — which is what a reader had before the button existed.

The mark is a new glyph token, `--slotted-icon-copy`. The glyph scale had no
clipboard mark, and rule 3 of `docs/token-foundation.md` refuses a character
standing in for one. It is a primitive on the `base` axis, like every other
glyph, and `code-block` in wave 7 needs the same mark.

## The missing value

An empty cell is a row a reader cannot tell from a defect. Ant renders one; the
GOV.UK guidance is to render a link to the question that would fill it.

Here, an empty description renders the `placeholder` part: a rule drawn in CSS
at the value's optical centre, and the reason in text a screen reader reads,
through `data-ui="visually-hidden"` — the same composition `stepper` uses for its
step status. The default text is `Not provided`, replaceable per instance and
once per application.

The rule is drawn geometry rather than an em dash, so it holds its weight
against the type at every density and needs no font to contain the character.

## Composition

| Question                             | Answer                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| A title and actions above the list    | `card`: `CardHeader`, `CardActions`, `CardBody`. PatternFly says the same on its page. |
| A value that is a status, tag or link | The value slot takes any content; `status-indicator`, `tag`, `badge` and `link` exist.  |
| A value that has not loaded           | `skeleton` inside the value slot.                                                       |
| An icon beside the term               | `icon` inside the `dt`; this family owns only the optical alignment.                    |
| Help in a layer                       | `popover` and `tooltip`, wave 5. The `hint` part is the half that needs no layer.       |
| Several titled groups                 | Several lists. A heading inside a `dl` is not permitted content, and inventing a group heading would put invalid markup in every consumer's page. |

Column-first flow — PatternFly's `isFillColumns` — is declined: reading order
would stop matching DOM order, and a screen reader reads the DOM.

## Accessibility decisions

- No role is written. `dl`, `dt` and `dd` carry `list`, `term` and `definition`
  already, and writing them by hand changes VoiceOver's announcement.
- The row action is named by its own term through `aria-describedby` pointing at
  the `dt`. GOV.UK repeats the term as visually hidden text inside every action,
  which a template system has to do; a reference says it once and cannot drift.
  A consumer's own `aria-describedby` is composed with, never replaced. Where a
  `hint` is present the reader hears it too, because the hint is inside the `dt`
  that names the term.
- The toggle and the copy control are `button` elements, so `Enter`, `Space`,
  focus and the disabled behaviour are the platform's.
- The copy result is announced politely through the shared live announcer rather
  than through a region this family owns, so two copies in one update are both
  heard.
- The placeholder's meaning is text, not a glyph: colour and shape alone never
  carry it.

## Both bindings

The conceptual contract, the authored stylesheet, the parts and the reasons are
shared. Nothing else is.

### React — the integration table answered

| Question                                                          | Answered by                                                                                                                                                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, and a request carrying a reason | `revealed` / `defaultRevealed` / `onRevealedChange(request)` on `DescriptionListDescription`, through `createControllable` from `@slotted/core/state`.               |
| Defaults set once                                                 | `DescriptionListDefaultsProvider` and `useDescriptionListDefaults()`: `columns`, `layout`, `variant`, `placeholder`, `copyLabel`, `copiedLabel`, `revealLabel`, `collapseLabel`, `clamp`. |
| Substituting the rendered element of each part                    | `render` on every one of the ten parts.                                                                                                                             |
| The consumer's handler still runs                                 | The copy and toggle controls call the consumer's `onClick` first and act after it, and stop if it called `preventDefault`.                                          |
| Reaching the native element, and the imperative action            | `ref` on every part. No imperative handle is invented: revealing is declarative and copying is `navigator.clipboard`, which the consumer already has.                |
| Server rendering without a mismatch                               | `useId` for the term and description identifiers; nothing reads layout during render.                                                                               |
| Every state a consumer may style, in the DOM                      | `data-ui`, `data-part`, `data-layout`, `data-columns`, `data-variant`, `data-span`, `data-clamp`, `data-revealed`, `data-copied`.                                    |
| Native props types                                                | `ComponentPropsWithRef<'dl' \| 'div' \| 'dt' \| 'dd' \| 'span' \| 'button'>`, extended.                                                                              |

### Angular — the integration table answered

| Question                                          | Answered by                                                                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The signal form the ecosystem expects             | `input()` for `revealed` and `defaultRevealed`, `output<ChangeRequest<boolean>>()` for `revealedChange`. `model()` has one slot and the request carries four values — the value, the one it replaces, the reason and the event — which is the reasoning `breadcrumb` recorded. |
| Reactive Forms                                    | No. Nothing here is a form control: the family holds no value a consumer submits, so a `ControlValueAccessor` would implement an interface over nothing.        |
| Defaults set once                                 | `DESCRIPTION_LIST_DEFAULTS` and `provideDescriptionListDefaults()`.                                                                                             |
| Reaching the instance from a template             | `exportAs` on all ten directives and components.                                                                                                                |
| Substituting projected content, kept lazy         | `ng-content` in every part; `NgTemplateOutlet` for the placeholder, which a defaults provider may replace with a template.                                        |
| Zoneless and `OnPush`                             | Signals throughout, `ChangeDetectionStrategy.OnPush`, no `markForCheck`.                                                                                        |
| Every listener and timer torn down                | The copied-state timer is cleared through `DestroyRef`.                                                                                                          |
| A static attribute the consumer wrote             | `HostAttributeToken` for `aria-describedby` on the action and for `id` on the term, so a consumer's own value survives and is composed with.                     |
| One class per entry point                         | `@slotted/angular/description-list`, reached only through that path.                                                                                            |

### Where they differ, deliberately

An empty value is detected from `children` in React, where `null`, `undefined`
and `''` are what a template produces for a field a server did not send.
Angular cannot inspect projected content without reading the DOM after render,
so it takes an explicit `empty` input. Levelling the two down to the explicit
input in both would remove the case that matters most in React — a value that is
missing because the data is missing — to make the two look alike.

## Cost of the decisions taken

- Two additions to `specs/contract.schema.mjs`: the `copyable` capability and
  the `data-revealed` attribute. Both are additive, both carry the comment that
  names why, and every existing contract keeps passing.
- One addition to the token contract and the default theme:
  `--slotted-icon-copy`. A theme that does not restate it inherits the default.
- Subgrid. Every browser the library targets has shipped it since 2023; a
  browser without it renders each pair with its own tracks, so the terms stop
  sharing a column and nothing else changes.
- The `value` wrapper adds one element per pair. It buys a stable clamp target
  and one set of control rules for every configuration.
