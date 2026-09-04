# Listbox design

Decisions taken before either binding was written. The inventory that produced
them is `2026-09-04-listbox-capability-inventory.md`; the engine they stand on is
`2026-09-04-collection-engine-review.md`.

Wave 6 item 2. The family is the primitive `select`, `combobox`, `multi-select`
and the pickers are built from, so every decision here is taken twice: once for
a listbox a consumer renders directly, and once for the three families that will
render it inside a layer.

---

## 1. Anatomy

```
┌─ root ─ div[role=listbox] ─ scrolls ─ the one tab stop ────────────┐
│  ┌─ canvas ─ div[role=presentation] ─ only when windowed ──────┐   │
│  │  ┌─ group ─ div[role=group] ────────────────────────────┐   │   │
│  │  │  group-label                                          │  │   │
│  │  │  ┌─ option ─ div[role=option] ───────────────────┐    │  │   │
│  │  │  │ indicator│icon │ label      │ meta            │    │  │   │
│  │  │  │                 description                    │   │  │   │
│  │  │  └───────────────────────────────────────────────┘    │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  │  empty  ·  loader                                            │   │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

Twelve parts: `root`, `canvas`, `group`, `group-label`, `option`, `indicator`,
`icon`, `label`, `description`, `meta`, `empty`, `loader`.

**The root is the listbox itself, not a wrapper around one.** A wrapper would
give the family two elements to name and the consumer two to select. The root
therefore does three jobs at once: it carries `role="listbox"`, it is the scroll
container, and it is the single tab stop when the focus model is
`activedescendant`.

**`div` and not `ul`/`li`.** `role="listbox"` replaces `ul`'s implicit `list`
role and `role="option"` replaces `li`'s `listitem`, so the elements would
contribute nothing but a promise the roles then break — and the windowed shape
needs a `role="presentation"` element between the root and the options, which is
not a valid child of `ul`. The cost is that nothing is inherited: set position
and size come from `aria-setsize` and `aria-posinset` rather than from the
elements. `list` and `list-item` keep `ul`/`li` because they are a static list
with no role to replace.

The pair is written on every option of a collection the family was handed, and
on none when the options were written as children. That is exactly the
pattern's condition — the attributes are required "if the complete set of
available options is not present in the DOM due to dynamic loading" — and it is
also the only shape that survives the server: a count React could reach only by
reading the DOM is nothing on the server and a number on the client, which is a
hydration mismatch for a value the platform was already computing.

**`canvas` exists only while `virtual` is set**, and it carries
`role="presentation"` so the options stay owned by the listbox. It is the
element that holds the whole canvas's block size while the slice inside it is
translated into place.

**`meta` is `menu`'s third column under a different name.** A menu's third
column holds a key binding; a listbox's holds a value — a count, a price, a
status word. The geometry is the same subgrid, and the name is not, because
`shortcut` would be a lie on every listbox in the library.

**No separator part.** ARIA 1.2 allows a `listbox` to own `option` and `group`
and nothing else. The rule between two groups is the `group` part's own border.

---

## 2. The value, and why it is not always an array

`value` is `string | null` in `single` and `none`, and `readonly string[]` in
`multiple`. Three of the four surveyed implementations give single selection a
scalar; the Angular CDK's array-always shape is the one that makes every
consumer in the application write `value[0]`.

The prop is typed as the union in both bindings rather than as a generic that
narrows on `selectionMode`. A generic would narrow in React and could not narrow
in Angular — an input's value does not type a template — so the two bindings
would have different public shapes for one contract. The union is documented per
mode on both reference pages and normalised once, in the family, to the array the
engine's reducer takes.

`onValueChange(value, request)` carries the same shape, and `request` is the
`ChangeRequest` `packages/core/src/state` defines: the new value, the value it
replaces, the reason, the originating event, and `cancel()`.

Reasons: `pointer`, `keyboard`, `select`, `clear`, `programmatic`. `select` is
what select-all emits, because it is neither a pointer nor one key.

---

## 3. Two mutable values, not one

| Capability  | Controlled  | Uncontrolled       | Request               | What it is                              |
| ----------- | ----------- | ------------------ | --------------------- | ----------------------------------------- |
| `selection` | `value`     | `defaultValue`     | `onValueChange`       | What the reader has chosen.             |
| `current`   | `activeKey` | `defaultActiveKey` | `onActiveKeyChange`   | Which option the keyboard is on.        |

The pattern is explicit that these are two things — "DOM focus (the active
element) is functionally distinct from the selected state" — and every surveyed
implementation that ships only one of them ships a listbox whose active option
cannot be restored. A `select` opening onto the option the reader chose last time
needs `activeKey` and nothing else.

`current` moves on a key press and on a press of the pointer. **It does not move
on hover.** `menu` moves real focus on hover because a menu has one highlight and
the pointer owns it; a listbox has a selection as well, and a hover that moved
the active option would fight the arrow keys the reader is holding down.

Reasons for `current`: `pointer`, `keyboard`, `programmatic`.

---

## 4. The keyboard, transcribed

Source: <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/>, read 4 September
2026 from the rendered page and from `content/patterns/listbox/listbox-pattern.html`
in `w3c/aria-practices`.

| Key                        | Effect                                                                                                        | Focus lands on              | Source            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------- |
| `Tab`                      | Moves into and out of the listbox. One tab stop for the whole set.                                            | the root, or past it        | pattern           |
| `ArrowDown` / `ArrowUp`    | The next / previous option along the block axis. Wraps only when `loop`.                                      | that option                 | pattern           |
| `ArrowRight` / `ArrowLeft` | Horizontal orientation: the inline axis, mirrored in a right-to-left document. `columns > 1`: one along a row. | that option                 | pattern, note 5   |
| `Home` / `End`             | The first / last option.                                                                                      | that option                 | pattern, optional |
| `PageDown` / `PageUp`      | Ten options on, or ten back. Never wraps.                                                                     | that option                 | platform          |
| `Space`                    | Changes the selection state of the active option. Mid-typeahead it is a character.                            | unchanged                   | pattern           |
| `Enter`                    | As `Space`.                                                                                                   | unchanged                   | departure, §7     |
| `Shift`+`ArrowDown`/`Up`   | Moves and toggles the option moved to.                                                                        | that option                 | pattern, optional |
| `Shift`+`Space`            | Selects from the anchor to the active option.                                                                 | unchanged                   | pattern, optional |
| `Ctrl`+`Shift`+`Home`/`End`| Selects from the active option to the first / last, and moves there.                                          | that option                 | pattern, optional |
| `Ctrl`/`Cmd`+`A`           | Selects every enabled option; again, clears. Refused by `disallowSelectAll`.                                  | unchanged                   | pattern, optional |
| `Ctrl`+`ArrowDown`/`Up`    | Moves without changing the selection. Only under `selectionBehavior="replace"`.                               | that option                 | pattern, alt model|
| `Ctrl`+`Space`             | Changes the selection state of the active option. Only under `replace`.                                       | unchanged                   | pattern, alt model|
| Printable characters       | The next option whose `textValue` starts with the sequence; a repeated character cycles.                      | that option                 | pattern, recommended |

Both selection models the pattern offers are implemented, chosen by
`selectionBehavior`. `toggle` is the recommended one — no modifier needed — and
is the default. `replace` is the alternative model, where moving without a
modifier collapses the selection onto the option moved to.

Roles, properties and states: `listbox` on the root; `option` on each option;
`group` on each group, named by `aria-labelledby` pointing at its `group-label`;
`aria-multiselectable` written only in `multiple`; `aria-selected` on every
selectable option, `true` or `false`, and `aria-checked` on none of them;
`aria-disabled` on a disabled option and on a disabled root;
`aria-orientation="horizontal"` only when horizontal, since `vertical` is the
role's default; `aria-activedescendant` on the root under that focus model;
`aria-setsize` and `aria-posinset` on every option; `aria-readonly`,
`aria-required` and `aria-invalid` on the root; `aria-busy` on the root while
loading.

---

## 5. The focus model is a fact, not a preference

`focusMode` takes `auto`, `roving` and `activedescendant`, and defaults to
`auto`, which resolves to `activedescendant` when `virtual` is set and to
`roving` otherwise.

A roving `tabindex` is the better model when it works: real focus means the
platform draws the focus ring, announces the option and scrolls it into view.
It stops working the moment a window recycles rows, because the element carrying
`tabindex="0"` is removed while it holds focus, and focus falls to `<body>`.

The Angular CDK asks the consumer to know that `useActiveDescendant` exists;
React Aria never offers it. Here the family reads the one fact that decides it.
The two explicit values remain, for the two callers that have a reason: a
`combobox`, whose DOM focus belongs to its text field, states
`activedescendant`; a test that wants real focus states `roving`.

---

## 6. Windowing

`virtual` is a boolean, and `itemSize` is required with it rather than optional:
a window over rows whose height depends on how their own text wrapped is the
measured variant the engine deferred, and accepting it silently would produce a
list that drifts.

- The root scrolls. `canvas` holds `block-size: <totalSize>px`.
- The slice is placed with `transform: translateY(<startOffset>px)` on a
  positioned wrapper inside the canvas, so no option carries a layout offset of
  its own and the subgrid survives.
- The active option and the range anchor are `pinned`, so
  `aria-activedescendant` never references an element that is not in the
  document. A pinned row outside the slice is rendered at its own offset.
- Every option carries `aria-setsize` and `aria-posinset`, which the pattern
  requires whenever the whole set is not in the DOM.
- `sectionSize` states the group label's row height, defaulting to `itemSize`.
  With sections the family builds `createRowMetrics` over the row list; without
  them it passes `itemSize` and the engine keeps its two multiplications.

`rows` bounds the box: the listbox is `rows` options tall by default, seven of
them, which is `<select size>` under another name and what makes a windowed
listbox have a viewport at all.

---

## 7. Deliberate departures, and their cost

| Departure                                                | Cost                                                                                                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Enter` selects, which the pattern does not define.       | A consumer who wanted `Enter` to submit the form around the listbox has to stop the event. The alternative — a key readers try first doing nothing — is worse. |
| `div`/`div` rather than `ul`/`li`.                        | Nothing is inherited; `aria-setsize` and `aria-posinset` are written on every option rather than only on the windowed ones. §1.                              |
| No `onAction`, which React Aria ships.                    | An option is a value, not a command. A list of commands is `menu`, which owns `menuitem` and the press semantics that go with it.                            |
| Hover does not move the active option, unlike `menu`.     | A pointer reader gets no highlight until they press. §3.                                                                                                     |
| The value is a union rather than a generic.               | A React consumer in `multiple` narrows the union once. §2.                                                                                                  |

