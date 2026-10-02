import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../button';
import { Text } from '../typography';
import { Alert } from './alert';
import { AlertDefaultsProvider } from './alert-defaults';
import { Grid, Scene, ShieldGlyph } from './alert-demo';
import { AlertActions, AlertContent, AlertDescription, AlertTitle } from './alert-parts';
import { REACT_ALERT_DOCS, REACT_ALERT_TOKENS } from './alert.docs';
import type { AlertTone } from './alert.types';

const TONES: readonly { tone: AlertTone; title: string; body: string }[] = [
  { tone: 'accent', title: 'Informação', body: 'Um aviso que não pede nada de ninguém.' },
  { tone: 'secondary', title: 'Nota', body: 'Uma observação sobre o que está nesta seção.' },
  { tone: 'success', title: 'Publicado', body: 'A versão 4.2 está no ar desde as 14h07.' },
  { tone: 'warning', title: 'Quase sem espaço', body: 'Restam 480 MB dos 20 GB do plano.' },
  { tone: 'danger', title: 'Não foi possível salvar', body: 'A conexão caiu antes do envio.' },
];

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_ALERT_DOCS.alert.scenes, {
    playground: Playground,
    tones: Tones,
    variants: Variants,
    reach: Reach,
    dismissal: Dismissal,
    actions: Actions,
    live: Live,
    content: Content,
    composition: Composition,
    accessibility: Accessibility,
  }) as never;

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Alert',
        description:
          'A message about the page, a section, or the thing beside it — with a mark saying how serious it is, and a region that announces the text without announcing the buttons.',
        framework: 'React',
        ...REACT_ALERT_DOCS.alert,
        tokens: REACT_ALERT_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    dismissible: true,
    hideIcon: false,
    live: 'off',
    reach: 'section',
    tone: 'warning',
    variant: 'soft',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Alert {...args}>
        <AlertContent>
          <AlertTitle>Sua assinatura expira em três dias</AlertTitle>
          <AlertDescription>
            Renove agora para manter o acesso da equipe aos projetos publicados.
          </AlertDescription>
        </AlertContent>
        <AlertActions>
          <Button size="sm" tone={args.tone ?? 'warning'}>
            Renovar
          </Button>
          <Button size="sm" tone={args.tone ?? 'warning'} variant="ghost">
            Ver planos
          </Button>
        </AlertActions>
      </Alert>
    </div>
  ),
};

export const Tones: Story = {
  parameters: scenario('tones'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The five, and the marks that carry them"
        note="Each tone draws the glyph the contract maps it to, so an error and a note differ by silhouette as well as by colour."
      >
        {TONES.map(({ body, title, tone }) => (
          <Alert key={tone} tone={tone}>
            <AlertContent>
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription>{body}</AlertDescription>
            </AlertContent>
          </Alert>
        ))}
      </Scene>
      <Scene
        label="The same five with no colour at all"
        note="Switch the toolbar to high-contrast: every ground becomes the page’s own white and every border black, and the mark is the only thing left telling the five apart."
      >
        {TONES.map(({ title, tone }) => (
          <Alert key={tone} tone={tone} variant="outline">
            <AlertContent>
              <AlertTitle>{title}</AlertTitle>
            </AlertContent>
          </Alert>
        ))}
      </Scene>
    </Grid>
  ),
};

export const Variants: Story = {
  parameters: scenario('variants'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="On the page’s own surface"
        note="soft carries the tone’s surface and its border — the border is what keeps the box present in high-contrast, where the tinted grounds collapse to white."
      >
        <Alert tone="danger" variant="soft">
          <AlertContent>
            <AlertDescription>soft — a superfície do tom, com a borda do tom.</AlertDescription>
          </AlertContent>
        </Alert>
        <Alert tone="danger" variant="outline">
          <AlertContent>
            <AlertDescription>outline — sem fundo próprio, só a borda.</AlertDescription>
          </AlertContent>
        </Alert>
        <Alert tone="danger" variant="solid">
          <AlertContent>
            <AlertDescription>solid — o preenchimento do tom.</AlertDescription>
          </AlertContent>
        </Alert>
      </Scene>
      <Scene
        label="In a region that states its own scheme"
        note="A dark ground is a scheme rather than a surface: state data-slotted-scheme on the region and every tone role is restated, so outline reads there too."
      >
        <div
          className="slotted-demo-surface"
          data-flow="stack"
          data-slotted-scheme="dark"
          data-surface="scheme"
        >
          <Alert tone="success" variant="soft">
            <AlertContent>
              <AlertDescription>soft, numa região com esquema próprio.</AlertDescription>
            </AlertContent>
          </Alert>
          <Alert tone="success" variant="outline">
            <AlertContent>
              <AlertDescription>outline, na mesma região.</AlertDescription>
            </AlertContent>
          </Alert>
        </div>
      </Scene>
    </Grid>
  ),
};

