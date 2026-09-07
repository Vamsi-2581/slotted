import { SlField, SlFieldError, SlFieldLabel } from '@slotted/angular/field';
import { bindScenes, createReferencePage, isolated, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlSelect } from './select';
import type {
  SelectAlign,
  SelectSide,
  SelectSize,
  SelectVariant,
  SelectWidth,
} from './select-defaults';
import { SlSelectGroup, SlSelectItem, SlSelectSeparator } from './select-items';
import { SlSelectValue } from './select-value';
import { ANGULAR_SELECT_DOCS, ANGULAR_SELECT_TOKENS } from './select.docs';

interface SelectStoryArgs {
  align: SelectAlign;
  clearable: boolean;
  disabled: boolean;
  loop: boolean;
  multiple: boolean;
  side: SelectSide;
  size: SelectSize;
  typeahead: boolean;
  variant: SelectVariant;
  width: SelectWidth;
}

/**
 * Every demonstration opens `[portal]="false"` inside the workbench's own
 * viewport box, so a popup opened in one scene cannot draw over the scene above
 * it.
 */
const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_SELECT_DOCS.select.scenes, {
    clearable: Clearable,
    composition: Composition,
    form: InAForm,
    groups: Groups,
    keyboard: Keyboard,
    'loading-and-empty': LoadingAndEmpty,
    'long-content': LongContent,
    multiple: Multiple,
    placeholder: Placeholder,
    placement: Placement,
    playground: Playground,
    selection: Selection,
    sizes: Sizes,
    states: States,
    variants: Variants,
  }) as never;

const FRUIT = `
  <sl-select-item value="apple">Apple</sl-select-item>
  <sl-select-item value="blueberry">Blueberry</sl-select-item>
  <sl-select-item value="cherry">Cherry</sl-select-item>
  <sl-select-item value="grapefruit">Grapefruit</sl-select-item>
  <sl-select-item value="pomelo">Pomelo</sl-select-item>
`;

const scene = (label: string, note: string, body: string) => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="block">${body}</div>
  </section>
