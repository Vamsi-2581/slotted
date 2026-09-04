import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import { SlButton } from '@slotted/angular/button';
import { SlCheckbox } from '@slotted/angular/checkbox';
import { SlTab, SlTabActions, SlTabList, SlTabPanel, SlTabs } from '@slotted/angular/tabs';
import { SlTextField, SlTextFieldControl } from '@slotted/angular/text-field';
import { SlText } from '@slotted/angular/typography';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlMenuItem } from '@slotted/angular/menu';

import {
  SlToolbar,
  SlToolbarGroup,
  SlToolbarItem,
  SlToolbarSeparator,
  SlToolbarSpacer,
} from './toolbar';
import { SlToolbarOverflow } from './toolbar-overflow';
import type {
  ToolbarOrientation,
  ToolbarOverflowMode,
  ToolbarSize,
  ToolbarVariant,
} from './toolbar-defaults';
import { ANGULAR_TOOLBAR_DOCS, ANGULAR_TOOLBAR_TOKENS } from './toolbar.docs';

interface ToolbarStoryArgs {
  loop: boolean;
  orientation: ToolbarOrientation;
  overflow: ToolbarOverflowMode;
  size: ToolbarSize;
  variant: ToolbarVariant;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_TOOLBAR_DOCS.toolbar.scenes, {
    playground: Playground,
    orientation: Orientation,
    variant: Variant,
    sizes: Sizes,
    groups: Groups,
    keyboard: Keyboard,
    keyOwners: KeyOwners,
    disabled: Disabled,
    overflow: Overflow,
    overflowMenu: OverflowMenu,
    composition: Composition,
  }) as never;

const meta: Meta<ToolbarStoryArgs> = {
  title: 'Components/Toolbar',
  decorators: [
    moduleMetadata({
      imports: [
        SlToolbar,
        SlToolbarGroup,
        SlToolbarItem,
        SlToolbarOverflow,
        SlToolbarSeparator,
        SlToolbarSpacer,
        SlMenuItem,
        SlButton,
        SlCheckbox,
        SlTextField,
        SlTextFieldControl,
        SlTabs,
        SlTabList,
        SlTab,
        SlTabPanel,
        SlTabActions,
        SlText,
      ],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Toolbar',
        description:
          'A set of controls that share one tab stop. The APG’s arrow model over the consumer’s own controls, groups and rules that say what belongs together, and an item that may keep the arrows it needs to operate.',
        framework: 'Angular',
        ...ANGULAR_TOOLBAR_DOCS.toolbar,
        tokens: ANGULAR_TOOLBAR_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<ToolbarStoryArgs>;

const FORMATTING = `<button slButton size="sm" variant="ghost">Negrito</button>
  <button slButton size="sm" variant="ghost">Itálico</button>
  <div slToolbarSeparator></div>
  <button slButton size="sm" variant="ghost">Link</button>
  <button slButton size="sm" variant="ghost" disabled focusableWhenDisabled>Código</button>`;

const scene = (label: string, note: string, body: string) =>
  `<section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="block">${body}</div>
  </section>`;

const grid = (columns: 1 | 2 | 3, scenes: string) =>
  `<div class="slotted-demo-grid" data-columns="${columns}">${scenes}</div>`;

export const Playground: Story = {
  args: {
    loop: true,
    orientation: 'horizontal',
    overflow: 'wrap',
    size: 'md',
    variant: 'plain',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `<div class="slotted-demo-stage" data-layout="block">
      <div
        slToolbar
        aria-label="Formatação"
        [orientation]="orientation"
        [size]="size"
        [variant]="variant"
        [overflow]="overflow"
        [loop]="loop"
      >
        <button slButton variant="ghost">Negrito</button>
        <button slButton variant="ghost">Itálico</button>
        <div slToolbarSeparator></div>
        <button slButton variant="ghost">Link</button>
      </div>
    </div>`,
  }),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A row of controls',
        'The controls share a middle rather than a height, so an icon button beside a wider one still reads as one line.',
        `<div slToolbar aria-label="Formatação" variant="outline">${FORMATTING}</div>`,
      ) +
        scene(
          'A column of them',
          'A column stretches its controls, because a column at each control’s natural width is a ragged edge rather than a bar; the rule turns with it.',
          `<div slToolbar aria-label="Ferramentas" orientation="vertical" variant="outline">
            <button slButton size="sm" variant="ghost">Lápis</button>
            <button slButton size="sm" variant="ghost">Pincel</button>
            <div slToolbarSeparator></div>
            <button slButton size="sm" variant="ghost">Borracha</button>
          </div>`,
        ),
    ),
  }),
};

