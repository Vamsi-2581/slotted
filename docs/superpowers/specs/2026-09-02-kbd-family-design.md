# Kbd family design

Wave 2, guide section 5 (“Keyboard Shortcut / Kbd”). The mode written in
`docs/build-order.md` is `refazer`; the family was removed with the other
twenty on 2 September 2026, so the work builds it from nothing and the previous
public API is recorded here as a break rather than carried.

The scope paragraph reads: “combinação localizada por plataforma, com nome
acessível. Não registra atalho nenhum. Lê `--slotted-font-family-mono`.” That is
the floor. What the inventory below adds to it is named row by row.

## Capability inventory

### Surveyed

Twelve implementations plus the platform, read on 2 September 2026. Sources
chosen to disagree: five ship a painted box and nothing else, two resolve a key
token to a symbol, one supplies a spoken name for that symbol, one groups keys,
and the platform itself defines the element and its accessibility mapping.

| Source | Reference | What it calls the family |
| ------ | --------- | ------------------------ |
| HTML Standard | <https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element> | `kbd`. Phrasing content, phrasing content model. “Nesting a `kbd` element within another `kbd` element represents an actual key or other unit of input as a portion of a larger input.” |
| ARIA in HTML (W3C REC, 11 August 2026) | <https://www.w3.org/TR/html-aria/> | `kbd` → **No corresponding role**, **any role** allowed, **Naming Prohibited**. Only global `aria-*` attributes apply. |
| MDN | <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd> | Nesting conventions for `kbd`/`samp`; “Representing keystrokes within an input” is the nested form |
| shadcn/ui | <https://ui.shadcn.com/docs/components/kbd> | `Kbd` + `KbdGroup` (`Kbd KbdGroup ├── Kbd └── Kbd`). `className` only. Symbols authored by hand (`<Kbd>⌘</Kbd>`). Documents a Button, Tooltip, Input Group and RTL example |
| Chakra UI v3 | <https://chakra-ui.com/docs/components/kbd> | `Kbd` with `variant` `raised\|outline\|subtle\|plain` (default `raised`), `size` `sm\|md\|lg` (default `md`), `colorPalette` ×10, `as`, `asChild`. Combinations are one `Kbd` holding `ctrl+shift+del` as text |
| Radix Themes | <https://www.radix-ui.com/themes/docs/components/kbd> | `Kbd` with `size` `Responsive<enum>`, `variant` `classic\|soft` (default `classic`), `asChild`. Combination is one `Kbd` holding `Shift + Tab` |
| Mantine | <https://mantine.dev/core/kbd/>, <https://mantine.dev/llms/core-kbd.md> | `Kbd` with `size`. The documented combination is `<Kbd>⌘</Kbd> + <Kbd>Shift</Kbd> + <Kbd>M</Kbd>` inside a `dir="ltr"` wrapper the consumer writes |
| Nuxt UI v4 | <https://ui.nuxt.com/components/kbd>, `src/runtime/composables/useKbd.ts` | `UKbd` with `value`, `color` ×7, `variant` `outline\|soft\|subtle\|solid` (default `outline`), `size` `sm\|md\|lg`, `as`. `useKbd` holds `kbdKeysMap` (`meta ⌘`, `command ⌘`, `shift ⇧`, `control ⌃`, `option ⌥`, `enter ↵`, `delete ⌦`, `backspace ⌫`, `escape Esc`, `win ⊞`, arrows, …) and resolves `meta`/`ctrl`/`alt` per platform |
| HeroUI v3 | <https://www.heroui.com/docs/components/kbd> | `Kbd` / `Kbd.Abbr` / `Kbd.Content`. `Kbd.Abbr title="Command"` is the accessible-name mechanism for `⌘`. `keyValue` vocabulary: `command shift ctrl option alt win` / `enter delete escape tab space capslock help` / `up down left right pageup pagedown home end` / `fn` |
| React Spectrum | <https://react-spectrum.adobe.com/react-spectrum/Keyboard.html> | `Keyboard`. “Represents text that specifies a keyboard command.” Provides no styling of its own; it is placed and painted by the container (`Menu`) |
| Primer | <https://primer.style/css/components/kbd> | a `.Kbd` CSS class on `kbd`. No component API |
| Polaris | <https://polaris-react.shopify.com/components/utilities/keyboard-key> | `KeyboardKey`, a painted single key |
| Angular Material / CDK, Base UI, Ark UI, Radix Primitives, Fluent v9, Carbon, PatternFly | — | ship no `kbd` family at all |

