import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';

import { Button } from '../button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../field';
import { Textarea } from './textarea';
import { TextareaDefaultsProvider } from './textarea-defaults';
import { Grid, Measure, Scene } from './textarea-demo';
import { REACT_TEXTAREA_DOCS, REACT_TEXTAREA_TOKENS } from './textarea.docs';

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSJ9';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_TEXTAREA_DOCS.textarea.scenes, {
    playground: Playground,
    sizes: Sizes,
    variants: Variants,
    'auto-size': AutoSize,
    resize: Resize,
    states: States,
    count: Count,
    content: Content,
    composition: Composition,
    keyboard: Keyboard,
  }) as never;

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Textarea',
        description:
          'Many lines of text, in the element that already holds them — with a floor, a ceiling and a platform that grows the box without measuring anything on the main thread.',
        framework: 'React',
        ...REACT_TEXTAREA_DOCS.textarea,
        tokens: REACT_TEXTAREA_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    autoSize: false,
    maxRows: 8,
    mono: false,
    resize: 'block',
    rows: 3,
    size: 'md',
    variant: 'outline',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Field>
        <FieldLabel>Observações</FieldLabel>
        <Textarea {...args} placeholder="Descreva o que aconteceu" />
        <FieldDescription>Aparece no histórico do chamado.</FieldDescription>
      </Field>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The three steps on their own"
        note="The block padding is derived from the control height and the control’s own line box, so a one-row textarea is exactly as tall as an input of the same step at every density."
        layout="stack"
      >
        <Textarea defaultValue="Compacto" rows={2} size="sm" />
        <Textarea defaultValue="Padrão" rows={2} size="md" />
        <Textarea defaultValue="Confortável" rows={2} size="lg" />
      </Scene>
      <Scene
        label="Inside a field, the field decides"
        note="A small field holding a medium control is a field and a control disagreeing about one row, so the control reads the field’s step before its own provider’s."
        layout="stack"
      >
        <Field size="sm">
          <FieldLabel>Nota interna</FieldLabel>
          <Textarea defaultValue="Retirar na doca 3." rows={2} />
        </Field>
        <Field size="lg">
          <FieldLabel>Descrição pública</FieldLabel>
          <Textarea defaultValue="Entrega em até dois dias úteis." rows={2} />
        </Field>
      </Scene>
    </Grid>
  ),
};

export const Variants: Story = {
  parameters: scenario('variants'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A frame that takes the ground it is placed on"
        note="outline paints no ground of its own and subtle sinks into the page, so the same control reads correctly on a page, inside a card and inside a sunken panel."
        layout="stack"
      >
        <Textarea defaultValue="outline" rows={2} />
        <Textarea defaultValue="subtle" rows={2} variant="subtle" />
      </Scene>
      <Scene
        label="No border until it is used, and a payload in monospace"
        note="plain keeps exactly the same box and shows its edge on hover, and mono sets the value in the monospaced family with tabular figures for a payload or a template."
        layout="stack"
      >
        <Textarea defaultValue="plain" rows={2} variant="plain" />
        <Textarea
          defaultValue={'{ "pedido": 20260442, "status": "pendente" }'}
          mono
          rows={2}
          variant="subtle"
        />
      </Scene>
    </Grid>
  ),
};

export const AutoSize: Story = {
  parameters: scenario('auto-size'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="One row until there is more to say"
        note="Type into it: the box grows a line at a time and stops at four, then scrolls. Nothing is measured on the main thread — the whole behaviour is one CSS declaration."
        layout="stack"
      >
        <Textarea autoSize maxRows={4} placeholder="Comece a escrever" rows={1} />
        <Textarea
          autoSize
          defaultValue="O controle cresce com o conteúdo até o teto de quatro linhas e passa a rolar depois dele, em vez de empurrar a página para fora de baixo do cursor."
          maxRows={4}
          rows={1}
        />
      </Scene>
      <Scene
        label="A ceiling that cannot be forgotten"
        note="maxRows defaults to twelve rather than to nothing, because a control that grows forever pushes the page out from under the caret — the defect every auto-grow implementation ships first."
        layout="stack"
      >
        <Textarea autoSize defaultValue="Sem teto declarado: o padrão vale." rows={1} />
        <Textarea defaultValue="Sem auto-size: a altura é a que rows dá." rows={3} />
      </Scene>
    </Grid>
  ),
};

export const Resize: Story = {
  parameters: scenario('resize'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Three axes, and the one that is safe"
        note="Drag the corner of each: block only grows downward, none offers no handle at all, and both also widens — which is offered and is not the default, because a control wider than its field breaks the field’s grid."
        layout="stack"
      >
        <Textarea defaultValue="block" resize="block" rows={2} />
        <Textarea defaultValue="none" resize="none" rows={2} />
        <Textarea defaultValue="both" resize="both" rows={2} />
      </Scene>
      <Scene
        label="A control that sizes itself keeps no handle"
        note="The two would disagree on the next keystroke: the handle fixes a height and field-sizing computes one. autoSize wins, and the handle is withdrawn rather than left to fight."
        layout="stack"
      >
        <Textarea autoSize defaultValue="autoSize com resize both pedido" resize="both" rows={1} />
        <Textarea defaultValue="Somente leitura mantém a alça" readOnly rows={2} />
      </Scene>
    </Grid>
  ),
};

