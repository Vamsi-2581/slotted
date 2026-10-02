import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import drawerTokens from '@slotted/styles/drawer/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_DRAWER_TOKENS = drawerTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Drawer decision',
}));

const imports: ReferenceImport = {
  source:
    "import { Drawer, DrawerBody, DrawerClose, DrawerDefaultsProvider, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPanel, DrawerResizer, DrawerTitle, DrawerTrigger } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, in a portal under mode="overlay"',
    required: true,
    purpose:
      'The layer under mode="overlay" — fixed to the viewport, carrying data-ui="drawer", every axis, data-open, data-loading, data-dragging, and a z-index that is --slotted-z-index-overlay plus the depth dismissable-layer writes. Under mode="inline" it is a box in the consumer’s own layout, and its own measure is what opens and closes.',
  },
  {
    part: 'trigger',
    element: 'button, or the element render returns',
    required: false,
    purpose:
      'The control that opens it, rendered where it is written rather than in the portal. It carries aria-expanded and aria-controls in both modes and aria-haspopup only under overlay, because an inline drawer is a disclosure rather than a popup. It is also an overlay layer’s branch — a press on it is inside the layer, or opening would be read as a press outside and close what it just opened.',
  },
  {
    part: 'backdrop',
    element: 'div',
    required: false,
    purpose:
      'The scrim, painted from --slotted-scrim. It exists only under mode="overlay" with modal, because a drawer that puts nothing out of reach has nothing to dim. One of the two things placed in the layer’s single grid cell.',
  },
  {
    part: 'panel',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The surface, in the same cell, aligned to the side. role="dialog" and aria-modal under overlay; no role at all under inline, because a navigation drawer is a navigation landmark and a filter panel is complementary. It is a three-row grid — auto, minmax(0, 1fr), auto — which is what keeps the actions on screen when the body is long.',
  },
  {
    part: 'resizer',
    element: 'div with role="separator"',
    required: false,
    purpose:
      'The edge the reader moves. Rendering it is the resize capability — there is no resizable prop — and it answers the Window Splitter pattern: aria-valuenow, aria-valuemin and aria-valuemax as percentages, aria-orientation, aria-controls the panel and aria-labelledby the title. It is a four-pixel gutter whose pointer reach is --slotted-target-min, invisible at rest and a two-pixel line under the hand, and it is a row of the panel’s grid on a block side and an overlay on the inner edge on an inline one.',
  },
  {
    part: 'line',
    element: 'span',
    required: true,
    purpose:
      'A hairline each side of the grip on an inline side, fading to transparent away from it and running the whole gutter under the hand. Not painted on a sheet, where the grip is the whole picture.',
  },
  {
    part: 'grip',
    element: 'span[aria-hidden]',
    required: true,
    purpose:
      'The mark a hand aims at: a dot matrix on an inline side, a pill above the header on a sheet. Hidden from the accessibility tree, because the separator around it is already named and already valued.',
  },
  {
    part: 'header',
    element: 'header, or the element render returns',
    required: false,
    purpose:
      'Two columns: the words and the close button. The button keeps a column of its own, so a title that wraps grows the row instead of pushing it off the line.',
  },
  {
    part: 'title',
    element: 'h2, or the element render returns',
    required: false,
    purpose:
      'The visible name. aria-labelledby points at it from the panel and from the separator, and only when it is actually rendered — a reference to an id nothing carries is worse than no accessible name at all.',
  },
  {
    part: 'description',
    element: 'p, or the element render returns',
    required: false,
    purpose:
      'The sentence that says what the drawer is about. aria-describedby points at it when it is rendered.',
  },
  {
    part: 'body',
    element: 'div, or the element render returns',
    required: false,
    purpose:
      'The one row that scrolls, and the row aria-busy belongs to while the content is still on its way. overscroll-behavior keeps a wheel that reaches its end from scrolling the page behind a non-modal drawer. inset="none" drops its padding for content that brings its own inset — a page, a list on the panel’s edges.',
  },
  {
    part: 'footer',
    element: 'footer, or the element render returns',
    required: false,
    purpose:
      'The actions. A wrapping row aligned to the end, on the sunken surface, with a rule above it — every rule in the panel belongs to the row below it, so a panel with no body draws one line rather than two.',
  },
  {
    part: 'close',
    element: 'button',
    required: false,
    purpose:
      'The ✕. An icon-only control the size of a medium control rather than of its mark, so the target clears the WCAG minimum in both axes. It closes with reason dismiss and carries whatever value it names as the result.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'A drawer opened inside the scene rather than over the page. Press the trigger, then Tab: focus is contained, Escape closes, and focus returns to the button it came from.',
    snippet: defineSnippet({
      id: 'drawer-react-playground',
      language: 'tsx',
      label: 'A trigger, a panel and the actions',
      source: `<Drawer>
  <DrawerTrigger>Abrir detalhes</DrawerTrigger>
  <DrawerPanel>
    <DrawerHeader>
      <DrawerTitle>Fatura 4471</DrawerTitle>
      <DrawerDescription>Emitida em 12 de agosto.</DrawerDescription>
      <DrawerClose />
    </DrawerHeader>
    <DrawerBody>
      <TextField label="Observação" />
    </DrawerBody>
    <DrawerFooter>
      <Button variant="ghost" tone="secondary">
        Cancelar
      </Button>
      <Button>Salvar</Button>
    </DrawerFooter>
  </DrawerPanel>
</Drawer>;`,
    }),
  },
  {
    id: 'mode',
    title: 'A layer over the page, or a panel beside it',
    note: 'One axis rather than two components, because an application binds it to its own breakpoint: swapping one element for another there would take the panel’s scroll position, its focus and every uncontrolled field with it.',
    snippet: defineSnippet({
      id: 'drawer-react-mode',
      language: 'tsx',
      label: 'The two lines that make it responsive',
      source: `const wide = useMediaQuery('(min-width: 60rem)');

<div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)' }}>
  <Drawer mode={wide ? 'inline' : 'overlay'} open={open} side="start">
    <DrawerPanel render={(props) => <nav {...props} aria-label="Seções" />}>…</DrawerPanel>
  </Drawer>
  <main>…</main>
</div>;`,
    }),
  },
  {
    id: 'side',
    title: 'Which edge it comes from',
    note: 'start and end rather than left and right, so the whole layout mirrors in a right-to-left document with no second stylesheet. Only the exit slide is physical, and it takes one rule per inline side.',
    snippet: defineSnippet({
      id: 'drawer-react-side',
      language: 'tsx',
      label: 'Four edges, two of them logical',
      source: `<Drawer side="bottom">
  <DrawerTrigger>Filtrar</DrawerTrigger>
  <DrawerPanel>…</DrawerPanel>
</Drawer>;`,
    }),
  },
  {
    id: 'size',
    title: 'How much room the panel takes',
    note: 'Five named steps rather than a pixel string, because a theme can retune a step and cannot retune width: 400px. A drawer wider than the layer is clamped to it, which is what makes a side drawer full-bleed on a phone.',
    snippet: defineSnippet({
      id: 'drawer-react-size',
      language: 'tsx',
      label: 'A step, or an exact measure',
      source: `<Drawer size="lg">…</Drawer>;

// An exact measure is the token the steps resolve into.
<Drawer style={{ '--slotted-drawer-extent': '27rem' }}>…</Drawer>;`,
    }),
  },
  {
    id: 'resize',
    title: 'An edge the reader can move — with a keyboard',
    note: 'Rendering the separator is the capability; there is no resizable prop. Arrow keys move it sixteen pixels at a time and sixty-four with Shift, Home and End reach the limits, Enter collapses and restores, and a double click puts the panel back on the measure its size step gives it — which is the Window Splitter pattern, and which no surveyed drawer answers.',
    snippet: defineSnippet({
      id: 'drawer-react-resize',
      language: 'tsx',
      label: 'The part is the capability',
      source: `<Drawer defaultExtent={0.32} minExtent={0.2} side="start">
  <DrawerPanel>
    <DrawerHeader>
      <DrawerTitle>Coleções</DrawerTitle>
    </DrawerHeader>
    <DrawerBody>…</DrawerBody>
    <DrawerResizer />
  </DrawerPanel>
</Drawer>;`,
    }),
  },
  {
    id: 'snapPoints',
    title: 'Stops the sheet lands on',
    note: 'A snap point is a stop of the same separator, so the arrows that move it move between them — which is the condition the guide puts on shipping snap points at all. A drag released below the first stop asks to close.',
    snippet: defineSnippet({
      id: 'drawer-react-snap-points',
      language: 'tsx',
      label: 'Three heights, all reachable by keyboard',
      source: `<Drawer side="bottom" snapPoints={[0.3, 0.6, 0.95]} defaultExtent={0.3}>
  <DrawerPanel>
    <DrawerResizer />
    <DrawerBody>…</DrawerBody>
  </DrawerPanel>
</Drawer>;`,
    }),
  },
  {
    id: 'sheet',
    title: 'A bottom sheet as a phone draws one',
    note: 'The sheet measures what it holds — the default size on top and bottom — stops at forty rems on a wide layer, and moves under a touch anywhere on its body. A downward drag with the list at its top moves the sheet; an upward one grows it to the next stop — the height of its content among them — before the list scrolls; a fling faster than 500 px/s goes to the next stop or closes. A tap on the grabber walks the stops.',
    snippet: defineSnippet({
      id: 'drawer-react-sheet',
      language: 'tsx',
      label: 'Half the layer, and the height of the content as the second stop',
      source: `<Drawer side="bottom" snapPoints={[0.5]} defaultExtent={0.5}>
  <DrawerTrigger>Filtros</DrawerTrigger>
  <DrawerPanel>
    <DrawerResizer />
    <DrawerHeader>
      <DrawerTitle>Filtrar faturas</DrawerTitle>
      <DrawerClose />
    </DrawerHeader>
    <DrawerBody>…</DrawerBody>
  </DrawerPanel>
</Drawer>;`,
    }),
  },
  {
    id: 'scrimFrom',
    title: 'A sheet over a page that stays in use',
    note: 'Below scrimFrom the scrim is not painted and a press reaches the page — the sheet over a map. It is written beside modal={false} and outsidePress="none", because an undimmed page that stayed inert would promise something it does not do. Drag the sheet past sixty per cent and the scrim fades in.',
    snippet: defineSnippet({
      id: 'drawer-react-scrim-from',
      language: 'tsx',
      label: 'Undimmed up to the middle stop',
      source: `<Drawer
  side="bottom"
  snapPoints={[0.25, 0.6, 0.95]}
  defaultExtent={0.25}
  scrimFrom={0.6}
  modal={false}
  outsidePress="none"
>
  …
</Drawer>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'A sheet above the virtual keyboard',
    note: 'On a phone the keyboard shrinks the visual viewport and leaves fixed layers under the keys. The open layer reads what the keyboard covers and recedes by it, so the sheet — and its footer — land above the keys. The button beside the scene writes the same property the binding writes, 260 pixels, to show it on a screen without one.',
    snippet: defineSnippet({
      id: 'drawer-react-keyboard',
      language: 'tsx',
      label: 'Nothing to write: the layer does it',
      source: `<Drawer side="bottom">
  <DrawerPanel>
    <DrawerHeader>
      <DrawerTitle>Enviar lembrete</DrawerTitle>
    </DrawerHeader>
    <DrawerBody>
      <TextField aria-label="Nota para o cliente" />
    </DrawerBody>
    <DrawerFooter>…</DrawerFooter>
  </DrawerPanel>
</Drawer>;`,
    }),
  },
  {
    id: 'modal',
    title: 'A drawer the page behind can still be used',
    note: 'modal={false} writes no aria-modal, makes nothing inert, locks no scroll and contains no focus. The APG warns that marking a container modal without doing all four is worse for a screen-reader reader than not marking it at all.',
    snippet: defineSnippet({
      id: 'drawer-react-modal',
      language: 'tsx',
      label: 'Non-modal, and honest about it',
      source: `<Drawer modal={false}>
  <DrawerTrigger>Detalhes do pedido</DrawerTrigger>
  <DrawerPanel>…</DrawerPanel>
</Drawer>;`,
    }),
  },
  {
    id: 'policy',
    title: 'Refusing a close, and refusing it once',
    note: 'Five ways to close and one request. A guard on onOpenChange covers Escape, an outside press, the close button, the trigger and the imperative handle together; Angular Material’s disableClose refuses two of them and Ant needs two booleans for one.',
    snippet: defineSnippet({
      id: 'drawer-react-policy',
      language: 'tsx',
      label: 'One guard for every way out',
      source: `<Drawer
  open={open}
  onOpenChange={(next, request) => {
    if (!next && saving) return request.cancel();
    setOpen(next);
  }}
>
  …
</Drawer>;`,
    }),
  },
  {
    id: 'focus',
    title: 'Where focus goes, and where it comes back to',
    note: 'An overlay drawer takes focus on open and gives it back on close. An inline one takes nothing — a sidebar that stole focus every time a breakpoint crossed would be unusable — and still gives it back when it closes under the reader’s hands.',
    snippet: defineSnippet({
      id: 'drawer-react-focus',
      language: 'tsx',
      label: 'Naming the element focus lands on',
      source: `const search = useRef<HTMLInputElement>(null);

<Drawer initialFocus={search}>
  <DrawerTrigger>Buscar</DrawerTrigger>
  <DrawerPanel>
    <DrawerBody>
      <TextField label="Buscar" ref={search} />
    </DrawerBody>
  </DrawerPanel>
</Drawer>;`,
    }),
  },
  {
    id: 'loading',
    title: 'Open before the content arrived',
    note: 'The body carries aria-busy and keeps a floor so the panel does not jump to size when the data lands. The header, the close button, Escape and the separator all stay operable: a drawer a reader cannot leave is the worse failure of the two.',
    snippet: defineSnippet({
      id: 'drawer-react-loading',
      language: 'tsx',
      label: 'Busy, and still closable',
      source: `<Drawer loading={invoice === undefined} defaultOpen>
  <DrawerPanel>
    <DrawerHeader>
      <DrawerTitle>Fatura 4471</DrawerTitle>
      <DrawerClose />
    </DrawerHeader>
    <DrawerBody>
      <Skeleton shape="text" />
    </DrawerBody>
  </DrawerPanel>
</Drawer>;`,
    }),
  },
  {
    id: 'nested',
    title: 'A drawer opened from a drawer',
    note: 'Escape reaches the topmost layer only, and a layer that refuses it stops the request reaching the one beneath. The depth comes from the single stack dismissable-layer keeps, so nothing here states a z-index.',
    snippet: defineSnippet({
      id: 'drawer-react-nested',
      language: 'tsx',
      label: 'Two layers, one stack',
      source: `<Drawer defaultOpen>
  <DrawerPanel>
    <DrawerBody>
      <Drawer size="sm">
        <DrawerTrigger>Ver o item</DrawerTrigger>
        <DrawerPanel>…</DrawerPanel>
      </Drawer>
    </DrawerBody>
  </DrawerPanel>
</Drawer>;`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A ninety-character token in a title breaks rather than widening the panel, and a body longer than the layer scrolls while the actions hold still. Radix, MUI and Angular Material ship no layout, so a footer past the fold is the default of following any of them.',
    snippet: defineSnippet({
      id: 'drawer-react-content',
      language: 'tsx',
      label: 'The body scrolls; the footer stays',
      source: `<DrawerPanel>
  <DrawerHeader>
    <DrawerTitle>{fileName}</DrawerTitle>
  </DrawerHeader>
  <DrawerBody>{longText}</DrawerBody>
  <DrawerFooter>
    <Button>Salvar</Button>
  </DrawerFooter>
</DrawerPanel>;`,
    }),
  },
  {
    id: 'composition',
    title: 'The parts are the consumer’s own elements',
    note: 'render hands each part every attribute the family wrote, so the trigger is the library’s Button and an inline panel is a nav — nothing is reimplemented and nothing is wrapped. An empty list inside the body is result-state, which owns that question.',
    snippet: defineSnippet({
      id: 'drawer-react-composition',
      language: 'tsx',
      label: 'A Button that opens it, a nav that holds it',
      source: `<DrawerTrigger render={(props) => <Button {...props} variant="outline" />}>Abrir</DrawerTrigger>;

<DrawerPanel render={(props) => <nav {...props} aria-label="Seções" />}>…</DrawerPanel>;`,
    }),
  },
  {
    id: 'defaults',
    title: 'What an application decides once',
    note: 'Seven axes set for a whole subtree rather than repeated on every drawer in a product. A drawer that states any of them itself still wins, because an explicit consumer value always does.',
    snippet: defineSnippet({
      id: 'drawer-react-defaults',
      language: 'tsx',
      label: 'One decision for the whole product',
      source: `<DrawerDefaultsProvider side="start" size="lg" outsidePress="none">
  <App />
</DrawerDefaultsProvider>;`,
    }),
  },
  {
    id: 'accessibility',
    title: 'What a reader hears, and what they can reach',
    note: 'The title names the panel and the separator; the trigger says expanded in both modes and haspopup in one. Tab wraps inside a modal panel, and the closed panel of an inline drawer is inert so the collapse the eye reads and the tab order agree.',
    snippet: defineSnippet({
      id: 'drawer-react-accessibility',
      language: 'tsx',
      label: 'The name every part is wired to',
      source: `<DrawerPanel>
  <DrawerHeader>
    <DrawerTitle>Coleções</DrawerTitle>
  </DrawerHeader>
  <DrawerResizer />
</DrawerPanel>;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: DrawerChangeRequest)',
    when: 'Before the drawer moves, for all five ways it can. The request carries the new value, the value it replaces, reason — pointer, keyboard, dismiss, escape, outsidePress or programmatic — result, the originating event, and cancel(), which refuses the move before anything commits. One guard therefore covers Escape, an outside press, the close button and the handle together.',
  },
  {
    name: 'onExtentChange',
    payload: '(extent: number, request: DrawerExtentRequest)',
    when: 'Before the panel’s measure moves, carrying pointer for a drag or a tap on the grabber, keyboard for an arrow, Home, End or Enter, and programmatic for the consumer’s own call. A drag of the separator fires per pointer move, and the value may fall below minExtent; a drag of a sheet’s body fires once, on release, with the stop it settled on. undefined is the panel back on its size step — under size="content", the height of its content.',
  },
  {
    name: 'onClick, onKeyDown, onPointerDown, on every part',
    payload: 'the element’s own events',
    when: 'Whenever the element fires them. The family composes with a consumer’s handler rather than replacing it: the consumer’s runs first, and preventDefault() refuses the family’s own behaviour as well.',
  },
];

