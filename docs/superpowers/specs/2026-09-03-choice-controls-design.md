# Choice Controls Design — checkbox, checkbox-group, radio-group

## Outcome

Where the check and the dot are drawn, who owns the choice, and what a group is
for. Written once, for the three families wave 3 item 4 covers, because all
three answer the same three questions and a different answer in each would be
three answers to one question.

## 1. Surveyed

| Implementation | Read at | Calls it |
| --- | --- | --- |
| WAI-ARIA APG, Checkbox Pattern | <https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/> and its two examples | Checkbox (dual-state), Checkbox (mixed-state) |
| WAI-ARIA APG, Radio Group Pattern | <https://www.w3.org/WAI/ARIA/apg/patterns/radio/> and the roving-tabindex example | Radio Group |
| HTML Standard and MDN | <https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio)>, <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio>, `.../input/checkbox` | `input type=checkbox`, `input type=radio` |
| Radix Primitives | <https://www.radix-ui.com/primitives/docs/components/checkbox>, `.../radio-group` | `Checkbox`, `RadioGroup` |
| Base UI | <https://base-ui.com/react/components/checkbox>, `.../checkbox-group`, `.../radio` | `Checkbox`, `CheckboxGroup`, `Radio` + `RadioGroup` |
| React Aria / React Spectrum | <https://react-spectrum.adobe.com/react-aria/Checkbox.html>, `.../CheckboxGroup.html`, `.../RadioGroup.html`, <https://react-spectrum.adobe.com/react-spectrum/RadioGroup.html> | `Checkbox`, `CheckboxGroup`, `RadioGroup` |
| Ark UI (Zag) | <https://ark-ui.com/docs/components/checkbox>, `.../radio-group` | `Checkbox`, `RadioGroup` |
| Angular Material | <https://raw.githubusercontent.com/angular/components/main/src/material/checkbox/checkbox.ts>, `.../radio/radio.ts` | `MatCheckbox`, `MatRadioGroup` + `MatRadioButton` |
| Carbon | <https://carbondesignsystem.com/components/checkbox/usage/>, `.../radio-button/usage/`, `.../tile/accessibility/` | `Checkbox`, `RadioButtonGroup`, selectable `Tile` |
| Primer | <https://primer.style/components/checkbox>, `.../radio` | `Checkbox`, `Radio` |
| PatternFly | <https://www.patternfly.org/components/forms/radio> | `Radio` |
| Mantine | <https://mantine.dev/core/checkbox/>, `.../radio/` | `Checkbox`, `Checkbox.Group`, `Checkbox.Card`, `Radio`, `Radio.Group`, `Radio.Card` |
| Polaris | <https://polaris-react.shopify.com/components/selection-and-input/choice-list> | `ChoiceList` (one family for both) |
| shadcn/ui | <https://ui.shadcn.com/docs/components/radio-group> | `RadioGroup` |
| Chakra UI v3 | <https://chakra-ui.com/docs/components/checkbox-card> | `CheckboxCard`, with parts `root`/`control`/`label`/`description`/`indicator`/`content`/`addon` and axes `variant`, `size`, `align`, `orientation` |
| Cloudscape | <https://cloudscape.design/components/tiles/>, <https://raw.githubusercontent.com/cloudscape-design/components/main/src/tiles/interfaces.ts> | `Tiles` — a radio group whose items carry a label, a description and an image |
| Salesforce Lightning | <https://www.lightningdesignsystem.com/components/visual-picker/> | `Visual Picker` |
| PatternFly | <https://www.patternfly.org/components/card/>, <https://raw.githubusercontent.com/patternfly/patternfly-react/main/packages/react-core/src/components/Card/CardHeader.tsx> | `Card` with `isSelectable` and `selectableActions`, which renders a `SelectableCardInput` |

All read 2026-09-03.

## 2. Table stakes

