# Overlay infrastructure — self-assessment

Against `.claude/skills/component/references/rubric.md`, eleven dimensions, and
`docs/component-features.md` §18. Five modules of `packages/core`:
`presence`, `portal`, `dismissable-layer`, `positioner`, `live-announcer`.

Six of the eleven dimensions were written for a family that paints something.
None of these five does. Each is answered by what the module owns of the same
question rather than marked not applicable and skipped, and where the answer is
genuinely nothing, the sentence says so.

Every dimension names the one change that would most improve it and says
whether it was made.

## 1. Icons

Nothing here draws. `live-announcer` is the only module that creates an element
of its own, and what it creates is two live regions holding text.

**Most improving change:** none exists. Not made.

## 2. Motion

`presence` is this dimension. It waits on CSS animations **and** CSS
transitions, where Radix waits on `animationName` alone and unmounts a family
that fades with a transition instantly. It ignores an animation that bubbled
from a descendant. It skips the wait entirely under `prefers-reduced-motion`,
and it never loops anything, because it starts nothing.

The bounded exit is the part no surveyed implementation has: the declared
duration is read from the node one frame after the exit begins, and a timer at
that length plus `exitGrace` completes it if the event never arrives. Evidence:
`packages/core/src/presence/presence.test.ts`, "completes the exit on the
declared duration when the event never arrives".

**Most improving change:** an `onEnterComplete` to match `onExitComplete`, so a
family can act at the end of the entrance rather than only at the end of the
exit. **Not made**: no consumer in wave 5 needs it — the entrance blocks
nothing, while the exit blocks the unmount and the focus return — and a callback
with no caller cannot be held by a test that means anything. It is `tooltip`'s
to ask for.

## 3. Responsiveness

The module that answers this is `positioner`, and what it publishes is what lets
a family respond: `--slotted-positioner-available-width` and `-height` are the
space the layer actually has after collision, so a menu near the bottom of the
viewport scrolls instead of overflowing, and
`--slotted-positioner-anchor-width` is what makes a listbox the width of its
input. `flip` and `shift` are on by default, so a layer answers a small viewport
before anyone writes a query. Evidence: the "what the stylesheet is told" tests.

**Most improving change:** publishing the space as a property rather than
applying a `max-height` to the element. **Made, and it is the design**: applying
it would take a declaration the family owns, exactly as writing `transform`
would take the property its animation needs.

## 4. Refinement

With nothing painted, the equivalent is whether the output is exact rather than
merely correct. Two places it was not, and now is:

- The transform origin is the arrow's own tip when there is an arrow, and a
  corner keyword when there is not. A layer that grows from its corner while its
  arrow points somewhere else is the detail a reader sees without naming.
- The alignment keyword mirrors with the writing direction on a vertical side
  and does not on a horizontal one, because `start` means the left edge in one
  direction and the right in the other, and the block axis means neither.

**Most improving change:** the one detail left, named as the rubric asks. The
exit's declared duration is read one frame after the status moves, which is
right for a transition the family triggers by flipping an attribute and one
frame early for a family that flips it in a second frame of its own. **Not
made**: correcting it costs a second frame on every unmount for every family, to
serve a rendering pattern none of them uses. It is written here so the family
that hits it finds the cause rather than the symptom.

## 5. Tokens

No module writes a colour, a length or a duration of its own. Two write custom
properties, and both are runtime values under names that say so:

- `--slotted-positioner-*` — anchor size, available size, transform origin,
  arrow offsets.
- `--slotted-layer-depth` — the position in the single overlay stack, so a
  stylesheet composes `calc(var(--slotted-z-index-popover) + var(--slotted-layer-depth))`
  from a token that already exists in `packages/tokens/src/contract.json`.

Neither is a design token and neither is in the token contract. A theme retunes
`--slotted-z-index-popover`; it cannot retune where an anchor is.

**Most improving change:** `packages/styles/src/tokens.test.mjs` requires every
`--slotted-*` a stylesheet reads to be declared in that family's `tokens.json`
with a foundation fallback, and a runtime value has no foundation fallback.
**Not made here**: no stylesheet reads one yet, so the shared test cannot fail
yet, and the briefing's rule is that a shared-tool defect is fixed in its own
commit before the family that finds it. It is written into `tooltip`'s scope in
`docs/build-order.md`, which is the family that will find it.

## 6. Patterns

No WAI-ARIA APG pattern covers a module that renders nothing, and
`.claude/skills/component/references/patterns.md` step 1 asks for the closest
official guidance where none exists. The inventory transcribes it per module:
ARIA 1.2 §6.4 for the announcer, the CSS Animations and CSS Transitions event
model for `presence`, `popover`/`<dialog>`/`inert` for the layer, CSS Anchor
Positioning Level 1 for the positioner, and ARIA 1.2 §5.2.7 for what a portal
breaks.

