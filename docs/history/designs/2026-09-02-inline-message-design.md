# Inline Message — family design

Wave 2, guide 9, new family. Written before any code, as
`.claude/skills/component/SKILL.md` step 5 requires: the family decides an
anatomy, an announcement policy, a translation surface and a layout-shift
policy, and it is the piece `field` consumes in wave 3.

Scope, from `docs/process/build-order.md`: “mensagem ligada a um campo, seção ou ação,
com ID estável e política de anúncio. Sem layout shift severo, e nunca tooltip
para erro obrigatório. É a peça que `field` (onda 3) consome para mensagem e
erro.” Guide 9 adds the kinds: “ajuda, erro, warning, success ou progresso”.

The scope paragraph is the floor. Sections 2 to 4 are what the field ships;
section 5 is what this family ships and why.

---

## 1. Surveyed

Thirteen sources, read on 2026-09-02. They are chosen to disagree: two
specifications, a government service manual that answers the announcement
problem with hidden text, three design systems that make the message a slot of
the field, three that make it a component, one that binds it to
`ValidityState`, and one that ships nothing but an id.

| Source            | What it calls the family                                       | Read at                                                                                                    |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| WAI-ARIA APG      | Alert Pattern — there is no pattern for a field message         | <https://www.w3.org/WAI/ARIA/apg/patterns/alert/>                                                          |
| MDN / ARIA        | `aria-errormessage`                                            | <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage>   |
| WCAG 2.2          | Understanding 3.3.1 Error Identification                       | <https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html>                                     |
| GOV.UK            | Error message                                                  | <https://design-system.service.gov.uk/components/error-message/>                                            |
| Primer            | `FormControl.Caption`, `FormControl.Validation`                | <https://primer.style/components/form-control>                                                             |
| Base UI           | `Field.Description`, `Field.Error`                             | <https://base-ui.com/react/components/field>                                                               |
| Fluent UI v9      | `Field` — `hint`, `validationMessage`, `validationMessageIcon` | <https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-field/library/src/components/Field/Field.types.ts> |
| Carbon            | helper text, invalid text, warn text                           | <https://carbondesignsystem.com/components/text-input/usage/>                                              |
| React Spectrum    | `description`, `errorMessage`                                  | <https://react-spectrum.adobe.com/react-spectrum/TextField.html>                                           |
| Material UI       | `FormHelperText`                                               | <https://mui.com/material-ui/api/form-helper-text/>                                                        |
| Chakra UI         | `Field.HelperText`, `Field.ErrorText`                          | <https://chakra-ui.com/docs/components/field>                                                              |
| Mantine           | `Input.Description`, `Input.Error`                             | <https://mantine.dev/core/input/>                                                                          |
| Polaris           | `InlineError`                                                  | <https://polaris-react.shopify.com/components/feedback-indicators/inline-error>                            |

Two facts about the set matter more than any single row.

First, **nine of the thirteen do not ship a component at all**: the message is a
string prop on the field — Fluent's `validationMessage`, Spectrum's
`errorMessage`, Carbon's `invalidText`, Polaris's `error`. A consumer who needs
a message beside a section, an action or a control the library never saw has
nothing to render.

Second, **only GOV.UK answers what a reader hears**. Every other implementation
distinguishes an error from a hint by colour and, in four cases, by an icon —
neither of which reaches a screen reader.

## 2. Table stakes

