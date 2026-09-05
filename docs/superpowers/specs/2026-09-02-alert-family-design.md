# Alert — family design

Wave 2, guide 9, rebuild. Written before any code, as
`.claude/skills/component/SKILL.md` step 5 requires: the rebuild changes the
root element, the anatomy, every axis name, the state ownership and the
accessibility model, and it adds a state model where the family had none.

Scope, from `docs/build-order.md`: “uma família com recipes por alcance:
alerta contextual, callout editorial e banner de página. `tone`, título,
descrição, ícone, ações, `dismissible`. Os cinco tons comunicam por texto e
ícone além de cor. Alerta presente na montagem não é live region; atualização
assíncrona pode ser.”

The scope paragraph is the floor. Sections 2 to 4 below are what the field
ships; section 5 is what this family ships and why.

---

## 1. Surveyed

Ten implementations, read on 2026-09-02. They are chosen to disagree: two
platform documents, three design systems that make the root a live region, two
that refuse to, one headless-styling library, one government service manual,
and one that answers the live-region problem by turning the alert into a
dialog.

| Source                             | What it calls the family                                             | Read at                                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| WAI-ARIA APG                       | Alert Pattern                                                        | <https://www.w3.org/WAI/ARIA/apg/patterns/alert/>                                                             |
| MDN / ARIA                         | `alert` role                                                         | <https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role>                  |
| Primer (GitHub)                    | `Banner`                                                             | <https://primer.style/components/banner>, `packages/react/src/Banner/Banner.tsx`                              |
| Polaris (Shopify)                  | `Banner`                                                             | <https://polaris.shopify.com/components/feedback-indicators/banner>, `polaris-react/src/components/Banner/Banner.tsx` |
| React Spectrum (Adobe)             | `InlineAlert` (`Heading` + `Content`)                                | <https://react-spectrum.adobe.com/react-spectrum/InlineAlert.html>                                            |
| Carbon (IBM)                       | `InlineNotification`, `ActionableNotification`, `Callout`             | <https://carbondesignsystem.com/components/notification/usage/>, `packages/react/src/components/Notification/Notification.tsx` |
| Fluent UI React v9 (Microsoft)     | `MessageBar` + `MessageBarBody` / `MessageBarTitle` / `MessageBarActions` | `packages/react-components/react-message-bar/library/src/components/MessageBar/MessageBar.types.ts`       |
| MUI Material                       | `Alert` + `AlertTitle`                                               | `packages/mui-material/src/Alert/Alert.js`                                                                    |
| Radix Themes                       | `Callout.Root` / `Callout.Icon` / `Callout.Text`                     | <https://www.radix-ui.com/themes/docs/components/callout>                                                     |
| shadcn/ui                          | `Alert` / `AlertTitle` / `AlertDescription` / `AlertAction`          | <https://ui.shadcn.com/docs/components/alert>                                                                 |
| GOV.UK Design System               | Notification banner                                                  | <https://design-system.service.gov.uk/components/notification-banner/>                                        |

Radix **Primitives**, Base UI and Ark UI ship no member of this family. The
component holds one piece of state and no keyboard model, so a headless
behaviour library has nothing to hold — which is why every answer above is a
design system's opinion rather than a pattern's implementation, and why they
disagree so widely about the accessibility model.

Three divisions run through the ten.

- **Where the live region is.** Polaris, MUI, Spectrum and Carbon put a live
  role on the root, which then contains buttons. Primer and GOV.UK put a
  landmark on the root and no live region at all. MDN says in as many words
  that the `alert` role “should only be used for text content, not interactive
  elements such as links or buttons”, so the first group is shipping a known
  defect and the second is shipping silence.
- **Whether the reach is an axis.** Fluent has `shape: square | rounded`,
  documented as “square for page level messages and rounded for component
  level”. Carbon splits reach across three separate components. Polaris
  branches internally on `withinContentContainer`. Primer, MUI, Radix, shadcn
  and Spectrum have one reach and no way to state another.
