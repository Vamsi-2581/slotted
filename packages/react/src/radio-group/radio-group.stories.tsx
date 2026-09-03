import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field, FieldLabel } from '../field';
import { Grid, Measure, Scene } from '../field/field-demo';
import { Grid as LayoutGrid } from '../grid';
import { FieldGroup, FieldGroupLegend } from '../field-group';
import { Text } from '../typography';
import { RadioGroup } from './radio-group';
import { RadioGroupDefaultsProvider } from './radio-group-defaults';
import { Radio } from './radio-group-parts';
import { REACT_RADIO_GROUP_DOCS, REACT_RADIO_GROUP_TOKENS } from './radio-group.docs';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_RADIO_GROUP_DOCS.radioGroup.scenes, {
    playground: Playground,
    orientation: Orientation,
    tile: Tile,
    sizes: Sizes,
    states: States,
    placement: Placement,
    description: Description,
    field: InsideAFieldGroup,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Radio Group',
        description:
          'One choice out of a set, around native radios that share a name — which is what buys the APG’s whole keyboard table, wrapping and right-to-left arrows included, without a roving tabindex existing in either binding.',
        framework: 'React',
        ...REACT_RADIO_GROUP_DOCS.radioGroup,
        tokens: REACT_RADIO_GROUP_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    'aria-label': 'Forma de envio',
    defaultValue: 'standard',
    disabled: false,
    invalid: false,
    labelPlacement: 'end',
    orientation: 'vertical',
    readOnly: false,
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <RadioGroup {...args}>
        <Radio value="standard">Entrega padrão</Radio>
        <Radio value="express">Entrega expressa</Radio>
        <Radio value="pickup">Retirar na loja</Radio>
      </RadioGroup>
    </div>
  ),
};