export const Reach: Story = {
  parameters: scenario('reach'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="inline, section, page"
        note="The insets, the corner and the type step with the scope. A page banner draws no corner and no inline edge, because it runs to both edges of what holds it."
      >
        <Alert reach="inline" tone="danger">
          <AlertContent>
            <AlertDescription>Informe um CNPJ válido para continuar.</AlertDescription>
          </AlertContent>
        </Alert>
        <Alert reach="section">
          <AlertContent>
            <AlertTitle>Sobre os fusos horários</AlertTitle>
            <AlertDescription>
              Os horários abaixo são exibidos no fuso da sua conta, não no do servidor.
            </AlertDescription>
          </AlertContent>
        </Alert>
        <Alert dismissible reach="page" tone="warning">
          <AlertContent>
            <AlertTitle>Manutenção programada para domingo</AlertTitle>
            <AlertDescription>
              O serviço ficará indisponível das 02h às 04h (UTC−3).
            </AlertDescription>
          </AlertContent>
          <AlertActions>
            <Button size="sm" tone="warning" variant="outline">
              Detalhes
            </Button>
          </AlertActions>
        </Alert>
      </Scene>
    </Grid>
  ),
};

function Controlled() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Alert dismissible onOpenChange={setOpen} open={open} tone="success">
        <AlertContent>
          <AlertTitle>Relatório pronto</AlertTitle>
          <AlertDescription>A aplicação é quem tira esta mensagem da tela.</AlertDescription>
        </AlertContent>
      </Alert>
      <Button onClick={() => setOpen(true)} size="sm" variant="outline">
        Mostrar de novo
      </Button>
    </>
  );
}

function Refused() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <>
      <Alert
        dismissible
        onOpenChange={(_open, request) => {
          if (!confirmed) request.cancel();
        }}
        tone="danger"
      >
        <AlertContent>
          <AlertTitle>Três alterações não salvas</AlertTitle>
          <AlertDescription>
            {confirmed
              ? 'Confirmado: agora o X fecha a mensagem.'
              : 'O X pede, e a aplicação recusa até que a saída seja confirmada.'}
          </AlertDescription>
        </AlertContent>
      </Alert>
      <Button onClick={() => setConfirmed(true)} size="sm" variant="outline">
        Confirmar
      </Button>
    </>
  );
}

export const Dismissal: Story = {
  parameters: scenario('dismissal'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="It owns its own openness"
        note="No state anywhere: the message closes itself, keeps its element, and drops data-open. Not one of the ten surveyed implementations ships this half."
      >
        <Alert dismissible>
          <AlertContent>
            <AlertTitle>Modo de leitura ativado</AlertTitle>
            <AlertDescription>Nada nesta página pode ser editado.</AlertDescription>
          </AlertContent>
        </Alert>
      </Scene>
      <Scene
        label="The application owns it"
        note="Passing open decides the mode for good, and the family then only asks — which is what lets the same message be brought back."
      >
        <Controlled />
      </Scene>
      <Scene
        label="The request is refused"
        note="request.cancel() stops the change before it commits, so a confirmation flow keeps the message and the keyboard exactly where they were."
      >
        <Refused />
      </Scene>
    </Grid>
  ),
};

export const Actions: Story = {
  parameters: scenario('actions'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Beside the message it belongs to"
        note="The controls are the consumer’s own Buttons in a part outside the live region, so a reader hearing the message is not read two button labels inside it."
      >
        <Alert dismissible tone="warning">
          <AlertContent>
            <AlertTitle>Sua assinatura expira em três dias</AlertTitle>
            <AlertDescription>Renove para manter o acesso da equipe.</AlertDescription>
          </AlertContent>
          <AlertActions>
            <Button size="sm" tone="warning">
              Renovar
            </Button>
            <Button size="sm" tone="warning" variant="ghost">
              Ver planos
            </Button>
          </AlertActions>
        </Alert>
      </Scene>
      <Scene
        label="In a column too narrow for two"
        note="Past the family’s own container breakpoint the row becomes a column, and each control keeps its own width — how wide a button is belongs to the button."
      >
        <div className="slotted-demo-measure">
          <Alert dismissible tone="warning">
            <AlertContent>
              <AlertTitle>Sua assinatura expira</AlertTitle>
              <AlertDescription>Renove para manter o acesso.</AlertDescription>
            </AlertContent>
            <AlertActions>
              <Button size="sm" tone="warning">
                Renovar
              </Button>
              <Button size="sm" tone="warning" variant="ghost">
                Ver planos
              </Button>
            </AlertActions>
          </Alert>
        </div>
      </Scene>
    </Grid>
  ),
};

function Announced() {
  const [messages, setMessages] = useState<number[]>([]);

  return (
    <>
      <Button onClick={() => setMessages((all) => [...all, all.length + 1])} size="sm">
        Salvar
      </Button>
      {messages.map((index) => (
        <Alert dismissible key={index} live="polite" tone="success">
          <AlertContent>
            <AlertTitle>Alterações salvas</AlertTitle>
            <AlertDescription>Tentativa {index}.</AlertDescription>
          </AlertContent>
        </Alert>
      ))}
    </>
  );
}

