# Toolbar overflow — self-assessment

Against `.claude/skills/component/references/rubric.md`, all eleven dimensions,
and `docs/component-features.md` §18. The scope is the refinement: the
`overflow="menu"` capability, the two parts it adds, and the two core modules it
needed. The family's own assessment of 2026-09-03 stands for everything it does
not touch.

Every dimension names the one change that would most improve it, and says
whether it was made.

## 1. Icons

The family draws one mark and it is not an icon. U+2026 is set as text on the
`overflow` part, which is the exception rule 3 of `docs/token-foundation.md`
allows and which `breadcrumb` already takes: the rule forbids drawing an *icon*
— a mark standing in for a concept — from a character, and U+2026 stands in for
nothing. It is the typographic mark for omitted content, and omitted content is
what the control holds. It survives `forced-colors`, where a painted mask is
replaced by the page's own background, and it scales with the type where a fixed
mask would not. No icon token was added.

The mark is symmetrical, so `dir="rtl"` needs no rule; the RTL capture confirms
the bar mirrors and the mark does not.

**Would most improve it:** the three dots sit on the baseline, so a line box
centred in the control puts them a fifth of a line low. **Made** — the mark is
lifted by `calc(-0.5ex + 0.05em)`, every quantity font-relative, and read at 720
pixels against the labels beside it.

## 2. Motion

The trigger transitions `background-color` and `color` on the control transition
duration and easing, which is what every other control in this library does for
hover and press. The collapse itself does **not** animate: a control leaving the
bar is a layout change, and animating a set of controls that the reader did not
ask to move would draw the eye to the browser's window size rather than to the
work. Primer, Fluent and Kendo all collapse without motion.

No looping animation, so nothing to stop under reduced motion; the transition
inherits the theme's own `prefers-reduced-motion` collapse of the duration scale.

**Would most improve it:** a fade on the trigger as it arrives, so a control that
appears at a resize boundary is not a pop. **Not made** — a fade on an element
that arrives with `hidden` removed needs a presence cycle, and `presence` is for
layers; more to the point the control arrives exactly when the reader is dragging
a window edge, where a 150-millisecond fade reads as lag rather than as arrival.

## 3. Responsiveness

This dimension is what the refinement is. The bar answers its own inline size
through `ResizeObserver` rather than a viewport query, and it needs no
`container-type`: the measurement is script, and the collapse is composition
changing rather than size changing — which is what §2.7 of the feature guide
asks for by name, "toolbar move ações secundárias para overflow".

Read at 240, 420 and 720 in the harness, and at 620 and 1280 on the reference
page. At 240 the bar holds: the scene that shipped first clipped a label there,
because a static picture of a script-driven state cannot re-decide, and the scene
was rewritten to one that is true at every width.

**Would most improve it:** a bar whose pinned units alone exceed it. **Made** —
it scrolls rather than clipping, sharing the one-line rule with
`overflow="scroll"`, and `collapseState` returns `triggerVisible: false` when
nothing can give way so no control is drawn over an empty menu.

## 4. Refinement

Read at full size: light, dark and high-contrast at 420; light at 240 and 720;
dense; RTL; and the trigger focused in light and dark. The trigger takes the
bar's own height and at least the minimum target in the other axis, so it is a
square control in a row of wider ones rather than three characters with a hit
area around them.

Its ring is drawn **inward**. The bar under `menu` is a scroll container, which
clips at its padding edge, and an outward ring on the control nearest that edge
is the one this family cannot afford. The same measurement produced a second
correction: the bar now takes the frame's padding floor under `scroll` and
`menu`, because a scroll container clips whether or not a scrollbar is drawn and
the first control's ring was being cut on a bar that was not even overflowing.

**Would most improve it:** the mark reads one step lighter than the labels beside
it at rest. **Not made, and deliberate** — it is the muted step `tabs` gives the
one control it draws itself, and it is what keeps a control that holds *what is
left over* from competing with the primary action beside it. Hover, press and
open all reach the page's own text colour.

