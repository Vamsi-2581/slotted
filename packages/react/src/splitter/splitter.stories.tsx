import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Badge } from '../badge';
import { Button } from '../button';
import { Grid, Scene } from '../field/field-demo';
import { Text } from '../typography';
import { Splitter } from './splitter';
import { SplitterDefaultsProvider } from './splitter-defaults';
import { Body, Region, Workspace } from './splitter-demo';
import { REACT_SPLITTER_DOCS, REACT_SPLITTER_TOKENS } from './splitter.docs';
import type { SplitterHandle } from './splitter.types';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_SPLITTER_DOCS.scenes, {
    playground: Playground,
    orientation: Orientation,
    value: Value,
    limits: Limits,
    collapse: Collapse,
    snapPoints: SnapPoints,
    reset: Reset,
    disabled: Disabled,
    keyboard: Keyboard,
    twoBars: TwoBars,
    persistence: Persistence,
    composition: Composition,
    defaults: Defaults,
    accessibility: Accessibility,
  }) as never;

const meta = {
  title: 'Components/Splitter',
  component: Splitter,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Splitter',
        description:
          'A focusable bar between two regions, and nothing else. It holds the position, the limits, the stops and the whole Window Splitter keyboard; it holds no layout, so the fraction is published as a custom property and one CSS rule turns it into a measure. Its limits take a fraction or a CSS length, which is the one thing none of the surveyed implementations can state.',
        framework: 'React',
        ...REACT_SPLITTER_DOCS,
        tokens: REACT_SPLITTER_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Splitter>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A line of its own.
 *
 * `Text` renders a `span`, so a column of them is one paragraph with no spaces
 * in it: the first capture of this page read
 * "Contas a receberVencidas · 14A vencer em 7 dias · 32". `drawer.stories.tsx`
 * records the same defect from its own first publish, which is how this one is
 * a repeat rather than a discovery.
 */
function Line({
  children,
  id,
  tone,
  weight,
  size = 'sm',
}: {
  children: ReactNode;
  id?: string;
  tone?: 'muted';
  weight?: 'semibold';
  size?: 'sm' | 'lg';
}) {
  return (
    <Text id={id} render={(props) => <p {...props} />} size={size} tone={tone} weight={weight}>
      {children}
    </Text>
  );
}

/** One account, as the product's own navigation lists them. */
function Accounts({ children }: { children?: ReactNode }) {
  return (
    <Region>
      <Line size="sm" weight="semibold">
        Contas a receber
      </Line>
      <Line size="sm" tone="muted">
        Vencidas · 14
      </Line>
      <Line size="sm" tone="muted">
        A vencer em 7 dias · 32
      </Line>
      <Line size="sm" tone="muted">
        Em conciliação · 3
      </Line>
      {children}
    </Region>
  );
}

function Invoice({ children }: { children?: ReactNode }) {
  return (
    <Body>
      <Line size="lg" weight="semibold">
        NF-e 20 483 · Metalúrgica Boa Vista Ltda
      </Line>
      <Line size="sm" tone="muted">
        Emitida em 02/09/2026 · vence em 02/10/2026 · R$ 18 420,00
      </Line>
      <Badge tone="warning">Vencida há 9 dias</Badge>
      {children}
    </Body>
  );
}

export const Playground: Story = {
  parameters: scenario('playground'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="0.34 · sem limites · sem paragens"
        note="A configuração mais simples que a família tem: uma fracção inicial e nada mais. Tudo o que as outras cenas acrescentam — limites, paragens, colapso — é opcional sobre isto."
      >
        <Workspace>
          <Accounts />
          <Splitter aria-label="Largura da lista de contas" defaultValue={0.34} />
          <Invoice />
        </Workspace>
      </Scene>
    </Grid>
  ),
};

export const Orientation: Story = {
  parameters: scenario('orientation'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="vertical — duas regiões lado a lado"
        note="A linha é vertical e responde às setas esquerda e direita. As setas verticais ficam com a página: um documento que rola continua a rolar com o foco na barra."
      >
        <Workspace>
          <Accounts />
          <Splitter aria-label="Largura das contas" defaultValue={0.38} />
          <Invoice />
        </Workspace>
      </Scene>
      <Scene
        label="horizontal — duas regiões empilhadas"
        note="A linha é horizontal e responde às setas para cima e para baixo. A pega roda com ela: três pontos de altura passam a três de largura."
      >
        <Workspace orientation="horizontal">
          <Accounts />
          <Splitter
            aria-label="Altura dos lançamentos"
            defaultValue={0.42}
            orientation="horizontal"
          />
          <Invoice />
        </Workspace>
      </Scene>
    </Grid>
  ),
};

function Controlled() {
  const [value, setValue] = useState(0.3);

  return (
    <Workspace>
      <Accounts>
        <Line size="sm" tone="muted">
          {Math.round(value * 100)}% do contentor
        </Line>
      </Accounts>
      <Splitter
        aria-label="Largura das contas"
        onValueChange={(next) => setValue(next)}
        value={value}
      />
      <Invoice>
        <Button onClick={() => setValue(0.5)} size="sm" variant="outline">
          Pôr a meio por código
        </Button>
      </Invoice>
    </Workspace>
  );
}

export const Value: Story = {
  parameters: scenario('value'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Não controlada — a medida vive no CSS"
        note="Nada guarda o número. A barra escreve --slotted-splitter-value na região, e uma regra de uma linha transforma-o em medida; a página não tem estado nenhum para esta barra."
      >
        <Workspace>
          <Accounts />
          <Splitter aria-label="Largura das contas" defaultValue={0.34} />
          <Invoice />
        </Workspace>
      </Scene>
      <Scene
        label="Controlada — a medida vive na aplicação"
        note="O mesmo desenho com o número em estado: a percentagem impressa à esquerda e a posição da barra não podem discordar, porque são o mesmo valor."
      >
        <Controlled />
      </Scene>
    </Grid>
  ),
};

export const Limits: Story = {
  parameters: scenario('limits'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Chão em pixels"
        note="Arraste até ao fim, à esquerda: a região pára nos duzentos pixels, e continua a parar lá quando a janela estreita. Nenhuma das sete implementações levantadas consegue exprimir isto — Zag di-lo por palavras suas."
      >
        <Workspace>
          <Accounts />
          <Splitter aria-label="Largura das contas" defaultValue={0.34} min="200px" />
          <Invoice />
        </Workspace>
      </Scene>
      <Scene
        label="Tecto em fracção"
        note="Arraste até ao fim, à direita: pára a sessenta por cento do contentor, e o limite acompanha a janela sem ninguém o recalcular. Os dois limites aceitam qualquer das unidades."
      >
        <Workspace>
          <Accounts />
          <Splitter aria-label="Largura das contas" defaultValue={0.34} max={0.6} min="200px" />
          <Invoice />
        </Workspace>
      </Scene>
    </Grid>
  ),
};

export const Collapse: Story = {
  parameters: scenario('collapse'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Colapsa até desaparecer"
        note="Chegue à barra com Tab e prima Enter: a região fecha. Prima outra vez e volta à fracção que tinha, não a uma fracção qualquer — a posição anterior é guardada pela própria família."
      >
        <Workspace>
          <Accounts />
          <Splitter aria-label="Largura das contas" collapsible defaultValue={0.34} />
          <Invoice />
        </Workspace>
      </Scene>
      <Scene
        label="Colapsa até um friso"
        note="O mesmo Enter, com collapsedValue: a região encolhe a seis por cento em vez de fechar. É onde uma navegação que vira só ícones pára."
      >
        <Workspace>
          <Accounts />
          <Splitter
            aria-label="Largura das contas"
            collapsedValue={0.06}
            collapsible
            defaultValue={0.34}
          />
          <Invoice />
        </Workspace>
      </Scene>
    </Grid>
  ),
};

export const SnapPoints: Story = {
  parameters: scenario('snapPoints'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="snapPoints={[0.2, 0.34, 0.5]}"
        note="Repare em quando encaixa: durante o arrasto a barra segue o ponteiro exactamente, e só ao largar salta. Com paragens declaradas as setas deixam de andar dezasseis pixels e passam a andar de paragem em paragem."
      >
        <Workspace>
          <Accounts />
          <Splitter
            aria-label="Largura das contas"
            defaultValue={0.34}
            snapPoints={[0.2, 0.34, 0.5]}
          />
          <Invoice />
        </Workspace>
      </Scene>
    </Grid>
  ),
};

export const Reset: Story = {
  parameters: scenario('reset'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="defaultValue={0.34}"
        note="O mesmo número serve de ponto de partida e de destino do reset, que é o motivo de não haver um segundo input para ele. Enter, que colapsa, vai a outro sítio — os dois gestos não competem."
      >
        <Workspace>
          <Accounts />
          <Splitter aria-label="Largura das contas" defaultValue={0.34} />
          <Invoice />
        </Workspace>
      </Scene>
    </Grid>
  ),
};

export const Disabled: Story = {
  parameters: scenario('disabled'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="disabled, com value={0.34}"
        note="Chegue-lhe com Tab: o foco pára aqui na mesma. É deliberado — tirar o ponto de tabulação tiraria também o valor anunciado, e quem não pode mover um separador ainda precisa de saber onde ele está."
      >
        <Workspace>
          <Accounts />
          <Splitter aria-label="Largura das contas" disabled value={0.34} />
          <Invoice />
        </Workspace>
      </Scene>
    </Grid>
  ),
};

function Announced() {
  const [value, setValue] = useState(0.4);

  return (
    <Workspace>
      <Accounts />
      <Splitter
        aria-label="Largura das contas"
        collapsible
        max={0.75}
        min={0.15}
        onValueChange={(next) => setValue(next)}
        value={value}
      />
      <Invoice>
        <Line size="sm" tone="muted">
          aria-valuenow={Math.round(value * 100)} · aria-valuemin=15 · aria-valuemax=75
        </Line>
      </Invoice>
    </Workspace>
  );
}

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="min={0.15} · max={0.75} · collapsible"
        note="A linha impressa à direita é o que um leitor de ecrã diz. Prima Home e End para ver que ele pára em 15 e 75, e não em 0 e 100: o valor reportado é o já travado, portanto o anúncio e o layout não podem discordar."
      >
        <Announced />
      </Scene>
    </Grid>
  ),
};

