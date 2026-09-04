import popoverTokens from '@slotted/styles/popover/tokens.json';
import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const ANGULAR_POPOVER_TOKENS = popoverTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Popover decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  providePopoverDefaults,\n  SlPopover,\n  SlPopoverAnchor,\n  SlPopoverArrow,\n  SlPopoverBody,\n  SlPopoverClose,\n  SlPopoverContent,\n  SlPopoverDescription,\n  SlPopoverFooter,\n  SlPopoverHeader,\n  SlPopoverLayer,\n  SlPopoverTitle,\n  SlPopoverTrigger,\n} from '@slotted/angular/popover';",
  selector:
    '[slPopover] on an ng-container, [slPopoverTrigger] on the control, ng-template[slPopoverLayer], [slPopoverContent], and one directive per part inside it',
  exportAs: 'slPopover',
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div',
    required: true,
    purpose:
      'The layer, built by ng-template[slPopoverLayer]. It is what the positioner writes position, left and top onto, and what scales and fades. Its padding is the gap between the trigger and the panel, so the arrow has a band to stand in. Carries data-ui="popover", data-side, data-align, data-width and data-open.',
  },
  {
    part: 'content',
    element: 'div',
    required: true,
    purpose:
      'The panel: role="dialog", tabindex="-1", named by its title and described by its description when those parts are present. aria-modal is never written, because it is not modal.',
  },
  {
    part: 'header',
    element: 'div',
    required: false,
    purpose:
      'The title, the description and the close control on one row, which keeps its height while the body scrolls under it.',
  },
  {
    part: 'title',
    element: 'div, or the element render returns',
    required: false,
    purpose:
      'The panel’s accessible name. A div by default, for the reason Result State records: a heading belongs in the document outline, and only the page knows whether this one does.',
  },
  {
    part: 'description',
    element: 'p',
    required: false,
    purpose: 'One line under the title, referenced by the panel rather than announced.',
  },
  {
    part: 'body',
    element: 'div',
    required: false,
    purpose:
      'The only part that scrolls, bounded by --slotted-positioner-available-height. It carries a scroll shadow made of the panel’s own text colour, so a cut line reads as “there is more” rather than as a fault.',
  },
  {
    part: 'footer',
    element: 'div',
    required: false,
    purpose: 'The actions row, separated by a rule and pinned under the body.',
  },
  {
    part: 'close',
    element: 'button',
    required: false,
    purpose:
      'The pointer’s way out — the keyboard has Escape, and a reader on a touch device has no Escape key. Its mark is a mask from the foundation glyph set and its name comes from the provider.',
  },
  {
    part: 'arrow',
    element: 'div',
    required: false,
    purpose:
      'A rotated square painted over the panel, so its background covers the panel border where they meet and its two outward edges continue the outline. It goes **beside** the content inside ng-template[slPopoverLayer], not inside the content: the stylesheet selects it as a direct child of the layer.',
  },
  {
    part: 'focus-guard',
    element: 'span (two of them)',
    required: true,
    purpose:
      'Zero-sized, focusable and hidden from assistive technology, one on each side of the panel. Focus reaching one arrived by Tab at the edge of a layer that lives at the end of the document, so the family closes and puts focus back on the trigger.',
  },
];

