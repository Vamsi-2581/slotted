import resultStateTokens from '@slotted/styles/result-state/tokens.json';
import { defineSnippet } from '@slotted/storybook-workbench';
import type {
  AnatomyRow,
  ApiRow,
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

export const REACT_RESULT_STATE_TOKENS = resultStateTokens.map((name) => ({
  name,
  purpose: 'Theme-owned Result State decision',
}));

const imports: ReferenceImport = {
  source:
    "import {\n  ResultState,\n  ResultStateActions,\n  ResultStateContent,\n  ResultStateDefaultsProvider,\n  ResultStateDescription,\n  ResultStateFooter,\n  ResultStateTitle,\n} from '@slotted/react';",
};

const anatomy: AnatomyRow[] = [
  {
    part: 'root',
    element: 'section',
    required: true,
    purpose:
      'The region. Carries data-ui="result-state", the four axes and tabindex="-1". A section named by its own title is a region landmark a reader can jump to; unnamed it is a plain grouping element that costs nothing.',
  },
  {
    part: 'media',
    element: 'div',
    required: false,
    purpose:
      'The page’s own illustration, hidden from assistive technology. It keeps the height the reach gives it, so an illustration that has not loaded moves nothing when it arrives. Empty it is withdrawn by the stylesheet: the family draws no mark of its own, because a tone glyph alone above a title is the pattern R5 refuses.',
  },
  {
    part: 'content',
    element: 'div',
    required: true,
    purpose:
      'The title and the description, and nothing else. This is the live region: role="status" or role="alert" is written here, so the buttons beside it are outside what a reader hears.',
  },
  {
    part: 'title',
    element: 'div, or the element render returns',
    required: false,
    purpose:
      'The message’s name, and the region’s: the root points aria-labelledby at it. A div by default, because a heading belongs in the document outline and only the page knows whether this message does. An id the page writes is kept, and the root points at that one instead.',
  },
  {
    part: 'description',
    element: 'p, or the element render returns',
    required: false,
    purpose:
      'What to do next. It breaks a string no language can break — a resource id, a host name without a hyphen — rather than overflowing, and removes nothing from the DOM to do it.',
  },
  {
    part: 'actions',
    element: 'div',
    required: false,
    purpose:
      'The controls that get the reader out of the situation, outside the live region. They stack below a container width of 20rem, and at inline reach they sit on the message’s own first line.',
  },
  {
    part: 'footer',
    element: 'div',
    required: false,
    purpose:
      'The line under the actions: the documentation link that is not a call to action. Set one step down and in the muted role, because it is neither of the buttons above it.',
  },
];

const scenes: ReferenceSceneMeta[] = [
  {
    id: 'playground',
    title: 'Playground',
    note: 'One region with every axis on it, driven by the controls below the canvas. Change the status and the mark changes with it, which is what makes the seven distinguishable in greyscale.',
    snippet: defineSnippet({
      id: 'result-state-react-playground',
      language: 'tsx',
      label: 'A region that stands in for content',
      source:
        '<ResultState status="empty">\n  <ResultStateContent>\n    <ResultStateTitle>Nenhum projeto ainda</ResultStateTitle>\n    <ResultStateDescription>\n      Crie um projeto para começar a coletar execuções.\n    </ResultStateDescription>\n  </ResultStateContent>\n  <ResultStateActions>\n    <Button>Criar projeto</Button>\n  </ResultStateActions>\n</ResultState>;',
    }),
  },
  {
    id: 'statuses',
    title: 'What the region is reporting',
    note: 'Seven semantics, seven silhouettes. Read in greyscale, or under forced colours where every ground becomes one system colour, the shape is the only thing left telling an absent collection from a failed request.',
    snippet: defineSnippet({
      id: 'result-state-react-statuses',
      language: 'tsx',
      label: 'The seven, and what each one says',
      source:
        '// empty: the collection exists and holds nothing.\n// no-results: a query or a filter matched nothing.\n// not-found: the thing that was asked for is not here.\n// error: a failure the reader can act on.\n// forbidden: the reader is not allowed to see it.\n// offline: the connection is gone.\n// success: the flow finished and there is nothing left to do.\n<ResultState status="no-results" />;',
    }),
  },
  {
    id: 'reach',
    title: 'How far the region reaches',
    note: 'A row inside a table cell, a panel inside a card, the whole route — the same three words alert uses. The mark is the title’s own size at every reach and stands over the title at section and page; at inline it sits on the message’s first line and the actions join it, and at page the title takes the top step of the type scale.',
    snippet: defineSnippet({
      id: 'result-state-react-reach',
      language: 'tsx',
      label: 'The same region at three scopes',
      source:
        '<ResultState reach="inline" status="no-results">\n  <ResultStateContent>\n    <ResultStateTitle>Nenhuma linha corresponde ao filtro</ResultStateTitle>\n  </ResultStateContent>\n  <ResultStateActions>\n    <Button size="sm" variant="ghost">\n      Limpar filtros\n    </Button>\n  </ResultStateActions>\n</ResultState>;\n\n<ResultState reach="page" status="not-found" />;',
    }),
  },
  {
    id: 'align',
    title: 'Centred, or from the inline edge',
    note: 'Carbon left-aligns its empty states inside data-dense views and the other six surveyed implementations centre unconditionally. Both readings are real, and align is one axis rather than a second family.',
    snippet: defineSnippet({
      id: 'result-state-react-align',
      language: 'tsx',
      label: 'The two readings',
      source:
        '// The default, for a panel or a route.\n<ResultState align="center" />;\n\n// For a data-dense screen, where a centred column reads as an interruption.\n<ResultState align="start" reach="inline" />;',
    }),
  },
  {
    id: 'media',
    title: 'The page’s own illustration',
    note: 'The box is sized before anything is in it, so an illustration that has not loaded reserves the space it will occupy and the title below it never moves. Atlassian spends four props on that and Polaris a skeleton with an effect.',
    snippet: defineSnippet({
      id: 'result-state-react-media',
      language: 'tsx',
      label: 'A region with an illustration, and one without',
      source:
        '// A title, a description and an action: the family draws no picture.\n<ResultState status="offline" />;\n\n// The page draws its own, in the box the family keeps.\n<ResultState media={<BoardIllustration />} />;\n\n// Or named in CSS, for a page that skins its states in the theme:\n// [data-ui="result-state"][data-status="offline"] > [data-part="media"] {\n//   display: block;\n//   --slotted-result-state-media: url("/illustrations/offline.svg");\n// }',
    }),
  },
  {
    id: 'actions',
    title: 'The way out of the situation',
    note: 'The controls are the consumer’s own Buttons in a part outside the live region — a reader hearing the message is not read two button labels in the middle of it. Narrow the window past 20rem and watch them stack.',
    snippet: defineSnippet({
      id: 'result-state-react-actions',
      language: 'tsx',
      label: 'Two controls, a link that is not one, and a retry in flight',
      source:
        '<ResultState status="error">\n  <ResultStateContent>\n    <ResultStateTitle>A execução falhou</ResultStateTitle>\n  </ResultStateContent>\n  <ResultStateActions>\n    <Button loading={retrying} tone="danger">\n      Tentar de novo\n    </Button>\n    <Button variant="outline">Abrir registro</Button>\n  </ResultStateActions>\n  <ResultStateFooter>\n    <Link href="/docs/retries">Como as tentativas são contadas</Link>\n  </ResultStateFooter>\n</ResultState>;',
    }),
  },
  {
    id: 'live',
    title: 'What a reader hears, and when',
    note: 'polite by default, which is where this family and alert disagree: WCAG 2.2 SC 4.1.3 names “No results returned” as its own example of a status message. Press the button and the region arrives while the reader is elsewhere.',
    snippet: defineSnippet({
      id: 'result-state-react-live',
      language: 'tsx',
      label: 'The default, the loud one, and the opt-out',
      source:
        '// The default. role="status" on the text, which implies aria-live and\n// aria-atomic; the buttons beside it are outside the region.\n<ResultState live="polite" status="no-results" />;\n\n// role="alert", for a failure the reader has to hear now.\n<ResultState live="assertive" status="error" />;\n\n// Off, when the page already owns a live region around this one.\n<ResultState live="off" />;',
    }),
  },
  {
    id: 'content',
    title: 'Content the family did not choose',
    note: 'A German compound with no break opportunity, a digest no language can break, a title standing alone and a region with no mark — all in a column narrow enough to make each of them a problem.',
    snippet: defineSnippet({
      id: 'result-state-react-content',
      language: 'tsx',
      label: 'Long, unbreakable, and bare',
      source:
        '<ResultState status="error">\n  <ResultStateContent>\n    <ResultStateTitle>{longTranslatedTitle}</ResultStateTitle>\n    <ResultStateDescription>A execução {digest} falhou.</ResultStateDescription>\n  </ResultStateContent>\n</ResultState>;',
    }),
  },
  {
    id: 'composition',
    title: 'Composition and escape hatches',
    note: 'Measure belongs to container and the frame to card, so the region caps nothing and draws no box: these two lines are what a consumer writes instead. The provider sets the axes once, and render substitutes the element of any part.',
    snippet: defineSnippet({
      id: 'result-state-react-composition',
      language: 'tsx',
      label: 'The measure, the frame, the defaults and the element',
      source:
        '<Container size="measure">\n  <ResultState reach="page" status="no-results" />\n</Container>;\n\n<Card>\n  <ResultState status="empty" />\n</Card>;\n\n<ResultStateDefaultsProvider align="start" reach="inline">\n  <App />\n</ResultStateDefaultsProvider>;\n\n<ResultStateTitle render={(props) => <h2 {...props} />}>Esta página não existe</ResultStateTitle>;',
    }),
  },
  {
    id: 'accessibility',
    title: 'The landmark, the region and the keyboard',
    note: 'Tab past the region and then send the keyboard into it: the box is a landmark a reader can jump to, the text is the only thing that announces, and nothing moves focus unless the application asks.',
    snippet: defineSnippet({
      id: 'result-state-react-accessibility',
      language: 'tsx',
      label: 'What each of these produces in the tree',
      source:
        '// A region landmark named "Nada corresponde ao filtro", holding a polite\n// status region. The button is outside it.\n<ResultState live="polite">\n  <ResultStateContent>\n    <ResultStateTitle>Nada corresponde ao filtro</ResultStateTitle>\n  </ResultStateContent>\n  <ResultStateActions>\n    <Button>Limpar filtros</Button>\n  </ResultStateActions>\n</ResultState>;\n\n// The application decides when the keyboard goes there. The family never does.\nconst region = useRef<HTMLElement>(null);\nregion.current?.focus();',
    }),
  },
];

export const REACT_RESULT_STATE_DOCS = {
  resultState: {
    imports,
    anatomy,
    scenes,
    api: apiRows([
      [
        'status',
        "'empty' | 'no-results' | 'not-found' | 'error' | 'forbidden' | 'offline' | 'success'",
        'empty',
        'ResultState',
        'What the region is reporting, and which mark it draws: inbox, search-x, circle-question, circle-alert, lock, cloud-off, circle-check. It is not a tone — empty, no-results and not-found share one, and forbidden and offline share another',
      ],
      [
        'reach',
        "'inline' | 'section' | 'page'",
        'section',
        'ResultState',
        'The scope the message applies to. inline is a row for a table cell and draws no illustration box; page takes the top step of the type scale and a mark half again the largest control',
      ],
      [
        'align',
        "'center' | 'start'",
        'center',
        'ResultState',
        'Whether the region reads centred or from the inline edge. start is for a data-dense screen, where a centred column reads as an interruption',
      ],
      [
        'live',
        "'off' | 'polite' | 'assertive'",
        'polite',
        'ResultState',
        'Whether the text announces itself. polite writes role="status" on the content part and assertive writes role="alert"; both imply aria-live and aria-atomic, and neither is written on the box',
      ],
      [
        'media',
        'ReactNode',
        '—',
        'ResultState',
        'Artwork the page supplies instead of the status’s mark, projected into the box the family draws so it keeps the height the reach gives it. Angular projects an element carrying slResultStateMedia instead',
      ],
    ]),
    composition: apiRows([
      [
        'render',
        '(props) => ReactNode',
        '—',
        'every part',
        'Substitutes the rendered element of ResultState, ResultStateContent, ResultStateTitle, ResultStateDescription, ResultStateActions or ResultStateFooter, and hands it every data attribute. A title rendered as a heading is how a page puts the region in its outline',
      ],
      [
        'ref',
        'Ref<HTMLElement>',
        '—',
        'ResultState',
        'Reaches the section, which carries tabindex="-1" so focus() works. It is the whole imperative surface: the family never moves focus by itself, because moving it unprompted is a change of context nobody asked for',
      ],
      [
        'id',
        'string',
        '—',
        'ResultStateTitle',
        'An identifier the page writes is kept, and the root points aria-labelledby at that one rather than at the family’s own',
      ],
      [
        'ResultStateDefaultsProvider',
        '{ status, reach, align, live }',
        '—',
        'a subtree',
        'Sets all four once for every region under it; an explicit prop on one region still wins',
      ],
      [
        'children',
        'ReactNode',
        '—',
        'ResultStateContent',
        'The title and the description. Anything else placed here joins the live region, which is why the actions and the footer are parts of their own',
      ],
      [
        'Container, Card',
        'composition',
        '—',
        'around ResultState',
        'The measure belongs to container and the frame to card. This family caps no width and draws no box, because two families answering one question is two answers',
      ],
    ]),
    accessibility: [
      'There is no APG pattern for this family: the Authoring Practices list holds no empty, error or result state, and the nearest official guidance is the Region landmark practice, which states that “a region landmark must have a label”. The root is a section and the attribute is written only once a title exists, so an unlabelled region is a plain grouping element rather than a landmark with no name.',
      'The box is a landmark, not a live region. MDN’s alert role reference states that the role “should only be used for text content, not interactive elements such as links or buttons”, and this family has a row of buttons in it. The region that announces is the content part, which holds the title and the description alone; the mark, the actions and the footer are its siblings.',
      'live defaults to polite, which is the one place this family and alert disagree. WCAG 2.2’s Understanding document for SC 4.1.3 names this family’s own text as its example: “brief text messages displayed about the completion or status of the search, such as ‘Searching…’, ‘18 results returned’ or ‘No results returned’ would be status updates”. An alert may be a standing notice that was on the page before it loaded; a result is always the outcome of an operation. None of the seven surveyed implementations writes a live role of any kind.',
      'Every status carries a mark as well as a colour. Under forced colours the seven grounds become one system colour, so the tray, the struck magnifier, the question, the crossed circle, the lock, the struck cloud and the tick are the only thing distinguishing a permission problem from a failed request — WCAG 2.2 1.4.1.',
      'The mark is hidden from assistive technology, and so is the artwork that replaces it. The title and the description already say what the picture says; an illustration that adds information is not decorative, and what it adds belongs in the description.',
      'The root carries tabindex="-1" and is not in the tab sequence. An application that has just emptied a table can send the reader to the message through the ref; the family never does it, because moving focus unprompted is a change of context nobody asked for.',
      'The family holds no mutable value, so it emits nothing and has no event table. Which status a region is in is a fact about the consumer’s own data — a region that decided it would be deciding whether the fetch failed.',
      'The family animates nothing. There is no state change here for an eye to follow, and a focus indicator that fades in is a focus indicator that is not there yet.',
    ],
    snippets: [
      defineSnippet({
        id: 'result-state-react-anatomy',
        language: 'tsx',
        label: 'Anatomy, as it reaches the DOM',
        source:
          '<section\n  aria-labelledby="r1title"\n  data-ui="result-state"\n  data-part="root"\n  data-status="empty"\n  data-reach="section"\n  data-align="center"\n  data-live="polite"\n  tabIndex={-1}\n>\n  <div aria-hidden="true" data-part="media" />\n  <div data-part="content" role="status">\n    <div data-part="title" id="r1title">\n      Nenhum projeto ainda\n    </div>\n    <p data-part="description">Crie um projeto para começar.</p>\n  </div>\n  <div data-part="actions">…</div>\n  <div data-part="footer">…</div>\n</section>;',
      }),
      defineSnippet({
        id: 'result-state-theming',
        language: 'css',
        label: 'Retuning the family for an application',
        source:
          "[data-ui='result-state'] {\n  --slotted-result-state-padding-block: var(--slotted-space-8);\n  --slotted-result-state-row-gap: var(--slotted-space-7);\n  --slotted-result-state-media-size: 48px;\n  --slotted-result-state-media: url('/illustrations/empty.svg');\n}",
      }),
    ],
  },
} as const;
