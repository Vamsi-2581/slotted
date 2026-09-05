# Badge family design

Rebuild of `badge` against schema 5 and the token foundation. Wave 2, mode
`refazer`, guide section 10. The public API breaks; the moves are at the end.

## Capability inventory

### Surveyed

Eleven implementations, read on 1 September 2026. Sources chosen to disagree:
four ship only the inline metadata chip, four ship only the count anchored to
another element, one ships both as separate components, and two ship a headless
box with one prop.

| Source | Reference | What it calls the family |
| ------ | --------- | ------------------------ |
| React Spectrum | <https://react-spectrum.adobe.com/react-spectrum/Badge.html> | `Badge` with `variant` (10 values: `neutral`, `info`, `positive`, `negative`, plus six non-semantic colours); icon and `Text` as children; no size |
| Fluent UI v9 | `Badge.types.ts`, `CounterBadge.types.ts`, `PresenceBadge.types.ts` <https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-badge> | three components: `Badge` (`appearance` `filled\|ghost\|outline\|tint`, `color` ×8, `shape` `circular\|rounded\|square`, `size` ×6, `icon`, `iconPosition`), `CounterBadge` (`count`, `overflowCount` = 99, `showZero`, `dot`), `PresenceBadge` (`status` ×8, `outOfOffice`) |
| Ant Design | <https://ant.design/components/badge> | `Badge` (`count`, `overflowCount` = 99, `dot`, `showZero`, `status`, `color`, `offset`, `size` `medium\|small`, `text`, `title`) plus `Badge.Ribbon` |
| MUI | <https://mui.com/material-ui/react-badge/> | `Badge` (`badgeContent`, `max`, `showZero`, `invisible`, `variant` `standard\|dot`, `color`, `anchorOrigin`, `overlap` `rectangular\|circular`) |
| Angular Material | `badge.ts`, `badge.md` <https://github.com/angular/components/tree/main/src/material/badge> | `matBadge` **directive** (`matBadgePosition` ×8, `matBadgeSize` `small\|medium\|large`, `matBadgeColor`, `matBadgeOverlap`, `matBadgeHidden`, `matBadgeDisabled`, `matBadgeDescription`) plus `MAT_BADGE_CONFIG` |
| Atlassian Design System | `@atlaskit/badge` `types.d.ts` | `Badge` (`appearance` ×12, `max` = 99 or `false`), numeric only; non-numeric goes to `Lozenge` |
| Shopify Polaris | `Badge.tsx` <https://github.com/Shopify/polaris/tree/main/polaris-react/src/components/Badge> | `Badge` (`tone`, `progress`, `icon`, `size`, `toneAndProgressLabelOverride`) plus `Badge.Pip`; renders a visually hidden label naming the tone in words |
| GitHub Primer | `Label.tsx`, `CounterLabel.tsx` <https://github.com/primer/react/tree/main/packages/react/src> | `Label` (`variant` ×10, `size` `small\|large`) and `CounterLabel` (`variant` `primary\|secondary`), which marks the visible count `aria-hidden` and repeats it in a `VisuallyHidden` |
| Radix Themes | `badge.props.tsx`, `badge.tsx` <https://github.com/radix-ui/themes> | `Badge` (`size` 1–3, `variant` `solid\|soft\|surface\|outline`, `color`, `highContrast`, `radius`, `asChild`) |
| HeroUI | `@heroui/badge` `use-badge.d.ts`, `@heroui/theme` `badge.d.ts` | `Badge` (`content`, `variant` `solid\|flat\|shadow\|faded`, `color`, `size`, `shape` `circle\|rectangle`, `placement` ×4, `isInvisible`, `isOneChar`, `isDot`, `showOutline`, `disableAnimation`) |
| shadcn/ui | `badge.tsx` <https://github.com/shadcn-ui/ui> | `Badge` (`variant` ×6, `asChild`); hover is styled only when the badge renders as an anchor |

Radix Primitives and Base UI ship no badge at all: the family has no behaviour
to make headless.

