# Button group — arrangement of related actions

Wave 2 of `docs/build-order.md`, mode `novo`, guide section 5. The family
arranges actions that belong together and does not touch the semantics of any
one of them.

## Purpose

A set of related actions laid out as one visual unit: separated by a rhythm the
foundation owns, or joined into a single shape. A group states that the actions
belong together, both to the eye and to the accessibility tree.

Anti-use: a selection widget (`segmented-control`, `toggle-group`), a composite
control with one tab stop (`toolbar`, wave 4), navigation (`tabs`), and a
default action beside a menu (`split-button`). None of those is an arrangement:
each holds state or moves focus, and this family does neither.

## 1. Surveyed

| Implementation                                   | Calls it            | Read at                                                                                                        |
| ------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| WAI-ARIA APG, Toolbar Pattern                    | Toolbar             | <https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/>                                                            |
| Base UI 1.7.0                                    | `Toolbar.Group`     | <https://base-ui.com/react/components/toolbar>                                                                 |
| Radix Primitives                                 | `Toolbar`           | <https://www.radix-ui.com/primitives/docs/components/toolbar>                                                  |
| React Aria                                       | `Toolbar`           | <https://react-spectrum.adobe.com/react-aria/Toolbar.html>                                                     |
| React Spectrum S2                                | `ButtonGroup`       | docs + `packages/@react-spectrum/s2/src/ButtonGroup.tsx`                                                       |
| Material UI                                      | `ButtonGroup`       | <https://mui.com/material-ui/api/button-group/> + `mui-material/src/ButtonGroup/ButtonGroup.js`                |
| Primer (GitHub)                                  | `ButtonGroup`       | `primer/react/src/ButtonGroup/ButtonGroup.tsx` and `ButtonGroup.module.css`                                    |
| Shopify Polaris                                  | `ButtonGroup`       | `polaris-react/src/components/ButtonGroup/ButtonGroup.tsx` + `.module.css`                                     |
| IBM Carbon                                       | `ButtonSet`         | `carbon/packages/react/src/components/ButtonSet/ButtonSet.tsx`                                                 |
| shadcn/ui                                        | `ButtonGroup`       | <https://ui.shadcn.com/docs/components/button-group> + `registry/new-york-v4/ui/button-group.tsx`              |
| Mantine                                          | `Button.Group`      | `@mantine/core/src/components/Button/ButtonGroup/ButtonGroup.tsx`                                              |
| Bootstrap 5.3                                    | `.btn-group`        | <https://getbootstrap.com/docs/5.3/components/button-group/>                                                   |
| Ant Design                                       | `Space.Compact`     | <https://ant.design/components/space>                                                                          |
| Chakra UI                                        | `ButtonGroup`       | <https://chakra-ui.com/docs/components/button>                                                                 |
| Fluent UI v9                                     | — (none)            | `fluentui/packages/react-components/react-button/library/src/index.ts` exports no group                        |
| Angular Material                                 | `MatButtonToggleGroup` | `angular/components/src/material/button-toggle/button-toggle.ts` — a selection group, not an arrangement    |

The two framework ecosystems answer differently, and both answers are
instructive: Fluent ships no button group at all and routes everything through
`Toolbar`; Angular Material ships only `MatButtonToggleGroup`, which is a
`ControlValueAccessor` selection widget. Neither ecosystem offers the plain
arrangement this family is.

## 2. Table stakes

