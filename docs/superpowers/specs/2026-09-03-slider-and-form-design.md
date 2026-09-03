# Slider and Form design

The decisions taken before either family was written. The capability inventory
that produced them is
`docs/superpowers/specs/2026-09-03-slider-and-form-capability-inventory.md`.

---

# Slider

## The thumb is a real `input[type="range"]`

The one decision the field disagrees about. Angular Material's thumbs are
`input[matSliderThumb]` elements and Base UI's `Slider.Thumb` "renders a `<div>`
element and a nested `<input type="range">`"; Radix and Ark render
`span[role="slider"]` with a hidden input only for submission, and React Aria
and Mantine render neither.

The native input is taken, in both bindings, because it supplies six things
this library would otherwise write and test twice:

| From the platform     | What it means here                                                    |
| --------------------- | --------------------------------------------------------------------- |
| `role="slider"`       | No ARIA role is written, and none can drift from the element.         |
| The value set         | `aria-valuenow`, `aria-valuemin` and `aria-valuemax` come from `value`, `min` and `max`. |
| Form submission       | One input per thumb, so a range submits two values under one `name`.  |
| Form reset            | `defaultValue` is the element's own, and a native reset restores it.  |
| `disabled`            | Out of the tab order and out of submission, which is what the word means. |
| Focus                 | The thumb is in the tab sequence with no `tabindex` of the family's own. |

The cost is that the input has to be invisible and unhittable. It is `opacity:
0` and `pointer-events: none`, filling the thumb it lives in, so the thumb the
reader sees is the family's own element and the focus ring is drawn by
`[data-part='thumb']:has(> [data-part='input']:focus-visible)` — the technique
`number-field`'s frame already uses for its control.

## The keyboard is the family's

Browsers disagree about a range input's larger step: Chrome moves Page Up by a
tenth of the range and Firefox by one step. `largeStep` has to mean the same
thing in both bindings and every browser, so the family binds the whole table
and calls `preventDefault()`.

| Key                        | Effect                                          |
| -------------------------- | ----------------------------------------------- |
| `ArrowRight`               | One step along the inline axis, in the reading direction |
| `ArrowLeft`                | One step against it                             |
| `ArrowUp`                  | One step up the scale                           |
| `ArrowDown`                | One step down                                   |
| `Shift` + any of the above | `largeStep` instead of `step`                   |
| `PageUp`                   | `largeStep` up                                  |
| `PageDown`                 | `largeStep` down                                |
| `Home`                     | This thumb's own minimum                        |
| `End`                      | This thumb's own maximum                        |

`ArrowRight` and `ArrowLeft` follow the reading direction: in a right-to-left
document `ArrowRight` decreases, because the thumb moves toward the end of the
track the reader sees. `ArrowUp` and `ArrowDown` do not mirror; a vertical axis
has no bidi. The APG's note that "reversing the direction of the value change
for the keys specified above … could create a more intuitive experience" is
what a right-to-left document is.

`Home` and `End` reach the thumb's own bounds rather than the scale's, because
in a range the thumb's bounds are its neighbour's value. That is the same fact
the multi-thumb pattern requires to be announced.

## Two thumbs cannot cross, and the accessibility tree says so

The APG's multi-thumb pattern: "When the range … of another slider is dependent
on the current value of a slider, the values of `aria-valuemin` or
`aria-valuemax` of the dependent sliders are updated when the value changes."

Each thumb's input carries its own `min` and `max`, moved to the neighbouring
thumb's value less or plus `minStepsBetween * step`. Clamping is therefore the
platform's, and the announced range is correct for free. Radix and Ark clamp in
script and leave the announced range as the scale's, so a screen reader is told
a thumb may reach a value it cannot.

The tab order stays the array's order however the thumbs move, which is the
second thing the pattern requires.

## Anatomy