| Capability | Who ships it | Verdict | Reason |
| --- | --- | --- | --- |
| Checked, controlled and uncontrolled | Radix, Base UI, React Aria, Ark, Material, Mantine, Primer | adopt | `checked` / `defaultChecked` / `onCheckedChange`, reasons `pointer`, `keyboard`, `programmatic`. |
| Indeterminate as an explicit third visual state | Radix (`checked="indeterminate"`), Base UI (`indeterminate`), Material, Mantine, Primer, APG mixed-state | adapt | A separate `indeterminate` prop, not a third value of `checked`: the value submitted stays boolean, which is what `docs/component-features.md` §6 requires. |
| Group of checkboxes with an array value | Base UI `CheckboxGroup`, React Aria `CheckboxGroup`, Mantine `Checkbox.Group`, Ark | adopt | Own family `checkbox-group`, `value: string[]`, capability `selection`. |
| Parent checkbox deriving from its children | Base UI (`parent` + `allValues`), Ark (`CheckboxGroup` + root checkbox), APG mixed-state example | adopt | `allValues` on the group and `parent` on one checkbox. Toggling it checks or clears all; it reports `indeterminate` in between. |
| Single-selection group with exclusive value | every surveyed implementation | adopt | Family `radio-group`, capability `selection`, reasons `pointer`, `keyboard`, `programmatic`. |
| Arrow keys move focus and selection, wrapping | APG, Radix, Base UI, React Aria, Ark, Material, Carbon | adopt | Delegated to the platform: native radios sharing a `name` implement exactly this table. See §5. |
| Only one item of the group in the tab order | APG, Radix (roving tabindex), React Aria, Material, Carbon | adopt | Platform-supplied for the same reason. |
| Orientation, horizontal and vertical | Radix, React Spectrum, Carbon, Material, `field-group` | adopt | `orientation` axis on both groups, `aria-orientation` when the root owns the `radiogroup` role. |
| Label position before or after the control | Material (`labelPosition`), Mantine (`labelPosition`), PatternFly (reversed) | adapt | `labelPlacement: 'end' \| 'start'`, in this library's `start`/`end` vocabulary. |
| Per-item description | PatternFly (`description`), Carbon (helper text), Base UI, Mantine, Polaris (`helpText`) | adopt | `description` part on `checkbox` and on the radio `item`, wired by `aria-describedby`. |
| Disabled, per item and for the whole group | every surveyed implementation | adopt | Native `disabled`, and the group propagates it. |
| Invalid / error state on the group | React Aria, Carbon, Mantine, Polaris | adopt | `aria-invalid` plus `data-invalid`; the message is `inline-message` through `field-group`, which already owns it. |
| Required | React Aria, Radix, Base UI, Material, Mantine | adapt | `aria-required` only, never the native `required`, per `2026-08-31-field-aware-controls-design.md`. |
| Read-only group | Base UI (`readOnly` on `RadioGroup` and `CheckboxGroup`), Carbon (read-only group state) | adopt | The platform has no `readonly` for these two input types, so it is enforced in the binding: focusable, announced `aria-readonly`, and every request refused. |
| Form submission by `name` and `value` | HTML, Radix, Base UI, React Aria, Material, Primer | adopt | The native element is the control, so `name`, `value`, `form` and `form.reset()` are the platform's. |
| Size steps | Mantine, Primer, Carbon (2), Material (via density) | adopt | `sm` / `md` / `lg`, resolved prop → group → field → provider → `md`, as `text-field` resolves it. |
| A choice drawn as a framed surface | Inside the checkbox family: Mantine (`Checkbox.Card` + `Checkbox.Indicator`), Chakra v3 (`CheckboxCard`), React Aria (`CheckboxButton`, with `data-selected`, `data-pressed`, `data-readonly`, `data-invalid`). In a family of its own: Carbon (`SelectableTile`), Cloudscape (`Tiles`), Salesforce (`Visual Picker`). In the card family: PatternFly, Fluent, Spectrum. | adopt | Axis `variant: 'plain' \| 'tile'` on `checkbox` and on `radio-group`. Three surveyed implementations put it in the checkbox family, which makes it table stakes there. See §10 for the reversal and its reasons. |
| Per-instance accent colour | Mantine (`color`), Carbon (none), Material (`color`) | decline | `docs/component-features.md` §2.4 refuses arbitrary colour in the agnostic contract. The accent is the theme's, and a theme retunes it once through `--slotted-checkbox-*`. |
| Application-wide defaults | Material (`MAT_CHECKBOX_DEFAULT_OPTIONS`), Mantine (theme), Carbon (none) | adopt | A React provider and an Angular token per family, as `text-field` and `field` ship. |

## 3. Differentiators

| Capability | Where it comes from |
| --- | --- |
| The selection count published to the surrounding `field`, drawn in the label row | Nothing surveyed does it. This library already owns the mechanism: `text-field` publishes a character count to `field`, which draws it in the spare column of the label row. `checkbox-group` publishes `{selected, total}` through the same channel, so "2/5" sits where a reader already looks for a count. |
| Three schemes, including `high-contrast`, and a `forced-colors` answer for the mark | The mark is a mask over a background colour, and a mask is the one thing the theme's `forced-colors` block cannot reach. The family writes that rule itself, which the briefing allows exactly here. |
| Three densities changing the box, the type and the gap together | The box size is a component-layer token restated per density, the way `avatar` restated its own. Nothing surveyed changes a checkbox with density; Material changes only spacing. |
| The label owning the whole row as a target, with the box optically aligned to the first line | Surveyed implementations centre the box against a multi-line label (Material, Mantine) or leave the target at the box (Carbon). Neither holds when the label wraps to three lines. |
| Two first-class bindings | Reactive Forms with `ControlValueAccessor` and `Validator` on the Angular side, `render` and native prop pass-through on the React side, from one contract. |

