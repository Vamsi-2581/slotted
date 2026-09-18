# Result State capability inventory

Produced before the family was designed or written, as
`.claude/skills/component/references/capability.md` requires. The family is
new: `docs/process/build-order.md` lists `result-state` as item 8 of wave 4, mode
`consolidar`, and its scope paragraph is one sentence — "cobre empty e error na
mesma família visual com semânticas distintas (guia 17)". Nothing named
`empty-state` or `error-state` exists in this repository, so there is no prior
implementation to read and no delta to name.

Sources were read on 3 September 2026.

---

## 1. Surveyed

| Implementation                      | Called                                                       | Read at                                                                                            |
| ----------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Ant Design 6.6.2                    | `Result`, and `Empty` as a separate family                   | <https://ant.design/components/result>, <https://ant.design/components/empty>                       |
| Shopify Polaris (source, `main`)    | `EmptyState`                                                 | `polaris-react/src/components/EmptyState/EmptyState.tsx` on GitHub                                  |
| Atlassian `@atlaskit/empty-state` 8 | `EmptyState`                                                 | `dist/types/types.d.ts` on unpkg                                                                    |
| GitHub Primer                       | `Blankslate`                                                 | <https://primer.style/components/blankslate>                                                        |
| Adobe React Spectrum v3             | `IllustratedMessage`                                         | <https://react-spectrum.adobe.com/react-spectrum/IllustratedMessage.html>                           |
| Chakra UI v3                        | `EmptyState` — `Root`, `Content`, `Indicator`, `Title`, `Description` | <https://chakra-ui.com/docs/components/empty-state>                                         |
| IBM Carbon                          | Empty states — a pattern, with no component                  | <https://carbondesignsystem.com/patterns/empty-states-pattern/>                                     |
| WAI-ARIA Authoring Practices        | no pattern for this family                                   | <https://www.w3.org/WAI/ARIA/apg/patterns/>                                                         |
| WCAG 2.2, Understanding SC 4.1.3    | Status Messages                                              | <https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html>                                  |

The set disagrees on three things.

**What the family is called, and how many families it is.** Ant ships two —
`Empty` for an absent collection and `Result` for the outcome of an operation —
and the two share no part, no axis and no token. The other five ship one, and
Atlassian's own documentation gives a 404 as its first example, which is a
`Result` case inside an `EmptyState` component. The guide's section 17 already
decided this for the library: `empty-state` and `error-state` become one visual
family with distinct semantics.

**Whether the semantic is a value or a picture.** Ant makes it a `status`
prop of seven values that picks a colour and a mark. Every other implementation
makes it a picture the consumer supplies, and holds no vocabulary at all:
Polaris requires an `image` URL, Atlassian takes `imageUrl` or `renderImage`,
Primer takes any node in `Blankslate.Visual`, Spectrum takes an illustration
from a separate package. Carbon, which ships no component, is the one source
that writes the vocabulary down — no data, no results, permissions, systems,
configuration — and leaves the implementation to the product.

**Nothing announces.** None of the seven writes a live role, an `aria-live`
attribute or a role of any kind on the region. Chakra and Primer render a bare
`div`; Polaris renders a `div` inside a `Box`; Ant renders a `div`. Meanwhile
WCAG 2.2's Understanding document for SC 4.1.3 names this family's own text as
its example of a status message: "brief text messages displayed about the
completion or status of the search, such as 'Searching…', '18 results returned'
or 'No results returned' would be status updates if they do not take focus or
cause a page refresh."

The three headless libraries — Radix Primitives, Base UI and React Aria — ship
no such component. That is a fact about this family rather than an omission:
it holds no mutable value, no keyboard model and no focus model, so there is
nothing for a behaviour library to hold. It is also why the state model this
library requires of every mutable capability is empty here, and why the
capability that decides whether the family is worth shipping is the one none of
the seven has: what a reader who cannot see the region hears when it appears.

## 2. Table stakes

Every capability two or more surveyed implementations ship.

