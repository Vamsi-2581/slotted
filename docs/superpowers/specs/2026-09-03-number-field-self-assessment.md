# Number Field — self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
each naming the one change that would most improve it and whether it was made.

## 1. Icons

Both stepper marks are masks from the glyph scale. Stacked draws chevrons; the
up chevron is `--slotted-icon-chevron-down` turned half a turn, so a theme that
replaces one replaces both and the scale carries one drawing of one shape.
Split draws `--slotted-icon-minus` and a new `--slotted-icon-plus`, added to the
scale in lockstep with `packages/tokens/src/contract.json`,
`packages/themes/default/src/theme.json` and `docs/token-foundation.md`. No rule
draws a character: `number-field.styles.test.mjs` asserts it.

**Most improving change:** the stacked chevrons were drawn at three quarters of
the glyph box, which left a three-pixel mark beside a full-size minus and plus —
the two arrangements read as two families. **Made:** the box is now the control's
own glyph size, bounded by the half that holds it.

## 2. Motion

Every duration and easing is a motion-scale token; `motion.test.mjs` and the
family's own test both reject a literal. The frame transitions border, ground
and shadow; each stepper transitions ground and ink. Nothing loops, so nothing
has to be stopped under reduced motion.

The value itself does **not** transition. A number that animated between 12 and
13 would be unreadable for the length of the animation, and a held stepper
repeats every 60 ms — a transition longer than the repeat would never finish.
The auto-repeat is behaviour rather than paint, so its three timings live in
`@slotted/core/number` rather than in the motion scale, where a theme could
retune a stepper into unusability.

**Most improving change:** naming why the value does not animate, rather than
leaving the absence to be read as an oversight. **Made:** it is written here and
in the design document.

## 3. Responsiveness

The family does not reflow, so it declares no container: the value surrenders
width and the steppers and adornments keep theirs, which is the right priority
for a control whose value can scroll. Read at 240, 420 and 720; nothing
overflows and the reference page has no horizontal body scroll at 1280 or 720
(measured).

**Most improving change:** the split arrangement centres its value, which at 240
pixels leaves a long amount with less room than the stacked one. **Not made:**
the centring is the arrangement's identity and the value still scrolls; a
width-conditional alignment would be a container query for one declaration.

## 4. Refinement

Read at 420 in light, dark and high contrast, at 240, at dense, and in `rtl`;
the states photographed with `--focus` on the value and on a stepper, in both
schemes, including the invalid ring. Captures listed at the gate.

Three defects were found by looking and corrected: the undersized stacked
chevrons (§1); a stepper at its bound that painted only in ink, which put it
within a shade of the resting colour and read as available — it now takes the
disabled ground as well; and a read-only control that in the dark scheme was
indistinguishable from a default one, which now softens its edge to the
separator weight as well as its ground.

**Most improving change:** the stacked column is flush to the frame's edge and
its two halves are 16 pixels tall at `md` — the smallest targets in the library.
**Not made, and named:** two stacked targets cannot both be 24 pixels inside a
34-pixel control; `split` is the arrangement that clears it, and §7 records the
cost.

## 5. Tokens

Seventy-one custom properties, each in `number-field.tokens.json` and checked
against the stylesheet by `tokens.test.mjs`. Every family token falls back to a
foundation token; `fallbacks.test.mjs` holds it. The one declared literal is
`--slotted-number-field-stepper-size`, and it is arithmetic over the glyph scale
with `--slotted-target-min` as its floor, recorded in the contract's `literals`.

**Most improving change:** the stepper's cross size was bounded above by the
frame and not below, so at `sm` with `dense` the column was 22 pixels wide.
**Made:** `max(var(--slotted-target-min), …)` floors it.

## 6. Patterns

Sourced from <https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/>, transcribed
key by key into `contract.json` and asserted in both bindings' specs: `ArrowUp`,
`ArrowDown`, `Home`, `End`, and `PageUp`/`PageDown` as the pattern's optional
larger step, plus `Shift` and `Alt` amounts two surveyed libraries ship. Roles
and properties: `role="spinbutton"` with `aria-valuenow`, `aria-valuemin`,
`aria-valuemax` and `aria-valuetext`; `aria-invalid` when the value leaves the
range under `clamp="none"`, which is the case the pattern's own note describes.

Two deliberate departures, both with their cost written in the design document:
the control is `type="text"` rather than the platform's `type="number"`, giving
up native constraint validation and `stepUp`/`stepDown` in exchange for a value
a locale can be written in; and the steppers are out of the tab order, which the
pattern permits ("usually the only focusable component") and which costs a
pointer-free user nothing because the arrows do the same work.

**Most improving change:** React Aria strips the role over a VoiceOver defect.
**Not made, and raised at the gate:** the role is the pattern's, this library has
no live announcer to replace it with until wave 5, and the VoiceOver behaviour
could not be verified on this machine.

## 7. Accessibility

Name from the field's label through `for`; `aria-describedby` merged after the
consumer's; `aria-required` and never the native attribute; `disabled` and
`readonly` native. Both steppers carry translatable names and `aria-controls`,
and are `disabled` at their bound rather than silently inert. `inputMode` is
derived from `min` and the format — never from the user agent, which would be a
hydration mismatch. Forced colours are the theme's, with one rule the theme
cannot write: the `plain` variant's transparent border becomes `ButtonBorder`.