function Workspace3() {
  const toc = useRef<HTMLElement>(null);
  const document = useRef<HTMLElement>(null);

  return (
    <div className="slotted-demo-viewport" data-size="tall">
      <div className="slotted-demo-workspace">
        <Region ref={toc}>
          <Line size="sm" weight="semibold">
            Sumário
          </Line>
          <Line size="sm" tone="muted">
            Conciliação bancária
          </Line>
          <Line size="sm" tone="muted">
            Baixa automática
          </Line>
        </Region>
        <Splitter
          aria-label="Largura do sumário"
          defaultValue={0.24}
          for={toc}
          max={0.4}
          min="180px"
        />
        <Body>
          <Line size="lg" weight="semibold">
            Procedimento de conciliação
          </Line>
          <Line size="sm" tone="muted">
            Cada barra trava contra os seus próprios limites e nenhuma negoceia com a outra: quem
            possui o layout possui a política.
          </Line>
        </Body>
        <Splitter
          aria-label="Largura das notas"
          defaultValue={0.78}
          for={document}
          max={0.85}
          min={0.4}
        />
        <Region>
          <Line size="sm" weight="semibold">
            Notas
          </Line>
          <Line size="sm" tone="muted">
            Revisto por Auditoria em 08/09.
          </Line>
        </Region>
      </div>
    </div>
  );
}

