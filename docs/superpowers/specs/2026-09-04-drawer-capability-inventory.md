# Drawer capability inventory

Produced before the family was designed or written, as
`.claude/skills/component/references/capability.md` requires. The family is new:
nothing exists under `specs/components/drawer` or `packages/styles/src/drawer`,
so there is no prior implementation to read and no delta to name.

`docs/build-order.md` wave 5 item 4 is the scope line, and it is one word:
`drawer`. `docs/component-features.md` §8 is therefore the whole of the written
scope, and it is three sentences:

> Overlay lateral/inferior para tarefa secundária, detalhe ou filtros; modal ou
> persistente conforme viewport.
> Lado usa `start/end`, extent com limites, resize opcional, header/body/footer
> e a mesma política cancelável de fechamento/foco de Dialog.
> Bottom sheet suporta snap points somente quando acrescentam valor e continuam
> operáveis por teclado.

That is a floor. §2.7 adds one more line that names this family directly —
"filtros extensos podem virar drawer" — and §15 names it twice more, as the
mobile form of a filter bar and as one of the three shapes a detail view takes.
`PROJECT-PRD.md` §20 lists drawers among the overlays that share one
infrastructure, and §20.1 lists what that infrastructure owes them: stacking,
z-index, portals, overlay containers, nested overlays, focus trapping, focus
restoration and click outside. All eight are already answered by
`packages/core`, which is why none of them appears as a row below.

Sources were read on 4 September 2026.

---

## 1. Surveyed

| Implementation           | Called                                                        | Read at                                                                                                             |
| ------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| WAI-ARIA APG             | Dialog (Modal) Pattern; Window Splitter Pattern for the resize | <https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/>, <https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/> |
| Vaul 1.x                 | `Drawer`, with `Root`, `Trigger`, `Portal`, `Overlay`, `Content`, `Handle`, `Title`, `Description`, `Close` | <https://vaul.emilkowal.ski/api>, `src/types.ts`                                    |
| Fluent UI React v9       | `Drawer`, splitting into `OverlayDrawer` and `InlineDrawer`   | `packages/react-components/react-drawer/library/src/**` on `microsoft/fluentui@master`                              |
| Ant Design 6.x           | `Drawer`                                                       | <https://ant.design/components/drawer>, `components/drawer/index.en-US.md`                                          |
| Angular Material         | `MatDrawer` inside `MatDrawerContainer`; `MatSidenav` above it | `src/material/sidenav/drawer.ts` on `angular/components@main`                                                       |
| MUI Material             | `Drawer`, plus `SwipeableDrawer`                               | <https://mui.com/material-ui/api/drawer/>                                                                            |
| This library, `dialog`   | `Dialog`, which declines `edgePlacement` and defers it here    | `specs/components/dialog/contract.json`                                                                              |

The six disagree on five things, and each disagreement is a decision this family
takes rather than inherits.

**Whether a persistent drawer is the same component as a modal one.** Fluent
ships two components and a third that picks between them by a `type` prop.
Angular Material ships one component with `mode="over" | "push" | "side"`. MUI
ships one with `variant="temporary" | "persistent" | "permanent"`. Vaul ships
only the modal one. `docs/component-features.md` §8 asks for both — "modal ou
persistente conforme viewport" — so the question is only whether they are one
component or two. §2 of the design document decides it.

**Whether the side is physical or logical.** Vaul says `direction: 'top' |
'bottom' | 'left' | 'right'`, MUI says `anchor: 'left' | 'right' | 'top' |
'bottom'`, Ant says `placement: 'top' | 'right' | 'bottom' | 'left'`. Only
Angular Material and Fluent are logical: `position: 'start' | 'end'`.
`docs/component-features.md` §2.4 and §8 both decide this for the library, and
the three physical vocabularies are what the decision is against.

