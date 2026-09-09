# Tree capability inventory

Produced before the family was designed or coded, as
`.claude/skills/component/references/capability.md` requires. The family is new:
`specs/components/tree/` does not exist, and `tree` is not in
`specs/legacy-families.json`.

`docs/build-order.md` wave 6 item 6 gives the family one word — `tree` — and no
scope paragraph. `docs/component-features.md` §11 gives it three lines. The
paragraph written from this inventory lands in the same commit as the family.

The inventory covers two things, because the family cannot be built without the
second: the capabilities of the family, and the capability
`packages/core/collection` is missing. Every row marked **engine** belongs to
`@slotted/core/collection` rather than to `tree`; the engine's own header
already names `tree` as one of the six families it exists to keep in agreement,
and the hierarchy it needs is not there yet.

Sources were read on 9 September 2026.

---

## 1. Surveyed

Seven implementations, chosen so they disagree: the norm and its two reference
examples, a headless state machine that ships every capability, a headless
React library that ships selection and drag, the only surveyed answer written
for Angular, an opinionated component with an accessibility review date on it,
and a design system that states the visual rules rather than the API.

| Implementation           | Calls it                                                                                                 | Read at                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| WAI-ARIA APG             | Tree View Pattern; `tree`, `treeitem`, `group`                                                            | <https://www.w3.org/WAI/ARIA/apg/patterns/treeview/>                          |
| WAI-ARIA APG examples    | File Directory Treeview (computed properties); Navigation Treeview                                        | <https://www.w3.org/WAI/ARIA/apg/patterns/treeview/examples/treeview-1a/>     |
| Zag.js 1.43.3 (Ark UI)   | `tree-view` machine; parts `tree`, `item`, `item-text`, `item-indicator`, `branch`, `branch-control`, `branch-trigger`, `branch-indicator`, `branch-content`, `branch-indent-guide`, `node-checkbox` | <https://zagjs.com/components/react/tree-view> and `tree-view.types.ts` on `main` |
| React Aria Components 1.x | `Tree`, `TreeItem`, `TreeItemContent`, `TreeSection`, `TreeHeader`, `TreeLoadMoreItem`                    | <https://react-spectrum.adobe.com/react-aria/Tree.html>                       |
| Angular CDK 22           | `cdk-tree`, `cdkTreeNodeDef`, `cdkTreeNodeToggle`, `levelAccessor` / `childrenAccessor`                    | `src/cdk/tree/tree.md` in `angular/components`                                |
| Primer React (beta)      | `TreeView`, `TreeView.Item`, `TreeView.SubTree`, `TreeView.LeadingVisual`, `TreeView.TrailingVisual`      | <https://primer.style/components/tree-view> and `TreeView.docs.json` on `main` |
| Carbon                   | TreeView; states, selection indicator, keyboard table                                                     | <https://carbondesignsystem.com/components/tree-view/usage/>                   |

The same capability hides under five names. Zag's `expandedValue` is React
Aria's `expandedKeys`, Primer's per-item `expanded`, and the CDK's
`isExpanded` on a `treeControl`. Zag's `branch-control` is Primer's item
content row and React Aria's `TreeItemContent`; all three exist for the same
reason, which is that `role="treeitem"` cannot be the pointer target when it
also contains the child group. Zag's `checkedValue` is a second selection set
that no other surveyed implementation has.

Two of the seven are not comparable on API. Carbon states visual and keyboard
rules and its React package is behind a feature flag; the CDK is a structural
directive set with no opinion on selection at all — it is read here for the two
data shapes it names (`levelAccessor` for already-flat data, `childrenAccessor`
for nested), which is a question every other implementation also answers and
none of them states as plainly.

Angular Material's tree is the CDK's, restyled, and Fluent's `react-tree`
README says in full that it "should never be used in product". Neither adds a
row below.

---

## 2. Table stakes

Every capability two or more surveyed implementations ship.

