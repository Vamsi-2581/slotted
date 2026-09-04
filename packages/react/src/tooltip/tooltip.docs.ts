import tooltipTokens from '@slotted/styles/tooltip/tokens.json';
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

export const REACT_TOOLTIP_TOKENS = tooltipTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Tooltip decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  Tooltip,\n  TooltipArrow,\n  TooltipContent,\n  TooltipDefaultsProvider,\n  TooltipLayer,\n  TooltipTrigger,\n} from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div',
    required: true,
    purpose:
      'The layer, rendered by TooltipLayer. It is what the positioner writes position, left and top onto, and what scales and fades; its padding is the gap between the trigger and the surface, which is what lets the pointer cross onto a hoverable tooltip without leaving it. Carries data-ui="tooltip", data-side, data-align, data-open and data-detached.',
  },
  {
    part: 'content',
    element: 'div',
    required: true,
    purpose:
      'The painted surface, with role="tooltip". It is the element the trigger points at with aria-describedby, or with aria-labelledby under describes="label".',
  },
  {
    part: 'arrow',
    element: 'div',
    required: false,
    purpose:
      'A rotated square painted over the surface, so its background covers the surface border where they meet and its two outward edges continue the outline. The family draws it; the positioner measures it and says where it goes. Hidden from assistive technology.',
  },
];

/**
 * The trigger is not a part, and the anatomy table says so above rather than
 * listing it: `data-part` names a part of the family that owns the element, and
 * sixteen stylesheets here key on `[data-part='root']`.
 */
const api = apiRows([
  ['open', 'boolean', '—', 'Tooltip', 'Present means controlled, for the life of the component.'],
  [
    'defaultOpen',
    'boolean',
    'false',
    'Tooltip',
    'The value an uncontrolled tooltip starts from, read once.',
  ],
  [
    'variant',
    "'inverse' | 'surface'",
    'inverse',
    'Tooltip',
    'inverse is a surface opposite to the page; surface is the raised panel with a hairline, for a page that is already dark.',
  ],
  [
    'size',
    "'sm' | 'md'",
    'md',
    'Tooltip',
    'The type step. Both move with density, because both read the control scales.',
  ],
  [
    'describes',
    "'description' | 'label'",
    'description',
    'Tooltip',
    'Whether the trigger points at the layer with aria-describedby or with aria-labelledby. label is the icon-only button whose only words are the tooltip’s, and it forces mount="eager".',
  ],
  [
    'openOn',
    "'hover' | 'focus' | 'manual'",
    'hover',
    'Tooltip',
    'hover also opens on keyboard focus, and instantly. manual binds neither and leaves the family to open.',
  ],
  [
    'side',
    "'top' | 'bottom' | 'inline-start' | 'inline-end' | 'left' | 'right'",
    'top',
    'Tooltip',
    'The edge of the anchor the layer prefers. The two logical values resolve against the layer’s own writing direction at every measurement.',
  ],
  [
    'align',
    "'start' | 'center' | 'end'",
    'center',
    'Tooltip',
    'Where the layer sits along the side it took.',
  ],
  [
    'mount',
    "'active' | 'lazy' | 'eager'",
    'active',
    'Tooltip',
    'When the layer exists. active drops it after the exit, lazy keeps it once it has been open, eager never removes it.',
  ],
  [
    'strategy',
    "'absolute' | 'fixed'",
    'absolute',
    'Tooltip',
    'fixed for a layer inside overflow: hidden, absolute for one inside a transform.',
  ],
  ['arrow', 'boolean', 'true', 'Tooltip', 'Whether the layer draws the arrow at all.'],
  [
    'hoverable',
    'boolean',
    'true',
    'Tooltip',
    'Whether the pointer may travel onto the layer without it closing. WCAG 2.2 SC 1.4.13 Hoverable is a criterion before it is an option.',
  ],
  [
    'closeOnPress',
    'boolean',
    'true',
    'Tooltip',
    'Whether pressing the trigger closes the hint, so it is not left over the dialog its button just opened.',
  ],
  ['flip', 'boolean', 'true', 'Tooltip', 'Move to the opposite side when this one collides.'],
  ['shift', 'boolean', 'true', 'Tooltip', 'Slide along the side to stay inside the boundary.'],
  [
    'hideWhenDetached',
    'boolean',
    'true',
    'Tooltip',
    'Hide the layer while its anchor is outside the clipping ancestor. It hides and does not close: the pointer leaving is what closes a tooltip.',
  ],
  [
    'portal',
    'boolean',
    'true',
    'Tooltip',
    'Whether the layer is rendered into the shared portal root, which keeps the theme, scheme, density and dir of the region it was opened from.',
  ],
  [
    'disabled',
    'boolean',
    'false',
    'Tooltip',
    'The tooltip never opens. The trigger’s own disabled is the consumer’s.',
  ],
  [
    'openDelay',
    'number',
    '600',
    'Tooltip',
    'Milliseconds the pointer has to rest before the hint opens. Focus never waits.',
  ],
  [
    'closeDelay',
    'number',
    '150',
    'Tooltip',
    'Milliseconds the pointer has to travel onto the layer. Zero makes a hoverable tooltip unreachable.',
  ],
  [
    'groupDelay',
    'number',
    '400',
    'TooltipDefaultsProvider',
    'After one tooltip closes, the next opens instantly inside this window. It belongs to the provider, because a value held per tooltip could not say what “the next one” means.',
  ],
  [
    'touchDelay',
    'number',
    '500',
    'Tooltip',
    'How long a press is held before a coarse pointer opens the hint. A tap does not: a tap is the control’s own action.',
  ],
  [
    'sideOffset',
    'number',
    '0',
    'Tooltip',
    'Distance beyond the standard gap, which is the layer’s own padding rather than empty page.',
  ],
  ['alignOffset', 'number', '0', 'Tooltip', 'Distance along the alignment axis.'],
  [
    'collisionPadding',
    'number',
    '8',
    'Tooltip',
    'How close to the boundary edge the layer may sit.',
  ],
  [
    'arrowPadding',
    'number',
    '8',
    'Tooltip',
    'How far the arrow stays from the layer’s own rounded corner, where the surface would stop covering its base.',
  ],
]);

