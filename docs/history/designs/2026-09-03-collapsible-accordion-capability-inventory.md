# Collapsible and Accordion — capability inventory

Produced before either family was designed, as
`.claude/skills/component/references/capability.md` requires. Neither family
exists in the tree: `collapsible` was removed with the rest of the schema-4
families on 2026-09-02 and `accordion` was never built, so `docs/history/build-log.md`
is evidence of a past decision rather than a constraint on this one. The delta
against what shipped is written under **Against what shipped**.

## 1. Surveyed

| #   | Families              | Source, read 2026-09-03                                                                                          | What it calls them                                                       |
| --- | --------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | both                  | WAI-ARIA APG — `w3.org/WAI/ARIA/apg/patterns/accordion/`, `.../patterns/disclosure/`, `.../accordion/examples/accordion/` | Accordion (header, panel); Disclosure (button, content)             |
| 2   | both                  | Radix Primitives — `radix-ui.com/primitives/docs/components/{accordion,collapsible}`                              | Accordion: Root/Item/Header/Trigger/Content. Collapsible: Root/Trigger/Content |
| 3   | both                  | Base UI 1.7.0 — `base-ui.com/react/components/{accordion,collapsible}`                                            | Accordion: Root/Item/Header/Trigger/Panel. Collapsible: Root/Trigger/Panel |
| 4   | both                  | Ark UI 5.39.1 — `ark-ui.com/react/docs/components/{accordion,collapsible}`                                        | Accordion: Root/Item/ItemTrigger/ItemIndicator/ItemContent. Collapsible: Root/Trigger/Content |
| 5   | both                  | React Aria — `react-spectrum.adobe.com/react-aria/{Disclosure,DisclosureGroup}.html`                              | Disclosure/DisclosureHeader/DisclosurePanel; DisclosureGroup             |
| 6   | accordion             | Angular Material — `angular/components@main:src/material/expansion/expansion.md`, `src/cdk/accordion/accordion.md` | `mat-accordion`, `mat-expansion-panel`, `mat-expansion-panel-header`, `mat-panel-title`, `mat-panel-description`; `cdkAccordion`, `cdkAccordionItem` |
| 7   | accordion             | Carbon — `carbondesignsystem.com/components/accordion/usage/`                                                     | Accordion, accordion item; alignment `start`/`end`, flush                 |
| 8   | both                  | The platform — MDN `<details>`, `::details-content`, `interpolate-size`, `hidden` (`until-found`)                 | `details`/`summary`, `name` groups                                       |
| 9   | both                  | This repository — `docs/history/build-log.md` entry “Collapsible — 2026-08-31”, `specs/components/{tabs,checkbox-group}/contract.json` | Collapsible on `details`/`summary`; the group/item shape of `checkbox-group` |

### The pattern, transcribed

**Disclosure** (`w3.org/WAI/ARIA/apg/patterns/disclosure/`). Two elements: a
disclosure button and the section whose visibility it controls. Keyboard, with
focus on the control: `Enter` toggles the content; `Space` toggles the content.
Roles, states and properties: the control has role `button`; it carries
`aria-expanded="true"` while the content is visible and `"false"` while it is
hidden; it optionally carries `aria-controls` referring to the element holding
the content.

**Accordion** (`w3.org/WAI/ARIA/apg/patterns/accordion/`). Keyboard:

| Key           | Effect                                                                                                                                   | Focus            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `Enter`       | On the header of a collapsed panel, expands it; where only one panel may be open, collapses the one that was. On the header of an expanded panel, collapses it where collapsing is supported. | stays on the header |
| `Space`       | The same as `Enter`.                                                                                                                      | stays on the header |
| `Tab`         | Moves to the next focusable element. **Every focusable element in the accordion is in the page tab sequence.**                             | the next element |
| `Shift + Tab` | Moves to the previous focusable element, under the same rule.                                                                             | the previous element |

