# Currency Field Self-Assessment

Against `.claude/skills/component/references/rubric.md`, eleven dimensions, and
`docs/component-features.md` §18. Every claim names the capture, the test or the
file that carries it.

## 1. Icons

The family draws two marks and both are masks from the theme's glyph scale:
`--slotted-icon-chevron-down` (turned half a turn for increment) under
`stepper="stacked"`, and `--slotted-icon-minus` / `--slotted-icon-plus` under
`split`. Nothing draws a character:
`packages/styles/src/currency-field/currency-field.styles.test.mjs` refuses a
`content` declaration holding one. The minus and plus do not mirror in a
right-to-left document, and the right-to-left capture shows them at the ends
they belong to — less and more do not change with the reading direction.

**The one change that would most improve it:** a glyph for the currency itself,
so `start="R$"` could be an icon rather than text. **Not made**, and it should
not be: a currency symbol is a character in the reader's own writing system, and
a library that drew it as artwork would have to draw one hundred and eighty of
them.

## 2. Motion

Three properties transition on the frame — `background-color`, `border-color`
and `box-shadow` — at `--slotted-control-transition-duration` with
`--slotted-control-transition-easing`, and the two steppers transition their
ground and their ink. Nothing else animates. The value never animates: under
cents-first entry the digits shift on every keystroke, and a transition on the
thing the reader is typing would make the amount lag the keyboard. No literal
duration appears anywhere — the styles test refuses one — so
`prefers-reduced-motion` is inherited from the theme.

**The one change:** a transition on the digits' shift, so the eye could follow a
number moving left. **Not made:** it is decoration on the one element that must
answer instantly, and a reader typing fast would see the previous amount.

## 3. Responsiveness

The family declares no container query, and does not need one: the frame is a
flex row whose value is the only part that shrinks, and every part it holds is
`flex: 0 0 auto`. Read at 240, 420 and 720. At 240 the ceiling amount, the
currency written as a name, and the three-part row (`US$` + amount + `por mês` +
stepper) all hold; the value scrolls its own text rather than wrapping. The
truncation falls at the **end** of the string, so the leading digits — the ones
carrying the magnitude — are what stays, which the 240 capture of the `content`
scene shows as `9.999.999.999.999,99 dólares…`.

**The one change:** a container query that drops an `end` adornment below some
width. **Not made:** an adornment a consumer wrote is content, and a family that
hid it would hide the unit an amount is quoted in.

## 4. Refinement

Read at full size in light, dark and high-contrast at 420, at light 240 and 720,
at dense, and in right-to-left; plus focus captures on the control in light and
dark and on a stepper in light.

Corrected by looking:

- The split arrangement's amount sat at `--_gap` from its divider while every
  other arrangement sat at `--_padding-inline`, so a column mixing them put the
  digits five pixels apart. It now takes the frame's own padding, which is the
  comparison `align="end"` exists to make.
- The harness scene showed a `fieldset` with its own chrome around the
  ancestor-disabled case; the chrome was neutralised so the scene is about the
  control rather than about the fieldset.
- The `adornments` demonstration showed `R$` twice — once in the adornment and
  once inside the value — because the family forces `style: 'currency'` over a
  consumer's options and there is no `Intl` option that hides a currency. Found
  by reading the rendered page, and fixed by adding `currencyDisplay="none"` to
  the axis, in core and in both bindings.
- Three amounts in the harness were strings `Intl` does not write for `pt-BR`:
  a lowercase currency name, a currency name that is not the one CLDR uses, and
  an accounting negative in a locale that writes a minus sign instead. All three
  were replaced with what the formatter actually produces.

**The one change I would still make with another hour:** the read-only ground
and the disabled ground sit within a shade of each other in the light scheme,
and the two are told apart by their ink and their border rather than by their
ground. It is `number-field`'s decision, inherited deliberately so the two
families do not disagree, and changing it belongs to a semantic-token
conversation rather than to this family.

