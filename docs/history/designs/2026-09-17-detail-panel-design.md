# Detail panel — design

The view of one record. It is a composition in the sense
`docs/component-features.md` §15 gives the word: `page-header` is its top,
`tabs` its strip, `section` its stacked units, `skeleton` its waiting shape,
and `drawer`, `page` or `splitter` its host. What the family owns is what
none of those decides: the section model, the body's two columns, the status
of the record, and where focus goes when the record changes. The inventory is
`2026-09-17-detail-panel-capability-inventory.md`.

## 1. Anatomy

```
article[data-ui=detail-panel]                     ← root: the container query, the scroller under scroll=self
├─ header[data-ui=page-header]                     ← composed, first child, sticky by its own rule
│    └─ … [data-part=tabs] > [data-ui=tabs] > list  ← the strip, rendered from the sections under layout=tabs
├─ [data-part=body]                                ← the column: vertical inset, grows to push the footer down
│    └─ [data-ui=container]                        ← composed: the page's width and inset, so the columns align with the header's
│         ├─ [data-part=banner]                    ← alerts about the record; absent when not written
│         ├─ [data-part=columns]                   ← the grid: main and aside
│         │    ├─ [data-part=main]
│         │    │    └─ [data-part=section] ×n      ← one unit; a tabpanel under tabs, a section family root inside under stacked
│         │    │         └─ [data-part=section-actions]  ← under tabs only, the section's own controls
│         │    └─ aside[data-part=aside]           ← complementary, named by messages.aside
│         └─ [data-part=message]                   ← in place of columns under status ≠ ready
└─ footer[data-part=footer] > [data-ui=container]  ← sticky at the bottom; absent when not written
```

The root is an `article`: one self-contained record, which is what the
element means, and the `header` `page-header` renders is then the article's
own header. `aria-labelledby` points at the page-header's heading once it is
in the DOM; a consumer's `aria-label` wins.

Every part is reached with a child combinator from the part that owns it,
because the content is other families and each has parts of the same names.

## 2. Axes and defaults

| Axis     | Values                       | Default    | Effect                                                                                                                                  |
| -------- | ---------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `layout` | `stacked`, `tabs`            | `stacked`  | Every section in the flow with a heading each, or a strip in the header's tabs slot with one section shown.                             |
| `aside`  | `end`, `start`, `none`       | `end`      | Which side the aside column takes above 640 pixels. `none` says the consumer renders no aside and the body is one column at every width. |
| `level`  | `1`, `2`, `3`                | `2`        | The heading rank the page-header defaults to; stacked sections take the rank below it.                                                  |
| `size`   | `sm`, `md`, `lg`             | `md`       | The page-header's size default, the sections' size, the body's inset and gap.                                                           |
| `scroll` | `ancestor`, `self`           | `ancestor` | Under `self` the root is the scroll container and the header sticks inside it; under `ancestor` the host scrolls.                      |
| `mount`  | `active`, `lazy`, `eager`    | `active`   | Under `tabs`, when a section's content exists. Under `stacked` every section is in the flow.                                            |
| `status` | `ready`, `not-found`, `error` | `ready`   | Under either failure the columns are replaced by `message`; the header and the footer stay.                                             |

`loading` is a state, not a status: a record that failed can be reloading.

## 3. State

One mutable value, the `current` capability:

```json
"current": {
  "controlled": "section",
  "uncontrolled": "defaultSection",
  "request": "onSectionChange",
  "reasons": ["pointer", "keyboard", "programmatic"]
}
```

Under `tabs` the strip's own request is forwarded with its reason; the strip
is controlled by the panel, so cancelling the panel's request leaves the strip
where it was. Under `stacked` the reader has no control that moves it: the
value arrives as `programmatic` — a link to `#activity`, the URL on load, a
command — and the family scrolls the named section under the chrome
(`scroll-margin-block-start: var(--slotted-page-sticky-top)`) and marks it
`data-current`. Scroll-spy, which would emit `scroll`, is `table-of-contents`'s and
is not here.

With no value and no default the first section is current under `tabs` (a
strip with nothing selected shows no panel) and no section is `data-current`
under `stacked`.

`recordKey` is not state. It is the identity of the record on screen; when it
changes and `document.activeElement` is inside the root, the family focuses
the page-header's heading (`tabindex="-1"` written at that moment) and scrolls
the scroller to its start. When focus is elsewhere nothing moves.

## 4. The strip and the panels

