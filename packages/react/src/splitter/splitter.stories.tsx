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

/** One account, as the product's own navigation lists them. */
function Accounts({ children }: { children?: ReactNode }) {
  return (
    <Region>
      <Text size="sm" weight="semibold">
        Contas a receber
      </Text>
      <Text size="sm" tone="muted">
        Vencidas · 14
      </Text>
      <Text size="sm" tone="muted">
        A vencer em 7 dias · 32
      </Text>
      <Text size="sm" tone="muted">
        Em conciliação · 3
      </Text>
      {children}
    </Region>
  );
}

function Invoice({ children }: { children?: ReactNode }) {
  return (
    <Body>
      <Text size="lg" weight="semibold">
        NF-e 20 483 · Metalúrgica Boa Vista Ltda
      </Text>
      <Text size="sm" tone="muted">
        Emitida em 02/09/2026 · vence em 02/10/2026 · R$ 18 420,00
      </Text>
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
        label="Um espaço de trabalho com fronteira móvel"
        note="Arraste a barra, ou chegue a ela com Tab e use as setas. O número anunciado e a medida aplicada são o mesmo número, e a região ao lado fica com o que sobra."
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
        <Text size="sm" tone="muted">
          {Math.round(value * 100)}% do contentor
        </Text>
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
        label="Três paragens, e a mão que as encontra"
        note="Arraste para lá de uma paragem e largue: a barra assenta na mais próxima. Encaixa ao largar e nunca durante o arrasto, porque uma barra que encaixasse a cada frame lutava com a mão em vez de a ajudar. As setas andam de paragem em paragem."
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
        label="Duplo clique volta ao princípio"
        note="Mova a barra para onde quiser e faça duplo clique nela: regressa aos trinta e quatro por cento com que começou. O padrão não atribui nada ao duplo clique, e toda a implementação levantada que traz um reset o põe aí."
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
        label="Congelada, e ainda legível"
        note="A barra mantém o ponto de tabulação e os três valores ARIA; as linhas descem ao passo apagado e o hover e a pressão ficam retidos. Quem não pode mover um separador ainda pode ser informado de onde ele está."
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
        <Text size="sm" tone="muted">
          aria-valuenow={Math.round(value * 100)} · aria-valuemin=15 · aria-valuemax=75
        </Text>
      </Invoice>
    </Workspace>
  );
}

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Todas as teclas que o padrão lista"
        note="Chegue à barra com Tab: as setas movem dezasseis pixels e sessenta e quatro com Shift, Home e End vão aos limites, Enter colapsa e restaura. O valor anunciado, impresso à direita, muda com cada uma."
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
          <Text size="sm" weight="semibold">
            Sumário
          </Text>
          <Text size="sm" tone="muted">
            Conciliação bancária
          </Text>
          <Text size="sm" tone="muted">
            Baixa automática
          </Text>
        </Region>
        <Splitter
          aria-label="Largura do sumário"
          defaultValue={0.24}
          for={toc}
          max={0.4}
          min="180px"
        />
        <Body>
          <Text size="lg" weight="semibold">
            Procedimento de conciliação
          </Text>
          <Text size="sm" tone="muted">
            Cada barra trava contra os seus próprios limites e nenhuma negoceia com a outra: quem
            possui o layout possui a política.
          </Text>
        </Body>
        <Splitter
          aria-label="Largura das notas"
          defaultValue={0.78}
          for={document}
          max={0.85}
          min={0.4}
        />
        <Region>
          <Text size="sm" weight="semibold">
            Notas
          </Text>
          <Text size="sm" tone="muted">
            Revisto por Auditoria em 08/09.
          </Text>
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
        label="Duas barras em série"
        note="A forma que o portal de ajuda da SAP usa. A família não segura painéis, portanto quem possui o layout possui também a política de acoplamento: cada barra trava sozinha e nenhuma empurra a vizinha."
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
        <Text size="sm" tone="muted">
          Guardado: {Math.round(saved * 100)}% · em movimento: {Math.round(value * 100)}%
        </Text>
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
        label="Um layout que sobrevive a um recarregamento"
        note="Arraste a barra: o número em movimento muda a cada frame e o guardado muda uma vez, ao largar. Prima Recarregar para ver de onde a página voltaria. A família nunca toca em armazenamento — qual armazenamento, e se um layout atravessa um login, são decisões da aplicação."
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
        <Text id="contas-heading" size="sm" weight="semibold">
          Contas a receber
        </Text>
        <Text size="sm" tone="muted">
          O separador toma o nome deste título.
        </Text>
      </Region>
      <Splitter aria-labelledby="contas-heading" defaultValue={0.34} for={region} />
      <Invoice>
        <Text size="sm" tone="muted">
          role=separator · tabindex=0 · aria-orientation=vertical · aria-controls aponta à região
        </Text>
      </Invoice>
    </Workspace>
  );
}

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="O que um leitor de ecrã ouve"
        note="A barra nomeia a região por aria-controls e toma o nome do título dessa região, que é a regra do próprio padrão: um separador chama-se pela região que dimensiona. A região recebe um id da família quando não traz nenhum."
      >
        <Named />
      </Scene>
    </Grid>
  ),
};
