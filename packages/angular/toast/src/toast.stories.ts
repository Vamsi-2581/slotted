import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlButton } from '@slotted/angular/button';
import { SlText } from '@slotted/angular/typography';

import { SlToastRegion } from './toast';
import { SlToastContent, SlToastDescription, SlToastTitle } from './toast-parts';
import { SlToastDemo } from './toast.demo';
import { ANGULAR_TOAST_DOCS, ANGULAR_TOAST_TOKENS } from './toast.docs';
import type { ToastPlacement, ToastStacking } from './toast-defaults';

interface ToastStoryArgs {
  limit: number;
  placement: ToastPlacement;
  stacking: ToastStacking;
  swipe: boolean;
}

const DIGEST = 'sha256:9f2c4be7d1a05e83bb47c6f0e19d3a7c58e2b41d6f90ac3e7215b8d40c6ea915';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_TOAST_DOCS.toast.scenes, {
    playground: Playground,
    tones: Tones,
    variants: Variants,
    placement: Placement,
    timing: Timing,
    actions: Actions,
    promise: PromiseScene,
    queue: Queue,
    stacking: Stacking,
    dismissal: Dismissal,
    keyboard: Keyboard,
    content: Content,
    composition: Composition,
  }) as never;

const meta: Meta<ToastStoryArgs> = {
  title: 'Components/Toast',
  component: SlToastRegion,
  decorators: [
    moduleMetadata({
      imports: [
        SlButton,
        SlText,
        SlToastContent,
        SlToastDemo,
        SlToastDescription,
        SlToastRegion,
        SlToastTitle,
      ],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Toast',
        description:
          'Transient feedback about something that already happened — a tone, a mark, a sentence, sometimes a control that acts on it, and a clock that stops whenever the reader is reading.',
        framework: 'Angular',
        ...ANGULAR_TOAST_DOCS.toast,
        tokens: ANGULAR_TOAST_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<ToastStoryArgs>;

/** The stage every story stands on, so no story reaches for an inline style. */
const stage = (body: string) => `<div class="slotted-demo-stage" data-layout="block">${body}</div>`;

export const Playground: Story = {
  args: { limit: 3, placement: 'bottom-end', stacking: 'list', swipe: true },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: {
      ...args,
      seed: [
        {
          title: 'Rascunho salvo',
          description: 'Tudo desde as 14h02 está guardado.',
          tone: 'accent',
        },
      ],
    },
    template: stage(`
      <sl-toast-demo
        #demo="slToastDemo"
        size="tall"
        [limit]="limit"
        [placement]="placement"
        [seed]="seed"
        [stacking]="stacking"
        [swipe]="swipe"
      >
        <button
          slButton
          size="sm"
          type="button"
          (click)="demo.show({ title: 'Rascunho salvo', description: 'Tudo desde as 14h02 está guardado.', duration: 0 })"
        >
          Mostrar mais uma
        </button>
      </sl-toast-demo>`),
  }),
};

export const Tones: Story = {
  parameters: scenario('tones'),
  render: () => ({
    props: {
      seed: [
        { tone: 'accent', title: 'Duas pessoas entraram' },
        { tone: 'secondary', title: 'Filtros limpos' },
        { tone: 'success', title: 'Fatura enviada' },
        { tone: 'warning', title: 'A licença expira em 3 dias' },
        { tone: 'danger', title: 'Não foi possível enviar' },
      ],
    },
    template: stage('<sl-toast-demo size="tall" [limit]="5" [seed]="seed" />'),
  }),
};

export const Variants: Story = {
  parameters: scenario('variants'),
  render: () => ({
    props: {
      seed: [
        { title: 'raised', description: 'O tom está na marca e em mais nada.', tone: 'success' },
        {
          title: 'soft',
          description: 'A superfície do tom, e a tinta do tom.',
          tone: 'success',
          variant: 'soft',
        },
        {
          title: 'solid',
          description: 'O preenchimento, e a única tinta medida contra ele.',
          tone: 'danger',
          variant: 'solid',
        },
      ],
    },
    template: stage('<sl-toast-demo size="tall" [limit]="3" [seed]="seed" />'),
  }),
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => ({
    props: {
      top: [{ title: 'top-start', tone: 'accent' }],
      bottom: [{ title: 'bottom, centrado' }],
    },
    template: stage(`
      <sl-toast-demo placement="top-start" size="layer" [seed]="top" />
      <sl-toast-demo placement="bottom" size="layer" [seed]="bottom" />`),
  }),
};

export const Timing: Story = {
  parameters: scenario('timing'),
  render: () => ({
    props: {
      seed: [
        {
          title: 'Exportadas 1.204 linhas',
          description: 'O ficheiro está nas transferências.',
          tone: 'success',
          duration: 8000,
          progress: true,
        },
        { title: 'Sessão expirada', tone: 'danger', duration: 0 },
      ],
    },
    template: stage('<sl-toast-demo size="tall" [limit]="2" [seed]="seed" />'),
  }),
};

export const Actions: Story = {
  parameters: scenario('actions'),
  render: () => ({
    props: {},
    template: stage(`
      <ng-template #undo let-message>
        <button slButton size="sm" type="button" variant="outline" (click)="demo.dismiss(message.id)">
          Desfazer
        </button>
      </ng-template>
      <sl-toast-demo #demo="slToastDemo" size="tall">
        <button
          slButton
          size="sm"
          type="button"
          (click)="demo.show({ title: 'Mensagem arquivada', description: 'Saiu da caixa de entrada e continua na conta.', tone: 'secondary', actions: undo })"
        >
          Arquivar
        </button>
      </sl-toast-demo>`),
  }),
};

export const PromiseScene: Story = {
  parameters: scenario('promise'),
  render: () => ({
    props: {
      publish: () =>
        new Promise<string>((resolve) => {
          setTimeout(() => resolve('4.2'), 1600);
        }),
      onPublished: (version: string) => ({
        title: `Versão ${version} no ar`,
        tone: 'success',
        duration: 0,
      }),
    },
    template: stage(`
      <sl-toast-demo #demo="slToastDemo" size="tall">
        <button
          slButton
          size="sm"
          type="button"
          (click)="demo.promise(publish(), { loading: { id: 'publish', title: 'A publicar', description: 'Demora um minuto.' }, success: onPublished, error: { title: 'Falha ao publicar', tone: 'danger', duration: 0 } })"
        >
          Publicar
        </button>
      </sl-toast-demo>`),
  }),
};

export const Queue: Story = {
  parameters: scenario('queue'),
  render: () => ({
    props: {
      seed: [
        { title: 'Primeira', description: 'Chegou antes das outras.' },
        { title: 'Segunda', tone: 'secondary' },
        { title: 'Terceira', tone: 'success' },
        { title: 'Quarta', tone: 'warning' },
      ],
    },
    template: stage(`
      <sl-toast-demo size="tall" [limit]="2" [seed]="seed" />
      <p slText size="sm" tone="muted">
        Duas na tela, duas à espera. Feche uma e a seguinte aparece — e só então o relógio dela
        começa.
      </p>`),
  }),
};

export const Stacking: Story = {
  parameters: scenario('stacking'),
  render: () => ({
    props: {
      seed: [
        { title: 'Filtros limpos', tone: 'secondary' },
        { title: 'Rascunho salvo', tone: 'accent' },
        {
          title: 'Fatura enviada',
          description: 'Uma cópia foi para o financeiro.',
          tone: 'success',
        },
      ],
    },
    template: stage('<sl-toast-demo size="tall" stacking="stack" [limit]="3" [seed]="seed" />'),
  }),
};

export const Dismissal: Story = {
  parameters: scenario('dismissal'),
  render: () => ({
    props: {
      seed: [
        { title: 'Com controlo de fecho', description: 'Carregue no ✕, ou arraste para a borda.' },
        { title: 'Sem controlo', dismissible: false, tone: 'secondary' },
        { title: 'Com relógio', duration: 12000, progress: true, tone: 'success' },
      ],
    },
    template: stage('<sl-toast-demo size="tall" [limit]="3" [seed]="seed" />'),
  }),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => ({
    props: {
      seed: [
        { title: 'Fatura enviada', description: 'Carregue F6 para chegar aqui.', tone: 'success' },
        { title: 'Rascunho salvo', tone: 'accent' },
      ],
    },
    template: stage(`
      <button slButton size="sm" type="button">Um controlo qualquer da página</button>
      <sl-toast-demo size="tall" [limit]="2" [seed]="seed" />
      <p slText size="sm" tone="muted">
        F6 leva o foco à mensagem mais recente. Tab percorre os controlos, Escape fecha a mensagem
        onde o foco está e devolve-o ao controlo acima.
      </p>`),
  }),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => ({
    props: {
      seed: [
        { title: 'Implantação recusada', description: DIGEST, tone: 'danger' },
        {
          title: 'Die Zwischenspeicherung der Berechtigungsnachweise wurde zurückgesetzt',
          tone: 'warning',
        },
        {
          title: 'Sem marca nenhuma',
          description: 'As palavras começam no recuo da própria caixa.',
          hideIcon: true,
          tone: 'secondary',
        },
      ],
    },
    template: stage('<sl-toast-demo size="tall" [limit]="3" [seed]="seed" />'),
  }),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => ({
    props: {},
    template: stage(`
      <ng-template #body let-message>
        <div slToastContent>
          <div slToastTitle>{{ message.data.title }}</div>
          <p slToastDescription>{{ message.data.description }}</p>
        </div>
      </ng-template>
      <sl-toast-demo #demo="slToastDemo" size="tall">
        <button
          slButton
          size="sm"
          type="button"
          (click)="demo.show({ title: 'Escrita pela página', description: 'O comportamento continua a ser da família.', duration: 0, body: body })"
        >
          Mostrar
        </button>
      </sl-toast-demo>`),
  }),
};