| Capability                                   | Who ships it                                              | Verdict            | Reason                                                                                                                                                                                                                     |
| -------------------------------------------- | ----------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A message tied to a control by a stable id   | all thirteen                                              | adopt              | The family generates one when the consumer states none, so the element is always addressable by `aria-describedby` or `aria-errormessage`.                                                                                |
| Severity as an axis                          | Fluent, Primer, Carbon, Chakra, Mantine, Polaris, GOV.UK  | adopt              | `tone`, and the library's own five values rather than a sixth vocabulary. §5.1.                                                                                                                                            |
| A mark per severity                          | Fluent, Carbon, Primer, Polaris                           | adopt              | Masks from the foundation's status glyph set, which `docs/token-foundation.md` already reserves for `status-indicator`, `alert` and this family. No new token.                                                              |
| Help text quieter than the control's label   | Carbon, Chakra, Mantine, Material UI, Spectrum            | adopt              | The `secondary` tone is the help tone and paints in `--slotted-text-muted`. §5.2.                                                                                                                                          |
| A size step that follows the control's       | Fluent (`size`), Carbon                                   | adopt              | `size: sm \| md`, reading the control type and glyph scales, so a message in a dense table shrinks with the rows around it.                                                                                                 |
| A live region for a message that arrives     | Fluent, Chakra, MDN's own recommendation                  | adopt              | `live: off \| polite \| assertive`, written as a role on the root. §5.4.                                                                                                                                                    |
| An icon the page supplies instead            | Fluent (`validationMessageIcon`), Polaris                 | adopt              | `icon` in React, `slInlineMessageIcon` projection in Angular — the same shape `alert` ships.                                                                                                                                |
| Drawing no mark at all                       | Primer (Caption), Carbon (helper), GOV.UK (hint)          | adopt              | `hideIcon`, and `secondary` draws none by default because help is not a severity.                                                                                                                                          |
| A muted appearance beside a disabled control | Material UI, Carbon, Mantine, Chakra                      | adopt              | `disabled`, mirrored onto the element as `data-disabled`. Left `undefined` by default so wave 3's `field` can answer it. §5.7.                                                                                              |
| Reserving the line so nothing jumps          | Material UI (`children=' '`), Carbon                      | adopt              | `reserve`, and the family hides its own mark and prefix when there is nothing to say. §5.6.                                                                                                                                 |
| An `id` the consumer states                  | Primer, Polaris (`fieldID`)                               | adopt              | A native attribute, and the consumer's always wins.                                                                                                                                                                        |
| The error replacing the hint                 | Carbon, Spectrum                                          | defer to `field`   | Which of two messages to render is a decision about the field, not about either message. `field` owns it in wave 3; until then it is one line: `{error ? <InlineMessage tone="danger">{error}</InlineMessage> : <InlineMessage>{hint}</InlineMessage>}`. |
| An error summary linking back to the fields  | GOV.UK, Ant Design                                        | defer to `form`    | A summary is a list of every failure on a page with focus management into each control. `form`, wave 3.                                                                                                                    |
| A required marker                            | Mantine, Chakra                                           | defer to `field`   | The marker belongs to the label, which `field` draws. A message about a required value is a message like any other.                                                                                                        |
| Several messages in one element              | Ant Design, GOV.UK's summary                              | decline            | A consumer renders one message per failure, which is what keeps each one separately addressable by `aria-errormessage`. A page that wants a single list writes `render={(props) => <ul {...props} />}` and puts `li`s in it. |
| Matching a `ValidityState` key               | Base UI alone                                             | decline            | One implementation, so not table stakes, and it is validation rather than presentation. Recorded in §4 as a gap `form` inherits.                                                                                            |
| Dismissing the message                       | none of the thirteen                                      | decline            | `alert` owns dismissal, with a full state model. A message tied to a field disappears when the value becomes valid, which is the consumer's own render.                                                                     |

## 3. Differentiators

| Capability                                                 | Where it comes from                                                                                                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A visually hidden severity word before every message       | GOV.UK ships “Error:” for errors, in one hard-coded English-or-Welsh template. Here it is a word per tone, replaced once for the application through the defaults provider, and it is what makes the five tones distinguishable to a reader who hears the message rather than sees it. §5.3. |
| A pending message                                          | The guide names “progresso” as a kind of inline message and not one of the thirteen ships it. `loading` turns the mark into a ring, which is the shape `button` already draws for a wait. §5.5.           |
| Reserving exactly one line box of the family's own leading | Material UI reserves a line by asking the consumer to pass a space character. Here it is `reserve`, it measures `1lh` so it follows the type step and the density, and the mark and the prefix withdraw when there is nothing to say — so an application renders the message unconditionally and the form never moves. §5.6. |
| Three schemes, three densities, RTL, two bindings          | Every one of the thirteen ships one binding. Fluent's `size` is the only answer to density in the set, and none of them states a high-contrast scheme of its own.                                          |

## 4. Gaps

