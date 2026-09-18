# Breadcrumb, Pagination and Stepper — capability inventory

Produced before any implementation is read or written, from the field rather
than from the families. The three previous implementations were removed from
the working tree before this invocation, so every family is built rather than
touched up; the delta section at the end states what each one shipped at
`de8acbd:specs/components/<family>/contract.json` and what it will ship now.

## 1. Surveyed

| Family     | Source                                                                                                                | Called                          | Read at                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| breadcrumb | WAI-ARIA APG, Breadcrumb Pattern and its example                                                                      | Breadcrumb                      | <https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/> and `.../examples/breadcrumb/>`            |
| breadcrumb | React Aria 1.x                                                                                                        | `Breadcrumbs` / `Breadcrumb`    | <https://react-spectrum.adobe.com/react-aria/Breadcrumbs.html>                                    |
| breadcrumb | shadcn/ui (Base UI)                                                                                                   | `Breadcrumb*`, seven parts      | <https://ui.shadcn.com/docs/components/breadcrumb>                                                |
| breadcrumb | MUI Material                                                                                                          | `Breadcrumbs`                   | <https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/components/breadcrumbs/breadcrumbs.md> |
| pagination | Zag.js 1.43.3 / Ark UI                                                                                                | `pagination`                    | <https://zagjs.com/components/react/pagination>                                                   |
| pagination | Angular Material 22                                                                                                   | `mat-paginator`                 | <https://raw.githubusercontent.com/angular/components/main/src/material/paginator/paginator.md>   |
| pagination | Primer React                                                                                                          | `Pagination`                    | <https://primer.style/product/components/pagination/>                                             |
| pagination | Shopify Polaris                                                                                                       | `Pagination`                    | `Shopify/polaris@main:polaris-react/src/components/Pagination/Pagination.tsx`                     |
| pagination | WAI-ARIA 1.2                                                                                                          | `aria-current="page"`           | <https://www.w3.org/TR/wai-aria-1.2/#aria-current>                                                |
| stepper    | Zag.js 1.43.3 / Ark UI                                                                                                | `steps`                         | <https://zagjs.com/components/react/steps>                                                        |
| stepper    | Angular CDK 22 and Angular Material 22                                                                                | `CdkStepper` / `mat-stepper`    | `angular/components@main:src/cdk/stepper/stepper.md` and `src/material/stepper/stepper.md`        |
| stepper    | MUI Material                                                                                                          | `Stepper` / `Step*`             | <https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/components/steppers/steppers.md> |
| stepper    | Carbon Design System                                                                                                  | `ProgressIndicator`             | <https://carbondesignsystem.com/components/progress-indicator/accessibility/>                     |
| stepper    | W3C WAI, Web Accessibility Tutorials                                                                                  | Multi-page forms                | <https://www.w3.org/WAI/tutorials/forms/multi-page/>                                              |
| stepper    | WAI-ARIA 1.2                                                                                                          | `aria-current="step"`           | <https://www.w3.org/TR/wai-aria-1.2/#aria-current>                                                |

The APG pattern index holds thirty patterns and neither `pagination` nor
`stepper` is among them; the list was read at
<https://www.w3.org/WAI/ARIA/apg/patterns/> and enumerated rather than recalled.
For both families the official guidance is the `navigation` landmark plus
`aria-current`, whose specification names these two cases by name: "A `page`
token used to indicate a link within a set of pagination links" and "A `step`
token used to indicate a link within a step indicator for a step-based
process."

## 2. Table stakes

### Breadcrumb