export const Live: Story = {
  parameters: scenario('live'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Already on the page"
        note="live is off, and the APG says why: a screen reader does not inform anyone of an alert that was present before the page finished loading."
      >
        <Alert>
          <AlertContent>
            <AlertTitle>Sobre os fusos horários</AlertTitle>
            <AlertDescription>Nada aqui é anunciado, porque nada aqui mudou.</AlertDescription>
          </AlertContent>
        </Alert>
      </Scene>
      <Scene
        label="Arriving while the reader is elsewhere"
        note="Press Salvar with a screen reader running: role=status is on the text alone, so the message is read and the dismiss control beside it is not."
      >
        <Announced />
      </Scene>
    </Grid>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Long, and in another language"
        note="A German compound wraps to a second line and the mark stays on the first, because the mark is one line box tall rather than centred on the whole message."
      >
        <Alert dismissible tone="warning">
          <AlertContent>
            <AlertTitle>Die Zahlungsbestätigung konnte nicht zugestellt werden</AlertTitle>
            <AlertDescription>
              A tentativa de entrega falhou porque o endereço de cobrança registrado não corresponde
              ao endereço informado pela instituição financeira.
            </AlertDescription>
          </AlertContent>
        </Alert>
      </Scene>
      <Scene
        label="A string no language can break"
        note="A container digest breaks inside itself rather than running out of the box, and nothing is removed: the whole string stays in the DOM and a page search still finds it."
      >
        <div className="slotted-demo-measure">
          <Alert tone="danger">
            <AlertContent>
              <AlertTitle>O deploy falhou</AlertTitle>
              <AlertDescription>
                sha256:9f2c4ab1de77c0d5e8b3a6f41c9d0e72b58a4437cc61de09f2a3b7d1e40c5a86
              </AlertDescription>
            </AlertContent>
          </Alert>
        </div>
      </Scene>
      <Scene
        label="No mark, and no description"
        note="Both parts are optional and the box has no empty row for either: the rhythm is each part’s own distance rather than a gap the grid reserves."
      >
        <Alert hideIcon tone="secondary" variant="outline">
          <AlertContent>
            <AlertTitle>Sem marca nenhuma</AlertTitle>
            <AlertDescription>
              Um callout editorial que traz a sua própria ilustração no corpo.
            </AlertDescription>
          </AlertContent>
        </Alert>
        <Alert dismissible tone="success">
          <AlertContent>
            <AlertTitle>Tudo salvo</AlertTitle>
          </AlertContent>
        </Alert>
      </Scene>
    </Grid>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="One decision for the application"
        note="The provider sets the tone, the painting and the reach once; a message that states any of them still wins."
      >
        <AlertDefaultsProvider reach="inline" tone="secondary">
          <Alert dismissible>
            <AlertContent>
              <AlertDescription>Herda tudo do provider.</AlertDescription>
            </AlertContent>
          </Alert>
          <Alert dismissible tone="danger">
            <AlertContent>
              <AlertDescription>Diz o próprio tom, e ganha.</AlertDescription>
            </AlertContent>
          </Alert>
        </AlertDefaultsProvider>
      </Scene>
      <Scene
        label="Another element for a part"
        note="render substitutes the element and hands it every data attribute, so a title becomes a real heading when the page wants the message in its outline."
      >
        <Alert render={(props) => <aside {...props} />}>
          <AlertContent>
            <AlertTitle render={(props) => <h3 {...props} />}>Manutenção</AlertTitle>
            <AlertDescription>A caixa é um aside; o título é um h3.</AlertDescription>
          </AlertContent>
        </Alert>
      </Scene>
      <Scene
        label="The page’s own mark"
        note="icon replaces the tone’s glyph and keeps its box, its size and its place on the first line — the Angular binding projects an element carrying slAlertIcon instead."
      >
        <Alert icon={<ShieldGlyph />} tone="accent">
          <AlertContent>
            <AlertTitle>Verificação em duas etapas</AlertTitle>
            <AlertDescription>A arte é da aplicação; a caixa é da família.</AlertDescription>
          </AlertContent>
        </Alert>
      </Scene>
    </Grid>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A landmark, and a region inside it"
        note="With a title the box is a region a reader can jump to; without one it is a plain grouping element, because a section named by nothing is named by nothing."
      >
        <Alert live="polite">
          <AlertContent>
            <AlertTitle>Manutenção</AlertTitle>
            <AlertDescription>Região “Manutenção”, com um status dentro dela.</AlertDescription>
          </AlertContent>
        </Alert>
        <Alert>
          <AlertContent>
            <AlertDescription>Sem título: agrupamento simples, sem landmark.</AlertDescription>
          </AlertContent>
        </Alert>
      </Scene>
      <Scene
        label="Where the keyboard goes"
        note="Tab to the button, then into the message, then close it: focus returns to the button rather than falling to the top of the page."
      >
        <Text>Tab até aqui, depois até o X, e feche a mensagem.</Text>
        <Button size="sm" variant="outline">
          Antes da mensagem
        </Button>
        <Alert dismissible tone="danger">
          <AlertContent>
            <AlertTitle>Não foi possível salvar</AlertTitle>
          </AlertContent>
        </Alert>
      </Scene>
    </Grid>
  ),
};
