# Notification center — self-assessment

Against `.claude/skills/component/references/rubric.md` and
`docs/component-features.md` §18. Every dimension names the one change that
would most improve it and says whether it was made. Captures are in the
session scratchpad under `nc/` (harness) and `ncp/` (reference pages); the
harness is `tools/harness/out/notification-center.html`.

## 1. Icons

Four glyphs of the family's own, every one a mask from the icon scale:
`check` and `dot` on the read-toggle, `x` on dismiss, and the tone's glyph
on the family visual — `circle-info`, `bell`, `circle-check`, `circle-alert`,
`circle-x`, every one a circle. `triangle-alert` was refused at the gate as a
rule for the whole library, recorded in the briefing; `alert` carries the
debt. Read at 14 pixels in `sm` and `md` (`--_glyph`); the visual's glyph is
16 in `md` and 14 in `sm`. Nothing is directional, so nothing mirrors.
**Change:** the danger glyph `circle-x` and the dismiss `x` are two marks
that share a shape at two sizes; a dedicated `circle-alert` for danger and
`circle-info` for warning would separate them, at the cost of warning and
info reading alike. Not made: danger is the circle with the cross in `alert`
too, and a family agreeing with `alert` matters more than two marks a row
apart.

## 2. Motion

Three transitions on the control scale: the row's ground on hover, the two
controls' ink as the row gains the pointer or focus, and the read-toggle's
glyph swapping when the store answers. `fresh` and `more` transition their
ground and edge as `timeline`'s pills do. A revealed arrival appears in
place; nothing slides, because a list of forty rows animating a reorder is
the motion `prefers-reduced-motion` exists to refuse. **Change:** a fade on
the revealed articles, on `--slotted-duration-short`, would show which rows
are new. Not made: the wash and the weight already say which rows are new,
and a fade that follows a keyboard reveal delays the focus the reader asked
for.

## 3. Responsiveness

The root is the query container (`container-name: notification-center`);
below 320 pixels the controls drop under the content at the inline end and
the header's controls wrap to the end of their own line. Read at 240, 420
and 720 (`notification-center-page-light-comfortable-ltr-{240,420,720}.png`),
in a 375-pixel room on both reference pages, and inside a 352-pixel popover
(`ncp/react-story-hosts-open.png`). `sm` states a floor width of 22rem,
capped at the viewport, because a root with inline-size containment
contributes no intrinsic width and collapsed to nothing inside a popover
sized to its content — found on the React page, fixed in the stylesheet.
**Change:** the 240-pixel scene squeezes the tab strip's third view out of
sight; that is `tabs`' own overflow paging, live it pages. Not this family's
to change.

## 4. Refinement

Four unread marks were refused at the visual gate before the picture
settled: a rail on the row's edge, a disc on the title's line, a dot on the
visual's corner, a solid fill on the family visual. What stands: a wash from
the tone's text at the highlight share, the semibold title, the read-toggle's
glyph. The count chip is one measure for both dimensions
(`--_count-box`), so a single digit is a circle and two digits a pill, with
an edge in the ink so it stays a chip in high contrast. The visual, the
title's first line and the controls share one axis
(`max(0, (visual − 1lh) / 2)`). The controls are muted at rest and take the
text ink on the row under the pointer or holding focus. Rows share one rule;
groups a heading in small capitals. **Change:** the last row's rule doubles
with the footer's; dropping the rule on `:last-child` when a footer follows
would clean the seam. Made — see the feed rule in the stylesheet.

## 5. Tokens

Ninety references, every one to the foundation or to a family token with a
foundation fallback; the token file lists them and the styles test holds the
list. Family tokens: `--slotted-notification-center-{inset-inline,inset-block,gap,title-size}-{sm,md}`,
`-border`, `-background`, `-title-clamp`, `-description-clamp`,
`-min-inline-size-sm`. The unread wash reuses `--slotted-highlight-tint-opacity`
as the highlight band does. **Change:** the hover ground reads
`--slotted-tone-secondary-subtle-hover` directly; a `--slotted-notification-center-hover`
would let a product retune it without reaching the tone. Not made: one more
token for a value no product has asked to retune.

