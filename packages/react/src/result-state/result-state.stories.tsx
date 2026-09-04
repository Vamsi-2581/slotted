import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';

import { Button } from '../button';
import { Card, CardBody } from '../card';
import { Container } from '../container';
import { Link } from '../link';
import { ResultState } from './result-state';
import { ResultStateDefaultsProvider } from './result-state-defaults';
import { BoardIllustration, Grid, Panel, Scene } from './result-state-demo';
import {
  ResultStateActions,
  ResultStateContent,
  ResultStateDescription,
  ResultStateFooter,
  ResultStateTitle,
} from './result-state-parts';
import { REACT_RESULT_STATE_DOCS, REACT_RESULT_STATE_TOKENS } from './result-state.docs';
import type { ResultStateStatus } from './result-state.types';

const STATUSES: readonly { status: ResultStateStatus; title: string; body: string }[] = [
  {
    status: 'empty',
    title: 'Nenhum projeto ainda',
    body: 'A coleção existe e não tem nada dentro.',
  },
  {
    status: 'no-results',
    title: 'Nada corresponde ao filtro',
    body: 'Uma busca ou um filtro não encontrou nada.',
  },
  {
    status: 'not-found',
    title: 'Esta página não existe',
    body: 'O recurso pedido não está aqui.',
  },
  {
    status: 'error',
    title: 'A execução falhou',
    body: 'Uma falha em que o leitor pode agir.',
  },
  {
    status: 'forbidden',
    title: 'Você não tem acesso',
    body: 'O leitor não tem permissão de ver.',
  },
  {
    status: 'offline',
    title: 'Sem conexão',
    body: 'A conexão com o servidor caiu.',
  },
  {
    status: 'success',
    title: 'Tudo publicado',
    body: 'O fluxo terminou e não há mais nada a fazer.',
  },
];

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_RESULT_STATE_DOCS.resultState.scenes, {
    playground: Playground,
    statuses: Statuses,
    reach: Reach,
    align: Align,
    media: Media,
    actions: Actions,
    live: Live,
    content: Content,
    composition: Composition,
    accessibility: Accessibility,
  }) as never;

const meta = {
  title: 'Components/Result State',
  component: ResultState,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Result State',
        description:
          'The region that stands in for content that is not there — no data yet, no match, a failure, a permission problem, a lost connection, a finished flow — and says what to do next. It holds no state of its own and announces its text without announcing its buttons.',
        framework: 'React',
        ...REACT_RESULT_STATE_DOCS.resultState,
        tokens: REACT_RESULT_STATE_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof ResultState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    align: 'center',
    hideMedia: false,
    live: 'polite',
    reach: 'section',
    status: 'empty',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <Panel>
        <ResultState {...args}>
          <ResultStateContent>
            <ResultStateTitle>Nenhum projeto ainda</ResultStateTitle>
            <ResultStateDescription>
              Crie um projeto para começar a coletar execuções e comparar resultados.
            </ResultStateDescription>
          </ResultStateContent>
          <ResultStateActions>
            <Button size="sm">Criar projeto</Button>
            <Button size="sm" variant="outline">
              Importar
            </Button>
          </ResultStateActions>
          <ResultStateFooter>
            <Link href="#projects">O que é um projeto?</Link>
          </ResultStateFooter>
        </ResultState>
      </Panel>
    </div>
  ),
};