Conventions the family has to obey, sourced rather than recalled:

- **Modifier order, macOS.** Apple Style Guide: Fn, Control, Option, Shift,
  Command — “the order is similar to how the keys appear on the keyboard
  itself”. Read via
  <https://daringfireball.net/2026/03/modifier_key_order_for_keyboard_shortcuts>
  and <https://leancrew.com/all-this/2017/11/modifier-key-order/>.
- **Modifier order and joining, Windows.** Microsoft writes accelerators as
  `Ctrl + Shift + N`, `Ctrl + Alt + V` — modifier words joined by `+`:
  <https://learn.microsoft.com/en-us/windows/apps/design/input/keyboard-accelerators>.
- **APG.** There is **no kbd pattern**. The pattern index at
  <https://www.w3.org/WAI/ARIA/apg/patterns/> runs Accordion → Treeview and
  contains no entry; the string does not occur on the page. The applicable
  official guidance is the platform's — the `kbd` element above, and the APG
  keyboard-interface practice
  (<https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/>) for the
  conventions a shortcut is drawn from.
- **WCAG 2.2 2.1.4 Character Key Shortcuts**
  (<https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html>)
  binds whoever *registers* a shortcut. This family registers none, which is
  the guide's own rule, so the criterion is the consumer's — and the family
  says so on its page rather than implying it has met it.

### Table stakes

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| Painted single key on `<kbd>` | all twelve | adopt | `root`, the `kbd` element, `data-ui="kbd"` |
| `size` step | Chakra, Radix, Nuxt, Mantine, HeroUI | adopt | `sm\|md\|lg`, from the control type scale, so a key shrinks with density beside the controls it sits with |
| Painting axis | Chakra (`raised\|outline\|subtle\|plain`), Nuxt (`outline\|soft\|subtle\|solid`), Radix (`classic\|soft`) | adapt | `variant: raised\|outline\|soft\|plain`. `raised` is Chakra's and Radix's default and the only one that looks like a key; `soft` is the library's own word for a tinted ground, already owned by `badge`; `plain` is the menu-row form |
| Element substitution | Radix `asChild`, Chakra `as`/`asChild`, Nuxt `as` | adopt | `render` in React, the directive on the consumer's own `<kbd>` in Angular |
| Grouping several keys into one shortcut | shadcn `KbdGroup`, HeroUI `Kbd.Content` siblings, Chakra and Mantine by hand | adapt | the `shortcut` part — an outer `<kbd>` holding key `<kbd>`s, which is what the HTML Standard says the nested form means. shadcn's group is a `div` and carries no semantics |
| Key token → symbol | Nuxt `kbdKeysMap`, HeroUI `keyValue` | adopt | `@slotted/core/keys`, a vocabulary of 30 tokens with a legend per platform |
| Platform-resolved modifier | Nuxt `useKbd` (`meta`, `ctrl`, `alt`) | adapt | resolved, and split in two: `mod` is the platform's primary accelerator (⌘ / Ctrl) and `meta` is the actual Meta key (⌘ / ⊞ Win). Nuxt conflates them, so a Windows user is told to press ⌘ or a Mac user to press the Windows key, depending on which meaning the author had |
| A spoken name for a symbol | HeroUI `Kbd.Abbr title` | adapt | a `name` part carrying the word, hidden from view by `visually-hidden`. `title` is not announced by every screen reader, is unreachable by keyboard and is invisible on touch; and `aria-label` is not available, because ARIA in HTML declares `kbd` **Naming Prohibited** |
| `colorPalette` / `color` tone | Chakra, Nuxt | **decline** | A key cap depicts a physical object; its colour belongs to the keyboard, not to the message. The five tones exist to carry meaning, and a red ⌘ says nothing about the shortcut — where a shortcut carries a tone it is the row that carries it, and `alert`, `inline-message` and `tag` own that. The composition, for an application that wants one anyway: `[data-ui='kbd'] { --slotted-kbd-background: var(--slotted-tone-danger-surface); --slotted-kbd-color: var(--slotted-tone-danger-text); --slotted-kbd-border-color: var(--slotted-tone-danger-border); }` |
| Registering the shortcut | none of the twelve | decline | The guide states it (“não registra atalho nenhum”) and every surveyed implementation agrees. A component that both draws and binds a shortcut owns WCAG 2.2 2.1.4 on the consumer's behalf and cannot honour it, because only the application knows whether a single-character shortcut can be turned off |