- **Who owns dismissal.** Every implementation that dismisses does so by
  calling `onDismiss` and leaving the removal to the consumer. Not one of the
  ten ships an uncontrolled mode, and not one of the ten says where the
  keyboard goes after the button it was on is destroyed.

## 2. Table stakes

Every capability two or more of the ten ship.

| Capability                                          | Who ships it                                                              | Verdict                       | Reason                                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A closed vocabulary of severities                   | all ten                                                                   | adopt                         | `tone`, the library's five shared tones. Section 5.1 records the mapping to the five words the guide uses and why a sixth vocabulary was not invented.                    |
| A glyph per severity, drawn by the family            | Primer, Polaris, Carbon, Fluent, MUI, Spectrum, Radix                     | adopt                         | Masks from the foundation's status glyph set, which `docs/token-foundation.md` already reserves for `status-indicator`, `alert` and `inline-message`. No new token.       |
| Suppressing the glyph                               | Polaris (`hideIcon`), MUI (`icon={false}`)                                | adopt                         | `hideIcon`. A callout inside a documentation page often carries its own artwork in the body.                                                                             |
| Replacing the glyph                                 | Polaris (`icon`), MUI (`icon`, `iconMapping`), Primer (`leadingVisual`)   | adapt                         | React takes a node in `icon`; Angular projects `[slAlertIcon]`. Section 7 records the asymmetry. A third route — `--slotted-alert-icon` in CSS — retunes a whole product. |
| A title distinct from the body                      | Primer, Polaris, Carbon, Fluent, MUI, Spectrum, GOV.UK, shadcn            | adopt                         | The `title` part, and it is what names the root landmark. Section 5.4.                                                                                                  |
| A description or body                               | all ten                                                                   | adopt                         | The `description` part.                                                                                                                                                |
| Actions inside the message                          | Primer, Polaris, Carbon, Fluent, MUI, shadcn                              | adapt                         | An `actions` part the consumer fills, not `action` / `secondaryAction` props. PROJECT-PRD 6.5, and `button` already owns what a button is.                              |
| A dismiss control                                   | Primer, Polaris, Carbon, Fluent, MUI                                      | adopt                         | Real `<button>`, named, `--slotted-control-height-sm` square so it clears WCAG 2.2 2.5.8 at every density and grows under `pointer: coarse`.                            |
| A translatable name for the dismiss control         | Carbon (`aria-label`), MUI (`closeText`)                                  | adapt                         | `dismissLabel`, and a provider so an application states it once rather than on every alert.                                                                            |
| Painting variants of one tone                       | Radix (`soft`/`surface`/`outline`), MUI (`standard`/`filled`/`outlined`), Carbon (`lowContrast`) | adopt  | `variant: soft | outline | solid`, the names `badge`, `tag` and `kbd` already use.                                                                                       |
| A reach or scope axis                               | Fluent (`shape`), Carbon (three components), Polaris (`withinContentContainer`) | adapt                   | `reach: inline | section | page`, one axis carrying what Carbon splits into three components. Section 5.2.                                                                |
| Choosing the announcement politeness                | Carbon (`role`), Fluent (`politeness`), Polaris (`stopAnnouncements`), GOV.UK (`role`) | adapt              | `live: off | polite | assertive`, and the region is the text rather than the root. Section 5.3 — this is where the field is wrong rather than merely different.           |
| A landmark region around the message                | Primer (`<section>` + `aria-label`), GOV.UK (`role="region"` + `aria-labelledby`) | adopt               | The root is a `<section>` named by its own title.                                                                                                                       |
| Moving focus to the message                         | Polaris (`ref.focus()`), GOV.UK (auto-focus on success), Spectrum (`autoFocus`), Carbon (`hasFocus`) | adapt | `tabindex="-1"` on the root and nothing more: React reaches it through `ref`, Angular through `exportAs`. Auto-focus is declined — section 5.6.                          |
| Setting family defaults once for an application     | MUI (`DefaultPropsProvider`), Fluent (partially, through slots)           | adopt                         | `AlertDefaultsProvider` / `provideAlertDefaults`, as `tag`, `kbd`, `button` and `link` already ship.                                                                     |
| Substituting the rendered element of a part         | Radix (`asChild`), shadcn (plain elements), MUI (`slots`)                 | adopt                         | React `render`; Angular attribute directives, which put the element in the consumer's template already.                                                                  |
| Automatic dismissal after a timeout                 | none of the ten inside this family; every one of them in its toast        | decline — `toast` owns it     | APG: “it is also important to avoid designing alerts that disappear automatically”, citing WCAG 2.0 2.2.3. `toast` (wave 5) owns duration, pause on hover and limits.    |
| Trapping focus inside the message                   | Carbon `ActionableNotification` (`role="alertdialog"`)                    | decline — `alert-dialog` owns it | APG: an alert must not affect focus, and the Alert Dialog Pattern “is designed for situations where interrupting work flow is necessary”. `dialog alert-dialog` is wave 5. |
| Escape closes the message                           | Carbon (`closeOnEscape`)                                                  | decline                       | The alert is not a dismissable layer. An alert inside a dialog would swallow the dialog's Escape, and `Escape` belongs to the topmost layer — `dismissable-layer`, wave 5. |
| Stacking, ordering and de-duplicating messages      | Carbon, Fluent, Polaris, MUI, all in their toast APIs                     | decline — `toast` owns it     | Composition here is `<Stack gap="4">` around several alerts; ordering and de-duplication are a queue, and a queue is `toast`.                                            |
| A loading state on the primary action               | Polaris (`LoadableAction`)                                                | decline — `button` owns it    | `<Button loading>` inside `AlertActions`. Two lines of consumer code, and the alert does not need to know that an action is asynchronous.                                 |

