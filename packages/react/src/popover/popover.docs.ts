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

export const REACT_POPOVER_TOKENS = popoverTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Popover decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  Popover,\n  PopoverAnchor,\n  PopoverArrow,\n  PopoverBody,\n  PopoverClose,\n  PopoverContent,\n  PopoverDefaultsProvider,\n  PopoverDescription,\n  PopoverFooter,\n  PopoverHeader,\n  PopoverLayer,\n  PopoverTitle,\n  PopoverTrigger,\n} from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div',
    required: true,
    purpose:
      'The layer, rendered by PopoverLayer. It is what the positioner writes position, left and top onto, and what scales and fades. Its padding is the gap between the trigger and the panel, so the arrow has a band to stand in. Carries data-ui="popover", data-side, data-align, data-width and data-open.',
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
      'A rotated square painted over the panel, so its background covers the panel border where they meet and its two outward edges continue the outline. It goes **beside** the content inside PopoverLayer, not inside the content: the stylesheet selects it as a direct child of the layer.',
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
  ['open', 'boolean', '—', 'Popover', 'Present means controlled, for the life of the component.'],
  [
    'defaultOpen',
    'boolean',
    'false',
    'Popover',
    'The value an uncontrolled popover starts from, read once.',
  ],
  [
    'size',
    "'sm' | 'md' | 'lg'",
    'md',
    'Popover',
    'The width and type step: sixteen, twenty and twenty-four rems, with the inset and the title step to match.',
  ],
  [
    'width',
    "'auto' | 'anchor'",
    'auto',
    'Popover',
    'auto sizes the panel to its own content and stops at the measure; anchor makes it exactly as wide as the element it hangs from.',
  ],
  [
    'side',
    "'top' | 'bottom' | 'inline-start' | 'inline-end' | 'left' | 'right'",
    'bottom',
    'Popover',
    'The edge of the anchor the layer prefers. The two logical values resolve against the layer’s own writing direction at every measurement.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'center',
    'Popover',
    'Where the layer sits along the side it took.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'Popover',
    'When the layer exists. lazy is what a panel holding an expensive form wants: built on the first open and kept afterwards.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'Popover',
    'fixed for a layer inside overflow: hidden, absolute for one inside a transform.',
  ],
  ['arrow', 'boolean', 'true', 'Popover', 'Whether the layer draws the arrow at all.'],
  [
    'autoFocus',
    'boolean',
    'true',
    'Popover',
    'Whether the panel takes focus on open. It focuses the panel itself rather than its first control, so a reader hears the panel’s name first and a panel whose first control is destructive does not arrive pre-armed.',
  ],
  ['closeOnEscape', 'boolean', 'true', 'Popover', 'Escape closes, from the topmost layer only.'],
  [
    'closeOnOutsidePress',
    'boolean | (target, event) => boolean',
    'true',
    'Popover',
    'A press outside closes it. A predicate decides which presses count, for a panel that has to survive a press on a toast beside it.',
  ],
  ['flip', 'boolean', 'true', 'Popover', 'Move to the opposite side when this one collides.'],
  ['shift', 'boolean', 'true', 'Popover', 'Slide along the side to stay inside the boundary.'],
  [
    'hideWhenDetached',
    'boolean',
    'false',
    'Popover',
    'Off, and that is the one asymmetry with Tooltip: a task the reader is halfway through must not blink because the row behind it scrolled.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'Popover',
    'Whether the layer is rendered into the shared portal root, which keeps the theme, scheme, density and dir of the region it was opened from.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'Popover',
    'The popover never opens. The trigger’s own disabled is the consumer’s.',
  ],
  [
    'messages',
    'Partial<PopoverMessages>',
    '—',
    'Popover',
    'Words laid over the language in force, key by key: the close control’s accessible name (close). A native aria-label on PopoverClose still wins.',
  ],
  [
    'sideOffset',
    'number',
    '0',
    'Popover',
    'Distance beyond the standard gap, which is the layer’s own padding rather than empty page.',
  ],
  ['alignOffset', 'number', '0', 'Popover', 'Distance along the alignment axis.'],
  [
    'collisionPadding',
    'number',
    '8',
    'Popover',
    'How close to the boundary edge the layer may sit.',
  ],
  [
    'arrowPadding',
    'number',
    '12',
    'Popover',
    'How far the arrow stays from the panel’s own rounded corner. Larger than the tooltip’s, because the radius is larger.',
  ],
  [
    'initialFocus',
    'Element | RefObject | string',
    '—',
    'Popover',
    'What takes focus on open instead of the panel — a search field, usually. A string is a selector read inside the panel.',
  ],
  [
    'finalFocus',
    'Element | RefObject | string',
    '—',
    'Popover',
    'Where focus lands after it closes, for the popover that removed the row its trigger was in.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: PopoverChangeRequest)',
    when: 'Before the panel moves, once per transition. The reason is pointer, keyboard, escape, outsidePress, dismiss or programmatic, and cancel() refuses the move: an uncontrolled popover does not open and no consumer is notified.',
  },
];