export const Statuses: Story = {
  parameters: scenario('statuses'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="The seven, at the reach a list of them belongs in"
        note="Each status draws the glyph the contract maps it to and paints in the tone it names, so a permission problem and a failed request differ by silhouette as well as by colour."
      >
        {STATUSES.map(({ body, status, title }) => (
          <ResultState align="start" key={status} live="off" reach="inline" status={status}>
            <ResultStateContent>
              <ResultStateTitle>{title}</ResultStateTitle>
              <ResultStateDescription>{body}</ResultStateDescription>
            </ResultStateContent>
          </ResultState>
        ))}
      </Scene>
      <Scene
        label="The same seven with no colour at all"
        note="Switch the toolbar to high-contrast: every ground becomes the page’s own white and every mark black, and the shape is the only thing left telling the seven apart. WCAG 2.2 1.4.1."
      >
        {STATUSES.map(({ status, title }) => (
          <ResultState align="start" key={status} live="off" reach="inline" status={status}>
            <ResultStateContent>
              <ResultStateTitle>{title}</ResultStateTitle>
            </ResultStateContent>
          </ResultState>
        ))}
      </Scene>
    </Grid>
  ),
};

export const Reach: Story = {
  parameters: scenario('reach'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="inline, inside the cell it replaces the contents of"
        note="A row: the mark at control-glyph size, the words beside it, and the control on the same line. No illustration box at all — the guide asks that one not dominate a dense operational screen."
      >
        <Panel>
          <ResultState live="off" reach="inline" status="no-results">
            <ResultStateContent>
              <ResultStateTitle>Nenhuma linha corresponde ao filtro</ResultStateTitle>
            </ResultStateContent>
            <ResultStateActions>
              <Button size="sm" tone="secondary" variant="ghost">
                Limpar filtros
              </Button>
            </ResultStateActions>
          </ResultState>
        </Panel>
      </Scene>
      <Scene
        label="section, inside a card or a panel"
        note="The default. The mark takes the middle control height, the title the type scale’s xl step, and the description sits two steps below it so the two lines read in an order."
      >
        <Panel>
          <ResultState live="off" status="empty">
            <ResultStateContent>
              <ResultStateTitle>Nenhum ambiente configurado</ResultStateTitle>
              <ResultStateDescription>
                Um ambiente guarda as variáveis e os segredos de uma implantação.
              </ResultStateDescription>
            </ResultStateContent>
            <ResultStateActions>
              <Button>Criar ambiente</Button>
            </ResultStateActions>
          </ResultState>
        </Panel>
      </Scene>
      <Scene
        label="page, for the whole route"
        note="A mark half again the largest control and a title at the type scale’s top step — the size a page-level heading takes here, and one no control font size can reach."
      >
        <ResultState live="off" reach="page" status="not-found">
          <ResultStateContent>
            <ResultStateTitle render={(props) => <h2 {...props} />}>
              Esta página não existe
            </ResultStateTitle>
            <ResultStateDescription>
              O endereço pode ter mudado, ou o projeto pode ter sido arquivado.
            </ResultStateDescription>
          </ResultStateContent>
          <ResultStateActions>
            <Button>Ir para o início</Button>
            <Button variant="outline">Voltar</Button>
          </ResultStateActions>
          <ResultStateFooter>
            <Link href="#status">Ver o estado dos serviços</Link>
          </ResultStateFooter>
        </ResultState>
      </Scene>
    </Grid>
  ),
};

export const Align: Story = {
  parameters: scenario('align'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="center, the default"
        note="For a panel or a route, where the region is the only thing on the screen and a centred column reads as a considered page rather than as an interruption."
      >
        <Panel>
          <ResultState align="center" live="off" status="forbidden">
            <ResultStateContent>
              <ResultStateTitle>Você não tem acesso a este relatório</ResultStateTitle>
              <ResultStateDescription>
                Peça acesso ao responsável do espaço de trabalho.
              </ResultStateDescription>
            </ResultStateContent>
            <ResultStateActions>
              <Button size="sm">Pedir acesso</Button>
            </ResultStateActions>
          </ResultState>
        </Panel>
      </Scene>
      <Scene
        label="start, for a data-dense screen"
        note="Carbon left-aligns its empty states inside data-dense views and the other six surveyed implementations centre unconditionally. Both readings are real, and this is one axis rather than a second family."
      >
        <Panel>
          <ResultState align="start" live="off" status="forbidden">
            <ResultStateContent>
              <ResultStateTitle>Você não tem acesso a este relatório</ResultStateTitle>
              <ResultStateDescription>
                Peça acesso ao responsável do espaço de trabalho.
              </ResultStateDescription>
            </ResultStateContent>
            <ResultStateActions>
              <Button size="sm">Pedir acesso</Button>
            </ResultStateActions>
          </ResultState>
        </Panel>
      </Scene>
    </Grid>
  ),
};

