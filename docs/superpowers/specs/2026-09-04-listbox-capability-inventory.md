# Listbox capability inventory

Produced before the family was designed or coded, as
`.claude/skills/component/references/capability.md` requires. The family is new:
`specs/components/listbox/` does not exist.

`docs/build-order.md` wave 6 gives the family one line — "primeiro consumidor
real do motor, e o teste de janela com seleção simultânea" — and no scope
paragraph. The paragraph written from this inventory lands in the same commit.

The inventory covers two things at once, because the invocation named both: the
capabilities of the family, and the capabilities of `packages/core/collection`
that the family is the first caller of. Wave 6 item 1 orders that review, and
every row below marked **engine** is a capability that belongs to the engine
rather than to the family — the family only wires it.

Sources were read on 4 September 2026.

---

## 1. Surveyed

Six implementations, chosen so they disagree: the norm, a headless behaviour
library written for React, the only surveyed answer written for Angular, a
framework-agnostic state machine, an opinionated component that hides the role
inside a popup, and the platform's own element.

| Implementation                 | Calls it                                                                                                       | Read at                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| WAI-ARIA APG                   | Listbox Pattern; `listbox` and `option`                                                                        | <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/> and the pattern source in `w3c/aria-practices` |
| WAI-ARIA APG examples          | Scrollable Listbox, Listbox with Grouped Options, Listboxes with Rearrangeable Options                          | <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-scrollable/>                   |
| React Aria Components 1.x      | `ListBox`, `ListBoxItem`, `ListBoxSection`, `ListBoxLoadMoreItem`                                              | <https://react-spectrum.adobe.com/react-aria/ListBox.html>                                       |
| Angular CDK 22                 | `cdkListbox`, `cdkOption` directives                                                                           | `src/cdk/listbox/listbox.md` in `angular/components`                                             |
| Zag.js 1.43.3 (Ark UI)         | `listbox` machine; parts `root`, `label`, `content`, `item`, `itemGroup`, `itemGroupLabel`, `itemIndicator`     | <https://zagjs.com/components/react/listbox>                                                     |
| Headless UI 2.x (React)        | `Listbox`, `ListboxButton`, `ListboxOptions`, `ListboxOption`                                                  | <https://headlessui.com/react/listbox>                                                           |
| HTML                           | `<select multiple size>` with `<optgroup>` and `<option>`                                                      | the element the pattern is modelled on                                                           |