| Capability                                              | Who ships it                                                                 | Verdict            | Reason                                                                                                                                                                             |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `role="group"` on the container                         | shadcn, Mantine, Bootstrap, Primer (opt-in), APG                             | adopt              | The visual grouping exists, so the grouping in the accessibility tree exists. Always emitted, never inferred.                                                                       |
| Accessible name for the group                           | shadcn, Bootstrap, APG (toolbar), Base UI                                    | adopt              | `aria-label` and `aria-labelledby`, which the element already accepts. No `label` prop: a second way to name one thing is a second thing to get wrong.                              |
| `orientation` horizontal / vertical                     | MUI, shadcn, Mantine, Bootstrap, Spectrum, Carbon (`stacked`), Ant, Radix    | adopt              | `data-orientation`, logical properties throughout.                                                                                                                                  |
| Joined ("attached", "segmented", "compact") appearance  | MUI, Primer, Bootstrap, Mantine, Ant, shadcn, Chakra, Polaris                | adopt              | `attached`: collapsed borders, outer corners only, one continuous shape.                                                                                                            |
| Separated appearance with a chosen gap                  | Spectrum, Carbon, Polaris (`gap`), Ant (`size`), Bootstrap                   | adopt              | `gap`, the space scale, same vocabulary as `stack` / `inline` / `grid`.                                                                                                             |
| Raise the interacted child above its neighbours         | Primer (`z-index: 1`), shadcn (`focus-visible:z-10`), Polaris (10 / 20)      | adopt              | Without it the focus ring and the hover edge are painted under the next button's border.                                                                                            |
| Full-width / fluid group                                | MUI (`fullWidth`), Ant (`block`), Carbon (`fluid`), Polaris (`fullWidth`)    | adopt              | `fullWidth`: the group claims the line and the children share it equally.                                                                                                           |
| Alignment of the buttons inside the group               | Spectrum (`align`), Bootstrap (utilities), Ant                               | adapt              | `justify` on the main axis, matching the word `inline` and `stack` already use. Setting it makes the group claim the line, because there is nothing to distribute otherwise.         |
| Wrapping when the row does not fit                      | Polaris (`flex-wrap: wrap`, `noWrap`), Bootstrap                             | adopt              | `collapse="wrap"`, the default.                                                                                                                                                     |
| Collapse to a column when the row does not fit          | Spectrum (`useResizeObserver`), Carbon (`fluid` + `ResizeObserver`)          | adapt              | `collapse="stack"`, done with a container query instead of JavaScript measurement. See "Collapse" below.                                                                             |
| Separator between clusters                              | Base UI (`Toolbar.Separator`), Radix, shadcn (`ButtonGroupSeparator`)        | adopt              | A `separator` part, `role="separator"`, orientation derived from the group.                                                                                                          |
| Nested groups as clusters                               | shadcn (`has-[>[data-slot=button-group]]:gap-2`), Bootstrap (`.btn-toolbar`) | adopt              | A nested group is separated from its siblings by half a gap on each side, so a cluster boundary always reads wider than an item boundary.                                            |
| Propagate appearance to the buttons                     | MUI (context: `color`, `size`, `variant`), Spectrum (`ButtonContext`), Chakra | adapt             | `tone`, `variant` and `size` are provided through the button family's own `ButtonDefaultsProvider` / `BUTTON_DEFAULTS_TOKEN`, so an explicit prop on a button still wins.            |
| Application-wide defaults for the family                | MUI (`useProps`/theme), Mantine (`useProps`), Chakra (recipe)                | adopt              | `ButtonGroupDefaultsProvider` / `provideButtonGroupDefaults` for `gap`, `attached` and `collapse`.                                                                                   |
| Substitute the rendered element                         | MUI (`component`), Primer (`as`), shadcn (`render`), Polaris (—)             | adopt              | React `render`; Angular is a directive on the consumer's own element, so substitution is writing a different tag.                                                                    |
| Group-level `disabled`                                  | MUI (`disabled`), Spectrum (`isDisabled`)                                    | **decline**        | Availability is a fact about one control. Composing it is two lines: `{actions.map((a) => <Button key={a.id} disabled={saving} onClick={a.run}>{a.label}</Button>)}`. Shipping it as a provided default would require `button` to tell an absent `disabled` from an explicit `false`, which a boolean attribute cannot do — and that is `button`'s public contract, not this family's. |
| Roving focus / one tab stop                             | APG Toolbar, Radix, Base UI, React Aria, Primer (`role="toolbar"` only)      | **defer to `toolbar`** | Wave 4. Primer draws the same line: its focus zone is `disabled: role !== 'toolbar'`. A group of buttons is several tab stops; a composite control is one. Two families, two answers. |
| Overflow into a menu                                    | Spectrum (guidelines), Carbon (guidelines), Bootstrap (nested dropdown)      | **defer to `menu`**    | Wave 5. `docs/build-order.md` already records the dependency and the return as a refinement.                                                                                       |
| Text and input addons inside the joined shape           | shadcn (`ButtonGroupText`), Ant (`Space.Compact` with `Input`), Bootstrap    | **decline**        | That is an input group: the addon belongs to the field's box, reads the field's height and its invalid state. It goes with `input` and `field`, wave 3, not with a family whose name says it groups buttons. |
| Reorder buttons by emphasis when stacked                | Carbon (`buttonOrder`, reversed when `isStacked`)                            | **decline**        | Visual order would stop matching DOM order, which is WCAG 2.2 SC 1.3.2 failure F1 and breaks the Tab sequence. `stack`, `inline` and `grid` already refused the same capability for the same reason. |

