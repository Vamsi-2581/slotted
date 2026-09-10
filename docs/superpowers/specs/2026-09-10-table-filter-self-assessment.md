# Table filter self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and against §18 of `docs/component-features.md`. The subject is the filter: the
rest of the family was assessed in
`docs/superpowers/specs/2026-09-09-table-self-assessment.md` and is unchanged
except where named below.

---

## The eleven dimensions

### 1. Icons

The trigger's funnel is the family's own geometry — an SVG path, drawn by the
family because it is part of a control the family draws, which is the rule the
expander's chevron already follows. The operator chooser's chevron and the
number field's steppers are their own families'. Nothing draws a character.
`forced-colors` needs no rule of its own: the funnel is `currentColor` on a
button, so it takes `ButtonText`, and the `high-contrast` capture shows it
against the panel's own border. The funnel is not directional and is not
mirrored; the RTL capture shows the same glyph.

**The one change:** the filtered funnel says "filtered" only in colour —
`--slotted-tone-accent-text`. Under forced colours that resolves to `LinkText`,
which is a different hue from `ButtonText` and therefore holds, but a reader who
cannot see hue has the trigger's accessible name and nothing on the glyph.
**Not made:** a second mark on the glyph — a dot, a fill — is a change to the
shipped trigger's geometry and belongs beside the same decision in
`column-manager`, which will mark hidden columns the same way. Recorded here
rather than made blind.

### 2. Motion

The panel's open and close are `popover`'s own transition, from the motion
scale, and this family adds none. The one state change the family owns that the
eye must follow is the second condition appearing — and it does not animate: the
row is inserted, not revealed. A height transition on an element whose height is
unknown needs a measured value, and the briefing's rule is that a value only
script can measure becomes a named custom property; the announcement carries the
change to a reader who cannot see it, and to one who can, the panel is 300 ms of
popover animation away from having been absent entirely.

**The one change:** cross-fade the operand area when the operator changes its
count, so `between` growing a second field reads as one control becoming two.
**Not made:** it is 120 ms of decoration over a change that is already announced,
and `docs/component-features.md` §2.6 refuses motion that carries no information.

### 3. Responsiveness

The panel answers its own room rather than the viewport:
`min(17rem, var(--slotted-positioner-available-width, 100%))` is the floor and
the room together, over `box-sizing: border-box`. The operand grid is
`repeat(auto-fit, minmax(7rem, 1fr))`, which answers the three shapes an operator
makes without a container query, a container name or the second element a query
container needs — a range sits on one row at the floor and stacks at 240.

**The one change:** the floor was not holding. Three readings were needed, and
the last one was the only one measured: a bare `15rem` beat
`max-inline-size: 100%` — a minimum always does — and put 229 pixels inside a
205-pixel surface under `content-box`; `box-sizing: border-box` fixed the
overflow and `min(15rem, 100%)` then resolved its percentage against a
containing block that is itself shrink-to-fit, so the panel came out at **217
pixels**, twenty-three under the floor it was meant to hold and visibly narrow.
**Made**: the room is now the engine's own
`--slotted-positioner-available-width`, and the floor is seventeen rem rather
than fifteen because the widest operator name is 146 pixels of text and a range
wants two seven-rem fields. Measured again in the browser: 272 pixels, two
operands of 122. The lesson is the one this dimension exists for — a width that
looks plausible in the rule is not a width until something measures it.

### 4. Refinement

Read in light, dark and `high-contrast` at 420, at 240, at `dense` and in RTL,
and then in both frameworks' reference pages at 1280 in light and dark. Inside a
condition the gap is half the panel's; between conditions it is the panel's own,
with a rule above the join. The actions keep the shipped inset and the shipped
rule. RTL is the same component mirrored, not a rearranged one.

**The one change:** the reserved room for a column's controls said
`target-min + gap` while the trigger stands `--_pad-inline` further in, so on a
column whose name nearly fills its width the funnel sat three pixels from the
last letter and the focus ring touched it. **Made** —
`calc(var(--_pad-inline) + var(--slotted-target-min) + var(--_gap))`, read again
on the listing capture at 720 with and without focus.

### 5. Tokens

The panel consumes and does not restate: `--slotted-table-gap`,
`--slotted-table-font-size`, `--slotted-table-color`,
`--slotted-table-color-muted`, `--slotted-table-border-color`,
`--slotted-table-border-width`, `--slotted-table-row-surface-hover`, each over
its own foundation fallback. No new family token, and no new step in any scale.

**The one change:** the panel now declares those eight itself rather than reading
them from `[data-part='root']`. **Made**, and it is a defect the shipped panel
had: portalled — which is what `popover` does by default — the panel was not
inside the root, every `var(--_…)` resolved to nothing, and `gap: var(--_gap)`
became no gap at all. Found by reading the rule, not by a test.

