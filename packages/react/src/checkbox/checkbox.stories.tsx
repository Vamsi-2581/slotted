import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';

import { Button } from '../button';
import { CheckboxGroup } from '../checkbox-group';
import { Grid, Measure, Scene } from '../field/field-demo';
import { Grid as LayoutGrid } from '../grid';
import { FieldGroup, FieldGroupLegend } from '../field-group';
import { Text } from '../typography';
import { Checkbox } from './checkbox';
import { CheckboxDefaultsProvider } from './checkbox-defaults';
import { REACT_CHECKBOX_DOCS, REACT_CHECKBOX_TOKENS } from './checkbox.docs';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;
const DAY_LABELS: Record<string, string> = {
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
};

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_CHECKBOX_DOCS.checkbox.scenes, {
    playground: Playground,
    sizes: Sizes,
    tile: Tile,
    states: States,
    indeterminate: Indeterminate,
    placement: Placement,
    description: Description,
    field: InsideAField,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Checkbox',
        description:
          'One choice, ticked or not, around a native input that keeps the value, the name and the platform’s whole keyboard — with the mark drawn as a mask beside it rather than as a character inside it.',
        framework: 'React',
        ...REACT_CHECKBOX_DOCS.checkbox,
        tokens: REACT_CHECKBOX_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: 'Enviar recibo',
    defaultChecked: true,
    description: 'Enviaremos o recibo por e-mail.',
    disabled: false,
    indeterminate: false,
    labelPlacement: 'end',
    readOnly: false,
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Checkbox {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The three steps on their own"
        note="The square, the type and the gap all come from the control scales, so switching the toolbar to dense shrinks each step whole rather than in parts."
        layout="stack"
      >
        <Checkbox defaultChecked size="sm">
          Compacto
        </Checkbox>
        <Checkbox defaultChecked size="md">
          Padrão
        </Checkbox>
        <Checkbox defaultChecked size="lg">
          Confortável
        </Checkbox>
      </Scene>
      <Scene
        label="Inside a group, the group decides"
        note="A small group holding a medium box is a group and a control disagreeing about one row, so the box reads the group’s step before its own provider’s."
        layout="stack"
      >
        <CheckboxGroup defaultValue={['a']} size="sm">
          <Checkbox value="a">Compacto porque o grupo é</Checkbox>
          <Checkbox value="b">E este também</Checkbox>
        </CheckboxGroup>
        <CheckboxGroup defaultValue={['a']} size="lg">
          <Checkbox value="a">Confortável porque o grupo é</Checkbox>
        </CheckboxGroup>
      </Scene>
    </Grid>
  ),
};