## 3. Differentiators

| Capability                                       | Why it is available here                                                                                                                                                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Collapse to a column with no JavaScript          | Spectrum and Carbon both run a `ResizeObserver` to decide it. A container query decides it in CSS, so it is correct before hydration, correct in a server render, and free of a measurement pass.                                                |
| A bar edge that belongs to the bar               | In every surveyed library the joined bar's edge is the sum of its controls' own borders, so a control that repaints its border on a state — pressed, unavailable — punches a hole in the frame. Here the group owns the edge and the control keeps its fill, so a segmented control with the middle segment on still has a continuous frame. |
| Three schemes and three densities                | No surveyed implementation answers `high-contrast` or a density axis. The joined shape, the seam and the raised focus ring are read in all three schemes at three widths.                                                                        |
| Right-to-left as the same component              | The joined corners, the overlap and the cluster margins are logical properties, so a mirrored group is the same shape. shadcn ships RTL as a configuration guide; Polaris and Primer use physical `margin-left` and physical corner names.        |
| A cluster boundary that scales with the gap      | shadcn's nested gap is a fixed `0.5rem`. Here it derives from the group's own gap, so a looser group keeps its clusters looser than its items rather than closer.                                                                                |

## 4. Gaps

| Case                                             | What is done                                                                                                                                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A group that ends up holding nothing             | A permission filter or an empty action list leaves `<ButtonGroup>` with no children. No surveyed implementation handles it: the empty box still eats a gap in the parent flex row. `:empty` removes it from the layout. |
| A group holding one action                       | In `attached` the single child is both first and last, so it keeps all four corners and looks like an ordinary button rather than a truncated bar.                                                                |
| Buttons of different sizes joined                | `align-items: stretch` in the joined mode gives the bar one continuous block size, so a mixed-size group is ragged only in width, never in height.                                                                |
| A label longer than the container, joined        | A joined bar cannot wrap without breaking its own shape, so `attached` forces `nowrap`. The children take `min-inline-size: 0`, which lets `button`'s own `overflow-wrap: anywhere` break the word instead of the group overflowing the page. |
| A button that starts waiting inside a joined bar | `button` keeps its box while loading, so the joined shape does not resize. The loading child is captured in the harness rather than assumed.                                                                      |
| Extreme content in a stacking group              | Below the collapse breakpoint every child fills the line, so a long label wraps inside its own button instead of setting the width of the row.                                                                    |

## Anatomy

| Part        | Element                | Written by                                                                        |
| ----------- | ---------------------- | --------------------------------------------------------------------------------- |
| `root`      | `div` (`role="group"`) | The family. React renders it; Angular is a directive on the consumer's element.   |
| `separator` | `div`                  | The consumer places it between two children to mark a cluster boundary.           |