---

## 8. React integration, answered line by line

| Question                                                                     | Answer                                                                                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, plus a request carrying a reason?          | yes — `value`/`defaultValue`/`onValueChange`, and `activeKey`/`defaultActiveKey`/`onActiveKeyChange`. `packages/react/src/listbox/listbox.tsx` |
| Application defaults set once?                                               | yes — `ListboxDefaultsProvider` and `useListboxDefaults`. `listbox-defaults.tsx`                                                          |
| Can a consumer substitute the rendered element of each public part?          | yes — `render` on the root, the option, the group and the loader. `empty` and the text parts take children instead.                        |
| Does the consumer's own handler still run?                                   | yes — `onKeyDown`, `onPointerDown`, `onClick`, `onFocus` and `onBlur` compose; the family runs after and never in place of.                |
| Native element and the imperative action?                                    | yes — `ref` to the root `div`, plus `ListboxHandle` with `focus()`, `scrollToKey(key, align)` and `getActiveKey()`.                        |
| Server render without a hydration mismatch?                                  | yes — `useId` for the root and the option id prefix; the window's first frame is the overscan buffer, which the engine returns for a viewport of nought. |
| Every state a consumer may style in the DOM?                                 | yes — `data-selected`, `data-current`, `data-disabled`, `data-loading`, `data-readonly`, `data-invalid`, `data-required`, plus `data-empty` on the root. |
| Props typed as the native element's, extended?                               | yes — `ComponentPropsWithRef<'div'>` on the root and the option.                                                                           |

