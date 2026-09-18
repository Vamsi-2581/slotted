# Notification center — design

The persistent list of what happened while the reader was not looking. It
composes `tabs` for its views, `button` for its controls, `skeleton` for its
wait, `result-state` for its empty page and
`@slotted/core/timeline` for the Feed keyboard and the timestamps; `popover`
and `page` are its hosts, and `top-navigation` draws the bell. What the family
owns: the feed of items with their read mark, the view, the arrivals policy,
and every request over the consumer's store. The inventory is
`2026-09-17-notification-center-capability-inventory.md`.

## 1. Anatomy

```
[data-part=root]                          ← section, region named by messages.title (or the consumer's aria-label)
├─ [data-part=header]
│    ├─ [data-part=title]                 ← heading at `level`: "Notificações" + [data-part=count] with the unread total
│    ├─ [data-part=mark-all]              ← button: mark every unread read; disabled when nothing is unread
│    └─ [data-part=actions]               ← the consumer's own: preferences link, a menu
├─ [data-part=views]                      ← tabs (list only) over `views`; absent when views has one entry
├─ [data-part=fresh]                      ← the held arrivals: a button "N novas notificações"; present when held > 0
├─ [data-part=feed]                       ← role=feed, aria-busy while loading, aria-labelledby the title
│    ├─ [data-part=group] ×n              ← when groupBy: a section with
│    │    ├─ [data-part=group-label]      ← a heading one rank below the title
│    │    └─ [data-part=item] ×n
│    └─ [data-part=item]                  ← article, tabindex=0, aria-labelledby title, aria-describedby description
│         ├─ [data-part=visual]           ← the consumer's avatar or icon; for a toned item without one, the family's tinted glyph circle; absent when neither
│         ├─ [data-part=content]
│         │    ├─ [data-part=title]       ← a link when href, text otherwise; two-line clamp
│         │    ├─ [data-part=description] ← three-line clamp
│         │    ├─ [data-part=time]        ← time[datetime], relative or absolute
│         │    └─ [data-part=actions]     ← the consumer's per-item controls
│         └─ [data-part=controls]        ← read-toggle, dismiss — which exist is the `controls` axis
│              ├─ [data-part=read-toggle] ← icon button: check while unread, dot while read
│              └─ [data-part=dismiss]     ← icon button: x
├─ [data-part=more]                       ← growing=button: a button; growing=scroll: the sentinel; absent under none
├─ [data-part=empty]                      ← in place of the feed when it has nothing; the consumer's result-state or messages.empty
└─ [data-part=footer]                     ← the consumer's link from the popover to the page; absent when not written
```

`title` appears twice, on the header and on the item, as `timeline` has
`title` on the item and `group-label` on the group; both are reached from
their own parent with a child combinator.

## 2. Axes and defaults

| Axis         | Values                       | Default    | Effect                                                                                                                     |
| ------------ | ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `size`       | `sm`, `md`                   | `md`       | `sm` for the popover: tighter insets, the small control step; `md` for the page.                                          |
| `level`      | `2`, `3`, `4`                | `2`        | The rank of the header's heading; group labels take the rank below.                                                        |
| `growing`    | `none`, `button`, `scroll`   | `none`     | How more is loaded, `timeline`'s vocabulary.                                                                               |
| `arrivals`   | `hold`, `show`               | `hold`     | Whether new keys are held behind `fresh` while the reader reads.                                                           |
| `timeFormat` | `relative`, `absolute`       | `relative` | How `time` is written.                                                                                                     |
| `controls`   | `both`, `read`, `dismiss`, `none` | `both` | Which of the family's two item controls are drawn; `none` for a feed whose store has no per-item read or removal.         |
| `tone`       | `accent`, `secondary`, `success`, `warning`, `danger` | `accent` | Per item: the disc and the unread wash.                                                              |

`loading` is a state: `aria-busy` on the feed, skeleton rows in place of the
items when there are none yet, and the `more` button waiting when there are.

## 3. Data

