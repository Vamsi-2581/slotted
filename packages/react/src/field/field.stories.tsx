import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Field } from './field';
import { useField } from './field-context';
import { FieldDefaultsProvider } from './field-defaults';
import { Grid, Measure, Scene } from './field-demo';
import {
  FieldControl,
  FieldCounter,
  FieldDescription,
  FieldError,
  FieldLabel,
} from './field-parts';
import { REACT_FIELD_DOCS, REACT_FIELD_TOKENS } from './field.docs';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_FIELD_DOCS.field.scenes, {
    playground: Playground,
    necessity: Necessity,
    placement: Placement,
    sizes: Sizes,
    states: States,
    messages: Messages,
    counter: Counter,
    content: Content,
    composition: Composition,
    accessibility: Accessibility,
  }) as never;

const meta = {
  title: 'Components/Field',
  component: Field,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Field',
        description:
          'One control, its name, its necessity, its help and its error — and the four identifiers that bind them, derived from one base so nothing has to be coordinated between siblings.',
        framework: 'React',
        ...REACT_FIELD_DOCS.field,
        tokens: REACT_FIELD_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    labelPlacement: 'top',
    required: true,
    requiredMark: 'mark',
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Field {...args}>
        <FieldLabel>E-mail</FieldLabel>
        <FieldControl placeholder="voce@empresa.com.br" type="email" />
        <FieldDescription>Usaremos este endereço para a cobrança.</FieldDescription>
      </Field>
    </div>
  ),
};

export const Necessity: Story = {
  parameters: scenario('necessity'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The asterisk, and the field that carries none"
        note="The mark is drawn by the label rather than written by the page, so it cannot be forgotten — and it is aria-hidden, because aria-required on the control already says it."
      >
        <Field required>
          <FieldLabel>CNPJ</FieldLabel>
          <FieldControl defaultValue="12.345.678/0001-90" />
        </Field>
        <Field>
          <FieldLabel>Inscrição estadual</FieldLabel>
          <FieldControl />
        </Field>
      </Scene>
      <Scene
        label="The words, for a form where most fields are optional"
        note='Marking the two required fields in a form of twenty optional ones leaves the other eighteen ambiguous. requiredMark="text" names both sides, and the two words come from the provider.'
      >
        <Field required requiredMark="text">
          <FieldLabel>CNPJ</FieldLabel>
          <FieldControl defaultValue="12.345.678/0001-90" />
        </Field>
        <Field requiredMark="text">
          <FieldLabel>Inscrição estadual</FieldLabel>
          <FieldControl />
        </Field>
      </Scene>
    </Grid>
  ),
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Beside the control, in a page-width form"
        note="The label takes a track of its own and the control the rest. A label of twelve words wraps inside its track and stays level with the control’s first line rather than sliding under it."
      >
        <Field labelPlacement="side">
          <FieldLabel>Razão social</FieldLabel>
          <FieldControl defaultValue="Sirius Group Tecnologia" />
        </Field>
        <Field labelPlacement="side">
          <FieldLabel>Endereço de correspondência da matriz</FieldLabel>
          <FieldControl defaultValue="Avenida Paulista, 1000" />
        </Field>
      </Scene>
      <Scene
        label="The same two fields, in a 320-pixel column"
        note="Nothing changed but the width the field has. The container query is on the field itself, so a form in a drawer stacks while the same markup in a page grid does not."
      >
        <Measure>
          <Field labelPlacement="side">
            <FieldLabel>Razão social</FieldLabel>
            <FieldControl defaultValue="Sirius Group Tecnologia" />
          </Field>
        </Measure>
        <Measure>
          <Field labelPlacement="side">
            <FieldLabel>Endereço de correspondência da matriz</FieldLabel>
            <FieldControl defaultValue="Avenida Paulista, 1000" />
          </Field>
        </Measure>
      </Scene>
    </Grid>
  ),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Three steps, matching the control"
        note="A field is not a control and has no height of its own; what steps is the type of the label, the message and the counter, so a field sits level with the control it wraps."
      >
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Field key={size} size={size}>
            <FieldLabel>{`Apelido — ${size}`}</FieldLabel>
            <FieldControl defaultValue={size} />
            <FieldDescription>Aparece nos relatórios.</FieldDescription>
          </Field>
        ))}
      </Scene>
      <Scene
        label="Every step answers the density switch"
        note="Set the toolbar to dense: all three steps read the control type scale, which is one of the three the theme restates per density, so a field in a dense table shrinks whole rather than in parts."
      >
        <Field size="lg">
          <FieldLabel>Descrição da unidade</FieldLabel>
          <FieldControl defaultValue="Matriz — São Paulo" />
          <FieldDescription>Aparece no cabeçalho dos relatórios.</FieldDescription>
        </Field>
        <Field size="sm">
          <FieldLabel>Centro de custo</FieldLabel>
          <FieldControl defaultValue="CC-4021" />
        </Field>
      </Scene>
    </Grid>
  ),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Invalid, and what stays the colour it was"
        note="Only the message turns. The label keeps its ink because the error already says the same thing in words and in colour, and a red marker on a red label is a marker nobody can see."
      >
        <Field invalid required>
          <FieldLabel>CNPJ</FieldLabel>
          <FieldControl defaultValue="12.345.678" />
          <FieldDescription>Somente números, com filial e dígito.</FieldDescription>
          <FieldError>Faltam seis dígitos.</FieldError>
        </Field>
      </Scene>
      <Scene
        label="Read-only, and disabled"
        note="Read-only stays focusable and copyable and looks nothing like disabled, which is muted to a colour the theme measures rather than faded by opacity — a label nobody can read is a field nobody can identify."
      >
        <Field readOnly>
          <FieldLabel>Identificador da conta</FieldLabel>
          <FieldControl defaultValue="acc_9f2b7c41" readOnly />
          <FieldDescription>Gerado na criação da conta e copiável.</FieldDescription>
        </Field>
        <Field disabled required>
          <FieldLabel>Centro de custo</FieldLabel>
          <FieldControl defaultValue="Escolha uma unidade primeiro" />
          <FieldDescription>Disponível depois que a unidade for escolhida.</FieldDescription>
        </Field>
      </Scene>
    </Grid>
  ),
};