The same capability hides under four names. React Aria's `selectionBehavior:
"replace"` is Zag's `selectionMode: "extended"` and is what `<select multiple>`
does with Ctrl and Shift. React Aria's `shouldFocusWrap` is Zag's `loopFocus`
and the CDK's `cdkListboxNavigationWrapDisabled`. React Aria's `textValue` is
the CDK's `cdkOptionTypeaheadLabel`. The active option is React Aria's *focused
key*, Zag's *highlighted value* and the CDK's `.cdk-option-active`.

Two of them are not the same component as this one. **Headless UI's `Listbox`
is a select**: it ships a button, a popup and a `ListboxButton` that displays
the value, so its listbox is never presented on its own. It is surveyed because
it is the most-installed thing called a listbox, and its shape is the argument
for keeping `select` a separate family in wave 6 item 3. **Base UI has no
standalone listbox** — the role lives inside `Select` and `Autocomplete` — so it
is named here and not counted as a source.

One of them disagrees with the other four about the value's shape. The CDK's
listbox value is **always an array**, even in single selection, so a consumer
writes `value[0]` for every single-select listbox in the application. React
Aria, Zag and `<select>` all give single selection a scalar.

Two of them disagree about which key the arrows move. The APG scrollable and
grouped examples keep DOM focus on the listbox and move `aria-activedescendant`;
the CDK uses a roving `tabindex` by default and offers `useActiveDescendant` as
an input; React Aria roves. Nobody chooses between them on evidence, and the
evidence is windowing — which is §4 below.

---

## 2. Table stakes

Every row is shipped by two or more of the surveyed implementations. The verdict
is this library's. A `decline` names what owns the capability instead, or the
composition that replaces it.

### 2.1 Role, name and structure

| Capability                                                         | Who ships it                          | Verdict | Reason                                                                                                                                              |
| ------------------------------------------------------------------ | ------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `role="listbox"` on the container, `role="option"` on each option   | APG, CDK, Zag, React Aria             | adopt   | The pattern's first requirement. The parts are `root` and `option`.                                                                                 |
| An accessible name is required, not optional                        | APG, CDK, Zag, React Aria             | adopt   | The family refuses to be nameless: it takes `aria-label`, `aria-labelledby`, or the `field` around it, and the contract records which wins.          |
| `aria-multiselectable` when more than one option can be chosen      | APG, CDK, Zag                         | adopt   | Written `true` only in `multiple`; the pattern says the default `false` may stay implied, so nothing is written otherwise.                           |
| Option groups: `role="group"` with a required accessible name       | APG, Zag (`itemGroup`), React Aria, HTML (`optgroup`) | adopt   | Parts `group` and `group-label`, and the label names the group by `aria-labelledby` rather than being loose text among the options.                  |
| Selection state on the option, one attribute and not two            | APG, CDK, Zag, React Aria             | adopt   | `aria-selected` throughout, never `aria-checked`. The pattern forbids mixing them, and this library's `data-selected` already means the reader's own choice. |
| Primary and secondary text inside one option                        | React Aria (`label`/`description` slots), Zag (`itemText`) | adopt   | Parts `label` and `description`. The option's accessible name stays the flat string the role can carry, so `textValue` overrides it.                 |
| A separator between options                                         | HTML (`<hr>` in `<select>`), menus generally | decline | ARIA 1.2 allows a `listbox` to own `option` and `group` and nothing else. A visual rule between groups is the `group` part's own border, drawn by the stylesheet. |

### 2.2 Selection

| Capability                                                            | Who ships it                                            | Verdict | Reason                                                                                                                                       |
| --------------------------------------------------------------------- | ------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`, `single` and `multiple` selection modes                        | React Aria, Zag, CDK, HTML                              | adopt   | **engine.** One reducer, three modes, so `select`, `combobox` and `tree` cannot disagree about what `multiple` means.                         |
| Modifier-key selection model (`replace` / `extended`)                  | React Aria (`selectionBehavior`), Zag (`extended`), HTML | adopt   | **engine.** `toggle` is the recommended model in the pattern and the default here; `replace` is the desktop model a file list needs.          |
| Range selection with Shift                                            | APG, React Aria, Zag, HTML                              | adopt   | **engine.** Shift+Arrow, Shift+Home/End and Shift+click, all from one anchor the reducer holds.                                               |
| Select all, and a way to refuse it                                    | APG (optional), Zag (`disallowSelectAll`), React Aria    | adopt   | **engine.** Ctrl/Cmd+A selects every enabled option; pressing it again clears, which is the pattern's optional second half.                   |
| Refusing an empty selection                                           | React Aria (`disallowEmptySelection`), Zag (`deselectable`) | adopt   | **engine.** A required single-select control cannot be emptied by clicking the chosen option again.                                          |
| Selection follows focus                                               | APG (optional), Zag (`selectOnHighlight`), HTML single  | adopt   | An axis, default off. The APG names the accessibility cost, so the default is the safe one and the axis is what a single-select picker turns on. |
| A scalar value in single selection                                    | React Aria, Zag, HTML                                   | adopt   | Three of four. The CDK's array-always shape is the one surveyed answer that makes every consumer write `value[0]`.                            |
| Comparing values by identity, with an escape hatch                    | CDK (`cdkListboxCompareWith`)                           | adapt   | The key is a string, always, and the consumer's own object never enters the contract — which is the same answer with no comparator to pass.   |

### 2.3 Keyboard and focus