## 4. Gaps

| Gap | What this family does |
| --- | --- |
| A wrapped label leaves the box floating in the middle of the text block | The box is aligned to the first line box, not to the element, using the control step's own line height. |
| A label that is one unbroken token — a URL, a hash, an identifier | `overflow-wrap: anywhere` on the label, so the token breaks instead of taking the page's horizontal scrollbar. |
| A group of a hundred items | The families hold no collection engine and render what the consumer renders. Nothing here is quadratic: no roving-tabindex bookkeeping, no per-item listener beyond the element's own. |
| Read-only has no platform answer for these two input types | Enforced in the binding, and announced with `aria-readonly` rather than by looking disabled, which `docs/component-features.md` §2.5 requires. |
| A radio group with nothing checked, then Tab | The platform's rule, unmodified: focus lands on the first radio, and nothing is selected until Space or an arrow key. Carbon documents the same behaviour. |
| An indeterminate parent whose children are all disabled | The parent reports `indeterminate` and its request changes nothing, so it is disabled with the set it commands. |
| Long translated strings and RTL | Logical properties throughout; the box swaps sides with the writing mode and the mark's geometry is symmetric, so nothing has to be mirrored. |

## 5. The pattern, item by item

### Checkbox — <https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/>

| Item | Required | Where it is answered |
| --- | --- | --- |
| Role `checkbox` | yes | Native `input[type=checkbox]`. |
| Accessible name from the label | yes | A `label` part naming the control through `for`, with an identifier the control generates when the consumer writes none. |
| `aria-checked` true / false / mixed | yes | Native `checked`, and the `indeterminate` IDL property for `mixed`. |
| `Space` toggles | yes | Platform. |
| `Enter` does nothing | yes | Platform: `Enter` submits the form instead. |
| Tri-state cycle order | optional | The parent checkbox goes checked → unchecked → checked; `mixed` is derived from the children, never entered by a keystroke, which is what the APG mixed-state example does. |
| `aria-controls` on a mixed checkbox | optional in the example | Declined: the parent's children are the group's items and the group already owns them. Writing IDREFS for every child duplicates a relationship the DOM already states, and it goes stale the moment the list changes. |
| Disabled behaviour | yes | Native `disabled`; the element leaves the tab order and the form. |

### Radio group — <https://www.w3.org/WAI/ARIA/apg/patterns/radio/>

| Key | Effect and focus destination | Answered by |
| --- | --- | --- |
| `Tab` into the group | focus the checked radio, or the first radio when none is checked | Platform, for radios sharing a `name`. |
| `Tab` out | leave the group entirely | Platform. |
| `Space` | check the focused radio if it is not checked | Platform. |
| `Right`, `Down` | move focus to the next radio, uncheck the previous, check the new one; wrap at the end | Platform. |
| `Left`, `Up` | the same, backwards; wrap at the start | Platform. |
| Disabled item | skipped by the arrow keys | Platform. |
| Role `radiogroup` and its name | required | §6. |
| `aria-orientation` | when the group is not the default orientation | On the root, whenever the root owns the role. |
| Toolbar variant of the keyboard table | not applicable | This library's `toolbar` does not nest a radio group; when it does, the departure is that family's to record. |

The whole keyboard table is the platform's, and that is the reason the native
element is the control. A roving `tabindex` implemented in the binding would
reimplement, in two frameworks, behaviour the browser already ships and already
localises — including the arrow directions in a right-to-left document.

## 6. Decisions

### The check and the dot are drawn on a sibling, not on the input

The input is the control: `appearance: none`, and it draws the box, the border,
the fill and the focus ring. The mark is a `<span data-part="indicator">` in the
same grid cell, `pointer-events: none`, carrying `mask-image` from the glyph
scale — `--slotted-icon-check`, `--slotted-icon-minus`, `--slotted-icon-dot`.

The mark cannot be a pseudo-element of the input: Firefox renders neither
`::before` nor `::after` on `<input>`. It cannot be the input's own
`background-image` either, because a glyph token is authored black for masking
and a baked-in colour cannot answer three schemes. It cannot be a mask on the
input itself, because a mask clips the element it is set on and would take the
border and the fill with it.

That is one element more than a pseudo-element would cost and it is the same
count every surveyed implementation pays — Ark's `Checkbox.Indicator`, Radix's,
Material's, Mantine's.

### The three families

