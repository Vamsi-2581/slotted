# Upload self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` §18. The rubric's scoring rule is followed: for
each dimension, the one change that would most improve it, and whether it was
made.

The family is new. The inventory is
`docs/history/designs/2026-09-10-upload-capability-inventory.md` and the
decisions are `docs/history/designs/2026-09-10-upload-design.md`.

---

## 1. Icons

Every mark is a mask from a glyph token; nothing draws a character. Eight glyphs
were added to the scale and each is argued in `docs/token-foundation.md`:
`upload`, `file`, `trash`, `play`, `pause`, `rotate-ccw` for the region and the
row's controls, then `file-type` and `presentation` when `pdf` split from
`document`. The five marks on one row were chosen against each other — a cross
means *stop this* and a bin means *take it away*, and reusing the cross for both
would have made two controls one control drawn twice.

Under forced colours every mask carries `forced-color-adjust: none`, which
`packages/styles/src/masked-glyph.test.mjs` holds; without it the paint goes and
the empty box stays.

`play` and `rotate-ccw` are not mirrored in a right-to-left document, and the
contract says why: the triangle here means *send this file* rather than *advance
a timeline*, and mirrored it would point back at the name it belongs to.

**Most improving change:** the kind marks were monochrome and the reviewer twice
said the treatment was not a treatment. The chip became a solid tile in the
file's own colour with the mark knocked out of it, and the palette became a
scale of the theme's. **Made.**

## 2. Motion

Three transitions, each on a state change the eye has to follow: the region's
border and ground while a drag is over it, a row's ground while its status
changes, and every inner control's ground on hover and press. All read
`--slotted-control-transition-duration` and `--slotted-control-transition-easing`,
so `prefers-reduced-motion` collapses them with everything else —
`packages/styles/src/motion.test.mjs` refuses a literal.

Nothing loops. The bar's own movement is `progress-indicator`'s, which owns that
decision; a second animation here would have been a second answer to one
question.

The one pair that deliberately does not transition is the row's height when a
message appears: the message spans a grid track of its own, so nothing above it
moves and there is nothing to animate.

**Most improving change:** the tile could fade between its kind colour and the
status colour when a row fails. It was not made — the row's ground, its edge,
its word and its sentence all change at once, and a fourth thing moving on the
same frame is noise rather than information.

## 3. Responsiveness

The root declares `container-type: inline-size` and `container-name:
slotted-upload`, with two literal breakpoints. At 30rem the summary stacks,
because at 420 pixels its control's two words broke across two lines with the
underline broken between them. At 26rem the row's controls drop under the text
and the chip spans both rows, because three controls beside a name at 240 pixels
left the name seven characters.

Read at 240, 420 and 720 pixels in `light`, and at 420 in `dark`,
`high-contrast`, `dense` and `rtl`. The grid layout answers its own width with
`repeat(auto-fill, minmax(9rem, 1fr))` rather than a viewport query.

Because the root is a container, the reference pages take `data-layout="block"`,
which `specs/story-layout.test.mjs` enforces.

**Most improving change:** the `field` variant still puts its meta on one line
with the trigger at 240 pixels, where a long file name truncates hard. It was
not made — the field variant's whole point is a control-height row, and letting
it grow to two lines would make it the shape it exists not to be.

## 4. Refinement

The row was rebuilt twice at the reviewer's reading, and both readings were
right. It is now a grid of three columns and two rows: the chip, the body and
the controls on the first, a failure's sentence spanning the second. So the
marks are centred on the block they are about, and a row that has something to
explain grows downwards and moves nothing.

The size left the name's line and joined the status on a line of its own, which
removed the ragged column of sizes and the three reserved control slots that had
been holding it straight. The bar left the flow and became the row's own bottom
edge, so a row is the same height waiting, sending or done. Every row now carries
a surface and a hairline: before, a file was a naked line of text with icons
beside it and only a failed one had a box.

