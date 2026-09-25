import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import tabsTokens from '@slotted/styles/tabs/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_TABS_TOKENS = tabsTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Tabs decision',
}));

const imports: ReferenceImport = {
  source:
    "import { Tab, TabActions, TabList, TabPanel, Tabs, TabsDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'div, or the element render returns',
    required: true,
    purpose:
      'The family. A four-column, two-row grid carrying data-ui="tabs", the five axes, data-disabled, data-overflowing and data-activation-direction. It renders the two paging controls itself, because it owns the observer that knows whether they are needed.',
  },
  {
    part: 'list',
    element: 'div[role="tablist"]',
    required: true,
    purpose:
      'The scroll container and the one tab stop. Its accessible name is the aria-label or aria-labelledby the consumer writes; the family writes neither, because only the page knows what the set of views is for.',
  },
  {
    part: 'item',
    element: 'div[role="presentation"], or the element Tab’s render returns',
    required: true,
    purpose:
      'One tab and its optional dismiss control. It exists for two reasons a button cannot answer: a button may not contain a button, and the marker has to span the pair rather than only the label. className and style reach it.',
  },
  {
    part: 'tab',
    element: 'button[role="tab"], or a[role="tab"] with href',
    required: true,
    purpose:
      'The control. Holds aria-selected, aria-controls, the identifier, data-value — which is what the keyboard reads — and every native prop and ref the consumer wrote.',
  },
  {
    part: 'label',
    element: 'span',
    required: true,
    purpose:
      'The words. A box of their own, so text-overflow has something to clip when fit="equal" makes a share too narrow, and so a label in another script reads its own way inside a page that reads the other.',
  },
  {
    part: 'dismiss',
    element: 'button',
    required: false,
    purpose:
      'Closes the tab. tabindex="-1", so the arrow model stays the pattern’s, and inside the accessibility tree, so it is not a control only a mouse can reach — the keyboard path is Delete, announced by aria-keyshortcuts on the tab.',
  },
  {
    part: 'panel',
    element: 'div[role="tabpanel"]',
    required: true,
    purpose:
      'The content of one tab: aria-labelledby its tab, tabindex="0", and hidden while another tab is selected. Whether it exists at all is what mount decides.',
  },
  {
    part: 'scroll',
    element: 'button',
    required: false,
    purpose:
      'One paging control per end, drawn only while the list overflows. aria-hidden and out of the tab sequence: the arrows already reach every tab and bring it into view.',
  },
  {
    part: 'actions',
    element: 'div, or the element render returns',
    required: false,
    purpose:
      'A slot beside the list, on the same row. What belongs in it is a Toolbar: one tab stop for however many actions the page puts there.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One family with every axis on it, driven by the controls below the canvas. Tab into it once: the list is a single stop, and the arrows move the selection from there.',
    snippet: defineSnippet({
      id: 'tabs-react-playground',
      language: 'tsx',
      label: 'A set of views over one panel',
      source: `<Tabs defaultValue="resumo">
  <TabList aria-label="Pedido">
    <Tab value="resumo">Resumo</Tab>
    <Tab value="itens">Itens</Tab>
  </TabList>
  <TabPanel value="resumo">Entrega prevista para 12 de setembro.</TabPanel>
  <TabPanel value="itens">Três itens.</TabPanel>
</Tabs>;`,
    }),
  },
  {
    id: 'activation',
    title: 'Whether focus selects',
    note: 'Automatic is the APG’s recommendation for panels that are already loaded; manual moves focus and waits for Enter or Space, which is what a panel that fetches needs.',
    snippet: defineSnippet({
      id: 'tabs-react-activation',
      language: 'tsx',
      label: 'Selection following focus, and not',
      source: `<Tabs activation="automatic" defaultValue="a" />;
<Tabs activation="manual" defaultValue="a" />;`,
    }),
  },
  {
    id: 'orientation',
    title: 'Which way the list runs',
    note: 'A horizontal list scrolls and refuses the up and down arrows, so the page keeps scrolling with focus inside it; a vertical one stacks, turns the track and the marker, and announces aria-orientation.',
    snippet: defineSnippet({
      id: 'tabs-react-orientation',
      language: 'tsx',
      label: 'A row of views, and a column of them',
      source: `<Tabs defaultValue="a" orientation="vertical">
  <TabList aria-label="Configurações">
    <Tab value="a">Perfil</Tab>
    <Tab value="b">Notificações</Tab>
  </TabList>
  <TabPanel value="a">Nome e foto.</TabPanel>
  <TabPanel value="b">Avisos por e-mail.</TabPanel>
</Tabs>;`,
    }),
  },
  {
    id: 'variant',
    title: 'The two ways a list is drawn',
    note: 'Line is a row of labels over a hairline; contained is a sunken track holding a surface per tab; and track="none" keeps the labels and drops the hairline, for a list standing on a line the page already drew. All three keep the accent marker, which is what survives the high-contrast scheme after every surface flattens.',
    snippet: defineSnippet({
      id: 'tabs-react-variant',
      language: 'tsx',
      label: 'Line, contained, and no line at all',
      source: `<Tabs defaultValue="a" variant="line" />;
<Tabs defaultValue="a" variant="contained" />;

// Standing on a line the page already drew — a card header, a table's rule.
<Tabs defaultValue="a" track="none" />;`,
    }),
  },
  {
    id: 'sizes',
    title: 'The step the list sits at',
    note: 'Height, type, padding and the inner gap all come from the control scales, so switching the toolbar to dense shrinks each step whole rather than in parts.',
    snippet: defineSnippet({
      id: 'tabs-react-sizes',
      language: 'tsx',
      label: 'Three steps, all answering density',
      source: `<Tabs defaultValue="a" size="sm" />;
<Tabs defaultValue="a" size="md" />;
<Tabs defaultValue="a" size="lg" />;`,
    }),
  },
  {
    id: 'fit',
    title: 'How the line is divided',
    note: 'auto makes each tab as wide as its label and scrolls what does not fit; equal divides the line between them and is the one place a horizontal label is ever truncated.',
    snippet: defineSnippet({
      id: 'tabs-react-fit',
      language: 'tsx',
      label: 'As wide as the label, or an equal share',
      source: `<Tabs defaultValue="a" fit="auto" />;
<Tabs defaultValue="a" fit="equal" variant="contained" />;`,
    }),
  },
  {
    id: 'states',
    title: 'Every state the family paints',
    note: 'A tab that is not selected raises its ink on hover. In the line variant a neutral bar appears where the mark would go and darkens on press; in the contained variant the cell fills instead. A selected one does neither, because it is already at full strength. Disabled is the native attribute, which is also what makes the browser skip it.',
    snippet: defineSnippet({
      id: 'tabs-react-states',
      language: 'tsx',
      label: 'One tab out of reach, and a whole family',
      source: `<Tabs defaultValue="a">
  <TabList aria-label="Pedido">
    <Tab value="a">Disponível</Tab>
    <Tab disabled value="b">
      Indisponível
    </Tab>
  </TabList>
  <TabPanel value="a">…</TabPanel>
</Tabs>;

<Tabs defaultValue="a" disabled />;`,
    }),
  },
  {
    id: 'mount',
    title: 'When a panel exists',
    note: 'active builds the panel on selection and drops it after, lazy keeps it once built, eager builds every one up front. A panel holding a table or a chart is the reason the default is active.',
    snippet: defineSnippet({
      id: 'tabs-react-mount',
      language: 'tsx',
      label: 'Three strategies, one axis',
      source: `<Tabs defaultValue="a" mount="active" />;
<Tabs defaultValue="a" mount="lazy" />;
<Tabs defaultValue="a" mount="eager" />;`,
    }),
  },
  {
    id: 'dismissible',
    title: 'Tabs a reader can close',
    note: 'Delete closes the focused tab and the pointer closes it from the control; the family then asks for the neighbour — the following tab, or the preceding one when the closed tab was last — and removes nothing itself.',
    snippet: defineSnippet({
      id: 'tabs-react-dismissible',
      language: 'tsx',
      label: 'The consumer owns the collection',
      source: `<Tabs
  onTabDismiss={(value) => setQueries((open) => open.filter((query) => query !== value))}
  onValueChange={setActive}
  value={active}
>
  <TabList aria-label="Consultas">
    {queries.map((query) => (
      <Tab dismissLabel={\`Fechar \${query}\`} dismissible key={query} value={query}>
        {query}
      </Tab>
    ))}
  </TabList>
</Tabs>;`,
    }),
  },
  {
    id: 'overflow',
    title: 'A list that does not fit',
    note: 'The list scrolls rather than wrapping or truncating, two paging controls appear only while there is somewhere to scroll, and the arrow keys bring each tab into view as focus reaches it.',
    snippet: defineSnippet({
      id: 'tabs-react-overflow',
      language: 'tsx',
      label: 'Twenty views in a narrow column',
      source: `// Nothing to write: the list scrolls, the controls appear when they are
// needed, and the selected tab is brought into view on every change.
<Tabs defaultValue="v1">
  <TabList aria-label="Versões">{versions.map(renderTab)}</TabList>
</Tabs>;`,
    }),
  },
  {
    id: 'links',
    title: 'A view a router can deep-link to',
    note: 'href makes the control an anchor, so the destination is real: a plain click selects, and a click carrying a modifier key is left to the browser, which opens the view in a new browser tab.',
    snippet: defineSnippet({
      id: 'tabs-react-links',
      language: 'tsx',
      label: 'Selection and navigation in one control',
      source: `<Tabs onValueChange={(value) => navigate(\`/pedido/\${value}\`)} value={view}>
  <TabList aria-label="Pedido">
    <Tab href="/pedido/resumo" value="resumo">
      Resumo
    </Tab>
    <Tab href="/pedido/itens" value="itens">
      Itens
    </Tab>
  </TabList>
</Tabs>;`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'An unbroken digest breaks inside its own tab instead of setting the list’s width, a right-to-left label reads its own way inside a page that reads the other, and a long label scrolls rather than wrapping.',
    snippet: defineSnippet({
      id: 'tabs-react-content',
      language: 'tsx',
      label: 'Long, unbroken and right-to-left',
      source: `<Tabs defaultValue="a">
  <TabList aria-label="Conteúdo extremo">
    <Tab value="a">sha256:9f86d081884c7d659a2feaa0c55ad015</Tab>
    <Tab value="b">بيانات التسليم</Tab>
  </TabList>
</Tabs>;`,
    }),
  },
  {
    id: 'composition',
    title: 'Setting it once, and reaching past it',
    note: 'The provider carries the seven decisions an application takes once, render substitutes every root so a list can be a real nav, and the actions slot is where a Toolbar goes.',
    snippet: defineSnippet({
      id: 'tabs-react-composition',
      language: 'tsx',
      label: 'A provider, a nav, and a toolbar beside the list',
      source: `<TabsDefaultsProvider size="sm" variant="contained">
  <Tabs defaultValue="a" render={(props) => <section {...props} />}>
    <TabList aria-label="Pedido" render={(props) => <nav {...props} />} />
    <TabActions>
      <Toolbar aria-label="Ações do pedido" size="sm">
        <Button variant="ghost">Exportar</Button>
      </Toolbar>
    </TabActions>
  </Tabs>
</TabsDefaultsProvider>;`,
    }),
  },
  {
    id: 'keyboard',
    title: 'The APG table, and where focus lands',
    note: 'Tab enters on the selected tab and leaves to the panel, the arrows of the flow axis move and wrap, Home and End reach the ends, and Delete closes a dismissible tab and moves focus to its neighbour.',
    snippet: defineSnippet({
      id: 'tabs-react-keyboard',
      language: 'tsx',
      label: 'Which device asked, and why',
      source: `<Tabs
  defaultValue="a"
  onValueChange={(value, request) => {
    // 'pointer', 'keyboard' or 'remove' — and request.cancel() refuses the
    // move before anything commits, which is what an unsaved panel needs.
    setReason(request.reason);
  }}
/>;`,
    }),
  },
];

const events: EventRow[] = [
  {
    name: 'onValueChange',
    payload: '(value: string, request: ChangeRequest<string | undefined>)',
    when: 'Before the selection moves. The request carries the new value, the value it replaces — undefined while nothing has been selected — the reason (pointer, keyboard, remove or programmatic), the originating event, and cancel(), which refuses the move before anything commits.',
  },
  {
    name: 'onTabDismiss',
    payload: '(value: string, request: TabsDismissRequest)',
    when: 'Before a tab is closed, by Delete or by its control. Cancelling it stops both the dismissal and the selection that would have followed. The family removes nothing itself: the consumer owns the collection.',
  },
  {
    name: 'onClick, onKeyDown, onFocus, on each tab',
    payload: 'the element’s own events',
    when: 'Whenever that tab’s control fires them. The family composes with a consumer’s handler rather than replacing it: the consumer’s runs first, and preventDefault() in onClick stops the selection as well.',
  },
];

export const REACT_TABS_DOCS = {
  tabs: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'value',
        'string',
        '—',
        'Tabs',
        'Present means the consumer owns the selection, for the life of the component. Absent, the family owns it and starts from defaultValue',
      ],
      [
        'defaultValue',
        'string',
        '—',
        'Tabs',
        'The value an uncontrolled family starts from, read once. Left unset, nothing is selected and no panel is shown',
      ],
      [
        'activation',
        "'automatic' | 'manual'",
        'automatic',
        'Tabs, TabsDefaultsProvider',
        'Whether moving focus to a tab also selects it. The APG recommends automatic while panels are displayed without noticeable latency, and manual when the panel has to be fetched',
      ],
      [
        'orientation',
        "'horizontal' | 'vertical'",
        'horizontal',
        'Tabs, TabsDefaultsProvider',
        'Which way the list runs, and therefore which arrow pair moves the selection. A horizontal list does not listen for the up and down arrows, so the page keeps scrolling',
      ],
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'Tabs, TabsDefaultsProvider',
        'The control step the list sits at: height, type, padding and inner gap, all from the control scales the theme restates per density',
      ],
      [
        'variant',
        "'line' | 'contained'",
        'line',
        'Tabs, TabsDefaultsProvider',
        'How the list is drawn. Both variants paint the accent marker, which is what says which view is open once the high-contrast scheme flattens every surface',
      ],
      [
        'track',
        "'line' | 'none'",
        'line',
        'Tabs, TabsDefaultsProvider',
        'Whether the list draws the line its tabs stand on. none is for a list that sits on a line the page already drew — a card header’s edge, a table’s own rule — where two hairlines a pixel apart read as one smudge. The marker then sits on the item’s own edge, so it lands on the line that is there',
      ],
      [
        'fit',
        "'auto' | 'equal'",
        'auto',
        'Tabs, TabsDefaultsProvider',
        'Whether each tab is as wide as its label or takes an equal share of the line. equal truncates a label that outgrows its share; auto never truncates and scrolls instead',
      ],
      [
        'mount',
        "'active' | 'lazy' | 'eager'",
        'active',
        'Tabs, TabsDefaultsProvider',
        'When a panel exists: only while selected, from its first selection onward, or from the start. Hidden panels carry the hidden attribute rather than a class',
      ],
      [
        'loop',
        'boolean',
        'true',
        'Tabs, TabsDefaultsProvider',
        'Whether the arrows wrap past the ends of the list',
      ],
      [
        'disabled',
        'boolean',
        'false',
        'Tabs',
        'Reaches every tab as the native attribute, which is also what makes the browser skip it with the arrow keys, and dims the track',
      ],
      [
        'value, on Tab',
        'string',
        '—',
        'Tab',
        'What this tab selects, and what the family’s value holds. It reaches the DOM as data-value, which is what the keyboard reads',
      ],
      [
        'disabled, on Tab',
        'boolean',
        'from the family, or false',
        'Tab',
        'Unstated rather than false, so one tab may be unavailable in an otherwise live list',
      ],
      [
        'dismissible',
        'boolean',
        'false',
        'Tab',
        'Draws the dismiss control and binds Delete on the tab, announced through aria-keyshortcuts',
      ],
      [
        'dismissLabel',
        'string',
        '—',
        'Tab',
        'The accessible name of that control. Required whenever it is drawn: “Fechar clientes.sql” says what closes, where “Fechar” alone says only that something does',
      ],
      [
        'href',
        'string',
        '—',
        'Tab',
        'Makes the control an anchor. A plain click selects; a click carrying a modifier key is left to the browser, so the view opens in a new browser tab',
      ],
      [
        'value, on TabPanel',
        'string',
        '—',
        'TabPanel',
        'The tab this panel belongs to. The pair is wired by identifiers the family generates from the value',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props) => ReactNode',
        '—',
        'Tabs, TabList, Tab, TabPanel, TabActions',
        'Substitutes any of the five roots and hands it every attribute — a list can be a real nav, a family a section. The tab control itself is fixed: substituting the element that holds the role, the value and the keyboard would leave the family with nothing to be, and href covers the one substitution that matters',
      ],
      [
        'ref',
        'Ref<HTMLElement>',
        '—',
        'Tab, TabPanel, Tabs',
        'Reaches the tab’s own control, so focus() and click() are the element’s own and no imperative handle is invented for what the platform already ships',
      ],
      [
        'useTabs()',
        '() => TabsContextValue',
        '—',
        'inside Tabs',
        'What a tab and a panel read: the value, the mount strategy, the identifiers, and select(value, reason) for a view a page changes on its own. It throws outside a family rather than rendering a control that looks right and does nothing',
      ],
      [
        'TabsDefaultsProvider',
        '{ activation, orientation, size, variant, fit, mount, loop }',
        '—',
        'a subtree',
        'The seven decisions an application takes once. A family that states any of them itself still wins',
      ],
      [
        'aria-label, on TabList',
        'string',
        '—',
        'TabList',
        'The name of the set of views. The family writes none of its own, because only the page knows what the set is for; aria-labelledby works the same way',
      ],
    ]),
    accessibility: [
      'The pattern is the WAI-ARIA APG’s Tabs (w3.org/WAI/ARIA/apg/patterns/tabs/), and the whole keyboard table is implemented: Tab enters the list on the selected tab and leaves to the panel, the arrows of the flow axis move focus and wrap at both ends, Home and End reach the first and last enabled tab, Enter and Space activate under manual activation, and Delete closes a dismissible tab. A horizontal list deliberately does not listen for the up and down arrows, so those keys keep scrolling the page while focus is inside the list.',
      'Focus after a dismissal is the pattern’s own rule: the tab that followed the closed one, the tab before it when the closed one was last, and the list itself when none is left — which is why the list carries tabindex="-1". The selection follows the same rule, with the reason "remove", which is the half Carbon and Cloudscape leave to the consumer.',
      'The dismiss control is out of the arrow ring and inside the accessibility tree. A screen reader reaches and presses it; a keyboard reader uses Delete, which the tab announces with aria-keyshortcuts. Putting it in the ring would double the number of arrow presses it takes to cross a list.',
      'The paging controls are aria-hidden and out of the tab sequence, because every tab is already reachable through the roving stop and the arrows bring each one into view. Cloudscape’s own guidance warns against extra stops between a tab list and its panel, and this is that warning taken literally.',
      'Each tab names its panel with aria-controls and each panel names its tab with aria-labelledby; the identifiers are generated from the value, escaping the characters an identifier refuses rather than replacing them, so two values that differ only in a space never wire one panel.',
      'The selected tab is never said with colour alone: the marker is a border-width bar, which is what survives the high-contrast scheme, where the theme paints every surface Canvas and the contained variant’s fill disappears.',
      'A panel carries tabindex="0" so the tab sequence reaches it from the list. That is one stop for a panel whose first content is already focusable, which the pattern permits and every surveyed implementation ships.',
    ],
    snippets: [
      defineSnippet({
        id: 'tabs-react-anatomy',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source: `<div
  data-ui="tabs"
  data-part="root"
  data-size="md"
  data-variant="line"
  data-orientation="horizontal"
  data-fit="auto"
  data-activation-direction="forward"
>
  <div data-part="list" role="tablist" aria-label="Pedido" tabindex="-1">
    <div data-part="item" role="presentation" data-selected>
      <button data-part="tab" role="tab" id="t-a" aria-controls="p-a" aria-selected="true">
        <span data-part="label">Resumo</span>
      </button>
      <button data-part="dismiss" tabindex="-1" aria-label="Fechar Resumo" />
    </div>
  </div>
  <div data-part="actions">…</div>
  <div data-part="panel" role="tabpanel" id="p-a" aria-labelledby="t-a" tabindex="0">
    …
  </div>
</div>;`,
      }),
      defineSnippet({
        id: 'tabs-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='tabs'] {
  --slotted-tabs-gap: var(--slotted-space-8);
  --slotted-tabs-marker-color: var(--slotted-tone-success-solid);
  --slotted-tabs-selected-color: var(--slotted-tone-success-text);
  --slotted-tabs-track-color: var(--slotted-border-strong);
}`,
      }),
    ],
  },
} as const;