`checkbox` is one control and is usable alone. `checkbox-group` holds the array
and the parent. `radio-group` holds the value and its items, and a radio is a
`data-part="item"` of it rather than a family, because a radio outside a group
is not a control anybody can use.

The split follows the one this repository already made three times —
`avatar` / `avatar-group`, `button` / `button-group`, `field` / `field-group` —
and it is what `specs/contract.schema.mjs` forces: one `data-ui` per family, and
every member's root part carrying it. Two members with a `root` part in one
family would be one selector for two different boxes.

`docs/build-order.md` wave 3 item 4 is updated from `checkbox radio-group` to
name the third family, in the same commit.

### The root is a `div`; the `label` names the control through `for`

```html
<div data-ui="checkbox" data-part="root" data-size="md">
  <input data-part="control" type="checkbox" id="…" />
  <span data-part="indicator"></span>
  <label data-part="label" for="…">Aceito os termos</label>
  <p data-part="description" id="…">Enviaremos o recibo por e-mail.</p>
</div>
```

The root is a two-column grid: the box in the first column, the label and the
description in the second. That is why the label is the control's sibling rather
than its wrapper — a wrapping label would be one grid item holding both columns,
and the description could no longer align under the label text. The control
generates its own identifier when the consumer writes none, so `for` always
resolves.

The gap between the box and the text is the label's own `padding-inline-start`,
so the target runs from the box to the end of the text — the enlarged target
`docs/component-features.md` §6 asks for — and the label carries
`min-block-size: var(--slotted-target-min)`, because at the `dense`/`sm` step the
box alone is twelve pixels.

The description is outside the label on purpose: inside, it would join the
accessible name, and clicking a paragraph of help text would toggle the value.


### The group's role is conditional, and the condition is the field group

A `field-group` renders `<fieldset>` with a `<legend>`, which is already a named
group to assistive technology. A `role="radiogroup"` inside it, named by the
same legend, announces the group twice.

So the root of `radio-group` carries `role="radiogroup"` only when it owns its
own name — a `field-group` around it removes the role and keeps the semantics
where the legend already put them. `checkbox-group` follows the same rule with
`role="group"`. A consumer's explicit `role` wins over both.

### These two controls never take the field's `id`

`2026-08-31-field-aware-controls-design.md` gives a control the field's `id`
always, so the field's `<label for>` names it. A checkbox and a radio own their
own label, and a second label naming the same control names it twice.

They read `size`, `disabled`, `readOnly`, `invalid`, `required` and
`aria-describedby` from the field or field group, and register themselves so the
field's development-time warning stays accurate. They take neither its `id` nor
its `labelPlacement`: the field's axis answers where a field's label sits
relative to its control, and a checkbox's label is its own.

### `readOnly` is enforced, because the platform has none

`input[type=checkbox]` and `input[type=radio]` ignore `readonly`. The binding
refuses the change and writes `aria-readonly="true"` and `data-readonly`. The
control keeps its tab stop, its focus ring and its full contrast: a read-only
value is real, and `docs/component-features.md` §2.5 refuses to let it look
disabled.

### A radio group without a `name` still groups

Native grouping is by `name` within the form owner, so a group whose consumer
wrote no `name` generates one from `useId` / `_IdGenerator`. The cost is that an
unnamed group submits under a generated key when it sits in a form; the benefit
is the entire APG keyboard table, in both bindings, from the platform. React
Aria makes the same trade.

### Motion

The mark scales and fades in on `--slotted-duration-short` with
`--slotted-easing-standard`, and the box's fill and border transition with it.
The eye has to follow the mark appearing inside a box that was empty; that is
the transition rule's first side. Nothing loops, so there is no reduced-motion
rule of the family's own beyond the scale's.

## 7. Integration

### React

| Question | Answer |
| --- | --- |
| Controlled and uncontrolled pair plus a request carrying a reason | `checked` / `defaultChecked` / `onCheckedChange(checked, request)` on `checkbox`; `value` / `defaultValue` / `onValueChange(value, request)` on both groups. |
| Application defaults once | `CheckboxDefaultsProvider`, `CheckboxGroupDefaultsProvider`, `RadioGroupDefaultsProvider` and the hooks that read them. |
| Substitute the rendered element of each part | `render` on the root of each family and on the radio `item`. |
| The consumer's handler still runs | `onChange` is called before the request is built, in all three. |
| Reach the native element and the imperative action | `ref` reaches the `input` on `checkbox` and the root on the groups; there is no imperative action these families cannot express declaratively, so no handle is invented. |
| Server rendering | `useId` for the generated `name` and for the description id; no layout read during render. |
| Every state a consumer may style in the DOM | `data-checked`, `data-indeterminate`, `data-disabled`, `data-invalid`, `data-readonly`, `data-required` where painted. |
| Props type is the native element's, extended | `ComponentPropsWithRef<'input'>` on `checkbox`, `ComponentPropsWithRef<'div'>` on the groups. |