`--slotted-positioner-available-width` is read as a value rather than declared,
which is the briefing's own rule: it is a runtime measurement under the name that
says so, not a design token, and it is not in
`packages/tokens/src/contract.json`.

### 6. Patterns

The APG has no filter pattern, and that is the finding rather than an omission.
What the panel is made of is patterns the library already sources: the trigger is
the Disclosure button `popover` writes, with `aria-expanded`; the panel is
`role="dialog"`, named by the trigger's own name; the chooser is `select`'s
combobox; the join is `radio-group`'s radiogroup; the set list is `checkbox`'s
own squares. `docs/superpowers/specs/2026-09-09-table-design.md` §2 holds the
table pattern's own citation, unchanged.

The family's one new key is `Enter` in an operand, and it is recorded as a
departure with its cost in `specs/components/table/contract.json`.

**The one change:** the operator chooser is a nested layer inside the panel's
layer, and `Escape` there must close the chooser and leave the panel open.
**Made** by composition rather than by code: `dismissable-layer` records the
layer that was topmost when a layer opened as its parent, and `owns` treats a
descendant layer's content as inside — so the panel neither closes on a press
inside the chooser nor takes the chooser's `Escape`. Exercised in the browser,
on both reference pages.

### 7. Accessibility

Every control in the panel is named: the trigger by `${filter} ${column}` and,
when filtered, by what is applied — "Filter Status: Is any of Paid" — which is
the form Excel's own tooltip takes. The chooser is named `Condition`, the
operands `Value` or `From` and `To`, the join `Match`. Five announcements go
through `@slotted/core/live-announcer`, and each exists because something the
panel does is otherwise silent: the search's remaining count, the operand count
when the operator changes it, the second condition appearing, the summary on
Apply, and the removal on Clear.

The panel is a dialog: focus moves into it and returns to the trigger, which is
`popover`'s own behaviour rather than this family's. Colour is never the only
carrier — `data-filtered` is a colour on the glyph *and* a sentence in the name.

**The one change:** an operator that takes no operand leaves the panel with a
chooser and nothing else, and a reader arriving by keyboard has no statement of
what will be applied. **Not made:** the summary is announced on Apply and is in
the trigger's name afterwards; a live description inside the panel would be a
sixth announcement over a form of at most five controls. Named here because it is
the change most likely to be right next time.

### 8. Native API

React is React: five function components over one generic shell, `useId` for the
list's identifier, `render` on the trigger through `PopoverTrigger`, every part's
props the native element's. Angular is Angular: an `@Directive()` base holding
the shared signals, five standalone components each with its own `model()`,
`exportAs`, `input()` and `output()` throughout, `computed` for every derived
value, no `markForCheck` anywhere, and the operand projected as an `ng-template`
rendered through `NgTemplateOutlet` once per condition.

The asymmetry is recorded rather than levelled: Angular's operand template
re-renders per condition and React's `renderOperand` is called per operand slot,
because that is what each framework's composition primitive is.

**The one change:** the Angular binding drew its panel unportalled by default and
a framed table clips its own overflow, so the join and both actions were simply
not on screen. **Made** — `portal` defaults to `true`, matching what `popover`
gives React. Found on the rendered reference page, not by a test.

### 9. Capability

Measured against
`docs/superpowers/specs/2026-09-10-table-filter-capability-inventory.md`: 22
table-stakes rows, of which 16 are `adopt` or `adapt`, 3 `defer to filter-bar`
with the wave named, and 3 `decline` with the composition or the reason written.
Five kinds, 19 operators, two conditions and a join. The one mutable value has a
controlled and uncontrolled pair, a request carrying one of four reasons, and a
row in the contract's state model. Three differentiators no surveyed
implementation ships — the engine as a package, the query-string codec, the
stated empty-condition rule — and eight gaps, each with what the family does.

**The one change:** `describeFilter` composes a sentence from operator names and
raw operands, so a date reads "is 2026-09-10" rather than "is 10 September 2026".
**Not made:** the formatter belongs to the consumer's locale, and the hook exists
— `format.value` — but wiring `date-picker`'s own formatter into the family's
announcement would make the family own a date format it does not otherwise hold.
`filter-bar` will need it for its chips and is the right place to decide it.

### 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in
`docs/superpowers/specs/2026-09-10-table-filter-design.md` §11 and §12. The
answers that are not "yes": a column filter is not a form control, so there is no
`ControlValueAccessor` — it is a query the reader composes, and the two operand
controls it draws are `text-field`, `number-field` and `date-picker`, each already a
value accessor where a consumer wants one. Defaults are set once in both
bindings, through `TableDefaultsProvider` and `provideTableDefaults`, and the
operator names travel with them.

