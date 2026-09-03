# Switch Design

## Outcome

A binary setting that takes effect immediately, built on the element the
platform already ships for a binary value, and able to say that the effect has
not landed yet.

The family that shipped before this one was a `button[role=switch]` with two
parts, five capabilities, none of them mutable, and `readOnly` declared
unsupported. The inventory beside it is
`docs/superpowers/specs/2026-09-03-switch-capability-inventory.md`.

## The control is a checkbox with the switch role

`input[type="checkbox"][role="switch"]`, painted with a track and a thumb.

Six of the ten surveyed implementations build on the native checkbox and four
build on a `button`. The four pay for it: Radix renders a hidden bubble input
beside the button so a form can see the value at all, and Primer's button
carries `aria-pressed` rather than a switch state and submits nothing.

What the platform gives, and what would otherwise be written by hand:

| Behaviour                                       | From the element                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| Space toggles                                   | native activation behaviour                                                   |
| The name comes from `<label for>`                | native label association, which also makes the label a second hit target      |
| `name` and `value` are submitted when on        | native form submission; `value` defaults to `on`                              |
| `form.reset()` restores the starting state      | native, against `defaultChecked`                                              |
| `checked` is an IDL attribute a form can read   | native                                                                        |
| A disabled `fieldset` disables it               | native, and `:disabled` matches even though nothing told the control          |
| `:checked`, `:disabled`, `:focus-visible`       | native, so the stylesheet answers the DOM rather than a mirrored attribute    |

WAI-ARIA (ARIA 1.2, `switch` role) allows `role="switch"` on the element and
records `aria-checked` as required — but the APG's own switch pattern states
that an `input[type=checkbox]` uses the HTML `checked` attribute *instead of*
`aria-checked`, so the family writes no `aria-checked`. The role's inherited
properties include `aria-readonly`, `aria-required`, `aria-invalid` and
`aria-busy`, which is every state this family has to express.

`switch` also declares **Children Presentational: True**. That decides the
anatomy on its own: the role goes on the `input`, which is void, and never on
the root — a root carrying `role="switch"` would make the label and the
description beside it presentational and fold their text into the control's
accessible name.

The experimental `switch` attribute — `<input type="checkbox" switch>` — is
Safari-only and alters the control's appearance. It is not used: the family
paints its own track, and an attribute ignored everywhere else buys nothing.

### The contract break, and the move a consumer makes

`docs/component-features.md` §18 asks for the break to be written rather than
avoided.

| Before                                              | After                                                                  |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| `<button data-ui="switch" role="switch">`            | `<span data-ui="switch"><input type="checkbox" role="switch"></span>`   |
| `checked` prop, no request, no uncontrolled pair     | `checked` / `defaultChecked` / `onCheckedChange(checked, request)`      |
| `onClick` to observe a change                        | `onCheckedChange`, or the element's own `onChange`                      |
| nothing submitted with a form                        | `name` and `value` on the control, submitted when on                    |
| `type="button"` default                              | gone; the element is an input                                           |
| Angular `<button slSwitch>`                          | `<span slSwitch><input slSwitchControl type="checkbox"></span>`         |
| Enter toggled the switch                             | Enter is not bound — see the keyboard table                             |

A consumer who styled `button[data-ui='switch']` styles `[data-ui='switch']`
instead; the identifier did not move.

## Anatomy

| Part      | Element                       | Always | What it is                                                                                                                   |
| --------- | ----------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `root`    | `span`, or what `render` gives | yes    | The box. A two-column grid carrying `data-ui="switch"`, the axes and the state attributes. No role. `className` and `style` reach it. |
| `control` | `input[type=checkbox][role=switch]` | yes | The control. Holds the value, the identifier, the name, and every native attribute the consumer wrote. Transparent, over the pill, and stretched to the row so the target is at least 24 pixels. |
| `track`   | `span`                        | yes    | The pill. Paints the ground, the border and the focus ring, and takes no pointer events: they belong to the control above it.  |
| `thumb`   | `span`                        | yes    | The part that moves, and the ground the mark is drawn on.                                                                     |
| `label`   | `label`                       | no     | The label, pointing at the control through `for`. It carries the slack that makes one line a WCAG 2.2 target.                 |
| `description` | `p`, or the consumer's element | no  | Help text under the label and outside it, reaching the control through `aria-describedby`.                                    |

The control is over the pill and stretched to the row rather than covering the
whole box: the label toggles the switch through `for`, and the description must
not toggle anything at all.

## The label is the switch's own, and so is its description

The first draft of this design gave the label to `field` and gave the switch a
status word instead. The reviewer rejected it, and `checkbox` — settled one
item earlier in the same wave — had already answered the question the other
way: `root`, `label`, `control`, `indicator`, `description`, with a
`labelPlacement` axis whose `start` value puts the control at the end of the
row.