## 5. Tokens

Six family tokens are added, each falling back to a foundation token:
`--slotted-toolbar-overflow-color` to `--slotted-text-muted`, its hover, active
and open backgrounds to the secondary subtle steps, and its hover colour to
`--slotted-text`. No new step in any scale. The trigger's type is
`calc(var(--_font-size) * 1.5)` over the control font-size scale, so the three
densities move it without a rule of their own, and the lift is font-relative.

**Would most improve it:** the `1.5` multiplier is a literal. **Not made** — it
is a ratio between two quantities from the same scale rather than a length, which
is the exemption `docs/token-foundation.md` records for arithmetic over tokens; a
theme that wants a different mark retunes the colour tokens or writes its own
`font-size` on the part.

## 6. Patterns

`w3.org/WAI/ARIA/apg/patterns/toolbar/`, read again on 2026-09-04. The pattern
has no overflow at all, so nothing in it is departed from: the trigger is a
control of the bar like any other, reached by the arrows, `Home` and `End`, and
the surface it opens is `menu`'s, which answers the APG Menu Button pattern in
its own family. `aria-haspopup="menu"`, `aria-expanded` and `aria-controls` are
`menu`'s own wiring and are not written twice.

One rule of the pattern is what forced the core change: "focus is set on the
first control that is not disabled" is meaningless for a control the platform
will not focus, so `createArrowNavigation` now skips an element inside `[hidden]`
or under `visibility: hidden`.

**Would most improve it:** the surface's own name. **Made** — the trigger's
counted name labels it through `aria-labelledby`, so a reader who opens the menu
hears the same count they pressed.

## 7. Accessibility

The trigger has an accessible name that carries a number rather than a mark —
`label` takes a string or a function of the count, defaulting to the counted
sentence, so a page in another language replaces the sentence instead of
translating a glyph. `breadcrumb` records the same rule for the same reason.

Focus is moved onto the trigger **before** the unit holding it is hidden. A
hidden element cannot hold focus and the browser's answer is `document.body`;
the reader lands on the control that now holds the one they were on. It is
tested in both bindings.

`data-collapsed` on the root carries the count for a page that wants to announce
it; the family announces nothing itself, because a bar that spoke on every
resize step would talk over the reader dragging a window edge.

**Would most improve it:** the collapsed controls are `hidden`, so they are out
of the accessibility tree entirely rather than merely out of view. **Made, and it
is the point** — a control that is not reachable must not be announced, and the
counterpart in the surface is the reachable one.

**Not verified on this machine:** a screen reader, and a touch device. What was
checked in their place: the accessible name and `aria-expanded` read from the
tree in the rendered page, the keyboard exercised in both test suites, and the
target size held at `max(--slotted-target-min, --_height)`.

## 8. Native API

React gets `render` on both new parts, `ref` to the element, `menuRef` to
`menu`'s own handle, and props typed as `ComponentPropsWithRef<'div'>` and
`<'button'>`. Angular gets directives on the consumer's own element for the
unit, `exportAs` on everything, an `output()` for the count, and a component for
the overflow because it renders two things — with `display: contents` on the
host, so the button it draws is still a child of the bar.

The asymmetry is recorded rather than levelled: the counterpart is a `ReactNode`
in React and a `TemplateRef` in Angular, and only the Angular one is lazy. That
is each ecosystem's own answer.

**Would most improve it:** the trigger dropped `menu`'s anchor ref. **Made** —
writing `ref` after the spread replaced the positioner's own reference, and the
surface then opened at the corner of the page. The rendered page is what showed
it; no offline test could have.

