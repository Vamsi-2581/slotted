import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CreditCard, FileText, Send } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Avatar } from '../avatar';
import { Button } from '../button';
import {
  Collapsible,
  CollapsibleHeader,
  CollapsiblePanel,
  CollapsibleTrigger,
} from '../collapsible';
import { Grid, Measure, Scene } from '../field/field-demo';
import { Icon } from '../icon';
import { Link } from '../link';
import {
  ResultState,
  ResultStateContent,
  ResultStateDescription,
  ResultStateTitle,
} from '../result-state';
import { Timeline } from './timeline';
import { TimelineDefaultsProvider } from './timeline-defaults';
import { TimelineGroup, TimelineItem, TimelineTime } from './timeline-parts';
import { REACT_TIMELINE_DOCS, REACT_TIMELINE_TOKENS } from './timeline.docs';
import type { TimelineItemProps, TimelineProps } from './timeline.types';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_TIMELINE_DOCS.timeline.scenes, {
    playground: Playground,
    feed: Feed,
    placement: Placement,
    orientation: Orientation,
    order: Order,
    statuses: Statuses,
    appearance: Appearance,
    groups: Groups,
    growing: Growing,
    fresh: Fresh,
    timestamps: Timestamps,
    content: Content,
    composition: Composition,
    empty: Empty,
    keyboard: Keyboard,
  }) as never;

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Timeline',
        description:
          'Uma lista ordenada de eventos sobre uma linha, com hora de máquina, ator, marcador e ações — e, em modo feed, o padrão Feed do APG.',
        framework: 'React',
        ...REACT_TIMELINE_DOCS.timeline,
        tokens: REACT_TIMELINE_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One moment, so the relative readings on the page never drift from the captions. */
const NOW = Date.UTC(2026, 8, 14, 15, 32);
const BRAZIL = { locale: 'pt-BR', now: NOW, timeZone: 'America/Sao_Paulo' } as const;

const SOLARIS = <Avatar name="Solaris Fretes" shape="square" size="xs" tone="secondary" />;
const ANA = <Avatar name="Ana Ribeiro" size="xs" tone="accent" />;

function Actor({ avatar, name }: { avatar: ReactNode; name: string }) {
  return (
    <>
      {avatar}
      {name}
    </>
  );
}

const INVOICE: readonly TimelineItemProps[] = [
  {
    actor: <Actor avatar={ANA} name="Ana Ribeiro" />,
    description: 'Rascunho INV-4821 para Solaris Fretes, 12 linhas.',
    time: '2026-09-08T12:12:00Z',
    title: 'Fatura criada',
  },
  {
    description: 'Para faturacao@solarisfretes.example, com o PDF anexo.',
    marker: (
      <Icon>
        <Send aria-hidden="true" focusable="false" />
      </Icon>
    ),
    time: '2026-09-08T12:15:00Z',
    title: 'Enviada ao cliente',
  },
  {
    actions: (
      <>
        <Button size="sm" variant="outline">
          Repetir pagamento
        </Button>
        <Button size="sm" tone="secondary" variant="ghost">
          Contactar cliente
        </Button>
      </>
    ),
    description: 'Cartão terminado em 4421 recusado pelo emissor.',
    marker: (
      <Icon>
        <CreditCard aria-hidden="true" focusable="false" />
      </Icon>
    ),
    time: '2026-09-11T11:30:00Z',
    title: 'Pagamento falhou',
    tone: 'danger',
  },
  {
    actor: <Actor avatar={SOLARIS} name="Solaris Fretes" />,
    current: true,
    description: 'R$ 18.240,00 por transferência bancária.',
    time: '2026-09-14T13:32:00Z',
    title: 'Paga',
    tone: 'success',
  },
];

function Invoice({
  events = INVOICE,
  ...props
}: Partial<TimelineProps> & { events?: readonly TimelineItemProps[] }) {
  return (
    <Timeline label="Atividade da fatura" {...BRAZIL} {...props}>
      {events.map((event, index) => (
        <TimelineItem key={index} {...event} />
      ))}
    </Timeline>
  );
}

const TRACKING: readonly TimelineItemProps[] = [
  { time: '2026-09-12T19:40:00Z', title: 'Pedido confirmado' },
  { time: '2026-09-13T12:05:00Z', title: 'Embalado no armazém de São Paulo' },
  {
    current: true,
    description: 'Saiu do centro de Campinas no caminhão 118.',
    time: '2026-09-14T10:20:00Z',
    title: 'Em trânsito',
  },
  { title: 'Saiu para entrega' },
  { description: 'À espera da confirmação da transportadora.', loading: true, title: 'Entregue' },
];

