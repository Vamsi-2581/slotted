import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Grid, Measure, Scene } from '../field/field-demo';
import { Tab, TabActions, TabList, TabPanel, Tabs } from '../tabs';
import { TextField } from '../text-field';
import { Text } from '../typography';
import { Toolbar } from './toolbar';
import { ToolbarDefaultsProvider } from './toolbar-defaults';
import { ToolbarGroup, ToolbarSeparator, ToolbarSpacer } from './toolbar-parts';
import { REACT_TOOLBAR_DOCS, REACT_TOOLBAR_TOKENS } from './toolbar.docs';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_TOOLBAR_DOCS.toolbar.scenes, {
    playground: Playground,
    orientation: Orientation,
    variant: Variant,
    sizes: Sizes,
    groups: Groups,
    keyboard: Keyboard,
    keyOwners: KeyOwners,
    disabled: Disabled,
    overflow: Overflow,
    composition: Composition,
  }) as never;

const meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Toolbar',
        description:
          'A set of controls that share one tab stop. The APG’s arrow model over the consumer’s own controls, groups and rules that say what belongs together, and an item that may keep the arrows it needs to operate.',
        framework: 'React',
        ...REACT_TOOLBAR_DOCS.toolbar,
        tokens: REACT_TOOLBAR_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Formatting(props: Record<string, unknown>) {
  return (
    <Toolbar aria-label="Formatação" {...props}>
      <Button size="sm" variant="ghost">
        Negrito
      </Button>
      <Button size="sm" variant="ghost">
        Itálico
      </Button>
      <ToolbarSeparator />
      <Button size="sm" variant="ghost">
        Link
      </Button>
      <Button focusableWhenDisabled disabled size="sm" variant="ghost">
        Código
      </Button>
    </Toolbar>
  );
}

export const Playground: Story = {
  args: {
    'aria-label': 'Formatação',
    loop: true,
    orientation: 'horizontal',
    overflow: 'wrap',
    size: 'md',
    variant: 'plain',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Toolbar {...args}>
        <Button variant="ghost">Negrito</Button>
        <Button variant="ghost">Itálico</Button>
        <ToolbarSeparator />
        <Button variant="ghost">Link</Button>
      </Toolbar>
    </div>
  ),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A row of controls"
        note="The controls share a middle rather than a height, so an icon button beside a wider one still reads as one line."
      >
        <Formatting variant="outline" />
      </Scene>
      <Scene
        label="A column of them"
        note="A column stretches its controls, because a column at each control's natural width is a ragged edge rather than a bar; the rule turns with it."
      >
        <Toolbar aria-label="Ferramentas" orientation="vertical" variant="outline">
          <Button size="sm" variant="ghost">
            Lápis
          </Button>
          <Button size="sm" variant="ghost">
            Pincel
          </Button>
          <ToolbarSeparator />
          <Button size="sm" variant="ghost">
            Borracha
          </Button>
        </Toolbar>
      </Scene>
    </Grid>
  ),
};

export const Variant: Story = {
  parameters: scenario('variant'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="plain — the default"
        note="No ground at all: a bar inside a card header or above a table is already standing on a surface, and a second one there reads as a box nobody asked for."
      >
        <Formatting />
      </Scene>
      <Scene
        label="outline"
        note="A framed bar pads itself by at least the reach of a focus ring, so a focused control never sits on the bar's own edge — visible if you tab into it."
      >
        <Formatting variant="outline" />
      </Scene>
    </Grid>
  ),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => (
    <Grid columns={3}>
      <Scene label="sm" note="The compact bar, for a card header or the row above a dense table.">
        <Formatting size="sm" variant="outline" />
      </Scene>
      <Scene label="md" note="The default inset and gap, with controls at their own middle step.">
        <Formatting size="md" variant="outline" />
      </Scene>
      <Scene
        label="lg"
        note="The bar grows and the controls do not: the size moves the inset, the gap and the rule's inset, never another family's control."
      >
        <Formatting size="lg" variant="outline" />
      </Scene>
    </Grid>
  ),
};

export const Groups: Story = {
  parameters: scenario('groups'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="What belongs together, and what belongs apart"
        note="The two aligned buttons sit half a gap apart inside their group and a gap and a half from what follows; the rule draws the same boundary, and the spacer keeps the destructive action at the far end."
      >
        <Toolbar aria-label="Seleção" variant="outline">
          <ToolbarGroup aria-label="Alinhamento">
            <Button size="sm" variant="outline">
              Início
            </Button>
            <Button pressed size="sm" variant="outline">
              Centro
            </Button>
            <Button size="sm" variant="outline">
              Fim
            </Button>
          </ToolbarGroup>
          <ToolbarSeparator />
          <Checkbox size="sm">Grade</Checkbox>
          <ToolbarSpacer />
          <Button size="sm" tone="danger">
            Excluir
          </Button>
        </Toolbar>
      </Scene>
    </Grid>
  ),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="One stop for four families"
        note="Tab in once: a button, a checkbox and a link share the ring, because an item is anything focusable rather than a component the bar had to wrap."
      >
        <Toolbar aria-label="Ações mistas" variant="outline">
          <Button size="sm" variant="ghost">
            Publicar
          </Button>
          <Checkbox size="sm">Rascunho</Checkbox>
          <ToolbarSeparator />
          <Button render={(props) => <a {...props} href="#ajuda" />} size="sm" variant="ghost">
            Ajuda
          </Button>
        </Toolbar>
      </Scene>
      <Scene
        label="And it comes back where it left"
        note="Move to the third control, tab away, tab back: entry lands on the control that last had focus, which is what the pattern asks for."
      >
        <Formatting variant="outline" />
      </Scene>
    </Grid>
  ),
};

