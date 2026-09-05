# Field and Field Group Design

## Outcome

`field` gives one form control its label, its necessity, its help, its error and
the identifiers that bind them. `field-group` gives a set of controls one name,
one description, one error and one disabled switch, using the platform's own
`fieldset` and `legend`.

The two consolidate `field` and `fieldset`, which shipped on schema 4 before the
token foundation, the state vocabulary and the identity rule. Both entries leave
`docs/build-order.md`'s "29 famílias atuais" table in the same commit.

The capability inventory this design implements is
`docs/superpowers/specs/2026-09-02-field-capability-inventory.md`.

## The Pattern

There is no WAI-ARIA APG pattern for a field. Four documents cover it between
them, and each item below is checked against the implementation in the
self-assessment.

| Source                                                                                          | What it settles                                                                                                                                    |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| APG, Providing Accessible Names and Descriptions — <https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/> | Rule 2 prefer visible text, Rule 3 prefer native techniques, Rule 4 avoid browser fallback. Explicit `label[for]` over implicit wrapping, because some assistive technologies fail on the implicit form. `legend` names a `fieldset`. `aria-describedby` supplies the description. |
| HTML — `fieldset`, `legend`, `label`                                                            | `fieldset[disabled]` disables every descendant control natively. `legend` must be the first child. `label[for]` points at the control's `id`.      |
| WCAG 2.2 SC 3.3.1 Error Identification                                                          | The error is identified **in text**, not by colour or a mark alone, and not in a tooltip.                                                            |
| WCAG 2.2 SC 3.3.2 Labels or Instructions                                                        | A field that needs a format states it, which is what the description is for.                                                                        |

Neither family owns a keyboard model. There is no key either one handles: the
label forwards a click to the control, which is the platform's behaviour and not
a key. The one focus rule is that neither family is focusable and neither can
take focus away from its control.

## Two Families, One Contract Each

`field` is a `div`. `field-group` is a `fieldset`. They are separate families
rather than two members of one because the group's own description sits **before**
its controls and the field's sits **after**, and because a `fieldset` cannot be a
member of a family whose root is a `div` without one of the two lying about its
`nativeElement`.

## Anatomy

### `field`

| Member             | Element                          | Responsibility                                                                                       |
| ------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `field`            | `div`                            | Owns the identifiers and the state, and provides both to its descendants.                            |
| `fieldLabel`       | `label`                          | Names the control; carries `for`, and draws the necessity marker as its `mark` part.                 |
| `fieldControl`     | `input`                          | Applies the wiring to a control the library does not own.                                            |
| `fieldDescription` | `p`, rendering `inline-message`  | Help text; joins `aria-describedby`.                                                                 |
| `fieldError`       | `p`, rendering `inline-message`  | The message about validity; joins `aria-describedby` after the description.                          |
| `fieldCounter`     | `span`                           | A count the consumer owns, at the end of the label row.                                              |

### `field-group`

| Member                  | Element                         | Responsibility                                                                    |
| ----------------------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| `fieldGroup`            | `fieldset`                      | Names the set, disables it natively, and provides defaults to the fields inside.  |
| `fieldGroupLegend`      | `legend`                        | The name. Accepts a heading as its content, per GOV.UK.                           |
| `fieldGroupDescription` | `p`, rendering `inline-message` | Help about the whole set; joins the fieldset's `aria-describedby`.                |
| `fieldGroupError`       | `p`, rendering `inline-message` | The set's error; joins it after the description.                                  |

`fieldGroup` draws one part of its own, `content`, because a `legend` inside a
grid container is laid out by rules of its own in every engine. The fieldset
stays a block, and the `content` element is the grid that holds the fields.

## The Message Is an Inline Message

`docs/build-order.md` states it: `inline-message` "é a peça que `field` (onda 3)
consome para mensagem e erro". Four members render it — the field's description
and error, and the group's — so a field error is a message with a glyph, a tone,
a clipped severity word an application translates once, a reserved line, and a
`live` policy, none of which the family reimplements.