The WAI-ARIA Authoring Practices carry no badge pattern — the pattern index at
<https://www.w3.org/WAI/ARIA/apg/patterns/> contains no entry, and the string
does not occur on the page. The applicable official guidance is the `status`
role in WAI-ARIA 1.2 (<https://www.w3.org/TR/wai-aria-1.2/#status>), WCAG 2.2
1.4.1 Use of Color, 1.4.11 Non-text Contrast and 4.1.3 Status Messages. The
itemized comparison is in the accessibility section below.

### Table stakes

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| Tone or semantic colour | all eleven | adopt | `tone`: the library's five, not a colour list. A badge accepting an arbitrary colour is the contract violation `PROJECT-PRD.md` 2.4 names. |
| Painting axis (filled, tinted, outlined) | Fluent, Radix, HeroUI, shadcn, Primer, Atlassian | adopt | `variant`: `solid`, `soft`, `outline`. `soft` is the value Button dropped and named this family the owner of. |
| Size scale | Fluent, Ant, Angular Material, Primer, Polaris, Radix, HeroUI | adopt | `size`: `sm`, `md`, `lg`, reading the control type and icon scales so a badge shrinks with density beside the controls it sits with |
| Pill, rounded and square shapes | Fluent (`shape`), HeroUI (`shape`), Radix (`radius`) | adopt | `shape`: `pill`, `square` |
| Dot with no value | Fluent, Ant, MUI, HeroUI | adopt | `shape: 'dot'` — the same badge, same tone, same hidden text, drawn without a value |
| Count with an overflow ceiling | Fluent, Ant, MUI, Atlassian | adopt | `count` and `max` (99, or `false` to disable), formatted in `@slotted/core/count` so the two bindings cannot disagree |
| Hide at zero, and an override | Fluent, Ant, MUI | adopt | `showZero`, default `false` |
| Anchored to another element | Ant, MUI, Angular Material, HeroUI | adopt | the `anchor` part, with `placement` and `overlap` |
| Placement around the host | MUI (`anchorOrigin`), Angular Material (`matBadgePosition`), HeroUI (`placement`) | adapt | four corners, named `top-end`, `top-start`, `bottom-end`, `bottom-start`. Material's eight combinations include four that name only one axis and inherit the other, which is a default wearing a value's clothes. |
| Offset for a circular host | MUI (`overlap`), HeroUI (`shape`) | adopt | `overlap`: `rectangle`, `circle` |
| A ring separating the anchored badge from its host | HeroUI (`showOutline`, default on), Ant (hard-coded white ring) | adapt | always drawn, and its colour is `--slotted-badge-ring-color`, defaulting to `--slotted-surface`. HeroUI's is a boolean and Ant's is a literal white, so neither survives a badge over a coloured ground. |
| Icon inside the badge | Fluent (`icon` + `iconPosition`), Polaris (`icon`), Spectrum, Mantine (`leftSection`/`rightSection`) | adapt | `start` and `end`, the anatomy `button` already uses. Two slots rather than one slot and a position axis, which is Mantine's shape and not Fluent's — and the split is also what gives the words a box of their own, which is what `text-box` needs. |
| Element substitution | Radix (`asChild`), shadcn (`asChild`), Mantine (polymorphic), Carbon (polymorphic) | adopt | `render` in React; in Angular the directive is written on the consumer's element |
| Defaults for the whole application | Angular Material (`MAT_BADGE_CONFIG`), Ant (`ConfigProvider`) | adopt | `BadgeDefaultsProvider` and `provideBadgeDefaults` |
| Announcement policy for a changing count | Ant (`title`), Angular Material (`matBadgeDescription` via `aria-describedby`), Primer (`VisuallyHidden`), Polaris (hidden tone label) | adapt | `live`: `off` (default), `polite`, `assertive`, mapping to `role="status"` and `role="alert"`. None of the four lets the consumer choose; three announce nothing and Material always describes. |
| Words a colour or a dot cannot say | Polaris (auto-generated hidden label), Primer (`VisuallyHidden`), Angular Material (`matBadgeDescription`) | defer to `visually-hidden` | Wave 1 shipped the family whose whole purpose is hidden text. Inside a badge it is two lines and no new part: `<span slVisuallyHidden>3 unread messages</span>`. An auto-generated label would have to be an English string this library cannot yet translate. |
| Hidden by a flag rather than by absence | MUI (`invisible`), Angular Material (`matBadgeHidden`), HeroUI (`isInvisible`) | decline | The consumer already owns whether the badge renders. A prop that hides a rendered element leaves it in the accessibility tree announcing a count nobody can see, which is worse than the two characters of `{show && <Badge/>}` it saves. `showZero` stays because zero is a *value* decision, not a rendering one. |
| Arbitrary offset | Ant (`offset`) | decline | One implementation. The overhang is half the badge's own size and the circular inset is a seventh of the host's — both proportions of a box rather than steps of any scale, so they are geometry the family owns rather than a pixel pair on every instance. `placement` and `overlap` are the two choices that remain. |
| Disabled badge | Angular Material (`matBadgeDisabled`) | decline | One implementation, and a badge refuses no interaction. A badge on a disabled control is greyed by the control, which is where `disabled` lives. |
| Removable or selectable chip | Carbon (`DismissibleTag`, `SelectableTag`), Mantine | defer to `tag` | Next invocation in this wave. `docs/component-features.md` section 10 gives Tag the entity that is removable, selectable or navigable, and Badge the metadata that is none of them. |
| Operational status dot with a label beside it | Ant (`status` + `text`), Fluent (`PresenceBadge`), Polaris (`Badge.Pip`) | defer to `status-indicator` | Same wave, `docs/build-order.md`. The boundary: `shape="dot"` is a badge with no value, anchored to something; `status-indicator` is a standalone operational state that owns its own label. |
| Ribbon or corner banner | Ant (`Badge.Ribbon`) | decline | One implementation, and it is a card decoration rather than a badge: it needs the card's clipping and its corner. It composes as an absolutely positioned element inside `card`'s `media` part. |
| Progress pip | Polaris (`progress`) | decline | One implementation, and it is three circle glyphs — `icon` holds a consumer's own artwork, which is what those glyphs are. |
| Per-part class and style overrides | Ant (`classNames`/`styles`), HeroUI (`classNames`) | adapt | `data-part` selectors, which are contract here; class names explicitly are not (`PROJECT-PRD.md` 14). |

### Differentiators

| Offered here | Not in any surveyed implementation |
| ------------ | ---------------------------------- |
| The count is formatted with `Intl.NumberFormat` for the badge's locale | All eleven interpolate the raw number. A count of `1234` reads `1234` in every locale they ship to; here it reads `1.234` in `de-DE` and `١٢٣٤` in `ar-EG`. |
| One edge rule for three variants, taken from the tone's `border` role | It makes `solid` `secondary` and `solid` `warning` findable — measured at 1.23:1 and 1.53:1 against the light surface, so a fill alone leaves no boundary — and it is what keeps `soft` visible in the `high-contrast` scheme, where every tone surface collapses to the page's own white. Fluent, Radix and HeroUI all lose their tinted badge under a high-contrast scheme. |
| Three colour schemes, three densities, logical properties throughout | All eleven ship light and dark. None is held to a 7:1 scheme, none answers three densities, and Ant, MUI, HeroUI and Material all position the anchored badge with `right`/`left`, so a right-to-left document needs a second stylesheet. |
| The anchored ring is a token, not a boolean | HeroUI's `showOutline` and Ant's white ring both assume the host sits on the page's own surface. Inside a card, a toolbar or a coloured row, both draw a white halo. |
| The dot's rim is `--slotted-border-strong`, the one border the theme holds to 3:1 | A dot is the only badge whose entire meaning is a graphic, so WCAG 1.4.11 binds it and not the others. No surveyed implementation distinguishes the two cases; Ant, MUI and HeroUI draw a `secondary` dot at 1.23:1 against the page. |
| Defaults set once in both a React and an Angular binding | Material has the injection token and no React; Ant has `ConfigProvider` and no Angular. |

### Gaps

| Gap | What this family does |
| --- | --------------------- |
| A badge longer than its container | One line, clipped with an ellipsis. A badge holds a count, a status or a short piece of metadata, and one that reflowed into a paragraph would have stopped being one — the length is the content's error, and the family reports it rather than absorbing it. `tag` holds an entity's name and answers the same question for itself. Spectrum, Primer and Atlassian simply overflow; Carbon truncates its Tag into a tooltip. `docs/build-briefing.md` forbids removing content from the DOM, and `text-overflow` removes none: the whole string stays in the DOM, in the accessibility tree, and findable by a page search. The `extremes` scene holds a 40-character string, a German compound and a 28-letter token, read at 240, 420 and 720. |
| A count that must not wrap while an inline badge must | The anchored badge sets `white-space: nowrap`; the inline one does not. One rule each, because a corner count that wrapped would leave the host's corner. |
| A count that ticks 8 → 9 → 10 | `font-variant-numeric: tabular-nums`, so the box grows by one figure width instead of jittering on every digit. None of the eleven sets it. |
| The overflow marker in a right-to-left document | `99+` is written as text and the `+` is a bidi-neutral character, so it renders after the digits in an LTR paragraph and before them in an RTL one — which is correct in both. Held by the `count` scene under `--dir rtl`. |
| A badge that is also a link | `render` may make the root an `<a>`, and the family paints `focus-visible` for exactly that case. shadcn styles hover only when the badge is an anchor; the other ten paint no focus at all, so a linked badge loses its ring. This family paints the ring and never paints hover or press, because a badge is not a command. |
| Zero as a meaningful value | `showZero` renders `0`; without it nothing renders at all, rather than an empty pill. Fluent renders an empty circle when `count` is 0 and `showZero` is set on a `dot`. |

## Anatomy

One member, five parts.

| Part | Attribute | Holds |
| ---- | --------- | ----- |
| root | `data-ui="badge" data-part="root"` | The badge box: ground, edge, radius, type |
| start | `data-part="start"` | A glyph before the words, sized and centred by the family |
| label | `data-part="label"` | The words, and the count |
| end | `data-part="end"` | A glyph after the words |
| anchor | `data-ui="badge" data-part="anchor"` | The frame that places a badge on the corner of another element |

`label` is the anatomy `button` already uses, and it exists here for the same
reason plus one more. A flex container centres the *line box*, and a line box is
not symmetric around the letters inside it: the ascender reaches further above
the cap than the descender reaches below the baseline. Measured on this family
before the part existed, a word with no descender sat 2.19 pixels high in a
24-pixel badge — six pixels of clearance above the ink and eight below it —
while a word with a descender looked correct.

`text-box: trim-both cap alphabetic` fixes that by trimming the line to the cap
and the baseline, so what is centred is the ink. It needs a block container, and
a flex container has none: its text lives in an anonymous item no selector can
reach. Measured in Chrome 150 — the declaration takes an 18.19-pixel line box to
9 on an `inline-block` and does nothing at all on an `inline-flex`. With the
part in place the clearance is 7.59 pixels above and 7.59 below at every size,
and `Paid` and `Pending` sit on the same optical centre.

It is guarded by `@supports`, so an engine without it renders what this family
rendered before.

`anchor` is the only part in the library that contains its family's root rather
than sitting inside it, and it therefore carries `data-ui` itself: a part with a
`data-part` and no reachable family identifier would be selectable only by a
name no family owns. Every rule in the stylesheet names both attributes, so the
two are never ambiguous:

```css
[data-ui='badge'][data-part='root'] { … }
[data-ui='badge'][data-part='anchor'] { … }
```

There is no `label` part. The words a dot or a colour cannot say are hidden
text, and `visually-hidden` is the family that owns hidden text. It composes
inside the badge and costs no space, because an absolutely positioned child of
a flex container is not a flex item and `gap` does not reserve room for it.

## Axes and defaults

`tone`: `accent`, `secondary` (default), `success`, `warning`, `danger`.
`variant`: `solid`, `soft` (default), `outline`.
`size`: `sm`, `md` (default), `lg`.
`shape`: `pill` (default), `square`, `dot`.
`live`: `off` (default), `polite`, `assertive`.
`placement` (anchor): `top-end` (default), `top-start`, `bottom-end`, `bottom-start`.
`overlap` (anchor): `rectangle` (default), `circle`.

`soft` rather than `solid` is the default because a badge is metadata: a page
of solid grey pills reads as a page of controls. The old default was `solid`,
and the move is in the break table.

`secondary` rather than `accent` is the default because a badge with no tone
stated is carrying a value, not an opinion about it.

## Count

`count`, `max` and `showZero` are one decision, taken once, in
`@slotted/core/count`:

- `count` is absent → the badge renders its children.
- `count` is `0` and `showZero` is false → the badge renders nothing at all,
  rather than an empty pill.
- `count` is above `max` (default `99`; `false` disables the ceiling) → the
  badge renders `max` followed by `+`.
- otherwise the badge renders `count`.

The number is formatted with `Intl.NumberFormat(locale)`. `locale` comes from
the instance, then from the defaults provider, then from the runtime. An
application that server-renders a count above its locale's grouping threshold
must set `locale` on both sides — exactly as it must for every other formatted
number, and only reachable at all when `max` is disabled.

Children win over `count`. An explicit consumer value always wins.

## States and motion

States: `default` and `focus-visible`. No `hover`, no `active`.

A badge is not a command, so it gives no hover response and no press feedback:
`docs/component-features.md` section 10 says as much, and shadcn is the only
surveyed implementation that paints hover at all — conditioned on the badge
being an anchor. `focus-visible` is painted because `render` can make the root
an `<a>` and a focus ring that only appears when a family expects focus is a
focus ring that goes missing.

The family animates nothing, and the one candidate was considered and refused.
A count appearing at the corner of a button is a change the eye should follow,
and `@starting-style` is how CSS would carry it — but `@starting-style` fires on
every insertion, including the first paint, so a page of twenty badges would pop
on load to buy one useful transition. CSS cannot tell a first render from a
later change; `presence` (guide section 3, still unbuilt) can. The transition
returns with that family. Every other state pair — tone to tone, size to size,
rest to focus — is a change the consumer makes deliberately or a ring that must
appear instantly, and none of them transitions.

## Painting

One edge, three grounds.

| Variant | Ground | Edge | Text |
| ------- | ------ | ---- | ---- |
| `solid` | `--slotted-tone-<tone>-solid` | the ground itself — no rim | `--slotted-tone-<tone>-on-solid` |
| `soft` | `--slotted-tone-<tone>-surface` | `--slotted-tone-<tone>-border` | `--slotted-tone-<tone>-text` |
| `outline` | `transparent` | `--slotted-tone-<tone>-border` | `--slotted-tone-<tone>-text` |

A filled badge draws no rim: its edge is its own fill, so the chip is one shape.
A rim on a filled chip reads as a second, quieter chip drawn behind the first,
and it was what made the three variants look like three weights of one rimmed
chip rather than like filled, tinted and outlined.

`soft` keeps its edge for a reason the light scheme hides: in `high-contrast`
every tone `surface` collapses to the page's own white, so a tinted badge with
no edge is a run of text. There it converges with `outline`, which is what a
high-contrast scheme is for.

`secondary` is the one exception on both counts, because it is the one tone
whose fill is the page's own colour. Its `solid` role is `#ffffff` in
`high-contrast` and 1.23:1 against the light surface, and it is the same value
as its `surface` role in all three schemes — so a filled neutral badge was both
invisible in one scheme and identical to a tinted one in the others. It takes
the tone's `solid-hover` step as its fill (1.48:1 in `light` where `solid` is
1.23:1, 1.78:1 in `dark` where it is 1.25:1) and keeps the tone `border` as its
edge. Every other tone carries its own boundary: 6.70, 5.02 and 4.83 in `light`,
9 to 10 in `high-contrast`, and `warning` is chromatic rather than luminous at
1.53 but unmistakably yellow on white.

