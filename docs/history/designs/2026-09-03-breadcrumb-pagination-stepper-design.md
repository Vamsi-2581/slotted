# Breadcrumb, Pagination and Stepper — design

Three families, one invocation, one shared decision: a set of related
destinations says which one the reader is on with `aria-current`, and the value
is the one WAI-ARIA 1.2 names for the case — `page` for a breadcrumb trail and
for a pagination list, `step` for a step indicator. The specification names all
three uses by name, so no family invents an attribute for it and no family
mirrors it into a `data-current` a router would never write.

Written before either binding. The capability inventory is
`2026-09-03-breadcrumb-pagination-stepper-capability-inventory.md`.

## 1. What changes outside the three families

### 1.1 The shared state vocabulary gains `complete`

`specs/contract.schema.mjs` holds fifteen state attributes and none of them
means "this step is done". `docs/component-features.md` §7 names the state in
the guide's own words — "estados pending/current/complete/error/disabled" — so
the guide already speaks a word the vocabulary lacks.

`checked` is the nearest existing word and it is the wrong one: a checkbox is
checked by the reader, and a step is completed by the flow. Painting
`data-checked` on a step would make every `checked` selector in the library
match something that is not a choice.

- `STATE_ATTRIBUTES` gains `complete: 'data-complete'`.
- `STATE_PRECEDENCE` gains `complete` **after** `current` and before `active`.
  A step that is both current and complete reads as current, because that is
  where the reader is; a step that is both complete and in error reads as in
  error, because `invalid` already sits above both.

This is the one change to a public contract outside the three families, and it
is raised at the gate for that reason. It lands in its own commit, before any
family code, as the briefing requires of a shared tool that cannot express the
right contract.

### 1.2 Two new `@slotted/core` entry points

Arithmetic that both bindings must agree on, character for character, and that
touches neither the DOM nor a framework.

`@slotted/core/pagination`

| Export        | Answers                                                                    |
| ------------- | -------------------------------------------------------------------------- |
| `totalPages`  | How many pages a count and a page size make; nought items make one page.   |
| `clampPage`   | Where page 40 goes when the collection shrinks to four pages.              |
| `pageItems`   | The row of page numbers and ellipses, from sibling and boundary counts.    |
| `itemRange`   | The one-based inclusive range the current page covers, for the range text. |

`@slotted/core/steps`

| Export           | Answers                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| `stepStatus`     | `pending`, `current` or `complete` for one index.                        |
| `stepReachable`  | Whether a linear flow lets the reader jump to an index.                  |
| `stepPercent`    | How far the flow has come, for the connector and for the consumer.       |
| `stepFocusIndex` | Which index an arrow, `Home` or `End` moves focus to, direction-aware.   |

Both need `pnpm --filter @slotted/core build` before any framework package can
import them, which is stated at the gate.

## 2. Breadcrumb

### 2.1 Responsibility

The trail of ancestors above the current page, and nothing else. It does not
know the router, it does not derive itself from a URL, and it is not a back
button: `docs/component-features.md` §7 says so, and a trail that stood in for
back would be wrong the first time a reader arrived from a search result.

### 2.2 Anatomy

| Part        | Element              | Always | For                                                                            |
| ----------- | -------------------- | ------ | ------------------------------------------------------------------------------ |
| `root`      | `nav`                | yes    | The landmark, and the label that distinguishes it from the page's other ones.  |
| `list`      | `ol`                 | yes    | Sequence and set size, from the platform. Owns the collapse.                   |
| `item`      | `li`                 | yes    | One ancestor, or the current page.                                             |
| `link`      | `a`                  | no     | An ancestor that can be reached.                                               |
| `page`      | `span`               | no     | The current page, carrying `aria-current="page"`. Not a link to itself.        |
| `separator` | `span[aria-hidden]`  | no     | Drawn between two items, never after the last, never announced.                |
| `ellipsis`  | `button`             | no     | What the collapse hides, and the control that reveals it.                      |

### 2.3 The separator is geometry

The APG example draws the separator with a border skewed by `transform`, so it
never reaches the accessibility tree. This family does the same, for a second
reason as well: `docs/token-foundation.md` forbids drawing an icon from a
character, and the invocation forbids adding icons to this family. A rule of
one border width, rotated, is neither — it is geometry the stylesheet owns.

It mirrors from `:dir(rtl)` rather than from an ancestor `[dir]`, so a trail
inside a left-to-right island in a right-to-left document leans the way that
island reads.