## 9. Angular integration, answered line by line

| Question                                                          | Answer                                                                                                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the signal form the ecosystem expects?           | yes — `model()` for `value` and `activeKey`, `output()` for the requests that carry a reason.                                       |
| Reactive Forms and template forms?                                | yes — `ControlValueAccessor` on the root directive, plus `Validator` for `required`, since a listbox is where a form holds a choice. |
| Application defaults set once?                                    | yes — `LISTBOX_DEFAULTS` and `provideListboxDefaults()`.                                                                            |
| Can a template reach the instance?                                | yes — `exportAs: 'slottedListbox'`, and `slottedListboxOption` for one option.                                                      |
| Substitutable, lazy projected content?                            | yes — `ng-content` in the option's parts; the empty state and the loader take `ng-template` through `NgTemplateOutlet`.             |
| Zoneless and `OnPush`?                                            | yes — signals throughout, `computed` for every derived value, and no `markForCheck`.                                                |
| Every subscription torn down?                                     | yes — `DestroyRef` for the typeahead handle and the scroll listener; no RxJS subscription is opened.                                |
| Does a static attribute the consumer wrote survive?               | yes — `HostAttributeToken` reads `role`, `aria-label` and `id` before the host bindings write anything.                             |
| Does an entry point others depend on stay a single class?         | yes — imported through `@slotted/angular/listbox`.                                                                                  |