Roles, states and properties: the header title is in an element with role
`button`; each header button is wrapped in an element with role `heading`
carrying an `aria-level` appropriate to the page, and **the button is the only
element inside the heading**; the button carries `aria-expanded` and
`aria-controls` naming the panel; a header whose panel is open in an accordion
that does not permit collapsing carries `aria-disabled="true"`; the panel
optionally has role `region` with `aria-labelledby` pointing back at its
header, and the example warns that a `region` is a landmark, so the role is for
accordions with a small number of panels.

**The arrow keys are no longer part of the pattern.** They were optional
guidance and were removed by `w3c/aria-practices#3434`; Base UI has since
deprecated both `loopFocus` and `orientation` on `Accordion.Root`, stating in
its own type documentation that the state “no longer affects keyboard focus
behavior”. Radix and Ark still ship `ArrowDown`, `ArrowUp`, `Home` and `End`
**in addition to** a full tab sequence, which is additive rather than a roving
tab stop. That distinction decides row 6 of the accordion table below.

## 2. Table stakes — collapsible

| Capability                                       | Who ships it                                                                    | Verdict            | Reason                                                                                                                                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open state, controlled and uncontrolled          | Radix, Base UI, Ark, React Aria (`isExpanded`/`defaultExpanded`), the platform (`open`) | adopt          | `open` state model: `open` / `defaultOpen` / `onOpenChange`, request carrying the reason and `cancel()`.                                                                                          |
| A trigger with `aria-expanded` and `aria-controls` | APG, all five libraries                                                          | adopt              | The `trigger` part is a `button`; the platform supplies `Enter` and `Space`, so the family binds no key for toggling.                                                                             |
| Disabling the family                             | Radix, Base UI, Ark, React Aria (`isDisabled`)                                    | adopt              | The native `disabled` attribute on the trigger, mirrored to the root as `data-disabled`.                                                                                                          |
| Keeping the panel mounted while closed           | Radix (`forceMount`), Base UI (`keepMounted`), Ark (`lazyMount` + `unmountOnExit` + `hideMode`), React Aria | adapt | One `mount` axis with four values — `active`, `lazy`, `eager`, `until-found` — rather than three booleans that admit combinations meaning nothing. The names are Cloudscape's, already used by `tabs`. |
| Find-in-page reaching closed content             | Base UI (`hiddenUntilFound`), the platform (`details`, `hidden="until-found"`)   | adopt              | `mount="until-found"` writes `hidden="until-found"` on the panel and listens for `beforematch`. Two of the nine surveyed sources ship it and it is the one thing a `details` family got for free.  |
| Animating the panel's height                     | Radix (`--radix-collapsible-content-height`), Base UI (`--collapsible-panel-height`), Ark, Material | adapt | The transition is `grid-template-rows: 0fr → 1fr`. Every surveyed React implementation measures the panel and writes a custom property; nothing here measures. See **Differentiators**.        |
| Substituting the rendered element of each part   | Radix (`asChild`), Base UI (`render`), Ark (`asChild`), React Aria               | adopt              | `render` in React, the directive on the consumer's own element in Angular.                                                                                                                       |
| Data attributes for every visible state          | Radix (`data-state`), Base UI, Ark (`data-state`, `data-disabled`)               | adapt              | The library's own vocabulary: `data-open`, `data-disabled`. `data-state="open"` is not in `specs/contract.schema.mjs`, and one vocabulary is worth more than agreement with one library.          |
| A heading around the trigger                     | APG (required for an accordion), Base UI (`Accordion.Header` renders `h3`), React Aria (`DisclosureHeader`), Material | adopt | A `heading` part with a `level` axis, `1`–`6` or `none`. A standalone disclosure defaults to `none`; inside an accordion the group supplies `3`.                                                 |
| An indicator that turns                          | Ark (`ItemIndicator`), Material (toggle icon), Carbon (chevron), the platform (marker) | adopt        | An `indicator` part drawn from a glyph token, never a character.                                                                                                                                |
| Hiding the indicator                             | Material (`hideToggle`), Carbon                                                  | adopt              | `indicator="none"`.                                                                                                                                                                             |
| Putting the indicator before or after the label  | Material (`togglePosition: before \| after`), Carbon (alignment `start \| end`)  | adopt              | `togglePlacement: start \| end`, logical, so a right-to-left document mirrors it without a second rule.                                                                                          |
| A second line of text in the header              | Material (`mat-panel-description`), Carbon (title plus optional content)         | adopt              | A `description` part inside the trigger. It is what the APG means by “a snippet of the hidden content may also be visually persistent”.                                                          |
| Always-visible controls beside the header        | APG (“a menubutton may accompany each accordion header”), Material (header actions) | adopt          | An `actions` part in the header row, a **sibling** of the heading rather than a child: the APG requires the button to be the only element inside the heading, and a control inside a `button` is invalid HTML besides. |
| Size steps                                       | Carbon (`size: sm \| md \| lg`), Material                                        | adopt              | `size: sm \| md \| lg`, read from the control scales so a density moves all three.                                                                                                              |
| A framed or flush appearance                     | Carbon (default and flush), Material (`displayMode: default \| flat`)            | adapt              | `variant: plain \| framed`. `plain` is Carbon's flush; `framed` draws the border and the surface.                                                                                                |
| Toggling with no script at all                   | the platform (`details`/`summary`)                                               | decline            | The family is a `button` and a region, for the four reasons written under **Against the platform** below. The cost — a page with JavaScript disabled cannot open a panel — is the price, and it is stated on the reference page rather than hidden. |
| Horizontal collapsing (width rather than height) | Radix (`--radix-collapsible-content-width`), Base UI                              | decline            | Two of nine ship it and neither ships a use for it. A drawer that opens sideways is `sidebar`'s (wave 6), and a consumer needing it today writes `[data-ui='collapsible'] [data-part='panel'] { grid-template-rows: 1fr; grid-template-columns: var(--open, 0fr) }` — three lines against an axis every consumer would have to read past. |

