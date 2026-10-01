import { Component, computed, input, signal } from '@angular/core';
import { SlButton } from '@slotted/angular/button';
import {
  SlBubble,
  SlBubbleCaret,
  SlBubbleContent,
  SlMessage,
  SlMessageBody,
} from '@slotted/angular/message';
import type { MessageScrollerPosition } from '@slotted/core/message-scroller';
import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import {
  SlMessageScroller,
  SlMessageScrollerContent,
  SlMessageScrollerItem,
  SlMessageScrollerJump,
  SlMessageScrollerLoader,
  SlMessageScrollerSeparator,
  SlMessageScrollerUnread,
  SlMessageScrollerViewport,
} from './message-scroller';
import {
  ANGULAR_MESSAGE_SCROLLER_DOCS,
  ANGULAR_MESSAGE_SCROLLER_TOKENS,
} from './message-scroller.docs';

interface Row {
  id: string;
  own: boolean;
  text: string;
}

/** One incident, one product: a webhook returning 500 on refunds. */
const SEED: Row[] = [
  { id: 'q1', own: true, text: 'O webhook da Stripe está a devolver 500 em charge.refunded.' },
  {
    id: 'a1',
    own: false,
    text: 'O handler falha antes de confirmar, por isso a Stripe volta a entregar o mesmo evento. Cada nova tentativa passa pelo mesmo caminho e a fila cresce em vez de esvaziar.',
  },
  { id: 'q2', own: true, text: 'O que está a falhar, exatamente?' },
  {
    id: 'a2',
    own: false,
    text: 'O ramo do reembolso lê charge.payment_intent, que vem a null nos reembolsos criados no dashboard. O null chega ao helper de procura, que falha antes de o 200 sair.',
  },
  { id: 'q3', own: true, text: 'Dá-me o patch mais pequeno que desbloqueie a fila.' },
  {
    id: 'a3',
    own: false,
    text: 'Devolve 200 assim que a assinatura for verificada e faz o reembolso numa fila. Um webhook confirma a receção, não o sucesso. Com isso, um payment_intent a null passa a ser um job que falha e repete do teu lado.',
  },
];

const OLDER: Row[] = [
  { id: 'o1', own: true, text: 'Abri o ticket 4821: o cliente diz que os exports vêm vazios.' },
  { id: 'o2', own: false, text: 'Vazios, não falhados: cada job terminou com zero linhas.' },
  { id: 'o3', own: true, text: 'Sempre o mesmo workspace?' },
  { id: 'o4', own: false, text: 'Um só, ws_3311. Nenhuma outra conta mostra o padrão.' },
];

const REPLY =
  'Posso escrever o patch e deixar o script de reenvio ao lado. A fila esvazia sozinha depois do deploy, porque a Stripe guarda os eventos falhados três dias; o guarda é uma linha: se payment_intent vier a null, o helper devolve cedo e o 200 sai.';

/** A conversation the reader can drive: ask, stream, receive, load older, jump. */
@Component({
  selector: 'sl-message-scroller-chat-demo',
  imports: [
    SlBubble,
    SlBubbleCaret,
    SlBubbleContent,
    SlButton,
    SlMessage,
    SlMessageBody,
    SlMessageScroller,
    SlMessageScrollerContent,
    SlMessageScrollerItem,
    SlMessageScrollerJump,
    SlMessageScrollerLoader,
    SlMessageScrollerSeparator,
    SlMessageScrollerUnread,
    SlMessageScrollerViewport,
  ],
  template: `
    <div class="slotted-demo-stack" data-stretch>
      <div class="slotted-demo-viewport" data-size="tall">
        <div
          slMessageScroller
          #chat="slMessageScroller"
          [busy]="streaming()"
          [defaultPosition]="position()"
          [follow]="follow()"
          [peek]="peek()"
          [scrollMargin]="8"
          (anchorChange)="current.set($event.id)"
          (reachStart)="history() && loadOlder()"
        >
          <div slMessageScrollerViewport>
            <div slMessageScrollerContent>
              @if (loading()) {
                <div slMessageScrollerLoader></div>
              }
              @if (separators()) {
                <div slMessageScrollerItem><div slMessageScrollerSeparator sticky>Ontem</div></div>
              }
              @for (row of rows(); track row.id; let position = $index) {
                @if (separators() && position === 3) {
                  <div slMessageScrollerItem><div slMessageScrollerSeparator sticky>Hoje</div></div>
                }
                @if (unread() && position === 4) {
                  <div slMessageScrollerItem><div slMessageScrollerUnread></div></div>
                }
                <div slMessageScrollerItem [anchor]="row.own" [messageId]="row.id">
                  <article
                    slMessage
                    [align]="row.own ? 'end' : 'start'"
                    [attr.aria-label]="row.own ? 'Tu' : 'Assistente'"
                  >
                    <div slMessageBody>
                      <div slBubble [variant]="row.own ? undefined : 'plain'">
                        <div slBubbleContent>{{ row.text }}</div>
                      </div>
                    </div>
                  </article>
                </div>
              }
              @if (stream(); as live) {
                <div slMessageScrollerItem [messageId]="live.id">
                  <article slMessage aria-label="Assistente">
                    <div slMessageBody>
                      <div slBubble variant="plain">
                        <div slBubbleContent>
                          {{ reply().slice(0, live.length) }}
                          @if (streaming()) {
                            <span slBubbleCaret></span>
                          }
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              }
            </div>
          </div>
          <button slMessageScrollerJump></button>
        </div>
      </div>
      <div class="slotted-demo-row">
        <button slButton size="sm" variant="outline" (click)="ask()">Enviar pergunta</button>
        <button slButton size="sm" variant="outline" (click)="receive()">Receber resposta</button>
        @if (history()) {
          <button slButton size="sm" variant="outline" (click)="loadOlder()">
            Carregar anteriores
          </button>
        }
        @if (navigator()) {
          <button
            slButton
            size="sm"
            variant="ghost"
            [disabled]="index() <= 0"
            (click)="go(chat, -1)"
          >
            Pergunta anterior
          </button>
          <button
            slButton
            size="sm"
            variant="ghost"
            [disabled]="index() >= questions().length - 1"
            (click)="go(chat, 1)"
          >
            Pergunta seguinte
          </button>
        }
      </div>
    </div>
  `,
})
class ChatDemo {
  readonly follow = input(true);
  readonly position = input<MessageScrollerPosition>('last-anchor');
  readonly peek = input(48);
  readonly history = input(false);
  readonly separators = input(false);
  readonly unread = input(false);
  readonly navigator = input(false);