## 3. Differentiators

What the best of the ten offers that the others do not, and what this library
can offer because of what it already owns.

| Capability                                              | Where it comes from                                     | Shipped                                                                                                                                                                                                    |
| ------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The live region is the text, not the box                | Nobody. Primer and GOV.UK avoid the problem by announcing nothing; the other four announce and put buttons in the region. | `role="status"` / `role="alert"` on the `content` part, which holds only the title and the description. The actions and the dismiss control are its siblings. Section 5.3. |
| A controlled **and** uncontrolled dismissal             | Nobody. All five dismissing implementations are controlled-only. | `open` / `defaultOpen` / `onOpenChange`, on `@slotted/core/state`, with a request carrying `reason` and `cancel()`. A confirmation flow refuses the dismissal; the alert stays.                             |
| The keyboard is not dropped when the message goes       | Nobody. Not one of the ten says where focus goes after the dismiss button is destroyed. | Focus returns to the element it entered the alert from, and to nothing at all if it never entered. Section 5.5. |
| One reach axis instead of three components              | Carbon splits it; Fluent has half of it (`shape`)        | `reach: inline | section | page`, and at `page` the actions move to the end of the row when the container is wide enough for them. Section 5.2.                                                             |
| Three colour schemes, three densities, one stylesheet   | This library                                              | Every tone is read from the theme's nine roles, `high-contrast` included, and the type and the glyph read the control scales so an alert in a dense table shrinks with it.                                  |
| Right-to-left without a second stylesheet               | This library                                              | Logical properties throughout, and the glyphs chosen are the five that carry no direction.                                                                                                                  |
| Two first-class bindings                                | This library                                              | Reactive-Forms-shaped Angular is not applicable here, but DI-provided defaults and `exportAs` are, and React's `render` and `ref` are. Section 7 records where they differ on purpose.                       |

## 4. Gaps

What no surveyed implementation handles and a real product hits.

