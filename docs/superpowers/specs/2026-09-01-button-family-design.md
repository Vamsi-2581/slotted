# Button family — rebuild design

Wave 2 opener. Invocation `button icon-button`. Mode: rebuild — the family
leaves `specs/legacy-families.json` and moves to schema 5.

**Revised after the human gate refused the first pass.** Sections 3, 5, 7, 8 and
a new section 10 carry the second set of decisions; everything else stood.

## 1. One family, four members

IconButton stays a **member** of the family `button` rather than becoming a
family of its own.

`docs/BUILD-LOG.md` already settled the test while Stack, Inline and Grid were
built: three families exist there because they are three engines, and the entry
names Button as the opposite case — "one control with different jobs" under one
identifier. Button and IconButton are one engine: one surface, one state
machine, one geometry scale, one set of tones. A second identifier would
publish `[data-ui='icon-button']` for an element whose every visual decision is
made by `button.css`, and `tools/harness/build.mjs` reads exactly one
stylesheet per family, so the split would force the surface to be written
twice.

The invocation names the pair of components, not a pair of families.

| Member         | Element  | Job                                                    |
| -------------- | -------- | ------------------------------------------------------ |
| `button`       | `button` | A momentary action.                                    |
| `buttonLink`   | `a`      | Navigation wearing the action surface.                 |
| `iconButton`   | `button` | A square action whose only content is one icon.        |
| `toggleButton` | `button` | A two-state action holding `aria-pressed`.             |

Every root carries `data-ui="button"` and `data-part="root"`.

`buttonGroup` leaves the family. `docs/rebuild-order.md` lists `button-group`
as the next invocation in mode **novo**, so the current one is expected to be
discarded rather than carried forward, and its stylesheet cannot stay in this
directory once the law tests reach it.

## 2. Identifying a member in the DOM

Members are not part of the state vocabulary, and none of them needs to be: the
only member whose geometry differs is `iconButton`, and what differs is its
shape. It therefore carries the family's `shape` axis — `square` or `circle` —
and the absence of `data-shape` is what a text button is.

A consumer selects an icon-only button with `[data-ui='button'][data-shape]`,
a circular one with `[data-shape='circle']`. No private attribute is promoted
to contract to say the same thing.

## 3. Axes

| Axis      | Values                                             | Members            |
| --------- | -------------------------------------------------- | ------------------ |
| `tone`    | `accent` `secondary` `success` `warning` `danger`  | all                |
| `variant` | `solid` `outline` `ghost`                          | all                |
| `size`    | `sm` `md` `lg`                                     | all                |
| `shape`   | `square` `circle`                                  | `iconButton`       |

`tone` and `variant` replace today's `variant` and `fill`. The five colours are
what `docs/token-foundation.md` calls tones, and calling a tone a variant made
`variant="danger"` a name that hides what it selects.

`soft` was in the first pass and is not here. It read
`--slotted-tone-<t>-surface`, the one semantic role in each tone the family
never consumed, and the argument for it was that a low-emphasis action would
otherwise have to be an outline button. Rendered, the pale tinted fill read as a
control on its way to being unavailable rather than as a quieter action, and
three ways to paint one tone is one more than a page can tell apart at a glance.
The reviewer refused it, and the refusal is right. A bounded quiet action is
`outline`; an unbounded one is `ghost`. The `surface` role stays with the
families a tinted rectangle actually is: `badge`, `tag`, `alert`.

**Contract break, and how a consumer moves.** `variant="soft"` no longer
resolves. Move it to `variant="outline"` where the action needed a boundary, and
to `variant="ghost"` where it did not.

## 4. Anatomy

```html
<button data-ui="button" data-part="root" data-tone="accent" data-variant="solid" data-size="md">
  <span data-part="start">…</span>
  <span data-part="label">Save changes</span>
  <span data-part="end">…</span>
  <span data-part="indicator" aria-hidden="true">…</span>
</button>
```

`iconButton` renders `root`, `icon` and `indicator`. `indicator` exists only
while `loading` is true.

There is no content wrapper. `loading` hides the other children with
`opacity: 0` — which leaves them in the accessibility tree, so the accessible
name survives — and paints the indicator out of flow over the whole box, so the
inline size never changes.

## 5. State

| State      | Attribute       | Held by                                       |
| ---------- | --------------- | --------------------------------------------- |
| `disabled` | `data-disabled` | all                                           |
| `loading`  | `data-loading`  | `button`, `iconButton`, `toggleButton`        |
| `pressed`  | `data-pressed`  | `toggleButton`, `iconButton`                  |

`toggleButton` gained `loading` in the second pass. A toggle that persists is
the common one — "Follow", "Subscribe" and "Watch" all reach a server before the
state is true — and Fluent's ToggleButton and Chakra's pressed Button both wait.
While it waits it holds the state it still has, so nobody is shown a value that
has not been agreed to.

`pressed` is the family's only mutable capability.

```json
"stateModel": {
  "pressed": {
    "controlled": "pressed",
    "uncontrolled": "defaultPressed",
    "request": "onPressedChange",
    "reasons": ["pointer", "keyboard"]
  }
}
```

