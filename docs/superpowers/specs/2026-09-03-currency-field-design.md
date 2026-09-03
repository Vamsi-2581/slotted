# Currency Field Design

## Outcome

One monetary amount, in one currency, written the way a cash register writes it
or the way a spreadsheet does — the reader's choice, not the library's. The
inventory beside this document —
`2026-09-03-currency-field-capability-inventory.md` — says what the family
ships; this says what it is and why each decision fell the way it did.

## Why This Is a Family and Not a Mode of `number-field`

`docs/component-features.md` §6 says "moeda e percentual são formatações, não
tipos numéricos distintos", and §17 puts a currency field in a Brazilian
locale package rather than in the core. Both sentences are about **formatting**,
and both stay true: `number-field` keeps `format={{ style: 'currency' }}`, and
nothing in this family duplicates it.

What this family adds is not a format. It is:

1. **A different typing model.** Under `entry="cents"` the reader never types a
   separator: digits enter at the minor unit and shift left, so `1234` is
   `R$ 12,34`. The text is rewritten on every keystroke, which is the exact rule
   `number-field` forbids itself. Two contradictory text models cannot live
   under one `data-ui` and one stylesheet.
2. **A value with two units.** The amount is `number | null` in major units and
   the request also carries the exact integer in minor units, because that
   integer is what a payment API is charged in.
3. **A currency that governs the field.** The minor-unit count, the symbol, the
   step and the software keyboard all follow the ISO 4217 code. On
   `number-field` the currency is one key inside an options object; here it is
   the thing the family is about.

The locale-package boundary §17 draws is about CPF, CNPJ, CEP and telephone —
formats defined by one country's rules. A currency field is defined by
`Intl.NumberFormat` and ISO 4217, which every locale shares, and this family
names no country: `pt-BR` and `BRL` are a demonstration, not a default.

## Anatomy

Every part `number-field` declares, with no part added and none removed: an
amount is still a value with adornments and, when a product asks for them, two
steppers.

| `data-part` | Element                            | Always | What it is                                                                                                       |
| ----------- | ---------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `root`      | `div`, or what `render` returns    | yes    | The frame. Carries `data-ui="currency-field"`, the axes and the mirrored states. No role.                          |
| `input`     | `input[type=text]`                 | yes    | The control: `role="spinbutton"`, the `aria-value*` set, the identifier and every native attribute.                |
| `start`     | `span`                             | no     | An adornment before the value in the reading direction. A symbol here is never parsed and never copied.            |
| `end`       | `span`                             | no     | An adornment after the value. Where a consumer's own currency picker goes until `select` exists.                   |
| `stepper`   | `span`                             | no     | The box the two buttons share. `display: contents` under `stepper="split"`.                                        |
| `decrement` | `button[type=button][tabindex=-1]` | no     | Steps down by `step`, in major units. `disabled` at `min`.                                                         |
| `increment` | `button[type=button][tabindex=-1]` | no     | Steps up by the same. `disabled` at `max`.                                                                         |

The element, the role, the frame-is-not-the-control shape and the hidden input
that carries the raw number to a form are `number-field`'s, unchanged, and
their costs are recorded in `2026-09-03-number-field-design.md` rather than
restated here. Two departures from that document, both of them this family's
own, are stated below: the text model under `entry="cents"` and the alignment.

## The Two Entry Models

`entry` is the axis this family exists for. Both values ship, and the default is
the one a monetary field is usually wanted for.

### `entry="cents"` — the default

The model ngx-currency calls `Financial` and documents as "numbers start at the
highest precision decimal, typing a number shifts numbers left, the decimal
character is ignored; most cash registers work this way". Typing `1`, `2`, `3`,
`4` into a `BRL` field produces `R$ 0,01`, `R$ 0,12`, `R$ 1,23`, `R$ 12,34`.

The rules, all of them decided rather than inherited:

- **The digits are the value.** After every edit the family reads the digits out
  of the element's text — in the locale's own numbering system as well as in
  Latin — and the value is that integer divided by ten to the power of the
  currency's minor units. Nothing else in the text is read.
