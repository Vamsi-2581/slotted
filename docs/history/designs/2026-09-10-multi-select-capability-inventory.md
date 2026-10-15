# `multi-select` — capability inventory

Wave 6 item 5. Read on 2026-09-10, before any of this family's code was
written and before `select`'s implementation was opened.

`docs/component-features.md` §6 gives the family one paragraph: "Coleção de
valores selecionados com busca/criação opcional, limite, duplicatas, reorder e
paste de múltiplos valores. Chips removíveis têm labels; Backspace remove apenas
com input vazio e regra previsível. Overflow resume seleção sem ocultar acesso ao
conjunto completo." That paragraph is the floor. `docs/product/prd.md` names neither
this family nor a chip, so nothing there narrows it.

## 1. Surveyed

Eight sources, read 2026-09-10. Three of them disagree with each other about
what the family even is, which is the disagreement worth surveying: a *tags
input* is a text field that produces values, a *multi select* is a listbox that
produces a set, and the two have converged on one control everywhere except in
the naming.

| Source                                                                                             | Version         | Calls it                          | What it is                                                                                            |
| -------------------------------------------------------------------------------------------------- | --------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [Zag.js](https://zagjs.com/components/react/tags-input)                                            | 1.43.3          | `tags-input`                      | A state machine. Free text only; no popup at all. Roving focus over the tags, tags editable in place.  |
| [Ark UI](https://ark-ui.com/docs/components/tags-input)                                            | 5.39.1          | `TagsInput`                       | Zag's machine as parts: `Root`, `Control`, `Input`, `Item`, `ItemPreview`, `ItemText`, `ItemDeleteTrigger`, `ClearTrigger`. |
| [Base UI](https://base-ui.com/react/components/autocomplete)                                       | 1.8.0           | `Autocomplete` with `multiple`    | A combobox whose value is an array, with `Chips`, `Chip` and `ChipRemove` parts inside the control.    |
| [Mantine](https://mantine.dev/core/tags-input/)                                                    | 8.x (2026-09)   | `TagsInput`                       | Free text **and** suggestions in one control. `maxTags`, `allowDuplicates`, `isDuplicate`, `splitChars`, `acceptValueOnBlur`. |
| [Mantine](https://mantine.dev/core/multi-select/)                                                  | 8.x (2026-09)   | `MultiSelect`                     | The same control with free text refused. `maxValues`, `hidePickedOptions`, `searchable`, `clearable`. |
| [React Aria](https://react-spectrum.adobe.com/react-aria/TagGroup.html)                            | RAC 1.x         | `TagGroup` / `TagList` / `Tag`    | The chip row alone, as a **grid**: `Grid row` per tag, `Grid cell` inside, `onRemove`, `selectionMode`, `escapeKeyBehavior`. |
| [Angular Material](https://raw.githubusercontent.com/angular/components/main/src/material/chips/chips.md) | main (2026-09)  | `MatChipGrid` + `matChipInput`    | "These elements implement a grid accessibility pattern." `separatorKeyCodes: [COMMA, SPACE]`, `addOnBlur`, `editable`, `matChipRemove` on a `button`. |
| [PrimeNG](https://primeng.org/multiselect)                                                         | 20.x (2026-09)  | `MultiSelect`                     | `display="chip"`, `selectionLimit`, `maxSelectedLabels`, `filter`, `group`, `loading`, `virtualScroll`, `showToggleAll`, `showClear`. |

Two specifications sit under all of them and were read the same day:

- [Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — the
  input, its role, `aria-expanded`, `aria-controls`, `aria-activedescendant`,
  `aria-autocomplete`, and both key tables. Its own note says a combobox "is a
  single-select widget where selection follows focus in the popup", which every
  implementation above contradicts and which §4 of the design document costs out.
- [Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/), the **layout
  grid** half. It names this exact control: "a list of recipients for a message
  may be a grid where each cell contains a link that represents a recipient. The
  grid may initially have a single row but then wrap into multiple rows as
  recipients are added." Its keyboard table is the chip row's.

Inside this repository, two families already answer part of the question and
were read for the boundary rather than for the survey:

- `select` ships `multiple` with a chip row **above** its control
  (`packages/react/src/select/select-tags.tsx`), because its control is a
  `button` and a button cannot contain the remove button a chip needs. Its
  contract declines `chips`, `creation`, limits, duplicates, reorder and paste
  to this family by name.
- `combobox` declines `multiple` outright, for the reason its contract records:
  "a combobox that also held a set would be that family with a different name,
  and the two would then answer `Backspace` differently."

## 2. Table stakes

Every capability two or more surveyed implementations ship.

| Capability                                                 | Who ships it                                                   | Verdict              | Reason                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chosen values as removable chips inside the control        | Base UI, Mantine ×2, Ark, Material, PrimeNG, React Aria        | adopt                | §6 asks for it by name. The chip is a `tag` worn as `data-ui`, the way `select`'s row already does, so the chip a reader removes here is the chip they know from everywhere else and its geometry is stated once.                                              |
| Free text that becomes a value (creation)                  | Zag, Ark, Mantine `TagsInput`, Material `matChipInput`         | adopt                | §6 asks for "criação". `combobox.creation` reports the offer and lets the consumer add it, because only the consumer's collection can grow; here the value is added to the family's own set as well, because the set *is* the value.                            |
| Suggestion popup, filtered by the query                    | Base UI, Mantine ×2, PrimeNG, Material (+ `MatAutocomplete`)   | adopt                | §6 says "busca/criação opcional". The popup is the `listbox` `select` and `combobox` already draw, with `aria-multiselectable`.                                                                                                                                 |
| Maximum number of values                                   | Zag (`max`, `allowOverflow`), Mantine (`maxTags`/`maxValues`), PrimeNG (`selectionLimit`) | adopt   | §6 asks for "limite". Zag's `allowOverflow` — accept past the limit and mark the control invalid — is the second half nobody else has, and it is what makes the limit a *validation* rather than a silent refusal.                                              |
| Duplicate policy                                           | Zag, Mantine (`allowDuplicates`, `isDuplicate`)                | adopt                | §6 asks for "duplicatas". The comparison is locale-sensitive here, because `@slotted/core/collection` already owns a collator and §2.9 refuses an assumed English normalisation — which is what `isDuplicate` exists to work around in Mantine.                 |
| Paste splitting one string into many values                | Zag (`addOnPaste` + `delimiter`), Mantine (`splitChars`)       | adopt                | §6 asks for "paste de múltiplos valores".                                                                                                                                                                                                                     |
| Delimiter keys that commit the typed text                  | Zag (`delimiter`), Mantine (`splitChars`), Material (`separatorKeyCodes`) | adopt      | The same list serves the key and the paste split in all three, and separating them would let a control accept `a,b` from the clipboard and refuse it from the keyboard.                                                                                        |
| `Backspace` removes only from an empty input               | Zag, Mantine, Base UI, Material                                | adopt                | §6 states the rule: "Backspace remove apenas com input vazio e regra previsível". The predictable rule is two presses — the first highlights the last chip, the second removes it — which is what stops a reader losing a value while correcting a typo.        |
| Arrow navigation across the chips                          | Zag (`ArrowLeft`/`ArrowRight`), React Aria (grid), Material (grid) | adapt             | Adopted as the layout-grid keyboard table rather than as two literal keys, because the row wraps: `ArrowDown` and `ArrowUp` have to work once there are two rows, and `Home`/`End` have to exist. Zag has neither.                                             |
| `Delete` / `Backspace` removes the chip that holds focus   | Zag, React Aria, Material                                      | adopt                |                                                                                                                                                                                                                                                              |
| Editing a chip in place                                    | Zag/Ark (`editable`, `Enter` or double click), Material (`editable`) | adopt          | `docs/history/designs/2026-09-02-tag-family-design.md` deferred the editable chip to this family by name: "an editable chip is a text field wearing a chip, and it needs the field's validity, its commit-and-revert keys and its own state model."           |
| Clear all                                                  | Mantine (`clearable`), PrimeNG (`showClear`), Zag (`clearTrigger`) | adopt             | Same control `select` and `combobox` draw, same `clear` reason.                                                                                                                                                                                               |
| Hiding options already chosen                              | Mantine (`hidePickedOptions`), PrimeNG (via `display`)         | adapt                | An axis rather than a boolean: `chosenOptions: 'show' \| 'hide'`. Showing them with a checked mark is the better default for a short list and hiding them is the better one for a long list, and neither is a defect of the other.                              |
| Groups and sections in the list                            | Base UI, Mantine, PrimeNG                                      | adopt                | Already the shape `listbox`, `select` and `combobox` share.                                                                                                                                                                                                   |
| Loading and empty states in the popup                      | Base UI, Mantine, PrimeNG                                      | adopt                | The `skeleton` rows and the `status` live region `select` already draws.                                                                                                                                                                                       |
| A value that cannot be removed                             | Zag (`data-disabled` on an item), Material                     | adopt                | A chip carrying `data-disabled` keeps its place, keeps its label, is skipped by `Backspace` and draws no remove control.                                                                                                                                       |
| Form submission of several values under one name           | Zag, Material (`MatChipGrid` as a form control), PrimeNG        | adopt                | One hidden `input` per value in React; `ControlValueAccessor` plus `Validator` in Angular.                                                                                                                                                                     |
| Blur commits or discards the pending text                  | Zag (`blurBehavior`), Mantine (`acceptValueOnBlur`)            | adopt                | An axis, `commitOnBlur`, with the same two answers.                                                                                                                                                                                                            |
| Validating a typed value before it becomes a chip          | Zag (`validate`), Mantine (`isDuplicate` + `onDuplicate`)      | adopt                | One predicate, `validateValue(text, values) => boolean`, and one request carrying why it was refused: `duplicate`, `limit`, `invalid`.                                                                                                                          |
| Overflow of the chip row                                   | PrimeNG (`maxSelectedLabels`), `select` (`createCollapse`)     | adapt                | §6: "Overflow resume seleção sem ocultar acesso ao conjunto completo". The row wraps to a bounded number of lines and scrolls past it — the whole set stays reachable — and the collapsed `+N` is the second answer, for a control that must stay one line high. |
| Marking the matched span of a suggestion                   | Base UI, Mantine, PrimeNG                                      | adopt                | `matchRanges` and the `match` part `combobox` already owns.                                                                                                                                                                                                    |
| A multi-selectable listbox popup                           | Base UI, Mantine ×2, PrimeNG                                   | adopt                | `aria-multiselectable`, `aria-selected` per option, selection not following focus. This contradicts the combobox pattern's own note and is costed in §4 of the design document.                                                                                 |
| Virtualization of a long list                              | PrimeNG (`virtualScroll`)                                      | defer to `collection` | §2.10 makes virtualization a capability of the collection engine rather than a parallel component. `listbox` already reads `window` from it and this family reads the same.                                                                                     |
| Select all / toggle all                                    | PrimeNG (`showToggleAll`)                                      | decline              | One surveyed implementation, so not table stakes, and it is two lines of consumer code against the imperative handle: `<button onClick={() => ref.current.setValue(items.map((i) => i.value), 'programmatic')}>`. Shipping it would also owe an answer for what "all" means under a limit and under a filter, which the consumer knows and the family does not. |

## 3. Differentiators

The best surveyed implementation is Mantine's pair, because it is the only one
that ships free text and suggestions in the same control with the limit, the
duplicate rule and the paste split all present. What it does not have, and what
this library can offer because of what it already owns:

| Differentiator                                   | What it is                                                                                                                                                                                                                                                                                                | Why only here                                                                                                                                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reorder of the chosen values, by keyboard first  | `Alt` + arrow moves the chip that holds focus one place along the row, and the announcement says where it landed. §6 asks for "reorder" and **none of the eight** ships it: Zag, Ark, Mantine, Base UI, PrimeNG and Material have no reorder at all, and React Aria's exists only as a pointer drag bolted on through `useDragAndDrop`. | §2.8 requires that drag-and-drop have a keyboard alternative. Building the alternative first, and the drag second, is the only order in which the alternative is not an afterthought. The pointer drag is deferred, with its reason, in §4. |
| Arrow keys that follow the writing direction     | Over the chips, `ArrowRight` moves toward the end of the row in `ltr` and toward the start in `rtl`.                                                                                                                                                                                                        | Zag binds `ArrowLeft`/`ArrowRight` to previous/next literally, and Material's chip grid does the same, so in an Arabic or Hebrew document the chips walk backwards. The library already answers `dir` in every family.                     |
| A limit that is a validity, not a silence        | Past the limit the control marks itself invalid and reports `limit` with the values that were refused, rather than dropping them.                                                                                                                                                                           | Zag has the mechanism (`allowOverflow`) and no validator; Angular gets a real `Validator` here, so a Reactive Form sees `tooMany` without the consumer writing one.                                                                        |
| The overflow count is measured                   | The `+N` is whatever `createCollapse` reports, so the count and the screen cannot disagree.                                                                                                                                                                                                                | PrimeNG's `maxSelectedLabels` is a number the consumer declares in advance, which is wrong the moment the control is narrower than the consumer assumed.                                                                                   |
| Three schemes and three densities on a chip row  | The chip is a `tag`, and `tag.css` already floors its remove control at `--slotted-target-min` per density.                                                                                                                                                                                                 | Every surveyed implementation has one scheme's palette and one density.                                                                                                                                                                    |

## 4. Gaps

What no surveyed implementation handles well and a real product still hits.

| Gap                                                        | What happens elsewhere                                                                                                                                                            | What this family does                                                                                                                                                                              |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where focus goes after a chip is removed                   | Zag moves focus to the input, which is right; React Aria moves to the next tag; Material leaves it on a button that no longer exists, and the page loses focus to `body`.          | The chip that took the removed one's index, then the previous one, then the input. §2.8: focus "nunca é perdido após remoção de item". `listbox` already states the same rule for a filtered option. |
| What is announced when a value leaves                      | React Aria announces the removal. Nobody announces what remains.                                                                                                                  | One live message with both facts — the label that left and the count that is left — because a reader who removed the wrong chip needs the count to know they did.                                   |
| Reaching the limit                                         | PrimeNG stops selecting silently. Mantine hides the popup. Zag marks the control invalid and says nothing.                                                                        | `data-full` on the root, the offer row withdrawn, the options marked `aria-disabled`, and one announcement. A control that silently ignores a press is a control the reader presses again.          |
| A duplicate that was typed rather than chosen              | Mantine's default drops it with no feedback; `onDuplicate` exists because the silence is a defect.                                                                                | The existing chip is marked `data-current` for the length of one motion-scale duration, and the announcement names it. The reader's value is already there and the control says where.              |
| Pasting more values than the limit allows                  | Undefined in all eight. Zag's paste path runs the same `validate` per value and stops; Mantine takes them all.                                                                    | Take up to the limit in order, and report the rest in one request carrying `limit` with the refused values, so the consumer can say what happened.                                                  |
| One unbroken 60-character token as a value                 | Mantine and PrimeNG let the chip push the control wider than its column.                                                                                                          | The chip's label truncates at the row's width and stays readable in full to assistive technology, which is the rule the briefing already fixed: truncation never removes content from the DOM.      |
| A translated remove label on forty chips                   | Every implementation writes `Remove {label}` once per chip, which is correct and is also forty near-identical strings in the accessibility tree.                                   | The same string, and the count in the row's own `aria-label`, so a reader who lands on the row hears how many there are before hearing forty of them.                                               |
| The pending text when the popup closes                     | Base UI keeps it, Mantine clears it, Zag commits it. Three answers, none documented as a decision.                                                                                | An axis, `commitOnBlur`, and the query cleared on commit — the two behaviours written down and testable rather than inherited.                                                                       |

## 5. What this family takes from `select`, and what it does not

`select` already ships a removable chip row, so the boundary is not "chips".
It is the control element, and everything follows from it.

| | `select` | `multi-select` |
| --- | --- | --- |
| The control | a `button` | a frame containing a real `input` |
| Where the chips are | **above** the control, because a button cannot contain another button | **inside** the control, beside the caret, which is what every surveyed implementation draws |
| Text | never received; the optional search field lives inside the popup | typed into the control itself, and it can become a value |
| Backspace | nothing | the rule §6 names |
| Reorder, limit, duplicates, paste, creation | declined to this family | here |

A consumer who needs a set of known options and no typing keeps `select`. A
consumer who needs the reader to type reaches here. Neither is the other with a
flag, which is the same line `combobox` drew against `select`.

## 6. Exit

Nothing in §6 of the feature guide is unanswered, every capability two surveyed
implementations ship has a verdict, the one decline names the composition that
replaces it, and the one defer names the module and the wave.