Nine defects were found by looking rather than by a test, and each is recorded in
the stylesheet beside the rule that answers it: the trigger filling the region at
240 pixels; the size column moving with the control count; the card's controls
stuck to the corner of the picture; an orphaned middot at the start of a wrapped
line; the unsupported stage's tile and sentence centred against different axes;
the viewer's image running past its stage; a name reading `pdf.claim-form` in a
right-to-left page; the chip disappearing into a tinted row; and the first dark
palette's near-black mark on a saturated tile.

**Most improving change, named and then made:** the refused archive turned red
on the one row whose message says archives are not accepted. The rule that had
the status take the tile's colour was reversed, and the measurement that makes it
safe — 4.03 : 1 at worst against a failed row's ground — is now held by a test.

## 5. Tokens

Thirty-three family tokens, every one reaching a foundation token or a family
token that does; `packages/styles/src/tokens.test.mjs` holds the list against
what the stylesheet reads, and `fallbacks.test.mjs` refuses a component token
that falls back to a system colour.

Two foundation changes, both argued in `docs/token-foundation.md`:

- eight glyphs, discussed under Icons;
- the **File kind** scale — nine colours and a foreground, per scheme, in the
  component layer. It is there for the reason Avatar's sizes are: a family met a
  value no semantic token can be retuned to give. The five tones hold no second
  blue and no indigo, and painting a PDF with `danger` would make one tone mean
  the file's kind and the row's failure in a family that draws both at once.
  Twenty-seven pairs are measured in
  `packages/theme-default/test/default-theme.test.mjs` — the tile against the
  page, the white mark against the tile, and the tile against a failed row's
  ground — and the lowest ratio in the scale is 3.30 : 1 against a 3 : 1 floor.

One runtime property, `--slotted-upload-visible-rows`, registered in
`runtime-properties.mjs` with its reason: it is `maxRows`, stated per instance,
and no theme can hold it.

**Most improving change:** `--slotted-upload-card-measure` is a 9rem literal
fallback for the grid's track minimum. It was not made a foundation token —
9rem is a measure this family chose for a thumbnail card, and a scale for it
would be a scale with one consumer.

## 6. Patterns

`references/patterns.md` asks for the applicable APG pattern transcribed item by
item. The index at <https://www.w3.org/WAI/ARIA/apg/patterns/> was read on 10
September 2026 and lists **no upload, no dropzone and no drag-and-drop pattern**.
The contract records that as `patternStatus` and cites the four sources that do
apply, each with what it settles:

| Source | Settles |
| --- | --- |
| `<input type="file">` (MDN) | The control, its keyboard, the accessible name through an enclosing label, form association, `accept`, `multiple`, `capture`, `webkitdirectory` |
| APG Button Pattern | Every per-row control: a real `button`, Enter and Space, an accessible name each |
| WCAG 2.2 SC 2.5.7 | A single-pointer alternative to every dragging action |
| WCAG 2.2 SC 4.1.3 | A status change reaching assistive technology without taking focus |

What the platform supplies is not rewritten: the picker, Enter and Space on the
focused control, the accessible name, `disabled` leaving the tab order,
`required` and `:invalid`, the `FileList`, form reset, and `capture` choosing a
camera. What the family adds is listed against it in the design document.

**Most improving change:** the APG has no pattern to check against, so there is
no keyboard table to transcribe — the contract's own five-row table is the
substitute. It was made as well as it can be; a reader who wants the pattern
finds the sentence saying it does not exist.

## 7. Accessibility

The accessible name comes from a `<label>` around the **trigger** rather than
around the region, so it is three words instead of every word in the box, and
the guidance reaches the input as `aria-describedby`. The wave-2 family put the
label around the region and had to write a warning telling the next author to
keep the region's text short; a warning a reader has to obey is a defect with
documentation on it.

The input is clipped, never `display: none` — it stays in the tab order and in
the accessibility tree, which is the whole reason the pairing exists. The ring is
drawn on the trigger through `:has(:focus-visible)`, and the one the browser
would draw on the clipped input is suppressed, which
`packages/styles/src/focus-ring.test.mjs` requires of a family that moves its
ring.

