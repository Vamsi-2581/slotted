import { createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlText } from '../../typography/src/text';
import { SlTag } from './tag';
import type { TagShape, TagSize, TagTone, TagVariant } from './tag';
import { SlTagBody } from './tag-body';
import { scene, SlTagOverflowDemo } from './tag-demo';
import { SlTagGroup } from './tag-group';
import { SlTagRemove } from './tag-remove';
import { ANGULAR_TAG_DOCS, ANGULAR_TAG_TOKENS } from './tag.docs';

interface TagButtonStoryArgs {
  content: string;
  shape: TagShape;
  size: TagSize;
  tone: TagTone;
  variant: TagVariant;
}

const IMPORTS = [SlTag, SlTagBody, SlTagGroup, SlTagOverflowDemo, SlTagRemove, SlText];

const referenceStories: ReferencePageConfig['stories'] = () => ({
  essential: Playground as never,
});

const meta: Meta<TagButtonStoryArgs> = {
  title: 'Components/Tag/TagButton',
  decorators: [moduleMetadata({ imports: IMPORTS })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'TagButton',
        description:
          'A chip that runs a command: slTagBody on the consumer’s own button. It is the chip’s body rather than the chip itself, so a chip that both acts and removes stays legal HTML.',
        framework: 'Angular',
        ...ANGULAR_TAG_DOCS.tagButton,
        tokens: ANGULAR_TAG_TOKENS,
        stories: referenceStories,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<TagButtonStoryArgs>;

export const Playground: Story = {
  args: {
    content: 'Atribuir responsável',
    shape: 'pill',
    size: 'md',
    tone: 'accent',
    variant: 'soft',
  },
  argTypes: {
    shape: { control: 'inline-radio', options: ['pill', 'square'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: {
      control: 'inline-radio',
      options: ['accent', 'secondary', 'info', 'success', 'warning', 'danger'],
    },
    variant: { control: 'inline-radio', options: ['solid', 'soft', 'outline'] },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `<div class="slotted-demo-measure"><div class="slotted-demo-row">
      <span slTag [tone]="tone" [variant]="variant" [size]="size" [shape]="shape">
        <button slTagBody>{{ content }}</button>
      </span>
    </div></div>`,
  }),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => ({
    template: `<div class="slotted-demo-grid" data-columns="1">
      ${scene(
        'states',
        'Hover, press and focus answer on the control the pointer or the keyboard is on, never on the whole chip: the chip can hold two of them.',
        `<div slTagGroup aria-label="Estados">
          <span slTag><button slTagBody>Padrão</button></span>
          <span slTag tone="accent"><button slTagBody>Acento</button></span>
          <span slTag variant="solid"><button slTagBody>Preenchido</button></span>
          <span slTag variant="outline"><button slTagBody>Contornado</button></span>
          <span slTag disabled><button slTagBody>Indisponível</button></span>
          <span slTag removable>
            <button slTagBody>Comando e remoção</button>
            <button slTagRemove></button>
          </span>
        </div>`,
      )}
      ${scene(
        'overflow',
        'The “+N” control three surveyed groups build in. Here it is a button body the consumer places, because the surface it would reveal belongs to popover.',
        `<div class="slotted-demo-stack">
          <sl-tag-overflow-demo></sl-tag-overflow-demo>
          <span slText tone="muted">A contagem é do consumidor: ele fatia a própria lista e põe um chip no fim.</span>
        </div>`,
      )}
    </div>`,
  }),
};