The reason is real rather than decorative: a native button fires one `click`
for pointer, Space and Enter, and `event.detail === 0` is what separates the
keyboard activation from the pointer one.

`pressed` belongs to `toggleButton` and to `iconButton`, and not to `button`.
The guide is explicit that Button is a momentary action and that persistent
state belongs to a toggle, so a text button cannot acquire `aria-pressed` by
passing one more prop. `iconButton` takes it directly instead of gaining a
fifth member: its accessible name is already an explicit `aria-label` that must
be state-independent, so toggling adds no obligation a separate member would
have to enforce. A text button's name is its visible label, and a label that
changes with the state is the mistake the APG names; making the consumer reach
for `ToggleButton` is what makes that obligation visible.

## 6. Bindings for the request

| Concept        | React                                                  | Angular                                       |
| -------------- | ------------------------------------------------------ | --------------------------------------------- |
| current value  | `pressed`                                              | `[pressed]`                                   |
| initial value  | `defaultPressed`                                       | `[defaultPressed]`                            |
| the request    | `onPressedChange(pressed, request)`                    | `(pressedChange)` emitting the request        |

Both carry the value, the value it replaces, the reason, the originating event
and `cancel()`. Angular offers no `[(pressed)]`: a two-way binding has one slot
and cannot carry a reason or a cancellation, and emitting a second output for
the same transition is the failure `docs/state-and-events.md` names.

`@slotted/core/state` owns the mode decision in both bindings. React builds the
controllable per render over its own `useState`, which keeps `createControllable`
the single answer to "who owns this value" without pushing a mutable object
through a React render.

## 7. Tokens

The family stops declaring component tokens. All twenty-six leave
`packages/tokens/src/contract.json`; the three that belong to ButtonGroup leave
with it, and every other one had a foundation token behind it already:

| Removed                                          | Read instead                                            |
| ------------------------------------------------ | ------------------------------------------------------- |
| `--slotted-button-height/padding-inline/font-size/icon-size-*` | the identical `--slotted-control-*` they aliased |
| `--slotted-button-gap`                           | `--slotted-control-gap-*`, so the gap follows density    |
| `--slotted-button-radius-sm/md/lg`               | `--slotted-control-radius`                               |
| `--slotted-button-outline-background`, `-ghost-background` | `transparent`                                  |
| `--slotted-button-ghost-text-decoration`         | nothing: a button is not a link                          |
| `--slotted-button-loading-opacity`               | nothing: the spinner and `aria-busy` say it              |
| `--slotted-button-loading-indicator-size`        | the size's own icon size, so the ring matches the glyph  |
| `--slotted-button-loading-indicator-stroke-width`| `--slotted-border-width-thick`, its current value        |
| `--slotted-button-loading-indicator-duration`    | `--slotted-duration-loop-fast`, its current value        |

The density aliases are what `docs/token-foundation.md` calls "legacy Button
aliases"; the rebuild is the moment they stop being read. Reading
`--slotted-control-height-*` directly is also what makes the theme's
`@media (pointer: coarse)` block reach this family, because that block raises
the control tokens and never raised the aliases.

Three radii of 7, 6 and 5 pixels are dropped rather than kept: a small control
reading rounder than a large one is a scale nothing else in the library shares,
and a button is a control, so it takes `--slotted-control-radius` like every
other one. Only `shape="circle"` departs, at `--slotted-radius-full`.

Cost: `packages/styles/src/kbd/kbd.css` reads
`--slotted-button-outline-background` as the fallback of an undefined
`--slotted-kbd-background`. Removing the token leaves that declaration invalid
at computed-value time, and `background-color` then computes to its initial
value, `transparent` — the same pixel it paints today. `kbd` is rebuilt later in
this same wave and stops borrowing from another family then.

## 8. Visual decisions

- **Wrapping.** The label wraps instead of overflowing. `white-space: nowrap`
  at 240 pixels pushes a long action past the edge of its container, and
  `overflow-wrap: anywhere` plus a wrapping line height on the label part is the
  answer Typography already took for the same problem. `padding-block` keeps a
  wrapped label off its own border.
- **Disabled per variant.** A disabled ghost button stays flat. Painting
  `--slotted-disabled-background` on every variant turns a flat control into a
  grey box on the way to being unavailable, which reads as a different control
  rather than the same one unavailable.
- **Pressed.** A pressed toggle takes the tone's solid fill whatever its
  variant, so "on" is never a shade away from "hovered", and it draws one edge
  like every other control. The first pass grew the border to add weight, which
  moved every control in the row; the second drew a ring inside the border,
  which cost no space and read as a control with two edges. Neither survived the
  gate. The fill is the state, and `aria-pressed` is what announces it.
- **Loading under reduced motion.** The ring stops rather than slows, as the
  motion law requires. It stays drawn as a broken ring: stillness plus
  `aria-busy` carries the state, and no state in this family depends on motion
  to be understood.

## 9. Accessibility

