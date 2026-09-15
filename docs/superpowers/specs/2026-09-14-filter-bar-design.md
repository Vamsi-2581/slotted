# `filter-bar` — design

Decisions taken from
`docs/superpowers/specs/2026-09-14-filter-bar-capability-inventory.md`, before
the contract, the stylesheet and the two bindings were written. Round 11 of
`docs/build-schedule.md`, in one session with `code-block`; the two share no
decision and are recorded apart.

---

## 1. What the value is

A tree, whose leaves are the descriptors `table` already writes.

```ts
interface FilterRule {
  readonly field: string;
  readonly filter: FilterDescriptor; // @slotted/core/filter, unchanged
}
interface FilterGroup {
  readonly join: FilterJoin; // 'and' | 'or'
  readonly rules: readonly (FilterRule | FilterGroup)[];
}
```

Every surveyed bar that holds a map of fields is the tree's first level with
`join: 'and'`, and `createRowPredicate` in the engine already evaluates that
shape. What the tree adds is `or` at the top and a group inside a group, which
`docs/build-order.md` assigns here by name and AG Grid's Advanced Filter and
react-querybuilder both ship. The leaf is not a flat `{ field, operator,
value }` — MUI's and react-querybuilder's shape — because the leaf `table`
edits in a column header is a descriptor with its own two conditions and join,
and a screen that offers both the header and the bar has to hold one object:
`rules.find((rule) => rule.field === column)?.filter` is what the header
reads, and what it writes.

The engine grows a module, `packages/core/src/filter/group.ts`, exported from
the same `@slotted/core/filter` entry, so nothing in `packages/core/package.json`
or `vite.config.ts` changes:

| Export                                              | What it is                                                                                                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isFilterRule`, `isFilterGroup`                     | The two narrowings.                                                                                                                                                                   |
| `emptyFilterGroup(join = 'and')`                    | A group with no rules.                                                                                                                                                                |
| `normalizeFilterGroup(group)`                       | Every inactive leaf dropped through `normalizeFilter`, every group left empty dropped, `null` when nothing is left. The same rule as `normalizeFilter`, one level up.                  |
| `isFilterGroupActive(group)`                        | Whether anything survives normalisation.                                                                                                                                              |
| `ruleFor(group, field)`, `withRuleFor(group, field, filter)`, `withoutRuleFor(group, field)` | The first-level map read and written by field, which is what a chip, a pinned pill and a column header need. `withRuleFor` with `null` removes.                                                     |
| `updateNodeAt(group, path, node)`, `removeNodeAt(group, path)`, `insertNodeAt(group, path, node)` | The builder's three edits, addressed by a path of indices.                                                                                                                             |
| `createFilterGroupPredicate(group, read, options)`  | `(row) => boolean`, one `createFilterPredicate` per leaf built once, `and` and `or` composed over them.                                                                                |
| `createSearchPredicate(query, read, fields, options)` | The global query: a `contains` text condition against each named field, `or`-joined, through the same collator. Empty query matches everything.                                       |
| `describeFilterGroup(group, format)`                | The sentence. `format` is `FilterDescriptionFormat` plus `field(key)` for the field's name and `group(open, close)` for the brackets — "Status any of paid, refunded and (Amount greater than 100 or Customer contains ana)". |
| `serializeFilterGroup`, `parseFilterGroup`          | §2.                                                                                                                                                                                   |
| `toFilterBarParams`, `fromFilterBarParams`          | §2.                                                                                                                                                                                   |

## 2. The URL form

```
f=and(status~set~and~anyOf:paid,refunded|or(amount~number~and~greaterThan:100|customer~text~and~contains:ana))
q=ana
```

A rule is the field's key, `~`, and `serializeFilter` of its descriptor
unchanged. A group is its join, `(`, its members separated by `|`, `)`. Three
characters are structural — `(`, `)` and `|` — and `encodeURIComponent` leaves
the first two alone, so the codec percent-encodes them a second time inside a
serialised rule, where they can only be operand text; `parseFilter` decodes
them back. The field key is encoded the same way.

`parseFilterGroup` is total, as `parseFilter` is: an unbalanced bracket, an
unknown join, a rule `parseFilter` refuses, all give `null`.

`fromFilterBarParams` reads `f` and `q`, and when `f` is absent it reads the
`f.<column>` parameters `toFilterParams` writes and builds a first-level `and`
group from them — so a bookmark written by a screen that only had column
filters opens in a screen that has the bar.

## 3. Anatomy

```
root                       div[data-ui=filter-bar]  role=search, aria-label
├─ search                  text-field, type=search  the global query
├─ bar                     div  role=toolbar, roving focus
│  ├─ pill*                button  one per pinned field; opens its popover
│  ├─ add                  button  menu trigger listing the unfiltered fields
│  ├─ clear                button  drawn while something is applied
│  ├─ preset               select  drawn while presets exist
│  ├─ actions              div  drawn under apply=manual
│  │  └─ apply, reset      button
│  ├─ summary              button  narrow only: "Filters (3)", opens the builder
│  └─ end                  div  the consumer's own controls
├─ chips                   div  role=grid, one row, roving focus
│  ├─ chip*                tag  one per first-level rule; opens its editor
│  └─ more                 button  "+n", reveals the folded chips
├─ count                   p  aria-live=polite
└─ builder                 drawer  the tree editor
   └─ group*               fieldset  a box on the sunken surface from depth 1
      ├─ join              div  "Match [All | Any] of the following", remove-group at the end when nested
      ├─ rules             div  a two-column grid: the joining word, then the row
      │  ├─ conjunction*   span  "Where" on the first row, "and" / "or" after
      │  └─ rule* | group* div | fieldset
      │     ├─ field       select
      │     ├─ operator    select
      │     ├─ operand     the kind's control, replaceable
      │     └─ remove      button
      └─ add-rule, add-group   button, with the plus glyph