const composition = apiRows([
  [
    'render',
    '(props) => ReactNode',
    '—',
    'every part',
    'Substitutes the element a part renders and hands it every attribute the family wrote. On DrawerPanel it substitutes the panel rather than the layer, which is how an inline drawer becomes a nav or an aside',
  ],
  [
    'ref',
    'Ref<DrawerHandle> on Drawer, Ref<HTMLElement> on every part',
    '—',
    'Drawer, every part',
    'On a part it reaches the element. On the family it is a handle with open(), close(result) and focus() — the three actions a consumer cannot express declaratively, and nothing more, because the measure is already a controlled value',
  ],
  [
    'container',
    'Element | null',
    '—',
    'Drawer',
    'A parent for this layer alone instead of the shared portal root. An application shell that owns its own stacking context names it here, or once for the whole document with setPortalContainer from @slotted/core/portal',
  ],
  [
    'useDrawer()',
    '() => DrawerContextValue',
    '—',
    'inside Drawer',
    'What the parts read: the open state, the measure, the identifiers, the axes and close(reason, result). It throws outside a family rather than rendering a control that closes nothing',
  ],
  [
    'DrawerDefaultsProvider',
    '{ mode, side, size, mount, modal, escape, outsidePress, back, drag }',
    '—',
    'a subtree',
    'The nine decisions an application takes once. A drawer that states any of them itself still wins, because an explicit consumer value always does',
  ],
]);

