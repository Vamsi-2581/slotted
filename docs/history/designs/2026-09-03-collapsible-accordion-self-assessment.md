# Collapsible and Accordion — self-assessment

Every dimension in `.claude/skills/component/references/rubric.md`, with the one
change that would most improve it and whether it was made.

Captures live in
`/tmp/claude-1000/-home-dreco-dev-slotted/fdc2c7e4-7511-4bb1-8128-3631d9328b2a/scratchpad/shots/`.
Harness pages: `tools/harness/out/collapsible.html`, `tools/harness/out/accordion.html`.

## 1. Icons

The mark is a mask from `--slotted-icon-chevron-down`, or from
`--slotted-icon-plus` and `--slotted-icon-minus` under `indicator="plus-minus"`.
No `content` draws a character; `collapsible.styles.test.mjs` refuses one.
`indicator="none"` draws nothing at all, which is Angular Material's `hideToggle`.

The chevron **turns** between down and up rather than pointing along the inline
axis, so a right-to-left document needs no mirrored artwork and none is written.
Read in `collapsible-indicator-light-comfortable-rtl-420.png`: the mark sits at
the inline end on the left, the title starts at the right, and
`togglePlacement="start"` puts the mark beside the title on the right.

`plus-minus` does not rotate — a plus turning into a minus by rotation is a plus
with a stroke that vanished — and the two glyphs are the one pair the foundation
draws on one grid.

Under forced colours the mask takes `currentColor`, so it survives; the
`high-contrast` scheme is photographed in
`collapsible-variant-high-contrast-comfortable-ltr-420.png`.

**The one change that would most improve it:** an indicator whose two states are
one artwork rather than two masks, so `plus-minus` could animate the way the
chevron does. **Not made** — the glyph scale draws `plus` and `minus` as one
pair on one grid precisely so a family does not composite them, and animating
between two mask images is not something CSS can interpolate.

## 2. Motion

Every state pair the family can move between, and what it does:

| Pair                    | Transitions | Why                                                                                                       |
| ----------------------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| closed → open           | yes         | the panel's grid track between `0fr` and `1fr`, `--slotted-duration-medium`; the eye has to follow the box growing |
| the content's presence  | yes         | `opacity` and `content-visibility` with `allow-discrete`, so it stays visible for the length of the close   |
| chevron down → up       | yes         | `rotate`, `--slotted-duration-medium`, so the mark and the panel move together                             |
| plus ↔ minus            | no          | two mask images; CSS interpolates neither, and a fade between them reads as a flicker                       |
| rest → hover → active   | yes         | `background-color` and `color`, `--slotted-control-transition-duration`                                     |
| rest → focus-visible    | no          | a focus ring that fades in arrives after the reader has already moved                                       |
| variant, size, density  | no          | none of the three is a state a reader watches change                                                        |

No literal duration; `packages/styles/src/motion.test.mjs` passes. Nothing loops,
so there is no infinite animation to stop. Reduced motion is inherited: the four
motion-scale durations collapse to `1ms` in the theme, so a reader who asked for
stillness gets the panel appearing rather than sliding.

**The one change that would most improve it:** the panel does not animate under
`mount="active"`, because its content is removed the moment it closes. **Not
made** — keeping the content for the length of the close would make `active`
mean `eager` for one transition's worth of time, which is the opposite of what a
consumer chose it for. The cost is written in the contract's `mount.reason`.

## 3. Responsiveness

`collapsible` declares `container-type: inline-size` and
`container-name: slotted-collapsible`, and reflows at a literal `22rem` — the
foundation forbids a token in a container condition. Below it the actions leave
the header's row and take one of their own, and the panel moves down with them:
read in `collapsible-actions-light-comfortable-ltr-240.png`.

`accordion` declares no container: it is a single column, and every reflow inside
it belongs to the item.

Read at 240, 420 and, through the reference pages, at 720 and 1280. Long titles,
an unbroken forty-character digest and a right-to-left title all hold at 240:
`collapsible-content-light-comfortable-ltr-420.png`.

**The one change that would most improve it:** the 22rem breakpoint is one
number for three sizes, so a `lg` disclosure reflows slightly later than it
needs to. **Not made** — a breakpoint per size is three literals a theme cannot
retune, and the actions row is the only thing that moves.