```html
<div data-ui="slider" data-part="root" data-size="md" data-orientation="horizontal">
  <output data-part="output">40%</output>
  <div data-part="control">
    <div data-part="track">
      <div data-part="indicator"></div>
      <span data-part="mark" data-value="20"><span data-part="mark-label">20%</span></span>
      <div data-part="thumb" data-index="0">
        <input data-part="input" type="range" />
        <span data-part="bubble">40%</span>
      </div>
    </div>
  </div>
</div>
```

Ten parts. `track` is the containing block for everything that has a position
on the scale, and it is inset by half a thumb at each end, so a thumb at either
bound is contained rather than half outside the control. Every position is one
private custom property — `--_position` on a thumb or a mark, `--_start` and
`--_end` on the indicator — written inline by the binding, because a percentage
of a track cannot be a token.

`indicator` is the filled portion. Base UI calls it `Indicator`; Radix and Ark
call it `Range`, and this family does not, because a range slider is already a
thing the family is.

The label is the `field`'s. `output` is the numeric read-out; `bubble` is the
same number on the thumb, shown while dragging or focused.

## `readonly` is the family's, because the platform has none

`input[type=range]` ignores `readonly` — it is not in the attribute's list of
applicable types. The family refuses every pointer and key change and writes
`aria-readonly="true"`. A read-only slider stays focusable and stays submitted,
which is what separates it from a disabled one.

## A mark's label becomes the announced value

When a mark carries a label and a thumb rests exactly on that mark's value, the
thumb's `aria-valuetext` is the label rather than the number. A five-step
quality scale then announces "Medium" instead of "50", which is precisely the
case the APG names for `aria-valuetext`, and no surveyed implementation derives
it — Ark and Mantine both make the consumer write the function.

## Integration, answered

### React

| Question                                             | Answer                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| Controlled, uncontrolled, request with a reason      | yes — `value` / `defaultValue` / `onValueChange(value, request)`, plus `onValueCommit` for the end of a drag |
| Defaults set once for an application                 | yes — `SliderDefaultsProvider` and `useSliderDefaults()`                        |
| Substituting the rendered element of each public part | yes for the root — `render(props)`. The thumbs, the inputs and the track are fixed: substituting the element that carries the role and the value would leave the family with nothing to be |
| The consumer's own handler still runs                | yes — `onKeyDown`, `onPointerDown`, `onChange` and `onBlur` compose, and `preventDefault()` on a key stops the family acting on it |
| The native element and the imperative action         | yes — `ref` reaches the first thumb's input; `handle` reaches `focusThumb(index)`, which is the one action a value cannot express |
| Server rendering without a mismatch                  | yes — `useId`, and no layout is read during render. Positions are percentages, not measurements |
| Every state a consumer may style in the DOM          | yes — `data-disabled`, `data-invalid`, `data-readonly`, `data-dragging`, `data-orientation`, `data-size`, `data-index` |
| Props typed as the native element's, extended        | yes — `ComponentPropsWithRef<'input'>` less the six the family redeclares       |

### Angular

| Question                                        | Answer                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Two-way value in the shape the ecosystem expects | yes — `value` as `model()`, `valueChange` and `valueCommit` as `output()` carrying the request |
| Reactive Forms and template forms                | yes — `ControlValueAccessor` on `SlSlider`, over `number \| number[]`                      |
| Defaults set once                               | yes — `SLIDER_DEFAULTS` and `provideSliderDefaults()`                                      |
| A template reaching the instance                | yes — `exportAs: 'slSlider'`                                                               |
| Substituting projected content, kept lazy       | yes — `ng-content` for the output's own text, and `marks` for the scale. Nothing else is projected: the thumbs are the family's |
| Zoneless and `OnPush`                           | yes — signals throughout, `ChangeDetectionStrategy.OnPush`, no `markForCheck`              |
| Every listener torn down                        | yes — `DestroyRef` for the pointer listeners the family adds to the document during a drag |
| A static attribute the consumer wrote           | yes — `HostAttributeToken` for `id`, `name`, `form`, `aria-label` and `aria-describedby`   |
| One class per entry point                       | yes — `@slotted/angular/slider`, importing `@slotted/angular/field` by its published path  |