```

The builder is laid out the way Notion, Airtable and AG Grid's advanced filter
lay a query out, because that is the shape a reader already knows: the header
says what the group does in words, every row starts with the word that joins it
to the row above, and a nested group is a box rather than a rail, so its own
header and remove read as its own. "and | or" as the segments, with "of the
following" after them, read as a fragment; "Match [All | Any] of the following"
is a sentence.

`root` is a `search` landmark, not a `toolbar`: the APG toolbar pattern asks
that a toolbar avoid "controls whose operation requires the pair of arrow keys
used for toolbar navigation", and a text box is one. The search field is the
first tab stop, the `bar` the second with arrows between its controls, the
`chips` grid the third with arrows between chips. Three stops however many
fields a product declares.

A pinned field's pill and its applied chip are **one element in two states**:
a pinned field with a value draws its pill as filled, `data-filtered`, and no
chip; an unpinned field with a value draws a chip and no pill. A field is never
drawn twice.

## 4. Two editors, one draft rule

A pill and a chip open a **popover** editing one rule. The builder is a
**drawer** editing the whole tree. Both edit a draft and commit through the
same request.

| `apply`  | In a popover                                                                                        | In the builder                                    | At the bar level                                                                    |
| -------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `live`   | Every change commits, reason `pointer` or `keyboard`; the engine's inactive rule keeps a half-typed condition out. Done closes. | Apply commits, Cancel discards — a tree is too many edits to fire one by one. | Remove a chip, Clear, choose a preset: each commits at once.                        |
| `manual` | Every change goes to the draft; the popover's Apply writes the draft, not the value.               | The same.                                         | Everything goes to the draft; `apply` commits with reason `submit`, `reset` discards; `data-dirty` on the root meanwhile. |

`Escape` closes the surface and discards what the surface held. `Enter` in an
operand does what Apply does in that surface.

The builder is a drawer on every width. Fiori's Adapt Filters is a dialog and
AG Grid's builder is a tool panel; a popover was tried in the first sketch and
refused because a tree with a nested group needs a column, and a popover
anchored to a pill in the bar has neither the height nor the anchor for it.
Below the narrow breakpoint the pills and the chips fold behind `summary`,
which opens the same drawer.

## 5. Required fields and Clear

A field with `required: true` has a `defaultValue`, and Clear returns it to
that value rather than to nothing — the sentence in `docs/component-features.md`
§15. A required field whose rule is inactive refuses Apply under `manual` and
refuses removal of its chip under `live`: the chip takes `data-invalid`, the
message `labels.required(field)` is associated to it, and focus moves to it,
which is Fiori's `_setFocusOnFirstErroneousField`. A required field is pinned
whether or not the consumer said so, because a field the reader cannot remove
should always be in sight.

## 6. Presets

`presets: { key, label, value: FilterGroup }[]`, and `preset` /
`defaultPreset` / `onPresetChange(key | null, request)`. Choosing one replaces
the value with reason `select`; the value changing afterwards keeps the preset
current and marks the root `data-dirty`. The family emits `onPresetSave(value)`
from a control in the builder and nothing else about saving — the name is
typed in a dialog the application owns, because a preset lives on the
application's server and its lifecycle is not this family's.

## 7. Keyboard

Sourced from the [Toolbar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/)
for `bar` and the layout-grid half of the [Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
for `chips`, both read 2026-09-14.

| Key                | Where            | Effect                                                                                   | Source              |
| ------------------ | ---------------- | ---------------------------------------------------------------------------------------- | ------------------- |
| `Tab`, `Shift+Tab` | root             | search → bar → chips → what follows. Into the bar or the chips lands on the last-focused control, else the first enabled. | toolbar, grid       |
| `←` `→`            | bar, chips       | previous / next control, wrapping, mirrored under `dir="rtl"`                            | toolbar (`loop`)    |
| `↑` `↓`            | bar, chips       | nothing — the page scrolls                                                                | toolbar, `crossAxis: false` |
| `Home`, `End`      | bar, chips       | first / last control                                                                     | toolbar (optional), grid |
| `Enter`, `Space`   | pill, chip, add  | open the editor                                                                          | button              |
| `Delete`, `Backspace` | chip          | remove the rule, reason `remove`; focus to the next chip, else the previous, else `add`   | grid; `createRemovalFocus` |
| `Escape`           | search           | clear the query when it holds one, reason `clear`; else nothing                          | Polaris             |
| `Escape`           | any surface      | close and discard                                                                        | dismissable-layer   |
| `Enter`            | an operand       | Apply for that surface                                                                   | table's panel       |
| `shortcut`         | document         | focus the search, unless focus is in an editable element                                 | Polaris `f`         |

Roles and properties: `root` `role="search"` with `aria-label` from `labels.bar`
unless the consumer wrote one; `bar` `role="toolbar"` with `aria-label`
`labels.filters`; `chips` `role="grid"` with one `role="row"` and a
`role="gridcell"` per chip, `aria-label` `labels.applied`; a pill `aria-haspopup="dialog"`
and `aria-expanded`; a chip's accessible name is `<field label>: <sentence>`;
`count` `aria-live="polite"`; the drawer is `drawer`'s and carries `labels.builder`
as its title.

Deliberate departure: the toolbar pattern's "focus is optionally set on the
control that last had focus" is taken, because a reader who left the bar to
read the table comes back to the pill they were on. The grid pattern's cell
editing (`Enter` to edit in place) is not a chip's: `Enter` opens the popover,
which is the same editor a pointer gets.

## 8. What is said out loud

Through `@slotted/core/live-announcer`, politely.

| When                    | What                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| `count` changes         | `labels.count(count, total)` — the `count` part is the live region itself |
| a rule is applied       | the field and its sentence, the same text the chip shows          |
| a chip is removed       | `labels.removed(field)`                                           |
| Clear                   | `labels.cleared`, and for a required field its default's sentence |
| a preset is chosen      | its label                                                         |
| Apply is refused        | the required field's message                                      |

## 9. Sticky

`sticky`, off by default. On, the root is `position: sticky` at
`--slotted-page-sticky-top` and republishes the property for what follows as
that plus its own height, measured by a `ResizeObserver` into
`--slotted-filter-bar-size` on the root — the rule `section` established.

## 10. Density, direction, schemes

Controls are the density scale's: `--slotted-control-height-md` and the gaps.
The pill is `button`'s `outline` shape worn as `data-ui`, the chip is `tag`'s.
The drawer opens from the inline end; every inset is logical; the chip's
remove control sits at the inline end and its sentence and label are two
`unicode-bidi: isolate` spans. `data-filtered` on a pill is carried by
`--slotted-tone-accent-border` and `-surface` as a pair, the rule the token
foundation states for a chosen state.

## 11. React

| Question                                                                                            | Answer                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does a mutable value ship a controlled and uncontrolled pair, plus the request carrying a reason?   | yes — `value`/`defaultValue`/`onValueChange`, `query`/`defaultQuery`/`onQueryChange`, `preset`/`defaultPreset`/`onPresetChange`, `open`/`defaultOpen`/`onOpenChange`, `revealed`/`defaultRevealed`/`onRevealedChange`, all through `createControllable` |
| Can an application set this family's defaults once, rather than per instance?                       | yes — `FilterBarDefaultsProvider` with `labels`, `apply`, `queryDelay`, `chipLimit`; read by `useFilterBarDefaults`                                                                                       |
| Can a consumer substitute the rendered element of each public part?                                 | the operand body through `renderOperand(field, props)`; the `end` slot for the consumer's own controls; the chip's `render`. The bar's frame, the grid and the drawer are fixed, because the keyboard model is theirs |
| Does the consumer's own handler still run when the family handles the same event?                   | yes — composed; `onKeyDown` on the search runs before `Escape` clears                                                                                                                                    |
| Can a consumer reach the native element, and the imperative action it cannot express declaratively? | `ref` on the root; `FilterBarHandle` with `focusSearch()` and `open(path?)` for the builder                                                                                                              |
| Does it render on the server without a hydration mismatch?                                          | yes — `useId`, no layout read during render; the sticky measure is an effect                                                                                                                             |
| Does every state a consumer may style appear in the DOM?                                            | yes — `data-filtered`, `data-dirty`, `data-invalid`, `data-open`, `data-revealed`, `data-disabled`, `data-loading`, `data-apply`, `data-sticky`                                                          |
| Is each part's props type the native element's, extended?                                           | yes — `ComponentPropsWithRef<'div'>` on the root, and the parts that take props extend their element                                                                                                     |

## 12. Angular

| Question                                                                           | Answer                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does a two-way value use the signal form the ecosystem expects?                    | yes — `value = model<FilterGroup \| null>(null)`, `query = model('')`, `preset = model<string \| null>(null)`, `open = model(false)`, `revealed = model(false)`; `valueChange` and its siblings carry the request |
| Does a control that belongs in a form work with Reactive Forms and template forms? | no — a filter bar is not a form control; it is the query a reader composes over a listing, and the operand controls inside it are `text-field` and its siblings, each already a `ControlValueAccessor` |
| Can an application set this family's defaults once, rather than per instance?      | yes — `provideSlFilterBarDefaults({ labels, apply, queryDelay, chipLimit })`                                                                                                                  |
| Can a template reach the instance?                                                 | yes — `exportAs: 'slFilterBar'`, with `focusSearch()` and `open(path?)`                                                                                                                      |
| Can a consumer substitute projected content, and keep it lazy?                     | yes — `<ng-template slFilterBarOperand="field">` rendered per rule with `NgTemplateOutlet`, never built for a closed surface; `<ng-content select="[slFilterBarEnd]">` for the `end` slot     |
| Is it correct with zoneless change detection and `OnPush`?                         | yes — signals throughout, `computed` for the draft and the chips, no `markForCheck`                                                                                                          |
| Is every subscription and listener torn down?                                      | yes — the roving handles, the resize observer and the debounce timer through `DestroyRef`; the surfaces are `popover`'s and `drawer`'s                                                       |
| Does a static attribute the consumer wrote survive the host bindings?              | yes — `aria-label` on the host read through `HostAttributeToken` before the family writes its own                                                                                            |
| Does an entry point that others depend on stay a single class?                     | yes — `@slotted/angular/filter-bar`, importing `@slotted/angular/popover`, `drawer`, `menu`, `select`, `text-field`, `number-field`, `date-picker`, `multi-select`, `tag`, `button`, `segmented-control`, `kbd` through their public entries |

## 13. Tokens

Family tokens fall back to the foundation and nothing else: the pill's radius
to `--slotted-radius-full`, the gap to `--slotted-control-gap-md`, the chip's
maximum to `18rem`, recorded as a literal because no scale holds a measure and
`container` owns the page's. The narrow breakpoint is `36rem`, literal by rule
4 of the token foundation.

## 14. What a wrong answer costs

- **The tree.** If the value should have been a flat map, every consumer
  holding a `FilterGroup` unwraps `rules` once; the helpers in §1 already make
  the first level a map. If it should have been flat rules without the column
  descriptor inside, `table`'s header and this bar stop sharing an object.
  Cheap to change now, a contract break after step 13.
- **Three tab stops.** If the bar should have been one toolbar with the search
  inside it, the search loses its arrow keys. The choice is the APG's.
- **A drawer for the builder.** If a popover was right, the surface changes
  and nothing else does: the builder's body is one component rendered inside
  whichever surface holds it.