## 4. Refinement

Read at full size in light, dark and `high-contrast`, at 420, 240 and dense, in
both directions, and with `--focus`, `--hover` and `--active` on the trigger.

- The focus ring is inset by `--slotted-focus-ring-offset`, so it never escapes
  a framed box or a set's own frame:
  `collapsible-variant-focus-data-part-trigger-light-comfortable-ltr-420.png`.
- Hover is a wash under the whole row rather than a colour on the words, so the
  target reads as the row it is:
  `collapsible-variant-hover-data-part-trigger-light-comfortable-ltr-420.png`.
  Press goes one step further; both hold themselves back for `:disabled`.
- Disabled stays legible — `--slotted-disabled-foreground`, not an opacity — and
  answers neither hover nor press.
- The mark is centred on the title and its second line together, not on the
  title alone, so a two-line header reads as one block.
- Nothing shifts by a pixel between states: the ring is an outline, the wash a
  background.

Five defects were found by looking and corrected: a header set smaller than the
paragraph it revealed; a panel indented to the box rather than to the title
under `togglePlacement="start"`; a Latin title stranded at the far edge of a
right-to-left page; two hairlines a pixel apart at the top of a framed set; and
eight pixels of dead space under every closed panel.

**The one detail I would change with another hour:** at `md` the title and the
panel's own prose are both `--slotted-font-size-md`, separated only by weight —
the header carries its rank by 500 rather than by size. **Made:** `sm` and `lg`
now step the panel's own text with the title, so the pair keeps its relationship
at both ends of the scale; `md` is left as the one step where a heading and its
body share a size, because the next step up would make a section header inside a
dense form larger than the page's own prose.

## 5. Tokens

`collapsible` reads fifty-six custom properties and `accordion` twelve;
`packages/styles/src/tokens.test.mjs` holds both lists exact. Every family token
falls back to a foundation token or to a `--_` local, never to a literal outside
the documented exemptions and never to a system colour —
`packages/styles/src/fallbacks.test.mjs` passes.

The type comes from the type scale and the geometry from the control scales, and
the split is written where a later reader will meet it, in the root's own
comment. Nothing was added to the component layer: the family needed no size a
semantic token cannot be retuned to give.

**The one change that would most improve it:** `--slotted-collapsible-padding-inline`
is one token for a row that has two insets — the header's and the panel's — so a
theme cannot indent the panel without indenting the header. **Not made** — the
two being the same is what makes the panel's text line up under the title, and a
theme that wants them apart is asking for a different component.

## 6. Patterns

Sources read 2026-09-03: `w3.org/WAI/ARIA/apg/patterns/disclosure/`,
`w3.org/WAI/ARIA/apg/patterns/accordion/`, and
`w3.org/WAI/ARIA/apg/patterns/accordion/examples/accordion/`. The keyboard
tables, the roles, the states and the properties are transcribed in
`2026-09-03-collapsible-accordion-capability-inventory.md` and checked item by
item in `2026-09-03-collapsible-accordion-design.md` §5.

Every item passes except two, and both are written as departures with their
costs: the arrow keys and `Home`/`End`, which the pattern no longer names, and
the `region` role, which is off by default because a landmark per panel fills
the landmark list.

The platform is preferred where it can be: `Enter`, `Space`, `Tab` and
`Shift + Tab` are all the `button`'s own, and no key listener exists for the
toggle. The one place the platform is refused — `details` and `summary` — carries
four reasons and one written cost.

**The one change that would most improve it:** `Shift + F10` is not bound. **Not
made** — the pattern does not name it for an accordion, and no menu family
exists until wave 5. It is named in the follow-on list rather than bound to
nothing.

## 7. Accessibility

Name, role, state and keyboard are all the platform's or the pattern's. The
trigger carries `aria-expanded` and `aria-controls`; the panel carries
`aria-labelledby`; the heading is real; `aria-disabled` appears only on a header
a set refuses to let close.