**Whether the extent is a scale or a number.** Ant takes `size: 'default' |
'large'` *and* `width` and `height`. MUI takes neither and leaves it to the
consumer's CSS on `.MuiDrawer-paper`. Fluent takes `size: 'small' | 'medium' |
'large' | 'full'`. Angular Material takes nothing at all. This library already
decided the shape of that answer for `dialog`, and §5 of the design applies it.

**Whether the reader may change the extent.** Ant added `resizable` in 6.x;
Vaul has drag-and-snap; MUI, Fluent and Angular Material have nothing. Of the
three that move, none has a keyboard alternative — Ant's resizer is a pointer
handle, and Vaul's snap points are reachable only by dragging. §2.8 of the guide
requires one, and §8 makes snap points conditional on exactly that.

**Whether opening steals focus.** Angular Material is the only one in the set
that answers per mode: `autoFocus` defaults to the first tabbable element in
`over` and `push`, and to nothing at all in `side`. Vaul, Ant, MUI and Fluent's
`OverlayDrawer` always move focus in, and Fluent's `InlineDrawer` never does.
The split is right and §6 adopts it.

---

## 2. Table stakes

Every capability two or more of the surveyed implementations ship.

| Capability                                              | Who ships it                                | Verdict                    | Reason                                                                                                                                                                                                            |
| ------------------------------------------------------- | ------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Open state, controlled and uncontrolled                 | all six                                     | `adopt`                    | `@slotted/core/state`, with the request carrying a reason — which none of the six has                                                                                                                             |
| Which edge the panel comes from                         | all six                                     | `adapt`                    | `side: start \| end \| top \| bottom`, logical rather than physical. §2.4 of the guide                                                                                                                             |
| A resting measure for the panel                         | Ant, Fluent, Vaul (snap points)             | `adapt`                    | `size`, five named steps, the shape `dialog` already took. A theme retunes a step and cannot retune `width: 400px`                                                                                                 |
| Modal and persistent in one family                      | Fluent, Angular Material, MUI               | `adapt`                    | `mode: overlay \| inline`, an axis rather than two components, so switching it at a breakpoint keeps the panel's state and its scroll position                                                                     |
| A scrim, and whether there is one                       | Vaul, Ant, MUI, Fluent, Angular Material    | `adopt`                    | `backdrop` part, painted under `overlay` + `modal`. Absent by construction in `inline`                                                                                                                             |
| Escape closes it                                        | all six                                     | `adopt`                    | `@slotted/core/dismissable-layer`, topmost layer only. `escape: close \| none`                                                                                                                                     |
| A press outside closes it                               | Vaul, Ant, MUI, Fluent, Angular Material    | `adopt`                    | the same module. `outsidePress: close \| none`                                                                                                                                                                     |
| Refusing a close                                        | Angular Material (`disableClose`), Ant (`maskClosable`, `keyboard`) | `adapt` | One cancellable request covers all five sources, where Angular Material's boolean covers two of them and Ant's two booleans cover one each                                                                          |
| Focus contained while modal                             | Vaul, Ant, MUI, Fluent, Angular Material    | `adopt`                    | `@slotted/core/focus`, and not while `inline` — which is Angular Material's own split                                                                                                                              |
| Focus returned to the trigger                           | Angular Material, Fluent, MUI, Vaul         | `adopt`                    | the same module, including the fallback for a trigger the drawer deleted                                                                                                                                           |
| Header, body and footer                                 | Ant, Fluent                                 | `adopt`                    | parts, not props. §8 of the guide names all three                                                                                                                                                                  |
| A close button                                          | Ant, Fluent, Vaul                           | `adopt`                    | `close` part, closing with `dismiss`                                                                                                                                                                               |
| A title, and the accessible name from it                | all six                                     | `adopt`                    | `title` part and `aria-labelledby`, written only when the part is rendered                                                                                                                                         |
| A description                                           | Vaul, Fluent                                | `adopt`                    | `description` part and `aria-describedby`                                                                                                                                                                          |
| Body scroll locked while modal                          | Vaul, Ant, MUI, Fluent                      | `adopt`                    | `dismissable-layer`'s scroll lock, which follows `modal`                                                                                                                                                           |
| The panel's own scrolling row                           | Ant, Fluent                                 | `adopt`                    | `scroll: content \| panel`. `content` is the three-row grid `dialog` already proved, and it is what keeps the footer on screen                                                                                     |
| A named portal container                               | Vaul (`container`), Ant (`getContainer`), MUI (`container`) | `adopt`    | `container`, plus `setPortalContainer` for a whole document                                                                                                                                                        |
| When the panel exists in the DOM                        | Ant (`destroyOnHidden`, `forceRender`), MUI (`keepMounted`) | `adapt`    | `mount: active \| lazy \| eager`, three named values rather than two opposed booleans                                                                                                                               |
| Nested drawers                                          | Ant (`push`), Vaul (nested)                 | `adapt`                    | Stacking and the depth come from `dismissable-layer`. Ant's *push* — sliding the parent aside — is declined in §4 with its cost                                                                                     |
| Loading                                                 | Ant                                         | `adopt`                    | one implementation only, so not table stakes by the rule; adopted anyway because `dialog` ships it and a family that opens before its content arrives is the ordinary case                                          |
| Resize                                                  | Ant, Vaul (as snap dragging)                | `adapt`                    | `resizer` part, `role="separator"`, with the Window Splitter keyboard — which neither of the two has                                                                                                                |
| Snap points                                             | Vaul                                        | `adapt`                    | one implementation only. Adopted as the discrete form of the same resize, which is the only reading under which §8's condition — "continuam operáveis por teclado" — can be met                                     |
| A grab handle                                           | Vaul                                        | `adapt`                    | the `resizer` part *is* the handle, drawn as a bar on a bottom sheet and as an edge on a side drawer. One control, two appearances                                                                                  |
| Defaults set once for an application                    | Ant (`ConfigProvider`), Angular Material (`MAT_DRAWER_DEFAULT_AUTOSIZE`) | `adopt` | `DrawerDefaultsProvider` and `provideDrawerDefaults()`                                                                                                                                                             |
| Swipe to dismiss                                        | Vaul, MUI (`SwipeableDrawer`)               | `adapt`                    | Dragging the `resizer` past the smallest extent asks to close, carrying `pointer`. Whole-panel dragging is declined in §4                                                                                           |
| Switching mode at a breakpoint                          | nobody ships it; Fluent, MUI and Angular Material all document the consumer binding it | `adopt` the same shape | The breakpoint is an application decision, and a viewport query owned by a family is what `references/rubric.md` dimension 3 refuses. The two lines are on the reference page |

Nothing in the list is declined, so no row owes a replacement.

---

## 3. Differentiators

| What                                                                    | Who has it                     | Why this library can                                                                                                                                                                                     |
| ----------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A resize a keyboard can perform                                         | nobody in the set              | The Window Splitter pattern gives the separator a value, a range and six keys. Ant's resizer and Vaul's snap dragging are pointer-only, and §2.8 of the guide makes the alternative a condition of shipping the capability at all |
| Snap points reachable by arrow keys                                     | nobody in the set              | A snap point is a discrete stop of the same separator, so the keys that move the separator move between them. Vaul's are reachable only by dragging                                                        |
| One cancellable request for every way it closes                         | nobody in the set              | `@slotted/core/state`. Angular Material's `disableClose` refuses Escape and the backdrop together and nothing else; Ant needs `keyboard` and `mask.closable` and still cannot refuse the close button      |
| A reason on every close                                                 | MUI has two strings, nobody else has any | `docs/state-and-events.md`'s closed vocabulary. MUI's `onClose(event, reason)` carries `escapeKeyDown` and `backdropClick`; a consumer of the others tells a dismissal from a programmatic close by elimination |
| A logical side that mirrors without a second stylesheet                 | Fluent and Angular Material name it logically; neither mirrors the slide | `justify-self` and `align-self` are already flow-relative, so only the exit `translate` needs a direction, and it takes one `:dir(rtl)` rule                                                            |
| Three colour schemes and three densities on the same panel              | nobody in the set              | The token foundation. A dense drawer keeps its type and spacing and its controls stay hittable, because the theme grows control height under `pointer: coarse`                                             |
| One family, both bindings, with `ControlValueAccessor` where it belongs and `render` where it belongs | Vaul, Ant, MUI and Fluent are React; Angular Material is Angular | `references/frameworks.md`. Neither binding is levelled down to the other's shape                                                                                        |
| The panel keeps the theme of the region it was opened from              | nobody in the set              | `@slotted/core/portal` takes an origin. Every surveyed implementation portals to `document.body` and loses the scheme, density and direction of the subtree the trigger was in                             |

---

## 4. Gaps

What no surveyed implementation handles well and a real product still meets.

| Gap                                                                                | What the field does                                                                                             | What this family does                                                                                                                                                                     |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A long body pushes the actions past the fold                                       | Vaul, MUI and Angular Material ship no layout; Ant and Fluent ship a footer that scrolls with the body           | `scroll="content"` is the default: the panel is a three-row grid, `auto minmax(0, 1fr) auto`, bounded to the layer, so the footer holds                                                     |
| A persistent drawer's controls stay in the tab sequence while it is visually closed | Angular Material toggles `visibility`, which does take them out; MUI's `persistent` variant leaves them reachable | `inert` and `content-visibility: hidden` on the closed panel in both modes, so the collapse the eye reads and the tab order agree                                                          |
| A resize with no floor leaves an unreadable panel                                  | Ant clamps to `minWidth`/`maxWidth` and draws nothing when the reader hits either                               | `minExtent` and `maxExtent` are the separator's `aria-valuemin` and `aria-valuemax`, so a reader who cannot see the panel still hears where the range ends                                  |
| A hostile string in a title widens the panel                                       | every one of the six leaves it to the consumer                                                                  | `overflow-wrap: anywhere` and a zero minimum on the words, the pair `dialog` already needed                                                                                                 |
| Opening before the content has arrived                                             | Ant draws a skeleton; the other five have no state for it                                                       | `loading` writes `aria-busy` on the body and keeps a floor, and disables nothing — a drawer a reader cannot leave is the worse failure                                                     |
| A drawer that deletes the row it was opened from                                   | all six return focus to a detached trigger, which drops it on `body`                                            | `createFocusScope` falls back to the origin's nearest connected ancestor                                                                                                                    |
| An empty panel                                                                     | none of the six has a state for it                                                                              | Not a state of this family: an empty list inside a drawer is `result-state`, which owns the seven statuses and their marks. The composition is on the reference page                        |
| A drawer inside a shell that owns its own stacking context                         | Ant and MUI take a container; Angular Material requires the `MatDrawerContainer`                                | `container` per instance and `setPortalContainer` per document, and the panel still inherits the origin's theme rather than the container's                                                 |
