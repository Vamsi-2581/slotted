# Number Field Design

## Outcome

One numeric value, formatted for a locale, steppable by keyboard and by two
buttons, in a frame that is not the control. The inventory beside this document
— `2026-09-03-number-field-capability-inventory.md` — says what the field
ships; this says what this family is and why each decision fell the way it did.

## The Element Cannot Be `input[type=number]`

The platform's own answer supplies the role, the value, `stepUp()`,
`stepDown()` and constraint validation, and the library's law is to prefer it.
It is refused anyway, for one reason that is not a preference: **it cannot hold
a formatted number.** The HTML value sanitization algorithm for `type="number"`
sets the value to the empty string when the text is not a valid floating-point
number, and `R$ 1.480,00` is not one. No grouping separator, no currency
affix and no `pt-BR` decimal comma survives it.

Carbon states the same boundary in its own props — `formatOptions` and `locale`
"use with `type="text"`, has no effect when `type="number"`" — and every
surveyed implementation that formats a value uses `type="text"`. MDN's own
accessibility note reaches the same place from the other side: "if spinbutton is
not an important feature for your form control, consider not using
`type="number"`. Instead, use `inputmode="numeric"`."

**Cost, recorded rather than hidden:** the family gives up native constraint
validation (`:invalid`, `validity.rangeOverflow`, `stepMismatch`), native
`stepUp`/`stepDown`, and the user agent's own spinner. It re-implements the
range as `aria-valuemin`/`aria-valuemax` plus `data-invalid`, and the step as
its own arithmetic in `@slotted/core/number`. A consumer who wants browser
constraint validation writes `min`, `max` and `step` on the hidden input the
family already renders for form submission — the same escape hatch the
`required`-versus-`aria-required` rule leaves open.

## The Role Is `spinbutton`, and the Cost Is Named