function Tracking(props: Partial<TimelineProps>) {
  return (
    <Timeline autoComplete label="Rastreio da encomenda" tone="accent" {...BRAZIL} {...props}>
      {TRACKING.map((event, index) => (
        <TimelineItem key={index} {...event} />
      ))}
    </Timeline>
  );
}

export const Playground: Story = {
  args: {
    autoComplete: false,
    growing: 'none',
    mode: 'list',
    order: 'oldest-first',
    orientation: 'vertical',
    placement: 'end',
    size: 'md',
    timeFormat: 'absolute',
    tone: 'secondary',
    variant: 'outline',
  },
  argTypes: {
    growing: { control: 'radio', options: ['none', 'button', 'scroll'] },
    mode: { control: 'radio', options: ['list', 'feed'] },
    order: { control: 'radio', options: ['oldest-first', 'newest-first'] },
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    placement: { control: 'radio', options: ['end', 'start', 'alternate'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    timeFormat: { control: 'radio', options: ['absolute', 'relative'] },
    tone: { control: 'select', options: ['secondary', 'accent', 'success', 'warning', 'danger'] },
    variant: { control: 'radio', options: ['solid', 'outline', 'subtle', 'plain'] },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Invoice {...args} />
    </div>
  ),
};

function GrowingFeed() {
  const [events, setEvents] = useState(INVOICE);
  const [loading, setLoading] = useState(false);
  const load = () => {
    setLoading(true);
    window.setTimeout(() => {
      setEvents((current) => [
        ...current,
        { time: '2026-09-14T13:33:00Z', title: 'Recibo enviado' },
        {
          description: 'Pelo cliente, no portal.',
          time: '2026-09-14T14:02:00Z',
          title: 'Recibo transferido',
        },
      ]);
      setLoading(false);
    }, 900);
  };
  return (
    <Timeline
      count={12}
      growing="button"
      label="Atividade da conta"
      loading={loading}
      mode="feed"
      onLoadMore={load}
      order="newest-first"
      timeFormat="relative"
      {...BRAZIL}
    >
      {[...events].reverse().map((event, index) => (
        <TimelineItem key={index} {...event} current={false} />
      ))}
    </Timeline>
  );
}

export const Feed: Story = {
  parameters: scenario('feed'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label='mode="feed" · growing="button" · count={12}'
        note="Um div com role=feed e artigos com tabindex, posição e tamanho do conjunto. Tab para em cada evento; PageDown e PageUp saltam entre eles; carregar mais acrescenta ao fim e a posição de cada artigo continua a contar."
      >
        <GrowingFeed />
      </Scene>
    </Grid>
  ),
};

const RELEASES = [
  {
    date: '2026-06-02T00:00:00Z',
    label: 'Junho de 2026',
    description: 'Agendas, pausas e modelos por cliente.',
    title: '2.12 — Faturas recorrentes',
  },
  {
    date: '2026-07-20T00:00:00Z',
    label: 'Julho de 2026',
    description: 'Faturas na moeda do cliente, liquidadas na sua.',
    title: '2.13 — Multimoeda',
  },
  {
    date: '2026-09-14T00:00:00Z',
    label: 'Setembro de 2026',
    description: 'Um cartão recusado volta a ser tentado num calendário que o cliente vê.',
    title: '2.14 — Novas tentativas de pagamento',
  },
];

function Releases(props: Partial<TimelineProps>) {
  return (
    <Timeline label="Histórico de versões" tone="accent" variant="solid" {...BRAZIL} {...props}>
      {RELEASES.map((release) => (
        <TimelineItem
          description={release.description}
          key={release.title}
          opposite={<TimelineTime value={release.date}>{release.label}</TimelineTime>}
          title={release.title}
        />
      ))}
    </Timeline>
  );
}

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label='placement="end" com opposite'
        note="A hora do outro lado da linha, numa coluna de largura fixa: a leitura clássica, com os títulos alinhados entre si."
      >
        <Releases />
      </Scene>
      <Scene
        label='placement="start"'
        note="A fila espelhada: o corpo antes da linha e alinhado a ela, o lado oposto depois. Num documento RTL é a mesma linha invertida, porque a grelha é lógica."
      >
        <Invoice events={INVOICE.slice(0, 2)} placement="start" />
      </Scene>
      <Scene
        label='placement="alternate"'
        note="A linha ao meio e os eventos a revezar-se. Reduza o palco abaixo de 480 px: alternate cai para um lado só e a data passa para a linha acima do corpo."
      >
        <Releases placement="alternate" />
      </Scene>
    </Grid>
  ),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label='orientation="horizontal"'
        note="Colunas iguais, a linha ao longo do centro dos marcadores, e rolagem no eixo em linha quando não cabe. Abaixo de 480 px da sua própria largura volta a ser uma coluna."
      >
        <Tracking orientation="horizontal" />
      </Scene>
      <Scene
        label='orientation="horizontal" reflow={false}'
        note="A mesma fila sem refluxo: em qualquer largura continua a rolar de lado, que é o que um consumidor quer numa barra de etapas."
      >
        <Tracking orientation="horizontal" reflow={false} />
      </Scene>
    </Grid>
  ),
};