The element those members render is `inline-message`'s root, so it carries
`data-ui="inline-message"` and `data-part="root"`. The field selects it as a
child rather than as a part of its own, which is the same seam `button-group`
uses for the buttons it joins.

`fieldError` is not a fifth tone. It takes `inline-message`'s five, so a warning
that does not block submission is `tone="warning"` on the same element — which is
what Fluent spends a `validationState` axis on and Carbon a second component.

## Layout, and Why There Is No Wrapper

The root is a two-column grid. Every child spans both columns; the label takes
the first column of the first row and the counter the second, end-aligned. No
part needs a selector of its own for placement, which is what lets the messages
be another family's elements.

```
grid-template-columns: minmax(0, 1fr) auto;

> *                     { grid-column: 1 / -1; }
> [data-part='label']   { grid-column: 1; grid-row: 1; }
> [data-part='counter'] { grid-column: 2; grid-row: 1; justify-self: end; }
```

`labelPlacement="side"` adds a leading column for the label and moves the rest
into the second:

```
grid-template-columns: var(--slotted-field-label-inline-size) minmax(0, 1fr) auto;

> *                     { grid-column: 2 / -1; }
> [data-part='label']   { grid-column: 1; grid-row: 1; }
> [data-part='counter'] { grid-column: 3; grid-row: 1; }
```

The counter sits at the end of the label row because that is where Carbon puts
it. In Angular Material it sits in the subscript, where it shares a row with the
error and pushes it; here a count appearing on the first keystroke adds nothing.

### The Side Label Reflows

The field declares `container-type: inline-size` and `container-name: slotted-field`.
Below 320 pixels of its own inline size, `labelPlacement="side"` renders as
`top`. The breakpoint is a literal because CSS forbids a custom property in a
container condition, which `docs/token-foundation.md` rule 4 records.

320 is the width at which a twelve-character label column plus a control leaves
the control under 200 pixels — narrower than a date, a document number or a
currency amount can be read in while being typed. Nothing surveyed reflows: a
Spectrum side label squeezes its control instead.

## Necessity Is a Marker, and Sometimes a Word

`requiredMark` has three values, and it is the necessity axis Spectrum spends
`necessityIndicator` on, Angular Material `hideRequiredMarker`, and Chakra and
Ark a `fallback` prop.

| Value  | `required`     | Not required   |
| ------ | -------------- | -------------- |
| `mark` | `*`            | nothing        |
| `text` | `(required)`   | `(optional)`   |
| `none` | nothing        | nothing        |

The glyph is `aria-hidden`, because `aria-required` on the control already
carries the semantics and a reader working through a form of twenty required
fields does not need to hear "asterisk" twenty times. The two words are not
hidden: they are the information, and they are in the defaults so an application
translates them once rather than per field.

## State Is Unset by Default

`disabled`, `invalid`, `required` and `readOnly` are `undefined` rather than
`false` on every member that holds them, which is the invariant
`docs/superpowers/specs/2026-08-31-field-aware-controls-design.md` states from
the control's side. `undefined` defers to the group, and the group to the
application; anything else wins.

That is also why none of the four appears in `defaults`: a default of `false`
cannot be distinguished from a consumer saying "not disabled", and a field that
defaulted to `false` would quietly override a disabled `field-group`.

## Identifiers

`field` mints one base identifier and derives four:

```
<base>-control  <base>-label  <base>-description  <base>-error
```

Derivation rather than registration, for the reason the field-primitive design
records: `label[for]` resolves to the identifier the control will use with no
ordering dependency between siblings and nothing to coordinate during hydration.

`aria-describedby` is composed in a fixed order — description, then error —
from which of the two are present, rather than from DOM order. Two known slots
have one correct reading order, and deriving it from registration order would
make the string depend on when an effect ran.

`field-group` mints its own base and derives `-legend`, `-description` and
`-error`. Its `aria-describedby` goes on the `fieldset` itself, which is where
GOV.UK puts a group's hint and error, so a reader entering any control inside
hears it.

