import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createControllable } from '@slotted/core/state';
import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent } from 'react';

import { copyToClipboard } from './description-list-clipboard';
import {
  DescriptionListItemProvider,
  useDescriptionList,
  useDescriptionListItem,
} from './description-list';
import type {
  DescriptionListActionProps,
  DescriptionListActionRootProps,
  DescriptionListCopyRequest,
  DescriptionListDescriptionProps,
  DescriptionListDescriptionRootProps,
  DescriptionListHintProps,
  DescriptionListHintRootProps,
  DescriptionListItemProps,
  DescriptionListItemRootProps,
  DescriptionListTermProps,
  DescriptionListTermRootProps,
} from './description-list.types';

/** How long the copy control says it succeeded before returning to rest. */
export const COPIED_FOR = 2000;

/**
 * A span is stated in columns and the list may have fewer, so a pair asking for
 * three columns of a two-column list takes two. Grid would otherwise invent the
 * tracks it was asked for and the list would quietly grow a column nobody
 * declared.
 */
export function spanWithin(span: number | undefined, columns: number): number | undefined {
  if (span === undefined) return undefined;
  const clamped = Math.min(Math.max(Math.trunc(span), 1), columns);
  return clamped > 1 ? clamped : undefined;
}

/**
 * One name-value pair, and the `div` the HTML Standard permits inside a `dl`.
 *
 * It is the box a rule, a tint and a span apply to, and the only part that can
 * see both the term and the action — so it is where the identifier that ties
 * the two together is made.
 */
export function DescriptionListItem({
  children,
  ref,
  render,
  span,
  ...nativeProps
}: DescriptionListItemProps) {
  const list = useDescriptionList();
  const generatedId = useId();
  const columns = spanWithin(span, list.columns);

  const rootProps: DescriptionListItemRootProps = {
    ...nativeProps,
    children,
    'data-part': 'item',
    'data-span': columns === undefined ? undefined : String(columns),
  };

  return (
    <DescriptionListItemProvider value={{ termId: `slotted-description-list-${generatedId}` }}>
      {render === undefined ? <div {...rootProps} ref={ref} /> : render(rootProps)}
    </DescriptionListItemProvider>
  );
}

/**
 * The name. It carries an identifier so the row's action can be described by
 * it; a consumer's own `id` wins, because a page that already references this
 * term references it by the name it chose.
 */