### Angular

| Question | Answer |
| --- | --- |
| Two-way value in the ecosystem's shape | `model()` is refused for the same reason `text-field` refused it — a two-way binding has one slot and cannot carry the reason, the previous value or `cancel()`. `input()` plus `output<ChangeRequest<T>>()`. |
| Reactive Forms and template forms | `ControlValueAccessor` on `SlCheckbox`, `SlCheckboxGroup` and `SlRadioGroup`; `Validator` on the two groups, which own `required` over a set the individual control cannot see. |
| Application defaults once | `provideCheckboxDefaults()`, `provideCheckboxGroupDefaults()`, `provideRadioGroupDefaults()` and their tokens. |
| A template reaching the instance | `exportAs` on every directive and component. |
| Substituting projected content, kept lazy | `ng-content` slots for the label and the description. |
| Zoneless and `OnPush` | Signals throughout; no `markForCheck`. |
| Teardown | No manual subscription; host listeners only. |
| A static attribute the consumer wrote survives | `HostAttributeToken` for `id`, `name`, `aria-describedby`, `aria-invalid`, `aria-required`, `role`. |
| One class per entry point | `@slotted/angular/checkbox`, `/checkbox-group`, `/radio-group`, each importing the others only through its published path. |

## 8. The box reads a scale that already exists

The box of a checkbox is a square whose side is smaller than a control's height
and larger than nothing: `--slotted-control-height-md` is 34px and the box is
16. The scale that already holds that square is `--slotted-control-icon-size-*`
— 14 / 16 / 18 at comfortable, restated by every density — and 16px at the `md`
step is the box Radix, Carbon and Primer all draw.

So the component layer gains nothing. A new `--slotted-choice-size-*` scale
would restate a scale that exists, which is the one thing Avatar's bar for that
layer forbids. The box is `var(--slotted-checkbox-size, var(--slotted-control-icon-size-md))`:
a public override hook with a foundation fallback, which is what every other
family's tokens file holds, and no change to
`packages/tokens/src/contract.json` or the theme.

The radio draws its dot in a box of the same side, from the same token, for the
same reason the two families share this document.

What the icon scale cannot answer is the target. At `dense`/`sm` the box is 12px,
below WCAG 2.2's 24 × 24. The label part therefore carries
`min-block-size: var(--slotted-target-min)`, and the gap between box and text is
its own padding, so the target runs from the box to the end of the text rather
than stopping at the box — the correction
`docs/token-foundation.md` says is the family's to make and not the theme's.

## 9. Self-assessment

Eleven dimensions of `.claude/skills/component/references/rubric.md`, each with
the one change that would most improve it and whether it was made.

