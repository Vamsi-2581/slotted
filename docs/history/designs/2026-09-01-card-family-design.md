# Card family design

Rebuild of `card` against schema 5 and the token foundation. Wave 1, mode
`refazer`, guide section 4. The public API breaks; the moves are at the end.

## Capability inventory

### Surveyed

Six implementations, read on 1 September 2026.

| Source | Reference | What it calls the family |
| ------ | --------- | ------------------------ |
| shadcn/ui | <https://ui.shadcn.com/docs/components/card> | `Card / CardHeader (CardTitle, CardDescription, CardAction) / CardContent / CardFooter` |
| Mantine | <https://mantine.dev/core/card/> | `Card / Card.Section`, with `withBorder`, `inheritPadding`, `padding`, `radius`, `shadow`, `orientation` |
| Ant Design | <https://ant.design/components/card> | `Card` with `title`, `extra`, `cover`, `actions`, `variant`, `hoverable`, `loading`, `size`, `type="inner"`, `tabList`, plus `Card.Grid` and `Card.Meta` |
| MUI | <https://mui.com/material-ui/react-card/> | `Card (raised) / CardHeader (avatar, action, title, subheader) / CardMedia / CardContent / CardActions / CardActionArea` |
| Chakra v3 | <https://chakra-ui.com/docs/components/card> | `Card.Root (variant elevated\|outline\|subtle, size sm\|md\|lg, as, asChild) / Header / Body / Footer / Title / Description` |
| PatternFly | <https://www.patternfly.org/components/card> | `Card`, selectable, clickable and expandable variants |

The WAI-ARIA Authoring Practices carry no card pattern; the applicable page is
Structural Roles.

### Table stakes

| Capability | Who ships it | Verdict | Reason |
| ---------- | ------------ | ------- | ------ |
| Header, body, footer regions | all six | adopt | `header`, `body`, `footer` |
| Media that bleeds to the edge | MUI, Ant, Mantine, Chakra | adopt | `media`, rounding only the corners it touches |
| Title and description slots | shadcn, Chakra, Ant, MUI, PatternFly | adapt | The header is a two-column grid; the strings are `Heading` and `Text`. A `title` part would be a second answer to the type question Typography owns, and the grid is what those libraries needed the parts for. |
| A corner in the header | shadcn `CardAction`, Ant `extra`, MUI `action`, PatternFly `CardActions` | adopt | `actions`, pinned to the first row |
| Actions at the bottom | MUI, Ant, all | adopt | `footer` |
| A rule between regions | Mantine `Card.Section withBorder`, Ant header border and `type="inner"` | adapt | A `Divider` written between two regions. Each region owns its inset, so the rule runs edge to edge, and `inset` on the rule lines it up with the text. Two lines of consumer code, no new axis. |
| Appearance axis | Chakra, Ant, MUI, Mantine | adopt | `fill`: `outline`, `elevated`, `subtle` |
| Size or padding scale | Chakra, Ant, Mantine | adopt | `size`: `sm`, `md`, `lg` |
| Per-instance radius | Mantine, Ant | adapt | `--slotted-card-radius`. A card's radius is a brand decision, and this library answers brand decisions with tokens rather than props. |
| Horizontal orientation | Mantine, Chakra, MUI | adopt | `orientation`, reflowing on the card's own inline size |
| Whole card clickable | MUI `CardActionArea`, Ant `hoverable`, PatternFly `isClickable` | adopt | `link`, a stretched `<a href>` |
| Selectable | PatternFly, Ant | adopt | `selected`, mirrored; the chooser is a `<label>` around a native input |
| Disabled | PatternFly | adopt | `disabled`, mirrored |
| Element substitution | Chakra `as`/`asChild`, MUI `component`, shadcn | adopt | `render` in React, the directive on the consumer's element in Angular |
| Per-part style overrides | Ant `classNames`/`styles`, Chakra `unstyled` | adapt | `data-part` selectors, which are contract here; class names explicitly are not |
| Defaults for the whole application | Ant `ConfigProvider`, Chakra recipe theme | adopt | `CardDefaultsProvider` and `provideCardDefaults` |
| Loading | Ant | defer to `skeleton` | Wave 2. A card that draws its own skeleton is a second skeleton. |
| Expandable | PatternFly | defer to `collapsible` | Wave 4 owns disclosure, and composes inside a card body. |
| Tabs inside a card | Ant | defer to `tabs` | Wave 4, composed in the body. |
| Gallery of cards | Ant `Card.Grid` | defer to `grid` | The layout family shipped in this wave. |
| Avatar, title and description block | Ant `Card.Meta` | decline | `<Avatar/>` plus `Heading` and `Text` inside `header`, which is three lines and no new part. |

