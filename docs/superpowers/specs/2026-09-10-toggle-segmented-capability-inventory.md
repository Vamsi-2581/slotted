# Toggle group and segmented control capability inventory

Produced before either family was designed or coded, as
`.claude/skills/component/references/capability.md` requires. Both are new:
neither `specs/components/toggle-group/` nor `specs/components/segmented-control/`
exists, and `docs/build-order.md` wave 8 lists both names with no scope
paragraph. Section 6 writes that paragraph.

One inventory covers two families because the invocation asks for one decision:
"os dois são o mesmo grupo de itens exclusivos com aparências diferentes, e
decidir a semântica duas vezes produz duas respostas." Section 5 answers it, and
the answer is not the one the premise assumes.

Sources were read on 10 September 2026.

---

## 1. Surveyed

Nine implementations, chosen so they disagree about the one question this pair
owes an answer to: **what a selected item is, in the accessibility tree**. Three
say a pressed button, two say a checked radio, one says a tab, one says a
current list item, and the specification says it depends on what the reader is
choosing.

| Implementation           | Calls it                                | Read at                                                                                                                                                        |
| ------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Radix Primitives         | `ToggleGroup`                           | <https://www.radix-ui.com/primitives/docs/components/toggle-group>                                                                                             |
| Base UI 1.8.0            | `ToggleGroup`                           | <https://base-ui.com/react/components/toggle-group>                                                                                                            |
| Ark UI 5.39.1            | `ToggleGroup` **and** `SegmentGroup`    | <https://ark-ui.com/docs/components/toggle-group>, <https://ark-ui.com/docs/components/segment-group>                                                           |
| React Aria Components    | `ToggleButtonGroup`                     | <https://react-spectrum.adobe.com/react-aria/ToggleButtonGroup.html>                                                                                           |
| Angular Material (`main`) | `MatButtonToggleGroup`                  | `src/material/button-toggle/button-toggle.md` and `button-toggle.ts` in `angular/components`                                                                    |
| Mantine                  | `SegmentedControl`                      | <https://mantine.dev/core/segmented-control/> and <https://mantine.dev/llms/core-segmented-control.md>                                                          |
| Primer (GitHub)          | `SegmentedControl`                      | <https://primer.style/components/segmented-control>, its guidelines and its accessibility pages                                                                 |
| Carbon                   | `ContentSwitcher`                       | <https://carbondesignsystem.com/components/content-switcher/usage/>                                                                                            |
| WAI-ARIA APG             | Radio Group, Toolbar, Button (toggle)   | <https://www.w3.org/WAI/ARIA/apg/patterns/radio/>, <https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/>, <https://www.w3.org/WAI/ARIA/apg/patterns/button/> |

### The five answers to the one question

- **A pressed button.** Radix, Base UI and Ark's `ToggleGroup` put `aria-pressed`
  on every item and `role="group"` on the container, in single and multiple mode
  alike. React Aria's `ToggleButtonGroup` is the same shape with a `selectionMode`
  prop.
- **A checked radio.** Ark's `SegmentGroup` renders a real `input[type=radio]` per
  segment inside a label, with `name`, `form`, `required`, `invalid` and
  `readOnly` on the root. Mantine does the same and says so: "SegmentedControl
  uses radio inputs under the hood, so it is accessible by default."
- **Both at once.** Angular Material writes
  `[attr.role]="multiple ? 'group' : 'radiogroup'"` on the group
  (`button-toggle.ts:133`) while every child stays a `button` conveying state
  with `aria-pressed` (`button-toggle.md`, Accessibility). A `radiogroup` whose
  children are pressed buttons owns no `radio`, which is the contradiction this
  library must not copy.
- **A current list item.** Primer renders `ul > li > button[aria-current]`,
  arrow keys do nothing, and every segment is its own tab stop. Its accessibility
  page rejects the three alternatives by name: `radiogroup` "requires a save
  button", `tablist` "is used to switch between tab panels", `toolbar` "is a
  collection of function buttons".
- **A tab.** Carbon's `ContentSwitcher` is a row of content tabs above the view
  they change, one always selected.

The APG does not arbitrate directly, and that is the useful part: the Radio Group
pattern describes exactly the interaction a segmented control has — arrows move
focus *and* check, Tab enters at the checked item — while the Button pattern
describes exactly what a formatting toggle is, and warns that "it is critical the
label on a toggle does not change when its state changes". The two patterns
describe two different controls, not two styles of one.

---

## 2. Table stakes

