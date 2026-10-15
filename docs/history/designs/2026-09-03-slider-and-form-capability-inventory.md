# Slider and Form capability inventory

Produced before either family was designed or read, as
`.claude/skills/component/references/capability.md` requires. Both families are
new: `docs/process/build-order.md` lists `slider` as item 7 and `form` as item 8 of
wave 3, and neither had a scope paragraph before this work.

Sources were read on 3 September 2026.

---

# Slider

## 1. Surveyed

| Implementation                                                                                     | Called                                | Read at                                                                          |
| -------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------- |
| WAI-ARIA Authoring Practices                                                                       | Slider Pattern; Slider (Multi-Thumb)  | <https://www.w3.org/WAI/ARIA/apg/patterns/slider/>, `.../slider-multithumb/`      |
| HTML                                                                                               | `<input type="range">`                | <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range> |
| Radix Primitives                                                                                   | Slider                                | <https://www.radix-ui.com/primitives/docs/components/slider>                      |
| Base UI 1.7.0                                                                                      | Slider                                | <https://base-ui.com/react/components/slider>                                     |
| Ark UI 5.39.1 (Zag)                                                                                | Slider                                | <https://ark-ui.com/docs/components/slider>                                       |
| React Aria                                                                                         | Slider                                | <https://react-spectrum.adobe.com/react-aria/Slider.html>                         |
| Angular Material (source)                                                                          | `mat-slider` + `input[matSliderThumb]` | <https://github.com/angular/components/blob/main/src/material/slider/slider.ts>   |
| Mantine 9.6                                                                                        | Slider, RangeSlider                   | <https://mantine.dev/core/slider/>, `https://mantine.dev/llms/core-slider.md`     |
| Carbon                                                                                             | Slider, Range slider                  | <https://carbondesignsystem.com/components/slider/usage/>                         |

The set disagrees on the one decision that matters most. Angular Material and
Base UI put a real `<input type="range">` under every thumb; Radix and Ark
render a `span[role="slider"]` and add a hidden input only for submission;
React Aria and Mantine render neither and drive everything from JavaScript.

## 2. Table stakes

Every capability two or more of the surveyed implementations ship.