export const Variant: Story = {
  parameters: scenario('variant'),
  render: () => ({
    template: grid(
      2,
      scene(
        'plain — the default',
        'No ground at all: a bar inside a card header or above a table is already standing on a surface, and a second one there reads as a box nobody asked for.',
        `<div slToolbar aria-label="Formatação">${FORMATTING}</div>`,
      ) +
        scene(
          'outline',
          'A framed bar pads itself by at least the reach of a focus ring, so a focused control never sits on the bar’s own edge — visible if you tab into it.',
          `<div slToolbar aria-label="Formatação, com moldura" variant="outline">${FORMATTING}</div>`,
        ),
    ),
  }),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => ({
    template: grid(
      3,
      scene(
        'sm',
        'The compact bar, for a card header or the row above a dense table.',
        `<div slToolbar aria-label="Compacta" size="sm" variant="outline">${FORMATTING}</div>`,
      ) +
        scene(
          'md',
          'The default inset and gap, with controls at their own middle step.',
          `<div slToolbar aria-label="Padrão" size="md" variant="outline">${FORMATTING}</div>`,
        ) +
        scene(
          'lg',
          'The bar grows and the controls do not: the size moves the inset, the gap and the rule’s inset, never another family’s control.',
          `<div slToolbar aria-label="Confortável" size="lg" variant="outline">${FORMATTING}</div>`,
        ),
    ),
  }),
};

export const Groups: Story = {
  parameters: scenario('groups'),
  render: () => ({
    template: grid(
      1,
      scene(
        'What belongs together, and what belongs apart',
        'The three aligned buttons sit half a gap apart inside their group and a gap and a half from what follows; the rule draws the same boundary, and the spacer keeps the destructive action at the far end.',
        `<div slToolbar aria-label="Seleção" variant="outline">
          <div slToolbarGroup aria-label="Alinhamento">
            <button slButton size="sm" variant="outline">Início</button>
            <button slButton size="sm" variant="outline" pressed>Centro</button>
            <button slButton size="sm" variant="outline">Fim</button>
          </div>
          <div slToolbarSeparator></div>
          <span slCheckbox size="sm"><input slCheckboxControl type="checkbox" /> Grade</span>
          <div slToolbarSpacer></div>
          <button slButton size="sm" tone="danger">Excluir</button>
        </div>`,
      ),
    ),
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    template: grid(
      2,
      scene(
        'One stop for three families',
        'Tab in once: a button, a checkbox and a link share the ring, because an item is anything focusable rather than a component the bar had to wrap.',
        `<div slToolbar aria-label="Ações mistas" variant="outline">
          <button slButton size="sm" variant="ghost">Publicar</button>
          <span slCheckbox size="sm"><input slCheckboxControl type="checkbox" /> Rascunho</span>
          <div slToolbarSeparator></div>
          <a slButton size="sm" variant="ghost" href="#ajuda">Ajuda</a>
        </div>`,
      ) +
        scene(
          'And it comes back where it left',
          'Move to the third control, tab away, tab back: entry lands on the control that last had focus, which is what the pattern asks for.',
          `<div slToolbar aria-label="Formatação, de volta" variant="outline">${FORMATTING}</div>`,
        ),
    ),
  }),
};

export const KeyOwners: Story = {
  parameters: scenario('keyOwners'),
  render: () => ({
    template: grid(
      1,
      scene(
        'The caret keeps its own keys',
        'Focus the field and press the left and right arrows: the caret moves and focus stays. Up or down leaves the field, which is the way out the cross axis exists to give.',
        `<div slToolbar aria-label="Filtro" variant="outline">
          <button slButton size="sm" variant="outline">Todos</button>
          <button slButton size="sm" variant="outline">Abertos</button>
          <div slToolbarSeparator></div>
          <div slToolbarSpacer></div>
          <span slTextField size="sm">
            <input slTextFieldControl type="search" placeholder="Buscar" aria-label="Buscar" />
          </span>
        </div>`,
      ),
    ),
  }),
};