export const Tile: Story = {
  parameters: scenario('tile'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The whole frame is the target"
        note="Click the description, the empty space, the edge — the label’s hit area covers the surface, so a tile is one target rather than a box with text beside it."
        layout="block"
      >
        <LayoutGrid gap={4} minItemWidth="sm">
          <Checkbox
            defaultChecked
            description="Uma cópia por dia, guardada por trinta dias."
            variant="tile"
          >
            Backup diário
          </Checkbox>
          <Checkbox description="Quem mudou o quê, e quando, exportável em CSV." variant="tile">
            Registro de auditoria
          </Checkbox>
          <Checkbox description="Disponível a partir do plano Escala." disabled variant="tile">
            Região secundária
          </Checkbox>
        </LayoutGrid>
      </Scene>
      <Scene
        label="Chosen is an edge before it is a tint"
        note="Switch the toolbar to high contrast: the tint flattens to white and the two-pixel accent edge is what still says which tile was chosen. Hovering a chosen tile deepens that edge rather than its ground, because the tint is already the last step the tone has."
        layout="block"
      >
        <LayoutGrid columns={1} gap={4}>
          <Checkbox defaultChecked variant="tile">
            Escolhido
          </Checkbox>
          <Checkbox variant="tile">Não escolhido</Checkbox>
          <Checkbox defaultChecked invalid variant="tile">
            Escolhido e inválido
          </Checkbox>
          <Checkbox defaultChecked readOnly variant="tile">
            Escolhido e somente leitura
          </Checkbox>
        </LayoutGrid>
      </Scene>
    </Grid>
  ),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => (
    <Grid columns={3}>
      <Scene
        label="What a reader may still change"
        note="Hover the first two and press one: the ground answers the pointer and goes one step further under it, and the ring on focus sits clear of the border rather than on it."
        layout="stack"
      >
        <Checkbox>Padrão</Checkbox>
        <Checkbox defaultChecked>Marcado</Checkbox>
        <Checkbox indeterminate>Parcialmente marcado</Checkbox>
      </Scene>
      <Scene
        label="What a reader may not"
        note="Read-only keeps full-strength ink, its ring and its tab stop, because the value is real and still submitted. Disabled loses all three, and stays legible rather than merely faded."
        layout="stack"
      >
        <Checkbox defaultChecked readOnly>
          Somente leitura
        </Checkbox>
        <Checkbox disabled>Desativado</Checkbox>
        <Checkbox defaultChecked disabled>
          Desativado e marcado
        </Checkbox>
      </Scene>
      <Scene
        label="Invalid says it twice"
        note="The border reddens and thickens together, because the high-contrast scheme paints every border the same black and colour alone would leave the two states identical there."
        layout="stack"
      >
        <Checkbox invalid>Escolha ao menos uma</Checkbox>
        <Checkbox defaultChecked invalid>
          Inválido e marcado
        </Checkbox>
      </Scene>
    </Grid>
  ),
};

export const Indeterminate: Story = {
  parameters: scenario('indeterminate'),
  render: () => {
    function Permissions() {
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
          label="A state the consumer owns"
          note="The dash is drawn from the same mask property as the check, pointed at another glyph, and the form still submits a boolean rather than a third value."
          layout="stack"
        >
          <Checkbox indeterminate>Parcialmente marcado</Checkbox>
          <Checkbox indeterminate description="Nada muda no que é enviado.">
            Com descrição
          </Checkbox>
        </Scene>
        <Scene
          label="A state the group derives"
          note="Tick the first box and the whole set follows; untick any one of them and the first goes back to the dash, because it reads the set rather than keeping a state of its own."
          layout="stack"
        >
          <Permissions />
        </Scene>
      </Grid>
    );
  },
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The box before the label"
        note="The default, and the arrangement a form uses: the box starts the row, the label owns the gap after it, and the description aligns under the text."
        layout="stack"
      >
        <Checkbox defaultChecked description="A descrição acompanha o rótulo.">
          Receber avisos
        </Checkbox>
        <Checkbox>Receber resumo semanal</Checkbox>
      </Scene>
      <Scene
        label="The box after the label"
        note="The controls line up with each other at the end of the row rather than each one hugging its own label, which is what a settings list needs and what a column of different-length labels would otherwise lose."
        layout="stack"
      >
        <Checkbox defaultChecked labelPlacement="start">
          Notificações por e-mail
        </Checkbox>
        <Checkbox labelPlacement="start">Notificações por SMS</Checkbox>
        <Checkbox labelPlacement="start">Notificações no aplicativo</Checkbox>
      </Scene>
    </Grid>
  ),
};

export const Description: Story = {
  parameters: scenario('description'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Described, and not named"
        note="A screen reader announces the label as the name and the paragraph as the description, and clicking the paragraph toggles nothing — which is why it sits outside the label element."
        layout="stack"
      >
        <Checkbox description="Um resumo por dia, e nunca mais de um. Pode ser desligado a qualquer momento.">
          Receber avisos por e-mail
        </Checkbox>
      </Scene>
      <Scene
        label="At the smallest step, in a narrow column"
        note="The description drops one step below the label’s type and keeps its alignment under the text, so a set of options in a 320-pixel drawer still reads as a list rather than as a paragraph."
        layout="stack"
      >
        <Measure>
          <CheckboxGroup size="sm">
            <Checkbox description="Depois disso a nota é arquivada." value="a">
              Guardar por 90 dias
            </Checkbox>
            <Checkbox description="Vale para todas as filiais." value="b">
              Aplicar a todo o grupo
            </Checkbox>
          </CheckboxGroup>
        </Measure>
      </Scene>
    </Grid>
  ),
};