### Differentiators

| Capability | Nobody ships it | Why this library can |
| ---------- | --------------- | -------------------- |
| The nested `<kbd>` the HTML Standard defines | shadcn's group is a `div`; Chakra and Radix put the whole combination inside one `kbd` as text | The contract is written before the markup, so the correct element is not a refactor |
| Modifier reordering to the platform's convention | every surveyed implementation renders the author's order verbatim | `mod+shift+ctrl+k` written once renders `⌃⇧⌘K` on macOS and `Ctrl+Shift+K` on Windows. The escape hatch is composition: a `Shortcut` with authored `Kbd` children is rendered in the order written |
| Joining by platform | all render a separator, or none, unconditionally | macOS writes `⌘⇧K` with no `+`; Windows writes `Ctrl+Shift+K`. The separator is a part that is not rendered at all where the platform does not use one |
| Key sequences | none | `keys="g i"` renders `G then I` — the Gmail, Linear and GitHub form. Whitespace joins steps, `+` joins simultaneous keys, and both separator words are replaceable |
| Platform pinned without a flash | Nuxt resolves in `onMounted`, so a server-rendered `Ctrl` becomes `⌘` after hydration | `platform` is an input and an application-level default. `auto` reads `navigator.userAgentData.platform` before `navigator.platform` and answers `other` where there is no `navigator`. React resolves it through `useSyncExternalStore`, which is the only shape that is right in both cases: a client-rendered page takes the real answer on its first pass, so there is no flash, and a hydrating page takes `other` until hydration finishes, so there is no mismatch. Angular has no equivalent and resolves synchronously in the browser, with a development-mode warning on the server — the asymmetry is recorded below rather than levelled down |
| Legends and names replaceable per application | Nuxt's map is a module constant; HeroUI's `title` is per instance only | `legends` and `names` on the defaults provider, so `Strg`, `Échap` and `Entrar` are one decision rather than one per shortcut |
| Three schemes, three densities, RTL | none of the twelve ships more than light and dark | The foundation. `high-contrast` and `dense` are captured before the gate |

### Gaps

| Gap | What a real product hits | What this family does |
| --- | ------------------------ | --------------------- |
| A key inside text that is not 13 pixels | Every surveyed `size` is absolute, so a `<kbd>` in an `<h2>` is a stamp and one in fine print is a slab | `size="inherit"` sizes the cap from the text around it. It is the value prose should use, and no surveyed implementation has it |
| A symbol read aloud as its Unicode name | `⌘` is U+2318 PLACE OF INTEREST SIGN; `⌥` is U+2325 OPTION KEY; a screen reader reads what it finds | Every key in the vocabulary hides its legend and carries the word. Only a token outside the vocabulary — a letter, an application's own word — is read as written |
| An abbreviation read as an abbreviation | `Ctrl` is announced “control” by some screen readers and spelled by others | The same mechanism covers it: the legend `Ctrl` is hidden and the name is `Control`, so what is heard does not depend on the reader's pronunciation dictionary |
| A shortcut wider than its column | A menu row at 240 pixels holding `Ctrl+Shift+Backspace` | The shortcut wraps between caps and never inside one. A key label is never truncated: a half-written key is a wrong instruction, where a wrapped one is only a taller row |
| A literal `+` in a shortcut | `Ctrl` and the plus key — every string grammar in the field breaks on it | `plus` is a token. The grammar has no ambiguity because every separator has a named key |
| A disabled shortcut | A menu item that is unavailable dims its label by inheritance; a painted cap keeps its ground and stays bright | `disabled` is a presentational state on the cap. It writes no `aria-disabled`, because the item owns the semantics and `kbd` may not carry that attribute |

