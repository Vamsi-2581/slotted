import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';

import { Button } from '../button';
import { Link } from '../link';
import { InlineMessage } from './inline-message';
import { InlineMessageDefaultsProvider } from './inline-message-defaults';
import { Grid, LabelledInput, Scene, ShieldGlyph } from './inline-message-demo';
import { REACT_INLINE_MESSAGE_DOCS, REACT_INLINE_MESSAGE_TOKENS } from './inline-message.docs';
import type { InlineMessageTone } from './inline-message.types';

const TONES: readonly { tone: InlineMessageTone; message: string }[] = [
  { tone: 'secondary', message: 'Entre 8 e 64 caracteres, com ao menos um número.' },
  { tone: 'accent', message: 'Este endereço será usado também para a cobrança.' },
  { tone: 'success', message: 'Nome de usuário disponível.' },
  { tone: 'warning', message: 'A senha é válida, mas fácil de adivinhar.' },
  { tone: 'danger', message: 'Este e-mail já está cadastrado.' },
];

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_INLINE_MESSAGE_DOCS.inlineMessage.scenes, {
    playground: Playground,
    tones: Tones,
    sizes: Sizes,
    pending: Pending,
    wiring: Wiring,
    live: Live,
    reserve: Reserve,
    content: Content,
    composition: Composition,
    accessibility: Accessibility,
  }) as never;

const meta = {
  title: 'Components/Inline Message',
  component: InlineMessage,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Inline Message',
        description:
          'One sentence about a field, a section or an action — with a mark saying how serious it is, and the same severity in a word a screen reader reads before the message.',
        framework: 'React',
        ...REACT_INLINE_MESSAGE_DOCS.inlineMessage,
        tokens: REACT_INLINE_MESSAGE_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof InlineMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: 'Informe um CNPJ válido para continuar.',
    hideIcon: false,
    live: 'off',
    loading: false,
    reserve: false,
    size: 'sm',
    tone: 'danger',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <InlineMessage {...args} />
    </div>
  ),
};

export const Tones: Story = {
  parameters: scenario('tones'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Four severities and one absence of one"
        note="secondary is help: no mark, no severity word, and the neutral muted ink rather than a tone’s label colour, which under a field reads as loud as the label above it."
      >
        {TONES.map(({ message, tone }) => (
          <InlineMessage key={tone} tone={tone}>
            {message}
          </InlineMessage>
        ))}
      </Scene>
      <Scene
        label="The same five with no colour at all"
        note="Switch the toolbar to high-contrast, or read this in greyscale: the silhouette is what is left telling an error from a note, and the hidden word is what a reader hears."
      >
        {TONES.map(({ tone }) => (
          <InlineMessage key={tone} tone={tone}>
            {`tone="${tone}"`}
          </InlineMessage>
        ))}
      </Scene>
    </Grid>
  ),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The message of a field, and of a section"
        note="sm sits under a control and stays quieter than it; md is for a message about a whole section, where there is no control beside it to be quieter than."
      >
        <InlineMessage size="sm" tone="danger">
          sm — a mensagem de um campo.
        </InlineMessage>
        <InlineMessage size="md" tone="danger">
          md — a mensagem de uma seção inteira.
        </InlineMessage>
      </Scene>
      <Scene
        label="Both answer the density switch"
        note="Set the toolbar to dense: type and mark step down together, because both read the control scales, which are the only ones the theme restates per density."
      >
        <InlineMessage size="md" tone="success">
          A fatura de março foi paga.
        </InlineMessage>
        <InlineMessage size="sm">O valor inclui os impostos do estado de destino.</InlineMessage>
      </Scene>
    </Grid>
  ),
};

function Availability() {
  const [state, setState] = useState<'checking' | 'free' | 'taken'>('checking');

  return (
    <>
      <InlineMessage
        live="polite"
        loading={state === 'checking'}
        tone={state === 'free' ? 'success' : state === 'taken' ? 'danger' : 'secondary'}
      >
        {state === 'checking'
          ? 'Verificando disponibilidade…'
          : state === 'free'
            ? 'Nome disponível.'
            : 'Este nome já está em uso.'}
      </InlineMessage>
      <Button onClick={() => setState('free')} size="sm" variant="outline">
        Responder disponível
      </Button>
      <Button onClick={() => setState('checking')} size="sm" variant="ghost">
        Verificar de novo
      </Button>
    </>
  );
}

