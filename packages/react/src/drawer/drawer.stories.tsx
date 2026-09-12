import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '../button';
import { Grid, Scene } from '../field/field-demo';
import { Skeleton } from '../skeleton';
import { TextField } from '../text-field';
import { Text } from '../typography';
import { Drawer } from './drawer';
import { DrawerDefaultsProvider } from './drawer-defaults';
import { Layer, Shell } from './drawer-demo';
import {
  DrawerBody,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerResizer,
  DrawerTitle,
  DrawerTrigger,
} from './drawer-parts';
import { REACT_DRAWER_DOCS, REACT_DRAWER_TOKENS } from './drawer.docs';
import type { DrawerHandle, DrawerProps } from './drawer.types';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_DRAWER_DOCS.scenes, {
    playground: Playground,
    mode: Mode,
    side: Side,
    size: Size,
    resize: Resize,
    snapPoints: SnapPoints,
    modal: Modal,
    policy: Policy,
    focus: Focus,
    loading: Loading,
    nested: Nested,
    content: Content,
    composition: Composition,
    defaults: Defaults,
    accessibility: Accessibility,
  }) as never;

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Drawer',
        description:
          'A panel that comes in from an edge, and either covers the page or stands beside it. One axis decides which, so a breakpoint can change it without taking the panel’s scroll position and focus with it; one cancellable request covers every way it closes; and the edge a reader drags is a separator a keyboard can move.',
        framework: 'React',
        ...REACT_DRAWER_DOCS,
        tokens: REACT_DRAWER_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * What a demonstration that stands open has to say for itself.
 *
 * A modal layer takes the page over: `dismissable-layer` writes `inert` on
 * every sibling up to the document root and locks the document scroll, and a
 * page carrying fifteen of them at once is a page nobody can scroll or click.
 * The first published version of these stories did exactly that — twenty-one
 * panels open, `body { overflow: hidden }` on a page twenty-three thousand
 * pixels tall, and one press anywhere closing fifteen of them at once, because
 * each read it as a press outside itself.
 *
 * So a scene that exists to be *looked at* is not modal, does not take focus
 * and cannot be dismissed. Nothing here changes the picture: the scrim belongs
 * to the layer rather than to the dismissal policy, so `modal` decides only
 * what happens to the page behind it. A scene that exists to be *operated*
 * keeps its real behaviour and is opened from a trigger, one at a time — which
 * is also what the reader does in an application.
 */
const STILL = {
  escape: 'none',
  initialFocus: false,
  modal: false,
  outsidePress: 'none',
} as const satisfies Partial<DrawerProps>;

/** One panel, written once, so a scene shows the axis rather than the markup. */
function Panel({
  actions = true,
  body = (
    <Text size="sm">Um drawer guarda uma tarefa secundária. A linha do meio é a que rola.</Text>
  ),
  container,
  description = 'Emitida em 12 de agosto, vence em 11 dias.',
  resizer = false,
  title = 'Fatura 4471',
  ...props
}: Partial<DrawerProps> & {
  actions?: boolean;
  body?: ReactNode;
  container: Element;
  description?: string | null;
  resizer?: boolean;
  title?: string;
}) {
  return (
    <Drawer container={container} defaultOpen {...STILL} {...props}>
      <DrawerPanel>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description === null ? null : <DrawerDescription>{description}</DrawerDescription>}
          <DrawerClose />
        </DrawerHeader>
        <DrawerBody>{body}</DrawerBody>
        {actions ? (
          <DrawerFooter>
            <Button size="sm" tone="secondary" variant="ghost">
              Cancelar
            </Button>
            <Button size="sm">Salvar</Button>
          </DrawerFooter>
        ) : null}
        {resizer ? <DrawerResizer /> : null}
      </DrawerPanel>
    </Drawer>
  );
}

/**
 * One line of its own. `Text` renders a `span`, so three of them in a drawer's
 * body ran together as `TodasRecentesArquivadas` on the published page — the
 * Angular page reads correctly because `p slText` is a block there.
 */
function Line({ children }: { children: ReactNode }) {
  return (
    <Text render={(props) => <p {...props} />} size="sm">
      {children}
    </Text>
  );
}

/**
 * The page an inline drawer stands beside, so the reflow is visible. The shell
 * primitive owns its inset: a story that padded it inline would answer no
 * density and no scheme, which is what `specs/reference-pages.test.mjs` refuses.
 */
function Page({ children }: { children?: ReactNode }) {
  return (
    <main>
      <Text size="sm" tone="muted">
        {children ??
          'Sem scrim, sem portal e sem z-index. O conteúdo ao lado reflui porque o grid do consumidor diz isso.'}
      </Text>
    </main>
  );
}

