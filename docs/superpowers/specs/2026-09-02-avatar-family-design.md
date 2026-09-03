# Avatar and Avatar Group family design

Rebuild of `avatar` against schema 5 and the token foundation, and construction
of `avatar-group` beside it. Wave 2, mode `refazer`, guide section 10. The
public API of `avatar` breaks; the moves are at the end.

## Capability inventory

### Surveyed

Fourteen implementations, read on 2 September 2026. Sources chosen to
disagree: three ship a headless box with no name and no initials, four derive
initials and a colour from the name, three ship a group with an overflow
popup, and three ship no group at all.

| Source | Reference | What it calls the family |
| ------ | --------- | ------------------------ |
| Radix Primitives | <https://www.radix-ui.com/primitives/docs/components/avatar> | `Avatar.Root` / `Avatar.Image` / `Avatar.Fallback`; `Image.onLoadingStatusChange`, `Fallback.delayMs`, `asChild`. No name, no initials, no group |
| Base UI | <https://base-ui.com/react/components/avatar> | same three parts; `Image.onLoadingStatusChange`, `Fallback.delay` (0), `ImageLoadingStatus = 'idle' \| 'loading' \| 'loaded' \| 'error'`, `data-starting-style` on the image. No group |
| Ark UI / Zag | <https://ark-ui.com/docs/components/avatar> | `Avatar.Root` / `Image` / `Fallback`; `onStatusChange`, `ids`, `useAvatar` with `setSrc`/`setLoaded`/`setError`, `data-state="visible\|hidden"`. No group |
| Chakra UI v3 | <https://chakra-ui.com/docs/components/avatar>, `packages/react/src/components/avatar/avatar.tsx` | Ark parts plus `Avatar.Fallback name` (initials derived), `Avatar.Group`, size/variant/shape recipe |
| Fluent UI v9 | `Avatar.types.ts`, `AvatarGroup.types.ts`, `AvatarGroupItem.types.ts` <https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-avatar> | `Avatar` (`name`, `initials`, `icon`, `image`, `badge`, `shape` `circular\|square`, `size` ×14 from 16 to 128, `color` `neutral\|brand\|colorful\|`30 named, `idForColor`, `active` `active\|inactive\|unset`, `activeAppearance` `ring\|shadow\|ring-shadow`); `AvatarGroup` (`layout` `spread\|stack\|pie`, `size`); `AvatarGroupItem` (`isOverflowItem`, `overflowLabel`) |
| Atlassian Design System | `@atlaskit/avatar` `types.d.ts` + `avatar.d.ts`, `@atlaskit/avatar-group` `avatar-group.d.ts` | `Avatar` (`appearance` `circle\|square\|hexagon`, `size` xxsmall 16 … xxlarge 128, `name`, `label`, `src`, `href`, `isDisabled`, `presence` ×4, `status` ×4, `borderColor`, `stackIndex`, `imgLoading`, `as`, `aria-haspopup`); `AvatarGroup` (`appearance` `grid\|stack`, `maxCount` 5 stack / 11 grid, `data`, `label`, `moreIndicatorLabel` defaulting to “N more people”, `onMoreClick`, `overrides`, tooltip position) |
| Vaadin | `vaadin-avatar-mixin.d.ts`, `vaadin-avatar-group-mixin.d.ts` | `vaadin-avatar` (`name`, `abbr` auto-derived, `img`, `colorIndex`, `withTooltip`, `i18n.anonymous`); `vaadin-avatar-group` (`items`, `maxItemsVisible`, `i18n.activeUsers` one/many, `joined`, `left`) |
| MUI | <https://mui.com/material-ui/react-avatar/>, <https://mui.com/material-ui/api/avatar-group/> | `Avatar` (`src`, `srcSet`, `alt`, `variant` `circular\|rounded\|square`, `imgProps`, `sizes`, `children` as initials); `AvatarGroup` (`max` 5, `total`, `spacing` `medium\|small\|number`, `renderSurplus(surplus)`, `variant`, `slots.surplus`) |
| Ant Design | <https://ant.design/components/avatar> | `Avatar` (`src`, `srcSet`, `alt`, `icon`, `gap` 4, `shape` `circle\|square`, `size` `large\|medium\|small\|number\|responsive object`, `draggable`, `crossOrigin`, `onError` returning `false` to keep the image); `Avatar.Group` (`max.count`, `max.style`, `max.popover`, `size`, `shape`) |
| HeroUI v3 | <https://www.heroui.com/docs/components/avatar> | `Avatar` / `Avatar.Image` / `Avatar.Fallback`; variants `letter`, `letter soft`, `icon`, `icon soft`, `img`; colours accent/default/success/warning/danger; sizes sm–lg; `Avatar.Group` with `+N` |
| PatternFly | <https://www.patternfly.org/components/avatar> | `Avatar` (`src`, `alt`, `initials` — “pass only a single initial”, `size` sm/md/lg/xl, `isBordered`, `color` ×9 which “automatically include a border”). No group |
| React Spectrum | <https://react-spectrum.adobe.com/react-spectrum/Avatar.html> | `Avatar` (`src`, `alt`, `size` `avatar-size-50` … `700` or a number, `isDisabled`). No initials, no group |
| Polaris | <https://polaris.shopify.com/components/images-and-icons/avatar> | `Avatar` (`name`, `initials`, `source`, `size`, `customer`) |
| Primer | <https://primer.style/components/avatar> | `Avatar` (`src`, `alt`, `size`, `square`), with the documented rule that circular avatars represent people and square avatars represent bots, teams and organisations; `AvatarStack` for the overlapped group |

