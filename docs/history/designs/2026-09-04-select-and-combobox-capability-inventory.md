# Select and Combobox — capability inventory

Produced before any design or code, from the field rather than from the two
families, which do not exist yet. Read on 2026-09-04.

`docs/process/build-order.md` gives wave 6 items 3 and 4 one line each and no scope
paragraph, so `docs/build-briefing.md` sends the scope to
`docs/component-features.md` §6:

- **Select** — "Escolha entre opções conhecidas; simples/múltipla, clearable,
  placeholder, groups, disabledKeys, loading e empty. Trigger abre listbox,
  exibe seleção e mantém nome acessível. Typeahead busca labels; seleção
  múltipla define resumo/chips e remoção por teclado. Não inclui entrada de
  texto livre."
- **Combobox / Autocomplete** — "Entrada de texto + coleção filtrada; valor
  textual e chave selecionada são contratos distintos. Contrato: query
  controlada/default, items, selectedKey, allowsCustomValue, debounce, async
  loading, load more e política de commit. Setas navegam sem mover cursor de
  texto indevidamente; Escape fecha/reverte conforme estado; leitores de tela
  recebem contagem e item ativo. Filtragem, ranking e busca remota são adapters."

That paragraph is the floor. What follows is the ceiling the field sets.

## 1. Surveyed

| Implementation | Version / date read | Calls it | Read at |
| -------------- | ------------------- | -------- | ------- |
| WAI-ARIA Authoring Practices — Combobox Pattern | read 2026-09-04 | Combobox; Select-Only Combobox | <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/> and <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/> |
| WAI-ARIA Authoring Practices — Listbox Pattern | read 2026-09-04 | Listbox | <https://www.w3.org/WAI/ARIA/apg/patterns/listbox/> |
| Radix Primitives | docs read 2026-09-04 | `Select` | <https://www.radix-ui.com/primitives/docs/components/select> |
| Base UI | v1.8.0, read 2026-09-04 | `Select`, `Combobox` | <https://base-ui.com/react/components/select>, <https://base-ui.com/react/components/combobox> |
| React Aria Components | docs read 2026-09-04 | `Select`, `ComboBox` | <https://react-spectrum.adobe.com/react-aria/Select.html>, <https://react-spectrum.adobe.com/react-aria/ComboBox.html> |
| Ark UI | v5.39.1, read 2026-09-04 | `Select`, `Combobox` | <https://ark-ui.com/docs/components/select>, <https://ark-ui.com/docs/components/combobox> |
| Angular Material | `main`, read 2026-09-04 | `mat-select` | <https://raw.githubusercontent.com/angular/components/main/src/material/select/select.ts> |
| Angular CDK | `main`, read 2026-09-04 | `cdkListbox` | <https://raw.githubusercontent.com/angular/components/main/src/cdk/listbox/listbox.ts> |

The eight disagree with each other on purpose: a specification, two headless
behaviour libraries with opposite focus models, one accessibility-first library,
one framework-agnostic state machine, and the Angular ecosystem's own answer,
which is the only one in the list that is a form control before it is a widget.

The same capability hides under different names, so the table below records the
capability rather than the prop:

| Capability | Radix | Base UI | React Aria | Ark | Angular Material |
| ---------- | ----- | ------- | ---------- | --- | ---------------- |
| selected key | `value` | `value` | `selectedKey` / `value` | `value: string[]` | `value` |
| input text | — | `inputValue` | `inputValue` | `inputValue` | — |
| highlighted option | — | `onItemHighlighted` | — | `highlightedValue` | — |
| item identity | `Item value` | `items` + `isItemEqualToValue` | `id` on the item | `collection` | `compareWith` |
| typeahead window | fixed | `Item label` | `useFilter` | `typeahead` | `typeaheadDebounceInterval` |

## 2. Table stakes

Every capability two or more of the surveyed implementations ship.

