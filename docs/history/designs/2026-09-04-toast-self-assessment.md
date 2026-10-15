# Toast self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` §18. Written after the pictures were read and
before the release gate.

Evidence paths are the captures under the session's scratchpad
(`…/scratchpad/shots/toast-*.png`) and the rendered slices of the React
reference page (`…/scratchpad/shots/react2-*.png`).

---

## 1. Icons

Five marks, each a mask from a glyph token, and the map is the one `alert` and
`status-indicator` share — `specs/components/toast/contract.json` holds it and
`toast.styles.test.mjs` checks the stylesheet against it, so a message about a
failure draws the same silhouette as the alert about it. No character is used
as an icon anywhere. Under `forced-colors` the slot takes `CanvasText` and the
artwork paints `currentcolor`, so one rule repaints both; the shared fallback
test refuses a system colour inside a `::before`, which is why the colour is on
the slot.

A page's own mark goes in the same slot, which is what the loading capture
shows with a spinner from `progress-indicator`.

**The one change that would most improve it:** the mark was centred in its line
box rather than on the text, and read high in every capture. **Made**, twice:
the artwork is now an inline-block placed against the title's own baseline, and
the band it is centred on was chosen by rendering three candidates at four times
the type size. `docs/build-briefing.md` carries the decision and the
measurement.

## 2. Motion

Four state changes carry a transition and each says something. A message
arrives by rising into place from the edge it belongs to and leaves the same
way — the one motion that says *this arrived* rather than *this moved*. The
pile opens and closes by a translate, a scale and a height, which is what a
column of messages of different heights needs measurement for. The countdown is
a finite animation whose length is the message's own duration. The close
control's hover and press take the control transition.

Every duration comes from the motion scale, so the theme collapses them under
`prefers-reduced-motion`; `packages/styles/src/motion.test.mjs` refuses a
literal. The countdown is the one length no theme can hold — it is the time
*this message* was given — and it stops under reduced motion rather than
shortening, becoming a rule under the message. Nothing in the family loops.

**The one change that would most improve it:** the swipe currently follows the
pointer and springs back with no transition on release, because the transition
is disabled while dragging. **Not made.** Re-enabling it for the release frame
alone needs a state the vocabulary does not have — `dragging` is gone by then —
and the spring is only visible on a gesture that did not reach the threshold.
It is written here rather than left for the next reader to find.

## 3. Responsiveness

The region answers its own inline size: `container-name: slotted-toast`,
`container-type: inline-size` on the root, and the query at a literal `20rem`
because CSS forbids a custom property in a container condition. Past it the
message's inset tightens and its actions stack, each keeping its own width.

The region's width is `min(measure, 100% - 2 × offset)`, so at 320 pixels and at
200% zoom it is the screen less two offsets rather than a stated width running
off the edge — read in the 240-pixel capture, where the German title wraps to
five lines and the digest breaks mid-token.

**The one change that would most improve it:** the offset does not step down on
a narrow screen, so a phone gives up 32 pixels of a 320-pixel screen. **Not
made**, deliberately: the region is its own query container, and a container
cannot query itself. Stepping the offset would take a viewport query, which the
rubric refuses, and the width formula already keeps the message on the screen.

## 4. Refinement

Read at three schemes, three widths, three densities and both directions, plus
the two focus states. Four things the pictures showed and the code did not, all
corrected: a supplied spinner overflowing the mark slot and landing on the first
letter of the title; `--slotted-shadow-lg` at an eight-pixel gap laying each
message's shadow across the top of the next; the message's focus ring drawn
inside its own border and reading as a thick blue edge; and the countdown at
half opacity in the ink of the words, which read as a grey smear.

The states were photographed rather than described: `--focus` on the message and
on the close control, in light and in dark, and the countdown frozen part-way
through with a negative animation delay.

**The one change that would most improve it:** in the dark scheme the raised
message separates from the page by a one-pixel border alone, because a shadow
has no ink on a near-black ground. **Not made.** The alternative is a stronger
edge, and `--slotted-border-strong` reads heavy in light; the honest fix is a
theme decision about elevation in dark rather than a family one, and it is named
here so the theme can take it.

## 5. Tokens