A binary control names itself. The label is a real `label` pointing at the
control through `for`, so it names the switch and doubles its target; the
description sits under it and outside it, because inside it would join the
accessible name and a paragraph of help text that toggles a setting when it is
clicked is a paragraph nobody reads. The metrics are `checkbox`'s metrics —
the slack that makes one line of label a WCAG 2.2 target, the lift that puts
the control on the label's first line, the gap from the label to the
description — because two binary controls in one list have to line up, and
deriving both from the same numbers is the only way to guarantee it.

The status word that draft carried is withdrawn with it. Primer and Carbon
draw an "On"/"Off" word because they have no description to draw; here the
mark carries the state non-chromatically and the label and description carry
the meaning, and a third text saying "On" beside a labelled control is the same
fact three times.

The identifier follows from the same decision: the switch takes the field's
identifier when there is a field and the consumer wrote none. A field writes
`for` at its own label whether or not the control it holds draws one, so a
switch that kept its own identifier inside a field would leave that label
pointing at nothing. With both labels present the control is named by both,
which is a name said at two scales rather than a name missing. `checkbox`
generates its own identifier and leaves the field's label orphaned; that
difference is raised at the gate rather than copied.

## State

One mutable value.

```json
"checked": {
  "controlled": "checked",
  "uncontrolled": "defaultChecked",
  "request": "onCheckedChange",
  "reasons": ["pointer", "keyboard", "programmatic"]
}
```

The request is raised on `click`, not on `change`, because `click` is the one
event that fires for a pointer press, for Space, and for `element.click()`, and
because it is cancellable before the element moves. The reason is read from the
event:

| Event                                | Reason         |
| ------------------------------------ | -------------- |
| `detail > 0`                         | `pointer`      |
| `detail === 0` and `isTrusted`       | `keyboard`     |
| `detail === 0` and not `isTrusted`   | `programmatic` |

`preventDefault()` is what refuses a move, and it is called in four cases: the
consumer cancelled the request, the control is read-only, the control is
loading, or the consumer owns the value. In the last case the element must not
move on its own — the consumer's next value moves it — and preventing the
default is what keeps the DOM from flickering through a state nobody asked for.

The uncontrolled mode leaves the element alone. `defaultChecked` reaches it as
the native attribute, `form.reset()` restores it, and the family keeps only a
mirror of what the element shows so the track and the mark have something to
read. That is the rule `text-field` established for the value
it does not own.

## `readOnly` is implemented, not declared

The native `readonly` attribute has no effect on a checkbox — the HTML
specification does not apply it to the checkbox state — so a family that wrote
it would ship a read-only switch that toggles.

`readOnly` therefore means: `aria-readonly="true"`, the click's default
prevented, focus kept, the value still submitted, and a ground that says "not
yours to change" without the muted ink of a disabled control. It is the
capability that answers Fluent's `disabledFocusable` and Material's
`disabledInteractive` — a control a reader can reach and be told about — and it
answers it with one word instead of two ways to refuse an interaction.

## `loading`

A switch's defining property is that it takes effect immediately, which in a
real product means a write that can be in flight.

- Activation is refused while loading, at the click, so a second toggle never
  queues behind the first.
- The geometry does not change: the thumb stays where it is and the track keeps
  its size, because a control that resizes while saving moves the row under the
  pointer.
- The thumb draws a rotating arc from its own border. It is the only motion in
  the family that loops, and it stops under `prefers-reduced-motion` rather
  than being shortened, which is what `docs/token-foundation.md` requires.
- `aria-busy="true"` on the control.
- A visually hidden `role="status"` inside the root carries the pending label,
  and it is written **two seconds** after loading begins rather than
  immediately. A save that returns in 200 milliseconds should say nothing at
  all; Primer measured the same number and this family takes it. The delay is
  a constant of the family, not a prop: an application that needs a different
  one sets `loadingLabel` to something a reader can wait for.

`progress-indicator` (wave 2) is not built. When it is, the arc is a candidate
to be replaced by it; the arc is geometry rather than an icon, so no glyph
token is invented for it in the meantime.

## Axes

| Axis              | Values                        | Default | Resolution                        |
| ----------------- | ----------------------------- | ------- | --------------------------------- |
| `size`            | `sm`, `md`, `lg`              | `md`    | prop → field → defaults → `md`    |
| `indicator`       | `mark`, `none`                | `mark`  | prop → defaults → `mark`          |
| `labelPlacement`  | `end`, `start`                | `end`   | prop → defaults → `end`           |

`indicator="mark"` draws `--slotted-icon-check` in the thumb when the switch is
on and nothing when it is off. `docs/component-features.md` requires the state
to be perceptible beyond colour *and* position, and the mark is what supplies
it; `indicator="none"` is for the case where the label already says the state,
and the reference page says so where the axis is documented.

`labelPlacement="start"` is the settings row: the label's column is `1fr`, so a
column of rows ends with every pill at the same distance from the edge however
long the labels are. `max-content` was the alternative and it is the one
`checkbox` rejected, for the same reason.

## Geometry

Everything is derived from the control scales, which are the ones the theme
restates per density.