## 6. Patterns

The APG Feed, transcribed: `role="feed"` named by the title, `article` per
item with `tabindex="0"`, `aria-labelledby`, `aria-describedby`,
`aria-posinset`, `aria-setsize` (the consumer's `count`, the loaded number,
or -1), `aria-busy` while loading; `PageDown`, `PageUp`, `Control+End`,
`Control+Home` from `@slotted/core/timeline`'s `feedFocusTarget`; `Delete`
added by the family. The strip is the Tabs pattern held by `tabs`, with the
feed as its one panel — `Tab` gained a `controls` prop in both bindings so a
strip can name a region it does not render. The region is a `section` named
by its heading. **Change:** the pattern names no key for "mark read" on the
article; a `Shift+Enter` or `m` would be an invention. Not made: an
invented key is a key nobody finds, and the toggle is one `Tab` away.

## 7. Accessibility

Names: the region and the feed by the heading, every article by its title,
every article with a description by it, the read-toggle by what it will do
(`Marcar como lida` / `Marcar como não lida`), dismiss by `Dispensar`, fresh
by its count, the strip by `messages.views`. Announcements: held arrivals
once per change of the count, the unread count once per change after the
first, through the shared live announcer. Focus: a keyboard reveal lands on
the first revealed article; a keyboard removal on the next, the previous,
or the region's first control; `PageUp` on the first article reaches
`fresh`. Read is never colour alone. Rings: inward on the article because
the rows touch, outward on every control. Forced colours: the glyphs keep
their ink, the count takes the highlight pair, the wash goes and the weight
carries unread. **Change:** `aria-setsize` under `growing="scroll"` is -1
until the consumer states `count`; a total the family could count is a total
the consumer knows better. Not made.

## 8. Native API

React: `ComponentPropsWithRef<'section'>` less `children`, `ref` and `title`;
native props spread first; `ref` is `NotificationCenterHandle` (`element`,
`focus()`, `reveal()`, `markAllRead()`); `render` for the root; a consumer's
`aria-label` or `aria-labelledby` replaces the wiring; `onKeyDown` runs
before the feed keys. Angular: `section[slNotificationCenter]`, every axis an
`input()`, `view` a `model()` with `viewRequest`, six request outputs and one
fact, `exportAs: 'slNotificationCenter'`, `HostAttributeToken` for the
written name, three `ng-template` directives and three projected slots.
**Change:** an `onItemKeyDown` per article would let a consumer add keys
without reading `event.target`; not made — the root's `onKeyDown` and
`data-key` on the article answer it in two lines.

## 9. Capability

Against the inventory: every table-stakes capability ships — read state and
requests, mark-all, dismiss, views with the built-in unread, relative time,
grouping, a page at a time by button or by scroll, loading and empty pages,
the popover step and the page step, the header and item slots. Two
differentiators nobody asked for: arrivals held while the reader reads, with
a polite count and a keyboard reveal that lands focus on what arrived; and
the `controls` axis, so a feed whose store has no per-item read or removal
draws neither. Declined with an owner: bulk selection
(`selection-toolbar`), the bell (`top-navigation`), open and placement
(`popover`), preferences and snooze (the slots), collapsible groups (only
UI5 folds one), show-more (the clamp keeps the text). **Change:** a
`renderGroupLabel` for a group heading with a count. Not made: a label is a
`ReactNode` in React and the consumer writes the count into it; Angular's
`groupBy` returns a string and a count would need a template — the first
product to ask gets it.

## 10. Ecosystem integration

Composes `tabs` (the strip, with the new `controls` prop), `button`
(mark-all), `skeleton` (the waiting rows), `result-state` (the consumer's
empty page); `avatar`, `badge`, `link` and `popover` in the pages. The
keyboard, the timestamp formatter and `setSizeOf` are `@slotted/core/timeline`'s;
the request shape is `@slotted/core/state`'s `createControllable` for the
view and the same `reason`/`source`/`cancel()` shape for the rest; the
announcer is `@slotted/core/live-announcer`; the scroller lookup is
`@slotted/core/sticky-header`'s `findScrollParent`. Reports the unread count
for `top-navigation`'s bell. **Change:** `top-navigation` could accept the
centre under its notifications control directly; not made — the popover is
the host and the bell is a trigger, which is what the hosts scene shows.