| Capability                                        | Who ships it                       | Verdict                 | Reason                                                                                                                                                    |
| ------------------------------------------------- | ---------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nav` landmark carrying its own label             | APG, React Aria, shadcn, MUI       | adopt                   | The landmark is what makes the trail findable; the label is what distinguishes it from the other landmarks on the page.                                    |
| Ordered list structure                            | APG, shadcn, MUI                   | adopt                   | Hierarchy and position in the set come from `ol`/`li` rather than from ARIA.                                                                               |
| `aria-current="page"` on the last crumb           | APG, React Aria, shadcn            | adopt                   | Sourced from the ARIA specification, not from the pattern alone.                                                                                          |
| Separator absent from the accessibility tree      | APG, shadcn, MUI                   | adopt                   | The APG example draws it in CSS for exactly this reason. This family draws geometry, never a character and never a glyph mask.                             |
| Current page as text rather than as a link        | APG, shadcn                        | adopt                   | A link to the page the reader is on is a link that does nothing.                                                                                          |
| Collapsing a long trail behind an ellipsis        | shadcn, MUI                        | adapt                   | Ellipsis is a `button` that expands the trail in place. A menu overlay would make the family wait for `menu` in wave 5; expansion needs no overlay at all. |
| Substituting the anchor for a router's own link   | React Aria, shadcn, MUI            | adopt                   | `render` in React; the Angular directive already sits on the consumer's `a`, where `routerLink` composes.                                                  |
| Truncating one long crumb                         | MUI (`maxItems` + CSS), Carbon     | adopt                   | `text-overflow` keeps the string in the DOM, which the repository requires of every truncation.                                                            |
| Disabling a crumb                                 | React Aria                         | decline                 | One implementation, so not table stakes; a crumb pointing nowhere is a `page` part, which the family already ships.                                        |
| Skeleton while the trail loads                    | Carbon                             | decline                 | `skeleton` owns it and already exists: `<BreadcrumbItem><Skeleton width="6ch" /></BreadcrumbItem>`.                                                        |
| A size axis                                       | Carbon                             | decline                 | One implementation. The three densities answer it, and a second scale would contradict them.                                                              |

### Pagination

| Capability                                        | Who ships it                                  | Verdict                 | Reason                                                                                                                                                    |
| ------------------------------------------------- | --------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Current page, controlled and uncontrolled         | Zag, Material, Primer, MUI                    | adopt                   | `page` / `defaultPage` / `onPageChange`, with the reason every request in this library carries.                                                            |
| Total item count and page size                    | Zag, Material, Carbon                         | adopt                   | The paginator is given items, not pages; a family given pages cannot write "21–40 of 482".                                                                 |
| Sibling and boundary counts with ellipsis         | Zag, MUI, Primer                              | adopt                   | Three names for one idea. Zag's pair is the clearest and is adopted verbatim.                                                                              |
| Previous and next triggers, disabled at the bounds| Zag, Material, MUI, Primer, Polaris           | adopt                   | Also the whole of the cursor variant.                                                                                                                     |
| First and last triggers, opt-in                   | Zag, Material, MUI                            | adopt                   | Off by default: four triggers around three numbers is noise on a five-page collection.                                                                    |
| Page size selection                               | Material, Carbon, Zag                         | adapt                   | The part renders a native `select`. `select` in wave 6 owns the styled listbox; a paginator that cannot resize its page until then is not usable in a table.|
| Item range text                                   | Material, Carbon, Polaris                     | adopt                   | "21–40 of 482" is the sentence the numbers do not say.                                                                                                    |
| Unknown total                                     | Carbon (`pagesUnknown`), Polaris              | adopt                   | The guide's own words: the family never invents a total the server does not know.                                                                          |
| Items as links with real URLs                     | Zag (`type: 'link'`), Primer, MUI             | adopt                   | A middle click, a bookmark and a crawler all need an `href`. `itemHref` decides the element.                                                               |
| Translatable labels                               | Zag, Material (`MatPaginatorIntl`), Polaris   | adopt                   | Set once for the application through the defaults provider, overridable per instance.                                                                      |
| `aria-current="page"` on the current item         | Zag, MUI, Primer                              | adopt                   | Sourced from the ARIA specification.                                                                                                                      |
| A narrow layout that keeps previous and next      | Polaris, Carbon, Material                     | adapt                   | A container query, not a viewport query: the numbered list gives way to the range text below the family's own breakpoint.                                  |
| Announcing the new page                           | Material, Carbon                              | adopt                   | One polite live region on the range text; the label is not re-announced on every keystroke.                                                                |
| Keyboard shortcuts for previous and next          | Polaris                                       | decline                 | One implementation, and `packages/core/src/keys/keys.ts` already records that registering a shortcut belongs to whoever can turn it off (WCAG 2.2 2.1.4).  |
| Roving tabindex across the page numbers           | none                                          | decline                 | No surveyed implementation does it. A list of links inside a landmark is a list of tab stops; a roving one would be a widget lying about being navigation. |

### Stepper

| Capability                                          | Who ships it                        | Verdict          | Reason                                                                                                                                    |
| --------------------------------------------------- | ----------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Current step, controlled and uncontrolled           | Zag, CDK, MUI, Carbon               | adopt            | `step` / `defaultStep` / `onStepChange`, carrying a reason.                                                                               |
| Per-step status: pending, current, complete, error  | Zag, CDK, MUI, Carbon               | adopt            | `complete` has no word in the shared state vocabulary. The vocabulary is extended, in its own commit, before this family is written.       |
| Horizontal and vertical orientation                 | Zag, CDK, MUI, Carbon               | adopt            | Vertical is also the narrow-width answer, so it is not only an axis.                                                                      |
| Linear and non-linear navigation                    | Zag, CDK, MUI                       | adopt            | Linear derives reachability from completion; non-linear reaches every enabled step.                                                       |
| Blocking a move, and saying why                     | Zag (`onStepInvalid`), CDK          | adapt            | The library's change request is already cancellable and already carries a reason, so no second pair of hooks is invented for this family.  |
| Step headers that are controls                      | CDK, MUI (`StepButton`), Carbon     | adopt            | `navigation="button" \| "link" \| "none"`; `none` is Carbon's read-only indicator.                                                        |
| Connector between steps, painted by progress        | Zag, CDK, MUI, Carbon               | adopt            | The connector is the only part that shows how far the flow has come without reading a number.                                             |
| Marker: index, check when complete, mark when error | Zag, CDK, MUI, Carbon               | adopt            | Glyph masks from the scale. Progress that depends only on colour is what the guide forbids.                                               |
| Optional and secondary labels                       | CDK, MUI, Carbon                    | adopt            | `label` and `description` parts.                                                                                                          |
| Label placement                                     | CDK (`labelPosition`), MUI, Ant     | adopt            | `end` beside the marker, `bottom` under it.                                                                                               |
| Content panel per step                              | Zag, CDK, MUI                       | adopt            | Disclosure only: the panel shows the current step. Validation, persistence and submission stay with the consumer, as the guide requires.  |
| Previous and next triggers                          | Zag, CDK (`matStepperNext`)         | adopt            | A directive on the consumer's own button in Angular; a part with `render` in React.                                                       |
| Keyboard between step headers                       | CDK (arrows, Enter, Space)          | adapt            | Arrows and Home/End move focus, and every header stays in the tab sequence. See the pattern note below.                                   |
| Completion percentage                               | Zag (`percent`), MUI, Ant           | adapt            | The number is exposed and the connector is painted from it; the bar is `progress-indicator`'s, wave 2.                                    |
| `role="tab"` on the headers                         | Material                            | decline          | `docs/component-features.md` §7 forbids it in the Tabs entry: tabs are for peer views, not for the steps of a process.                    |
| A size axis                                         | Ant                                 | decline          | One implementation. The three densities answer it.                                                                                        |
| Step animation between panels                       | Material                            | decline          | The panel is a disclosure; the family animates the connector and the marker, which are the changes the eye has to follow.                 |

## 3. Differentiators

| Row                                                                                                                                                                                                | Family     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Collapse that expands in place. shadcn and MUI both reach for an overlay or a static ellipsis; a `button` carrying `aria-expanded` and the count of what it hides needs no overlay and works on a phone. | breadcrumb |
| A separator that is drawn geometry rather than a character or a glyph mask, and that mirrors from `:dir(rtl)` instead of from an ancestor attribute.                                                 | breadcrumb |
| One arithmetic module, `@slotted/core/pagination`, so the React and Angular page ranges cannot disagree. Every surveyed implementation re-derives the range per binding.                              | pagination |
| Compaction driven by the family's own inline size, not the viewport, so a paginator under a table in a split pane compacts and the same paginator on a full page does not.                            | pagination |
| Numbers that do not resize as they grow: tabular figures and a minimum inline size equal to the control height, so page 9 and page 1000 are the same target.                                          | pagination |
| One family covering both an interactive stepper and a read-only progress indicator, which the field ships as two components (Material Stepper, Carbon ProgressIndicator).                              | stepper    |
| Linear navigation blocked by cancelling the change request the library already defines, instead of a second bespoke validation hook.                                                                 | stepper    |
| A horizontal stepper that becomes vertical from its own container query, which is the composition change §2.7 asks for rather than a smaller version of the same row.                                | stepper    |
| Three colour schemes, three densities and logical properties across all three families, which no surveyed implementation carries in one package.                                                     | all three  |

## 4. Gaps

| Gap                                                                                        | Answer                                                                                                                        | Family     |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| A crumb whose label is one unbroken 60-character token                                     | `text-overflow: ellipsis` with a per-crumb maximum measure; the string stays in the DOM and in the accessible name.           | breadcrumb |
| A trail of eleven crumbs at 240 pixels                                                     | Collapse to first, ellipsis, last two; the ellipsis says how many it hides.                                                    | breadcrumb |
| A trail whose only crumb is the current page                                               | No separator is drawn, and the landmark still carries its label.                                                              | breadcrumb |
| The collection shrinks under a reader who is on page 40                                    | The page is clamped and a `programmatic` request is emitted, so the consumer's own state follows.                             | pagination |
| A total of nought, and a total of one page                                                 | `hidden` is not assumed; the family renders the range text and disables both triggers, and the consumer decides to hide it.   | pagination |
| Ten thousand pages                                                                         | Tabular figures, a minimum target, and boundary and sibling counts that keep the row a fixed number of items.                 | pagination |
| A page change that takes a second                                                          | `loading` disables the triggers, preserves the row's width, and keeps the accessible name.                                    | pagination |
| A step that is complete and in error at once                                               | `invalid` wins, from `STATE_PRECEDENCE`, and the marker draws the alert rather than the check.                                | stepper    |
| Twelve steps horizontally at 420 pixels                                                    | The container query turns the row into a column before the labels collide, rather than shrinking them until they are unreadable.| stepper    |
| A step label that is a 40-character German compound                                        | The label wraps; the marker never does, and the connector takes the remaining space.                                          | stepper    |
| Async validation between two steps                                                         | `loading` on the trigger, `next` disabled, the request cancellable until the answer arrives.                                  | stepper    |
| A stepper of one step                                                                      | No connector is drawn, and the family still announces "Step 1 of 1".                                                          | stepper    |

## 5. Delta against what shipped

Read from `de8acbd`, after the inventory above was written.

| Family     | What shipped                                                                                                            | What the field ships                                            | What this family will ship                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| breadcrumb | Four members, one capability each (`wiring`, plus `current` on the link), no axes, no collapse, no state, schema 4.       | Collapse, truncation, router substitution, a labelled landmark. | One member, six parts, a collapse with a state model, truncation, a `page` part, and a label the landmark carries.                     |
| pagination | Five members, `wiring` only, no page state, no counts, no ellipsis arithmetic, no triggers beyond markup, schema 4.       | Page state, counts, ellipsis, triggers, page size, range text.  | One member, eleven parts, two state models, link or button items, a live region and a container-query compaction.                      |
| stepper    | Four members, `wiring` and `current`, no step state, no linear policy, no panel, no keyboard, schema 4.                   | Step state, statuses, linear policy, panels, triggers, keyboard.| One member, ten parts, a state model, four statuses, two orientations, three navigation modes, panels and a keyboard model.            |

Nothing the three families held is kept because it was held. `separator:
"stylesheet"` from the old breadcrumb contract is the one decision that
survives on its merits, and it survives as the same decision restated: the
separator is drawn, not written.
