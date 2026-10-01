import { useContext, useEffect } from 'react';
import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';

import { Glyph, Icon } from '../icon';
import { formatMessage } from './message-defaults';
import { reasonOf, useMessage } from './message';
import { BubbleMetaContext } from './bubble-context';
import type {
  MessageActivityStepProps,
  MessagePartProps,
  MessageReceiptProps,
  MessageRootProps,
  MessageSpanProps,
  MessageTimeProps,
  MessageVersionsProps,
} from './message.types';

type Part = { render?: ((props: MessageRootProps) => ReactElement) | undefined };

function part<P extends Part>(name: string, element: 'div' | 'span') {
  return function MessagePart({ render, ...nativeProps }: P) {
    const rootProps = { ...(nativeProps as MessageRootProps), 'data-part': name };
    if (render !== undefined) return render(rootProps);
    return element === 'div' ? <div {...rootProps} /> : <span {...rootProps} />;
  };
}

/** The box the sender's avatar stands in: at the foot of a run, or beside the name in a thread. */
export const MessageAvatar = part<MessagePartProps>('avatar', 'div');

/** The column of the words: the header, the bubbles, the attachments and the footer. */
export const MessageBody = part<MessagePartProps>('body', 'div');

/** The name and, in a thread, the hour, over the words. */
export const MessageHeader = part<MessagePartProps>('header', 'div');

/** What is said about the message under it: a receipt outside a bubble, the actions, the versions. */
export const MessageFooter = part<MessagePartProps>('footer', 'div');

/**
 * The sender's name. While it is on the page the article is named by it, so a
 * screen reader that moves from article to article hears who spoke.
 */
export function MessageAuthor({ id, render, ...nativeProps }: MessageSpanProps) {
  const message = useMessage();
  const { registerAuthor } = message;
  useEffect(() => {
    registerAuthor(true);
    return () => registerAuthor(false);
  }, [registerAuthor]);
  const rootProps: MessageRootProps = {
    ...nativeProps,
    'data-part': 'author',
    id: id ?? message.authorId,
  };
  return render === undefined ? <span {...rootProps} /> : render(rootProps);
}

/** The hour, as a `time` element; `dateTime` is the machine-readable instant. */
export function MessageTime({ render, ...nativeProps }: MessageTimeProps) {
  const rootProps = { ...nativeProps, 'data-part': 'time' } as MessageRootProps;
  return render === undefined ? <time {...(rootProps as MessageTimeProps)} /> : render(rootProps);
}

const RECEIPT_GLYPH = {
  sending: 'clock',
  sent: 'check',
  delivered: 'check-check',
  read: 'check-check',
} as const;

/**
 * Where the message is in its delivery. Inside a bubble's meta it is a mark
 * beside the hour with the word hidden for assistive technology; anywhere
 * else it is the word alone, set in the meta type — a mark beside a word of
 * twelve pixels is two voices saying one thing.
 */
export function MessageReceipt({ children, render, status, ...nativeProps }: MessageReceiptProps) {
  const message = useMessage();
  const inMeta = useContext(BubbleMetaContext);
  const resolved =
    status ?? (message.status === 'streaming' ? undefined : message.status) ?? 'sent';
  const word = message.messages[resolved];
  const glyph = resolved === 'failed' ? undefined : RECEIPT_GLYPH[resolved];

  const rootProps: MessageRootProps = {
    ...nativeProps,
    children:
      children ??
      (inMeta && glyph !== undefined ? (
        <>
          <Icon>
            <Glyph name={glyph} />
          </Icon>
          <span>{word}</span>
        </>
      ) : (
        word
      )),
    'data-part': 'receipt',
    'data-status': resolved,
  };
  return render === undefined ? <span {...rootProps} /> : render(rootProps);
}

/** The message's own actions — copy, reply, rate — as a toolbar the row reveals. */
export function MessageActions({ render, ...nativeProps }: MessagePartProps) {
  const { messages } = useMessage();
  const rootProps: MessageRootProps = {
    'aria-label': messages.actions,
    role: 'toolbar',
    ...nativeProps,
    'data-part': 'actions',
  };
  return render === undefined ? <div {...rootProps} /> : render(rootProps);
}

/**
 * What a reply is doing before it has words, as a short log of steps. It is a
 * status region: a step that becomes current is read once, in words.
 */
export function MessageActivity({ render, ...nativeProps }: MessagePartProps) {
  const rootProps: MessageRootProps = { role: 'status', ...nativeProps, 'data-part': 'activity' };
  return render === undefined ? <div {...rootProps} /> : render(rootProps);
}

/** One step of an activity: done, in progress, or waiting. */
export function MessageActivityStep({
  children,
  render,
  status = 'current',
  ...nativeProps
}: MessageActivityStepProps) {
  const mark =
    status === 'complete' ? (
      <Icon>
        <Glyph name="check" />
      </Icon>
    ) : status === 'current' ? (
      <span aria-hidden="true">
        <span aria-hidden="true" data-ui="spinner" />
      </span>
    ) : (
      <span aria-hidden="true" />
    );
  const rootProps: MessageRootProps = {
    ...(status === 'current' ? { 'aria-current': 'step' as const } : {}),
    ...nativeProps,
    children: (
      <>
        {mark}
        <span>{children}</span>
      </>
    ),
    ...(status === 'complete' ? { 'data-complete': '' } : {}),
    ...(status === 'current' ? { 'data-current': '' } : {}),
    'data-part': 'activity-step',
  };
  return render === undefined ? <div {...rootProps} /> : render(rootProps);
}

/**
 * `2 de 3` between two controls that page through a reply's versions. It
 * draws only while there are two or more; the controls stop at the ends
 * rather than wrapping, so the first and the last are where the reader left
 * them. `ArrowLeft` and `ArrowRight` on either control page as well.
 */
export function MessageVersions({
  children,
  onKeyDown,
  render,
  ...nativeProps
}: MessageVersionsProps) {
  const message = useMessage();
  const { messages, requestVersion, version, versionCount } = message;
  if (versionCount < 2) return null;

  const step = (delta: number) => (event: MouseEvent<HTMLButtonElement>) =>
    requestVersion(version + delta, reasonOf(event), event);

  const rootProps: MessageRootProps = {
    'aria-label': messages.versions,
    role: 'group',
    ...nativeProps,
    children: children ?? (
      <>
        <button
          aria-label={messages.previousVersion}
          data-part="version-previous"
          disabled={version <= 0}
          onClick={step(-1)}
          type="button"
        >
          <Icon>
            <Glyph name="chevron-right" />
          </Icon>
        </button>
        <span aria-live="polite" data-part="version-label">
          {formatMessage(messages.versionLabel, { current: version + 1, total: versionCount })}
        </span>
        <button
          aria-label={messages.nextVersion}
          data-part="version-next"
          disabled={version >= versionCount - 1}
          onClick={step(1)}
          type="button"
        >
          <Icon>
            <Glyph name="chevron-right" />
          </Icon>
        </button>
      </>
    ),
    'data-part': 'versions',
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event as KeyboardEvent<HTMLDivElement>);
      if (event.defaultPrevented) return;
      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      const back = rtl ? 'ArrowRight' : 'ArrowLeft';
      if (event.key !== forward && event.key !== back) return;
      event.preventDefault();
      requestVersion(version + (event.key === forward ? 1 : -1), 'keyboard', event);
    },
  };
  return render === undefined ? <div {...rootProps} /> : render(rootProps);
}
