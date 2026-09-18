# Text Field and Textarea — design

Two families, built together because they answer the same question at two
lengths and share one contract for value, state and field-awareness. The
capability weighing is in
`docs/history/designs/2026-09-02-text-field-and-textarea-capability-inventory.md`;
this document records the decisions that weighing forced.

## Outcome

`text-field` is the single-line control and `textarea` the multi-line one. Both
read the `field` around them, hold a value in either mode, answer three
schemes, three densities and both directions, and reach their own ecosystem —
Reactive Forms in Angular, a context provider and `render` in React.

## One family wraps its control and the other does not

`text-field` renders a frame: a `div` carrying `data-ui="text-field"` with the
`input` inside it. `textarea` does not: the `textarea` element is the root.

The frame exists for one reason, and it is a reason `textarea` does not have.
Eight of the thirteen surveyed implementations put content inside the control's
border — an icon, a unit, a clear button, a reveal button — and no void element
can hold a child. WAI-ARIA settles the shape of that frame as well: the
`textbox` role "MUST limit the children of a textbox to non-interactive,
entirely presentational elements", so the buttons are siblings of the `input`
inside a frame with no role, never children of the control itself.

Nothing surveyed puts an adornment inside a textarea, and a resize handle in
the corner is where one would go. The multi-line control therefore keeps the
simplest anatomy that works, and the two families do not pretend to the same
shape for symmetry's sake.

### Anatomy

| Family       | `data-part` | Element            | Always | For                                                                       |
| ------------ | ----------- | ------------------ | ------ | ------------------------------------------------------------------------- |
| `text-field` | `root`      | `div`              | yes    | The frame: border, ground, radius, focus ring, the three states it paints. |
| `text-field` | `input`     | `input`            | yes    | The control. Holds the value, the identifier and every native attribute.   |
| `text-field` | `start`     | `span`             | no     | An adornment before the value in the reading direction.                    |
| `text-field` | `end`       | `span`             | no     | An adornment after it.                                                     |
| `text-field` | `clear`     | `button`           | no     | Empties the value and returns focus to the control.                        |
| `text-field` | `reveal`    | `button`           | no     | Turns a password from dots into characters and back.                       |
| `textarea`   | `root`      | `textarea`         | yes    | The control and the frame at once.                                         |

`start` and `end` rather than `prefix` and `suffix`: `docs/component-features.md`
§2.4 states the preference, `tag` already ships parts by those names, and
`prefix` is a global RDFa attribute React's own `HTMLAttributes` declares, so
the word could not have been a prop without shadowing one.

## The value

Both families hold the value as `@slotted/core/state` defines it, and neither
of them owns the text.

**The element owns the characters; the family mirrors them.** In uncontrolled
mode nothing is written back to the element: the `input` keeps its own value,
`defaultValue` reaches it as the native attribute, and a native form reset
restores it. The family keeps only what it has to draw — whether the value is
empty, and how long it is — updated from the element's own `input` event. A
family that took ownership of an uncontrolled value would have to re-render on
every keystroke to show the same characters the browser had already painted,
and it would break `form.reset()` while doing it.

**The reason vocabulary is closed and two of its words fit.** A request carries
`keyboard` for an edit made in the control's own editing surface, and `clear`
for the clear button. Typing, pasting, dropping text, an IME commit and an
autofill all arrive as `keyboard`, and the cost is written rather than hidden:
the word names the editing surface, not the input device, and a consumer who
needs the device reads the originating event, which every request carries.

```json
"stateModel": {
  "value": {
    "controlled": "value",
    "uncontrolled": "defaultValue",
    "request": "onValueChange",
    "reasons": ["keyboard", "clear"]
  }
}
```

`text-field` declares a second model for the password toggle:

```json
"revealed": {
  "controlled": "revealed",
  "uncontrolled": "defaultRevealed",
  "request": "onRevealedChange",
  "reasons": ["pointer", "keyboard"]
}
```

A form that hides the password again when the field loses focus needs to own
that bit. Carbon and Shoelace both keep it private, and both leave that form
unwritable.

### The shared vocabulary gains two capabilities

`specs/contract.schema.mjs` has no capability for a value, which is why the
deleted `input` family declared five capabilities and none of them mutable —
the schema could not express the one thing the control does. `value` and
`revealed` join `KNOWN_CAPABILITIES`, and both join `MUTABLE_CAPABILITIES`, so
every future control that holds text is required to declare a state model for
it. The fix lands in its own commit, before either family, as
`docs/build-briefing.md` requires of a shared tool that cannot express the
right contract.