---

# Form

There is no APG pattern for a form. The sourced guidance is WCAG 2.2 SC 3.3.1
Error Identification, the GOV.UK error summary component, and the HTML `form`
element itself; each is cited where it decides something below.

## The form owns errors, and nothing else

`docs/component-features.md` § 6 states the boundary: the family coordinates
submit, reset, validation, touched/dirty, global messages and focus on the
first error "sem possuir o estado de cada framework". So the form holds exactly
one piece of state — the error map — and reads everything else from the
platform.

- Values come from `FormData`, at submit, in document order.
- Validity comes from `checkValidity()` and `validationMessage`, which every
  control already has, and which no schema is needed to reach.
- Dirtiness comes from the `input` events the form's own controls fire.
- Touched is the browser's `:user-invalid`, which the `field` family already
  answers.

## `novalidate`, and what replaces it

The element carries `novalidate` so the browser's own bubble does not appear
next to a control whose error the `field` is already drawing. Constraint
validation still runs — `checkValidity()` is called explicitly, and each
control's `validationMessage` is the platform's localized string, which no
library can write better. `nativeValidation` turns the attribute off for a
consumer who wants the browser's behaviour back.

## One error map, three sources

```
errors = { [name: string]: string | string[] }
```

Keyed by the control's `name`, which is the key the platform already uses and
the key a server already sends. Three sources merge into it, latest last:

1. the `errors` input, for a server or a form action;
2. `checkValidity()` over `form.elements`, at whatever moment `validate` names;
3. whatever `onSubmit` returns.

The merged map is ordered by `form.elements`, which is document order, so the
summary lists the errors in the order the reader will fix them. An object's own
key order is the server's, and the server does not know the layout.

A server error is dropped when the control it names fires `input`, and every
error is dropped at the next submit before validation runs again — the rule
`docs/component-features.md` § 6 states as "erros de servidor persistem até o
campo mudar ou nova submissão".

An error naming a control the form does not contain stays in the summary
without a link. A message a reader cannot reach is still a message they have to
be given.

## The summary is GOV.UK's, item by item

GOV.UK states four things a summary "must" do. All four:

| Must                                                    | Where                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| Move keyboard focus to the error summary                | `errorFocus="summary"`, the default, focuses the region's own `tabindex="-1"` |
| Include a heading                                       | `summary-title`, defaulting to "There is a problem"                       |
| Link to each answer that has a validation error         | `summary-item` is an `a[href="#id"]` pointing at the control's identifier, which the `field` already generates |
| Word the summary messages as the inline ones            | They are the same strings: one map feeds both                             |

The region is `role="alert"` inside a labelled `section`, so it announces when
it appears and is reachable afterwards. `errorFocus="control"` focuses the
first invalid control instead, for a form of one field where a summary is
ceremony.

## Submission is asynchronous and refuses to happen twice

`onSubmit` may return a promise. While it is pending the root carries
`data-loading` and `aria-busy="true"`, and a second submit is refused — the
defect a double-clicked button produces in a bare `<form>` and in every
surveyed implementation but Mantine's.

A submit that resolves to an error map re-enters the same path as a validation
failure: the map merges, the summary appears, focus moves.

## `validity` is a new mutable capability

`specs/contract.schema.mjs` had no word for the state this family holds. Calling
it `value` would name it for something it is not, and the briefing's rule is
that a shared tool which cannot express the right contract is a defect in that
tool, fixed first, in its own commit. `validity` is added to
`KNOWN_CAPABILITIES` and to `MUTABLE_CAPABILITIES`, and it is raised at the gate
because the vocabulary is a public contract outside this family.