| Capability                                            | Who ships it                                                                    | Verdict             | Reason                                                                                                                                                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A visual above the text — glyph or illustration       | all seven; Carbon anatomy item 1                                                | adopt               | The `media` part. It holds the status's own mark, and the consumer's artwork replaces it in place, keeping the box, the size and the position.                                                                                     |
| Title                                                 | all seven; Carbon anatomy item 2                                                | adopt               | The `title` part, and the name the region is labelled by.                                                                                                                                                                          |
| Description or body                                   | all seven; Carbon anatomy item 3                                                | adopt               | The `description` part.                                                                                                                                                                                                            |
| Primary action                                        | Polaris `action`, Atlassian `primaryAction`, Primer `PrimaryAction`, Ant `extra`, Chakra children, Carbon item 4 | adopt               | The `actions` part. What goes in is the consumer's own `Button`, because `button` already owns what a button is.                                                                                                                   |
| Secondary action                                      | Polaris, Atlassian, Primer, Carbon item 5                                       | adopt               | The same part. The family arranges two controls; it does not wrap them.                                                                                                                                                            |
| A third row below the actions                         | Polaris `footerContent`, Atlassian `tertiaryAction`                             | adopt               | The `footer` part, for the documentation link that is not a call to action.                                                                                                                                                        |
| A semantic that picks the mark and the colour         | Ant `status` (7 values), Carbon's five written types                            | adopt               | The `status` axis, seven values, each with its own tone and its own silhouette.                                                                                                                                                    |
| A width or size variant                               | Primer `size` + `narrow` + `spacious`, Atlassian `width`, Polaris `fullWidth`    | adapt               | Becomes `reach` — `inline`, `section`, `page` — the axis `alert` already speaks, because the question is which scope the message applies to and the geometry follows from that. A size axis would say the same message can be drawn large or small. |
| A maximum measure for the text                        | Polaris (`400px`, or `100%` under `fullWidth`), Atlassian `width: narrow`        | defer to `container` | `docs/build-briefing.md` records the decision: measure belongs to `container` and to it alone, and two families offering a maximum measure would be two answers to one question. The consumer writes `<Container size="sm">` around the region. |
| Control over the title's heading level                | Atlassian `headingLevel` (1–6, default 4), Primer `Blankslate.Heading` `as`      | adapt               | The element is the consumer's own — React's `render`, and in Angular the directive written on `<h2>`. A numeric prop invites a skipped level, which the guide's section 10 forbids, and only the page knows whether the region is a heading at all. |
| Explicit image dimensions, to stop the layout jumping | Atlassian `imageWidth`/`imageHeight`/`maxImageWidth`/`maxImageHeight`, Polaris's skeleton behind the image | adapt               | The media box takes its geometry from the reach, so a raster illustration that has not loaded reserves the same space it will occupy. Four props and a loading state become none.                                                    |
| A loading state on the actions                        | Atlassian `isLoading`                                                           | defer to `button`    | `button` ships `loading` on all four of its members. A retry that is in flight is `<Button loading>Try again</Button>` inside `actions`.                                                                                            |
| A skeleton while the region loads                     | Polaris (skeleton image), Atlassian (`isLoading`)                                | defer to `skeleton`  | The guide's section 9 is explicit: content with a known structure gets a skeleton, not a spinner and not this family. A region that is loading is not a region with a result.                                                       |
| A frame or border around the region                   | Primer `border`                                                                 | decline             | `card` owns the frame, with three fills and its own padding scale. A result state inside a card is `<Card><ResultState …/></Card>`, which is two lines and no new axis.                                                              |
| Per-part class and style overrides                    | Ant `classNames` / `styles`                                                     | decline             | `data-part` is the public selector this library guarantees, enforced by `packages/styles/src/identity.test.mjs`. A class hook would be a second, unstable answer to the same question.                                              |
| A test identifier prop                                | Atlassian `testId`                                                              | decline             | Native attributes reach the element they belong on, and `data-testid` is one of them.                                                                                                                                              |
| An accessible name for the action group               | Atlassian `buttonGroupLabel`                                                    | defer to `button-group` | Two controls side by side are a `button-group` when they need a name; the `actions` part is a plain row and names nothing.                                                                                                        |

## 3. Differentiators

What the best of the seven offers that the others do not, and what this library
can offer because of what it already owns.

