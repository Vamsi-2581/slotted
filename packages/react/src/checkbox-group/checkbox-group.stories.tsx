import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Checkbox } from '../checkbox';
import { Field, FieldLabel } from '../field';
import { Grid, Measure, Scene } from '../field/field-demo';
import { Grid as LayoutGrid } from '../grid';
import { FieldGroup, FieldGroupLegend } from '../field-group';
import { CheckboxGroup } from './checkbox-group';
import { CheckboxGroupDefaultsProvider } from './checkbox-group-defaults';
import { REACT_CHECKBOX_GROUP_DOCS, REACT_CHECKBOX_GROUP_TOKENS } from './checkbox-group.docs';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;
const DAY_LABELS: Record<string, string> = {
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
};

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_CHECKBOX_GROUP_DOCS.checkboxGroup.scenes, {
    playground: Playground,
    orientation: Orientation,
    tile: Tile,
    parent: Parent,
    states: States,
    count: Count,
    field: InsideAFieldGroup,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const meta = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Checkbox Group',
        description:
          'A set of choices and the array behind it, with a parent box that is derived from the set rather than kept beside it — and a count of what is chosen published where the field already draws one.',
        framework: 'React',
        ...REACT_CHECKBOX_GROUP_DOCS.checkboxGroup,
        tokens: REACT_CHECKBOX_GROUP_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    allValues: [...DAYS],
    defaultValue: ['mon', 'wed'],
    disabled: false,
    invalid: false,
    orientation: 'vertical',
    readOnly: false,
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <CheckboxGroup {...args}>
        {DAYS.map((day) => (
          <Checkbox key={day} value={day}>
            {DAY_LABELS[day]}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  ),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Stacked, which is what a form uses"
        note="The distance between two choices is the control gap the theme restates per density, so the same set reads at the same rhythm in a comfortable page and a dense table."
        layout="stack"
      >
        <CheckboxGroup defaultValue={['mon']}>
          {DAYS.slice(0, 3).map((day) => (
            <Checkbox key={day} value={day}>
              {DAY_LABELS[day]}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </Scene>
      <Scene
        label="In a row that wraps"
        note="Two choices sit twice as far apart as a box does from its own label, so the eye groups each box with its text rather than with the option beside it. Narrow the window: the row wraps rather than clipping."
        layout="stack"
      >
        <CheckboxGroup defaultValue={['mon', 'wed']} orientation="horizontal">
          {DAYS.map((day) => (
            <Checkbox key={day} value={day}>
              {DAY_LABELS[day]}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </Scene>
    </Grid>
  ),
};

export const Tile: Story = {
  parameters: scenario('tile'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="One decision for the whole set"
        note="The group states the variant once and every choice under it is framed. Click anywhere inside a tile: the target is the surface, not the sixteen pixels of the box."
        layout="block"
      >
        <CheckboxGroup defaultValue={['pix']} variant="tile">
          <LayoutGrid gap={4} minItemWidth="sm">
            <Checkbox description="Compensação imediata, sem taxa por transação." value="pix">
              Pix
            </Checkbox>
            <Checkbox description="Parcelamento em até doze vezes." value="card">
              Cartão de crédito
            </Checkbox>
            <Checkbox description="Compensa em até três dias úteis." value="slip">
              Boleto
            </Checkbox>
          </LayoutGrid>
        </CheckboxGroup>
      </Scene>
    </Grid>
  ),
};

export const Parent: Story = {
  parameters: scenario('parent'),
  render: () => {
    function Derived() {
      const [value, setValue] = useState<readonly string[]>(['mon', 'tue']);
      return (
        <CheckboxGroup allValues={[...DAYS]} onValueChange={setValue} value={value}>
          <Checkbox parent>Todos os dias úteis</Checkbox>
          {DAYS.map((day) => (
            <Checkbox key={day} value={day}>
              {DAY_LABELS[day]}
            </Checkbox>
          ))}
        </CheckboxGroup>
      );
    }

    return (
      <Grid columns={2}>
        <Scene
          label="Derived from the set, not kept beside it"
          note="Tick the first box and the whole set follows; untick any child and the first returns to the dash. It holds no state of its own, so it can never disagree with what its children show."
          layout="stack"
        >
          <Derived />
        </Scene>
        <Scene
          label="Every value already chosen"
          note="With the whole set selected the parent is ticked rather than mixed, and its next request empties the selection instead of toggling one value of its own."
          layout="stack"
        >
          <CheckboxGroup allValues={[...DAYS].slice(0, 3)} defaultValue={[...DAYS].slice(0, 3)}>
            <Checkbox parent>Todos os dias</Checkbox>
            {DAYS.slice(0, 3).map((day) => (
              <Checkbox key={day} value={day}>
                {DAY_LABELS[day]}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Scene>
      </Grid>
    );
  },
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => (
    <Grid columns={3}>
      <Scene
        label="Invalid, said once for the set"
        note="Every box reddens and thickens its border together, and the sentence that says what is wrong belongs to the field group above them rather than to any one option."
        layout="stack"
      >
        <CheckboxGroup invalid required>
          <Checkbox value="a">Escolha ao menos uma</Checkbox>
          <Checkbox value="b">Segunda opção</Checkbox>
        </CheckboxGroup>
      </Scene>
      <Scene
        label="Read-only, which is not disabled"
        note="Every box keeps its tab stop, its ring and its ink because the values are real and still submitted. Only the ground of the unchosen options and the pointer say they are not the reader’s to move."
        layout="stack"
      >
        <CheckboxGroup defaultValue={['a']} readOnly>
          <Checkbox value="a">Contratado</Checkbox>
          <Checkbox value="b">Não contratado</Checkbox>
        </CheckboxGroup>
      </Scene>
      <Scene
        label="Disabled, from the platform"
        note="One attribute on the group reaches every box as the native one, so the boxes leave the tab order and the form together rather than one prop at a time."
        layout="stack"
      >
        <CheckboxGroup defaultValue={['a']} disabled>
          <Checkbox value="a">Grupo inteiro desativado</Checkbox>
          <Checkbox value="b">Outra opção</Checkbox>
        </CheckboxGroup>
      </Scene>
    </Grid>
  ),
};

export const Count: Story = {
  parameters: scenario('count'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Where a reader already looks for a count"
        note="The number sits in the spare column of the field’s label row, which is where a text field puts its character count — the same channel, for the same reason."
        layout="stack"
      >
        <Field>
          <FieldLabel>Dias de coleta</FieldLabel>
          <CheckboxGroup allValues={[...DAYS]} defaultValue={['mon', 'wed']} showCount>
            {DAYS.map((day) => (
              <Checkbox key={day} value={day}>
                {DAY_LABELS[day]}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </Field>
      </Scene>
      <Scene
        label="Without a set to measure against"
        note="With no allValues there is no total, so the count is the number chosen and nothing else. Tick a box and watch it move without a denominator appearing from nowhere."
        layout="stack"
      >
        <Field>
          <FieldLabel>Etiquetas</FieldLabel>
          <CheckboxGroup defaultValue={['a']} showCount>
            <Checkbox value="a">Urgente</Checkbox>
            <Checkbox value="b">Frágil</Checkbox>
            <Checkbox value="c">Refrigerado</Checkbox>
          </CheckboxGroup>
        </Field>
      </Scene>
    </Grid>
  ),
};

export const InsideAFieldGroup: Story = {
  parameters: scenario('field'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The legend names the set"
        note="The fieldset and its legend group and name the options, so this group renders no role of its own — a second one named by the same legend would announce the same set twice."
        layout="stack"
      >
        <FieldGroup required>
          <FieldGroupLegend>Notificações</FieldGroupLegend>
          <CheckboxGroup defaultValue={['approved']} name="alerts">
            <Checkbox value="approved">Pedido aprovado</Checkbox>
            <Checkbox value="refused">Pedido recusado</Checkbox>
            <Checkbox value="shipped">Pedido enviado</Checkbox>
          </CheckboxGroup>
        </FieldGroup>
      </Scene>
      <Scene
        label="One attribute disables the whole set"
        note="Only the fieldset carries disabled: the browser disables every box inside it with nothing passed down, and each label dims from its own control’s state rather than from an attribute the family wrote."
        layout="stack"
      >
        <FieldGroup disabled size="sm">
          <FieldGroupLegend>Enquanto a conta está suspensa</FieldGroupLegend>
          <CheckboxGroup defaultValue={['approved']}>
            <Checkbox value="approved">Pedido aprovado</Checkbox>
            <Checkbox value="refused">Pedido recusado</Checkbox>
          </CheckboxGroup>
        </FieldGroup>
      </Scene>
    </Grid>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Options longer than one line"
        note="Every box stays on the first line of its own label, and the set keeps its rhythm even when one option runs to three lines and the next to one."
        layout="stack"
      >
        <CheckboxGroup defaultValue={['a']}>
          <Checkbox value="a">
            Autorizo o uso dos dados de navegação para personalizar as recomendações desta e das
            demais lojas do grupo.
          </Checkbox>
          <Checkbox value="b">E também para medir o alcance das campanhas.</Checkbox>
        </CheckboxGroup>
      </Scene>
      <Scene
        label="A row that has run out of room"
        note="At 360 pixels the horizontal set wraps to as many rows as it needs rather than scrolling, because a set of options is not a scroll region and the last option has to be visible."
        layout="stack"
      >
        <Measure>
          <CheckboxGroup defaultValue={['mon']} orientation="horizontal" size="sm">
            {DAYS.map((day) => (
              <Checkbox key={day} value={day}>
                {DAY_LABELS[day]}
              </Checkbox>
            ))}
          </CheckboxGroup>
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
        label="Three decisions an application takes once"
        note="The provider is outranked by the field around the group, so a compact section stays compact inside an application that is comfortable everywhere else."
        layout="stack"
      >
        <CheckboxGroupDefaultsProvider orientation="horizontal" size="sm">
          <CheckboxGroup defaultValue={['a']}>
            <Checkbox value="a">Herda os três</Checkbox>
            <Checkbox value="b">E este também</Checkbox>
          </CheckboxGroup>
        </CheckboxGroupDefaultsProvider>
      </Scene>
      <Scene
        label="A set of choices that is a real list"
        note="render replaces both roots and hands each one every attribute the family wrote, so the markup a screen reader walks is a list of items rather than a stack of divs."
        layout="stack"
      >
        <CheckboxGroup
          defaultValue={['a']}
          render={(props) => <ul {...props} className="slotted-demo-list" />}
        >
          <Checkbox render={(props) => <li {...props} />} value="a">
            Um item de lista
          </Checkbox>
          <Checkbox render={(props) => <li {...props} />} value="b">
            E outro abaixo dele
          </Checkbox>
        </CheckboxGroup>
      </Scene>
    </Grid>
  ),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="One tab stop per box"
        note="Tab reaches every option in turn and Space toggles the one that has focus, because a checkbox is one choice made on its own. No key listener exists in this family."
        layout="stack"
      >
        <CheckboxGroup allValues={['a', 'b', 'c']}>
          <Checkbox value="a">Tab até aqui</Checkbox>
          <Checkbox value="b">E de novo até aqui</Checkbox>
          <Checkbox value="c">E mais uma vez</Checkbox>
        </CheckboxGroup>
      </Scene>
      <Scene
        label="A disabled option is still skipped"
        note="The browser skips it because it is natively disabled, so the tab order needs no bookkeeping from the group and stays right when the set changes at runtime."
        layout="stack"
      >
        <CheckboxGroup>
          <Checkbox value="a">Disponível</Checkbox>
          <Checkbox disabled value="b">
            Indisponível
          </Checkbox>
          <Checkbox value="c">Disponível de novo</Checkbox>
        </CheckboxGroup>
      </Scene>
    </Grid>
  ),
};
