import type {
  MessageScrollerEdges,
  MessageScrollerPosition,
  MessageScrollerState,
  ScrollCommandOptions,
  ScrollToMessageOptions,
} from '@slotted/core/message-scroller';
import type {
  ComponentPropsWithRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  RefObject,
} from 'react';

export type {
  MessageScrollerEdges,
  MessageScrollerPosition,
  MessageScrollerState,
  ScrollCommandOptions,
  ScrollToMessageOptions,
};

export interface MessageScrollerMessages {
  label: string;
  jumpToEnd: string;
  jumpToStart: string;
  /** ICU plural with `count`. */
  jumpCount: string;
  loader: string;
  unread: string;
  busy: string;
  idle: string;
}

export interface MessageScrollerDefaults {
  follow: boolean;
  defaultPosition: MessageScrollerPosition;
  peek: number;
  scrollMargin: number;
  /** BCP 47, for the count on the jump control. Absent, the runtime's own. */
  locale: string | undefined;
  messages: MessageScrollerMessages;
}

export interface MessageScrollerDefaultsProviderProps extends Partial<
  Omit<MessageScrollerDefaults, 'messages'>
> {
  messages?: Partial<MessageScrollerMessages> | undefined;
  children?: ReactNode | undefined;
}

/** The commands a consumer cannot express declaratively, and the frame itself. */
export interface MessageScrollerHandle {
  scrollToMessage: (id: string, options?: ScrollToMessageOptions) => boolean;
  scrollToEnd: (options?: ScrollCommandOptions) => boolean;
  scrollToStart: (options?: ScrollCommandOptions) => boolean;
  /** Moves focus to the viewport, which scrolls from the keyboard. */
  focus: () => void;
  readonly root: HTMLElement | null;
}

export interface MessageScrollerContextValue extends Omit<MessageScrollerHandle, 'root' | 'focus'> {
  state: MessageScrollerState;
  messages: MessageScrollerMessages;
  locale: string | undefined;
  defaultPosition: MessageScrollerPosition;
  busy: boolean;
  registerViewport: (node: HTMLElement | null) => void;
  registerContent: (node: HTMLElement | null) => void;
}

type DataAttributes = { [key: `data-${string}`]: string | number | undefined };

export type MessageScrollerRootProps = HTMLAttributes<HTMLElement> &
  DataAttributes & { children?: ReactNode | undefined };

type RenderProp = ((props: MessageScrollerRootProps) => ReactElement) | undefined;

export interface MessageScrollerProps extends Omit<ComponentPropsWithRef<'div'>, 'ref'> {
  /** Follow new content while the reader is at the live edge. Falls back to the provider, then `false`. */
  follow?: boolean | undefined;
  /** Where the conversation opens, applied once. Falls back to the provider, then `last-anchor`. */
  defaultPosition?: MessageScrollerPosition | undefined;
  /** Pixels from an edge that still count as at it. Default 8. */
  edgeThreshold?: number | undefined;
  /** Pixels kept above a row the scroller scrolls to. Falls back to the provider, then 0. */
  scrollMargin?: number | undefined;
  /** Pixels of the previous row kept above a newly anchored turn. Falls back to the provider, then 64. */
  peek?: number | undefined;
  /** Keep the reader's row in place when older rows arrive above. Default `true`. */
  preserveOnPrepend?: boolean | undefined;
  /**
   * A reply is streaming: the log is `aria-busy`, so its words are not read
   * as they arrive, and the change is announced once in each direction.
   */
  busy?: boolean | undefined;
  /** The reader reached the top — the moment to ask for older messages. */
  onReachStart?: ((reason: 'scroll') => void) | undefined;
  /** The anchored turn the reader is at changed. */
  onAnchorChange?: ((id: string | null, reason: 'scroll' | 'programmatic') => void) | undefined;
  onScrollableChange?: ((edges: MessageScrollerEdges) => void) | undefined;
  ref?:
    | RefObject<MessageScrollerHandle | null>
    | ((handle: MessageScrollerHandle | null) => void)
    | undefined;
  render?: RenderProp;
}

export interface MessageScrollerPartProps extends ComponentPropsWithRef<'div'> {
  render?: RenderProp;
}

export interface MessageScrollerItemProps extends ComponentPropsWithRef<'div'> {
  /** The stable id the scroller addresses the row by. */
  messageId?: string | undefined;
  /** The row starts a turn: an appended anchor stands near the top. */
  anchor?: boolean | undefined;
  render?: RenderProp;
}

export interface MessageScrollerSeparatorProps extends ComponentPropsWithRef<'div'> {
  /** Keep the separator at the top of the frame while the rows after it are in view. */
  sticky?: boolean | undefined;
  render?: RenderProp;
}

export interface MessageScrollerJumpProps extends ComponentPropsWithRef<'button'> {
  direction?: 'end' | 'start' | undefined;
  behavior?: ScrollBehavior | undefined;
}