const composition = apiRows([
  [
    'render',
    '(props) => ReactNode',
    '—',
    'every part',
    'Renders the part into the consumer’s own element. The trigger nearly always uses it, and the title uses it to become a heading where the page has an outline for one.',
  ],
  [
    'ref',
    'Ref<PopoverHandle>',
    '—',
    'Popover',
    'open(), close() and reposition() — the three actions a consumer cannot express declaratively.',
  ],
  [
    'PopoverAnchor',
    'component',
    '—',
    'composition',
    'What the panel points at, when that is not the button that opened it — a row whose action menu hangs off the row. It carries no attributes: it is only measured.',
  ],
  [
    'PopoverDefaultsProvider',
    'component',
    '—',
    'application',
    'Sets every axis and the close control’s name once for the subtree. A popover that states any of them still wins.',
  ],
  [
    'container',
    'Element | null',
    'document.body',
    'PopoverDefaultsProvider',
    'Where every layer under the provider is rendered. It calls setPortalContainer, so an application shell that builds its own stacking context names it once.',
  ],
  [
    'native props',
    'ComponentPropsWithRef',
    '—',
    'every part',
    'Each part’s props are its element’s own, extended. A consumer’s onClick on the trigger runs before the family’s, and preventDefault stops the family’s.',
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
    id: 'popover-react-application-defaults',
    label: 'Application defaults',
    language: 'tsx',
    source: `
<PopoverDefaultsProvider size="lg">
  <App />
</PopoverDefaultsProvider>;
`,
  }),
  defineSnippet({
    id: 'popover-public-tokens',
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
      id: 'popover-react-playground',
      label: 'Playground',
      language: 'tsx',
      source: `
<Popover>
  <PopoverTrigger render={(props) => <Button {...props}>Filters</Button>} />
  <PopoverLayer>
    <PopoverContent>
      <PopoverHeader>
        <PopoverTitle>Filter invoices</PopoverTitle>
        <PopoverClose />
      </PopoverHeader>
      <PopoverBody>Unpaid, overdue and disputed.</PopoverBody>
    </PopoverContent>
    <PopoverArrow />
  </PopoverLayer>
</Popover>;
`,
    }),
  },
  {
    id: 'sizes',
    title: 'Three width steps',
    note: 'Sixteen, twenty and twenty-four rems. The inset and the title step move with the width, and the controls inside move with the density.',
    snippet: defineSnippet({
      id: 'popover-react-sizes',
      label: 'Sizes',
      language: 'tsx',
      source: `
<Popover size="lg">
  <PopoverTrigger render={(props) => <Button {...props}>A form</Button>} />
  <PopoverLayer>{/* … */}</PopoverLayer>
</Popover>;
`,
    }),
  },
  {
    id: 'width',
    title: 'As wide as its words, or as wide as the field',
    note: 'width="anchor" reads the anchor’s measured width, which is the one case Radix publishes a custom property for and the shape a filter panel under a search field needs.',
    snippet: defineSnippet({
      id: 'popover-react-width',
      label: 'Width',
      language: 'tsx',
      source: `
<Popover align="start" width="anchor">
  <PopoverTrigger render={(props) => <TextField {...props} />} />
  <PopoverLayer>{/* … */}</PopoverLayer>
</Popover>;
`,
    }),
  },
  {
    id: 'placement',
    title: 'Which edge it takes',
    note: 'The four physical sides and the two logical ones. Switch the toolbar to rtl: inline-start and inline-end swap, left and right stay where they are.',
    snippet: defineSnippet({
      id: 'popover-react-placement',
      label: 'Placement',
      language: 'tsx',
      source: `
<Popover align="start" side="inline-end">
  <PopoverTrigger render={(props) => <Button {...props}>Beside</Button>} />
  <PopoverLayer>{/* … */}</PopoverLayer>
</Popover>;
`,
    }),
  },
  {
    id: 'anchor',
    title: 'Pointing at something other than the button',
    note: 'The panel hangs off the whole row and the button only opens it. Nothing is written on the anchor: it is measured and nothing else.',
    snippet: defineSnippet({
      id: 'popover-react-anchor',
      label: 'Anchor',
      language: 'tsx',
      source: `
<Popover align="end">
  <PopoverAnchor>
    <Row />
    <PopoverTrigger render={(props) => <Button {...props}>⋯</Button>} />
  </PopoverAnchor>
  <PopoverLayer>{/* … */}</PopoverLayer>
</Popover>;
`,
    }),
  },
  {
    id: 'focus',
    title: 'Where the keyboard goes',
    note: 'The first panel takes the focus itself; the second sends it to its search field; the third leaves it on the trigger. Close each one and watch where the focus comes back to.',
    snippet: defineSnippet({
      id: 'popover-react-focus',
      label: 'Focus',
      language: 'tsx',
      source: `
<Popover initialFocus="input">
  <PopoverTrigger render={(props) => <Button {...props}>Search</Button>} />
  <PopoverLayer>{/* … */}</PopoverLayer>
</Popover>;
`,
    }),
  },
  {
    id: 'dismissal',
    title: 'Every way it closes, and the reason it carries',
    note: 'Escape, a press outside, the close control, the trigger again. Each one reports a different reason, and a consumer may refuse any of them before anything moves.',
    snippet: defineSnippet({
      id: 'popover-react-dismissal',
      label: 'Dismissal',
      language: 'tsx',
      source: `
<Popover
  onOpenChange={(open, request) => {
    if (request.reason === 'outsidePress' && dirty) request.cancel();
  }}
>
  <PopoverTrigger render={(props) => <Button {...props}>Edit</Button>} />
  <PopoverLayer>{/* … */}</PopoverLayer>
</Popover>;
`,
    }),
  },
  {
    id: 'scrolling',
    title: 'More content than room',
    note: 'The body is the only part that scrolls, bounded by the height the engine says is left. The title and the actions keep theirs, and the fade at the cut says there is more.',
    snippet: defineSnippet({
      id: 'popover-react-scrolling',
      label: 'Scrolling',
      language: 'tsx',
      source: `
<PopoverContent>
  <PopoverHeader>
    <PopoverTitle>Notification settings</PopoverTitle>
  </PopoverHeader>
  <PopoverBody>{rows}</PopoverBody>
  <PopoverFooter>
    <Button size="sm">Save</Button>
  </PopoverFooter>
</PopoverContent>;
`,
    }),
  },
  {
    id: 'composition',
    title: 'A panel holding a real form',
    note: 'Fields, a footer of actions and a close control. The controls inside are the consumer’s own and reach their form untouched: the family holds no value of theirs.',
    snippet: defineSnippet({
      id: 'popover-react-composition',
      label: 'Composition',
      language: 'tsx',
      source: `
<PopoverBody>
  <Field>
    <FieldLabel>Amount</FieldLabel>
    <CurrencyField name="amount" />
  </Field>
</PopoverBody>;
`,
    }),
  },
  {
    id: 'nested',
    title: 'A tooltip on a control inside the panel',
    note: 'Two layers at once. The tooltip is a later layer, so it draws above the panel and Escape reaches it first; the panel closes on the second Escape and not before.',
    snippet: defineSnippet({
      id: 'popover-react-nested',
      label: 'Nested',
      language: 'tsx',
      source: `
<PopoverFooter>
  <Tooltip describes="label">
    <TooltipTrigger render={(props) => <Button {...props}>⌫</Button>} />
    <TooltipLayer>
      <TooltipContent>Clear the filters</TooltipContent>
    </TooltipLayer>
  </Tooltip>
</PopoverFooter>;
`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does',
    note: 'Enter or Space opens it. Tab walks the panel and, past the last control, closes it and returns to the trigger — one extra Tab, and the reading order intact.',
    snippet: defineSnippet({
      id: 'popover-react-keyboard',
      label: 'Keyboard',
      language: 'tsx',
      source: `
<Popover onOpenChange={(open, request) => report(request.reason)}>
  <PopoverTrigger render={(props) => <Button {...props}>Tab through me</Button>} />
  <PopoverLayer>{/* … */}</PopoverLayer>
</Popover>;
`,
    }),
  },
];

export const REACT_POPOVER_DOCS = {
  popover: { accessibility, anatomy, api, composition, events, imports, scenes, snippets },
};
