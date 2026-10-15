# Loading overlay capability inventory

Produced before the family was designed or coded, as
`.claude/skills/component/references/capability.md` requires. The family is new:
`specs/components/loading-overlay/` does not exist, and no `loading-overlay`,
`block-ui` or `backdrop` source is present under `packages/`.

`docs/process/build-order.md` carries the family as a bare line — “7. `loading-overlay`”
— with no scope paragraph, so the scope is derived from
`docs/component-features.md` §9 _Loading Overlay_ and §2, as
`docs/build-briefing.md` directs. §6 writes the scope paragraph this inventory
produces; it is the paragraph that goes back into `docs/process/build-order.md`.

`docs/product/prd.md` names no requirement for this family. Its two relevant general
rules are §15, which asks that `loading` mean the same thing everywhere in the
library, and §14, which keeps internal DOM out of the contract.

The invocation names one question and it is answered in §5: the boundary with
`skeleton` and with `progress-indicator`.

Sources were read on 10 September 2026.

---

## 1. Surveyed

Ten sources, chosen so they disagree: three that ship the family under three
different names, a raw dimming primitive that refuses to be the family, a
design system, the platform's own specification, and a headless library that
ships nothing at all.

| Source                                                                                                 | Name there        | Shape                                                                               |
| ------------------------------------------------------------------------------------------------------ | ----------------- | ----------------------------------------------------------------------------------- |
| Mantine, `LoadingOverlay` (mantine.dev/core/loading-overlay)                                           | `LoadingOverlay`  | A sibling absolutely positioned over a parent the consumer must make `position: relative` |
| Ant Design v6.6.3, `Spin` (ant.design/components/spin)                                                 | `Spin`, embedded  | One component that is both the spinner and, when given children, the overlay over them |
| PrimeNG, `BlockUI` (primeng.org/blockui)                                                               | `BlockUI`         | A wrapper whose child is the blocked element; the document is the default target      |
| Element Plus, `v-loading` / `ElLoading` (element-plus.org/en-US/component/loading.html)                | `Loading`         | A directive on the covered element, and an imperative service returning a handle      |
| Quasar, `QInnerLoading` (quasar.dev/vue-components/inner-loading)                                      | `QInnerLoading`   | A child of the covered element, `showing` driven                                      |
| MUI, `Backdrop` (mui.com/material-ui/react-backdrop)                                                   | `Backdrop`        | A dimming layer with no loading semantics; the loader is a child the consumer supplies |
| Carbon, `Loading` (carbondesignsystem.com/components/loading/usage)                                    | `Loading`         | A spinner with an overlay variant that covers the page                                |
| WAI-ARIA 1.2, `progressbar`, `status`, `aria-busy` (w3.org/TR/wai-aria-1.2)                             | —                 | The platform's own answer to “this region is loading”                                 |
| WAI-ARIA APG pattern index (w3.org/WAI/ARIA/apg/patterns/)                                              | —                 | No pattern for this family exists; recorded in §4 of the design                        |
| Radix Primitives component index (radix-ui.com/primitives/docs/overview/introduction)                  | absent            | Thirty components, none of them this one                                              |

Three facts fall out of the survey before a single row is filtered.

**The family has no agreed name and three agreed shapes.** Mantine puts the
overlay beside the content, Ant Design and PrimeNG put the content inside the
overlay component, Element Plus puts the overlay on the content with a
directive. Only the second shape can make the covered content `inert`, because
only it owns an element that wraps the content.

**MUI declines to be this family.** `Backdrop` is documented as a dimming layer
that “narrows the user's focus”, and its own example composes a
`CircularProgress` child and an `onClick` that closes it. It is the raw
material, not the family, and it is surveyed here because a library can decide
to ship only the raw material — this one does not, and §3 says why.

**The two implementations that document accessibility document their own
failure.** Quasar's note, added in v2.25, states that “the content it covers
stays in the accessibility tree and remains focusable, and the loading state
itself is never announced”, then asks the developer to set `aria-busy` or
`inert` themselves. Mantine's usage section states that “elements under the
overlay are still focusable with the keyboard, so remember to add additional
logic to handle this case.” PrimeNG is the only surveyed implementation that
writes `aria-busy` itself, and it announces nothing. That is the gap in §4 and
the reason this family exists rather than a documentation page telling a
consumer to position a `div`.

---