| Capability                                     | Who ships it                                             | Verdict | Reason                                                                                                                                                                         |
| ---------------------------------------------- | -------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `min`, `max`, `step`                           | all nine                                                 | adopt   | The scale itself.                                                                                                                                                              |
| Single value and multiple thumbs in one family | Radix, Base UI, Ark, React Aria, Material, Mantine       | adopt   | `value` is `number \| number[]`. Splitting them would be two families answering one question.                                                                                  |
| Controlled and uncontrolled value              | Radix, Base UI, Ark, React Aria, Mantine                 | adopt   | `docs/state-and-events.md` requires both of every mutable value.                                                                                                               |
| A commit event distinct from the change event  | Radix (`onValueCommit`), Base UI, Ark, Mantine (`onChangeEnd`), Material | adopt   | A drag emits a hundred changes and one commit. They are two transitions, not two events for one.                                                                               |
| `orientation`                                  | Radix, Base UI, Ark, React Aria, Mantine, APG            | adopt   | Vertical is a real requirement — a mixing desk, a temperature — and the APG names `aria-orientation` for it.                                                                    |
| `disabled`                                     | all nine                                                 | adopt   | Native, on every input.                                                                                                                                                        |
| Form submission by `name`                      | Radix, Base UI, Ark, Material, Mantine                   | adopt   | One `input[type=range]` per thumb carries it, so a range submits two values under one name.                                                                                    |
| Minimum distance between thumbs                | Radix (`minStepsBetweenThumbs`), Base UI (`minStepsBetweenValues`) | adopt   | Named `minStepsBetween`. Implemented by moving each input's own `min`/`max` to its neighbour, which is what the multi-thumb pattern requires of `aria-valuemin`/`aria-valuemax`. |
| Marks / ticks                                  | Ark, Mantine, Material (`showTickMarks`), Carbon, HTML `list=` | adopt   | Values with optional labels, positioned on the track.                                                                                                                          |
| A value read-out                               | Base UI (`Value`), Ark (`ValueText`), React Aria (`SliderOutput`), Carbon | adopt   | An `<output>` part, formatted by `Intl.NumberFormat`.                                                                                                                          |
| A value bubble on the thumb                    | Material (`discrete`), Mantine (`label`), Ant, Kendo     | adopt   | A `bubble` part inside each thumb, on an axis: `auto` while dragging or focused, `always`, `none`.                                                                              |
| Locale-aware formatting                        | Base UI (`format`), React Aria (`formatOptions`), Mantine (`label` fn) | adopt   | `Intl.NumberFormatOptions` plus an explicit `locale`, reusing `@slotted/core/number` so it cannot disagree with `number-field`.                                                 |
| A larger step for Page Up / Page Down          | Base UI (`largeStep`), APG (optional), browsers          | adopt   | `largeStep`, default `step * 10` — the same default `number-field` already ships.                                                                                              |
| Per-thumb accessible name                      | Base UI (`getAriaLabel`), React Aria (`thumbLabels`), Ark, Mantine (`thumbLabel`), APG multi-thumb | adopt   | `thumbLabels`, and the field's label when there is one thumb.                                                                                                                  |
| `aria-valuetext`                               | APG, Base UI, Ark, Mantine (`thumbValueText`)            | adopt   | The formatted string, always — `aria-valuenow` alone announces `1480` for a control showing `R$ 1.480,00`.                                                                      |
| Origin of the filled portion                   | Ark (`origin`), Mantine (`startPointValue`)              | adopt   | `origin`: `min`, `max` or a number, for a balance control that fills outward from nought.                                                                                       |
| Dragging state in the DOM                      | Radix, Ark (`data-dragging`), Base UI                    | adapt   | The vocabulary in `specs/contract.schema.mjs` has `data-dragging`, so no new state is invented.                                                                                 |
| Invalid / read-only                            | Ark (`invalid`, `readOnly`), Carbon                      | adopt   | Both, from the field around it, per the field-aware controls design.                                                                                                           |
| Track press moves the nearest thumb            | Radix, Base UI, Ark, Material, Mantine                   | adopt   | And starts a drag from the same press.                                                                                                                                         |
| `inverted` / reversed scale                    | Radix, Mantine                                           | decline | `origin` answers the case that motivates it — where the fill starts — and a reversed scale is a formatting decision the `format` option and a negative range already express. Two answers to one question is what this library refuses. |
| `scale` (non-linear value mapping)             | Mantine only                                             | decline | One source. A consumer maps the value themselves in `onValueChange`, and `format` writes the mapped one.                                                                        |
| `domain` separate from `min`/`max`             | Mantine only                                             | decline | One source.                                                                                                                                                                    |
| `restrictToMarks`                              | Mantine only                                             | decline | One source; `step` plus marks on the same grid expresses it.                                                                                                                    |
| A paired number input                          | Carbon only                                              | defer to `number-field` | The family exists and composes: `docs/component-features.md` recommends the pairing rather than requiring the slider to own a second control. The reference page demonstrates the composition. |

## 3. Differentiators

| What                                                                     | Why this library can                                                                                                                                                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The thumb is a real `input[type="range"]`, in both bindings.**          | Angular Material does it in Angular and Base UI does it in React; nobody does it in both. It brings the `slider` role, the value set, form submission, form reset and `:disabled` from the platform. |
| **Three colour schemes, three densities, RTL and vertical from one authored stylesheet.** | No surveyed implementation ships a high-contrast scheme, and the ones that ship density ship it as a class rather than as a retunable scale.                                                        |
| **The keyboard is the family's, not the browser's.**                     | Browsers disagree about Page Up on a range input — Chrome moves by a tenth of the range, Firefox by a step. Owning the table makes `largeStep` mean the same thing in both bindings and every browser. |
| **Two thumbs cannot cross, and the accessibility tree says so.**          | Each input's own `min`/`max` follows its neighbour, which satisfies the multi-thumb pattern's requirement that `aria-valuemin`/`aria-valuemax` of dependent sliders update — Radix and Ark clamp in script and leave the announced range wrong. |
| **The field wires it.**                                                  | Label, description, error, `aria-describedby`, `disabled`, `readonly` and the identifier arrive from the `field` around it with nothing written, which no surveyed implementation offers.           |