const api = apiRows([
  [
    'open',
    'boolean',
    'false',
    'slPopover',
    'Two-way. Bind it with [(open)] and a template owns the value; leave it and the family does.',
  ],
  [
    'defaultOpen',
    'boolean',
    'false',
    'slPopover',
    'The value an uncontrolled popover starts from. In Angular it is the initial value of the two-way open, which is the shape this ecosystem writes.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'slPopover',
    'The width and type step: sixteen, twenty and twenty-four rems, with the inset and the title step to match.',
  ],
  [
    'width',
    "'auto' | 'anchor'",
    'auto',
    'slPopover',
    'auto sizes the panel to its own content and stops at the measure; anchor makes it exactly as wide as the element it hangs from.',
  ],
  [
    'side',
    "'top' | 'bottom' | 'inline-start' | 'inline-end' | 'left' | 'right'",
    'bottom',
    'slPopover',
    'The edge of the anchor the layer prefers. The two logical values resolve against the layer’s own writing direction at every measurement.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'center',
    'slPopover',
    'Where the layer sits along the side it took.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'slPopover',
    'When the layer exists. lazy is what a panel holding an expensive form wants: built on the first open and kept afterwards.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'slPopover',
    'fixed for a layer inside overflow: hidden, absolute for one inside a transform.',
  ],
  ['arrow', 'boolean', 'true', 'slPopover', 'Whether the layer draws the arrow at all.'],
  [
    'autoFocus',
    'boolean',
    'true',
    'slPopover',
    'Whether the panel takes focus on open. It focuses the panel itself rather than its first control, so a reader hears the panel’s name first and a panel whose first control is destructive does not arrive pre-armed.',
  ],
  ['closeOnEscape', 'boolean', 'true', 'slPopover', 'Escape closes, from the topmost layer only.'],
  [
    'closeOnOutsidePress',
    'boolean | (target, event) => boolean',
    'true',
    'slPopover',
    'A press outside closes it. A predicate decides which presses count, for a panel that has to survive a press on a toast beside it.',
  ],
  ['flip', 'boolean', 'true', 'slPopover', 'Move to the opposite side when this one collides.'],
  ['shift', 'boolean', 'true', 'slPopover', 'Slide along the side to stay inside the boundary.'],
  [
    'hideWhenDetached',
    'boolean',
    'false',
    'slPopover',
    'Off, and that is the one asymmetry with Tooltip: a task the reader is halfway through must not blink because the row behind it scrolled.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'slPopover',
    'Whether the layer is rendered into the shared portal root, which keeps the theme, scheme, density and dir of the region it was opened from.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'slPopover',
    'The popover never opens. The trigger’s own disabled is the consumer’s.',
  ],
  [
    'closeLabel',
    'string',
    'Close',
    'slPopover',
    'The close control’s accessible name. The provider is where an application translates it once.',
  ],
  [
    'sideOffset',
    'number',
    '0',
    'slPopover',
    'Distance beyond the standard gap, which is the layer’s own padding rather than empty page.',
  ],
  ['alignOffset', 'number', '0', 'slPopover', 'Distance along the alignment axis.'],
  [
    'collisionPadding',
    'number',
    '8',
    'slPopover',
    'How close to the boundary edge the layer may sit.',
  ],
  [
    'arrowPadding',
    'number',
    '12',
    'slPopover',
    'How far the arrow stays from the panel’s own rounded corner. Larger than the tooltip’s, because the radius is larger.',
  ],
  [
    'initialFocus',
    'Element | string',
    '—',
    'slPopover',
    'What takes focus on open instead of the panel — a search field, usually. A string is a selector read inside the panel.',
  ],
  [
    'finalFocus',
    'Element | string',
    '—',
    'slPopover',
    'Where focus lands after it closes, for the popover that removed the row its trigger was in.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'openChange',
    payload: 'boolean',
    when: 'After the family moves its own value, which is what makes [(open)] two-way.',
  },
  {
    name: 'openChangeRequest',
    payload: 'ChangeRequest<boolean>',
    when: 'Before the panel moves, once per transition. The reason is pointer, keyboard, escape, outsidePress, dismiss or programmatic, and cancel() refuses the move: nothing moves and openChange never fires.',
  },
];

const composition = apiRows([
  [
    'the directive',
    'attribute',
    '—',
    'every part',
    'Every part is a directive on the consumer’s own element, so the title is whatever element the page’s outline wants and the body is whatever the form needs. There is no render prop, because the element is already theirs.',
  ],
  [
    'exportAs',
    'slPopover',
    '—',
    '[slPopover]',
    'A template reference reaches the instance, and with it show(), hide() and toggle() — the actions a template cannot express declaratively.',
  ],
  [
    'slPopoverAnchor',
    'directive',
    '—',
    'composition',
    'What the panel points at, when that is not the button that opened it. It carries no attributes: it is only measured.',
  ],
  [
    'providePopoverDefaults',
    'Provider',
    '—',
    'application or component',
    'Sets every axis and the close control’s name once for the injector. A popover that states any of them still wins, and an aria-label written on the close control wins over both.',
  ],
  [
    'provideSlottedPortalContainer',
    'Provider',
    'document.body',
    'application',
    'Where every layer is rendered. It calls setPortalContainer, so an application shell that builds its own stacking context names it once.',
  ],
  [
    'native attributes',
    'host',
    '—',
    'every part',
    'A part writes only what it owns. A consumer’s own listener on the trigger runs beside the family’s, and preventDefault stops the family’s.',
  ],
]);

const accessibility = [
  'The panel is a dialog and is never modal: aria-modal is not written, nothing behind it becomes inert, and the page keeps scrolling. That is what the APG’s tooltip page names for a surface holding focusable elements, and the modal one is Dialog.',
  'The trigger carries aria-expanded, aria-haspopup="dialog" and aria-controls. The panel is named by its title through aria-labelledby and described by its description; a popover with no title gets neither, and the family invents no name — write aria-label on the content instead.',
  'Focus goes to the panel on open, so a reader hears its name before its contents, and returns to the trigger on close — unless the reader moved the focus themselves, in which case the family leaves it where they put it. initialFocus and finalFocus are the two exceptions a real panel needs.',
  'Tab past the last control reaches a focus guard, which closes the popover and puts focus back on the trigger, from where the reading order continues down the page. It costs one extra Tab and it is the only answer that keeps the order intact without trapping focus in a layer that is not modal.',
];

const snippets = [
  defineSnippet({
    id: 'popover-angular-application-defaults',
    label: 'Application defaults',
    language: 'ts',
    source: `
bootstrapApplication(App, {
  providers: [providePopoverDefaults({ closeLabel: 'Fechar', size: 'lg' })],
});
`,
  }),
  defineSnippet({
    id: 'popover-tokens',
    label: 'Retuning the family',
    language: 'css',
    source: `
:root {
  --slotted-popover-measure: 24rem;
  --slotted-popover-radius: 12px;
  --slotted-popover-gap: 0.75rem;
  --slotted-popover-arrow-size: 0.75rem;
}
`,
  }),
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'A panel on a button',
    note: 'Press the button: the panel opens, takes the focus and says its own name. Escape closes it and the focus goes back where it came from.',
    snippet: defineSnippet({
      id: 'popover-angular-playground',
      label: 'Playground',
      language: 'angular',
      source: `
<ng-container slPopover>
  <button slButton slPopoverTrigger type="button">Filters</button>
  <ng-template slPopoverLayer>
    <div slPopoverContent>
      <div slPopoverHeader>
        <div slPopoverTitle>Filter invoices</div>
        <button slPopoverClose></button>
      </div>
      <div slPopoverBody>Unpaid, overdue and disputed.</div>
    </div>
    <div slPopoverArrow></div>
  </ng-template>
</ng-container>
`,
    }),
  },
  {
    id: 'sizes',
    title: 'Three width steps',
    note: 'Sixteen, twenty and twenty-four rems. The inset and the title step move with the width, and the controls inside move with the density.',
    snippet: defineSnippet({
      id: 'popover-angular-sizes',
      label: 'Sizes',
      language: 'angular',
      source: `
<ng-container slPopover size="lg">
  <button slButton slPopoverTrigger type="button">A form</button>
  <ng-template slPopoverLayer></ng-template>
</ng-container>
`,
    }),
  },
  {
    id: 'width',
    title: 'As wide as its words, or as wide as the field',
    note: 'width="anchor" reads the anchor measured width, which is the one case Radix publishes a custom property for and the shape a filter panel under a search field needs.',
    snippet: defineSnippet({
      id: 'popover-angular-width',
      label: 'Width',
      language: 'angular',
      source: `
<ng-container slPopover align="start" width="anchor">
  <input slPopoverTrigger slTextFieldInput />
  <ng-template slPopoverLayer></ng-template>
</ng-container>
`,
    }),
  },
  {
    id: 'placement',
    title: 'Which edge it takes',
    note: 'The four physical sides and the two logical ones. Switch the toolbar to rtl: inline-start and inline-end swap, left and right stay where they are.',
    snippet: defineSnippet({
      id: 'popover-angular-placement',
      label: 'Placement',
      language: 'angular',
      source: `
<ng-container slPopover align="start" side="inline-end">
  <button slButton slPopoverTrigger type="button">Beside</button>
  <ng-template slPopoverLayer></ng-template>
</ng-container>
`,
    }),
  },
  {
    id: 'anchor',
    title: 'Pointing at something other than the button',
    note: 'The panel hangs off the whole row and the button only opens it. Nothing is written on the anchor: it is measured and nothing else.',
    snippet: defineSnippet({
      id: 'popover-angular-anchor',
      label: 'Anchor',
      language: 'angular',
      source: `
<ng-container slPopover align="end">
  <div slPopoverAnchor>
    <span>Invoice 2026-014</span>
    <button slButton slPopoverTrigger type="button">More</button>
  </div>
  <ng-template slPopoverLayer></ng-template>
</ng-container>
`,
    }),
  },
  {
    id: 'focus',
    title: 'Where the keyboard goes',
    note: 'The first panel takes the focus itself; the second sends it to its search field; the third leaves it on the trigger. Close each one and watch where the focus comes back to.',
    snippet: defineSnippet({
      id: 'popover-angular-focus',
      label: 'Focus',
      language: 'angular',
      source: `
<ng-container slPopover initialFocus="input">
  <button slButton slPopoverTrigger type="button">Search</button>
  <ng-template slPopoverLayer></ng-template>
</ng-container>
`,
    }),
  },
  {
    id: 'dismissal',
    title: 'Every way it closes, and the reason it carries',
    note: 'Escape, a press outside, the close control, the trigger again. Each one reports a different reason, and a consumer may refuse any of them before anything moves.',
    snippet: defineSnippet({
      id: 'popover-angular-dismissal',
      label: 'Dismissal',
      language: 'angular',
      source: `
<ng-container slPopover (openChangeRequest)="refuseWhileDirty($event)">
  <button slButton slPopoverTrigger type="button">Edit</button>
  <ng-template slPopoverLayer></ng-template>
</ng-container>
`,
    }),
  },
  {
    id: 'scrolling',
    title: 'More content than room',
    note: 'The body is the only part that scrolls, bounded by the height the engine says is left. The title and the actions keep theirs, and the fade at the cut says there is more.',
    snippet: defineSnippet({
      id: 'popover-angular-scrolling',
      label: 'Scrolling',
      language: 'angular',
      source: `
<div slPopoverContent>
  <div slPopoverHeader>
    <div slPopoverTitle>Notification settings</div>
  </div>
  <div slPopoverBody>...</div>
  <div slPopoverFooter>
    <button slButton size="sm" type="button">Save</button>
  </div>
</div>
`,
    }),
  },
  {
    id: 'composition',
    title: 'A panel holding a real form',
    note: 'Fields, a footer of actions and a close control. The controls inside are the consumer own and reach their form untouched: the family holds no value of theirs.',
    snippet: defineSnippet({
      id: 'popover-angular-composition',
      label: 'Composition',
      language: 'angular',
      source: `
<div slPopoverBody>
  <div slField>
    <label slFieldLabel>Amount</label>
    <input slFieldControl slTextFieldInput />
  </div>
</div>
`,
    }),
  },
  {
    id: 'nested',
    title: 'A tooltip on a control inside the panel',
    note: 'Two layers at once. The tooltip is a later layer, so it draws above the panel and Escape reaches it first; the panel closes on the second Escape and not before.',
    snippet: defineSnippet({
      id: 'popover-angular-nested',
      label: 'Nested',
      language: 'angular',
      source: `
<div slPopoverFooter>
  <ng-container slTooltip describes="label">
    <button slButton slTooltipTrigger type="button">Clear</button>
    <ng-template slTooltipLayer>
      <div slTooltipContent>Clear the filters</div>
    </ng-template>
  </ng-container>
</div>
`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does',
    note: 'Enter or Space opens it. Tab walks the panel and, past the last control, closes it and returns to the trigger — one extra Tab, and the reading order intact.',
    snippet: defineSnippet({
      id: 'popover-angular-keyboard',
      label: 'Keyboard',
      language: 'angular',
      source: `
<ng-container slPopover (openChangeRequest)="reason = $event.reason">
  <button slButton slPopoverTrigger type="button">Tab through me</button>
  <ng-template slPopoverLayer></ng-template>
</ng-container>
`,
    }),
  },
];

export const ANGULAR_POPOVER_DOCS = {
  popover: { accessibility, anatomy, api, composition, events, imports, scenes, snippets },
};