| Gap                                                                 | What happens in the field                                                                                                     | Answer here                                                                                                                                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The keyboard is dropped on dismissal                                | Focus falls to `<body>`; the next `Tab` starts at the top of the page. Reported in every screen-reader review of a dismissible banner, fixed in none of the ten. | Section 5.5.                                                                                                                                                                     |
| An alert present at load announces nothing, and everyone ships it anyway | APG: “screen readers do not inform users of alerts that are present on the page before page load completes.” MUI's default is `role="alert"` regardless. | `live` defaults to `off`, and the page says why in one sentence rather than shipping an announcement that does not happen.                                                       |
| A long unbroken token in the body                                   | A deployment id, a container digest or a URL overflows the box. Every one of the ten overflows.                                | `overflow-wrap: anywhere` on the description, and `minmax(0, 1fr)` on the text column so the grid can actually shrink.                                                            |
| Actions wider than the narrow container                             | Primer and Polaris reflow; Fluent's `singleline` clips.                                                                       | Actions wrap inside their own row at every reach, and only rejoin the row at `page` when the container passes 40rem.                                                              |
| A title with no description, and a description with no title        | shadcn and Radix look unbalanced at one of the two; Carbon renders an empty `subtitle` div.                                   | Both parts are optional and the grid has no empty row: the rhythm is each part's own margin rather than a container gap.                                                          |
| A tinted alert on a surface the family did not choose               | `soft` and `solid` bring a ground; `outline` does not. None of the ten says which is which.                                   | The three variants are demonstrated on `--slotted-surface-inverse` on the reference page, and the family draws no ground it cannot name.                                          |
| A dismissed alert that the application brings back                  | Every controlled-only implementation unmounts, so a re-opened alert is a new element and the live region has to re-announce.   | Closing hides rather than unmounts, so the live region survives, `data-open` is a real state a consumer can style, and re-opening is one boolean. Section 5.7 records the cost.   |

---

## 5. Decisions

### 5.1 The tone vocabulary

The axis is `tone`, and its five values are the library's own: `accent`,
`secondary`, `success`, `warning`, `danger`. `specs/contract.schema.mjs` states
in a comment that these five belong to the theme and no family owns the list,
and that `alert` and `tag` once asserted them by reading `badge`'s contract.

The guide names the five severities `error`, `warning`, `success`, `info` and
`neutral`. They map one to one — `danger`/`error`, `accent`/`info`,
`secondary`/`neutral` — and the reference page carries the mapping. A second
vocabulary was considered and refused: `status-indicator` needed one because it
has six values and two of them share a tone, and this family has exactly five
with nothing to disambiguate.

Each tone carries a glyph, and the map is the same one `status-indicator`
declares, so a status light and an alert about the same thing draw the same
mark:

| Tone        | Glyph                            | Says                       |
| ----------- | -------------------------------- | -------------------------- |
| `accent`    | `--slotted-icon-circle-info`     | information                |
| `secondary` | `--slotted-icon-circle`          | a neutral note             |
| `success`   | `--slotted-icon-circle-check`    | something finished         |
| `warning`   | `--slotted-icon-triangle-alert`  | something needs attention  |
| `danger`    | `--slotted-icon-circle-x`        | something failed           |

The glyph is what satisfies WCAG 2.2 1.4.1: the five tones are distinguishable
in greyscale, in `high-contrast`, and under forced colours, where every tone
ground becomes one system colour and the silhouette is all that is left.

Default: `accent`. MUI defaults to `success`, which is a message nobody writes
by accident; an alert with no stated tone is an informational one.

### 5.2 Reach, and what each value changes

`reach: inline | section | page`, default `section`. It is the guide's three
recipes as one axis rather than three components.

| Value     | The guide's name    | Where it lives                                     | What changes                                                                                             |
| --------- | ------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `inline`  | alerta contextual   | Beside the thing it is about — a field group, a row. | Tightest inset, `--slotted-radius-sm`, `sm` type and glyph, title and description on one type step.        |
| `section` | callout editorial   | Inside a page section or a card.                     | The default. `--slotted-radius-md`, `md` type, title one weight above the description.                     |
| `page`    | banner de sistema   | Across a page or an application shell.               | No radius and no inline border, so it runs edge to edge; `lg` title; actions rejoin the row past 40rem.    |

`reach` is not `size`. A size axis would say the same message can be large or
small; this axis says which scope the message applies to, and the geometry
follows from that. The word is Fluent's idea, stated properly.