Button reached the opposite conclusion for its `outline` variant — a neutral
edge, with the tone in the label — and recorded the reason: five saturated
rectangles in a row of actions read as status chips before they read as words.
A badge *is* a status chip. The two decisions agree about what a tone border
looks like and disagree about which family should wear it.

For `secondary`, `solid` and `soft` resolve to the same rectangle: the theme
gives the neutral tone one ground — `--slotted-tone-secondary-solid` and
`--slotted-tone-secondary-surface` are the same colour in all three schemes, as
are its `on-solid` and `text`. That is a property of a neutral rather than a
defect in the axis, and the field agrees: Atlassian's `default`, Fluent's
`subtle` and shadcn's `secondary` are all one grey chip. `outline` still
differs, and the four coloured tones differ in all three. Nothing here can
manufacture a second neutral ground without inventing a colour, which the token
law forbids.

`--slotted-tone-<tone>-text` on `--slotted-tone-<tone>-surface` measures 4.57:1
at worst in `light`, 9.42:1 in `dark` and 9.12:1 in `high-contrast`. The theme's
contrast test did not cover that pair, and this family is the first to depend on
it; the assertion is added first, in its own commit.

`shape="dot"` is the exception. It is the only badge whose entire meaning is a
graphic, so WCAG 1.4.11 binds its edge rather than merely decorating it, and its
rim is `--slotted-border-strong` — the one border token the theme holds to 3:1
against the surface. A `secondary` dot rimmed with `--slotted-tone-secondary-border`
would measure 2.56:1 in `light` and 1.78:1 in `dark`.