| What a real product hits                                              | What the family does                                                                                                                                                                                                                          |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A message that is inserted with its text already in it                | The role is written and nothing else. A live region inserted complete is announced by most screen readers and by none of them reliably, so `live` defaults to `off` and the reference page says which messages should raise it. §5.4.           |
| A string no language can break — a token, a digest, a host name       | `overflow-wrap: anywhere` on the text, and nothing is removed from the DOM to achieve it.                                                                                                                                                       |
| A message beside a disabled control                                   | `disabled` mutes it to `--slotted-disabled-foreground` and stops the pending ring, rather than lowering opacity until it is unreadable.                                                                                                        |
| Validation itself — when a message appears, and which failure it names | Not this family's, and not `field`'s either. Recorded here so the gap is inherited deliberately by `form` in wave 3 rather than discovered there.                                                                                              |
| A tooltip carrying a required-field error                             | Refused by construction: the family renders visible text in the flow. The scope paragraph names this, and there is nothing in the API that could express it.                                                                                    |

---

## 5. Decisions

### 5.1 The tone vocabulary, and the default

The axis is `tone`, and its five values are the library's own: `accent`,
`secondary`, `success`, `warning`, `danger`. `specs/contract.schema.mjs` states
that the five belong to the theme and no family owns the list.

The guide names the kinds “ajuda, erro, warning, success ou progresso”. Four map
onto tones — help is `secondary`, error `danger` — and the fifth is not a tone
at all: progress is a state of the same message, which §5.5 gives to `loading`.

Each tone carries the glyph `status-indicator` and `alert` already declare, so a
status light, an alert and a field error about the same thing draw the same
mark:

| Tone        | Glyph                           | Prefix word | Says                       |
| ----------- | ------------------------------- | ----------- | -------------------------- |
| `accent`    | `--slotted-icon-circle-info`    | —           | information                |
| `secondary` | —                               | —           | help                       |
| `success`   | `--slotted-icon-circle-check`   | `Success:`  | something worked           |
| `warning`   | `--slotted-icon-triangle-alert` | `Warning:`  | something needs attention  |
| `danger`    | `--slotted-icon-circle-x`       | `Error:`    | something is wrong         |

Default: `secondary`. Help text is what sits under most fields, and it is the
one value that draws no mark, speaks no severity word and paints in the muted
ink — the quietest thing the family can be is what it is when nothing is stated.
`alert` defaults to `accent` for the opposite reason: an alert exists because
something happened.

### 5.2 `secondary` is the help tone, and it paints in the neutral muted ink

`--slotted-tone-secondary-text` resolves to `#172033` in the light scheme and
`#fafafa` in the dark one: it is a label colour, calibrated for the tone's own
tinted ground, and it is what `badge` and `alert` write on that ground. Help
text has no ground — this family paints on the page's own surface — and text at
that strength under a field reads as loud as the label above it.

Help text therefore takes `--slotted-text-muted`, which the theme already
darkened to meet 4.5:1 against the sunken surface and which
`packages/theme-default/test/contrast.test.mjs` measures. The other four tones
take their own `text` role, which is the pair the same test measures against the
three neutral surfaces.

That is one tone reading a different token from the other four, and it is
recorded here rather than hidden: the reason is that `secondary` is not a
severity in this family, it is the absence of one.

### 5.3 The severity is a word, not only a colour and a mark

The message is one line of text. A reader who cannot see it hears the sentence
and nothing else: “Informe um CNPJ válido” carries no evidence that it is an
error rather than a hint, and neither the red ink nor the crossed circle reaches
the accessibility tree.

GOV.UK's answer, published under its Error message component, is a visually
hidden word before the message, so the reader hears “Error: Enter your full
name”. It is generalised here to every tone that is a severity, and to a table
an application replaces in one decision.

The `prefix` part is a real element carrying real text, clipped by the WCAG 2.2
technique C7 rule set, placed first in the DOM so it is read first, and
`position: absolute` so it takes no grid cell and adds no line.

`prefix` as an input takes three shapes: unstated means the tone's word, a
string replaces it for this message, and the empty string removes it. The table
itself is replaced once through `InlineMessageDefaultsProvider` and
`provideInlineMessageDefaults`, which is the only translation surface this
library has today.

The cost, recorded: a message wired as `aria-describedby` on a control is read
after the control's own name and role, so a reader hears “E-mail, edit, Error:
Informe um CNPJ válido”. That is one word of repetition when the control is
already announced as invalid, and it is the trade GOV.UK accepted for the case
where the control is not.