## 2. Table stakes

| Capability                                                | Who ships it                                                    | Verdict                    | Reason                                                                                                                                                                                                                          |
| --------------------------------------------------------- | --------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cover one region and keep its geometry                    | Mantine, Ant, PrimeNG, Element Plus, Quasar                     | adopt                      | The family's whole purpose: the region keeps its height, so nothing below it moves. It is the default scope.                                                                                                                     |
| Cover the whole page                                      | Ant (`fullscreen`), Element Plus (`fullscreen`), PrimeNG (document target), Carbon (overlay), MUI | adopt                      | Five of seven. It composes `@slotted/core/dismissable-layer` in modal mode, which already writes `inert` on every body sibling and locks the scroll — see §3.                                                                     |
| A tinted wash over the content                            | all seven                                                       | adopt                      | `--slotted-scrim` already exists in the foundation and is restated per scheme; `dialog` and `drawer` consume it.                                                                                                                 |
| A spinner centred in the covered area                     | all seven                                                       | adapt                      | The mark is not this family's to draw: the `indicator` part's default is `progress-indicator`'s `loader`, and the part is replaceable. §5 holds the boundary.                                                                    |
| A short line of text under the spinner                    | Ant (`description`), Element Plus (`text`), Quasar (`label`), Carbon | adopt                      | `label`, and a second `description` line, because Ant deprecated `tip` in favour of `description` after finding one line was not enough.                                                                                          |
| Visibility driven by one boolean the consumer owns        | all seven                                                       | adopt                      | `loading`. It is deliberately not a mutable capability — see §3, _What is not a state model_.                                                                                                                                    |
| A delay before anything is painted                        | Ant (`delay`)                                                   | adopt                      | One surveyed implementation ships it, so it is not table stakes by the two-implementation rule; it is adopted anyway because `@slotted/core/loading` already holds the rule and `skeleton` and `progress-indicator` already read it. |
| Replaceable spinner                                       | Ant (`indicator`), Element Plus (`spinner`, `svg`), Mantine (`loaderProps`) | adopt                      | The `indicator` part takes `render` in React and a projected slot in Angular.                                                                                                                                                    |
| A size scale                                              | Ant, Carbon                                                     | adopt                      | `sm`, `md`, `lg`, matching `progress-indicator`'s own scale so a replaced indicator is the same size as the default one.                                                                                                          |
| Blur the covered content                                  | Mantine (`overlayProps.blur`), Ant (embedded mode blurs its child) | adapt                      | An axis, `veil`, rather than a numeric blur radius: `wash`, `blur`, `none`. A number would be a second scale in the component layer, which `docs/token-foundation.md` refuses.                                                    |
| Scroll lock while the page is covered                     | Element Plus (`lock`), PrimeNG                                  | adopt                      | Page scope only, from `@slotted/core/dismissable-layer`. A region-scoped overlay that locked the document scroll would block reading the rest of the page for a local wait.                                                       |
| Colour of the wash as a free value                        | Element Plus (`background`), Mantine (`overlayProps.color`)     | decline                    | `docs/component-features.md` §2.4 refuses arbitrary colour in the agnostic contract. A theme retunes `--slotted-loading-overlay-scrim`; an instance that needs another wash sets that custom property, which is two lines of consumer CSS and not a prop. |
| Custom class and inline style hooks                       | Element Plus (`customClass`), Ant (`classNames`, `styles`)      | decline                    | `data-ui` and `data-part` are the library's selectors, and `docs/state-and-events.md` records why a class is not contract. The composition surface is the parts, which is more than either offers. |
| An imperative service that opens an overlay from anywhere | Element Plus (`ElLoading.service`)                              | defer to `toast`, wave 6   | A facade that creates a layer from a call site is `toast`'s shape and `toast` already ships it. A second family owning a second imperative queue would be two answers to one question. A consumer who wants one writes it over this family's declarative form, which is what `toast`'s own host does. |
| A numeric progress inside the overlay                     | Ant (`percent`)                                                 | decline                    | One implementation, and the family that owns a measured quantity already exists. `<ProgressIndicator value={n} />` inside the `indicator` part is the whole of it: `<LoadingOverlay loading indicator={<ProgressIndicator value={62} />} />`. §5 holds the boundary. |
| `beforeClose` veto and `closed` callback                  | Element Plus                                                    | decline                    | `loading` is the consumer's own fact and the family never moves it, so there is nothing to veto. The moment the covered content becomes reachable again is real and is reported — `onReveal`, adopted from `skeleton`, which reports the withdrawal rather than the prop. |
| `aria-busy` on the covered region                         | PrimeNG                                                         | adopt                      | ARIA 1.2 asks the author to set it on the container before the first change and clear it when the last change is complete. `skeleton`'s region already does this and this family writes it on the same part name.                 |
| Announce the wait                                         | none of the seven                                               | adopt                      | Not table stakes — it is the gap in §4 — but it is listed here because `skeleton` already ships it and a second answer would be a contradiction inside one library. Same `live` axis, same single `role="status"` element, same rule that an ended wait empties the region rather than replacing it. |