```json
"stateModel": {
  "validity": {
    "controlled": "errors",
    "uncontrolled": "defaultErrors",
    "request": "onErrorsChange",
    "reasons": ["submit", "keyboard", "clear", "programmatic"]
  }
}
```

`submit` is validation running, `keyboard` is a field changing and dropping its
own error, `clear` is a reset, and `programmatic` is `validate()` or a consumer
setting the map.

## The action row is a part

Carbon, Polaris, Fluent and Material all ship one. `inline` can end-align a row
of buttons, but the reflow below a container width — every button full width, in
a column, primary first — needs a container query, and a consumer would write
the same one for every form in an application. It is a part, with its own
`container-name` and a literal breakpoint, which is what
`docs/token-foundation.md` rule 4 requires of a reflowing family.

## Angular reaches two form systems, and React reaches none

The asymmetry is recorded rather than levelled down.

- **Reactive Forms.** `SlForm` injects `ControlContainer` when there is one,
  marks every control touched on submit, and turns each control's `errors`
  object into a message through `SL_FORM_ERROR_MESSAGES` — a registry with
  defaults for `required`, `email`, `min`, `max`, `minlength`, `maxlength` and
  `pattern`, which an application replaces once.
- **Signal Forms**, new in Angular 22 and `@publicApi 22.0`, binds a control
  through its `ControlValueAccessor` for backwards compatibility. Every Slotted
  control already provides one, so they work under `[field]` today. The family
  adds no second integration; the reference page states the fact and shows the
  markup.

React has neither, and gains nothing invented to match them. It gets the
platform's `FormData`, a context that carries the error map, and the two hooks
that read it.

## Integration, answered

### React

| Question                                             | Answer                                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Controlled, uncontrolled, request with a reason      | yes — `errors` / `defaultErrors` / `onErrorsChange(errors, request)`          |
| Defaults set once                                    | yes — `FormDefaultsProvider`, carrying the policy and the summary's words     |
| Substituting the rendered element of each part       | yes for the root and the summary — `render(props)`. `form` stays a `form`: a submit event has nowhere else to come from |
| The consumer's own handler still runs                | yes — `onSubmit` composes with the family's, and `preventDefault()` on it stops the family submitting |
| The native element and the imperative action         | yes — `ref` reaches the `form`; `handle` reaches `validate()`, `submit()`, `reset()` and `focusFirstError()` |
| Server rendering without a mismatch                  | yes — `useId` for the summary's identifiers, and no DOM is read during render |
| Every state a consumer may style in the DOM          | yes — `data-invalid`, `data-loading` and `data-disabled`, which is the whole of what the family paints |
| Props typed as the native element's, extended        | yes — `ComponentPropsWithRef<'form'>` less `onSubmit`, which is redeclared    |

### Angular

| Question                                        | Answer                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Two-way value in the shape the ecosystem expects | yes — `errors` as `model()`, `errorsChange` and `formSubmit` as `output()`                 |
| Reactive Forms and template forms                | yes — `ControlContainer`, `markAllAsTouched()` and the message registry above. The form is not itself a control, so it has no `ControlValueAccessor` |
| Defaults set once                               | yes — `FORM_DEFAULTS` and `provideFormDefaults()`, plus `SL_FORM_ERROR_MESSAGES`           |
| A template reaching the instance                | yes — `exportAs: 'slForm'`                                                                 |
| Substituting projected content, kept lazy       | yes — `ng-content`, and `slFormSummary` and `slFormActions` as directives on the consumer's own elements |
| Zoneless and `OnPush`                           | yes — signals throughout                                                                   |
| Every listener torn down                        | yes — `DestroyRef` removes the `beforeunload` guard and the form's own `input` listener    |
| A static attribute the consumer wrote           | yes — `HostAttributeToken` for `novalidate`, so a consumer who wrote it keeps it           |
| One class per entry point                       | yes — `@slotted/angular/form`                                                              |