The APG's Spinbutton Pattern puts `role="spinbutton"` on the focusable element
with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`.
Zag and PrimeNG do exactly that on a text input. React Aria and Base UI do not:
React Aria strips the role and every `aria-value*` property, and its source
carries the reason in a comment — "override the spinbutton role, we can't focus
a spin button with VO" — replacing them with `aria-roledescription` and an
**assertive live announcement** of the value on every change.

This family takes the APG's role, for three reasons:

1. It is the sourced pattern, and `docs/component-features.md` §2.8 says to use
   the APG pattern where no native element suffices. One does not.
2. Without the role there is nothing declarative left that says a maximum
   exists. A reader who cannot see the field learns the bound only by hitting
   it.
3. React Aria's substitute needs a live announcer. This library's is wave 5
   infrastructure and does not exist yet; a family that announced its own value
   through a hand-rolled live region would be the second implementation of a
   thing `live-announcer` is scheduled to own once.

**The cost:** if macOS VoiceOver mishandles an ARIA-applied `spinbutton` on a
text input the way React Aria's comment says it did, a VoiceOver user's text
editing inside this control is degraded. It could not be verified on this
machine and is raised at the human gate under the briefing's second category.
`aria-roledescription` is deliberately **not** set beside the role: renaming a
role the pattern already names hides it.

The two stepper buttons carry `tabindex="-1"` — the APG's "the text field is
usually the only focusable component", and what Zag and React Spectrum both do.
They stay in the accessibility tree with real names and `aria-controls`, so a
screen-reader cursor reaches them even though Tab does not; a back-office form
of twenty amounts would otherwise cost forty extra tab stops.

## The Frame Is Not the Control

The same anatomy `text-field` established, and for the same WAI-ARIA reason: a
`spinbutton` — like a `textbox` — may hold only non-interactive, presentational
children, so the two buttons are the control's **siblings** inside a box with no
role.

| `data-part` | Element                            | Always | What it is                                                                                              |
| ----------- | ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `root`      | `div`, or what `render` returns    | yes    | The frame. Carries `data-ui="number-field"`, the axes and the mirrored states. No role.                  |
| `input`     | `input[type=text]`                 | yes    | The control: `role="spinbutton"`, the `aria-value*` set, the identifier and every native attribute.       |
| `start`     | `span`                             | no     | An adornment before the value in the reading direction.                                                   |
| `end`       | `span`                             | no     | An adornment after the value in the reading direction.                                                    |
| `stepper`   | `span`                             | no     | The box the two buttons share. `display: contents` under `stepper="split"`.                              |
| `decrement` | `button[type=button][tabindex=-1]` | no     | Steps down by `step`, or by `largeStep` with Shift and `smallStep` with Alt. `disabled` at `min`.         |
| `increment` | `button[type=button][tabindex=-1]` | no     | Steps up by the same three amounts. `disabled` at `max`.                                                  |

`stepper` exists so that one DOM tree serves both layouts. Under `stacked` it
is a two-row column at the inline end with a hairline between the halves; under
`split` it becomes `display: contents` and the two buttons take their places
through `order`, decrement first and increment last, in **logical** order — so a
right-to-left document mirrors the control with no `[dir]` rule and no flipped
glyph. Two DOM shapes for two layouts would have made the layout a structural
choice a consumer cannot change after render.

A hidden `input[type=hidden]` carries the raw number under `name` when a `name`
is given. The visible control holds the *formatted* string, and submitting
`R$ 1.480,00` to a server expecting `1480` is the defect this avoids. It is not
a public part: it is not styleable and nothing may select it.

## Text Belongs to the Element; the Number Belongs to the Family

Two values, and confusing them is the defect every one of the surveyed
implementations warns about in one prop or another.

- **The text** is whatever the reader has typed. It lives on the element. It is
  never rewritten while the reader is typing, so the caret is never restored
  from a position the family invented.
- **The number** is `number | null` and it is what `value`, `defaultValue` and
  `onValueChange` speak in. `null` is empty, and empty is not nought: a required
  amount left blank and an amount of nought are different facts.

The number moves on every keystroke that parses. A partially typed value (`-`,
`1,`, `1.2e`) leaves the text alone and the number where it was.

When the **text** takes the locale's shape is `formatOn`, and it is `change` by
default. See *Formatting While Typing* below; the first release of this family
formatted only at a commit, and the decision was reopened and reversed.

Under `clamp="strict"` a keystroke that would leave the range is refused at
`beforeinput`, so the text never shows a value the field will not hold. The
filter is skipped while an IME composition is in progress: a Japanese
full-width `１２３` is committed and then parsed, rather than refused character
by character.

## Formatting While Typing

`formatOn: 'change' | 'commit'`, default `change`. Reversed after the family
shipped, and the reason it shipped the other way is written here rather than
removed.

**What shipped, and why it was wrong.** The first release rewrote the text only
at a commit, on one stated ground: "reformatting mid-keystroke moves the caret
under the reader's hands." That is a true statement about an implementation and
a false one about the idea. Grouping exists to make a long number scannable, and
the moment a reader most needs to check a magnitude — a thousand or ten
thousand, a hundred reais or a hundred thousand — is the moment they are getting
it wrong. A field that shows `1234567` until focus leaves withholds the one
thing the format is for at exactly the wrong time. On a `BRL` field the reader
went from `1234567` straight to `R$ 1.234.567,00` in one jump, with no
announcement.

**The field is split, and the split is not where the first decision put it.**

| Formats on commit                                    | Formats as it is typed                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| React Aria, Base UI, Zag/Ark, Carbon, Fluent v9      | Mantine (react-number-format), Ant with `formatter`, PrimeNG, PrimeReact, imask, ngx-mask |

Both halves are real, so neither is "what the field does". What settles it is
that both commit-formatting libraries carry a request for the other behaviour —
`mui/base-ui#3350` ("option to apply number formatting as you type", open, with
the maintainers describing the current behaviour as "just onBlur") and
`adobe/react-spectrum#9018` (instant formatting in NumberField). The model this
family inherited is the one its own sources' users are asking to leave.

**The accessibility argument is folklore, and the evidence runs the other way.**
No WCAG success criterion, no Understanding document and no APG guidance
addresses rewriting an input's text while the reader types; no published
screen-reader matrix covers it. What *is* in the sources is React Aria's
`commitAndAnnounce()`, which snapshots the input value, commits inside
`flushSync`, and calls `announce(value, 'assertive')` when the text changed —
an assertive live announcement placed on **blur**, because a silent rewrite at
blur is the thing that needs compensating. This library's `live-announcer` is
wave 5 infrastructure and does not exist, so the commit-only model was the one
it could not make accessible. Formatting on change has no jump to announce: the
text changes by one keystroke's worth, in answer to that keystroke.