/**
 * The navigation a product would actually have, and not three words standing in
 * for one.
 *
 * `references/stories.md` asks for a real screen rather than a specimen, and the
 * inline scenes were the page's clearest failure of it: a panel called
 * "Coleções" holding "Todas", "Recentes" and "Arquivadas" beside a paragraph
 * describing the component. It demonstrated that the family renders. Real
 * labels, real counts and one awkward one — a queue with nothing in it — are
 * what show whether it holds.
 */
function Navigation() {
  return (
    <>
      <Text size="sm" weight="semibold">
        Contas a receber
      </Text>
      <Text size="sm">Vencidas · 14</Text>
      <Text size="sm">A vencer em 7 dias · 32</Text>
      <Text size="sm">Em conciliação · 3</Text>
      <Text size="sm" tone="muted">
        Contestações · nenhuma
      </Text>
      <Text size="sm" tone="muted">
        Baixas automáticas não conciliadas desde 02/09
      </Text>
    </>
  );
}

/** The invoice the navigation leads to. */
function Workbench() {
  return (
    <main>
      <Text size="lg" weight="semibold">
        NF-e 20 483 · Metalúrgica Boa Vista Ltda
      </Text>
      <Text size="sm" tone="muted">
        Emitida em 02/09/2026 · vence em 02/10/2026 · R$ 18 420,00 · vencida há 9 dias
      </Text>
      <Text size="sm" tone="muted">
        Arraste a aresta da barra lateral: a medida que ela publica é a mesma que este layout
        aplica.
      </Text>
    </main>
  );
}

export const Playground: Story = {
  args: {
    escape: 'close',
    loading: false,
    modal: true,
    mode: 'overlay',
    mount: 'active',
    outsidePress: 'close',
    side: 'end',
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <Layer>
      {(container) => (
        <Drawer {...args} container={container}>
          <DrawerTrigger
            render={({ children, ...props }) => <Button {...props}>{children}</Button>}
          >
            Abrir detalhes
          </DrawerTrigger>
          <DrawerPanel>
            <DrawerHeader>
              <DrawerTitle>Fatura 4471</DrawerTitle>
              <DrawerDescription>Emitida em 12 de agosto.</DrawerDescription>
              <DrawerClose />
            </DrawerHeader>
            <DrawerBody>
              <TextField aria-label="Observação" defaultValue="Aguardando conciliação" />
            </DrawerBody>
            <DrawerFooter>
              <Button size="sm" tone="secondary" variant="ghost">
                Cancelar
              </Button>
              <Button size="sm">Salvar</Button>
            </DrawerFooter>
          </DrawerPanel>
        </Drawer>
      )}
    </Layer>
  ),
};

export const Mode: Story = {
  parameters: scenario('mode'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="overlay — a layer over the page"
        note="Portalled, fixed to the viewport, with a scrim and the whole dismissal policy. In an application the containing block is the viewport; here it is the dashed box."
      >
        <Layer>{(container) => <Panel container={container} />}</Layer>
      </Scene>
      <Scene
        label="inline — a panel beside it"
        note="Sem portal, sem scrim e sem z-index: é uma barra lateral de verdade, com o separador na aresta e a fatura ao lado. A página reflui porque o grid do consumidor diz isso, que é o que substitui o push do Angular Material e o persistent do MUI."
      >
        <Shell>
          <Drawer defaultExtent={0.34} defaultOpen mode="inline" side="start" size="sm">
            <DrawerPanel render={(props) => <nav {...props} aria-label="Contas" />}>
              <DrawerHeader>
                <DrawerTitle>Recebíveis</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <Navigation />
              </DrawerBody>
              <DrawerResizer />
            </DrawerPanel>
          </Drawer>
          <Workbench />
        </Shell>
      </Scene>
    </Grid>
  ),
};