| Capability                                                    | Who ships it                                                     | Verdict | Reason                                                                                                                                     |
| ------------------------------------------------------------- | ---------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Arrow keys move the active option                             | APG, CDK, Zag, React Aria, HTML                                  | adopt   | **engine.** A pure index reducer, so the two bindings cannot disagree.                                                                     |
| `Home` and `End`                                              | APG (strongly recommended above five options), CDK, Zag, React Aria | adopt   | **engine.**                                                                                                                                |
| `PageUp` and `PageDown`                                       | HTML, React Aria                                                 | adopt   | **engine.** A page is the number of options the viewport holds, which the engine knows because it computes the window.                     |
| Typeahead over the option labels                              | APG (recommended above seven options), CDK, Zag, React Aria      | adopt   | `packages/core/src/typeahead`, already built for `menu` and naming `listbox` as its next consumer.                                          |
| A typeahead label that is not the visible text                | CDK (`cdkOptionTypeaheadLabel`), React Aria (`textValue`)        | adopt   | One prop, `textValue`, which is also the option's accessible name.                                                                         |
| Wrapping past the ends, and turning it off                    | CDK, Zag, React Aria                                             | adopt   | An axis. Default off: React Aria and Zag both default off, the CDK defaults on.                                                            |
| Skipping disabled options, and not skipping them              | CDK (`cdkListboxNavigatesDisabledOptions`), React Aria           | adopt   | An axis. Default skip; the APG's "discoverability is crucial" case is what turns it off.                                                    |
| Roving `tabindex`                                             | CDK (default), React Aria                                        | adopt   | The default when the whole set is in the DOM.                                                                                              |
| `aria-activedescendant`                                       | APG examples, CDK (`useActiveDescendant`), Zag                   | adopt   | Required when the set is windowed, because a roving stop cannot survive its own element being recycled. §4 is the argument.                |
| Horizontal orientation                                        | APG, CDK, Zag, React Aria                                        | adopt   | The arrows swap axes and mirror in a right-to-left document.                                                                                |
| Two-dimensional arrangement                                   | React Aria (`layout="grid"`), Zag (grid collection)              | adopt   | **engine.** A `columns` axis. The arrows step by one across and by `columns` down, which is one number in the reducer rather than a layout read. |

### 2.4 Content, state and scale

| Capability                                       | Who ships it                                                    | Verdict | Reason                                                                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Disabled options                                 | APG, CDK, Zag, React Aria, HTML                                 | adopt   | `aria-disabled` on the option, never the native attribute: the pattern needs a disabled option to stay reachable when the axis says so.    |
| The whole control disabled                       | CDK, Zag, React Aria                                            | adopt   | `aria-disabled` on the root, and every option inherits it.                                                                                |
| An empty state                                   | React Aria (`renderEmptyState`), and this library's own `menu`  | adopt   | Part `empty`, inside the listbox, for the reason `list` records: outside it, the reader hears "listbox, 0 items" and then nothing.         |
| Incremental loading                              | React Aria (`ListBoxLoadMoreItem`)                              | adopt   | **engine.** With `aria-setsize` and `aria-posinset`, which the pattern requires exactly when the set is not fully in the DOM.              |
| Virtualization                                   | React Aria (Virtualizer), and `docs/component-features.md` §2.10 | adopt   | **engine.** A capability of the collection, never a family. Wave 6 item 1 orders it and `virtual-list` was retired for it.                 |
| Forms: a value that submits                      | CDK (`ControlValueAccessor`), HTML                              | adopt   | Angular implements `ControlValueAccessor`; React writes hidden inputs under a `name`, which is what makes a bare `<form>` submit the set.  |
| `readonly`, `required`, `invalid`                | HTML (`required` on `select`), CDK (forms validators)           | adopt   | `aria-readonly`, `aria-required` and `aria-invalid` are all supported on `listbox`, and `field` already owns the wiring for the three.     |
| Application defaults set once                    | Zag (machine context), CDK (none), React Aria (none)            | adapt   | A React provider and an Angular injection token, as every family in this library ships. Two of the three surveyed have no answer at all.   |
| Drag to reorder                                  | React Aria (`dragAndDropHooks`), APG rearrangeable example      | defer to `drag-and-drop`, wave 8 | `docs/component-features.md` §3 makes drag-and-drop its own `[Extended]` module with a keyboard alternative of its own. The family exposes `data-dragging` for it and adds no gesture. |
| A trigger, a popup and a displayed value         | Headless UI, HTML `<select>` (single line)                      | defer to `select`, wave 6 item 3 | The listbox is the primitive the guide's §11 names for Select, Combobox and pickers. A family that opened its own layer would be `select` under another name. |
| Filtering the options by typing                  | Headless UI (`ListboxOptions` + `Combobox`), Zag (`filter`)     | defer to `combobox`, wave 6 item 4 | The same reason `menu` recorded: a list filtered by typing is a combobox by role, and answering it here would put two roles on one surface. |

