import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Presentation, X } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { Card, CardBody, CardHeader } from '../card';
import { Grid, Measure, Scene } from '../field/field-demo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { Sparkline } from '../sparkline';
import { Heading, Text } from '../typography';
import { Fullscreen, FullscreenTrigger } from './fullscreen';
import { FullscreenDefaultsProvider } from './fullscreen-defaults';
import { REACT_FULLSCREEN_DOCS, REACT_FULLSCREEN_TOKENS } from './fullscreen.docs';
import type { FullscreenError, FullscreenProps } from './fullscreen.types';
import { useFullscreen } from './use-fullscreen';

const REVENUE = [412, 468, 431, 522, 497, 588];

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_FULLSCREEN_DOCS.fullscreen.scenes, {
    playground: Playground,
    layout: Layout,
    controlled: Controlled,
    error: ErrorState,
    overlays: Overlays,
    document: DocumentRegion,
    keyboard: Keyboard,
    trigger: Trigger,
    iconOnly: IconOnly,
    outside: Outside,
    composition: Composition,
  });

const meta = {
  title: 'Components/Fullscreen',
  component: Fullscreen,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Fullscreen',
        description:
          'A region the reader can give the whole screen — by the Fullscreen API where the page may ask, fixed over the page where it may not — and the control whose words and mark follow the state. Escape in native full screen stays the browser’s.',
        framework: 'React',
        ...REACT_FULLSCREEN_DOCS.fullscreen,
        tokens: REACT_FULLSCREEN_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Fullscreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The consumer's panel: a card with a title, a figure and a chart. */
function RevenuePanel({
  children,
  control = <FullscreenTrigger iconOnly />,
}: {
  children?: ReactNode;
  control?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="slotted-demo-row">
          <Heading level={3} size="lg">
            Receita por mês
          </Heading>
          {control}
        </div>
        <Text size="sm" tone="muted">
          Jan – Jun 2026 · R$ mil · R$ 2,9 mi no semestre
        </Text>
      </CardHeader>
      <CardBody>
        <Sparkline aria-label="Receita de janeiro a junho" data={REVENUE} size="lg" type="bar" />
        {children}
      </CardBody>
    </Card>
  );
}

export const Playground: Story = {
  args: { mode: 'auto', navigationUI: 'auto', defaultFullscreen: false },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args: FullscreenProps) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Fullscreen {...args}>
        <RevenuePanel />
      </Fullscreen>
    </div>
  ),
};

export const Layout: Story = {
  parameters: scenario('layout'),
  render: () => (
    <Scene
      label="mode=layout"
      note="Press the control: the panel is fixed over this page, the page stops scrolling, and Escape or the control gives it back."
    >
      <Fullscreen mode="layout">
        <RevenuePanel control={<FullscreenTrigger variant="outline" />} />
      </Fullscreen>
    </Scene>
  ),
};

function ControlledPanel() {
  const [presenting, setPresenting] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  return (
    <>
      <Fullscreen
        fullscreen={presenting}
        onFullscreenChange={(next, request) => {
          setLog((entries) => [`${next ? 'enter' : 'exit'} · ${request.reason}`, ...entries]);
          setPresenting(next);
        }}
      >
        <RevenuePanel />
      </Fullscreen>
      <Text size="sm" tone="muted">
        {log.length === 0 ? 'Nenhum pedido ainda.' : log.slice(0, 4).join(' — ')}
      </Text>
    </>
  );
}

export const Controlled: Story = {
  parameters: scenario('controlled'),
  render: () => (
    <Scene
      label="fullscreen + onFullscreenChange"
      note="The page holds the value; the line under the panel prints the reason of every request, escape included."
    >
      <ControlledPanel />
    </Scene>
  ),
};

function RefusedPanel() {
  const [error, setError] = useState<FullscreenError | null>(null);
  return (
    <>
      <Fullscreen onFullscreenError={setError}>
        <RevenuePanel />
      </Fullscreen>
      <Text size="sm" tone="muted">
        {error === null
          ? 'O navegador ainda não recusou nada.'
          : `Último erro: ${error.kind} — a região entrou no layout.`}
      </Text>
    </>
  );
}

export const ErrorState: Story = {
  name: 'Error',
  parameters: scenario('error'),
  render: () => (
    <Scene
      label="onFullscreenError"
      note="Inside Storybook’s preview frame the browser may refuse; the line prints the kind, and the panel is full screen in the layout either way."
    >
      <RefusedPanel />
    </Scene>
  ),
};

export const Overlays: Story = {
  parameters: scenario('overlays'),
  render: () => (
    <Scene
      label="Select inside the region"
      note="Enter full screen, then open the period: the list opens inside the region, above the chart."
    >
      <Fullscreen>
        <RevenuePanel>
          <Select defaultValue="6m">
            <SelectTrigger aria-label="Período">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
        </RevenuePanel>
      </Fullscreen>
    </Scene>
  ),
};

function WholeDocument() {
  const page = useFullscreen(typeof document === 'undefined' ? null : document.documentElement);
  return (
    <div className="slotted-demo-row">
      <FullscreenTrigger target={page} variant="outline">
        {(on) => (on ? 'Sair do modo apresentação' : 'Modo apresentação')}
      </FullscreenTrigger>
      <Text size="sm" tone="muted">
        {page.supported
          ? 'A API está disponível.'
          : 'Sem API: o documento não pode ir para o layout.'}
      </Text>
    </div>
  );
}