export const States: Story = {
  parameters: scenario('states'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Invalid, and what says so besides the border"
        note="The border is the quietest part of it: aria-invalid announces the state and the field’s error says it in words, because in the high-contrast scheme the border cannot carry it at all."
        layout="stack"
      >
        <Field invalid>
          <FieldLabel>Motivo da devolução</FieldLabel>
          <Textarea defaultValue="Faltam os dados da transportadora." rows={2} />
          <FieldError>Informe o CNPJ da transportadora.</FieldError>
        </Field>
      </Scene>
      <Scene
        label="Read-only keeps its handle; disabled does not"
        note="The commonest thing a read-only textarea holds is a value someone has to copy, so its ink does not change and its handle stays. A handle on a control nobody can type in is a handle that lies."
        layout="stack"
      >
        <Textarea
          defaultValue="Somente leitura: o valor continua selecionável."
          readOnly
          rows={2}
        />
        <Textarea defaultValue="Desativado" disabled rows={2} />
      </Scene>
    </Grid>
  ),
};

export const Count: Story = {
  parameters: scenario('count'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A count bound to the value"
        note="The control counts and the field draws it in the spare column of the label row, so a count that appears on the first keystroke never shares a row with the error and pushes it down."
        layout="stack"
      >
        <Field>
          <FieldLabel>Observações</FieldLabel>
          <Textarea
            autoSize
            defaultValue="Retirar na doca 3, das 8h às 11h."
            maxLength={280}
            rows={2}
            showCount
          />
          <FieldDescription>Vai junto com a nota.</FieldDescription>
        </Field>
      </Scene>
      <Scene
        label="A limit the browser does not enforce"
        note="countMax without maxLength is a soft limit: the value may pass it, and the counter turns red before validation has run — which is the only moment the count is being read."
        layout="stack"
      >
        <Field>
          <FieldLabel>Resumo</FieldLabel>
          <Textarea
            countMax={40}
            defaultValue="Este resumo já passou do limite pedido."
            rows={2}
            showCount
          />
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
        label="A token with no break in it"
        note="A signed URL, a certificate or a container digest wraps inside the control instead of taking the page’s horizontal scrollbar with it, and the whole string stays in the value."
        layout="stack"
      >
        <Textarea defaultValue={JWT} rows={3} />
        <Textarea placeholder="Descreva o ocorrido com o máximo de detalhes possível" rows={3} />
      </Scene>
      <Scene
        label="At 240 pixels, and in the other direction"
        note="The control never refuses to shrink, so a comment box in a drawer as narrow as a phone reflows rather than overflowing, and the mirrored layout is the same component."
        layout="stack"
      >
        <Measure>
          <Textarea defaultValue="Uma nota escrita em uma gaveta estreita." rows={3} />
        </Measure>
        <Measure>
          <Textarea
            defaultValue="مرحبا بالعالم. هذا نص طويل بما يكفي لينتقل إلى السطر التالي."
            dir="rtl"
            rows={3}
          />
        </Measure>
      </Scene>
    </Grid>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => <CompositionScenes />,
};

function CompositionScenes() {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <Grid columns={2}>
      <Scene
        label="Four decisions an application takes once"
        note="The provider carries the appearance and the handle, so a form of twenty controls repeats none of them. A control that states one itself still wins."
        layout="stack"
      >
        <TextareaDefaultsProvider resize="none" variant="subtle">
          <Textarea autoSize defaultValue="Herdado do provider" rows={2} />
          <Textarea defaultValue="Escolhido aqui" resize="block" rows={2} variant="outline" />
        </TextareaDefaultsProvider>
      </Scene>
      <Scene
        label="Reaching the element, and belonging to a form"
        note="ref reaches the textarea, which already has focus, select and setSelectionRange; name and form are the element’s own, so the value is submitted with everything else."
        layout="stack"
      >
        <Textarea
          defaultValue="Clique para selecionar tudo"
          onFocus={() => ref.current?.select()}
          ref={ref}
          rows={2}
        />
        <Textarea name="notes" placeholder="name=notes" rows={2} />
      </Scene>
    </Grid>
  );
}

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Enter makes a line, and the button submits"
        note="Press Enter inside the control: it adds a line and the form stays where it is. Press Tab: focus leaves rather than inserting a tab, so nobody is held inside a comment box."
        layout="stack"
      >
        <form onSubmit={(event) => event.preventDefault()}>
          <Field>
            <FieldLabel>Comentário</FieldLabel>
            <Textarea autoSize maxRows={6} name="notes" rows={2} />
            <FieldDescription>Enter cria uma linha; o botão envia.</FieldDescription>
          </Field>
          <Button type="submit">Enviar</Button>
        </form>
      </Scene>
    </Grid>
  ),
};
