# Toggle group and segmented control design

Decisions taken before either family was written, as
`.claude/skills/component/references/frameworks.md` step 5 requires. The
capability inventory this rests on is
`docs/superpowers/specs/2026-09-10-toggle-segmented-capability-inventory.md`;
what it decided in one sentence: **`toggle-group` is a set of toggle buttons and
`segmented-control` is a radio group**, and the paint follows from the element
rather than the other way round.

---

## 1. Two families, and why not one

The alternatives were weighed and each is written with what it costs.

**One family with two members**, on the shape `button` already has. Rejected:
every member of `button` carries `data-ui="button"`, so a segmented control
would be selected in public by the name `toggle-group`, which no consumer would
guess and which contradicts the two names `docs/build-order.md` wave 8 lists. The
two also disagree about the type of the value they hold — an array and a string —
and a member that changes its family's value type is a second family wearing the
first one's name.

**`toggle-group` as `button-group` plus shared state**, with the items being
`button`'s ToggleButton, the way `button-group` composes them today. This was the
strongest alternative and it is the one that was dropped last. It buys the whole
painted surface — five tones, three variants, `loading`,
`focusableWhenDisabled` — for nothing, and `button-group`'s stylesheet already
paints a joined bar whose comment calls it a segmented control in so many words.
What it costs is the thing the family exists for: `button`'s ToggleButton owns
`pressed` with a complete controlled and uncontrolled model, so inside a group
that owns the value there would be two owners of one fact, which is the desync
`docs/state-and-events.md` exists to prevent. Every surveyed headless
implementation — Radix, Base UI, Ark, React Aria — owns its own item for the same
reason. So `toggle-group` owns `item`, and pays for it by painting one selected
colour rather than five: the accent border and surface pair the token foundation
already names for "the chosen row, card, option and toggle".

A consumer who wants the full `button` palette in a joined bar still has it:
that is `button-group` around ToggleButtons, and it is one line of the reference
page.

## 2. Anatomy

### `toggle-group`

```html
<div data-ui="toggle-group" data-part="root" role="group" aria-label="Text style"
     data-orientation="horizontal" data-size="md" data-variant="outline" data-attached>
  <button type="button" data-part="item" aria-pressed="true" data-pressed>
    <span data-part="icon" aria-hidden="true"></span>
    <span data-part="label">Bold</span>
  </button>
</div>
```

| Part    | Element  | Always | For                                                                              |
| ------- | -------- | ------ | -------------------------------------------------------------------------------- |
| `root`  | `div`    | yes    | The group. Carries `role="group"`, the axes, and one tab stop for the whole set. |
| `item`  | `button` | yes    | One two-state control. Carries `aria-pressed` and `data-pressed`.                |
| `icon`  | `span`   | no     | The mark, aligned to the label's text rather than to its line box.               |
| `label` | `span`   | no     | The words. Absent on an icon-only item, which then draws square.                 |

### `segmented-control`

```html
<div data-ui="segmented-control" data-part="root" role="radiogroup" aria-label="View"
     data-size="md" data-orientation="horizontal" data-condense="none"
     style="--slotted-segmented-control-count: 3; --slotted-segmented-control-index: 1">
  <span data-part="indicator" aria-hidden="true"></span>
  <label data-part="item" data-checked>
    <input data-part="control" type="radio" name="view" value="grid" checked />
    <span data-part="icon" aria-hidden="true"></span>
    <span data-part="label">Grid</span>
  </label>
</div>
```

| Part        | Element  | Always | For                                                                                          |
| ----------- | -------- | ------ | ---------------------------------------------------------------------------------------------- |
| `root`      | `div`    | yes    | The track. Carries `role="radiogroup"`, the axes, the count and the checked index.            |
| `indicator` | `span`   | no     | The thumb. Absent while nothing is checked, so it fades in rather than sliding from an edge.  |
| `item`      | `label`  | yes    | One segment, and the whole hit area of its radio.                                             |
| `control`   | `input`  | yes    | The radio. Visually hidden, focusable, submitted with the form.                               |
| `icon`      | `span`   | no     | The mark, aligned to the label's text.                                                        |
| `label`     | `span`   | yes    | The words. Present even under `data-condense="icons"`, where it is hidden visually and kept.  |