The buttons are the consumer's own elements. The group never wraps a child:
Primer's `<div class="Item">` wrapper is what forces its stylesheet to reach two
levels down (`.Item button, .Item a`) and what makes its own `:empty` workaround
necessary. Styling direct children keeps the group's selectors one level deep
and keeps the DOM the consumer wrote.

## Attachment

`attached` is a boolean, not a third value on a paint axis. It selects between
two shapes, and every surveyed implementation that offers a choice offers
exactly two (Chakra `attached`, Ant `Space.Compact`, Polaris `variant="segmented"`).

The joined shape is built from three rules:

1. `border-radius: 0` on every child, then the block-start/inline-start corners
   restored on `:first-child` and the block-end/inline-end corners on
   `:last-child`, per orientation, in logical corner names.
2. A negative margin of exactly one control border width on every child but the
   first, so the two adjacent border boxes share one column — and **exactly one
   border is painted in it**, the leading edge of the control that follows. Two
   coincident borders of the same colour and width are one line at 100% and come
   apart above it: the browser snaps each border box to device pixels on its
   own, so at 110%, 150% and 175% one boundary lands on a single column while
   the next lands across two, and a bar of equal dividers renders with one of
   them twice as thick. Five of fifteen measured boundaries came out uneven
   before the rule; none after it. The trailing edge is taken out of the paint,
   not out of the box, because a narrower border box would move the glyph inside
   an icon-only control by half a pixel.
3. `isolation: isolate` on the root, and `z-index` on a focused child so its
   ring — an outline drawn two pixels outside the border box — is painted over
   the neighbour instead of under it. Hover and press are not lifted: the edge
   belongs to the group, so nothing about it changes when a control is touched.

The fourth and fifth rules are where the first attempt was wrong, and the
captures are what said so.

**The edge belongs to the group.** `button` repaints its whole border when it is
pressed or unavailable — correctly, for a control standing on its own — and
inside a bar that punches a hole in the frame exactly where that control sits. A
vertical segmented control with its middle segment on had a visible gap in its
left edge. So the group states the edge for the two variants that have one, and
states it for the states that would otherwise overwrite it. The control keeps
its fill, its label and its cursor; what it gives up is the right to redraw the
bar around itself. Specificity is the mechanism, so
`button-group.styles.test.mjs` holds it: every border rule the group writes must
outrank every border rule `button` writes, whatever order the two sheets load in.

**The seam between two filled controls is the darkest step of the control's own
tone**, read from `data-tone`, which `button` declares in public. Primer,
Material UI, Ant Design and Bootstrap all reach for the same thing. The first
attempt used `--slotted-surface`, and the capture refused it twice over: a white
line through a filled bar cuts it into separate buttons instead of dividing one
bar, and because the rule keyed only on the child's own variant it also appeared
on the boundary between an outline control and a filled one, where no boundary
belonged at all. Both inner edges are painted, not only the leading one, so a
control raised by focus cannot show its own fill in the shared column and empty
the seam beside it.

Cost, recorded: the group paints border properties on its children. The
alternative — `button` growing an "am I in a group" input — would put the
group's layout decision inside every button in the library.

Attachment does not cross a nested group: `[data-attached] > :not([data-ui='button-group'])`.
A cluster keeps its own shape, which is what Bootstrap's `.btn-toolbar` of
`.btn-group`s is for.

`attached` and `collapse="stack"` do not combine. A joined bar's shape is the
point of it, and no surveyed implementation flips that shape at a width the
consumer cannot see coming: Bootstrap's vertical group is a second explicit
class, and Spectrum's group is never joined at all. A joined bar therefore
forces `nowrap`, and a joined column is `orientation="vertical"`, written by the
consumer. What keeps it inside a narrow container instead is `min-inline-size: 0`
on every joined child but an icon-only one, so `button`'s own
`overflow-wrap: anywhere` breaks the label rather than the bar breaking the page.