export const Disabled: Story = {
  parameters: scenario('disabled'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A bar out of action',
        'A fieldset disables every control inside it natively, and a natively disabled control cannot be focused — so the bar loses its tab stop without the family owning a disabled axis at all.',
        `<fieldset class="slotted-demo-fieldset" disabled>
          <div slToolbar aria-label="Somente leitura" variant="outline">
            <button slButton size="sm" variant="outline">Editar</button>
            <div slToolbarSeparator></div>
            <button slButton size="sm" tone="danger">Excluir</button>
          </div>
        </fieldset>`,
      ) +
        scene(
          'One control unavailable, and still findable',
          '“Código” announces aria-disabled and keeps its place in the ring, which is what the pattern allows where discoverability matters; a natively disabled control is skipped instead.',
          `<div slToolbar aria-label="Formatação, com um indisponível" variant="outline">${FORMATTING}</div>`,
        ),
    ),
  }),
};

export const Overflow: Story = {
  parameters: scenario('overflow'),
  render: () => ({
    props: { actions: ['Duplicar', 'Mover', 'Renomear', 'Compartilhar', 'Arquivar'] },
    template: grid(
      2,
      scene(
        'wrap — the default',
        'Every control stays visible on a second row, and the arrows wrap from row to row because the item list is linear. The rule can end a row, which is the cost of keeping every control on screen.',
        `<div class="slotted-demo-measure">
          <div slToolbar aria-label="Muitas ações" size="sm" variant="outline">
            @for (action of actions; track action) {
              <button slButton size="sm" variant="ghost">{{ action }}</button>
            }
          </div>
        </div>`,
      ) +
        scene(
          'scroll — one line, whatever it holds',
          'The bar scrolls past its controls rather than squeezing them, and the arrows still reach every one. It is also what a menu bar falls back to when every unit in it is pinned.',
          `<div class="slotted-demo-measure">
          <div slToolbar aria-label="Muitas ações, rolando" size="sm" variant="outline" overflow="scroll">
            @for (action of actions; track action) {
              <button slButton size="sm" variant="ghost">{{ action }}</button>
            }
          </div>
        </div>`,
        ),
    ),
  }),
};

/**
 * The four actions of the document bar, written out rather than looped: each
 * one names the `ng-template` it becomes in the surface, and a template
 * variable is not something a `@for` can hand to an input.
 */
const DOCUMENT_BAR = (
  label: string,
) => `<div slToolbar aria-label="${label}" overflow="menu" size="sm" variant="outline">
  <div slToolbarItem>
    <button slButton size="sm" tone="accent">Publicar</button>
  </div>
  <div slToolbarSeparator></div>
  <div slToolbarItem [slToolbarItemCounterpart]="duplicate">
    <button slButton size="sm" variant="ghost">Duplicar</button>
  </div>
  <div slToolbarItem [slToolbarItemCounterpart]="rename">
    <button slButton size="sm" variant="ghost">Renomear</button>
  </div>
  <div slToolbarItem [slToolbarItemCounterpart]="exportAction">
    <button slButton size="sm" variant="ghost">Exportar</button>
  </div>
  <div slToolbarItem [slToolbarItemCounterpart]="archive">
    <button slButton size="sm" variant="ghost">Arquivar</button>
  </div>
  <sl-toolbar-overflow />
</div>`;

const DOCUMENT_TEMPLATES = `
<ng-template #duplicate><button slMenuItem>Duplicar</button></ng-template>
<ng-template #rename><button slMenuItem>Renomear</button></ng-template>
<ng-template #exportAction><button slMenuItem>Exportar</button></ng-template>
<ng-template #archive><button slMenuItem>Arquivar</button></ng-template>
<ng-template #alignment>
  <button slMenuItem>Alinhar à esquerda</button>
  <button slMenuItem>Centralizar</button>
  <button slMenuItem>Justificar</button>
  <button slMenuItem>Distribuir</button>
</ng-template>
<ng-template #schedule><button slMenuItem>Agendar</button></ng-template>
<ng-template #share><button slMenuItem>Compartilhar</button></ng-template>`;