const events: EventRow[] = [
  {
    name: 'onOpenChange',
    payload: '(open: boolean, request: TooltipChangeRequest)',
    when: 'Before the layer moves, once per transition. The request carries value, previous, reason and the originating event, and cancel() refuses it: an uncontrolled tooltip does not move and no consumer is notified.',
  },
];

const composition = apiRows([
  [
    'render',
    '(props) => ReactNode',
    '—',
    'TooltipTrigger, TooltipLayer, TooltipContent, TooltipArrow',
    'Renders the part into the consumer’s own element. The trigger nearly always uses it: the control is one the page already has.',
  ],
  [
    'ref',
    'Ref<TooltipHandle>',
    '—',
    'Tooltip',
    'open(), close() and reposition() — the three actions a consumer cannot express declaratively.',
  ],
  [
    'TooltipDefaultsProvider',
    'component',
    '—',
    'application',
    'Sets every axis and every delay once for the subtree, and holds the group window. A tooltip that states any of them still wins.',
  ],
  [
    'container',
    'Element | null',
    'document.body',
    'TooltipDefaultsProvider',
    'Where every layer under the provider is rendered. It calls setPortalContainer, so an application shell that builds its own stacking context names it once.',
  ],
  [
    'native props',
    'ComponentPropsWithRef',
    '—',
    'every part',
    'Each part’s props are its element’s own, extended. A consumer’s onPointerEnter, onFocus or onClick on the trigger runs before the family’s, and preventDefault stops the family’s.',
  ],
]);

