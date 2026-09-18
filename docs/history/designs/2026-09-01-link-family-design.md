# Link family design

Rebuild of `link` against schema 5 and the token foundation. Wave 2, mode
`refazer`, guide section 5. The public API breaks; the moves are at the end.

## Capability inventory

### Surveyed

Ten implementations plus the platform, read on 1 September 2026.

| Source | Reference | What it calls the family |
| ------ | --------- | ------------------------ |
| WAI-ARIA APG | <https://www.w3.org/WAI/ARIA/apg/patterns/link/> | Link pattern; `role="link"`, with a note that a native `<a href>` is strongly preferred |
| HTML / MDN | <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a> | `<a>` with `href`, `target`, `rel`, `download`, `hreflang`, `ping`, `referrerpolicy`, `type` |
| React Aria | <https://react-spectrum.adobe.com/react-aria/Link.html> | `Link` with `isDisabled`, `render` for routing, and the data attributes `data-current`, `data-hovered`, `data-pressed`, `data-focused`, `data-focus-visible`, `data-disabled` |
| Fluent UI v9 | <https://github.com/microsoft/fluentui/blob/master/packages/react-components/react-link/library/src/components/Link/Link.types.ts> | `Link` with `appearance: 'default' \| 'subtle'`, `inline`, `disabled`, `disabledFocusable`, root slot `a \| button \| span` |
| Carbon | <https://carbondesignsystem.com/components/link/usage/> and its `Link.tsx` | `Link` with `size: sm \| md \| lg`, `inline`, `visited`, `renderIcon`, `disabled`, `target` (which writes `rel="noopener"`), `aria-current` |
| Primer | <https://primer.style/components/link> | `Link` with `inline`, `muted`, `hoverColor`, `as` |
| Polaris | <https://github.com/Shopify/polaris/blob/main/polaris-react/src/components/Link/Link.tsx> | `Link` with `url`, `target`, `monochrome`, `removeUnderline`, `accessibilityLabel`, `dataPrimaryLink`, `onClick` |
| Radix Themes | <https://www.radix-ui.com/themes/docs/components/link> | `Link` with `underline: auto \| always \| hover \| none`, `size`, `weight`, `trim`, `truncate`, `wrap`, `color`, `highContrast`, `asChild` |
| Chakra v3 | <https://chakra-ui.com/docs/components/link> | `Link` with `variant: underline \| plain`, `colorPalette`, `as`, `asChild`, `_currentPage` keyed on `aria-current` |
| MUI | <https://mui.com/material-ui/react-link/> | `Link` with `underline: none \| hover \| always` (default `always`), `color`, typography `variant`, `component` |
| Mantine | <https://mantine.dev/core/anchor/> | `Anchor` with `underline: always \| hover \| never \| not-hover`, `c`, `component`, and family defaults through the theme |

