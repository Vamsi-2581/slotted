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

export const REACT_DIALOG_TOKENS = dialogTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Dialog decision',
}));

const imports: ReferenceImport = {
  source:
    "import { Dialog, DialogBody, DialogClose, DialogContent, DialogDefaultsProvider, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@slotted/react';",
};

const alertImports: ReferenceImport = {
  source:
    "import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogIcon, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@slotted/react';",
};

const sharedAnatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, in a portal',
    required: true,
    purpose:
      'The layer. Fixed to the viewport, carrying data-ui="dialog", every axis, data-open and data-loading, and a z-index that is --slotted-z-index-overlay plus the depth dismissable-layer writes on it. It is also the query container, so full screen answers the layer’s own inline size rather than the window’s.',
  },
  {
    part: 'trigger',
    element: 'button, or the element render returns',
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
    element: 'header, or the element render returns',
    required: false,
    purpose:
      'Three columns: the mark, the words, and the close button. The mark and the button each keep a column of their own, so a title that wraps grows the row instead of pushing either off the line.',
  },
  {
    part: 'title',
    element: 'h2, or the element render returns',
    required: false,
    purpose:
      'The visible name. aria-labelledby points at it, and only when it is actually rendered — a reference to an id nothing carries is worse than no accessible name at all.',
  },
  {
    part: 'description',
    element: 'p, or the element render returns',
    required: false,
    purpose:
      'The sentence that says what the dialog is about. aria-describedby points at it. Optional here and required in AlertDialog, which is the difference between the two patterns.',
  },
  {
    part: 'body',
    element: 'div, or the element render returns',
    required: false,
    purpose:
      'The one row that scrolls, and the row aria-busy belongs to while the content is still on its way. overscroll-behavior keeps a wheel that reaches its end from scrolling the page behind a non-modal layer.',
  },
  {
    part: 'footer',
    element: 'footer, or the element render returns',
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
      id: 'dialog-react-playground',
      language: 'tsx',
      label: 'A trigger, a panel and the actions',
      source: `<Dialog>
  <DialogTrigger>Editar projeto</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Editar projeto</DialogTitle>
      <DialogDescription>O nome é visível para todo o espaço.</DialogDescription>
      <DialogClose />
    </DialogHeader>
    <DialogBody>
      <TextField label="Nome" defaultValue="Redesign da home" />
    </DialogBody>
    <DialogFooter>
      <Button variant="ghost" tone="secondary">
        Cancelar
      </Button>
      <Button>Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;`,
    }),
  },
  {
    id: 'sizes',
    title: 'How wide the panel is allowed to be',
    note: 'Five named steps rather than a pixel string, because a theme can retune a step and cannot retune width: 600px. full spends the whole layer minus its padding, for a dialog that is a document.',
    snippet: defineSnippet({
      id: 'dialog-react-sizes',
      language: 'tsx',
      label: 'sm through full',
      source: `<Dialog size="lg">
  <DialogTrigger>Ver a nota fiscal</DialogTrigger>
  <DialogContent>…</DialogContent>
</Dialog>;`,
    }),
  },
  {
    id: 'placement',
    title: 'Where the panel sits in the layer',
    note: 'center is right for a panel whose height is settled; top is right for one that grows as the reader types, because a centred panel moves under the cursor every time a line is added.',
    snippet: defineSnippet({
      id: 'dialog-react-placement',
      language: 'tsx',
      label: 'A panel that grows stays put',
      source: `<Dialog placement="top">
  <DialogTrigger>Escrever um comentário</DialogTrigger>
  <DialogContent>…</DialogContent>
</Dialog>;`,
    }),
  },
  {
    id: 'scroll',
    title: 'What scrolls when the content is long',
    note: 'content bounds the panel to the layer and scrolls the body, so the actions stay on screen; viewport scrolls the whole panel, for content that is read rather than acted on. Radix and React Aria ship neither, and a footer past the fold is the default of following their examples.',
    snippet: defineSnippet({
      id: 'dialog-react-scroll',
      language: 'tsx',
      label: 'The body scrolls; the footer stays',
      source: `<Dialog scroll="content">
  <DialogTrigger>Termos de uso</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Termos de uso</DialogTitle>
    </DialogHeader>
    <DialogBody>{longText}</DialogBody>
    <DialogFooter>
      <Button>Aceitar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;`,
    }),
  },
  {
    id: 'fullScreen',
    title: 'Taking the whole layer on a narrow one',
    note: 'A container query at a literal breakpoint, not a viewport query: the layer answers its own inline size, so a dialog inside a named portal container is as narrow as that container rather than as the window.',
    snippet: defineSnippet({
      id: 'dialog-react-full-screen',
      language: 'tsx',
      label: 'narrow, never and always',
      source: `<Dialog fullScreen="always">
  <DialogTrigger>Nova fatura</DialogTrigger>
  <DialogContent>…</DialogContent>
</Dialog>;`,
    }),
  },
  {
    id: 'modal',
    title: 'A layer the page behind can still be used',
    note: 'modal={false} writes no aria-modal, makes nothing inert, locks no scroll and contains no focus. The APG warns that marking a dialog modal without doing all four has severe consequences for the readers who rely on the mark.',
    snippet: defineSnippet({
      id: 'dialog-react-modal',
      language: 'tsx',
      label: 'Non-modal, and honest about it',
      source: `<Dialog modal={false}>
  <DialogTrigger>Detalhes do pedido</DialogTrigger>
  <DialogContent>…</DialogContent>
</Dialog>;`,
    }),
  },
  {
    id: 'policy',
    title: 'Refusing a close, and refusing it once',
    note: 'Six ways to close and one request. A guard on onOpenChange covers Escape, an outside press, the close button and the imperative handle together; Radix reports the same policy through four callbacks.',
    snippet: defineSnippet({
      id: 'dialog-react-policy',
      language: 'tsx',
      label: 'One guard for every way out',
      source: `<Dialog
  open={open}
  onOpenChange={(next, request) => {
    if (!next && saving) return request.cancel();
    setOpen(next);
  }}
>
  …
</Dialog>;`,
    }),
  },
  {
    id: 'focus',
    title: 'Where focus goes, and where it comes back to',
    note: 'By default the first tabbable element, and the trigger again on close. initialFocus names another element — a search input, or the panel itself for content that has to be read before it is operated, which is the APG’s own note.',
    snippet: defineSnippet({
      id: 'dialog-react-focus',
      language: 'tsx',
      label: 'Naming the element focus lands on',
      source: `const search = useRef<HTMLInputElement>(null);

<Dialog initialFocus={search}>
  <DialogTrigger>Buscar</DialogTrigger>
  <DialogContent>
    <DialogBody>
      <TextField label="Buscar" ref={search} />
    </DialogBody>
  </DialogContent>
</Dialog>;`,
    }),
  },
  {
    id: 'loading',
    title: 'Open before the content arrived',
    note: 'The body carries aria-busy and keeps a floor so the panel does not jump to size when the data lands. The header, the close button and Escape all stay operable: a loading dialog a reader cannot leave is the worse failure of the two.',
    snippet: defineSnippet({
      id: 'dialog-react-loading',
      language: 'tsx',
      label: 'Busy, and still closable',
      source: `<Dialog loading={invoice === undefined} defaultOpen>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Fatura 4471</DialogTitle>
      <DialogClose />
    </DialogHeader>
    <DialogBody>
      <Skeleton shape="text" />
    </DialogBody>
  </DialogContent>
</Dialog>;`,
    }),
  },
  {
    id: 'nested',
    title: 'A layer opened from a layer',
    note: 'Escape reaches the topmost one only, and a layer that refuses stops the request reaching the one beneath it. The depth comes from the single stack dismissable-layer keeps, so nothing here states a z-index.',
    snippet: defineSnippet({
      id: 'dialog-react-nested',
      language: 'tsx',
      label: 'A confirmation over a dialog',
      source: `<Dialog>
  <DialogTrigger>Faturamento</DialogTrigger>
  <DialogContent>
    <DialogBody>
      <AlertDialog>
        <DialogTrigger>Cancelar assinatura</DialogTrigger>
        <DialogContent>…</DialogContent>
      </AlertDialog>
    </DialogBody>
  </DialogContent>
</Dialog>;`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A ninety-character unbroken token in the title would widen a centred panel past both edges of the layer at once; overflow-wrap and a zero minimum are the pair that answer it. Long German and right-to-left strings are in the same scene.',
    snippet: defineSnippet({
      id: 'dialog-react-content',
      language: 'tsx',
      label: 'A title with nowhere to break',
      source: `<DialogTitle>deployment-pipeline-eu-west-1-production-rollback-2026-09-04T01</DialogTitle>;`,
    }),
  },
  {
    id: 'composition',
    title: 'Replacing a part, and reaching the instance',
    note: 'render substitutes the element of every part, which is how the trigger becomes a Button. The ref on Dialog is a handle with open, close and focus — the three actions a consumer cannot express declaratively.',
    snippet: defineSnippet({
      id: 'dialog-react-composition',
      language: 'tsx',
      label: 'The trigger is the consumer’s own button',
      source: `<DialogTrigger render={(props) => <Button {...props}>Editar projeto</Button>} />;`,
    }),
  },
  {
    id: 'defaults',
    title: 'Deciding once for the application',
    note: 'Eight decisions an application takes once instead of eight props on every dialog in a product. Angular Material is the only surveyed library with an equivalent, and a dialog that states one itself still wins.',
    snippet: defineSnippet({
      id: 'dialog-react-defaults',
      language: 'tsx',
      label: 'Eight decisions, taken once',
      source: `<DialogDefaultsProvider size="lg" placement="top" fullScreen="never">
  <App />
</DialogDefaultsProvider>;`,
    }),
  },
  {
    id: 'accessibility',
    title: 'The pattern’s table, and what it costs',
    note: 'Tab and Shift+Tab wrap inside the layer, Escape closes the topmost one, and the background is inert to the pointer and to the accessibility tree at once. All three are JavaScript here, because the platform’s dialog element is declined.',
    snippet: defineSnippet({
      id: 'dialog-react-accessibility',
      language: 'tsx',
      label: 'Reading the reason off the request',
      source: `<Dialog onOpenChange={(open, request) => report(request.reason, request.result)}>…</Dialog>;`,
    }),
  },
];

const alertScenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'A confirmation opened inside the scene. Focus lands on the least destructive action, an outside press does nothing at all, and Escape answers because a member with a cancel action can always cancel.',
    snippet: defineSnippet({
      id: 'alert-dialog-react-playground',
      language: 'tsx',
      label: 'A question and two answers',
      source: `<AlertDialog>
  <DialogTrigger>Excluir projeto</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <AlertDialogIcon />
      <DialogTitle>Excluir este projeto?</DialogTitle>
      <DialogDescription>
        O projeto e seus 42 documentos saem para todo mundo. Isso não pode ser desfeito.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <AlertDialogCancel
        render={(props) => <Button {...props} variant="outline" tone="secondary" />}
      >
        Manter projeto
      </AlertDialogCancel>
      <AlertDialogAction render={(props) => <Button {...props} tone="danger" />}>
        Excluir projeto
      </AlertDialogAction>
    </DialogFooter>
  </DialogContent>
</AlertDialog>;`,
    }),
  },
  {
    id: 'tones',
    title: 'What kind of decision this is',
    note: 'Each tone carries its own mark, so the register survives a reader who cannot tell the colours apart and forced colours, where every tone ground becomes one system colour and the silhouette is all that is left.',
    snippet: defineSnippet({
      id: 'alert-dialog-react-tones',
      language: 'tsx',
      label: 'danger, warning and the rest',
      source: `<AlertDialog tone="warning">
  <DialogTrigger>Sair sem salvar</DialogTrigger>
  <DialogContent>…</DialogContent>
</AlertDialog>;`,
    }),
  },
  {
    id: 'actions',
    title: 'Two controls, each saying what it does',
    note: 'Labels name the action rather than answering a question — “Excluir projeto”, not “Sim”. The action closes with submit and the cancel with dismiss, so a consumer reading the reason knows which one the reader chose.',
    snippet: defineSnippet({
      id: 'alert-dialog-react-actions',
      language: 'tsx',
      label: 'Concrete labels, and the result each carries',
      source: `<DialogFooter>
  <AlertDialogCancel>Manter projeto</AlertDialogCancel>
  <AlertDialogAction value="deleted">Excluir projeto</AlertDialogAction>
</DialogFooter>;`,
    }),
  },
  {
    id: 'policy',
    title: 'What can and cannot dismiss it',
    note: 'An outside press never closes an alert dialog, whatever the consumer asks for. Ark and React Aria make the role a prop, so setting role="alertdialog" and forgetting the policy ships a destructive confirmation a stray click dismisses.',
    snippet: defineSnippet({
      id: 'alert-dialog-react-policy',
      language: 'tsx',
      label: 'Escape, for a cancel that is not safe',
      source: `<AlertDialog escape="none">
  <DialogTrigger>Encerrar a migração</DialogTrigger>
  <DialogContent>…</DialogContent>
</AlertDialog>;`,
    }),
  },
  {
    id: 'focus',
    title: 'The safest thing under the reader’s hands',
    note: 'Focus lands on the cancel action rather than on the first tabbable element, which is what the APG advises for a step that is not easily reversible. It is a default of the member, not something a consumer remembers to set.',
    snippet: defineSnippet({
      id: 'alert-dialog-react-focus',
      language: 'tsx',
      label: 'Cancel first, by default',
      source: `<AlertDialog initialFocus="cancel">
  <DialogTrigger>Excluir</DialogTrigger>
  <DialogContent>…</DialogContent>
</AlertDialog>;`,
    }),
  },
  {
    id: 'content',
    title: 'A confirmation that has more to say',
    note: 'A body between the header and the actions holds the list of what is about to go. The description stays the one sentence aria-describedby announces, so the reader hears the consequence before the detail.',
    snippet: defineSnippet({
      id: 'alert-dialog-react-content',
      language: 'tsx',
      label: 'Description, then the detail',
      source: `<DialogHeader>
  <AlertDialogIcon />
  <DialogTitle>Excluir 3 documentos?</DialogTitle>
  <DialogDescription>Isso não pode ser desfeito.</DialogDescription>
</DialogHeader>;`,
    }),
  },
  {
    id: 'composition',
    title: 'The actions are the consumer’s own buttons',
    note: 'render hands each control every attribute the family wrote, so the danger button is the library’s Button with the family’s behaviour on it — nothing is reimplemented and nothing is wrapped.',
    snippet: defineSnippet({
      id: 'alert-dialog-react-composition',
      language: 'tsx',
      label: 'A Button that also closes the layer',
      source: `<AlertDialogAction render={(props) => <Button {...props} tone="danger" />}>
  Excluir projeto
</AlertDialogAction>;`,
    }),
  },
  {
    id: 'accessibility',
    title: 'What the role changes, and what it does not',
    note: 'role="alertdialog" and a mandatory aria-describedby are the two things the pattern adds; the keyboard is the modal dialog’s. The trigger still says aria-haspopup="dialog", because the property has no alertdialog token.',
    snippet: defineSnippet({
      id: 'alert-dialog-react-accessibility',
      language: 'tsx',
      label: 'The description the pattern requires',
      source: `<DialogDescription>O projeto e seus 42 documentos saem para todo mundo.</DialogDescription>;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: DialogChangeRequest)',
    when: 'Before the layer moves, for all six ways it can. The request carries the new value, the value it replaces, reason — pointer, keyboard, dismiss, escape, outsidePress, submit or programmatic — result, the originating event, and cancel(), which refuses the move before anything commits. One guard therefore covers Escape, an outside press, the close button and the handle together.',
  },
  {
    name: 'onClick, onKeyDown, on every control',
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
    'Substitutes the element a part renders and hands it every attribute the family wrote. It is how the trigger becomes a Button and the actions become the library’s own controls',
  ],
  [
    'ref',
    'Ref<DialogHandle> on Dialog, Ref<HTMLElement> on every part',
    '—',
    'Dialog, AlertDialog, every part',
    'On a part it reaches the element. On the family it is a handle with open(), close(result) and focus() — the three actions a consumer cannot express declaratively, and nothing more',
  ],
  [
    'container',
    'Element | null',
    '—',
    'Dialog, AlertDialog',
    'A parent for this layer alone instead of the shared portal root. An application shell that owns its own stacking context names it here, or once for the whole document with setPortalContainer from @slotted/core/portal',
  ],
  [
    'useDialog()',
    '() => DialogContextValue',
    '—',
    'inside Dialog or AlertDialog',
    'What the parts read: the open state, the identifiers, the axes, and close(reason, result). It throws outside a family rather than rendering a control that closes nothing',
  ],
  [
    'DialogDefaultsProvider',
    '{ size, placement, scroll, mount, fullScreen, modal, escape, outsidePress }',
    '—',
    'a subtree',
    'The eight decisions an application takes once. A dialog that states any of them itself still wins, because an explicit consumer value always does',
  ],
]);

const accessibility = [
  'The pattern is the WAI-ARIA APG’s Dialog (Modal) — w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — and its whole keyboard table is answered: Tab moves to the next tabbable element inside the layer and wraps from the last to the first, Shift+Tab wraps the other way, and Escape closes. Escape reaches the topmost layer only, and a layer that refuses it stops the request reaching the one beneath, so one press never closes two.',
  'The panel carries role="dialog", aria-labelledby its title and aria-describedby its description — each written only when that part was actually rendered, because a reference to an id nothing carries is worse than no accessible name at all. A consumer’s own aria-label survives and suppresses aria-labelledby rather than competing with it.',
  'aria-modal="true" appears only while the layer is modal, which is the only state in which the background is genuinely unreachable: dismissable-layer writes inert on every sibling up to the document root, which takes the page out of the accessibility tree as well as out of the pointer’s reach. The APG warns that marking a dialog modal without doing both has severe consequences for the readers who rely on the mark, so modal={false} writes neither.',
  'Focus moves into the layer on open — the first tabbable element by default, or the panel itself for content whose structure has to be read first, which is the APG’s own note — and returns to the element that held it when the layer opened. A trigger that has since left the document, because the dialog deleted the row it was opened from, falls back to that row’s nearest connected ancestor rather than dropping focus on the body.',
  'The platform’s own dialog element is declined, and the cost is written rather than hidden: containment, inertness and Escape are all JavaScript here, and a page with scripting disabled has no dialog at all. What it buys is one z-index stack shared with every other overlay in the library — an element in the browser’s top layer paints above everything regardless of z-index, so a Select opened inside one would render behind the dialog it belongs to.',
  'The close button is the height of a medium control rather than of its mark, so the target clears the WCAG 2.2 minimum of 24 by 24 pixels in both axes, and the theme grows it again under pointer: coarse. Its mark is a mask from a glyph token, never a character.',
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
    id: 'dialog-react-anatomy',
    language: 'tsx',
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
  <div data-part="backdrop" />
  <div data-part="viewport">
    <div
      data-part="content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="d-t"
      aria-describedby="d-d"
    >
      <header data-part="header">
        <h2 data-part="title" id="d-t">
          Editar projeto
        </h2>
        <p data-part="description" id="d-d">
          O nome é visível para todo o espaço.
        </p>
        <button data-part="close" type="button" aria-label="Close" />
      </header>
      <div data-part="body">…</div>
      <footer data-part="footer">…</footer>
    </div>
  </div>
</div>;`,
  }),
  defineSnippet({
    id: 'dialog-theming',
    language: 'css',
    label: 'Retuning the family for an application',
    source: `[data-ui='dialog'] {
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
    'Dialog, AlertDialog',
    'Present at all means the consumer owns the state, for the life of the component. The family then asks and waits rather than moving itself',
  ],
  [
    'defaultOpen',
    'boolean',
    '—',
    'Dialog, AlertDialog',
    'The value an uncontrolled layer starts from, read once. A later change to it does not silently become new state',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg' | 'xl' | 'full'",
    'md',
    'Dialog, DialogDefaultsProvider',
    'The panel’s measure. Five named steps rather than a pixel string, because a theme can retune a step; a consumer needing an exact measure still writes max-inline-size on the content part',
  ],
  [
    'placement',
    "'center' | 'top'",
    'center',
    'Dialog, AlertDialog, DialogDefaultsProvider',
    'Where the panel sits. top is for a panel that grows as the reader types, because a centred one moves under the cursor with every new line',
  ],
  [
    'scroll',
    "'content' | 'viewport'",
    'content',
    'Dialog, AlertDialog, DialogDefaultsProvider',
    'content bounds the panel to the layer and scrolls its body, so the actions stay on screen; viewport scrolls the whole panel. The viewport also scrolls as a last resort under content, for a panel with no row that can shrink',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'Dialog, AlertDialog, DialogDefaultsProvider',
    'When the layer exists. active drops it once the exit is over, lazy builds it on the first open and keeps it, eager builds it up front and hides it with content-visibility and inert',
  ],
  [
    'escape',
    "'close' | 'none'",
    'close',
    'Dialog, AlertDialog, DialogDefaultsProvider',
    'Whether Escape asks to close. It reaches the topmost layer only, and a layer that refuses stops the request reaching the one beneath it',
  ],
  [
    'loading',
    'boolean',
    'false',
    'Dialog, AlertDialog',
    'The body carries aria-busy and keeps a floor so the panel does not jump to size when the content lands. Nothing is disabled: a dialog a reader cannot leave is the worse failure',
  ],
  [
    'initialFocus',
    "'first' | 'container' | 'cancel' | RefObject | false",
    'first',
    'Dialog',
    'Where focus goes on open. container is the panel itself, for content whose structure has to be read before it is operated — the APG’s own note for a dialog holding a list or a table',
  ],
  [
    'finalFocus',
    'RefObject | false',
    '—',
    'Dialog, AlertDialog',
    'Where focus goes on close. Unstated returns it to the element that held it when the layer opened, which is the trigger in the ordinary case',
  ],
  [
    'value',
    'string',
    '—',
    'DialogClose, AlertDialogCancel, AlertDialogAction',
    'The result the close carries out on the request, which is what the platform calls returnValue and what Angular Material returns from afterClosed()',
  ],
];

export const REACT_DIALOG_DOCS = {
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
        'Dialog, DialogDefaultsProvider',
        'Whether the background is inert, the scroll is locked and focus is contained. false writes no aria-modal, because the APG requires the mark only where all of that is actually true',
      ],
      [
        'outsidePress',
        "'close' | 'none'",
        'close',
        'Dialog, DialogDefaultsProvider',
        'Whether a press outside the layer asks to close it. AlertDialog fixes it at none',
      ],
      [
        'fullScreen',
        "'never' | 'narrow' | 'always'",
        'narrow',
        'Dialog, DialogDefaultsProvider',
        'When the panel spends the whole layer, losing its radius, its margins and its measure. narrow is a container query on the layer’s own inline size, at a literal breakpoint, because a container condition cannot hold a custom property',
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
              'AlertDialog',
              'The panel’s measure. A confirmation defaults one step narrower than a dialog, because a question with two answers does not need the width of a form',
            ] as ApiTuple)
          : row[0] === 'initialFocus'
            ? ([
                'initialFocus',
                "'first' | 'container' | 'cancel' | RefObject | false",
                'cancel',
                'AlertDialog',
                'Where focus goes on open. cancel is the default and the APG’s own advice for a step that is not easily reversible',
              ] as ApiTuple)
            : row,
      ),
      [
        'tone',
        "'accent' | 'secondary' | 'success' | 'warning' | 'danger'",
        'danger',
        'AlertDialog',
        'What kind of decision this is. It decides the mark AlertDialogIcon draws and the colour it takes, so the register survives forced colours and a reader who cannot tell the colours apart',
      ],
      [
        'modal',
        'boolean',
        'true',
        'AlertDialog',
        'Fixed. A confirmation whose background is reachable is a confirmation a stray click can walk away from',
      ],
      [
        'outsidePress',
        "'close' | 'none'",
        'none',
        'AlertDialog',
        'Fixed. An outside press never closes an alert dialog, which is one of the two rules the pattern gives the member',
      ],
      [
        'fullScreen',
        "'never' | 'narrow' | 'always'",
        'never',
        'AlertDialog',
        'A confirmation keeps its margins at every width. Taking the whole screen for a question with two answers reads as a page rather than as an interruption',
      ],
    ]),
    composition,
    accessibility: alertAccessibility,
    snippets: [
      defineSnippet({
        id: 'alert-dialog-react-anatomy',
        language: 'tsx',
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
  <div data-part="backdrop" />
  <div data-part="viewport">
    <div
      data-part="content"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="a-t"
      aria-describedby="a-d"
    >
      <header data-part="header">
        <span data-part="icon" aria-hidden="true" />
        <h2 data-part="title" id="a-t">
          Excluir este projeto?
        </h2>
        <p data-part="description" id="a-d">
          Isso não pode ser desfeito.
        </p>
      </header>
      <footer data-part="footer">
        <button data-part="cancel" type="button">
          Manter projeto
        </button>
        <button data-part="action" type="button">
          Excluir projeto
        </button>
      </footer>
    </div>
  </div>
</div>;`,
      }),
      snippets[1] as never,
    ],
  },
} as const;