export const Order: Story = {
  parameters: scenario('order'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label='order="oldest-first"'
        note="O passado está antes do atual: os dois primeiros ficam concluídos e a linha depois do atual traceja."
      >
        <Tracking />
      </Scene>
      <Scene
        label='order="newest-first"'
        note="O mesmo array escrito ao contrário pelo consumidor. O passado está depois do atual, e é lá que autoComplete corta; nada foi reordenado."
      >
        <Timeline autoComplete label="Rastreio" order="newest-first" tone="accent" {...BRAZIL}>
          {[...TRACKING].reverse().map((event, index) => (
            <TimelineItem key={index} {...event} />
          ))}
        </Timeline>
      </Scene>
    </Grid>
  ),
};

export const Statuses: Story = {
  parameters: scenario('statuses'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="complete · current · pendente · loading"
        note="Um disco cheio com check, um alvo, um anel com um ponto e o anel do spinner. Em alto contraste os quatro continuam quatro formas."
      >
        <Tracking />
      </Scene>
    </Grid>
  ),
};

const TONES = ['secondary', 'accent', 'success', 'warning', 'danger'] as const;

function Swatches({ variant }: { variant: 'solid' | 'outline' | 'subtle' | 'plain' }) {
  return (
    <Timeline label={`Variante ${variant}`} variant={variant} {...BRAZIL}>
      {TONES.map((tone) => (
        <TimelineItem key={tone} title={tone} tone={tone} />
      ))}
    </Timeline>
  );
}

export const Appearance: Story = {
  parameters: scenario('appearance'),
  render: () => (
    <>
      <Grid columns={2}>
        <Scene
          label='variant="outline"'
          note="A omissão: o anel separa o marcador da linha em qualquer esquema, e o tom pinta o anel e o ponto."
        >
          <Swatches variant="outline" />
        </Scene>
        <Scene
          label='variant="solid"'
          note="Um disco cheio no tom; um evento atual ganha um halo do seu próprio tom."
        >
          <Swatches variant="solid" />
        </Scene>
        <Scene
          label='variant="subtle"'
          note="A superfície do tom com uma aresta fina, que é o que o mantém visível em alto contraste."
        >
          <Swatches variant="subtle" />
        </Scene>
        <Scene
          label='variant="plain"'
          note="O ponto sem anel, para uma fila de commits ou um log: a caixa mantém o tamanho e a linha fica no centro."
        >
          <Swatches variant="plain" />
        </Scene>
      </Grid>
      <Grid columns={1}>
        <Scene
          label='size="sm"'
          note="Marcador de 21 px e tipo de 12 px, com o ritmo entre eventos a acompanhar."
        >
          <Invoice events={INVOICE.slice(0, 2)} size="sm" />
        </Scene>
        <Scene
          label='size="md"'
          note="A omissão: marcador de 24 px sobre o tipo de 13 px do controlo médio."
        >
          <Invoice events={INVOICE.slice(0, 2)} />
        </Scene>
        <Scene
          label='size="lg"'
          note="Marcador de 27 px e tipo de 14 px; a densidade restata os três."
        >
          <Invoice events={INVOICE.slice(0, 2)} size="lg" />
        </Scene>
      </Grid>
    </>
  ),
};