## Geometry

The badge has no height token. Its block size is its own line box plus a
symmetric inset from the space scale, so a badge never disagrees with the type
it contains and no density can leave it clipped.

Type and glyph come from the control scale — `--slotted-control-font-size-*`
and `--slotted-control-icon-size-*` — so a badge shrinks with density beside the
controls it sits with. `start` and `end` are the glyph boxes. Inset and gap come from the space scale, per `size`: a
density step inside a badge's own inset would be sub-pixel, and density moves
the type, which moves the box.

`pill` is `--slotted-radius-full` with `min-inline-size` equal to the block
size, so a one-figure count is as round as its own inset allows and a
three-figure count is a pill, without an axis saying which. `square` is
`--slotted-radius-sm`.

`dot` is a disc the width of the type it stands beside — `--_font-size`, not a
step of the space scale — and it renders no value. Two readings of the harness
produced that rule. At six pixels the 3:1 rim left four pixels of tone and every
small dot read as dark rather than as its own colour; at a free sixteen the
large dot stood taller than the fourteen-pixel words next to it. A mark that
accompanies text is the height of that text, can never outgrow it, and answers
density without a third scale saying how.

The family declares no container and no breakpoint: a badge is sized by its
content and has no composition to change at one. It answers a narrow container
by clipping its one line, never by reflowing into two.