The WAI-ARIA Authoring Practices carry no avatar pattern. The pattern index at
<https://www.w3.org/WAI/ARIA/apg/patterns/> lists Accordion through Treeview and
contains no entry for avatar; the string does not occur on the page. The
applicable official guidance is therefore the platform's own: the `<img>`
element (<https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img>),
the `img` role in WAI-ARIA 1.2, the W3C WAI `alt` decision tree
(<https://www.w3.org/WAI/tutorials/images/decision-tree/>) and its functional
images page (<https://www.w3.org/WAI/tutorials/images/functional/>), plus WCAG
2.2 1.1.1 Non-text Content, 1.4.11 Non-text Contrast and 2.5.8 Target Size
(Minimum). The itemized comparison is in the accessibility section below.

### Table stakes

Capabilities two or more surveyed implementations ship.

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| Image, initials and icon in one component | Fluent, Chakra, Vaadin, Ant, Polaris, HeroUI, PatternFly, Atlassian | adopt | `image` and `fallback` parts; the fallback holds the initials, or the family's own person glyph when there are none |
| Ordered fallback image → initials → icon, with no broken-image glyph | Fluent, Chakra, Ant, Vaadin, HeroUI, Radix, Base UI, Ark | adopt | the image is out of the document until it reports `loaded`, so a failed request never paints a torn-page icon |
| Loading status a consumer can observe | Radix (`onLoadingStatusChange`), Base UI (`onLoadingStatusChange`), Ark (`onStatusChange`) | adopt | `status` with the four values all three name, reported by `onStatusChange` / `(statusChange)` and written to `data-status` |
| Loading status a consumer can supply | Ark (`useAvatar().setLoaded/setError`) | adapt | `status` is also an input. One surveyed implementation ships the escape and it ships it imperatively; here the consumer's explicit value simply wins over the derived one, which is the rule the whole library already follows |
| Initials derived from a name | Chakra, Vaadin, Polaris, Fluent | adopt | `@slotted/core/identity`, grapheme-aware and locale-aware |
| Explicit initials override | Vaadin (`abbr`), Fluent (`initials`), Polaris, PatternFly | adopt | `initials` |
| Deterministic colour from the name | Fluent (`colorful` + `idForColor`), Vaadin (`colorIndex`), PatternFly (`color` ×9), Ant | adapt | `tone="auto"`, the default, seeded by `idFor ?? name`; the palette is the library's five tones rather than a colour list, because `PROJECT-PRD.md` 2.4 refuses an arbitrary colour in the contract |
| Explicit tone | all of the above plus HeroUI | adopt | `tone` with the five semantic tones |
| Circle and square shapes | Fluent, Ant, Atlassian, MUI, Primer, Chakra | adopt | `shape`: `circle`, `square`. Primer's rule is documented: circle for a person, square for a team, an organisation or a bot |
| Size scale | all fourteen | adapt | five steps, `xs` … `xl`, and every step answers density. Fluent's fourteen pixel sizes and Spectrum's nine named ones are a scale the theme owns here, not a prop value |
| Painting: filled versus tinted | HeroUI (`letter` vs `letter soft`), PatternFly (colour modifiers), Ant | adopt | `variant`: `soft` (default), `solid` |
| Ring separating an avatar from what it overlaps | Atlassian (`borderColor`), PatternFly (`isBordered`), Ant, HeroUI | adapt | `--slotted-avatar-ring-width` and `--slotted-avatar-ring-color`, set by the group and retunable by any container. Atlassian's is a CSS colour prop, which cannot answer three colour schemes |
| Disabled avatar | Spectrum (`isDisabled`), Atlassian (`isDisabled`) | adopt | `disabled`, painted with the disabled tokens and desaturating the photograph |
| Decorative avatar that must not be announced | Atlassian (`label`), and the W3C decision tree | adapt | `decorative`, which is the library's own capability name for it; the name still drives the initials and the tone |
| Element substitution | Atlassian (`as`), Radix/Ark (`asChild`), Base UI (`render`) | adopt | `render` in React; in Angular the component is written on the consumer's own element |
| Native image attributes reaching the `<img>` | MUI (`srcSet`, `sizes`, `imgProps`), Ant (`srcSet`, `crossOrigin`, `draggable`), Atlassian (`imgLoading`) | adopt | `AvatarImage` extends the native element's props in React; in Angular the `<img>` is the consumer's own, so `ngSrc` and `NgOptimizedImage` work untouched |
| Defaults for the whole application | Fluent (`AvatarGroupContext`), Atlassian (`AvatarContext` for `size`) | adopt | `AvatarDefaultsProvider` and `provideAvatarDefaults` |
| A group that overlaps its members | Fluent, Atlassian, MUI, Ant, Vaadin, Chakra, HeroUI, Primer | adopt | `avatar-group`, a family of its own |
| Group limit with a `+N` summary | MUI (`max` 5), Atlassian (`maxCount` 5), Ant (`max.count`), Vaadin (`maxItemsVisible`), Fluent | adopt | `max`, default 5, and an `overflow` part holding an avatar whose visible text is `+N` |
| A true total larger than the rendered members | MUI (`total`), Atlassian (`data`) | adopt | `total`, for a server-paged list that renders three of forty |
| Group sizes and shapes its members once | Fluent (`AvatarGroupContext`), Atlassian, Ant, MUI | adopt | the group provides `size`, `shape` and `variant` through the same defaults mechanism a provider uses, so an explicit value on a member still wins |
| Overlapped and non-overlapped layouts | Fluent (`spread\|stack\|pie`), Atlassian (`grid\|stack`) | adapt | `layout`: `stack` (overlapped, the default) and `spread` (a wrapping row with a gap). `pie` is one implementation and is declined below |
| The hidden members stay identifiable | Vaadin (tooltip plus a list on click), Atlassian (`moreIndicatorLabel`, default “N more people”, plus a popup), Ant (`max.popover`) | adapt | the overflow avatar's accessible name is, by default, the hidden members' names joined with `Intl.ListFormat` for the group's locale. `overflowLabel` replaces it |
| A list the assistive technology can count | Atlassian (`label`, announced as “list, avatar group, X items”) | adopt | the group is a `<ul>` and its members are `<li>`; the consumer writes `aria-label` on it, as `button-group` already decided for the same question |
| A tooltip carrying each member's full name | Vaadin (`withTooltip`), Atlassian (tooltips on by default) | defer to `tooltip` | wave 5, `docs/rebuild-order.md`. Until it exists the name is not lost: it is the avatar's own accessible name, on the root, in every fallback state |
| An overflow that opens the hidden members | Vaadin (click opens a list), Atlassian (popup), Ant (`max.popover`) | defer to `popover` | wave 5. The `overflow` part takes `render`, so the consumer's own trigger element replaces it today: `overflow={(props) => <button {...props} onClick={open} />}` |
| Presence and status marks on the corner | Fluent (`badge`), Atlassian (`presence`, `status`) | defer to `badge` | shipped in this wave, with the `anchor` part built for exactly this: `<BadgeAnchor overlap="circle"><Avatar …/><Badge shape="dot" tone="success"/></BadgeAnchor>`. A second corner-mark implementation inside `avatar` would be the same component twice |
| Delay before the fallback appears | Radix (`delayMs`), Base UI (`delay`) | decline | Two implementations, and both are a workaround for a flash their own design creates by mounting the fallback first. Here the fallback is the resting state and the image arrives over it, so there is nothing to delay; the transition below is what removes the flash |
| Numeric or arbitrary pixel size | Fluent (14 values), Spectrum (number), Ant (number and a responsive object), MUI (`sx`) | adapt | `--slotted-avatar-size` is the documented custom property a container or an instance sets, which is the mechanism `icon` established in wave 1. A number in the contract would be a second size scale that no theme can retune |
| Hexagon shape | Atlassian | decline | One implementation. It is Atlassian's own product mark, not a family capability |
| `pie` group layout | Fluent | decline | One implementation, and it is a chart of the group rather than a list of it |
| Keeping a broken image visible | Ant (`onError` returning `false`) | decline | One implementation, and the guide requires the opposite: “falha de imagem não expõe ícone quebrado”. The consumer that wants the broken element keeps it by rendering its own `<img>` through `renderImage` |
| Group tooltip position, boundaries element, popup overrides | Atlassian | decline | One implementation, and every one of them belongs to the overlay family deferred above |

### Differentiators

| Offered here | Not in any surveyed implementation |
| ------------ | ---------------------------------- |
| Initials are segmented by grapheme and upper-cased for the locale | All four implementations that derive initials use `charAt(0)` or `slice(0, 1)` and `toUpperCase()`. That splits a surrogate pair in the middle, drops a combining mark, and turns Turkish `i` into `I` instead of `İ`. `@slotted/core/identity` uses `Intl.Segmenter` and `toLocaleUpperCase(locale)` |
| The overflow avatar's accessible name is the hidden members' names, joined by `Intl.ListFormat` | Atlassian's default is the English string “N more people”; Vaadin's requires the tooltip to be opened; MUI, Ant, Fluent, Chakra and HeroUI leave `+3` as the whole accessible name. Here the names are the name, in the group's own locale, with no English shipped |
| The avatar's accessible name does not change when the picture arrives | Every surveyed implementation names the image and leaves the fallback unnamed, so the same avatar is “Ada Lovelace” once the photograph loads and “AL” before it. The name lives on the root, the image takes an empty `alt`, and the announcement is identical in all four statuses |
| An interactive avatar smaller than the WCAG minimum grows its hit area | Fluent ships a 16px avatar, Atlassian a 16px and a 20px, and both accept a click on it. Here an avatar that is a link or a button carries a centred `::after` of at least `--slotted-target-min`, which changes no layout and satisfies WCAG 2.2 2.5.8 |
| Three colour schemes, three densities, logical properties throughout | All fourteen ship light and dark. None answers three densities: the avatar is the same 32 pixels in a comfortable form and in a dense table. None uses logical properties for the group's overlap, so every one of them needs a second rule for a right-to-left document |
| The tinted fallback is contrast-checked in all three schemes | Fluent's `colorful` set, PatternFly's nine colours and Vaadin's seven indices are decorative palettes with no stated ratio for the initials on them. The tinted pair here is the tone's `surface` and `text` roles, which `packages/themes/default/test/contrast.test.mjs` already holds |
| Defaults set once in both a React and an Angular binding | Fluent and Atlassian have the React context and no Angular; Vaadin has neither |

### Gaps

| Gap | What this pair does |
| --- | ------------------- |
| A name with no Latin letters | `山田太郎` has no spaces, so a first-and-last-word rule yields `山`. `Ада Лавлейс` yields `АЛ`. `محمد صلاح` yields `مص`, rendered right to left inside a `dir="auto"` fallback so the two graphemes are not reversed. The `identity` scene holds all three |
| A name that is one word, or none | One word gives one grapheme; an empty or whitespace-only name gives no initials at all, and the person glyph is drawn instead. No surveyed implementation states what an empty name does, and Chakra renders an empty circle |
| The last word of a name that is not part of it | `Ada Lovelace (she/her)` reduced to `AS`, and `Ada Lovelace <ada@example.com>` to `AA`: a pronoun set, a role, a team or the address a mail header appends is not a name, and taking its first letter puts a stranger's initial on the person's face. Bracketed content — round, square, curly and angle — is dropped before the words are counted, and read anyway when dropping it would leave nothing. Fluent is the only surveyed implementation that removes parenthesised content; the other three that derive initials all read it |
| A name that is an email address | `ada@example.com` is a name a real product passes when it has nothing better. The local part is used, so the initial is `A` rather than `a` from the whole string. One rule, in `identity`, tested |
| Five identity colours and forty people | Collisions are certain, so the colour is stated in the reference page as an aid to scanning and never as the identifier. The name is the identifier, and it is on every avatar in every status. Fluent's thirty colours make the same promise less obviously false without making it true |
| A photograph that arrives 400ms after the page | The image fades over the fallback rather than replacing it in one frame, at `--slotted-duration-short`, which `prefers-reduced-motion` collapses to 1ms. Base UI is the only surveyed implementation that offers the hook; none ships the transition |
| A photograph already in the browser cache | The load event has fired before either binding attaches a listener, so both ask the element whether it is already `complete` with a non-zero `naturalWidth`. Kept from the family being rebuilt, and now tested in both bindings |
| A group whose members overlap the one under them | Hover and keyboard focus raise the member above its neighbours, so the focus ring is never half-hidden under the next avatar. MUI, Ant, Chakra and Primer all clip the ring |
| An empty group | `:empty` removes the group from the layout, so a permission-filtered list does not leave a gap in the row that holds it. The same decision `button-group` took, for the same reason |
| A group of one | The overflow is not rendered when the surplus is nought, and `max` never hides the only member: a `+1` beside nothing is a summary of nothing |

## Anatomy

### `avatar`

| Part | Element | What it is |
| ---- | ------- | ---------- |
| `root` | `span` | The box: size, shape, tone, edge, and the accessible name |
| `image` | `img` | The photograph. Out of the document until `status` is `loaded` |
| `fallback` | `span` | What stands in: the initials, the consumer's own content, or — when it is empty — the person glyph the family masks into it |

The root carries `data-ui="avatar"`. The name lives on the root as
`aria-label` with `role="img"`, and the image takes an empty `alt`, so the
avatar announces the same thing before and after the picture arrives.

### `avatar-group`

| Part | Element | What it is |
| ---- | ------- | ---------- |
| `root` | `ul` | The list. `aria-label` is the consumer's, as it is on `button-group` |
| `item` | `li` | One member. Holds an `avatar` |
| `overflow` | `li` | The summary. Holds an `avatar` whose visible text is `+N` and whose accessible name is the hidden members' names |

The root carries `data-ui="avatar-group"`. The overflow holds a real avatar
rather than a fourth part styled to look like one, so it takes the group's
size, shape, edge and ring from the same rules as every other member.

## Axes and defaults

### `avatar`

| Axis | Values | Default |
| ---- | ------ | ------- |
| `size` | `xs`, `sm`, `md`, `lg`, `xl` | `md` |
| `shape` | `circle`, `square` | `circle` |
| `tone` | `auto`, `accent`, `secondary`, `success`, `warning`, `danger` | `auto` |
| `variant` | `soft`, `solid` | `soft` |
| `status` | `idle`, `loading`, `loaded`, `error` | derived |

`decorative` and `disabled` are booleans, both `false`.

### `avatar-group`

| Axis | Values | Default |
| ---- | ------ | ------- |
| `layout` | `stack`, `spread` | `stack` |
| `size` | as `avatar` | `md` |
| `shape` | as `avatar` | `circle` |

`max` is `5`, matching MUI and Atlassian's stack. `total` has no default: absent,
the rendered members are the total.

## The size scale, and why it is in the theme

An avatar answers density, and a family can only answer density by reading a
token the theme restates per density. The three scales that do are control
geometry, control type and control glyphs — and all three name a control. An
avatar is not a control: `--slotted-control-height-lg` is 38 pixels, so a
family bounded by that scale cannot express the 64-pixel avatar on a profile
page that every one of the fourteen surveyed implementations ships.

Five density-varying tokens are therefore added at the **component** layer,
which `docs/token-foundation.md` describes as the layer a family reaches for
when a semantic token cannot be retuned for it. This is the first family to
meet that case, and the layer stops being empty.

| Token | Comfortable | Compact | Dense |
| ----- | ----------- | ------- | ----- |
| `--slotted-avatar-size-xs` | `24px` | `22px` | `20px` |
| `--slotted-avatar-size-sm` | `28px` | `26px` | `24px` |
| `--slotted-avatar-size-md` | `36px` | `32px` | `28px` |
| `--slotted-avatar-size-lg` | `48px` | `42px` | `36px` |
| `--slotted-avatar-size-xl` | `64px` | `56px` | `48px` |

`xs` at comfortable is exactly `--slotted-target-min`, so the smallest avatar
is hittable without correction; below it — `xs` at dense, `sm` nowhere — the
hit-area rule in the accessibility section applies. `md` at comfortable is 36
pixels, two below `--slotted-control-height-lg`, so an avatar in a toolbar
reads as a peer of the buttons beside it rather than as a taller object.

Everything else the family scales is a proportion of that box rather than a
sixth scale: the initials' type, the glyph, the square corner and the group's
overlap. This is the reasoning `badge` used for its overhang — a proportion of
a box is geometry, not a token.

## Painting

`variant` decides how the tone is used, and `tone` decides which one:

- `soft` fills with the tone's `surface` role, writes the initials in its
  `text` role, and draws its `border` role as a hairline edge. The pair is the
  one `badge` already uses and the one the contrast test already holds.
- `solid` fills with the tone's `solid` role and writes `on-solid`. `secondary`
  reads `solid-hover` for the same reason `badge` does: `secondary.solid` is the
  surface colour in all three schemes, so a filled neutral avatar would be
  invisible.

When the picture is showing, the edge becomes `--slotted-border-subtle`: a
photograph does not want a coloured rim, and a white photograph on a white
surface without any rim has no boundary at all.

`tone="auto"` picks one of the five from a 32-bit FNV-1a hash of `idFor ?? name`,
computed in `@slotted/core/identity` so the two bindings and the server cannot
disagree. Five is a small palette and collisions are frequent; the colour is an
aid to scanning a list, and the name is what identifies the person.

## Motion

One transition, and one refusal.

**Adopted.** The image's opacity moves from 0 to 1 when `status` becomes
`loaded`, at `--slotted-duration-short` with `--slotted-easing-enter`. The
fallback is the resting state and the photograph arrives over it; without the
transition a list of twenty avatars snaps letter-by-photograph as each request
returns. `prefers-reduced-motion` collapses the duration to 1ms in the theme,
and nothing here loops.

**Refused.** The raise on hover and focus inside a stacked group is a change of
stacking order, which is discrete: an avatar that took 200ms to come to the
front would be behind its neighbour for most of the time the pointer is on it.
It changes `z-index` and nothing else.

## Accessibility

No APG pattern exists; the platform's own guidance applies, item by item.

| Requirement | Source | Where it is answered |
| ----------- | ------ | -------------------- |
| Non-text content has a text alternative | WCAG 2.2 1.1.1 | `aria-label` on the root, from `name`, in all four statuses |
| A decorative image has an empty alternative | W3C `alt` decision tree | `decorative` writes `aria-hidden="true"` and no role or label |
| A functional image's alternative names the action | W3C functional images | the consumer's, on the element `render` produced; the family's `role="img"` is dropped by writing an explicit role, as `button-group` decided |
| The image is not announced twice | `img` role in WAI-ARIA 1.2 | `alt=""` on the `<img>`; `role="img"` on the root makes its descendants presentational |
| Graphic that carries meaning has 3:1 non-text contrast | WCAG 2.2 1.4.11 | the `soft` edge is the tone's `border` role; the photograph's edge is `--slotted-border-subtle` |
| Text contrast | WCAG 2.2 1.4.3 | the initials are the tone's `text` role on its `surface` role, held by the theme's contrast test |
| Interactive target is at least 24 × 24 | WCAG 2.2 2.5.8 | an avatar that is a link, a button, or carries `tabindex` grows a centred `::after` to `--slotted-target-min` |
| A list is announced as a list of N | HTML `ul`/`li` | the group is a real list; `aria-label` is the consumer's |
| The hidden members are reachable | none — this is the gap | the overflow avatar's accessible name is their names, joined for the locale |
| Reduced motion | WCAG 2.3.3, and the theme | the one transition reads a motion-scale token |
| Forced colours | CSS Color Adjust | the theme remaps every token the family reads; the family writes one rule of its own, for the same reason `badge` does — see below |

Keyboard: the family adds no key. An avatar is not interactive unless the
consumer makes it one, and then the element it became carries the platform's
own behaviour. The group is a list, not a composite widget, so there is no
roving focus to own; members that are links or buttons are ordinary tab stops
in document order. This is a deliberate departure from nothing — no surveyed
implementation gives the group a keyboard model either, and Atlassian's is a
list whose overflow is a menu button, which is the composition deferred above.

## Ecosystem integration

### React

| Question | Answered by |
| -------- | ----------- |
| Controlled and uncontrolled pair, plus a request carrying a reason | No mutable capability. `status` is the one value the family derives, and a load event is a fact rather than a request: there is nothing to cancel, and the closed reason vocabulary has no member that fits. The consumer's explicit `status` wins over the derivation, and `onStatusChange` reports it |
| Defaults set once | `AvatarDefaultsProvider` / `useAvatarDefaults`; `AvatarGroup` provides through the same context, so a member's explicit value still wins |
| Substituting the rendered element of each part | `render` on `Avatar` and on `AvatarGroup`; `renderImage` for the image, which is what lets a Next.js `<Image>` receive the family's `data-part`, `onLoad`, `onError` and `ref`; `children` replace the fallback's content |
| The consumer's handler still runs | `onLoad` and `onError` compose; `onStatusChange` is additive |
| Reaching the native element and the imperative action | `ref` reaches the root and, through `renderImage`, the image. No imperative handle: nothing this family does is inexpressible declaratively |
| Server rendering without a hydration mismatch | Initials, tone and the joined overflow label are pure functions of the props; no layout is read during render. `status` starts at `idle` on both sides, and the cache check runs in a callback ref after mount |
| Every state a consumer may style is in the DOM | `data-status`, `data-disabled`, `data-size`, `data-shape`, `data-tone`, `data-variant`, `data-layout` |
| Each part's props type is the native element's, extended | `ComponentPropsWithRef<'span'>`, `<'img'>`, `<'ul'>`, `<'li'>` |

### Angular

| Question | Answered by |
| -------- | ----------- |
| Two-way value in the signal form | None to hold. `status` is an `input()` with an `output()` reporting the derived value; `model()` would promise a two-way binding for a value the browser owns |
| Reactive Forms | No. An avatar holds no value a form submits |
| Defaults set once | `AVATAR_DEFAULTS` and `provideAvatarDefaults()`; `SlAvatarGroup` provides the same token to its members |
| A template reaching the instance | `exportAs: 'slAvatar'`, `'slAvatarImage'`, `'slAvatarGroup'` |
| Substituting projected content, kept lazy | `<ng-content>` for the fallback; the `<img slAvatarImage>` is the consumer's own element, so `NgOptimizedImage`'s `ngSrc` works untouched — the integration React cannot offer and Angular can |
| Zoneless and `OnPush` | signals throughout; `contentChildren()` for the group's members, `computed` for every derived value |
| Every subscription torn down | No subscription. The image's `load` and `error` are host listeners |
| A static attribute the consumer wrote survives | `role` is read with `HostAttributeToken` before the host writes `img` |
| An entry point others depend on stays a single class | `@slotted/angular/avatar` exports `SlAvatar`; `@slotted/angular/avatar-group` imports it through the entry point |

## The contract break

`avatar` was schema 4 and is listed in `specs/legacy-families.json`; it leaves
that list in the same commit. What moves:

| Before | After | How a consumer moves |
| ------ | ----- | -------------------- |
| `class="slotted-avatar"` and `data-slotted-component="avatar"` | `data-ui="avatar"` | Replace `.slotted-avatar` with `[data-ui="avatar"]` in application CSS. The class is no longer written |
| `data-loaded` on the root | `data-status="idle\|loading\|loaded\|error"` | `[data-loaded]` becomes `[data-status="loaded"]`. A boolean could not say whether the picture had failed or had never been asked for |
| `size` of `sm`, `md`, `lg` at 28, 40 and 56 pixels | `size` of `xs` … `xl`, density-varying, `md` at 36 | `sm` → `sm`, `md` → `lg`, `lg` → `xl` reproduces the previous three sizes most closely at comfortable density |
| `AvatarImage` and `AvatarFallback` React components | `src` and `children` on `Avatar`, `renderImage` for a custom element | `<Avatar><AvatarImage src={s} alt={n}/><AvatarFallback>{i}</AvatarFallback></Avatar>` becomes `<Avatar name={n} src={s} initials={i}/>`. The initials are derived from `name`, so `initials` is usually removable too |
| Angular `span[slAvatar]` with a required `span[slAvatarFallback]` child | `[slAvatar]` with `name`, and an optional projected fallback | Drop the `<span slAvatarFallback>`; keep `<img slAvatarImage>` if the image element must be yours |
| The fallback was named by its own text | The root is named by `name` | Remove `alt` from the image, or leave it: the family writes `alt=""` on the image it renders, and an `AvatarImage` the consumer renders keeps whatever it is given |

`avatar-group` is new; it breaks nothing.

## Definition of done — guide section 18

1. **Purpose, uses, anti-uses.** A picture of a person or an entity, and what
   stands in when there is none. Not a button: an avatar that acts becomes one
   through `render`. Not a status: the corner mark is `badge`. Not a
   collection: `avatar-group` is a list of at most a screenful, and forty
   members is a table.
2. **Anatomy.** Above: three parts each.
3. **Controlled and uncontrolled.** No mutable capability; `status` is derived
   and overridable, with the reason written above.
4. **State matrix.** `default`, `hover`, `focus-visible`, `disabled`, and the
   four statuses, each combination photographed.
5. **Keyboard, focus, ARIA, touch, screen reader.** Above.
6. **Recipes.** `size`, `shape`, `tone`, `variant`, `layout`, all through
   tokens.
7. **Responsive, RTL, locale, reduced motion.** The group's overlap is a
   logical inset and mirrors; the initials are upper-cased for the locale; the
   overflow label is joined for the locale; the one transition collapses.
8. **Loading, empty, error, disabled, extreme content.** The four statuses are
   the first three; an empty name draws the glyph; a 40-character `initials`
   value is clipped by the box rather than escaping it.
9. **SSR.** Pure functions of props; the cache check is post-mount.
10. **Examples.** Eight scenes on each reference page.
11. **Behavioural tests shared between bindings.** The contract tests, plus
    `identity` tested once for both.
12. **Changelog and migration.** The break table above, repeated in
    `docs/BUILD-LOG.md`.

## Self-assessment

For each of the ten dimensions: the one change that would most improve it, and
whether it was made.

### 1. Icons

The family owns one piece of artwork and it is real geometry:
`--slotted-icon-person`, added to the glyph scale in lockstep across
`packages/tokens/src/contract.json`, `packages/themes/default/src/theme.json`
and `docs/token-foundation.md`, and drawn as a mask on
`[data-part='fallback']:empty::before`. It is the only glyph in the scale drawn
as a filled silhouette rather than as strokes, because it stands in for a
photograph rather than annotating text. `packages/themes/default/test/glyphs.test.mjs`
holds it — and now holds `--slotted-icon-external` too, which had been left out
of that list. There is no directional artwork, so nothing mirrors.

**The change that would most improve it:** a second glyph for the square
avatar — a building or a team mark — so an organisation with no name does not
fall back to a person. **Not made:** Fluent, the only surveyed implementation
with a default icon, uses the person at every shape, and a second glyph decided
from inside one family for a case a consumer can already fill with `children` is
a token added on a guess. Recorded here rather than shipped.

### 2. Motion

Two state pairs can move, and each was decided in writing.

| Pair | Transitions | Why |
| ---- | ----------- | --- |
| fallback → picture | yes, `--slotted-duration-short` with `--slotted-easing-standard`, on the picture's opacity, the fallback's opacity and the edge's colour | The eye has to follow it: a list of twenty avatars without it snaps letter-by-photograph as each request returns |
| raised → not raised, in a stack | no | It is a change of stacking order, which is discrete. A raise that took two hundred milliseconds would leave the avatar behind its neighbour for most of the time the pointer is on it |
| default → hover, default → focus | no | A one-pixel edge colour. Animating it would make the ring arrive after the pointer |
| enabled → disabled | no | Not an interaction: the page re-rendered |

No literal duration; `packages/styles/src/motion.test.mjs` holds that. Nothing
loops, so there is nothing to stop under reduced motion beyond the theme's own
collapse of `--slotted-duration-short` to 1ms.

**The change that would most improve it:** the edge's colour was snapping a
frame before the face finished appearing, because only the two opacities were
transitioned. **Made:** `border-color` is on the same clock, on the `::before`.

### 3. Responsiveness

The avatar is a fixed square and reflows nothing; the group is a flex row that
wraps in `spread` and does not in `stack`. Neither declares `container-type`,
because neither has a breakpoint: the overlap is a fraction of the member's own
box, so it scales with the size rather than with the container, and `spread`
wraps intrinsically. Read at 240, 420 and 720: the `spread` group wraps at 240
(second row visible in the capture), the `stack` group at `xl` is 168 pixels
wide and fits, and the `in-context` scene's text wraps beside an avatar that
keeps its size.

**The change that would most improve it:** tightening the overlap under a
container query at narrow widths, so a stack of eight fits where five does now.
**Not made:** a discrete jump in overlap around a breakpoint is exactly the
instability this dimension warns about, and the page that needs eight faces in
240 pixels should pass a smaller `size` or a smaller `max` — both of which are
already there and both of which the reader can see in the markup.

### 4. Refinement

Read at full size in light, dark and high contrast, at 240 and 420, at
`comfortable` and `dense`, in `ltr` and `rtl`, plus focus captures on a link and
on a button in two schemes and on a member inside a stack in two schemes.

Detail by detail: the focus ring sits at `--slotted-focus-ring-offset` outside a
box whose own edge is one pixel, and it survives on the tinted ground because it
is the theme's ring colour rather than the tone's; hover is a single step from
the tone's border to `--slotted-border-strong`, legible at a glance and silent
otherwise; there is no press, because an avatar is not a command; disabled keeps
the disabled foreground on the disabled ground rather than fading, and the
photograph loses hue and part of its opacity together; no state changes any box,
so nothing shifts by a pixel; the initials are centred on a line box of exactly
`1em`, where the ink's centre sits 0.02em from the box's — the asymmetry `badge`
had to trim away with `text-box` does not arise at this line height; the square
corner is a sixth of the box, so it is the same shape at 24 pixels and at 64.

**The change that would most improve it:** the initials at `xs` are 40 per cent
of a 20-pixel box at `dense` — eight pixels of type. **Not made, and answered
instead:** `xs` renders one grapheme rather than two, which is Fluent's rule at
16 pixels, so eight pixels carries one letter rather than a pair. The
alternative — a second, non-proportional ratio for the smallest step — would be
the parallel scale this family spent its token budget avoiding.

The detail named and then changed: the overlap in a stack was clipping the
second initial, because the neighbour's ring is drawn outside its box and a
plain negative margin therefore hides the fraction asked for plus two pixels
more. The ring is given back before the fraction is taken.

### 5. Tokens

Fifty-six custom properties in `avatar`, ten in `avatar-group`, each declared in
its family's `tokens.json` and checked against the stylesheet by
`packages/styles/src/tokens.test.mjs`. Every family token falls back to a
foundation token, never to a system colour, which
`packages/styles/src/fallbacks.test.mjs` holds.

Two departures, both recorded. The first is the component-layer size scale,
argued in **The size scale, and why it is in the theme** above and written into
`docs/token-foundation.md` as a bar the next family has to clear. The second is
the four proportions — initials at 0.4 of the box, glyph at 0.68, corner at a
sixth, overlap at 0.22 — which are geometry rather than scale steps, the
reasoning `badge` used for the overhang of an anchored count. Each is exposed as
a token whose default is the proportion, so a theme with a narrower typeface can
retune it without the family inventing a fifth scale.

**The change that would most improve it:** `--slotted-avatar-disabled-image-filter`
carries two filter functions in one value, so a theme that wants to change the
opacity has to restate the grey. **Not made:** two tokens for one idea is the
shape this repository refuses elsewhere, and the value reads as one sentence —
“lose the colour and half the opacity”.

### 6. Patterns

There is no APG pattern. The pattern index at
<https://www.w3.org/WAI/ARIA/apg/patterns/> was read on 2 September 2026 and
lists Accordion through Treeview with no avatar entry; the string does not occur
on the page. The applicable official guidance and the item-by-item comparison
are in **Accessibility** above: the `<img>` element, the `img` role in WAI-ARIA
1.2, the W3C WAI `alt` decision tree and its functional-images page, and WCAG
2.2 1.1.1, 1.4.11 and 2.5.8.

The platform supplies what it can and the family notes what it does not: the
`<img>` carries the request, the cache state and `srcset`; the `<ul>`/`<li>`
carry the list semantics; `<a>` and `<button>` carry the keyboard. What remains
the family's is the accessible name in the three statuses where there is no
image, the hit-area correction below 24 pixels, and the name of the summary.

**The change that would most improve it:** a keyboard model for the group.
**Not made, deliberately:** a list is not a composite widget, no surveyed
implementation gives one either, and the arrow-key model belongs to the family
that owns an interactive overflow — which is deferred to `popover` and `menu`
with the composition written.

### 7. Accessibility

Name, role and state are complete in all four statuses and in the two silent
cases (`decorative`, and a nameless avatar). Keyboard is the platform's,
because the root is whatever element the page chose. Focus is painted wherever
the element turned out to be focusable, and inside a stack the focused member
rises so its ring is whole — photographed in light and dark. Forced colours have
one family rule, `--_edge: currentColor`, with the photograph left alone.
Reduced motion is the theme's collapse of one duration token. Target size is
corrected by the family below 24 pixels, which is what the foundation says a
family must do for itself.

**The change that would most improve it:** exercising the family with a real
screen reader. **Not made — it cannot be done on this machine.** What was done
instead: the accessible name is asserted in both bindings' tests
(`toHaveAccessibleName` in React, the `aria-label` attribute in Angular), the
list is queried by `getByRole('list', { name })`, and the summary's name is
asserted for two locales. What remains to be heard is the order NVDA and
VoiceOver read a list of five avatars in, and whether the joined name of the
summary is read as one phrase.

### 8. Native API

React uses function components, a context for shared defaults, `render` and
`renderImage` for element substitution, a callback ref for the cache check, and
props types that extend `ComponentPropsWithRef<'span'>` and `<'ul'>` rather than
a hand-written subset. State derived from props is reset during render rather
than in an effect, so no frame is painted with the previous picture's answer.

Angular uses a standalone component on an attribute selector, `input()`,
`output()`, `computed()` and `linkedSignal()`, host metadata for every binding,
`HostAttributeToken` for the `role` and the `alt` a consumer wrote, `exportAs`
on all four public classes, `contentChild`/`contentChildren` signal queries, and
`ViewEncapsulation.None` with the one authored stylesheet. No subscriptions, no
`markForCheck`.

The asymmetry is recorded rather than levelled down: Angular's picture is the
consumer's own `<img slAvatarImage>`, which is what lets `NgOptimizedImage`
reach it with `ngSrc`; React has no equivalent and answers the same need with
`renderImage`, which hands the consumer's element the family's `data-part`,
handlers and ref. Angular's `SlAvatarFallback` marker exists because Angular
cannot ask whether content was projected; React reads `children`.

**The change that would most improve it:** a named imperative handle. **Not
made:** nothing this family does is inexpressible declaratively — there is no
`open()`, no `scrollToKey()` — and `ref` already reaches the element for
`focus()`.

### 9. Capability

Every table-stakes row above is `adopt`, `adapt`, a `decline` that names the
composition, or a `defer` that names the family and the wave. The two families
ship six and three declared capabilities against a rebuild that started from
one. There is no mutable value, and the reason is written twice — here and in
the contract test — rather than left as an omission. The keyboard table is the
platform's, key by key, because the root is the element the page chose.

**The change that would most improve it:** an interactive overflow that reveals
the hidden members. **Not made, and deferred with the family and the wave
named:** it is a disclosure, `popover` and `menu` are wave 5, and `render` on
the summary's avatar is the composition until then — two lines, written in the
reference page.

### 10. Ecosystem integration

Both tables in `references/frameworks.md` are answered line by line in
**Ecosystem integration** above, with the file or the sentence that answers
each. The application sets defaults once in both bindings
(`AvatarDefaultsProvider`, `provideAvatarDefaults`); the group provides through
the same mechanism, so a member's explicit value still wins — asserted in both.
The consumer's own `onLoad`, `onError` and `role` survive. Every state a
consumer may style is an attribute in the DOM. `ControlValueAccessor` is `no`
with the sentence: an avatar holds no value a form submits.

**The change that would most improve it:** the React group reads each child's
`name` prop to name the summary, which works for an `Avatar` and returns nothing
for a member wrapped in a component that does not forward it. **Not made, and
bounded instead:** the fallback is the visible `+3`, `overflowLabel` is the
escape, and the behaviour is asserted for both the wrapped and the unwrapped
case. The alternative — a collection prop instead of children — would trade
composition for a shape neither ecosystem asked for.