The segment cannot become a `button` or an `a`. That substitution is what the
radio semantics is; a row that navigates is `tabs`, which already ships
`controlElement.withHref`.

## 3. State

| Family              | Capability  | Controlled | Uncontrolled   | Request          | Value type            | Reasons              |
| ------------------- | ----------- | ---------- | -------------- | ---------------- | --------------------- | -------------------- |
| `toggle-group`      | `selection` | `value`    | `defaultValue` | `onValueChange`  | `string[]`            | `pointer`, `keyboard` |
| `segmented-control` | `selection` | `value`    | `defaultValue` | `onValueChange`  | `string \| undefined` | `pointer`, `keyboard` |

`toggle-group` holds an array in both modes and `multiple` caps it at one entry.
The alternative — Radix's `type` prop switching the value between a string and an
array — needs a discriminated union in React and has no equivalent in an Angular
`model()`, so the two bindings would disagree about the type of one value. The
cost, written: a single-select consumer writes `value={['bold']}`.

`segmented-control` holds a string because a radio group holds one, and because
that is the value a `ControlValueAccessor` and a submitted form carry.

Neither family emits a request for a value equal to the one it holds, which is
`@slotted/core/state`'s rule, so pressing the checked segment is silent.

## 4. Keyboard, sourced

### `toggle-group` — APG Button (toggle) plus Toolbar navigation

Read at <https://www.w3.org/WAI/ARIA/apg/patterns/button/> and
<https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/> on 10 September 2026. There
is no APG pattern named "toggle group"; the container is a `group`, its
navigation is the Toolbar pattern's, and each item is the Button pattern's toggle
button.

| Key                     | Effect                                                            | Focus lands on            | Source                     |
| ----------------------- | ----------------------------------------------------------------- | ------------------------- | -------------------------- |
| `Tab`                   | Moves into the group, which holds one tab stop                    | The pressed item, or the first enabled one | roving tabindex |
| `Space`                 | Toggles the focused item                                          | Stays                     | platform                   |
| `Enter`                 | Toggles the focused item                                          | Stays                     | platform                   |
| `ArrowRight` / `ArrowLeft` | Moves in a horizontal group, mirrored in `dir="rtl"`, wrapping  | The item moved to         | `@slotted/core/focus`      |
| `ArrowDown` / `ArrowUp` | The same in a vertical group; nothing in a horizontal one, so the page keeps scrolling | The item moved to | `@slotted/core/focus` |
| `Home` / `End`          | Moves to the first / last enabled item                            | That item                 | `@slotted/core/focus`      |

Arrows move focus and never toggle: an item is a button, and the Button pattern
activates on `Space` and `Enter` alone. This is where a toggle group and a radio
group genuinely differ, and it is the difference a reader feels.

Roles and properties: root `role="group"` with the consumer's `aria-label` or
`aria-labelledby`; `aria-orientation="vertical"` only when vertical; each item
`aria-pressed="true|false"`, always present so the item is announced as a toggle
in both states; the label does not change when the state does, which the Button
pattern calls critical; `disabled` is the native attribute, and
`aria-disabled` with `focusableWhenDisabled` is not offered here — the item that
needs it is `button`'s.

### `segmented-control` — APG Radio Group, supplied by the platform

Read at <https://www.w3.org/WAI/ARIA/apg/patterns/radio/> on 10 September 2026.

| Key                            | Effect                                                              | Focus lands on         | Source   |
| ------------------------------ | --------------------------------------------------------------------- | ---------------------- | -------- |
| `Tab`                          | Moves into the group                                                | The checked segment, or the first when none is checked | platform |
| `Space`                        | Checks the focused segment when it is not already checked           | Stays                  | platform |
| `ArrowRight` / `ArrowDown`     | Moves to the next segment and checks it, wrapping at the end        | The newly checked one  | platform |
| `ArrowLeft` / `ArrowUp`        | Moves to the previous segment and checks it, wrapping at the start  | The newly checked one  | platform |

Every row is the platform's because the segments are radios sharing one `name`,
which is the fact `radio-group` already records as `"rovingFocus": "platform"`.
Arrow keys are mirrored in a right-to-left document by the browser, and disabled
segments are skipped by the browser, so neither binding writes a key listener.

