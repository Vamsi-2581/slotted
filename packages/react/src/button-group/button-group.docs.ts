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

export const REACT_BUTTON_GROUP_TOKENS = buttonGroupTokens.map((name) => ({
  name,
  purpose: 'Foundation token the Button group reads',
}));

const GAP = '0 | 1 | … | 12';

export const REACT_BUTTON_GROUP_DOCS = {
  buttonGroup: {
    api: apiRows([
      [
        'orientation',
        "'horizontal' | 'vertical'",
        'horizontal',
        'ButtonGroup',
        'The axis the buttons run along',
      ],
      ['gap', GAP, '4', 'ButtonGroup', 'Separation between buttons, as a step on the space scale'],
      [
        'align',
        "'auto' | 'start' | 'center' | 'end' | 'stretch'",
        'auto',
        'ButtonGroup',
        'Positions the buttons across the flow; auto centres a row and stretches a column',
      ],
      [
        'justify',
        "'start' | 'center' | 'end' | 'between'",
        '—',
        'ButtonGroup',
        'Positions the buttons along the flow, which makes the group hold the line',
      ],
      [
        'attached',
        'boolean',
        'false',
        'ButtonGroup',
        'Joins the buttons into one shape: shared edges, outer corners only',
      ],
      [
        'collapse',
        "'wrap' | 'nowrap' | 'stack'",
        'wrap',
        'ButtonGroup',
        'What happens when the container is narrower than the row; stack turns it into a column below 360px',
      ],
      [
        'fullWidth',
        'boolean',
        'false',
        'ButtonGroup',
        'The group holds the line and its buttons share it in equal segments',
      ],
      [
        'tone',
        'accent | secondary | success | warning | danger',
        '—',
        'ButtonGroup',
        'Painted onto every button under it, unless the button states its own',
      ],
      [
        'variant',
        'solid | outline | ghost',
        '—',
        'ButtonGroup',
        'Painted onto every button under it, unless the button states its own',
      ],
      [
        'size',
        'sm | md | lg',
        '—',
        'ButtonGroup',
        'Painted onto every button under it, unless the button states its own',
      ],
      [
        'render',
        '(props) => ReactNode',
        '—',
        'ButtonGroup',
        'Renders a different root element; pass role={undefined} to keep that element’s own semantics',
      ],
      [
        'decorative',
        'boolean',
        'false',
        'ButtonGroupSeparator',
        'Drops the rule out of the accessibility tree',
      ],
    ]),
    accessibility: [
      'The root is role="group". A group of actions is several tab stops: Tab and Shift + Tab reach each button in the order it was written, and every key belongs to the button under focus. The arrow-key model of the APG Toolbar pattern — one tab stop, Left and Right between controls — is a different component and belongs to the toolbar family.',
      'Name the group with aria-label or aria-labelledby. There is no label prop, because the element already accepts both and a second way to name one thing is a second thing to get wrong.',
      'A consumer who genuinely wants the toolbar role can write role="toolbar", and it survives: the family writes its own role first so an explicit one wins. Writing role={undefined} removes it altogether, which is how a substituted nav or section keeps the semantics it was chosen for.',
      'A boundary that carries meaning is better said by a nested group with a name of its own than by a rule: an announced separator says a boundary exists, while a named group says what is on either side of it.',
      'The separator takes its axis from the group, mirrored: a rule across a row is vertical. Inside a group that collapses with its container it states no axis at all, because which way the group runs is decided by the width the page turns out to have.',
      'Nothing here depends on hover. attached, collapse and gap change layout only, and the collapse decision is a container query, so it is correct before hydration and correct with JavaScript disabled.',
      'The buttons keep the accessible names, disabled behaviour and loading announcements the button family gives them. The group adds nothing to them and removes nothing from them.',
    ],
    snippets: [
      defineSnippet({
        id: 'button-group-react-dialog',
        language: 'tsx',
        label: 'Dialog actions that become a column on a narrow screen',
        source:
          '<ButtonGroup aria-label="Dialog actions" collapse="stack" justify="end">\n  <Button variant="outline" tone="secondary">\n    Cancel\n  </Button>\n  <Button>Publish now</Button>\n</ButtonGroup>;',
      }),
      defineSnippet({
        id: 'button-group-react-segmented',
        language: 'tsx',
        label: 'A joined bar of related views',
        source:
          "<ButtonGroup aria-label=\"Range\" attached tone=\"secondary\" variant=\"outline\">\n  <ToggleButton pressed={range === 'day'} onPressedChange={() => setRange('day')}>\n    Day\n  </ToggleButton>\n  <ToggleButton pressed={range === 'week'} onPressedChange={() => setRange('week')}>\n    Week\n  </ToggleButton>\n</ButtonGroup>;",
      }),
      defineSnippet({
        id: 'button-group-react-clusters',
        language: 'tsx',
        label: 'A destructive action kept off the frequent ones',
        source:
          '<ButtonGroup aria-label="Record">\n  <ButtonGroup aria-label="Edit" attached>\n    <Button variant="outline" tone="secondary">\n      Duplicate\n    </Button>\n    <Button variant="outline" tone="secondary">\n      Archive\n    </Button>\n  </ButtonGroup>\n  <ButtonGroup aria-label="Destructive">\n    <Button tone="danger">Delete</Button>\n  </ButtonGroup>\n</ButtonGroup>;',
      }),
      defineSnippet({
        id: 'button-group-react-defaults',
        language: 'tsx',
        label: 'One decision for every group in the application',
        source:
          'import { ButtonGroupDefaultsProvider } from \'@slotted/react\';\n\n<ButtonGroupDefaultsProvider collapse="stack" gap={5}>\n  <App />\n</ButtonGroupDefaultsProvider>;',
      }),
    ],
  },
} as const;