| Dimension | Assessment | The one change, and whether it was made |
| --- | --- | --- |
| **Icons** | The check, the dash and the dot are `mask-image` from `--slotted-icon-check`, `--slotted-icon-minus` and `--slotted-icon-dot`; no `content` string appears in either stylesheet, and the style tests assert that. The marks are symmetric, so nothing mirrors in RTL, and the `forced-colors` block restates mark and ground in system colours because both are `background-color` and would otherwise collapse into each other. | Move the check and the dash to one custom property so the two states are one declaration apart. **Made** — `--_glyph` is repointed rather than the rule duplicated. |
| **Motion** | The mark scales from 0.6 and fades in on `--slotted-control-transition-duration`; the box's ground and border transition with it. Nothing loops, so no reduced-motion rule of the family's own is needed beyond the scale's collapse. Every state pair: unchecked↔checked and unchecked↔mixed transition, because the eye has to follow a mark appearing in an empty box; hover, press and focus transition on colour only; disabled and read-only do not, because they are not movements a reader is following. | Delay the mark behind the fill so the two read as one gesture rather than as two. **Not made** — the only available delay is `--slotted-duration-instant` at 1ms, and inventing a delay token for one family would put a scale in the theme for a nicety. |
| **Responsiveness** | Read at 240, 420 and 720. The families declare no `container-type`, and that is the decision rather than an omission: nothing here reflows on its own inline size. A horizontal group wraps, which is flex rather than a query, and the narrow captures show every scene holding at 240 with labels wrapping and boxes staying on the first line. | Turn a horizontal group into a stack below a container width. **Not made** — `flex-wrap` already produces exactly that, and a query would be a second mechanism for one outcome. |
| **Refinement** | Read light, dark and high-contrast at 420, light at 240, dense, RTL, and four focus captures. Corrections made by looking: `start` placement no longer breaks a column's alignment; read-only has a ground a reader can see; the description sits one step further from its label; a label inside a disabled `fieldset` now dims. The focus ring sits at `--slotted-focus-ring-offset` from a border that does not move, and no state changes layout. | The focus ring is the same hue as a checked box's fill, so ring and box read as one bullseye at 2px offset. **Not made** — a focus colour that differs from the accent is a foundation decision affecting every family, and this family is not the place to take it. Raised at the gate. |
| **Tokens** | Every value is a `--slotted-<family>-*` override hook falling back to a foundation token; `fallbacks.test.mjs` and `tokens.test.mjs` pass. The component layer is unchanged: a `--slotted-choice-size-*` scale was designed and refused because `--slotted-control-icon-size-*` already holds that square. Two literals carry their reason in the contracts — the mark inset, and the same ratio for the dot. | Add a component-layer size scale so the box can be retuned without touching the glyph scale. **Not made, deliberately** — it would restate a scale that exists, which is the one thing that layer's bar forbids; `--slotted-checkbox-size` is the retuning point and it costs nothing. |
| **Patterns** | Both APG patterns transcribed key by key in §5 above, with the source URLs and the focus destination for every row, and each item marked as platform-supplied. The two deliberate departures are written with their cost: no `aria-controls` on the parent box, and a generated `name` for an unnamed group. | Check the toolbar variant of the radio keyboard table. **Not made** — `toolbar` does not nest a radio group today, and the row is recorded as not applicable rather than silently dropped. |
| **Accessibility** | Name, role, state, keyboard, focus, forced colors and target are answered in the seven sentences on each reference page. Read-only is enforced and announced; invalid is never colour alone; the target is the label row because the box alone is under 24 pixels at the dense step. | Verify with a real screen reader. **Not made** — it cannot be done on this machine, and it is raised at the gate as the thing that remains to be seen. |
| **Native API** | React is function components with `render`, `ref`, `useId` and native props through to the `input`; Angular is standalone components with `input()`/`output()`, `host` metadata, `HostAttributeToken` for four written attributes, `exportAs`, and `ControlValueAccessor` plus `Validator` where a form is where the control belongs. Neither imitates the other, and the asymmetry is recorded: Angular pays one element for each root and gets Reactive Forms; React pays none and gets `render`. | Give the React side a `Validator` equivalent. **Not made** — React has no forms integration to hook it to, and inventing one would be this family answering a question the library has not asked. |
| **Capability** | Every table-stakes row in §2 is `adopt`, `adapt`, or a `decline` naming the family that owns it. Both mutable values have a controlled/uncontrolled pair, a request carrying a reason and a row in the state matrix. The keyboard table is checked key by key. The families ship a parent box, per-item descriptions, `readOnly` with no platform support, a conditional role, and a selection count nothing surveyed publishes. | Ship a framed presentation of a choice. **Made** — `variant: 'plain' \| 'tile'` on `checkbox` and on `radio-group`, after the survey was reopened and the earlier `defer to card` was found wrong on the facts. §10 records what changed and why. |
| **Ecosystem integration** | Both tables in `frameworks.md` answered line by line in §7. Angular reaches `ControlValueAccessor`, `Validator`, an injection token with a `provideX()`, `exportAs`, named `ng-content` slots, `HostAttributeToken`, signals throughout and one class per entry point; React reaches `render`, `ref`, `useId`, a defaults provider, composed handlers and the full `data-*` vocabulary. | Make the Angular group's `required` a real validator rather than an attribute. **Made** — `SlCheckboxGroup` and `SlRadioGroup` both implement `Validator`, and "choose at least one" is a fact about the set that no single box can see. |
| **Documentation** | Six reference pages: import, anatomy row per part, one captioned demonstration per declared scenario with its source, the full input table, the event table both state models oblige, the composition surface and seven accessibility sentences. `specs/reference-pages.test.mjs`'s checker passes for all six. | Read the six pages rendered, at 1280 and 720, in light and dark. **Not made** — both Storybooks are running but need a restart before a new family's `@slotted/styles` subpath and a new Angular entry point are visible to them, and restarting is the reviewer's call. Raised at the gate as the largest open item. |

### Section 18 of the feature guide

1. **Purpose and anti-use.** A checkbox is one independent choice; a checkbox
   group is several of them with one array behind them; a radio group is one
   choice out of a mutually exclusive set. Anti-use: a checkbox for a setting
   that takes effect immediately — that is `switch` — and a radio group of two
   options where one is the absence of the other, which is a checkbox.
2. **Anatomy.** `checkbox`: `root`, `label`, `control`, `indicator`,
   `description`. `checkbox-group`: `root`. `radio-group`: `root`, `item`,
   `label`, `control`, `indicator`, `description`.