Roles and properties: root `role="radiogroup"`, withdrawn inside `field-group`
for the reason `radio-group` records — a `fieldset` with a `legend` is already a
named group and two named groups around one set is the group announced twice;
`aria-orientation="horizontal"` when horizontal, because `radiogroup` implies
vertical; `aria-required`, `aria-invalid` and `aria-readonly` from `field` or from
the family's own props; each segment named by the text inside its `label`.

`readOnly` is enforced by the family rather than by the platform, because a radio
ignores `readonly` — the same refusal on `click` that `radio-group` writes, for
the same reason.

## 5. Composition and the toolbar

A `toggle-group` inside a `toolbar` gives up its own keyboard. The bar is one tab
stop with arrow navigation across every focusable control it holds, and a group
running a second ring inside it would put two tab stops where the APG asks for
one. `toolbar` promised this family the capability by name — its contract declines
`checkedValues` and defers it here.

The bar is found in the DOM, with `closest('[data-ui="toolbar"]')`, rather than
through an imported context. `data-ui` is public contract, the check reads the
same in both bindings, and neither family gains a dependency on the other. The
cost, written: the check runs after mount, so a server-rendered group carries its
own tab stop for one frame and the bar takes it over on hydration — before a
reader can reach it with `Tab`, and visible to nobody.

`rovingFocus` stays as an explicit prop for the case the DOM cannot answer: a bar
that is not this library's.

`segmented-control` needs none of this. Its segments are radios, and a radio
group inside a toolbar is the case the APG writes out: the bar's arrows move
focus without changing the checked segment, and `Space` checks. That is what the
platform does with `tabindex="-1"` radios, which is what `toolbar` sets.

## 6. Visual decisions

**The thumb's place is arithmetic.** The root is a grid whose columns are equal
(`grid-auto-flow: column; grid-auto-columns: 1fr`), so an intrinsically sized
track is as wide as its widest segment times the count — which is Carbon's stated
rule, obtained from the layout rather than from a measurement. The thumb is one
column wide and moves by `translate: calc(var(--index) * 100%)`, mirrored by a
sign the stylesheet flips under `dir="rtl"`. Nothing is read from layout, so the
first server-rendered paint is already correct; Mantine and Ark both measure a
node and paint the thumb in the wrong place until hydration.

`--slotted-segmented-control-count` and `--slotted-segmented-control-index` are
runtime values under the name that says so, which is the convention
`docs/build-briefing.md` sets for `--slotted-positioner-*`. They are not design
tokens and are not in the token contract.

**The selected colour is the pair, not a fill.** `docs/token-foundation.md` names
the chosen row, card, option and toggle as the case where a state is carried by
`--slotted-tone-accent-border` around `--slotted-tone-accent-surface`, measured
across the pair. Both families take it: `toggle-group`'s pressed item and
`segmented-control`'s thumb.

**One bar, one edge, and the items own it.** A correction the reviewer forced at
the visual gate: the first pass framed `toggle-group`'s root *and* gave each
pressed item an edge of its own, which drew a coloured border inside a grey one
and made the bar's outline one pixel in places and two in others. The root now
states no border, no padding and no radius. The bar's frame is the items' own
borders, joined the way `button-group` joins the controls a consumer wrote: the
items overlap by one border width, so two joined edges occupy one column rather
than two, and exactly one border is painted in that column — because two borders
a pixel apart are one line on paper and two different lines at 110%, 150% and
175% zoom. An item that is on is the exception in both directions: it states its
own four edges, and the neighbour after it gives up the leading edge that would
otherwise be painted over the accent one. Every item carries a border at all
times and only its colour moves, so no state changes the geometry.

**Both families are exactly one control tall.** The second correction from the
same gate, and the reason it matters is stated by the reviewer: either family can
be put in a form beside a field. `toggle-group` gets it for nothing once the root
states no frame. `segmented-control` keeps its track, so everything inside it is
measured back from `--slotted-control-height-*`: `--_inner` is what is left for a
segment once the track has taken its edge and the ring of ground around the
thumb. At `sm` and `dense` that leaves an eighteen-pixel thumb, so the radio
reaches the track's own edge and the target is the control's height rather than
the thumb's, with `--slotted-target-min` as the floor across the segment.

