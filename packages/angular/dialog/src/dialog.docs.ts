import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import dialogTokens from '@slotted/styles/dialog/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_DIALOG_TOKENS = dialogTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Dialog decision',
}));

const imports: ReferenceImport = {
  source:
    "import { SlDialog, SlDialogBody, SlDialogClose, SlDialogDescription, SlDialogFooter, SlDialogHeader, SlDialogTitle, SlDialogTrigger, provideDialogDefaults } from '@slotted/angular/dialog';",
  selector:
    'sl-dialog, [slDialogTrigger], [slDialogHeader], [slDialogTitle], [slDialogDescription], [slDialogBody], [slDialogFooter], [slDialogClose]',
  exportAs: 'slDialog, slDialogTrigger, slDialogHeader, slDialogTitle, slDialogClose',
};

const alertImports: ReferenceImport = {
  source:
    "import { SlAlertDialog, SlAlertDialogAction, SlAlertDialogCancel, SlAlertDialogIcon, SlDialogBody, SlDialogDescription, SlDialogFooter, SlDialogHeader, SlDialogTitle, SlDialogTrigger } from '@slotted/angular/dialog';",
  selector:
    'sl-alert-dialog, [slDialogTrigger], [slAlertDialogIcon], [slAlertDialogCancel], [slAlertDialogAction]',
  exportAs: 'slAlertDialog, slAlertDialogCancel, slAlertDialogAction',
};

const sharedAnatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, in a portal — not the sl-dialog host, which stays where it was written',
    required: true,
    purpose:
      'The layer. Fixed to the viewport, carrying data-ui="dialog", every axis, data-open and data-loading, and a z-index that is --slotted-z-index-overlay plus the depth dismissable-layer writes on it. It is also the query container, so full screen answers the layer’s own inline size rather than the window’s.',
  },
  {
    part: 'trigger',
    element: 'the consumer’s own element, with slDialogTrigger on it',
    required: false,
    purpose:
      'The control that opens it, rendered where it is written rather than in the portal. It carries aria-haspopup, aria-expanded and aria-controls, and it is the layer’s branch — a press on it is inside the layer, or opening would be read as a press outside and close what it just opened.',
  },
  {
    part: 'backdrop',
    element: 'div',
    required: true,
    purpose:
      'The scrim, painted from --slotted-scrim. One of the two things placed in the layer’s single grid cell, and the one that never scrolls.',
  },
  {
    part: 'viewport',
    element: 'div',
    required: true,
    purpose:
      'The box that centres the panel and, under scroll="viewport", the box that scrolls. It is separate from the layer because a scrim inside a scrolling box scrolls away with it. It centres with safe center, so a panel taller than the layer keeps its title on screen instead of overflowing at both ends.',
  },
  {
    part: 'content',
    element: 'div',
    required: true,
    purpose:
      'The panel: role="dialog", aria-modal while modal, and a three-row grid — auto, minmax(0, 1fr), auto. That grid is what keeps the actions on screen when the body is long.',
  },
  {
    part: 'header',
    element: 'header, with the directive on it',
    required: false,
    purpose:
      'Three columns: the mark, the words, and the close button. The mark and the button each keep a column of their own, so a title that wraps grows the row instead of pushing either off the line. Anything else you write here — a status indicator, a badge, a line of your own — lands in the words column under the description, aligned with the title.',
  },
  {
    part: 'title',
    element: 'the consumer’s own heading, with slDialogTitle on it',
    required: false,
    purpose:
      'The visible name. aria-labelledby points at it, and only when it is actually rendered — a reference to an id nothing carries is worse than no accessible name at all.',
  },
  {
    part: 'description',
    element: 'the consumer’s own element, with slDialogDescription on it',
    required: false,
    purpose:
      'The sentence that says what the dialog is about. aria-describedby points at it. Optional here and required in AlertDialog, which is the difference between the two patterns.',
  },
  {
    part: 'body',
    element: 'div, with the directive on it',
    required: false,
    purpose:
      'The one row that scrolls, and the row aria-busy belongs to while the content is still on its way. overscroll-behavior keeps a wheel that reaches its end from scrolling the page behind a non-modal layer.',
  },
  {
    part: 'footer',
    element: 'footer, with the directive on it',
    required: false,
    purpose:
      'The actions. A wrapping row aligned to the end, on the sunken surface, with a rule above it — every rule in the panel belongs to the row below it, so a panel with no body draws one line rather than two.',
  },
];