```ts
interface NotificationItem {
  key: string;
  title: ReactNode | string;
  description?: ReactNode | string;
  time: PlainDateTime | string;   // an ISO instant or a plain date-time
  read: boolean;
  href?: string;
  tone?: Tone;                    // the dot's colour; accent by default
  visual?: ReactNode;             // React; Angular: a template ref through the item template
  actions?: ReactNode;
}
```

`items` is the consumer's array and the family holds none of its facts. A
change to `read`, an item pressed, an item removed, a page loaded, arrivals
revealed and a view changed are each a request carrying a reason:

| Request         | Signature                                                          | Reasons                                     |
| --------------- | ------------------------------------------------------------------ | ------------------------------------------- |
| `onReadChange`  | `({ keys, read }, request)`                                        | `pointer`, `keyboard`, `programmatic`       |
| `onRemove`      | `(key, request)`                                                   | `pointer`, `keyboard`                       |
| `onOpen`        | `(key, request)` — before the link's navigation, cancellable       | `pointer`, `keyboard`                       |
| `onReveal`      | `(count, request)`                                                 | `pointer`, `keyboard`                       |
| `onLoadMore`    | `(request)`                                                        | `pointer`, `keyboard`, `scroll`             |
| `onViewChange`  | `(view, request)` — the `current` model                            | `pointer`, `keyboard`, `programmatic`       |
| `onUnreadChange`| `(count)` — a fact, not a request, for the bell                    | —                                           |

`read` is added to the state vocabulary (`data-read` on the item) and to the
capability list as a non-mutable capability, like `removable`: the family
asks and the consumer's store answers. The reason is in
`specs/contract.schema.mjs`.

## 4. Arrivals

Under `arrivals="hold"` the family keeps the keys it has shown. When `items`
changes and carries keys it has not shown, it asks whether the reader is
reading: `document.activeElement` inside the feed, or the feed's scroll
container scrolled past its start. Reading, the new keys are held — the
shown list stays, `fresh` shows their count, and a polite announcement says
so once per change. Not reading, they show at once. Revealing (`onReveal`,
not cancelled) shows them and moves focus to the first revealed article when
the press was a keyboard one. Changes to shown items and removals apply
immediately in both cases. Under `show` nothing is held.

## 5. Views

`views` is `[{ value, label }]`; the built-in values `all` and `unread` are
rendered when `views` is not stated. The strip is `tabs` with the list alone
and the feed is its one panel, wired by the strip's ids as `detail-panel`
does. Under `unread` the family shows the items whose `read` is false; under
any other value the items are what the consumer gave. Switching a view keeps
the held arrivals held.

## 6. Framework integration

### React

| Question                                       | Answer                                                                                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controlled and uncontrolled pair, with reason  | `view` / `defaultView` / `onViewChange(view, request)`.                                                                                                                  |
| Defaults once                                  | `NotificationCenterDefaultsProvider` (`size`, `level`, `growing`, `arrivals`, `timeFormat`, `locale`, `timeZone`, `messages`).                                           |
| Substitute the rendered element                | `renderItem(item, state)` substitutes an item's content; `render` on the root. The controls are the family's `IconButton`s and the strip is `tabs`'s.                    |
| Consumer's handler still runs                  | Native props spread after the family's on the root; the requests are the family's only handlers.                                                                         |
| Native element and imperative action           | `ref` with `NotificationCenterHandle`: `element`, `focus()` (the first article), `reveal()`.                                                                             |
| Server render                                  | `useId` for the title and the feed; `formatTimestamp` with `now` stated by the consumer for a stable relative reading.                                                   |
| Every state in the DOM                         | `data-size`, `data-level`, `data-growing`, `data-arrivals`, `data-time-format`, `data-loading`, `data-read` on the item, `data-tone` on the item, `data-view`.            |
| Props type is the native element's, extended   | `ComponentPropsWithRef<'section'>`.                                                                                                                                      |

### Angular