**A rule between two segments.** A track of words with nothing between them reads
as a sentence. Mantine ships the rule on by default, Apple draws it and Carbon
draws it. It is shorter than the segment, so it reads as a divider rather than as
a second frame, and it gives way around the thumb — a neutral line touching the
accent edge is the same "border inside a border" the other family had to correct.

**Motion.** The thumb's travel is the one movement this pair owns: it says which
segment was left, which a fill appearing in a new place does not. It takes
`--slotted-duration-medium` with `--slotted-easing-standard`, one step above the
control's own interaction feedback, because a thing that travels needs longer
than a thing that changes colour; the dividers fade on the same step, so they and
the thumb move together. Colour changes — hover, press, checked, pressed — take
`--slotted-control-transition-duration`, and a press enters at
`--slotted-duration-instant` so it lands on the frame the pointer went down on
and eases out at the control's own pace. Every step collapses to a single frame
under `prefers-reduced-motion` through the theme's own scale. `toggle-group`
moves nothing: a toggle changes colour, and colour is what the eye has to follow.

**Density and target.** Both read `--slotted-control-height-*`,
`--slotted-control-padding-inline-*`, `--slotted-control-font-size-*`,
`--slotted-control-icon-size-*` and `--slotted-control-gap-*`, so all three
densities are answered by the theme. `sm` at `dense` is 24 pixels, which is
`--slotted-target-min` exactly, and `@media (pointer: coarse)` grows it to 44
through the theme's own block.

**Narrow.** `segmented-control` has a `condense` axis, and at `icons` below a
literal breakpoint the labels become visually hidden while the icons remain. The
words stay in the DOM, so the accessible name is unchanged and the library's rule
that truncation never removes content holds. Primer does the same thing against
the viewport and requires the consumer to supply `aria-label` for the collapsed
state.

The query container is declared on that shape and not on every root, which is a
correction the first captures forced. `container-type: inline-size` contains the
inline axis, so an element that declares it is sized as though it had no
contents: every content-width scene on the page stood about one character wide
and broke its labels one letter per line — the same defect
`docs/build-briefing.md` records for `collapsible`, `pagination` and `stepper`,
reached from the other direction. A control asked to condense is a control whose
width its parent decides, so that shape takes its parent's width and has a width
to be asked about; a control that chose its own width chose one that fits its
words. Because that shape is a query container, `segmented-control`'s stories
take a `block` stage, which `specs/story-layout.test.mjs` enforces.

**Long content.** A label clamps to one line with an ellipsis and keeps its
string whole. A segmented control of nine words per segment is a control the
guidelines refuse; the family stays legible rather than pretending it will not
happen.

**`high-contrast` and forced colours.** Both read semantic tokens only, so the
scheme is answered by the theme. Neither writes a `forced-colors` block: the
thumb is a tone surface with a tone border, which the theme maps to `Canvas` and
`ButtonBorder`, and the checked segment additionally carries `data-checked`, so
the state is not carried by colour alone.

## 7. Axes and defaults

| Family              | Axis          | Values                        | Default        |
| ------------------- | ------------- | ----------------------------- | -------------- |
| `toggle-group`      | `size`        | `sm` `md` `lg`                | `md`           |
| `toggle-group`      | `variant`     | `outline` `ghost`             | `outline`      |
| `toggle-group`      | `orientation` | `horizontal` `vertical`       | `horizontal`   |
| `toggle-group`      | `attached`    | boolean                       | `true`         |
| `toggle-group`      | `fullWidth`   | boolean                       | `false`        |
| `toggle-group`      | `multiple`    | boolean                       | `false`        |
| `toggle-group`      | `deselectable`| boolean                       | `true`         |
| `toggle-group`      | `loop`        | boolean                       | `true`         |
| `toggle-group`      | `rovingFocus` | boolean                       | inferred       |
| `segmented-control` | `size`        | `sm` `md` `lg`                | `md`           |
| `segmented-control` | `orientation` | `horizontal` `vertical`       | `horizontal`   |
| `segmented-control` | `fullWidth`   | boolean                       | `false`        |
| `segmented-control` | `condense`    | `none` `icons`                | `none`         |