export const DocumentRegion: Story = {
  name: 'Document',
  parameters: scenario('document'),
  render: () => (
    <Scene
      label="useFullscreen(document.documentElement)"
      note="The whole page goes full screen; the control is not inside any region and takes the handle as its target."
      layout="stack"
    >
      <WholeDocument />
    </Scene>
  ),
};

function KeyboardPanel() {
  const [reason, setReason] = useState('—');
  return (
    <>
      <Fullscreen mode="layout" onFullscreenChange={(_, request) => setReason(request.reason)}>
        <RevenuePanel control={<FullscreenTrigger variant="outline" />} />
      </Fullscreen>
      <Text size="sm" tone="muted">
        Última razão: {reason}
      </Text>
    </>
  );
}

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Scene
      label="Tab · Space · Enter · Escape"
      note="Space prints keyboard; a click prints pointer; Escape in the layout prints escape. While full screen, Tab stays inside the panel."
    >
      <KeyboardPanel />
    </Scene>
  ),
};

export const Trigger: Story = {
  parameters: scenario('trigger'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="ghost"
        note="Bare until hovered, for a bar that is already framed."
        layout="row"
      >
        <FullscreenTrigger size="sm" />
        <FullscreenTrigger />
        <FullscreenTrigger size="lg" />
      </Scene>
      <Scene
        label="outline"
        note="Its own edge and ground, for a control over content."
        layout="row"
      >
        <FullscreenTrigger size="sm" variant="outline" />
        <FullscreenTrigger variant="outline" />
        <FullscreenTrigger size="lg" variant="outline" />
      </Scene>
      <Scene
        label="In full screen"
        note="The words and the mark say what the press does next."
        layout="row"
      >
        <FullscreenTrigger target={FULL} />
        <FullscreenTrigger target={FULL} variant="outline" />
      </Scene>
      <Scene label="disabled" note="Legible, and the press is refused." layout="row">
        <FullscreenTrigger disabled />
        <FullscreenTrigger disabled variant="outline" />
      </Scene>
    </Grid>
  ),
};

/** A handle that says full screen, so the control's other face can be shown at rest. */
const FULL = {
  fullscreen: true,
  mode: 'layout',
  supported: true,
  error: null,
  messages: {
    enter: 'Full screen',
    exit: 'Exit full screen',
    entered: 'Full screen. Press Escape to exit.',
    exited: 'Exited full screen',
  },
  enter: () => {},
  exit: () => {},
  toggle: () => {},
} as const;

export const IconOnly: Story = {
  parameters: scenario('iconOnly'),
  render: () => (
    <section className="slotted-demo-scene">
      <header className="slotted-demo-scene__header">
        <span className="slotted-demo-scene__label">iconOnly</span>
        <span className="slotted-demo-scene__note">
          Square from the control height; the words stay as the accessible name in both states.
        </span>
      </header>
      {/* A square control is as wide as it is tall, 30 to 38 pixels by step. */}
      <div className="slotted-demo-stage" data-collapse-floor="24" data-layout="row">
        <FullscreenTrigger iconOnly size="sm" />
        <FullscreenTrigger iconOnly />
        <FullscreenTrigger iconOnly size="lg" />
        <FullscreenTrigger iconOnly target={FULL} />
        <FullscreenTrigger iconOnly variant="outline" />
      </div>
    </section>
  ),
};

function OutsideControl() {
  const [chart, setChart] = useState<HTMLElement | null>(null);
  const handle = useFullscreen(chart, { mode: 'layout' });
  return (
    <>
      <div className="slotted-demo-row">
        <Text size="sm" tone="muted">
          Painel de vendas
        </Text>
        <FullscreenTrigger target={handle} variant="outline" />
      </div>
      <section
        data-fullscreen={handle.fullscreen ? '' : undefined}
        data-mode={handle.mode ?? undefined}
        data-part="root"
        data-ui="fullscreen"
        ref={setChart}
      >
        <RevenuePanel control={<FullscreenTrigger iconOnly target={handle} />} />
      </section>
    </>
  );
}

export const Outside: Story = {
  parameters: scenario('outside'),
  render: () => (
    <Scene
      label="useFullscreen + target"
      note="The control in the bar drives the section below; the control inside the section takes the reader back."
    >
      <OutsideControl />
    </Scene>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Scene
      label="Provider, a label and a mark of the consumer"
      note="The provider sets the step and the Portuguese messages; the control says Apresentar and Terminar and changes its mark with the state."
    >
      <Measure>
        <FullscreenDefaultsProvider
          messages={{ enter: 'Tela cheia', exit: 'Sair da tela cheia' }}
          size="sm"
        >
          <Fullscreen mode="layout">
            <RevenuePanel
              control={
                <FullscreenTrigger
                  icon={(on) => (on ? <X size={14} /> : <Presentation size={14} />)}
                  variant="outline"
                >
                  {(on) => (on ? 'Terminar' : 'Apresentar')}
                </FullscreenTrigger>
              }
            />
          </Fullscreen>
        </FullscreenDefaultsProvider>
      </Measure>
    </Scene>
  ),
};