## 3. Table stakes — accordion

| Capability                                        | Who ships it                                                                     | Verdict          | Reason                                                                                                                                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The set of open panels, controlled and uncontrolled | Radix (`value`), Base UI (`value: Value[]`), Ark (`value: string[]`), React Aria (`expandedKeys`), Material | adopt | `selection` state model: `value` / `defaultValue` / `onValueChange`, an array, with the request carrying the reason. The name matches `tabs` and `checkbox-group`.                       |
| One panel open, or several                        | Radix (`type`), Base UI (`openMultiple`), Ark (`multiple`), React Aria (`allowsMultipleExpanded`), Material (`multi`) | adapt | A boolean `multiple`, default `false`. Radix's `type: 'single' \| 'multiple'` changes the type of `value` with it, which is a discriminated union two bindings cannot express the same way. |
| Refusing to close the last open panel             | Radix (`collapsible={false}`, the default), Ark (`collapsible`), APG (`aria-disabled`) | adopt         | `requireOpen`, default `false`. The name avoids the collision with the sibling family; the APG's `aria-disabled="true"` on the header that may not close is shipped with it, and only the APG's own example ships that today. |
| Disabling the whole group                         | Radix, Base UI, Ark, React Aria                                                   | adopt            | Stated on the group, reaching every item as the native attribute.                                                                                                                            |
| Disabling one item                                | Radix, Base UI, Ark, React Aria, Material                                          | adopt            | The item is a `collapsible`; the attribute is already its own.                                                                                                                               |
| Arrow keys between headers                        | Radix, Ark                                                                        | adapt            | `ArrowDown`, `ArrowUp`, `Home` and `End` move focus between triggers **without a roving tab stop**: every trigger stays in the page tab sequence, which is what the APG requires and what `w3c/aria-practices#3434` removed the alternative for. `loop` says whether the arrows wrap. |
| Wrapping focus at the ends                        | Radix (`loop`), Base UI (`loopFocus`, deprecated), Ark (`loopFocus`)               | adopt            | `loop`, default `true`.                                                                                                                                                                      |
| A horizontal accordion                            | Radix (`orientation`), Ark (`orientation`), Base UI (deprecated)                   | defer to `tabs`  | A horizontally stacked set of sections of which one is open is a tab list, and `tabs` shipped in this wave with the marker, the scrolling list and the APG's own keyboard model. Base UI deprecated its own `orientation` in the same change that removed roving focus. |
| Lazy content per item                             | Material (`ng-template matExpansionPanelContent`), Ark (`lazyMount`)               | adopt            | The `mount` axis, provided to every item.                                                                                                                                                    |
| Setting the heading level once                    | Base UI, React Aria, Material                                                      | adopt            | `headingLevel` on the group, default `3`, reaching every item.                                                                                                                               |
| Each item drawn as its own card                   | Carbon (default versus flush), Material (`displayMode`)                            | adapt            | `variant: plain \| framed \| separated`. `separated` gives each item its own frame and a gap; `framed` draws one frame around the set with a rule between items.                              |
| Expanding or collapsing everything at once        | Material (`accordion.openAll()`, `closeAll()`)                                     | adopt            | The value is an array a consumer already owns, so the two lines are `setValue(items.map((item) => item.id))` and `setValue([])`. Shipped as an escape hatch anyway, because an uncontrolled accordion has no array to set: `openAll()` and `closeAll()` on the ref and on `exportAs`. |
| Reporting which header has focus                  | Ark (`onFocusChange`)                                                              | decline          | One of nine ships it, and `onFocusIn` on the group is the same information from the platform. A consumer writes `onFocusIn={(event) => read(event.target.dataset.value)}`.                    |