Resolution order, both families: the consumer's prop, then `field` where the
family reads one, then the defaults provider, then the value above. The
consumer's explicit value always wins.

## 8. React integration

| Question                                                                | Answer                                                                                                                                  |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason      | Yes. `value` / `defaultValue` / `onValueChange(value, request)`, the request from `@slotted/core/state` carrying `reason` and `source`.  |
| Defaults set once for the application                                  | Yes. `ToggleGroupDefaultsProvider` and `SegmentedControlDefaultsProvider`, each with its `use…Defaults` hook.                            |
| Substituting the rendered element of each public part                  | Yes. `render` on every part of both families, except `segmented-control`'s `control` — substituting the radio is substituting the semantics. |
| The consumer's own handler still runs                                  | Yes. `onClick`, `onKeyDown` and `onChange` are called first and `defaultPrevented` is honoured, which is how `radio-group` composes.     |
| The native element and the imperative action                           | Yes. `ref` on every part. No imperative handle: neither family has an action that cannot be expressed by its value.                      |
| Server rendering without a mismatch                                    | Yes. `useId` for the generated `name`; the thumb's place is arithmetic, so nothing is read from layout during render.                    |
| Every state a consumer may style is in the DOM                         | Yes. `data-pressed`, `data-checked`, `data-disabled`, `data-invalid`, `data-readonly`, plus `data-orientation`, `data-size` and the axes. |
| Each part's props type is the native element's, extended               | Yes. `ComponentPropsWithRef<'div'>`, `<'button'>`, `<'label'>`, `<'input'>`, `<'span'>`.                                                  |

## 9. Angular integration

| Question                                              | Answer                                                                                                                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the signal form                     | Yes. `model<string[]>()` and `model<string \| undefined>()`, with `output()` for the request carrying its reason.                                            |
| Reactive Forms and template forms                    | Yes for `segmented-control`: `ControlValueAccessor`. No for `toggle-group`: it is not a form control, and `docs/component-features.md` §5 says so in as many words. `Validator` is not implemented — validity belongs to `field` and to the native `required` on the radios. |
| Defaults set once                                    | Yes. `provideToggleGroupDefaults()` / `provideSegmentedControlDefaults()` over an injection token.                                                          |
| A template can reach the instance                    | Yes. `exportAs: 'slToggleGroup'` and `'slSegmentedControl'`, and the same on each part directive.                                                          |
| Substituting projected content, kept lazy            | Yes. Each part is a directive on the consumer's own element, so the template is the consumer's throughout; nothing is projected through a slot this family owns. |
| Zoneless and `OnPush`                                | Yes. Signals throughout; no `markForCheck`.                                                                                                                |
| Every listener torn down                             | Yes. `DestroyRef` destroys the roving handle; the DOM listeners belong to `@slotted/core/focus`, which owns its own teardown.                               |
| A static attribute the consumer wrote survives       | Yes. `HostAttributeToken` for `role`, `type` and `aria-label`, read before the host bindings write.                                                         |
| An entry point others depend on stays a single class | Yes. Both are leaf entry points; neither imports the other, and neither imports `@slotted/angular/toolbar`.                                                  |

## 10. Declined, with the family that owns it instead

| Declined                                    | Owner instead     | Why                                                                                                                     |
| ------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Segments that navigate                      | `tabs`            | It already ships `controlElement.withHref` and a `links` scenario. A radio that navigates is not a radio.                |
| A row with panels below it                  | `tabs`            | It owns `tablist`, the panel, `mount` and dismissal.                                                                    |
| Multiple selection in a form                | `checkbox-group`  | The family for a form's multiple choice, and the one `docs/component-features.md` §5 names.                             |
| A dropdown fallback in a narrow container   | `select`          | Swapping a family at a breakpoint is the consumer's decision; the container query here changes this family's own paint. |
| A checkmark drawn on the selected item      | the consumer      | An icon in the item's `icon` slot selected by `[data-pressed]`; two lines, and it does not reserve width on every item. |
| `focusableWhenDisabled`                     | `button`          | The item that needs it is `button`'s, in a `button-group`. A group whose value is its own has nothing to discover.      |
| Five tones                                  | `button`          | The selected colour of a chosen option is the accent pair the token foundation names. A tone axis here would be a second `button`. |