A closed panel is out of the tab sequence and out of the accessibility tree
twice over — `content-visibility` in the stylesheet and `inert` from both
bindings — so a browser without the property still cannot put focus inside it.
Under `mount="until-found"` neither applies, because `hidden="until-found"` is
what lets a page search reach the text.

Forced colours: the family writes no `forced-colors` rule of its own, which is
the decision the briefing already took; the mask takes `currentColor` and every
colour is a theme token the theme remaps.

Verified in the browser: focus, hover and press are photographed rather than
described; the keyboard is exercised by seventy-seven behavioural tests across the two
bindings — forty-one in React and thirty-six in Angular — including the arrow
ring, the tab sequence and the nested-set case.

**What could not be verified on this machine:** a screen reader. Nothing here was
heard. What was verified in its place is the accessibility tree the DOM produces
— roles, names, states and the heading level — asserted in both bindings’ specs.

**The one change that would most improve it:** the `beforematch` reveal is not
announced, so a reader whose page search opened a panel is not told the panel
opened. **Not made** — a live region for it would announce on every match in
every disclosure on the page, and the browser already moves focus to the found
text.

## 8. Native API

React: function components, `useId`, context for the compound family, `render` on
every public part, `ref` reaching the element, native props and events forwarded,
`exactOptionalPropertyTypes` respected. The consumer's `onClick` runs first and
`preventDefault()` refuses the toggle.

Angular: standalone directives and components, `input()`, `model()` and
`output()`, `computed` throughout, host metadata rather than `@HostBinding`,
`ViewEncapsulation.None`, `exportAs` on every public directive, `inject()`, and
`@slotted/angular/<name>` for the one cross-entry-point import.

**The asymmetry, recorded rather than levelled away.** Angular's `model()` writes
the change back, so a bound signal is both the controlled and the uncontrolled
half and there is no `defaultOpen`; React's controlled family waits for the
consumer's next value, which is what `docs/state-and-events.md` requires of it.
Angular gets `exportAs` and `ng-template[slCollapsibleContent]`; React gets
`render` and a `handle` for `openAll`/`closeAll`. Angular takes the heading
element the consumer wrote; React renders it from `level`.

**The one change that would most improve it:** React's `CollapsibleTrigger` is
the one part with no `render` escape to another element. **Not made** — the
control holds the role, the identifiers and the whole keyboard, and substituting
it would leave the family with nothing to be. It is the same decision `tabs`
took for its own tab.

## 9. Capability

Measured against the inventory, not the scope paragraph.

Every table-stakes row is `adopt`, `adapt`, `decline` naming the family that owns
it instead, or `defer` naming a family and a wave: horizontal collapse defers to
`sidebar`, a horizontal accordion to `tabs`, `onFocusChange` is declined with the
two lines of consumer code that replace it, and `details` is declined with four
reasons and a written cost.

Every mutable value has a controlled and uncontrolled pair, a request carrying a
reason, and a row in the state matrix: `open` on the item, `selection` on the
set. The reason vocabulary is the closed one, and `select` is what a panel hears
when a sibling opened.

Shipped beyond what any surveyed implementation offers: a panel that opens
without a measurement; the pattern's `aria-disabled` on a header that may not
close; a page search that opens the panel it found; a loading state; three
colour schemes, three densities and a logical layout; and two first-class
bindings.

**The one change that would most improve it:** an axis for a set whose items are
laid out in two columns — a settings page of eight short sections wastes half its
width. **Not made** — a two-column set is `grid` around an accordion's items, and
two families laying out one row would be two answers to one question. It is the
same decline `checkbox-group` made for `columns`.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in
`2026-09-03-collapsible-accordion-design.md` §6 and §7. The one `no` is Angular's
`ControlValueAccessor`: a disclosure submits nothing and holds no value a form
collects, and putting a view preference into a form's value would be a lie about
what the control is.

An application sets the defaults once in both bindings —
`CollapsibleDefaultsProvider` and `AccordionDefaultsProvider`,
`provideCollapsibleDefaults()` and `provideAccordionDefaults()` — and the
resolution order is `prop`, then the accordion, then the provider, then the
fallback, which both bindings' tests assert.