export const Media: Story = {
  parameters: scenario('media'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="The page’s own artwork, in the box the family keeps"
        note="The box is sized before anything is in it, so an illustration that has not loaded reserves the space it will occupy and the title below it never moves. Atlassian spends four props on this and Polaris a skeleton with an effect."
      >
        <Panel>
          <ResultState live="off" media={<BoardIllustration />} reach="page" status="empty">
            <ResultStateContent>
              <ResultStateTitle>Comece pelo primeiro quadro</ResultStateTitle>
              <ResultStateDescription>
                Um quadro guarda cartões, colunas e as pessoas que trabalham neles.
              </ResultStateDescription>
            </ResultStateContent>
            <ResultStateActions>
              <Button>Criar quadro</Button>
            </ResultStateActions>
          </ResultState>
        </Panel>
      </Scene>
      <Scene
        label="No mark at all"
        note="hideMedia, for a region whose title is the whole of it — a cell that has room for one line, or a panel that carries its own artwork above the region."
      >
        <Panel>
          <ResultState hideMedia live="off" status="empty">
            <ResultStateContent>
              <ResultStateTitle>Sem marca</ResultStateTitle>
              <ResultStateDescription>
                A região começa no título e mantém o mesmo ritmo.
              </ResultStateDescription>
            </ResultStateContent>
          </ResultState>
        </Panel>
      </Scene>
    </Grid>
  ),
};

export const Actions: Story = {
  parameters: scenario('actions'),
  render: function ActionsStory() {
    const [retrying, setRetrying] = useState(false);

    return (
      <Grid columns={1}>
        <Scene
          label="Two controls, a link that is not one, and a retry in flight"
          note="The controls are the consumer’s own Buttons, outside the live region — a reader hearing the message is not read two button labels in the middle of it. Press Tentar de novo: the pending state belongs to button, not here."
        >
          <Panel>
            <ResultState live="off" status="error">
              <ResultStateContent>
                <ResultStateTitle>A execução falhou</ResultStateTitle>
                <ResultStateDescription>
                  Nenhum artefato foi escrito. Tente novamente ou abra o registro completo.
                </ResultStateDescription>
              </ResultStateContent>
              <ResultStateActions>
                <Button
                  loading={retrying}
                  onClick={() => {
                    setRetrying(true);
                    setTimeout(() => setRetrying(false), 1600);
                  }}
                  tone="danger"
                >
                  Tentar de novo
                </Button>
                <Button variant="outline">Abrir registro</Button>
              </ResultStateActions>
              <ResultStateFooter>
                <Link href="#retries">Como as tentativas são contadas</Link>
              </ResultStateFooter>
            </ResultState>
          </Panel>
        </Scene>
        <Scene
          label="The same row in a column narrow enough to break it"
          note="Below a container width of 20rem the controls stack and keep their own widths: how wide a control is belongs to the control, and button already ships fullWidth for a consumer who wants it."
        >
          <div className="slotted-demo-measure">
            <Panel>
              <ResultState live="off" status="error">
                <ResultStateContent>
                  <ResultStateTitle>A execução falhou</ResultStateTitle>
                </ResultStateContent>
                <ResultStateActions>
                  <Button size="sm" tone="danger">
                    Tentar de novo
                  </Button>
                  <Button size="sm" variant="outline">
                    Abrir registro
                  </Button>
                </ResultStateActions>
              </ResultState>
            </Panel>
          </div>
        </Scene>
      </Grid>
    );
  },
};