### 5.4 The role goes on the root, because the root is the text

`alert` puts the live role on `content` and not on the box, for the reason MDN
states about the `alert` role: it “should only be used for text content, not
interactive elements such as links or buttons”, and every alert worth shipping
has a dismiss button.

This family has no controls. The root holds a mark that is `aria-hidden`, a
prefix and a sentence; there is nothing inside it for a live region to swallow.
The role therefore goes on the root, and the family renders no second element to
hold what the first one already is.

| `live`      | Role on the root | Implied                                | For                                                            |
| ----------- | ---------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `off`       | none             | —                                      | The default: help text, and an error rendered by the server.    |
| `polite`    | `status`         | `aria-live="polite"`, `aria-atomic`    | A message that arrives on blur or from an async check.          |
| `assertive` | `alert`          | `aria-live="assertive"`, `aria-atomic` | A submit that failed, and the reader is about to leave the page. |

`off` is the default for the reason the APG records for `alert`: a message
present before the page finished loading is not announced whatever role it
carries, so a default that promised otherwise would be a promise the platform
does not keep.

A message a consumer renders conditionally is a live region that is inserted
complete rather than filled in place, which is the arrangement screen readers
handle least consistently. The family cannot fix that from inside — it does not
own the moment it is mounted — so the reference page states the reliable
arrangement instead: keep the element rendered and change its text.

### 5.5 Progress is a state of the message, not a sixth tone

`loading` replaces the tone's mark with a ring turning in the same box, at
`--slotted-duration-loop-fast`, which is the ring `button` draws for a wait. The
message keeps its tone, its size and its place, so “Verificando
disponibilidade…” under a username field becomes “Nome disponível” with no
geometry moving.

Under `prefers-reduced-motion: reduce` the ring stops rather than slows, which
`docs/token-foundation.md` requires of every infinite animation and
`packages/styles/src/motion.test.mjs` enforces.

A `disabled` message stops the ring too. `STATE_PRECEDENCE` puts `disabled`
above `loading`, and a control nobody can use is not waiting for anything.

When `progress-indicator` ships, the ring is replaced by that family, the same
follow-on `button` recorded for its own.

### 5.6 The line is reserved, and the mark withdraws with the message

`reserve` gives the root `min-block-size: 1lh` — one line box of the family's
own leading, so it follows the size step and the density rather than a number.
An application renders `<InlineMessage tone="danger">{error}</InlineMessage>`
unconditionally and the field below it never moves when the error arrives.

That only works if a message with nothing to say draws nothing. The mark and the
prefix are therefore withdrawn by the stylesheet, from the one fact both
bindings agree on:

```css
[data-ui='inline-message']:has([data-part='text']:empty) > [data-part='icon'],
[data-ui='inline-message']:has([data-part='text']:empty) > [data-part='prefix'] {
  display: none;
}
```

The `text` part exists for this. It is written by the family rather than by the
consumer — React wraps `children`, Angular wraps `<ng-content />` — so
`:empty` is an exact question in both, and a message holding a link is one grid
item rather than two.

Default `false`. A reserved line under every field costs a line of vertical
rhythm on a form that never fails, and the family that knows whether to pay it
is `field`.

### 5.7 `disabled` defers rather than defaults

`disabled` is `undefined` rather than `false`, and it is not declared in the
contract's `defaults`. That is the invariant
`docs/history/designs/2026-08-31-field-aware-controls-design.md` states from
the other side: `false` cannot say whether the consumer meant “not disabled” or
said nothing at all, so a message that defaulted to `false` would quietly
override a disabled `field` in wave 3.

There is no `field` to ask today, so `undefined` renders as not disabled. The
shape is the one wave 3 needs, and no consumer has to change a line when it
arrives.

### 5.8 The element is a paragraph, and the id is generated when none is given

The root renders `<p>`. It is a sentence of prose about something else, it is
what GOV.UK, Material UI and Mantine all render, and a paragraph is the box a
screen reader reads as one unit.

A page that needs a list of failures in one element writes
`render={(props) => <ul {...props} />}` in React, or puts `slInlineMessage` on
its own `<ul>` in Angular. The parts keep their attributes either way.

