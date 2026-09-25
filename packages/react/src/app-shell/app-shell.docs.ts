import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import appShellTokens from '@slotted/styles/app-shell/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_APP_SHELL_TOKENS = appShellTokens.map((name) => ({
  name,
  purpose: 'Theme-owned App Shell decision',
}));

const imports: ReferenceImport = {
  source: `import {
  AppShell,
  AppShellActions,
  AppShellAside,
  AppShellAsideBody,
  AppShellAsideFooter,
  AppShellAsideHeader,
  AppShellAsideToggle,
  AppShellBanner,
  AppShellBrand,
  AppShellCentre,
  AppShellDefaultsProvider,
  AppShellFooter,
  AppShellMain,
  AppShellNav,
  AppShellNavBody,
  AppShellNavFooter,
  AppShellNavHeader,
  AppShellNavToggle,
} from '@slotted/react';`,
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The frame: a grid of four rows and three columns, and the query container the whole family answers. Deliberately not a sectioning element — a main inside an article stops being a landmark, and the root has to be placeable anywhere without changing what the five regions mean. Carries data-ui="app-shell", every axis as a data-* attribute, and data-open for the navigation region.',
  },
  {
    part: 'skip',
    element: 'div holding one a per region',
    required: false,
    purpose:
      'The links that jump past the chrome, written from the regions that rendered and are open: a link to a region nobody rendered, or to a pane the reader closed, is a dead destination. First focusable thing in the document, out of the flow until it is focused. Not a landmark.',
  },
  {
    part: 'banner',
    element: 'header, or the element render returns',
    required: false,
    purpose:
      'The banner landmark, earned from the element rather than from a role. Three clusters: what starts the line, what grows, what ends it.',
  },
  {
    part: 'brand',
    element: 'div',
    required: false,
    purpose:
      'The start cluster: the toggle, the mark, the name of the application or of the workspace. Shortened to one line by default, so a name never pushes the frame wider than the space there is.',
  },
  {
    part: 'centre',
    element: 'div',
    required: false,
    purpose:
      'The middle of the bar, and the one cluster that grows: a search field, a breadcrumb trail, the route title, tabs. Without it a bar is two clusters and a void — which is what the first version of this page photographed.',
  },
  {
    part: 'actions',
    element: 'div',
    required: false,
    purpose:
      'The end cluster: notifications, help, account. A control in it keeps its width; what runs out of room is the middle.',
  },
  {
    part: 'nav-toggle',
    element: 'button, or the element render returns',
    required: false,
    purpose:
      'The disclosure control for the navigation region: aria-expanded, aria-controls and the family’s own label, all taken from the shell’s context rather than from where it stands. Draws the panel-open or panel-close Glyph element by state, mirrored by navSide and by direction.',
  },
  {
    part: 'nav',
    element: 'nav, or the element render returns',
    required: false,
    purpose:
      'The navigation landmark, and one element across all three modes: the rail is this nav at another inline size, which keeps the focus and the scroll position where the reader left them. A query container of its own, named slotted-app-shell-nav, so the rows inside answer the rail without the shell telling them anything.',
  },
  {
    part: 'nav-header',
    element: 'div',
    required: false,
    purpose:
      'The pinned top of the column: the workspace switcher, the mark. Under primary="nav" it takes the banner’s height, so the workspace and the bar sit on one line.',
  },
  {
    part: 'nav-body',
    element: 'div',
    required: false,
    purpose:
      'The middle, and the only part of the column that scrolls. Ant and Mantine let the list overflow the region, which takes the account control off the screen the moment an application has more destinations than height.',
  },
  {
    part: 'nav-footer',
    element: 'div',
    required: false,
    purpose: 'The pinned bottom: the account, the collapse control.',
  },
  {
    part: 'scrim',
    element: 'div',
    required: false,
    purpose:
      'The veil under an overlaid region, mounted only while a layer is modal. It stops where the layer stops — under the banner — so the reader keeps their bearings.',
  },
  {
    part: 'main',
    element: 'main with tabindex="-1", or the element render returns',
    required: true,
    purpose:
      'The main landmark and the skip link’s destination. Without the tabindex the link moves the scroll and leaves the focus behind, in Safari and in Firefox.',
  },
  {
    part: 'aside',
    element: 'aside, or the element render returns',
    required: false,
    purpose:
      'The complementary landmark, carrying the family’s own label. It opens and closes the way the navigation does — a column beside the content or a layer over it, by asideMode — and carries its own data-open, because the root’s is the navigation’s. Closed, it leaves the layout: a pane has no rail.',
  },
  {
    part: 'aside-header',
    element: 'div',
    required: false,
    purpose:
      'The pinned top of the pane: its title, which takes the room, and the control that closes it.',
  },
  {
    part: 'aside-body',
    element: 'div',
    required: false,
    purpose: 'The middle, and the only part of the pane that scrolls.',
  },
  {
    part: 'aside-footer',
    element: 'div',
    required: false,
    purpose:
      'The pinned bottom: the actions that close the task the pane holds, aligned to the end.',
  },
  {
    part: 'aside-toggle',
    element: 'button, or the element render returns',
    required: false,
    purpose:
      'The disclosure control for the pane, with the navigation control’s wiring: in the pane’s own header, in the banner’s actions, or anywhere else, and there is still exactly one control carrying the pane’s state. The same pair of marks, turned the other way.',
  },
  {
    part: 'footer',
    element: 'footer, or the element render returns',
    required: false,
    purpose:
      'The contentinfo landmark: the application’s footer, not the page’s action bar — that one is PageFooter, inside main.',
  },
  {
    part: 'layer',
    element: 'div with display: contents',
    required: true,
    purpose:
      'The application’s portal root, named once through setPortalContainer so every Dialog, Drawer, Menu and Toast under this shell lands here instead of on the body.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'Aurora Logística, a freight operator’s back office, whole: the search a coordinator reaches for first, the destinations with their counts, the order table with the consignment that has no price yet, and the detail pane with its own head, body and foot. Every axis is on the controls below — change navSide and the pane moves to the other side with it; close the pane and the content takes the room.',
    snippet: defineSnippet({
      id: 'app-shell-react-playground',
      language: 'tsx',
      label: 'The frame of a route',
      source: `<AppShell>
  <AppShellBanner>…</AppShellBanner>
  <AppShellNav>…</AppShellNav>
  <AppShellMain>…</AppShellMain>
  <AppShellAside>…</AppShellAside>
  <AppShellFooter>…</AppShellFooter>
</AppShell>;`,
    }),
  },
  {
    id: 'anatomy',
    title: 'The frame with nothing in it',
    note: 'Every part the contract declares, drawn as its own name. Everything else on this page is a product standing in these boxes; this is the family on its own — four rows, three columns, one gutter, the card the content stands on, three clusters in the bar, and a pane with a head, a body and a foot.',
    snippet: defineSnippet({
      id: 'app-shell-react-anatomy',
      language: 'tsx',
      label: 'Every part, once',
      source: `<AppShell>
  <AppShellBanner>
    <AppShellBrand>
      <AppShellNavToggle />
    </AppShellBrand>
    <AppShellCentre>…</AppShellCentre>
    <AppShellActions>…</AppShellActions>
  </AppShellBanner>
  <AppShellNav>
    <AppShellNavHeader>…</AppShellNavHeader>
    <AppShellNavBody>…</AppShellNavBody>
    <AppShellNavFooter>…</AppShellNavFooter>
  </AppShellNav>
  <AppShellMain>…</AppShellMain>
  <AppShellAside>
    <AppShellAsideHeader>
      …
      <AppShellAsideToggle />
    </AppShellAsideHeader>
    <AppShellAsideBody>…</AppShellAsideBody>
    <AppShellAsideFooter>…</AppShellAsideFooter>
  </AppShellAside>
  <AppShellFooter>…</AppShellFooter>
</AppShell>;`,
    }),
  },
  {
    id: 'regions',
    title: 'Five regions, five landmarks',
    note: 'Each region is the HTML element that already means what it is, so none of them writes a role: header is banner, nav is navigation, main is main, aside is complementary, footer is contentinfo. The root is a div precisely so that stays true — a main inside an article is not a landmark. Cadence has no pane and no footer, and the landmark list is then exactly three.',
    snippet: defineSnippet({
      id: 'app-shell-react-regions',
      language: 'tsx',
      label: 'The elements the landmarks come from',
      source: `<AppShell canvas="flush" primary="nav">
  <AppShellNav>…</AppShellNav>
  <AppShellBanner>…</AppShellBanner>
  <AppShellMain>…</AppShellMain>
</AppShell>;`,
    }),
  },
  {
    id: 'banner',
    title: 'Three clusters, and the one that grows',
    note: 'brand starts the line, centre takes whatever room is left, actions ends it. Aurora puts a search field with its shortcut in the middle; Cadence puts the route’s trail there and the route’s actions at the end; Átrio puts a title. What each holds is the product’s — a TextField, a Breadcrumb, an Avatar — and where it goes is the shell’s. Narrow the frame: the middle gives way first, and a control in actions keeps its width rather than breaking its label one letter per line.',
    snippet: defineSnippet({
      id: 'app-shell-react-banner',
      language: 'tsx',
      label: 'What starts the line, what grows, what ends it',
      source: `<AppShellBanner>
  <AppShellBrand>
    <AppShellNavToggle />
    <span>Aurora</span>
  </AppShellBrand>
  <AppShellCentre>
    <TextField
      placeholder="Procurar…"
      start={
        <Icon>
          <Search />
        </Icon>
      }
      type="search"
    />
  </AppShellCentre>
  <AppShellActions>
    <IconButton aria-label="Notificações">…</IconButton>
    <Avatar>AB</Avatar>
  </AppShellActions>
</AppShellBanner>;`,
    }),
  },
  {
    id: 'canvas',
    title: 'The plane the content sits on',
    note: 'inset paints the frame with the sunken ground and lifts the content and the pane onto cards with a radius, an edge and the gutter doing the separating. flush is what the field ships — regions on the surface, content on the ground, a hairline between them — and it is what a table that owns the whole column wants. The same product, on both planes.',
    snippet: defineSnippet({
      id: 'app-shell-react-canvas',
      language: 'tsx',
      label: 'Two planes, one frame',
      source: `<AppShell canvas="inset">…</AppShell>;
<AppShell canvas="flush">…</AppShell>;`,
    }),
  },
  {
    id: 'theming',
    title: 'Every region repaintable, one at a time',
    note: 'Cadence paints its column dark on a light frame with two declarations: data-slotted-scheme on the region, and one custom property for the ground. Written on the region rather than on the frame, the property resolves in the region’s scope, so the destinations, the counts and the focus ring are calibrated against the ground they are actually on. Switch the page to dark: the column stays the column, and the frame joins it.',
    snippet: defineSnippet({
      id: 'app-shell-react-theming',
      language: 'tsx',
      label: 'A dark column, in two declarations',
      source: `<AppShell canvas="flush" primary="nav">
  <AppShellNav className="cadence-nav" data-slotted-scheme="dark">
    …
  </AppShellNav>
</AppShell>;

/* .cadence-nav { --slotted-app-shell-nav-surface: var(--slotted-surface-sunken); } */`,
    }),
  },
  {
    id: 'navModes',
    title: 'Inline, overlaid, and the width that decides',
    note: 'inline makes the region a column; overlay takes it out of the grid and over the content with a veil, a focus scope and inert on everything behind it; auto answers the shell’s own inline size at 600 pixels — not the window’s, which is why the narrow frame here behaves like a phone inside a wide page. Press the toggle in the overlaid frame: Escape and a press outside both close it.',
    snippet: defineSnippet({
      id: 'app-shell-react-nav-modes',
      language: 'tsx',
      label: 'The three modes',
      source: `<AppShell navMode="inline">…</AppShell>;
<AppShell navMode="overlay">…</AppShell>;
<AppShell navMode="auto">…</AppShell>;`,
    }),
  },
  {
    id: 'rail',
    title: 'What a closed region leaves behind',
    note: 'rail keeps a strip one mark column wide with a row’s inset on each side: every destination stays reachable by its mark, the region stays in the tab order, and the column’s own query container is what tells the rows to drop their labels. hidden takes the region out of the layout and the tab order entirely. Under primary="nav" the control stands in the column’s own foot, over the column it moves, and survives the rail.',
    snippet: defineSnippet({
      id: 'app-shell-react-rail',
      language: 'tsx',
      label: 'The two answers to a closed region',
      source: `<AppShell collapsedTo="rail" defaultNavOpen={false}>
  …
</AppShell>;
<AppShell collapsedTo="hidden" defaultNavOpen={false}>
  …
</AppShell>;`,
    }),
  },
  {
    id: 'aside',
    title: 'The pane opens on a selection, and closes from its own head',
    note: 'The pane holds the second open state, under the same shape as the navigation’s: asideOpen, defaultAsideOpen, onAsideOpenChange with a reason. Select a row and the product opens the pane; press the control in the pane’s head, or Escape when it is a layer, and it closes — the content takes the room, because a closed pane leaves no rail. The skip link to the pane exists only while it is open.',
    snippet: defineSnippet({
      id: 'app-shell-react-aside',
      language: 'tsx',
      label: 'A pane the product opens and the reader closes',
      source: `const [selected, setSelected] = useState<string | undefined>();

<AppShell
  asideOpen={selected !== undefined}
  onAsideOpenChange={(open) => {
    if (!open) setSelected(undefined);
  }}
>
  <AppShellMain>
    <Shipments onSelect={setSelected} selected={selected} />
  </AppShellMain>
  <AppShellAside>
    <AppShellAsideHeader>
      <span>{selected}</span>
      <AppShellAsideToggle />
    </AppShellAsideHeader>
    <AppShellAsideBody>…</AppShellAsideBody>
    <AppShellAsideFooter>…</AppShellAsideFooter>
  </AppShellAside>
</AppShell>;`,
    }),
  },
  {
    id: 'overlay',
    title: 'The layer, and what it does to the rest',
    note: 'Átrio overlays its navigation at every width. While the layer is modal, the rest of the shell is inert — the banner and its toggle included, exactly as a dialog’s trigger is — and the ways out are Escape, the veil, a destination, and whatever control the product put in the panel. The pane is a layer of its own under the same policies: escape="none" keeps it open on Escape, outsidePress="none" keeps it open on a press outside, modal={false} draws no veil and inerts nothing.',
    snippet: defineSnippet({
      id: 'app-shell-react-overlay',
      language: 'tsx',
      label: 'The policies a layer answers',
      source: `<AppShell navMode="overlay" escape="close" outsidePress="close" modal>
  …
</AppShell>;
<AppShell asideMode="overlay" escape="none" outsidePress="none" modal={false}>
  …
</AppShell>;`,
    }),
  },
  {
    id: 'primary',
    title: 'Which region reaches the corner',
    note: 'banner spans the full width and the navigation starts below it, which is Aurora. nav spans the full height and the banner starts beside it, which is Cadence: the workspace and the bar sit on one line, and the control that moves the column stands in the column’s own head. The grid changes where a region is drawn and never where it is written, so the focus order is the same under both.',
    snippet: defineSnippet({
      id: 'app-shell-react-primary',
      language: 'tsx',
      label: 'Two arrangements, one focus order',
      source: `<AppShell primary="banner">…</AppShell>;
<AppShell primary="nav">…</AppShell>;`,
    }),
  },
  {
    id: 'sides',
    title: 'Sides, sizes and the mirror',
    note: 'Átrio puts the navigation at the end of the line and the pane at the start; the controls turn their marks with them. Switch the direction to right-to-left and the whole frame mirrors, because every distance is logical. navSize and asideSize are steps on the family’s own scale — a theme retunes a step, and nothing retunes a pixel string.',
    snippet: defineSnippet({
      id: 'app-shell-react-sides',
      language: 'tsx',
      label: 'The region at the other end of the line',
      source: `<AppShell navSide="end" navSize="sm" asideSize="sm">
  …
</AppShell>;`,
    }),
  },
  {
    id: 'scroll',
    title: 'Who scrolls',
    note: 'content, the default, makes the shell the height it was given — capped at 100dvh, which is the space a mobile browser actually has — and lets only the content column and the pane’s body scroll, so the banner, the column and the pane’s head and foot stay put. document lets the shell grow and the whole document scroll, and the banner travels with it; a page-header inside then owns the sticky offset on its own.',
    snippet: defineSnippet({
      id: 'app-shell-react-scroll',
      language: 'tsx',
      label: 'The height the shell takes',
      source: `<AppShell scroll="content">…</AppShell>;
<AppShell scroll="document">…</AppShell>;`,
    }),
  },
  {
    id: 'skipLinks',
    title: 'The first thing a keyboard meets',
    note: 'Press Tab from the top of the frame: a link to the content appears, then one to the navigation, then one to the pane — one per region that rendered and is open, out of the flow until focused. The content region carries tabindex="-1", so the link moves the focus as well as the scroll.',
    snippet: defineSnippet({
      id: 'app-shell-react-skip',
      language: 'tsx',
      label: 'Written from the regions that exist',
      source: `<AppShell messages={{ skipToMain: 'Pular para o conteúdo' }}>
  <AppShellMain>…</AppShellMain>
</AppShell>;`,
    }),
  },
  {
    id: 'persistence',
    title: 'Telling the reader’s choice from the layout’s',
    note: 'Every request carries a reason. pointer and keyboard are the reader’s own choice; resize is the layout closing the region because the shell became narrow; select is a destination; escape and outsidePress are the layer. A product that persists the reader’s preference writes one line — if the reason is not resize, persist — and keeps the wide preference through every narrow window the reader ever opens. Narrow the frame and read the log.',
    snippet: defineSnippet({
      id: 'app-shell-react-persistence',
      language: 'tsx',
      label: 'Persisting the press and ignoring the resize',
      source: `<AppShell
  navOpen={open}
  onNavOpenChange={(next, request) => {
    setOpen(next);
    if (request.reason !== 'resize') localStorage.setItem('nav', String(next));
  }}
>
  …
</AppShell>;`,
    }),
  },
  {
    id: 'defaults',
    title: 'Setting it once, and reaching past it',
    note: 'AppShellDefaultsProvider takes every axis and the strings, so an application decides once how its routes are framed and a shell that states any of them itself still wins. ref gives an AppShellHandle rather than a DOM node: openNav, closeNav, openAside, closeAside and focusMain are the actions a prop cannot express. render makes the root the consumer’s own element and keeps every attribute on it.',
    snippet: defineSnippet({
      id: 'app-shell-react-defaults',
      language: 'tsx',
      label: 'Fourteen decisions, taken once',
      source: `<AppShellDefaultsProvider canvas="flush" navSize="lg" primary="nav">
  <AppShell>…</AppShell>
</AppShellDefaultsProvider>;

const shell = useRef<AppShellHandle>(null);
shell.current?.closeAside();`,
    }),
  },
  {
    id: 'composition',
    title: 'The families that live inside it',
    note: 'The shell owns where a region is drawn and nothing about what is in it. Page with landmark="none" and scroll="ancestor" lives in the content region, so its header sticks at the top of the column the shell scrolls; a Drawer opened from the page lands in the shell’s own layer, over the content and under nothing; Dialog, Menu and Toast do the same. Long translated labels truncate in the column rather than pushing the frame wider.',
    snippet: defineSnippet({
      id: 'app-shell-react-composition',
      language: 'tsx',
      label: 'A page inside the content region',
      source: `<AppShellMain>
  <Page landmark="none" scroll="ancestor" width="full">
    <PageHeader>…</PageHeader>
    <PageBody>…</PageBody>
  </Page>
</AppShellMain>;`,
    }),
  },
  {
    id: 'accessibility',
    title: 'The landmarks and the keyboard',
    note: 'Walk the landmark list of this frame: banner, navigation, main, complementary, contentinfo, one of each and none of them written as a role. Then Tab through it: skip link, banner, toggle, navigation, content, pane, the pane’s control, footer — the DOM order, and it does not move when primary does. Enter and Space work both controls, which is the whole of the Disclosure pattern’s keyboard; the control takes its wiring from the shell, so it stands wherever the product wants it.',
    snippet: defineSnippet({
      id: 'app-shell-react-accessibility',
      language: 'tsx',
      label: 'The name the region carries',
      source: `<AppShellNav aria-label="Navegação principal">…</AppShellNav>;
<AppShellAside aria-label="Detalhe da encomenda">…</AppShellAside>;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onNavOpenChange',
    payload: '(open: boolean, request: AppShellOpenRequest)',
    when: 'Before the navigation region moves, and never for a value equal to the current one. The request carries value, previous, reason, the originating event as source, and cancel() — call it and nothing commits, in either mode.',
  },
  {
    name: 'onAsideOpenChange',
    payload: '(open: boolean, request: AppShellAsideOpenRequest)',
    when: 'Before the secondary pane moves, with the same shape. The reasons a pane can carry are pointer, keyboard, escape, outsidePress, resize and programmatic — no select, because a pane has no destinations.',
  },
];

export const REACT_APP_SHELL_DOCS = {
  appShell: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'navOpen',
        'boolean',
        '—',
        'AppShell',
        'The controlled value of the navigation region. Passing anything but undefined puts the shell in controlled mode for its lifetime, and it then reports and waits rather than moving itself',
      ],
      [
        'defaultNavOpen',
        'boolean',
        'true',
        'AppShell',
        'The uncontrolled starting value, read once. A later change to it does not silently become new state',
      ],
      [
        'asideOpen',
        'boolean',
        '—',
        'AppShell',
        'The controlled value of the secondary pane, under the same rule. A product that opens the pane on a selection passes the selection down as this',
      ],
      [
        'defaultAsideOpen',
        'boolean',
        'true',
        'AppShell',
        'The uncontrolled starting value of the pane. A product that projects a pane wants to see it, so the default is open',
      ],
      [
        'primary',
        "'banner' | 'nav'",
        'banner',
        'AppShell, AppShellDefaultsProvider',
        'Which region reaches the corner. Under nav the navigation spans every row and its head takes the banner’s height so the two marks sit on one line',
      ],
      [
        'canvas',
        "'inset' | 'flush'",
        'inset',
        'AppShell, AppShellDefaultsProvider',
        'inset paints the frame with the sunken ground and makes the content and the pane raised cards; flush is edge to edge with a rule between the regions',
      ],
      [
        'navMode',
        "'inline' | 'overlay' | 'auto'",
        'auto',
        'AppShell, AppShellDefaultsProvider',
        'How the region occupies space. auto is inline at or above 600 pixels of the shell’s own inline size and overlay below it, answered in CSS for the layout and in script for the keyboard',
      ],
      [
        'asideMode',
        "'inline' | 'overlay' | 'auto'",
        'auto',
        'AppShell, AppShellDefaultsProvider',
        'How the pane occupies space: the navigation’s pair, resolved on the same width. inline is a column beside the content, or a row under it when there is no room; overlay is a layer from the end the navigation is not on',
      ],
      [
        'navSide',
        "'start' | 'end'",
        'start',
        'AppShell, AppShellDefaultsProvider',
        'Which end of the line the region sits at. Logical, so a right-to-left document mirrors the whole frame; the pane sits at the other end, and both controls turn their marks',
      ],
      [
        'navSize',
        "'sm' | 'md' | 'lg'",
        'md',
        'AppShell, AppShellDefaultsProvider',
        'The width of the open region, as a step on the family’s own scale. A theme retunes the step; nothing retunes a pixel string',
      ],
      [
        'asideSize',
        "'sm' | 'md' | 'lg'",
        'md',
        'AppShell, AppShellDefaultsProvider',
        'The width of the secondary pane, on the same kind of scale',
      ],
      [
        'collapsedTo',
        "'rail' | 'hidden'",
        'rail',
        'AppShell, AppShellDefaultsProvider',
        'What a closed inline navigation leaves behind. rail keeps a strip the width of a target and keeps the tab order; hidden takes the region out of both. A closed pane always leaves nothing: it has no marks to keep',
      ],
      [
        'scroll',
        "'content' | 'document'",
        'content',
        'AppShell, AppShellDefaultsProvider',
        'content makes the shell the height it was given, capped at 100dvh, and only the content column and the pane’s body scroll; document lets the shell grow and the banner travel with it',
      ],
      [
        'dividers',
        'boolean',
        'true',
        'AppShell, AppShellDefaultsProvider',
        'Whether flush draws a rule between the regions, and between the pane’s head, body and foot. Under inset the gutter separates them and no rule is drawn either way',
      ],
      [
        'modal',
        'boolean',
        'true',
        'AppShell, AppShellDefaultsProvider',
        'Whether an overlaid region contains focus and makes every other region inert. Only the overlaid modes read it, and it applies to whichever layer is open',
      ],
      [
        'escape',
        "'close' | 'none'",
        'close',
        'AppShell, AppShellDefaultsProvider',
        'Whether Escape closes an overlaid region. Registered in the capture phase by @slotted/core/dismissable-layer, so a handler inside the panel runs after the layer has already asked',
      ],
      [
        'outsidePress',
        "'close' | 'none'",
        'close',
        'AppShell, AppShellDefaultsProvider',
        'Whether a press outside an overlaid panel closes it',
      ],
      [
        'back',
        "'close' | 'none'",
        'close',
        'AppShell, AppShellDefaultsProvider',
        "The platform's way back — a phone's gesture, a browser's button — closes the layer instead of leaving the page, while it is modal: @slotted/core/dismissable-layer holds one history entry per modal layer and answers the popstate that leaves it with the reason back",
      ],
      [
        'closeOnNavigate',
        'boolean',
        'true',
        'AppShell, AppShellDefaultsProvider',
        'Whether a click on an a[href] inside the overlaid navigation closes it, with the reason select — a router’s preventDefault included, an aria-disabled link excluded. Without it a phone costs two taps per destination',
      ],
      [
        'messages',
        '{ nav, open, close, aside, openAside, closeAside, skipToMain, skipToNav, skipToAside }',
        '—',
        'AppShell, AppShellDefaultsProvider',
        'The nine strings the family says: the two regions’ accessible names, the two controls’ labels in each state, and the three skip links. An aria-label written on the part itself still wins',
      ],
    ]),
    composition: apiRows([
      [
        'children',
        'anything',
        '—',
        'every region',
        'The family owns where a region is drawn, its landmark, its width and its state, and nothing about what is in it. The bar’s three clusters, the column’s three ends, the content, the pane’s three parts and the footer each take whatever an application puts there — its own search, its own account, another family, its own markup',
      ],
      [
        'published geometry',
        '--slotted-app-shell-row-*',
        '—',
        'anything inside a region',
        'Six numbers the shell publishes for the rows a product brings: row-inset, row-mark, row-gap, row-height, row-font-size and row-line-height. Every row on this page reads them and states nothing of its own, which is what keeps a destination’s mark under the control in the bar',
      ],
      [
        'custom properties',
        '--slotted-app-shell-*',
        '—',
        'the frame or any region',
        'A ground and an ink per region, plus every measure the frame stands on. Each region reads the public name and falls back to the plane’s default, so a property written on the region resolves in the region’s own scope. The full list is under Theme-owned decisions below',
      ],
      [
        'data-part selectors',
        '[data-ui="app-shell"] [data-part="…"]',
        '—',
        'every part',
        'Anything the properties do not reach is one selector away. [data-ui="app-shell"][data-open] is the navigation; [data-part="aside"][data-open] is the pane',
      ],
      [
        'render',
        '(props) => ReactNode',
        '—',
        'every part',
        'Substitutes the rendered element and hands it every attribute, listener and data-* the part had. The skip links, the veil and the portal root are the shell’s own and are not substitutable',
      ],
      [
        'ref',
        'Ref<AppShellHandle> on AppShell, Ref<HTMLElement> on every part',
        '—',
        'AppShell and its parts',
        'The root exposes a handle — openNav(), closeNav(), openAside(), closeAside(), focusMain() and root — because those are the actions a consumer cannot express declaratively; every part exposes its own element',
      ],
      [
        'useAppShell()',
        '() => AppShellContextValue',
        '—',
        'inside AppShell',
        'What a part reads: open, asideOpen, the resolved modes, every axis, the ids, the messages, setOpen(next, reason) and setAsideOpen(next, reason). Throws outside a shell rather than rendering a div that navigates nothing',
      ],
      [
        'AppShellDefaultsProvider',
        '{ …fourteen axes, messages }',
        '—',
        'a subtree',
        'What an application decides once for every route. A shell that states any of them itself still wins',
      ],
      [
        'AppShellNavToggle and AppShellAsideToggle anywhere',
        'take their wiring from context',
        '—',
        'inside AppShell',
        'id, aria-expanded, aria-controls, the label and the handler come from the shell, so each control can stand in the banner, in its region’s own head or foot, or anywhere else — and there is still exactly one control carrying each state. Where it goes is written on this page under Rail',
      ],
      [
        'setPortalContainer',
        'the layer part, named once',
        '—',
        'every overlay under the shell',
        'Dialog, Drawer, Menu, Popover, Tooltip and Toast land in the shell’s own layer instead of on the body, which is what keeps an application’s overlays inside the application’s stacking context',
      ],
      [
        'onClick, onKeyDown, …',
        'composed, never replaced',
        '—',
        'every part',
        'A consumer’s own handler runs first; the family acts afterwards and only if the event was not prevented',
      ],
    ]),
    accessibility: [
      'The structure is the WAI-ARIA APG’s Landmark Regions (w3.org/WAI/ARIA/apg/practices/landmark-regions/), and every one of the five is earned from the element rather than written as a role: header in the context of the body is banner, nav is navigation, main is main, aside is complementary, footer is contentinfo. The root is a div for exactly that reason — a main inside a sectioning element stops being a landmark, and the shell has to be placeable anywhere.',
      'Both controls are the APG’s Disclosure pattern (w3.org/WAI/ARIA/apg/patterns/disclosure/): real buttons, so Enter and Space activate them natively, carrying aria-expanded and aria-controls pointing at their region. One departure is written and costed: under collapsedTo="rail" the navigation does not disappear, it narrows — aria-expanded is still true or false about the region’s full form, and the region stays in the tab order because a rail whose destinations cannot be reached is not a rail. The pane has no such departure: closed, it leaves the layout and the tab order.',
      'A document with more than one navigation or complementary landmark needs a unique label on each, so both regions carry the family’s strings and a consumer may replace either per instance. Each control’s own name changes with the state — “Abrir navegação” and “Fechar navegação”, “Abrir painel lateral” and “Fechar painel lateral” — because a control whose name never changes leaves the reader to infer the state from aria-expanded alone.',
      'The skip links are written from the regions that rendered and are open, so no link ever points at a target nobody built or the reader closed, and main carries tabindex="-1": without it the browser moves the scroll and leaves the focus behind in Safari and Firefox, which is a link that appears to work and moves nothing a screen reader follows.',
      'While an overlaid region is modal, @slotted/core/focus contains the keyboard inside it and returns it to the control that opened it on close, and every region beside it — the banner included — takes inert, so Tab cannot reach them and a screen reader does not read them. The ways out are Escape, the veil, a destination, and whatever control the product put in the panel. Two layers can be open together only with both modes forced, and @slotted/core/dismissable-layer keeps one stack, so Escape reaches the topmost.',
      'Nothing important depends on hover, the frame answers its own inline size rather than the window’s — which is what makes a 400% zoom behave like a narrow window — and every transition comes from the motion scale, so prefers-reduced-motion collapses all of them at once.',
    ],
    snippets: [
      defineSnippet({
        id: 'app-shell-react-dom',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div
  data-ui="app-shell"
  data-part="root"
  data-primary="banner"
  data-canvas="inset"
  data-nav-mode="inline"
  data-aside-mode="inline"
  data-nav-side="start"
  data-nav-size="md"
  data-aside-size="md"
  data-collapsed-to="rail"
  data-scroll="content"
  data-dividers
  data-open
>
  <div data-part="skip">
    <a href="#…-main">Saltar para o conteúdo</a>
  </div>
  <header data-part="banner">
    <div data-part="brand">
      <button data-part="nav-toggle" aria-expanded="true" aria-controls="…-nav" />
    </div>
    <div data-part="centre">…</div>
    <div data-part="actions">…</div>
  </header>
  <nav data-part="nav" id="…-nav" aria-label="Navegação principal">
    <div data-part="nav-header">…</div>
    <div data-part="nav-body">…</div>
    <div data-part="nav-footer">…</div>
  </nav>
  <main data-part="main" id="…-main" tabIndex={-1}>
    …
  </main>
  <aside data-part="aside" id="…-aside" aria-label="Painel lateral" data-open>
    <div data-part="aside-header">
      …
      <button data-part="aside-toggle" aria-expanded="true" aria-controls="…-aside" />
    </div>
    <div data-part="aside-body">…</div>
    <div data-part="aside-footer">…</div>
  </aside>
  <footer data-part="footer">…</footer>
  <div data-part="layer" />
</div>;`,
      }),
      defineSnippet({
        id: 'app-shell-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `/* Every measure the frame stands on. */
[data-ui='app-shell'] {
  --slotted-app-shell-gutter: var(--slotted-space-6);
  --slotted-app-shell-row-inset-size: var(--slotted-space-4);
  --slotted-app-shell-row-mark-size: var(--slotted-control-height-md);
  --slotted-app-shell-row-text-size: var(--slotted-font-size-sm);
  --slotted-app-shell-row-text-line-height: var(--slotted-line-height-sm);
  --slotted-app-shell-rail-size: 3rem;
  --slotted-app-shell-nav-size-sm: 13rem;
  --slotted-app-shell-nav-size-md: 16rem;
  --slotted-app-shell-nav-overlay-size: 22rem;
  --slotted-app-shell-nav-size-lg: 18rem;
  --slotted-app-shell-aside-size-sm: 16rem;
  --slotted-app-shell-aside-size-md: 20rem;
  --slotted-app-shell-aside-size-lg: 26rem;
  --slotted-app-shell-banner-block-size: 3.5rem;
  --slotted-app-shell-radius: var(--slotted-radius-md);
  --slotted-app-shell-elevation: var(--slotted-shadow-sm);
  --slotted-app-shell-border-color: var(--slotted-border-subtle);
}

/* The six the shell publishes, for the rows a product brings. Read them; do
   not restate them. */
.my-nav-item {
  min-block-size: var(--slotted-app-shell-row-height);
  padding-inline: var(--slotted-app-shell-row-inset);
  gap: var(--slotted-app-shell-row-gap);
  font-size: var(--slotted-app-shell-row-font-size);
  line-height: var(--slotted-app-shell-row-line-height);
}
.my-nav-item > .mark {
  inline-size: var(--slotted-app-shell-row-mark);
}

/* Every ground and every ink, region by region. Each falls back to the plane's
   own default, so state only the ones that differ. */
[data-ui='app-shell'] {
  --slotted-app-shell-frame: var(--slotted-surface-sunken);
  --slotted-app-shell-canvas: var(--slotted-surface);
  --slotted-app-shell-color: var(--slotted-text);
  --slotted-app-shell-scrim: var(--slotted-scrim);
  --slotted-app-shell-banner-surface: var(--slotted-surface);
  --slotted-app-shell-banner-color: var(--slotted-text);
  --slotted-app-shell-nav-surface: transparent;
  --slotted-app-shell-nav-color: var(--slotted-text);
  --slotted-app-shell-main-surface: var(--slotted-surface);
  --slotted-app-shell-main-color: var(--slotted-text);
  --slotted-app-shell-aside-surface: var(--slotted-surface);
  --slotted-app-shell-aside-color: var(--slotted-text);
  --slotted-app-shell-footer-surface: transparent;
  --slotted-app-shell-footer-color: var(--slotted-text-muted);
  /* The bar of the two scrolling bodies: thumb and track. */
  --slotted-app-shell-scrollbar-thumb-color: var(--slotted-border-strong);
  --slotted-app-shell-scrollbar-track-color: transparent;
}

/* A dark column on a light frame. The property is written on the region, so it
   resolves in the region's own scope: data-slotted-scheme restates every tone
   inside the column, and the ground is then that scheme's surface rather than
   one colour borrowed from the page it left. */
[data-ui='app-shell'] > [data-part='nav'] {
  --slotted-app-shell-nav-surface: var(--slotted-surface-sunken);
}

/* What the bar holds is shortened to one line by default. */
[data-ui='app-shell'] {
  --slotted-app-shell-brand-wrap: normal;
  --slotted-app-shell-brand-overflow: visible;
}`,
      }),
    ],
  },
} as const;
