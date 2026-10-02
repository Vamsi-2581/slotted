import { PT_BR } from '@slotted/core/i18n/pt-BR';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '../button';
import { Grid, Scene } from '../field/field-demo';
import { SlottedProvider } from '../i18n';
import { Inline } from '../inline';
import { Link } from '../link';
import { Stack } from '../stack';
import { ScrollArea } from './scroll-area';
import {
  Line,
  Log,
  Notes,
  Paths,
  RegionList,
  Regions,
  RELEASES,
  TRANSLATED,
} from './scroll-area-demo';
import { REACT_SCROLL_AREA_DOCS, REACT_SCROLL_AREA_TOKENS } from './scroll-area.docs';
import type { ScrollAreaHandle, ScrollAreaProps, ScrollPosition } from './scroll-area.types';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_SCROLL_AREA_DOCS.scenes, {
    playground: Playground,
    axis: Axis,
    scrollbars: Scrollbars,
    fade: Fade,
    gutter: Gutter,
    overscroll: Overscroll,
    maximum: Maximum,
    keyboard: Keyboard,
    content: Content,
    composition: Composition,
    print: Print,
    accessibility: Accessibility,
  }) as never;

const meta = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Scroll Area',
        description:
          'A scrollport and the box that frames it. The scrollbar is the platform’s, themed through scrollbar-color; the keyboard is the platform’s too. What the family adds is the measurement of whether the content overflows — published on the frame in logical names and painted as a veil that needs no ink — and the tab stop and name a scrolling region owes, written only while there is something to scroll.',
        framework: 'React',
        ...REACT_SCROLL_AREA_DOCS,
        tokens: REACT_SCROLL_AREA_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A bounded, framed area. The bound and the frame are workbench primitives
 * because a story may not paint inline, and the frame is on the root — the
 * element the veil is not on — which is the anatomy decision the page shows.
 */
function Framed({
  children,
  scrollTo,
  ...props
}: Omit<ScrollAreaProps, 'ref'> & { scrollTo?: Partial<ScrollPosition> }) {
  const handle = useRef<ScrollAreaHandle>(null);

  /* A scene that shows the veil at both ends has to start in the middle. */
  useEffect(() => {
    if (scrollTo !== undefined) handle.current?.scrollTo(scrollTo);
  }, [scrollTo]);

  return (
    <ScrollArea className="slotted-demo-bound slotted-demo-frame" ref={handle} {...props}>
      <ScrollArea.Content>{children}</ScrollArea.Content>
    </ScrollArea>
  );
}

export const Playground: Story = {
  parameters: scenario('playground'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Notas de versão · block · auto · both"
        note="A configuração por omissão: um eixo, a barra da plataforma, o véu nas duas pontas. Role até ao fim e o véu de baixo levanta; volte ao início e o de cima desaparece."
      >
        <Framed messages={{ label: 'Notas de versão' }}>
          <Notes />
        </Framed>
      </Scene>
    </Grid>
  ),
};

export const Axis: Story = {
  parameters: scenario('axis'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="block — o eixo por omissão"
        note="Só o eixo de bloco rola. O eixo em linha fica preso, por isso uma linha comprida quebra em vez de fugir para o lado."
      >
        <Framed messages={{ label: 'Notas de versão' }}>
          <Notes />
        </Framed>
      </Scene>
      <Scene
        label="inline — uma fila que passa da caixa"
        note="O véu cai na ponta que o leitor ainda não alcançou, e espelha com o documento: em RTL fica à esquerda. A barra horizontal é a da plataforma."
      >
        <ScrollArea axis="inline" className="slotted-demo-frame" messages={{ label: 'Regiões' }}>
          <ScrollArea.Content>
            <Regions />
          </ScrollArea.Content>
        </ScrollArea>
      </Scene>
      <Scene
        label="both — um registo mais largo e mais alto do que a caixa"
        note="Quatro véus, e as duas máscaras multiplicam-se nos cantos. O quadrado entre as duas barras é desenhado pelo sistema."
      >
        <Framed
          axis="both"
          messages={{ label: 'Registo de exportações' }}
          scrollTo={{ block: 40, inline: 60 }}
        >
          <Log />
        </Framed>
      </Scene>
    </Grid>
  ),
};