---

## 3. Differentiators

| What                                                                    | Where it comes from                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The focus model is chosen by the family, not by the consumer.**        | The CDK asks the consumer to know that `useActiveDescendant` exists; React Aria never offers it. Here `focusMode: 'auto'` reads one fact — whether the set is windowed — and picks the model that survives recycling. A consumer who never thinks about it is still correct. |
| **Windowing and selection are one engine, not two libraries.**           | Every surveyed answer that virtualizes bolts a windowing library onto a selection model, and the seam is where `aria-activedescendant` dangles. §4 names the four failures that seam produces; the engine holds both, so the window is a function of the active index as well as of the scroll offset. |
| **Three schemes, three densities and logical properties.**               | None of the six answers a `high-contrast` scheme, and the selection highlight is exactly the thing forced colours erase. The family paints selection with a mark as well as a ground, so the state survives `forced-colors: active`.                |
| **Two first-class bindings that are not levelled down.**                 | The Angular binding is a `ControlValueAccessor` with a `provideListboxDefaults()` token; the React binding is a provider plus `render` on every part. Neither is the other's shape translated.                                                     |
| **A `columns` number instead of a measured grid.**                       | React Aria reads the laid-out geometry to decide what "the option below" is, which is a layout read during a key press. An explicit `columns` makes the same movement arithmetic, testable without a browser, and correct on the first render.      |

---

## 4. Gaps — what a window with selection breaks

This is the section the invocation asked for. `packages/core/src/collection`
holds one function, `virtualWindow`, written for the retired `virtual-list`
family, whose own comment says the signature "is provisional until Listbox and
Calendar have had their say". Listbox is now saying it. Four things break, and
none of them is visible in a list that only scrolls.