**One library, one answer.** `currency-field`'s default `entry="cents"` already
regroups after every edit. A `number-field` that waited for blur made this
library answer the same question two ways, decided by which family a consumer
reached for.

### What it costs, and where each cost is paid

Everything below is in `@slotted/core/number`, tested in `number.test.ts`, and
shared by both bindings.

- **The caret is counted in the reader's own characters, not in string
  indices.** A separator appears between two keystrokes and every index after it
  moves; a caret restored to index 4 of `1,234` sits before the `4`, and the
  next keystroke produced `12,354`. Digits, the decimal separator and the sign
  are the reader's; a grouping separator is the family's and is not counted.
- **The fraction is never handed to `Intl`.** The whole part is regrouped and
  given the format's affixes through `formatToParts`, and the fraction the
  reader typed is spliced in after the last integer part — which is the end of
  the *number*, not of the string, so a locale writing `1.234,5 €` keeps the
  symbol outside. Nothing rounds, pads or trims: `1,50` keeps its nought and
  `1,` keeps its separator. react-number-format needs `fixedDecimalScale` to
  reach the same place.
- **Backspace against a separator takes the digit.** Deleting punctuation the
  next regrouping puts straight back is a keystroke that does nothing, and the
  reader presses the key twice to lose one digit. `deleteAcrossSeparator`
  detects a single-character deletion that removed nothing of the reader's and
  removes the nearest character that is. react-number-format instead hops the
  caret over the separator and consumes the keystroke (`numeric_format.tsx`);
  imask widens the removal range. This takes imask's side: a key that deletes
  something is better than a key that moves the caret.
- **An IME is left alone.** A run reshaped half way through is a run the engine
  can no longer finish, so a composing keystroke sets the text and nothing else.
  react-number-format's `#843` is this defect, still open.

### Three formats left to the commit

Each returns the reader's text untouched rather than guessing:

- **Past fifteen integer digits**, where a double stops holding the integer
  exactly and a regrouped text would stop being the text that was typed. The
  same ceiling `currency-field` puts on its digit run.
- **A significant-digit format** (`maximumSignificantDigits`), which rewrites
  the whole part itself — 1234 becomes 1230 — so there is no shape to regroup a
  half-typed number into.
- **The accounting sign** (`currencySign: 'accounting'`), where a negative is
  parentheses rather than a minus. Reshaping `-12` into `(R$ 12)` puts the next
  keystroke outside a bracket the parser strips as an affix, and the amount
  silently loses its sign.

### The break, and how a consumer moves

`number-field` and `currency-field` under `entry="natural"` now regroup while
the reader types. A consumer relying on the previous behaviour writes
`formatOn="commit"` on the control, or `formatOn: 'commit'` on
`NumberFieldDefaultsProvider` / `provideNumberFieldDefaults` to restore it for a
whole application in one place. Nothing else changes: the value, the reasons,
the clamp policy, the keyboard and the commit are what they were.

## `@slotted/core/number` — the Parser Both Bindings Share

A new core entry point, and the fourth after `state`, `measure` and `identity`
to exist because two bindings must not disagree about arithmetic.

```ts
createNumberFormat({ locale, options }) // -> format, parse, isPartial, …
stepNumber({ value, direction, step, min, max, stepFrom, snapToStep })
```

The parser is built from `Intl.NumberFormat(...).formatToParts()` rather than
from configured separators: the locale's group separator, decimal separator,
minus sign, currency and unit affixes and **numbering system** are read out of
the formatter that will write the value back. Pasting `R$ 1.480,00` into a
`pt-BR` currency field yields `1480`; pasting `١٬٤٨٠` into an `ar-EG` field
yields the same number. Ant, Mantine and PrimeNG each wrote this inside a
component of one framework, which is why their two ecosystems cannot agree on
what `1.234` means.

Stepping rounds to the decimal count `step` implies — Fluent's rule — so
`0.1 + 0.2` is `0.3` and not `0.30000000000000004`. `clamp` and `roundTo` come
from `@slotted/core/measure` rather than being written a second time.

`measure`'s own rule applies: a core module is designed against a real caller
and stays malleable until a second confirms it. `number-field` is the first
caller; `slider` (wave 3) and `date-field` (wave 7) are the two that will
confirm it.