### What is not a state model

`loading` holds no controlled/uncontrolled pair and emits no request, and the
decision is deliberate. The value is the consumer's own fact — whether the data
has arrived — and a family that could move it would render a reachable region
while the request was still in flight. It is the desync `removable` and
`measurement` are already declared immutable to prevent, and `skeleton` and
`progress-indicator` both hold `loading` the same way.

Cancellation does not change that. The reader presses Cancel, the family emits
a request carrying a reason, and the consumer aborts its own work and lowers
`loading`. A family that hid itself on the press would be claiming the
operation had stopped before it had.

---

## 3. Differentiators

| Capability                                                                  | Who has it | Why this library can                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The covered content is actually unreachable                                 | none       | `inert` on the `content` part in region scope, and `dismissable-layer` in modal mode in page scope. Both are already written and tested: `dialog.page.test.tsx` holds the second. `inert` has been Baseline widely available since April 2023 (MDN), so the capability the two documented implementations decline is available to every browser they support. |
| Focus is moved out of the region before it is made inert, and put back after | none       | Making an element inert while it holds focus drops focus to the body, which is the defect none of the seven can have because none of them makes anything inert. `@slotted/core/focus`'s `createFocusScope` already holds both halves — where focus goes in, and where it returns — and `dialog` already uses it for the same two moments. |
| A delay and a minimum duration, shared by both bindings                     | Ant ships the delay only | `@slotted/core/loading` is a pure function both bindings drive, so the overlay reveals at the same moment in React and Angular. A per-binding implementation would differ invisibly, which is the reason the module was put in core when `skeleton` was built.                                                                |
| Cancellation as a first-class part                                          | none       | None of the seven has a cancel affordance, so in all of them a wait that goes wrong is a page the reader has to reload. `docs/component-features.md` §9 asks this family for “cancelamento opcional”, and the `cancel` part is what makes the blocked state escapable — with `Escape` bound to it, and only bound when the part is present. |
| Three schemes, three densities and a mirrored layout, from the foundation   | none       | The wash is `--slotted-scrim`, already restated per scheme and already answered under forced colours by the theme. The panel's geometry is logical, so an RTL page mirrors the label beside the spinner without a rule of its own.                                                                                          |
| The panel sheds its text when the region is too small to hold it            | none       | A container query on the root. Every surveyed implementation centres a fixed panel and lets it spill: a 32-pixel-tall table row covered by Ant's embedded `Spin` draws the spinner and the description outside the row. §4 holds the case.                                                                                  |

---

## 4. Gaps

| What a real product hits                                                             | What the field does                                                                                                     | What this family does                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The reader was typing in the form when the save started                              | Nothing. Mantine and Quasar both document that focus stays where it was, on a control the reader can no longer see moving | Focus is read before the content goes inert. If it was inside, it moves to the panel — the `cancel` button when there is one, the panel itself when there is not — and returns to the original element, or its nearest connected ancestor, when the wait ends. |
| A screen-reader reader gets no signal that anything is happening                      | Nothing. Quasar tells the developer to pass `role="status"` themselves; PrimeNG writes `aria-busy` and no text            | One `role="status"` element inside the layer, holding one sentence for the whole region, emptied rather than replaced when the wait ends. `aria-busy` on the root alongside it.                                                                |
| The region is a 32-pixel table row, or a 240-pixel card                              | The panel overflows the region                                                                                          | A container query on the root: under the threshold the panel keeps the indicator and drops the text, and the text stays in the announcement, which is the copy that was carrying the meaning.                                                 |
| The wait is 80 milliseconds and the overlay flashes                                  | Ant's `delay` only                                                                                                       | `delay`, and `minDuration` for the reverse flash — an overlay that appeared and is taken away 30 milliseconds later.                                                                                                                          |
| The operation never finishes                                                         | Nothing; the page has to be reloaded                                                                                     | `cancel`, and `Escape` bound to it when it is present.                                                                                                                                                                                       |
| The label is a long translated string                                                | It is centred and allowed to spill                                                                                       | The panel is bounded by the region's inline size, the text wraps, and the panel scrolls rather than growing past the region when it still does not fit.                                                                                       |
| Two overlays nest — a page-scoped save over a region-scoped one                       | Element Plus counts references on the same target; the others stack two washes and two spinners                          | Page scope takes a layer depth from `dismissable-layer`, so the page wash sits above the region wash and only the topmost layer answers `Escape`. Two washes is the honest picture of two waits; what is refused is two of them answering one key. |