## Accessibility

There is no APG pattern. The itemized comparison is against the official
guidance that does apply.

| Requirement | Source | This family |
| ----------- | ------ | ----------- |
| A badge has no role of its own | WAI-ARIA 1.2 — no `badge` role exists | The root is a `span` with no role. What a badge means comes from where it sits. |
| A live region for advisory information | `status` role, <https://www.w3.org/TR/wai-aria-1.2/#status> | `live="polite"` writes `role="status"`, whose implicit `aria-live="polite"` and `aria-atomic="true"` are what a changing count needs |
| A live region for an urgent message | `alert` role | `live="assertive"` writes `role="alert"` |
| A status message announced without focus | WCAG 2.2 4.1.3 | `live` is the family's answer, and it is `off` by default: a page of twenty badges that all announce is a page no screen reader user can read |
| Colour is never the only signal | WCAG 2.2 1.4.1 | A pill or square badge carries text. A dot carries none, so the reference pages and every harness dot scene compose `visually-hidden` text beside it, and the API documents it as required. |
| A graphic that carries meaning reaches 3:1 | WCAG 2.2 1.4.11 | The dot's rim is `--slotted-border-strong`. Pill and square edges are decoration, because their text carries the meaning. |
| Text reaches 4.5:1 | WCAG 2.2 1.4.3 | Every variant, tone and scheme, measured above; the new theme assertion holds it |
| Focus is visible | WCAG 2.2 2.4.7, 2.4.11 | `focus-visible` paints the library ring, for the case where `render` makes the badge a link |
| The badge is not focusable by default | `status` must not receive focus — WAI-ARIA 1.2 | No `tabindex`, no role that implies one |
| Forced colours keep the badge findable | — | The family writes one `forced-colors` rule: every tone ground collapses to `ButtonFace` or `Canvas` and every tone border to `ButtonBorder`, so a badge with no edge of its own would be invisible on the page. `border-color: currentColor` is the exception `docs/build-briefing.md` allows — the family paints something the theme cannot reach. |
| A count that names what it counts | Angular Material `matBadgeDescription`; MUI's guidance to put the count in the host's `aria-label` | Documented on both reference pages, in both forms: `visually-hidden` text inside the badge, or the host's own accessible name |

Forced colours were measured rather than argued, through the DevTools protocol
with `forced-colors: active` emulated. Every variant of every tone resolves to a
`Canvas` ground, `CanvasText` text and a one-pixel `CanvasText` edge, so all
three collapse into one bounded rectangle — which is what the mode is for — and
none of them becomes an unbounded run of text.

The anchored badge loses its ring there: Chrome drops `box-shadow` outright
under forced colours. It is not a defect, and the family adds no rule for it.
The ring exists to separate the badge from a host it overlaps, and under forced
colours the badge's own ground is opaque `Canvas` and its own edge is a
`CanvasText` rim, so it still occludes the host's border and still reads as a
distinct shape. What is lost is two pixels of breathing room, not the boundary.

The anchored badge does not rewrite its host's semantics. Neither binding can
safely reach into an element it did not render, and a family that only works
when the host is one of the elements it knows is a family that fails silently.
The reference pages show both wirings.

## Ecosystem integration

### React

| Question | Answered by |
| -------- | ----------- |
| Controlled and uncontrolled pair, plus a request carrying a reason | Not needed: the badge holds no mutable value. `count`, `tone` and the rest are inputs the consumer owns; the badge never asks for a new one. |
| Defaults set once for the application | `BadgeDefaultsProvider` and `useBadgeDefaults` in `badge-defaults.tsx`, carrying `tone`, `variant`, `size`, `shape`, `max`, `locale` |
| Substituting the rendered element of each part | `render` on `Badge`, `BadgeIcon` and `BadgeAnchor` |
| The consumer's handler still runs | The family registers no handler; every event reaches the element through the spread. |
| Reaching the native element and the imperative action | `ref` on every part, through `ComponentPropsWithRef`. No imperative action: a badge has none the DOM does not already give. |
| Server rendering without a mismatch | No generated id, no layout read during render. `Intl.NumberFormat` is the one environment-dependent call, and its cost is written above. |
| Every state a consumer may style in the DOM | `data-ui`, `data-part`, `data-tone`, `data-variant`, `data-size`, `data-shape`, `data-placement`, `data-overlap` |
| Part props are the native element's, extended | `ComponentPropsWithRef<'span'>` in `badge.types.ts` |

### Angular