const anatomy: AnatomyRow[] = [
  ...sharedAnatomy,
  {
    part: 'close',
    element: 'button',
    required: false,
    purpose:
      'The ✕. An icon-only control the size of a medium control rather than of its mark, so the target clears the WCAG minimum in both axes. It closes with reason dismiss and carries whatever value it names as the result.',
  },
  {
    part: 'fullscreen',
    element: 'button',
    required: false,
    purpose:
      'The control that hands the layer to the panel and takes it back, appended to the header by slDialogHeader when fullscreenToggle is set. The same inner control the close is, in the column before it, with aria-pressed for which way it is set and a mark that says what the next press does.',
  },
];

const alertAnatomy: AnatomyRow[] = [
  ...sharedAnatomy.map((row) =>
    row.part === 'content'
      ? {
          ...row,
          purpose: row.purpose.replace('role="dialog"', 'role="alertdialog"'),
        }
      : row.part === 'description'
        ? {
            ...row,
            required: true,
            purpose:
              'The sentence that says what is about to happen. Required: the alertdialog pattern makes aria-describedby mandatory, and the family throws without it rather than shipping a confirmation announced as a title and two buttons.',
          }
        : row,
  ),
  {
    part: 'icon',
    element: 'span',
    required: false,
    purpose:
      'The tone’s own mark, drawn as a mask from a glyph token. It is what answers WCAG 2.2 SC 1.4.1 for a confirmation, and under forced colours it is the only thing left once every tone ground becomes one system colour.',
  },
  {
    part: 'cancel',
    element: 'button',
    required: true,
    purpose:
      'The least destructive action, and where focus lands when the layer opens — the APG’s own advice for a step that is not easily reversible. It closes with reason dismiss and the result "cancel".',
  },
  {
    part: 'action',
    element: 'button',
    required: true,
    purpose:
      'The action being confirmed. It closes with reason submit and the result "confirm", because confirming is what the reader came to do and dismiss is what the other two controls mean.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'A layer opened inside the scene rather than over the page. Press the trigger, then Tab: focus is contained, Escape closes, and focus returns to the button it came from.',
    snippet: defineSnippet({
      id: 'dialog-angular-playground',
      language: 'angular',
      label: 'A trigger, a panel and the actions',
      source: `<button slButton [slDialogTrigger]="d">Editar projeto</button>
<sl-dialog #d="slDialog" [(open)]="open">
  <header slDialogHeader>
    <h2 slDialogTitle>Editar projeto</h2>
    <p slDialogDescription>O nome é visível para todo o espaço.</p>
    <button slDialogClose></button>
  </header>
  <div slDialogBody>
    <input slTextField aria-label="Nome" value="Redesign da home" />
  </div>
  <footer slDialogFooter>
    <button slButton variant="ghost" tone="secondary">Cancelar</button>
    <button slButton>Salvar</button>
  </footer>
</sl-dialog>`,
    }),
  },
  {
    id: 'sizes',
    title: 'How wide the panel is allowed to be',
    note: 'Five named steps rather than a pixel string, because a theme can retune a step and cannot retune width: 600px. full spends the whole layer minus its padding, for a dialog that is a document.',
    snippet: defineSnippet({
      id: 'dialog-angular-sizes',
      language: 'angular',
      label: 'sm through full',
      source: `<sl-dialog size="lg" [(open)]="open">…</sl-dialog>`,
    }),
  },
  {
    id: 'placement',
    title: 'Where the panel sits in the layer',
    note: 'center is right for a panel whose height is settled; top is right for one that grows as the reader types, because a centred panel moves under the cursor every time a line is added.',
    snippet: defineSnippet({
      id: 'dialog-angular-placement',
      language: 'angular',
      label: 'A panel that grows stays put',
      source: `<sl-dialog placement="top" [(open)]="open">…</sl-dialog>`,
    }),
  },
  {
    id: 'scroll',
    title: 'What scrolls when the content is long',
    note: 'content bounds the panel to the layer and scrolls the body, so the actions stay on screen; viewport scrolls the whole panel, for content that is read rather than acted on. Radix and React Aria ship neither, and a footer past the fold is the default of following their examples.',
    snippet: defineSnippet({
      id: 'dialog-angular-scroll',
      language: 'angular',
      label: 'The body scrolls; the footer stays',
      source: `<sl-dialog scroll="content" [(open)]="open">
  <header slDialogHeader><h2 slDialogTitle>Termos de uso</h2></header>
  <div slDialogBody>{{ longText }}</div>
  <footer slDialogFooter><button slButton>Aceitar</button></footer>
</sl-dialog>`,
    }),
  },
  {
    id: 'surface',
    title: 'The layer, around a box you painted',
    note: 'surface="plain" turns the family’s own paint off — no ground, no border, no radius, no shadow, no rows — and keeps the portal, the scrim, the containment and the dismissal policy. It is what a headless library ships by default, offered here as an axis rather than as the only shape.',
    snippet: defineSnippet({
      id: 'dialog-angular-surface',
      language: 'angular',
      label: 'A card as the whole panel',
      source: `<sl-dialog surface="plain" [(open)]="open">
  <div slCard fill="elevated">
    <h2 slDialogTitle>Um card, dentro da layer</h2>
    <p slDialogDescription>A família não pinta nada aqui.</p>
  </div>
</sl-dialog>`,
    }),
  },
  {
    id: 'fullScreen',
    title: 'Taking the whole layer on a narrow one',
    note: 'A container query at a literal breakpoint, not a viewport query: the layer answers its own inline size, so a dialog inside a named portal container is as narrow as that container rather than as the window.',
    snippet: defineSnippet({
      id: 'dialog-angular-full-screen',
      language: 'angular',
      label: 'narrow, never and always',
      source: `<sl-dialog fullScreen="always" [(open)]="open">…</sl-dialog>`,
    }),
  },
  {
    id: 'modal',
    title: 'A layer the page behind can still be used',
    note: 'modal={false} writes no aria-modal, makes nothing inert, locks no scroll and contains no focus. The APG warns that marking a dialog modal without doing all four has severe consequences for the readers who rely on the mark.',
    snippet: defineSnippet({
      id: 'dialog-angular-modal',
      language: 'angular',
      label: 'Non-modal, and honest about it',
      source: `<sl-dialog [modal]="false" [(open)]="open">…</sl-dialog>`,
    }),
  },
  {
    id: 'policy',
    title: 'Refusing a close, and refusing it once',
    note: 'Six ways to close and one request. A guard on onOpenChange covers Escape, an outside press, the close button and the imperative handle together; Radix reports the same policy through four callbacks.',
    snippet: defineSnippet({
      id: 'dialog-angular-policy',
      language: 'angular',
      label: 'One guard for every way out',
      source: `<sl-dialog [(open)]="open" (openChangeRequest)="refuseWhileSaving($event)">…</sl-dialog>`,
    }),
  },
  {
    id: 'focus',
    title: 'Where focus goes, and where it comes back to',
    note: 'By default the first tabbable element, and the trigger again on close. initialFocus names another element — a search input, or the panel itself for content that has to be read before it is operated, which is the APG’s own note.',
    snippet: defineSnippet({
      id: 'dialog-angular-focus',
      language: 'angular',
      label: 'Naming the element focus lands on',
      source: `<sl-dialog [initialFocus]="email" [(open)]="open">
  <div slDialogBody>
    <input #email slTextField aria-label="E-mail" />
  </div>
</sl-dialog>`,
    }),
  },
  {
    id: 'loading',
    title: 'Open before the content arrived',
    note: 'The body carries aria-busy and keeps a floor so the panel does not jump to size when the data lands. The header, the close button and Escape all stay operable: a loading dialog a reader cannot leave is the worse failure of the two.',
    snippet: defineSnippet({
      id: 'dialog-angular-loading',
      language: 'angular',
      label: 'Busy, and still closable',
      source: `<sl-dialog [loading]="invoice() === undefined" [(open)]="open">
  <header slDialogHeader>
    <h2 slDialogTitle>Fatura 4471</h2>
    <button slDialogClose></button>
  </header>
  <div slDialogBody><span slSkeleton shape="text"></span></div>
</sl-dialog>`,
    }),
  },
  {
    id: 'nested',
    title: 'A layer opened from a layer',
    note: 'Escape reaches the topmost one only, and a layer that refuses stops the request reaching the one beneath it. The depth comes from the single stack dismissable-layer keeps, so nothing here states a z-index.',
    snippet: defineSnippet({
      id: 'dialog-angular-nested',
      language: 'angular',
      label: 'A confirmation over a dialog',
      source: `<sl-dialog #outer="slDialog" [(open)]="open">
  <div slDialogBody>
    <button [slDialogTrigger]="inner">Cancelar assinatura</button>
    <sl-alert-dialog #inner="slAlertDialog">…</sl-alert-dialog>
  </div>
</sl-dialog>`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A ninety-character unbroken token in the title would widen a centred panel past both edges of the layer at once; overflow-wrap and a zero minimum are the pair that answer it. Long German and right-to-left strings are in the same scene.',
    snippet: defineSnippet({
      id: 'dialog-angular-content',
      language: 'angular',
      label: 'A title with nowhere to break',
      source: `<h2 slDialogTitle>deployment-pipeline-eu-west-1-production-rollback-2026-09-04T01</h2>`,
    }),
  },
  {
    id: 'composition',
    title: 'Replacing a part, and reaching the instance',
    note: 'render substitutes the element of every part, which is how the trigger becomes a Button. The ref on Dialog is a handle with open, close and focus — the three actions a consumer cannot express declaratively.',
    snippet: defineSnippet({
      id: 'dialog-angular-composition',
      language: 'angular',
      label: 'The trigger is the consumer’s own button',
      source: `<button slButton variant="outline" [slDialogTrigger]="d">Editar projeto</button>`,
    }),
  },
  {
    id: 'defaults',
    title: 'Deciding once for the application',
    note: 'Eight decisions an application takes once instead of eight props on every dialog in a product. Angular Material is the only surveyed library with an equivalent, and a dialog that states one itself still wins.',
    snippet: defineSnippet({
      id: 'dialog-angular-defaults',
      language: 'ts',
      label: 'Eight decisions, taken once',
      source: `bootstrapApplication(App, {
  providers: [provideDialogDefaults({ size: 'lg', placement: 'top', fullScreen: 'never' })],
});`,
    }),
  },
  {
    id: 'accessibility',
    title: 'The pattern’s table, and what it costs',
    note: 'Tab and Shift+Tab wrap inside the layer, Escape closes the topmost one, and the background is inert to the pointer and to the accessibility tree at once. All three are JavaScript here, because the platform’s dialog element is declined.',
    snippet: defineSnippet({
      id: 'dialog-angular-accessibility',
      language: 'angular',
      label: 'Reading the reason off the request',
      source: `<sl-dialog [(open)]="open" (openChangeRequest)="report($event.reason, $event.result)">
  …
</sl-dialog>`,
    }),
  },
];

const alertScenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'A confirmation opened inside the scene. Focus lands on the least destructive action, an outside press does nothing at all, and Escape answers because a member with a cancel action can always cancel.',
    snippet: defineSnippet({
      id: 'alert-dialog-angular-playground',
      language: 'angular',
      label: 'A question and two answers',
      source: `<button slButton tone="danger" variant="outline" [slDialogTrigger]="d">Excluir projeto</button>
<sl-alert-dialog #d="slAlertDialog" [(open)]="open">
  <header slDialogHeader>
    <span slAlertDialogIcon></span>
    <h2 slDialogTitle>Excluir este projeto?</h2>
    <p slDialogDescription>
      O projeto e seus 42 documentos saem para todo mundo. Isso não pode ser desfeito.
    </p>
  </header>
  <footer slDialogFooter>
    <button slButton variant="outline" tone="secondary" slAlertDialogCancel>Manter projeto</button>
    <button slButton tone="danger" slAlertDialogAction>Excluir projeto</button>
  </footer>
</sl-alert-dialog>`,
    }),
  },
  {
    id: 'tones',
    title: 'What kind of decision this is',
    note: 'Each tone carries its own mark, so the register survives a reader who cannot tell the colours apart and forced colours, where every tone ground becomes one system colour and the silhouette is all that is left.',
    snippet: defineSnippet({
      id: 'alert-dialog-angular-tones',
      language: 'angular',
      label: 'danger, warning and the rest',
      source: `<sl-alert-dialog tone="warning" [(open)]="open">…</sl-alert-dialog>`,
    }),
  },
  {
    id: 'actions',
    title: 'Two controls, each saying what it does',
    note: 'Labels name the action rather than answering a question — “Excluir projeto”, not “Sim”. The action closes with submit and the cancel with dismiss, so a consumer reading the reason knows which one the reader chose.',
    snippet: defineSnippet({
      id: 'alert-dialog-angular-actions',
      language: 'angular',
      label: 'Concrete labels, and the result each carries',
      source: `<footer slDialogFooter>
  <button slButton slAlertDialogCancel>Manter projeto</button>
  <button slButton slAlertDialogAction value="deleted">Excluir projeto</button>
</footer>`,
    }),
  },
  {
    id: 'policy',
    title: 'What can and cannot dismiss it',
    note: 'An outside press never closes an alert dialog, whatever the consumer asks for. Ark and React Aria make the role a prop, so setting role="alertdialog" and forgetting the policy ships a destructive confirmation a stray click dismisses.',
    snippet: defineSnippet({
      id: 'alert-dialog-angular-policy',
      language: 'angular',
      label: 'Escape, for a cancel that is not safe',
      source: `<sl-alert-dialog escape="none" [(open)]="open">…</sl-alert-dialog>`,
    }),
  },
  {
    id: 'focus',
    title: 'The safest thing under the reader’s hands',
    note: 'Focus lands on the cancel action rather than on the first tabbable element, which is what the APG advises for a step that is not easily reversible. It is a default of the member, not something a consumer remembers to set.',
    snippet: defineSnippet({
      id: 'alert-dialog-angular-focus',
      language: 'angular',
      label: 'Cancel first, by default',
      source: `<sl-alert-dialog initialFocus="cancel" [(open)]="open">…</sl-alert-dialog>`,
    }),
  },
  {
    id: 'content',
    title: 'A confirmation that has more to say',
    note: 'A body between the header and the actions holds the list of what is about to go. The description stays the one sentence aria-describedby announces, so the reader hears the consequence before the detail.',
    snippet: defineSnippet({
      id: 'alert-dialog-angular-content',
      language: 'angular',
      label: 'Description, then the detail',
      source: `<header slDialogHeader>
  <span slAlertDialogIcon></span>
  <h2 slDialogTitle>Excluir 3 documentos?</h2>
  <p slDialogDescription>Isso não pode ser desfeito.</p>
</header>`,
    }),
  },
  {
    id: 'composition',
    title: 'The actions are the consumer’s own buttons',
    note: 'render hands each control every attribute the family wrote, so the danger button is the library’s Button with the family’s behaviour on it — nothing is reimplemented and nothing is wrapped.',
    snippet: defineSnippet({
      id: 'alert-dialog-angular-composition',
      language: 'angular',
      label: 'A Button that also closes the layer',
      source: `<button slButton tone="danger" slAlertDialogAction>Excluir projeto</button>`,
    }),
  },
  {
    id: 'accessibility',
    title: 'What the role changes, and what it does not',
    note: 'role="alertdialog" and a mandatory aria-describedby are the two things the pattern adds; the keyboard is the modal dialog’s. The trigger still says aria-haspopup="dialog", because the property has no alertdialog token.',
    snippet: defineSnippet({
      id: 'alert-dialog-angular-accessibility',
      language: 'angular',
      label: 'The description the pattern requires',
      source: `<p slDialogDescription>O projeto e seus 42 documentos saem para todo mundo.</p>`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: '(openChangeRequest)',
    payload: 'DialogChangeRequest',
    when: 'Before the layer moves, for all six ways it can. It carries the new value, the value it replaces, reason — pointer, keyboard, dismiss, escape, outsidePress, submit or programmatic — result, the originating event, and cancel(), which refuses the move before anything commits. One handler therefore covers Escape, an outside press, the close button and the instance together.',
  },
  {
    name: '(openChange)',
    payload: 'boolean',
    when: 'After the value moved, from the model() signal, so a template may write [(open)] and nothing else. It says what the state is and not why it got there; the reason is on the request above.',
  },
  {
    name: '(fullscreenChangeRequest)',
    payload: 'DialogFullscreenRequest',
    when: 'Before the panel takes the layer or gives it back. It carries the new value, the value it replaces, reason — pointer, keyboard or programmatic — the originating event, and cancel(), which refuses the move before anything commits.',
  },
  {
    name: '(fullscreenChange)',
    payload: 'boolean',
    when: 'After the state moved, from the model() signal, so a template may write [(fullscreen)] and nothing else.',
  },
  {
    name: '(closed)',
    payload: 'string | undefined',
    when: 'Once the layer has actually closed, with the result the close carried. It is afterClosed() from Angular Material, as an output rather than as an observable a service hands back.',
  },
];

const composition = apiRows([
  [
    'the directive on your own element',
    'attribute selector',
    '—',
    'slDialogTrigger, slDialogHeader, slDialogTitle, slDialogDescription, slDialogBody, slDialogFooter, slDialogClose, slAlertDialogIcon, slAlertDialogCancel, slAlertDialogAction',
    'Every part but the layer itself is a directive on the element the consumer wrote, which is what this ecosystem composes with. React reaches the same place with render, because there the component owns the tag',
  ],
  [
    'exportAs',
    "'slDialog' | 'slAlertDialog'",
    '—',
    'sl-dialog, sl-alert-dialog',
    'A template reference variable reaches the instance, which is what links a trigger to a dialog anywhere in the template. It is also why this binding needs no provider component around the two, where React does',
  ],
  [
    'openDialog(), close(result), focus()',
    '() => void',
    '—',
    'the instance',
    'The three actions a consumer cannot express declaratively. MatDialog.open(Component) is declined: with @if and signals the declarative form is three lines, and what is genuinely lost — opening from a service with no template in scope — is named rather than hidden',
  ],
  [
    '--slotted-dialog-measure',
    'length',
    'from size',
    'the root part',
    'The panel’s measure, for the width the five steps do not hold — a two-column form at 46rem, a media viewer at the width of its own image. A family token rather than a prop, so it is set per instance with a style attribute, per region with a rule, or once for an application in the theme; every step reads it, so an explicit measure wins over the step whichever step is asked for',
  ],
  [
    'container',
    'Element | null',
    '—',
    'sl-dialog, sl-alert-dialog',
    'A parent for this layer alone instead of the shared portal root. The sl-dialog host stays where it was written and is the portal’s origin, so the layer inherits the scheme, density, theme and direction of the region around it whether a trigger exists or not',
  ],
  [
    'provideDialogDefaults()',
    '{ size, placement, scroll, mount, fullScreen, modal, escape, outsidePress }',
    '—',
    'an injector',
    'The eight decisions an application takes once, through DIALOG_DEFAULTS. A dialog that states any of them itself still wins, because an explicit consumer value always does',
  ],
]);

const accessibility = [
  'The pattern is the WAI-ARIA APG’s Dialog (Modal) — w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — and its whole keyboard table is answered: Tab moves to the next tabbable element inside the layer and wraps from the last to the first, Shift+Tab wraps the other way, and Escape closes. Escape reaches the topmost layer only, and a layer that refuses it stops the request reaching the one beneath, so one press never closes two.',
  'The panel carries role="dialog", aria-labelledby its title and aria-describedby its description — each written only when that part was actually rendered, because a reference to an id nothing carries is worse than no accessible name at all. A consumer’s own aria-label survives and suppresses aria-labelledby rather than competing with it.',
  'aria-modal="true" appears only while the layer is modal, which is the only state in which the background is genuinely unreachable: dismissable-layer writes inert on every sibling up to the document root, which takes the page out of the accessibility tree as well as out of the pointer’s reach. The APG warns that marking a dialog modal without doing both has severe consequences for the readers who rely on the mark, so modal={false} writes neither.',
  'Focus moves into the layer on open — the first tabbable element by default, or the panel itself for content whose structure has to be read first, which is the APG’s own note — and returns to the element that held it when the layer opened. A trigger that has since left the document, because the dialog deleted the row it was opened from, falls back to that row’s nearest connected ancestor rather than dropping focus on the body.',
  'The platform’s own dialog element is declined, and the cost is written rather than hidden: containment, inertness and Escape are all JavaScript here, and a page with scripting disabled has no dialog at all. What it buys is one z-index stack shared with every other overlay in the library — an element in the browser’s top layer paints above everything regardless of z-index, so a Select opened inside one would render behind the dialog it belongs to.',
  'The close button is an inner control rather than a Button (R2): its box is the mark plus a step of air on each side, floored at --slotted-target-min, so the target clears the WCAG 2.2 minimum of 24 by 24 pixels in both axes. Its mark is a mask from a glyph token, never a character.',
  'The panel carries a border as well as a shadow. Every shadow token is none under forced colours and --slotted-scrim becomes an opaque Canvas, so a panel separated only by elevation would sit on an opaque ground with nothing marking its edge.',
];

const alertAccessibility = [
  'The pattern is the WAI-ARIA APG’s Alert and Message Dialogs — w3.org/WAI/ARIA/apg/patterns/alertdialog/ — which is the modal dialog pattern with two additions. The keyboard is unchanged: Tab and Shift+Tab wrap inside the layer and Escape closes it.',
  'The panel carries role="alertdialog" and aria-describedby is mandatory rather than optional. The family throws when no description part is rendered, because a confirmation announced as a title and two buttons, with the sentence saying what is about to be destroyed left out, is exactly the failure the requirement exists for.',
  'Focus lands on the cancel action rather than on the first tabbable element. That is the APG’s note for a dialog holding the final step of a process that is not easily reversible, and it is a default of the member rather than something a consumer sets — Ark and React Aria make the role a prop, so a consumer who sets it and forgets ships a destructive confirmation focused on the destructive button.',
  'An outside press never closes it, whatever is asked for, and the layer is always modal. Escape stays an axis: it is accepted because a member that requires a cancel action can always cancel, and a consumer whose cancel is not safe writes escape="none".',
  'There is no close part. A ✕ in the corner beside a Cancel button is two controls for one outcome, and the one in the corner says nothing about which outcome it takes; the family throws rather than rendering it.',
  'The tone is carried by a mark as well as by a colour, which is WCAG 2.2 SC 1.4.1. Under forced colours the mark is the only thing left, because every tone ground becomes one system colour there.',
];

const snippets = [
  defineSnippet({
    id: 'dialog-angular-anatomy',
    language: 'angular',
    label: 'Anatomy, as it reaches the DOM',
    source: `<div
  data-ui="dialog"
  data-part="root"
  data-size="md"
  data-placement="center"
  data-scroll="content"
  data-mount="active"
  data-full-screen="narrow"
  data-outside-press="close"
  data-modal
  data-open
>
  <div data-part="backdrop"></div>
  <div data-part="viewport">
    <div
      data-part="content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="d-t"
      aria-describedby="d-d"
    >
      <header data-part="header">
        <h2 data-part="title" id="d-t">Editar projeto</h2>
        <p data-part="description" id="d-d">O nome é visível para todo o espaço.</p>
        <button data-part="close" type="button" aria-label="Close"></button>
      </header>
      <div data-part="body">…</div>
      <footer data-part="footer">…</footer>
    </div>
  </div>
</div>`,
  }),
  defineSnippet({
    id: 'dialog-theming',
    language: 'css',
    label: 'Retuning the family for an application',
    source: `[data-ui='dialog'] {
  /* The measure the five size steps do not hold. It wins over the step. */
  --slotted-dialog-measure: 46rem;
  --slotted-dialog-scrim: rgb(12 20 40 / 0.6);
  --slotted-dialog-radius: var(--slotted-radius-lg);
  --slotted-dialog-border-color: var(--slotted-border-subtle);
  --slotted-dialog-footer-surface: transparent;
}`,
  }),
];

const sharedApi: ApiTuple[] = [
  [
    'open',
    'boolean',
    '—',
    'sl-dialog, sl-alert-dialog',
    'Present at all means the consumer owns the state, for the life of the component. The family then asks and waits rather than moving itself',
  ],
  [
    'defaultOpen',
    'boolean',
    '—',
    'sl-dialog, sl-alert-dialog',
    'The value an uncontrolled layer starts from, read once. A later change to it does not silently become new state',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg' | 'xl' | 'full'",
    'md',
    'sl-dialog, provideDialogDefaults',
    'The panel’s measure. Five named steps rather than a pixel string, because a theme can retune a step; a consumer needing an exact measure still writes max-inline-size on the content part',
  ],
  [
    'placement',
    "'center' | 'top'",
    'center',
    'sl-dialog, sl-alert-dialog, provideDialogDefaults',
    'Where the panel sits. top is for a panel that grows as the reader types, because a centred one moves under the cursor with every new line',
  ],
  [
    'scroll',
    "'content' | 'viewport'",
    'content',
    'sl-dialog, sl-alert-dialog, provideDialogDefaults',
    'content bounds the panel to the layer and scrolls its body, so the actions stay on screen; viewport scrolls the whole panel. The viewport also scrolls as a last resort under content, for a panel with no row that can shrink',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'sl-dialog, sl-alert-dialog, provideDialogDefaults',
    'When the layer exists. active drops it once the exit is over, lazy builds it on the first open and keeps it, eager builds it up front and hides it with content-visibility and inert',
  ],
  [
    'escape',
    "'close' | 'none'",
    'close',
    'sl-dialog, sl-alert-dialog, provideDialogDefaults',
    'Whether Escape asks to close. It reaches the topmost layer only, and a layer that refuses stops the request reaching the one beneath it',
  ],
  [
    'loading',
    'boolean',
    'false',
    'sl-dialog, sl-alert-dialog',
    'The body carries aria-busy and keeps a floor so the panel does not jump to size when the content lands. Nothing is disabled: a dialog a reader cannot leave is the worse failure',
  ],
  [
    'initialFocus',
    "'first' | 'container' | 'cancel' | RefObject | false",
    'first',
    'sl-dialog',
    'Where focus goes on open. container is the panel itself, for content whose structure has to be read before it is operated — the APG’s own note for a dialog holding a list or a table',
  ],
  [
    'finalFocus',
    'RefObject | false',
    '—',
    'sl-dialog, sl-alert-dialog',
    'Where focus goes on close. Unstated returns it to the element that held it when the layer opened, which is the trigger in the ordinary case',
  ],
  [
    'value',
    'string',
    '—',
    'slDialogClose, slAlertDialogCancel, slAlertDialogAction',
    'The result the close carries out on the request, which is what the platform calls returnValue and what Angular Material returns from afterClosed()',
  ],
];

export const ANGULAR_DIALOG_DOCS = {
  dialog: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      ...sharedApi,
      [
        'modal',
        'boolean',
        'true',
        'sl-dialog, provideDialogDefaults',
        'Whether the background is inert, the scroll is locked and focus is contained. false writes no aria-modal, because the APG requires the mark only where all of that is actually true',
      ],
      [
        'outsidePress',
        "'close' | 'none'",
        'close',
        'sl-dialog, provideDialogDefaults',
        'Whether a press outside the layer asks to close it. AlertDialog fixes it at none',
      ],
      [
        'back',
        "'close' | 'none'",
        'close',
        'sl-dialog, provideDialogDefaults',
        "The platform's way back — a phone's gesture, a browser's button — closes the layer instead of leaving the page, while it is modal: @slotted/core/dismissable-layer holds one history entry per modal layer and answers the popstate that leaves it with the reason back",
      ],
      [
        'surface',
        "'panel' | 'plain'",
        'panel',
        'sl-dialog, provideDialogDefaults',
        'Whether the family paints the panel. plain turns off the ground, the border, the radius, the shadow, the rows and the padding, and keeps everything that is not paint — so the layer can be wrapped around a slCard, a media viewer or an image at its own aspect ratio. The cost is that a plain panel does not keep its footer on screen for a long body, because the rows go with the paint',
      ],
      [
        'fullScreen',
        "'never' | 'narrow' | 'always'",
        'narrow',
        'sl-dialog, provideDialogDefaults',
        'When the panel spends the whole layer, losing its radius, its margins and its measure. narrow is a container query on the layer’s own inline size, at a literal breakpoint, because a container condition cannot hold a custom property',
      ],
      [
        'fullscreenToggle',
        'boolean',
        'false',
        'sl-dialog',
        'Whether slDialogHeader appends the control that hands the layer to the panel. Off: a dialog holds one task and most tasks are the size the consumer chose. It is the reader’s question, where fullScreen is the consumer’s',
      ],
      [
        'fullscreen',
        'boolean',
        'false',
        'sl-dialog',
        'The state the control sets. Two-way, as open is, so a template writes [(fullscreen)] and the consumer owns it as soon as they bind it',
      ],
      [
        'defaultFullscreen',
        'boolean',
        'false',
        'sl-dialog',
        'The state an uncontrolled layer opens in. In Angular it is the initial value of [(fullscreen)]: one model rather than a pair, the shape open already has',
      ],
    ]),
    composition,
    accessibility,
    snippets,
  },
  alertDialog: {
    imports: alertImports,
    anatomy: alertAnatomy,
    scenes: alertScenes,
    events,
    api: apiRows([
      ...sharedApi.map((row) =>
        row[0] === 'size'
          ? ([
              'size',
              "'sm' | 'md' | 'lg' | 'xl' | 'full'",
              'sm',
              'sl-alert-dialog',
              'The panel’s measure. A confirmation defaults one step narrower than a dialog, because a question with two answers does not need the width of a form',
            ] as ApiTuple)
          : row[0] === 'initialFocus'
            ? ([
                'initialFocus',
                "'first' | 'container' | 'cancel' | RefObject | false",
                'cancel',
                'sl-alert-dialog',
                'Where focus goes on open. cancel is the default and the APG’s own advice for a step that is not easily reversible',
              ] as ApiTuple)
            : row,
      ),
      [
        'tone',
        "'accent' | 'secondary' | 'success' | 'warning' | 'danger'",
        'danger',
        'sl-alert-dialog',
        'What kind of decision this is. It decides the mark AlertDialogIcon draws and the colour it takes, so the register survives forced colours and a reader who cannot tell the colours apart',
      ],
      [
        'modal',
        'boolean',
        'true',
        'sl-alert-dialog',
        'Fixed. A confirmation whose background is reachable is a confirmation a stray click can walk away from',
      ],
      [
        'outsidePress',
        "'close' | 'none'",
        'none',
        'sl-alert-dialog',
        'Fixed. An outside press never closes an alert dialog, which is one of the two rules the pattern gives the member',
      ],
      [
        'back',
        "'close' | 'none'",
        'close',
        'sl-alert-dialog',
        "The platform's way back cancels a confirmation as Escape does: a modal layer holds one history entry, and the popstate that leaves it closes the layer with the reason back",
      ],
      [
        'surface',
        "'panel' | 'plain'",
        'panel',
        'sl-alert-dialog',
        'Whether the family paints the panel. A confirmation almost never wants plain — the panel is the interruption — but the axis is here because the member declares the same default',
      ],
      [
        'fullScreen',
        "'never' | 'narrow' | 'always'",
        'never',
        'sl-alert-dialog',
        'A confirmation keeps its margins at every width. Taking the whole screen for a question with two answers reads as a page rather than as an interruption',
      ],
    ]),
    composition,
    accessibility: alertAccessibility,
    snippets: [
      defineSnippet({
        id: 'alert-dialog-angular-anatomy',
        language: 'angular',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div
  data-ui="dialog"
  data-part="root"
  data-size="sm"
  data-tone="danger"
  data-outside-press="none"
  data-modal
  data-open
>
  <div data-part="backdrop"></div>
  <div data-part="viewport">
    <div
      data-part="content"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="a-t"
      aria-describedby="a-d"
    >
      <header data-part="header">
        <span data-part="icon" aria-hidden="true"></span>
        <h2 data-part="title" id="a-t">Excluir este projeto?</h2>
        <p data-part="description" id="a-d">Isso não pode ser desfeito.</p>
      </header>
      <footer data-part="footer">
        <button data-part="cancel" type="button">Manter projeto</button>
        <button data-part="action" type="button">Excluir projeto</button>
      </footer>
    </div>
  </div>
</div>`,
      }),
      snippets[1] as never,
    ],
  },
} as const;
