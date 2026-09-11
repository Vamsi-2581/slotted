import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
  EventRow,
  ReferenceImport,
  ReferenceSceneMeta,
} from '@slotted/storybook-workbench';
import sectionTokens from '@slotted/styles/section/tokens.json';

type ApiTuple = readonly [string, string, string, string, string];
const apiRows = (rows: readonly ApiTuple[]): ApiRow[] =>
  rows.map(([name, type, defaultValue, appliesTo, description]) => ({
    name,
    type,
    defaultValue,
    appliesTo,
    description,
  }));

export const REACT_SECTION_TOKENS = sectionTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Section decision',
}));

const imports: ReferenceImport = {
  source:
    "import { Section, SectionHeader, SectionTitle, SectionEyebrow, SectionHeading, SectionDescription, SectionActions, SectionBody, SectionDefaultsProvider } from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'section, or the element render returns',
    required: true,
    purpose:
      'The unit, carrying data-ui="section", the five axes, an id a hash link can reach and a scroll margin the height of the page chrome. aria-labelledby its heading once one is rendered, which makes it a region.',
  },
  {
    part: 'header',
    element: 'div',
    required: false,
    purpose:
      'The row above the body: the title column and the actions. Sticky under the page chrome when sticky is set, painted in the page’s ground so what scrolls under it is covered; its height is measured and added to the sticky top the body publishes, so a table’s column header or a nested section inside stops under it, not under the page.',
  },
  {
    part: 'title',
    element: 'div',
    required: false,
    purpose: 'Eyebrow, heading and description, in that order, as one column.',
  },
  {
    part: 'eyebrow',
    element: 'span',
    required: false,
    purpose:
      'A short overline above the heading in small capitals — a count, a category. Structural rather than status: status is a mark beside the heading.',
  },
  {
    part: 'heading',
    element: 'h1 to h6, from the outline or level, or the element render returns',
    required: false,
    purpose:
      'The heading at the rank the section resolved. Rendering it is what names the region; render keeps the rank through aria-level when the element is not a heading.',
  },
  {
    part: 'description',
    element: 'p',
    required: false,
    purpose:
      'A paragraph under the heading, in the muted text, with a measure of seventy characters.',
  },
  {
    part: 'actions',
    element: 'div',
    required: false,
    purpose:
      'The end of the header row: a Button, a Toolbar, a Link. It wraps under the title when the width runs out.',
  },
  {
    part: 'body',
    element: 'div',
    required: true,
    purpose:
      'The content, wrapped one HeadingLevel deeper, so a section inside it takes the next rank without being told.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One section of a purchase order with every axis on it, driven by the controls below the canvas. It sits inside a page, so its rank is h2 and its sticky header stops under the page chrome.',
    snippet: defineSnippet({
      id: 'section-react-playground',
      language: 'tsx',
      label: 'A section inside a page body',
      source: `<Section>
  <SectionHeader>
    <SectionTitle>
      <SectionHeading>Itens do pedido</SectionHeading>
    </SectionTitle>
  </SectionHeader>
  <SectionBody>…</SectionBody>
</Section>;`,
    }),
  },
  {
    id: 'anatomy',
    title: 'Every part, written out',
    note: 'The eyebrow with the count, the heading, the description under it, two actions at the end of the row, and the body with the table. The section is a region named by its heading.',
    snippet: defineSnippet({
      id: 'section-react-anatomy',
      language: 'tsx',
      label: 'The eight parts',
      source: `<Section divider id="itens">
  <SectionHeader>
    <SectionTitle>
      <SectionEyebrow>36 itens</SectionEyebrow>
      <SectionHeading>Itens do pedido</SectionHeading>
      <SectionDescription>Quantidades conforme a cotação aceite.</SectionDescription>
    </SectionTitle>
    <SectionActions>
      <Button size="sm" variant="outline">
        Exportar
      </Button>
    </SectionActions>
  </SectionHeader>
  <SectionBody>
    <Table>…</Table>
  </SectionBody>
</Section>;`,
    }),
  },
  {
    id: 'level',
    title: 'The rank is the outline’s',
    note: 'Three sections nested: h2 directly in the page, h3 inside it, h4 inside that — none of them told. level="5" on the last one overrides the outline and typography warns in development about a skip.',
    snippet: defineSnippet({
      id: 'section-react-level',
      language: 'tsx',
      label: 'Nothing to write, and one override',
      source: `<Section>
  <SectionHeading>Frota</SectionHeading>
  <SectionBody>
    <Section>
      <SectionHeading>Veículos pesados</SectionHeading>
    </Section>
  </SectionBody>
</Section>;`,
    }),
  },
  {
    id: 'size',
    title: 'The step the heading sits at',
    note: 'sm for a group inside a form, md for a section of a page, lg for the one section a screen is about. The step is a size on the type scale and says nothing about the rank.',
    snippet: defineSnippet({
      id: 'section-react-size',
      language: 'tsx',
      label: 'Size and rank, apart',
      source: `<Section level="3" size="lg">
  …
</Section>;`,
    }),
  },
  {
    id: 'separation',
    title: 'Space, a rule, or a surface',
    note: 'Three sections on the page’s sunken canvas: separated by the stack’s gap alone, by a divider under the header, and by a surface with an edge and a radius — no shadow, no hover, because a section is not a card.',
    snippet: defineSnippet({
      id: 'section-react-separation',
      language: 'tsx',
      label: 'A surface, not a card',
      source: `<Section ground="surface">…</Section>;`,
    }),
  },
  {
    id: 'sticky',
    title: 'A header that stays',
    note: 'Scroll the screen: each section’s header stops under the page chrome and the next one pushes it away. Pin the page header and they all stop lower, because the page publishes where its chrome ends.',
    snippet: defineSnippet({
      id: 'section-react-sticky',
      language: 'tsx',
      label: 'Under whatever the page keeps at the top',
      source: `<Section sticky>…</Section>;`,
    }),
  },
  {
    id: 'nested',
    title: 'A section inside a section',
    note: 'The fleet, its heavy vehicles, the tractors: three depths, three ranks, and every rule the family owns reaches its parts with a child combinator, so the outer header styles nothing of the inner one.',
    snippet: defineSnippet({
      id: 'section-react-nested',
      language: 'tsx',
      label: 'Three depths',
      source: `<Section size="lg">
  <SectionHeading>Frota</SectionHeading>
  <SectionBody>
    <Section>
      <SectionHeading>Veículos pesados</SectionHeading>
      <SectionBody>
        <Section size="sm">
          <SectionHeading>Cavalos mecânicos</SectionHeading>
        </Section>
      </SectionBody>
    </Section>
  </SectionBody>
</Section>;`,
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A nine-word heading wraps, a long eyebrow wraps in small capitals, a translated description keeps its measure, and a header with no actions leaves no vacancy at the end of the row.',
    snippet: defineSnippet({
      id: 'section-react-content',
      language: 'tsx',
      label: 'A heading the row cannot hold',
      source: `<SectionHeading>
  Requisitos de homologação, garantia, recapagem e descarte ambientalmente adequado dos pneus
  fornecidos
</SectionHeading>;`,
    }),
  },
  {
    id: 'composition',
    title: 'A section with a table, a list and a form in it',
    note: 'The body holds other families and steps the outline for them: the table’s caption, the collapsible’s header and the form’s legend all sit one rank under the section. Scroll and the sticky header stays over all of it.',
    snippet: defineSnippet({
      id: 'section-react-composition',
      language: 'tsx',
      label: 'What a body holds',
      source: `<SectionBody>
  <Table stickyHeader stickyTo="page">
    …
  </Table>
</SectionBody>;`,
    }),
  },
  {
    id: 'defaults',
    title: 'Setting it once, and reaching past it',
    note: 'The provider carries size, divider, ground and sticky for every section under it; render turns the heading into a link while the family keeps the rank and the identifier; a hash link reaches the root by its id.',
    snippet: defineSnippet({
      id: 'section-react-defaults',
      language: 'tsx',
      label: 'Four decisions, taken once',
      source: `<SectionDefaultsProvider divider size="sm">
  <Section>…</Section>
</SectionDefaultsProvider>;`,
    }),
  },
  {
    id: 'accessibility',
    title: 'What a reader hears',
    note: 'A section with a heading is a region in the landmark list, named by the heading; one without a heading is a plain section, absent from it. Jump to a section by hash and it lands under the page chrome, not behind it.',
    snippet: defineSnippet({
      id: 'section-react-accessibility',
      language: 'tsx',
      label: 'A region, and a hash link to it',
      source: `<a href="#historico">Ir ao histórico</a>;`,
    }),
  },
];

const events: EventRow[] = [];

export const REACT_SECTION_DOCS = {
  section: {
    imports,
    anatomy,
    scenes,
    events,
    api: apiRows([
      [
        'size',
        "'sm' | 'md' | 'lg'",
        'md',
        'Section, SectionDefaultsProvider',
        'The step the heading sits at, on the type scale, independent of its rank',
      ],
      [
        'level',
        "'auto' | '1' | '2' | '3' | '4' | '5' | '6'",
        'auto',
        'Section',
        'The rank of the heading. auto takes the one typography’s outline gives: h2 directly in a page, one deeper inside another section',
      ],
      [
        'divider',
        'boolean',
        'false',
        'Section, SectionDefaultsProvider',
        'A rule under the header, for a page where space alone does not separate',
      ],
      [
        'ground',
        "'none' | 'surface'",
        'none',
        'Section, SectionDefaultsProvider',
        'none is transparent; surface paints the raised surface with a subtle edge and the large radius — no shadow, no hover, no action, because a section is not a card',
      ],
      [
        'sticky',
        'boolean',
        'false',
        'Section, SectionDefaultsProvider',
        'The header stays under the page chrome while the body scrolls, painted in the page’s ground. Without a page it sticks to the top of whatever scrolls',
      ],
      [
        'id',
        'string',
        'from useId',
        'Section',
        'The identifier a hash link reaches. The heading’s own id is derived from it',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props) => ReactNode',
        '—',
        'every part',
        'Substitutes the element and hands it every attribute. A heading rendered into another element keeps its rank through role="heading" and aria-level',
      ],
      [
        'ref',
        'Ref<HTMLElement>',
        '—',
        'every part',
        'Reaches the element itself; no imperative handle is invented for a family with no state',
      ],
      [
        'useSection()',
        '() => SectionContextValue',
        '—',
        'inside Section',
        'What the parts read: the rank, the heading’s identifier, and registerHeading, which is how the root learns it has a name',
      ],
      [
        'SectionDefaultsProvider',
        '{ size, divider, ground, sticky }',
        '—',
        'a subtree',
        'The four decisions an application takes once. A section that states any of them itself still wins',
      ],
      [
        'HeadingLevel',
        'from @slotted/react/typography',
        '—',
        'around a subtree',
        'The outline context the section reads. The body is already one step deeper; wrap a subtree in it to step the outline yourself',
      ],
    ]),
    accessibility: [
      'The practice is the WAI-ARIA APG’s Landmark Regions (w3.org/WAI/ARIA/apg/practices/landmark-regions/): a section element with an accessible name is a region landmark. The root is aria-labelledby its heading once one is rendered, so a section with a heading appears in the landmark list under the heading’s words, and one without a heading is a plain section that clutters nothing.',
      'The rank is real. The heading renders h1 to h6 from the outline typography keeps — h2 directly in a page body, one deeper inside another section’s body — and level overrides it. A heading rendered into another element through render carries role="heading" and aria-level, so the outline survives an editable or linked title.',
      'The body is one HeadingLevel deeper, which is what keeps a nested section, a collapsible or a table caption at the right rank without either family reading the other. The HTML Standard requires each heading to be at most one deeper than the one before, and stepping by exactly one is the only way to hold that in a tree assembled from components.',
      'The root carries a scroll margin the height of the page chrome, so a hash link to the section lands under the header rather than behind it. The id comes from useId or the consumer, and the heading’s id is derived from it, so an anchor-nav family later has both to reach.',
      'Nothing here is interactive. The actions slot holds the consumer’s own controls, in the page tab sequence like any other; the sticky header is CSS and takes no focus.',
    ],
    snippets: [
      defineSnippet({
        id: 'section-react-dom',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source: `<section
  data-ui="section"
  data-part="root"
  data-size="md"
  data-level="2"
  data-ground="none"
  data-divider
  id="itens"
  aria-labelledby="itens-heading"
>
  <div data-part="header">
    <div data-part="title">
      <span data-part="eyebrow">36 itens</span>
      <h2 data-part="heading" id="itens-heading">
        Itens do pedido
      </h2>
      <p data-part="description">…</p>
    </div>
    <div data-part="actions">…</div>
  </div>
  <div data-part="body">…</div>
</section>;`,
      }),
      defineSnippet({
        id: 'section-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source: `[data-ui='section'] {
  --slotted-section-gap: var(--slotted-space-6);
  --slotted-section-heading-size-md: var(--slotted-font-size-xl);
  --slotted-section-surface: var(--slotted-surface);
  --slotted-section-radius: var(--slotted-radius-md);
}`,
      }),
    ],
  },
} as const;