export const Groups: Story = {
  parameters: scenario('groups'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="collapsible · defaultOpen · level"
        note="Hoje aberto, a semana passada fechada, agosto sem gatilho. A linha quebra em cada heading, e a lista fechada continua no DOM."
      >
        <Timeline label="Atividade da fatura" level={3} timeFormat="relative" {...BRAZIL}>
          <TimelineGroup collapsible label="Hoje">
            <TimelineItem time="2026-09-14T13:32:00Z" title="Paga" tone="success" />
            <TimelineItem time="2026-09-14T13:33:00Z" title="Recibo enviado" />
          </TimelineGroup>
          <TimelineGroup collapsible defaultOpen={false} label="Semana passada">
            <TimelineItem time="2026-09-11T11:30:00Z" title="Pagamento falhou" tone="danger" />
            <TimelineItem time="2026-09-08T12:15:00Z" title="Enviada ao cliente" />
          </TimelineGroup>
          <TimelineGroup label="Agosto">
            <TimelineItem
              time="2026-08-27T14:00:00Z"
              timeLabel="27 de ago."
              title="Cliente adicionado"
            />
            <TimelineItem
              time="2026-08-29T18:30:00Z"
              timeLabel="29 de ago."
              title="Tabela de preços acordada"
            />
          </TimelineGroup>
        </Timeline>
      </Scene>
    </Grid>
  ),
};

export const Growing: Story = {
  parameters: scenario('growing'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label='growing="button"'
        note="Um botão no fim do carregado; enquanto loading, o anel e a mensagem no mesmo sítio."
      >
        <Invoice events={INVOICE.slice(0, 2)} growing="button" onLoadMore={() => {}} />
      </Scene>
      <Scene
        label='growing="button" loading'
        note="O botão deu lugar ao anel: a lista está aria-busy e nada pode ser pedido duas vezes."
      >
        <Invoice events={INVOICE.slice(0, 2)} growing="button" loading />
      </Scene>
    </Grid>
  ),
};

function Held() {
  const [held, setHeld] = useState(3);
  return (
    <Timeline
      freshCount={held}
      label="Atividade da conta"
      mode="feed"
      onReveal={() => setHeld(0)}
      order="newest-first"
      timeFormat="relative"
      {...BRAZIL}
    >
      {[...INVOICE].reverse().map((event, index) => (
        <TimelineItem key={index} {...event} current={false} />
      ))}
    </Timeline>
  );
}

export const Fresh: Story = {
  parameters: scenario('fresh'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="freshCount={3} · onReveal"
        note="Três eventos à espera atrás da pílula, anunciados uma vez. Pressione-a: o consumidor junta-os ao array e a contagem volta a zero."
      >
        <Held />
      </Scene>
    </Grid>
  ),
};