## Collapse

| Value    | Behaviour                                                                                                                        |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `wrap`   | Default. `flex-wrap: wrap`; the row breaks into lines and keeps the same gap between them. The root stays `inline-flex`.          |
| `nowrap` | One line, and an overflow if the container is narrower. `attached` implies it.                                                     |
| `stack`  | Below `360px` of the group's own inline size, the group becomes a column and every child fills the line. Does not combine with `attached`.                                          |

`stack` is the only value that needs a container, and the container is the group
itself: `container-type: inline-size`, `container-name: slotted-button-group`.
An element cannot both be an inline-size container and size itself to its
contents, so `collapse="stack"` makes the root block-level and it claims the
inline size of its parent. That is stated in the API table rather than hidden;
`justify` is what places the buttons inside the claimed line.

`360px` is literal because CSS forbids a custom property in a container
condition. It is the width below which a row of two or three controls with real
labels stops fitting, and it sits between the harness's 240px and 420px steps,
so both sides of the decision are photographed rather than argued.

## Group defaults

`gap`, `attached` and `collapse` — the three an application standardises once.
`orientation`, `justify`, `fullWidth` and `label` are per-instance facts about
one group and are not provided.

The group separately provides `tone`, `variant` and `size` to the **button**
family's existing defaults mechanism. Two providers, because they answer two
questions: how this group is laid out, and how the buttons inside it are
painted. Reusing `ButtonDefaultsProvider` rather than inventing a second channel
is what keeps a button's own prop winning over the group, which is the rule the
button family already implements and tests.

## Separator

`role="separator"` with `aria-orientation` perpendicular to the group, and
`decorative` to drop to `role="none"` and `aria-hidden` — the same pair
`divider` publishes, and the same default: announced unless asked otherwise.
Inside a `collapse="stack"` group it states no axis at all, because which way
the group runs is decided by the width the page turns out to have.

It is one border width, everywhere. Its geometry has two cases. In a separated
group it is a hairline standing in the gap, inset a step short of the controls
at each end. In a joined bar it is not a box at all: no width, no height, no
margin. What it marks is painted on the leading edge of the control that
follows it, which is the one edge the overlap already leaves in the shared
column.

That second case is a correction, and the captures made it. The rule had a
column of its own, and the bar paid for it twice: a control with its edge taken
out still occupies the column it gave up, so the boundary came out three pixels
wide beside seams of one. In a framed bar that reads as a rendering defect
rather than as a boundary — one divider visibly thicker than its neighbours —
which is what "the rule does not fit the outline variant" meant.

A gutter was tried first and refused: opening space between two runs and giving
each its own corners turned one bar into two pills, and a joined bar is one
shape by definition. A rule is not licence to cut it.

The colour carries what the geometry no longer can. The rule is
`--slotted-text-muted`, one step stronger than the `--slotted-border-strong`
seams around it, so a framed bar shows a boundary rather than a repeated line,
and a frameless one shows the only line it has. A filled run keeps its seam:
its edges are the tone's own darkest step, and a neutral grey laid between two
saturated fills reads as a smudge — the capture showed it olive against accent
blue. There is nothing darker than that step in the tone to reach for, so a
rule inside a filled run is the seam, drawn where the consumer asked for it.

The rule and the nested cluster stay two ways of saying the same thing: a
cluster carries a name of its own, which is what an assistive technology needs
when the boundary means something, and the rule carries a line, which is what
the eye needs when it does not.

It is a part of this family rather than the `divider` family. A group separator
is geometry the group owns: it stretches to the bar's cross axis, and inside a
joined bar it is the shared edge rather than a box standing beside one. Styling
`divider`'s box from `button-group.css` would make one family's rendered
element a private API of another, and `packages/styles/src/identity.test.mjs`
exists precisely because that kind of coupling looks identical to a public
contract from outside.

Cost: one more 1px rule in the library. Accepted.

