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

export const ANGULAR_DRAWER_TOKENS = drawerTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Drawer decision',
}));

const imports: ReferenceImport = {
  source:
    "import { SlDrawer, SlDrawerBody, SlDrawerClose, SlDrawerDescription, SlDrawerFooter, SlDrawerHeader, SlDrawerResizer, SlDrawerTitle, SlDrawerTrigger, provideDrawerDefaults } from '@slotted/angular/drawer';",
  selector: '<sl-drawer>, exportAs slDrawer',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div inside <sl-drawer>, moved into a portal under mode="overlay"',
    required: true,
    purpose:
      'The layer under mode="overlay" — fixed to the viewport, carrying data-ui="drawer", every axis, data-open, data-loading, data-dragging, and a z-index that is --slotted-z-index-overlay plus the depth dismissable-layer writes. Under mode="inline" it never moves, and its own measure is what opens and closes. The host itself renders display: contents and is the portal’s origin, so the layer keeps the scheme, density, theme and direction of the region it was written in.',
  },
  {
    part: 'trigger',
    element: 'the consumer’s own element, with slDrawerTrigger on it',
    required: false,
    purpose:
      'The control that opens it. It carries aria-expanded and aria-controls in both modes and aria-haspopup only under overlay, because an inline drawer is a disclosure rather than a popup. It is also an overlay layer’s branch — a press on it is inside the layer, or opening would be read as a press outside and close what it just opened.',
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
    element: 'div, holding the projected content',
    required: true,
    purpose:
      'The surface, in the same cell, aligned to the side. role="dialog" and aria-modal under overlay; no role at all under inline, because a navigation drawer is a navigation landmark and a filter panel is complementary. It is a three-row grid — auto, minmax(0, 1fr), auto — which is what keeps the actions on screen when the body is long.',
  },
  {
    part: 'resizer',
    element: 'the consumer’s own element, with slDrawerResizer on it',
    required: false,
    purpose:
      'The edge the reader moves. Rendering it is the resize capability — there is no resizable input — and it answers the Window Splitter pattern: aria-valuenow, aria-valuemin and aria-valuemax as percentages, aria-orientation, aria-controls the panel and aria-labelledby the title. It is a four-pixel gutter whose pointer reach is --slotted-target-min, invisible at rest and a two-pixel line under the hand, and it is a row of the panel’s grid on a block side and an overlay on the inner edge on an inline one.',
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
    element: 'the consumer’s own element, with slDrawerHeader on it',
    required: false,
    purpose:
      'Two columns: the words and the close button. The button keeps a column of its own, so a title that wraps grows the row instead of pushing it off the line.',
  },
  {
    part: 'title',
    element: 'the consumer’s own heading, with slDrawerTitle on it',
    required: false,
    purpose:
      'The visible name. aria-labelledby points at it from the panel and from the separator, and only when it is actually rendered — a reference to an id nothing carries is worse than no accessible name at all.',
  },
  {
    part: 'description',
    element: 'the consumer’s own element, with slDrawerDescription on it',
    required: false,
    purpose:
      'The sentence that says what the drawer is about. aria-describedby points at it when it is rendered.',
  },
  {
    part: 'body',
    element: 'the consumer’s own element, with slDrawerBody on it',
    required: false,
    purpose:
      'The one row that scrolls, and the row aria-busy belongs to while the content is still on its way. overscroll-behavior keeps a wheel that reaches its end from scrolling the page behind a non-modal drawer. inset="none" drops its padding for content that brings its own inset — a page, a list on the panel’s edges.',
  },
  {
    part: 'footer',
    element: 'the consumer’s own element, with slDrawerFooter on it',
    required: false,
    purpose:
      'The actions. A wrapping row aligned to the end, on the sunken surface, with a rule above it — every rule in the panel belongs to the row below it, so a panel with no body draws one line rather than two.',
  },
  {
    part: 'close',
    element: 'the consumer’s own button, with slDrawerClose on it',
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
      id: 'drawer-angular-playground',
      language: 'angular',
      label: 'A trigger, a panel and the actions',
      source: `<button slButton [slDrawerTrigger]="d">Abrir detalhes</button>
<sl-drawer #d="slDrawer">
  <header slDrawerHeader>
    <h2 slDrawerTitle>Fatura 4471</h2>
    <p slDrawerDescription>Emitida em 12 de agosto.</p>
    <button slDrawerClose></button>
  </header>
  <div slDrawerBody>
    <input slTextField aria-label="Observação" />
  </div>
  <footer slDrawerFooter>
    <button slButton size="sm" variant="ghost" tone="secondary">Cancelar</button>
    <button slButton size="sm">Salvar</button>
  </footer>
</sl-drawer>`,
    }),
  },
  {
    id: 'mode',
    title: 'A layer over the page, or a panel beside it',
    note: 'One axis rather than two components, because an application binds it to its own breakpoint: swapping one element for another there would take the panel’s scroll position, its focus and every uncontrolled control with it.',
    snippet: defineSnippet({
      id: 'drawer-angular-mode',
      language: 'angular',
      label: 'The two lines that make it responsive',
      source: `<div style="display: grid; grid-template-columns: auto minmax(0, 1fr)">
  <sl-drawer [mode]="wide() ? 'inline' : 'overlay'" [(open)]="open" side="start">
    <nav slDrawerBody aria-label="Seções">…</nav>
  </sl-drawer>
  <main>…</main>
</div>`,
    }),
  },
  {
    id: 'side',
    title: 'Which edge it comes from',
    note: 'start and end rather than left and right, so the whole layout mirrors in a right-to-left document with no second stylesheet. Only the exit slide is physical, and it takes one rule per inline side.',
    snippet: defineSnippet({
      id: 'drawer-angular-side',
      language: 'angular',
      label: 'Four edges, two of them logical',
      source: `<sl-drawer side="bottom" [(open)]="open">
  <div slDrawerBody>…</div>
</sl-drawer>`,
    }),
  },
  {
    id: 'size',
    title: 'How much room the panel takes',
    note: 'Five named steps rather than a pixel string, because a theme can retune a step and cannot retune width: 400px. A drawer wider than the layer is clamped to it, which is what makes a side drawer full-bleed on a phone.',
    snippet: defineSnippet({
      id: 'drawer-angular-size',
      language: 'angular',
      label: 'A step, or an exact measure',
      source: `<sl-drawer size="lg">…</sl-drawer>

<!-- An exact measure is the token the steps resolve into. -->
<sl-drawer style="--slotted-drawer-extent: 27rem">…</sl-drawer>`,
    }),
  },
  {
    id: 'resize',
    title: 'An edge the reader can move — with a keyboard',
    note: 'Putting slDrawerResizer on an element is the capability; there is no resizable input. Arrow keys move it sixteen pixels at a time and sixty-four with Shift, Home and End reach the limits, Enter collapses and restores, and a double click puts the panel back on the measure its size step gives it — which is the Window Splitter pattern, and which no surveyed drawer answers.',
    snippet: defineSnippet({
      id: 'drawer-angular-resize',
      language: 'angular',
      label: 'The directive is the capability',
      source: `<sl-drawer side="start" [(extent)]="extent" [minExtent]="0.2">
  <header slDrawerHeader><h2 slDrawerTitle>Coleções</h2></header>
  <div slDrawerBody>…</div>
  <div slDrawerResizer></div>
</sl-drawer>`,
    }),
  },
  {
    id: 'snapPoints',
    title: 'Stops the sheet lands on',
    note: 'A snap point is a stop of the same separator, so the arrows that move it move between them — which is the condition the guide puts on shipping snap points at all. A drag released below the first stop asks to close.',
    snippet: defineSnippet({
      id: 'drawer-angular-snap-points',
      language: 'angular',
      label: 'Three heights, all reachable by keyboard',
      source: `<sl-drawer side="bottom" [snapPoints]="[0.3, 0.6, 0.95]" [(extent)]="extent">
  <div slDrawerResizer></div>
  <div slDrawerBody>…</div>
</sl-drawer>`,
    }),
  },
  {
    id: 'sheet',
    title: 'A bottom sheet as a phone draws one',
    note: 'The sheet measures what it holds — the default size on top and bottom — stops at forty rems on a wide layer, and moves under a touch anywhere on its body. A downward drag with the list at its top moves the sheet; an upward one grows it to the next stop — the height of its content among them — before the list scrolls; a fling faster than 500 px/s goes to the next stop or closes. A tap on the grabber walks the stops.',
    snippet: defineSnippet({
      id: 'drawer-angular-sheet',
      language: 'angular',
      label: 'Half the layer, and the height of the content as the second stop',
      source: `<button slButton [slDrawerTrigger]="sheet">Filtros</button>
<sl-drawer #sheet="slDrawer" side="bottom" [snapPoints]="[0.5]" [(extent)]="extent">
  <div slDrawerResizer></div>
  <header slDrawerHeader>
    <h2 slDrawerTitle>Filtrar faturas</h2>
    <button slDrawerClose></button>
  </header>
  <div slDrawerBody>…</div>
</sl-drawer>`,
    }),
  },
  {
    id: 'scrimFrom',
    title: 'A sheet over a page that stays in use',
    note: 'Below scrimFrom the scrim is not painted and a press reaches the page — the sheet over a map. It is written beside [modal]="false" and outsidePress="none", because an undimmed page that stayed inert would promise something it does not do. Move the sheet past sixty per cent and the scrim fades in.',
    snippet: defineSnippet({
      id: 'drawer-angular-scrim-from',
      language: 'angular',
      label: 'Undimmed up to the middle stop',
      source: `<sl-drawer
  side="bottom"
  [snapPoints]="[0.25, 0.6, 0.95]"
  [(extent)]="extent"
  [scrimFrom]="0.6"
  [modal]="false"
  outsidePress="none"
>
  …
</sl-drawer>`,
    }),
  },
  {
    id: 'keyboard',
    title: 'A sheet above the virtual keyboard',
    note: 'On a phone the keyboard shrinks the visual viewport and leaves fixed layers under the keys. The open layer reads what the keyboard covers and recedes by it, so the sheet — and its footer — land above the keys. The button beside the scene writes the same property the binding writes, 260 pixels, to show it on a screen without one.',
    snippet: defineSnippet({
      id: 'drawer-angular-keyboard',
      language: 'angular',
      label: 'Nothing to write: the layer does it',
      source: `<sl-drawer side="bottom" [(open)]="reminding">
  <header slDrawerHeader><h2 slDrawerTitle>Enviar lembrete</h2></header>
  <div slDrawerBody>
    <input slTextField aria-label="Nota para o cliente" />
  </div>
  <footer slDrawerFooter>…</footer>
</sl-drawer>`,
    }),
  },
  {
    id: 'modal',
    title: 'A drawer the page behind can still be used',
    note: 'modal="false" writes no aria-modal, makes nothing inert, locks no scroll and contains no focus. The APG warns that marking a container modal without doing all four is worse for a screen-reader reader than not marking it at all.',
    snippet: defineSnippet({
      id: 'drawer-angular-modal',
      language: 'angular',
      label: 'Non-modal, and honest about it',
      source: `<sl-drawer [modal]="false" [(open)]="open">
  <div slDrawerBody>…</div>
</sl-drawer>`,
    }),
  },
  {
    id: 'policy',
    title: 'Refusing a close, and refusing it once',
    note: 'Five ways to close and one output. A guard on openChangeRequest covers Escape, an outside press, the close button, the trigger and the imperative call together; Angular Material’s disableClose refuses two of them.',
    snippet: defineSnippet({
      id: 'drawer-angular-policy',
      language: 'angular',
      label: 'One guard for every way out',
      source: `<sl-drawer [(open)]="open" (openChangeRequest)="guard($event)">…</sl-drawer>`,
    }),
  },
  {
    id: 'focus',
    title: 'Where focus goes, and where it comes back to',
    note: 'An overlay drawer takes focus on open and gives it back on close. An inline one takes nothing — a sidebar that stole focus every time a breakpoint crossed would be unusable — and still gives it back when it closes under the reader’s hands.',
    snippet: defineSnippet({
      id: 'drawer-angular-focus',
      language: 'angular',
      label: 'Naming the element focus lands on',
      source: `<sl-drawer [initialFocus]="search">
  <div slDrawerBody>
    <input #search slTextField aria-label="Buscar" />
  </div>
</sl-drawer>`,
    }),
  },
  {
    id: 'loading',
    title: 'Open before the content arrived',
    note: 'The body carries aria-busy and keeps a floor so the panel does not jump to size when the data lands. The header, the close button, Escape and the separator all stay operable: a drawer a reader cannot leave is the worse failure of the two.',
    snippet: defineSnippet({
      id: 'drawer-angular-loading',
      language: 'angular',
      label: 'Busy, and still closable',
      source: `<sl-drawer [loading]="invoice() === undefined" [(open)]="open">
  <header slDrawerHeader>
    <h2 slDrawerTitle>Fatura 4471</h2>
    <button slDrawerClose></button>
  </header>
  <div slDrawerBody><sl-skeleton shape="text" /></div>
</sl-drawer>`,
    }),
  },
  {
    id: 'nested',
    title: 'A drawer opened from a drawer',
    note: 'Escape reaches the topmost layer only, and a layer that refuses it stops the request reaching the one beneath. The depth comes from the single stack dismissable-layer keeps, so nothing here states a z-index.',
    snippet: defineSnippet({
      id: 'drawer-angular-nested',
      language: 'angular',
      label: 'Two layers, one stack',
      source: `<sl-drawer [(open)]="open">
  <div slDrawerBody>
    <button slButton [slDrawerTrigger]="inner">Ver o item</button>
    <sl-drawer #inner="slDrawer" size="sm">…</sl-drawer>
  </div>
</sl-drawer>`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A ninety-character token in a title breaks rather than widening the panel, and a body longer than the layer scrolls while the actions hold still. MUI and Angular Material ship no layout, so a footer past the fold is the default of following either.',
    snippet: defineSnippet({
      id: 'drawer-angular-content',
      language: 'angular',
      label: 'The body scrolls; the footer stays',
      source: `<sl-drawer>
  <header slDrawerHeader>
    <h2 slDrawerTitle>{{ fileName }}</h2>
  </header>
  <div slDrawerBody>{{ longText }}</div>
  <footer slDrawerFooter><button slButton>Salvar</button></footer>
</sl-drawer>`,
    }),
  },
  {
    id: 'composition',
    title: 'The parts are the consumer’s own elements',
    note: 'Every part is a directive on an element the consumer wrote, so the trigger is the library’s button and an inline panel’s content is a nav — nothing is reimplemented and nothing is wrapped. An empty list inside the body is result-state, which owns that question.',
    snippet: defineSnippet({
      id: 'drawer-angular-composition',
      language: 'angular',
      label: 'A button that opens it, a nav that holds it',
      source: `<button slButton variant="outline" [slDrawerTrigger]="d">Abrir</button>
<sl-drawer #d="slDrawer" mode="inline" side="start">
  <nav slDrawerBody aria-label="Seções">…</nav>
</sl-drawer>`,
    }),
  },
  {
    id: 'defaults',
    title: 'What an application decides once',
    note: 'Seven axes set for a whole injector rather than repeated on every drawer in a product. A drawer that states any of them itself still wins, because an explicit consumer value always does.',
    snippet: defineSnippet({
      id: 'drawer-angular-defaults',
      language: 'ts',
      label: 'One decision for the whole product',
      source: `bootstrapApplication(App, {
  providers: [provideDrawerDefaults({ side: 'start', size: 'lg', outsidePress: 'none' })],
});`,
    }),
  },
  {
    id: 'accessibility',
    title: 'What a reader hears, and what they can reach',
    note: 'The title names the panel and the separator; the trigger says expanded in both modes and haspopup in one. Tab wraps inside a modal panel, and the closed panel of an inline drawer is inert so the collapse the eye reads and the tab order agree.',
    snippet: defineSnippet({
      id: 'drawer-angular-accessibility',
      language: 'angular',
      label: 'The name every part is wired to',
      source: `<sl-drawer mode="inline" side="start">
  <header slDrawerHeader><h2 slDrawerTitle>Coleções</h2></header>
  <div slDrawerResizer></div>
</sl-drawer>`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'openChange',
    payload: 'boolean',
    when: 'The two-way half of `open`. `[(open)]="value"` binds it, and it fires once the drawer has actually moved.',
  },
  {
    name: 'openChangeRequest',
    payload: 'DrawerChangeRequest',
    when: 'Before the drawer moves, for all five ways it can. It carries the new value, the value it replaces, reason — pointer, keyboard, dismiss, escape, outsidePress or programmatic — result, the originating event, and cancel(), which refuses the move before anything commits. One guard therefore covers Escape, an outside press, the close button and the imperative call together.',
  },
  {
    name: 'extentChange',
    payload: 'number',
    when: 'The two-way half of `extent`, once the panel’s measure has moved.',
  },
  {
    name: 'extentChangeRequest',
    payload: 'DrawerExtentRequest',
    when: 'Before the measure moves, carrying pointer for a drag or a tap on the grabber, keyboard for an arrow, Home, End or Enter, and programmatic for the application’s own call. A drag of the separator fires per pointer move, and the value may fall below minExtent; a drag of a sheet’s body fires once, on release, with the stop it settled on. undefined is the panel back on its size step — under size="content", the height of its content.',
  },
  {
    name: 'closed',
    payload: 'string | undefined',
    when: 'Once the drawer has actually closed, with the result the close carried. It is what afterClosed() is in Angular Material, without a service that instantiates a component.',
  },
];

const composition = apiRows([
  [
    'exportAs',
    "'slDrawer'",
    '—',
    '<sl-drawer>',
    'A template reference variable reaches the instance, which is how a trigger anywhere in the same template links to it. React needs a provider around both for the same job, because there the component owns the tag',
  ],
  [
    'ng-content',
    '—',
    '—',
    '<sl-drawer>',
    'The panel’s rows are the consumer’s own elements with the part directives on them, so a landmark, a form or a list is projected rather than wrapped. Under mount="active" the layer’s template is built only while it is open',
  ],
  [
    'openDrawer(), close(result), focus()',
    '() => void',
    '—',
    '<sl-drawer>',
    'The three actions a consumer cannot express declaratively, and nothing more, because the measure is already a two-way value',
  ],
  [
    'container',
    'Element | null',
    '—',
    '<sl-drawer>',
    'A parent for this layer alone instead of the shared portal root. An application shell that owns its own stacking context names it here, or once for the whole document with setPortalContainer from @slotted/core/portal',
  ],
  [
    'provideDrawerDefaults()',
    '{ mode, side, size, mount, modal, escape, outsidePress, back, drag }',
    '—',
    'an injector',
    'The nine decisions an application takes once, through DRAWER_DEFAULTS. A drawer that states any of them itself still wins, because an explicit consumer value always does',
  ],
]);

const accessibility = [
  'The pattern is the WAI-ARIA APG’s Dialog (Modal) — w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — and it applies to mode="overlay". Its whole keyboard table is answered: Tab moves to the next tabbable element inside the panel and wraps from the last to the first, Shift+Tab wraps the other way, and Escape closes. Escape reaches the topmost layer only, and a layer that refuses it stops the request reaching the one beneath, so one press never closes two.',
  'Under mode="inline" the panel writes no role at all. A navigation drawer is a navigation landmark and a filter panel is complementary, and a family that cannot know which one would guess wrong half the time — so the consumer names it on their own projected element. The trigger drops aria-haspopup there for the same reason: an inline drawer is a disclosure, and promising a popup that never arrives is worse than promising nothing.',
  'aria-modal="true" appears only while the drawer is modal, which is the only state in which the background is genuinely unreachable: dismissable-layer writes inert on every sibling up to the document root. modal is fixed at false under inline, because a panel in the flow that claimed the mark while the page around it stayed reachable is exactly the failure the APG calls severe. An aria-label written on <sl-drawer> itself is read with HostAttributeToken and moved to the panel, which is the element the role is on.',
  'The separator answers the APG’s Window Splitter pattern — w3.org/WAI/ARIA/apg/patterns/windowsplitter/ — key by key: the arrows move it by the screen’s own directions, Home and End reach the limits, and Enter collapses the panel to its floor and restores it. It carries role="separator", tabindex="0", aria-orientation, aria-controls the panel and aria-labelledby the title, and its three values are percentages, which is the range the pattern calls typical. Ant’s resizer and Vaul’s snap dragging are both pointer-only; docs/component-features.md §2.8 makes the alternative a condition of shipping the capability at all.',
  'The one departure from that pattern is Enter. “Collapses the pane” would mean closing the drawer, and Escape already means that; a reader who presses Enter on a separator expects the separator to still be there afterwards. The other is aria-valuetext, which is absent: a reader hears “40” rather than “40 per cent”, because the string would have to be built from a locale this family does not take.',
  'A bottom sheet moves under a touch on its body as well as on its separator, and the separator stays the keyboard’s: every stop a finger reaches — the content height included — is an arrow press away, and a tap on the grabber walks them as VoiceOver’s activation of a native grabber does. The body gesture never starts on a field, on text being selected, or on an element whose touch-action has already claimed vertical movement.',
  'The closed panel is inert in both modes, so a drawer the eye reads as closed keeps its controls out of the tab sequence and out of the accessibility tree. MUI’s persistent variant leaves them reachable, which is the defect this answers.',
  'Focus moves into an overlay panel on open — the first tabbable element by default, or an element the consumer names — and returns to the element that held it. An inline drawer moves nothing on open and still restores, because the scope moves focus back only when focus is inside it or on the body. A trigger that has since left the document falls back to that row’s nearest connected ancestor rather than dropping focus on the body.',
  'The close button is an inner control rather than a Button (R2): its box is the mark plus a step of air on each side, floored at --slotted-target-min, and the separator is --slotted-target-min thick, so both clear the WCAG 2.2 minimum of 24 by 24 pixels.',
];

const snippets = [
  defineSnippet({
    id: 'drawer-angular-anatomy',
    language: 'angular',
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
  <div data-part="backdrop"></div>
  <div data-part="panel" role="dialog" aria-modal="true" aria-labelledby="d-t">
    <div
      data-part="resizer"
      role="separator"
      tabindex="0"
      aria-orientation="vertical"
      aria-controls="d-p"
      aria-labelledby="d-t"
      aria-valuenow="40"
      aria-valuemin="20"
      aria-valuemax="100"
    ></div>
    <header data-part="header">
      <h2 data-part="title" id="d-t">Fatura 4471</h2>
      <p data-part="description" id="d-d">Emitida em 12 de agosto.</p>
      <button data-part="close" type="button" aria-label="Close"></button>
    </header>
    <div data-part="body">…</div>
    <footer data-part="footer">…</footer>
  </div>
</div>`,
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

export const ANGULAR_DRAWER_DOCS = {
  imports,
  anatomy,
  scenes,
  events,
  api: apiRows([
    [
      'open',
      'model<boolean>',
      'false',
      '<sl-drawer>',
      'Whether the drawer is open. A model, so `[(open)]` binds both halves at once — which is why there is no defaultOpen input here and there is one in React',
    ],
    [
      'extent',
      'model<number | undefined>',
      '—',
      '<sl-drawer>',
      'How much of the box the panel is measured in it takes, in [0, 1]. Unset means the size step decides. A fraction rather than a length, so the separator’s three ARIA values, the limits and the snap points are all the same kind of number',
    ],
    [
      'minExtent',
      'number',
      '0.2',
      '<sl-drawer>',
      'The smallest the reader may make it, and the separator’s aria-valuemin. A drag released below it asks to close, carrying pointer',
    ],
    [
      'maxExtent',
      'number',
      '1',
      '<sl-drawer>',
      'The largest, and the separator’s aria-valuemax. With snap points the two limits are the first and last stop instead',
    ],
    [
      'snapPoints',
      'readonly number[]',
      '—',
      '<sl-drawer>',
      'The stops the separator lands on, as fractions. With them an arrow moves to the adjacent stop, Home and End go to the first and last, and a drag releases onto the nearest',
    ],
    [
      'mode',
      "'overlay' | 'inline'",
      'overlay',
      '<sl-drawer>, provideDrawerDefaults',
      'Whether the drawer is a layer over the page or a box in the consumer’s own layout. An axis rather than two components, because switching it at a breakpoint keeps the panel’s state, its scroll position and its focus',
    ],
    [
      'side',
      "'start' | 'end' | 'top' | 'bottom'",
      'end',
      '<sl-drawer>, provideDrawerDefaults',
      'Which edge the panel comes from. Logical, so the whole layout mirrors in a right-to-left document without a second stylesheet',
    ],
    [
      'size',
      "'sm' | 'md' | 'lg' | 'xl' | 'full' | 'content'",
      'md',
      '<sl-drawer>, provideDrawerDefaults',
      'The panel’s resting measure. Five named steps rather than a pixel string, because a theme can retune a step, and content, which measures what the panel holds up to four rems short of the layer. Unset, content on top and bottom — every native sheet sizes to its content — and md on start and end',
    ],
    [
      'mount',
      "'active' | 'lazy' | 'eager'",
      'active',
      '<sl-drawer>, provideDrawerDefaults',
      'When an overlay layer exists. active drops it once the exit is over, lazy builds it on the first open and keeps it, eager builds it up front and makes it inert. An inline drawer is always in the document, because its own measure is what opens and closes',
    ],
    [
      'modal',
      'boolean',
      'true',
      '<sl-drawer>, provideDrawerDefaults',
      'Whether the background is inert, the scroll is locked and focus is contained. false writes no aria-modal and paints no scrim, and inline fixes it at false, because the APG requires the mark only where all of that is actually true',
    ],
    [
      'escape',
      "'close' | 'none'",
      'close',
      '<sl-drawer>, provideDrawerDefaults',
      'Whether Escape asks to close. It reaches the topmost layer only, and a layer that refuses stops the request reaching the one beneath it',
    ],
    [
      'outsidePress',
      "'close' | 'none'",
      'close',
      '<sl-drawer>, provideDrawerDefaults',
      'Whether a press outside the layer asks to close it. Both this and escape are none under mode="inline", where there is no outside',
    ],
    [
      'back',
      "'close' | 'none'",
      'close',
      '<sl-drawer>, provideDrawerDefaults',
      "The platform's way back — a phone's gesture, a browser's button — closes the layer instead of leaving the page, while it is modal: @slotted/core/dismissable-layer holds one history entry per modal layer and answers the popstate that leaves it with the reason back. none under mode=\"inline\", as escape is",
    ],
    [
      'drag',
      "'panel' | 'resizer'",
      'panel',
      '<sl-drawer>, provideDrawerDefaults',
      'What a hand moves an overlay sheet from the bottom by. panel: a touch anywhere on it, handed to the scroll of what it holds when that is at its top or the sheet is on its highest stop. resizer: the separator alone, which is what the mouse and the pen always use and what every other side has',
    ],
    [
      'scrimFrom',
      'number',
      '0',
      '<sl-drawer>',
      'Below this fraction the scrim is not painted and a press reaches the page, and the root carries data-undimmed. Write it with [modal]="false" and outsidePress="none"',
    ],
    [
      'loading',
      'boolean',
      'false',
      '<sl-drawer>',
      'The body carries aria-busy and keeps a floor so the panel does not jump to size when the content lands. Nothing is disabled: a drawer a reader cannot leave is the worse failure',
    ],
    [
      'messages',
      'Partial<DrawerMessages>',
      '—',
      '<sl-drawer>',
      'Words laid over the language in force, key by key: the close control’s name (close). A native aria-label on slDrawerClose still wins',
    ],
    [
      'initialFocus',
      "'first' | 'container' | HTMLElement | false",
      'first',
      '<sl-drawer>',
      'Where focus goes when an overlay drawer opens. container is the panel itself, for content whose structure has to be read before it is operated — the APG’s own note. An inline drawer moves focus nowhere, whatever this says',
    ],
    [
      'finalFocus',
      'HTMLElement | false',
      '—',
      '<sl-drawer>',
      'Where focus goes on close. Unstated returns it to the element that held it when the drawer opened, which is the trigger in the ordinary case',
    ],
    [
      'inset',
      "'none'",
      '—',
      'slDrawerBody',
      'Drops the body’s own padding, for content that brings its own inset: a page inside the drawer, a list that wants the panel’s edges. The drawer never infers it from what it holds — a family does not select another family’s identity',
    ],
    [
      'step',
      'number',
      '16',
      'slDrawerResizer',
      'How far one arrow press moves the separator, in pixels, when there are no snap points. A distance and not a proportion: five per cent of a wide layer is a jump rather than an adjustment. With snap points the arrows move to the adjacent stop and this is not read',
    ],
    [
      'largeStep',
      'number',
      '64',
      'slDrawerResizer',
      'How far Shift and an arrow move it, in pixels. With snap points it is not read',
    ],
    [
      'value',
      'string',
      '—',
      'slDrawerClose',
      'The result the close carries out on the request, which is what the platform calls returnValue and what Angular Material returns from afterClosed()',
    ],
  ]),
  composition,
  accessibility,
  snippets,
} as const;