| Question | Answered by |
| -------- | ----------- |
| Two-way value in the signal form | Not needed: no mutable value, so `input()` rather than `model()`. |
| Reactive and template forms | Not needed: a badge is not a form control, and it holds no value a form could submit. |
| Defaults set once for the application | `BADGE_DEFAULTS` and `provideBadgeDefaults` in `badge-defaults.ts` |
| A template reaching the instance | `exportAs` on all three: `slBadge`, `slBadgeIcon`, `slBadgeAnchor` |
| Substituting projected content, kept lazy | One default `ng-content` on the badge and on the anchor; the icon is a directive on the consumer's own element, so nothing is wrapped and nothing is re-rendered. |
| Zoneless and `OnPush` | `ChangeDetectionStrategy.OnPush`, signals throughout, `computed` for the resolved axes and for the rendered count |
| Subscriptions torn down | None: the family listens to nothing. |
| A static attribute the consumer wrote surviving | The family writes only its own `data-*` and, when `live` is set, `role`. `role` is read with `HostAttributeToken` first, so a consumer who wrote their own keeps it. |
| An entry point others depend on staying one class | Nothing imports `badge` yet. `avatar` and `card` will, through `@slotted/angular/badge`. |

## The contract break

The family moves from schema 4. What changed, and how a consumer moves:

| Was | Is | Move |
| --- | -- | ---- |
| `class="slotted-badge"` | `data-ui="badge"` | Select on `[data-ui='badge'][data-part='root']`. Class names were never contract. |
| `data-slotted-component="badge"` | `data-ui="badge"` | Rename the selector. |
| `variant` naming the five colours | `tone` | Rename the prop. The five values are unchanged, and `variant` now names the painting, as it does in `button`. |
| `fill` naming the painting | `variant` | Rename the prop; rename the value `subtle` to `soft`. `solid` and `outline` are unchanged. |
| default `fill="solid"` | default `variant="soft"` | A badge that relied on the default now renders tinted. State `variant="solid"` to keep the old appearance. |
| `size` `sm \| md`, default `md` | `size` `sm \| md \| lg`, default `md` | Nothing to move. |
| Angular selector `span[slBadge]` | `[slBadge]` | Nothing to move: the selector widened. |
| — | `shape`, `count`, `max`, `showZero`, `locale`, `live`, `start`, `end` | New. |
| — | `BadgeAnchor`, `BadgeDefaultsProvider` / `SlBadgeStart`, `SlBadgeEnd`, `SlBadgeAnchor`, `provideBadgeDefaults` | New. |
| — | `focus-visible` | New. |

Two other reference pages render a badge — Collapsible and VirtualList, in both
bindings — and all four call sites move from `variant` to `tone` in this commit.
No family imports the component itself.

Two shared-tooling defects were found on the way and are fixed first, each in
its own commit:

- `packages/themes/default/test/contrast.test.mjs` held every tone's `solid`
  role against its `on-solid` and never held its `surface` role against its
  `text`. That tinted pair is what `badge`, `tag` and `alert` are made of, and
  Button handed it to them when `soft` left its painting axis; the first family
  to depend on it would have been the one to discover a shortfall, in a
  screenshot. The theme already satisfies the assertion — 4.57:1 at worst.
- `alert` and `tag` each asserted their five tones by reading `badge`'s
  contract, which held only while all three families were on the same schema.
  The list belongs to the theme, so `TONES` now lives in
  `specs/contract.schema.mjs` and both tests read it from there. Neither legacy
  contract is touched.

## Self-assessment

Captures read at `/tmp/claude-1000/-home-dreco-dev-slotted/09c5de42-24eb-44b2-aa59-cb2a00e94cfc/scratchpad/final/`;
the page itself is `tools/harness/out/badge.html`.

### 1. Icons

The family owns no artwork. `start` and `end` are boxes —
`--slotted-control-icon-size-sm` at `sm` and `md`, `-md` at `lg` — and the glyph
inside them is the consumer's, inheriting `currentColor` so it takes the tone
with the text. No `content` draws
a character anywhere in the stylesheet. `dot` is a painted disc rather than a
mask, because it is a shape and not a piece of artwork; under forced colours it
keeps a `currentColor` edge and stays visible. Nothing here is directional, so
nothing mirrors.

The one change that would most improve it: giving `sm` and `md` different glyph
boxes. Not made — the icon scale has three steps and the badge's own three span
less of it, so a 12px badge and a 13px badge landing on the same 14px glyph is
the right answer rather than a rounding error.

### 2. Motion

Nothing transitions, and the refusal is argued rather than assumed. Between rest
and focus a ring must appear at once. Between one tone, size or variant and
another the change is a deliberate edit by the page, not something the eye is
following. The one real candidate — a count appearing at the corner of a button
— is refused because `@starting-style` fires on every insertion including the
first paint, so twenty badges would pop on load to buy one useful transition;
`presence` (guide section 3) is the family that can tell the two apart, and the
transition returns with it. No literal duration exists in the sheet, and there
is no animation to stop under reduced motion.

The one change that would most improve it: the appear transition. Not made, for
the reason above, and named as a follow-on in `docs/BUILD-LOG.md`.

### 3. Responsiveness

No container and no breakpoint: a badge is sized by its content and has no
composition to change at one. It answers a narrow container by clipping its one
line with an ellipsis, never by reflowing into two — a badge that became a
paragraph would have stopped being a badge. Read at 240
(`badge-extremes-light-comfortable-ltr-240.png`), 420 and 720; the `extremes`
scene holds a 40-character string, a German compound and a 28-letter token, and
all three clip at 240 with their descenders and diacritics intact.

The one change that would most improve it: reaching the full string from the
clipped one, the way Carbon wraps a truncated Tag in a definition tooltip. Not
made here — `tooltip` is wave 4, and the string is still in the DOM for a page
search and for assistive technology, so nothing is lost meanwhile.

### 4. Refinement

