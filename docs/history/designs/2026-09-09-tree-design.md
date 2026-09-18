# Tree design

Decisions taken before either binding was written. The inventory that produced
them is `2026-09-09-tree-capability-inventory.md`; this document holds only what
a later family or a later reader has to know, and what each decision costs.

Pattern source: **Tree View Pattern**, WAI-ARIA Authoring Practices,
<https://www.w3.org/WAI/ARIA/apg/patterns/treeview/>, read 9 September 2026,
with the File Directory Treeview (computed properties) and Navigation Treeview
examples.

---

## 1. Anatomy

```
div    [data-ui="tree"]  [data-part="root"]        container-type: inline-size
└ ul   role="tree"       [data-part="canvas"]      aria-multiselectable, the scroll box
  └ li role="treeitem"   [data-part="node"]        aria-expanded, aria-selected|checked, aria-level*
    ├ div                [data-part="row"]         the band, the pointer target, the indent
    │ ├ span             [data-part="guide"]       one element, one line per ancestor
    │ ├ span             [data-part="expander"]    the chevron; not a button, see §3
    │ ├ span             [data-part="indicator"]   the selection mark
    │ ├ span             [data-part="icon"]        the consumer's leading visual
    │ ├ span             [data-part="label"]       the name; the only part that flexes
    │ ├ span             [data-part="description"] the second line
    │ ├ span             [data-part="meta"]        the trailing count or badge
    │ ├ span             [data-part="loader"]      the branch is fetching its children
    │ └ div              [data-part="actions"]     the consumer's trailing controls
    └ ul role="group"    [data-part="group"]       present only while expanded
      └ li … the next level
  └ div                  [data-part="empty"]       the tree holds nothing
```

Fifteen parts. Two of them exist because of a structural fact rather than a
visual one, and both are stated below.

**`root` and `canvas` are two elements.** `container-type: inline-size` makes an
element a query container for its descendants and not for itself, and the
family's own indent answers its own width — so the container goes on `root` and
the tree one element in. This is the standing decision in
`docs/build-briefing.md`, and it is why the reference pages give `tree` a
`block` stage.

**`node` and `row` are two elements.** `role="treeitem"` has to contain the
`role="group"` that holds its children, and a pointer target that contained the
whole subtree would select a folder when the reader clicked a file three levels
down. Zag, React Aria and Primer each split the same way and each calls it
something else.

### Facts in the DOM that are not states

`data-key`, `data-depth` (zero-based), `data-branch` on a node that has or may
have children, and `data-selected-within` on a **collapsed** branch holding a
selected descendant. The last one is the answer to a rule Carbon states and
nobody ships: a selection that disappears when its branch closes is a selection
the reader has lost. It is a fact rather than a state — the reader did not
select this node — so it takes no place in the state vocabulary and no place in
`STATE_PRECEDENCE`.

---

## 2. Selection: one set, two indicators

The APG allows `aria-selected` or `aria-checked` and calls a tree holding both
"extremely rare", requiring three conditions at once. Zag ships `selectedValue`
and `checkedValue` as separate sets, which produces exactly that tree by
default.

**Decision.** One selection value. `selectionIndicator` decides how it is
written and drawn:

| `selectionIndicator` | ARIA on the node | The mark                    | Default for                |
| -------------------- | ---------------- | --------------------------- | -------------------------- |
| `highlight`          | `aria-selected`  | none: the ground and the ink | `selectionMode="single"`   |
| `checkbox`           | `aria-checked`   | the box `checkbox` draws     | `selectionMode="multiple"` |
| `none`               | neither          | none                        | `selectionMode="none"`     |

**`highlight` draws no mark, and the reason is a cell.** A mark needs one, and a
cell empty on every unchosen row is a gutter down the start edge of the whole
tree — which is what the visual gate found. A tree already spends one cell on
the chevron and one per level on the indent. Primer, Carbon and the pattern's
own examples all highlight without a mark; `listbox` keeps its check because a
flat list has one cell to spare and no indent, and that is where the two
families part.

**The box under `checkbox` is `checkbox`'s own**, value for value: the square
from the selection scale, the medium edge in the strong border colour, the
smallest radius, the solid ground when chosen, and a mark with a whole two
pixels of clearance revealed by a clip that opens along the stroke. Two
selection controls on one page that differ by a pixel are two controls.
`tree.styles.test.mjs` reads `checkbox.css` and compares them, so a change to
either family that parts them fails.

