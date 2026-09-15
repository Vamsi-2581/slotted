import '@slotted/styles/code-block/code-block.css';

import { writeToClipboard } from '@slotted/core/clipboard';
import {
  copyText,
  gutterDigits,
  leadingColumns,
  lineMarks,
  lineText,
  plainLines,
} from '@slotted/core/code';
import type { CodeLine } from '@slotted/core/code';
import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createControllable } from '@slotted/core/state';
import { fileKind } from '@slotted/core/upload';
import { useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';

import { ScrollArea } from '../scroll-area';
import type { ScrollAreaHandle } from '../scroll-area';
import { Skeleton } from '../skeleton';
import { CODE_BLOCK_LABELS, useCodeBlockDefaults } from './code-block-defaults';
import type {
  CodeBlockLabels,
  CodeBlockProps,
  CodeBlockRevealedReason,
  CodeBlockWrapReason,
} from './code-block.types';

/** How long the check stays in place of the sheets: six short steps of the motion scale. */
const COPIED_FOR = 2000;

const KIND_ICON: Record<string, string> = {
  archive: '--slotted-icon-file-archive',
  audio: '--slotted-icon-file-audio',
  document: '--slotted-icon-file-type',
  image: '--slotted-icon-file-image',
  pdf: '--slotted-icon-file-text',
  presentation: '--slotted-icon-presentation',
  spreadsheet: '--slotted-icon-file-spreadsheet',
  video: '--slotted-icon-file-video',
};

/**
 * A block of source: a header that names the file and holds the two controls,
 * a body that is a `scroll-area`, and inside it a `pre` whose every line is a
 * grid row. Tokens come in from an engine outside the family and are drawn as
 * text in spans; HTML never does.
 */
export function CodeBlock({
  actions,
  code,
  collapseAfter,
  copy: copyProp,
  copyRemoved = false,
  defaultRevealed,
  defaultWrap,
  fileName,
  highlight: highlightProp,
  labels: labelsProp,
  language = 'text',
  lineNumbers: lineNumbersProp,
  loading = false,
  marks,
  maxLines,
  onCopy,
  onHighlightError,
  onRevealedChange,
  onWrapChange,
  preProps,
  ref,
  renderLine,
  renderToken,
  revealed: revealedProp,
  start = 1,
  tabSize = 2,
  title,
  tokens,
  wrap: wrapProp,
  ...nativeProps
}: CodeBlockProps) {
  const defaults = useCodeBlockDefaults();
  const labels: CodeBlockLabels = useMemo(
    () => ({ ...CODE_BLOCK_LABELS, ...defaults.labels, ...labelsProp }),
    [defaults.labels, labelsProp],
  );
  const highlight = highlightProp === null ? undefined : (highlightProp ?? defaults.highlight);
  const lineNumbers = lineNumbersProp ?? defaults.lineNumbers ?? false;
  const copyControl = copyProp ?? defaults.copy ?? true;

  const base = useId();
  const root = useRef<HTMLDivElement | null>(null);
  const body = useRef<ScrollAreaHandle | null>(null);

  /* ── Lines ───────────────────────────────────────────────────────────── */

  const plain = useMemo(() => plainLines(code), [code]);
  const [resolved, setResolved] = useState<{ code: string; lines: readonly CodeLine[] } | null>(
    null,
  );

  useEffect(() => {
    if (!highlight || tokens) return;
    let live = true;
    Promise.resolve()
      .then(() => highlight(code, language))
      .then((lines) => {
        if (live) setResolved({ code, lines });
      })
      .catch((error: unknown) => {
        if (live) onHighlightError?.(error);
      });
    return () => {
      live = false;
    };
  }, [code, highlight, language, onHighlightError, tokens]);

  const lines: readonly CodeLine[] =
    tokens ?? (resolved && resolved.code === code ? resolved.lines : plain);
  const count = lines.length;
  const marksByLine = useMemo(() => lineMarks(marks, count), [count, marks]);
  const hasMarks = marksByLine.some((entry) => entry.mark !== undefined || entry.dim);

  /* ── The two values ──────────────────────────────────────────────────── */

  const [ownWrap, setOwnWrap] = useState(defaultWrap ?? false);
  const wrap = wrapProp ?? ownWrap;
  const [ownRevealed, setOwnRevealed] = useState(defaultRevealed ?? false);
  const revealed = revealedProp ?? ownRevealed;

  function requestWrap(next: boolean, reason: CodeBlockWrapReason, source?: unknown) {
    const state = createControllable<boolean>({
      controlled: wrapProp,
      initial: wrap,
      onRequest: (request) => onWrapChange?.(request.value, request as never),
    });
    if (state.request(next, reason, source)) setOwnWrap(next);
  }

  function requestRevealed(next: boolean, reason: CodeBlockRevealedReason, source?: unknown) {
    const state = createControllable<boolean>({
      controlled: revealedProp,
      initial: revealed,
      onRequest: (request) => onRevealedChange?.(request.value, request as never),
    });
    if (state.request(next, reason, source)) setOwnRevealed(next);
  }

  /* ── Overflow, for the wrap control ──────────────────────────────────── */

  const [overflow, setOverflow] = useState(false);

  /* ── Copy ────────────────────────────────────────────────────────────── */

  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function write(reason: 'pointer' | 'keyboard', source?: unknown) {
    const value = copyText(code, marks, { includeRemoved: copyRemoved });
    const done = (await writeToClipboard(value)) !== 'refused';
    if (done) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_FOR);
    }
    getLiveAnnouncer(root.current?.ownerDocument).announce(
      done ? labels.copied : labels.copyFailed,
    );
    onCopy?.({ copied: done, reason, source, value });
    return done;
  }

  const keyed = useRef(false);
  const copyHandlers = {
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      const reason = keyed.current ? 'keyboard' : 'pointer';
      keyed.current = false;
      void write(reason, event);
    },
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') keyed.current = true;
    },
  };

  useImperativeHandle(
    ref as never,
    () => ({
      copy: () => write('keyboard'),
      scrollToLine: (line: number) => {
        const element = root.current?.querySelector<HTMLElement>(`[data-line='${line}']`);
        if (element) body.current?.reveal(element);
      },
      get root() {
        return root.current;
      },
    }),
    // The handle reads refs and the latest closure; nothing it closes over changes identity usefully.
    [],
  );

  /* ── Collapse ────────────────────────────────────────────────────────── */

  const collapses = collapseAfter !== undefined && count > collapseAfter;
  const hidden = collapses ? count - collapseAfter : 0;

  function onRootKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    nativeProps.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape' && collapses && revealed) {
      event.preventDefault();
      requestRevealed(false, 'escape', event);
      body.current?.focus();
    }
  }

  /* ── Header ──────────────────────────────────────────────────────────── */

  const name = fileName ?? (typeof title === 'string' ? title : undefined);
  const icon = name
    ? (KIND_ICON[fileKind({ name, type: '' })] ?? '--slotted-icon-file')
    : undefined;
  const hasHeader =
    title !== undefined || language !== 'text' || copyControl || actions !== undefined;
  const controls = loading ? null : (
    <div data-part="actions">
      {actions}
      {overflow || wrap ? (
        <button
          aria-label={wrap ? labels.unwrap : labels.wrap}
          aria-pressed={wrap}
          data-part="wrap"
          onClick={(event) => requestWrap(!wrap, keyed.current ? 'keyboard' : 'pointer', event)}
          onKeyDown={(event) => {
            keyed.current = event.key === 'Enter' || event.key === ' ';
          }}
          type="button"
          {...(wrap ? { 'data-pressed': '' } : {})}
        />
      ) : null}
      {copyControl ? (
        <button
          aria-label={labels.copy}
          data-part="copy"
          type="button"
          {...copyHandlers}
          {...(copied ? { 'data-complete': '' } : {})}
        />
      ) : null}
    </div>
  );

  const digits = gutterDigits(count, start);
  const style = {
    ...(nativeProps.style ?? {}),
    '--slotted-code-block-digits': digits,
    ...(collapses ? { '--slotted-code-block-collapse': collapseAfter } : {}),
    ...(maxLines !== undefined ? { '--slotted-code-block-max-lines': maxLines } : {}),
  } as React.CSSProperties;

  const regionName =
    typeof title === 'string' ? title : (nativeProps['aria-label'] ?? labels.region);

  return (
    <div
      {...nativeProps}
      data-language={language}
      data-part="root"
      data-ui="code-block"
      onKeyDown={onRootKeyDown}
      ref={root}
      style={style}
      {...(collapses ? { 'data-collapse': '' } : {})}
      {...(code === '' ? { 'data-empty': '' } : {})}
      {...(lineNumbers ? { 'data-line-numbers': '' } : {})}
      {...(loading ? { 'data-loading': '', 'aria-busy': true } : {})}
      {...(hasMarks ? { 'data-marks': '' } : {})}
      {...(overflow ? { 'data-overflow': '' } : {})}
      {...(revealed ? { 'data-revealed': '' } : {})}
      {...(wrap ? { 'data-wrap': '' } : {})}
    >
      {hasHeader ? (
        <div data-part="header">
          {icon && title !== undefined ? (
            <span aria-hidden="true" data-part="icon" style={{ maskImage: `var(${icon})` }} />
          ) : null}
          {title !== undefined ? (
            <span data-part="title" id={`${base}title`}>
              {title}
            </span>
          ) : null}
          {language !== 'text' ? <span data-part="language">{language}</span> : null}
          {controls}
        </div>
      ) : null}

      <ScrollArea
        axis="both"
        fade="both"
        gutter="auto"
        id={`${base}body`}
        label={regionName}
        onOverflowChange={(state) => setOverflow(state.inline.overflowing)}
        ref={body}
        /* The scroll-area's root is this family's body: its own part name is
           replaced and everything else it writes — identity, edges, wiring —
           stays, as the harness fragment draws it. */
        render={(props) => (
          <div
            {...props}
            data-part="body"
            {...(maxLines !== undefined ? { 'data-max-lines': '' } : {})}
          />
        )}
      >
        <pre {...preProps} data-part="pre">
          <code className={`language-${language}`} data-part="code">
            {loading
              ? [62, 78, 44, 70].map((width, index) => (
                  <Skeleton aria-hidden="true" inlineSize={`${width}%`} key={index} shape="text" />
                ))
              : lines.map((line, index) => {
                  const number = start + index;
                  const { dim, mark } = marksByLine[index] ?? { dim: false, mark: undefined };
                  const text = lineText(line);
                  const indent = wrap ? leadingColumns(text, tabSize) : 0;
                  return (
                    <span
                      data-line={number}
                      data-part="line"
                      key={index}
                      {...(mark ? { 'data-mark': mark } : {})}
                      {...(dim ? { 'data-dim': '' } : {})}
                      {...(indent > 0
                        ? {
                            style: { '--slotted-code-block-indent': indent } as React.CSSProperties,
                          }
                        : {})}
                    >
                      <span aria-hidden="true" data-part="number">
                        {lineNumbers ? number : null}
                      </span>
                      <span aria-hidden="true" data-part="marker" />
                      <span data-part="text">
                        {renderLine
                          ? renderLine({ dim, line, mark, number })
                          : line.map((token, position) =>
                              renderToken ? (
                                renderToken(token, position, number)
                              ) : token.scope ? (
                                <span data-part="token" data-token={token.scope} key={position}>
                                  {token.text}
                                </span>
                              ) : (
                                token.text
                              ),
                            )}
                      </span>
                    </span>
                  );
                })}
          </code>
        </pre>
      </ScrollArea>

      {collapses ? (
        <button
          aria-controls={`${base}body`}
          aria-expanded={revealed}
          data-part="reveal"
          onClick={(event) =>
            requestRevealed(!revealed, keyed.current ? 'keyboard' : 'pointer', event)
          }
          onKeyDown={(event) => {
            keyed.current = event.key === 'Enter' || event.key === ' ';
          }}
          type="button"
        >
          {revealed ? labels.collapse : labels.reveal.replace('{count}', String(hidden))}
        </button>
      ) : null}
    </div>
  );
}