Angular is zoneless-correct: signals throughout, no `markForCheck`. Every
listener is torn down through `DestroyRef`. `ng-content` is instantiated whether
or not it is inserted, so `mount="lazy"` reaches for `NgTemplateOutlet` — the
integration point Angular Material already established.

**The one change that would most improve it:** Angular's set cannot be reached
from a parent component class without a `viewChild`, where React hands a `handle`
down as a prop. **Not made** — `viewChild.required<SlAccordion>('set')` is the
idiom this ecosystem already uses, and a second way in would be two answers.

## 11. Documentation

Four reference pages: the import, the anatomy row per declared part, one
demonstration per declared scenario with the code that produced it, every input
and every declared default, the outputs, the composition surface, the
accessibility decisions, the public tokens and the anatomy as it reaches the DOM.
`specs/reference-pages.test.mjs` and `referencePageErrors` pass for all four.

**Read rendered, not as source.** The React pages were read at 1280 and 720
pixels, in light and dark, on the running server at `localhost:6006`. Two defects
came out of that reading and out of nothing else: every disclosure collapsing to
one character wide on a stage that shrink-wraps its children, and a caption
promising a toolbar on the header's row beside a demonstration narrow enough that
the row had already reflowed.

**The two Angular pages could not be read.** `localhost:6007` answers, and both
families are indexed there, but its Vite server resolves `@slotted/angular/*`
through aliases that `apps/storybook-angular/.storybook/main.ts` computes once at
startup — so the two entry points that landed in this session have none, and both
story modules answer 404. The briefing names this case and says to report it
rather than restart the reviewer's server. Raised at the gate.

**The one change that would most improve it:** the `until-found` demonstration
asks the reader to search the page for a word, which is the one thing a
screenshot cannot show. **Not made** — a page search is the capability, and a
demonstration that faked it would document something else.

## Section 18 of `docs/component-features.md`

**Purpose and anti-use.** `collapsible` hides one section behind a header the
reader operates; `accordion` is a set of them sharing a value. Neither is a way
to hide a form's required fields, and neither is a tab list: a horizontally
stacked set of sections of which one is open is `tabs`.

**Anatomy.** `collapsible`: `root`, `header`, `trigger`, `indicator`, `label`,
`description`, `actions`, `panel`, `content`. `accordion`: `root`. The item is a
family beside the set, never a part of it.

**Controlled and uncontrolled, with reasons.** `open` / `defaultOpen` /
`onOpenChange` on the item and `value` / `defaultValue` / `onValueChange` on the
set in React; a `model()` in Angular, where one signal is both halves, with
`openChangeRequest` and `valueChangeRequest` carrying the reason. Reasons:
`pointer`, `keyboard`, `select`, `programmatic`.

**State matrix.** `default`, `hover`, `active`, `focus-visible`, `open`,
`disabled`, `loading` on the item; `default` and `disabled` on the set.
Precedence is `STATE_PRECEDENCE`'s: `disabled` wins over `loading`, both over
`active` and `hover`, and `packages/styles/src/states.test.mjs` holds it.

**Density and direction.** All three densities move the row's height, padding,
gap and mark; the title keeps its reading size, which is stated in the
stylesheet. `dir="rtl"` needs no second rule: the layout is logical and the mark
turns rather than pointing.

**Loading, empty, error and extreme content.** `loading` holds the panel open at
a line's height and says `aria-busy`; `Skeleton` is what stands in for the
content. An empty set renders its box and nothing else, and the message is
`result-state`'s. There is no error state: a disclosure has no value to be wrong
about. Extreme content — a title longer than its row, a forty-character digest, a
right-to-left title, a nested set — is demonstrated and photographed.

**SSR and performance.** Nothing measures and nothing reads the layout, so a
server response and the first client paint agree; identifiers come from `useId`
and from an application-scoped factory. `mount="active"` keeps one panel's
content in the DOM; virtualising a hundred headers is `list`'s.

**Migration.** The `collapsible` a consumer used before 2026-09-02 rendered
`details`. `<Collapsible>` no longer does: `open` is a prop rather than the
platform's attribute, the trigger is `CollapsibleTrigger` inside
`CollapsibleHeader` rather than a `summary`, and a page with JavaScript disabled
can no longer open a panel.
