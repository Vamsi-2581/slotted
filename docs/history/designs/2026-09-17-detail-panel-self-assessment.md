# Detail panel — self-assessment

Against `.claude/skills/component/references/rubric.md` and
`docs/component-features.md` §18. Every dimension names the one change that
would most improve it and says whether it was made. Captures are in the
session scratchpad under `dp/`; the harness is `tools/harness/out/detail-panel.html`.

## 1. Icons

The family draws no icon of its own: the back arrow, the chevrons and the
pin are `page-header`'s, the copy mark is `description-list`'s, the status
glyph is `result-state`'s. Nothing to mirror. **Change:** none named; a
family that composes its marks has no glyph to get wrong. Not applicable.

## 2. Motion

One transition: a tabbed section arriving fades in over
`--slotted-duration-short` with `--slotted-easing-enter`, the same motion
`tabs` draws on its own panel, because the section is the thing that changed.
The header's snap, the drawer's slide and the pin are theirs. Under `stacked`
nothing arrives and nothing moves; a programmatic `section` scrolls the
section into view with the browser's own behaviour, which `prefers-reduced-motion`
already governs. **Change:** `scrollIntoView({ behavior: 'smooth' })` under
stacked would help the eye follow the jump. Not made: the browser's default
respects the reader's scroll-behavior setting and a family-stated `smooth`
would override it.

## 3. Responsiveness

The root is the query container (`container-name: detail-panel`) and the
columns are three elements in; at 640 pixels the grid drops to one track and
the aside follows the sections with a rule above it. Read at 240, 420 and 720
(`detail-panel-stacked-light-comfortable-ltr-{240,420,720}.png`); the
narrow scene in both reference pages is a 375-pixel room. Nothing is hidden by
width. **Change:** at 240 the header's toolbar overflows — that is
`page-header`/`toolbar` under static markup, live it collapses into the menu.
Not this family's to change.

## 4. Refinement

Read every baseline capture and the six docs-page slices. Two corrections
were made from looking: the column's inset went up one step because the
page-header's pill hung half its height into the column and met the first
heading; the count badge was moved from the section's eyebrow into the
heading, after the label, so the stacked heading and the tab read the same,
and a word-space was added between the two. The aside's rule sits at the
gap's distance from both columns, so it reads as the middle of the gap rather
than as an edge. **Change:** the empty run under a short tabbed section in a
screen-tall host. Not made: the height is the host's, and a footer or the
host's own edge is what closes it.

## 5. Tokens

`packages/styles/src/detail-panel/detail-panel.tokens.json` lists thirty-two
tokens, every one reaching the foundation: space for the gap, the rhythm and
the inset; the thin border and the subtle rule; the focus ring triple; the
sticky z-index; `--slotted-page-ground` for the footer's paint. Three
literals, each with its reason in the stylesheet: the aside tracks
(`14rem`/`16rem`/`18rem`, Primer's minimum pane and one type step either
side — a column width has no scale) and the message's floor
(`calc(4 * var(--slotted-space-12))`, arithmetic on a token). **Change:** a
`--slotted-detail-panel-aside-size` family token per size already exists;
the inset-block per size could be one token rather than three. Not made: the
three follow `page-header`'s per-size pattern and a theme retunes one step
without touching the others.

## 6. Patterns

`specs/components/detail-panel/contract.json` records that the Authoring
Practices hold no detail or record pattern (`patternAbsent`), and names the
three governing sources: the landmark practices for the `article` and the
`aside`, the Tabs pattern for the strip, the Dialog pattern for the drawer
host. The Tabs items the family answers itself, checked against
<https://www.w3.org/WAI/ARIA/apg/patterns/tabs/>:

| Item                                              | Where                                                           | Status |
| ------------------------------------------------- | --------------------------------------------------------------- | ------ |
| `role="tablist"`, `role="tab"`, roving tabindex   | `tabs` family, in the strip                                     | pass (held by `tabs`) |
| `aria-controls` on the tab naming its panel       | the strip's `identify()` → the section's `id`                   | pass — `detail-panel.test.tsx` "wires each section", `detail-panel.spec.ts` |
| `role="tabpanel"` with `aria-labelledby` the tab  | `DetailPanelSection` / `SlDetailPanelBody` under `tabs`         | pass |
| the panel in the tab sequence (`tabindex="0"`)    | same                                                            | pass |
| a hidden panel is `hidden`, not styled away       | same; the stylesheet restates `[hidden] { display: none }`      | pass |
| ArrowLeft/Right, Home, End, automatic activation  | `tabs`; the request reaches `onSectionChange` as `keyboard`     | pass — `detail-panel.test.tsx` "forwards the strip's request" |
| Shift+F10 for a tab's menu                        | declined by `tabs`, deferred to `menu`                          | inherited departure |