### Differentiators

| Offered here | Not in any surveyed implementation |
| ------------ | ---------------------------------- |
| Three colour schemes, three densities, logical properties throughout | All six ship light and dark; none is held to a 7:1 high-contrast scheme, and none mirrors without a second stylesheet. |
| `elevated` keeps its hairline, and `selected` draws a *thicker* edge rather than only an accented one | A shadow is removed under forced colours and every tone border becomes one system colour, so both would vanish. None of the six has a forced-colours answer for a card. |
| The whole-card target is named by the title alone | MUI's `CardActionArea` wraps the content, so the link's accessible name is every string in the card. |
| The media clips itself, the root never does | MUI, Ant and Mantine clip the root, which cuts off any overlay opened inside the card. |
| Defaults set once in both a React and an Angular binding | Chakra does it at build time in the recipe theme; Ant through a React-only `ConfigProvider`. |

### Gaps

| Gap | What this family does |
| --- | --------------------- |
| A horizontal card in a shrink-to-fit context | `container-type` removes the element's inline contribution, so the card collapsed to one word per line in any flex row — including both Storybook stages. `inline-size: 100%` on the horizontal root, and the `packed` harness scene as the regression. |
| An absent region leaving its gap behind | Rhythm is each region's own padding, never a gap on the root. Mantine's sections get this wrong when one is missing. |
| A title that is one unbroken token beside a corner | The corner is pinned to row one and the title column is `minmax(0, 1fr)`; the `extremes` scene holds the case. |
| A card of only a body, or only a header and a footer | A region at either end absorbs the padding its missing neighbour would have carried; the `regions` scene holds all three. |
| Text selection over a whole-card target | Documented as the cost of the stretched hit area on both reference pages. None of the six mentions it. |

## Anatomy

One root and six parts. Every part is optional and any of them may appear alone.

| Part | Attribute | Holds |
| ---- | --------- | ----- |
| root | `data-part="root"` | The surface: background, edge, radius, inset scheme |
| media | `data-part="media"` | An image or video that bleeds to the card edge |
| header | `data-part="header"` | A two-column grid: the title and its supporting line, and the corner |
| actions | `data-part="actions"` | The corner: a badge, a status, a menu button |
| body | `data-part="body"` | The content |
| footer | `data-part="footer"` | Actions and metadata |
| link | `data-part="link"` | The one destination the whole card resolves to |

`media`, `header`, `actions`, `body`, `footer` and `link` are parts, not
members: a member is a component with a root of its own, and a card region
exists only inside a card. The frameworks still export each one.

## Axes and states

`orientation`: `vertical` (default) or `horizontal`.
`fill`: `outline` (default), `elevated` or `subtle`.
`size`: `sm`, `md` (default) or `lg`.

States: `default`, `hover`, `focus-visible`, `selected`, `disabled`. The card
owns none of them. `hover` and `focus-visible` are answered only while the card
contains a link, and are read from that link. `selected` and `disabled` are
written by the consumer and mirror state that belongs to the control inside.

Neither is a capability. A `disabled` capability would claim the card can refuse
an interaction, and only the control can; `selection` would claim it holds a
value. The family declares `orientation` and `size`, and consequently no
`stateModel`: nothing here is a mutable capability.

## The interactive card

A card that represents a single destination is made clickable by the element
that already means "destination": one `<a href>` inside it, marked
`data-part="link"`, whose hit area the stylesheet stretches across the surface.