| Capability                                                  | Who ships it                             | Verdict                    | Reason                                                                                                                                                                                                     |
| ----------------------------------------------------------- | ---------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hierarchical collection with stable keys                    | all seven                                | **adopt (engine)**         | `createCollection` is flat with sections and has no parent, level or descendant. `createTreeCollection` is added to `@slotted/core/collection`, in its own commit, before the family.                       |
| Nested data (`children`) as the input shape                 | Zag, React Aria, Primer, CDK             | **adopt (engine)**         | The shape a product's API returns. `getChildren` reads it.                                                                                                                                                  |
| Already-flat data with a level column                       | CDK (`levelAccessor`)                    | **adopt (engine)**         | One row of the engine, not a second family: a flat source with `getLevel` builds the same collection. A product whose backend returns a flat rowset otherwise rebuilds the nesting to hand it back.        |
| Expansion as a controlled/uncontrolled set                  | Zag, React Aria                          | **adopt**                  | Capability `open`; `expandedKeys` / `defaultExpandedKeys` / `onExpandedKeysChange`.                                                                                                                          |
| Expansion held per item instead of per tree                 | Primer                                   | **decline**                | A set on the tree is the same information and is the only shape `Ctrl`-style expand-all, filtering and "reveal this node" can write in one request. A consumer holding it per item derives it in one `.has()`. |
| Selection, single and multiple                               | Zag, React Aria, Carbon                  | **adopt**                  | Capability `selection`, reusing `nextSelection` from the engine, which already implements both APG models.                                                                                                   |
| Selection with no modifier (`toggle`) and the desktop model | React Aria (`selectionBehavior`), engine | **adopt**                  | Already in `nextSelection`. The APG names both and recommends the first.                                                                                                                                     |
| A checked set separate from the selected set                | Zag only                                 | **decline**                | APG: "if the selection state is indicated with `aria-selected`, then `aria-checked` is not specified for any nodes", and both together needs three conditions it calls extremely rare. One set, and `selectionIndicator` decides which attribute writes it. §5 below states the cost. |
| Check cascade to descendants, with indeterminate parents    | Zag, Carbon                              | **adopt**                  | `selectionCascade="descendants"` over the one selection set; `data-indeterminate` is already in the state vocabulary.                                                                                        |
| Focused node as a value the consumer can read and set       | Zag (`focusedValue`), engine             | **adopt**                  | Capability `current`, as `listbox` named it: `activeKey` / `defaultActiveKey` / `onActiveKeyChange`.                                                                                                         |
| Roving `tabindex`                                            | APG examples, Zag, Primer, React Aria    | **adopt**                  | `createRovingTabindex` in `@slotted/core/focus`.                                                                                                                                                             |
| `aria-activedescendant` as an alternative focus model       | APG note 2, `listbox`                    | **adapt**                  | `focusMode="auto"` reads whether the set is windowed and answers `activedescendant` when it is — the rule `listbox` established, and for the same reason: a rotating `tabindex` does not survive recycling. |
| Arrow up/down over visible nodes only                       | all seven                                | **adopt**                  | `moveIndex` over the flattened visible mask; the engine already refuses to count what is not there.                                                                                                          |
| Right/Left opening, entering and leaving a branch           | all seven                                | **adopt**                  | The one keyboard rule that is the tree's own. Mirrored under `dir="rtl"`.                                                                                                                                    |
| `Home` / `End`                                               | APG, Zag, React Aria, Carbon             | **adopt**                  | `moveIndex` intents `first` and `last`.                                                                                                                                                                      |
| `PageUp` / `PageDown`                                        | React Aria                               | **adopt**                  | `moveIndex` intents `pageUp` / `pageDown`, `PAGE_STEP` 10. The APG does not list them for `tree`; a hundred-node file list without them is a list nobody can cross.                                          |
| Typeahead                                                    | APG (recommended), Zag, React Aria       | **adopt**                  | `createTypeahead` over the visible labels.                                                                                                                                                                   |
| `*` expanding every sibling at the level                    | APG (optional), Zag                      | **adopt**                  | One request carrying `keyboard`. Optional in the pattern and absent from four of the seven; it costs one branch.                                                                                              |
| `Enter` activating a node                                    | APG, Zag, Primer, Carbon                 | **adopt**                  | `onNodeActivate(key, reason, event)`, distinct from selection, which is what makes a navigation tree possible.                                                                                                |
| Click on the row toggling a branch                          | Zag (`expandOnClick`), Primer            | **adopt**                  | Axis `expandOn="row" \| "expander"`. A file browser wants the row; a tree where the row selects wants the chevron alone.                                                                                     |
| A separate expander control                                  | Zag, Primer, Carbon, APG examples        | **adopt**                  | Part `expander`. It is not a `button` element: see §5.                                                                                                                                                       |
| Disabled nodes                                               | Zag, React Aria, engine                  | **adopt**                  | `isDisabled` on the collection; a disabled node is skipped by the keyboard and refuses selection, and stays in the reading order.                                                                             |
| Leading visual / node icon                                  | Zag, Primer, Carbon                      | **adopt**                  | Part `icon`, consumer-supplied. The family owns no folder glyph: a folder is content, and the glyph scale holds no folder.                                                                                    |
| Trailing visual, count or badge                             | Primer, Carbon                           | **adopt**                  | Part `meta`.                                                                                                                                                                                                 |
| Secondary actions on the row                                | Primer (`secondaryActions`)              | **adapt**                  | Part `actions`, composed rather than configured: a consumer puts a `menu` trigger or a `button` in it. An array of `{label, icon, onClick}` is a second, worse button API.                                    |
| Lazy loading of a branch's children                         | Zag, React Aria, Primer                  | **adapt**                  | The consumer owns the data, so the family holds no `loadChildren`. It emits the expansion request, paints `loader`, writes `aria-busy` on the group, and announces the arrival. §5 states the shape.         |
| A skeleton of the expected size while loading               | Primer (`count`)                         | **adopt**                  | `childrenCount` on the node feeds both the placeholder count and `aria-setsize` for the children when they arrive partial.                                                                                    |
| An error state on a branch that failed to load              | Primer (`state="error"`)                 | **adapt**                  | A node the consumer marks; the family paints `data-invalid` on the row and leaves the retry control to `actions`. The family cannot know what retrying means.                                                 |
| Empty state for the whole tree                              | React Aria (`renderEmptyState`)          | **adopt**                  | Part `empty`, as `listbox` has.                                                                                                                                                                              |
| Indentation guide lines                                      | Zag, Primer, Carbon                      | **adopt**                  | Part `guide`. Not decoration: at depth four it is the only thing that says which parent a row belongs to.                                                                                                     |
| `aria-level`, `aria-setsize`, `aria-posinset`               | APG (conditional), Zag, Primer           | **adapt**                  | Written only when the set in the DOM is not complete, which is the pattern's own condition and the rule `listbox` established. Otherwise the browser computes them from the nesting.                          |
| Accessible name on the tree                                  | APG (required), all six others           | **adopt**                  | `aria-label` or `aria-labelledby` on the `tree` element, passed through.                                                                                                                                      |
| Virtualization                                               | Zag (`scrollToIndexFn`), React Aria      | **adopt**                  | `virtualWindow` from the engine over the flattened visible rows, with `focusMode="auto"` as above.                                                                                                            |
| Drag and drop to reorder or move                            | React Aria only                          | **defer to wave 8**        | One surveyed implementation ships it. `docs/component-features.md` §11 calls drag an optional capability of the family; the library has no drag foundation in `packages/core` and inventing one inside `tree` would decide it for `data-grid`, `tabs` and `toolbar` as well. |
| Inline rename of a node                                      | Zag only                                 | **decline**                | One surveyed implementation. A rename is a `text-field` the consumer renders inside `actions` or in place of `label`; the two lines are in §5.                                                               |
| Sections / headers inside a tree                            | React Aria only                          | **decline**                | A section is a level, and a tree already has levels. Two grouping mechanisms in one family is two answers to one question.                                                                                    |
| Horizontal orientation                                       | APG note 5 only                          | **decline**                | The note exists so a horizontal tree maps its arrows correctly; no surveyed implementation ships one, and the guide asks for none. A family that answers `dir="rtl"` already mirrors the only axis a tree has. |