The platform is preferred where it can be: `inert` rather than
`pointer-events: none`, `textContent` rather than markup, the specification's
own vocabulary for the positioner.

**Deliberate departure, with its cost.** The platform's top layer —
`popover="manual"`, `dialog.showModal()` — is declined for now in favour of a
z-index stack. The cost: a layer still participates in stacking contexts, so an
ancestor with `transform` or `filter` can trap it, and the portal is what
answers that instead. The gain: the layer's dismissal, stacking and nesting
rules stay this library's, rather than being adopted whole from the platform's
`auto` semantics or fought. `docs/build-order.md` decides it too — "pilha única
de z-index".

**Most improving change:** adopting the top layer behind the same contract, so
the z-index stack becomes the fallback rather than the mechanism. **Not made**:
it is a decision that binds `dialog`, `menu`, `toast` and `popover`, and it is
better taken with a family on the screen than with none.

## 7. Accessibility

- `inert` on the siblings of a modal layer removes the page behind it from the
  accessibility tree as well as from the pointer, which Radix's
  `pointer-events: none` does not. An element already `inert` is left as it was
  found. Evidence: the "a modal layer" tests.
- Escape ignores `repeat` and `isComposing`, so a held key closes one layer and
  cancelling an IME composition closes none.
- The announcer builds both regions before any message enters one, which ARIA
  1.2 §6.4 requires and which is the difference between a message being read and
  being silent. It alternates two nodes so a repeated message is still a change,
  and it queues so two messages in one update are both heard.
- The portal carries `dir` to the layer, so a right-to-left layer stays
  right-to-left after being moved to the end of the body — and the positioner
  reads that same `dir` to resolve `inline-start`.
- Focus containment and restoration are `focus`'s, not this invocation's, and
  the requirement is written into `dialog`'s scope.

**What this machine cannot verify**, stated as the briefing requires: no screen
reader was run. The announcer's behaviour is asserted against the DOM — which
region, which node, which text, at which time — and the claim that a screen
reader reads it is the specification's, not a measurement. The same holds for
`inert`: the attribute is asserted, its effect on a real accessibility tree is
not.

**Most improving change:** an announcer test that proves the region is in the
document *a task before* the first message, rather than proving both facts
separately. **Made**: every write goes through a timer, so the first message is
always a task later than the region, and "puts both regions in the document
before anything is announced" holds the first half.

## 8. Native API

No binding is written in this invocation. What the dimension can be held to is
whether the modules preserve what the consumer already has:

- Every module is handed a node the consumer rendered and writes only what it
  declares — `presence` writes nothing at all.
- No listener calls `preventDefault` or `stopPropagation`. A dismissal is
  reported; the consumer's own handler runs either way.
- Every listener is added in the capture phase on the document, so a layer
  answers before a consumer's handler can stop the event, and never instead of
  it.
- Every factory returns a handle with `destroy()`, and each module's test
  asserts that nothing answers afterwards.

**Most improving change:** none for this invocation. The dimension is `tooltip`'s
to answer, and the design records what each binding will use.

## 9. Capability

Measured against the inventory, not against the scope paragraph. Every
table-stakes row is `adopt`, `adapt`, or a `defer` that names the owner:

| Row                                          | Verdict                | Where                                                             |
| -------------------------------------------- | ---------------------- | ------------------------------------------------------------------- |
| Reposition or close on ancestor scroll        | defer to `positioner`  | `autoUpdate` repositions; closing is the family calling `dismiss`.  |
| Focus containment and restoration             | defer to `focus`       | written into `dialog`'s scope in `docs/build-order.md`.            |

Nothing else was declined. The nine differentiator rows and the eleven gap rows
are each answered by a named behaviour with a test.

`presence.present` is the only mutable value in the five, and it has the whole
of `docs/state-and-events.md`: a controlled and an uncontrolled mode decided
once, a request carrying a reason from the closed vocabulary, cancellation
before commit, and no request for a value it already holds. No surveyed
presence implementation carries a reason at all.

The keyboard is one key — Escape — and it is checked against the APG's Dialog
rule key by key: the topmost layer only, not on a repeat, not on a composition
cancel, and swallowed by a layer that refuses it rather than passed down.

**Most improving change:** `hideWhenDetached` reports the anchor as gone and
leaves the layer where it is, when a family would usually want it hidden.
**Not made**: hiding is a paint, the module paints nothing, and `data-detached`
is what a family's stylesheet needs to hide it in one rule.

## 10. Ecosystem integration