## 5. Tokens

`packages/styles/src/currency-field/currency-field.tokens.json` lists the
seventy-two custom properties the stylesheet reads, and
`packages/styles/src/tokens.test.mjs` holds the list to exactly what the CSS
references. Every family token falls back to a semantic one — control geometry,
control type, the tone scale, the disabled trio, the focus ring — and the only
literals are the exempt ones (`0`, `100%`, `transparent`, `none`) plus the two
the theme itself would supply. The stepper's size is arithmetic over tokens with
`--slotted-target-min` as its floor, and the contract records why in `literals`.

**The one change:** a component-layer token for the amount's alignment inset, so
a theme could retune the distance between the digits and the frame's edge.
**Not made:** it is `--slotted-control-padding-inline-*`, which the theme
already restates per density; a second name for it would be a parallel scale.

## 6. Patterns

The pattern is the APG's Spinbutton, read at
<https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/> and transcribed key by
key into `2026-09-03-currency-field-design.md`, with the roles, states and
properties list beside it. Every row is answered by the contract and by both
bindings; the two additions — the sign keys — are marked as this family's own
rather than as the pattern's. There is no APG pattern for a currency field, and
that absence is recorded rather than papered over: the platform supplies
`Intl.NumberFormat`, the autofill field names `transaction-amount` and
`transaction-currency`, and nothing else.

**The one change:** `aria-roledescription="currency field"`, so a reader hears
what kind of spinbutton it is. **Not made:** renaming a role the pattern already
names hides it, which is the rule `number-field` set.

## 7. Accessibility

Name, role, state and keyboard are complete: the control takes its identifier,
its description and its states from `field`; `aria-valuenow` is the amount in
major units, `aria-valuetext` the formatted string, and both are absent while
the field is empty. `aria-required`, never the native `required`; `disabled` and
`readonly` native. The steppers are out of the tab order with translatable names
and `aria-controls`, and are `disabled` at their bound rather than silently
inert. Forced colours are the theme's, except the one rule a theme cannot write
— the `plain` variant's transparent border. Focus was photographed rather than
described, in both schemes.

**The one change:** an assertive announcement of the amount as it is typed, so a
screen-reader user hears `R$ 12,34` rather than the digits they pressed.
**Not made:** `live-announcer` is wave 5 infrastructure, and a hand-rolled live
region here would be the second implementation of a thing that family will own.
Raised at the gate.

## 8. Native API

React is React: a function component, `useId` through `field`, context for the
defaults, `render` for the frame, `ref` to the element and a named `handle` for
the two imperative actions, props typed as `ComponentPropsWithRef<'input'>`
minus the five this family redeclares. Angular is Angular: standalone
directives, `input()`/`output()`/`computed()`, `host` metadata, `exportAs`,
`HostAttributeToken` for nine static attributes, `ControlValueAccessor`,
`DestroyRef` for the wheel listener and the repeat timer. Native props, events
and consumer values reach the element in both: the consumer's `onChange`,
`onBlur` and `onKeyDown` run first and always, and `event.defaultPrevented`
stops the family.

**The one change:** a `Validator` on the Angular control, so a Reactive Form
would know the range without repeating it. **Not made:** *when* an error shows
is the form's policy, which is the rule `number-field` set; the range is
reported through `aria-valuemin`/`max` and the clamp policy.

## 9. Capability

Measured against `2026-09-03-currency-field-capability-inventory.md`: every
table-stakes row is `adopt`, `adapt` or a `decline` naming what replaces it, and
the two declines say it in one line each — `allowNegative` is `min={0}`, and a
currency selector is the `end` adornment until `select` lands in wave 6. The
mutable value has a controlled and uncontrolled pair, a request carrying a
reason and two facts no surveyed implementation carries, and a row in the state
matrix. The keyboard table is the pattern's, key by key, with the focus
destination stated: focus never leaves the control.