## Wiring

What the control receives from the field, unchanged from the field-primitive
design and restated because it is the family's invariant:

| Attribute          | When                                                         |
| ------------------ | ------------------------------------------------------------ |
| `id`               | always                                                       |
| `aria-describedby` | when a description or an error is present, merged after any value the consumer set |
| `aria-invalid`     | when the field is invalid                                    |
| `aria-required`    | when the field is required                                   |
| `disabled`         | when the field is disabled                                   |
| `readonly`         | when the field is read-only                                  |

`aria-required`, never the native `required`: `required` engages browser
constraint validation and changes submit behaviour, which the library must not
impose as a side effect of describing a field.

`disabled` is native, because removing the control from the tab order and from
submission is what the word means.

## The Group Disables Natively

`field-group` sets the native `disabled` on its `fieldset`, and the platform
disables every control inside with nothing propagated. It also writes
`data-disabled` on the fieldset and provides `disabled` to the fields, because
the platform disables the *controls* and the family still has to mute the
*labels*, which are not controls.

Ark's Fieldset ships the same capability; Base UI's takes no `disabled` at all.

## Defaults, Once

Both bindings let an application decide `size`, `labelPlacement`, `requiredMark`
and the two necessity words once. `field-group` provides the same values to the
fields inside it, through the same mechanism, so a compact section is one
attribute rather than one per field. Angular Material is the only surveyed
implementation with application-wide defaults, and only for Angular.

## Angular Owns the Message Elements; React Composes Them

The one place the bindings differ in shape, and the reason is Angular's input
model rather than a preference.

React's `FieldDescription` renders `<InlineMessage>` with the field's identifier
and size, because a React component may compute another component's props.

An Angular directive may not: `SlInlineMessage`'s public values are `input()`
signals, which nothing outside the template that instantiates it can write. A
directive sharing the element could only set attributes the component's own host
bindings then overwrite. So `SlField`'s template instantiates the message, and
the consumer marks the content that goes inside it:

```html
<div slField invalid>
  <label slFieldLabel>E-mail</label>
  <input slInput type="email" />
  <span slFieldDescription>Usaremos este endereço para a cobrança.</span>
  <span slFieldError>Informe um endereço válido.</span>
</div>
```

`slFieldDescription` and `slFieldError` are marker directives. `SlField` projects
each into a `<p slInlineMessage>` it renders itself, with the identifier, the
size, the tone and the disabled state already resolved. A message the consumer
did not write leaves the paragraph's text part empty, and the field hides it —
`inline-message` already withdraws its mark and its severity word in that case,
so the rule the field adds is one line.

The alternative — the consumer writing `<p slInlineMessage slFieldError>` — was
rejected for the reason the field-aware-controls design rejects two directives on
one element: the message would still need the field's identifier, and a directive
cannot give it one.

## Integration — React

| Question                                                                                            | Answered by                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does a mutable value ship a controlled and uncontrolled pair, plus the request carrying a reason?   | No mutable value. The field is told its state; the value belongs to the control and the validity to `form` in wave 3. The contract therefore declares no `stateModel`, and its test asserts the absence so it stays a decision. |
| Can an application set this family's defaults once, rather than per instance?                       | `FieldDefaultsProvider`, and `useFieldDefaults`. `FieldGroup` renders one for the fields inside it.                                                             |
| Can a consumer substitute the rendered element of each public part?                                 | `render` on `Field`, `FieldLabel`, `FieldControl`, `FieldCounter`, `FieldGroup` and `FieldGroupLegend`. The two message members forward `render` to `InlineMessage`, which already has it. |
| Does the consumer's own handler still run when the family handles the same event?                   | Neither family handles an event. Every native handler spreads onto its element untouched.                                                                       |
| Can a consumer reach the native element, and the imperative action it cannot express declaratively? | `ref` on every member. `useFieldIds()` returns the four identifiers, which is the escape hatch a consumer needs to point their own element at the control; there is nothing to call, because nothing moves. |
| Does it render on the server without a hydration mismatch?                                          | `useId` for the base identifier, no layout read during render, and the reflow is a container query rather than a measurement.                                    |
| Does every state a consumer may style appear in the DOM?                                            | `data-disabled`, `data-invalid`, `data-required`, `data-readonly` on the root and on the group, plus `data-size`, `data-label-placement` and `data-required-mark`. |
| Is each part's props type the native element's, extended — not a hand-written subset?               | `ComponentPropsWithRef<'div' \| 'label' \| 'input' \| 'span' \| 'fieldset' \| 'legend'>`, and `InlineMessageProps` for the two message members.                  |

