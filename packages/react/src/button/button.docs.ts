import buttonTokens from '@slotted/styles/button/tokens.json';
import { defineSnippet } from '@slotted/storybook-workbench';
import type { ApiRow } from '@slotted/storybook-workbench';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_BUTTON_TOKENS = buttonTokens.map((name) => ({
  name,
  purpose: 'Foundation token the Button family reads',
}));

const TONE = 'accent | secondary | success | warning | danger';
const VARIANT = 'solid | outline | ghost';
const SIZE = 'sm | md | lg';

const appearance = (member: string, tone: string, variant: string): ApiTuple[] => [
  ['tone', TONE, tone, member, 'Which of the five semantic colours the control speaks in'],
  ['variant', VARIANT, variant, member, 'How the tone is painted'],
  ['size', SIZE, 'md', member, 'Step of the control scale'],
];

/** Being unavailable and being unreachable are two decisions, not one. */
const unavailable = (member: string): ApiTuple[] => [
  [
    'disabled',
    'boolean',
    'false',
    member,
    'Refuses the action and says the control is unavailable',
  ],
  [
    'focusableWhenDisabled',
    'boolean',
    'false',
    member,
    'Keeps an unavailable control in the tab sequence, announcing aria-disabled instead',
  ],
];

const waiting = (member: string): ApiTuple[] => [
  ['loading', 'boolean', 'false', member, 'Waits: refuses activation and shows an indicator'],
  [
    'loadingDelay',
    'number',
    '0',
    member,
    'Milliseconds before the indicator appears; the refusal is immediate',
  ],
  [
    'messages',
    'Partial<ButtonMessages>',
    '—',
    member,
    'Words laid over the language in force, key by key: what the indicator announces itself as (loading)',
  ],
];

const substitutable = (member: string): ApiTuple[] => [
  [
    'render',
    '(rootProps) => ReactElement',
    '—',
    member,
    'Hands the root props to something else to render',
  ],
];