export const Side: Story = {
  parameters: scenario('side'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="end — the default"
        note="The edge a detail panel comes from in a left-to-right document, and the other one in a mirrored document. Switch the direction in the toolbar: the whole panel mirrors, including the separator."
      >
        <Layer>{(container) => <Panel container={container} size="sm" />}</Layer>
      </Scene>
      <Scene
        label="bottom — a sheet"
        note="The sheet keeps the two corners the reader can see and puts the separator above the header, which is where a hand looks for it. A side drawer keeps no corners at all: it reads as a wall rather than as a card."
      >
        <Layer>
          {(container) => (
            <Panel
              container={container}
              description={null}
              resizer
              side="bottom"
              size="sm"
              title="Filtrar faturas"
            />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const Size: Story = {
  parameters: scenario('size'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="sm — for a summary"
        note="Eighteen rems. Wide enough for a definition list and two actions, narrow enough that the page behind it is still legible under the scrim."
      >
        <Layer>{(container) => <Panel container={container} size="sm" />}</Layer>
      </Scene>
      <Scene
        label="xl — for a form"
        note="Forty rems, and a title one step larger to match. The step a two-column form needs; below it the columns stack and the panel reads as one long list of fields."
      >
        <Layer>
          {(container) => (
            <Panel container={container} size="xl" title="Editar dados de faturamento" />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const Resize: Story = {
  parameters: scenario('resize'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="A separator, not a prop"
        note="A aresta é o controlo, e vê-se sem lhe tocar: duas hairlines com a pega ao meio, que correm a calha inteira sob a mão. Chegue lá com Tab e use as setas — dezasseis pixels por toque, sessenta e quatro com Shift — Home e End vão aos limites, Enter colapsa e repõe, e o duplo clique volta à medida do passo de tamanho. O resizer do Ant e o arrasto do Vaul são só de ponteiro."
      >
        <Shell>
          <Drawer defaultExtent={0.32} defaultOpen minExtent={0.18} mode="inline" side="start">
            <DrawerPanel>
              <DrawerHeader>
                <DrawerTitle>Recebíveis</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <Navigation />
              </DrawerBody>
              <DrawerResizer />
            </DrawerPanel>
          </Drawer>
          <Page>
            A medida pública é uma fração da caixa em que o painel é medido, e é ela que vira
            aria-valuenow.
          </Page>
        </Shell>
      </Scene>
    </Grid>
  ),
};

export const SnapPoints: Story = {
  parameters: scenario('snapPoints'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Three heights, all reachable by keyboard"
        note="A snap point is a stop of the same separator, so an arrow moves between them and Home and End reach the first and last. Dragging the edge below the first stop asks to close, carrying pointer."
      >
        <Layer>
          {(container) => (
            <Panel
              actions={false}
              body={
                <Text size="sm">
                  Arraste a borda, ou use as setas: as paradas são 30%, 60% e 95% da camada.
                </Text>
              }
              container={container}
              defaultExtent={0.3}
              description={null}
              resizer
              side="bottom"
              snapPoints={[0.3, 0.6, 0.95]}
              title="Filtros"
            />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const Modal: Story = {
  parameters: scenario('modal'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="modal — the page is out of reach"
        note="Press Open: the scroll locks, everything outside the layer goes inert, and Tab wraps inside the panel. It is opened from a trigger because a modal layer takes the whole page over, and a page showing several at once would be lying about what one does."
      >
        <Layer>
          {(container) => (
            <Drawer container={container} size="sm">
              <DrawerTrigger
                render={({ children, ...props }) => <Button {...props}>{children}</Button>}
              >
                Abrir modal
              </DrawerTrigger>
              <DrawerPanel>
                <DrawerHeader>
                  <DrawerTitle>Modal</DrawerTitle>
                  <DrawerDescription>
                    A rolagem está travada e o resto da página está inert.
                  </DrawerDescription>
                  <DrawerClose />
                </DrawerHeader>
              </DrawerPanel>
            </Drawer>
          )}
        </Layer>
      </Scene>
      <Scene
        label="modal={false} — and no aria-modal"
        note="Nothing is inert, nothing is locked and focus is not contained, so the panel writes no aria-modal. The scrim stays: it belongs to the layer rather than to the dismissal policy, and it is why every still demonstration on this page can be this one."
      >
        <Layer>
          {(container) => <Panel container={container} modal={false} size="sm" title="Detalhes" />}
        </Layer>
      </Scene>
    </Grid>
  ),
};

function Guarded({ container }: { container: Element }) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(true);

  return (
    <>
      <Button onClick={() => setSaving((value) => !value)} size="sm" variant="outline">
        {saving ? 'Terminar de salvar' : 'Voltar a salvar'}
      </Button>
      <Button disabled={open} onClick={() => setOpen(true)} size="sm" variant="ghost">
        Abrir de novo
      </Button>
      <Drawer
        container={container}
        initialFocus={false}
        modal={false}
        onOpenChange={(next, request) => {
          if (!next && saving) return request.cancel();
          setOpen(next);
        }}
        open={open}
        size="sm"
      >
        <DrawerPanel>
          <DrawerHeader>
            <DrawerTitle>Salvando</DrawerTitle>
            <DrawerDescription>
              {saving
                ? 'Escape, um clique fora e o ✕ estão todos recusados pelo mesmo guard.'
                : 'O guard saiu: agora as cinco saídas funcionam.'}
            </DrawerDescription>
            <DrawerClose />
          </DrawerHeader>
        </DrawerPanel>
      </Drawer>
    </>
  );
}

export const Policy: Story = {
  parameters: scenario('policy'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="One guard, every way out"
        layout="stack"
        note="Press Escape, click the scrim, then the ✕: all three are refused by the same three lines, because they are one request carrying a reason rather than four callbacks. Let the save finish and the same three work."
      >
        <Layer>{(container) => <Guarded container={container} />}</Layer>
      </Scene>
    </Grid>
  ),
};

function Focused({ container }: { container: Element }) {
  const search = useRef<HTMLInputElement>(null);

  return (
    <Drawer container={container} initialFocus={search} size="sm">
      <DrawerTrigger render={({ children, ...props }) => <Button {...props}>{children}</Button>}>
        Buscar faturas
      </DrawerTrigger>
      <DrawerPanel>
        <DrawerHeader>
          <DrawerTitle>Buscar faturas</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>
        <DrawerBody>
          <TextField aria-label="Buscar" ref={search} />
        </DrawerBody>
      </DrawerPanel>
    </Drawer>
  );
}

export const Focus: Story = {
  parameters: scenario('focus'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="An overlay drawer takes focus"
        note="Press the trigger: initialFocus names the field rather than the first tabbable element, which here is the close button. Tab wraps inside the panel while it is modal, and Escape gives focus back to the trigger it came from."
      >
        <Layer>{(container) => <Focused container={container} />}</Layer>
      </Scene>
      <Scene
        label="An inline drawer takes none"
        note="Nothing moves when it opens: a sidebar that stole focus every time a breakpoint crossed would be unusable. It still gives focus back when it closes under the reader’s hands."
      >
        <Shell>
          <Drawer defaultOpen mode="inline" side="start" size="sm">
            <DrawerPanel>
              <DrawerHeader>
                <DrawerTitle>Recebíveis</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <Button size="sm" variant="ghost">
                  Vencidas · 14
                </Button>
                <Button size="sm" variant="ghost">
                  Em conciliação · 3
                </Button>
              </DrawerBody>
            </DrawerPanel>
          </Drawer>
          <Page>Angular Material faz a mesma separação: autoFocus é false no modo side.</Page>
        </Shell>
      </Scene>
    </Grid>
  ),
};

export const Loading: Story = {
  parameters: scenario('loading'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Open before the content arrived"
        note="The body carries aria-busy and keeps a floor, so the panel does not jump to size when the data lands. The header, the ✕ and Escape all stay operable."
      >
        <Layer>
          {(container) => (
            <Panel
              body={
                <div className="slotted-demo-stack">
                  <Skeleton shape="text" />
                  <Skeleton shape="text" />
                </div>
              }
              container={container}
              description={null}
              loading
              size="sm"
            />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const Nested: Story = {
  parameters: scenario('nested'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="A drawer opened from a drawer"
        note="Escape reaches the topmost layer only, and a layer that refuses stops the request reaching the one beneath. The depth comes from the single stack dismissable-layer keeps, so nothing here states a z-index."
      >
        <Layer>
          {(container) => (
            <Panel
              actions={false}
              body={
                <Drawer container={container} size="sm">
                  <DrawerTrigger
                    render={({ children, ...props }) => (
                      <Button {...props} size="sm" variant="outline">
                        {children}
                      </Button>
                    )}
                  >
                    Ver o item 3
                  </DrawerTrigger>
                  <DrawerPanel>
                    <DrawerHeader>
                      <DrawerTitle>Item 3</DrawerTitle>
                      <DrawerClose />
                    </DrawerHeader>
                    <DrawerBody>
                      <Text size="sm">Escape fecha este, e deixa o de baixo aberto.</Text>
                    </DrawerBody>
                  </DrawerPanel>
                </Drawer>
              }
              container={container}
              description={null}
              title="Pedido 118"
            />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

const LONG = (
  <Text size="sm">
    A linha do meio é o único trilho que rola. Limitada, ela rola; ilimitada, empurraria o rodapé
    para fora da tela e o leitor não alcançaria o botão. Vaul, MUI e Angular Material não entregam
    layout algum, então esse é o resultado padrão de seguir o exemplo de qualquer uma das três. Um
    terceiro parágrafo, para que haja o que rolar. E um quarto, que já está abaixo da dobra.
  </Text>
);

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A string the family did not choose"
        note="Um token de noventa caracteres sem espaços quebra em vez de alargar o painel: a medida mínima é zero e a quebra é permitida em qualquer ponto."
      >
        <Layer>
          {(container) => (
            <Panel
              actions={false}
              container={container}
              description={null}
              size="sm"
              title="relatorio-de-conciliacao-bancaria-consolidado-2026-08.csv"
            />
          )}
        </Layer>
      </Scene>
      <Scene
        label="A body longer than the layer"
        note="The header and the actions hold still while the middle row moves. This is the whole reason the panel is a three-row grid bounded to the layer."
      >
        <Layer>
          {(container) => (
            <Panel
              body={LONG}
              container={container}
              description={null}
              size="sm"
              title="Termos de uso"
            />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="The trigger is the library’s Button"
        note="render hands it every attribute the family wrote — aria-expanded, aria-controls, aria-haspopup and the id — so nothing is reimplemented and nothing is wrapped."
      >
        <Layer>
          {(container) => (
            <Drawer container={container} size="sm">
              <DrawerTrigger
                render={({ children, ...props }) => (
                  <Button {...props} tone="secondary" variant="outline">
                    {children}
                  </Button>
                )}
              >
                Abrir detalhes
              </DrawerTrigger>
              <DrawerPanel>
                <DrawerHeader>
                  <DrawerTitle>Fatura 4471</DrawerTitle>
                  <DrawerClose />
                </DrawerHeader>
                <DrawerBody>
                  <Text size="sm">O gatilho é o botão da biblioteca, com a fiação por cima.</Text>
                </DrawerBody>
              </DrawerPanel>
            </Drawer>
          )}
        </Layer>
      </Scene>
      <Scene
        label="The panel is the consumer’s landmark"
        note="An inline drawer writes no role, because a navigation drawer is a navigation landmark and a filter panel is complementary. render is where the consumer says which."
      >
        <Shell>
          <Drawer defaultOpen mode="inline" side="start" size="sm">
            <DrawerPanel render={(props) => <nav {...props} aria-label="Seções" />}>
              <DrawerHeader>
                <DrawerTitle>Seções</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <Line>Resumo da fatura</Line>
                <Line>Histórico de cobrança · 4 tentativas</Line>
              </DrawerBody>
            </DrawerPanel>
          </Drawer>
          <Page>O painel aqui é um nav, não um div com role.</Page>
        </Shell>
      </Scene>
    </Grid>
  ),
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="What the provider decides"
        note="side, size, mode, mount, modal, escape and outsidePress, set once for a subtree instead of repeated on every drawer in a product."
      >
        <DrawerDefaultsProvider side="start" size="sm">
          <Layer>{(container) => <Panel container={container} description={null} />}</Layer>
        </DrawerDefaultsProvider>
      </Scene>
      <Scene
        label="What the consumer decides anyway"
        note="An explicit value always wins over a provider, over inference and over derived state — the same rule every family in the library follows."
      >
        <DrawerDefaultsProvider side="start" size="sm">
          <Layer>
            {(container) => <Panel container={container} description={null} side="end" size="md" />}
          </Layer>
        </DrawerDefaultsProvider>
      </Scene>
    </Grid>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="What the title is wired to"
        note="It names the panel through aria-labelledby and it names the separator too, which is the Window Splitter pattern’s own rule: a separator is named for the pane it sizes."
      >
        <Shell>
          <Drawer defaultExtent={0.35} defaultOpen mode="inline" side="start">
            <DrawerPanel>
              <DrawerHeader>
                <DrawerTitle>Recebíveis</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <Navigation />
              </DrawerBody>
              <DrawerResizer />
            </DrawerPanel>
          </Drawer>
          <Page>
            Fechado, o painel recebe inert: o colapso que o olho lê e a ordem de foco concordam.
          </Page>
        </Shell>
      </Scene>
    </Grid>
  ),
};

/** The imperative actions, exercised where a reader can see what they do. */
export const Handle: Story = {
  parameters: { docs: { disable: true } },
  render: () => {
    const handle = useRef<DrawerHandle>(null);

    return (
      <Layer>
        {(container) => (
          <>
            <Button onClick={() => handle.current?.open()} size="sm">
              open()
            </Button>
            <Drawer container={container} ref={handle} size="sm">
              <DrawerPanel>
                <DrawerHeader>
                  <DrawerTitle>Aberto por código</DrawerTitle>
                  <DrawerClose />
                </DrawerHeader>
                <DrawerBody>
                  <Button onClick={() => handle.current?.close('done')} size="sm" variant="outline">
                    close(&apos;done&apos;)
                  </Button>
                </DrawerBody>
              </DrawerPanel>
            </Drawer>
          </>
        )}
      </Layer>
    );
  },
};