`tabs` renders the list; the panels are this family's `section` parts. The
two are wired by the ids the strip's `identify(name)` returns —
`aria-controls` on the tab, `id` and `aria-labelledby` on the section — and
the section carries `role="tabpanel"`, `tabindex="0"` and `hidden` when not
current, which is what `tabs`'s own panel carries.

The reason is Angular's injector. A consumer declares the sections inside the
panel and the strip inside the page-header's tabs slot; a `[slTabPanel]`
there resolves `SlTabs` through the declaration tree and finds none, because
the `[slTabs]` root lives inside the strip. React could nest the sections in
the `Tabs` provider and Angular cannot, and one wiring for both is worth four
attributes written twice. The strip attaches its `identify` to the panel on
mount; until it does, the sections carry no ids and the strip's tabs control
nothing, which is the state the server renders and the client leaves within
one effect.

`mount` is read by the section: `active` renders the content only while
current, `lazy` once it has been current, `eager` always. The strip's own
`mount` stays `active`, and it holds no panels.

## 5. Hosts

| Host                | What the consumer writes                                                                                    | What the family does                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `page`              | The panel as the page's content, `level="1"`.                                                               | The page-header sticks under the page's chrome; `--slotted-page-sticky-top` is the page's number plus the header's.                          |
| `drawer`            | The panel as the drawer's body, a `Drawer.Close` in the page-header's actions or in the panel's footer.      | `scroll="ancestor"`: the drawer's body scrolls, the header sticks at its top. `Escape`, focus return and the scrim are the drawer's.         |
| `splitter` pane     | The panel inside the pane with `scroll="self"`.                                                             | The root is the scroller, `min-block-size: 0` so a flex pane can shrink it, the header sticks at 0 inside it.                                |

Nothing in the family names its host.

## 6. Geometry

The root is a query container named `detail-panel`; `columns` is three
elements in — body, container, columns — a grid of `main` and `aside`. At 640 pixels and above the tracks are
`minmax(0, 1fr) var(--slotted-detail-panel-aside-size)`, the aside in the
column its axis names; below, one track and the aside after `main` in the
flow. `--slotted-detail-panel-aside-size` is `16rem` at `md` — Primer's
minimum pane — `14rem` at `sm` and `18rem` at `lg`. The inline inset is the
container's; the vertical inset and the gap between columns read the space
scale by size: `space-7` / `space-8` / `space-9` for the inset, one step above
a section's own rhythm because the page-header's pill hangs half its height
into the column, and `space-7` / `space-8` / `space-9` for the gap.

Stacked sections are separated by their own headings and `space-8` of
rhythm; the section family draws the heading, with the count as a `badge`
after the label so the stacked heading and the tab read the same. Under `tabs` the shown section
has no heading and its `section-actions` row, when it exists, is a flex row
aligned to the inline end above the content.

The footer is `position: sticky; inset-block-end: var(--slotted-page-sticky-bottom, 0px)`,
on `--slotted-surface`, with the thin rule above it. It is the slot for an
`action-bar variant="plain"` and adds no second rule to it.

The banner sits between the header and the body at the body's inline inset,
with `space-4` below; it is the consumer's `alert`.

The aside is `overflow-wrap: anywhere` and takes the muted rule at its inline
start (end under `aside="start"`) above 640 pixels, and the rule above it
below.

## 7. Loading and status

`loading` writes `data-loading` and `aria-busy="true"` on the root. Each
section renders three `SkeletonText` lines in place of its content, which is
not mounted; the aside renders four short lines when it is written. The
heading's own skeleton is the page-header's, bound by the consumer on the
header — the family does not reach into another family's props. Every
placeholder is `skeleton`'s, as `waiting.test.mjs` requires.

`status="not-found"` and `status="error"` render `message` where `body`
stood and leave the header and the footer. `message` is a centred box with
the body's inset; the consumer places a `result-state` in it.

## 8. Framework integration

### React