## What the control takes from the field

Unchanged from
`docs/history/designs/2026-08-31-field-aware-controls-design.md`: unset means
ask the field, set means this regardless, `aria-required` never native
`required`, `disabled` and `readonly` native because that is what the words
mean. The control registers itself so the field's development-time warning
stays accurate.

Two amendments the frame forces:

1. **The frame reads the field; the input takes the wiring.** `id`,
   `aria-describedby`, `aria-invalid`, `aria-required`, `disabled` and
   `readonly` land on the `input`, because that is the element the label points
   at and the element a reader lands on. `data-disabled`, `data-invalid` and
   `data-readonly` are mirrored onto the frame, because the frame is what
   paints them. `data-required` is mirrored by neither: the label draws the
   marker and an attribute that paints nothing is an attribute nothing reads.
2. **`size` comes from the field when there is one.** A `size="sm"` field whose
   control is `md` is a field and a control disagreeing about the same row. The
   order is: an explicit prop, then the field, then the family's own defaults,
   then `md`. `variant` and `mono` skip the field, which has no such axis.

## The count is the control's and the place is the field's

`field` already draws a counter in the spare column of its label row, and its
own inventory recorded the number as this wave's work. The control publishes
`{ length, max }` to the field; the field renders the counter itself when a
control has published a count and the page has written none.

This is an **additive change to `field`'s public contract**, raised at the gate:

- React: `FieldContextValue` gains `setCount` and `registerCounter`; `Field`
  renders its own `span[data-part="counter"]` when a count is published and no
  `FieldCounter` was rendered. A page that writes `<FieldCounter>` keeps it.
- Angular: `SlField` gains `setCount()`; its template renders the same element
  under the same condition, with `contentChild(SlFieldCounter)` deciding
  whether the page already wrote one.

The count is `value.length` — UTF-16 code units, so an emoji counts as two.
That is the cost, and it is paid deliberately: `maxLength` counts the same
units, and a counter that disagreed with the limit the browser enforces would
be wrong at exactly the moment it matters. `countMax` defaults to `maxLength`
and may be set alone, which is the soft limit a form can be typed past; the
counter turns `data-invalid` there, which is the state `field` already paints
and which `maxLength` alone can never reach.

## Growing with the content

`autoSize` on `textarea` is CSS `field-sizing: content`, Baseline since June
2026. No height is measured, no line height is cached and nothing runs on the
main thread per keystroke, which is what Angular CDK's `cdkTextareaAutosize`
and Mantine's autosize both do.

`field-sizing: content` shrinkwraps, so the `rows` attribute stops being the
floor. The binding writes two custom properties from `rows` and `maxRows`, and
the stylesheet turns them into `min-block-size` and `max-block-size` in `lh`
units. Past the ceiling the control scrolls rather than pushing the page.

The manual resize handle is withdrawn while `autoSize` is on: a control that
sizes itself and a handle that fixes its size disagree on the next keystroke.
`resize` otherwise defaults to `block`. Horizontal resize is available and not
the default, because a control wider than its field breaks the field's grid.

Where `field-sizing` is unsupported the control keeps the block size `rows`
gives it — a smaller box, not a broken one.

## Escape is not bound

Some user agents clear a `type="search"` input on Escape. This family binds
nothing to the key. A control that swallowed Escape inside a dialog would be a
control a keyboard user cannot leave, and WCAG 2.1.4 exists for the class of
defect single-key shortcuts produce. The clear button is a real, focusable
button, which is the accessible way to offer the same action.

The WebKit search decorations are suppressed when the family draws its own
clear button, so a `type="search"` control never shows two.

## The two buttons inside the frame

Both are real `button` elements with `type="button"`, both sit in the frame
after the input, and both are held to `--slotted-target-min` by the family
rather than by the page.

- **Clear** empties the value with reason `clear`, then focuses the input, so
  the next keystroke lands where the user is looking. It is not rendered when
  the value is empty, nor when the control is disabled or read-only: a button
  that clears a read-only value is a button that lies.
- **Reveal** swaps the input's `type` between `password` and `text` and
  restores the selection afterwards. Its label does not change with its state —
  the APG's rule for a toggle — and `aria-pressed` carries the state, which is
  the same decision `tag`'s toggle recorded.

Both labels come from the family's defaults, so an application translates them
once rather than per instance.

## Ecosystem integration

### React

