import { inject, Injectable, InjectionToken } from '@angular/core';

/** The term beside its value, or above it. */
export type DescriptionListLayout = 'row' | 'stack';

/** How many pairs stand side by side before the container narrows. */
export type DescriptionListColumns = 1 | 2 | 3;

/** Nothing between pairs, a rule between them, or a framed table. */
export type DescriptionListVariant = 'plain' | 'ruled' | 'framed';

/**
 * What happened when a value was copied. It is not a `ChangeRequest`: the
 * clipboard belongs to the platform, so there is no previous value, nothing to
 * cancel, and no state the family holds. The output reports, after the fact,
 * what a consumer may want to log or announce differently.
 */
export interface DescriptionListCopyRequest {
  readonly value: string;
  readonly reason: 'pointer' | 'keyboard';
  /** `false` when the platform refused the write or offers no clipboard. */
  readonly copied: boolean;
  /**
   * `true` when the write was refused and the value was selected instead, so
   * the reader can copy it with the keyboard.
   */
  readonly selected: boolean;
  readonly source?: Event;
}

/**
 * The words the family says. They are here rather than inside the components
 * because an application translates them once, and a reader of a Portuguese
 * page should not meet "Show more" in the one place a family forgot.
 */
export interface DescriptionListLabels {
  /** The accessible name of the copy control. */
  copy?: string;
  /** Announced, politely, once a value has reached the clipboard. */
  copied?: string;
  /** The control that shows the rest of a clamped value. */
  reveal?: string;
  /** The same control, once the value is whole. */
  collapse?: string;
  /** What a screen reader reads in place of a value that is missing. */
  placeholder?: string;
  /**
   * Announced when the platform refuses the clipboard and the family selects
   * the value instead. A browser blocks `writeText` where the document is not
   * focused, and inside an iframe that carries no `clipboard-write` permission.
   */
  copyBlocked?: string;
}

export interface DescriptionListDefaults {
  columns?: DescriptionListColumns;
  labels?: DescriptionListLabels;
  layout?: DescriptionListLayout;
  /** The maximum width of the term column, as a CSS length. */
  termWidth?: string;
  variant?: DescriptionListVariant;
}

export const DESCRIPTION_LIST_DEFAULT_LAYOUT: DescriptionListLayout = 'row';
export const DESCRIPTION_LIST_DEFAULT_COLUMNS: DescriptionListColumns = 1;
export const DESCRIPTION_LIST_DEFAULT_VARIANT: DescriptionListVariant = 'plain';

/** The words the family says when nothing else says them. */
export const DESCRIPTION_LIST_DEFAULT_LABELS: Required<DescriptionListLabels> = {
  collapse: 'Show less',
  copied: 'Copied',
  copy: 'Copy',
  copyBlocked: 'Value selected — copy it with your keyboard',
  placeholder: 'Not provided',
  reveal: 'Show more',
};

/** How long the copy control says it succeeded before returning to rest. */
export const COPIED_FOR = 2000;

export const DESCRIPTION_LIST_DEFAULTS_TOKEN = new InjectionToken<DescriptionListDefaults>(
  'slotted description list defaults',
  { providedIn: 'root', factory: (): DescriptionListDefaults => ({}) },
);

/**
 * An application decides once how its details panels are arranged and what
 * their controls are called. A list that states any of it itself still wins: an
 * explicit input is never overridden by the token.
 */
export function provideDescriptionListDefaults(defaults: DescriptionListDefaults) {
  return { provide: DESCRIPTION_LIST_DEFAULTS_TOKEN, useValue: defaults };
}

export function injectDescriptionListDefaults(): DescriptionListDefaults {
  return inject(DESCRIPTION_LIST_DEFAULTS_TOKEN);
}

/**
 * A span is stated in columns and the list may have fewer, so a pair asking for
 * three columns of a two-column list takes two. Grid would otherwise invent the
 * tracks it was asked for and the list would quietly grow a column nobody
 * declared. Shared with the React binding through the tests that assert the
 * same table, and deliberately not through `@slotted/core`: it is three lines,
 * and a core module exists for arithmetic two bindings would otherwise get
 * *differently* wrong.
 */
export function spanWithin(span: number | undefined, columns: number): number | undefined {
  if (span === undefined) return undefined;
  const clamped = Math.min(Math.max(Math.trunc(span), 1), columns);
  return clamped > 1 ? clamped : undefined;
}

/**
 * Whether a value wants more room than the lines it was given.
 *
 * It compares the height the text wants against the height the clamp allows,
 * rather than comparing the box to itself: `scrollHeight` reports the full
 * content either way, so the answer does not change when the clamp is released
 * and the control does not disappear under the hand that pressed it. A line
 * height CSS cannot resolve — `normal`, or an element with no layout — answers
 * no, which leaves the control absent rather than present and useless.
 *
 * Shared with the React binding through the tests that assert the same table.
 */
export function overflowsClamp(scrollHeight: number, lineHeight: number, lines: number): boolean {
  if (!Number.isFinite(lineHeight) || lineHeight <= 0 || lines <= 0) return false;
  return scrollHeight > lineHeight * lines + 1;
}

/**
 * Puts the value under the reader's own selection, which is the one thing left
 * to offer when the platform refuses the clipboard. It returns whether it
 * managed to, so the request can say what actually happened.
 */
export function selectValue(node: HTMLElement | null | undefined): boolean {
  const selection = node?.ownerDocument.defaultView?.getSelection();
  if (!node || !selection) return false;

  try {
    selection.removeAllRanges();
    const range = node.ownerDocument.createRange();
    range.selectNodeContents(node);
    selection.addRange(range);
    return true;
  } catch {
    return false;
  }
}

/**
 * Putting a value on the clipboard, and saying whether it got there.
 *
 * `navigator.clipboard.writeText` is the whole implementation. The
 * `document.execCommand('copy')` fallback is declined: it exists for insecure
 * contexts, and a details panel showing an account identifier over plain HTTP
 * has a larger problem than a copy button. Where the write is refused this
 * returns `false`, the control returns to rest, and the value is still
 * selectable text — which is what a reader had before the button existed.
 */
export async function copyToClipboard(value: string): Promise<boolean> {
  const clipboard = globalThis.navigator?.clipboard;
  if (clipboard === undefined || typeof clipboard.writeText !== 'function') return false;

  try {
    await clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Application-scoped rather than module-scoped, for the reason `field` records:
 * a module-level counter produces colliding sequences when two applications
 * render in one server process, and the server and the client sequences must
 * match for hydration.
 */
@Injectable({ providedIn: 'root' })
export class SlDescriptionListIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-description-list-${this.count}`;
  }
}