export const TwoBars: Story = {
  parameters: scenario('twoBars'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Duas barras, três regiões"
        note="Empurre a primeira barra toda para a direita e depois tente mover a segunda: ela não cede terreno à vizinha. É o custo escrito da decisão de não segurar painéis — quem possui o layout possui a política, e aqui o consumidor escolheu não ter nenhuma."
      >
        <Workspace3 />
      </Scene>
    </Grid>
  ),
};

function Persisted() {
  const [saved, setSaved] = useState(0.34);
  const [value, setValue] = useState(saved);

  return (
    <Workspace>
      <Accounts />
      <Splitter
        aria-label="Largura das contas"
        onResizeEnd={(next) => setSaved(next)}
        onValueChange={(next) => setValue(next)}
        value={value}
      />
      <Invoice>
        <Line size="sm" tone="muted">
          Guardado: {Math.round(saved * 100)}% · em movimento: {Math.round(value * 100)}%
        </Line>
        <Button onClick={() => setValue(saved)} size="sm" variant="outline">
          Recarregar a partir do guardado
        </Button>
      </Invoice>
    </Workspace>
  );
}

export const Persistence: Story = {
  parameters: scenario('persistence'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="onResizeEnd, ao lado de onValueChange"
        note="Os dois números à direita são o mesmo valor lido em dois momentos. Arraste devagar e veja o de cima mudar a cada frame enquanto o de baixo fica quieto até largar: é essa diferença que separa uma escrita em armazenamento de sessenta."
      >
        <Persisted />
      </Scene>
    </Grid>
  ),
};