export const Pending: Story = {
  parameters: scenario('pending'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The check, and the answer it becomes"
        note="Press the buttons: the ring is replaced by a mark and the tone changes, and nothing else moves — the box was the same size while it was waiting."
      >
        <Availability />
      </Scene>
      <Scene
        label="A wait at either step"
        note="The ring takes the mark’s box at both sizes and both tones, so a pending message under a dense table is the same shape as the answer that replaces it."
      >
        <InlineMessage loading size="sm">
          Verificando disponibilidade…
        </InlineMessage>
        <InlineMessage loading size="md" tone="accent">
          Enviando o arquivo para o servidor…
        </InlineMessage>
      </Scene>
    </Grid>
  ),
};

function WiredField() {
  const messageId = useId();

  return (
    <LabelledInput defaultValue="12.345.678/0001-9" invalid label="CNPJ" messageId={messageId}>
      <InlineMessage id={messageId} tone="danger">
        Faltam dois dígitos.
      </InlineMessage>
    </LabelledInput>
  );
}

function HintedField() {
  const messageId = useId();

  return (
    <LabelledInput label="Razão social" messageId={messageId}>
      <InlineMessage id={messageId}>Como consta no cartão CNPJ.</InlineMessage>
    </LabelledInput>
  );
}

export const Wiring: Story = {
  parameters: scenario('wiring'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="An error the control points at"
        note="aria-invalid on the control and aria-errormessage at the message’s id are what carry the message to a screen reader; without them a red sentence is decoration."
      >
        <WiredField />
      </Scene>
      <Scene
        label="A hint the control is described by"
        note="The same wiring with aria-describedby instead, because a hint is not an error — and the family generates the id either way when the page states none."
      >
        <HintedField />
      </Scene>
    </Grid>
  ),
};

function Announced() {
  const [saves, setSaves] = useState(0);

  return (
    <>
      <Button onClick={() => setSaves((count) => count + 1)} size="sm">
        Salvar
      </Button>
      {saves === 0 ? null : (
        <InlineMessage live="polite" tone="success">
          Alterações salvas. Tentativa {saves}.
        </InlineMessage>
      )}
    </>
  );
}

export const Live: Story = {
  parameters: scenario('live'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Already on the page"
        note="live is off, and the APG says why: a screen reader does not inform anyone of a message that was present before the page finished loading."
      >
        <InlineMessage>Usamos o CNPJ apenas para emitir a nota fiscal.</InlineMessage>
      </Scene>
      <Scene
        label="Arriving while the reader is elsewhere"
        note="Press Salvar with a screen reader running: role=status is on the message itself, because there is no control inside it to keep out of the region."
      >
        <Announced />
      </Scene>
    </Grid>
  ),
};

function ReservedField({ error }: { error?: string }) {
  const messageId = useId();

  return (
    <LabelledInput
      defaultValue={error === undefined ? '12.345.678/0001-90' : '12.345.678/0001-9'}
      invalid={error !== undefined}
      label="CNPJ"
      messageId={messageId}
    >
      <InlineMessage id={messageId} reserve tone="danger">
        {error}
      </InlineMessage>
    </LabelledInput>
  );
}