const accessibility = [
  'The layer carries role="tooltip" and the trigger points at it: aria-describedby by default, and aria-labelledby under describes="label" — an icon-only button described by its tooltip and named by nothing is announced as "button".',
  'Escape dismisses it, from the topmost layer only, which is the whole of the APG tooltip pattern’s keyboard table and also WCAG 2.2 SC 1.4.13 Dismissible. The layer itself is never in the tab sequence and holds nothing focusable: a tooltip that can be tabbed into is a non-modal dialog wearing the wrong role, and that is Popover.',
  'The pointer may travel onto the layer without it closing, because the gap between the trigger and the surface is the layer’s own padding rather than empty page — SC 1.4.13 Hoverable. Nothing times the hint out on its own, which is Persistent.',
  'There is no hover on a coarse pointer, so a long press opens the hint and a tap does not. A tooltip is supplementary by definition: a fact reachable only by long press is a fact half a product’s readers will not find, so it may never be the only place one is written.',
];

const snippets = [
  defineSnippet({
    id: 'tooltip-react-application-defaults',
    label: 'Application defaults',
    language: 'tsx',
    source: `
<TooltipDefaultsProvider closeDelay={150} groupDelay={400} openDelay={600} variant="surface">
  <App />
</TooltipDefaultsProvider>;
`,
  }),
  defineSnippet({
    id: 'tooltip-public-tokens',
    label: 'Retuning the family',
    language: 'css',
    source: `
:root {
  --slotted-tooltip-surface: #101828;
  --slotted-tooltip-measure: 22rem;
  --slotted-tooltip-gap: 0.625rem;
  --slotted-tooltip-arrow-size: 0.625rem;
}
`,
  }),
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'A hint on a control',
    note: 'Hover the button, or Tab to it: focus opens the hint in the same task and the pointer waits out the delay first.',
    snippet: defineSnippet({
      id: 'tooltip-react-playground',
      label: 'Playground',
      language: 'tsx',
      source: `
<Tooltip>
  <TooltipTrigger render={(props) => <Button {...props}>Publish</Button>} />
  <TooltipLayer>
    <TooltipContent>Sends the draft to every subscriber</TooltipContent>
    <TooltipArrow />
  </TooltipLayer>
</Tooltip>;
`,
    }),
  },
  {
    id: 'variant',
    title: 'Inverse, and surface',
    note: 'The inverse hint separates itself from a light page with no edge at all; the surface one takes the raised surface and the hairline it needs on a dark ground.',
    snippet: defineSnippet({
      id: 'tooltip-react-variant',
      label: 'Variant',
      language: 'tsx',
      source: `
<Tooltip variant="surface">
  <TooltipTrigger render={(props) => <Button {...props}>On a dark page</Button>} />
  <TooltipLayer>
    <TooltipContent>Reads as a small panel rather than as a label</TooltipContent>
    <TooltipArrow />
  </TooltipLayer>
</Tooltip>;
`,
    }),
  },
  {
    id: 'sizes',
    title: 'Two type steps',
    note: 'Small is the hint inside a dense table row; medium is everywhere else. Switch the density in the toolbar and both tighten without either changing meaning.',
    snippet: defineSnippet({
      id: 'tooltip-react-sizes',
      label: 'Sizes',
      language: 'tsx',
      source: `
<Tooltip size="sm">
  <TooltipTrigger render={(props) => <Button {...props} size="sm" />} />
  <TooltipLayer>
    <TooltipContent>Twelve pixels, in a row that has no room</TooltipContent>
  </TooltipLayer>
</Tooltip>;
`,
    }),
  },
  {
    id: 'placement',
    title: 'Which edge it takes',
    note: 'Four sides around one anchor. inline-start and inline-end mirror with the direction; left and right do not, which is why the arrow stays put when the toolbar switches to rtl.',
    snippet: defineSnippet({
      id: 'tooltip-react-placement',
      label: 'Placement',
      language: 'tsx',
      source: `
<Tooltip align="start" side="inline-end">
  <TooltipTrigger render={(props) => <Button {...props}>Beside</Button>} />
  <TooltipLayer>
    <TooltipContent>Mirrors with the writing direction</TooltipContent>
    <TooltipArrow />
  </TooltipLayer>
</Tooltip>;
`,
    }),
  },
  {
    id: 'delay',
    title: 'The warmup, and the group window',
    note: 'Cross the row of buttons quickly and nothing opens. Rest on one, wait, and it opens; move to its neighbour inside the group window and that one opens in the same task.',
    snippet: defineSnippet({
      id: 'tooltip-react-delay',
      label: 'Delay',
      language: 'tsx',
      source: `
<TooltipDefaultsProvider groupDelay={400} openDelay={600}>
  <Toolbar />
</TooltipDefaultsProvider>;
`,
    }),
  },
  {
    id: 'describes',
    title: 'Description, or name',
    note: 'The left button is labelled and the hint describes it. The right one has no words of its own, so the hint is its accessible name and the layer is in the document before anyone opens it.',
    snippet: defineSnippet({
      id: 'tooltip-react-describes',
      label: 'Describes',
      language: 'tsx',
      source: `
<Tooltip describes="label">
  <TooltipTrigger render={(props) => <Button {...props}>+</Button>} />
  <TooltipLayer>
    <TooltipContent>Archive</TooltipContent>
  </TooltipLayer>
</Tooltip>;
`,
    }),
  },
  {
    id: 'hoverable',
    title: 'Reaching the hint with the pointer',
    note: 'Open the left one and move the pointer onto it: it stays, because the gap is the layer’s own padding. The right one is hoverable={false} and lets the pointer straight through.',
    snippet: defineSnippet({
      id: 'tooltip-react-hoverable',
      label: 'Hoverable',
      language: 'tsx',
      source: `
<Tooltip hoverable={false}>
  <TooltipTrigger render={(props) => <Button {...props}>Passes through</Button>} />
  <TooltipLayer>
    <TooltipContent>The pointer never lands on this one</TooltipContent>
  </TooltipLayer>
</Tooltip>;
`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A sentence long enough to meet the measure, a single unbroken token, and a string in another script. The cap is a token rather than an axis, because measure belongs to Container.',
    snippet: defineSnippet({
      id: 'tooltip-react-content',
      label: 'Content',
      language: 'tsx',
      source: `
<TooltipContent>
  Publishing sends the draft to every subscriber on the list and cannot be undone from here.
</TooltipContent>;
`,
    }),
  },
  {
    id: 'disabled',
    title: 'A hint on a control that is out of action',
    note: 'A native disabled button fires no pointer events, so its explanation is unreachable. Use aria-disabled on a control that stays focusable, or put the trigger on a wrapper.',
    snippet: defineSnippet({
      id: 'tooltip-react-disabled',
      label: 'Disabled',
      language: 'tsx',
      source: `
<Tooltip>
  <TooltipTrigger render={(props) => <Button {...props} aria-disabled="true" tone="secondary" />} />
  <TooltipLayer>
    <TooltipContent>Publish once the invoice has a customer</TooltipContent>
  </TooltipLayer>
</Tooltip>;
`,
    }),
  },
  {
    id: 'composition',
    title: 'In a row of icon buttons',
    note: 'Where a tooltip actually lives. Every trigger is the consumer’s own Button, reached through render, and one provider sets the delays for the whole row.',
    snippet: defineSnippet({
      id: 'tooltip-react-composition',
      label: 'Composition',
      language: 'tsx',
      source: `
<TooltipDefaultsProvider describes="label" size="sm">
  <Inline gap="2">
    <IconTooltip label="Duplicate" />
    <IconTooltip label="Archive" />
  </Inline>
</TooltipDefaultsProvider>;
`,
    }),
  },
  {
    id: 'keyboard',
    title: 'What the keyboard does',
    note: 'Tab in and the hint opens with no delay; press Escape and it goes without the focus moving; press Enter and the button acts and the hint clears itself away.',
    snippet: defineSnippet({
      id: 'tooltip-react-keyboard',
      label: 'Keyboard',
      language: 'tsx',
      source: `
<Tooltip onOpenChange={(open, request) => report(request.reason)}>
  <TooltipTrigger render={(props) => <Button {...props}>Tab to me</Button>} />
  <TooltipLayer>
    <TooltipContent>Escape dismisses without moving the focus</TooltipContent>
  </TooltipLayer>
</Tooltip>;
`,
    }),
  },
];

export const REACT_TOOLTIP_DOCS = {
  tooltip: { accessibility, anatomy, api, composition, events, imports, scenes, snippets },
};
