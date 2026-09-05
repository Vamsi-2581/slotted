import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Breadcrumb } from './breadcrumb';
import { BreadcrumbDefaultsProvider } from './breadcrumb-defaults';
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from './breadcrumb-parts';
import { REACT_BREADCRUMB_DOCS, REACT_BREADCRUMB_TOKENS } from './breadcrumb.docs';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_BREADCRUMB_DOCS.breadcrumb.scenes, {
    playground: Playground,
    collapse: Collapse,
    separator: Separator,
    current: Current,
    context: Context,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Breadcrumb',
        description:
          'Where a page sits in the hierarchy, folded when the trail gets deep and expanded in place.',
        framework: 'React',
        ...REACT_BREADCRUMB_DOCS.breadcrumb,
        tokens: REACT_BREADCRUMB_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEEP = ['Workspace', 'Northwind Trading', 'Accounts', 'Billing', 'Invoices'];

function Scene({
  children,
  label,
  layout = 'stack',
  note,
}: {
  children: React.ReactNode;
  label: string;
  layout?: 'row' | 'stack' | 'block' | 'prose';
  note: string;
}) {
  return (
    <section className="slotted-demo-scene">
      <header className="slotted-demo-scene__header">
        <span className="slotted-demo-scene__label">{label}</span>
        <span className="slotted-demo-scene__note">{note}</span>
      </header>
      <div className="slotted-demo-stage" data-align="start" data-layout={layout}>
        {children}
      </div>
    </section>
  );
}

function Trail({
  levels = DEEP,
  ...props
}: React.ComponentProps<typeof Breadcrumb> & { levels?: string[] }) {
  return (
    <Breadcrumb {...props}>
      <BreadcrumbList>
        {levels.map((level) => (
          <BreadcrumbItem key={level}>
            <BreadcrumbLink href={`#${level}`}>{level}</BreadcrumbLink>
          </BreadcrumbItem>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>INV-2026-08-0041</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export const Playground: Story = {
  args: {
    itemsAfterCollapse: 2,
    itemsBeforeCollapse: 1,
    label: 'Breadcrumb',
    maxItems: 8,
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="stack">
      <Trail {...args} />
    </div>
  ),
};

export const Collapse: Story = {
  parameters: scenario('collapse'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="maxItems={4}"
        note="Seven levels folded to four items. The button says how many it hides, and pressing it reveals them without leaving the page."
      >
        <Trail maxItems={4} />
      </Scene>
      <Scene
        label="defaultExpanded"
        note="The same trail already open. An application that remembers the reader's choice holds expanded itself and passes it back."
      >
        <Trail defaultExpanded maxItems={4} />
      </Scene>
    </div>
  ),
};

export const Separator: Story = {
  parameters: scenario('separator'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="2">
      <Scene
        label="drawn"
        note="No separator prop: the stylesheet draws a one-pixel rule rotated into a slash, which mirrors in a right-to-left document."
      >
        <Trail levels={['Workspace', 'Billing']} />
      </Scene>
      <Scene
        label='separator="›"'
        note="Your own mark, in the same element. The drawing stops the moment the separator holds anything at all."
      >
        <Trail levels={['Workspace', 'Billing']} separator="›" />
      </Scene>
    </div>
  ),
};

export const Current: Story = {
  parameters: scenario('current'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="BreadcrumbPage"
        note="The last crumb takes the strongest text colour and a heavier weight, so the end of the trail reads without being read."
      >
        <Trail levels={['Workspace', 'Billing', 'Invoices']} />
      </Scene>
    </div>
  ),
};

export const Context: Story = {
  parameters: scenario('context'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="Above a page heading"
        layout="prose"
        note="Where a trail actually lives. It sits at interface type size over a title, and it says where the page is rather than where the reader came from."
      >
        <div>
          <Trail levels={['Workspace', 'Billing', 'Invoices']} />
          <h2>INV-2026-08-0041</h2>
        </div>
      </Scene>
    </div>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="Long, translated and unbroken"
        note="A German compound, a pasted identifier and an Arabic label. The row wraps before anything truncates, and the string survives whatever is cut."
      >
        <div className="slotted-demo-measure">
          <Trail
            levels={[
              'Zahlungsabwicklungseinstellungen',
              'INV-2026-08-0041-RECONCILIATION-REPORT',
              'تسوية',
            ]}
          />
        </div>
      </Scene>
      <Scene
        label="One crumb"
        note="A trail whose only crumb is the page itself draws no separator, and the landmark keeps its name."
      >
        <Trail levels={[]} />
      </Scene>
    </div>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="2">
      <Scene
        label="render"
        note="Every part substitutes its element. Here the crumb keeps its destination and its data attributes while another component renders it."
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#invoices" render={(props) => <a {...props} data-router="" />}>
                Invoices
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>INV-2026-08-0041</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Scene>
      <Scene
        label="BreadcrumbDefaultsProvider"
        note="One decision for every trail below it: the landmark name, the separator and how deep a trail may get before it folds."
      >
        <BreadcrumbDefaultsProvider label="Trilha" maxItems={4} separator="·">
          <Trail />
        </BreadcrumbDefaultsProvider>
      </Scene>
    </div>
  ),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <div className="slotted-demo-grid" data-columns="1">
      <Scene
        label="Tab, Enter, Space"
        note="Tab reaches every crumb and the ellipsis. Enter follows a crumb; Enter or Space on the ellipsis expands the trail and moves focus to the first crumb it revealed."
      >
        <Trail maxItems={4} />
      </Scene>
    </div>
  ),
};