## 4. Differentiators

| Differentiator                                                     | Where it comes from                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A panel that animates without being measured.**                  | Radix writes `--radix-collapsible-content-height` from a layout read, Base UI writes `--collapsible-panel-height`, Ark and Material do the same in their own words. All four are wrong for one frame on the server and after a resize the observer did not see. `grid-template-rows: 0fr → 1fr` transitions to the content's own height with no measurement, so the family is right in a server response, right during the first paint, and right when the content grows while open. It is the same decision `tabs` took for its marker. |
| **The APG's `aria-disabled` on a header that may not collapse.**    | The pattern states it and the APG example is the only surveyed source that ships it. It arrives here with `requireOpen`.                                                                                                                                        |
| **Find-in-page that opens the panel it found.**                    | `mount="until-found"` writes `hidden="until-found"` and answers `beforematch` by requesting `open`. Base UI is the only library of the five that ships the idea; here it is one value of an axis a consumer is already reading rather than a second boolean.      |
| **Three colour schemes, three densities, and one logical layout.**  | No surveyed library answers `high-contrast` as a selectable scheme, and none restates its geometry per density. The indicator turns rather than pointing along the inline axis, so a right-to-left document needs no mirrored artwork at all.                    |
| **Two first-class bindings.**                                       | Angular gets `model()` for `open`, an injection token for the defaults and `exportAs` for the imperative pair; React gets a context provider, `render` and a ref. Neither is levelled down to the other: React Aria and Radix have no Angular, Material has no React. |
| **One family for a disclosure and one for the group of them.**      | Radix ships two unrelated families, React Aria ships `Disclosure` and `DisclosureGroup`, Ark and Base UI duplicate the whole item API inside their accordion. Here `accordion` declares `itemFamily: "collapsible"` and the item is the same component with the same contract — the shape `checkbox-group` and `button-group` already use in this library. |

## 5. Gaps