export const InsideAField: Story = {
  parameters: scenario('field'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A set of boxes under one legend"
        note="The fieldset and its legend are what group and name the set, so the group inside it withdraws its own role rather than announcing the same set twice."
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
        label="A disabled group, from the platform"
        note="Only the fieldset carries disabled. Every box inside it is disabled by the browser with nothing passed down, and each label dims from its own control’s state."
        layout="stack"
      >
        <FieldGroup disabled>
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
        label="A label that wraps"
        note="The box stays on the first line box of the label rather than centring itself against the whole block, which is where align-items would put it as soon as the text reaches a second line."
        layout="stack"
      >
        <Checkbox
          defaultChecked
          description="A caixa continua na primeira linha do rótulo, e não no meio do bloco de texto."
        >
          Concordo em receber comunicações sobre alterações contratuais, prazos de entrega e
          mudanças na política de devolução desta e das demais lojas do grupo.
        </Checkbox>
      </Scene>
      <Scene
        label="Content the family did not choose"
        note="An unbroken token breaks instead of taking the page’s horizontal scrollbar with it, and a right-to-left label mirrors the whole row — the same component, not a rearranged one."
        layout="stack"
      >
        <Measure>
          <Checkbox>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0</Checkbox>
          <Checkbox defaultChecked dir="rtl">
            أوافق على تلقي رسائل حول التغييرات في العقد ومواعيد التسليم.
          </Checkbox>
        </Measure>
      </Scene>
    </Grid>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => {
    function Focused() {
      const ref = useRef<HTMLInputElement>(null);
      return (
        <>
          <Checkbox ref={ref}>Uma caixa que o botão alcança</Checkbox>
          <Button onClick={() => ref.current?.focus()} size="sm" variant="outline">
            Focar a caixa
          </Button>
        </>
      );
    }

    return (
      <Grid columns={2}>
        <Scene
          label="Two decisions an application takes once"
          note="The provider is outranked by the group and by the field, so a section can still be compact inside an application that is comfortable everywhere else."
          layout="stack"
        >
          <CheckboxDefaultsProvider labelPlacement="start" size="sm">
            <Checkbox defaultChecked>Herda o passo e o lado</Checkbox>
            <Checkbox>E esta também</Checkbox>
          </CheckboxDefaultsProvider>
        </Scene>
        <Scene
          label="The element, and the root it stands in"
          note="ref reaches the input, so focus and click are the platform’s own; render replaces the root with a list item and hands it every attribute the family wrote."
          layout="stack"
        >
          <Focused />
          <ul className="slotted-demo-list">
            <Checkbox defaultChecked render={(props) => <li {...props} />}>
              Um item de lista que também é uma caixa
            </Checkbox>
            <Checkbox render={(props) => <li {...props} />}>E outro ao lado dele</Checkbox>
          </ul>
        </Scene>
      </Grid>
    );
  },
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => {
    function Reasons() {
      const [reason, setReason] = useState('—');
      return (
        <>
          <Checkbox onCheckedChange={(_, request) => setReason(request.reason)}>
            Marque com o ponteiro, depois com a barra de espaço
          </Checkbox>
          <Text size="sm" tone="muted">
            reason: {reason}
          </Text>
        </>
      );
    }

    return (
      <Grid columns={2}>
        <Scene
          label="The platform’s whole table"
          note="Tab reaches the box, Space toggles it, and Enter submits the form rather than the control. No key listener exists in this family, which is why the behaviour is already translated and already mirrored."
          layout="stack"
        >
          <Checkbox>Tab até aqui, depois espaço</Checkbox>
          <Checkbox defaultChecked>E de novo</Checkbox>
        </Scene>
        <Scene
          label="Which device asked"
          note="A click synthesised by the keyboard reports no detail and a real one reports the click count, which is how the reason is recovered without a key listener existing anywhere."
          layout="stack"
        >
          <Reasons />
        </Scene>
      </Grid>
    );
  },
};