export const REACT_BUTTON_DOCS = {
  button: {
    api: apiRows([
      ...appearance('Button', 'accent', 'solid'),
      ['start', 'ReactNode', '—', 'Button', 'Content before the label, mirrored in right-to-left'],
      ['end', 'ReactNode', '—', 'Button', 'Content after the label, mirrored in right-to-left'],
      ['fullWidth', 'boolean', 'false', 'Button', 'Fills the inline size of its container'],
      ...unavailable('Button'),
      ...waiting('Button'),
      ...substitutable('Button'),
      ['type', 'button | submit | reset', 'button', 'Button', 'The native button type'],
    ]),
    accessibility: [
      'The visible label supplies the accessible name, and it is a native button, so Space, Enter, focus and the disabled state are the platform’s.',
      'While loading, the indicator is a named progress bar in the accessibility tree and the control announces aria-disabled while keeping focus — the shape React Aria’s pending button and Primer’s loading button both take. aria-busy is not used: it is not reliably announced on a button, and two mechanisms for one fact is one too many.',
      'A control with a start or end icon gives the indicator that box and keeps its label. One with neither renders the label at zero opacity: it stays in the accessibility tree, so the name survives the wait and combines with the indicator’s own, and it stays in the flow, so the control never changes size.',
      'loading refuses activation in the capture phase, before any handler the consumer attached, so a submit button cannot submit twice.',
      'focusableWhenDisabled keeps an unavailable control reachable. Use it when the control carries a tooltip or an explanation a keyboard user would otherwise never reach, such as one inside a toolbar. A control that can be reached is painted to be read: muted text on the neutral subtle ground, at 4.5:1 or better, where a natively disabled control keeps the disabled grey.',
      'A start or end icon is decorative content the consumer supplies; give it aria-hidden so it does not repeat the label.',
      'type defaults to button. Use submit only for an intentional form submission.',
    ],
    snippets: [
      defineSnippet({
        id: 'react-button-basic',
        label: 'An action',
        language: 'tsx',
        source:
          'import { Save } from \'lucide-react\';\n\n<Button start={<Save aria-hidden="true" />}>Save changes</Button>;',
      }),
      defineSnippet({
        id: 'react-button-loading',
        label: 'Waiting for the action to finish',
        language: 'tsx',
        source:
          '<Button\n  loading={saving}\n  loadingDelay={300}\n  messages={{ loading: \'Saving\' }}\n  onClick={save}\n  start={<Save aria-hidden="true" />}\n>\n  Save changes\n</Button>;',
      }),
      defineSnippet({
        id: 'react-button-defaults',
        label: 'Every action in the application, decided once',
        language: 'tsx',
        source: '<ButtonDefaultsProvider size="sm">\n  <Toolbar />\n</ButtonDefaultsProvider>;',
      }),
      defineSnippet({
        id: 'react-button-emphasis',
        label: 'One primary action per region',
        language: 'tsx',
        source:
          '<Inline gap={4}>\n  <Button>Publish</Button>\n  <Button tone="secondary" variant="outline">\n    Save draft\n  </Button>\n  <Button tone="secondary" variant="ghost">\n    Discard\n  </Button>\n</Inline>;',
      }),
    ],
  },
  buttonLink: {
    api: apiRows([
      ['href', 'string', 'required in native mode', 'ButtonLink', 'The navigation destination'],
      [
        'render',
        '(rootProps) => ReactElement',
        '—',
        'ButtonLink',
        'Hands the root props to a router’s own link component',
      ],
      ...appearance('ButtonLink', 'accent', 'solid'),
      ['start', 'ReactNode', '—', 'ButtonLink', 'Content before the label'],
      ['end', 'ReactNode', '—', 'ButtonLink', 'Content after the label'],
      ['fullWidth', 'boolean', 'false', 'ButtonLink', 'Fills the inline size of its container'],
      [
        'disabled',
        'boolean',
        'false',
        'ButtonLink',
        'Removes the destination and refuses activation',
      ],
    ]),
    accessibility: [
      'It is an anchor, so it is announced as a link and activates on Enter. Space does not activate it, because Space does not activate a link.',
      'Use it only for navigation. An action without a destination is a Button.',
      'A disabled ButtonLink renders no href at all: an anchor that keeps its destination and only blocks click still navigates on a middle click and on a modified click.',
      'It stays in the tab sequence when disabled, with role="link" and aria-disabled, because a control a keyboard user cannot reach is one they cannot discover is unavailable.',
      'The render adapter receives every root prop, including the accessible name and the data attributes, and must pass all of them on.',
    ],
    snippets: [
      defineSnippet({
        id: 'react-button-link-native',
        label: 'Navigating',
        language: 'tsx',
        source: '<ButtonLink href="/settings">Open settings</ButtonLink>;',
      }),
      defineSnippet({
        id: 'react-button-link-router',
        label: 'Navigation the router owns',
        language: 'tsx',
        source:
          '<ButtonLink variant="outline" render={(props) => <RouterLink to="/settings" {...props} />}>\n  Open settings\n</ButtonLink>;',
      }),
    ],
  },
  iconButton: {
    api: apiRows([
      [
        'aria-label | aria-labelledby',
        'string',
        'required',
        'IconButton',
        'The accessible name, which no content can supply',
      ],
      ...appearance('IconButton', 'secondary', 'ghost'),
      ['shape', 'square | circle', 'square', 'IconButton', 'How the square control is cornered'],
      ...unavailable('IconButton'),
      ...waiting('IconButton'),
      ...substitutable('IconButton'),
      [
        'pressed',
        'boolean',
        '—',
        'IconButton',
        'The consumer’s value; passing it controls the state',
      ],
      [
        'defaultPressed',
        'boolean',
        '—',
        'IconButton',
        'The value an uncontrolled toggle starts from',
      ],
      [
        'onPressedChange',
        '(pressed, request) => void',
        '—',
        'IconButton',
        'The request: value, previous, reason, event and cancel()',
      ],
      ['type', 'button | submit | reset', 'button', 'IconButton', 'The native button type'],
    ]),
    accessibility: [
      'The accessible name is mandatory at the type level: one of aria-label or aria-labelledby must be present, and the development build throws when neither is.',
      'aria-pressed appears only once pressed or defaultPressed is passed. A plain icon button that announced itself as a toggle would be announcing a state it does not have.',
      'The name must not change with the pressed state. The APG is explicit that a toggle keeps its label and lets the state be announced beside it.',
      'On is painted the way the foundation paints selected: the accent selection ground under accent text, inside the accent edge, whatever tone and variant the toggle was written as. A toggle that is on hovers on that ground’s own hover step, never on the neutral one a toggle that is off hovers with.',
      'The square control is the control height in both axes and never falls below the WCAG 2.2 minimum of 24 by 24 CSS pixels, at any density.',
      'Add a tooltip when the icon alone does not say what the action does. The name is not a substitute for a visible one.',
    ],
    snippets: [
      defineSnippet({
        id: 'react-icon-button-basic',
        label: 'A named icon-only action',
        language: 'tsx',
        source:
          'import { Trash2 } from \'lucide-react\';\n\n<IconButton aria-label="Delete invoice" tone="danger">\n  <Trash2 aria-hidden="true" />\n</IconButton>;',
      }),
      defineSnippet({
        id: 'react-icon-button-toggle',
        label: 'An icon toggle in a toolbar',
        language: 'tsx',
        source:
          'import { Bold } from \'lucide-react\';\n\n<IconButton\n  aria-label="Bold"\n  pressed={bold}\n  onPressedChange={(bold) => setBold(bold)}\n  tone="secondary"\n>\n  <Bold aria-hidden="true" />\n</IconButton>;',
      }),
    ],
  },
  toggleButton: {
    api: apiRows([
      ...appearance('ToggleButton', 'secondary', 'outline'),
      ['start', 'ReactNode', '—', 'ToggleButton', 'Content before the label'],
      ['end', 'ReactNode', '—', 'ToggleButton', 'Content after the label'],
      ['fullWidth', 'boolean', 'false', 'ToggleButton', 'Fills the inline size of its container'],
      ...unavailable('ToggleButton'),
      ...waiting('ToggleButton'),
      ...substitutable('ToggleButton'),
      [
        'pressed',
        'boolean',
        '—',
        'ToggleButton',
        'The consumer’s value; passing it controls the state',
      ],
      [
        'defaultPressed',
        'boolean',
        'false',
        'ToggleButton',
        'The value an uncontrolled toggle starts from, read once',
      ],
      [
        'onPressedChange',
        '(pressed, request) => void',
        '—',
        'ToggleButton',
        'The request: value, previous, reason, event and cancel()',
      ],
      ['type', 'button | submit | reset', 'button', 'ToggleButton', 'The native button type'],
    ]),
    accessibility: [
      'It is a native button carrying aria-pressed, so it is announced as a toggle and activates on Space and Enter.',
      'The label must not change with the state: "Mute" stays "Mute" and the state is announced beside it. A label that changes needs a Button, not a toggle.',
      'The request carries why it happened. A native button fires the same click for a pointer, Space and Enter, and the reason separates them by whether the click reported a real pointer.',
      'Calling preventDefault in onClick refuses the activation, and a refused activation moves nothing.',
      'It is not a Checkbox. Use Checkbox for a value a form submits.',
      'A toggle that persists reaches a server before the state is true. While it waits it holds the state it still has, so nobody is shown a value that has not been agreed to.',
    ],
    snippets: [
      defineSnippet({
        id: 'react-toggle-button-uncontrolled',
        label: 'A toggle that owns its own state',
        language: 'tsx',
        source: '<ToggleButton defaultPressed>Pin</ToggleButton>;',
      }),
      defineSnippet({
        id: 'react-toggle-button-controlled',
        label: 'A toggle the consumer owns, with the reason',
        language: 'tsx',
        source:
          "<ToggleButton\n  pressed={pinned}\n  onPressedChange={(pinned, request) => {\n    if (request.reason === 'keyboard') announce(pinned);\n    setPinned(pinned);\n  }}\n>\n  Pin\n</ToggleButton>;",
      }),
    ],
  },
} as const;