Every capability two or more surveyed implementations ship. `TG` is
`toggle-group`, `SC` is `segmented-control`; a row that names one family only
concerns that one.

| Capability                                                     | Who ships it                                                                 | Verdict                    | Reason                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled value                              | all nine                                                                     | adopt (both)               | `@slotted/core/state`, with the request carrying a `reason` that no surveyed implementation has.                                                                                                                                                              |
| Multiple selection                                             | Radix `type`, Base UI `multiple`, Ark `multiple`, React Aria `selectionMode`, Material `multiple` | adopt (TG) / decline (SC)  | A segmented control's thumb is one thumb; two checked segments is a picture the family cannot draw and a control nobody surveyed ships. Multiple lives in TG, which is where four of the five put it.                                                          |
| Empty selection                                                | Ark `deselectable` (default `true`), React Aria `disallowEmptySelection`, Radix by controlling the value | adopt (TG) / adapt (SC)    | TG gets `deselectable`, default `true`. SC may start with nothing checked — a native radio group does — and cannot be returned to empty by the reader, which is the platform's own rule and not one this family invents.                                       |
| Roving tabindex, arrows, `Home`, `End`, wrapping               | Radix, Base UI `loopFocus`, Ark `loopFocus`/`rovingFocus`, Material, APG      | adopt (TG) / defer (SC)    | TG uses `@slotted/core/focus`. SC uses native radios, so the platform supplies the whole model, exactly as `radio-group` records with `"rovingFocus": "platform"`.                                                                                             |
| Orientation                                                    | Radix, Base UI, Ark, React Aria, Material `vertical`                          | adopt (both)               | `orientation` axis; the arrows follow it and `aria-orientation` is written only when vertical, as `tabs` and `toolbar` already do.                                                                                                                             |
| Disabled group and disabled item                               | all nine                                                                     | adopt (both)               | Native `disabled` on the item; the group disables through the platform so `:disabled` and `@slotted/core/focus` agree.                                                                                                                                        |
| Standing down inside a bar that owns the arrows                | Radix `rovingFocus`, Ark `rovingFocus`                                       | adapt (TG)                 | Both make the consumer pass a prop. `toolbar` exists here and already promised this family the capability (`specs/components/toolbar/contract.json`, `declined.checkedValues`), so TG detects the bar and stands down; the prop stays as an override.           |
| Size scale                                                     | Material `appearance`, Mantine `size`, Primer `size`, Carbon three heights    | adopt (both)               | `sm`/`md`/`lg` read from `--slotted-control-*`, which is what every control in this library reads.                                                                                                                                                            |
| Full width                                                     | Mantine `fullWidth`, Primer `fullWidth`, Carbon grid-aware                     | adopt (both)               | One boolean, and the segments stay equal inside it.                                                                                                                                                                                                          |
| Equal segment widths                                           | Carbon (stated rule), Mantine (grid), Ark (indicator assumes it)              | adopt (SC)                 | Carbon: "Each content tab in the group should be the same width." Equal columns are also what lets the thumb move without measuring anything.                                                                                                                  |
| A thumb that moves to the selected item                        | Mantine (`transitionDuration`), Ark `Indicator`, Carbon, Primer               | adopt (SC) / decline (TG)  | TG's items each paint their own `pressed`; a shared thumb contradicts multiple selection. Named instead: TG's selected paint is `button`'s own.                                                                                                                |
| Icon-only items with an accessible name                        | Primer `leadingIcon` + `aria-label`, Mantine + `VisuallyHidden`, Radix examples | adopt (both)               | The item takes native `aria-label`; the family writes none of its own.                                                                                                                                                                                       |
| Item content that is an icon **and** a label                   | Primer `leadingIcon`, Mantine (any node), Material (any content)             | adopt (both)               | TG inherits `button`'s `start`/`label`/`end`. SC declares `icon` and `label` parts so the icon is aligned to the text rather than to the line box, per the briefing's decision.                                                                                 |
| Form participation: `name`, submitted value, `form`            | Ark `name`/`form`, Mantine `name` → `FormData`, Material `ngModel`/Reactive Forms | adopt (SC) / decline (TG)  | SC is a form control and carries a real radio per segment. TG is not: `docs/component-features.md` §5 says "Não use como substituto visual de Checkbox para formulários", and the family for that is `checkbox-group`.                                          |
| `required`, `invalid`, `readOnly`                              | Ark `SegmentGroup`, Material via forms                                        | adopt (SC)                 | Same three the `field` family already wires into `radio-group`; SC reads them from `field` the same way.                                                                                                                                                       |
| Defaults set once for the application                          | Material `MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS`                                  | adopt (both)               | One implementation ships it, but it is this library's own convention for every family: a React provider and an Angular `provideX()`.                                                                                                                          |
| Substituting the rendered element                              | Radix `asChild`, Base UI `render`, Ark `asChild`                             | adopt (both)               | React `render`; Angular the directive on the consumer's own element.                                                                                                                                                                                          |
| The group's accessible name is the consumer's                  | Primer, Material, APG (all three patterns)                                    | adopt (both)               | Native `aria-label`/`aria-labelledby`. No `label` prop: `button-group` already records that a second way to name one thing is a second thing to get wrong.                                                                                                     |
| A checkmark drawn on the selected item                         | Material only (`hideSingleSelectionIndicator`)                                | decline (both)             | One implementation, and it costs width that has to be reserved on every item so the label does not move. Composed instead: the consumer puts an icon in the item's `start` slot and selects it with `[data-pressed]`, which is two lines of CSS in their sheet. |
| Rendering segments as links                                    | Primer (documented as required when the URL changes), Carbon (tabs)           | defer to `tabs`            | `tabs` already ships `controlElement.withHref` and a `links` scenario. A radio that navigates is not a radio, and a second family answering the same question is the thing `docs/build-briefing.md` refuses.                                                    |
| Panels below the control                                       | Carbon `ContentSwitcher`, Primer (rejects `tablist` for this reason)          | defer to `tabs`            | `tabs` owns `tablist`, the panel, `mount` and dismissal. SC changes a setting or how a view is drawn; when a panel is switched, the family is `tabs`.                                                                                                          |
| Responsive fallbacks when the row does not fit                 | Primer `variant: hideLabels \| dropdown`, Carbon (fixed widths)               | adapt (SC)                 | A dropdown fallback is `select`, and swapping families at a breakpoint is the consumer's decision. What this family owns is dropping to icons at its own inline size, which is Primer's `hideLabels` written as a container query rather than as a viewport one.  |