Twenty-six family tokens, each reaching a foundation token, and ninety-two
custom properties read in all. `packages/styles/src/tokens.test.mjs` holds the
list against the stylesheet. No literal outside the documented exemptions; the
two numbers that are not tokens are the container breakpoint, which CSS forbids
as one, and the stack's scale factor, which multiplies an index and is a bare
number by construction.

Nine values are runtime properties rather than tokens, registered in
`packages/styles/src/runtime-properties.mjs` with the reason: a theme cannot
answer how far the pointer has dragged a message, how tall this message turned
out to be, or how long *this* message was given.

**The one change that would most improve it:** `--slotted-toast-icon-axis` is a
family token and the problem it solves is not this family's. **Not made here.**
Five families still centre their marks in the line box, and none of them is this
session's to edit; the briefing carries the rule so each takes it when it is
next opened, and the token moves to the foundation when the second family needs
it.

## 6. Patterns

There is no toast pattern in the APG. The Alert Pattern is the closest official
guidance and the contract cites it, transcribes what it says, and names both
departures with their cost under `departures` — the role, and the keyboard. The
one prose rule it states is kept without exception: an arriving message never
moves focus.

WCAG 2.2 SC 2.2.1 is the criterion the timer answers, and the contract names
which of its six ways out the family takes and what the application still owes.
SC 2.5.8 is answered by sizing the close control from the smallest control
height. SC 1.4.1 is answered by the mark.

**The one change that would most improve it:** the keyboard table is the
family's own rather than a pattern's, so nothing checks it against a source.
**Partly made:** each row names its source — `platform`, `pattern` or `family` —
and the contract test refuses a row that names none. What no test can do is
check a key against a pattern that does not exist.

## 7. Accessibility

Name, role, state and keyboard are complete. The region is a named landmark; no
element carries a live role, and the announcement is made by
`packages/core/src/live-announcer`, which builds its regions before any message
exists — ARIA 1.2 §6.4, the requirement a freshly-inserted live region cannot
meet. Politeness is per message and never inferred from the tone.

Focus: never moved by an arriving message; moved by `F6` alone; returned by
Escape; and handed to the next message, then to where it came from, when the
message holding it is removed — `focus/removal-focus`, composed rather than
rewritten.

Timing: the clock stops on hover, on focus inside and on a hidden document, and
resumes on what was left. A message carrying an action, or waiting on a promise,
is given no duration at all.

**The one change that would most improve it:** a screen reader has not been run
against this. **Not made, and not possible here** — it is the one thing this
machine cannot verify. What was checked in its place: no live role anywhere in
the rendered DOM, the announcer's own unit tests, and the order and politeness
of every announcement in `packages/core/src/toast/toast.test.ts`.

## 8. Native API

React is React: a module-level store read with `useSyncExternalStore`, a
provider for defaults, `render` on every part, `ref` reaching every element,
props typed as `ComponentPropsWithRef` of the element each part renders, and
every handler composed rather than replaced.

Angular is Angular: a `providedIn: 'root'` service whose reads are signals, an
injection token with `provideToastDefaults()`, `input()`/`output()` throughout,
`host` metadata rather than `@HostBinding`, `exportAs` on the region and the
item, `NgTemplateOutlet` for content the page writes, and `DestroyRef` for every
teardown.

**The one change that would most improve it:** `SlToastItem` is a directive so
a page can write its own list, and nothing tests that path. **Not made.** The
spec exercises the region's own list, which renders through the same directive;
a page's own list differs only in who writes the `li`.

## 9. Capability

Measured against the step 3 inventory rather than against the scope paragraph.
Thirty-four table-stakes rows: every one `adopt` or `adapt` except six, and each
of the six names the family that owns the capability instead — `popover` for an
anchored message, `alert-dialog` for a modal one, `alert` for one that stays —
or the two lines of composition that replace it.

The one mutable value has a controlled and uncontrolled pair, a request carrying
a reason, and a row in the state matrix. The reason vocabulary gained the word
it was missing, and the capability vocabulary gained `queue`, both in their own
commit before the family.

**The one change that would most improve it:** the differentiator that claimed
the pile needed no measurement was wrong, and the first draft shipped it.
**Made:** the pile measures three values, the contract says which and what it
costs, and the inventory's differentiator row was rewritten to say that what is
different here is the ledger rather than the technique.

