import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';

import {
  SlBreadcrumb,
  SlBreadcrumbItem,
  SlBreadcrumbLink,
  SlBreadcrumbList,
  SlBreadcrumbPage,
} from './breadcrumb';
import { provideBreadcrumbDefaults } from './breadcrumb.constants';
import { ANGULAR_BREADCRUMB_DOCS, ANGULAR_BREADCRUMB_TOKENS } from './breadcrumb.docs';

interface BreadcrumbStoryArgs {
  itemsAfterCollapse: number;
  itemsBeforeCollapse: number;
  label: string;
  maxItems: number;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_BREADCRUMB_DOCS.breadcrumb.scenes, {
    playground: Playground,
    collapse: Collapse,
    separator: Separator,
    current: Current,
    context: Context,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const parts = [
  SlBreadcrumb,
  SlBreadcrumbItem,
  SlBreadcrumbLink,
  SlBreadcrumbList,
  SlBreadcrumbPage,
];

const meta: Meta<BreadcrumbStoryArgs> = {
  title: 'Components/Breadcrumb',
  component: SlBreadcrumb,
  decorators: [moduleMetadata({ imports: parts })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Breadcrumb',
        description:
          'Where a page sits in the hierarchy, folded when the trail gets deep and expanded in place.',
        framework: 'Angular',
        ...ANGULAR_BREADCRUMB_DOCS.breadcrumb,
        tokens: ANGULAR_BREADCRUMB_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<BreadcrumbStoryArgs>;

/**
 * One demonstration: what it is called, what to look at, and the stage that
 * owns the distance between the examples on it. Every story below composes
 * this rather than laying itself out, so no two examples can end up against
 * each other and no story reaches for an inline style.
 */
const scene = (
  label: string,
  note: string,
  body: string,
  layout: 'row' | 'stack' | 'prose' = 'stack',
) => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-align="start" data-layout="${layout}">${body}</div>
  </section>`;

/** The five ancestors above the invoice, written out so the markup reads. */
const DEEP = `
  <li slBreadcrumbItem><a slBreadcrumbLink href="#workspace">Workspace</a></li>
  <li slBreadcrumbItem><a slBreadcrumbLink href="#org">Northwind Trading</a></li>
  <li slBreadcrumbItem><a slBreadcrumbLink href="#accounts">Accounts</a></li>
  <li slBreadcrumbItem><a slBreadcrumbLink href="#billing">Billing</a></li>
  <li slBreadcrumbItem><a slBreadcrumbLink href="#invoices">Invoices</a></li>
  <li slBreadcrumbItem><span slBreadcrumbPage>INV-2026-08-0041</span></li>`;

const SHORT = `
  <li slBreadcrumbItem><a slBreadcrumbLink href="#workspace">Workspace</a></li>
  <li slBreadcrumbItem><a slBreadcrumbLink href="#billing">Billing</a></li>
  <li slBreadcrumbItem><span slBreadcrumbPage>Invoices</span></li>`;

export const Playground: Story = {
  args: {
    itemsAfterCollapse: 2,
    itemsBeforeCollapse: 1,
    label: 'Breadcrumb',
    maxItems: 8,
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `
<div class="slotted-demo-stage" data-layout="stack">
  <nav
    slBreadcrumb
    [label]="label"
    [maxItems]="maxItems"
    [itemsBeforeCollapse]="itemsBeforeCollapse"
    [itemsAfterCollapse]="itemsAfterCollapse"
  >
    <ol slBreadcrumbList>${DEEP}</ol>
  </nav>
</div>`,
  }),
};

export const Collapse: Story = {
  parameters: scenario('collapse'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    '[maxItems]="4"',
    'Six levels folded to four items. The button says how many it hides, and pressing it reveals them without leaving the page.',
    `<nav slBreadcrumb [maxItems]="4"><ol slBreadcrumbList>${DEEP}</ol></nav>`,
  )}
  ${scene(
    'defaultExpanded',
    'The same trail already open. An application that remembers the reader’s choice holds expanded itself and passes it back.',
    `<nav slBreadcrumb defaultExpanded [maxItems]="4"><ol slBreadcrumbList>${DEEP}</ol></nav>`,
  )}
</div>`,
  }),
};

export const Separator: Story = {
  parameters: scenario('separator'),
  render: () => ({
    template: `
<ng-template #mark>›</ng-template>
<div class="slotted-demo-grid" data-columns="2">
  ${scene(
    'drawn',
    'No separator input: the stylesheet draws a one-pixel rule rotated into a slash, which mirrors in a right-to-left document.',
    `<nav slBreadcrumb><ol slBreadcrumbList>${SHORT}</ol></nav>`,
  )}
  ${scene(
    '[separator]="mark"',
    'Your own TemplateRef, rendered into the same element. The drawing stops the moment the separator holds anything at all.',
    `<nav slBreadcrumb [separator]="mark"><ol slBreadcrumbList>${SHORT}</ol></nav>`,
  )}
</div>`,
  }),
};

export const Current: Story = {
  parameters: scenario('current'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'slBreadcrumbPage',
    'The last crumb takes the strongest text colour and a heavier weight, so the end of the trail reads without being read.',
    `<nav slBreadcrumb><ol slBreadcrumbList>${SHORT}</ol></nav>`,
  )}
</div>`,
  }),
};

export const Context: Story = {
  parameters: scenario('context'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'Above a page heading',
    'Where a trail actually lives. It sits at interface type size over a title, and it says where the page is rather than where the reader came from.',
    `<div>
       <nav slBreadcrumb><ol slBreadcrumbList>${SHORT}</ol></nav>
       <h2>INV-2026-08-0041</h2>
     </div>`,
    'prose',
  )}
</div>`,
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'Long, translated and unbroken',
    'A German compound, a pasted identifier and an Arabic label. The row wraps before anything truncates, and the string survives whatever is cut.',
    `<div class="slotted-demo-measure">
       <nav slBreadcrumb>
         <ol slBreadcrumbList>
           <li slBreadcrumbItem>
             <a slBreadcrumbLink href="#settings">Zahlungsabwicklungseinstellungen</a>
           </li>
           <li slBreadcrumbItem>
             <a slBreadcrumbLink href="#report">INV-2026-08-0041-RECONCILIATION-REPORT</a>
           </li>
           <li slBreadcrumbItem><span slBreadcrumbPage>تسوية</span></li>
         </ol>
       </nav>
     </div>`,
  )}
  ${scene(
    'One crumb',
    'A trail whose only crumb is the page itself draws no separator, and the landmark keeps its name.',
    `<nav slBreadcrumb>
       <ol slBreadcrumbList>
         <li slBreadcrumbItem><span slBreadcrumbPage>Dashboard</span></li>
       </ol>
     </nav>`,
  )}
