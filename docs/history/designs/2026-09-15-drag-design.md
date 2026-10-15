# `drag` — design

`@slotted/core/drag`, wave 9's `infra` line. The inventory is
`docs/history/designs/2026-09-15-drag-capability-inventory.md`. Nothing here
renders: no stylesheet, no contract in `specs/components`, no reference page.
What replaces the visual gate is a test per file and a page that runs the
module against the theme, built by `tools/harness/core.mjs`, which the reviewer
drives by keyboard and by pointer.

## 1. The session is the design

A drag is a **session** with four verbs — `pickUp`, `move`, `drop`, `cancel` —
over a set of **positions** the consumer's model defines. The keyboard drives
the verbs directly. The pointer drives the same verbs: a press past the
activation constraint is `pickUp`, a move is `move` to the position under the
point, a release is `drop`, and `pointercancel` is `cancel`. The consumer
receives one event from both, and it never contains a pixel.

```ts
const drag = createDragController({ onDrop, messages });
drag.registerContainer({ key: 'todo', items: () => todo, itemElement: (k) => ..., element: () => list });
drag.registerContainer({ key: 'done', items: () => done, ... });

// keyboard, from the family's own keydown on the focused item
if (drag.state.status === 'dragging') drag.handleKeydown(event);
else if (event.key === ' ') drag.pickUp({ items: [key], source: { container: 'todo', index }, reason: 'keyboard', event });

// pointer, once per item
const detach = drag.attachDraggable(node, { container: 'todo', key, handle: () => grip });

// the APG one-call move that tags-input already presses
drag.moveBy({ items: [key], source: { container: 'todo', index }, intent: 'next', reason: 'keyboard', event });
```

## 2. Positions

A container is `{ key, items(), orientation, targets, accepts, operation,
element, itemElement, label, itemLabel, disabled, columns }`. `items()` is a
function and is read at pick-up and at every move, so a list the application
changes mid-drag changes the positions rather than the module's memory.

The positions a container offers, in order, for `items = [a, b, c]`:

| `targets`           | Positions                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `['between']`       | `between 0`, `between 1`, `between 2`, `between 3`                                          |
| `['between', 'on']` | `between 0`, `on a`, `between 1`, `on b`, `between 2`, `on c`, `between 3`                  |
| `['on']`            | `on a`, `on b`, `on c`                                                                      |
| any, `items = []`   | `root`                                                                                      |

A `between` index is where the dragged items would be spliced in. Under
`move` from the same container the gap before a dragged item and the gap after
it are the same list, so the gap after is removed and the gap before is the
**identity** position: the one the drag starts on, and the one a drop on is a
cancel. `on` a dragged item is removed for the same reason.

`accepts(state, target)` filters the list. The keyboard never lands on a
refused position; the pointer can hover one, and the snapshot then says
`valid: false`, which the family paints as `drop-invalid` on that container.
The identity position is not asked; it is always reachable and never a drop.

Across containers the order is registration order. `next`/`previous`/`first`/
`last`/`pageNext`/`pagePrevious` stay inside the current container;
`nextContainer`/`previousContainer` cycle to the first valid position of the
next container that offers one; `rowNext`/`rowPrevious` add `columns()` on a
`grid`. There is no wrap inside a container: a reader at the end who presses
down hears the position again, not the top of the list — the APG's
rearrangeable listbox stops at the ends, and `tags-input` inherited that.

## 3. Keys

`handleKeydown(event)` while a session is open, mapped from the three surveyed
keyboard sensors that agree and from the writing direction of the container's
element:

| Key                                  | `vertical`                             | `horizontal`                              | `grid`                        |
| ------------------------------------ | -------------------------------------- | ----------------------------------------- | ----------------------------- |
| `ArrowDown` / `ArrowUp`              | `next` / `previous`                    | `nextContainer` / `previousContainer`     | `rowNext` / `rowPrevious`     |
| `ArrowRight` / `ArrowLeft` (LTR)     | `nextContainer` / `previousContainer`  | `next` / `previous`                       | `next` / `previous`           |
| `ArrowRight` / `ArrowLeft` (RTL)     | `previousContainer` / `nextContainer`  | `previous` / `next`                       | `previous` / `next`           |
| `Home` / `End`                       | `first` / `last`                       | same                                      | same                          |
| `PageDown` / `PageUp`                | `pageNext` / `pagePrevious` (10)       | same                                      | same                          |
| `Tab` / `Shift`+`Tab`                | `nextContainer` / `previousContainer`  | same                                      | same                          |
| `Space` / `Enter`                    | `drop`                                 | same                                      | same                          |
| `Escape`                             | `cancel`                               | same                                      | same                          |

