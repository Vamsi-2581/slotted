import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '../button';
import { Card } from '../card';
import { Grid, Scene } from '../field/field-demo';
import { Skeleton } from '../skeleton';
import { TextField } from '../text-field';
import { Text } from '../typography';
import { AlertDialog, Dialog } from './dialog';
import { Layer } from './dialog-demo';
import { DialogDefaultsProvider } from './dialog-defaults';
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogIcon,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog-parts';
import { REACT_DIALOG_DOCS, REACT_DIALOG_TOKENS } from './dialog.docs';
import type { DialogHandle, DialogProps } from './dialog.types';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_DIALOG_DOCS.dialog.scenes, {
    playground: Playground,
    sizes: Sizes,
    placement: Placement,
    scroll: Scroll,
    surface: Surface,
    fullScreen: FullScreen,
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
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Dialog',
        description:
          'A window over the page, and the scrim that says the page is out of reach. One cancellable request for all six ways it can close, a panel whose actions stay on screen however long the body is, and a layer that keeps the theme of the region it was opened from.',
        framework: 'React',
        ...REACT_DIALOG_DOCS.dialog,
        tokens: REACT_DIALOG_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * What a demonstration that stands open has to say for itself.
 *
 * A modal layer takes the page over: `dismissable-layer` writes `inert` on every
 * sibling up to the document root and locks the document scroll, and a page
 * carrying a dozen of them at once is a page nobody can scroll or click. The
 * first published version of these stories did exactly that — one press
 * anywhere closed every panel at once, because each of them read it as a press
 * outside itself.
 *
 * So a scene that exists to be *looked at* is not modal, does not take focus and
 * cannot be dismissed. Nothing here changes the picture: `modal` decides what
 * happens to the page behind the scrim, never what the panel looks like. A scene
 * that exists to be *operated* keeps its real behaviour and is opened from a
 * trigger, one at a time — which is also what the reader does in an application.
 */
const STILL = {
  escape: 'none',
  initialFocus: false,
  modal: false,
  outsidePress: 'none',
} as const satisfies Partial<DialogProps>;

/** One panel, written once, so a scene shows the axis rather than the markup. */
function Panel({
  actions = true,
  body = <Text size="sm">Um diálogo guarda uma tarefa. A linha do meio é a única que rola.</Text>,
  container,
  description = 'O nome é visível para todo o espaço de trabalho.',
  title = 'Editar projeto',
  ...props
}: Partial<DialogProps> & {
  actions?: boolean;
  body?: ReactNode;
  container: Element;
  description?: string;
  title?: string;
}) {
  return (
    <Dialog container={container} defaultOpen {...STILL} {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <DialogClose />
        </DialogHeader>
        <DialogBody>{body}</DialogBody>
        {actions ? (
          <DialogFooter>
            <Button size="sm" tone="secondary" variant="ghost">
              Cancelar
            </Button>
            <Button size="sm">Salvar</Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export const Playground: Story = {
  args: {
    escape: 'close',
    fullScreen: 'narrow',
    loading: false,
    modal: true,
    mount: 'active',
    outsidePress: 'close',
    placement: 'center',
    scroll: 'content',
    size: 'md',
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <Layer>
      {(container) => (
        <Dialog {...args} container={container}>
          <DialogTrigger render={(props) => <Button {...props}>Editar projeto</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar projeto</DialogTitle>
              <DialogDescription>O nome é visível para todo o espaço.</DialogDescription>
              <DialogClose />
            </DialogHeader>
            <DialogBody>
              <TextField aria-label="Nome" defaultValue="Redesign da home" />
            </DialogBody>
            <DialogFooter>
              <Button size="sm" tone="secondary" variant="ghost">
                Cancelar
              </Button>
              <Button size="sm">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Layer>
  ),
};

export const Sizes: Story = {
  parameters: scenario('sizes'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="sm, for a question"
        note="Twenty-four rems. Wide enough for one sentence and two actions, narrow enough that the eye does not have to travel to read it."
      >
        <Layer>
          {(container) => <Panel container={container} size="sm" title="Arquivar projeto" />}
        </Layer>
      </Scene>
      <Scene
        label="xl, for a form"
        note="Fifty-six rems. The step a two-column form needs; below it the columns stack and the panel reads as one long list of fields."
      >
        <Layer>
          {(container) => (
            <Panel container={container} fullScreen="never" size="xl" title="Editar faturamento" />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="center"
        note="The default. Right for a panel whose height is settled before the reader touches it — a confirmation, a form with a fixed set of fields."
      >
        <Layer>{(container) => <Panel container={container} fullScreen="never" />}</Layer>
      </Scene>
      <Scene
        label="top"
        note="The panel keeps its distance from the start edge as it grows, so a textarea that gains a line does not slide the whole panel up under the cursor."
      >
        <Layer>
          {(container) => (
            <Panel container={container} fullScreen="never" placement="top" title="Comentário" />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

const LONG = (
  <Text size="sm">
    A linha do meio é o único trilho que rola. Limitada, ela rola; ilimitada, empurraria o rodapé
    para fora da tela e o leitor não alcançaria o botão. Radix e React Aria não entregam layout
    algum, então esse é o resultado padrão de seguir o exemplo de qualquer uma das duas. Um terceiro
    parágrafo, para que haja o que rolar. E um quarto. E um quinto, que já está abaixo da dobra.
  </Text>
);

export const Scroll: Story = {
  parameters: scenario('scroll'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="content — the body scrolls"
        note="The header and the actions hold still while the middle row moves. This is the default, and it is the whole reason the panel is a three-row grid bounded to the layer."
      >
        <Layer>
          {(container) => (
            <Panel body={LONG} container={container} fullScreen="never" title="Termos de uso" />
          )}
        </Layer>
      </Scene>
      <Scene
        label="viewport — the panel scrolls"
        note="For content that is read rather than acted on. The scrim stays where it is while the panel moves under it, because it is the other cell of the layer’s grid rather than a child of the box that scrolls."
      >
        <Layer>
          {(container) => (
            <Panel
              body={LONG}
              container={container}
              fullScreen="never"
              scroll="viewport"
              title="Termos de uso"
            />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const Surface: Story = {
  parameters: scenario('surface'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="panel — the family paints it"
        note="The default: a raised surface, a border that survives forced colours, a radius, a shadow, and the three rows that keep the actions on screen however long the body is."
      >
        <Layer>{(container) => <Panel container={container} fullScreen="never" />}</Layer>
      </Scene>
      <Scene
        label="plain — you paint it"
        note="No ground, no border, no radius, no shadow, no rows and no padding. The portal, the scrim, the focus containment and the dismissal policy are all still here; only the picture is yours."
      >
        <Layer>
          {(container) => (
            <Dialog container={container} defaultOpen {...STILL} fullScreen="never" surface="plain">
              <DialogContent>
                <Card fill="elevated">
                  <DialogTitle>Um card, dentro da layer</DialogTitle>
                  <DialogDescription>
                    A família não pinta nada aqui. Escape ainda fecha, o foco ainda fica contido.
                  </DialogDescription>
                </Card>
              </DialogContent>
            </Dialog>
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const FullScreen: Story = {
  parameters: scenario('fullScreen'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="never"
        note="The panel keeps its margins, its radius and its measure at every width. Right for a confirmation, which reads as an interruption rather than as a page."
      >
        <Layer>{(container) => <Panel container={container} fullScreen="never" size="sm" />}</Layer>
      </Scene>
      <Scene
        label="always"
        note="Edge to edge: no margins, no radius and no border, because a panel that covers the layer hides the scrim and the edge would separate it from nothing."
      >
        <Layer>{(container) => <Panel container={container} fullScreen="always" />}</Layer>
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
            <Dialog container={container} fullScreen="never">
              <DialogTrigger render={(props) => <Button {...props}>Abrir modal</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modal</DialogTitle>
                  <DialogDescription>
                    A rolagem está travada e o resto da página está inert.
                  </DialogDescription>
                  <DialogClose />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}
        </Layer>
      </Scene>
      <Scene
        label="modal={false} — and no aria-modal"
        note="Nothing is inert, nothing is locked and focus is not contained, so the panel writes no aria-modal. The APG warns that marking a dialog modal without all of that is worse for a screen-reader reader than not marking it at all — and it is why every still demonstration on this page is this one."
      >
        <Layer>
          {(container) => (
            <Panel container={container} fullScreen="never" modal={false} title="Detalhes" />
          )}
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
      <Dialog
        container={container}
        fullScreen="never"
        initialFocus={false}
        modal={false}
        onOpenChange={(next, request) => {
          if (!next && saving) return request.cancel();
          setOpen(next);
        }}
        open={open}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvando</DialogTitle>
            <DialogDescription>
              {saving
                ? 'Escape, um clique fora e o ✕ estão todos recusados pelo mesmo guard.'
                : 'O guard saiu: agora as seis saídas funcionam.'}
            </DialogDescription>
            <DialogClose />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Policy: Story = {
  parameters: scenario('policy'),
  render: () => (
    <Grid columns={3}>
      <Scene
        label="Three ways out"
        note="Press Abrir, then Escape, the scrim or the ✕: each closes it, and each carries its own reason — escape, outsidePress, dismiss. The scrim decides on the click, so a selection dragged out of the panel and let go over it closes nothing."
      >
        <Layer>{(container) => <Opened container={container} />}</Layer>
      </Scene>
      <Scene
        label="One guard, six ways out"
        layout="stack"
        note="Press Escape, click the scrim, then the ✕: all three are refused by the same three lines, because they are one request carrying a reason rather than four callbacks. Let the save finish and the same three work."
      >
        <Layer>{(container) => <Guarded container={container} />}</Layer>
      </Scene>
      <Scene
        label='outsidePress="none"'
        note="The scrim is not a way out: a press on it does nothing, while Escape and the ✕ still close it. For a form a stray click must not throw away."
      >
        <Layer>{(container) => <Opened container={container} outsidePress="none" />}</Layer>
      </Scene>
    </Grid>
  ),
};

function Opened({ container, ...props }: Partial<DialogProps> & { container: Element }) {
  return (
    <Dialog container={container} fullScreen="never" {...props}>
      <DialogTrigger render={(triggerProps) => <Button {...triggerProps}>Abrir</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar projeto</DialogTitle>
          <DialogDescription>Escape, a scrim e o ✕ são as três saídas.</DialogDescription>
          <DialogClose />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function Named({ container }: { container: Element }) {
  const second = useRef<HTMLInputElement>(null);

  return (
    <Dialog container={container} fullScreen="never" initialFocus={second} size="lg">
      <DialogTrigger render={(props) => <Button {...props}>Convidar alguém</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar alguém</DialogTitle>
          <DialogDescription>O foco não cai no primeiro campo, e sim no segundo.</DialogDescription>
          <DialogClose />
        </DialogHeader>
        <DialogBody>
          <TextField aria-label="Time" defaultValue="Equipe de produto" />
          <TextField aria-label="E-mail" ref={second} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export const Focus: Story = {
  parameters: scenario('focus'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The first tabbable element"
        note="The default, and the pattern’s own. Tab from here and the ring never leaves the panel; Escape closes it and the ring is back on the trigger, not on the top of the page."
      >
        <Layer>
          {(container) => (
            <Dialog container={container} fullScreen="never">
              <DialogTrigger render={(props) => <Button {...props}>Abrir</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Renomear</DialogTitle>
                  <DialogDescription>O foco entra e volta.</DialogDescription>
                  <DialogClose />
                </DialogHeader>
                <DialogBody>
                  <TextField aria-label="Nome" />
                </DialogBody>
              </DialogContent>
            </Dialog>
          )}
        </Layer>
      </Scene>
      <Scene
        label="An element the consumer names"
        note="Press Convidar: the caret starts in the second field rather than the first, because initialFocus takes a ref. Opened from a trigger, because where focus goes on open cannot be shown by a panel that was already open."
      >
        <Layer>{(container) => <Named container={container} />}</Layer>
      </Scene>
    </Grid>
  ),
};

export const Loading: Story = {
  parameters: scenario('loading'),
  render: () => (
    <Scene
      label="Open before its content arrived"
      note="The body carries aria-busy and holds a floor, so the panel does not jump when the data lands. The ✕ and Escape both still work: a dialog a reader cannot leave is the worse failure."
    >
      <Layer>
        {(container) => (
          <Panel
            body={
              <>
                <Skeleton shape="text" />
                <Skeleton shape="text" />
              </>
            }
            container={container}
            description="Buscando os itens da fatura."
            fullScreen="never"
            loading
            title="Fatura 4471"
          />
        )}
      </Layer>
    </Scene>
  ),
};

export const Nested: Story = {
  parameters: scenario('nested'),
  render: () => (
    <Scene
      label="A confirmation over a dialog"
      note="Press Cancelar assinatura, then Escape once: only the confirmation closes, because dismissable-layer asks the topmost layer and stops there. The depth comes from the single stack, so neither layer states a z-index."
    >
      <Layer>
        {(container) => (
          <Dialog container={container} defaultOpen {...STILL} fullScreen="never" size="lg">
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Faturamento</DialogTitle>
                <DialogDescription>A camada de baixo.</DialogDescription>
                <DialogClose />
              </DialogHeader>
              <DialogBody>
                <AlertDialog container={container}>
                  <DialogTrigger
                    render={(props) => (
                      <Button {...props} size="sm" tone="danger" variant="outline">
                        Cancelar assinatura
                      </Button>
                    )}
                  />
                  <DialogContent>
                    <DialogHeader>
                      <AlertDialogIcon />
                      <DialogTitle>Cancelar a assinatura?</DialogTitle>
                      <DialogDescription>A cobrança para no fim do período.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <AlertDialogCancel
                        render={({ children, ...props }) => (
                          <Button {...props} size="sm" tone="secondary" variant="outline">
                            {children}
                          </Button>
                        )}
                      >
                        Manter
                      </AlertDialogCancel>
                      <AlertDialogAction
                        render={({ children, ...props }) => (
                          <Button {...props} size="sm" tone="danger">
                            {children}
                          </Button>
                        )}
                      >
                        Cancelar assinatura
                      </AlertDialogAction>
                    </DialogFooter>
                  </DialogContent>
                </AlertDialog>
              </DialogBody>
            </DialogContent>
          </Dialog>
        )}
      </Layer>
    </Scene>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A title with nowhere to break"
        note="Sixty-two characters and no space in any of them. Without overflow-wrap the centred panel would widen past both edges of the layer at once, and neither edge would be reachable."
      >
        <Layer>
          {(container) => (
            <Panel
              actions={false}
              container={container}
              description="Bestätigungsdialog für unwiderrufliche Aktionen mit einer außergewöhnlich langen Beschreibung."
              fullScreen="never"
              size="sm"
              title="deployment-pipeline-eu-west-1-production-rollback-2026-09-04T01"
            />
          )}
        </Layer>
      </Scene>
      <Scene
        label="A panel with no body at all"
        note="A header and a footer with nothing between them draw one rule, not two: every rule belongs to the row below it. When the two rows together are taller than the layer, the layer scrolls."
      >
        <Layer>
          {(container) => (
            <Panel
              body={null}
              container={container}
              description="O projeto sai do espaço de trabalho."
              fullScreen="never"
              size="sm"
              title="Arquivar projeto"
            />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

function Imperative({ container }: { container: Element }) {
  const handle = useRef<DialogHandle>(null);
  const [result, setResult] = useState<string | undefined>(undefined);

  return (
    <>
      <Button onClick={() => handle.current?.open()} size="sm" variant="outline">
        Abrir do código
      </Button>
      <Text size="sm">
        {result === undefined ? 'Sem resultado ainda.' : `Resultado: ${result}`}
      </Text>
      <Dialog
        container={container}
        fullScreen="never"
        onOpenChange={(_open, request) => setResult(request.result)}
        ref={handle}
        size="sm"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sem gatilho</DialogTitle>
            <DialogDescription>
              Aberto por handle.open(), fechado com um resultado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={({ children, ...props }) => (
                <Button {...props} size="sm">
                  {children}
                </Button>
              )}
              value="salvo"
            >
              Salvar
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The trigger is a Button"
        note="render hands the consumer’s own control every attribute the family wrote — aria-haspopup, aria-expanded, aria-controls and the press — so nothing is wrapped and nothing is reimplemented."
      >
        <Layer>
          {(container) => (
            <Dialog container={container} fullScreen="never" size="sm">
              <DialogTrigger
                render={(props) => (
                  <Button {...props} tone="secondary" variant="outline">
                    Editar projeto
                  </Button>
                )}
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar projeto</DialogTitle>
                  <DialogDescription>O gatilho é um Button.</DialogDescription>
                  <DialogClose />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}
        </Layer>
      </Scene>
      <Scene
        label="Opening from code, and reading the result"
        layout="stack"
        note="The ref on Dialog is a handle with open, close and focus. The close carries a value, which arrives on the request as the result — what the platform calls returnValue."
      >
        <Layer>{(container) => <Imperative container={container} />}</Layer>
      </Scene>
    </Grid>
  ),
};

export const Defaults: Story = {
  parameters: scenario('defaults'),
  render: () => (
    <Scene
      label="Eight decisions, taken once"
      note="The provider sets the size, the placement and the full-screen policy for everything under it; the second panel states a size of its own and wins, because an explicit consumer value always does."
    >
      <DialogDefaultsProvider fullScreen="never" placement="top" size="sm">
        <Grid columns={2}>
          <Scene label="From the provider" note="No size prop at all: it is the provider’s sm.">
            <Layer>{(container) => <Panel container={container} title="Do provider" />}</Layer>
          </Scene>
          <Scene label="Stated on the dialog" note='size="lg" on this one, over the provider’s sm.'>
            <Layer>
              {(container) => <Panel container={container} size="lg" title="Do próprio diálogo" />}
            </Layer>
          </Scene>
        </Grid>
      </DialogDefaultsProvider>
    </Scene>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Scene
      label="Tab, Shift+Tab and Escape"
      note="Tab from the last control and the ring lands on the first, not on the page behind. Escape closes and focus is back on the trigger. Both are @slotted/core/focus, because the platform’s dialog element is declined."
    >
      <Layer>
        {(container) => (
          <Dialog container={container} fullScreen="never">
            <DialogTrigger render={(props) => <Button {...props}>Abrir e tabular</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Três paradas de tabulação</DialogTitle>
                <DialogDescription>
                  O ✕, o campo e o botão. Tab no último volta para o primeiro.
                </DialogDescription>
                <DialogClose />
              </DialogHeader>
              <DialogBody>
                <TextField aria-label="Nome" />
              </DialogBody>
              <DialogFooter>
                <Button size="sm">Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </Layer>
    </Scene>
  ),
};