  readonly rows = signal<Row[]>(SEED);
  readonly loading = signal(false);
  readonly stream = signal<{ id: string; length: number } | null>(null);
  readonly current = signal<string | null>(null);
  readonly reply = signal(REPLY);
  readonly streaming = computed(() => {
    const live = this.stream();
    return live !== null && live.length < REPLY.length;
  });
  readonly questions = computed(() =>
    this.rows()
      .filter((row) => row.own)
      .map((row) => row.id),
  );
  readonly index = computed(() => Math.max(0, this.questions().indexOf(this.current() ?? '')));
  private turns = 0;
  private older = true;

  ask() {
    this.turns += 1;
    const turn = this.turns;
    this.rows.update((all) => [
      ...all,
      { id: `live-q${turn}`, own: true, text: 'E se o evento chegar sem assinatura?' },
    ]);
    window.setTimeout(() => {
      this.stream.set({ id: `live-a${turn}`, length: 0 });
      this.tick();
    }, 500);
  }

  receive() {
    this.turns += 1;
    this.rows.update((all) => [
      ...all,
      { id: `in-${this.turns}`, own: false, text: 'O deploy das 16:00 já tem o guarda.' },
    ]);
  }

  loadOlder() {
    if (this.loading() || !this.older) return;
    this.loading.set(true);
    window.setTimeout(() => {
      this.rows.update((all) => [...OLDER, ...all]);
      this.older = false;
      this.loading.set(false);
    }, 700);
  }

  go(chat: SlMessageScroller, delta: number) {
    const target = this.questions()[this.index() + delta];
    if (target !== undefined) chat.scrollToMessage(target, { behavior: 'smooth', highlight: true });
  }

  private tick() {
    window.setTimeout(() => {
      const live = this.stream();
      if (live === null || live.length >= REPLY.length) return;
      this.stream.set({ ...live, length: live.length + 4 });
      this.tick();
    }, 40);
  }
}

const scene = (label: string, note: string, body: string) => `
  <section class="slotted-demo-scene">
    <header class="slotted-demo-scene__header">
      <span class="slotted-demo-scene__label">${label}</span>
      <span class="slotted-demo-scene__note">${note}</span>
    </header>
    <div class="slotted-demo-stage" data-layout="block">${body}</div>
  </section>`;

const page = (body: string) => `<div class="slotted-demo-grid" data-columns="1">${body}</div>`;

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(ANGULAR_MESSAGE_SCROLLER_DOCS.messageScroller.scenes, {
    playground: Playground,
    opening: Opening,
    follow: Follow,
    anchor: Anchor,
    history: History,
    jump: Jump,
    navigator: Navigator,
    separators: Separators,
    unread: Unread,
    busy: Busy,
  });

interface ScrollerStoryArgs {
  defaultPosition: MessageScrollerPosition;
  follow: boolean;
  peek: number;
}

