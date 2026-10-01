import { scenario } from '@slotted/storybook-workbench';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from '../avatar';
import {
  Attachment,
  AttachmentBody,
  AttachmentDetail,
  AttachmentGroup,
  AttachmentLink,
  AttachmentPreview,
} from '../attachment';
import { Grid, Scene } from '../field/field-demo';
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerJump,
  MessageScrollerSeparator,
  MessageScrollerViewport,
} from '../message-scroller';
import {
  Bubble,
  BubbleContent,
  BubbleMeta,
  BubbleQuote,
  BubbleReaction,
  BubbleReactions,
  BubbleRetry,
  BubbleTyping,
  Message,
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
import { MARTA, Mine, ReplyActions, Stack, Theirs } from './message-demo';

const meta = {
  title: 'Components/Message/Overview',
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Anatomy: Story = {
  parameters: scenario('anatomy'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="A row and a surface"
        note='Two members under data-ui="message": the article with its avatar, header, footer, receipt, actions and versions, and the bubble with its meta, quote, reactions and retry control.'
      >
        <MessageGroup>
          <Message status="read" versionCount={2}>
            <MessageAvatar>
              <Avatar name={MARTA} size="sm" />
            </MessageAvatar>
            <MessageBody>
              <MessageHeader>
                <MessageAuthor>{MARTA}</MessageAuthor>
                <MessageTime dateTime="2026-09-30T09:38">09:38</MessageTime>
              </MessageHeader>
              <Bubble>
                <BubbleContent>
                  <BubbleQuote author="Tu">Já tens o IBAN novo?</BubbleQuote>
                  Chega hoje à tarde.
                  <BubbleMeta>
                    <MessageTime dateTime="2026-09-30T09:39">09:39</MessageTime>
                  </BubbleMeta>
                </BubbleContent>
                <BubbleReactions>
                  <BubbleReaction aria-label="Gosto, 1" count={1}>
                    👍
                  </BubbleReaction>
                </BubbleReactions>
              </Bubble>
              <MessageFooter>
                <MessageVersions />
                <ReplyActions />
              </MessageFooter>
            </MessageBody>
          </Message>
        </MessageGroup>
      </Scene>
    </Grid>
  ),
};

export const Conversation: Story = {
  parameters: scenario('conversation'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="A payout returned by the bank"
        note="Marta’s run with one avatar, the reader’s messages with the hour and two ticks inside, a failed one with its retry control, and Marta writing."
      >
        <Stack>
          <MessageGroup>
            <Theirs avatar={false}>O payout de terça voltou com o erro R03.</Theirs>
            <Theirs avatar={false}>
              A conta de destino não existe no banco. Já pedi o IBAN novo ao fornecedor.
            </Theirs>
            <Theirs time="09:38">Chega hoje à tarde.</Theirs>
          </MessageGroup>
          <MessageGroup>
            <Mine status="read" time="09:41">
              Ótimo. Reenvio assim que chegar.
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
          </MessageGroup>
          <Message aria-label={MARTA}>
            <MessageAvatar>
              <Avatar name={MARTA} size="sm" />
            </MessageAvatar>
            <MessageBody>
              <Bubble>
                <BubbleContent>
                  <BubbleTyping label="Marta Silva está a escrever" />
                </BubbleContent>
              </Bubble>
            </MessageBody>
          </Message>
        </Stack>
      </Scene>
    </Grid>
  ),
};

export const Thread: Story = {
  parameters: scenario('thread'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="The same family as a comment thread"
        note='layout="thread" on a group: avatars at the top, names inline, words unframed, reactions as a row under them and a band under the pointer.'
      >
        <MessageGroup layout="thread">
          <Message>
            <MessageAvatar>
              <Avatar decorative name="Emília Parker" />
            </MessageAvatar>
            <MessageBody>
              <MessageHeader>
                <MessageAuthor>Emília Parker</MessageAuthor>
                <MessageTime dateTime="2026-09-30T09:12">há 4 minutos</MessageTime>
              </MessageHeader>
              <Bubble>
                <BubbleContent>
                  Podemos nomear o dono do SSO antes da revisão com o cliente?
                </BubbleContent>
                <BubbleReactions>
                  <BubbleReaction aria-label="Gosto, 2" count={2} defaultPressed>
                    👍
                  </BubbleReaction>
                </BubbleReactions>
              </Bubble>
            </MessageBody>
          </Message>
          <Message>
            <MessageAvatar>
              <Avatar decorative name="Tiago Moreira" />
            </MessageAvatar>
            <MessageBody>
              <MessageHeader>
                <MessageAuthor>Tiago Moreira</MessageAuthor>
                <MessageTime dateTime="2026-09-30T09:08">há 8 minutos</MessageTime>
              </MessageHeader>
              <Bubble>
                <BubbleContent>
                  Passei a nota de compras para cima do resumo de risco da renovação.
                </BubbleContent>
              </Bubble>
            </MessageBody>
          </Message>
        </MessageGroup>
      </Scene>
    </Grid>
  ),
};

export const Composition: Story = {
  parameters: scenario('composition'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="In a scroller, with a file"
        note="Rows in a MessageScroller with a sticky day, an attachment in the reader’s message beside its bubble, and an assistant reply working before it has words."
      >
        <div className="slotted-demo-viewport" data-size="tall">
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent>
                <MessageScrollerItem>
                  <MessageScrollerSeparator sticky>Hoje</MessageScrollerSeparator>
                </MessageScrollerItem>
                <MessageScrollerItem anchor messageId="c1">
                  <Message align="end" aria-label="Tu" status="delivered">
                    <MessageBody>
                      <AttachmentGroup aria-label="Anexos" layout="list">
                        <Attachment file={{ name: 'extrato-setembro.pdf', size: 412_000 }}>
                          <AttachmentPreview />
                          <AttachmentBody>
                            <AttachmentLink href="#extrato" />
                            <AttachmentDetail />
                          </AttachmentBody>
                        </Attachment>
                      </AttachmentGroup>
                      <Bubble>
                        <BubbleContent>
                          O extrato mostra o débito duas vezes. Podes verificar?
                          <BubbleMeta>
                            <MessageTime dateTime="2026-09-30T14:02">14:02</MessageTime>
                            <MessageReceipt />
                          </BubbleMeta>
                        </BubbleContent>
                      </Bubble>
                    </MessageBody>
                  </Message>
                </MessageScrollerItem>
                <MessageScrollerItem messageId="c2">
                  <Message aria-label="Assistente" status="streaming">
                    <MessageBody>
                      <MessageActivity>
                        <MessageActivityStep status="complete">
                          Li o extrato de setembro
                        </MessageActivityStep>
                        <MessageActivityStep>A comparar com os movimentos…</MessageActivityStep>
                      </MessageActivity>
                    </MessageBody>
                  </Message>
                </MessageScrollerItem>
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerJump />
          </MessageScroller>
        </div>
      </Scene>
    </Grid>
  ),
};

export const Accessibility: Story = {
  parameters: scenario('accessibility'),
  render: () => (
    <Grid columns={1}>
      <Scene
        label="What a screen reader hears"
        note="Each article is named by its author; inside a bubble the ticks carry the word Lida for assistive technology; the typing dots are one image with a name, never three characters."
      >
        <Stack>
          <Theirs time="09:38">Chega hoje à tarde.</Theirs>
          <Mine status="read" time="09:41">
            Reenvio assim que chegar.
          </Mine>
        </Stack>
      </Scene>
    </Grid>
  ),
};