Angular had the same shape of defect from the other side, and it took two forms.
`slMenuTriggerFor` binds `[attr.data-part]` and resolves it to `null` for a
trigger that is neither a bar's item nor a submenu's, and a host binding of
`null` removes the attribute the author wrote: the button lost
`data-part="overflow"`, which took the stylesheet's geometry with it and stopped
`sl-toolbar-overflow` from being recognised as the element holding the trigger,
so the host counted as a pinned unit and the bar hid one control too many. And a
template resolves its dependencies where it was written rather than where it is
rendered, so `slMenuItem` in a counterpart looked for the `SlMenu` above the bar
and found none. Both are fixed and both are in the briefing, because both bind
any family that puts another family's directive on its own part.

## 9. Capability

Against `docs/history/designs/2026-09-04-toolbar-overflow-capability-inventory.md`:
every table-stakes row is `adopt`, `adapt`, or a `decline` that names what owns
the capability instead. Four declines, each in the contract with its reason —
`overflowPriority` (the bar's own order owns it), `overflowSection` (`popover`
with a `toolbar` inside it), `collapsedState` (the layout owns it), and
`counterpartDerivation` (the consumer owns it, because the items are anything
focusable rather than four types of this family's own).

No mutable value is added, so no state model is owed: the collapsed set is a
measurement, which is why `overflow` entered `KNOWN_CAPABILITIES` and stayed out
of `MUTABLE_CAPABILITIES`. Six differentiator rows and six gap rows, none empty.

**Would most improve it:** a bar of icon buttons is the real case for this
capability and the demonstrations are all text. **Not made** — this family owns
no icon and the reference pages may not paint their own artwork with an inline
style; the `icon` family is what a consumer puts in the bar, and the
demonstration that would show it belongs to a composed page rather than to this
one.

## 10. Ecosystem integration

Both tables in `frameworks.md` are answered line by line in
`docs/history/designs/2026-09-04-toolbar-overflow-design.md`. The lines that
carry weight here: defaults set once reach `MenuDefaultsProvider` and
`provideMenuDefaults()` for the surface and `ToolbarDefaultsProvider` /
`provideToolbarDefaults()` for the axis; the consumer's `onClick` still runs,
because `MenuTrigger` composes rather than replaces; nothing is measured during
render, so the server and the first client render agree that everything is
visible; and every state a consumer may style is in the DOM — `hidden` on a
collapsed unit, `data-collapsed` on the root, `data-open` on the trigger.

**Would most improve it:** `@slotted/angular/toolbar` now depends on
`@slotted/angular/menu`, so a bar that never overflows would pay for the surface.
**Made** — `SlToolbarOverflow` is a standalone component of its own and
`ToolbarOverflow` a module of its own, so a consumer who never writes it drops
the menu with it.

## 11. Documentation

Both pages carry the import, the anatomy with the two new parts, one
demonstration per declared scenario, the axis values, `onOverflowChange`,
`counterpart`, `label`, `align`/`side`/`size`, the composition surface and a
sixth accessibility paragraph.

The React page was read rendered — not the story file — at 1280 and 620, in light
and dark, in `viewMode=docs` and `viewMode=story`, and in dense.
`tools/harness/audit.mjs` reports no finding at either width. Three defects the
pictures showed and no test could:

1. the "room to spare" bar collapsed at the docs column's width, so its caption
   promised what the canvas denied;
2. the group scene had no trigger in it at all, so nothing ever gave way;
3. the vertical bar in the `orientation` scene stood 93 pixels inside a
   321-pixel stage, which the audit reads as a sliver.

All three are fixed. The counterparts were also opened and read: the surface
holds `Exportar` and `Arquivar` in bar order for the first scene, the group's
four items for the third, and the counted names measure `2 more actions`,
`1 more action` and `Mais 1 ação`.

**Would most improve it:** the Angular page has not been read rendered. **Not
made, and it is not this session's to fix** — the running Angular Storybook 404s
on `packages/angular/toolbar/src/toolbar.stories.ts`, which is the restart
`docs/build-briefing.md` says a landing family needs and which the same briefing
says to ask for rather than perform, because it interrupts the other lane. What
was checked in its place: `ng test` renders `SlToolbarOverflow`, opens its
surface and reads the counterparts; `pnpm --filter @slotted/angular verify`
builds every entry point with the new cross-import; and the story index already
lists `components-toolbar--overflow-menu`.

## Against `docs/component-features.md` §18

**Anatomy.** Six parts: `root`, `group`, `separator`, `spacer`, `item`,
`overflow`. A unit is a direct child of the root; an item is anything focusable
at any depth. The two definitions are different on purpose and the contract says
so.

**Controlled and uncontrolled.** None added. The collapsed set is read from the
layout, so a controlled pair over it would let a consumer assert that a bar fits
when the browser says it does not — the reason `measurement` is not mutable
either. The fact is reported instead: `data-collapsed` and one callback per
change.

**State matrix.** `default`, `hover`, `active`, `focus-visible` and `open`, all
on the one control this family draws itself. `disabled` is the platform's own
`:disabled` from a `<fieldset disabled>` around the bar; the family writes no
`data-disabled` and declares no `disabled` state, because it does not own the
capability. Precedence: `:not(:disabled)` guards hover and press, and `open`
follows both in source order so an open trigger under the pointer reads as open.

**Density and direction.** The trigger's height, minimum target and type all
come from the control scales, so `dense` moves it without a rule; the arithmetic
reads the flow axis and the computed gap, so a right-to-left bar collapses where
a right-to-left bar actually runs out. Both photographed.

**Loading, empty, error, extreme content.** A bar with nothing collapsed draws no
trigger. A bar that cannot collapse anything scrolls. A counterpart that is
`undefined` pins its unit rather than erroring. A unit wider than the whole bar
is pinned in effect — it is collapsed first and the bar still scrolls past what
is left. Loading and error belong to the controls the consumer placed.

**SSR and performance.** Nothing is measured during render; the first pass runs
in an effect, so the server and the first client render agree. One
`ResizeObserver` on the bar, one on the units, and the `MutationObserver` the
family already ran; the collapsed set is written only when it changes, so an
animating panel produces one DOM write per boundary crossed rather than one per
frame.

**Changelog and migration.** One type is renamed — `ToolbarOverflow` becomes
`ToolbarOverflowMode`, so the name can go to the part — and the move is a
rewritten import with no runtime change. Nothing else is removed or changed in
meaning: a bar authored against the family as it shipped on 2026-09-03 renders
identically.

## Evidence

| What                          | Where                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract and its test         | `specs/components/toolbar/contract.json`, `specs/components/toolbar/contract.test.mjs` — 24 tests                                          |
| Arithmetic                    | `packages/core/src/overflow/collapse.ts`, `collapse.test.ts` — 11 tests, no layout engine                                                  |
| The ring's new rule           | `packages/core/src/focus/arrow-navigation.ts`, `arrow-navigation.test.ts` — 13 tests, four of them the new rule                                                        |
| Behaviour, React              | `packages/react/src/toolbar/toolbar.test.tsx` — 24 tests, nine of them the collapse                                                            |
| Behaviour, Angular            | `packages/angular/toolbar/src/toolbar.spec.ts` — 18 tests, seven of them the collapse, run with `ng test slotted-angular --include='**/toolbar/**/*.spec.ts'` |
| Stylesheet                    | `packages/styles/src/toolbar/toolbar.css`, `toolbar.styles.test.mjs` — 19 tests                                                            |
| Harness                       | `packages/styles/src/toolbar/toolbar.harness.html`, scene `overflowMenu`; `tools/harness/out/toolbar.html`                                  |
| Captures read                 | light/dark/high-contrast at 420, light at 240 and 720, dense, RTL, and `--focus "[data-part='overflow']"` in light and dark                 |
| Reference page, React         | `http://localhost:6006/iframe.html?viewMode=docs&id=components-toolbar--reference` at 1280 and 620, light and dark; audit clean at both     |
| Reference page, Angular       | not read; the running server 404s on the story module and needs the restart the briefing says to ask for                                    |