### The list, and moving through it

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| `role="listbox"` popup with `role="option"` items | all eight | adopt | The pattern the APG names for both families. |
| Groups with an accessible name | Radix, Base UI, React Aria, Ark, Material (`mat-optgroup`) | adopt | Parts `group` and `group-label`; the label names the group by `aria-labelledby`, which the listbox pattern requires. |
| Separator between groups | Radix, Base UI, Ark | adopt | One part, `separator`, `role="separator"` inside the listbox. |
| Disabled items that stay announced | all eight | adopt | `aria-disabled` on the option, kept in the collection and skipped by movement. `data-disabled` for the stylesheet. |
| Arrow movement with an option skipped when disabled | all eight | adopt | `moveIndex` in `packages/core/src/collection`, shared by both families. |
| `Home` / `End` | APG (optional, "strongly recommended" above five options), Radix, Base UI, React Aria, Ark | adopt | Both families hold more than five options by definition. |
| `PageUp` / `PageDown` | APG select-only example (ten options), Base UI, React Aria | adopt | Ten options a step, which is the number the APG example states. |
| Typeahead on the labels | APG (recommended), Radix, Base UI, Ark, Material | adopt | `packages/core/src/typeahead` already holds it; `menu` recorded `listbox` as its next consumer. Locale-sensitive at base sensitivity, as §2.9 requires. |
| Selection follows focus, or not | APG note, React Aria, Material | adapt | Refused for the popup: the APG's own listbox-popup note says selection follows focus in a *combobox* listbox, and the select-only example does not commit until `Enter`. The family highlights without committing and commits on `Enter`, `Space` (select only), `Tab` and pointer press. `data-current` marks the highlight; `aria-selected` marks the commitment. |
| Scrolling the highlighted option into view | Radix, Base UI, React Aria, Ark, Material | adopt | `scrollIntoView({ block: 'nearest' })` on every highlight change, and `scrollToKey()` as the imperative escape hatch. |
| Bounded popup height from the space that is left | Radix, Base UI, React Aria | adopt | `--slotted-positioner-available-height`, exactly as `menu` records it. |
| Virtualization | Base UI (`Combobox.Collection` + external), React Aria (`Virtualizer`), Ark | defer to `collection` | §2.10 makes virtualization a capability of the collection engine rather than a parallel family, and `menu` already deferred it there. `virtualWindow` exists and is unused by a real caller; wave 6 item 1 is the engine review. Until then a bounded, scrolling popup plus typeahead holds a hundred options, which the harness proves. |

### The value

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| Controlled and uncontrolled selected key | all eight | adopt | `value` / `defaultValue` / `onValueChange`, with the reason the request carries. |
| Placeholder while nothing is selected | Radix, Base UI, React Aria, Ark, Material | adopt | Rendered by the `value` part, which carries `data-placeholder` so the stylesheet can quieten it. |
| Clearable | Base UI (`Combobox.Clear`), React Aria, Ark (`ClearTrigger`), Material (`canSelectNullableOptions`) | adopt | A `clear` button, a sibling of the control rather than its child, as `text-field` places its own. Reason `clear`. |
| Multiple selection | Base UI (`multiple`), React Aria (`selectionMode`), Ark, Material (`multiple`), CDK | adopt for `select`, decline for `combobox` | §6 names it for Select by name — "simples/múltipla ... resumo" — so Select ships it with a summary in the trigger. Chips, creation, reorder, duplicates and paste are `multi-select`, wave 6 item 5, which §6 files under MultiSelect / Tags Input. A combobox that also held a set would be that family with a different name. |
| Item identity that is not the label | Base UI (`isItemEqualToValue`, `createItems`), React Aria (`id`), Material (`compareWith`), CDK (`compareWith`) | adopt | Both families take `compare?: (a, b) => boolean`. Four of the eight ship it, and an async list that replaces its row objects between renders is the case that needs it. |
| Form submission | Radix (hidden `select`), Base UI (`name`), React Aria (`name`), Ark, Material (`ControlValueAccessor`) | adopt | React renders a visually hidden `select` carrying `name`, `required` and `form`, so a native submit and a native `reset()` both work. Angular implements `ControlValueAccessor` and `Validator`, which is the ecosystem's own answer and the one `radio-group` already sets. |
| `required` / `invalid` / `readOnly` / `disabled` inherited from the field | Material (`errorStateMatcher`), React Aria (`isInvalid`, `validate`) | adopt | `undefined` defers to `field`, exactly as `text-field` resolves them. `readOnly` is enforced by the family because neither a button nor the ARIA combobox has it. |