Drag and drop is pointer-only and cannot be made otherwise; SC 2.5.7 is answered
by the trigger inside the region. Announcements go through
`packages/core/src/live-announcer`, politely, without moving focus — files
accepted, each refusal with its reason, each failure, each cancellation, and the
queue finishing. Progress is never announced.

A status is a word before it is a colour: `Refused`, `Failed` and `Stopped` are
three words for three different failures, so a reader is not left guessing
whether to try again, choose another file or do nothing. Under forced colours the
tint goes and the word is what is left — WCAG 2.2 SC 1.4.1.

Focus is never lost: `packages/core/src/focus/removal-focus` sends it to the same
control on the next row, then the previous, then the trigger. The viewer contains
focus and returns it to the name that opened it, and the frame it renders a
dropped text file in carries `sandbox` with neither `allow-scripts` nor
`allow-same-origin` — an object URL inherits this document's origin. A PDF frame
carries none, because Chrome's PDF viewer is blocked in a sandboxed frame either
way; the media type is what makes that safe, and an HTML document served as
`application/pdf` in an unsandboxed frame was measured running no script.

**Not verifiable on this machine, and stated rather than claimed:** a real screen
reader, a touch device, and 200% browser zoom on a real display. What was checked
instead: the accessible name and description in the React test with
`toHaveAccessibleName` and `toHaveAccessibleDescription`, the focus ring in a
`--focus` capture in both schemes, `high-contrast` captures, and the contrast
measurements above.

**Most improving change:** the list is not a live region, on the argument that
the announcer already says what changed. It was not changed — a second live
region would read every row again on every movement.

## 8. Native API

React is React: `useId`, context for the defaults, `render` for the root, a
`handleRef` for the six imperative actions, native props and events forwarded,
and the consumer's own handler running before the family's on all six drag and
paste events. Angular is Angular: `input()`, `model()`, `output()`, `computed`,
host metadata rather than `@HostBinding`, `ViewEncapsulation.None` with the one
authored stylesheet, `exportAs`, `inject()`, `HostAttributeToken` for a static
`id`, and `DestroyRef` for every teardown.

The asymmetry is recorded rather than levelled: Angular has `ControlValueAccessor`
**and** `Validator` and DI-provided defaults; React has `render` and the ref
handle. Neither is imitated in the other.

**Most improving change:** the Angular viewer drew its own modal surface instead
of composing `SlDialog`, on the ground that the Angular dialog is opened through
a service — which it is not: `sl-dialog` is a component with `open` and projected
content. What shipped from that reading was a panel with no layer, no scrim and
no containment, sitting in the page under the family, which is how the reviewer
met it. **Made:** both bindings now compose the dialog family, and the two
viewers differ only in idiom.

## 9. Capability

Measured against the step-3 inventory rather than against the scope paragraph.
Thirty-nine table-stakes rows: thirty-three `adopt` or `adapt`, six `decline` —
and every decline names the family that owns the capability instead or the
composition that replaces it (a full-screen layer, a download action, reordering,
image editing, resumable transfer, remote sources).

Both mutable values have a controlled and uncontrolled pair, a request carrying a
reason from the closed vocabulary, and a row in the state matrix: `files` and
`open`. Nine statuses, nine rejection reasons, five keys, and the focus
destination for each.

Two capabilities were **removed** from the contract when the reference page asked
for the props they imply: `measurement` and `loading`. Both were wrong —
`measurement` is a quantity the consumer states and the family draws, and
upload's is measured from the bytes the adapter reports; `loading` would have
promised an input that does not exist, because whether anything is moving is the
queue's answer. The states stay in the DOM; the words left the capability list.

Ten differentiators, of which the ones no surveyed implementation has: three
failures kept apart, a remaining time computed from observed throughput, a stall
that is actually detected, a pause offered only where the adapter honours it, and
a row that answers its own inline size.

**Most improving change:** `minFiles` and `maxTotalSize` were single-source
capabilities that the inventory listed as differentiators rather than table
stakes, and both shipped anyway because they are one line each in the same
validation pass. **Made.**