The family generates a stable identifier — `useId` in React, the
application-scoped factory in Angular — and writes it when the consumer states
none, so the element is always something an `aria-describedby` can point at.
Angular's template can read the generated value back through `exportAs`; React's
cannot, and the reference page says so and shows the consumer's own `useId`
instead. That asymmetry is real: an Angular template has no other way to reach an
instance, and a React consumer already has the hook the family itself uses.

### 5.9 Density

Type and glyph read the control scales — `--slotted-control-font-size-*` and
`--slotted-control-icon-size-*` — which are the only scales the theme restates
per density, so a message under a dense field shrinks with it. The family has no
inset and no ground, so there is nothing else for density to move; the leading
comes from `--slotted-line-height-md`, because a control's line-height of `1` is
for a box that holds one line and this box holds a sentence.

---

## 6. Sourcing the accessibility pattern

There is no WAI-ARIA APG pattern for a message attached to a field. The nearest
official guidance is three documents, and each answers a different part.

**WAI-ARIA APG, Alert Pattern** —
<https://www.w3.org/WAI/ARIA/apg/patterns/alert/>. Read 2026-09-02.

- Keyboard interaction: none. An alert is not a widget and holds no keys.
- Role: `alert`, which implies `aria-live="assertive"` and `aria-atomic="true"`.
- Requirement: “it is crucial they do not affect keyboard focus”. **Pass** — the
  family never moves focus, and has no focusable part to move it to.
- Requirement: an alert present before page load completes is not announced.
  **Pass** — `live` defaults to `off`, §5.4.
- Requirement: an alert must not disappear automatically. **Not applicable** —
  the family has no timer and no dismissal.

**MDN, `aria-errormessage`** —
<https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage>.
Read 2026-09-02.

- “set `aria-invalid="true"` … then add the `aria-errormessage` attribute with
  the value being the `id` of the element … containing the error message text”.
  **The control's responsibility**, and the family's contribution is the stable
  id. Both reference pages show the pair written out, because a message with an
  id nobody points at is the commonest way this goes wrong.
- “When `aria-errormessage` is relevant, the element(s) it references must be
  visible”. **Pass** — the family never hides the message; `reserve` reserves
  space for one that is not rendered, which is a different thing.
- “Often times, you will want the element with the error message to be an ARIA
  live region”. **Pass** — `live`, §5.4.

**WCAG 2.2, Understanding 3.3.1 Error Identification** —
<https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html>. Read
2026-09-02.

- The error must be identified in text. **Pass** — the message is text, and the
  prefix names the severity in text as well, §5.3.
- 1.4.1 Use of Color, applied to the same message: **pass** — the mark and the
  prefix both survive greyscale, `high-contrast` and forced colours.

**Roles, names and states, checked item by item**

| Item                       | Answer                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| Role of the root           | none at `live="off"`, `status` at `polite`, `alert` at `assertive`.                              |
| Accessible name            | none; the element is described text, and naming it would make a reader hear the name twice.     |
| The mark                   | `aria-hidden="true"` — it repeats what the prefix says in words.                                 |
| The prefix                 | real text, clipped, first in the DOM.                                                           |
| Keyboard                   | none. The family owns no focusable element; a link inside the message is the consumer's own.    |
| `disabled`                 | `data-disabled` only. The element is not interactive, so there is nothing to remove from the tab order, and `aria-disabled` on static text describes nothing. |
| Forced colours             | the mark keeps its silhouette in `CanvasText`; a disabled message takes `GrayText` from the theme. |

## 7. Integration, both bindings

### React

| Question                                                              | Answer                                                                                                                                       |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason?   | **No.** The family holds no mutable value: it is told what to say, and when it appears is the consumer's own render. No capability in `MUTABLE_CAPABILITIES` is declared, and the contract therefore carries no `stateModel`. |
| Defaults set once for the application?                                | `InlineMessageDefaultsProvider`, and `useInlineMessageDefaults` — `tone`, `size`, `live` and the prefix table.                                |
| Substituting the rendered element of each part?                       | `render` on the root. `icon`, `prefix` and `text` are drawn by the family and are not substitutable; `icon` accepts artwork instead.          |
| The consumer's own handler still runs?                                | Nothing is handled. Every native prop and listener reaches the `p`.                                                                          |
| Reaching the native element, and the imperative action?               | `ref` to the `p`. There is no imperative action: the family moves nothing.                                                                    |
| Server rendering without a hydration mismatch?                        | `useId` for the fallback identifier, and nothing reads layout during render.                                                                  |
| Every state a consumer may style in the DOM?                          | `data-tone`, `data-size`, `data-live`, `data-reserve`, `data-loading`, `data-disabled`.                                                        |
| Each part's props type the native element's, extended?                | `ComponentPropsWithRef<'p'>`.                                                                                                                 |