| Question                                    | Answer                                                                                                                                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way value in the signal form            | `view = model<string>()`, `viewRequest = output<ChangeRequest<string>>()`.                                                                                                     |
| Reactive Forms                              | No: the centre holds no form value.                                                                                                                                           |
| Defaults once                               | `provideNotificationCenterDefaults()`.                                                                                                                                        |
| Template reaches the instance               | `exportAs: 'slNotificationCenter'`.                                                                                                                                           |
| Projected content, kept lazy                | `ng-template[slNotificationItem]` with the item as context substitutes an item's content; `[slNotificationCenterActions]` and `[slNotificationCenterFooter]` are content slots; `[slNotificationCenterEmpty]` the empty page. |
| Zoneless and `OnPush`                       | Signals throughout; `afterRenderEffect` for the focus reads; `linkedSignal` for the shown keys.                                                                                |
| Subscriptions torn down                     | The `IntersectionObserver` under `growing="scroll"` in an effect with `onCleanup`.                                                                                             |
| Static attribute survives host bindings     | `aria-label` on the root read with `HostAttributeToken`.                                                                                                                      |
| One class per entry point                   | `@slotted/angular/notification-center`.                                                                                                                                       |

## 7. Decisions and their cost

- **The family does not paint a rail.** A notification is a row, not an
  event; `timeline`'s engine is reused and its stylesheet is not. Cost: two
  families draw a `time` and a `title`, in two rhythms.
- **Unread is a wash and a weight; there is no dot.** An unread row stands
  on a wash mixed from the tone's text at the highlight share and its title
  is semibold; the read-toggle's glyph says the rest. Four marks were
  refused at the visual gate: a rail on the row's edge, a disc on the
  title's line (off the avatar's axis), a dot on the visual's corner (the
  tone said twice), and a solid fill on the family's visual (it shouted
  beside the avatars). Cost: a product that wants a mark beyond the wash
  writes it in the item's `visual`.
- **A toned item without a visual gets the family's.** The tone's glyph in
  a circle the size the avatar would be — `circle-info`, `bell`,
  `circle-check`, `circle-alert`, `circle-x`; every one a circle, no
  triangle — on the tone's surface with the tone's edge, the same weight as
  the avatars beside it, read or not. An item with neither tone nor visual has no visual and
  the words take the column. The visual, the title's first line and the
  controls are centred on one axis. Cost: a list that mixes toned and
  untoned items has two left edges for its words.
- **`sm` states a floor width.** A root with inline-size containment
  contributes no intrinsic width, so inside a panel sized to its content — a
  popover — it collapsed to nothing. `sm` takes
  `min-inline-size: min(22rem, 100vw − 2rem)`, overridable by
  `--slotted-notification-center-min-inline-size-sm`; `md` states none, so
  it still fits a 240-pixel column. The narrow layout — controls under the
  content — starts below 320 pixels, under the popover's own step. Cost: a
  popover narrower than 22rem clips the centre unless the token is lowered.
- **Counts are the family's own chip, not `badge`.** A count beside a title is
  a figure, not a status; `badge`'s smallest step read as a status beside the
  words. The chip sits on the type scale's smallest step in tabular figures
  with an edge in the ink, as `top-navigation` draws the bell's count. Cost:
  one more part (`count`) and one more place a chip is drawn.
- **The two item controls are an axis.** `controls="both" | "read" |
  "dismiss" | "none"` says which the family draws; they are muted at rest and
  take the text ink on the row under the pointer or holding focus. Cost: a
  consumer that wants a third control writes it in the item's `actions`.
- **`read` becomes a word of the vocabulary.** Cost: a schema change in its
  own commit; gain: a state every notification list needs, selectable.
- **Arrivals are held by the family, not the consumer.** Cost: the family
  reads focus and scroll; gain: a product that pushes live updates gets the
  guarantee the scope asks for by default.
- **Groups do not collapse.** Cost: UI5's fold is not here; a reader with a
  hundred notifications in one group scrolls.
- **No bulk selection.** Deferred to `selection-toolbar`.