The element exists rather than being an `::before` on the item, because two
surveyed implementations let a consumer replace the mark and a pseudo-element
cannot hold a consumer's content. Its default content is empty: the mark is
painted, and anything the consumer puts inside replaces the painting.

### 2.4 Collapse

`maxItems` is the count above which the trail collapses; `itemsBeforeCollapse`
and `itemsAfterCollapse` decide what survives. The hidden items are replaced by
one `ellipsis` button that says how many it hides.

Pressing it expands the trail in place. shadcn and MUI both reach for an
overlay for this, and an overlay would make the family wait for `menu` in wave
5; expansion needs no layer, no positioner and no dismissal policy, and it
works the same on a phone.

The collapse is a mutable capability, so it carries a state model like every
other: `expanded` / `defaultExpanded` / `onExpandedChange`, reasons `pointer`
and `keyboard`. An application that wants the trail expanded from the start
says so, and one that wants to persist the choice owns the value.

The collapsed items are hidden with the `hidden` attribute, which takes them
out of the accessibility tree as well as out of the page. That is the cost, and
it is paid honestly: the button that hides them names the count, carries
`aria-expanded`, and is the first thing after the surviving first crumb.

**Focus after expansion.** The ellipsis stops existing the moment it is pressed.
Focus therefore moves to the first revealed link, which is the item that was
immediately after it. Leaving focus on a removed element loses it to the body,
which is the defect this rule exists to prevent.

### 2.5 What it is not

- It does not paint a `link` from the `link` family. A trail is a row of muted
  labels that reach the accent under the pointer, which is one stylesheet
  decision the breadcrumb owns; importing another family's component to get it
  would tie two families together for a colour.
- It does not ship a `size` axis. The three densities answer it.

## 3. Pagination

### 3.1 Responsibility

Moving between pages of a collection the consumer owns. It never fetches, never
slices and never invents a total the server did not give it.

### 3.2 Anatomy

| Part               | Element         | Always | For                                                                           |
| ------------------ | --------------- | ------ | ----------------------------------------------------------------------------- |
| `root`             | `nav`           | yes    | The landmark and its label; owns the state, the arithmetic and the container.  |
| `list`             | `ul`            | no     | The row of page numbers.                                                       |
| `item`             | `li`            | no     | One page or one ellipsis.                                                      |
| `page`             | `a` or `button` | no     | One page. Carries `aria-current="page"` when it is the one being read.         |
| `ellipsis`         | `span`          | no     | The pages the row does not draw.                                               |
| `summary`          | `span`          | no     | "Page 3 of 24", drawn instead of the row below the family's own breakpoint.    |
| `first`            | `a` or `button` | no     | Jump to page one.                                                              |
| `previous`         | `a` or `button` | no     | One page back.                                                                 |
| `next`             | `a` or `button` | no     | One page forward.                                                              |
| `last`             | `a` or `button` | no     | Jump to the last page.                                                         |
| `status`           | `p`             | no     | "21–40 of 482", and the polite live region that announces a page change.        |
| `page-size`        | `select`        | no     | How many items a page holds.                                                    |
| `page-size-label`  | `label`         | no     | Its accessible name, visible by default.                                        |

Every part but the root is optional, and that is the whole composition story:
a numbered paginator is the row between two triggers, and a table's paginator
bar is a page size, a range and two triggers. The field ships those as two
components — MUI `Pagination` and Angular Material `mat-paginator` — and they
are one family with two arrangements.

### 3.3 Two state models

| Capability | Controlled | Uncontrolled      | Request            | Reasons                            |
| ---------- | ---------- | ----------------- | ------------------ | ---------------------------------- |
| `current`  | `page`     | `defaultPage`     | `onPageChange`     | `pointer`, `keyboard`, `programmatic` |
| `value`    | `pageSize` | `defaultPageSize` | `onPageSizeChange` | `select`, `programmatic`           |

`programmatic` is on the page model because of one case the field handles
badly: the collection shrinks under a reader who is on page 40. The family
clamps the page into range and emits the clamped value with that reason, so a
consumer holding the value follows instead of rendering an empty page.

`value` is the vocabulary's word for the value a control holds, and the page
size is held by a control. `measurement` was considered and rejected: it means
a size the reader drags, not a value they pick.

### 3.4 Link mode

`itemHref` turns every page, and all four triggers, into anchors carrying a
real destination. Without it they are buttons. This is the difference between a
paginator a crawler can follow and one it cannot, and between a middle click
that opens page four in a tab and one that does nothing.