## 11. Documentation

Seventeen scenes on each page, one per contract scenario, each with a
caption, a canvas and the code that produced it; twenty-three anatomy rows;
every axis, request and fact in the API and events tables; five
accessibility notes; the DOM and a theming snippet. Read rendered at 1280 and
620 on both pages; `audit.mjs` clean at both widths on both. Two defects
found by reading and fixed: the workbench's `h2` rule reaching the family's
heading (fixed in the workbench with a test), and the popover collapsing the
centre (fixed with the `sm` floor). **Change:** a scene with a consumer
`visual` that is an icon rather than an avatar. Not made: the avatar scene
and the family visual show both ends of the slot.

## Section 18

1. **Purpose, uses, anti-uses.** The persistent list of what happened while
   the reader was not looking, in a popover under the bell or on a page.
   Not a toast (`toast` is the transient one), not an activity log
   (`timeline`), not a task list.
2. **Anatomy.** `root`, `header`, `title`, `count`, `mark-all`, `actions`,
   `views`, `fresh`, `feed`, `group`, `group-label`, `item`, `visual`,
   `content`, `description`, `time`, `controls`, `read-toggle`, `dismiss`,
   `more`, `empty`, `footer`.
3. **Controlled and uncontrolled.** `view` / `defaultView` /
   `onViewChange(view, request)` in React; `[(view)]`, `defaultView` and
   `(viewRequest)` in Angular; reasons `pointer`, `keyboard`, `programmatic`.
   Read and removal are the store's facts: `onReadChange({ keys, read })`,
   `onRemove(key)`, `onOpen(key)`, `onReveal(count)`, `onLoadMore()` carry a
   reason, a source and `cancel()`; `onUnreadChange(count)` is a fact.
4. **State matrix.** `read` per item × `loading` × `view` × held arrivals:
   unread paints the wash and the weight; loading with nothing loaded paints
   skeleton rows, with items the waiting row; `unread` filters; held keys
   stay out of the feed behind `fresh`.
5. **Keyboard, focus, ARIA.** The contract's `keyboard` table and §6–7 above.
6. **Recipes.** `size` sm/md, `level` 2–4, `growing`, `arrivals`,
   `timeFormat`, `controls`, `groupBy`, `views`, `renderItem` / the item
   template.
7. **Responsive, RTL, locale, reduced motion.** 320-pixel container query
   and the `sm` floor; logical properties, mirrored in
   `notification-center-page-light-comfortable-rtl-420.png`; `locale`,
   `timeZone`, `now` and `messages`; motion on the control scale.
8. **Loading, empty, error, extreme content.** `loading` both ways,
   `empty` and `caughtUp`, the consumer's result-state, the `long` scene and
   the phone room. Error is the store's: a failed page is the consumer's
   `empty` or alert.
9. **SSR, performance, virtualization.** `useId` and the Angular id factory;
   `now` for a stable relative time; the observer only in an effect;
   virtualization deferred to `growing` as `timeline` decided.
10. **Examples.** Seventeen scenes per page, one product.
11. **Shared behavioural tests.** `notification-center.test.tsx` (24) and
    `notification-center.spec.ts` (24) assert the same behaviours by the same
    names.
12. **Changelog and stability.** New family; `tabs` gained `controls` (an
    addition, no break); the schema gained `read`; the briefing gained the
    triangle rule.

## Decisions taken at this gate

- The unread mark is no mark: four constructions were refused and the wash,
  the weight and the toggle's name remain.
- `sm` states a floor width; `md` states none.
- The narrow layout starts below 320 pixels, under the popover's own step.
- The Angular `visual` template with nothing to render on an untoned item
  is withdrawn by the stylesheet, so both bindings paint the same rows.
- The `hosts` scene shows the store's count on the trigger; `onUnreadChange`
  reports while the centre is mounted.