export const Reserve: Story = {
  parameters: scenario('reserve'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Nothing to say, and the line still there"
        note="Both fields render the message unconditionally; only the right one has an error. Compare the two Razão social labels — they sit at the same height, which is the whole point."
      >
        <ReservedField />
        <LabelledInput defaultValue="Acme Ltda" label="Razão social" messageId="reserve-empty-next">
          <InlineMessage>Como consta no cartão CNPJ.</InlineMessage>
        </LabelledInput>
      </Scene>
      <Scene
        label="The same two with the error present"
        note="The mark and the hidden severity word appear with the sentence and withdraw with it, so an empty reserved message is a held line rather than a stranded icon."
      >
        <ReservedField error="Faltam dois dígitos." />
        <LabelledInput defaultValue="Acme Ltda" label="Razão social" messageId="reserve-full-next">
          <InlineMessage>Como consta no cartão CNPJ.</InlineMessage>
        </LabelledInput>
      </Scene>
    </Grid>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={3}>
      <Scene
        label="Long, and in another language"
        note="A German compound wraps to three lines and the mark stays on the first, because the mark’s box is one line box tall rather than centred on the whole message."
      >
        <InlineMessage tone="warning">
          Die Zahlungsbestätigung konnte nicht zugestellt werden, weil die hinterlegte
          Rechnungsadresse nicht mit der Adresse der Bank übereinstimmt.
        </InlineMessage>
      </Scene>
      <Scene
        label="A string no language can break"
        note="A container digest breaks inside itself rather than running out of the message, and nothing is removed: the whole string stays in the DOM and a page search still finds it."
      >
        <div className="slotted-demo-measure">
          <InlineMessage tone="danger">
            sha256:9f2c4ab1de77c0d5e8b3a6f41c9d0e72b58a4437cc61de09f2a3b7d1e40c5a86
          </InlineMessage>
        </div>
      </Scene>
      <Scene
        label="A link inside the sentence, and the page’s own mark"
        note="The message is one grid item rather than two, so a link in the middle of it wraps with the words around it instead of being placed in a column of its own."
      >
        <InlineMessage>
          Aceitamos cartão, boleto e Pix. <Link href="#tarifas">Ver tarifas</Link>
        </InlineMessage>
        <InlineMessage icon={<ShieldGlyph />} tone="accent">
          A verificação em duas etapas protege esta conta.
        </InlineMessage>
      </Scene>
    </Grid>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={3}>
      <Scene
        label="One decision for the application"
        note="The provider replaces the severity words once and merges over the shipped table, so writing danger alone leaves warning and success exactly where they were."
      >
        <InlineMessageDefaultsProvider prefixes={{ danger: 'Erro:', warning: 'Atenção:' }}>
          <InlineMessage tone="danger">Ouvido como “Erro: este e-mail já existe.”</InlineMessage>
          <InlineMessage tone="warning">Ouvido como “Atenção: a senha é fraca.”</InlineMessage>
          <InlineMessage tone="success">
            Ouvido como “Success: …”, porque só duas palavras foram trocadas.
          </InlineMessage>
        </InlineMessageDefaultsProvider>
      </Scene>
      <Scene
        label="Another element for the message"
        note="render substitutes the element and hands it every data attribute, which is how one message carries a list of failures instead of a sentence."
      >
        <InlineMessage render={(props) => <div {...props} />} tone="danger">
          A caixa é um div; tudo o mais é igual.
        </InlineMessage>
      </Scene>
      <Scene
        label="The page’s own mark, and none at all"
        note="icon keeps the box, the colour and the place on the first line; hideIcon removes the box and leaves the severity word, because that is what a reader hears."
      >
        <InlineMessage icon={<ShieldGlyph />} tone="accent">
          A arte é da aplicação; a caixa é da família.
        </InlineMessage>
        <InlineMessage hideIcon tone="danger">
          Sem marca nenhuma, e ainda anunciado como erro.
        </InlineMessage>
      </Scene>
    </Grid>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="What a screen reader reads"
        note="Each of these announces its severity as a word before the sentence — “Error: …”, “Warning: …” — which is the only part of the severity that reaches a reader who cannot see it."
      >
        <InlineMessage tone="danger">Informe um CNPJ válido.</InlineMessage>
        <InlineMessage tone="warning">A senha é válida, mas fácil de adivinhar.</InlineMessage>
        <InlineMessage tone="success">Nome de usuário disponível.</InlineMessage>
      </Scene>
      <Scene
        label="Two ways to change the word"
        note="One message can say its own, and the empty string removes it — for a sentence like the last one here, which already names the severity in its first word."
      >
        <InlineMessage prefix="Erro:" tone="danger">
          Anunciado como “Erro: informe um CNPJ válido.”
        </InlineMessage>
        <InlineMessage prefix="" tone="danger">
          Erro: informe um CNPJ válido.
        </InlineMessage>
        <InlineMessage disabled tone="danger">
          Desativado: a tinta é medida, não é opacidade.
        </InlineMessage>
      </Scene>
    </Grid>
  ),
};