export const Live: Story = {
  parameters: scenario('live'),
  render: function LiveStory() {
    const [query, setQuery] = useState<'idle' | 'empty'>('idle');

    return (
      <Grid columns={1}>
        <Scene
          label="A region that arrives after the page did"
          note="Press the button and the results are replaced by a polite status region, which is the moment WCAG 2.2 SC 4.1.3 is about. Nothing takes focus: the reader hears the message where they are."
        >
          <ResultStateActions>
            <Button onClick={() => setQuery(query === 'idle' ? 'empty' : 'idle')} size="sm">
              {query === 'idle' ? 'Filtrar por “relatório trimestral”' : 'Limpar o filtro'}
            </Button>
          </ResultStateActions>
          <Panel>
            {query === 'idle' ? (
              <ResultState hideMedia live="off" reach="inline">
                <ResultStateContent>
                  <ResultStateDescription>
                    Quatro relatórios listados. Filtre para ver a região aparecer.
                  </ResultStateDescription>
                </ResultStateContent>
              </ResultState>
            ) : (
              <ResultState live="polite" status="no-results">
                <ResultStateContent>
                  <ResultStateTitle>Nada corresponde a “relatório trimestral”</ResultStateTitle>
                  <ResultStateDescription>
                    Tente outra palavra, ou limpe o filtro para ver tudo de novo.
                  </ResultStateDescription>
                </ResultStateContent>
              </ResultState>
            )}
          </Panel>
        </Scene>
        <Scene
          label="The loud one, and the opt-out"
          note="assertive writes role=alert and interrupts, which a failed save earns and an empty list does not. off is for a page that already owns a live region around this one, where polite would announce the same message twice."
        >
          <Panel>
            <ResultState live="assertive" status="error">
              <ResultStateContent>
                <ResultStateTitle>A conexão caiu durante o envio</ResultStateTitle>
              </ResultStateContent>
            </ResultState>
          </Panel>
          <Panel>
            <ResultState live="off" status="empty">
              <ResultStateContent>
                <ResultStateTitle>Nenhum item</ResultStateTitle>
              </ResultStateContent>
            </ResultState>
          </Panel>
        </Scene>
      </Grid>
    );
  },
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A title no language breaks, and a digest that breaks nowhere"
        note="Both wrap rather than overflow, and nothing is removed from the DOM to make them fit: the whole string stays readable to assistive technology and findable by a page search."
      >
        <div className="slotted-demo-measure">
          <Panel>
            <ResultState live="off" status="error">
              <ResultStateContent>
                <ResultStateTitle>
                  Grundstücksverkehrsgenehmigungszuständigkeitsübertragungsverordnung
                </ResultStateTitle>
                <ResultStateDescription>
                  A execução sha256:9f2c1a7b4e0d8c6f5a3b2e1d0c9b8a7f6e5d4c3b2a1908f7e6d5c4b3a2
                  falhou antes de escrever qualquer artefato.
                </ResultStateDescription>
              </ResultStateContent>
            </ResultState>
          </Panel>
        </div>
      </Scene>
      <Scene
        label="A title standing alone, and a description standing alone"
        note="Two of the four rows are absent in each, and the vertical rhythm holds: the gap belongs to the grid rather than to margins the parts carry, so an absent part costs nothing."
      >
        <Panel>
          <ResultState live="off" status="success">
            <ResultStateContent>
              <ResultStateTitle>Tudo publicado</ResultStateTitle>
            </ResultStateContent>
          </ResultState>
        </Panel>
        <Panel>
          <ResultState live="off" status="empty">
            <ResultStateContent>
              <ResultStateDescription>
                Uma região com descrição e sem título não é um landmark, e não finge ser.
              </ResultStateDescription>
            </ResultStateContent>
          </ResultState>
        </Panel>
      </Scene>
    </Grid>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="The measure belongs to container"
        note="This family caps no width: two families offering a maximum measure would be two answers to one question. A page-wide region with no measure around it sets a centred sentence the full width of the route."
      >
        <Container inset={0} size="measure">
          <ResultState live="off" reach="page" status="no-results">
            <ResultStateContent>
              <ResultStateTitle>Nada corresponde a “relatório trimestral”</ResultStateTitle>
              <ResultStateDescription>
                Tente outra palavra, ou limpe os três filtros ativos para ver tudo de novo.
              </ResultStateDescription>
            </ResultStateContent>
            <ResultStateActions>
              <Button>Limpar filtros</Button>
            </ResultStateActions>
          </ResultState>
        </Container>
      </Scene>
      <Scene
        label="The frame belongs to card"
        note="For the same reason: the region draws no box of its own, so the card’s three fills and its own padding scale are what a consumer reaches for when the empty state needs a frame."
      >
        <Card>
          <CardBody>
            <ResultState live="off" status="empty">
              <ResultStateContent>
                <ResultStateTitle>Nenhum membro convidado</ResultStateTitle>
                <ResultStateDescription>
                  Convide alguém para dividir os quadros deste espaço de trabalho.
                </ResultStateDescription>
              </ResultStateContent>
              <ResultStateActions>
                <Button size="sm">Convidar</Button>
              </ResultStateActions>
            </ResultState>
          </CardBody>
        </Card>
      </Scene>
      <Scene
        label="The defaults an application sets once"
        note="Both regions below are written with no axis on them at all; the provider makes them inline and start-aligned, which is what a screen full of tables wants. An explicit prop on one region still wins."
      >
        <ResultStateDefaultsProvider align="start" live="off" reach="inline" status="no-results">
          <Panel>
            <ResultState>
              <ResultStateContent>
                <ResultStateTitle>Nenhuma execução neste período</ResultStateTitle>
              </ResultStateContent>
            </ResultState>
          </Panel>
          <Panel>
            <ResultState status="offline">
              <ResultStateContent>
                <ResultStateTitle>Sem conexão com o servidor de métricas</ResultStateTitle>
              </ResultStateContent>
            </ResultState>
          </Panel>
        </ResultStateDefaultsProvider>
      </Scene>
    </Grid>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: function AccessibilityStory() {
    const region = useRef<HTMLElement>(null);

    return (
      <Grid columns={1}>
        <Scene
          label="The keyboard goes there when the application says so"
          note="Press the button: focus lands on the region and the ring appears. Tab from here and it leaves — the region carries tabindex=-1, so it is reachable and not in the sequence, and the family never moves focus by itself."
        >
          <ResultStateActions>
            <Button onClick={() => region.current?.focus()} size="sm" variant="outline">
              Mandar o teclado para a região
            </Button>
          </ResultStateActions>
          <Panel>
            <ResultState live="off" ref={region} status="no-results">
              <ResultStateContent>
                <ResultStateTitle>Nada corresponde ao filtro</ResultStateTitle>
                <ResultStateDescription>
                  Uma tabela que acabou de esvaziar pode mandar o leitor para cá.
                </ResultStateDescription>
              </ResultStateContent>
              <ResultStateActions>
                <Button size="sm">Limpar filtros</Button>
              </ResultStateActions>
            </ResultState>
          </Panel>
        </Scene>
        <Scene
          label="Named, and unnamed"
          note="The left region is a landmark called by its own title; the right one has no title, so no aria-labelledby is written at all — the APG requires a region landmark to have a label, and one pointing at nothing has neither."
        >
          <Panel>
            <ResultState live="polite" status="empty">
              <ResultStateContent>
                <ResultStateTitle>Nenhum projeto ainda</ResultStateTitle>
              </ResultStateContent>
            </ResultState>
          </Panel>
          <Panel>
            <ResultState live="polite" status="empty">
              <ResultStateContent>
                <ResultStateDescription>Nenhum projeto ainda.</ResultStateDescription>
              </ResultStateContent>
            </ResultState>
          </Panel>
        </Scene>
      </Grid>
    );
  },
};