Both tables of `.claude/skills/component/references/frameworks.md` are answered
line by line in the design document, including the four lines that are not
applicable because no module renders. The asymmetry the rubric asks to be
recorded rather than levelled: Angular has `animate.leave` in the framework
itself, verified in `node_modules/@angular/core` at 22.1.4, so the Angular
binding of an overlay family may hold its exit with the platform's own
mechanism and use `presence` only for the status. React has no equivalent and
needs the module. The modules are written so either is possible: `presence`
reports and never renders.

**Most improving change:** the application-wide defaults — `setPortalContainer`
and the shared announcer — reach each ecosystem's own mechanism, a context
provider and an injection token. **Not made here**: both are wrappers around a
function this module already exposes, they belong in the binding, and writing
them with no family to inject them into would be an untested provider.

## 11. Documentation

There is no reference page, and there will not be one: these modules are not
families and `specs/reference-pages.test.mjs` governs families. What a consumer
meets them through is `tooltip`, next in the wave.

What exists instead: the inventory, the design, and a header comment on every
module that states what the module is for, what it refuses, and which surveyed
library learned the same lesson the hard way. Every non-obvious decision in the
code carries the reason beside it rather than in a document that will drift.

**Most improving change:** the modules' own API would be easier to meet from a
page than from a header comment. **Not made, and deliberately**: a reference
page for a module with no rendered output would show nothing, and the honest
place for the example is the first family that composes it.

## Against `docs/component-features.md` §18

The twelve criteria, for a module rather than a component:

1. **Purpose and anti-use.** Each module's header states both. The explicit
   anti-uses: `live-announcer` is not a toast API; `dismissable-layer` does not
   move focus; `presence` does not write to the DOM.
2. **Anatomy and public parts.** No parts. The public surface is the factory,
   the handle and the constants, listed in each `index.ts`, and
   `positioner.test.ts` asserts that list exactly.
3. **Controlled and uncontrolled, with a reason.** `presence.present`, above.
   The other four hold no consumer-owned value.
4. **State matrix.** `presence` has four statuses and every transition between
   them is tested, including the interrupted exit that returns to `open` without
   reporting one. `dismissable-layer` has a stack position and a modal flag, both
   tested. The others are stateless between calls.
5. **Keyboard, focus, ARIA, touch, screen reader.** Escape, above; ARIA in the
   announcer and the portal; focus deferred to `focus`; touch is `pointerdown`,
   which is the same event on every input; the screen reader is the one thing
   not verified here.
6. **Size, density, variant, tone recipes.** None: nothing is painted.
7. **Responsive, RTL, locale, reduced motion.** RTL in `resolveSide` and in the
   portal's mirrored `dir`; reduced motion in `presence`; responsive through the
   available-space properties. Locale: no module formats anything.
8. **Loading, empty, error, disabled, extreme content.** The equivalents:
   an anchor that left the document, a message that is only whitespace, a
   hostile string, a scroll lock released out of order, an exit whose event never
   arrives, and a document with two copies of the library. Each has a test.
9. **SSR, performance, virtualization.** No module touches `document` at import
   time. `getPortalContainer` reports `null` where there is no document, and
   every factory returns an inert handle rather than throwing. The engine is
   external to the bundle: `dist/positioner.js` is 4.61 kB rather than 28.53 kB.
10. **Examples in context.** `tooltip`, next in the wave.
11. **Behavioural tests shared between bindings.** The strongest form of it: one
    implementation, no binding, so the two cannot disagree. 483 tests pass in
    `@slotted/core`, 112 of them new across the five modules.
12. **Changelog, stability, migration.** No contract is broken: all five modules
    are new, and `focus` is unchanged. The one change outside them is
    `@slotted/core`'s first runtime dependency, recorded in
    `docs/build-briefing.md` under _Decisions already taken_ and answering
    `PROJECT-PRD.md` §48 open question 8.

## Verification run

```
pnpm --filter @slotted/core verify   26 test files, 483 tests, typecheck, build — pass
pnpm test:contracts                  665 pass
pnpm test:package-layers             pass
pnpm test:docs                       pass
pnpm exec eslint <the five modules>  pass
pnpm exec prettier --check           pass
```

`pnpm check:affected` does not pass as a whole, and none of it is this work:
`pnpm lint` reports six errors in `packages/angular/{breadcrumb,stepper}` and
`packages/react/src/{pagination,stepper,tabs}`, and `pnpm typecheck` reports
errors in five story files under `packages/angular/toolbar` and
`packages/react/src/{pagination,stepper,toolbar}`. Another lane is mid-write in
this worktree, and the briefing's rule is that a failure outside this work is
reported at the gate rather than fixed.