`page` draws its border only on the block-end edge, because a banner that runs
to both edges of the viewport has no inline edges to draw. That is the one
place the family's geometry depends on where the consumer puts it, and the
reference page demonstrates it inside a stage the width of a page.

### 5.3 The live region is the text, and the root is a landmark

This is the decision the family exists to get right, and the one the field gets
wrong.

MDN, on the `alert` role: *“The `alert` role should only be used for text
content, not interactive elements such as links or buttons.”* Every alert worth
shipping has a dismiss button and often two actions. Polaris, MUI, Spectrum and
Carbon's `InlineNotification` all put the live role on the root anyway, so the
buttons are inside an atomic assertive region; Carbon's `ActionableNotification`
avoids it by becoming `role="alertdialog"` with a focus trap, which is a
different component. Primer and GOV.UK avoid it by announcing nothing.

The answer here separates the two jobs onto two elements that already exist:

- **The root is a `<section>`**, named by `aria-labelledby` pointing at the
  title when there is one. Named, it is a `region` landmark a reader can jump
  to; unnamed, it is a plain grouping element and costs nothing. This is
  Primer's answer.
- **The `content` part is the live region**, and it holds the title and the
  description and nothing else. The actions and the dismiss control are its
  siblings, outside it.

`live` chooses the role written on `content`:

| `live`      | Role on `content` | Implied                                 | For                                                                    |
| ----------- | ----------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| `off`       | none              | —                                       | The default: an alert that is on the page when the page loads.           |
| `polite`    | `status`          | `aria-live="polite"`, `aria-atomic`     | A message that arrives while the reader works and can wait its turn.     |
| `assertive` | `alert`           | `aria-live="assertive"`, `aria-atomic`  | A failed save, a lost connection, an expiring session.                   |

Both roles imply `aria-atomic="true"`, so the whole message is read rather than
the changed word. Nothing writes `aria-live` explicitly; the role carries it.

`off` is the default because the APG says an alert present before the page has
finished loading is not announced by screen readers at all. A default of
`assertive` — MUI's — ships a promise the platform does not keep and interrupts
the reader for every alert that was already on the page.

### 5.4 The title is a `div`, and the consumer can make it a heading

`AlertTitle` renders a `div`; `[slAlertTitle]` sits on whatever element the
consumer wrote. GOV.UK ships `titleHeadingLevel`, Primer renders `<h2>`,
Spectrum renders a `Heading`, shadcn and Radix render a `div`.

A heading puts the alert in the document outline. That is right for a page
banner and wrong for the alert beside a field group, and only the page knows
which. The family therefore ships the neutral element and one line saying how
to change it — `render` in React, the consumer's own tag in Angular — rather
than a `headingLevel` prop that reimplements choosing an element.

The title is what names the root landmark either way, through
`aria-labelledby` and an id the family generates.

### 5.5 Where the keyboard goes when the message goes

Not one of the ten surveyed implementations answers this, and it is the defect
a real product hits first: the reader tabs to the dismiss button, activates it,
the button is destroyed, focus falls to `<body>`, and the next `Tab` starts
again at the top of the page.

The rule, in three parts:

1. The root records where focus came from, on the first `focusin` whose
   `relatedTarget` is outside the alert.
2. When the alert closes while focus is inside it, focus returns to that
   element if it is still connected.
3. If there is no such element, focus goes nowhere: the family does not invent
   a destination, and a pointer user who never focused the alert is not moved.

`restoreFocus` defaults to `true` and turns it off for an application that
manages focus itself. `@slotted/core/focus` already holds `createRemovalFocus`
for the collection case; this is the single-element case and it is small enough
to live in the family rather than to bend that module's contract.

### 5.6 No automatic focus, and no automatic dismissal

GOV.UK moves focus to a success banner on page load, and Spectrum ships
`autoFocus`. Both are declined, for the reason the APG states directly: *“it is
crucial they do not affect keyboard focus”*. An alert that steals focus on
arrival takes the cursor out of the field the reader was typing in. The page
that genuinely needs it has `ref.focus()` and `exportAs`, which is a line the
application writes deliberately.