## 4. Gaps

| What no surveyed implementation handles well                          | What this family does                                                                                                                                                             |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read-only.** `input[type=range]` ignores `readonly` entirely.       | The family refuses every pointer and key change and writes `aria-readonly`, so a read-only slider is focusable and copyable and is not disabled. Ark declares `readOnly` and Radix, Base UI, React Aria and Material have no such state at all. |
| **A mark label longer than the space between two marks.**             | Mark labels are their own bidi run, wrap to two lines, and the track reserves the block space they take, so a labelled scale does not overlap the control below it.                |
| **A thumb at the end of the track.**                                  | The thumb is contained inside the control rather than centred on the end of the track, so the first and last values are still hittable and the focus ring is not clipped.          |
| **Zero-length ranges.** `min === max` divides by nothing.             | `percentOf` in `@slotted/core/measure` already answers nought for an empty span; the family draws a full-width track and a thumb at the start rather than `NaN`.                   |
| **The value bubble under `prefers-reduced-motion`.**                  | The bubble appears without a transform animation and the thumb still moves; nothing loops.                                                                                          |

---

# Form

## 1. Surveyed

| Implementation                | Called                        | Read at                                                                        |
| ----------------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| HTML and WCAG 2.2             | `<form>`, SC 3.3.1            | <https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html>          |
| Base UI 1.7.0                 | Form                          | <https://base-ui.com/react/components/form>                                     |
| Radix Primitives              | Form                          | <https://www.radix-ui.com/primitives/docs/components/form>                      |
| React Aria                    | Form                          | <https://react-spectrum.adobe.com/react-aria/forms.html>                        |
| Angular Reactive Forms        | `FormGroupDirective`, `NgForm` | <https://angular.dev/guide/forms/reactive-forms>                                |
| Angular Signal Forms (v22)    | `form()`, `submit()`, `[field]` | `node_modules/@angular/forms/types/signals.d.ts`, `@publicApi 22.0`             |
| GOV.UK Design System          | Error summary                 | <https://design-system.service.gov.uk/components/error-summary/>                |
| Carbon                        | Form                          | <https://carbondesignsystem.com/components/form/usage/>                         |
| Mantine `@mantine/form`       | `useForm`                     | <https://mantine.dev/form/use-form/>                                            |

The set disagrees about who owns the values. Base UI and Radix own nothing and
build on native constraint validation; React Aria owns nothing and consumes
errors from a server action; Mantine and Angular own the whole model.
`docs/component-features.md` § 6 settles it for this library: the form
"coordena submit, reset, validação, touched/dirty, mensagens globais e foco no
primeiro erro **sem possuir o estado de cada framework**".

## 2. Table stakes