| Gap                                                                                                                                                                                                          | What no surveyed implementation handles well                                                                                                                                                        | Answer                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The active option is recycled out of the DOM and `aria-activedescendant` dangles.** A window computed from the scroll offset alone drops the element the attribute points at as soon as momentum scroll passes it. The property then references an id that does not exist, and the screen reader has no focused option at all. | React Aria's Virtualizer keeps the focused key mounted; nothing else surveyed does, and none of them documents it as a rule. Zag does not virtualize. The CDK does not virtualize.                        | `virtualWindow` takes `pinned` indices and always renders them. The family pins the active option and the range anchor.                                                                                                    |
| **A roving `tabindex` cannot survive recycling at all.** The element carrying `tabindex="0"` is removed while it holds DOM focus, so focus falls to `<body>` and the next Tab restarts at the top of the page. | Every surveyed implementation that roves also refuses to virtualize, so none of them meets the case.                                                                                                     | `focusMode: 'auto'` resolves to `activedescendant` whenever `virtual` is set. The DOM focus then never leaves the root, and there is nothing to recycle.                                                                    |
| **Arrow keys move to an option that is not rendered.** `Home` in a windowed list of ten thousand moves the active index to 0, which is nowhere near the current window; the family has to scroll first and render second. | React Aria answers it inside a virtualizer nobody can use separately.                                                                                                                                    | `offsetForIndex(index, align)` is arithmetic in the engine, so the same number drives the scroll in both bindings, and the pinned window keeps the option addressable in the frame before the scroll lands.                |
| **The set is not fully in the DOM and the reader is not told how large it is.** The APG requires `aria-setsize` and `aria-posinset` in exactly this case, and it is the requirement a windowing library cannot know to meet, because it does not know about roles. | The pattern states it; none of the four component implementations surveyed writes the pair, because three of them never window and the fourth leaves it to the virtualizer's caller.                     | The engine returns `setSize` and `posInSet` for every key, from the collection rather than from the window, and the family writes both on every rendered option — windowed or not, since incremental loading needs them too. |
| **Sections and a window disagree about row size.** `virtualWindow` multiplies a single `itemSize`, and a group label is not the same height as an option. A grouped list of five thousand options drifts further from its canvas with every group. | React Aria measures. Zag and the CDK do not window. The retired `virtual-list` assumed uniform rows and had no groups to contradict it.                                                                    | The engine builds a prefix-sum row table when the rows differ, and keeps the multiplication when they do not. The uniform path is the one every non-grouped list takes, and it stays two multiplications.                   |
| **Long, translated and unbroken option text.** An option's accessible name is a flat string, and the pattern warns that long names degrade perceivability. A single unbroken token pushes the indicator column off the surface. | Neither React Aria nor Zag styles anything; the CDK styles nothing by contract; Headless UI's examples truncate with no way to read the whole value.                                                       | The option is a subgrid with a fixed mark column and a label column that is the only one that gives way, which is `menu`'s answer, plus `overflow-wrap: anywhere`. Truncation never removes content from the DOM.          |

---

## 5. What the engine gains, and why each piece is engine and not family

Wave 6 item 1 lists six capabilities. Each one is answered below with the module
that answers it, so the review is auditable rather than asserted.

| Wave 6 item 1 asks for | Where it lands                                                                                                       | Why not in the family                                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stable keys            | `createCollection` — a key per item, an index per key, and the identity that survives a reorder                      | `select`, `combobox`, `multi-select`, `tree` and `table` all need the same identity, and five copies of it would be five chances to disagree.  |
| Sections               | `createCollection` — a flat row list of `option` and `section-label` rows over a nested input                        | The flattening is what the keyboard, the typeahead and the window all count in. Doing it per family means doing it four times.                  |
| Typeahead              | `packages/core/src/typeahead` — already built, already tested, and it named `listbox` as its next consumer           | It is already there; the collection supplies the labels and nothing more.                                                                      |
| Selection              | `nextSelection` — one reducer for the three modes, the two behaviours, the range anchor and select-all               | The reducer is the whole of the disagreement between `single` and `multiple`, and it is pure arithmetic over a key set.                        |
| Incremental loading    | `shouldLoadMore` plus `setSize`/`posInSet` from the collection                                                       | The trigger is a function of the window and the count, both of which the engine holds. The fetch is the consumer's.                            |
| Virtualization         | `virtualWindow`, extended with pinned indices, a variable-row table and `offsetForIndex`                             | §2.10 of the feature guide: "Virtualização, lazy loading e paginação são capacidades opcionais de coleções, não componentes paralelos."         |

---

## 6. Exit condition

A reader who knows this family from React Aria, the CDK or Zag can point at
`selectionBehavior`, `disallowEmptySelection`, `disallowSelectAll`,
`shouldFocusWrap`, `useActiveDescendant`, `cdkOptionTypeaheadLabel`,
`renderEmptyState`, `ListBoxLoadMoreItem`, `layout="grid"`, `dragAndDropHooks`,
`compareWith` and the array-shaped value, and find every one of them above with
a verdict and a reason.