- **A separator is never typed.** `,` and `.` are refused at `beforeinput`, so
  the reader cannot produce a text the model would have to interpret.
- **The caret has one legal position** — after the last digit, before any
  trailing affix — and the family puts it there after every edit. This is the
  departure from `number-field`'s "the text is never rewritten while the reader
  is typing": here the text is generated, so there is no typed text to protect
  and no caret position to invent. A caret the reader can move into the middle
  of a generated string is a caret whose next keystroke means nothing.
- **A paste is parsed, not accumulated.** `insertFromPaste` runs the locale
  parser first: `R$ 1.480,00` pasted from a bank statement is `1480`, not
  `14,80`. Only a paste that does not parse falls back to its digits. This is
  the one case where the cash-register rule would lose a reader's data, and
  every surveyed masked input loses it.
- **The sign is a key, not a digit.** `-` makes the amount negative and `+`
  makes it positive, both refused when `min` is nought or above. They never
  enter the digit run, so `-` pressed twice does not produce two signs.
- **Fifteen digits, then nothing.** A keystroke that would make the integer
  exceed fifteen digits is refused rather than silently rounded: beyond that a
  double cannot hold a cent.
- **Empty is empty.** Deleting the last digit leaves `null`, never nought.

### `entry="natural"`

`number-field`'s model, unchanged — including its `formatOn` axis, added after
both families shipped. The separator is typed like any other character, and the
text takes the locale's shape on the keystroke that changed it unless
`formatOn="commit"` says otherwise. It is what a spreadsheet does, and it is the
right answer when an amount is edited rather than entered.

`formatOn` decides nothing under `entry="cents"`: the text there is generated
from the digits after every edit, so it has always been regrouped as it is
typed. The axis is carried anyway rather than made conditional, because one
library must not answer the same question two ways in two families —
`docs/superpowers/specs/2026-09-03-number-field-design.md` holds the reasoning
and the sources.

## `@slotted/core/currency` — the Amount Both Bindings Share

The fifth core entry point, and it exists for the reason `number` does: two
bindings must not disagree about what the fourth keystroke of `1234` means.
ngx-currency, react-currency-input-field, react-currency-input and imask each
wrote this rule inside one framework.

```ts
createCurrencyFormat({ locale, currency, currencyDisplay, fractionDigits, options })
  // -> format, parse, isPartial, minorUnits, toMinorUnits, fromMinorUnits, editFromText
```

- It **composes** `createNumberFormat` rather than reimplementing it: the
  parser is still built from `Intl.NumberFormat.formatToParts`, so the group
  separator, the decimal separator, the minus sign, the currency affix and the
  numbering system all come from the formatter that writes the value back.
- `minorUnits` is `Intl`'s own resolved `maximumFractionDigits` for the
  currency — nought for JPY, two for BRL, three for KWD — and `fractionDigits`
  overrides it for the field that quotes a unit price to four places.
- `parse` adds one thing to the number parser: **a fully parenthesised amount is
  negative**. `Intl` writes `(R$ 1.234,56)` under `currencySign: 'accounting'`
  and every surveyed parser reads it back as a credit.
- `editFromText` is the entry model, framework-free and pure: it takes the text
  the browser produced, the input type, and whether the amount was negative, and
  returns the next value with its exact minor-unit integer.

`measure`'s rule applies here as it did to `number`: the module is designed
against one caller and stays malleable until a second confirms it. This family
is the first caller.

## Money Is Held in Major Units, and the Request Carries the Minor Ones

`value`, `defaultValue` and the form's hidden input speak in major units —
`1480.5`, the number every surveyed implementation holds and the number a
consumer's model already has. The request adds what none of them carries:

```ts
onValueChange(value, request); // request.minorUnits === 148050
```