### Angular

| Question                                              | Answer                                                                                                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the signal form?                     | **Not applicable.** There is no mutable value, so there is no `model()` and no `output()`.                                                                       |
| Reactive Forms and template forms?                    | **Not applicable.** The message holds no value a form submits. It is what `field` renders for a control that does, and `field` owns the `ControlValueAccessor` question in wave 3. |
| Defaults set once?                                    | `INLINE_MESSAGE_DEFAULTS` and `provideInlineMessageDefaults`.                                                                                                    |
| A template reaching the instance?                     | `exportAs: 'slInlineMessage'`, which is what exposes `messageId` so a template can write `[attr.aria-describedby]`.                                              |
| Substituting projected content, and keeping it lazy?  | `<ng-content />` for the message, `<ng-content select="[slInlineMessageIcon]" />` for the page's own mark.                                                       |
| Correct under zoneless change detection and `OnPush`? | `input()` and `computed()` throughout; no `markForCheck`.                                                                                                       |
| Every subscription torn down?                         | There are none. The family subscribes to nothing and listens to nothing.                                                                                        |
| A static attribute the consumer wrote surviving?      | `id` is read with `HostAttributeToken` before the generated one is written.                                                                                     |
| An entry point others depend on staying one class?    | `@slotted/angular/inline-message`. `field` will import it by that path in wave 3.                                                                               |

### Both

The consumer's explicit value wins over the provider. The platform comes before
ARIA: the element is a `p`, the mark is a mask, the severity is text. Internal
DOM stays private beyond the four declared parts.

## 8. Anatomy

| Part     | Element                       | Always | What it is                                                                                                                                     |
| -------- | ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `root`   | `p`, or what `render` returns | yes    | The message. Carries `data-ui`, the three axes, `data-reserve`, `data-loading`, `data-disabled`, the id, and the live role.                    |
| `prefix` | `span`                        | no     | The severity in words, clipped from sight and first in the DOM. Absent for `accent` and `secondary`, and when the message is empty.            |
| `icon`   | `span`                        | no     | The tone's mark, one line box tall, `aria-hidden`. Becomes a turning ring under `loading`, and holds the page's own artwork when one is given. |
| `text`   | `span`                        | yes    | The message itself. Written by the family around the consumer's content, so `:empty` is an exact question and a link inside it is one item.    |

## 9. States and combinations

| State           | Attribute       | Painted                                                                    |
| --------------- | --------------- | -------------------------------------------------------------------------- |
| `default`       | —               | The tone's ink, the tone's mark.                                           |
| `loading`       | `data-loading`  | The mark becomes a ring; the ink does not change.                          |
| `disabled`      | `data-disabled` | `--slotted-disabled-foreground` for ink and mark; the ring stops.          |
| `disabled` + `loading` | both     | Disabled wins, per `STATE_PRECEDENCE`.                                     |

There is no `hover`, no `active` and no `focus-visible`: the family owns no
interactive element. A link a consumer writes inside the message is `link`'s.

## 10. Density, direction, schemes, extremes

- **Density**: type and glyph step with the control scales; nothing else moves.
- **Direction**: every rule is logical, so the mark sits at the inline start and
  the text runs from it in both directions.
- **Schemes**: five tones × three schemes, each pair measured by the theme's own
  contrast test. Under forced colours the ink becomes `CanvasText`, the mark
  keeps its silhouette, and a disabled message takes `GrayText`.
- **Long content**: the message wraps and the mark stays on the first line,
  because the mark's box is `1lh` rather than centred on the whole message.
- **Unbreakable content**: `overflow-wrap: anywhere`, with nothing removed from
  the DOM.
- **Empty**: with `reserve`, one line box of height and nothing drawn.