---

## 5. The boundary the invocation asked for

Three families in §9 of `docs/component-features.md` paint a wait, and the
sentence that separates them is in the guide itself: “Não use spinner para
conteúdo com estrutura conhecida: prefira Skeleton.”

- **`skeleton`** stands **in place of** content that has not arrived. There is
  nothing under it. It reserves the geometry the content will have, and the
  reader has never seen the content.
- **`loading-overlay`** covers content that is **already there** and must not be
  touched. The geometry is the content's own, and the reader has seen it — which
  is why the content stays in the DOM, stays measured, and goes `inert` rather
  than being replaced.
- **`progress-indicator`** is the **mark**, not the layer. It draws a
  determinate bar, a circle, or an indeterminate loader, and it has no opinion
  about what is underneath it.

So the three compose in one direction and never overlap: `loading-overlay`
renders a `progress-indicator` in its `indicator` part, and a consumer who wants
a determinate wait passes one with a value. `skeleton` and `loading-overlay` are
mutually exclusive on the same content by definition — content cannot be both
absent and covered — and the family that gets it wrong is caught by a sentence
in each reference page rather than by a rule in code.

The one place the boundary is genuinely thin is the second load of a list that
already has rows. Both answers are defensible and the guide's own rule decides
it: the structure is known and the reader has already seen it, so the rows stay
and the overlay covers them. A skeleton there would take away rows the reader
was reading, which is the layout shift both families exist to prevent.

`progress-indicator`'s `placement: page` axis is not a collision. It is the thin
bar across the top of a page — a track with no wash and nothing blocked — and it
is the right answer for a wait that does **not** block. The two answer opposite
questions about the same page.

---

## 6. Scope paragraph

This is the paragraph the family delivers, and it goes into
`docs/process/build-order.md` in place of the bare line, as `docs/build-briefing.md`
requires when a family's scope has not been written.

> `loading-overlay` — cobre conteúdo que já está na página e não pode ser
> tocado, preservando a geometria da região. Nove partes — `root`, `content`,
> `scrim`, `panel`, `indicator`, `label`, `description`, `cancel` e
> `announcement` — e os eixos `scope` (`region`/`page`), `veil`
> (`wash`/`blur`/`none`), `size` e `live`. `loading` é fato do consumidor e não
> tem modelo de estado: a família nunca o move, pela mesma razão que
> `removable` não é mutável. O que está coberto fica `inert` em escopo
> `region`; em escopo `page` a camada compõe `@slotted/core/dismissable-layer`
> em modo modal, que já escreve `inert` nos irmãos do `body` e trava a rolagem.
> O foco é lido antes de a região ficar inerte e devolvido quando a espera
> termina — o defeito que Mantine e Quasar documentam e não resolvem. `delay` e
> `minDuration` vêm de `@slotted/core/loading`; o anúncio é um único
> `role="status"` com a mesma regra do `skeleton`. `cancel` é opcional e, quando
> existe, `Escape` pede o cancelamento; a família emite a requisição e não se
> esconde sozinha. Inventário em
> `docs/history/designs/2026-09-10-loading-overlay-capability-inventory.md`.

---

## 7. Exit condition

A reader who knows this family from Mantine, Ant Design, PrimeNG, Element Plus
or Quasar can point at one thing not answered above: the free-form colour of the
wash, declined in §2 with the two lines that replace it. Everything else those
five ship is adopted, adapted, or deferred to a named family.