Automatic dismissal is declined for the reason APG states beside it: an alert
that disappears on a timer fails WCAG 2.0 2.2.3. `toast` owns timing.

### 5.7 Closing hides rather than unmounts

An alert that is closed keeps its element, carries `hidden`, and drops
`data-open`. Two reasons and one cost.

Reasons: a live region must be in the document before its text changes, so an
alert that unmounts and remounts cannot reliably announce the second time; and
`data-open` is only a state a consumer can style if the element is there to
carry it.

Cost: an application that must not pay for the hidden subtree renders the alert
conditionally itself and never uses `defaultOpen`. The reference page says so.

The exit is the one transition in this family — the box fades and lifts on
`--slotted-duration-short` with `--slotted-easing-exit`, `display` carried by
`transition-behavior: allow-discrete`. There is no entry transition: the family
does not own the moment it is inserted, and `@starting-style` would fire on
first paint for every alert already on the page, which is motion carrying no
information. Arrival belongs to `toast`.

### 5.8 Density

Type and glyph read the control scales — `--slotted-control-font-size-*`,
`--slotted-control-icon-size-*` — which are the only scales the theme restates
per density, so an alert in a dense table shrinks with the rows around it. The
box's inset reads the space scale, which does not vary by density.

The cost, recorded rather than hidden: at `dense` the box keeps its inset while
the type inside it shrinks, so the alert is relatively airier than it is at
`comfortable`. `card` took the same decision for the same reason — there is no
density-varying space scale, and inventing one is a foundation change, not a
family one.

---

## 6. Sourcing the accessibility pattern

**Source:** WAI-ARIA Authoring Practices Guide, “Alert Pattern”,
<https://www.w3.org/WAI/ARIA/apg/patterns/alert/>, read 2026-09-02.

**Keyboard Interaction:** the pattern has no keyboard interaction section. An
alert is not a widget; it holds no keys. Recorded as an absence rather than as
a pass, per `references/patterns.md` item 3.

**WAI-ARIA Roles, States, and Properties**, transcribed in full: *“The widget
has a role of `alert`.”* That is the whole of the section.

**Prose requirements**, each with what satisfies it here:

| Requirement (quoted)                                                                                                   | Status                | Evidence                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------- |
| “displays a brief, important message … without interrupting the user's task”                                             | pass                  | Nothing here takes focus or blocks the page. Section 5.6.                                  |
| “it is crucial they do not affect keyboard focus”                                                                        | pass                  | No auto-focus. `tabindex="-1"` makes the root a programmatic destination and nothing more. |
| “The Alert Dialog Pattern is designed for situations where interrupting work flow is necessary”                          | deliberate boundary   | Modal messages are `alert-dialog`, wave 5. Declined in section 2 with the family named.    |
| “screen readers do not inform users of alerts that are present on the page before page load completes”                   | pass                  | `live` defaults to `off`. Section 5.3.                                                     |
| “avoid designing alerts that disappear automatically … WCAG 2.0 2.2.3”                                                   | pass                  | No timer. Declined in section 2.                                                            |
| MDN: “should only be used for text content, not interactive elements such as links or buttons”                           | deliberate departure from the field, not from the spec | The role is on `content`, which holds only text. Section 5.3.        |

**Requirements the platform supplies**, and what remains the family's:

| Requirement                          | Platform                                              | Family                                                             |
| ------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------- |
| Grouping the message                 | `<section>` is a `region` when it has a name          | Generating the title id and writing `aria-labelledby`                |
| Announcing                           | `role="status"` / `role="alert"` imply live and atomic | Choosing which, from the `live` axis, and putting it on the text     |
| The dismiss control                  | `<button>`: Enter, Space, focus ring, disabled         | Its accessible name, its target size, and where focus goes after it  |
| Actions                              | `button`, `link`                                       | The row that holds them and its wrapping                             |
| Hiding                               | `hidden`                                               | Restoring focus before the subtree becomes unfocusable               |

