import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { SlBubbleRetry } from './bubble';
import { SlMessage } from './message';
import {
  DRAFTS,
  MESSAGE_DEMO_PARTS,
  MessageThreadRow,
  MessageVersionsDemo,
  mine,
  REPLY_ACTIONS,
  theirs,
} from './message-demo';
import { SlMessageActivity, SlMessageActivityStep } from './message-parts';
import { ANGULAR_MESSAGE_DOCS, ANGULAR_MESSAGE_TOKENS } from './message.docs';

const scene = (label: string, note: string, body: string) => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="block">${body}</div>
  </section>`;

const page = (body: string) => `<div class="slotted-demo-grid" data-columns="1">${body}</div>`;
const stack = (body: string) => `<div class="slotted-demo-stack" data-stretch>${body}</div>`;

interface MessageStoryArgs {
  align: 'start' | 'end';
  layout: 'bubble' | 'thread';
  actionsVisibility: 'always' | 'hover';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'streaming';
}

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_MESSAGE_DOCS.message.scenes, {
    playground: Playground,
    align: Align,
    avatar: AvatarScene,
    group: Group,
    header: Header,
    receipt: Receipt,
    actions: Actions,
    activity: Activity,
    versions: Versions,
    layout: Layout,
  });

const meta: Meta<MessageStoryArgs> = {
  title: 'Components/Message/Message',
  component: SlMessage,
  decorators: [
    moduleMetadata({
      imports: [
        ...MESSAGE_DEMO_PARTS,
        MessageThreadRow,
        MessageVersionsDemo,
        SlBubbleRetry,
        SlMessageActivity,
        SlMessageActivityStep,
      ],
    }),
  ],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Message',
        description:
          'One message of a conversation: an article named by its author, with the avatar, the words, what is said about their delivery, the actions and the versions of a reply.',
        framework: 'Angular',
        ...ANGULAR_MESSAGE_DOCS.message,
        tokens: ANGULAR_MESSAGE_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<MessageStoryArgs>;

export const Playground: Story = {
  args: { actionsVisibility: 'hover', align: 'start', layout: 'bubble', status: 'read' },
  argTypes: {
    align: { control: 'inline-radio', options: ['start', 'end'] },
    layout: { control: 'inline-radio', options: ['bubble', 'thread'] },
    actionsVisibility: { control: 'inline-radio', options: ['always', 'hover'] },
    status: {
      control: 'select',
      options: ['sending', 'sent', 'delivered', 'read', 'failed', 'streaming'],
    },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `
      <article slMessage [align]="align" [layout]="layout" [actionsVisibility]="actionsVisibility" [status]="status">
        <div slMessageAvatar><span slAvatar name="Marta Silva" size="sm"></span></div>
        <div slMessageBody>
          <div slMessageHeader><span slMessageAuthor>Marta Silva</span></div>
          <div slBubble>
            <div slBubbleContent>O payout de terça voltou com o erro R03.</div>
            @if (status === 'failed') {
              <button slBubbleRetry></button>
            }
          </div>
          <div slMessageFooter>
            <span slMessageReceipt></span>
            ${REPLY_ACTIONS}
          </div>
        </div>
      </article>`,
  }),
};

export const Align: Story = {
  parameters: scenario('align'),
  render: () => ({
    template: page(
      scene(
        'The operations team, and the reader',
        'The same bubble with no painting of its own: the start row paints the secondary tint, the end row the accent’s fill.',
        stack(
          theirs('O payout de terça voltou com o erro R03.', { avatar: false }) +
            mine('Ótimo. Reenvio assim que chegar.'),
        ),
      ),
    ),
  }),
};

export const AvatarScene: Story = {
  name: 'Avatar',
  parameters: scenario('avatar'),
  render: () => ({
    template: page(
      scene(
        'At the foot of the words',
        'A two-line bubble: the avatar stands on the line of the last line, and on the end side for the reader’s row.',
        stack(
          theirs(
            'A conta de destino não existe no banco. Já pedi o IBAN novo ao fornecedor, deve chegar hoje.',
          ) +
            `<article slMessage align="end" aria-label="Tu">
              <div slMessageAvatar><span slAvatar name="Ana Lopes" size="sm"></span></div>
              <div slMessageBody>
                <div slBubble><div slBubbleContent>Reenvio assim que chegar.</div></div>
              </div>
            </article>`,
        ),
      ),
    ),
  }),
};

export const Group: Story = {
  parameters: scenario('group'),
  render: () => ({
    template: page(
      scene(
        'Three rows, one speaker',
        'Two pixels between rows, the facing corners drawn in to four on the sender’s side, the avatar only on the last row and the column kept on the others.',
        `<div slMessageGroup>${
          theirs('O payout de terça voltou com o erro R03.', { avatar: false }) +
          theirs('A conta de destino não existe no banco. Já pedi o IBAN novo ao fornecedor.', {
            avatar: false,
          }) +
          theirs('Chega hoje à tarde.', { time: '09:38' })
        }</div>`,
      ),
    ),
  }),
};

export const Header: Story = {
  parameters: scenario('header'),
  render: () => ({
    template: page(
      scene(
        'Name over the first letter',
        'The header is set on the words’ inset; the dot between the name and the hour is drawn, and a name too long for the row ends in an ellipsis.',
        stack(`
          <article slMessage>
            <div slMessageBody>
              <div slMessageHeader>
                <span slMessageAuthor>Marta Silva</span>
                <time slMessageTime datetime="2026-09-30T09:38">09:38</time>
              </div>
              <div slBubble><div slBubbleContent>O payout de terça voltou com o erro R03.</div></div>
            </div>
          </article>
          <article slMessage align="end">
            <div slMessageBody>
              <div slMessageHeader>
                <span slMessageAuthor>Ana Luísa Figueiredo de Albuquerque e Vasconcelos</span>
                <time slMessageTime datetime="2026-09-30T10:02">10:02</time>
              </div>
              <div slBubble><div slBubbleContent>Ok</div></div>
            </div>
          </article>`),
      ),
    ),
  }),
};

export const Receipt: Story = {
  parameters: scenario('receipt'),
  render: () => ({
    template: page(
      scene(
        'Four marks and a word',
        'Sending breathes a clock, sent is one tick, delivered two, read two in full ink. A failure is a word under the bubble and the retry control beside it.',
        stack(
          mine('Estou a reenviar agora.', 'sending') +
            mine('Pedi ao banco para confirmar o IBAN.', 'sent', '09:40') +
            mine('Manda-me o IBAN quando chegar.', 'delivered', '09:41') +
            mine('E marco a fatura como paga só depois do crédito.', 'read', '09:42') +
            `<article slMessage align="end" aria-label="Tu" status="failed">
              <div slMessageBody>
                <div slBubble>
                  <div slBubbleContent>E a fatura 4417 também.</div>
                  <button slBubbleRetry></button>
                </div>
                <div slMessageFooter><span slMessageReceipt></span></div>
              </div>
            </article>`,
        ),
      ),
    ),
  }),
};

export const Actions: Story = {
  parameters: scenario('actions'),
  render: () => ({
    template: page(
      scene(
        'Revealed, and always',
        'The first reply shows its actions under the pointer or on focus inside it; the second always. Neither moves the words when the toolbar arrives.',
        stack(`
          <article slMessage aria-label="Assistente">
            <div slMessageBody>
              <div slBubble variant="plain"><div slBubbleContent>${DRAFTS[0]}</div></div>
              <div slMessageFooter>
                ${REPLY_ACTIONS}
                <time slMessageTime datetime="2026-09-30T14:45">14:45</time>
              </div>
            </div>
          </article>
          <article slMessage actionsVisibility="always" aria-label="Assistente">
            <div slMessageBody>
              <div slBubble variant="plain"><div slBubbleContent>${DRAFTS[1]}</div></div>
              <div slMessageFooter>${REPLY_ACTIONS}</div>
            </div>
          </article>`),
      ),
    ),
  }),
};

export const Activity: Story = {
  parameters: scenario('activity'),
  render: () => ({
    template: page(
      scene(
        'A log, and a single step',
        'Two steps done and one in progress; below, the same card with one line. Turn on reduced motion and the band stops.',
        stack(`
          <article slMessage aria-label="Assistente" status="streaming">
            <div slMessageBody>
              <div slMessageActivity>
                <div slMessageActivityStep status="complete">Li o registo das 14:00 às 14:10</div>
                <div slMessageActivityStep status="complete">Comparei com o deploy das 14:04</div>
                <div slMessageActivityStep>A procurar a causa do p95…</div>
                <div slMessageActivityStep status="pending">Escrever a resposta</div>
              </div>
            </div>
          </article>
          <article slMessage aria-label="Assistente" status="streaming">
            <div slMessageBody>
              <div slMessageActivity><div slMessageActivityStep>A pensar…</div></div>
            </div>
          </article>`),
      ),
    ),
  }),
};

export const Versions: Story = {
  parameters: scenario('versions'),
  render: () => ({
    template: page(
      scene(
        'Three drafts of one note',
        'Press the chevrons or focus one and use the arrows: the pager stops at 1 de 3 and 3 de 3, and the words change with it.',
        '<sl-message-versions-demo></sl-message-versions-demo>',
      ),
    ),
  }),
};

export const Layout: Story = {
  parameters: scenario('layout'),
  render: () => ({
    template: page(
      scene(
        'Comments on a client account',
        'Point at a row: the band says which comment the floating reply control belongs to. At 360 pixels the name and the hour wrap before the words do.',
        `${stack(`
          <sl-message-thread-row author="Emília Parker" when="há 4 minutos" [reactions]="2">
            Podemos nomear o dono do SSO antes da revisão com o cliente?
          </sl-message-thread-row>
          <sl-message-thread-row author="Tiago Moreira" when="há 8 minutos">
            Passei a nota de compras para cima do resumo de risco da renovação.
          </sl-message-thread-row>`)}
        <div class="slotted-demo-measure">
          <sl-message-thread-row author="Hannah Stone" when="há 44 minutos">
            O texto de retenção está aprovado com a nota de exceção anexada.
          </sl-message-thread-row>
        </div>`,
      ),
    ),
  }),
};