function SubmitOnce() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <Field invalid={submitted}>
        <FieldLabel>Telefone</FieldLabel>
        <FieldControl defaultValue="(11) 90000-0000" />
        <FieldError live="polite" reserve>
          {submitted ? 'Informe o nono dígito.' : undefined}
        </FieldError>
      </Field>
      <button onClick={() => setSubmitted((value) => !value)} type="button">
        {submitted ? 'Limpar o erro' : 'Enviar'}
      </button>
    </>
  );
}

export const Messages: Story = {
  parameters: scenario('messages'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Help, an error, and a warning that is neither"
        note="All three are inline-message roots. The error carries a clipped “Error:” a screen reader reads before the sentence, and the warning is the same part in another tone rather than a member of its own."
      >
        <Field>
          <FieldLabel>Senha</FieldLabel>
          <FieldControl defaultValue="paulista1000" type="password" />
          <FieldDescription>Entre 8 e 64 caracteres, com ao menos um número.</FieldDescription>
          <FieldError tone="warning">A senha é válida, mas fácil de adivinhar.</FieldError>
        </Field>
      </Scene>
      <Scene
        label="The line held open before the error arrives"
        note="Press the button twice and watch the button itself: reserve keeps one line box of the error’s own leading whether or not there is a message, so nothing below the field moves when the error appears."
      >
        <SubmitOnce />
      </Scene>
    </Grid>
  ),
};

function Description() {
  const [value, setValue] = useState(
    'Integramos folha, ponto e benefícios em um só lugar, com fechamento contábil por competência.',
  );
  const over = value.length > 140;

  return (
    <Field invalid={over}>
      <FieldLabel>Descrição pública</FieldLabel>
      <FieldCounter invalid={over}>{`${value.length}/140`}</FieldCounter>
      <FieldControl
        render={(props) => (
          <textarea
            {...props}
            onChange={(event) => setValue(event.target.value)}
            rows={3}
            value={value}
          />
        )}
      />
      {over ? <FieldError>{`Corte ${value.length - 140} caracteres.`}</FieldError> : null}
    </Field>
  );
}