## 10. Ecosystem integration

Both integration tables in `references/frameworks.md` are answered line by line
in the design document, §16 and §17. Every line has a file that answers it.

React: controlled and uncontrolled pair with a reason; `UploadDefaultsProvider`
and `useUploadDefaults`; `render` on the root, with the input named as the one
part that cannot be substituted and why; six native handlers composed rather than
replaced; `ref` to the root and `UploadHandle` for the six imperative actions;
`useId` and no layout read during render; every state in the DOM;
`ComponentPropsWithRef<'div'>` extended rather than a hand-written subset.

Angular: `model()` for both values and `output()` for the requests that carry a
reason; `ControlValueAccessor` **and** `Validator`, so `uploadPending`,
`minFiles`, `maxFiles` and `required` reach a Reactive Form and the DOM agrees;
`provideUploadDefaults()` and `UPLOAD_DEFAULTS`; `exportAs`; `ng-content`;
signals throughout with no `markForCheck`; `DestroyRef` revoking every object URL
and aborting every run; `HostAttributeToken` before the bindings compute; and
`@slotted/angular/upload` as a single entry point.

**Most improving change:** `writeValue` accepts `UploadFile[]` or `File[]` and
normalises, because a form may hand back either. **Made**, and stated on the
Angular reference page rather than left to be discovered.

## 11. Documentation

Two reference pages, twenty-seven demonstrations each — one per scenario the
contract declares — with a captioned note and the code that produced it. Thirty-
six anatomy rows, forty-four API rows, four event rows, eight composition rows,
eight accessibility paragraphs, and two curated snippets: the anatomy as it
reaches the DOM, and the stylesheet an application would write.

Every demonstration is a **live upload** rather than a picture of one: the same
component, the same rules, the same DOM, against a sender that moves bytes at a
stated rate. Nine files at three at a time, a transfer that fails, one that
stalls at 43%, one that suspends between chunks, and one the reader stops. Every
name, size and status is a real one from one claim — CLM-2026-0914 — so the
page reads as one product rather than as a bag of fragments.

`specs/reference-pages.test.mjs` and the four checks in each stories spec pass:
scenario coverage, API metadata, the reference-page contract, and Prettier on
every snippet.

**Not done, and it is the gap in this dimension:** neither page has been read
rendered. Both Storybook ports answered nothing when this was written, and the
skill says not to start one. `tools/harness/audit.mjs` could not run for the same
reason, so the two geometries it measures — an element collapsed to a sliver, and
content spilling past the box that owns it — are unmeasured on these pages. This
is the first thing to do when a Storybook is up, and it is stated at the gate
rather than glossed.

---

## §18, the definition of done

1. **Purpose, uses and anti-uses.** A region that takes files by drop, by
   picker, by camera and by clipboard, validates them, holds them and moves them
   through an adapter. Not an editor, not a resumable protocol, not a document
   viewer beyond what a browser draws, and not a remote-source picker — each
   declined in the contract with the owner named.
2. **Anatomy.** Thirty-six parts, listed in the contract and on both pages, each
   with its element and when it is drawn.
3. **Controlled and uncontrolled.** `files` and `open`, each with both modes, a
   request carrying a reason from the closed vocabulary, and cancellation.
4. **State matrix.** Thirteen states in the DOM and nine file statuses, with the
   controls each status offers listed in `statusActions`.
5. **Keyboard, focus, ARIA, touch, screen reader.** Five keys on the family and
   five in the viewer, the focus destination for each, the removal rule, and the
   announcement policy. Touch targets are floored at `--slotted-target-min`.
6. **Recipes by size, density, variant, tone.** Three sizes, three variants, two
   layouts, three densities, three schemes, all through tokens.
7. **Responsive, RTL, locale, reduced motion.** Two container queries, logical
   properties throughout, `Intl` for the size and the time, and durations from
   the motion scale.