| Gap a real product hits                                                 | What the surveyed implementations do                                                                                                | What this family does                                                                                                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A panel whose content is still loading                                  | none of the nine has a loading state; every one leaves the reader with an empty box after the panel opens                            | `loading` on the item paints a placeholder row in the panel and holds the trigger's `aria-expanded="true"` with `aria-busy="true"`, so the reader is told the box is not empty yet. |
| A panel whose content grows while it is open                            | every implementation that measures is wrong until its observer fires; Radix and Base UI both ship resize observers to compensate     | Nothing is measured, so nothing is stale. The `1fr` track is the content's height at every frame.                                                                              |
| A header title longer than the row                                      | Carbon truncates with an ellipsis; the others let it wrap and push the indicator off the line                                        | The label wraps by default and the indicator keeps its own column, so the row grows instead of the mark leaving it. `truncate` clips to one line where the row may not grow, and the full string stays in the DOM, which `docs/build-briefing.md` already decided for the library. |
| A header title in another script inside a page that reads the other way | none addresses it                                                                                                                    | The label is its own box with `unicode-bidi: plaintext`, as `tabs` and `tag` already do.                                                                                       |
| An unbroken token — a hash, a URL — as a title                          | none addresses it; the row's width is then set by the token                                                                          | The label breaks inside the word rather than setting the row's width.                                                                                                         |
| Nothing to show at all                                                  | none of the nine has an empty state                                                                                                  | An accordion with no items renders the group and nothing else; the empty message is `result-state`'s, and the reference page shows the composition rather than inventing a second answer. |
| A hundred sections                                                      | Material and Carbon both slow down; Radix and Base UI mount every trigger                                                            | `mount="active"` keeps one panel in the DOM. Virtualising the headers is `list`'s (wave 4) and is named rather than attempted here.                                            |
| A reader who asked the system for stillness                             | Radix and Ark ship keyframes a consumer writes; Material animates unconditionally                                                    | The duration comes from the motion scale, which the theme collapses under `prefers-reduced-motion`, so the panel appears rather than sliding.                                  |

## 6. Against what shipped

`docs/history/build-log.md`, entry “Collapsible — 2026-08-31”, recorded a family built
on `details` and `summary`, reading the platform's `open` attribute, with the
note that “Accordion (T3) is a group of these; `<details name="…">` gives
exclusive opening natively and would mean Accordion adds a name and nothing
else”. That entry also recorded two costs: `details` does not animate its own
height, and a controlled React collapsible had to write `open` back after the
element opened itself.

**Against the platform.** The element is not carried forward, and the four
reasons are:

1. **The accordion pattern cannot be expressed with it.** The APG requires the
   trigger button to be the only element inside a heading carrying `aria-level`.
   `<summary>` may not be wrapped in a heading — it must be the first child of
   `<details>` — and a heading placed inside `<summary>` puts the heading inside
   the button, which the same paragraph forbids.
2. **It cannot be controlled.** The element opens itself and the consumer's
   value is then behind by a frame; the previous build wrote the value back,
   which is a repaint the reader can see.
3. **`name` gives exclusive opening and nothing else.** It cannot express
   `multiple`, cannot express `requireOpen`, and emits no request a consumer can
   cancel or read a reason from — the whole of `docs/state-and-events.md`.
4. **It still does not animate.** `::details-content` reached Baseline in
   September 2025, but animating to an intrinsic height through it needs
   `interpolate-size: allow-keywords`, which MDN records as limited
   availability. The grid transition needs neither.

What is lost is real and is written on both reference pages: a page with
JavaScript disabled cannot open a panel, and find-in-page no longer reveals
closed content on its own. The second is answered by `mount="until-found"`; the
first is not, and is the cost of the other three.

## 7. The exit condition

A reader who knows this family from Radix, Base UI, Ark, React Aria, Angular
Material or Carbon can point at `type`, `collapsible`, `orientation`,
`forceMount`, `keepMounted`, `hideMode`, `lazyMount`, `unmountOnExit`,
`hiddenUntilFound`, `loopFocus`, `hideToggle`, `togglePosition`,
`displayMode`, `multi`, `expandedKeys`, `allowsMultipleExpanded`, `openAll`,
`closeAll`, `onFocusChange`, the content-height custom property and the `name`
attribute, and find each one above with its verdict and its reason.