| Capability                                                                | Where it comes from                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The text announces itself, and it is the only part that does              | WCAG 2.2 SC 4.1.3 names "No results returned" as a status message, and none of the seven writes a live role. `live` — `off`, `polite`, `assertive` — is the axis `alert` and `inline-message` already speak, and the role goes on `content`, which holds the title and the description alone. The actions and the footer are its siblings, because MDN's `alert` role reference states the role "should only be used for text content, not interactive elements such as links or buttons". |
| It defaults to announcing                                                 | `alert` defaults to `off`, because the APG records that a message already present at load is not announced. A result state is by definition the outcome of an operation, so the default here is `polite` — the one place the two families disagree, and the reason is written into the contract test.                          |
| A region a reader can jump to                                             | The root is a `section` labelled by its own title, which makes it a `region` landmark. Primer, Chakra, Polaris and Ant all render an unlabelled `div`.                                                                                                                                                                        |
| Seven statuses, seven silhouettes                                         | Under `forced-colors` every tone ground collapses to one system colour and the shape is all that is left, and WCAG 2.2 SC 1.4.1 forbids colour as the only signal. Ant colours its marks and ships six; the other six implementations leave the meaning entirely to an illustration the consumer has to draw.                  |
| Three schemes, three densities, RTL and forced colours from one stylesheet | The token foundation. Every surveyed implementation ships one scheme pair at most, and none restates its geometry per density.                                                                                                                                                                                                |
| Defaults set once for an application                                      | A React context provider and an Angular injection token with `provideResultStateDefaults()`. Ant's `ConfigProvider` reaches `Empty`'s image alone; the other six have nothing.                                                                                                                                                |
| `inline` reach, for a table cell                                          | The guide requires a compact state for card, panel and cell, and that illustration must not dominate dense operational screens. At `inline` the family is a row with a mark and one line of text and draws no illustration box at all. Primer's `size="small"` is the nearest, and it stays a centred column.                  |
| `align`                                                                   | Carbon left-aligns its empty states inside data-dense views; the other six centre unconditionally. `align` is `center` or `start`, so both readings are reachable without a second family.                                                                                                                                    |
| The keyboard has somewhere to go                                          | The root carries `tabindex="-1"` and both bindings expose `focus()`, so an application that has just emptied a table can send the reader to the message. None of the seven says where focus goes when the region it replaced held it.                                                                                          |

## 4. Gaps

What no surveyed implementation handles well, and a real product still hits.

| Case                                                                    | The answer here                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A translated title with no break opportunity, in a 240-pixel box        | The text wraps by `overflow-wrap: anywhere` rather than truncating. Nothing is removed from the DOM, which is the briefing's standing decision about truncation.                                                                                     |
| A raster illustration that has not loaded yet                           | The media box holds the geometry the reach gives it, so the title, the actions and the footer do not move when the image arrives. Polaris solves this with a skeleton and a `useEffect`; Atlassian with four props.                                  |
| A result state inside a table cell at `dense`                           | `inline` reach: a row, the status's mark at control-glyph size, no illustration box, no vertical rhythm of its own.                                                                                                                                  |
| The same message announced twice                                        | A consumer whose table is already inside a live region would hear the message twice. `live="off"` is the opt-out, and the reference page says when to reach for it.                                                                                  |
| An action row that does not fit                                         | The family owns a container, and the actions stack and stretch below a literal breakpoint on the box rather than on the window.                                                                                                                      |
| Right-to-left                                                           | Every measure is a logical property. The seven status glyphs carry no direction, so none of them is mirrored — the deliberate opposite of a chevron.                                                                                                 |
| Reduced motion                                                          | The family animates nothing, so there is nothing to collapse. Recorded here so the absence is a decision rather than an oversight.                                                                                                                   |

## 5. What this costs the foundation

Four glyph tokens do not exist and cannot be composed from the ones that do.
Each is one mark, and each is the silhouette that carries a status under
forced colours:

| Token                        | For          | Why no existing glyph stands in                                                                              |
| ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| `--slotted-icon-inbox`       | `empty`      | The collection exists and holds nothing. `--slotted-icon-circle` is the neutral status dot and says nothing about a container. |
| `--slotted-icon-search-x`    | `no-results` | A query returned nothing. No magnifier exists in the scale.                                                   |
| `--slotted-icon-lock`        | `forbidden`  | Permission denied. `--slotted-icon-circle-alert` says something went wrong, which is a different sentence.     |
| `--slotted-icon-cloud-off`   | `offline`    | The network is gone. Nothing in the scale describes a connection.                                             |

Three statuses reuse marks the scale already holds: `not-found` takes
`--slotted-icon-circle-question`, `error` takes `--slotted-icon-circle-alert`,
and `success` takes `--slotted-icon-circle-check` — the same mark `alert`,
`inline-message` and `status-indicator` draw for the same meaning.

Without the four, five of the seven statuses would draw the same circle, and
the family would fail the greyscale reading its own status axis exists to pass.
The addition is presented at the visual gate, where reversing it costs the
stylesheet.

## 6. Shared-tool defect found before the family

`.claude/skills/component/references/stories.md` states that
`specs/story-layout.test.mjs` refuses a `data-layout="stack"` stage for a family
that declares `container-type: inline-size`, and names `collapsible`,
`pagination` and `stepper` as the three that stood one character wide because of
it. That file does not exist. The guard is documented and absent.

`result-state` declares a container, so it is the next family the missing guard
would have caught. The briefing requires a shared-tool defect to be fixed as
part of the work, in its own commit, before the family that found it.