| Capability                                      | Who ships it                                          | Verdict | Reason                                                                                                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native constraint validation as the floor       | Radix, Base UI, React Aria (`validationBehavior`)     | adopt   | `novalidate` is written so the browser's own bubble does not replace the family's message, and `checkValidity()` still supplies `validationMessage` per control.           |
| External errors keyed by control name           | Base UI (`errors`), React Aria (`validationErrors`)   | adopt   | `errors: Record<string, string \| string[]>`, keyed by the `name` attribute — the key the platform already uses.                                                            |
| Server errors clear when the field changes      | Base UI, React Aria, `docs/component-features.md` § 6 | adopt   | The form listens for `input` on itself and drops the entry whose `name` matches.                                                                                          |
| When validation runs                            | Base UI (`validationMode`), Mantine (`validateInputOnChange`) | adopt   | `validate`: `submit`, `blur`, `change`, `none`. `submit` is the default and re-validates on change afterwards.                                                             |
| Submit is asynchronous and reports its state    | Base UI, React Aria, Mantine, Angular                 | adopt   | `onSubmit` may return a promise; the root carries `data-loading` and `aria-busy`, and a second submit while one is pending is refused.                                     |
| Focus after a failed submit                     | Radix ("focus is fully managed"), GOV.UK, WCAG 3.3.1  | adopt   | `errorFocus`: `summary` (the GOV.UK answer, and the default), `control`, `none`.                                                                                          |
| An error summary listing every error            | GOV.UK, Carbon, Base UI (as a pattern)                | adopt   | A `region` with a heading, a list, and a link per error pointing at the control's own identifier — the four things GOV.UK states as "You must".                            |
| Reset                                           | HTML, Mantine, Angular                                | adopt   | The native reset event clears the error map and the submitted flag; nothing is re-implemented.                                                                            |
| Imperative validate / submit / reset            | Base UI (`actionsRef.validate`), Mantine, Angular     | adopt   | `validate()`, `submit()`, `reset()` and `focusFirstError()`, and nothing else.                                                                                             |
| Reactive Forms integration                      | Angular                                               | adopt   | The directive injects `ControlContainer`, marks every control touched on submit, and reads `AbstractControl.errors` through a message registry.                            |
| Signal Forms integration                        | Angular 22                                            | adapt   | Signal Forms binds a `ControlValueAccessor` for backwards compatibility, so every Slotted control already works under `[field]`. The form family adds nothing and the reference page says so, rather than shipping a second integration nobody can test against a stable API. |
| Application-wide defaults                       | Base UI, Mantine, Angular                             | adopt   | A React provider and an Angular injection token, both carrying the summary's words and the validation policy.                                                              |
| Per-field message components                    | Radix (`Form.Message match=`), Base UI (`Field.Error`) | defer to `field` | `field` already owns the label, the description and the error, and `inline-message` draws them. A second message family would be two answers to one question. |
| A schema-first API                              | Mantine (`zodResolver`), Angular Signal Forms         | decline | `docs/component-features.md` § 6: "Não gera formulários por schema como única via." A consumer runs their schema in `onSubmit` and returns the error map; two or three lines. |
| Value, touched and dirty state per field        | Mantine, Angular                                      | decline | The form must not own the state of each framework. Reactive Forms owns it in Angular and the consumer's own state owns it in React; the form reads `dirty` from the DOM only for the unsaved-changes guard. |
| An action row                                   | Carbon, Polaris, Fluent, Material                     | adopt   | An `actions` part. `inline` can end-align a row, but the reflow to a full-width stacked column below a container width needs a container query the consumer would have to write for every form. |

## 3. Differentiators

| What                                                                          | Why this library can                                                                                                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **One error map, three sources.** Native constraint validation, the `errors` input, and whatever `onSubmit` returns all merge into one ordered map. | No surveyed implementation merges the platform's own messages with a server's. Base UI takes external errors only; Radix takes native only.               |
| **The summary is ordered by the DOM, not by the object.**                     | `form.elements` is in document order, so the list a reader is given matches the order they will fix the fields in. An object's key order is the server's. |
| **The same family in both bindings.**                                         | Radix and Base UI are React-only; Reactive Forms is Angular-only. The submit lifecycle, the error map and the summary are one contract with two idioms.  |
| **The summary answers three schemes and three densities.**                     | It reads `inline-message`'s own tone tokens, so an error summary in `high-contrast` is not a red box that turned black.                                  |

## 4. Gaps

| What no surveyed implementation handles well                                   | What this family does                                                                                                                                        |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Leaving a half-filled form.** None of the nine guards it.                     | `guardUnsaved` registers a `beforeunload` listener while the form is dirty and removes it on submit and on reset.                                             |
| **The second submit.** A double-clicked button submits twice in Radix and in a bare `<form>`. | A submit while one is pending is refused, and the state is in the DOM as `data-loading` so the button can say so.                                             |
| **An error for a control that is not in the form.** A server may name a field the page no longer renders. | Such an error is kept in the summary, without a link, rather than dropped silently — a message a reader cannot reach is still a message they must be given.  |
| **A hundred errors.** GOV.UK lists every one; Carbon shows a count.             | The summary lists every error and the region is scrollable rather than truncated: `docs/build-briefing.md` forbids removing content from the DOM.           |
| **A form inside a form.** Illegal in HTML and produced by composition anyway.   | A nested `form` element is refused by the parser, so the family scopes every query to its own element rather than to the document, and a second `form` family instance inside the first one still reads its own controls. |