export const Scrollbars: Story = {
  parameters: scenario('scrollbars'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="auto"
        note="A barra aparece quando há o que rolar e reserva o seu espaço desde o início, para nada se mexer quando aparece."
      >
        <Framed messages={{ label: 'Notas de versão' }}>
          <Notes />
        </Framed>
      </Scene>
      <Scene
        label="always"
        note="A calha fica reservada e desenhada mesmo em conteúdo que cabe inteiro. É overflow: scroll, a forma da plataforma dizer o mesmo."
      >
        <Framed messages={{ label: 'Notas de versão' }} scrollbars="always">
          <Notes releases={RELEASES.slice(0, 2)} />
        </Framed>
      </Scene>
      <Scene
        label="hover"
        note="A calha fica, a barra não se pinta até um ponteiro ou o teclado estarem lá dentro. É a metade em CSS daquilo em que o Radix e o Mantine gastam um temporizador."
      >
        <Framed messages={{ label: 'Notas de versão' }} scrollbars="hover">
          <Notes />
        </Framed>
      </Scene>
      <Scene
        label="none"
        note="Sem barra e sem calha. O conteúdo continua a rolar por roda, toque, teclado e scrollTo, e o véu passa a ser a única coisa a dizer que há mais."
      >
        <Framed messages={{ label: 'Notas de versão' }} scrollbars="none">
          <Notes />
        </Framed>
      </Scene>
    </Grid>
  ),
};

export const Fade: Story = {
  parameters: scenario('fade'),
  render: () => (
    <Grid columns={3}>
      <Scene
        label="both"
        note="Escurece o que o leitor já passou e o que ainda tem pela frente. As duas pontas leem-se como uma ideia só."
      >
        <Framed messages={{ label: 'Regiões' }} scrollTo={{ block: 40 }}>
          <RegionList />
        </Framed>
      </Scene>
      <Scene
        label="end"
        note="Só a ponta para onde há mais conteúdo. O início da lista fica nítido, para quem prefere não escurecer o que já foi lido."
      >
        <Framed fade="end" messages={{ label: 'Regiões' }} scrollTo={{ block: 40 }}>
          <RegionList />
        </Framed>
      </Scene>
      <Scene
        label="none"
        note="Nenhum véu, e nenhuma máscara: a barra fica sozinha a dizer que há mais, e a área não paga uma camada de composição."
      >
        <Framed fade="none" messages={{ label: 'Regiões' }} scrollTo={{ block: 40 }}>
          <RegionList />
        </Framed>
      </Scene>
    </Grid>
  ),
};

/** Three short lines: content that fits, so the gutter is the only thing that varies. */
function Fits() {
  return (
    <Stack gap={1}>
      <Line weight="semibold">2026.9.2 — Faturação</Line>
      <Line tone="muted">Três linhas que cabem inteiras.</Line>
      <Line tone="muted">Nada a rolar.</Line>
    </Stack>
  );
}

/**
 * The inset painted, so the room the gutter holds back is visible as the strip
 * the paint does not reach. The ground is a workbench surface rather than a
 * colour the story states.
 */
function Painted(props: Omit<ScrollAreaProps, 'ref' | 'children'>) {
  return (
    <ScrollArea className="slotted-demo-bound slotted-demo-frame" {...props}>
      <ScrollArea.Content className="slotted-demo-surface" data-surface="sunken">
        <Fits />
      </ScrollArea.Content>
    </ScrollArea>
  );
}

export const Gutter: Story = {
  parameters: scenario('gutter'),
  render: () => (
    <Grid columns={3}>
      <Scene
        label="auto"
        note="O recuo chega até à moldura. No momento em que o conteúdo crescer para lá da caixa, a barra aparece e empurra o texto para a esquerda."
      >
        <Painted gutter="auto" messages={{ label: 'Notas de versão' }} />
      </Scene>
      <Scene
        label="stable — por omissão"
        note="Uma largura de barra fica guardada à direita desde o início, por isso nada se mexe quando ela aparece."
      >
        <Painted messages={{ label: 'Notas de versão' }} />
      </Scene>
      <Scene
        label="both-edges"
        note="A mesma largura dos dois lados, para uma coluna centrada continuar centrada quer a barra esteja quer não."
      >
        <Painted gutter="both-edges" messages={{ label: 'Notas de versão' }} />
      </Scene>
    </Grid>
  ),
};

/**
 * A page that scrolls, with an area inside it. The page is the workbench's
 * scrolling stage, inset by a surface so the area does not sit against the
 * stage's own edge, with enough lines either side of the area that scrolling
 * the page is visibly a different movement from scrolling the area.
 */
