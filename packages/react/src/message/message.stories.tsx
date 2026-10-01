import { bindScenes, createReferencePage, scenario } from '@slotted/storybook-workbench';
import type { ReferencePageConfig } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Avatar } from '../avatar';
import { IconButton } from '../button';
import { Grid, Measure, Scene } from '../field/field-demo';
import { Glyph, Icon } from '../icon';
import {
  Bubble,
  BubbleContent,
  BubbleReaction,
  BubbleReactions,
  BubbleRetry,
  Message,
  MessageActions,
  MessageActivity,
  MessageActivityStep,
  MessageAuthor,
  MessageAvatar,
  MessageBody,
  MessageFooter,
  MessageGroup,
  MessageHeader,
  MessageReceipt,
  MessageTime,
  MessageVersions,
} from './index';
import { DRAFTS, MARTA, Mine, ReplyActions, Stack, Theirs } from './message-demo';
import { REACT_MESSAGE_DOCS, REACT_MESSAGE_TOKENS } from './message.docs';

const referenceScenes: ReferencePageConfig['scenes'] = () =>
  bindScenes(REACT_MESSAGE_DOCS.message.scenes, {
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

const meta = {
  title: 'Components/Message/Message',
  component: Message,
  parameters: {
    controls: { disable: true },
    docs: {
      page: createReferencePage({
        title: 'Message',
        description:
          'One message of a conversation: an article named by its author, with the avatar, the words, what is said about their delivery, the actions and the versions of a reply.',
        framework: 'React',
        ...REACT_MESSAGE_DOCS.message,
        tokens: REACT_MESSAGE_TOKENS,
        scenes: referenceScenes,
      }),
    },
  },
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

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
  render: (args) => (
    <Message {...args}>
      <MessageAvatar>
        <Avatar name={MARTA} size="sm" />
      </MessageAvatar>
      <MessageBody>
        <MessageHeader>
          <MessageAuthor>{MARTA}</MessageAuthor>
        </MessageHeader>
        <Bubble>
          <BubbleContent>O payout de terça voltou com o erro R03.</BubbleContent>
          {args.status === 'failed' ? <BubbleRetry /> : null}
        </Bubble>
        <MessageFooter>
          <MessageReceipt />
          <ReplyActions />
        </MessageFooter>
      </MessageBody>
    </Message>
  ),
};

export const Align: Story = {
  parameters: scenario('align'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="The operations team, and the reader"
        note="The same Bubble with no painting of its own: the start row paints the secondary tint, the end row the accent’s fill."
      >
        <Stack>
          <Theirs avatar={false}>O payout de terça voltou com o erro R03.</Theirs>
          <Mine>Ótimo. Reenvio assim que chegar.</Mine>
        </Stack>
      </Scene>
    </Grid>
  ),
};

export const AvatarScene: Story = {
  name: 'Avatar',
  parameters: scenario('avatar'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="At the foot of the words"
        note="A two-line bubble: the avatar stands on the line of the last line, and on the end side for the reader’s row."
      >
        <Stack>
          <Theirs>
            A conta de destino não existe no banco. Já pedi o IBAN novo ao fornecedor, deve chegar
            hoje.
          </Theirs>
          <Message align="end" aria-label="Tu">
            <MessageAvatar>
              <Avatar name="Ana Lopes" size="sm" />
            </MessageAvatar>
            <MessageBody>
              <Bubble>
                <BubbleContent>Reenvio assim que chegar.</BubbleContent>
              </Bubble>
            </MessageBody>
          </Message>
        </Stack>
      </Scene>
    </Grid>
  ),
};

export const Group: Story = {
  parameters: scenario('group'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Three rows, one speaker"
        note="Two pixels between rows, the facing corners drawn in to four on the sender’s side, the avatar only on the last row and the column kept on the others."
      >
        <MessageGroup>
          <Theirs avatar={false}>O payout de terça voltou com o erro R03.</Theirs>
          <Theirs avatar={false}>
            A conta de destino não existe no banco. Já pedi o IBAN novo ao fornecedor.
          </Theirs>
          <Theirs time="09:38">Chega hoje à tarde.</Theirs>
        </MessageGroup>
      </Scene>
    </Grid>
  ),
};

export const Header: Story = {
  parameters: scenario('header'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Name over the first letter"
        note="The header is set on the words’ inset; the dot between the name and the hour is drawn, and a name too long for the row ends in an ellipsis."
      >
        <Stack>
          <Message>
            <MessageBody>
              <MessageHeader>
                <MessageAuthor>{MARTA}</MessageAuthor>
                <MessageTime dateTime="2026-09-30T09:38">09:38</MessageTime>
              </MessageHeader>
              <Bubble>
                <BubbleContent>O payout de terça voltou com o erro R03.</BubbleContent>
              </Bubble>
            </MessageBody>
          </Message>
          <Message align="end">
            <MessageBody>
              <MessageHeader>
                <MessageAuthor>Ana Luísa Figueiredo de Albuquerque e Vasconcelos</MessageAuthor>
                <MessageTime dateTime="2026-09-30T10:02">10:02</MessageTime>
              </MessageHeader>
              <Bubble>
                <BubbleContent>Ok</BubbleContent>
              </Bubble>
            </MessageBody>
          </Message>
        </Stack>
      </Scene>
    </Grid>
  ),
};

export const Receipt: Story = {
  parameters: scenario('receipt'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Four marks and a word"
        note="Sending breathes a clock, sent is one tick, delivered two, read two in full ink. A failure is a word under the bubble and the retry control beside it."
      >
        <Stack>
          <Mine status="sending">Estou a reenviar agora.</Mine>
          <Mine status="sent" time="09:40">
            Pedi ao banco para confirmar o IBAN.
          </Mine>
          <Mine status="delivered" time="09:41">
            Manda-me o IBAN quando chegar.
          </Mine>
          <Mine status="read" time="09:42">
            E marco a fatura como paga só depois do crédito.
          </Mine>
          <Message align="end" aria-label="Tu" status="failed">
            <MessageBody>
              <Bubble>
                <BubbleContent>E a fatura 4417 também.</BubbleContent>
                <BubbleRetry />
              </Bubble>
              <MessageFooter>
                <MessageReceipt />
              </MessageFooter>
            </MessageBody>
          </Message>
        </Stack>
      </Scene>
    </Grid>
  ),
};

export const Actions: Story = {
  parameters: scenario('actions'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Revealed, and always"
        note="The first reply shows its actions under the pointer or on focus inside it; the second always. Neither moves the words when the toolbar arrives."
      >
        <Stack>
          <Message aria-label="Assistente">
            <MessageBody>
              <Bubble variant="plain">
                <BubbleContent>{DRAFTS[0]}</BubbleContent>
              </Bubble>
              <MessageFooter>
                <ReplyActions />
                <MessageTime dateTime="2026-09-30T14:45">14:45</MessageTime>
              </MessageFooter>
            </MessageBody>
          </Message>
          <Message actionsVisibility="always" aria-label="Assistente">
            <MessageBody>
              <Bubble variant="plain">
                <BubbleContent>{DRAFTS[1]}</BubbleContent>
              </Bubble>
              <MessageFooter>
                <ReplyActions />
              </MessageFooter>
            </MessageBody>
          </Message>
        </Stack>
      </Scene>
    </Grid>
  ),
};

export const Activity: Story = {
  parameters: scenario('activity'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="A log, and a single step"
        note="Two steps done and one in progress; below, the same card with one line. Turn on reduced motion and the band stops."
      >
        <Stack>
          <Message aria-label="Assistente" status="streaming">
            <MessageBody>
              <MessageActivity>
                <MessageActivityStep status="complete">
                  Li o registo das 14:00 às 14:10
                </MessageActivityStep>
                <MessageActivityStep status="complete">
                  Comparei com o deploy das 14:04
                </MessageActivityStep>
                <MessageActivityStep>A procurar a causa do p95…</MessageActivityStep>
                <MessageActivityStep status="pending">Escrever a resposta</MessageActivityStep>
              </MessageActivity>
            </MessageBody>
          </Message>
          <Message aria-label="Assistente" status="streaming">
            <MessageBody>
              <MessageActivity>
                <MessageActivityStep>A pensar…</MessageActivityStep>
              </MessageActivity>
            </MessageBody>
          </Message>
        </Stack>
      </Scene>
    </Grid>
  ),
};

function VersionedReply() {
  const [version, setVersion] = useState(0);
  return (
    <Message
      actionsVisibility="always"
      aria-label="Assistente"
      onVersionChange={setVersion}
      version={version}
      versionCount={DRAFTS.length}
    >
      <MessageBody>
        <Bubble variant="plain">
          <BubbleContent>{DRAFTS[version]}</BubbleContent>
        </Bubble>
        <MessageFooter>
          <MessageVersions />
          <ReplyActions />
        </MessageFooter>
      </MessageBody>
    </Message>
  );
}

export const Versions: Story = {
  parameters: scenario('versions'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Three drafts of one note"
        note="Press the chevrons or focus one and use the arrows: the pager stops at 1 de 3 and 3 de 3, and the words change with it."
      >
        <VersionedReply />
      </Scene>
    </Grid>
  ),
};

function ThreadRow({
  author,
  children,
  reactions,
  when,
}: {
  author: string;
  children: string;
  reactions?: number;
  when: string;
}) {
  return (
    <Message layout="thread">
      <MessageAvatar>
        <Avatar decorative name={author} />
      </MessageAvatar>
      <MessageBody>
        <MessageHeader>
          <MessageAuthor>{author}</MessageAuthor>
          <MessageTime dateTime="2026-09-30T09:12">{when}</MessageTime>
        </MessageHeader>
        <Bubble>
          <BubbleContent>{children}</BubbleContent>
          {reactions === undefined ? null : (
            <BubbleReactions>
              <BubbleReaction count={reactions} defaultPressed>
                👍
              </BubbleReaction>
            </BubbleReactions>
          )}
        </Bubble>
      </MessageBody>
      <MessageActions>
        <IconButton aria-label="Responder" size="sm" variant="ghost">
          <Icon>
            <Glyph name="arrow-left" />
          </Icon>
        </IconButton>
      </MessageActions>
    </Message>
  );
}

export const Layout: Story = {
  parameters: scenario('layout'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="Comments on a client account"
        note="Point at a row: the band says which comment the floating reply control belongs to. At 360 pixels the name and the hour wrap before the words do."
      >
        <Stack>
          <ThreadRow author="Emília Parker" reactions={2} when="há 4 minutos">
            Podemos nomear o dono do SSO antes da revisão com o cliente?
          </ThreadRow>
          <ThreadRow author="Tiago Moreira" when="há 8 minutos">
            Passei a nota de compras para cima do resumo de risco da renovação.
          </ThreadRow>
        </Stack>
        <Measure>
          <ThreadRow author="Hannah Stone" when="há 44 minutos">
            O texto de retenção está aprovado com a nota de exceção anexada.
          </ThreadRow>
        </Measure>
      </Scene>
    </Grid>
  ),
};