## 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in
`docs/history/designs/2026-09-04-toast-design.md` §11 and §12. Reactive Forms
is the one line answered `no`, with the sentence saying why: a transient message
is not a form control and holds no value to write back.

The asymmetry is recorded rather than levelled: React's imperative surface is a
module-level store with a hook, Angular's is an injectable service. Both wrap
the same object.

**The one change that would most improve it:** an application cannot set the
store's `limit` and `duration` before the first paint in React — the region
pushes them in an effect, so one frame uses the store's own construction
values. **Partly made:** `createToaster({ limit, duration })` sets them at
construction for an application that cares, and the defaults provider covers
the rest. The remaining frame is written here.

## 11. Documentation

Two pages, thirteen demonstrations each, one per scenario the contract declares,
every one with a caption saying what to look at and the two or three lines a
consumer would actually write. Anatomy for all ten parts, twenty-eight API rows
including every declared default, two outputs, the composition surface, nine
accessibility decisions, and the anatomy as it reaches the DOM.

The React page was read rendered and sliced by demonstration; two defects were
found there and nowhere else, and both were fixed. `tools/harness/audit.mjs`
reports no collapsed stage and no overflow at 1280 pixels.

**The one change that would most improve it:** the Angular page has not been
read rendered. **Not made** — the running Angular Storybook answers
`Unexpected token 'export'` for the new entry point, which is the startup-time
resolution `docs/build-briefing.md` records, and a restart interrupts the other
lane. It is a gate item.

---

## Against `docs/component-features.md` §18

1. **Purpose, use and anti-use.** Transient feedback about something that
   already happened. Not a replacement for an error beside a field, not a
   confirmation of anything critical, not a message a reader must be able to
   come back to — that is `alert`.
2. **Anatomy.** Ten parts, listed in the contract and on both pages: `root`,
   `list`, `item`, `icon`, `content`, `title`, `description`, `actions`,
   `close`, `progress`.
3. **Controlled and uncontrolled.** `toasts` / `defaultToasts` /
   `onToastsChange`, one mutable capability, seven reasons. Uncontrolled the
   store owns the queue; controlled the page does and the family only asks. The
   cost of the controlled mode is written: the exit animation is then the page's
   to keep, because a message it has removed is gone.
4. **State matrix.** `default`, `hover`, `active`, `focus-visible`, `open`,
   `loading`, `dragging`, `expanded`. `disabled` is absent and so is `invalid`:
   a message is not a control. Precedence is the shared order, and the close
   control holds hover and press back behind `:enabled`.
5. **Keyboard, focus, ARIA, touch and screen reader.** The keyboard table is in
   the contract with a source per row and is exercised in both bindings' specs.
   Touch has the swipe, and the close control clears 24 pixels at every density.
   The screen reader is the one thing unverified, named in §7 above.
6. **Recipes through tokens.** Five tones, three variants, three densities,
   three schemes, forced colours. Every one read in a capture.
7. **Responsive, RTL, locale, reduced motion.** A container query on the
   region's own width; every rule in logical properties, proven by the RTL
   capture; no string the family invents beyond two labels, both settable once;
   reduced motion inherited from the theme, and the one animation it cannot
   reach stopped explicitly.
8. **Loading, empty, error, extreme content.** Loading is a declared state with
   its own rule. Empty is the region rendering nothing at all — no element, no
   landmark noise. Error is a tone. Extreme content is a scene in the harness
   and a demonstration on both pages.
9. **SSR, performance, virtualisation.** The region renders empty on the server,
   generates no identifier during render and reads no layout. One
   `ResizeObserver` per region, and only in `stack`. Virtualisation is not
   applicable to a list bounded by `limit`.
10. **Examples.** Thirteen per page, including the family in a real context, the
    keyboard, content it did not choose, and composition with `button` and
    `progress-indicator`.
11. **Shared behavioural tests.** Seventeen in the store, fifteen in React,
    thirteen in Angular, thirteen in the stylesheet, twenty-six in the contract.
    The two bindings are checked against the same claims rather than against
    each other's markup.
12. **Changelog and migration.** None owed: the family is new. The two
    vocabulary additions are additive and no existing contract changes meaning.
