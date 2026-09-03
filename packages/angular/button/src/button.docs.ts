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

export const ANGULAR_BUTTON_TOKENS = buttonTokens.map((name) => ({
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
  ['loadingLabel', 'string', 'Loading', member, 'What the indicator announces itself as'],
];

const CONTENT = (member: string): ApiTuple[] => [
  ['start', '[slButtonStart]', '—', member, 'Content projected before the label'],
  ['end', '[slButtonEnd]', '—', member, 'Content projected after the label'],
];

export const ANGULAR_BUTTON_DOCS = {
  button: {
    api: apiRows([
      ...appearance('SlButton', 'accent', 'solid'),
      ...CONTENT('SlButton'),
      ['fullWidth', 'boolean', 'false', 'SlButton', 'Fills the inline size of its container'],
      ...unavailable('SlButton'),
      ...waiting('SlButton'),
      ['type', 'button | submit | reset', 'button', 'SlButton', 'The native button type'],
    ]),
    accessibility: [
      'It is a directive on the consumer’s own button element, so Space, Enter, focus, form submission and the disabled state are the platform’s.',
      'While loading, the indicator is a named progress bar in the accessibility tree and the control announces aria-disabled while keeping focus — the shape React Aria’s pending button and Primer’s loading button both take. aria-busy is not used: it is not reliably announced on a button, and two mechanisms for one fact is one too many.',
      'A control with a projected start or end icon gives the indicator that box and keeps its label. One with neither renders the label at zero opacity: it stays in the accessibility tree, so the name survives the wait, and it stays in the flow, so the control never changes size.',
      'loading refuses activation on a capture-phase listener, before any handler the template attached, so a submit button cannot submit twice.',
      'focusableWhenDisabled keeps an unavailable control reachable. Use it when the control carries a tooltip or an explanation a keyboard user would otherwise never reach, such as one inside a toolbar.',
      'There is no render input, and none is needed: the component is a directive on the element the template wrote, so substituting the element is done by writing a different one.',
      'Project a start or end icon with aria-hidden so it does not repeat the label.',
    ],
    snippets: [
      defineSnippet({
        id: 'angular-button-basic',
        label: 'An action',
        language: 'angular',
        source:
          '<button slButton (click)="save()">\n  <span slButtonStart><ng-icon aria-hidden="true" name="lucideSave" /></span>\n  Save changes\n</button>',
      }),
      defineSnippet({
        id: 'angular-button-loading',
        label: 'Waiting for the action to finish',
        language: 'angular',
        source:
          '<button slButton [loading]="saving()" [loadingDelay]="300" loadingLabel="Saving" (click)="save()">\n  <span slButtonStart><ng-icon aria-hidden="true" name="lucideSave" /></span>\n  Save changes\n</button>',
      }),
      defineSnippet({
        id: 'angular-button-defaults',
        label: 'Every action in the application, decided once',
        language: 'ts',
        source:
          "bootstrapApplication(App, {\n  providers: [provideButtonDefaults({ size: 'sm' })],\n});",
      }),
    ],
  },
  buttonLink: {
    api: apiRows([
      ['href', 'string', '—', 'SlButtonLink', 'The navigation destination'],
      ...appearance('SlButtonLink', 'accent', 'solid'),
      ...CONTENT('SlButtonLink'),
      ['fullWidth', 'boolean', 'false', 'SlButtonLink', 'Fills the inline size of its container'],
      [
        'disabled',
        'boolean',
        'false',
        'SlButtonLink',
        'Removes the destination and refuses activation',
      ],
    ]),
    accessibility: [
      'It is a directive on an anchor, so it is announced as a link and activates on Enter. Space does not activate it, because Space does not activate a link.',
      'routerLink works on the same element and writes the href itself; leave [href] unset then.',
      'A disabled link renders no href at all: an anchor that keeps its destination and only blocks click still navigates on a middle click and on a modified click.',
      'It stays in the tab sequence when disabled, with role="link" and aria-disabled, because a control a keyboard user cannot reach is one they cannot discover is unavailable.',
    ],
    snippets: [
      defineSnippet({
        id: 'angular-button-link-native',
        label: 'Navigating',
        language: 'angular',
        source: '<a slButtonLink href="/settings">Open settings</a>',
      }),
      defineSnippet({
        id: 'angular-button-link-router',
        label: 'Navigation the router owns',
        language: 'angular',
        source: '<a slButtonLink variant="outline" routerLink="/settings">Open settings</a>',
      }),
    ],
  },
  iconButton: {
    api: apiRows([
      [
        'aria-label | aria-labelledby',
        'string',
        'required',
        'SlIconButton',
        'The accessible name, which no content can supply',
      ],
      ...appearance('SlIconButton', 'secondary', 'ghost'),
      ['shape', 'square | circle', 'square', 'SlIconButton', 'How the square control is cornered'],
      ...unavailable('SlIconButton'),
      ...waiting('SlIconButton'),
      [
        'pressed',
        'boolean',
        '—',
        'SlIconButton',
        'The consumer’s value; passing it controls the state',
      ],
      [
        'defaultPressed',
        'boolean',
        '—',
        'SlIconButton',
        'The value an uncontrolled toggle starts from',
      ],
      [
        'pressedChange',
        'ChangeRequest<boolean>',
        '—',
        'SlIconButton',
        'The request: value, previous, reason, event and cancel()',
      ],
      ['type', 'button | submit | reset', 'button', 'SlIconButton', 'The native button type'],
    ]),
    accessibility: [
      'The accessible name is required: the development build throws when neither aria-label nor aria-labelledby is present, because a template cannot make an attribute mandatory.',
      'aria-pressed appears only once [pressed] or [defaultPressed] is bound. A plain icon button that announced itself as a toggle would be announcing a state it does not have.',
      'The name must not change with the pressed state. The APG is explicit that a toggle keeps its label and lets the state be announced beside it.',
      'The square control is the control height in both axes and never falls below the WCAG 2.2 minimum of 24 by 24 CSS pixels, at any density.',
    ],
    snippets: [
      defineSnippet({
        id: 'angular-icon-button-basic',
        label: 'A named icon-only action',
        language: 'angular',
        source:
          '<button slIconButton tone="danger" aria-label="Delete invoice" (click)="remove()">\n  <ng-icon aria-hidden="true" name="lucideTrash2" />\n</button>',
      }),
      defineSnippet({
        id: 'angular-icon-button-toggle',
        label: 'An icon toggle in a toolbar',
        language: 'angular',
        source:
          '<button slIconButton aria-label="Bold" [pressed]="bold()" (pressedChange)="bold.set($event.value)">\n  <ng-icon aria-hidden="true" name="lucideBold" />\n</button>',
      }),
    ],
  },
  toggleButton: {
    api: apiRows([
      ...appearance('SlToggleButton', 'secondary', 'outline'),
      ...CONTENT('SlToggleButton'),
      ['fullWidth', 'boolean', 'false', 'SlToggleButton', 'Fills the inline size of its container'],
      ...unavailable('SlToggleButton'),
      ...waiting('SlToggleButton'),
      [
        'pressed',
        'boolean',
        '—',
        'SlToggleButton',
        'The consumer’s value; passing it controls the state',
      ],
      [
        'defaultPressed',
        'boolean',
        'false',
        'SlToggleButton',
        'The value an uncontrolled toggle starts from, read once',
      ],
      [
        'pressedChange',
        'ChangeRequest<boolean>',
        '—',
        'SlToggleButton',
        'The request: value, previous, reason, event and cancel()',
      ],
      ['type', 'button | submit | reset', 'button', 'SlToggleButton', 'The native button type'],
    ]),
    accessibility: [
      'It is a native button carrying aria-pressed, so it is announced as a toggle and activates on Space and Enter.',
      'The label must not change with the state: "Mute" stays "Mute" and the state is announced beside it.',
      'There is no [(pressed)]: a two-way binding has one slot and cannot carry the reason or the cancellation, and a second output for the same transition would be the same failure stated twice.',
      'Calling preventDefault on the click refuses the activation, and a refused activation moves nothing.',
    ],
    snippets: [
      defineSnippet({
        id: 'angular-toggle-button-uncontrolled',
        label: 'A toggle that owns its own state',
        language: 'angular',
        source: '<button slToggleButton defaultPressed>Pin</button>',
      }),
      defineSnippet({
        id: 'angular-toggle-button-controlled',
        label: 'A toggle the consumer owns, with the reason',
        language: 'angular',
        source:
          '<button slToggleButton [pressed]="pinned()" (pressedChange)="onPinnedChange($event)">Pin</button>',
      }),
    ],
  },
} as const;