`;

const viewport = (body: string, size = 'layer') =>
  `<div class="slotted-demo-viewport" data-place="top" data-size="${size}">${body}</div>`;

const meta: Meta<SelectStoryArgs> = {
  title: 'Components/Select',
  decorators: [
    moduleMetadata({
      imports: [
        SlField,
        SlFieldError,
        SlFieldLabel,
        SlSelect,
        SlSelectGroup,
        SlSelectItem,
        SlSelectSeparator,
        SlSelectValue,
      ],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Select',
        description:
          'A control that shows the current choice and opens a listbox of the rest. It takes no typed text; a set that is large, remote or searched is Combobox.',
        framework: 'Angular',
        ...ANGULAR_SELECT_DOCS.select,
        tokens: ANGULAR_SELECT_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<SelectStoryArgs>;

export const Playground: Story = {
  args: {
    align: 'start',
    clearable: false,
    disabled: false,
    loop: false,
    multiple: false,
    side: 'bottom',
    size: 'md',
    typeahead: true,
    variant: 'outline',
    width: 'anchor',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args, context) => ({
    props: { ...args, pictured: isolated(context) },
    template: viewport(`
      <sl-select
        aria-label="Fruit"
        placeholder="Choose a fruit"
        [open]="pictured"
        [portal]="false"
        [align]="align"
        [clearable]="clearable"
        [disabled]="disabled"
        [loop]="loop"
        [multiple]="multiple"
        [side]="side"
        [size]="size"
        [typeahead]="typeahead"
        [variant]="variant"
        [width]="width"
      >${FRUIT}</sl-select>
    `),
  }),
};

export const Selection: Story = {
  parameters: scenario('selection'),
  render: () => ({
    props: { fruit: 'cherry' },
    template: `
      <div class="slotted-demo-grid" data-columns="2">
        ${scene(
          'Two-way',
          'The model moves the value in both directions, and the page below reads it back.',
          `<sl-select aria-label="Fruit" placeholder="Choose a fruit" [(value)]="fruit">${FRUIT}</sl-select>`,
        )}
        ${scene(
          'The request, before it moves',
          'valueChangeRequest arrives first and carries the reason, so a page can tell a press from a key — or refuse it.',
          `<sl-select aria-label="Fruit" placeholder="Choose a fruit" [value]="'blueberry'">${FRUIT}</sl-select>`,
        )}
      </div>
    `,
  }),
};

export const Placeholder: Story = {
  parameters: scenario('placeholder'),
  render: () => ({
    template: `
      <div class="slotted-demo-grid" data-columns="2">
        ${scene(
          'Nothing chosen',
          'The placeholder, in the muted step, and exactly the same height as a filled control.',
          `<sl-select aria-label="Fruit" placeholder="Choose a fruit">${FRUIT}</sl-select>`,
        )}
        ${scene(
          'A value it cannot name',
          'No option matches usr_8f21c0, so the control shows the value rather than looking empty.',
          `<sl-select aria-label="Fruit" placeholder="Choose a fruit" [value]="'usr_8f21c0'">${FRUIT}</sl-select>`,
        )}
      </div>
    `,
  }),
};

export const Groups: Story = {
  parameters: scenario('groups'),
  render: (_args, context) => ({
    props: { pictured: isolated(context) },
    template: viewport(
      `
      <sl-select aria-label="Produce" placeholder="Choose produce" width="content" [open]="pictured" [portal]="false" [value]="'raspberry'">
        <sl-select-group label="Berries">
          <sl-select-item value="blueberry">Blueberry</sl-select-item>
          <sl-select-item value="raspberry" description="In season until September">Raspberry</sl-select-item>
        </sl-select-group>
        <sl-select-separator />
        <sl-select-group label="Citrus">
          <sl-select-item value="grapefruit">Grapefruit</sl-select-item>
          <sl-select-item value="pomelo" description="Out of stock" [disabled]="true">Pomelo</sl-select-item>
        </sl-select-group>
      </sl-select>
    `,
      'tall',
    ),
  }),
};

export const Multiple: Story = {
  parameters: scenario('multiple'),
  render: (_args, context) => ({
    props: { pictured: isolated(context), fruit: ['apple', 'cherry'] },
    template: viewport(
      `
      <sl-select aria-label="Fruit" placeholder="Choose fruit" clearable multiple [open]="pictured" [portal]="false" [(value)]="fruit">
        <ng-template slSelectValue let-values>{{ values.length }} chosen</ng-template>
        ${FRUIT}
      </sl-select>
    `,
      'tall',
    ),
  }),
};

export const Clearable: Story = {
  parameters: scenario('clearable'),
  render: () => ({
    template: `
      <div class="slotted-demo-grid" data-columns="2">
        ${scene(
          'Nothing to clear',
          'The button is absent until there is something to take back from the control.',
          `<sl-select aria-label="Fruit" placeholder="Choose a fruit" clearable>${FRUIT}</sl-select>`,
        )}
        ${scene(
          'Something chosen',
          'The button appears, and focus goes back to the control rather than to the document.',
          `<sl-select aria-label="Fruit" clearable [value]="'cherry'">${FRUIT}</sl-select>`,
        )}
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => ({
    template: `
      <div class="slotted-demo-stack">
        <sl-select aria-label="Small" size="sm" [value]="'apple'">${FRUIT}</sl-select>
        <sl-select aria-label="Medium" size="md" [value]="'apple'">${FRUIT}</sl-select>
        <sl-select aria-label="Large" size="lg" [value]="'apple'">${FRUIT}</sl-select>
      </div>
    `,
  }),
};

export const Variants: Story = {
  parameters: scenario('variants'),
  render: () => ({
    template: `
      <div class="slotted-demo-stack">
        <sl-select aria-label="Outline" variant="outline" [value]="'apple'">${FRUIT}</sl-select>
        <sl-select aria-label="Subtle" variant="subtle" [value]="'apple'">${FRUIT}</sl-select>
        <sl-select aria-label="Plain" variant="plain" [value]="'apple'">${FRUIT}</sl-select>
      </div>
    `,
  }),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => ({
    template: `
      <div class="slotted-demo-stack">
        <sl-select aria-label="Required" placeholder="Required" [required]="true">${FRUIT}</sl-select>
        <sl-select aria-label="Invalid" [invalid]="true" [value]="'apple'">${FRUIT}</sl-select>
        <sl-select aria-label="Read only" [readOnly]="true" [value]="'apple'">${FRUIT}</sl-select>
        <sl-select aria-label="Disabled" [disabled]="true" [value]="'apple'">${FRUIT}</sl-select>
      </div>
    `,
  }),
};