## Keyboard, roles and focus

The group manages no focus. Tab and Shift + Tab reach each button in DOM order,
which is what shadcn documents and what Primer does whenever its role is not
`toolbar`. Every key belongs to the button under focus and is `button`'s
already-shipped behaviour.

The APG comparison is in the self-assessment: the Toolbar pattern is the closest
official guidance, this family deliberately does not implement it, and the cost
is written there.

## React integration

| Question                                        | Answer                                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Controlled / uncontrolled pair with a reason    | No — the family holds no mutable value. An arrangement has nothing to move.                                              |
| Application defaults set once                   | Yes — `ButtonGroupDefaultsProvider` and `useButtonGroupDefaults` in `button-group-defaults.tsx`.                         |
| Substitute the rendered element of each part    | Yes — `render` on `ButtonGroup` and on `ButtonGroupSeparator`.                                                           |
| The consumer's own handler still runs           | Yes — the family attaches no handler at all; native props spread onto the root untouched.                                |
| Native element and imperative handle            | Yes — `ComponentPropsWithRef<'div'>` carries `ref`. No imperative action: focus belongs to the controls, and moving focus into a group is `toolbar`'s model. |
| Server render without hydration mismatch        | Yes — no identifier is generated, no layout is read during render, and the collapse decision is a container query.       |
| Every state a consumer may style is in the DOM  | Yes — `data-orientation`, `data-gap`, `data-attached`, `data-collapse`, `data-justify`, `data-full-width`. The family declares no interactive state. |
| Part props are the native element's, extended   | Yes — `ButtonGroupProps extends ComponentPropsWithRef<'div'>`.                                                           |

## Angular integration

| Question                                            | Answer                                                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Two-way value in the signal form                    | No — the family holds no value. `input()` throughout, no `model()`, no `output()`.                                                          |
| Reactive Forms / `ControlValueAccessor`             | No — a group of actions is not a form control and submits nothing. `MatButtonToggleGroup` implements it because it is a selection widget; this family is not. |
| Application defaults set once                       | Yes — `BUTTON_GROUP_DEFAULTS_TOKEN` and `provideButtonGroupDefaults()`.                                                                     |
| Template reaches the instance                       | Yes — `exportAs: 'slButtonGroup'` and `exportAs: 'slButtonGroupSeparator'`.                                                                 |
| Substitute projected content, kept lazy             | Yes — a single unnamed `<ng-content>`; the group projects what the consumer wrote and never re-renders it.                                  |
| Zoneless and `OnPush`                               | Yes — `input()` and `computed()` only, `ChangeDetectionStrategy.OnPush`, no `markForCheck`.                                                 |
| Every subscription torn down                        | Yes — there is none. No listener, no timer, no observer.                                                                                    |
| A static attribute the consumer wrote survives      | Yes — `role` is read with `HostAttributeToken` before the host binding writes it, so `role="toolbar"` survives and `role=""` gives the role up entirely, which ARIA already defines as "use the implicit role". |
| Entry point stays a single class                    | Yes — `@slotted/angular/button-group`, importing `@slotted/angular/button` for the defaults token by its published specifier.               |

## What this costs elsewhere

No token is added and no scale is changed. `packages/styles/package.json`,
`packages/react/src/index.ts` and the Angular entry-point directory gain one
entry each, which is what a new family always costs.

Two additions outside this family, neither a break:
`BUTTON_DEFAULTS_TOKEN` is exported from `@slotted/angular/button`, and Angular's
`ButtonDefaults` writes `| undefined` on each axis to match React's — both are
what let the group provide the paint through the button family's own mechanism
under `exactOptionalPropertyTypes`.

One shared tool was defective and was fixed first, in its own commit:
`tools/harness/build.mjs` loaded exactly one family stylesheet, so a family whose
subject is composition rendered as unstyled markup. It now reads the `data-ui`
values out of the fragment and loads those families' stylesheets before the one
under review.