`data-selected` is written in both indicator modes, so a stylesheet and a test
have one selector for one fact. `data-indeterminate` is written on a branch
whose descendants are partly selected, and only under
`selectionCascade="descendants"`.

**Cost.** A product that wants a highlighted node *and* a set of checks does not
get two selection sets. It has the highlight already: the active node is
`activeKey`, in the DOM as `data-current`. A product that wants a third,
unrelated per-node flag renders its own control in `actions`.

---

## 3. The expander is not a button

The APG examples draw the chevron as a `span` inside the `treeitem`; Primer does
the same. A `button` there is a second tab stop inside a widget whose pattern
has exactly one, and giving it `tabindex="-1"` only moves the failure to the
pointer: clicking it takes DOM focus off the `treeitem` that the roving tab stop
and `aria-activedescendant` both point at.

**Decision.** `expander` is a `span` with `aria-hidden="true"` and a pointer
handler. The state it shows is already announced: `aria-expanded` is on the
node, which is the element a reader is on.

**Cost.** A pointer-only reader has one target for expansion rather than a
labelled control. `expandOn="row"` — the default for a tree whose rows do not
select — makes the whole band that target, which is larger than any button.
Under `expandOn="expander"` the chevron's hit area is expanded to
`--slotted-target-min` without the artwork growing.

---

## 4. Expansion is `open`, and it is a set

Capability `open`, because a branch is a disclosure and the vocabulary already
holds the word; `accordion` reached for `selection` for the same value, which
is a word `tree` needs for something else.

```json
"open": {
  "controlled": "expandedKeys",
  "uncontrolled": "defaultExpandedKeys",
  "request": "onExpandedKeysChange",
  "reasons": ["pointer", "keyboard", "programmatic"]
}
```

`programmatic` covers two cases and no third: the handle's `expand`/`collapse`,
and the ancestors `scrollToKey` opens to reveal its target.

**A filter opens nothing.** The path to a hit is held open for as long as the
query lasts, and the reader's own set is never moved — otherwise the family
would have to put the set back when the query emptied, and a reader who cleared
a search would find branches open that they never opened. `aria-expanded`
reports what is on screen either way.

**Collapsing a branch that holds the active node moves the active node to the
branch, and the request for it is emitted before the expansion request.** A
consumer that accepts the first and refuses the second is left with a coherent
pair; the reverse order would strand the keyboard on an element the next render
removes.

---

## 5. Lazy loading: the consumer owns the data

Zag takes a `loadChildren` promise and mutates its own collection. This family
holds no collection of its own, so it cannot.

The shape instead:

1. The reader expands a branch whose node says `hasChildren` and whose
   `children` is empty.
2. `onExpandedKeysChange` fires with `pointer` or `keyboard`.
3. The consumer fetches, and marks that node `loading` in its own data.
4. The family paints `loader`, writes `data-loading` on the node and
   `aria-busy="true"` on its `group`, and renders `childrenCount` skeleton rows
   when the node states one.
5. When the children arrive, the family announces once, politely, through
   `@slotted/core/live-announcer`: the branch's name and the number of children.
6. A branch the fetch failed for is marked `invalid` by the consumer. The family
   paints `data-invalid` on the row and renders whatever the consumer put in
   `actions`; it does not invent a retry, because it cannot know what retrying
   means.

**Cost.** Four lines of consumer code that Zag does not ask for, and the family
cannot show a loading branch to a consumer that never marks one. In exchange the
data has one owner, which is the rule `docs/state-and-events.md` states for
every other family.

---

## 6. Keyboard

Transcribed from the pattern, item by item. `Right` and `Left` are the logical
directions: under `dir="rtl"` the two swap, which is the only mirroring a
vertical tree has.

