import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import toolbarTokens from '@slotted/styles/toolbar/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_TOOLBAR_TOKENS = toolbarTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Toolbar decision',
}));

const imports: ReferenceImport = {
  source:
    "import { Toolbar, ToolbarDefaultsProvider, ToolbarGroup, ToolbarSeparator, ToolbarSpacer } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div[role="toolbar"], or the element render returns',
    required: true,
    purpose:
      'The bar. Carries data-ui="toolbar", the four axes, aria-orientation when vertical, and the label the consumer wrote. It writes the roving tabindex on every focusable control inside it, which is what makes the whole bar one tab stop.',
  },
  {
    part: 'group',
    element: 'div[role="group"]',
    required: false,
    purpose:
      'A run of related controls with a name of its own. The distance inside it is half the bar’s gap and the distance around it is a gap and a half, so the boundary between two groups reads wider than the one between two controls. The arrows do not stop at its edge.',
  },
  {
    part: 'separator',
    element: 'div[role="separator"]',
    required: false,
    purpose:
      'A hairline between two runs, with aria-orientation perpendicular to the bar. It is a part of this family rather than a Divider, because its geometry is measured against the controls beside it.',
  },
  {
    part: 'spacer',
    element: 'div',
    required: false,
    purpose:
      'The free space between two runs, so what follows sits at the end of the bar. It replaces a justify axis: an axis decides where every control sits, and a bar needs one boundary.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One bar with every axis on it, driven by the controls below the canvas. Tab into it once, then use the arrows: the whole bar is a single stop however many controls it holds.',
    snippet: defineSnippet({
      id: 'toolbar-react-playground',
      language: 'tsx',
      label: 'A set of controls, one tab stop',
      source: `<Toolbar aria-label="Formatação">
  <Button variant="ghost">Negrito</Button>
  <Button variant="ghost">Itálico</Button>
  <ToolbarSeparator />
  <Button variant="ghost">Link</Button>
</Toolbar>;`,
    }),
  },
  {
    id: 'orientation',
    title: 'Which way the bar runs',
    note: 'A horizontal bar centres its controls and a vertical one stretches them, because a column at each control’s natural width is a ragged edge; the separator and the group boundary turn with it.',
    snippet: defineSnippet({
      id: 'toolbar-react-orientation',
      language: 'tsx',
      label: 'A row of controls, and a column of them',
      source: `<Toolbar aria-label="Ferramentas" orientation="vertical">
  <Button variant="ghost">Lápis</Button>
  <Button variant="ghost">Pincel</Button>
  <ToolbarSeparator />
  <Button variant="ghost">Borracha</Button>
</Toolbar>;`,
    }),
  },
  {
    id: 'variant',
    title: 'Whether the bar paints a ground',
    note: 'plain is the default and paints nothing: a bar inside a card header is already standing on a surface. outline frames it, and pads itself by at least the reach of a focus ring so the two never meet.',
    snippet: defineSnippet({
      id: 'toolbar-react-variant',
      language: 'tsx',
      label: 'Plain, and framed',
      source: `<Toolbar aria-label="Sem moldura" variant="plain" />;
<Toolbar aria-label="Com moldura" variant="outline" />;`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the bar sits at',
    note: 'The size moves the bar’s own inset, gap and separator inset and never the controls inside it, which is what lets one bar hold a small icon button beside a medium select.',
    snippet: defineSnippet({
      id: 'toolbar-react-sizes',
      language: 'tsx',
      label: 'Three steps of bar, one step of control',
      source: `<Toolbar aria-label="Compacta" size="sm">
  <Button size="sm" variant="ghost">
    Recortar
  </Button>
</Toolbar>;`,
    }),
  },
  {
    id: 'groups',
    title: 'Runs that belong together',
    note: 'A group carries a name a screen reader announces and a boundary the eye reads, and a rule draws the same boundary the other way — which is what keeps a destructive action off a frequent one.',
    snippet: defineSnippet({
      id: 'toolbar-react-groups',
      language: 'tsx',
      label: 'A named run, a rule, and a spacer',
      source: `<Toolbar aria-label="Seleção" variant="outline">
  <ToolbarGroup aria-label="Alinhamento">
    <Button variant="outline">Início</Button>
    <Button pressed variant="outline">
      Centro
    </Button>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarSpacer />
  <Button tone="danger">Excluir</Button>
</Toolbar>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The APG table, and where focus lands',
    note: 'Tab enters the bar once and returns to the control that last had focus; the arrows of the flow axis move and wrap, the cross axis duplicates them, and Home and End reach the ends.',
    snippet: defineSnippet({
      id: 'toolbar-react-keyboard',
      language: 'tsx',
      label: 'Nothing to write: the bar writes the tabindex',
      source: `// Every focusable control inside the bar is an item, found in the DOM
// rather than wrapped in a component of its own — so this library's own
// families, and a consumer's own control, drop in unwrapped.
<Toolbar aria-label="Formatação">
  <Button variant="ghost">Negrito</Button>
  <Checkbox>Grade</Checkbox>
  <Link href="/ajuda">Ajuda</Link>
</Toolbar>;`,
    }),
  },
  {
    id: 'keyOwners',
    title: 'An item that keeps the arrows',
    note: 'A text field needs the inline arrows for its caret, so the bar leaves them to it and focus moves out on the cross axis instead — the APG’s advice for the author, written as behaviour.',
    snippet: defineSnippet({
      id: 'toolbar-react-key-owners',
      language: 'tsx',
      label: 'The caret keeps its keys',
      source: `<Toolbar aria-label="Filtro">
  <Button variant="outline">Todos</Button>
  <ToolbarSpacer />
  {/* Inferred from the kind of control; data-toolbar-keys states it where
      the kind cannot say — "none", "inline", "block" or "all". */}
  <TextField aria-label="Buscar" type="search" />
</Toolbar>;`,
    }),
  },
  {
    id: 'disabled',
    title: 'A bar out of action',
    note: 'A fieldset around the bar disables every control inside it natively, and because a natively disabled control cannot be focused, the arrows skip exactly those — the platform answers it in two lines.',
    snippet: defineSnippet({
      id: 'toolbar-react-disabled',
      language: 'tsx',
      label: 'The element that can actually do it',
      source: `<fieldset disabled={readOnly}>
  <Toolbar aria-label="Somente leitura">
    <Button variant="outline">Editar</Button>
    <ToolbarSeparator />
    <Button tone="danger">Excluir</Button>
  </Toolbar>
</fieldset>;`,
    }),
  },
  {
    id: 'overflow',
    title: 'More controls than room',
    note: 'wrap keeps every control visible on a second row, and the arrows wrap from row to row because the item list is linear; scroll keeps the bar to one line and scrolls past its controls rather than squeezing them.',
    snippet: defineSnippet({
      id: 'toolbar-react-overflow',
      language: 'tsx',
      label: 'Two answers, and the third arrives with menu',
      source: `<Toolbar aria-label="Muitas ações" overflow="wrap" />;
<Toolbar aria-label="Muitas ações, rolando" overflow="scroll" />;`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and standing beside other families',
    note: 'The provider carries the five decisions an application takes once, and the bar is what belongs in a tab list’s actions slot — one tab stop for however many actions the page puts there.',
    snippet: defineSnippet({
      id: 'toolbar-react-composition',
      language: 'tsx',
      label: 'A provider, and a bar inside a tab list',
      source: `<ToolbarDefaultsProvider size="sm" variant="outline">
  <Tabs defaultValue="resumo">
    <TabList aria-label="Pedido">
      <Tab value="resumo">Resumo</Tab>
    </TabList>
    <TabActions>
      <Toolbar aria-label="Ações do pedido">
        <Button variant="ghost">Exportar</Button>
      </Toolbar>
    </TabActions>
  </Tabs>
</ToolbarDefaultsProvider>;`,
    }),
  },
];

export const REACT_TOOLBAR_DOCS = {
  toolbar: {
    imports,
    anatomy,
    scenes,
    api: apiRows([
      [
        'orientation',
        "'horizontal' | 'vertical'",
        'horizontal',
        'Toolbar, ToolbarDefaultsProvider',
        'Which way the bar runs, and therefore which arrow pair moves between the controls. A vertical bar also writes aria-orientation, which the role’s own default makes unnecessary for a horizontal one',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'Toolbar, ToolbarDefaultsProvider',
        'The bar’s own inset, gap and separator inset, from the control scales. It never touches the controls inside it: a bar that resized another family’s control would own state it cannot see',
      ],
      [
        'variant',
        "'plain' | 'outline'",
        'plain',
        'Toolbar, ToolbarDefaultsProvider',
        'Whether the bar paints a ground and a frame. An outline bar pads itself by at least the reach of a focus ring, so a focused control never sits on the bar’s own edge',
      ],
      [
        'overflow',
        "'wrap' | 'scroll'",
        'wrap',
        'Toolbar, ToolbarDefaultsProvider',
        'What a bar does with more controls than it has room for. The overflow menu that Primer, Kendo and Fluent reach for arrives with the menu family',
      ],
      [
        'loop',
        'boolean',
        'true',
        'Toolbar, ToolbarDefaultsProvider',
        'Whether the arrows wrap past the ends of the bar',
      ],
      [
        'aria-label',
        'string',
        '—',
        'Toolbar, ToolbarGroup',
        'The name of the bar, and of each group. The family writes neither: only the page knows what the set of controls is for. aria-labelledby works the same way',
      ],
      [
        'data-toolbar-keys',
        "'none' | 'inline' | 'block' | 'all'",
        'inferred',
        'any item',
        'Which keys an item keeps for itself. A text entry, a select, a slider, a spin button and a contenteditable keep the flow axis without stating anything; this is how a control the kind cannot describe says so',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props) => ReactNode',
        '—',
        'Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarSpacer',
        'Substitutes any of the four roots and hands it every attribute — a bar can be a nav, a rule an hr',
      ],
      [
        'ref',
        'Ref<HTMLDivElement>',
        '—',
        'Toolbar and every part',
        'Reaches the element itself. No imperative handle is invented: focus() on the control a page wants to start from is the platform’s own',
      ],
      [
        'items',
        'any focusable descendant',
        '—',
        'inside Toolbar',
        'Anything focusable is an item, found in the DOM: this library’s button, link, checkbox, switch and text-field, a menu trigger, or a consumer’s own control. An element that cannot hold focus is not reachable by the arrows',
      ],
      [
        'ToolbarDefaultsProvider',
        '{ orientation, size, variant, overflow, loop }',
        '—',
        'a subtree',
        'The five decisions an application takes once. A bar that states any of them itself still wins',
      ],
      [
        'fieldset',
        'the platform’s own element',
        '—',
        'around a Toolbar',
        'How a bar is taken out of action. A container cannot disable controls it does not own, and a bar that refused interaction while its controls still looked operable is the defect the state precedence exists to prevent',
      ],
    ]),
    accessibility: [
      'The pattern is the WAI-ARIA APG’s Toolbar (w3.org/WAI/ARIA/apg/patterns/toolbar/): the bar is one tab stop, entry lands on the control that last had focus or on the first that is not disabled, the arrows of the flow axis move between the controls and wrap — from row to row when the bar wrapped — and Home and End reach the ends. The cross axis duplicates the pair, which the pattern permits.',
      'The APG asks an author to avoid controls whose operation needs the navigation arrows and, failing that, to place one such control last. The bar enforces it instead: a text entry, a select, a slider, a spin button and a contenteditable keep the keys of the flow axis, and focus leaves them on the cross axis or with Tab.',
      'A control that announces aria-disabled keeps its place in the ring, which the pattern allows where discoverability of a function is crucial and which is what Button’s focusableWhenDisabled renders. A control carrying the native attribute is skipped, because the platform will not focus it either — including every control inside a disabled fieldset.',
      'The bar names itself with the consumer’s aria-label or aria-labelledby, and each group names itself the same way. The pattern uses the role for three or more controls; that is documented rather than enforced, because a role that disappeared when a permission filter removed a button would be a semantic changing behind the author.',
      'Nothing in the bar is painted over: every control keeps its own states, its own focus ring and its own contrast. What the bar adds is the boundary between runs — a group, a rule, a spacer — and under forced colours the rule keeps its own paint, because a background flattens to Canvas and would take the boundary with it.',
    ],
    snippets: [
      defineSnippet({
        id: 'toolbar-react-anatomy',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div
  data-ui="toolbar"
  data-part="root"
  role="toolbar"
  aria-label="Seleção"
  data-orientation="horizontal"
  data-size="md"
  data-variant="outline"
  data-overflow="wrap"
>
  <div data-part="group" role="group" aria-label="Alinhamento">
    <button tabindex="0">Início</button>
    <button tabindex="-1">Centro</button>
  </div>
  <div data-part="separator" role="separator" aria-orientation="vertical" />
  <div data-part="spacer" aria-hidden="true" />
  <button tabindex="-1">Excluir</button>
</div>;`,
      }),
      defineSnippet({
        id: 'toolbar-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='toolbar'] {
  --slotted-toolbar-gap: var(--slotted-space-5);
  --slotted-toolbar-inset: var(--slotted-space-4);
  --slotted-toolbar-separator-color: var(--slotted-border-subtle);
  --slotted-toolbar-background: var(--slotted-surface-sunken);
}`,
      }),
    ],
  },
} as const;