Under `entry="cents"` that integer is what the reader typed, digit by digit, so
it is exact by construction. Under `entry="natural"` it is the parsed amount
rounded to the currency's minor units. Either way the consumer never writes
`Math.round(value * 100)`, which is where a float becomes a rounding defect.

**The cost, recorded rather than hidden:** the value is a double. Fifteen
significant digits hold every amount a product invoices, and a ledger that needs
more uses `text-field` with its own decimal library — the same boundary
`number-field` draws.

## The Currency Governs; the Locale Writes

Two inputs, and confusing them is the mistake ngx-currency's hand-configured
separators make.

- **`currency`** — an ISO 4217 code. It decides the symbol, the minor units and
  therefore the entry model's shift.
- **`locale`** — BCP 47. It decides the group separator, the decimal separator,
  the numbering system and where the symbol goes.

A Brazilian back office paying a US invoice writes `locale="pt-BR"` and
`currency="USD"` and gets `US$ 1.480,00`: Brazilian separators, an American
currency. The reference page shows exactly that.

`currency` resolves from the prop, then from the application's defaults. Absent
both, the family throws where it is constructed, naming both places. A currency
field with no currency cannot decide how many digits a cent has, and a control
that guessed two would write `¥12,34`.

`currencyDisplay` takes one value `Intl` does not have: **`none`**, which
writes the amount as a plain decimal with the currency's own fraction digits.
It is what makes `start="R$"` honest — the symbol beside the value rather than
inside it — and without it the adornment would repeat a symbol the value
already carries. The currency still governs the shift and the minor units;
nothing about it reaches the string.

`format` takes any other `Intl.NumberFormatOptions` — `currencySign`,
`signDisplay`, `useGrouping`, `roundingMode` — and every key a consumer writes
wins over the family's own, except `style`, which is `currency` by definition of
the family, and `currency`, which the prop already owns.

## Alignment

`align` defaults to `end`, and this is the family's second departure from
`number-field`, which does not name an alignment at all.

An amount is read from its last digit: a column of them in a form or a table is
compared on the cents, and the cents-first caret already lives at that edge.
ngx-currency defaults its own `align` to `right` for the same reason, and every
spreadsheet in existence agrees.

`align="start"` is one word away for the field that reads as a sentence rather
than as a figure. The value stays its own bidi run — `unicode-bidi: plaintext`,
the declaration `number-field` derived after `-1.480,00` printed as `1.480,00-`
in a right-to-left document — so the alignment is named physically under a
`:dir()` guard, which is the only way to say "the document's end edge" about a
run that has been pinned left-to-right.

## The Stepper Is Off by Default

`stepper` defaults to `none`, where `number-field` defaults to `stacked`.
PrimeNG's `showButtons` is false by default for the same reason: an invoice
total is typed, not nudged, and two buttons that move an amount by one real
invite a mis-click that costs money. `step` defaults to `1` — one major unit,
not one cent — and `stepper="stacked"` is one word away for the field that is a
quantity in disguise.

## Keyboard

The pattern is the APG's Spinbutton Pattern, read at
<https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/> and transcribed rather
than recalled.

| Key                     | APG says                                             | This family                                                        | Under `entry="cents"`                       |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------- |
| `ArrowUp`               | Increases the value                                  | ± `step`                                                            | Same                                        |
| `ArrowDown`             | Decreases the value                                  | ± `step`                                                            | Same                                        |
| `Home`                  | If there is a minimum, sets the value to it          | `min`, only when `min` is stated                                    | Same                                        |
| `End`                   | If there is a maximum, sets the value to it          | `max`, only when `max` is stated                                    | Same                                        |
| `PageUp` / `PageDown`   | Optional: a larger step                              | ± `largeStep`, default `step × 10`                                  | Same                                        |
| `Shift` + arrow         | Not in the pattern                                   | ± `largeStep` — Base UI, Ark                                        | Same                                        |
| `Alt` + arrow           | Not in the pattern                                   | ± `smallStep`, default `step ÷ 10`                                  | Same                                        |
| Printable characters    | Implementations may allow only certain characters    | Digits, one decimal separator, the sign                             | Digits and the sign; separators are refused |
| `-` / `+`               | Not in the pattern                                   | Part of the number, when `min` admits a negative                    | Sets the sign; never a digit                |
| `Backspace` / `Delete`  | Standard single-line editing keys                    | The browser's                                                       | Shifts the digits right; empties to `null`  |
| `Enter`                 | Not in the pattern                                   | Commits, then submits the form — the platform's behaviour           | Same                                        |
| Every other editing key | Standard single-line editing keys for the platform   | The browser's, untouched                                            | Caret keys land at the one legal position   |