3. **Controlled and uncontrolled.** `checked`/`defaultChecked`/`onCheckedChange`
   on a box; `value`/`defaultValue`/`onValueChange` on both groups. Every request
   carries the value it replaces, the reason, the originating event and
   `cancel()`. Inside a group with a `value`, the group owns the box's state and
   the box reports its own transition alongside the group's.
4. **State matrix.** `default`, `hover`, `active`, `focus-visible`, `checked`,
   `indeterminate` (checkbox only), `invalid`, `readonly`, `disabled`, resolved
   in `STATE_PRECEDENCE` order. Simultaneous pairs painted and captured: checked
   + hover, checked + active, checked + invalid, checked + disabled, checked +
   read-only, mixed + disabled, unchecked + read-only.
5. **Keyboard, focus, ARIA, touch.** The whole table is the platform's and is
   transcribed in §5. Focus is the browser's; the target is the label row, at
   least 24 CSS pixels, and `@media (pointer: coarse)` raises the control height
   through the theme. A screen reader has not been run — the gate says so.
6. **Recipes.** `size` × `labelPlacement` on a box, plus `orientation` on a
   group, all through tokens the theme restates per density.
7. **Responsive, RTL, locale, reduced motion.** A horizontal group wraps;
   everything is logical properties; no string is built by the family, so there
   is nothing to localise; the motion scale collapses under reduced motion.
8. **Loading, empty, error, disabled, extreme content.** No loading state — a
   choice is not an asynchronous action. Empty is a group with nothing chosen,
   which is the APG's starting state and is captured. Error is `invalid` plus the
   field group's message. Extreme content — a three-line label, an unbroken
   token, a right-to-left string — has its own scene in all three harnesses and
   on all six pages.
9. **SSR, performance, virtualisation.** Identifiers come from `useId` and from
   an application-scoped factory, so the two renders agree. No listener is added
   per item beyond the element's own, and no roving-tabindex bookkeeping exists,
   so a hundred options cost a hundred inputs and nothing more. Virtualisation is
   not offered: a set a reader must compare is not a set to virtualise.
10. **Examples.** Ten scenarios on each page, each with its own snippet.
11. **Shared behavioural tests.** 71 React and 33 Angular behavioural tests over
    the same contract, plus 37 contract tests read by both.
12. **Changelog and migration.** New families; nothing to migrate. Recorded in
    `docs/BUILD-LOG.md`, and the wave-3 line in `docs/build-order.md` updated to
    name the third family and the reason it exists.

## 10. The framed choice, and why the earlier decline was wrong

Recorded on 2026-09-03, after the decline in §2 was reopened. It said
`defer to card`, naming the family that owns the capability instead, which is
the form a complete decline takes. It was still wrong, on three counts a reader
can check.

### The field says the capability belongs here

Three of the implementations surveyed put a framed choice inside the checkbox
family rather than in a card family or a family of its own:

- Mantine's `Checkbox.Card`, whose root carries `role="checkbox"` and works
  inside `Checkbox.Group` by `value`, plus a `Checkbox.Indicator` that is the
  box with no semantics at all;
- Chakra v3's `CheckboxCard`, with seven parts and four axes of its own;
- React Aria's `CheckboxButton`, documented as "the clickable area of a
  checkbox, including the indicator and label", carrying `data-selected`,
  `data-pressed`, `data-focus-visible`, `data-readonly`, `data-invalid` and
  `data-required`.

`references/capability.md` makes a capability two or more surveyed
implementations ship into table stakes, and the default verdict `adopt`.

### `card` cannot hold this library's checkbox

`packages/styles/src/card/card.css` reserves `data-part="selection"` for an
`input` or a `button` written directly, and its harness fills that slot with a
bare `<input type="checkbox">`. Composing it with this library's `checkbox`
fails on three seams:

1. a choice card's surface is the `<label>` that stretches the hit area, and
   `checkbox` brings its own `<label for>` — a nested `<label>`, which the
   parser resolves to the inner one;
2. `card` holds no state (`packages/react/src/card/card.tsx`, its own comment
   says so), so `data-selected` is mirrored by hand, per item, from the value
   the group already owns;
3. `card` knows nothing of `size` arriving from a `field`, of `data-invalid`,
   of `data-readonly` or of `required` — the four things a choice in a form has.

Those are not the two or three lines of consumer code a decline is allowed to
write in place of the capability.

### A choice card is not a content card

`card` is a content container: media that bleeds, three regions with their own
block rhythm, an elevation calibrated for content, and a horizontal layout that
reflows at 24rem. A row of five plan choices is a form control. `card` keeps
`data-part="selection"` for what it was built for — a choice living inside real
card content — and this axis is for a choice that is the whole of what the
surface holds.