**The one change:** a `currency` part that renders a consumer's own picker
inside the frame with its own `data-part`. **Not made:** no surveyed
implementation ships one, and the `end` adornment already takes the consumer's
control; a part with no behaviour of its own would be a name for a slot that
exists.

## 10. Ecosystem integration

Both tables in `frameworks.md` are answered line by line in the design document,
before either binding was written. The asymmetry is deliberate and recorded:
Angular gets `ControlValueAccessor` and a DI token, React gets `render` and a
context provider. An application sets `currency`, `locale` and every axis once
in both. A consumer's handler composes rather than being replaced, and every
state a consumer may style is in the DOM — `data-align` and `data-entry` beside
the three shared states.

**The one change:** an SSR test that renders the React component to a string.
**Not made:** the package has no SSR harness, and adding one belongs to the
package rather than to this family. The rule it would check is held by
inspection: no user-agent read and no layout read during render.

## 11. Documentation

Both reference pages carry the import, the anatomy row for all seven parts,
fourteen captioned demonstrations with their source, the input table with every
declared default, the event table, the composition surface and eight
accessibility sentences. `specs/reference-pages.test.mjs` and
`referencePageErrors` hold the shape; `snippetFormatErrors` holds every snippet
to Prettier.

**The one change:** reading the two pages rendered. **Not made here** — a new
family is invisible to a running Storybook until it restarts, and restarting is
the reviewer's call. Raised at the gate as the one thing left to look at.

## `docs/component-features.md` §18, item by item

1. **Purpose, use and anti-use.** An amount of money in one currency. Not for a
   quantity (`number-field`), not for a percentage (`number-field` with a
   percent format), not for a ledger needing more than fifteen significant
   digits (`text-field` and a decimal library).
2. **Anatomy and public parts.** Seven, listed in the contract and on both
   pages: `root`, `input`, `start`, `end`, `stepper`, `decrement`, `increment`.
3. **Controlled and uncontrolled, with a reasoned request.** `value` /
   `defaultValue` / `onValueChange`, over `@slotted/core/state`; four reasons;
   the request carries the currency and the exact minor-unit integer.
4. **State matrix.** `default`, `hover`, `active`, `focus-visible`, `disabled`,
   `invalid`, `readonly`, resolved in `STATE_PRECEDENCE` order and held by
   `packages/styles/src/states.test.mjs`.
5. **Keyboard, focus, ARIA, touch, screen reader.** Documented in the design
   and tested in both bindings. Touch: the steppers grow to `--slotted-target-min`
   under `split`, and the theme grows every control under `pointer: coarse`.
   A screen reader was not run here.
6. **Recipes through tokens.** `size`, `variant`, `align`, `entry` and `stepper`
   are data attributes on the frame; every visual value is a token.
7. **Responsive, RTL, locale, reduced motion.** All four: captures at three
   widths, an RTL capture, a locale axis that is the family's subject, and no
   motion outside the scale.
8. **Loading, empty, error, disabled, extreme content.** Empty is `null` and
   photographed; error is `invalid`; disabled is native and photographed both
   ways; extreme content is the `content` scene. There is no loading state: an
   amount does not fetch.
9. **SSR, performance, virtualization.** No user-agent read, no layout read
   during render, one memoised formatter per control; virtualization does not
   apply.
10. **Examples.** Fourteen demonstrations per page, including composition with
    `field`, a Reactive Form, a table row and a currency picker.
11. **Behavioural tests shared between bindings.** The entry model, the parser
    and the arithmetic live in `@slotted/core/currency` with 29 tests; each
    binding tests the same behaviours through its own idiom (React 55, Angular
    40), over a contract test of 28 and a stylesheet test of 22.
12. **Changelog and migration.** A new family: nothing to migrate. The one
    change outside it is additive — `digitsOf` is now exported from
    `@slotted/core/number`.