const accessibility = [
  'The pattern is the WAI-ARIA APG’s Dialog (Modal) — w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — and it applies to mode="overlay". Its whole keyboard table is answered: Tab moves to the next tabbable element inside the panel and wraps from the last to the first, Shift+Tab wraps the other way, and Escape closes. Escape reaches the topmost layer only, and a layer that refuses it stops the request reaching the one beneath, so one press never closes two.',
  'Under mode="inline" the panel writes no role at all. A navigation drawer is a navigation landmark and a filter panel is complementary, and a family that cannot know which one would guess wrong half the time — so render names it, and the page above shows both. The trigger drops aria-haspopup there for the same reason: an inline drawer is a disclosure, and promising a popup that never arrives is worse than promising nothing.',
  'aria-modal="true" appears only while the drawer is modal, which is the only state in which the background is genuinely unreachable: dismissable-layer writes inert on every sibling up to the document root. modal is fixed at false under inline, because a panel in the flow that claimed the mark while the page around it stayed reachable is exactly the failure the APG calls severe.',
  'The separator answers the APG’s Window Splitter pattern — w3.org/WAI/ARIA/apg/patterns/windowsplitter/ — key by key: the arrows move it by the screen’s own directions, Home and End reach the limits, and Enter collapses the panel to its floor and restores it. It carries role="separator", tabindex="0", aria-orientation, aria-controls the panel and aria-labelledby the title, and its three values are percentages, which is the range the pattern calls typical. Ant’s resizer and Vaul’s snap dragging are both pointer-only; docs/component-features.md §2.8 makes the alternative a condition of shipping the capability at all.',
  'The one departure from that pattern is Enter. “Collapses the pane” would mean closing the drawer, and Escape already means that; a reader who presses Enter on a separator expects the separator to still be there afterwards. The other is aria-valuetext, which is absent: a reader hears “40” rather than “40 per cent”, because the string would have to be built from a locale this family does not take.',
  'A bottom sheet moves under a touch on its body as well as on its separator, and the separator stays the keyboard’s: every stop a finger reaches — the content height included — is an arrow press away, and a tap on the grabber walks them as VoiceOver’s activation of a native grabber does. The body gesture never starts on a field, on text being selected, or on an element whose touch-action has already claimed vertical movement.',
  'The closed panel is inert in both modes, so a drawer the eye reads as closed keeps its controls out of the tab sequence and out of the accessibility tree. MUI’s persistent variant leaves them reachable, which is the defect this answers.',
  'Focus moves into an overlay panel on open — the first tabbable element by default, or an element the consumer names — and returns to the element that held it. An inline drawer moves nothing on open and still restores, because the scope moves focus back only when focus is inside it or on the body. A trigger that has since left the document falls back to that row’s nearest connected ancestor rather than dropping focus on the body.',
  'The close button is an inner control rather than a Button (R2): its box is the mark plus a step of air on each side, floored at --slotted-target-min, and the separator is --slotted-target-min thick, so both clear the WCAG 2.2 minimum of 24 by 24 pixels.',
];