The disabled trigger at a bound is a `button[disabled]` in button mode and, in
link mode, an anchor with no `href` carrying `aria-disabled` — the same shape
the `link` family already uses, for the same reason: an anchor without a
destination cannot be middle-clicked either.

### 3.5 Compaction is a container query

The root declares `container-type: inline-size` and `container-name:
slotted-pagination`. Below 22rem the numbered row is replaced by the summary,
and above it the summary is replaced by the row. Both are always rendered and
exactly one is displayed, so neither is announced twice.

The breakpoint is a literal, because `@container (min-width: var(--x))` is
invalid CSS; `docs/token-foundation.md` rule 4 states the exemption.

### 3.6 Focus after a page change

The control that was pressed keeps focus. When pressing it makes it disabled —
`Next` on the second-to-last page — focus moves to the nearest control that
survives, in the order `previous`, `last`, `first`, then the current page in the
row. Losing focus to the body after activating a control is the defect the
guide's "preserva posição/foco de forma previsível" names.

### 3.7 The page size control

A native `select`, painted from the control tokens every other control in the
library reads, with the chevron drawn as a mask from `--slotted-icon-chevron-down`.

`select` in wave 6 will own the styled listbox, and this part is replaceable
when it lands. The cost of waiting instead would be a paginator that cannot
change its page size for a whole wave, which is not a paginator a table can
use. The native control is also what `docs/component-features.md` §2.8 asks for
first, and its popup follows the `color-scheme` the theme already emits.

## 4. Stepper

### 4.1 Responsibility

Where the reader is in a sequence of steps, which steps they may reach, and the
panel belonging to the step they are on. It does not validate, does not persist,
does not submit and does not own the data: `docs/component-features.md` §7 and
§15 put those with the Wizard pattern, and this family stops exactly there.

What it does own beyond the indicator is disclosure — showing the current
step's panel and hiding the others — because three of the four surveyed
implementations ship it, because it is ten lines, and because a family that
shows progress through content it refuses to show is an ornament.

### 4.2 Anatomy

| Part          | Element                    | Always | For                                                                       |
| ------------- | -------------------------- | ------ | ------------------------------------------------------------------------- |
| `root`        | `div`                      | yes    | Owns the state, the orientation, the navigation mode and the container.   |
| `list`        | `ol`                       | yes    | Sequence and set size from the platform; carries the label.               |
| `item`        | `li`                       | yes    | One step, and every state attribute the step is in.                       |
| `trigger`     | `button`, `a` or `span`    | yes    | The step header. A `span` when the stepper does not navigate.             |
| `marker`      | `span`                     | yes    | The index, the check when complete, the alert when in error.              |
| `label`       | `span`                     | yes    | The step's name.                                                          |
| `description` | `span`                     | no     | The secondary line under it.                                              |
| `status`      | `span[data-ui=visually-hidden]` | yes | "Step 2 of 5, completed" — the whole of the state, in words.             |
| `separator`   | `span[aria-hidden]`        | no     | The connector, painted up to the progress it has reached.                 |
| `panel`       | `div[role=group]`          | no     | The current step's content, labelled by its trigger.                      |
| `previous`    | `button`                   | no     | One step back.                                                            |
| `next`        | `button`                   | no     | One step forward.                                                         |

### 4.3 Semantics, and the role this family refuses

Angular Material gives a horizontal stepper `role="tablist"` and each header
`role="tab"`. This family does not, because `docs/component-features.md` §7
forbids it in its own words, under Tabs: "Use para vistas pares no mesmo
contexto, não para etapas de um processo." A tab list says the panels are peers
and the reader may take them in any order, which is the opposite of what a
linear flow means.

What is used instead:

- `ol` and `li` for sequence and set size;
- `aria-current="step"` on the current trigger, the value the ARIA
  specification names for "a link within a step indicator for a step-based
  process";
- `aria-label` on the list, so the sequence is named;
- a visually hidden `status` inside each trigger, so a reader hears "Step 2 of
  5, completed" rather than "2";
- `aria-controls` from the trigger to its panel and `aria-labelledby` back, so
  the pair is related without either claiming to be a tab;
- `aria-disabled` rather than `disabled` on a trigger a linear flow has not
  reached, so it stays discoverable — the reader can find out the step exists
  and that it is not yet available.