Focus never leaves the control. Nothing is bound to `Escape`, for the reason
`text-field` records. The two steppers carry `tabindex="-1"` with real names and
`aria-controls`, as `number-field`'s do.

### Roles, states and properties, item by item

| APG requirement                                               | Where it is answered                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `role="spinbutton"` on the focusable element                  | The `input`. `contract.controlRole`.                                                  |
| `aria-valuenow` as a decimal                                  | The amount in major units, absent while the field is empty.                           |
| `aria-valuemin` / `aria-valuemax` when known                  | `min` and `max`, omitted when unstated.                                               |
| `aria-valuetext` when `aria-valuenow` is not user-friendly    | The formatted amount — `R$ 1.480,00` — which is what the reader sees and hears.        |
| A visible label referenced by `aria-labelledby`               | `field` owns the label and the identifier; the control reads them.                     |
| `aria-invalid` when the value is out of range                 | Mirrored from the field or the prop, and set by the `none` clamp policy.               |
| `aria-required` when the field requires a value               | From the field. Never the native `required`, per the field-aware controls design.      |
| `aria-disabled` versus native disabling                       | Native `disabled`, because removing the control from the tab order is what it means.   |

## `inputMode` Is Derived, and `entry` Decides It First

- `entry="cents"` → `numeric`. The separator is never typed and the sign is a
  single key, so the numeric keypad is complete for the task. This is the one
  case where a phone gets the smallest keyboard and loses nothing.
- `entry="natural"` → `number-field`'s rule: `text` where a negative is
  possible, `decimal` where a fraction is, `numeric` otherwise.

A consumer who writes `inputMode` wins, in both models.

## `autocomplete`

`transaction-amount` is a standard autofill field name, and
`transaction-currency` is its companion; both satisfy WCAG 2.2 SC 1.3.5 by
naming the field's purpose. No surveyed implementation mentions either.

The default stays `off`, as `number-field`'s does: most currency fields in a
back office are not payment amounts, and a browser offering to fill an invoice
total from a saved card is worse than no help at all. The reference page
documents the token and the one line that sets it.

## The Framework Integration Tables

Every line answered, as `frameworks.md` requires, before either binding is
written.

### React

| Question                                                              | Answered by                                                                                                                                                                                                                       |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason     | `value` / `defaultValue` / `onValueChange(value, request)` over `createControllable`. Reasons: `keyboard`, `pointer`, `blur`, `programmatic`. The request carries `minorUnits` beside the value.                                       |
| Application defaults set once                                         | `CurrencyFieldDefaultsProvider` and `useCurrencyFieldDefaults()`, carrying `currency`, `locale`, `currencyDisplay`, `entry`, `align`, `size`, `variant`, `stepper`, `clamp`, `incrementLabel`, `decrementLabel`.                       |
| Substituting the rendered element of each public part                 | `render` on the frame. The control and the two buttons are fixed, for `number-field`'s reasons. Adornments are `ReactNode` and are already the consumer's elements.                                                                    |
| The consumer's own handler still runs                                 | `onChange`, `onBlur`, `onKeyDown`, `onPaste` and `onWheel` are called first and always; `event.defaultPrevented` is honoured before the family acts.                                                                                   |
| Reaching the native element and the imperative action                 | `ref` reaches the `input`. `handle` exposes `increment()` and `decrement()`, both reporting `programmatic`.                                                                                                                            |
| Server rendering with no hydration mismatch                           | No user-agent check and no layout read during render; the identifier comes from `field`'s `useId`. `Intl.NumberFormat` is memoised on the resolved locale, currency and options.                                                       |
| Every state a consumer may style is in the DOM                        | `data-disabled`, `data-invalid`, `data-readonly` on the frame; `data-entry` and `data-align` beside the other axes; `disabled` on each stepper at its bound.                                                                           |
| Part props typed as the native element's, extended                    | `ComponentPropsWithRef<'input'>` minus `defaultValue`, `size`, `step`, `type` and `value`, each redeclared for this family's meaning.                                                                                                  |

