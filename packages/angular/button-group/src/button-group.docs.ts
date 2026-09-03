import buttonGroupTokens from '@slotted/styles/button-group/tokens.json';
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

export const ANGULAR_BUTTON_GROUP_TOKENS = buttonGroupTokens.map((name) => ({
  name,
  purpose: 'Foundation token the Button group reads',
}));

const GAP = '0 | 1 | … | 12';

export const ANGULAR_BUTTON_GROUP_DOCS = {
  buttonGroup: {
    api: apiRows([
      [
        'orientation',
        "'horizontal' | 'vertical'",
        'horizontal',
        'SlButtonGroup',
        'The axis the buttons run along',
      ],
      [
        'gap',
        GAP,
        '4',
        'SlButtonGroup',
        'Separation between buttons, as a step on the space scale',
      ],
      [
        'align',
        "'auto' | 'start' | 'center' | 'end' | 'stretch'",
        'auto',
        'SlButtonGroup',
        'Positions the buttons across the flow; auto centres a row and stretches a column',
      ],
      [
        'justify',
        "'start' | 'center' | 'end' | 'between'",
        '—',
        'SlButtonGroup',
        'Positions the buttons along the flow, which makes the group hold the line',
      ],
      [
        'attached',
        'boolean',
        'false',
        'SlButtonGroup',
        'Joins the buttons into one shape: shared edges, outer corners only',
      ],
      [
        'collapse',
        "'wrap' | 'nowrap' | 'stack'",
        'wrap',
        'SlButtonGroup',
        'What happens when the container is narrower than the row; stack turns it into a column below 360px',
      ],
      [
        'fullWidth',
        'boolean',
        'false',
        'SlButtonGroup',
        'The group holds the line and its buttons share it in equal segments',
      ],
      [
        'tone',
        'accent | secondary | success | warning | danger',
        '—',
        'SlButtonGroup',
        'Provided to every button under it, unless the button states its own',
      ],
      [
        'variant',
        'solid | outline | ghost',
        '—',
        'SlButtonGroup',
        'Provided to every button under it, unless the button states its own',
      ],
      [
        'size',
        'sm | md | lg',
        '—',
        'SlButtonGroup',
        'Provided to every button under it, unless the button states its own',
      ],
      [
        'decorative',
        'boolean',
        'false',
        'SlButtonGroupSeparator',
        'Drops the rule out of the accessibility tree',
      ],
    ]),
    accessibility: [
      'The host is role="group". A group of actions is several tab stops: Tab and Shift + Tab reach each button in the order it was written, and every key belongs to the button under focus. The arrow-key model of the APG Toolbar pattern — one tab stop, Left and Right between controls — is a different component and belongs to the toolbar family.',
      'Name the group with aria-label or aria-labelledby on the element the directive sits on. There is no label input, because the element already accepts both and a second way to name one thing is a second thing to get wrong.',
      'A static role the consumer wrote survives the host binding, read with HostAttributeToken before the family writes its own — so role="toolbar" stays possible. role="" removes it altogether, which ARIA reads as "use the element\'s implicit role": that is how a nav or a section carrying this directive keeps the semantics it was chosen for.',
      'A boundary that carries meaning is better said by a nested group with a name of its own than by a rule: an announced separator says a boundary exists, while a named group says what is on either side of it.',
      'The separator takes its axis from the group, mirrored: a rule across a row is vertical. Inside a group that collapses with its container it states no axis at all, because which way the group runs is decided by the width the page turns out to have.',
      'Nothing here depends on hover. attached, collapse and gap change layout only, and the collapse decision is a container query, so it is correct in a server render and correct with JavaScript disabled.',
      'The buttons keep the accessible names, disabled behaviour and loading announcements the button family gives them. The group adds nothing to them and removes nothing from them.',
    ],
    snippets: [
      defineSnippet({
        id: 'button-group-angular-dialog',
        language: 'angular',
        label: 'Dialog actions that become a column on a narrow screen',
        source:
          '<div slButtonGroup aria-label="Dialog actions" collapse="stack" justify="end">\n  <button slButton tone="secondary" variant="outline">Cancel</button>\n  <button slButton>Publish now</button>\n</div>',
      }),
      defineSnippet({
        id: 'button-group-angular-segmented',
        language: 'angular',
        label: 'A joined bar of related views',
        source:
          '<div slButtonGroup aria-label="Range" attached tone="secondary" variant="outline">\n  <button slToggleButton [pressed]="range() === \'day\'" (pressedChange)="range.set(\'day\')">\n    Day\n  </button>\n  <button slToggleButton [pressed]="range() === \'week\'" (pressedChange)="range.set(\'week\')">\n    Week\n  </button>\n</div>',
      }),
      defineSnippet({
        id: 'button-group-angular-clusters',
        language: 'angular',
        label: 'A destructive action kept off the frequent ones',
        source:
          '<div slButtonGroup aria-label="Record">\n  <div slButtonGroup aria-label="Edit" attached tone="secondary" variant="outline">\n    <button slButton>Duplicate</button>\n    <button slButton>Archive</button>\n  </div>\n  <div slButtonGroup aria-label="Destructive">\n    <button slButton tone="danger">Delete</button>\n  </div>\n</div>',
      }),
      defineSnippet({
        id: 'button-group-angular-defaults',
        language: 'ts',
        label: 'One decision for every group in the application',
        source:
          "import { provideButtonGroupDefaults } from '@slotted/angular/button-group';\n\nbootstrapApplication(App, {\n  providers: [provideButtonGroupDefaults({ collapse: 'stack', gap: 5 })],\n});",
      }),
    ],
  },
} as const;