| Key                     | Precondition                            | Effect                                             | Focus lands on   |
| ----------------------- | --------------------------------------- | -------------------------------------------------- | ---------------- |
| `Right`                 | closed branch                           | opens it                                           | unchanged        |
| `Right`                 | open branch                             | —                                                  | first child      |
| `Right`                 | leaf                                    | nothing                                            | unchanged        |
| `Left`                  | open branch                             | closes it                                          | unchanged        |
| `Left`                  | leaf or closed branch, with a parent    | —                                                  | the parent       |
| `Left`                  | leaf or closed branch at the root level | nothing                                            | unchanged        |
| `Down`                  | —                                       | —                                                  | next visible     |
| `Up`                    | —                                       | —                                                  | previous visible |
| `Home`                  | —                                       | —                                                  | first visible    |
| `End`                   | —                                       | —                                                  | last visible     |
| `PageDown` / `PageUp`   | —                                       | —                                                  | ten visible on   |
| `Enter`                 | any node                                | activates; a branch also toggles under `expandOn="row"` | unchanged   |
| `Space`                 | `selectionMode` not `none`              | toggles the node's selection                        | unchanged        |
| `Shift`+`Up`/`Down`     | `multiple`                              | moves and toggles                                   | the next node    |
| `Shift`+`Space`         | `multiple`                              | selects from the anchor to here                     | unchanged        |
| `Ctrl`+`Shift`+`Home`   | `multiple`                              | selects from here to the first                      | unchanged        |
| `Ctrl`+`Shift`+`End`    | `multiple`                              | selects from here to the last                       | unchanged        |
| `Ctrl`+`A`              | `multiple`, `disallowSelectAll` off     | selects all, or clears when all are selected        | unchanged        |
| `*`                     | any node                                | opens every sibling at this level                   | unchanged        |
| a printable character   | `typeahead` on                          | —                                                   | next label match |

`PageUp`, `PageDown` and typeahead are not in the pattern's `tree` table.
Typeahead is recommended by it in prose; the page keys are taken from the same
engine `listbox` uses, because a file tree of four hundred visible rows without
them is a tree nobody can cross. The recommended multi-select model — no
modifier required — is the default, as `nextSelection` already implements.

---

## 7. ARIA, item by item

| Requirement                                                       | Where it is answered                                                            |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| nodes contained in an element with role `tree`                    | `canvas`                                                                          |
| each node has role `treeitem`                                     | `node`                                                                            |
| each parent contains an element with role `group`                 | `group`, rendered only while expanded                                             |
| `aria-expanded` on branches only, never on leaves                 | written from `hasChildren`; a leaf carries no attribute                           |
| `aria-multiselectable` on the tree when more than one may be chosen | `canvas`, when `selectionMode="multiple"`                                        |
| selection by `aria-selected` **or** `aria-checked`, never both    | §2                                                                                |
| selectable-but-unselected nodes carry the attribute as `false`    | written on every node while `selectionMode` is not `none`                         |
| non-selectable nodes carry neither                                | `selectionMode="none"` writes neither                                             |
| the tree has an accessible name                                   | `aria-label` / `aria-labelledby` passed through to `canvas`; unnamed is a defect the reference page states |
| `aria-level`, `aria-setsize`, `aria-posinset` when the set is partial | written exactly when the collection is windowed or `totalCount` exceeds what is held — the condition the pattern states and the rule `listbox` set |

**The accessible name of a node is stated, not computed.** A `treeitem` that
contains its own `group` computes its name from its contents, which is every
descendant's text. Each node carries `aria-labelledby` pointing at its own
`label` part. The cost is one generated id per node, from `useId` in React and
from the family's own counter in Angular; the alternative is a folder whose
name is the whole subtree read aloud.

---

## 8. Visual decisions

- **Indent lives on `row`, as `padding-inline-start`.** The band a selected or
  hovered row paints spans the full width of the tree; a band that started at
  the indent reads as a broken rectangle. The `group` carries no inset at all.
- **One `guide` element per row, not one per level.** Its inline size is
  `depth × step`, and the lines are a `repeating-linear-gradient` at the step.
  Depth twenty is one element rather than twenty.
- **The line sits under the chevron of the level above, half a glyph from that
  level's cell — not half a step.** The two agree only at `md`; at `sm`, at `lg`
  and under both container queries they do not, and every line was off its
  chevron at five of the nine combinations.
- **The line runs straight through every row.** It stopped at half the row on a
  last child, where an elbow would turn; with no elbow to turn into, a chain of
  only children drew a staircase of short segments that read as broken rather
  than as ended. The cost: no elbow, so the line says which parent a row belongs
  to and not which sibling is last — which is what every surveyed implementation
  draws.
- **The indent step shrinks before the label does.** A container query on `root`
  drops the step at 320 and again at 240 CSS pixels. A tree loses indent before
  it loses text.
- **The chevron rotates; it does not swap.** One glyph token,
  `--slotted-icon-chevron-right`, turned 90° when open and mirrored by the
  writing direction, so the two states read as one control moving.
