import { inject, Injectable, InjectionToken } from '@angular/core';
import type { ChangeReason, ChangeRequest } from '@slotted/core/state';
import type { TransferDirection, TransferSide } from '@slotted/core/transfer';

export type { TransferDirection, TransferSide };

/** The type step of the lists, the search fields and the move buttons. */
export type TransferSize = 'sm' | 'md' | 'lg';

/**
 * How the two panes are laid out. `auto` answers the root's own inline size:
 * two columns from 36rem, one pane at a time below it.
 */
export type TransferLayout = 'auto' | 'columns' | 'steps';

export type TransferMoveReason = Extract<ChangeReason, 'pointer' | 'keyboard' | 'programmatic'>;
export type TransferSelectionReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'select' | 'programmatic'
>;
export type TransferQueryReason = Extract<ChangeReason, 'keyboard' | 'clear' | 'programmatic'>;
export type TransferPaneReason = Extract<ChangeReason, 'pointer' | 'keyboard' | 'programmatic'>;

/** A move asks once, with what moved and which way. */
export interface TransferMoveRequest extends ChangeRequest<readonly string[]> {
  readonly reason: TransferMoveReason;
  readonly direction: TransferDirection;
  readonly keys: readonly string[];
}

export interface TransferSelectionRequest extends ChangeRequest<readonly string[]> {
  readonly reason: TransferSelectionReason;
}

export interface TransferQueryRequest extends ChangeRequest<string> {
  readonly reason: TransferQueryReason;
}

export interface TransferPaneRequest extends ChangeRequest<TransferSide> {
  readonly reason: TransferPaneReason;
}

/** The shape the family reads without accessors. */
export interface TransferItem {
  key: string;
  label: string;
  description?: string | undefined;
  disabled?: boolean | undefined;
}

/** The words the family says. `{slot}` is filled in. */
export interface TransferLabels {
  source: string;
  target: string;
  search: string;
  selectAll: string;
  count: string;
  countSelected: string;
  countFiltered: string;
  paneCount: string;
  panes: string;
  empty: string;
  noResults: string;
  loading: string;
  actions: string;
  moveToTarget: string;
  moveAllToTarget: string;
  moveToSource: string;
  moveAllToSource: string;
  reorder: string;
  moveUp: string;
  moveDown: string;
  moved: string;
  movedOne: string;
  reordered: string;
}

/** What an application sets once for every transfer under it. */
export interface TransferDefaults {
  size: TransferSize;
  layout: TransferLayout;
  searchable: boolean;
  selectAll: boolean;
  reorderable: boolean;
  rows: number;
  labels: TransferLabels;
}

/** The words the family says before an application says otherwise. */
export const DEFAULT_TRANSFER_LABELS: TransferLabels = {
  source: 'Available',
  target: 'Chosen',
  search: 'Search {pane}',
  selectAll: 'Select all in {pane}',
  count: '{total} items',
  countSelected: '{selected} of {total} selected',
  countFiltered: '{shown} of {total} shown',
  paneCount: '{pane} ({total})',
  panes: 'Lists',
  empty: 'No items',
  noResults: 'No matches',
  loading: 'Loading…',
  actions: 'Move items',
  moveToTarget: 'Add',
  moveAllToTarget: 'Add all',
  moveToSource: 'Remove',
  moveAllToSource: 'Remove all',
  reorder: 'Order',
  moveUp: 'Up',
  moveDown: 'Down',
  moved: '{count} moved to {pane}',
  movedOne: '{item} moved to {pane}',
  reordered: '{item} moved to position {position}',
};

const FALLBACK: TransferDefaults = {
  size: 'md',
  layout: 'auto',
  searchable: true,
  selectAll: true,
  reorderable: false,
  rows: 8,
  labels: DEFAULT_TRANSFER_LABELS,
};

export const TRANSFER_DEFAULTS = new InjectionToken<TransferDefaults>('slotted transfer defaults', {
  providedIn: 'root',
  factory: () => FALLBACK,
});

/**
 * An application decides once how its transfers look and what they say. A
 * transfer that states any of it itself still wins.
 */
export function provideTransferDefaults(
  defaults: Partial<Omit<TransferDefaults, 'labels'>> & { labels?: Partial<TransferLabels> },
) {
  return {
    provide: TRANSFER_DEFAULTS,
    useFactory: (): TransferDefaults => ({
      ...FALLBACK,
      ...defaults,
      labels: { ...FALLBACK.labels, ...defaults.labels },
    }),
  };
}

export function injectTransferDefaults(): TransferDefaults {
  return inject(TRANSFER_DEFAULTS);
}

@Injectable({ providedIn: 'root' })
export class SlTransferIdFactory {
  private count = 0;

  next() {
    this.count += 1;
    return `slotted-transfer-${this.count}`;
  }
}

/** Fills `{name}` slots in a label. */
export function fillLabel(label: string, slots: Record<string, string | number>): string {
  return label.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in slots ? String(slots[name]) : match,
  );
}