Rendering the root as the anchor was rejected. It concatenates every string in
the card into the link's accessible name, and it forbids any other control
anywhere in the card. The APG Link Pattern
(<https://www.w3.org/WAI/ARIA/apg/patterns/link/>) asks for a native `<a>` with
an `href`; the stretched link keeps the element, its name, `Enter`, the context
menu, middle-click and the status-bar target, and keeps them on the title alone.

The target is a link and never a command. A whole surface that fires a
non-undoable action on any click, with no visible control boundary, is a
misclick generator. Whole-card *selection* is a `<label>` around a native input,
which the platform already makes clickable edge to edge.

Costs, all on both reference pages:

1. Text over the stretched area cannot be selected with the pointer.
2. Any other interactive element must sit above it. The family raises `actions`
   and `footer`; an interactive element elsewhere is raised by the consumer.
3. A card holds at most one link.

The focus ring is drawn on the card, and the rule that suppresses the link's own
ring is written inside a `:has()` selector, so a browser without `:has()` drops
the whole rule and keeps the native outline.

## Layout

A vertical card is a flex column and respects document order.

A horizontal card is a grid of two columns and four rows: media occupies the
first column across every row, and header, body and footer take rows one to
three of the second. Vertical rhythm is each region's own block padding rather
than `row-gap`, which is what lets an absent region collapse to nothing and an
empty grid row cost nothing.

It reflows on its own inline size: the horizontal root declares
`container-type: inline-size` and `container-name: slotted-card`, and below
`24rem` every part spans both columns, returning the media to the top. The
breakpoint is a literal because CSS forbids a custom property in a container
condition.

`container-type` removes the element's inline contribution, so the horizontal
root also declares `inline-size: 100%`: a card that reflows on its own inline
size cannot also be sized by its content. Without it the card collapses to
min-content in any flex row.

## Surface and inset

Background is `--slotted-surface-raised`. `outline` draws one hairline of
`--slotted-border-subtle`; `elevated` adds `--slotted-shadow-sm` and keeps the
hairline, because a shadow is removed outright under forced colours; `subtle`
fills with `--slotted-surface-sunken`.

The disabled ground is `--slotted-disabled-background`, not the sunken surface,
because a disabled `subtle` card painting the same colour would be
indistinguishable from an operable one.

The root does not clip. Media rounds the corners it touches and clips itself.

Inset is `--slotted-space-6` at `md` and `--slotted-space-4` on each side of a
region boundary; `sm` and `lg` step to `space-5`/`space-3` and
`space-8`/`space-5`. Density does not change it: density governs control
geometry, and `size` is what changes the inset per instance.

## Ecosystem integration

### React

| Question | Answered by |
| -------- | ----------- |
| Controlled and uncontrolled pair, plus a request carrying a reason | Not needed: the card holds no mutable value. `selected` and `disabled` mirror state the control inside owns. |
| Defaults set once for the application | `CardDefaultsProvider` and `useCardDefaults` in `card-defaults.tsx` |
| Substituting the rendered element of each part | `render` on `Card`, `CardMedia`, `CardHeader`, `CardActions`, `CardBody`, `CardFooter`, `CardLink` |
| The consumer's handler still runs | The family registers no handler; every event reaches the element through the spread. |
| Reaching the native element and the imperative action | `ref` on every part, through `ComponentPropsWithRef`. No imperative action: a card has none the DOM does not already give. |
| Server rendering without a mismatch | No generated id, no layout read during render. |
| Every state a consumer may style in the DOM | `data-ui`, `data-part`, `data-orientation`, `data-fill`, `data-size`, `data-selected`, `data-disabled` |
| Part props are the native element's, extended | `ComponentPropsWithRef<'div'>` and `<'a'>` in `card.types.ts` |

### Angular

| Question | Answered by |
| -------- | ----------- |
| Two-way value in the signal form | Not needed: no mutable value, so `input()` rather than `model()`. |
| Reactive and template forms | Not needed: a card is not a form control. The chooser's `<input type="radio">` inside it is, and keeps its own accessor. |
| Defaults set once for the application | `CARD_DEFAULTS` and `provideCardDefaults` in `card-defaults.ts` |
| A template reaching the instance | `exportAs` on all six directives and the component |
| Substituting projected content, kept lazy | One default `ng-content`; every part is a directive on the consumer's own element, so nothing is wrapped and nothing is re-rendered. |
| Zoneless and `OnPush` | `ChangeDetectionStrategy.OnPush`, signals throughout, `computed` for the three resolved axes. |
| Subscriptions torn down | None: the family listens to nothing. |
| A static attribute the consumer wrote surviving | The family writes only its own `data-*`; it overwrites no consumer attribute, so no `HostAttributeToken` is needed. |
| An entry point others depend on staying one class | `collapsible` imports `SlCard`, `SlCardBody` and `SlCardHeader`; all three keep their names. |

## The contract break

The family moves from schema 4. What changed, and how a consumer moves:

| Was | Is | Move |
| --- | -- | ---- |
| `class="slotted-card"` | `data-ui="card"` | Select on `[data-ui='card']`. Class names were never contract. |
| `data-slotted-component="card"` | `data-ui="card"` | Rename the selector. |
| members `card`, `cardHeader`, `cardBody`, `cardFooter` | one member, seven parts | No consumer change; the contract shape only. |
| no axes | `orientation`, `fill`, `size` | Nothing to move: the previous defaults are the new defaults. |
| — | `CardMedia`, `CardActions`, `CardLink` | New. |
| — | `selected`, `disabled` | New. |

React `CardBody`, `CardFooter`, `CardHeader` and Angular `SlCardBody`,
`SlCardFooter`, `SlCardHeader` keep their names and their behaviour, so the two
existing consumers — the Collapsible reference pages in both frameworks —
compile unchanged.
