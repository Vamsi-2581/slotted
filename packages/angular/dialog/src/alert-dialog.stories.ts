import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import type { DialogSize, DialogTone } from './dialog-defaults';
import { ANGULAR_DIALOG_DOCS, ANGULAR_DIALOG_TOKENS } from './dialog.docs';
import { DIALOG_IMPORTS, grid, layer, scene } from './dialog.stories';

interface AlertDialogStoryArgs {
  escape: 'close' | 'none';
  loading: boolean;
  size: DialogSize;
  tone: DialogTone;
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_DIALOG_DOCS.alertDialog.scenes, {
    playground: Playground,
    tones: Tones,
    actions: Actions,
    policy: Policy,
    focus: Focus,
    content: Content,
    composition: Composition,
    accessibility: Accessibility,
  }) as never;

const meta: Meta<AlertDialogStoryArgs> = {
  title: 'Components/Dialog/AlertDialog',
  decorators: [moduleMetadata({ imports: DIALOG_IMPORTS })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'AlertDialog',
        description:
          'A dialog that interrupts to confirm something irreversible. The two rules the pattern gives it — an outside press never closes it, and focus lands on the least destructive action — are defaults of the member rather than inputs a consumer remembers to set.',
        framework: 'Angular',
        ...ANGULAR_DIALOG_DOCS.alertDialog,
        tokens: ANGULAR_DIALOG_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<AlertDialogStoryArgs>;

const confirm = (
  attributes = '',
  {
    action = 'Excluir projeto',
    actionTone = 'danger',
    body = '',
    cancel = 'Manter projeto',
    description = 'O projeto e seus 42 documentos saem para todo mundo. Isso não pode ser desfeito.',
    title = 'Excluir este projeto?',
  } = {},
) =>
  layer(`<sl-alert-dialog [container]="box" [open]="true" ${attributes}>
    <header slDialogHeader>
      <span slAlertDialogIcon></span>
      <h2 slDialogTitle>${title}</h2>
      <p slDialogDescription>${description}</p>
    </header>
    ${body === '' ? '' : `<div slDialogBody>${body}</div>`}
    <footer slDialogFooter>
      <button slButton size="sm" variant="outline" tone="secondary" slAlertDialogCancel>
        ${cancel}
      </button>
      <button slButton size="sm" tone="${actionTone}" slAlertDialogAction>${action}</button>
    </footer>
  </sl-alert-dialog>`);

export const Playground: Story = {
  args: { escape: 'close', loading: false, size: 'sm', tone: 'danger' },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: layer(`<button slButton tone="danger" variant="outline" [slDialogTrigger]="d">
        Excluir projeto
      </button>
      <sl-alert-dialog
        #d="slAlertDialog"
        [container]="box"
        [size]="size"
        [tone]="tone"
        [escape]="escape"
        [loading]="loading"
      >
        <header slDialogHeader>
          <span slAlertDialogIcon></span>
          <h2 slDialogTitle>Excluir este projeto?</h2>
          <p slDialogDescription>
            O projeto e seus 42 documentos saem para todo mundo. Isso não pode ser desfeito.
          </p>
        </header>
        <footer slDialogFooter>
          <button slButton size="sm" variant="outline" tone="secondary" slAlertDialogCancel>
            Manter projeto
          </button>
          <button slButton size="sm" tone="danger" slAlertDialogAction>Excluir projeto</button>
        </footer>
      </sl-alert-dialog>`),
  }),
};

export const Tones: Story = {
  parameters: scenario('tones'),
  render: () => ({
    template: grid(
      2,
      scene(
        'danger — the default',
        'A struck circle, because what follows cannot be undone. The mark is a mask from a glyph token, so it survives forced colours, where the tone’s colour does not.',
        confirm(),
      ) +
        scene(
          'warning — a decision, not a deletion',
          'A triangle: the one silhouette in the set that has to be recognised before its colour is. The action reads as the consequence rather than as a threat.',
          confirm('tone="warning"', {
            action: 'Descartar edições',
            actionTone: 'warning',
            cancel: 'Continuar editando',
            description: 'Suas últimas três edições ainda não foram salvas.',
            title: 'Sair sem salvar?',
          }),
        ),
    ),
  }),
};

export const Actions: Story = {
  parameters: scenario('actions'),
  render: () => ({
    template: grid(
      2,
      scene(
        'Labels that name the action',
        '“Excluir projeto” and “Manter projeto”, not “Sim” and “Não”. A reader who hears only the buttons still knows which one does what, which is the whole reason the pattern asks for concrete labels.',
        confirm(),
      ) +
        scene(
          'Each one carries its own result',
          'The action closes with reason submit and result “confirm”; the cancel with dismiss and “cancel”. A consumer reading the request knows which control the reader chose without tracking it themselves.',
          confirm('tone="warning"', {
            action: 'Enviar mesmo assim',
            actionTone: 'warning',
            cancel: 'Revisar',
            description: 'Três destinatários estão fora da sua organização.',
            title: 'Enviar para fora da organização?',
          }),
        ),
    ),
  }),
};

export const Policy: Story = {
  parameters: scenario('policy'),
  render: () => ({
    template: grid(
      2,
      scene(
        'The scrim does nothing',
        'Click outside the panel: nothing happens, and there is no input that changes it. A destructive confirmation a stray click dismisses is what fixing the policy to the member prevents.',
        confirm(),
      ) +
        scene(
          'escape="none", for a cancel that is not safe',
          'Escape is accepted by default, because a member that requires a cancel action can always cancel. A flow where leaving mid-way is itself destructive turns it off.',
          confirm('escape="none"', {
            action: 'Encerrar migração',
            cancel: 'Continuar migração',
            description: 'Encerrar agora deixa 1.204 registros pela metade.',
            title: 'Encerrar a migração?',
          }),
        ),
    ),
  }),
};

export const Focus: Story = {
  parameters: scenario('focus'),
  render: () => ({
    template: scene(
      'The ring is on “Manter projeto”',
      'Not on the first tabbable element, which would be the destructive one here. The APG asks for the least destructive action on a step that is not easily reversible, and the member does it without being asked.',
      confirm(),
    ),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    template: grid(
      2,
      scene(
        'A description, then the detail',
        'The description stays the one sentence aria-describedby announces; the list of what is going lives in the body, so a reader hears the consequence before the inventory.',
        confirm('', {
          body: '<p slText size="sm">Relatório mensal, Apresentação de resultados e Rascunho da proposta.</p>',
          description: 'Isso não pode ser desfeito.',
          title: 'Excluir 3 documentos?',
        }),
      ) +
        scene(
          'A title the panel cannot hold',
          'The words wrap and the row grows; the mark keeps its own column, so it stays on the first line’s optical centre rather than sliding down beside the second.',
          confirm('', {
            description: 'Der Vorgang entfernt sämtliche Bereitstellungsartefakte unwiderruflich.',
            title: 'Produktions-Bereitstellungspipeline endgültig entfernen?',
          }),
        ),
    ),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    template: scene(
      'The actions are the library’s own buttons',
      'slAlertDialogCancel and slAlertDialogAction are directives on a slButton, so the closing behaviour lands on the library’s own control. The tone comes from the button rather than from the dialog.',
      confirm('size="md"'),
    ),
  }),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => ({
    template: scene(
      'role="alertdialog", and a description that is not optional',
      'The role is what lets a screen reader treat this differently from a dialog; the mandatory aria-describedby is what makes sure the sentence saying what will be destroyed is announced with the title.',
      confirm(),
    ),
  }),
};