### The text side, for `combobox` only

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| Input text and selected key as two contracts | Base UI, React Aria, Ark | adopt | §6 asks for it in those words. `inputValue` / `defaultInputValue` / `onInputValueChange` sits beside `value` / `defaultValue` / `onValueChange`, and each transition emits exactly one of them. |
| Filtering as an adapter | Base UI (`Combobox.useFilter`, `filter`), React Aria (`useFilter` + `defaultFilter`), Ark | adopt | §6 refuses an assumed `contains`. `filter` takes `(item, query) => boolean`; the default is a locale-sensitive `contains` from a new `createFilter` in `packages/core/src/collection`, and passing `null` turns filtering off entirely, which is what a server-filtered list needs. |
| Externally filtered list | Base UI (`filteredItems`), React Aria (`items` vs `defaultItems`) | adopt | Consequence of `filter={null}`: the consumer renders the window it fetched, and the family filters nothing. |
| `allowsCustomValue` | React Aria, Base UI (creatable recipe), Ark (`allowCustomValue`) | adopt | §6 names it. When `true` the input's text commits on blur and `Enter` with no matching option, and the request carries the string. |
| Autocomplete behaviour axis | APG (`aria-autocomplete`: `none` / `list` / `both`), React Aria, Ark | adopt | `autocomplete="list" \| "both" \| "none"`. `both` writes the completion string into the input as a selected range, which is the only behaviour in the pattern that has a visible artefact and which two of the surveyed skip. |
| When the popup opens | React Aria (`menuTrigger`: `input`/`focus`/`manual`), Base UI (`openOnInputClick`), Ark (`openOnClick`, `openOnChange`) | adopt | `openOn="input" \| "focus" \| "manual"`. |
| A trigger button beside the input | Base UI (`Combobox.Trigger`), Ark (`Trigger`), Material | adopt | Excluded from the tab sequence, which the APG's Keyboard Interaction note requires by name. |
| Debounce | §6 asks for it; Material has `typeaheadDebounceInterval` for a different purpose | adapt | Refused as a prop on the family and answered by composition. A debounce belongs to the consumer's fetch, not to a controlled input: a family that delayed `onInputValueChange` would delay a controlled consumer's own re-render and drop characters. The reference page shows the three lines that debounce a fetch instead. Recorded as a departure from the scope paragraph. |
| Async loading, and load more | Base UI (async recipes), React Aria (`loadingState`, `onLoadMore`) | adopt | `loading` paints the `status` row inside the popup and sets `aria-busy`; `onLoadMore` fires when the last option is scrolled to, through an `IntersectionObserver` on the `status` row. |
| Announced result count | React Aria, APG (`aria-live` guidance) | adopt | §6 asks for it in those words. The `status` part is the live region and carries the count. |

### Both

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| Popup anchored, flipped, shifted and collision-padded | Radix, Base UI, React Aria, Ark, Material (`panelWidth`) | adopt | `packages/core/src/positioner`, as every overlay family in this library composes it. |
| Popup as wide as the control | Radix (`--radix-select-trigger-width`), Base UI, Material (`panelWidth`) | adopt | Default `width="anchor"`; `width="content"` lets it size to its options. `--slotted-positioner-anchor-width` already publishes the number. |
| Portal, and turning it off | Radix, Base UI, Ark | adopt | `packages/core/src/portal`. |
| Dismiss on outside press and on `Escape` | all | adopt | `packages/core/src/dismissable-layer`. |
| Modality | Base UI (`modal`, default `true`) | decline | `docs/component-features.md` §8 gives the modal surface to `dialog`, and `popover` and `menu` both declined it there for the same reason. A select that inerted the page could not be closed by pressing its own control. |
| Positioner arrow | Base UI, Ark | decline | The popup hangs from the control at `align="start"` and is as wide as it, so the control already says where the popup came from. `popover` is the anchored surface that points at something; `menu` declined the arrow with the same sentence. |
| An item-aligned popup that opens over the control | Radix (`position="item-aligned"`, its default), Material (`disableOptionCentering`) | decline | Two of eight ship it and Radix's own examples set `position="popper"`. The behaviour puts the selected option under the pointer by scrolling the popup and offsetting it, which needs a measured scroll on every open, cannot survive a bounded height, and is a macOS convention rather than a web one. Composition is not available for it; the cost is recorded here rather than hidden. |
| Backdrop | Base UI | decline | A backdrop belongs to a modal surface, and modality is declined above. |
| Defaults set once for the whole application | Base UI (no), React Aria (no), Ark (no), Material (`MAT_SELECT_CONFIG`) | adopt | One of eight, and the one whose ecosystem is half of this library's audience. Both bindings ship it: `SelectDefaultsProvider` / `provideSelectDefaults`. |

## 3. Differentiators