export function DescriptionListTerm({
  children,
  ref,
  render,
  ...nativeProps
}: DescriptionListTermProps) {
  const item = useDescriptionListItem();

  const rootProps: DescriptionListTermRootProps = {
    ...nativeProps,
    children,
    'data-part': 'term',
    id: nativeProps.id ?? item?.termId,
  };

  return render === undefined ? <dt {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * One line explaining what the term means, inside the `dt` that names it. It is
 * part of the term's own text on purpose: a reader who reaches the term hears
 * the explanation with it, and the row's action — described by the same `dt` —
 * inherits the context rather than repeating it.
 *
 * PatternFly puts this in a popover. A layer is the right answer for a
 * paragraph and the wrong one for a sentence, and `popover` will own the
 * paragraph when it lands.
 */
export function DescriptionListHint({
  children,
  ref,
  render,
  ...nativeProps
}: DescriptionListHintProps) {
  const rootProps: DescriptionListHintRootProps = {
    ...nativeProps,
    children,
    'data-part': 'hint',
  };

  return render === undefined ? <span {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * The value's cell: the value itself, and the controls that reach it.
 *
 * **Clamping is visual only.** Every character stays in the DOM, selectable,
 * copyable and readable by a screen reader, which is what section 10 of the
 * feature guide means by never truncating without access.
 *
 * **Empty is a decision rather than an omission.** Nullish children are empty
 * — that is what a template produces for a field a server did not send — and
 * the placeholder is a drawn rule with the reason in text.
 */
export function DescriptionListDescription({
  children,
  clamp,
  copy,
  copyValue,
  defaultRevealed,
  empty,
  onCopy,
  onRevealedChange,
  placeholder,
  ref,
  render,
  revealed,
  style,
  ...nativeProps
}: DescriptionListDescriptionProps) {
  const list = useDescriptionList();
  const value = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [own, setOwn] = useState(defaultRevealed ?? false);
  const [copied, setCopied] = useState(false);
  const current = revealed ?? own;

  const lines = clamp === undefined ? 0 : Math.max(0, Math.trunc(clamp));
  const clamped = lines > 0;
  const missing = empty ?? (children === undefined || children === null || children === '');

  useEffect(() => () => clearTimeout(timer.current), []);

  const reveal = (next: boolean, reason: 'pointer' | 'keyboard', source?: unknown) => {
    const state = createControllable<boolean>({
      controlled: revealed,
      initial: current,
      onRequest: (request) => onRevealedChange?.(request.value, request),
    });
    if (state.request(next, reason, source)) setOwn(next);
  };

  const write = async (reason: 'pointer' | 'keyboard', source?: unknown) => {
    /* Read at the moment of the press rather than during render: a formatted
       value is what the reader sees, and `copyValue` is for when it is not. */
    const text = copyValue ?? value.current?.textContent?.trim() ?? '';
    const done = await copyToClipboard(text);

    if (done) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_FOR);
      /* Through the shared announcer rather than a region this family owns, so
         two copies in one update are both heard. */
      getLiveAnnouncer().announce(list.labels.copied);
    }

    const request: DescriptionListCopyRequest = { copied: done, reason, source, value: text };
    onCopy?.(request);
  };

  /**
   * `Enter` and `Space` both activate a button and the browser turns each into
   * a click, so the reason a request carries is decided by whether a key came
   * first. It is the difference between a press and a key, and a consumer that
   * has to guess writes the wrong handler.
   */
  const keyed = useRef(false);
  const remember = (event: { key: string }) => {
    if (event.key === 'Enter' || event.key === ' ') keyed.current = true;
  };
  const press = (
    event: MouseEvent<HTMLButtonElement>,
    act: (reason: 'pointer' | 'keyboard', source?: unknown) => unknown,
  ) => {
    const reason = keyed.current ? 'keyboard' : 'pointer';
    keyed.current = false;
    return act(reason, event);
  };

  const rootProps: DescriptionListDescriptionRootProps = {
    ...nativeProps,
    children: (
      <>
        <span data-part="value" ref={value}>
          {missing ? (
            <>
              <span aria-hidden="true" data-part="placeholder" />
              <span data-ui="visually-hidden">{placeholder ?? list.labels.placeholder}</span>
            </>
          ) : (
            children
          )}
        </span>
        {copy === true ? (
          <button
            aria-label={list.labels.copy}
            data-complete={copied ? '' : undefined}
            data-part="copy"
            onClick={(event) => void press(event, write)}
            onKeyDown={remember}
            type="button"
          />
        ) : null}
        {clamped ? (
          <button
            aria-expanded={current}
            data-part="toggle"
            onClick={(event) =>
              void press(event, (reason, source) => reveal(!current, reason, source))
            }
            onKeyDown={remember}
            type="button"
          >
            {current ? list.labels.collapse : list.labels.reveal}
          </button>
        ) : null}
      </>
    ),
    'data-clamp': clamped ? '' : undefined,
    'data-part': 'description',
    'data-revealed': clamped && current ? '' : undefined,
    style: clamped
      ? ({ ...style, '--slotted-description-list-clamp': lines } as CSSProperties)
      : style,
  };

  return render === undefined ? <dd {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * The row's own action, in a second `dd` of the same group — which is what a
 * `dt` followed by more than one `dd` is for, and what GOV.UK's summary list
 * does.
 *
 * It is named by its own term through `aria-describedby`, so a reader who
 * reaches "Change" out of context hears which row it changes. GOV.UK repeats
 * the term as visually hidden text inside every action, which a template
 * system has to do; a reference says it once and cannot drift. A consumer's own
 * `aria-describedby` is composed with rather than replaced.
 */
export function DescriptionListAction({
  children,
  ref,
  render,
  ...nativeProps
}: DescriptionListActionProps) {
  const item = useDescriptionListItem();
  const described = [nativeProps['aria-describedby'], item?.termId].filter(Boolean).join(' ');

  const rootProps: DescriptionListActionRootProps = {
    ...nativeProps,
    'aria-describedby': described === '' ? undefined : described,
    children,
    'data-part': 'action',
  };

  return render === undefined ? <dd {...rootProps} ref={ref} /> : render(rootProps);
}