### Angular

| Question                                                        | Answered by                                                                                                                                                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A two-way value in the shape the ecosystem expects              | `ControlValueAccessor` on the control, plus `output()` `valueChange` carrying the request. No `[(value)]`: a two-way binding has one slot and can carry neither a reason nor `cancel()`.                  |
| Reactive Forms and template forms                               | `NG_VALUE_ACCESSOR` on `SlCurrencyFieldInput`, with `setDisabledState`. No `Validator`: when an error shows is the form's policy.                                                                         |
| Application defaults set once                                   | `CURRENCY_FIELD_DEFAULTS` and `provideCurrencyFieldDefaults()`, carrying the same list as the React provider.                                                                                             |
| A template reaching the instance                                | `exportAs: 'slCurrencyField'` on the frame and `'slCurrencyFieldInput'` on the control, which exposes `inputElement`, `increment()` and `decrement()`.                                                     |
| Substituting projected content, kept lazy                       | `<ng-content select="[slCurrencyFieldStart]">` and `[slCurrencyFieldEnd]`; the frame is a directive on the consumer's own element.                                                                        |
| Zoneless change detection and `OnPush`                          | Signals throughout — `input()`, `output()`, `computed()`, `signal()` — with `ChangeDetectionStrategy.OnPush` and no `markForCheck`.                                                                        |
| Every subscription and listener torn down                       | The auto-repeat timer and the non-passive `wheel` listener are both released through `DestroyRef`.                                                                                                        |
| A static attribute the consumer wrote survives the host bindings | `HostAttributeToken` for `id`, `name`, `form`, `inputmode`, `autocomplete`, `aria-describedby`, `aria-invalid`, `aria-required` and `readonly`.                                                            |
| An entry point that others depend on stays a single class       | `@slotted/angular/currency-field` imports `@slotted/angular/field` by its published path, never a relative one.                                                                                            |

The asymmetry is deliberate: Angular gets `ControlValueAccessor` and
DI-provided defaults, React gets `render` and a context provider.

## What This Family Shares With `number-field`, and How

Nothing is imported from the other family's bindings, in either framework.
`currency-field` reaches `number-field` only through `@slotted/core/number` —
`stepNumber`, the repeat delays, `createNumberFormat` — which is the layer both
were designed to share. A binding that subclassed the other's directive or
called the other's hook would make one family's private structure the other's
contract, and a rename in either would break a component neither is about.

The cost is that the frame, the stepper's repeat and the field wiring are
written twice, once per family, in each binding. It is the same cost every
family in this library pays for owning its own DOM, and it is preferred to a
shared internal class that no contract describes.

## What This Family Deliberately Does Not Have

Each is a row in the inventory with its full reason; they are listed so a reader
of this document does not have to open the other one.

- **`allowNegative`.** `min={0}` says it in the vocabulary the range is already
  written in, and two ways to say one thing can disagree.
- **A currency selector.** No surveyed implementation ships one; `select` is
  wave 6, and the `end` adornment takes a consumer's own control until then.
- **Abbreviated input** (`1k` → 1000). One surveyed implementation ships it, and
  no bank statement writes it.
- **A scrub area, a `formatter`/`parser` pair, `bigint` precision, a clear
  button, a label, a description, an error or a counter.** Declined by
  `number-field` for reasons that do not change when the number is money.