- **`--slotted-duration-short` on the rotation and on the row's ground.** The
  group's own appearance is not animated: a height transition on a list whose
  height is unknown is the animation every library gets wrong, and the reader
  learns nothing from it that the chevron has not already said.
- **The row states no `gap`; each optional cell carries its own margin.** A gap
  is drawn between two cells even when one is empty, so a tree whose nodes carry
  no icon opened with a gutter down its start edge. It is `menu`'s rule and
  `listbox`'s. A tree holding at least one icon opens that cell on every row, so
  a set where only some nodes carry a picture keeps its names in one column.
- **The row is one line box tall at rest.** The mark beside the label is aligned
  to the text, not to the line box, by the rule the briefing records:
  `vertical-align: calc((1cap + 1ex) / 2 - <mark size> / 2)`.

---

## 9. React integration

| Question                                                   | Answered by                                                                                       |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| controlled/uncontrolled pair and a request carrying a reason | three of them: `value`/`defaultValue`/`onValueChange`, `expandedKeys`/`defaultExpandedKeys`/`onExpandedKeysChange`, `activeKey`/`defaultActiveKey`/`onActiveKeyChange` |
| defaults set once                                            | `TreeDefaultsProvider` and `useTreeDefaults`, as `listbox` has                                     |
| substituting the rendered element of each part               | `render` on `Tree`, `Tree.Node`, `Tree.Group` and `Tree.Row`; the leaf parts take `ComponentPropsWithRef<'span'>` and need none |
| the consumer's handler still runs                            | every handler composed, never replaced; `defaultPrevented` is honoured before the family acts       |
| the native element and the imperative actions                | `ref` to the root `div`; `handleRef` for `focus`, `scrollToKey`, `expand`, `collapse`, `expandAll`, `collapseAll`, `getActiveKey`, `getElement` |
| server rendering                                             | `useId` for every node id and the tree id; no layout read during render; `virtual` windows only after mount |
| every state a consumer may style is in the DOM               | the `data-*` vocabulary in §1 and the contract's `stateAttributes`                                  |
| part props are the native element's, extended                | `ComponentPropsWithRef<'div' \| 'li' \| 'ul' \| 'span'>` per part                                   |

## 10. Angular integration

| Question                                        | Answered by                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| two-way value in the signal form                | `model()` for `value`, `expandedKeys` and `activeKey`; `output()` for the three requests carrying the reason |
| Reactive Forms and template forms               | `ControlValueAccessor` on the root over the **selection** value, plus `Validator` for `required` — a category picker is a form control, and this is where the asymmetry with React is |
| defaults set once                               | `SL_TREE_DEFAULTS` token and `provideTreeDefaults()`                                             |
| a template reaching the instance                | `exportAs="slTree"`, and `slTreeNode` exports as `slTreeNode`                                    |
| substituting projected content, kept lazy       | named `ng-content` slots on the row parts; `NgTemplateOutlet` for the node template, which is what a data-driven tree re-renders |
| zoneless and `OnPush`                           | signals throughout; `computed` for the flattened visible list, the selection lookups and the cascade |
| every subscription torn down                    | `takeUntilDestroyed`; the typeahead and the live announcer are disposed in `DestroyRef`           |
| a static attribute surviving the host bindings  | `HostAttributeToken` read before `data-part` is written — the rule `toolbar` learned from `menu`  |
| a single class per entry point                  | imported through `@slotted/angular/tree`                                                          |

**The asymmetry, recorded rather than levelled.** The Angular root is a form
control and the React root is not; React submits through one hidden input per
selected key, under `name`, which is what `listbox` does and what Angular's
`ControlValueAccessor` makes unnecessary.

---

## 11. What this family adds to `@slotted/core/collection`

`createTreeCollection`, `visible`, `descendantsOf`, `ancestorsOf`,
`siblingsOf` and `cascadeSelection`, with their tests, in their own commit
before the family. `moveIndex`, `nextSelection`, `createTypeahead`,
`virtualWindow`, `createRovingTabindex`, `createRemovalFocus`, `createFilter`
and `createLiveAnnouncer` are taken unchanged; nothing here reimplements one.

The engine's own header already names `tree` as one of the six families it
exists to keep in agreement. `table` — the tree grid in §12 of the guide — takes
the same hierarchy when it is built.
