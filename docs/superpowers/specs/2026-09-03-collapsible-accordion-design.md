# Collapsible and Accordion — design

Written before either binding, as `.claude/skills/component/references/frameworks.md`
requires. The capability inventory it acts on is
`2026-09-03-collapsible-accordion-capability-inventory.md`.

## 1. Responsibility

`collapsible` is one disclosure: a header the reader operates and a panel whose
visibility it controls. `accordion` is a set of them that share a value.

The relationship is the one `checkbox-group` has with `checkbox` and
`button-group` has with `button`: the group holds the value, arranges the items
and hands each one the decisions taken once, and the item draws itself.
`accordion`'s contract declares `itemFamily: "collapsible"`, and its stylesheet
selects nothing inside the item family — a rule reaching `[data-ui='collapsible']`
from the group would make one family's DOM part of another's contract.

## 2. Anatomy

### collapsible

```
root                      div, data-ui="collapsible"
├── header                h3 by default, or the element `level` names
│   └── trigger           button, aria-expanded, aria-controls
│       ├── indicator     span, the mask
│       ├── label         span, the words
│       └── description   span, the second line          (optional)
├── actions               div, beside the header          (optional)
└── panel                 div, role="region" optional, aria-labelledby the trigger
    └── content           div, the box that is clipped while closed
```

Two placements are decisions rather than arrangements.

**`actions` is a sibling of `header`, not a child.** The APG requires the
button to be the only element inside the heading, and a control inside a
`button` is invalid HTML besides. The root is a two-column grid, so the two sit
on one line without either being inside the other.

**`content` exists because `panel` animates.** The panel's open transition is
`grid-template-rows: 0fr → 1fr`; a grid track can only clip a child, so the
child is a part rather than the consumer's own first element.

### accordion

```
root                      div, data-ui="accordion"
└── (collapsible items, each its own family)
```

One part. A group is a box around items, and any second part here would be
invented: the value, the keyboard, the heading level, the mount strategy and the
variant mapping are what the family holds, and none of them is a box.

## 3. State

| Family        | Capability  | Controlled | Uncontrolled   | Request          | Reasons                                        |
| ------------- | ----------- | ---------- | -------------- | ---------------- | ---------------------------------------------- |
| `collapsible` | `open`      | `open`     | `defaultOpen`  | `onOpenChange`   | `pointer`, `keyboard`, `select`, `programmatic` |
| `accordion`   | `selection` | `value`    | `defaultValue` | `onValueChange`  | `pointer`, `keyboard`, `select`, `programmatic` |

`pointer` and `keyboard` are told apart the way `tabs` already tells them
apart: a click synthesised by `Enter` or `Space` reports `detail === 0` and a
real one reports the click count, so no key listener exists for toggling and
the platform keeps `Enter` and `Space`.

`select` is the reason a panel closes because another one opened. `programmatic`
is the reason `openAll()`, `closeAll()` and a find-in-page reveal carry.

**Find-in-page has no word in the vocabulary.** `docs/state-and-events.md`
closes the reason list at eleven, and none of them is “the browser found this
text”. `programmatic` is used, because the move is the browser's rather than an
interaction with the family's own control. Adding a twelfth reason is a change
to a contract outside this family, so it is raised at the gate rather than
taken here.

## 4. Axes

| Axis              | Values                                            | Default    | On                       |
| ----------------- | ------------------------------------------------- | ---------- | ------------------------ |
| `size`            | `sm`, `md`, `lg`                                  | `md`       | both                     |
| `variant`         | `plain`, `ruled`, `framed`                        | `plain`    | `collapsible`            |
| `variant`         | `plain`, `ruled`, `framed`, `separated`           | `ruled`    | `accordion`              |
| `indicator`       | `chevron`, `plus-minus`, `none`                   | `chevron`  | both                     |
| `togglePlacement` | `end`, `start`                                    | `end`      | both                     |
| `level`           | `none`, `1`–`6`                                   | `none`     | `collapsible`            |
| `headingLevel`    | `none`, `1`–`6`                                   | `3`        | `accordion`              |
| `mount`           | `active`, `lazy`, `eager`, `until-found`          | `eager`    | both                     |
| `truncate`        | boolean                                           | `false`    | both                     |
| `multiple`        | boolean                                           | `false`    | `accordion`              |
| `requireOpen`     | boolean                                           | `false`    | `accordion`              |
| `loop`            | boolean                                           | `true`     | `accordion`              |
| `disabled`        | boolean                                           | `false`    | both                     |
| `loading`         | boolean                                           | `false`    | `collapsible`            |