const snippets = [
  defineSnippet({
    id: 'drawer-react-anatomy',
    language: 'tsx',
    label: 'Anatomy, as it reaches the DOM',
    source: `<div
  data-ui="drawer"
  data-part="root"
  data-mode="overlay"
  data-side="end"
  data-size="md"
  data-mount="active"
  data-modal
  data-open
>
  <div data-part="backdrop" />
  <div data-part="panel" role="dialog" aria-modal="true" aria-labelledby="d-t">
    <div
      data-part="resizer"
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-controls="d-p"
      aria-labelledby="d-t"
      aria-valuenow={40}
      aria-valuemin={20}
      aria-valuemax={100}
    />
    <header data-part="header">
      <h2 data-part="title" id="d-t">
        Fatura 4471
      </h2>
      <p data-part="description" id="d-d">
        Emitida em 12 de agosto.
      </p>
      <button data-part="close" type="button" aria-label="Close" />
    </header>
    <div data-part="body">…</div>
    <footer data-part="footer">…</footer>
  </div>
</div>;`,
  }),
  defineSnippet({
    id: 'drawer-theming',
    language: 'css',
    label: 'Retuning the family for an application',
    source: `[data-ui='drawer'] {
  --slotted-drawer-extent-md: 26rem;
  --slotted-drawer-scrim: rgb(12 20 40 / 0.6);
  --slotted-drawer-border-color: var(--slotted-border-subtle);
  --slotted-drawer-resizer-line-color: var(--slotted-tone-accent-border);
  --slotted-drawer-footer-surface: transparent;
}`,
  }),
];

