import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button';
import { Text } from '../typography';
import { ToastRegion } from './toast';
import { DemoRegion } from './toast-demo';
import { Toast, ToastContent, ToastDescription, ToastTitle } from './toast-parts';
import { REACT_TOAST_DOCS, REACT_TOAST_TOKENS } from './toast.docs';
import type { ToastTone } from './toast.types';

const DIGEST = 'sha256:9f2c4be7d1a05e83bb47c6f0e19d3a7c58e2b41d6f90ac3e7215b8d40c6ea915';

const TONES: readonly { tone: ToastTone; title: string }[] = [
  { tone: 'accent', title: 'Duas pessoas entraram' },
  { tone: 'secondary', title: 'Filtros limpos' },
  { tone: 'success', title: 'Fatura enviada' },
  { tone: 'warning', title: 'A licença expira em 3 dias' },
  { tone: 'danger', title: 'Não foi possível enviar' },
];

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_TOAST_DOCS.toast.scenes, {
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

const meta = {
  title: 'Components/Toast',
  component: ToastRegion,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Toast',
        description:
          'Transient feedback about something that already happened — a tone, a mark, a sentence, sometimes a control that acts on it, and a clock that stops whenever the reader is reading.',
        framework: 'React',
        ...REACT_TOAST_DOCS.toast,
        tokens: REACT_TOAST_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof ToastRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    placement: 'bottom-end',
    stacking: 'list',
    swipe: true,
    limit: 3,
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        {...args}
        seed={[
          {
            title: 'Rascunho salvo',
            description: 'Tudo desde as 14h02 está guardado.',
            tone: 'accent',
          },
        ]}
        size="tall"
        trigger={(toaster) => (
          <Button
            onClick={() =>
              toaster.show({
                title: 'Rascunho salvo',
                description: 'Tudo desde as 14h02 está guardado.',
                duration: 0,
              })
            }
            size="sm"
          >
            Mostrar mais uma
          </Button>
        )}
      />
    </div>
  ),
};

export const Tones: Story = {
  parameters: scenario('tones'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion limit={5} seed={TONES} size="tall" />
    </div>
  ),
};

export const Variants: Story = {
  parameters: scenario('variants'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        limit={3}
        seed={[
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
        ]}
        size="tall"
      />
    </div>
  ),
};

export const Placement: Story = {
  parameters: scenario('placement'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        placement="top-start"
        seed={[{ title: 'top-start', tone: 'accent' }]}
        size="layer"
      />
      <DemoRegion placement="bottom" seed={[{ title: 'bottom, centrado' }]} size="layer" />
    </div>
  ),
};

export const Timing: Story = {
  parameters: scenario('timing'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        limit={2}
        seed={[
          {
            title: 'Exportadas 1.204 linhas',
            description: 'O ficheiro está nas transferências.',
            tone: 'success',
            duration: 8000,
            progress: true,
          },
          { title: 'Sessão expirada', tone: 'danger', duration: 0 },
        ]}
        size="tall"
      />
    </div>
  ),
};

export const Actions: Story = {
  parameters: scenario('actions'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        seed={[]}
        size="tall"
        trigger={(toaster) => (
          <Button
            onClick={() => {
              const id = toaster.show({
                title: 'Mensagem arquivada',
                description: 'Saiu da caixa de entrada e continua na conta.',
                tone: 'secondary',
                actions: (
                  <Button
                    onClick={() => toaster.dismiss(id, 'pointer')}
                    size="sm"
                    variant="outline"
                  >
                    Desfazer
                  </Button>
                ),
              });
            }}
            size="sm"
          >
            Arquivar
          </Button>
        )}
      />
    </div>
  ),
};

export const PromiseScene: Story = {
  parameters: scenario('promise'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        seed={[]}
        size="tall"
        trigger={(toaster) => (
          <Button
            onClick={() =>
              toaster
                .promise(new Promise<string>((resolve) => setTimeout(() => resolve('4.2'), 1600)), {
                  loading: { id: 'publish', title: 'A publicar', description: 'Demora um minuto.' },
                  success: (version) => ({
                    title: `Versão ${version} no ar`,
                    tone: 'success',
                    duration: 0,
                  }),
                  error: { title: 'Falha ao publicar', tone: 'danger', duration: 0 },
                })
                .catch(() => undefined)
            }
            size="sm"
          >
            Publicar
          </Button>
        )}
      />
    </div>
  ),
};

export const Queue: Story = {
  parameters: scenario('queue'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        limit={2}
        seed={[
          { title: 'Primeira', description: 'Chegou antes das outras.' },
          { title: 'Segunda', tone: 'secondary' },
          { title: 'Terceira', tone: 'success' },
          { title: 'Quarta', tone: 'warning' },
        ]}
        size="tall"
      />
      <Text size="sm" tone="muted">
        Duas na tela, duas à espera. Feche uma e a seguinte aparece — e só então o relógio dela
        começa.
      </Text>
    </div>
  ),
};

export const Stacking: Story = {
  parameters: scenario('stacking'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        limit={3}
        seed={[
          { title: 'Filtros limpos', tone: 'secondary' },
          { title: 'Rascunho salvo', tone: 'accent' },
          {
            title: 'Fatura enviada',
            description: 'Uma cópia foi para o financeiro.',
            tone: 'success',
          },
        ]}
        size="tall"
        stacking="stack"
      />
    </div>
  ),
};

export const Dismissal: Story = {
  parameters: scenario('dismissal'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        limit={3}
        seed={[
          {
            title: 'Com controlo de fecho',
            description: 'Carregue no ✕, ou arraste para a borda.',
          },
          { title: 'Sem controlo', dismissible: false, tone: 'secondary' },
          { title: 'Com relógio', duration: 12000, progress: true, tone: 'success' },
        ]}
        size="tall"
      />
    </div>
  ),
};

export const Keyboard: Story = {
  parameters: scenario('keyboard'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <Button size="sm">Um controlo qualquer da página</Button>
      <DemoRegion
        limit={2}
        seed={[
          {
            title: 'Fatura enviada',
            description: 'Carregue F6 para chegar aqui.',
            tone: 'success',
          },
          { title: 'Rascunho salvo', tone: 'accent' },
        ]}
        size="tall"
      />
      <Text size="sm" tone="muted">
        F6 leva o foco à mensagem mais recente. Tab percorre os controlos, Escape fecha a mensagem
        onde o foco está e devolve-o ao controlo acima.
      </Text>
    </div>
  ),
};

export const Content: Story = {
  parameters: scenario('content'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        limit={3}
        seed={[
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
        ]}
        size="tall"
      />
    </div>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <div className="slotted-demo-stage" data-layout="block">
      <DemoRegion
        seed={[
          {
            title: 'Escrita pela página',
            description: 'O comportamento continua a ser da família.',
          },
        ]}
        size="tall"
      >
        {(message) => (
          <Toast key={message.id} message={message}>
            <ToastContent>
              <ToastTitle>{message.data.title}</ToastTitle>
              <ToastDescription>{message.data.description}</ToastDescription>
            </ToastContent>
          </Toast>
        )}
      </DemoRegion>
    </div>
  ),
};