export const OverflowMenu: Story = {
  parameters: scenario('overflowMenu'),
  render: () => ({
    props: {
      countedLabel: (hidden: number) => `Mais ${hidden} ${hidden === 1 ? 'ação' : 'ações'}`,
    },
    template:
      grid(
        2,
        scene(
          'A bar that ran out of room',
          'Resize the panel and watch the end give way first. Publicar declares no counterpart, so it cannot be hidden — that is the whole of how a primary action survives, and there is no priority input ranking it above the others.',
          `<div class="slotted-demo-measure">${DOCUMENT_BAR('Documento, estreito')}</div>`,
        ) +
          scene(
            'The same bar with room to spare',
            'Nothing has given way, so the control that would hold it is not drawn at all: a bar that permanently spent a control’s width on a menu with nothing in it would have lost a control’s width.',
            DOCUMENT_BAR('Documento, largo'),
          ) +
          scene(
            'A run that moves as one',
            'A group carries its own counterpart, so the whole run reaches the surface together and keeps its name there. The rule that divided it goes with it: a hairline dividing nothing is a stray line.',
            `<div class="slotted-demo-measure">
  <div slToolbar aria-label="Parágrafo" overflow="menu" size="sm" variant="outline">
    <div slToolbarItem>
      <button slButton size="sm" tone="accent">Salvar</button>
    </div>
    <div slToolbarSeparator></div>
    <div slToolbarGroup aria-label="Alinhamento" [slToolbarGroupCounterpart]="alignment">
      <button slButton size="sm" variant="ghost">Esquerda</button>
      <button slButton size="sm" variant="ghost">Centro</button>
      <button slButton size="sm" variant="ghost">Justificar</button>
      <button slButton size="sm" variant="ghost">Distribuir</button>
    </div>
    <sl-toolbar-overflow />
  </div>
</div>`,
          ) +
          scene(
            'The name says how much, not what the mark is',
            'The trigger announces “2 more actions” rather than three dots, and a bar in another language replaces the sentence through label rather than translating a glyph.',
            `<div class="slotted-demo-measure">
  <div slToolbar aria-label="Relatório" overflow="menu" size="sm" variant="outline">
    <div slToolbarItem>
      <button slButton size="sm" tone="accent">Gerar</button>
    </div>
    <div slToolbarItem [slToolbarItemCounterpart]="schedule">
      <button slButton size="sm" variant="ghost">Agendar</button>
    </div>
    <div slToolbarItem [slToolbarItemCounterpart]="share">
      <button slButton size="sm" variant="ghost">Compartilhar</button>
    </div>
    <sl-toolbar-overflow [label]="countedLabel" />
  </div>
</div>`,
          ),
      ) + DOCUMENT_TEMPLATES,
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A bar that states its own axes',
        'The provider carries the five decisions an application takes once, in the bootstrap file; a bar that states one itself still wins, which is how a page holds a dense table bar and a comfortable header bar.',
        `<div slToolbar aria-label="Formatação, compacta" size="sm" variant="outline">${FORMATTING}</div>`,
      ) +
        scene(
          'Where a bar belongs beside a tab list',
          'The actions slot of a tab list is a cell of the same grid row, and a toolbar there keeps the whole header to two tab stops: the list, then the bar.',
          `<div slTabs defaultValue="resumo">
          <div slTabList aria-label="Pedido">
            <div slTab value="resumo">Resumo</div>
            <div slTab value="itens">Itens</div>
          </div>
          <div slTabActions>
            <div slToolbar aria-label="Ações do pedido" size="sm">
              <button slButton size="sm" variant="ghost">Exportar</button>
              <button slButton size="sm" variant="ghost">Imprimir</button>
            </div>
          </div>
          <div slTabPanel value="resumo">
            <p slText size="sm">Entrega prevista para 12 de setembro.</p>
          </div>
          <div slTabPanel value="itens"><p slText size="sm">Três itens.</p></div>
        </div>`,
        ),
    ),
  }),
};