The cost of refusing the tab role is written here: a screen reader will not
announce "tab 2 of 5" or offer tab-specific navigation, and the `status` text
is what replaces it.

### 4.4 The four statuses

| Status     | Attribute       | When                                                              |
| ---------- | --------------- | ------------------------------------------------------------------ |
| `pending`  | none            | After the current step, and not marked complete.                  |
| `current`  | `data-current`  | The step the reader is on.                                        |
| `complete` | `data-complete` | Named by the consumer, or — with `autoComplete` — every earlier step. |
| error      | `data-invalid`  | Named by the consumer, and it beats `complete` in the marker.     |
| disabled   | `data-disabled` | Named by the consumer, or derived by a linear flow.               |

`complete` is the consumer's fact, not the family's: only the consumer knows
whether the form on step 2 was actually saved. `autoComplete` is the shorthand
for the flow where reaching step 3 does mean steps 1 and 2 are done, and it is
off by default so the family never claims something was completed that was
merely walked past.

### 4.5 Linear navigation, and how a move is refused

`linear` makes a step reachable only when every step before it is complete. A
trigger the flow has not reached carries `aria-disabled` and does not move the
step.

A consumer refusing a move for their own reason — a form that has not
validated — does it by cancelling the change request, which every mutable value
in this library already carries. Zag ships `isStepValid` and `onStepInvalid` for
the same job; this family needs neither, because `request.cancel()` says the
same thing, at the same moment, with the reason already attached.

### 4.6 Orientation, and the narrow answer

`horizontal` and `vertical` are the axis. Below 30rem of its own inline size a
horizontal stepper turns vertical, because a row of five labels at 320 pixels
is five columns of two characters. `docs/component-features.md` §2.7 asks
responsiveness to change composition rather than size, and this is the change.

A stepper the consumer set to `vertical` stays vertical at every width.

### 4.7 Keyboard

Every trigger stays in the tab sequence. The arrows are added on top of it
rather than replacing it with a roving tab stop, because the roving model is
what a `tablist` or a `radiogroup` has, and this family has declined to be
either.

| Key                                | Effect                                            | Focus lands on                       |
| ---------------------------------- | ------------------------------------------------- | ------------------------------------ |
| `Tab`                              | Next control on the page                          | The next enabled trigger, or past it |
| `Enter`, `Space`                   | Moves to the focused step, if it is reachable     | Stays on the trigger                 |
| `ArrowRight` / `ArrowLeft`         | Horizontal: focus the next / previous trigger, following the reading direction | That trigger |
| `ArrowDown` / `ArrowUp`            | Vertical: focus the next / previous trigger       | That trigger                         |
| `Home`                             | Focus the first enabled trigger                   | That trigger                         |
| `End`                              | Focus the last enabled trigger                    | That trigger                         |

The arrows wrap, and they skip a trigger the flow has disabled. In a
right-to-left document `ArrowRight` moves to the previous trigger, which is
what "the next item" means when the row runs the other way.

## 5. Integration tables

### 5.1 React

| Question                                                                 | Breadcrumb                                                                       | Pagination                                                                                    | Stepper                                                                              |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------| ------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, request carrying a reason              | yes — `expanded` / `defaultExpanded` / `onExpandedChange`                        | yes — `page` / `defaultPage` / `onPageChange`, `pageSize` / `defaultPageSize` / `onPageSizeChange` | yes — `step` / `defaultStep` / `onStepChange`                                        |
| Application-wide defaults                                               | yes — `BreadcrumbDefaultsProvider` (label, separator, collapse counts)           | yes — `PaginationDefaultsProvider` (labels, sibling and boundary counts, page size)            | yes — `StepperDefaultsProvider` (orientation, navigation, label placement, labels)   |
| Substituting the rendered element of each part                          | yes — `render` on root, list, item, link, page, separator, ellipsis              | yes — `render` on every part                                                                   | yes — `render` on root, list, item, trigger, panel, previous, next                   |
| The consumer's handler still runs                                       | yes — composed, never replaced                                                   | yes — composed, never replaced                                                                 | yes — composed, never replaced                                                       |
| Native element and imperative action                                    | yes — `ref` on every part; no imperative action exists that props cannot express | yes — `ref` on every part; `usePagination()` exposes `goToPage`, `next`, `previous`            | yes — `ref` on every part; `useStepper()` exposes `goToStep`, `next`, `previous`, `reset` |
| Server rendering without a mismatch                                     | yes — `useId` for the ellipsis controls relationship, no layout read in render   | yes — `useId` for the status region, no layout read in render                                  | yes — `useId` for trigger and panel ids, no layout read in render                    |
| Every state a consumer may style is in the DOM                          | yes — `data-expanded`, `data-current` from `aria-current`                        | yes — `data-disabled`, `data-loading`, `aria-current`                                          | yes — `data-current`, `data-complete`, `data-invalid`, `data-disabled`, `data-loading` |
| Props types are the native element's, extended                          | yes — `ComponentPropsWithRef<'nav' \| 'ol' \| 'li' \| 'a' \| 'span' \| 'button'>` | yes — same, per part                                                                           | yes — same, per part                                                                 |