The key that **starts** a session is the family's: `listbox` already uses
`Space` to select and `Enter` to activate, and which of its keys picks up —
a modifier, a handle, a menu item — is a decision about that family. The
module offers `pickUp` and the `DRAG_KEYS` constant for `aria-keyshortcuts`.

`Escape` is also taken on `window` in the capture phase while a session is
open, with `stopPropagation`, so a drag inside a `dialog` cancels the drag and
leaves the dialog open: `dismissable-layer` listens on the document, and the
window's capture listeners run first. This is the one place the module knows
another module exists, and it knows it by event order rather than by import.

## 4. The pointer, derived

`attachDraggable(element, { container, key, items, handle, disabled, distance,
delay, allowedOperations })` listens to `pointerdown` on the element. A press
on something other than the handle, a secondary button, a disabled draggable
or a second pointer while a session is open does nothing. Without a `handle`
the whole element drags, and a press on a control inside it — a button, a
link, a field — stays the control's: a row with actions drags from its
label and not from its menu button. With a `handle`, only the handle drags,
which is what a row that also selects or activates on press needs; the
harness shows both, a grip on the lists and the whole card on the grid.

After the press the module waits for the constraint: `distance` pixels of
travel (5) or, for `pointerType === 'touch'`, `delay.touch` milliseconds of
holding (250) with less than that travel — the page keeps scrolling under a
swipe. Then `pickUp` runs with `reason: 'pointer'`, the pointer is captured,
a non-passive `touchmove` listener prevents scrolling for the rest of the
session, `contextmenu` is prevented, and every `pointermove` resolves the point
to a position:

1. the smallest enabled container whose `element()` rect contains the point
   — a lane inside a board wins over the board — else `target: null`;
2. empty container → `root`;
3. otherwise the item rects along the container's axis: the point inside an
   item's middle half is `on` it when the container offers `on`; else before
   or after its midpoint is `between i` or `between i + 1`; past every item is
   `between length`; before every item is `between 0`. A `grid` takes the
   nearest item by centre and decides before/after on the inline axis. An item
   with no element (a virtualised row off screen) is skipped.

Release is `drop`; `pointercancel`, window `blur` and `visibilitychange` to
hidden are `cancel`.

The rule in step 3 is the default and not the only one: `resolveTarget(point,
containers)` on the controller replaces it, receiving the same measured
containers, so a family with a different hit test — nearest centre for a
board of cards, a hit box per cell for a spanning widget — writes that
function and keeps the session, the keyboard, the preview and the
auto-scroll.

No `touch-action` is needed on the handle. The hold decides: a finger that
moves before 250 ms is a scroll and the press is dropped; one that holds is a
drag, and from then on `touchmove` is prevented so the page does not scroll
under it. `touch-action: none` on a grip would take scrolling away from a
finger that happened to land on it.

**Preview.** A pointer session appends `preview(state)` — default, a clone of
the source item's element at the source's size — to `document.body`, fixed,
`pointer-events: none`, `aria-hidden`, carrying `data-slotted-drag-preview` and
`data-operation`, and moves it with `translate` keeping the offset the finger
had inside the source. A keyboard session shows no preview: the item is where
it was and the family's `drop-target` attribute is the picture.

**Auto-scroll.** While a pointer session is open, each animation frame walks
from the element under the point to the root, and every ancestor that can
scroll on an axis and has the point within `threshold` (40 px) of its edge on
that axis scrolls by `speed × (1 − distance / threshold)` (12 px per frame at
the edge). The target is then re-resolved from the same point, because the
content moved under it. A keyboard move scrolls the target's element into view
with `block: 'nearest'`.

## 5. Operation

`allowedOperations` on the pick-up, `['move']` by default. `operation(state,
target)` on the container names the one it will perform; when it names none,
the modifiers decide the way the platform reads them — `Ctrl` (or `Alt`, which
is `Option`) `copy`, `Shift` `move`, `Ctrl`+`Shift` `link` — and the first
allowed operation is the fallback. A container whose operation is not allowed
is refused as if `accepts` had said so.

## 6. Events, and what is said