## Keyboard

Every row is the pattern's, or names the implementation it is adapted from.

| Key                   | Effect                                    | Source                              |
| --------------------- | ----------------------------------------- | ----------------------------------- |
| `ArrowUp` / `ArrowDown`   | ± `step`                              | APG                                 |
| `Shift` + arrow       | ± `largeStep` (default `step × 10`)       | Base UI, Ark                        |
| `Alt` + arrow         | ± `smallStep` (default `step ÷ 10`)       | Base UI, Ark                        |
| `PageUp` / `PageDown` | ± `largeStep`                             | APG (optional), React Aria, Fluent  |
| `Home`                | `min`, only when `min` is stated          | APG                                 |
| `End`                 | `max`, only when `max` is stated          | APG                                 |
| `Enter`               | Commits, then submits the form            | Platform; Ark commits, and so does this |
| Every text-editing key | The browser's, untouched                 | APG's explicit note                 |

Focus never leaves the control: every key above acts on the value and the
element that has focus keeps it. Nothing is bound to `Escape`, for the reason
`text-field` records.

`Enter` is committed **and not** intercepted: a single-line control submits its
form, which is the platform's behaviour and one a form of one field depends on.

The wheel is not bound unless `wheel` is set, and even then only while the
control has focus and the pointer is over it. `docs/component-features.md`
states the rule for this family and MDN gives the reason.

## Unset Means "Ask the Field"

Unchanged from `docs/history/designs/2026-08-31-field-aware-controls-design.md`
and restated only where this family differs: `disabled`, `readOnly` and
`invalid` are `undefined` by default; `disabled` and `readonly` are native;
necessity is `aria-required` and never the native `required`. Three states are
mirrored onto the frame — `data-disabled`, `data-invalid`, `data-readonly` — and
`required` is not, because the label draws the necessity mark and the frame
paints nothing for it.

`size` is read from the field before the application defaults, so a `size="sm"`
field holding an `md` control cannot happen.

## `inputMode` Is Derived From the Format, Not From the Device

React Aria picks `inputMode` by sniffing iPhone and Android, because the two
platforms disagree about which keys `numeric` and `decimal` offer. This family
does not: a user-agent check during render is a hydration mismatch, and
`frameworks.md` forbids reading the environment there.

The rule is derived from props alone:

- negatives possible (`min` absent or below nought) → `text`, because neither
  numeric keypad offers a minus sign on every platform;
- otherwise a fraction possible → `decimal`;
- otherwise → `numeric`.

A consumer who knows better writes `inputMode` on the control and it survives.

**Cost:** a positive-only field is the common case and gets the best keypad; a
signed field gets the full keyboard rather than a keypad with a missing key.
That is one keyboard too wide on a phone, and it is preferred to a value the
reader cannot type at all.

## The Two Ways to Put a Symbol Beside a Number

Both exist, and the reference page shows them together because choosing wrongly
is the mistake.

- `format={{ style: 'currency', currency: 'BRL' }}` puts `R$` **inside** the
  value. It moves with the locale, it is part of what the reader copies, and it
  is what `aria-valuetext` announces.
- `start="R$"` puts it **outside**, as a sibling. It is never selected, never
  copied and never parsed, and it is the right answer when the symbol is a
  label rather than part of the number.

Mantine's `prefix`/`suffix` and Ant's `formatter` blur the two. This family
does not.

## The Framework Integration Tables

Every line answered, as `frameworks.md` requires, before either binding is
written.

### React