function Page({ children }: { children: ReactNode }) {
  return (
    <div className="slotted-demo-scroll">
      <div className="slotted-demo-surface">
        <Stack gap={4}>
          <Line tone="muted">Esta página rola. Role-a até chegar à área.</Line>
          <Line tone="muted">Depois role a área até ao fim, e continue.</Line>
          {children}
          <Line tone="muted">Esta linha está por baixo da área, na página.</Line>
          <Line tone="muted">E esta também.</Line>
          <Line tone="muted">E esta é a última linha da página.</Line>
        </Stack>
      </div>
    </div>
  );
}

export const Overscroll: Story = {
  parameters: scenario('overscroll'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="contain — por omissão"
        note="Chegue ao fim da área e continue a rolar: a página por trás fica quieta. Uma região limitada cujo último centímetro move a página é o defeito que a propriedade veio resolver."
      >
        <Page>
          <ScrollArea
            className="slotted-demo-frame"
            messages={{ label: 'Notas de versão' }}
            maxBlockSize="7rem"
          >
            <ScrollArea.Content>
              <Notes releases={RELEASES.slice(0, 2)} />
            </ScrollArea.Content>
          </ScrollArea>
        </Page>
      </Scene>
      <Scene
        label="auto"
        note="O mesmo gesto encadeia para a página, que é o que o navegador faz por omissão. Um consumidor que queira isso di-lo."
      >
        <Page>
          <ScrollArea
            className="slotted-demo-frame"
            messages={{ label: 'Notas de versão' }}
            maxBlockSize="7rem"
            overscroll="auto"
          >
            <ScrollArea.Content>
              <Notes releases={RELEASES.slice(0, 2)} />
            </ScrollArea.Content>
          </ScrollArea>
        </Page>
      </Scene>
    </Grid>
  ),
};

function Growing() {
  const [count, setCount] = useState(2);

  return (
    <Stack gap={4}>
      <ScrollArea
        className="slotted-demo-frame"
        messages={{ label: 'Notas de versão' }}
        maxBlockSize="12rem"
      >
        <ScrollArea.Content>
          <Notes releases={RELEASES.slice(0, count)} />
        </ScrollArea.Content>
      </ScrollArea>
      <Inline gap={3}>
        <Button
          disabled={count >= RELEASES.length}
          onClick={() => setCount((value) => Math.min(value + 1, RELEASES.length))}
          size="sm"
          variant="outline"
        >
          Acrescentar uma nota
        </Button>
        <Button
          disabled={count <= 1}
          onClick={() => setCount((value) => Math.max(value - 1, 1))}
          size="sm"
          variant="outline"
        >
          Tirar uma
        </Button>
      </Inline>
    </Stack>
  );
}

export const Maximum: Story = {
  parameters: scenario('maximum'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="maxBlockSize — 12rem"
        note="Com duas notas a área tem a altura das duas e não rola. Acrescente notas: cresce até aos doze rem e passa a rolar, e a região com nome e ponto de tabulação aparece no mesmo instante em que o transbordo aparece."
      >
        <Growing />
      </Scene>
    </Grid>
  ),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Tab chega à região; o resto é da plataforma"
        note="Prima Tab até à área e depois as setas, PageDown, End e Home. A família não escreve nenhuma destas teclas — escreve só o ponto de tabulação que as torna alcançáveis."
      >
        <Framed messages={{ label: 'Notas de versão' }}>
          <Notes />
        </Framed>
      </Scene>
      <Scene
        label="tabbable={false} — um filho já recebe o foco"
        note="A ligação lá dentro já é um ponto de tabulação, e um segundo na porta de rolagem seria um que não faz nada. O Tab vai direto à ligação; o ponteiro continua a poder focar a área."
      >
        <Framed messages={{ label: 'Notas de versão' }} tabbable={false}>
          <Stack gap={4}>
            <Line tone="muted">
              A nota completa está em <Link href="#notas-de-versao">notas de versão 2026.9</Link>,
              que abre na mesma página.
            </Line>
            <Notes releases={RELEASES.slice(1)} />
          </Stack>
        </Framed>
      </Scene>
    </Grid>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={3}>
      <Scene
        label="Três caminhos sem quebra"
        note="Um token que não quebra rola no eixo em linha e é velado onde sai da caixa. A barra horizontal aparece por baixo dos três."
      >
        <Framed axis="both" messages={{ label: 'Ficheiros exportados' }}>
          <Paths />
        </Framed>
      </Scene>
      <Scene
        label="Uma tradução com o dobro do comprimento"
        note="Quebra e rola no eixo de bloco, como qualquer texto. O véu cai sobre a palavra que está a sair, não sobre um recuo."
      >
        <Framed messages={{ label: 'Änderungsprotokoll' }}>
          <Line tone="muted">{TRANSLATED}</Line>
        </Framed>
      </Scene>
      <Scene
        label="Três linhas que cabem"
        note="Nada transborda, por isso a área é uma caixa como outra qualquer: sem véu, sem barra, sem ponto de tabulação e sem papel."
      >
        <Framed messages={{ label: 'Notas de versão' }}>
          <Fits />
        </Framed>
      </Scene>
    </Grid>
  ),
};