## Anatomy

One member, `kbd`, and five parts — the shape `badge` proved, where one part
contains the family's root instead of sitting inside it.

| Part | Element | Always | What it is |
| ---- | ------- | ------ | ---------- |
| `root` | `kbd` | yes | One key. Carries `data-ui="kbd"`, the axes, and `data-key` when the token is in the vocabulary |
| `legend` | `span` | yes | What the eye sees. `aria-hidden` when the key is in the vocabulary |
| `name` | `span` | no | What a reader hears, hidden from view by this family's own rule rather than by the `visually-hidden` family. Rendered only when the legend is not the word |
| `shortcut` | `kbd` | no | The whole combination. Holds `root`s, so it carries `data-ui="kbd"` itself |
| `separator` | `span` | no | Between two keys. `+` between simultaneous keys, hidden from assistive technology; the word `then` between two steps, which is read |

```html
<kbd data-ui="kbd" data-part="shortcut" data-platform="windows" data-size="md" data-variant="raised">
  <kbd data-ui="kbd" data-part="root" data-key="mod" data-size="md" data-variant="raised">
    <span data-part="legend" aria-hidden="true">Ctrl</span>
    <span data-part="name">Control</span>
  </kbd>
  <span data-part="separator" aria-hidden="true">+</span>
  <kbd data-ui="kbd" data-part="root" data-size="md" data-variant="raised">
    <span data-part="legend">K</span>
  </kbd>
</kbd>
```

## Axes and defaults

| Axis | Values | Default | Note |
| ---- | ------ | ------- | ---- |
| `size` | `sm` `md` `lg` `inherit` | `md` | The first three read the control type scale and answer density; `inherit` reads the surrounding text |
| `variant` | `raised` `outline` `soft` `plain` | `raised` | |
| `platform` | `auto` `mac` `windows` `linux` `other` | `auto` | |

Other defaults: `separator` `+`, `thenLabel` `then`.

`raised` draws its bottom edge as a thicker border rather than a shadow.
Chrome drops `box-shadow` outright under `forced-colors: active` — measured
while `badge` was built and recorded in `docs/BUILD-LOG.md` — so a raised key
made of a shadow is a flat key exactly where the reader most needs the
affordance. A border survives, and a face sitting a half pixel above its own
bottom edge is what a keycap looks like anyway.

## State

The family holds no mutable value. Nothing here can be controlled or
uncontrolled, no request is emitted, and the contract therefore declares no
`stateModel`.

States: `default` and `disabled`. `disabled` is presentational only.

## Motion

One transition, on `background-color`, `border-color` and `color`, from
`--slotted-control-transition-duration` and `--slotted-control-transition-easing`.

The reason is the one state pair the family has. A menu row that becomes
unavailable fades, and a key cap inside it that snapped would be the only thing
on the row that moved instantly. Every other pair — there are none — animates
nothing. No looping animation exists, so nothing has to stop under reduced
motion beyond what the theme already collapses.

## Accessibility

- `kbd` has **no corresponding role** and is **Naming Prohibited**
  (ARIA in HTML, W3C REC 11 August 2026). The family therefore writes no
  `role`, no `aria-label` and no `aria-disabled`, and every word a reader hears
  is content.
- A key in the vocabulary hides its legend with `aria-hidden` and carries the
  word in a `name` part that this family hides itself. The rule is restated in
  `kbd.css` rather than borrowed from the `visually-hidden` family: an
  accessible name that disappears when a consumer forgets an import is not one. `⌘` is announced “Command”, `Ctrl`
  is announced “Control”, `↑` is announced “Up arrow”.
- The `+` separator is `aria-hidden`: it is punctuation joining two caps, and
  “Command Shift K” is what the operating systems announce for the same
  shortcut. The `then` separator is **not** hidden, because it is the only
  thing that distinguishes a sequence from a combination.
- Nothing here is focusable, and nothing here binds a key. WCAG 2.2 2.1.4
  Character Key Shortcuts belongs to whoever registers the shortcut, and the
  page says so.