| Differentiator | What it is, and who does not have it |
| -------------- | ------------------------------------ |
| **The matched substring is marked in each option** | `combobox` wraps the part of an option's label the query matched in `<mark data-part="match">`, from a `matchRanges` function in `packages/core/src/collection`. MUI's Autocomplete ships `parse`/`match` helpers and asks the consumer to render them; none of the eight surveyed does it by default. It is the one visual answer to "why is this option in my results", and it is what makes a fuzzy or server-side filter legible. It degrades to no marks when the label is not plain text, and `highlightMatch={false}` turns it off. |
| **One highlight model across both families, and it is the pattern's** | DOM focus never leaves the control: `aria-activedescendant` marks the option. Radix and Ark move real focus into the options for `select` and cannot for `combobox`, so the two families in those libraries answer arrows through two different mechanisms. Here `select` and `combobox` share one, which is also the one the APG's own select-only example uses. |
| **Three colour schemes, three densities, both directions, on the popup as well as the control** | No surveyed implementation ships a popup that answers a `dense` density and `high-contrast` without the consumer writing CSS. An option's height, inset, type and glyph all read control geometry, so a select in a dense table is the same component at a smaller step. |
| **The control frame is `text-field`'s frame** | The same border, radius, shadow, focus ring, invalid retargeting and disabled treatment, from the same tokens. A form holding a text field, a number field and a select reads as one row of controls rather than three libraries. None of the eight has an opinion here, because none of them ships the other controls. |
| **Two first-class bindings, neither levelled down** | The Angular binding is a `ControlValueAccessor` and a `Validator`, participates in Reactive Forms, and takes defaults from an injection token. The React binding renders a hidden native `select` so a plain `<form>` submits and `reset()` restores. Radix, Base UI and Ark have no Angular answer; Material has no React one. |
| **`readOnly` is a real state** | Neither the ARIA combobox on a button nor a `<select>` honours `readonly`. The family refuses the change and announces `aria-readonly`, and paints a ground that is not the disabled ground — the rule `radio-group` set and `text-field` follows. Only React Aria among the eight has a comparable notion, and it spells it as a disabled variant. |

## 4. Gaps

What no surveyed implementation handles well, and a real product hits anyway.

| Gap | What happens in the field | What these families do |
| --- | ------------------------- | ---------------------- |
| **An option label longer than the popup** | Radix, Base UI and Ark all let the label wrap into as many lines as it takes, so one translated option can be five lines tall and the list stops being scannable. Material truncates and loses the text. | The label wraps to at most two lines and then truncates, with the whole string kept in the DOM and reachable — the rule `docs/build-briefing.md` states as a decision already taken: truncation never removes content. `title` is not used for it; the `description` part is where a long explanation belongs. |
| **A selected option that is no longer in the list** | Every one of the eight renders the placeholder, silently, when a controlled `value` matches no option — which is what an async list does on its first render, before the fetch lands. | The `value` part renders the consumer's own `renderValue`, which receives the raw value; unmatched, the family paints `data-unmatched` and shows the raw value rather than the placeholder, so a form never looks empty while holding a value. |
| **An empty collection** | React Aria has `allowsEmptyCollection`, default `false`, so the popup silently refuses to open — and a combobox whose fetch returned nothing shows the reader nothing at all. Radix has no empty state. | `empty` is a declared part, the popup opens onto it, and `emptyLabel` has a default so a family that says nothing still says something. |
| **The reader typed and the answer is still travelling** | Base UI's async recipes ask the consumer to assemble a `Status` element and the strings; React Aria exposes `loadingState` and draws nothing. | `loading` paints the `status` row, sets `aria-busy` on the listbox, keeps the popup's measure so nothing jumps when the results land, and announces politely. |
| **A hundred options with no virtualizer** | Every implementation either ships a virtualizer or runs out of room. | The popup is bounded by the space the positioner reports and scrolls; typeahead and `Home`/`End`/`PageUp`/`PageDown` make the far end reachable without the wheel. The harness carries a hundred-option scene, and `onLoadMore` is the incremental answer until the collection engine's virtualization lands. |
| **A single unbroken token as a label** | A 60-character identifier with no spaces overflows the popup in Radix and Base UI. | `overflow-wrap: anywhere` on the label, which is what `menu` already does, and the harness proves it at 240 pixels. |
| **`dir="rtl"` on the popup only** | The popup is portalled to the end of the document, so it leaves the mirrored region it belongs to and reads left-to-right inside a right-to-left form. Radix asks for a `dir` prop for exactly this reason. | `packages/core/src/portal` mirrors `dir` and `lang` onto the portal root — `MIRRORED_ATTRIBUTES` — so the popup inherits the direction of the control rather than of the document. Proved by the RTL capture. |
| **A form reset** | Radix's hidden `select` restores; Base UI and Ark hold their own state and do not. | React listens for the form's own `reset` and restores the initial value, the same repair `text-field` makes; Angular's `ControlValueAccessor` gets it from the form. |

## Exit condition

A reader who knows Select or Combobox from another library can point at
`item-aligned` positioning, chips, virtualization, modality, an arrow, a
backdrop or a debounce prop, and find each one above with a verdict and a
reason. Nothing else in the eight surveyed surfaces is absent from this
inventory without a line.