export const KeyOwners: Story = {
  parameters: scenario('keyOwners'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="The caret keeps its own keys"
        note="Focus the field and press the left and right arrows: the caret moves and focus stays. Up or down leaves the field, which is the way out the cross axis exists to give."
      >
        <Toolbar aria-label="Filtro" variant="outline">
          <Button size="sm" variant="outline">
            Todos
          </Button>
          <Button size="sm" variant="outline">
            Abertos
          </Button>
          <ToolbarSeparator />
          <ToolbarSpacer />
          <TextField aria-label="Buscar" placeholder="Buscar" size="sm" type="search" />
        </Toolbar>
      </Scene>
    </Grid>
  ),
};

export const Disabled: Story = {
  parameters: scenario('disabled'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A bar out of action"
        note="A fieldset disables every control inside it natively, and a natively disabled control cannot be focused — so the bar loses its tab stop without the family owning a disabled axis at all."
      >
        <fieldset className="slotted-demo-fieldset" disabled>
          <Toolbar aria-label="Somente leitura" variant="outline">
            <Button size="sm" variant="outline">
              Editar
            </Button>
            <ToolbarSeparator />
            <Button size="sm" tone="danger">
              Excluir
            </Button>
          </Toolbar>
        </fieldset>
      </Scene>
      <Scene
        label="One control unavailable, and still findable"
        note="“Código” announces aria-disabled and keeps its place in the ring, which is what the pattern allows where discoverability matters; a natively disabled control is skipped instead."
      >
        <Formatting variant="outline" />
      </Scene>
    </Grid>
  ),
};

export const Overflow: Story = {
  parameters: scenario('overflow'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="wrap — the default"
        note="Every control stays visible on a second row, and the arrows wrap from row to row because the item list is linear. The rule can end a row, which is the cost of keeping every control on screen."
      >
        <Measure>
          <Toolbar aria-label="Muitas ações" size="sm" variant="outline">
            {['Duplicar', 'Mover', 'Renomear', 'Compartilhar', 'Arquivar'].map((action) => (
              <Button key={action} size="sm" variant="ghost">
                {action}
              </Button>
            ))}
          </Toolbar>
        </Measure>
      </Scene>
      <Scene
        label="scroll — one line, whatever it holds"
        note="The bar scrolls past its controls rather than squeezing them, and the arrows still reach every one. The overflow menu the field agrees on arrives with the menu family."
      >
        <Measure>
          <Toolbar aria-label="Muitas ações, rolando" overflow="scroll" size="sm" variant="outline">
            {['Duplicar', 'Mover', 'Renomear', 'Compartilhar', 'Arquivar'].map((action) => (
              <Button key={action} size="sm" variant="ghost">
                {action}
              </Button>
            ))}
          </Toolbar>
        </Measure>
      </Scene>
    </Grid>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Five decisions an application takes once"
        note="Every bar under the provider is framed and compact, and a bar that states a step itself still wins — which is how one page holds a dense table bar and a comfortable header bar."
      >
        <ToolbarDefaultsProvider size="sm" variant="outline">
          <Formatting />
        </ToolbarDefaultsProvider>
      </Scene>
      <Scene
        label="Where a bar belongs beside a tab list"
        note="The actions slot of a tab list is a cell of the same grid row, and a toolbar there keeps the whole header to two tab stops: the list, then the bar."
      >
        <Tabs defaultValue="resumo">
          <TabList aria-label="Pedido">
            <Tab value="resumo">Resumo</Tab>
            <Tab value="itens">Itens</Tab>
          </TabList>
          <TabActions>
            <Toolbar aria-label="Ações do pedido" size="sm">
              <Button size="sm" variant="ghost">
                Exportar
              </Button>
              <Button size="sm" variant="ghost">
                Imprimir
              </Button>
            </Toolbar>
          </TabActions>
          <TabPanel value="resumo">
            <Text size="sm">Entrega prevista para 12 de setembro.</Text>
          </TabPanel>
          <TabPanel value="itens">
            <Text size="sm">Três itens.</Text>
          </TabPanel>
        </Tabs>
      </Scene>
    </Grid>
  ),
};