export const LoadingAndEmpty: Story = {
  parameters: scenario('loading-and-empty'),
  render: (_args, context) => ({
    props: { pictured: isolated(context) },
    template: `
      <div class="slotted-demo-grid" data-columns="2">
        ${scene(
          'Loading',
          "The row keeps the popup's measure, so nothing jumps when the options finally land in it.",
          viewport(
            `<sl-select aria-label="Teams" placeholder="Choose a team" loadingLabel="Fetching teams…" [loading]="true" [open]="pictured" [portal]="false"></sl-select>`,
          ),
        )}
        ${scene(
          'Empty',
          'The popup opens onto a sentence rather than onto a two-pixel box the reader cannot read.',
          viewport(
            `<sl-select aria-label="Teams" placeholder="Choose a team" emptyLabel="No teams yet" [open]="pictured" [portal]="false"></sl-select>`,
          ),
        )}
      </div>
    `,
  }),
};

export const LongContent: Story = {
  parameters: scenario('long-content'),
  render: (_args, context) => ({
    props: { pictured: isolated(context) },
    template: viewport(
      `
      <sl-select aria-label="Record" placeholder="Choose a record" clearable [open]="pictured" [portal]="false" [value]="'urn'">
        <sl-select-item value="urn">urn:acme:catalogue:9f2c41ab8de07c5511903fbe</sl-select-item>
        <sl-select-item value="fi" description="An option long enough to need a second line, and it stops there">
          Rekisteröintitunnus, pitkä ja käännetty, ja vielä pidempi kuin ensimmäinen
        </sl-select-item>
        ${FRUIT}
      </sl-select>
    `,
      'tall',
    ),
  }),
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: (_args, context) => ({
    props: { pictured: isolated(context) },
    template: `
      <div class="slotted-demo-grid" data-columns="2">
        ${scene(
          'As wide as the control',
          'The default: the value in the control and the labels in the list share one edge.',
          viewport(
            `<sl-select aria-label="Fruit" width="anchor" [open]="pictured" [portal]="false" [value]="'apple'">${FRUIT}</sl-select>`,
          ),
        )}
        ${scene(
          'As wide as its options',
          'width="content", for a list with descriptions that the field it fills is too narrow for.',
          viewport(
            `<sl-select aria-label="Fruit" align="end" width="content" [open]="pictured" [portal]="false">
              <sl-select-item value="blueberry" description="Picked this morning, sold by the punnet">Blueberry</sl-select-item>
              <sl-select-item value="cherry" description="Sold by weight">Cherry</sl-select-item>
            </sl-select>`,
          ),
        )}
      </div>
    `,
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: (_args, context) => ({
    props: { pictured: isolated(context) },
    template: viewport(
      `<sl-select aria-label="Fruit" [open]="pictured" [portal]="false" [value]="'cherry'">${FRUIT}</sl-select>`,
      'tall',
    ),
  }),
};

export const InAForm: Story = {
  parameters: scenario('form'),
  render: () => ({
    template: `
      <div class="slotted-demo-stack">
        <sl-field [required]="true">
          <label slFieldLabel>Fruit</label>
          <sl-select aria-label="Fruit" name="fruit" placeholder="Choose a fruit">${FRUIT}</sl-select>
        </sl-field>
        <sl-field [required]="true" [invalid]="true">
          <label slFieldLabel>Delivery day</label>
          <sl-select aria-label="Delivery day" name="day" placeholder="Choose a day">${FRUIT}</sl-select>
          <span slFieldError>Choose a day.</span>
        </sl-field>
      </div>
    `,
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    props: { fruit: ['apple', 'cherry', 'pomelo'] },
    template: `
      <div class="slotted-demo-stack">
        <sl-select aria-label="Fruit" size="sm" variant="subtle" clearable multiple [(value)]="fruit">
          <ng-template slSelectValue let-values>{{ values.length }} of 5 chosen</ng-template>
          ${FRUIT}
        </sl-select>
        <sl-select aria-label="Fruit" size="sm" variant="subtle" [value]="'apple'">${FRUIT}</sl-select>
      </div>
    `,
  }),
};