**Most improving change:** the stacked halves are below the 24-pixel target
minimum in the block axis at every step. **Not made — it is geometrically
impossible** for two stacked targets inside a 34-pixel control, and every
surveyed implementation with a stacked stepper has the same shortfall. The
answer shipped instead is `stepper="split"`, whose buttons clear the minimum in
both axes with the hit area recovered outside the paint, and which the reference
page names as the arrangement for a touch target.

## 8. Native API

React: `ComponentPropsWithRef<'input'>` minus the five props this family
redeclares, `ref` to the element, `render` for the frame, a context provider,
and consumer handlers composed rather than replaced — `onKeyDown` calling
`preventDefault()` stops the family acting, and a test holds it. Angular:
`input()`/`output()` signals, `computed`, host metadata, `exportAs`,
`ControlValueAccessor`, `HostAttributeToken` for eight written attributes, and
`DestroyRef` for the repeat timer and the wheel listener.

**Most improving change:** `name` on the visible control would submit the
formatted string. **Made:** it is read as a static attribute, removed from the
control, and given to a hidden input beside it in both bindings.

## 9. Capability

Measured against the inventory, not the scope paragraph. Every table-stakes row
is `adopt`, `adapt`, `decline` naming the composition, or `defer` naming the
family and the wave. One mutable value with a controlled and uncontrolled pair,
a cancellable request carrying one of four reasons, and a row in the state
matrix. Nine capabilities, four axes, six range inputs, three range policies,
eleven keys.

**Most improving change:** the scrub area two surveyed libraries ship is absent.
**Not made, and written:** it needs the Pointer Lock API, its own author
disables it in Safari, and it is a design tool's gesture rather than a
back-office form's. It is the one row a reader of Base UI will look for, so it
is in the inventory rather than omitted.

## 10. Ecosystem integration

Both tables in `frameworks.md` answered line by line in the design document.
The asymmetry is deliberate: Angular gets `ControlValueAccessor` and
DI-provided defaults, React gets `render` and a context provider. Neither was
levelled down. Angular's reactive-form path is exercised by a spec that reads
the control's value from a `FormControl`, writes it back, and disables it.

**Most improving change:** an Angular `Validator` reporting `min`/`max`.
**Not made:** `Validators.min` composes it in one line, and a control that
validated itself would disagree with the form's own validators about who reports
the error.

## 11. Documentation

Both pages carry the import, seven anatomy rows, twelve captioned
demonstrations with their source, twenty-three API rows, an event table, five
composition rows, and eight accessibility sentences.
`specs/reference-pages.test.mjs` and each family's `referencePageErrors` pass.

The React page was read rendered at 1280 in light and at 720 in dark, and
measured at 1280 with all fourteen code drawers opened: twenty-eight snippets,
all in the monospaced face, none overflowing, every wide table scrolling inside
its own container, no horizontal body overflow, and every story block snug
around its content — 161 against 129 pixels, and 338 against 306.

**Most improving change:** the Angular page could not be read rendered. **Not
made:** the Angular Storybook was started before this entry point existed and
throws `SyntaxError: Unexpected token 'export'`; `docs/rebuild-briefing.md`
assigns that restart to the reviewer, so it is raised at the gate rather than
done unannounced.

## Section 18 — definition of done

1. **Purpose, use and anti-use.** One numeric value in a form. Not a slider —
   `slider` is for a value chosen by position; not a string with digits in it —
   `text-field` owns account numbers and anything needing precision beyond IEEE
   754.
2. **Anatomy.** `root`, `input`, `start`, `end`, `stepper`, `decrement`,
   `increment`, plus a private hidden input for submission.
3. **Controlled and uncontrolled.** `value` / `defaultValue` /
   `onValueChange(value, request)` in React; `[value]` / `defaultValue` /
   `(valueChange)` plus `ControlValueAccessor` in Angular. Reasons: `keyboard`,
   `pointer`, `blur`, `programmatic`. A request for the value already held is
   not emitted.
4. **State matrix.** `default`, `hover`, `active`, `focus-visible`, `disabled`,
   `invalid`, `readonly`, each painted and each photographed; `disabled` and
   `readonly` also reached through a disabled `fieldset` and through a disabled
   form control.
5. **Keyboard, focus, ARIA, touch.** The pattern's eleven rows, focus never
   leaving the control, the steppers reachable by a screen-reader cursor,
   `pointer: coarse` handled by the theme's control growth.
6. **Recipes.** `size` (3), `variant` (3), `stepper` (3), `clamp` (3), all from
   tokens, all answering three densities.
7. **Responsive, RTL, locale, reduced motion.** Read at 240/420/720, mirrored in
   `rtl` with the sign kept in front of the digits, `locale` on the control and
   on the provider, motion tokens throughout.
8. **Loading, empty, error, extreme content.** No loading state — the value is
   local. Empty is `null` and distinct from nought. Error is `invalid` plus the
   field's message. Extreme: thirteen digits with grouping, a negative currency,
   and Arabic-Indic numerals, all captured.
9. **SSR and performance.** `useId` through the field, no user-agent check and
   no layout read during render, one memoised formatter per locale and format.
10. **Examples.** Twelve scenarios on each page, including a reactive form, a
    provider, a hidden input, and the keyboard.
11. **Shared behavioural tests.** 24 core, 23 style, 21 contract, 54 React, 41
    Angular.
12. **Changelog and migration.** A new family: nothing to migrate. The one
    change outside it is additive — `--slotted-icon-plus` joins the glyph scale.