---

## 3. Differentiators

| What                                                                | Who has it                        | This library's answer                                                                                                                                                                                                                             |
| ------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A thumb that is correct on the first server-rendered paint           | nobody                            | Mantine measures the checked node with a ref and Ark's machine measures too, so both paint the thumb in the wrong place until hydration. Equal columns make the thumb's place arithmetic — index and count are known at render — so no layout is read. |
| A change that says **why** it happened                               | Base UI, whose reason is `'none'` | `reason` from the closed vocabulary in `docs/state-and-events.md`: `pointer`, `keyboard`, `clear`, `programmatic`.                                                                                                                                  |
| Standing down inside a toolbar without being told                    | nobody                            | Radix and Ark expose `rovingFocus` and leave the consumer to remember. `toolbar` is a family here, so the group can see the bar it is in.                                                                                                          |
| Two bindings, each reaching its own ecosystem                        | Material (Angular only)           | Reactive Forms and a `ControlValueAccessor` on the Angular SC; a `render` prop and a defaults provider on the React one. No surveyed implementation has both ecosystems.                                                                            |
| Three colour schemes, three densities, `dir="rtl"` through logical properties | nobody                            | The thumb mirrors with the writing mode, and `high-contrast` gets an edge rather than a fill, because the scheme paints every tone ground the page's own white.                                                                                     |
| A written reason for the semantics                                   | Primer (the only one that argues)  | Primer argues and then picks a shape whose keyboard is worse than the pattern it rejected. Section 5 argues and picks the platform.                                                                                                                 |

---

## 4. Gaps

What no surveyed implementation handles well and a real product still meets.