| Event            | When                                                        | Carries                                                                 |
| ---------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| `onDragStart`    | before the session opens; `cancel()` refuses it              | `items`, `source`, `reason`, `event`                                     |
| `onTargetChange` | the target or its validity or operation changed              | `state`, `event`                                                        |
| `onDwell`        | `dwellDelay` (600 ms) over one unchanged valid `on` target   | `state`                                                                 |
| `onDrop`         | a valid, non-identity target was dropped on                  | `items`, `source`, `target`, `operation`, `reason`, `event`             |
| `onDragEnd`      | after `onDrop`, or on a cancel                               | `state` at the end, `dropped`, `reason`, `event`                        |

`reason` is `keyboard`, `pointer` or `programmatic` from the closed vocabulary
in `docs/state-and-events.md`. A drop on the identity position, on `null`, or
on a refused target is a cancel with `dropped: false`: a request for the value
the consumer already holds is not emitted.

Announcements go through `getLiveAnnouncer(document)` — `toast`'s path — from
`messages`: `instructions`, `pickedUp`, `moved`, `dropped`, `cancelled`,
`nowhere`, each a function of a context with the item label, the
count, the 1-based resulting position and total, the target's label and the
operation. A keyboard or programmatic session announces every step; a pointer
session announces the pick-up, the drop and the cancel. `instructions` is a
string the family renders once, visually hidden, and references from the
draggable with `aria-describedby`; the module does not create that element,
so a server render and its hydration agree on the id.

Labels come from the container: `label()` for the container, `itemLabel(key)`
for an item, defaulting to the key. The module never reads text from the DOM.

## 7. Focus

After a cancel, focus returns to the source item's element on the next frame.
After a drop, to the same key's element in the target container — which is
where the family rendered it — falling back to the source container. Both go
through `itemElement`, both skip when the element is gone, and `restoreFocus:
false` leaves focus to a family that moves it itself. `pickUp` from the
keyboard does not move focus: the item stays where it is and so does the ring.

## 8. What the DOM shows

The module writes nothing on a registered element. `state` is a snapshot —
`status`, `reason`, `items`, `source`, `target`, `valid`, `operation`, `point`
— and `subscribe` reports every change, so a binding renders `data-dragging`
on the items in `items`, `data-drop-target` on the container or item the
target names, and `data-drop-invalid` on a container under a pointer it
refuses. Writing those attributes from the module would put two owners on one
attribute in React, and one of them re-renders.

The one element the module owns is the preview, and it is gone at the end of
the session.

## 9. The shapes the consumers take

- **`listbox`, `tags-input`, `data-grid` columns.** One container, `between`,
  `vertical` or `horizontal`; the family draws an insertion line from
  `state.target` and dims `state.items`. Pinned columns refuse the positions
  inside the pinned run through `accepts`.
- **`tree`.** One container holding the visible rows flattened, `targets:
  ['between', 'on']`; `accepts` grants `on` to a folder and refuses it to a
  leaf. `between i` is read by the family at the depth of row `i`; a drop
  into a folder is `on` it, which is also how the ambiguous gap after a
  folder's last child is resolved — the APG tree has no other convention,
  and React Aria's tree makes the same choice. `onDwell` expands the folder.
- **Kanban.** One container per lane; `nextContainer` and the pointer cross
  lanes; the smallest-box rule lets the board be a container too when a lane
  is empty and collapsed.
- **`dashboard-grid`.** `grid` with `columns()`; `on` for a swap; a spanning
  widget is served by `resolveTarget`. A layout that pushes other widgets
  aside is the family's reducer over the same drop event.

## 10. Bindings

None in this session. The integration tables in `references/frameworks.md`
are answered by the first consumer: `data-grid` wraps the controller in a hook
and a directive, the way `positioner` is reached through `usePositioner` and
`SlPositioner`. What the module fixes for them is that `items()`,
`itemElement()` and `element()` are functions, so a signal or a ref is read
when the drag asks and not when the container was registered.

## 11. What a wrong answer costs

- **Positions instead of coordinates.** A family that needs a free `{x, y}`
  reads `state.point`, and a family that needs a 2D grid gets `grid` with
  `columns()`. If `dashboard-grid` needs a target the list cannot express — a
  span of cells — the position vocabulary grows by one kind, and every consumer
  written against `between`, `on` and `root` keeps compiling.
- **No live reorder from the module.** If a family wants the CDK picture, it
  renders its list from `state.target` while dragging. The cost is on that
  family; the module does not move DOM nodes.
- **The identity drop is a cancel.** A consumer that wanted to hear "dropped
  where it was" reads `onDragEnd` with `dropped: false` and a `target` equal
  to the source.
- **`Escape` on `window`.** A family that wants `Escape` to close its layer
  and cancel the drag at once has to cancel the drag itself from its own
  handler; `dismissable-layer` will not see the key while a drag is open.