## Integration — Angular

| Question                                                                           | Answered by                                                                                                                                                       |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does a two-way value use the signal form the ecosystem expects?                    | No two-way value, for the reason above. Every input is `input()`; there is no `output()` because nothing is requested.                                              |
| Does a control that belongs in a form work with Reactive Forms and template forms? | Neither family is a control: neither holds a value, and `ControlValueAccessor` on a `div` would register a form control that can never change. `text-field` implements it in wave 3, and reads `invalid` from the field the same way it reads `disabled`. |
| Can an application set this family's defaults once, rather than per instance?      | `FIELD_DEFAULTS` and `provideFieldDefaults()`. `SlFieldGroup` provides an overriding value for its own subtree.                                                     |
| Can a template reach the instance?                                                 | `exportAs` on all six directives — `slField` exposes the four identifiers and the resolved state, which is what a template needs to point its own element at the control. |
| Can a consumer substitute projected content, and keep it lazy?                     | Named `ng-content` slots on `SlField` and `SlFieldGroup`; `ngProjectAs` for a consumer's own component in a slot. Nothing needs re-rendering, so no `NgTemplateOutlet`. |
| Is it correct with zoneless change detection and `OnPush`?                         | Signals throughout: `input()`, `computed()`, `contentChild()`. No `markForCheck`.                                                                                    |
| Is every subscription and listener torn down?                                      | Neither family subscribes to anything or adds a listener.                                                                                                          |
| Does a static attribute the consumer wrote survive the host bindings?              | `HostAttributeToken` for `id` on both roots, as `inline-message` does for its own.                                                                                  |
| Does an entry point that others depend on stay a single class?                     | `@slotted/angular/field` imports `@slotted/angular/inline-message`; `@slotted/angular/field-group` imports `@slotted/angular/field`. Both by the published path, held by `packages/angular/src/bundle.boundaries.test.mjs`. |

## Contract Break

`field` and `fieldset` shipped. Both public APIs change, and
`docs/component-features.md` section 18 item 12 requires the move to be written.

| Before                                        | After                                                | How a consumer moves                                                                        |
| --------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `data-slotted-component="field"`, `.slotted-field` | `data-ui="field"`                               | Replace the selector. A class was never contract; `data-ui` is.                              |
| `<Fieldset>` / `slFieldset`                   | `<FieldGroup>` / `slFieldGroup`                      | Rename. The element is still `fieldset` and the legend is still a `legend`.                   |
| `Fieldset` `orientation`                      | `FieldGroup` `orientation`, same two values          | Unchanged in meaning: how the fields inside flow.                                             |
| `required={false}` and the other three states | `required` unset                                      | Remove the explicit `false`. Passing `false` still works and now means "not required, whatever the group says", which is what it always read as. |
| `<FieldDescription>` was a bare `p`           | it renders `inline-message`                          | Nothing to change in the call site. The element gains a glyph, a tone and a clipped severity word. |
| No `size`, `labelPlacement`, `requiredMark`, counter | all four                                      | Nothing to change: every one of them has a default that reproduces the old rendering, except the required marker, which was always drawn and still is. |

## Out of Scope

Submission, validation orchestration, `touched`, `dirty` and the error summary
belong to `form`, wave 3 item 8. Adornments inside the control's frame belong to
`text-field`, wave 3 item 2. Neither is deferred for want of time: both sit
inside another family's border.