| Measurement    | Value                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| Thumb          | `--slotted-control-icon-size-{size}` — 14, 16, 18 at comfortable          |
| Track height   | thumb + twice `--slotted-space-1`                                          |
| Track width    | `calc(track height * 1.8)`, a proportion of the box rather than a sixth scale |
| Travel         | `track width - track height`, expressed as `inset-inline-start`            |
| Row minimum    | `--slotted-target-min` on the row, and on the label through its slack      |
| Radius         | `--slotted-radius-full` on both track and thumb                            |

The thumb travels on `inset-inline-start` rather than on a translation, so a
right-to-left document mirrors it with no direction-specific rule at all.

## Both integration tables

### React

| Question                                                 | Answer                                                                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair plus a reasoned request | `checked` / `defaultChecked` / `onCheckedChange(checked, request)`, over `createControllable` from `@slotted/core/state`.       |
| Application-wide defaults                                | `SwitchDefaultsProvider` and `useSwitchDefaults()`, carrying `size`, `indicator`, `labelPlacement`, `loadingLabel`. |
| Substituting the rendered element of each public part    | `render` on the root. The control, the track and the thumb are fixed: the first holds the value and the identifier, and the other two are the family's own paint. |
| The consumer's own handler still runs                    | `onClick` and `onChange` are called first and always, before the family decides anything.                                       |
| Reaching the native element and the imperative action    | `ref` reaches the `input`. `click()` is the platform's toggle and reports itself as `programmatic`; no handle is invented.       |
| Server rendering without a mismatch                      | `useId` for the status region's identifier; nothing is measured during render.                                                  |
| Every state a consumer may style is in the DOM           | `data-checked`, `data-disabled`, `data-readonly`, `data-invalid`, `data-loading` on the root.                                   |
| Props types are the native element's, extended           | `ComponentPropsWithRef<'input'>`, with `size` omitted and redeclared as the family's axis.                                      |

### Angular

| Question                                             | Answer                                                                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the shape the ecosystem expects     | `checked` input plus `checkedChange` output carrying the request. `ControlValueAccessor` is the form's route, and it is the primary one.      |
| Reactive Forms and template forms                    | `SlSwitchControl` provides `NG_VALUE_ACCESSOR`, so `formControlName` sits on the `input` where the consumer expects it. Validity stays the form's: `Validators.requiredTrue` is one line and the control never validates itself. |
| Application-wide defaults                            | `SWITCH_DEFAULTS` with `provideSwitchDefaults()`.                                                                                            |
| Reaching the instance from a template                | `exportAs: 'slSwitch'` and `exportAs: 'slSwitchControl'`; the latter exposes `inputElement` and `toggle()`.                                   |
| Substituting projected content, kept lazy            | The root is a directive-shaped component on the consumer's own element and the control is the consumer's own `input`, which is a stronger substitution than a slot: both elements are written by the consumer. |
| Zoneless and `OnPush`                                | Signals throughout; `ChangeDetectionStrategy.OnPush`; no `markForCheck`.                                                                      |
| Subscriptions torn down                              | No subscriptions: the only listeners are host bindings, which Angular removes with the directive.                                             |
| A static attribute the consumer wrote survives       | `HostAttributeToken` for `id`, `aria-describedby`, `aria-invalid`, `aria-required` and `aria-label`, read before the host binding computes.   |
| An entry point stays a single class                  | `@slotted/angular/switch` imports `SlField` through `@slotted/angular/field`, never through a relative path — the rule the field-aware design records. |

The two bindings do not have the same shape, and are not levelled to one:
Angular pays an element for the root because a directive cannot create a box
around its own host, and React pays none. React ships `render`; Angular ships
`ControlValueAccessor` and DI defaults. Both ship the same contract.

## APG checklist

Source: <https://www.w3.org/WAI/ARIA/apg/patterns/switch/>, Switch Pattern, read
2026-09-03.

| Requirement                                                             | Where it is answered                                                                  |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Space changes the state                                                 | Native checkbox activation. Nothing intercepts the key.                                |
| Enter (optional) changes the state                                      | Deliberate departure: not bound. Inside a form Enter submits, and a switch that stole it would break the form for the sake of an optional key. Cost: a reader who expects Enter presses Space. |
| Role `switch`                                                            | `role="switch"` on the `input`.                                                        |
| Accessible label, from content, `aria-labelledby` or `aria-label`       | The field's `<label for>`, or either attribute passed through.                          |
| `aria-checked` true / false                                             | Deliberately absent: the APG states that a checkbox-based switch uses the HTML `checked` attribute instead. |
| A grouped set is a `group` with `aria-labelledby`, or a `fieldset`      | `field-group`, which absorbed `fieldset` in wave 3.                                     |
| Descriptive text uses `aria-describedby`                                | The field's description and error, merged after any value the consumer wrote.           |
| The label does not change with the state                                | The label is the consumer's own text and never moves; the state is the mark and the thumb's position, and the pending label reaches a live region rather than the name. |