The asymmetry is deliberate and is `frameworks.md`'s own instruction: Angular
gets `ControlValueAccessor` and a DI token because Angular has forms and DI, and
React gets a `render` prop and a context provider because React has neither.
Neither binding is levelled down to the other's shape.

---

## 10. Tokens

Component-owned custom properties, all of them reaching foundation tokens:
`--slotted-listbox-surface`, `-text`, `-text-muted`, `-border-color`, `-radius`,
`-shadow`, `-padding-block`, `-padding-inline`, `-option-radius`,
`-option-gap`, `-highlight`, `-highlight-active`, `-selected-surface`,
`-selected-text`, `-selected-icon`, `-rows`, `-columns`.

An option is a control, so its height, inset, type, glyph and gap read control
geometry, which is what answers the three densities. The surface's own inset,
radius and shadow come off the space, radius and shadow scales, as `menu`'s do.

`--slotted-listbox-rows` and `--slotted-listbox-columns` are theme-owned tokens
with a literal default, and the family overrides each per instance from its own
prop. They are not runtime properties: a runtime property is a value only script
can measure — where the anchor is, how tall the message turned out to be — and a
theme that wanted every listbox in an application five options tall can retune
these two. The two values script does own, the canvas's height and the offset the
window starts at, are written as private `--_` properties and are named by no
theme at all.

The stylesheet's private properties — `--_canvas-size` and `--_canvas-offset` —
are how the window reaches CSS. Nothing else about the window is styleable, which
is deliberate: a consumer who could retune the offset could take the slice off
its canvas.

---

## 11. What selection looks like, and why it is not only a ground

The selected option carries a tinted ground **and** a mark. Under
`forced-colors: active` every tone surface becomes `Canvas`, so a family that
said "selected" with a fill alone would say nothing at all in the mode that
needs it most — and that is the same failure WCAG 2.2 SC 1.4.1 describes for
colour on its own. `indicator: 'none'` removes the mark for a listbox whose rows
are wide enough that a ground is unambiguous, and it then paints a start-edge bar
that survives forced colours in its place.

The active option carries the highlight `menu` uses, one step of the neutral
tone, and the ring is drawn on it **from the listbox** — `:focus-within` on the
root, not `:focus-visible` on the option. That is what makes one rule cover both
focus models: under `roving` the focus is on the option and under
`activedescendant` it is on the root, and keying on the option's own state would
have drawn nothing at all in the model where the option never holds focus. The
root's own ring is drawn only under `activedescendant`, where the root is what
the reader is operating.

The cost is that a pointer press also raises the ring, where a `:focus-visible`
rule would not. It is the right trade for this family: the press has just moved
the active option, and the ring is where the arrow keys will start from.