export const Timestamps: Story = {
  parameters: scenario('timestamps'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label='timeZone="America/Sao_Paulo" · "UTC" · valor de parede'
        note="O mesmo instante 13:32Z escrito em dois fusos, e um valor sem fuso escrito como está — nunca convertido."
      >
        <Timeline label="Fusos" {...BRAZIL}>
          <TimelineItem
            description="America/Sao_Paulo"
            time="2026-09-14T13:32:00Z"
            title="Instante"
          />
          <TimelineItem
            description="Escrito como está: 10:32 é 10:32"
            time="2026-09-14T10:32"
            title="Valor de parede"
          />
        </Timeline>
        <Timeline label="Fusos" locale="pt-BR" timeZone="UTC">
          <TimelineItem description="UTC" time="2026-09-14T13:32:00Z" title="Instante" />
        </Timeline>
      </Scene>
      <Scene
        label='timeFormat="relative" · now'
        note="Há 2 horas, há 3 dias, há 6 dias — e o absoluto em title, ao passar o ponteiro. now vem dos defaults, para o servidor e o cliente escreverem a mesma coisa."
      >
        <TimelineDefaultsProvider {...BRAZIL}>
          <Timeline label="Atividade" order="newest-first" timeFormat="relative">
            {[...INVOICE].reverse().map((event, index) => (
              <TimelineItem key={index} {...event} current={false} />
            ))}
          </Timeline>
        </TimelineDefaultsProvider>
      </Scene>
    </Grid>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="nove palavras · token sem quebra · árabe · avatar no marcador · sem título"
        note="O título quebra dentro da sua coluna e o marcador fica na primeira linha; a referência quebra em qualquer sítio; o árabe lê da direita; o avatar enche o anel; o evento sem título é rotulado pelo ator."
      >
        <Timeline label="Atividade da fatura" {...BRAZIL}>
          <TimelineItem
            description="Referência TRX-2026-09-10-000000000000000000000000000000000000000000000000000000000000-A"
            marker={ANA}
            time="2026-09-10T20:45:00Z"
            title="Aprovou a cotação revista do programa de remessas transfronteiriças da Solaris Fretes"
          />
          <TimelineItem
            description={
              <span dir="rtl" lang="ar">
                مع ملف PDF مرفق.
              </span>
            }
            time="2026-09-11T11:30:00Z"
            title={
              <span dir="rtl" lang="ar">
                تم إرسال الفاتورة إلى العميل
              </span>
            }
          />
          <TimelineItem
            actor={<Actor avatar={ANA} name="Ana Ribeiro" />}
            description="Adicionou uma nota sem título."
            time="2026-09-12T13:00:00Z"
          />
        </Timeline>
      </Scene>
      <Scene
        label="360 px"
        note="A mesma lista numa coluna estreita: a hora desce para a sua própria linha e o título fica com a medida inteira."
      >
        <Measure>
          <Invoice events={INVOICE.slice(2, 4)} />
        </Measure>
      </Scene>
    </Grid>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Link no título · Collapsible no corpo · Button nas ações"
        note="Cada parte é uma família que já existe: o título é um Link, a resposta do emissor é uma Collapsible, as ações são Buttons. Nenhuma delas é reescrita aqui."
      >
        <Timeline label="Atividade da fatura" mode="feed" {...BRAZIL}>
          <TimelineItem
            actions={
              <>
                <Button size="sm" variant="outline">
                  Repetir pagamento
                </Button>
                <Button size="sm" tone="secondary" variant="ghost">
                  Contactar cliente
                </Button>
              </>
            }
            description="Cartão terminado em 4421 recusado pelo emissor."
            marker={
              <Icon>
                <CreditCard aria-hidden="true" focusable="false" />
              </Icon>
            }
            time="2026-09-11T11:30:00Z"
            title={<Link href="#fatura-4821">Pagamento falhou</Link>}
            tone="danger"
          >
            <Collapsible variant="plain">
              <CollapsibleHeader>
                <CollapsibleTrigger>Ver resposta do emissor</CollapsibleTrigger>
              </CollapsibleHeader>
              <CollapsiblePanel>
                Código 05: não honrar. Segunda tentativa agendada para 18 de setembro.
              </CollapsiblePanel>
            </Collapsible>
          </TimelineItem>
          <TimelineItem
            marker={
              <Icon>
                <FileText aria-hidden="true" focusable="false" />
              </Icon>
            }
            time="2026-09-12T13:00:00Z"
            title="Segundo aviso enviado"
            tone="warning"
          />
          <TimelineItem
            actor={<Actor avatar={SOLARIS} name="Solaris Fretes" />}
            current
            time="2026-09-14T13:32:00Z"
            title="Paga"
            tone="success"
          />
        </Timeline>
      </Scene>
    </Grid>
  ),
};

export const Empty: Story = {
  parameters: scenario('empty'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="sem itens"
        note="A mensagem da família no lugar da lista, na cor muda, centrada."
      >
        <Timeline label="Atividade da fatura" {...BRAZIL} />
      </Scene>
      <Scene
        label="empty={<ResultState />}"
        note="O que o consumidor projetar: um result-state com uma ação, porque uma lista vazia é um sítio para começar."
      >
        <Timeline
          empty={
            <ResultState reach="inline" status="empty">
              <ResultStateContent>
                <ResultStateTitle>Ainda sem eventos</ResultStateTitle>
                <ResultStateDescription>
                  A primeira fatura aparece aqui assim que for criada.
                </ResultStateDescription>
              </ResultStateContent>
            </ResultState>
          }
          label="Atividade da fatura"
          {...BRAZIL}
        />
      </Scene>
    </Grid>
  ),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="feed · Tab · PageDown · PageUp · Control+End · Control+Home"
        note="Foque o botão antes do feed e siga com Tab: cada artigo é uma paragem com anel. PageDown salta ao artigo seguinte mesmo a partir de um botão dentro dele; Control+End aterra no botão depois do feed."
      >
        <div className="slotted-demo-row">
          <Button size="sm" variant="outline">
            Antes do feed
          </Button>
        </div>
        <Invoice mode="feed" />
        <div className="slotted-demo-row">
          <Button size="sm" variant="outline">
            Depois do feed
          </Button>
        </div>
      </Scene>
    </Grid>
  ),
};