8. **Loading, empty, error, disabled, extreme content.** All present and all
   demonstrated: an empty region, nine statuses, `disabled`, `readOnly`,
   `invalid`, a two-hundred-character name, an Arabic name, a name with no
   extension, and four hundred files bounded in rows.
9. **SSR, performance, virtualization.** No layout read during render and no
   object URL created during render — both happen in an effect, which is the only
   place a browser API exists. The list is bounded in rows and scrolled rather
   than virtualized; a windowed list would be `data-grid`'s answer, and the
   contract says so.
10. **Examples.** Twenty-seven per page, in one domain, with the code.
11. **Behavioural tests shared between bindings.** 43 in the engine, 23 in React,
    20 in Angular — the same behaviours asserted on both sides: the label
    pairing, the depth counter, the drag verdict, the rules, the kinds, the
    transfer, the pause handshake, the removal, the viewer and the pending rule.
12. **Changelog and migration.** The family is new. What it reverses from the
    removed wave-2 `file-upload` is written out in §5 of the inventory: the
    family now transfers, duplicates are detected, and the item carries the bar.

---

## What is open at the gate

- `audit.mjs` runs clean on both reference pages — React at 1280, at 620 and in
  `dense`, Angular at 1280 — and the viewer was opened in a browser on both,
  against a photograph, a tall scan and a PDF. Both Storybooks answer on
  `127.0.0.1`; `localhost` resolves to `::1` there and is refused, which is worth
  knowing before concluding a server is down.
- What the live reading found, and what was done about it, is the last section
  of this document.
- A real screen reader, a touch device and 200% zoom on a real display are not
  verifiable here.
- The viewer is a layer in both bindings and is portalled to the end of the
  document, so it carries `data-ui="upload"` and the family's size on itself and
  reads the private properties from a rule it shares with the root. It cannot be
  portalled into the root: `container-type` there makes a containing block for a
  fixed descendant.


---

## What the live reading found

The picture was approved at the visual gate and the family was then read in a
browser, which is where four of these were met.

1. **The viewer had no styles at all.** Its rules were written as descendants of
   the root and a layer is portalled out of it. Both bindings now put
   `data-ui="upload"` and the family's size on the layer itself, and the private
   properties are declared once for the root and the layer together. It cannot be
   portalled into the root: `container-type` there makes a containing block for a
   fixed descendant.
2. **React's layer lost the theme.** `Dialog` takes its origin from the trigger
   and this viewer has none, so no token resolved at the end of the document. The
   viewer creates its own portal root from a marker written in place and hands
   the container to the dialog.
3. **The Angular layer opened and painted nothing.** A defect in `dialog`, fixed
   there first and in its own commit: the presence machine writes its status from
   inside the component's own change detection, and the write marked no consumer.
   `onStatusChange` now marks the view for check. Angular's viewer composes
   `sl-dialog`, as React composes `Dialog`; the structural asymmetry recorded at
   the release gate is gone.
4. **No PDF was ever previewed.** Chrome's PDF viewer is blocked in a sandboxed
   frame, with `sandbox=""` and with `sandbox="allow-scripts"` alike. The PDF
   frame carries no `sandbox` and the text frame keeps it; what makes that safe
   is the media type, measured against an HTML document served as
   `application/pdf`, which ran no script.
5. **A tall photograph left the screen.** The stage sized the picture with
   `block-size: 100%`, and a percentage falls back to the picture's own height
   wherever the area is not definite. The picture is stretched into its grid area
   instead.
6. **Angular rendered an empty frame.** `[src]` on an `iframe` is a resource-URL
   context and Angular refuses an interpolation; the object URL this family
   created is trusted explicitly.
7. **The viewer said `image`.** `kindLabels` joins `statusLabels`: nine words, an
   English default, replaceable one at a time, in both bindings and in both API
   tables.
8. **Every demonstration file was empty bytes.** The seeds painted a `Uint8Array`
   of zeroes, so every photograph was a broken image and every PDF an empty
   frame. The demos now draw a real JPEG on a canvas — wide, portrait and a tall
   scan — and write a one-page PDF with its cross-reference table.