| Gap                                                                 | What the field does                                                                                         | What this pair does                                                                                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A label that is two words in the mock and nine in German             | Primer's guideline is "don't"; Carbon's is "two to three words"; none says what happens                     | The label clamps to one line and the string stays whole in the DOM, which is the library's own rule that truncation never removes content.                |
| The row does not fit at all                                          | Primer swaps to a dropdown at a viewport breakpoint; the others overflow                                    | A container query on the family's own inline size drops labels to their icons, then lets the row scroll. The viewport is not the control's width.        |
| Nothing is selected yet                                              | Mantine slides the thumb in from the left edge on the first selection                                       | With no value there is no thumb, and the first selection fades it in rather than sliding it from a place the reader never saw.                            |
| The selected item is disabled                                        | undefined in all nine                                                                                       | The thumb stays where the value says; `disabled` outranks `checked` in `STATE_PRECEDENCE`, so it paints disabled and is not focusable.                    |
| Every item is disabled                                               | Radix and Ark leave the ring with no stop                                                                   | `@slotted/core/focus` keeps a tab stop on index 0, which it already does for `toolbar`.                                                                  |
| The value points at an item that has been removed                    | undefined in all nine                                                                                       | The value is the consumer's; the family paints no thumb and reports nothing. A family that silently moved the value would move state the consumer owns.  |
| The target at `dense`                                                | Primer requires 24 × 24 and says so; the rest are silent                                                    | `--slotted-control-height-sm` at `dense` is 24px, and `@media (pointer: coarse)` grows it to 44 through the theme.                                       |
| An item added while focus is inside                                  | Radix and Ark re-read on render; Material re-reads on `QueryList` change                                    | `refresh()` on the roving handle, which the two bindings already call for `toolbar`.                                                                     |

---

## 5. The one decision: two families, one semantic

The invocation's premise is that the two are one group of exclusive items in two
appearances. Five of the nine sources contradict the first half of it: `multiple`
is shipped by Radix, Base UI, Ark, React Aria and Angular Material, and a toggle
group is exclusive only when it is asked to be. And the second half is the wrong
axis: what separates them is not paint, it is **the element and the semantics**,
and the paint follows from that.

- **`toggle-group` is a group of toggle buttons.** `role="group"`, every item a
  `button` carrying `aria-pressed`, single or multiple, empty allowed. It is the
  APG's Button pattern applied to a set: bold/italic/underline, a map's layers, a
  filter chip row. Its items are this library's `button` family — the same
  composition `button-group` already uses — so tone, variant, size, loading,
  `focusableWhenDisabled` and the whole painted surface come from a family that
  has already been through this gate twice.
- **`segmented-control` is a radio group.** `radiogroup` semantics from a real
  `input[type=radio]` per segment, always exclusive, on a track with a thumb. It
  is the APG's Radio Group pattern, which describes its interaction exactly, and
  the platform then supplies the keyboard, the form value and the "2 of 4" a
  screen reader announces.

Primer's three objections, answered:

- _"`radiogroup` requires a save button."_ It does not. Neither WAI-ARIA nor the
  APG says so, and a native radio applies immediately wherever an application
  chooses. Mantine and Ark both ship the segmented control as radios.
- _"`tablist` is for switching tab panels."_ Agreed, and that is why the panel
  case is deferred to `tabs` by name rather than answered twice here.
- _"`toolbar` is a collection of function buttons."_ Agreed, and `toolbar` is a
  family here that this pair composes with rather than imitates.

What Primer builds instead — a list of buttons, every one a tab stop, arrows
inert — costs a reader five tab stops where the pattern gives one, and drops the
position announcement. The library's own law settles it: `docs/component-features.md`
§2.8 says prefer native HTML, and `.claude/skills/component/references/frameworks.md`
says prefer the platform before ARIA.

The cost of this decision, written because it is a real one: a segment is a
`label` wrapping a visually hidden radio, so a consumer cannot make a segment a
`button` or an `a` without losing the semantics — which is the substitution the
contract refuses, and `tabs` is where a navigating row belongs.

Angular Material's shape — `radiogroup` around `aria-pressed` buttons — is
rejected outright rather than adapted. A `radiogroup` that owns no `radio` is a
group whose role and children disagree, which `references/rubric.md` names as a
failure of dimension 7.

---

## 6. What this adds to `docs/build-order.md`

Wave 8 lists `segmented-control` and `toggle-group` as names with no scope. The
paragraph this inventory justifies, to be written into that file as part of the
work:

- **`toggle-group segmented-control`** — one session, because the semantics is one
  decision and deciding it twice produces two answers. `toggle-group` is a set of
  toggle buttons under `role="group"`: single or multiple, empty selection
  allowed, roving focus from `@slotted/core/focus`, orientation, and items that
  are the `button` family's ToggleButton so the paint, the loading state and
  `focusableWhenDisabled` are not written a second time. It stands down inside
  `toolbar`, which is the capability `toolbar` deferred here by name.
  `segmented-control` is a radio group on a track: one real radio per segment,
  equal columns, a thumb whose place is arithmetic rather than measured, forms
  through `name` and `ControlValueAccessor`, and `field` for `invalid`,
  `required` and `readonly`. Two capabilities are declined to families that own
  them: a navigating row and a row with panels are both `tabs`, and a form's
  multiple choice is `checkbox-group`.