export const REACT_DRAWER_DOCS = {
  imports,
  anatomy,
  scenes,
  events,
  api: apiRows([
    [
      'open',
      'boolean',
      '—',
      'Drawer',
      'Present at all means the consumer owns the state, for the life of the component. The family then asks and waits rather than moving itself',
    ],
    [
      'defaultOpen',
      'boolean',
      '—',
      'Drawer',
      'The value an uncontrolled drawer starts from, read once. A later change to it does not silently become new state',
    ],
    [
      'extent',
      'number',
      '—',
      'Drawer',
      'How much of the box the panel is measured in it takes, in [0, 1]. Unset means the size step decides. A fraction rather than a length, so the separator’s three ARIA values, the limits and the snap points are all the same kind of number',
    ],
    [
      'defaultExtent',
      'number',
      '—',
      'Drawer',
      'The measure an uncontrolled drawer starts from, read once',
    ],
    [
      'minExtent',
      'number',
      '0.2',
      'Drawer',
      'The smallest the reader may make it, and the separator’s aria-valuemin. A drag released below it asks to close, carrying pointer',
    ],
    [
      'maxExtent',
      'number',
      '1',
      'Drawer',
      'The largest, and the separator’s aria-valuemax. With snap points the two limits are the first and last stop instead',
    ],
    [
      'snapPoints',
      'readonly number[]',
      '—',
      'Drawer',
      'The stops the separator lands on, as fractions. With them an arrow moves to the adjacent stop, Home and End go to the first and last, and a drag releases onto the nearest',
    ],
    [
      'mode',
      "'overlay' | 'inline'",
      'overlay',
      'Drawer, DrawerDefaultsProvider',
      'Whether the drawer is a layer over the page or a box in the consumer’s own layout. An axis rather than two components, because switching it at a breakpoint keeps the panel’s state, its scroll position and its focus',
    ],
    [
      'side',
      "'start' | 'end' | 'top' | 'bottom'",
      'end',
      'Drawer, DrawerDefaultsProvider',
      'Which edge the panel comes from. Logical, so the whole layout mirrors in a right-to-left document without a second stylesheet',
    ],
    [
      'size',
      "'sm' | 'md' | 'lg' | 'xl' | 'full' | 'content'",
      'md',
      'Drawer, DrawerDefaultsProvider',
      'The panel’s resting measure. Five named steps rather than a pixel string, because a theme can retune a step, and content, which measures what the panel holds up to four rems short of the layer. Unset, content on top and bottom — every native sheet sizes to its content — and md on start and end',
    ],
    [
      'mount',
      "'active' | 'lazy' | 'eager'",
      'active',
      'Drawer, DrawerDefaultsProvider',
      'When an overlay layer exists. active drops it once the exit is over, lazy builds it on the first open and keeps it, eager builds it up front and makes it inert. An inline drawer is always in the document, because its own measure is what opens and closes',
    ],
    [
      'modal',
      'boolean',
      'true',
      'Drawer, DrawerDefaultsProvider',
      'Whether the background is inert, the scroll is locked and focus is contained. false writes no aria-modal and paints no scrim, and inline fixes it at false, because the APG requires the mark only where all of that is actually true',
    ],
    [
      'escape',
      "'close' | 'none'",
      'close',
      'Drawer, DrawerDefaultsProvider',
      'Whether Escape asks to close. It reaches the topmost layer only, and a layer that refuses stops the request reaching the one beneath it',
    ],
    [
      'outsidePress',
      "'close' | 'none'",
      'close',
      'Drawer, DrawerDefaultsProvider',
      'Whether a press outside the layer asks to close it. Both this and escape are none under mode="inline", where there is no outside',
    ],
    [
      'back',
      "'close' | 'none'",
      'close',
      'Drawer, DrawerDefaultsProvider',
      "The platform's way back — a phone's gesture, a browser's button — closes the layer instead of leaving the page, while it is modal: @slotted/core/dismissable-layer holds one history entry per modal layer and answers the popstate that leaves it with the reason back. none under mode=\"inline\", as escape is",
    ],
    [
      'drag',
      "'panel' | 'resizer'",
      'panel',
      'Drawer, DrawerDefaultsProvider',
      'What a hand moves an overlay sheet from the bottom by. panel: a touch anywhere on it, handed to the scroll of what it holds when that is at its top or the sheet is on its highest stop. resizer: the separator alone, which is what the mouse and the pen always use and what every other side has',
    ],
    [
      'scrimFrom',
      'number',
      '0',
      'Drawer',
      'Below this fraction the scrim is not painted and a press reaches the page, and the root carries data-undimmed. Write it with modal={false} and outsidePress="none"',
    ],
    [
      'loading',
      'boolean',
      'false',
      'Drawer',
      'The body carries aria-busy and keeps a floor so the panel does not jump to size when the content lands. Nothing is disabled: a drawer a reader cannot leave is the worse failure',
    ],
    [
      'messages',
      'Partial<DrawerMessages>',
      '—',
      'Drawer',
      'Words laid over the language in force, key by key: the close control’s name (close). A native aria-label on DrawerClose still wins',
    ],
    [
      'initialFocus',
      "'first' | 'container' | RefObject | false",
      'first',
      'Drawer',
      'Where focus goes when an overlay drawer opens. container is the panel itself, for content whose structure has to be read before it is operated — the APG’s own note. An inline drawer moves focus nowhere, whatever this says',
    ],
    [
      'finalFocus',
      'RefObject | false',
      '—',
      'Drawer',
      'Where focus goes on close. Unstated returns it to the element that held it when the drawer opened, which is the trigger in the ordinary case',
    ],
    [
      'inset',
      "'none'",
      '—',
      'DrawerBody',
      'Drops the body’s own padding, for content that brings its own inset: a page inside the drawer, a list that wants the panel’s edges. The drawer never infers it from what it holds — a family does not select another family’s identity',
    ],
    [
      'step',
      'number',
      '16',
      'DrawerResizer',
      'How far one arrow press moves the separator, in pixels, when there are no snap points. A distance and not a proportion: five per cent of a wide layer is a jump rather than an adjustment. With snap points the arrows move to the adjacent stop and this is not read',
    ],
    [
      'largeStep',
      'number',
      '64',
      'DrawerResizer',
      'How far Shift and an arrow move it, in pixels. With snap points it is not read',
    ],
    [
      'value',
      'string',
      '—',
      'DrawerClose',
      'The result the close carries out on the request, which is what the platform calls returnValue and what Angular Material returns from afterClosed()',
    ],
  ]),
  composition,
  accessibility,
  snippets,
} as const;