export const Tile: Story = {
  parameters: scenario('tile'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="An exclusive set of surfaces"
        note="Tab once into the set and the arrows move the choice through it — the items share a name, so the whole keyboard table is still the browser’s. The chosen tile carries a two-pixel accent edge, which is what survives the high-contrast scheme after the tint flattens."
        layout="block"
      >
        <RadioGroup defaultValue="team" name="plan-tile" variant="tile">
          <LayoutGrid gap={4} minItemWidth="sm">
            <Radio description="Até três projetos e um assento." value="starter">
              Starter
            </Radio>
            <Radio
              description="Projetos sem limite, dez assentos e histórico de um ano."
              value="team"
            >
              Team
            </Radio>
            <Radio description="Fale com vendas." disabled value="scale">
              Escala
            </Radio>
          </LayoutGrid>
        </RadioGroup>
      </Scene>
    </Grid>
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
        <RadioGroup aria-label="Prazo, empilhado" defaultValue="today">
          <Radio value="today">Hoje</Radio>
          <Radio value="tomorrow">Amanhã</Radio>
          <Radio value="week">Esta semana</Radio>
        </RadioGroup>
      </Scene>
      <Scene
        label="In a row that wraps"
        note="Two choices sit twice as far apart as a circle does from its own label, and aria-orientation is written here because the group owns its role. Narrow the window: the row wraps rather than clipping."
        layout="stack"
      >
        <RadioGroup aria-label="Prazo, em linha" defaultValue="today" orientation="horizontal">
          <Radio value="today">Hoje</Radio>
          <Radio value="tomorrow">Amanhã</Radio>
          <Radio value="week">Esta semana</Radio>
          <Radio value="none">Sem prazo definido</Radio>
        </RadioGroup>
      </Scene>
    </Grid>
  ),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The three steps on their own"
        note="The circle, the type and the gap all come from the control scales, so switching the toolbar to dense shrinks each step whole rather than in parts."
        layout="stack"
      >
        <RadioGroup aria-label="Compacto" defaultValue="a" orientation="horizontal" size="sm">
          <Radio value="a">Compacto</Radio>
          <Radio value="b">Outro</Radio>
        </RadioGroup>
        <RadioGroup aria-label="Padrão" defaultValue="a" orientation="horizontal" size="md">
          <Radio value="a">Padrão</Radio>
          <Radio value="b">Outro</Radio>
        </RadioGroup>
        <RadioGroup aria-label="Confortável" defaultValue="a" orientation="horizontal" size="lg">
          <Radio value="a">Confortável</Radio>
          <Radio value="b">Outro</Radio>
        </RadioGroup>
      </Scene>
      <Scene
        label="Inside a field, the field decides"
        note="A small field holding a medium set is a field and a control disagreeing about one row, so the group reads the field’s step before its own provider’s."
        layout="stack"
      >
        <Field size="sm">
          <FieldLabel>Prioridade</FieldLabel>
          <RadioGroup defaultValue="low">
            <Radio value="low">Normal</Radio>
            <Radio value="high">Urgente</Radio>
          </RadioGroup>
        </Field>
      </Scene>
    </Grid>
  ),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => (
    <Grid columns={3}>
      <Scene
        label="Invalid says it twice"
        note="Every circle reddens and thickens together, because the high-contrast scheme paints every border the same black and colour alone would leave the two states identical there."
        layout="stack"
      >
        <RadioGroup aria-label="Sem escolha" invalid required>
          <Radio value="a">Sem escolha ainda</Radio>
          <Radio value="b">Segunda opção</Radio>
        </RadioGroup>
      </Scene>
      <Scene
        label="Read-only, which is not disabled"
        note="Every item keeps its tab stop, its ring and its ink, and the chosen one keeps its accent, because the value is real and still submitted. Only the unchosen grounds and the pointer say otherwise."
        layout="stack"
      >
        <RadioGroup aria-label="Plano contratado" defaultValue="a" readOnly>
          <Radio value="a">Plano contratado</Radio>
          <Radio value="b">Outro plano</Radio>
        </RadioGroup>
      </Scene>
      <Scene
        label="A set, and one option, out of reach"
        note="The whole group leaves the tab order with one attribute; a single unavailable option dims from its own element’s state, and the browser skips it with the arrow keys for the same reason."
        layout="stack"
      >
        <RadioGroup aria-label="Desativado" defaultValue="a" disabled>
          <Radio value="a">Grupo inteiro desativado</Radio>
          <Radio value="b">Outra opção</Radio>
        </RadioGroup>
        <RadioGroup aria-label="Uma opção indisponível" defaultValue="a">
          <Radio value="a">Disponível</Radio>
          <Radio disabled value="b">
            Indisponível
          </Radio>
        </RadioGroup>
      </Scene>
    </Grid>
  ),
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The circle before the label"
        note="The default, and the arrangement a form uses: the circle starts the row, the label owns the gap after it, and each description aligns under its own text."
        layout="stack"
      >
        <RadioGroup aria-label="Pagamento" defaultValue="card">
          <Radio description="Em até doze parcelas." value="card">
            Cartão de crédito
          </Radio>
          <Radio description="Compensa em até três dias úteis." value="slip">
            Boleto
          </Radio>
        </RadioGroup>
      </Scene>
      <Scene
        label="The circle after the label"
        note="The controls line up with each other at the end of the row rather than each one hugging its own label, which is what a settings list needs and what a column of different-length labels would otherwise lose."
        layout="stack"
      >
        <RadioGroup aria-label="Pagamento, invertido" defaultValue="card" labelPlacement="start">
          <Radio value="card">Cartão de crédito</Radio>
          <Radio value="slip">Boleto</Radio>
          <Radio value="pix">Pix</Radio>
        </RadioGroup>
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
        note="A screen reader on the second option hears the second sentence and not the first: each description reaches only its own item’s control, through aria-describedby."
        layout="stack"
      >
        <RadioGroup aria-label="Plano" defaultValue="monthly">
          <Radio
            description="Cobrado todo dia 5. Pode ser cancelado a qualquer momento, sem multa."
            value="monthly"
          >
            Mensal
          </Radio>
          <Radio
            description="Dois meses de desconto, cobrados de uma vez na contratação."
            value="yearly"
          >
            Anual
          </Radio>
        </RadioGroup>
      </Scene>
      <Scene
        label="At the smallest step, in a narrow column"
        note="The description drops one step below the label’s type and keeps its alignment under the text, so a set of options in a 320-pixel drawer still reads as a list rather than as a paragraph."
        layout="stack"
      >
        <Measure>
          <RadioGroup aria-label="Plano, compacto" defaultValue="monthly" size="sm">
            <Radio description="Cobrado todo dia 5." value="monthly">
              Mensal
            </Radio>
            <Radio description="Dois meses de desconto." value="yearly">
              Anual
            </Radio>
          </RadioGroup>
        </Measure>
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
        note="The fieldset and its legend group and name the options, so the group renders no radiogroup role of its own — a second one named by the same legend would announce the same set twice."
        layout="stack"
      >
        <FieldGroup required>
          <FieldGroupLegend>Forma de pagamento</FieldGroupLegend>
          <RadioGroup defaultValue="card" name="payment">
            <Radio value="card">Cartão</Radio>
            <Radio value="pix">Pix</Radio>
            <Radio value="slip">Boleto</Radio>
          </RadioGroup>
        </FieldGroup>
      </Scene>
      <Scene
        label="One attribute disables the whole set"
        note="Only the fieldset carries disabled: the browser disables every radio inside it with nothing passed down, and each label dims from its own control’s state."
        layout="stack"
      >
        <FieldGroup disabled size="sm">
          <FieldGroupLegend>Enquanto o pedido está em análise</FieldGroupLegend>
          <RadioGroup defaultValue="card">
            <Radio value="card">Cartão</Radio>
            <Radio value="pix">Pix</Radio>
          </RadioGroup>
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
        label="An option that wraps"
        note="The circle stays on the first line box of the label rather than centring itself against the whole block, which is where align-items would put it as soon as the text reaches a second line."
        layout="stack"
      >
        <RadioGroup aria-label="Conteúdo longo" defaultValue="a">
          <Radio
            description="O círculo continua na primeira linha do rótulo, e a descrição sob o texto."
            value="a"
          >
            Autorizo o compartilhamento dos dados de entrega com a transportadora responsável pela
            última etapa do trajeto, incluindo telefone e ponto de referência.
          </Radio>
          <Radio value="b">Não autorizo.</Radio>
        </RadioGroup>
      </Scene>
      <Scene
        label="Content the family did not choose"
        note="An unbroken digest breaks instead of taking the page’s horizontal scrollbar with it, and a right-to-left label mirrors the whole row — the same component, not a rearranged one."
        layout="stack"
      >
        <Measure>
          <RadioGroup aria-label="Conteúdo extremo" defaultValue="a">
            <Radio value="a">
              sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
            </Radio>
            <Radio dir="rtl" value="b">
              أوافق على مشاركة بيانات التسليم مع شركة الشحن المسؤولة عن المرحلة الأخيرة.
            </Radio>
          </RadioGroup>
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
        <RadioGroupDefaultsProvider orientation="horizontal" size="sm">
          <RadioGroup aria-label="Herda os três" defaultValue="a">
            <Radio value="a">Herda</Radio>
            <Radio value="b">Também herda</Radio>
          </RadioGroup>
        </RadioGroupDefaultsProvider>
      </Scene>
      <Scene
        label="A set of choices that is a real list"
        note="render replaces both roots and hands each one every attribute the family wrote, so the markup a screen reader walks is a list of items rather than a stack of divs."
        layout="stack"
      >
        <RadioGroup
          aria-label="Uma lista de verdade"
          defaultValue="a"
          render={(props) => <ul {...props} className="slotted-demo-list" />}
        >
          <Radio render={(props) => <li {...props} />} value="a">
            Um item de lista
          </Radio>
          <Radio render={(props) => <li {...props} />} value="b">
            E outro abaixo dele
          </Radio>
        </RadioGroup>
      </Scene>
    </Grid>
  ),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => {
    function Reasons() {
      const [reason, setReason] = useState('—');
      return (
        <>
          <RadioGroup
            aria-label="Qual dispositivo pediu"
            onValueChange={(_value, request) => setReason(request.reason)}
          >
            <Radio value="a">Escolha com o ponteiro</Radio>
            <Radio value="b">Depois com as setas</Radio>
          </RadioGroup>
          <Text size="sm" tone="muted">
            reason: {reason}
          </Text>
        </>
      );
    }

    return (
      <Grid columns={2}>
        <Scene
          label="One tab stop for the whole set"
          note="Tab lands on the chosen item, or on the first when none is chosen; the arrows then move focus and selection together and wrap at both ends. No key listener exists in this family."
          layout="stack"
        >
          <RadioGroup aria-label="Uma parada de tabulação" defaultValue="b">
            <Radio value="a">Primeira</Radio>
            <Radio value="b">Escolhida, e onde o Tab chega</Radio>
            <Radio value="c">Terceira</Radio>
          </RadioGroup>
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