- Arrow legends are never mirrored in a right-to-left document: `←` is the
  physical Left arrow key, not a direction of travel.
- The order of the keys inside a shortcut is pinned to the writing direction it
  was authored in. A combination is one formula, and the bidi algorithm renders
  the same string as one left-to-right run inside an Arabic paragraph; a
  mirrored `K + ⌘` is a shortcut no operating system displays. The shortcut as
  a whole still sits where the paragraph puts it.

## Ecosystem integration

### React

| Question | Answer |
| -------- | ------ |
| Controlled / uncontrolled pair plus a request carrying a reason | **No.** The family holds no mutable value; every value it shows is one the consumer owns |
| Application-wide defaults | **Yes.** `KbdDefaultsProvider` and `useKbdDefaults` — `platform`, `size`, `variant`, `separator`, `thenLabel`, `legends`, `names` |
| Substitute the rendered element of each public part | **Yes.** `render` on `Kbd` and on `Shortcut` |
| Consumer's handler still runs | **Yes**, trivially: the family attaches none, so every native handler reaches the element unchanged |
| Native element and imperative action | **Yes** for the element, through `ref`. **No** imperative handle: the family has no action a consumer cannot express declaratively |
| Server render without a hydration mismatch | **Yes**, through `useSyncExternalStore`. Resolving during render would have removed the flash and produced a mismatch; resolving after mount would have removed the mismatch and produced the flash. The server snapshot is `other`, the client snapshot is the real platform, and React uses the first only while hydrating. An application that wants neither pins `platform` on the provider |
| Every state a consumer may style is in the DOM | **Yes.** `data-ui`, `data-part`, `data-key`, `data-size`, `data-variant`, `data-platform`, `data-disabled` |
| Props type is the native element's, extended | **Yes.** `ComponentPropsWithRef<'kbd'>` |

### Angular

| Question | Answer |
| -------- | ------ |
| Two-way value in the signal form | **No.** There is no two-way value. Every input is `input()`, and there is no `output()` because nothing is requested |
| Reactive Forms and template forms | **No.** A `kbd` is not a form control and holds no value to write back |
| Application-wide defaults | **Yes.** `KBD_DEFAULTS` and `provideKbdDefaults()` |
| Template reaches the instance | **Yes.** `exportAs: 'slKbd'` and `exportAs: 'slShortcut'` |
| Projected content, kept lazy | **Yes.** `Shortcut` projects authored `Kbd` children through `ng-content`, and renders its own only when `keys` is given |
| Zoneless and `OnPush` | **Yes.** `input()` and `computed()` throughout, `ChangeDetectionStrategy.OnPush` |
| Every subscription torn down | **No subscription exists.** Platform resolution is a synchronous read, taken once |
| A static attribute the consumer wrote survives | **Yes.** `HostAttributeToken` reads `data-key` and `title` before the host bindings write |
| Entry point stays a single class | **Yes**, imported through `@slotted/angular/kbd` |

The asymmetry worth recording: React ships `render` and Angular does not need
it, because the Angular binding is a directive the consumer writes on their own
`<kbd>` — the element substitution React needs a prop for is Angular's default.

## What the visual loop changed

Eight decisions in this document were made at a desk and corrected in front of
a capture. They are listed because the correction is the evidence, not the
design:

1. **A mark is not set in the monospaced face.** The face is chosen for its
   Latin, and its symbol coverage is incidental: `⌘ ⇧ ⌥ ⌃ ↩ ⌫ ↑` all rendered
   visibly thinner and smaller than `Esc` in the same cap — a shortcut whose
   modifiers whisper and whose letter shouts. A mark takes the interface face at
   `1.15em`.
2. **A mark is not trimmed.** `cap alphabetic` are Latin metrics, and a box
   trimmed to them centres the cap band; `⌘`, `↩` and `⌫` sat visibly high in it.
   Left untrimmed, what gets centred is the em box, which is where a mark is
   drawn. The trim stays for every word.