| Question                                                              | Answered by                                                                                                                            |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason     | `value` / `defaultValue` / `onValueChange(value, request)`, over `createControllable`. Reasons: `keyboard`, `pointer`, `blur`, `programmatic`. |
| Application defaults set once                                         | `NumberFieldDefaultsProvider` and `useNumberFieldDefaults()`, carrying `size`, `variant`, `stepper`, `locale`, `clamp`, `incrementLabel`, `decrementLabel`. |
| Substituting the rendered element of each public part                 | `render` on the frame. The control, the stepper and the two buttons are fixed: the control holds the value and the identifier, and the buttons are the family's own behaviour. Adornments are `ReactNode`, so they are already the consumer's elements. |
| The consumer's own handler still runs                                 | `onChange`, `onBlur`, `onKeyDown`, `onWheel` and `onPaste` are called first and always, then the family acts. `event.defaultPrevented` is honoured. |
| Reaching the native element and the imperative action                 | `ref` reaches the `input` — `focus()`, `select()`, `setSelectionRange()` are the platform's. `handle` exposes `increment()` and `decrement()`, which a consumer cannot express declaratively; both report reason `programmatic`. |
| Server rendering with no hydration mismatch                           | `useId` for the hidden input's relationship, no user-agent check and no layout read during render. `Intl.NumberFormat` is memoised on `locale` and `format`, not on anything measured. |
| Every state a consumer may style is in the DOM                        | `data-disabled`, `data-invalid`, `data-readonly` on the frame; `disabled` on each stepper at its bound.                                   |
| Part props typed as the native element's, extended                    | `ComponentPropsWithRef<'input'>` minus `defaultValue`, `size`, `step`, `type` and `value`, each redeclared for this family's meaning.      |

### Angular

| Question                                                        | Answered by                                                                                                                                                     |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A two-way value in the shape the ecosystem expects              | `ControlValueAccessor` on the control, plus `output()` `valueChange` carrying the request. There is no `[(value)]`: a two-way binding has one slot and can carry neither a reason nor `cancel()` — the rule `text-field` set. |
| Reactive Forms and template forms                               | `NG_VALUE_ACCESSOR` on `SlNumberFieldInput`, with `setDisabledState`. No `Validator`: `min`, `max` and `step` are reported, and *when* an error shows is the form's policy. |
| Application defaults set once                                   | `NUMBER_FIELD_DEFAULTS` and `provideNumberFieldDefaults()`.                                                                                                        |
| A template reaching the instance                                | `exportAs: 'slNumberField'` on the frame and `'slNumberFieldInput'` on the control, which exposes `inputElement`, `increment()` and `decrement()`.                  |
| Substituting projected content, kept lazy                       | `<ng-content select="[slNumberFieldStart]">` and `[slNumberFieldEnd]`; the frame is a directive on the consumer's own element, so the box itself is already theirs. |
| Zoneless change detection and `OnPush`                          | Signals throughout — `input()`, `output()`, `computed()`, `signal()` — with `ChangeDetectionStrategy.OnPush` and no `markForCheck`.                                 |
| Every subscription and listener torn down                       | The auto-repeat timer is cleared in a `DestroyRef` callback as well as on pointer-up, so a button unmounted mid-press leaves no timer.                              |
| A static attribute the consumer wrote survives the host bindings | `HostAttributeToken` for `id`, `inputmode`, `aria-describedby`, `aria-invalid`, `aria-required` and `readonly`, read before the binding computes.                    |
| An entry point that others depend on stays a single class       | `@slotted/angular/number-field` imports `@slotted/angular/field` by its published path, never a relative one.                                                        |

The asymmetry is deliberate and is not levelled down: Angular gets
`ControlValueAccessor` and DI-provided defaults because its ecosystem has them;
React gets `render` and a context provider because its ecosystem has those.

## Angular Pays One Element for the Frame

`SlNumberFieldInput` injects `SlNumberField` without `optional`, so a control
written outside the frame fails at construction rather than silently losing its
border, its ring and the place its two buttons stand. The frame queries the
control through an abstract `SlNumberFieldControl` class, which is how two
directives depend on each other without a cycle — the shape `text-field` and
`field` both already use.

## What This Family Deliberately Does Not Have

Each of these is a row in the inventory with its full reason; they are listed
here so a reader of this document does not have to open the other one to learn
that the absence was decided.

- **A scrub area.** Base UI and Ark ship one; it needs the Pointer Lock API and
  Base UI disables it in Safari itself. A design tool's gesture, not a
  back-office form's.
- **A `formatter`/`parser` pair.** `format` and `locale` express it, and a
  format `Intl` cannot write is a string, which is `text-field`'s.
- **`bigint` or string-mode precision.** The value is a `number`; a ledger with
  twenty significant digits uses `text-field` and its own decimal library.
- **A clear button.** The frame's inline end already holds the stepper. The
  `end` slot takes a consumer's own button, and the page shows the three lines.
- **A label, a description, an error or a counter.** `field`, `inline-message`
  and `field-group` own all four, and were built in this wave for that.