### The name is `tile`, not `card`

Mantine and Chakra call it a card. `card` already names a family here, and one
word may not name two things. Carbon calls the framed choice a `SelectableTile`
and Cloudscape calls the family `Tiles`; neither word appears in
`docs/component-features.md` or `PROJECT-PRD.md`, so `tile` collides with
nothing present or planned. `panel` was considered and refused: the feature
guide already uses it for a tab panel, an accordion panel and a detail panel.

### What the tile is

The root — the `item`, in `radio-group` — paints a surface, an edge and an
inset, and the label's hit area stretches across it, which is the mechanism
`card` uses for a card that resolves to one destination. The element stays a
`<label for>`, so the accessible name, `Space`, the arrow keys and the single
tab stop are all still the platform's.

- **The edge is a `::before` over the border box.** A hairline becoming a
  two-pixel chosen edge would otherwise move every line of text inside the tile
  by a pixel. It is a border rather than a shadow because forced colours removes
  a shadow outright and keeps a width.
- **Chosen is an edge before it is a tint.** In `high-contrast` the theme paints
  `--slotted-tone-accent-surface` the same white as the surface, so the tint
  carries nothing there and the two-pixel accent edge is the whole signal.
- **Hover, press and chosen are three steps of one ladder, in that order.** The
  first assignment made hover `--slotted-tone-accent-surface` and press
  `--slotted-tone-accent-subtle-hover`, which in `light` resolve to `#dbeafe`
  and `#eff6ff`: hover took the chosen tile's own tint and press came out
  lighter than hover. They are now `subtle-hover`, `subtle-active` and
  `surface`. Found by capturing hover and press, not by reading the sheet.
- **A chosen tile answers the pointer with its edge, not its ground.** The
  chosen tint is the last step the accent tone has below its solid, so a ground
  that moved would land on the tint an unchosen hovered tile shows. Carbon moves
  the ground because its selected fill is not at the end of its own scale.
- **Every weaker state holds back for `checked`, and `checked` holds back for
  `readonly`.** Without the first guard, hovering a chosen tile repainted it in
  the fainter tint an unchosen one shows — the pointer made a tile look less
  chosen than it was. Without the second, a read-only chosen tile and a chosen
  tile were the same picture in `dark`, where the two grounds are `#18181b` and
  `#181b22`. A read-only tile now takes a neutral `--slotted-border-strong`
  frame at hairline width, and the box inside stays painted chosen.
- **The label drops the target minimum inside a tile.** The surface is the
  target at every size and density, so the twenty-four-pixel minimum the label
  carries in the plain variant would only make a one-line tile taller than its
  own content.

### Arrangement is declined, and `grid` is named

`specs/components/grid/contract.json` already ships `columns` (auto, 1–12),
`minItemWidth`, `gap` and a stretching alignment, which is a row of equal-width
tiles of equal height. A `columns` axis on either group would be two families
laying out one row. The decline is recorded in both group contracts, under
`declined.columns`, with the family it defers to.

### The distance from a label to its description

Raised while this axis was built and fixed with it, in both variants and in
both families. The label carried the WCAG 2.2 target as `min-block-size`, which
sank the whole four-and-a-half-pixel difference below its text; the description
under it then sat further from the label it belongs to than from the next
choice, so proximity named the wrong owner. The slack is now split above and
below the text as padding, the lift is computed through it, and the distance
itself is stated once as `max(0px, --slotted-space-3 - slack)` — the step
`field` already puts between its own rows — so both variants land on one number.
The two groups also double their row gap where an item carries a description,
which is the doubling the horizontal rule already applied for the same stated
reason.

### Two defects fixed in shared tools first

1. **The harness gave nine cells one radio group.** `tools/harness/build.mjs`
   emitted each scene verbatim into nine cells, and a radio group with no `form`
   around it is scoped to the document, so the last `checked` in the page won
   and the eight cells above it photographed an empty set. The `name` of a
   control is now made per cell. It is the only identifier rewritten: a
   duplicated `id` costs a screenshot nothing, and wrapping each stage in a
   `form` is not open, because two fragments already declare one.
2. **The harness filtered scenes by prefix.** `--scene tile` also showed
   `tile-states` and `tile-row` — a capture that named one scene and
   photographed three. The stage now carries `data-scene` and the filter
   compares it.

Both carry tests in `tools/harness/build.test.mjs`.

A third was fixed in `packages/styles/src/states.test.mjs`, which split a
selector list on every comma and so tore `:is(:checked, :indeterminate)` in
half, reporting a correctly guarded rule as an unguarded one. The split is now
parenthesis-aware, with a test.