function Composed() {
  const handle = useRef<SplitterHandle>(null);

  return (
    <Workspace>
      <Accounts />
      <Splitter
        aria-label="Largura das contas"
        collapsible
        defaultValue={0.34}
        ref={handle}
        render={(props) => <section {...props} />}
      />
      <Invoice>
        <Button onClick={() => handle.current?.collapse()} size="sm" variant="outline">
          collapse()
        </Button>
        <Button onClick={() => handle.current?.expand()} size="sm" variant="outline">
          expand()
        </Button>
        <Button onClick={() => handle.current?.reset()} size="sm" variant="ghost">
          reset()
        </Button>
      </Invoice>
    </Workspace>
  );
}

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Outro elemento, e a pega imperativa"
        note="A barra é desenhada como um section através de render, e as duas linhas e a pega viajam com ele. Os botões conduzem o handle, que é o que um breakpoint precisa para colapsar sem duplicar o clamp."
      >
        <Composed />
      </Scene>
      <Scene
        label="O handler do consumidor recusa o da família"
        note="Esta barra chama preventDefault() no seu próprio onKeyDown: as setas e o Enter deixam de a mover, e o ponteiro continua a mover. Composto, nunca substituído."
      >
        <Workspace>
          <Accounts />
          <Splitter
            aria-label="Largura das contas"
            defaultValue={0.34}
            onKeyDown={(event) => event.preventDefault()}
          />
          <Invoice />
        </Workspace>
      </Scene>
    </Grid>
  ),
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Herda o chão do provedor"
        note="Esta barra não declara min nenhum e pára na mesma nos duzentos pixels, porque o provedor à sua volta o declarou uma vez para a aplicação inteira."
      >
        <SplitterDefaultsProvider min="200px">
          <Workspace>
            <Accounts />
            <Splitter aria-label="Largura das contas" defaultValue={0.34} />
            <Invoice />
          </Workspace>
        </SplitterDefaultsProvider>
      </Scene>
      <Scene
        label="Declara o seu e ganha"
        note="Dentro do mesmo provedor, uma barra que declara min={0.05} desce muito mais: um valor explícito do consumidor ganha sempre ao que foi herdado."
      >
        <SplitterDefaultsProvider min="200px">
          <Workspace>
            <Accounts />
            <Splitter aria-label="Largura das contas" defaultValue={0.34} min={0.05} />
            <Invoice />
          </Workspace>
        </SplitterDefaultsProvider>
      </Scene>
    </Grid>
  ),
};

function Named() {
  const region = useRef<HTMLElement>(null);

  return (
    <Workspace>
      <Region ref={region}>
        <Line id="contas-heading" size="sm" weight="semibold">
          Contas a receber
        </Line>
        <Line size="sm" tone="muted">
          O separador toma o nome deste título.
        </Line>
      </Region>
      <Splitter aria-labelledby="contas-heading" defaultValue={0.34} for={region} />
      <Invoice>
        <Line size="sm" tone="muted">
          role=separator · tabindex=0 · aria-orientation=vertical · aria-controls aponta à região
        </Line>
      </Invoice>
    </Workspace>
  );
}

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="aria-labelledby, apontado ao título da região"
        note="Inspeccione a barra: aria-controls aponta ao aside e aria-labelledby ao h3 lá dentro. São o mesmo elemento por construção, porque for entrega um só — o que se ouve e o que se vê não podem divergir."
      >
        <Named />
      </Scene>
    </Grid>
  ),
};