const meta: Meta<ScrollerStoryArgs> = {
  title: 'Components/MessageScroller',
  component: SlMessageScroller,
  decorators: [moduleMetadata({ imports: [ChatDemo] })],
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'MessageScroller',
        description:
          'The region a conversation scrolls in: where a saved one opens, following a reply and letting go, a sent turn lifted to the top, older rows without a jump, a jump to any row, and a control back to the latest that says how many arrived.',
        framework: 'Angular',
        ...ANGULAR_MESSAGE_SCROLLER_DOCS.messageScroller,
        tokens: ANGULAR_MESSAGE_SCROLLER_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
};

export default meta;
type Story = StoryObj<ScrollerStoryArgs>;

export const Playground: Story = {
  args: { defaultPosition: 'last-anchor', follow: true, peek: 48 },
  argTypes: {
    defaultPosition: { control: 'inline-radio', options: ['start', 'end', 'last-anchor'] },
    follow: { control: 'boolean' },
    peek: { control: { type: 'number', min: 0, max: 160, step: 8 } },
  },
  parameters: { ...scenario('playground'), controls: { disable: false } },
  render: (args) => ({
    props: args,
    template: `<sl-message-scroller-chat-demo [position]="defaultPosition" [follow]="follow" [peek]="peek"></sl-message-scroller-chat-demo>`,
  }),
};

export const Opening: Story = {
  parameters: scenario('opening'),
  render: () => ({
    template: page(
      scene(
        'last-anchor, end and start',
        'Three copies of one saved conversation: the first opens on the last question with its answer below, the second on the last line, the third on the first.',
        `<sl-message-scroller-chat-demo position="last-anchor"></sl-message-scroller-chat-demo>
         <sl-message-scroller-chat-demo position="end"></sl-message-scroller-chat-demo>
         <sl-message-scroller-chat-demo position="start"></sl-message-scroller-chat-demo>`,
      ),
    ),
  }),
};

export const Follow: Story = {
  parameters: scenario('follow'),
  render: () => ({
    template: page(
      scene(
        'Send a question, then scroll up while it answers',
        'The reply streams into the room under the question; scroll up and the view stays where you put it while the words keep arriving below.',
        '<sl-message-scroller-chat-demo></sl-message-scroller-chat-demo>',
      ),
    ),
  }),
};

export const Anchor: Story = {
  parameters: scenario('anchor'),
  render: () => ({
    template: page(
      scene(
        'The question stands at the top',
        'Press Enviar pergunta: the question rises to 8 pixels plus a 48-pixel peek of the answer before it, and the room below shrinks as the reply fills it.',
        '<sl-message-scroller-chat-demo [peek]="48"></sl-message-scroller-chat-demo>',
      ),
    ),
  }),
};

export const History: Story = {
  parameters: scenario('history'),
  render: () => ({
    template: page(
      scene(
        'Reach the top',
        'Scroll to the top, or press Carregar anteriores: the loader holds the head, four older rows arrive above, and the row you were reading does not move.',
        '<sl-message-scroller-chat-demo position="start" [history]="true"></sl-message-scroller-chat-demo>',
      ),
    ),
  }),
};

export const Jump: Story = {
  parameters: scenario('jump'),
  render: () => ({
    template: page(
      scene(
        'Two arrived while you were away',
        'Scroll up, then press Receber resposta twice: the round control widens into 2 novas; press it to go back to the end and it leaves.',
        '<sl-message-scroller-chat-demo [follow]="false"></sl-message-scroller-chat-demo>',
      ),
    ),
  }),
};

export const Navigator: Story = {
  parameters: scenario('navigator'),
  render: () => ({
    template: page(
      scene(
        'Question by question',
        'The two buttons under the frame read the current turn from (anchorChange) and jump with highlight: the landed question glows and fades.',
        '<sl-message-scroller-chat-demo [navigator]="true"></sl-message-scroller-chat-demo>',
      ),
    ),
  }),
};

export const Separators: Story = {
  parameters: scenario('separators'),
  render: () => ({
    template: page(
      scene(
        'Ontem, then Hoje',
        'Scroll through the conversation: Ontem stays at the top until Hoje arrives and takes its place, each a pill with no rule across the words.',
        '<sl-message-scroller-chat-demo position="start" [separators]="true"></sl-message-scroller-chat-demo>',
      ),
    ),
  }),
};

export const Unread: Story = {
  parameters: scenario('unread'),
  render: () => ({
    template: page(
      scene(
        'From here on, unread',
        'The accent line stands above the first message the reader has not seen, in the flow of the rows, and scrolls with them.',
        '<sl-message-scroller-chat-demo position="start" [unread]="true"></sl-message-scroller-chat-demo>',
      ),
    ),
  }),
};

export const Busy: Story = {
  parameters: scenario('busy'),
  render: () => ({
    template: page(
      scene(
        'A reply announced once',
        'Send a question: while the answer streams the log is aria-busy and a screen reader hears A responder; when it ends, Resposta completa.',
        '<sl-message-scroller-chat-demo></sl-message-scroller-chat-demo>',
      ),
    ),
  }),
};