| Question                                       | Answer                                                                                                                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Controlled and uncontrolled pair, with reason  | `section` / `defaultSection` / `onSectionChange(value, reason, event)`; `event` is the strip's event or `undefined`.                                                                                                |
| Defaults once                                  | `DetailPanelDefaultsProvider` (`layout`, `aside`, `level`, `size`, `scroll`, `mount`, `messages`) and `useDetailPanelDefaults`. The root wraps its children in `PageHeaderDefaultsProvider` with its `level` and `size`. |
| Substitute the element of each part            | `render` on `DetailPanel`, `DetailPanelBody`, `DetailPanelSection`. The aside, the banner, the message and the footer are fixed wrappers around the consumer's content — `DetailPanelBody`'s `banner`/`aside`/`message` props and the root's `footer` prop, as `page`'s footer is. `DetailPanelTabs` is fixed: it is the strip, and the strip is `tabs`'s. |
| Consumer's handler still runs                  | Native props spread after the family's on every part; `onSectionChange` is the request and there is no family handler beside it.                                                                                     |
| Native element and imperative action           | `ref` on every part; `DetailPanelHandle` with `focus()` (the heading) and `scrollToSection(name)`.                                                                                                                   |
| Server render                                  | `useId` for the aside's and message's ids; the tab wiring is applied in an effect from the strip's ids, identical on both sides on first render.                                                                     |
| Every state in the DOM                         | `data-layout`, `data-aside`, `data-level`, `data-size`, `data-scroll`, `data-mount`, `data-status`, `data-loading`, `data-current` on a section, `data-key`.                                                        |
| Props type is the native element's, extended   | `ComponentPropsWithRef<'article'>`, `'section'`, `'aside'`, `'footer'`, `'div'`.                                                                                                                                    |

### Angular

| Question                                    | Answer                                                                                                                                                                                                                                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form            | `section = model<string \| undefined>()` on `[slDetailPanel]`; `sectionRequest = output<ChangeRequest<string>>()` with the reason and `cancel()`.                                                                                                                              |
| Reactive Forms                              | No: the panel holds no form value.                                                                                                                                                                                                                                             |
| Defaults once                               | `provideDetailPanelDefaults()` on `DETAIL_PANEL_DEFAULTS`; the panel provides `PAGE_HEADER_DEFAULTS` for its subtree from its own `level` and `size` through getters over signals, so a page-header inside takes the panel's rank unless it states its own.                     |
| Template reaches the instance               | `exportAs: 'slDetailPanel'`, `'slDetailPanelSection'`, `'slDetailPanelTabs'`.                                                                                                                                                                                                  |
| Projected content, kept lazy                | A section is `<ng-template slDetailPanelSection name label>`; `[slDetailPanelBody]` renders it with `NgTemplateOutlet` inside the tabpanel or the section family root, so `mount` and `loading` decide whether the consumer's view exists. `aside[slDetailPanelAside]`, `[slDetailPanelBanner]` and `[slDetailPanelMessage]` are `ng-content` slots of the body; `footer[slDetailPanelFooter]` is projected last in the article. |
| Zoneless and `OnPush`                       | Signals throughout; `contentChildren` for the sections; the strip attaches its `SlTabs` through a signal.                                                                                                                                                                      |
| Subscriptions torn down                     | `DestroyRef` for the focus-on-key effect; no manual listeners.                                                                                                                                                                                                                 |
| Static attribute survives host bindings     | `aria-label` on the aside and the root read with `HostAttributeToken` before the family writes `aria-labelledby`.                                                                                                                                                              |
| One class per entry point                   | `@slotted/angular/detail-panel`; `page-header`, `tabs`, `section`, `skeleton` imported through their own entry points.                                                                                                                                                         |

The asymmetry is recorded: in React the strip is an element the consumer
places in `PageHeaderTabs`; in Angular it is `[slDetailPanelTabs]` on the
element carrying `slPageHeaderTabs`. Both are one line, and neither binding
injects into another family's slot on the consumer's behalf.

## 9. Decisions and their cost

- **No `close` part.** The host owns `open`. Cost: a consumer in a drawer
  writes `Drawer.Close` in the header's actions themselves.
- **No `header` part.** The page-header is the first child of the root and
  sticks against the scroller; a wrapper would be the box it sticks inside.
  Cost: the anatomy names another family's root.
- **The tab panels are wired by id, not nested.** Cost: four attributes the
  tabs family already knows how to write, written here too; the reason is in
  §4.
- **The aside does not stick.** Cost: a long body scrolls the aside away;
  the consumer who wants it wraps the aside in `scroll-area`.
- **No `host` axis.** Cost: none found — `scroll` is the one difference a
  host makes.
- **`stacked` sections have no anchor bar.** Deferred to `table-of-contents`;
  `current` under `stacked` still names a section, so the bar can drive it
  when it exists.
- **A `not-found` status.** A record that does not exist and a request that
  failed need different words and different actions; one `error` would make
  the product tell them apart by elimination.