---

## 3. Differentiators

What the best surveyed implementation offers that the others do not, and what
this library can offer because of what it already owns.

| Differentiator                                                                      | Why it is one                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A collapsed branch says a descendant is selected                                    | Carbon states the rule — "the parent node should inherit the selected state so the user does not lose the context of what is selected" — and ships no API for it; nobody else states it at all. `data-selected-within` on a collapsed branch, and a count in `meta` the consumer can render. Selection that vanishes when a branch closes is the defect this exists to prevent. |
| Filtering that keeps ancestors and marks the matched span                           | `createFilter`, `matchRanges` and `splitByMatch` are already in the engine, and `--slotted-highlight-tint-opacity` is already in the foundation because `select` and `combobox` mark their matches. No surveyed tree ships filtering; a file tree without it is a file tree nobody can search. A match keeps its ancestors visible and expanded, and the ancestors are marked `data-match="ancestor"` so they can be painted quieter than the hit. |
| Three schemes, three densities and RTL applied to the indent geometry               | The indent, the guide and the chevron are the three things a tree owns visually, and all three are direction-sensitive. Every surveyed implementation ships one scheme and one density; the CDK ships no CSS at all. The guide is a logical inline-start offset, the chevron rotates rather than swapping glyph, and the indent step shrinks with density without the label losing its column. |
| An indent that stops before the label does                                           | At depth eight in a 240-pixel container every surveyed tree pushes the label out of the box. The indent step is capped by container width, so a deep tree loses indent rather than losing text. |
| One selection set with two indicators, rather than two sets                          | Zag ships `selectedValue` and `checkedValue` and lets a consumer produce the tree the APG calls extremely rare. One set with `selectionIndicator` writing `aria-selected` or `aria-checked` is the pattern's own recommended convention, and it is a capability rather than an absence: the same value is a highlight in a navigator and a checkbox in a picker. |