</div>`,
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  decorators: [
    applicationConfig({
      providers: [provideBreadcrumbDefaults({ label: 'Trilha', maxItems: 4 })],
    }),
  ],
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="2">
  ${scene(
    'provideBreadcrumbDefaults',
    'This page provides a Portuguese landmark name and a fold at four for every trail on it. The first inherits both; the second states its own and wins.',
    `<nav slBreadcrumb><ol slBreadcrumbList>${DEEP}</ol></nav>
     <nav slBreadcrumb label="Breadcrumb" [maxItems]="0"><ol slBreadcrumbList>${SHORT}</ol></nav>`,
  )}
  ${scene(
    'The consumer’s own anchor',
    'The link directive claims no destination, so href, routerLink and every native attribute stay on the element the consumer wrote them on.',
    `<nav slBreadcrumb>
       <ol slBreadcrumbList>
         <li slBreadcrumbItem>
           <a slBreadcrumbLink href="#invoices" hreflang="pt-BR" rel="prev">Invoices</a>
         </li>
         <li slBreadcrumbItem><span slBreadcrumbPage>INV-2026-08-0041</span></li>
       </ol>
     </nav>`,
  )}
</div>`,
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    template: `
<div class="slotted-demo-grid" data-columns="1">
  ${scene(
    'Tab, Enter, Space',
    'Tab reaches every crumb and the ellipsis. Enter follows a crumb; Enter or Space on the ellipsis expands the trail and moves focus to the first crumb it revealed.',
    `<nav slBreadcrumb [maxItems]="4"><ol slBreadcrumbList>${DEEP}</ol></nav>`,
  )}
</div>`,
  }),
};