The accordion maps its own `variant` onto its items: `plain` → `plain`,
`ruled` → `ruled`, `framed` → `ruled` inside the group's own frame,
`separated` → `framed` with a row gap. The group never selects into the item to
do it; it passes the value through the binding, which is the rule
`checkbox-group` set.

Resolution order for every shared axis is `prop`, then the accordion, then the
defaults provider, then the fallback. A value the consumer states always wins.

## 5. The pattern, item by item

Sources: `w3.org/WAI/ARIA/apg/patterns/disclosure/`,
`w3.org/WAI/ARIA/apg/patterns/accordion/` and
`w3.org/WAI/ARIA/apg/patterns/accordion/examples/accordion/`, all read
2026-09-03.

| Requirement                                                              | Verdict     | Where                                                                       |
| ------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------- |
| The control has role `button`                                            | pass        | the `trigger` part is a `button`; no role is written                        |
| `Enter` toggles                                                          | pass        | the platform's, on a `button`                                               |
| `Space` toggles                                                          | pass        | the platform's, on a `button`                                               |
| `aria-expanded` on the control                                           | pass        | `trigger`, both bindings                                                    |
| `aria-controls` naming the panel                                         | pass        | identifiers generated from the family's base id                             |
| The header button is wrapped in a heading with `aria-level`              | pass        | the `header` part renders `h1`–`h6`; `level="none"` renders a `div`, which is the standalone disclosure and is not the accordion case |
| The button is the only element inside the heading                        | pass        | `actions` is a sibling of `header`                                          |
| `Tab` and `Shift + Tab` reach every focusable element in the accordion   | pass        | no roving tab stop exists; nothing writes `tabindex`                        |
| `aria-disabled="true"` on a header whose panel may not collapse          | pass        | `requireOpen` on the accordion, on the last open item                       |
| The panel optionally has role `region` with `aria-labelledby`            | adapted     | `region="true"` on the item, default `false`. A `region` is a landmark, and the APG example's own note is that an accordion with many panels would fill the landmark list. Off by default, on by a word. |
| Arrow keys                                                              | departure   | not in the pattern since `w3c/aria-practices#3434`; shipped **additively**, never as a roving tab stop, because Radix and Ark both ship them and readers have learned them. Cost: a key that does something the pattern does not name. It moves focus only and changes nothing else. |
| `Home` and `End`                                                        | departure   | the same, under the same cost                                               |

## 6. React

### Idiom

Function components; `useId` for the identifiers; context for the value shared
by the compound family; `render` on every public part; native props, events and
`aria-*` forwarded; `exactOptionalPropertyTypes` respected, so every optional
prop is `T | undefined`; shared axes default to `undefined` so an unset value
defers to the accordion and then to the provider.

### Integration

| Question                                                                                            | Answered by                                                                                                                              |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Does a mutable value ship a controlled and uncontrolled pair, plus the request carrying a reason?   | `open` / `defaultOpen` / `onOpenChange(open, request)` on `Collapsible`; `value` / `defaultValue` / `onValueChange(value, request)` on `Accordion` |
| Can an application set this family's defaults once, rather than per instance?                       | `CollapsibleDefaultsProvider` and `useCollapsibleDefaults`; `AccordionDefaultsProvider` and `useAccordionDefaults`                        |
| Can a consumer substitute the rendered element of each public part?                                 | `render` on `Collapsible`, `CollapsibleHeader`, `CollapsibleTrigger`, `CollapsibleActions`, `CollapsiblePanel` and `Accordion`            |
| Does the consumer's own handler still run when the family handles the same event?                   | `onClick` on the trigger composes: the consumer's runs first, and `preventDefault()` refuses the toggle                                   |
| Can a consumer reach the native element, and the imperative action it cannot express declaratively? | `ref` on every part reaches the element; `useAccordion().openAll()` / `closeAll()` are the two an array cannot express while uncontrolled |
| Does it render on the server without a hydration mismatch?                                          | `useId`; nothing measures, so no layout is read during render                                                                             |
| Does every state a consumer may style appear in the DOM?                                            | `data-open`, `data-disabled`, `data-loading` on the item; `data-disabled` on the group                                                     |
| Is each part's props type the native element's, extended — not a hand-written subset?               | `ComponentPropsWithRef<'div'>` and `ComponentPropsWithRef<'button'>`                                                                       |