**The one change:** the operator names are a map inside `labels`, and a shallow
merge would have given an application that renamed one operator a panel with one
translated word and eighteen raw keys. **Made** in both bindings —
`resolveLabels` merges the two maps, and `resolvedLabels` in Angular does the
same with `Object.assign` over the three sources.

### 11. Documentation

Both reference pages were read rendered rather than in source, at 1280 in light
and in dark, and `tools/harness/audit.mjs` is clean on both at 1280 and at 620.
Three scenarios cover the filter — `filter`, `filter-types`, `filter-conditions`
— each with a captioned demonstration and the code that produced it; the anatomy
table names all four new parts; the API table carries `value`, `operators`,
`conditions`, `renderOperand` and `searchThreshold`.

**The one change:** the pages showed three defects that no test saw, and all
three are **made**: a scene bound to no story, which rendered the whole React
page as a Storybook error; the operator chooser showing the engine's raw
`between` and `empty` because a closed `select` names its value only from `items`;
and a demonstration whose filter stood in a column it did not filter — a panel
over twelve client names above a Status column.

---

## Against §18 of `docs/component-features.md`

**1. Purpose, use and anti-use.** A column's condition, edited in that column's
header. Not a rule set across columns, not a bar above the table, not a search
over every column: those are `filter-bar`, and the boundary is
`docs/superpowers/specs/2026-09-10-table-filter-design.md` §10.

**2. Anatomy.** Eleven parts, four of them new: `filter-condition`,
`filter-operator`, `filter-operand`, `filter-join`, beside the shipped `filter`,
`filter-panel`, `filter-search`, `filter-list`, `filter-option`, `filter-empty`
and `filter-actions`.

**3. Controlled and uncontrolled.** `value` / `defaultValue` / `onValueChange` in
React; `[(value)]` and `valueChangeRequest` in Angular. Reasons: `pointer`,
`keyboard`, `clear`, `programmatic`. The request fires once, on Apply or Clear,
and never on a draft.

**4. State matrix.** The panel is open or closed; a condition is active or
inactive; a filter is applied or not. The three compose: a closed panel over an
applied filter marks the trigger; an open panel edits a draft that the applied
filter seeds; an inactive condition is dropped before the join, so a filter with
two conditions and one operand behaves as a filter with one.

**5. Keyboard, focus, ARIA, touch, screen reader.** Every control inside the
panel is its own tab stop, which is what the table role requires of the family
around it. `Enter` in an operand applies — the one departure, with its cost
written. `Escape` closes the topmost layer, which is the chooser when it is open
and the panel when it is not. Focus returns to the trigger. Five announcements,
listed in §7 above. Touch targets are the composed families' own, each at or over
`--slotted-target-min`. A screen reader and a touch device are the two things
this machine cannot verify; what was checked in their place is the accessibility
name of every control and the live-region announcements, in both bindings' tests.

**6. Size, density, variant, tone.** No axis of its own: the panel takes the
table's density and the theme's scheme, and its controls are `sm` because a panel
is a dense surface. Read at all three densities in the harness.

**7. Responsive, RTL, locale, reduced motion.** §3 above for the first;
RTL is a mirror read at 420; locale decides the collator the set search compares
with and the parsing of a number operand; reduced motion is the theme's, and the
family animates nothing.

**8. Loading, empty, error, disabled, extreme content.** The set list says so
when a search matches nothing. Clear is disabled while the draft holds nothing. A
long translated operator name truncates inside the chooser's own button rather
than widening the panel. An unreadable operand — `'ten'` in a number column,
`'not a date'` in a date column — is read as blank rather than throwing, and the
engine's tests hold both.

**9. SSR, performance, virtualisation.** `useId` for identifiers and no layout
read during render, so the React binding hydrates. The predicate builds its
collator and its date formatter once per filter rather than once per comparison,
which is what `createFilterPredicate` exists for beside `matchesFilter`.
Virtualisation is `data-grid`'s, unchanged.

**10. Examples.** Three scenarios, six demonstrations across the two pages, and
the acceptance case — four columns of four kinds filtered by one predicate — is
one of them.

**11. Behavioural tests shared between bindings.** Eleven behaviours in React
(`packages/react/src/table/table.test.tsx`) and six in Angular
(`packages/angular/table/src/table.spec.ts`), over the same claims: the draft, the
cancel, the covering checkbox, the collator, the operator vocabulary, the operand
count, the reveal and the join, `Enter`, Clear, and `false` as an answer. The
engine's own 76 tests sit under both.

**12. Changelog, stability, migration.** The break is recorded in
`specs/components/table/contract.json` under `filter.break`, with the shape it
had, the shape it has, and `setFilter(values)` as the one call that converts a
saved view. The design document §9 writes the two lines a consumer changes.