function Driven() {
  const area = useRef<ScrollAreaHandle>(null);
  const last = useRef<HTMLParagraphElement>(null);
  const [block, setBlock] = useState(0);

  return (
    <Stack gap={4}>
      <ScrollArea
        className="slotted-demo-bound slotted-demo-frame"
        messages={{ label: 'Notas de versão' }}
        onScrollChange={(position) => setBlock(Math.round(position.block))}
        ref={area}
        render={(props) => <section {...props} />}
      >
        <ScrollArea.Content>
          <Stack gap={4}>
            <Notes releases={RELEASES.slice(0, 4)} />
            <Line id="ultima-nota" weight="semibold">
              <span ref={last}>2026.8.8 — Cobranças, a última linha</span>
            </Line>
          </Stack>
        </ScrollArea.Content>
      </ScrollArea>
      <Inline gap={3}>
        <Button onClick={() => area.current?.scrollToEdge('block-end')} size="sm" variant="outline">
          Fim
        </Button>
        <Button
          onClick={() => area.current?.scrollToEdge('block-start')}
          size="sm"
          variant="outline"
        >
          Início
        </Button>
        <Button
          onClick={() => last.current !== null && area.current?.reveal(last.current)}
          size="sm"
          variant="outline"
        >
          Revelar a última linha
        </Button>
        <Line tone="muted">{block} px desde o início</Line>
      </Inline>
    </Stack>
  );
}

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="ref, onScrollChange e render"
        note="Os botões movem a área pelo manípulo e nada em volta dela se mexe — reveal move o contentor sozinho, ao contrário de scrollIntoView. A posição é reportada em cada rolagem, e a moldura é uma section."
      >
        <Driven />
      </Scene>
    </Grid>
  ),
};

export const Print: Story = {
  parameters: scenario('print'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="No papel, tudo"
        note="Abra a pré-visualização de impressão desta página: a área larga o máximo e o recorte em @media print e imprime as seis notas, não as duas que estavam à vista. Nenhuma das cinco implementações pesquisadas o faz."
      >
        <Framed messages={{ label: 'Notas de versão' }}>
          <Notes />
        </Framed>
      </Scene>
    </Grid>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <SlottedProvider locale="pt-BR" catalogs={{ 'pt-BR': PT_BR }}>
      <Grid columns={3}>
        <Scene
          label="Transborda — uma região com nome"
          note="role=region, tabindex=0 e o nome do catálogo pt-BR: «Conteúdo rolável». Um leitor de ecrã ouve o nome ao entrar e usa as setas do próprio navegador."
        >
          <Framed>
            <RegionList />
          </Framed>
        </Scene>
        <Scene
          label="Cabe — nada"
          note="Sem papel, sem nome, sem ponto de tabulação. Um ponto de tabulação em conteúdo que cabe é um que não faz nada, e uma página com oito áreas teria oito."
        >
          <Framed>
            <Fits />
          </Framed>
        </Scene>
        <Scene
          label="Nomeada pelo título — labelledBy"
          note="O título por cima é o nome da região, na ordem em que o nome se resolve: labelledBy, depois messages.label, depois o catálogo."
        >
          <Stack gap={3}>
            <Line id="notas-titulo" weight="semibold">
              Regiões
            </Line>
            <Framed labelledBy="notas-titulo">
              <RegionList />
            </Framed>
          </Stack>
        </Scene>
      </Grid>
    </SlottedProvider>
  ),
};