---

## 4. Gaps

What no surveyed implementation handles well and a real product still hits.

| Gap                                                     | What happens today                                                                                                                                                                        | What this family does                                                                                                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Focus after the focused node is removed                 | Zag moves focus to the tree root or loses it; React Aria keeps a key that no longer exists. A reader deleting three files in a row is returned to the top of the tree three times.        | `createRemovalFocus` from `@slotted/core/focus`, which the library already uses: focus lands on the next sibling, then the previous, then the parent.                          |
| Focus after the focused node's ancestor is collapsed    | Focus is left on a node that is no longer in the DOM, which strands the keyboard.                                                                                                          | Collapsing a branch that contains the active node moves the active node to the branch, before the DOM changes.                                                                 |
| A lazy branch announcing twice, or not at all           | Primer announces the `done` transition; Zag announces nothing. Expanding five branches quickly produces five overlapping announcements.                                                    | One polite announcement per branch, through `@slotted/core/live-announcer`, naming the branch and the count.                                                                   |
| A node label that is one unbroken token                | Every surveyed tree either overflows the container or breaks the row's alignment.                                                                                                          | The label truncates and stays whole in the DOM, which is the library's standing decision on truncation; the full string is reachable by `title` and by the copy the row keeps. |
| Extreme depth                                            | Depth twenty at 240 pixels leaves no column for the label.                                                                                                                                 | The capped indent above, and a `data-depth` a consumer can style past the cap.                                                                                                 |
| A translated label twice the length of the English one  | The row's trailing `meta` is pushed out of the box, or the actions overlap the label.                                                                                                       | The label is the only part that flexes; `meta` and `actions` keep their intrinsic width, and the row wraps its label rather than its structure.                                |
| Selection that outlives the collection                  | A filtered or paged tree silently drops selected keys it can no longer see.                                                                                                                | `nextSelection` already keeps keys the collection does not hold, and the family does not narrow that.                                                                          |

---

## 5. Declines, in full

The three declines above that name a replacement, written out as
`capability.md` requires.

**A second, checked set.** `selectionIndicator="checkbox"` writes the one
selection set as `aria-checked` and paints the `indicator` part as a box; the
default, `"highlight"`, writes it as `aria-selected` and paints a band. A
consumer who genuinely needs a highlight and a set of checks at once has one
of them already: the highlighted node is the tree's `activeKey`, which is in
the DOM as `data-current`, and the checked set is `value`.

**Inline rename.** The consumer renders its own control in place of the label:

```tsx
<Tree.Label>
  {editing === node.id ? <TextField defaultValue={node.name} onBlur={commit} /> : node.name}
</Tree.Label>
```

The family keeps the keyboard off a node whose row holds a focused text field,
because `focusMode` already stops arrow navigation while focus is inside an
input — the rule `toolbar` established.

**Per-item expansion state.** A consumer holding the flag on its own node
derives the set it hands in:

```tsx
<Tree expandedKeys={nodes.filter((n) => n.open).map((n) => n.id)} onExpandedKeysChange={sync} />
```

---

## 6. Engine work this family requires

`packages/core/src/collection` holds no hierarchy. The following is added
there, with its own tests, in its own commit, before the family — as
`docs/build-briefing.md` requires of every shared tool a family finds wanting.

- `createTreeCollection({ roots | items, getKey, getLabel, getChildren | getLevel, hasChildren, isDisabled, childrenCount })`.
- `node.level`, `node.parent`, `node.hasChildren`, `node.childrenCount`, `node.index`, `node.disabled`.
- `visible(expandedKeys)` — the flattened list the keyboard, the window and the
  roving `tabindex` all count, and the one place the order is decided.
- `descendantsOf(key)` and `ancestorsOf(key)` — what a cascade writes and what a
  filter keeps.
- `cascadeSelection(selected, key, action)` — the descendants rule, returning
  the set and the indeterminate keys.
- `siblingsOf(key)` — what `*` expands.

`moveIndex`, `nextSelection`, `createTypeahead`, `virtualWindow`,
`createRovingTabindex`, `createRemovalFocus`, `createFilter` and the live
announcer are taken unchanged. Nothing in this family reimplements one of them.

---

## 7. Exit

A reader who knows this family from Zag, React Aria, Primer or the CDK can point
at drag-and-drop, inline rename, sections, a second checked set, per-item
expansion and horizontal orientation. Each has a row above with its verdict and
its reason, and three of the six carry the replacement in §5.
