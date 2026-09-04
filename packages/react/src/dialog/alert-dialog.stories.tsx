import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { Button } from '../button';
import { Grid, Scene } from '../field/field-demo';
import { Text } from '../typography';
import { AlertDialog } from './dialog';
import { Layer } from './dialog-demo';
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogIcon,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog-parts';
import { REACT_DIALOG_DOCS, REACT_DIALOG_TOKENS } from './dialog.docs';
import type { AlertDialogProps } from './dialog.types';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_DIALOG_DOCS.alertDialog.scenes, {
    playground: Playground,
    tones: Tones,
    actions: Actions,
    policy: Policy,
    focus: Focus,
    content: Content,
    composition: Composition,
    accessibility: Accessibility,
  }) as never;

const meta = {
  title: 'Components/Dialog/AlertDialog',
  component: AlertDialog,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'AlertDialog',
        description:
          'A dialog that interrupts to confirm something irreversible. The two rules the pattern gives it — an outside press never closes it, and focus lands on the least destructive action — are defaults of the member rather than props a consumer remembers to set.',
        framework: 'React',
        ...REACT_DIALOG_DOCS.alertDialog,
        tokens: REACT_DIALOG_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function Confirm({
  action = 'Excluir projeto',
  body,
  cancel = 'Manter projeto',
  container,
  description = 'O projeto e seus 42 documentos saem para todo mundo. Isso não pode ser desfeito.',
  title = 'Excluir este projeto?',
  ...props
}: Partial<AlertDialogProps> & {
  action?: string;
  body?: ReactNode;
  cancel?: string;
  container: Element;
  description?: string;
  title?: string;
}) {
  return (
    <AlertDialog container={container} defaultOpen {...props}>
      <DialogContent>
        <DialogHeader>
          <AlertDialogIcon />
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {body === undefined ? null : <DialogBody>{body}</DialogBody>}
        <DialogFooter>
          <AlertDialogCancel
            render={({ children, ...control }) => (
              <Button {...control} size="sm" tone="secondary" variant="outline">
                {children}
              </Button>
            )}
          >
            {cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            render={({ children, ...control }) => (
              <Button {...control} size="sm" tone={props.tone === 'warning' ? 'warning' : 'danger'}>
                {children}
              </Button>
            )}
          >
            {action}
          </AlertDialogAction>
        </DialogFooter>
      </DialogContent>
    </AlertDialog>
  );
}

export const Playground: Story = {
  args: { escape: 'close', loading: false, placement: 'center', size: 'sm', tone: 'danger' },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <Layer>
      {(container) => (
        <AlertDialog {...args} container={container}>
          <DialogTrigger
            render={(props) => (
              <Button {...props} tone="danger" variant="outline">
                Excluir projeto
              </Button>
            )}
          />
          <DialogContent>
            <DialogHeader>
              <AlertDialogIcon />
              <DialogTitle>Excluir este projeto?</DialogTitle>
              <DialogDescription>
                O projeto e seus 42 documentos saem para todo mundo. Isso não pode ser desfeito.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <AlertDialogCancel
                render={({ children, ...control }) => (
                  <Button {...control} size="sm" tone="secondary" variant="outline">
                    {children}
                  </Button>
                )}
              >
                Manter projeto
              </AlertDialogCancel>
              <AlertDialogAction
                render={({ children, ...control }) => (
                  <Button {...control} size="sm" tone="danger">
                    {children}
                  </Button>
                )}
              >
                Excluir projeto
              </AlertDialogAction>
            </DialogFooter>
          </DialogContent>
        </AlertDialog>
      )}
    </Layer>
  ),
};

export const Tones: Story = {
  parameters: scenario('tones'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="danger — the default"
        note="A struck circle, because what follows cannot be undone. The mark is a mask from a glyph token, so it survives forced colours, where the tone’s colour does not."
      >
        <Layer>{(container) => <Confirm container={container} />}</Layer>
      </Scene>
      <Scene
        label="warning — a decision, not a deletion"
        note="A triangle: the one silhouette in the set that has to be recognised before its colour is. The action reads as the consequence rather than as a threat."
      >
        <Layer>
          {(container) => (
            <Confirm
              action="Descartar edições"
              cancel="Continuar editando"
              container={container}
              description="Suas últimas três edições ainda não foram salvas."
              title="Sair sem salvar?"
              tone="warning"
            />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const Actions: Story = {
  parameters: scenario('actions'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="Labels that name the action"
        note="“Excluir projeto” and “Manter projeto”, not “Sim” and “Não”. A reader who hears only the buttons still knows which one does what, which is the whole reason the pattern asks for concrete labels."
      >
        <Layer>{(container) => <Confirm container={container} />}</Layer>
      </Scene>
      <Scene
        label="Each one carries its own result"
        note="The action closes with reason submit and result “confirm”; the cancel with dismiss and “cancel”. A consumer reading the request knows which control the reader chose without tracking it themselves."
      >
        <Layer>
          {(container) => (
            <Confirm
              action="Enviar mesmo assim"
              cancel="Revisar"
              container={container}
              description="Três destinatários estão fora da sua organização."
              title="Enviar para fora da organização?"
              tone="warning"
            />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const Policy: Story = {
  parameters: scenario('policy'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="The scrim does nothing"
        note="Click outside the panel: nothing happens, and there is no prop that changes it. A destructive confirmation a stray click dismisses is what fixing the policy to the member prevents."
      >
        <Layer>{(container) => <Confirm container={container} />}</Layer>
      </Scene>
      <Scene
        label='escape="none", for a cancel that is not safe'
        note="Escape is accepted by default, because a member that requires a cancel action can always cancel. A flow where leaving mid-way is itself destructive turns it off."
      >
        <Layer>
          {(container) => (
            <Confirm
              action="Encerrar migração"
              cancel="Continuar migração"
              container={container}
              description="Encerrar agora deixa 1.204 registros pela metade."
              escape="none"
              title="Encerrar a migração?"
            />
          )}
        </Layer>
      </Scene>
    </Grid>
  ),
};

export const Focus: Story = {
  parameters: scenario('focus'),
  render: () => (
    <Scene
      label="The ring is on “Manter projeto”"
      note="Not on the first tabbable element, which would be the destructive one here. The APG asks for the least destructive action on a step that is not easily reversible, and the member does it without being asked."
    >
      <Layer>{(container) => <Confirm container={container} />}</Layer>
    </Scene>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <Grid columns={2}>
      <Scene
        label="A description, then the detail"
        note="The description stays the one sentence aria-describedby announces; the list of what is going lives in the body, so a reader hears the consequence before the inventory."
      >
        <Layer>
          {(container) => (
            <Confirm
              body={
                <Text size="sm">
                  Relatório mensal, Apresentação de resultados e Rascunho da proposta.
                </Text>
              }
              container={container}
              description="Isso não pode ser desfeito."
              title="Excluir 3 documentos?"
            />
          )}
        </Layer>
      </Scene>
      <Scene
        label="A title the panel cannot hold"
        note="The words wrap and the row grows; the mark keeps its own column, so it stays on the first line’s optical centre rather than sliding down beside the second."
      >
        <Layer>
          {(container) => (
            <Confirm
              container={container}
              description="Der Vorgang entfernt sämtliche Bereitstellungsartefakte unwiderruflich."
              title="Produktions-Bereitstellungspipeline endgültig entfernen?"
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
    <Scene
      label="The actions are the library’s own buttons"
      note="render hands each control every attribute the family wrote, so the danger button is a Button with the closing behaviour on it. Nothing is wrapped, and the tone comes from the button rather than from the dialog."
    >
      <Layer>{(container) => <Confirm container={container} size="md" />}</Layer>
    </Scene>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Scene
      label='role="alertdialog", and a description that is not optional'
      note="The role is what lets a screen reader treat this differently from a dialog; the mandatory aria-describedby is what makes sure the sentence saying what will be destroyed is announced with the title."
    >
      <Layer>{(container) => <Confirm container={container} />}</Layer>
    </Scene>
  ),
};