| Question                                                                    | Answer                                                                                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Controlled and uncontrolled pair plus a request carrying a reason?          | yes — `value` / `defaultValue` / `onValueChange(value, request)` over `createControllable`, and `revealed` / `defaultRevealed` / `onRevealedChange`. |
| Application-wide defaults?                                                  | yes — `TextFieldDefaultsProvider` and `useTextFieldDefaults()`, carrying `size`, `variant`, `mono`, `clearLabel`, `revealLabel`.            |
| Substituting the rendered element of each public part?                      | yes for the frame — `render(props)`. The `input` is fixed: substituting the element that holds the value, the identifier and the wiring would leave the family with nothing to be. |
| Does the consumer's own handler still run?                                  | yes — `onChange`, `onInput`, `onFocus` and `onBlur` are called before the family's own work, never replaced.                                |
| Native element and imperative action?                                       | yes — `ref` reaches the `input`, which already has `focus()`, `select()` and `setSelectionRange()`. No handle is invented for what the element ships. |
| Server render without a hydration mismatch?                                 | yes — `useId` for the standalone identifier, no layout read during render, and `field-sizing` instead of a measured height.                 |
| Every state a consumer may style in the DOM?                                | yes — `data-disabled`, `data-invalid`, `data-readonly` on the frame, plus `data-size`, `data-variant` and `data-mono`.                      |
| Props type is the native element's, extended?                               | yes — `Omit<ComponentPropsWithRef<'input'>, 'size'>`, because `size` on an `input` is the character-count attribute and this family's axis is a type step. The cost is written on the page. |

### Angular

| Question                                                            | Answer                                                                                                                                        |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the form the ecosystem expects?                    | `ControlValueAccessor` is that form for a control in a form, and it ships. The reason-carrying request is `output<ChangeRequest<string>>()`, not `model()`, because a two-way binding has one slot and cannot carry a reason, a previous value or `cancel()` — the asymmetry `tag` recorded. |
| Reactive Forms and template forms?                                  | yes — `ControlValueAccessor` on `SlTextFieldInput` and on `SlTextarea`. No `Validator`: the family owns no validity, and `form` does.           |
| Application-wide defaults?                                          | yes — `TEXT_FIELD_DEFAULTS` with `provideTextFieldDefaults()`, and the same pair for `textarea`.                                                |
| Template reach the instance?                                        | yes — `exportAs` on all five directives, and `inputElement` on the input directive for `focus()` and `select()`.                                |
| Substitute projected content, kept lazy?                            | yes — `ng-content` selecting `[slTextFieldStart]` and `[slTextFieldEnd]`, with the input in the default slot.                                   |
| Correct with zoneless change detection and `OnPush`?                | yes — signals throughout, no `markForCheck`.                                                                                                   |
| Every subscription torn down?                                       | The family subscribes to nothing: host listeners are declared in `host` metadata and die with the directive.                                     |
| Static attributes the consumer wrote survive the host bindings?     | yes — `HostAttributeToken` for `id`, `aria-describedby`, `aria-invalid`, `aria-required`, `disabled` and `readonly`, read before the binding computes, exactly as `SlFieldControl` does. |
| Entry point that others depend on stays a single class?             | yes — `@slotted/angular/text-field` and `@slotted/angular/textarea` both import `@slotted/angular/field` by its published path.                  |

## The contract break against what was deleted

`input` and `textarea` shipped on schema 4 and are deleted in this branch. The
break is recorded here and in `docs/history/build-log.md`, as
`docs/component-features.md` §18 item 12 requires.

| Before                                    | After                                                            | How a consumer moves                                                        |
| ----------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `<Input />` from `@slotted/react`         | `<TextField />`                                                  | Rename the import and the element.                                           |
| `<input slInput />`                       | `<div slTextField><input slTextFieldInput /></div>`              | Add the frame. It is one element, and it is what holds the adornments.       |
| `.slotted-input` in an application's CSS  | `[data-ui='text-field']`                                         | The class was never contract; the attribute is.                              |
| `--slotted-input-*`                       | `--slotted-text-field-*`                                         | Rename the custom properties an application retunes.                          |
| `<Textarea />` with `autoSize`            | `<Textarea />` with `autoSize`, `rows` as the floor, `maxRows`   | No change required; the floor and the ceiling are new and both are optional. |

`slInput` is not kept as an alias. An alias that silently resolves to a control
with no frame would place an adornment nowhere and paint the focus ring on the
wrong box, which is a defect that looks like a stylesheet problem.