The Angular ecosystem ships no link component: `RouterLink` and
`RouterLinkActive` are directives on the consumer's own anchor, and
`ariaCurrentWhenActive` is how a current link is announced
(<https://angular.dev/api/router/RouterLink>). That is the shape the Angular
binding has to compose with, not replace.

### Table stakes

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| Native anchor, platform activation | APG, all eleven | adopt | The element is `a`. Enter, the context menu, middle click, modified click and drag are the platform's. |
| Underline policy | MUI, Mantine, Radix, Chakra, Carbon, Primer, Fluent | adopt | `underline`: `always`, `hover`, `none`, defaulting to `always`. |
| A quieter link that takes the surrounding text colour | Fluent `appearance="subtle"`, Primer `muted`, Polaris `monochrome`, Radix `color`, Chakra `colorPalette` | adapt | `variant="neutral"`: the link is the colour of the text around it and reaches the accent on hover, which is Primer's behaviour. A free colour prop is refused — this library answers colour with tokens. |
| A link on a solid or inverse surface | React Spectrum `staticColor`, Fluent `backgroundAppearance` | adopt | `variant="inverse"`. |
| Disabled | Fluent (`disabled`, `disabledFocusable`), Carbon, React Aria | adopt | Same semantics ButtonLink already ships: the `href` is removed, `role="link"` and `aria-disabled` stay, the anchor keeps its place in the tab sequence, and click, auxclick and Enter are refused. |
| Client-side routing | React Aria `render`, Radix and Chakra `asChild`, MUI and Mantine `component`, Primer `as`, Angular `RouterLink` | adopt | React: the `render` prop the button family already ships. Angular: the family is a directive on the consumer's anchor, so `routerLink` sits on the same element. |
| A current link | React Aria `data-current`, Chakra `_currentPage`, Carbon `aria-current` | adapt | Painted from the platform attribute — `[aria-current]:not([aria-current='false'])` — and no prop is invented. That is the one selector `routerLinkActive`'s `ariaCurrentWhenActive` and a React consumer both already write. |
| New tab announced and made safe | Polaris, Carbon (`rel="noopener"`), Chakra, and WCAG G201 | adopt | `external`, plus derivation from a resolved `target="_blank"`. |
| A visible external marker | Carbon `renderIcon`, Chakra external example, Polaris | adopt | `--slotted-icon-external`, a new glyph token, drawn as a mask so it survives forced colours. |
| Consumer's own click handler still runs | all | adopt | Composed, never replaced. |
| Family defaults set once | Mantine theme defaults, MUI theme, Chakra recipes, and this library's `button` and `card` | adopt | `LinkDefaultsProvider` and `provideLinkDefaults`, covering `underline`, `variant`, `visited` and `externalHint`. |
| Size scale | Carbon, Radix | decline | `typography` owns the type scale. A link takes the size of the text it sits in, and a standalone link is wrapped in `<Text size="…">`. Two families answering the type question is the mistake the measure decision already refused. |
| Tone scale (success, warning, danger) | Radix `color`, Chakra `colorPalette` | decline | `button` owns tone, because tone marks an action's consequence. Navigation has none, and a destructive command is a Button. |
| An arbitrary icon slot | Carbon `renderIcon`, MUI and Chakra compose one | decline | `icon` owns arbitrary artwork; the library ships no catalogue. Composition is two lines: `<Link href="…">Report <Icon><FileIcon /></Icon></Link>`. The external marker is different in kind: it is the family, not the consumer, that decides a new tab must be signalled, so the family owns that one glyph. |
| A link with no `href` that acts on press | React Aria (`<span role="link">`), Fluent (root as `button`) | decline | `button` owns action. MDN names the practice — an anchor with `href="#"` or `javascript:void(0)` — as the abuse to avoid, and a `span` with `role="link"` inherits none of the behaviour the APG note lists. |
| `truncate` / `wrap` | Radix only | decline | Not table stakes at one implementation, and truncation that removes content from the DOM is refused by the briefing. Long content is answered in Gaps instead. |
| A 44-pixel touch target | none of the eleven | decline | WCAG 2.2 SC 2.5.8 exempts a link inside a sentence, and inflating the hit area of a prose link steals taps from the line above it. A navigation target that needs a real touch target is `ButtonLink` with `variant="ghost"`. |

### Differentiators

| Capability | Why this library can hold it |
| ---------- | --------------------------- |
| A hover that is legible in every scheme | The hover colour is `color-mix(… , var(--slotted-text))`: the link moves toward the maximum-contrast text colour of whatever scheme is mounted. The shipped family instead paints hover with `--slotted-tone-accent-solid-hover`, which in the dark scheme is `#1d4ed8` on a `#131316` ground — hovering a link today makes it harder to read. A ramp built for fills cannot be a ramp for text, and no other surveyed system has three schemes to prove it on. |
| An underline that solidifies rather than a colour that jumps | At rest the underline is `color-mix(in oklab, currentColor 55%, transparent)`; on hover it reaches `currentColor`. Every variant, including `inverse` where the text colour cannot get stronger, therefore answers hover with something the eye can follow. |
| The warning follows the fact, not the prop | The marker, the hidden hint and `rel` derive from the resolved `target`, so a consumer who writes `target="_blank"` by hand gets the same announcement as one who writes `external`. Polaris deprecated its `external` prop and dropped the announcement with it; Carbon writes `rel` and nothing else. |
| `visited` that is not a second palette | `visited` mixes the link's own colour toward `--slotted-text-muted`, so it works in three schemes and for all three variants without a purple that no scheme declares. Carbon is the only surveyed system that ships `visited` at all, and it ships a hard-coded colour per theme. |
| The marker cannot be orphaned | The external marker is preceded by a word joiner — U+2060, zero width — so the glyph never wraps alone onto the next line and the distance to the word stays a token rather than a full word space. Carbon avoids the problem by forbidding the icon on inline links; Chakra and MUI place a bare element after the text and wrap. |

### Gaps

| What a product hits | The answer |
| ------------------- | ---------- |
| A long unbroken URL as link text overflows a narrow column | `overflow-wrap: anywhere` on the root, so the destination breaks inside the container instead of widening it. Verified in the 240-pixel capture. |
| A link that wraps across two lines | The root stays `display: inline`, so the underline and the focus ring follow both line fragments. An `inline-flex` root — which is what an icon slot would force — turns a two-line link into one overflowing line. |
| A link inside a coloured or inverse surface | `variant="inverse"` reads `--slotted-text-inverse`; the accent variant on a solid tone surface fails contrast and no surveyed system except Spectrum and Fluent says so. |
| A disabled link that is still router-driven | The destination is removed and activation is refused on click, auxclick and Enter. What remains reachable is the context menu on an anchor whose `href` a router rewrote after the removal; named as a limit rather than papered over, and covered by a test. |
| A translated warning | `externalHint` is a string, settable per instance and once per application through the defaults provider. |

### Delta against what shipped

| | Shipped (schema 4) | This rebuild |
| - | ------------------ | ------------ |
| Identity | `.slotted-link` class plus `data-slotted-component` | `data-ui="link"`, parts by `data-part` |
| Axes | `underline` | `underline`, `variant`, `visited` |
| States | `default`, `hover`, `active`, `focus-visible` | plus `disabled`, plus the platform's `aria-current` |
| Hover | `--slotted-tone-accent-solid-hover`, unreadable in dark | mixed toward `--slotted-text`, legible in three schemes |
| External | hidden hint only | hidden hint, visible marker glyph, `rel`, all derived from the resolved target |
| Parts | `root`, `external-hint` | `root`, `external-icon`, `external-hint` |
| Defaults | per instance | `LinkDefaultsProvider` / `provideLinkDefaults` |
| React props | `ComponentPropsWithoutRef<'a'>` | `ComponentPropsWithRef<'a'>` |
| Angular attributes | `rel`/`target` read with `getAttribute` and echoed through host bindings | read with `HostAttributeToken`, written only when absent |

A capability the family already had was inventoried like every other. All of
them were kept: `underline` because seven implementations ship it, `external`
because the warning is the family's whole reason to exist, and `externalHint`
because it is the only string the family speaks.

## Pattern

Source: **Link Pattern**, WAI-ARIA Authoring Practices,
<https://www.w3.org/WAI/ARIA/apg/patterns/link/>, read 1 September 2026.

### Keyboard

| Key | Precondition | Effect | Focus destination | Answered by |
| --- | ------------ | ------ | ----------------- | ----------- |
| `Enter` | link focused, not disabled | Executes the link | The link target | The platform. `keydown` is intercepted only to refuse activation while disabled. |
| `Enter` | link focused, disabled | Nothing | Stays on the link | `link.ts` in both bindings: the destination is absent and the key is refused. |
| `Shift + F10` (optional) | link focused | Opens the context menu | The context menu | The platform. |
| `Tab` | — | Moves to the link | The link | The platform, and it still reaches a disabled link because the anchor keeps `tabindex="0"`. |

`Space` does not activate a link, and neither binding makes it. That is the
difference the guide names between this family and Button.

### Roles, states and properties

| Requirement | Supplied by | Evidence |
| ----------- | ----------- | -------- |
| `role="link"` | The platform, from `<a href>` | The APG note: authors are strongly encouraged to use a native host language link element. |
| `role="link"` when the destination is absent | The family, while disabled | Without `href` an anchor has role `generic`; a disabled control that loses its role cannot be discovered as unavailable. |
| Accessible name | The link text, plus the hidden hint when it opens a new tab | Name computation concatenates adjacent text without inserting a space, so the hint carries its own leading space. |
| `aria-disabled="true"` | The family, while disabled | Paired with the removed `href`, which is what actually stops a middle click. |
| `aria-current` | The consumer or the router | Painted, never written by the family. |
| Focus visible | The family | `:focus-visible` outline from the focus-ring tokens. |

### Deliberate departures

- **A disabled link is not in the pattern.** The APG has no disabled link,
  because the platform has none. The family ships one because seven of the
  eleven surveyed systems needed it, and it costs: the anchor is focusable with
  no destination, which a screen reader announces as a link that goes nowhere
  until it reaches `aria-disabled`. The alternative — dropping the element from
  the tab sequence — hides the fact that the destination exists at all.
- **`current` is not a `data-*` state.** The shared vocabulary would spell it
  `data-current`, and the capability sits in `MUTABLE_CAPABILITIES` because
  `tabs` and `pagination` move it. A link is told, never moves it, and the one
  attribute both a React consumer and `routerLinkActive` already write is
  `aria-current`. The stylesheet keys on that; the contract declares neither the
  capability nor the state, and the reason is this paragraph.

## Anatomy

| Part | Element | Purpose |
| ---- | ------- | ------- |
| `root` | `a` | The link. Carries `data-ui="link"`, the axes, and every native anchor attribute. |
| `external-icon` | `span`, `aria-hidden` | The marker, a mask from `--slotted-icon-external`, preceded by a word joiner so it never wraps alone. |
| `external-hint` | `span`, `data-ui="visually-hidden"` | The wording a screen reader reads after the link text. |

Both external parts render only when the resolved target is a new browsing
context.

## Axes

| Axis | Values | Default |
| ---- | ------ | ------- |
| `underline` | `always`, `hover`, `none` | `always` |
| `variant` | `accent`, `neutral`, `inverse` | `accent` |

`always` is the default because colour alone does not distinguish a link:
`--slotted-tone-accent-text` reaches 4.5:1 against the surface but not 3:1
against `--slotted-text` beside it, which is the ratio WCAG 1.4.1 asks of a
link that has no other cue. `hover` and `none` stay in the contract for
standalone links, which are not inside a sentence and therefore not subject to
that ratio, and the underline returns under forced colours whatever the axis
says.

## Colour

Three values per variant, and one rule: **hover moves the link toward the
maximum-contrast text colour of its context, and the underline solidifies.**

| Variant | Rest | Hover | Active |
| ------- | ---- | ----- | ------ |
| `accent` | `--slotted-tone-accent-text` | mixed 65% toward `--slotted-text` | mixed 35% toward `--slotted-text` |
| `neutral` | `currentColor` — the text around it | `--slotted-tone-accent-text` | mixed 65% toward `--slotted-text` |
| `inverse` | `--slotted-text-inverse` | unchanged; the underline carries the state | unchanged |

The underline is `color-mix(in oklab, currentColor 55%, transparent)` at rest
and `currentColor` from hover onward, in every variant. `visited`, when the
axis is on, mixes the rest colour 60% toward `--slotted-text-muted`.

A mix toward `--slotted-text` cannot fail contrast, because `--slotted-text` is
the colour the theme already holds to the highest ratio in each scheme; the
tone ramp has no `text-hover` role, and adding one would be fifteen new values
across five tones and three schemes, decided from inside one family, for
families the rebuild has not reached.

## Disabled

Identical to ButtonLink, which is the reason it is not re-derived here:

- the `href` is not rendered, because an anchor that keeps its destination
  still navigates on a middle click and on a modified click;
- `role="link"` and `aria-disabled="true"` are written;
- `tabindex="0"` keeps the anchor in the tab sequence;
- `click`, `auxclick` and `Enter` are refused in the capture phase before the
  consumer's handler runs;
- the stylesheet paints `--slotted-disabled-foreground` and holds hover and
  active back, as `STATE_PRECEDENCE` requires.

## Motion

| Transition | From → to | Reason |
| ---------- | --------- | ------ |
| `color` | rest → hover → active | The eye follows the colour to know the link answered. `--slotted-duration-short`, `--slotted-easing-standard`. |
| `text-decoration-color` | 55% → `currentColor` | The same state change, carried by the property `inverse` has left. |
| underline appearing under `underline="hover"` | none → underline | Not animated: `text-decoration-line` is not interpolable, and a line that fades in reads as a rendering artefact. |
| focus ring | — | Never animated. Focus is immediate or it is a lie about where the keyboard is. |

The motion scale collapses `--slotted-duration-short` under
`prefers-reduced-motion`; the family writes no query of its own and no infinite
animation.

## Tokens

New foundation token, in lockstep across `packages/tokens/src/contract.json`,
`packages/theme-default/src/theme.json` and the Glyph table in
`docs/token-foundation.md`:

| Token | Layer | Axis | Value |
| ----- | ----- | ---- | ----- |
| `--slotted-icon-external` | `primitive` | `base` | An arrow leaving toward the upper corner, stroked at 2.5 on a 24 viewBox, matching the six glyphs already in the scale |

It is a foundation token rather than a family one because the glyph scale is
where a component-owned icon comes from, and because `external` will be needed
again by `menu` and by `breadcrumb`. It mirrors under `:dir(rtl)`, by the same
`scale: -1 1` the `icon` family uses for directional artwork: an arrow that
means "away from here" points the other way in a right-to-left document.

Family tokens, each falling back to a foundation token or to a recorded
literal:

`--slotted-link-color`, `--slotted-link-color-hover`,
`--slotted-link-color-active`, `--slotted-link-color-visited`,
`--slotted-link-color-current`, `--slotted-link-color-disabled`,
`--slotted-link-underline-color`, `--slotted-link-underline-thickness`,
`--slotted-link-underline-offset`, `--slotted-link-external-icon-size`,
`--slotted-link-external-icon-gap`, `--slotted-link-focus-ring-offset`,
`--slotted-link-radius`.

`--slotted-link-external-icon-size` falls back to `1em`: the marker follows the
type it sits in, exactly as `icon[data-size="text"]` does. A step of the control
icon scale would be right beside body text and wrong inside a heading.
`--slotted-link-focus-ring-offset` falls back to one pixel rather than the
foundation's two: a link has no border for the ring to clear, and on a line of
prose the wider offset reaches into the line above.

## Framework integration

### React

| Question | Answer |
| -------- | ------ |
| Controlled and uncontrolled pair for a mutable value | No mutable value. `underline`, `variant`, `visited`, `external` and `disabled` are declarations; `aria-current` belongs to the router. The contract therefore declares no `stateModel`, which the schema permits only because it holds no mutable capability. |
| Family defaults set once | `LinkDefaultsProvider` and `useLinkDefaults` in `link-defaults.tsx`, over `underline`, `variant`, `visited` and `externalHint`. |
| Substituting the rendered element | `render`, which is how a Next.js or React Router link is reached. The two external parts are fixed: they are the family's own warning, not content. |
| Consumer's handler still runs | `onClick`, `onAuxClick` and `onKeyDown` are composed; while disabled the family refuses first and the consumer's handler is not called, which is the point of a disabled control. |
| Native element and imperative action | `ComponentPropsWithRef<'a'>`; `ref` reaches the anchor. No imperative handle: `focus()` on the ref is the whole of it. |
| Server rendering | No identifier is generated and no layout is read during render. |
| Every state in the DOM | `data-underline`, `data-variant`, `data-visited`, `data-disabled`, and the platform's `aria-current`. |
| Props type | `ComponentPropsWithRef<'a'>`, extended. |

### Angular

| Question | Answer |
| -------- | ------ |
| Two-way value in the signal form | None; the family holds no state. Inputs are `input()` signals. |
| Reactive Forms | Not applicable: a link is not a form control and carries no value. |
| Family defaults set once | `LINK_DEFAULTS_TOKEN` and `provideLinkDefaults`, matching `provideButtonDefaults`. |
| Template reaching the instance | `exportAs: 'slLink'`. |
| Projected content, kept lazy | `<ng-content>` for the label; the two external parts are rendered by the family and are not projection points. |
| Zoneless and `OnPush` | Signals throughout, `ChangeDetectionStrategy.OnPush`, no `markForCheck`. |
| Teardown | The three capture listeners are removed through `DestroyRef`. |
| A static attribute the consumer wrote | `rel` and `target` are read with `HostAttributeToken` and written only when absent, so neither a static attribute nor a consumer's own binding is overwritten. That is why they are not host bindings: a host binding always writes, and `null` removes the attribute the consumer had just set. |
| Single class per entry point | `SlLink`, imported as `@slotted/angular/link`. |

The asymmetry, recorded rather than levelled: React derives the new-tab warning
from the resolved `target` prop, whichever way it arrived. Angular derives it
from `external()` plus a **static** `target="_blank"`, because a dynamically
bound attribute is not observable without a `MutationObserver`, and observing
the consumer's DOM to decide the component's own output is worse than the
documented limit.

## Contract break and migration

| Was | Is | How a consumer moves |
| --- | -- | -------------------- |
| `.slotted-link` | `[data-ui="link"]` | Replace the class selector. The class was never contract; the identity law is what makes the new one safe. |
| `data-slotted-component="link"` | `data-ui="link"` | Replace the attribute in selectors and tests. |
| `data-part="external-hint"` on the only extra part | `external-icon` and `external-hint` | A selector that assumed one child gets two. |
| hover painted with the accent solid ramp | hover painted from the family's own ramp | A theme that retuned `--slotted-tone-accent-solid-hover` to fix link hover can drop the override. |
| `LinkProps extends ComponentPropsWithoutRef<'a'>` | `ComponentPropsWithRef<'a'>` | A consumer who wrapped Link to add a ref can delete the wrapper. |

`link` leaves `specs/legacy-families.json` in the same commit that lands the
schema 5 contract.

## Decisions taken

1. **`external` is sugar for a new browsing context, and the warning follows the
   resolved target.** A consumer's explicit `target` wins, including
   `target="_self"`, which turns `external` into a no-op. `download` is passed
   through untouched and is not special-cased: a download that opens a tab is a
   download that opens a tab, and the reader is told so.
2. **`rel` is added only when the consumer wrote none.** An explicit
   `rel="nofollow"` is kept exactly, because modern browsers already imply
   `noopener` for `target="_blank"` and a silently rewritten `rel` is a
   surprise a consumer cannot see.
3. **`visited` is opt-in and cannot be photographed.** `:visited` is restricted
   to colour and its computed value is deliberately hidden from script, so the
   harness cannot capture it and a test cannot assert it. The rule is asserted
   as text in the stylesheet test and named at the gate as the one thing not
   verified on this machine.
4. **No size axis, no tone axis, no icon slot.** Each names the family that owns
   it above.
5. **The glyph scale grows by one.** This is the only decision here that
   changes a public contract outside the family, and it is raised at the gate.