Landmarks: the root is an `article` named by `aria-labelledby` the
page-header's heading, read from the DOM after render, with the consumer's
`aria-label` winning (`detail-panel.test.tsx` "named by the heading",
"passes native attributes"); the aside is `<aside>` named by
`messages.aside`. **Change:** the heading's id is read in an effect, so the
article is unnamed for one render. Not made: the id is `page-header`'s to
give, and reading it is the price of not reaching into another family.

## 7. Accessibility

Name: the article by the heading, the aside by `Detalhes`, the root by
`A carregar o registo` while loading and headless. Role: `article`,
`complementary`, `tabpanel` under tabs. State: `aria-busy` while loading,
`hidden` on a panel not shown, `data-current` on the current section. Focus:
follows the record — when `recordKey` changes with focus inside the root the
heading takes `tabindex="-1"` and focus, and the scroller returns to its
start (`detail-panel.test.tsx` "moves focus to the heading", the Angular
spec likewise); Tab from the strip lands on the tabpanel with the outward
ring (`detail-panel-tabs-focus-role-tabpanel-light-comfortable-ltr-720.png`).
Forced colours: the theme's remapping is enough, the family writes no rule.
Reduced motion: the one animation is on the motion scale and collapses with
it. **Change:** announce the record change with a live region as well as the
focus move, for a reader whose focus was outside. Not made: a focus that is
elsewhere is a reader who was not reading the record; a region that
announces every navigation would speak over the list they were in.

## 8. Native API

React: `ComponentPropsWithRef<'article'>` on the root, `'div'` on the body
and the section; native props spread first and the family's after; `render`
on the root, the body and the section, the root's `ref` callback handed to
`render`; a `DetailPanelHandle` with `focus()` and `scrollToSection()`.
Angular: attribute selectors on the consumer's own elements
(`article[slDetailPanel]`, `aside[slDetailPanelAside]`, `footer[slDetailPanelFooter]`),
`model()` for `section`, `output()` for the request, `input.required` for a
section's `name` and `label`, `HostAttributeToken` for a written
`aria-label`, `exportAs` on every part that has an instance. A written
`aria-label` on the aside wins over `messages.aside` in both. **Change:** the
Angular section's `actions` is a `TemplateRef` input rather than projected
content, because the section itself is a template the body instantiates.
Made as designed; the alternative — a directive on a projected element —
could not follow the section between its two shapes.

## 9. Capability

Against the inventory (`2026-09-17-detail-panel-capability-inventory.md`
§2): every table-stakes row is `adopt`, `adapt`, or a `decline` naming the
family that owns it (`drawer` for close/overlay/focus, `splitter` for a
resizable aside, `wizard` for steps, `grid` for two-column sections) or
`table-of-contents` for scroll-spy. The one mutable value, `current`, has its
model, its reasons and its row in the matrix; the strip's request is
forwarded with its reason and can be cancelled. Differentiators shipped:
three hosts on one anatomy (`hosts` scene in both pages), the chrome
stacking under `--slotted-page-sticky-top`, `not-found` beside `error`,
focus following the record. Gaps answered: `banner`, loading during
navigation, a forty-word title, twelve sections, an unbroken token.
**Change:** an `onNavigate` of the family's own for previous/next. Not made:
the controls are `page-header`'s `navigation` slot and the consumer's own
buttons; a second handler for the same press would be two owners.

## 10. Ecosystem integration