Native `button` and native `a`, so role, Space, Enter, focus and the disabled
behaviour are the platform's. The family adds `aria-busy` while loading,
`aria-pressed` on the toggles, and a mandatory `aria-label` or `aria-labelledby`
on `iconButton`.

A disabled `buttonLink` renders **no** `href`, plus `role="link"`,
`aria-disabled="true"` and `tabindex="0"`. An anchor that keeps its `href` and
only blocks `click` still navigates on middle-click and on ctrl-click; removing
the destination is what actually disables it. Keeping it focusable is
deliberate: a control a keyboard user cannot reach is a control they cannot
discover is unavailable.

## 10. What the second pass changed, and why

The first pass reached the gate and was refused: the appearance, `soft`, a
layout shift on the toggle, missing features, no refinement. Section 3 covers
`soft` and section 5 the toggle's wait. The rest:

### Nothing moves when a state changes

Two defects, one reported and one not.

`[data-pressed]` raised `border-width` from thin to thick, with a comment
claiming a border-box control does not change size. That holds only for a
definite size: a button is intrinsically sized, so its inline size is content
plus padding plus border. The weight moved to a pseudo-element ring.

`padding-block: var(--slotted-space-2)` is added to the label's line box, so at
the `dense` density — small 24px, medium 26px, line box 17.4px — four pixels of
padding took both steps to the same 27.4 pixels. Two steps of the scale had
collapsed into one and the density no longer meant the height the theme states.
The padding is gone; the half-leading of the label's own line height keeps a
wrapped second line off the border, and it is the same three pixels.

`packages/styles/src/button/button.styles.test.mjs` now walks every stateful
selector and refuses a geometry property under any of them.

### The edge of a control

Three decisions, in the order they were made.

1. An outline button's edge is neutral (`--slotted-border-strong`) and its
   label carries the tone. A saturated border on all five tones turned a row of
   actions into a row of status chips.
2. A solid button's edge is its own fill. Drawing it in the tone's `border` role
   put a lighter rim around a darker fill, which reads as a halo rather than as
   an edge.
3. One fill cannot be its own edge. Against the surface it sits on,
   `--slotted-tone-secondary-solid` is 1.23:1 in light, 1.25:1 in dark and
   1.00:1 in `high-contrast`, where it is the page's own white, and a control
   with no edge at all cannot be found. It takes the next step of its own ramp —
   `--_solid-hover`, one shade darker than the resting fill — through `--_edge`,
   and nothing stronger.

   Two stronger answers were tried and refused at the gate: `--slotted-border-strong`,
   a neutral, which reads as a line laid over the control rather than as the
   edge of it; and the tone's own `border` role, which is far too loud for a
   quiet control and turns a filled neutral button into an outline button
   wearing a fill. `warning` was given an edge under the same reasoning and
   should not have been: its fill is its edge, like the other three.

   With `--_border` unread, the family no longer consumes the tone `border` role
   at all.

### The wait

The ring takes the first visual slot the control has, and the glyph in that slot
fades under it. The box was already the size of the ring, so the label stays
readable and nothing moves — Primer's decision, and the one that stops a loading
button from being a coloured rectangle with nothing in it. A control with no
visual slot has nowhere else to put the ring, so it centres one and the
stylesheet fades the label, in the flow and in the accessibility tree.

The glyph fades rather than being swapped out because that is the one shape both
bindings can render identically: Angular projects the consumer's own element
into the slot and cannot take it back out.

The wait is announced by a named `progressbar`, with the control carrying
`aria-disabled` and keeping focus. `aria-busy` is gone: it is not reliably
announced on a button, and two mechanisms for one fact is one too many. React
Aria's pending button and Primer's loading button take the same shape.

`loadingDelay` separates the refusal from the picture. The activation is refused
from the first millisecond; the ring can wait, so a ninety-millisecond action
does not flash a spinner. Ant Design is the only surveyed library that separates
the two.

### Being unavailable without becoming unreachable

`focusableWhenDisabled` renders `aria-disabled` and no `disabled` attribute, and
the family refuses the activation itself in the capture phase — which also stops
a `type="submit"` button from submitting. Fluent ships it as `disabledFocusable`,
Primer as `inactive`, and React Aria's pending button implies it. It is the
shape of the `disabled` capability rather than a capability of its own:
`focusable` already exists in the shared vocabulary meaning something else.

### Substituting the element, and setting defaults once

React gains `render` on every member, the shape `ButtonLink` already had. The
props are a button element's, because the element stays a button — navigation
wearing this surface is `ButtonLink`.

Angular needs no equivalent and gets none. Every member there is a directive on
the element the consumer wrote, so substituting it is done by writing a
different element, and `routerLink`, `form` or a directive from another library
goes on that same element. Recording the asymmetry rather than levelling both
bindings down to the smaller shape.

Both bindings gain the defaults the family had no way to set once:
`ButtonDefaultsProvider` in React and `provideButtonDefaults` in Angular, the
pattern `card` already ships. Every axis is optional, which is the difference
from a family with one member: the four members disagree about their own
defaults on purpose, so a provider that filled every axis would flatten them
into one appearance the moment an application set a single value.