export const Counter: Story = {
  parameters: scenario('counter'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Type past the limit and watch the row above"
        note="The count sits in the label row’s spare column, so it never shares a row with the error and never adds one. It turns at its own limit, which a count reaches before the form has decided anything."
      >
        <Description />
      </Scene>
      <Scene
        label="The same counter beside a side label"
        note="Label, control and count share the first row, each in a track of its own — the count stays at the end of the row rather than dropping under the control."
      >
        <Field labelPlacement="side">
          <FieldLabel>Assunto</FieldLabel>
          <FieldCounter>12/60</FieldCounter>
          <FieldControl defaultValue="Fatura março" />
        </Field>
      </Scene>
    </Grid>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A label no language can break, and a digest for a description"
        note="Both break rather than overflowing, and the whole string stays in the DOM and findable by a page search. The necessity word never breaks: it is the one part of a label that is always a word."
      >
        <Measure>
          <Field labelPlacement="side" required requiredMark="text">
            <FieldLabel lang="de">Kraftfahrzeug-Haftpflichtversicherungsnummer</FieldLabel>
            <FieldControl />
            <FieldDescription>
              sha256:9f2b7c41a8d3e05f6c1b4a97e2d80f3c5b6a1d4e7f0938271a6b5c4d3e2f1a09
            </FieldDescription>
          </Field>
        </Measure>
      </Scene>
      <Scene
        label="The same field, mirrored"
        note="Every distance is logical, so the label, the marker and the counter change sides together. Switch the toolbar to rtl and the two fields here read the same way round."
      >
        <Field dir="rtl" invalid lang="ar">
          <FieldLabel>رقم التعريف الضريبي</FieldLabel>
          <FieldCounter>3/14</FieldCounter>
          <FieldControl defaultValue="٣٠٠" />
          <FieldError prefix="خطأ:">الرقم غير مكتمل.</FieldError>
        </Field>
      </Scene>
    </Grid>
  ),
};

/** A control the library does not own, wiring itself from the field. */
function MoneyInput() {
  const field = useField();

  return (
    <input
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid === true ? true : undefined}
      data-part="control"
      defaultValue="R$ 1.250,00"
      disabled={field?.disabled}
      id={field?.ids.control}
      inputMode="decimal"
    />
  );
}

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="One decision for every field in the application"
        note="The provider sets the step, the necessity style and both words once. A field that states its own still wins, which is the same rule the control follows against the field."
      >
        <FieldDefaultsProvider
          necessityWords={{ optional: '(opcional)', required: '(obrigatório)' }}
          requiredMark="text"
          size="sm"
        >
          <Field required>
            <FieldLabel>CNPJ</FieldLabel>
            <FieldControl defaultValue="12.345.678/0001-90" />
          </Field>
          <Field>
            <FieldLabel>Inscrição estadual</FieldLabel>
            <FieldControl />
          </Field>
        </FieldDefaultsProvider>
      </Scene>
      <Scene
        label="A control of your own, and a part rendered as another element"
        note="useField hands a control the identifier and the description without a wrapper around it; render substitutes any part’s element, here turning the counter into an output."
      >
        <Field id="money">
          <FieldLabel>Valor da parcela</FieldLabel>
          <FieldCounter render={(props) => <output {...props} />}>1 de 12</FieldCounter>
          <MoneyInput />
          <FieldDescription>Debitado no dia 5 de cada mês.</FieldDescription>
        </Field>
      </Scene>
    </Grid>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Tab into the control and listen"
        note="A screen reader reads the label, then “required”, then the help, then the error — one name, one description built from two elements in a fixed order, and no asterisk read aloud."
      >
        <Field id="cnpj" invalid required>
          <FieldLabel>CNPJ</FieldLabel>
          <FieldControl defaultValue="12.345.678" />
          <FieldDescription>Somente números, com filial e dígito.</FieldDescription>
          <FieldError live="polite">Faltam seis dígitos.</FieldError>
        </Field>
      </Scene>
      <Scene
        label="Click the label, not the control"
        note="The association is explicit — for pointing at the derived identifier — so the click moves focus into the control. The implicit form, wrapping the control in the label, is the one the APG records as unreliable."
      >
        <Field id="account">
          <FieldLabel>Identificador da conta</FieldLabel>
          <FieldControl defaultValue="acc_9f2b7c41" />
          <FieldDescription>
            Clique no rótulo acima: o foco entra no campo, sem nenhum JavaScript.
          </FieldDescription>
        </Field>
      </Scene>
    </Grid>
  ),
};