The visual loop ran four rounds and corrected seven things the code did not
report. A unitless `0` invalidated `--_block-size` at `sm` and silently dropped
both minimums. A badge rendered as an anchor kept the UA underline. A six-pixel
dot's 3:1 rim left four pixels of tone, so every small dot read as dark rather
than as its own colour; the sixteen-pixel dot that replaced it stood taller than
the fourteen-pixel words beside it, and the diameter is now the type's own.
A rim on every filled chip made the three variants read as three weights of one
rimmed chip; `solid` now draws none. The neutral tone's filled and tinted forms
were the same rectangle, because the theme gives it one ground; the filled one
now takes the tone's next step. And the words sat 2.19 pixels high in their own
box, which is what the `label` part and `text-box` fixed — measured at 7.59
pixels of clearance above and below afterwards, at every size.

Alignment and rhythm: the box is the line box plus a symmetric inset, so the
three sizes are 18.8 / 24.2 / 29.6 pixels at comfortable and every badge in a
row sits on one centre line. Figures are tabular, so a count that ticks 9 → 10
grows by exactly one figure. The focus ring sits two pixels off a pill edge and
follows its radius, in both schemes
(`badge-composition-focus-a-data-ui-badge-{light,dark}-comfortable-ltr-420.png`).
No state changes geometry: the family paints only `focus-visible`, and an
outline reserves no space.

The one change that would most improve it: reducing the inline inset by one step
so a one-figure count is a true circle rather than eight per cent wider than
tall. Not made — measured through the DevTools protocol at 26.28 × 24.19, a
difference no reader can see, and the four pixels it would cost every text badge
are worth more than the roundness.

### 5. Tokens

Fifty-four custom properties, every one of them declared in
`packages/styles/src/badge/badge.tokens.json` and checked against the sheet.
Every component token falls back to a foundation token: `--slotted-badge-radius`
to `--slotted-radius-sm`, `--slotted-badge-ring-color` to `--slotted-surface`,
`--slotted-badge-dot-border-color` to `--slotted-border-strong`,
`--slotted-badge-border-width` to `--slotted-border-width-thin`,
`--slotted-badge-font-weight` to `--slotted-font-weight-medium`,
`--slotted-badge-font-family` to `--slotted-control-font-family`. Type and glyph
read the control scale — the only scale that moves with density. Nothing invents
a parallel scale, and the family declares no theme-contract token, so the
component layer stays empty.

Two literals, both geometry rather than values a theme retunes: the overhang is
half the badge's own size and the circular inset is 14% of the host's. Neither
is a step on any scale, which is why they are written as proportions and not
proposed as tokens.

The one change that would most improve it: promoting `--_dot-size` to a public
`--slotted-badge-dot-size`. Not made — it is now derived from the type, and a
token would let a theme break the relationship the dot exists to hold.

### 6. Patterns

There is no APG pattern, and the fact is sourced rather than recalled: the
pattern index at <https://www.w3.org/WAI/ARIA/apg/patterns/> was fetched and
contains no badge entry and no occurrence of the word. The itemized comparison
against the guidance that does apply — the `status` role in WAI-ARIA 1.2, and
WCAG 2.2 1.4.1, 1.4.3, 1.4.11, 2.4.7 and 4.1.3 — is the table in the
accessibility section above, one row per requirement with what this family does.
The platform supplies the element (`span`, phrasing content, no role) and the
family supplies the live region, the non-chromatic alternative and the 3:1 rim.

Composition rather than configuration: the icon is a part placed by document
order instead of Fluent's and Mantine's `iconPosition`; the hidden words are the
`visually-hidden` family instead of a `label` prop; the element is substituted
by `render` or by writing the directive elsewhere.

The one change that would most improve it: wiring `aria-describedby` from an
interactive host to the badge automatically, as `matBadge` does. Not made —
neither binding can safely reach into an element it did not render, and a frame
that only works when the host is one of the elements it knows fails silently.
Both wirings are shown on both reference pages instead.

### 7. Accessibility

Name: a badge with text is named by its text; a dot or an icon-only badge is
named by `visually-hidden` content, which every dot scene in the harness carries
and a test enforces. Role: none by default, `status` or `alert` when `live` says
so, and a role the consumer wrote is read first and never replaced. State: the
family has none. Keyboard: none — a badge is not a widget; rendered as an anchor
it is the platform's link and the family paints the ring. Focus: painted, two
pixels off, never trapped, never hidden.

Forced colours: one rule, `border-color: currentColor`, because the theme
collapses every tone ground to `ButtonFace` or `Canvas` and every tone border to
`ButtonBorder`, so all three variants would otherwise be the same unbounded
rectangle. Reduced motion: nothing animates. Colour is never the only signal —
the dot's words are required and documented, and the dot's rim is the one border
token held to 3:1. Text contrast is 4.57:1 at worst in `light`, 9.42:1 in `dark`
and 9.12:1 in `high-contrast`, now held by an assertion that did not exist.

The one change that would most improve it: exercising the live region in a real
screen reader. Not made here — it cannot be verified on this machine, and it is
raised at the gate.

### 8. Native API

React: a function component, `ComponentPropsWithRef<'span'>` extended rather
than a hand-written subset, `render` as a render prop, context for defaults,
`ref` reaching the element, no generated id and no layout read during render,
every `data-*` a consumer may style in the DOM, and `exactOptionalPropertyTypes`
respected — every optional prop is `T | undefined`.

Angular: standalone, `input()` throughout with `booleanAttribute` on the boolean,
`computed` for every resolved axis and for the rendered count, host metadata
rather than `@HostBinding`, `ViewEncapsulation.None` with the one authored
sheet, `exportAs` on all three, `inject()` over constructor parameters,
`HostAttributeToken` so a static `role` survives, `@slotted/angular/<name>` for
the cross-entry-point import, and `ng-content` for projection. No subscription
exists to tear down.