## 7. Angular

### Idiom

Standalone directives and components; `input()`, `model()` and `output()`;
`computed` for derived state; `host` metadata rather than `@HostBinding`;
`ViewEncapsulation.None` with the one authored stylesheet; `exportAs` on every
public directive; `inject()` throughout; `@slotted/angular/<name>` for any
cross-family import.

### Integration

| Question                                                                           | Answered by                                                                                                                                   |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Does a two-way value use the signal form the ecosystem expects?                    | `open` is a `model<boolean>()` on `SlCollapsible`; `value` is a `model<string[]>()` on `SlAccordion`; `openChange` and `valueChange` are `output()`s carrying the request |
| Does a control that belongs in a form work with Reactive Forms and template forms? | no — a disclosure submits nothing and holds no value a form collects. `ControlValueAccessor` on it would put a view preference in a form's value |
| Can an application set this family's defaults once, rather than per instance?      | `COLLAPSIBLE_DEFAULTS` / `provideCollapsibleDefaults()`, `ACCORDION_DEFAULTS` / `provideAccordionDefaults()`                                    |
| Can a template reach the instance?                                                 | `exportAs: 'slCollapsible'`, `'slAccordion'`, `'slCollapsibleTrigger'`, `'slCollapsiblePanel'`                                                 |
| Can a consumer substitute projected content, and keep it lazy?                     | `ng-content` in the trigger and the panel; `mount="lazy"` wraps the panel body in `@if`, so a `ng-template` inside it is instantiated on the first open |
| Is it correct with zoneless change detection and `OnPush`?                         | signals throughout; no `markForCheck`                                                                                                          |
| Is every subscription and listener torn down?                                      | `DestroyRef.onDestroy` returns the arrow-navigation handle and the `beforematch` listener                                                       |
| Does a static attribute the consumer wrote survive the host bindings?               | `HostAttributeToken` reads a consumer's `id` on the panel and its `aria-label` on the group before either is written                            |
| Does an entry point that others depend on stay a single class?                      | `@slotted/angular/collapsible` and `@slotted/angular/accordion`; the group imports the item's token through the entry point, never its source   |

### The asymmetry, recorded

Angular's `model()` writes a change back, so a controlled `SlCollapsible` needs
no reassignment; React's controlled family waits for the consumer's next value,
which is what `docs/state-and-events.md` requires of it. Angular additionally
gets `exportAs`, which React answers with a ref and a context hook. Neither is
levelled down to the other.

## 8. Shared behaviour

Two modules in `@slotted/core`, so the two bindings cannot disagree.

**`@slotted/core/disclosure`** — `nextOpenValues(current, value, options)`
resolves a toggle against `multiple` and `requireOpen`, and `isHeldOpen`
answers whether a value is the last open one and therefore refuses to close.
Nothing in it touches the DOM.

**`@slotted/core/focus`** — the arrow movement `roving-tabindex.ts` already
implements is extracted into `arrow-navigation.ts`, which moves focus and
writes no `tabindex`. `createRovingTabindex` is then that engine plus the tab
stop, so one keyboard model exists rather than two copies. The accordion uses
the engine alone, which is exactly the difference the APG's update made.

## 9. Motion

The panel transitions `grid-template-rows` between `0fr` and `1fr`, and its
content transitions `opacity` and `content-visibility` with `allow-discrete`.
Both durations come from the motion scale, which the theme collapses under
`prefers-reduced-motion`, so a reader who asked for stillness gets the panel
appearing rather than sliding. The indicator turns with the same duration.

Nothing is measured. Every surveyed React implementation reads the panel's
height and writes a custom property, which is wrong for one frame on the server
and stale until a resize observer fires; the `1fr` track is the content's own
height at every frame.

## 10. Contract break

Neither family exists in the tree, so nothing breaks. The `collapsible` a
consumer used before 2026-09-02 was `details`-based; the migration is written
on the reference page and in `docs/BUILD-LOG.md`: `<Collapsible>` no longer
renders `details`, `open` is now a controlled prop rather than the platform's
attribute, the trigger is `CollapsibleTrigger` inside `CollapsibleHeader`
rather than a `summary`, and a page with JavaScript disabled can no longer open
a panel.