3. **A Mac combination is one step tighter.** At the shared gap, `⌥⇧⌘P` and
   `⌘K` on the same line read as one run of six keys: with no separator, the gap
   was the only thing holding a combination together and it was exactly the
   distance between two of them.
4. **`outline` takes no ink of its own.** Read on `--slotted-surface-inverse`,
   an outlined key kept `--slotted-text` and was near-black type on a near-black
   ground — the variant that exists to survive an unknown surface was the one
   that could not.
5. **`soft` draws the tone's edge.** In the `high-contrast` scheme the neutral
   surface is the page's own white, and the chip was gone outright: `Ctrl + B`
   was a run of text.
6. **A combination caps its own width.** An `inline-flex` box is sized by its
   content, so the wrapping this document promised happened only where a
   container narrowed the box. `max-inline-size: 100%` is what makes it true.
7. **The step word gets more air than the plus.** At the shared gap,
   `Ctrl + K then Ctrl + S` was four caps in a row with a word somewhere in it.
8. **No `forced-colors` rule is written at all.** The rule drafted for `soft`
   became unnecessary once the variant carried a real border token: every ground
   this family paints is a token the theme already remaps, and there is no
   filled variant whose edge is its own fill.

Two defects were found in the workbench rather than in the family, and fixed
there with tests, as the briefing requires: `.slotted-demo-surface` was a plain
block, so four examples placed on it touched; and `.slotted-demo-rows` had no
way to show a row whose item is unavailable, which a family whose bare variant
inherits its colour cannot be demonstrated without.

## The contract break

The family that was removed declared `schemaVersion: 4`, one axis
(`size: sm|md`), one capability (`size`), one part (`root`), and a comment
saying a combination “is two elements and a separator the consumer writes,
because the separator is text in their language and the order of modifiers
differs between platforms”. Both of those facts are true and neither is a
reason to ship nothing: they are the two things this family now does.

| Was | Is | How a consumer moves |
| --- | -- | -------------------- |
| `class="slotted-kbd"` | `data-ui="kbd"` | Select on `[data-ui='kbd']`. A class was never contract |
| `data-slotted-component="kbd"` | `data-ui="kbd"` | Rename the attribute |
| `size: 'sm' \| 'md'`, default `md` | `size: 'sm' \| 'md' \| 'lg' \| 'inherit'`, default `md` | `sm` and `md` keep their names; the box is now the type's own line box plus an inset, so both are a little taller |
| — | `variant`, default `raised` | A cap that was flat is now raised. `variant="outline"` restores it |
| a combination written by hand | `<Shortcut keys="mod+k" />` | The hand-written form still works: `<Shortcut>` with `<Kbd>` children renders them in the order written |

## Definition of done — guide section 18

1. **Purpose, use, anti-use.** Shows a key or a combination so a reader can
   find it on their keyboard. Anti-use: binding the shortcut, labelling a
   button, or standing in for a `code` element — `<kbd>` is input, `<code>` is
   source.
2. **Anatomy.** Five parts, tabled above.
3. **Controlled / uncontrolled.** None; nothing is mutable.
4. **State matrix.** `default` and `disabled`, one axis of precedence, no
   combination.
5. **Keyboard, focus, ARIA, touch, screen reader.** Not focusable, no keyboard,
   no role, names as content. Tabled above.
6. **Recipes.** `size` ×4, `variant` ×4, `platform` ×5, all through tokens.
7. **Responsive, RTL, locale, reduced motion.** Wraps between caps; sequence
   pinned to the authored direction; legends and names replaceable per
   application; one transition, collapsed by the theme.
8. **Loading, empty, error, disabled, extreme content.** No loading and no
   error — the family fetches nothing. Empty: a `Shortcut` with neither `keys`
   nor children renders nothing rather than an empty cap. Extreme: the longest
   real key name in a 240-pixel column.
9. **SSR, performance, virtualization.** Resolution is synchronous and
   allocation-free per key; the vocabulary is one frozen object.
10. **Examples.** Eleven scenarios, listed in the contract.
11. **Shared behavioural tests.** `@slotted/core/keys` is tested once and both
    bindings assert the rendered result.
12. **Changelog and migration.** The break table above, repeated in
    `docs/BUILD-LOG.md`.