### 5.2 Angular

| Question                                                | Breadcrumb                                                          | Pagination                                                           | Stepper                                                                    |
| ------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Two-way value in the signal form                        | yes — `model()` on `expanded`, plus `output()` carrying the reason  | yes — `model()` on `page` and `pageSize`, plus reason-carrying outputs | yes — `model()` on `step`, plus a reason-carrying output                   |
| Reactive Forms                                          | no — a trail holds no form value                                    | no — a paginator is navigation, not a form control                     | no — the wizard's forms are the consumer's; the stepper holds no value      |
| Defaults set once                                       | yes — `provideBreadcrumbDefaults()`                                 | yes — `providePaginationDefaults()`                                    | yes — `provideStepperDefaults()`                                            |
| A template can reach the instance                       | yes — `exportAs: 'slBreadcrumb'` and one per part                   | yes — `exportAs: 'slPagination'` and one per part                      | yes — `exportAs: 'slStepper'` and one per part                              |
| Projected content, kept lazy                            | yes — `ng-content`; the separator is a `TemplateRef` input rendered per item | yes — `ng-content` on the root; the parts are components the consumer places | yes — `ng-content`; the panel body is projected and the label is a `TemplateRef` input |
| Zoneless and `OnPush`                                   | yes — signals throughout, `contentChildren` for the item list       | yes — signals throughout                                               | yes — signals throughout, `contentChildren` for the step list               |
| Every subscription torn down                            | yes — `DestroyRef` for the one keydown listener                     | yes — no listener outside the template                                 | yes — `DestroyRef` for the arrow-key listener                               |
| A static attribute the consumer wrote survives          | yes — `HostAttributeToken` for `aria-label` on the root             | yes — `HostAttributeToken` for `aria-label` on the root                | yes — `HostAttributeToken` for `aria-label` on the list                     |
| Entry point stays a single class per import path        | yes — `@slotted/angular/breadcrumb`                                 | yes — `@slotted/angular/pagination`                                    | yes — `@slotted/angular/stepper`                                            |

### 5.3 Where the bindings are deliberately not the same

- React interleaves separators by mapping children inside `BreadcrumbList`;
  Angular does it with `contentChildren` on the same component and a `last`
  signal written back to each item. The DOM is identical and the code is not.
- React's imperative surface is a hook, `usePagination()` / `useStepper()`,
  read from the family's context. Angular's is the instance itself, reached
  through `exportAs`. Neither ecosystem has both, and levelling them down to a
  ref-with-methods would be idiomatic in neither.
- The Angular stepper's `previous` and `next` are directives on the consumer's
  own button, following `matStepperNext`; React's are components with `render`.

## 6. Decisions recorded rather than raised

| Question                                                    | Decision                                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Is the breadcrumb's current page a link?                    | No. A `span` with `aria-current="page"`, per the APG. A consumer who needs it clickable writes a `link` part with the same attribute. |
| Where does the breadcrumb's label live?                     | On the `nav`, defaulting to "Breadcrumb", replaceable per instance and once per application.                       |
| Does the stepper root become a landmark?                    | No. A second `navigation` landmark on a page whose main navigation is elsewhere is noise; a consumer whose steps are pages wraps it in their own `nav`. |
| Does pagination render nothing when there is one page?      | No. It renders and disables; hiding a control the reader saw a moment ago is the consumer's decision, not the family's. |
| Does the ellipsis in pagination do anything?                | No. It is a `span`, announced to nobody. Zag, MUI and Primer agree, and a jump-to-page control is a different widget. |
| What happens to a step marked complete after the current one? | It stays complete. The consumer said so, and a family that overrode them would be inventing a flow.                |
| Does the stepper animate between panels?                    | No. The connector and the marker transition, because the eye follows them; a panel that fades in delays reading.   |