Every line of both tables in `references/frameworks.md` is answered in
`2026-09-17-detail-panel-design.md` §8. React: `DetailPanelDefaultsProvider`
and `PageHeaderDefaultsProvider` from the root, so a page-header inside takes
the panel's rank; `useId`-free wiring that renders identically on the server;
every state as a `data-*`. Angular: `provideDetailPanelDefaults()`;
`PAGE_HEADER_DEFAULTS` provided for the subtree through getters over signals,
so the header's `computed` tracks the panel's level; `contentChildren` for
the sections; `afterRenderEffect` for the DOM reads; no `markForCheck`. No
`ControlValueAccessor`: the panel holds no form value. The asymmetry is
recorded: React places the strip with `<DetailPanelTabs>` inside
`PageHeaderTabs`, Angular with `[slDetailPanelTabs]` whose host directive is
`SlPageHeaderTabs`. **Change:** none named beyond §8's; the two bindings
reach their ecosystems' own points and neither was levelled down.

## 11. Documentation

Both pages answer the reference-page contract (`detail-panel.stories.test.ts`,
`detail-panel.stories.spec.ts`: import, anatomy, seventeen captioned
demonstrations with source, inputs with every default, outputs with the
request, composition, five accessibility decisions, tokens, the DOM
snippet). The React page was read rendered from a static build at 1280 in
nine slices (`dp/docs-{0..8}.png`) and audited at 1280 and 620 with
`tools/harness/audit.mjs` — 29 stages, no finding. Three corrections from
reading it: the rooms went from `laptop` (900, which scrolled sideways in the
676-pixel column) to `tablet` (640, the breakpoint itself); every scene took
`screen` height, because in a `tall` box the header was six tenths of the
scrollport and the pin hid itself; the order lines lost a column so the table
fits the main track. **Change:** the Angular page was not read rendered. The
Angular Storybook on 6007 answers nothing and its static build serves story
modules through `/@fs/`, for every family, so no Angular page renders from a
build; the spec compiles every demonstration's template and the reviewer's
dev server is the reading. Not made here: starting a Storybook is the
reviewer's, per the briefing.

## Section 18

1. **Purpose, uses, anti-uses.** One record's view — a sales order, a ticket,
   an invoice — in a page, a drawer or a pane. Not a form: the scope says the
   panel hosts no long edit flow, and `wizard` is where steps go.
2. **Anatomy.** `root`, `body`, `banner`, `columns`, `main`, `section`,
   `section-actions`, `aside`, `message`, `footer`; the header is
   `page-header` unwrapped as the root's first child.
3. **Controlled and uncontrolled.** `section` / `defaultSection` /
   `onSectionChange(value, request)` in React; `[(section)]` and
   `(sectionRequest)` in Angular. Reasons `pointer`, `keyboard` from the
   strip, `programmatic` from a link, the URL or `scrollToSection()`. The
   request carries `previous`, `source` and `cancel()`.
4. **State matrix.** `loading` × `status` × `layout`: loading keeps the frame
   under both layouts and both failures keep the chrome; `current` on one
   section under tabs (always one) or stacked (none or one).
5. **Keyboard, focus, ARIA.** In the contract's `keyboard` table and §6–7
   above; touch is the platform's on the strip and the controls.
6. **Recipes.** `size` sm/md/lg through tokens, `level` 1–3, `layout`,
   `aside`.
7. **Responsive, RTL, locale, reduced motion.** 640-pixel container query;
   logical properties throughout, mirrored in
   `detail-panel-stacked-light-comfortable-rtl-720.png`; strings in
   `messages`; motion on the scale.
8. **Loading, empty, error, extreme content.** `loading`, `not-found`,
   `error`, the `long` scene and the twelve-section scene.
9. **SSR, performance, virtualization.** No layout read during render; the
   tab wiring lands in one effect; `mount` keeps unseen tab content out of
   the tree. Virtualization is the content's — a `table` or a `timeline`
   inside a section.
10. **Examples.** Seventeen scenes per page, one product.
11. **Shared behavioural tests.** `detail-panel.test.tsx` and
    `detail-panel.spec.ts` assert the same fourteen behaviours by the same
    names.
12. **Changelog and stability.** New family; no break. `docs/process/build-order.md`
    carries the delivery paragraph.

## Decisions taken at this gate

- `scrollSpy` is deferred to `table-of-contents`, the name `anchor-nav`
  shipped under in this wave.
- The count is a badge after the label in both shapes, so the stacked
  heading and the tab read the same.
- The Angular reference page is handed over unread rendered, with the
  reason above; the reviewer's 6007 is the reading.