Neither imitates the other. React returns nothing for a count of nought; Angular
writes `display: none`, because a directive on an element the consumer owns
cannot un-write it. React needs a wrapper for the frame; Angular writes the
directive on the element the page already has. React takes the glyphs as `start`
and `end` props and wraps them; Angular projects the consumer's own element by
selector and the directive writes the part on it — the same split `button`
already makes. All three asymmetries are recorded rather than levelled down.

The one change that would most improve it: `ControlValueAccessor`. Not made and
not needed — a badge holds no value a form could submit.

### 9. Capability

Against the inventory, not against the scope paragraph. Twenty-three table-stakes
rows: eighteen adopted or adapted, two deferred to a named family and wave
(`tag`, `status-indicator`), three declined with the family or the composition
that replaces them written out. Six differentiators, six gaps, each with what
this family does about it.

The scope paragraph asked for solid/soft/outline, `tone`, `size`, `dot` and
`maxCount`. The family also ships the anchored frame with four placements and
two host shapes, `shape` as an axis, `live`, `showZero`, `locale`, an icon part,
element substitution and an application-wide defaults provider — because four
surveyed implementations ship the frame and no other family owns it, and because
two or more ship each of the rest.

No mutable capability, and therefore no state model: every value a badge holds
is one the consumer owns, and the badge never asks for a new one. That is
asserted rather than assumed, capability by capability, in the contract test.
There is no keyboard table because there is no pattern and no widget.

The one change that would most improve it: a `ribbon` recipe, the corner banner
Ant ships. Not made — one implementation, and it needs the card's clipping and
its corner, so it composes inside `card`'s `media` part rather than being a
badge.

### 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line above, with
the file that answers each or the sentence saying why the family does not need
it. An application sets `tone`, `variant`, `size`, `shape`, `max` and `locale`
once, in both bindings. The consumer's own handler always runs, because the
family registers none. Every state a consumer may style is in the DOM. The
Angular control is not a form control and says so.

The asymmetry worth naming: `locale` reaches the badge through DI in Angular and
through context in React, and it is the one input that decides *content* rather
than appearance — so an application that renders `1234` gets `1.234` in `de-DE`
without touching a single badge. None of the eleven surveyed implementations
offers that in either binding.

The one change that would most improve it: reading the locale from Angular's own
`LOCALE_ID` when `provideBadgeDefaults` states none. Not made — it would make
the two bindings disagree about where a locale comes from, and `LOCALE_ID`
defaults to `en-US` whether or not the application ever set it, so the fallback
would be a wrong answer stated confidently instead of the runtime's own.

## Definition of done — guide section 18

1. **Purpose, use and anti-use.** A count, a status or a short piece of
   non-editable metadata, in the flow or on the corner of another element. Not a
   command, not removable, not selectable — those are `tag`. Not a standalone
   operational state with its own label — that is `status-indicator`.
2. **Anatomy.** `root`, `start`, `label`, `end`, `anchor`. The words have a box
   of their own, as they do in `button`, and it is what `text-box` needs. The
   frame is the one part that contains its family's root and therefore carries
   `data-ui` itself.
3. **Controlled and uncontrolled.** None, and the reason is written: the badge
   holds no mutable value, never asks for a new one, and so declares no
   `stateModel`. Asserted capability by capability in the contract test.
4. **State matrix.** `default` and `focus-visible`. No `hover`, no `active`, no
   `disabled`: a badge refuses no interaction and answers no pointer. A badge on
   a disabled control is greyed by the control.
5. **Keyboard, focus, ARIA, touch, screen reader.** No keyboard model — no
   widget and no pattern. Focus painted for the anchor case. ARIA: no role by
   default, `status` or `alert` under `live`, a consumer's role never replaced.
   Touch: nothing is a target. Screen reader: the dot's words are required, the
   anchored badge is read after its host, and both host wirings are documented.
   The live region is the one thing not verified on this machine.
6. **Recipes through tokens.** `tone` × `variant` × `size` × `shape`, all from
   the foundation; type and glyph move with density.
7. **Responsive, RTL, locale, reduced motion.** No breakpoint; wraps rather than
   truncating. RTL mirrors from logical properties plus one direction sign for
   `translate`, photographed at
   `badge-light-comfortable-rtl-420.png` — including `99+` rendering as `+99`,
   which is correct in a right-to-left paragraph. Locale writes the digits.
   Nothing animates.
8. **Loading, empty, error, disabled, extreme content.** No loading — a badge is
   not asynchronous. Empty is a count of nought, which removes the badge rather
   than leaving a blank circle. No error state — a badge reports a value, it does
   not validate one. Disabled belongs to the control. Extreme content wraps, held
   by the `extremes` scene at 240 pixels.
9. **SSR, performance, virtualisation.** No generated id and no layout read
   during render, so hydration matches. One `Intl.NumberFormat` per locale,
   cached, because a dense table renders hundreds of badges. Nothing to
   virtualise.
10. **Examples.** Eight scenarios on each reference page — playground,
    appearance, sizes, shapes, count, anchored, composition, accessibility —
    plus seven curated snippets per binding.
11. **Shared behavioural tests.** Fourteen contract assertions, twenty-two
    stylesheet assertions, nine `@slotted/core/count` assertions, and the same
    behaviours asserted in both bindings: identity, axes, role inference, the
    count rules, the defaults provider, the frame, and element substitution.
12. **Changelog and migration.** The break table above, and the entry in
    `docs/BUILD-LOG.md`.