**WCAG criteria this family is measured against:** 1.4.1 (the glyph, not colour
alone), 1.4.11 (the glyph and the border at 3:1, from the theme's tone roles),
2.2.3 (no timed dismissal), 2.5.8 (the dismiss control at
`--slotted-control-height-sm`, never below 24 × 24), 4.1.3 (status messages —
the `live` axis).

---

## 7. Integration, both bindings

`.claude/skills/component/references/frameworks.md`, answered line by line.

### React

| Question                                                                    | Answer                                                                                                                          |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason?         | Yes. `open` / `defaultOpen` / `onOpenChange(open, request)` over `createControllable`, `request.reason` ∈ `dismiss`, `programmatic`. |
| Can an application set defaults once?                                       | Yes. `AlertDefaultsProvider` and `useAlertDefaults`, in `alert-defaults.tsx`.                                                    |
| Can a consumer substitute the rendered element of each public part?         | Yes. `render` on `Alert`, `AlertTitle`, `AlertDescription`, `AlertActions`. The `dismiss` part is fixed; its label and its glyph are not. |
| Does the consumer's own handler still run?                                  | Yes. `onClick` on the root composes; the dismiss control's own `onClick` runs before the request and `preventDefault` refuses it. |
| Can a consumer reach the native element and the imperative action?          | Yes. `ref` reaches the `<section>`, which carries `tabindex="-1"`, so `focus()` is the platform's. No handle is invented.        |
| Does it render on the server without a hydration mismatch?                  | Yes. `useId` for the title id; nothing reads layout during render; the focus rule lives in an effect.                            |
| Does every state a consumer may style appear in the DOM?                    | Yes. `data-open`, plus `data-tone`, `data-variant`, `data-reach`, `data-live` and `hidden`.                                      |
| Is each part's props type the native element's, extended?                   | Yes. `ComponentPropsWithRef<'section' | 'div' | 'p'>` per part.                                                                  |

### Angular

| Question                                                                | Answer                                                                                                                              |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form the ecosystem expects?                 | `input()` for `open` and `defaultOpen`, `output<ChangeRequest<boolean>>()` for `openChange`. Not `model()`, for the reason `tag` recorded: a two-way binding has one slot and cannot carry the reason, the source event or `cancel()`. |
| Reactive Forms and template forms?                                     | Not applicable. An alert holds no value a form submits; the family it feeds — `inline-message`, wave 2 — is the one `field` wires.  |
| Can an application set defaults once?                                   | Yes. `ALERT_DEFAULTS`, `provideAlertDefaults()`, `injectAlertDefaults()`.                                                            |
| Can a template reach the instance?                                      | Yes. `exportAs: 'slAlert'`, carrying `open()`, `close()`, `focus()`.                                                                |
| Can a consumer substitute projected content, and keep it lazy?          | Yes. `ng-content` for the body, `select="[slAlertIcon]"` for the glyph, `select="[slAlertActions]"` for the row.                     |
| Correct with zoneless change detection and `OnPush`?                    | Yes. Signals throughout; no `markForCheck`.                                                                                         |
| Is every subscription and listener torn down?                           | Yes. Host listeners in `host` metadata; the focus record is cleared through `DestroyRef`.                                            |
| Does a static attribute the consumer wrote survive the host bindings?   | Yes. `role` and `aria-label` are read with `HostAttributeToken` before anything is written over them.                                |
| Does an entry point that others depend on stay a single class?          | Yes. `@slotted/angular/alert`, one `public-api.ts`.                                                                                 |

### Both

The consumer's explicit value wins over the provider, which wins over the
family's own default, read in that order rather than merged. The platform comes
before ARIA: `<section>`, `<button>` and `hidden` do the work that three of the
ten surveyed implementations do with attributes.

**Recorded asymmetries, kept rather than levelled down.**

- Replacing the glyph. React takes a node in `icon`, because a node is what a
  React consumer has. Angular projects `[slAlertIcon]`, because content
  projection is what an Angular consumer has, and an `icon` input taking a
  `TemplateRef` would be a worse version of it.
- Detecting the dismiss control. React could infer it from the presence of
  `onOpenChange`; Angular cannot see whether an output is subscribed. Both
  bindings therefore state `dismissible`, which is the asymmetry `tag` resolved
  the same way and for the same reason.
- The imperative surface. React exposes the element through `ref` and nothing
  more. Angular exposes `open()`, `close()` and `focus()` through `exportAs`,
  because an Angular template has no other way to reach them.

---

## 8. Anatomy

| Part          | Element                    | Always | For                                                                                                    |
| ------------- | -------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| `root`        | `section`                  | yes    | The box. Carries `data-ui="alert"`, the four axes, `data-open`, `hidden`, `tabindex="-1"`.              |
| `icon`        | `span`                     | no     | The tone's glyph, as a mask. Absent when `hideIcon`.                                                    |
| `content`     | `div`                      | yes    | The title and the description, and nothing else. This is the live region.                               |
| `title`       | `div`, or the consumer's   | no     | The message's name, and the root's accessible name through `aria-labelledby`.                           |
| `description` | `p`, or the consumer's     | no     | The message.                                                                                            |
| `actions`     | `div`                      | no     | The row of controls. Outside the live region.                                                           |
| `dismiss`     | `button`                   | no     | Closes the alert. Rendered when `dismissible`. Outside the live region.                                 |

```
section[data-ui=alert][data-part=root]
├── span[data-part=icon]           (mask from the tone's glyph)
├── div[data-part=content]         (role=status | alert | none)
│   ├── div[data-part=title]
│   └── p[data-part=description]
├── div[data-part=actions]
└── button[data-part=dismiss]
```

Grid, `auto minmax(0, 1fr) auto`:

```
'icon content dismiss'
'icon actions dismiss'
```

and, at `reach="page"` past 40rem of container inline size:

```
'icon content actions dismiss'   /  auto minmax(0, 1fr) auto auto
```

## 9. States and combinations

| State                        | Where            | Attribute    | Painted as                                                                 |
| ---------------------------- | ---------------- | ------------ | ---------------------------------------------------------------------------- |
| open                         | root             | `data-open`  | Visible. Absent plus `hidden` is closed.                                     |
| default                      | dismiss          | —            | The tone's text role at reduced opacity of intent, on no ground.             |
| hover                        | dismiss          | —            | The tone's `subtle-hover` ground. Guarded with `:enabled`.                   |
| active                       | dismiss          | —            | The tone's `subtle-active` ground. Guarded with `:enabled`.                   |
| focus-visible                | dismiss, root    | —            | `--slotted-focus-ring-*`, inset on the dismiss so it never leaves the box.   |

The alert has no `disabled`, no `loading` and no `invalid`: it reports rather
than accepts, and every one of those states would describe a control it is not.
Precedence therefore has one pair to resolve — `hover` and `active` against a
dismiss control the consumer may disable natively — and `:enabled` is what
resolves it.

## 10. Density, direction, schemes, extremes

- **Densities.** Type and glyph move; the inset does not. Section 5.8.
- **Direction.** Logical properties throughout. All five tone glyphs are
  direction-free — a circle, a triangle, a check, a cross — so nothing mirrors
  and nothing needs a `:dir()` rule. The grid mirrors on its own.
- **Schemes.** Every colour is a tone role or a semantic token, so `light`,
  `dark` and `high-contrast` are the theme's answer rather than the family's.
  Under `forced-colors` the tone grounds collapse to one system colour and the
  glyph silhouette is what remains; the family writes one rule there, to give
  `solid` an edge it would otherwise lose, and nothing more.
- **Loading, empty, error.** Not applicable: the alert is the error state other
  families reach for. An alert with no title, no description and no actions
  renders an icon and an empty region; the reference page shows it, because a
  consumer will build one from a nullable message.
- **Extreme content.** A 300-character description, a German compound, an
  Arabic string in a Latin page, and a 64-character container digest with no
  break opportunity, all at 240 pixels.
