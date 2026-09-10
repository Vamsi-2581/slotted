import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createControllable } from '@slotted/core/state';
import { useId, useRef, useState } from 'react';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Popover, PopoverContent, PopoverLayer, PopoverTrigger } from '../popover';
import { TextField } from '../text-field';
import { useTable } from './table';
import { useTableColumn } from './table-parts';
import type { TableFilterOption, TableFilterProps, TableFilterReason } from './table.types';

/**
 * The mark the trigger carries. It is authored here rather than taken from an
 * icon family, for the reason the expander's chevron is: the family draws the
 * one glyph that is part of its own control, and a consumer replacing it
 * replaces the control.
 */
function Funnel() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  );
}

/**
 * Folds a value down to what a search should match: case and diacritics are
 * how a reader types, not what they mean. `Ãgua` and `agua` are the same query
 * to everyone but a comparison that skips this.
 */
function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();
}

/** The options a query leaves. One rule, so the list and the count agree. */
function matching(options: readonly TableFilterOption[], query: string) {
  if (query === '') return options;
  return options.filter((option) => fold(option.label ?? option.value).includes(fold(query)));
}

function sameSet(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * A column's filter: the trigger in the header and the panel it opens.
 *
 * The panel edits a **draft**. Nothing reaches the consumer until Apply, and
 * Escape or a press outside restores the set the panel opened with — which is
 * the difference between a filter and a list of checkboxes. A reader ticking
 * four values fires one query, not four, and a reader who ticked the wrong one
 * has somewhere to go back to. Ant, AG Grid and Excel each work this way.
 *
 * The family applies nothing. It reports the set the reader chose and the
 * consumer's own query keeps or drops the rows — the same division `sort`
 * records, and the line this family holds against `data-grid`.
 */
export function TableFilter({
  applyLabel,
  clearLabel,
  columnLabel,
  defaultValue,
  emptyLabel,
  label,
  onValueChange,
  options,
  searchLabel,
  searchThreshold = 8,
  searchable,
  selectAllLabel,
  value,
  ...popoverProps
}: TableFilterProps) {
  const table = useTable();
  const column = useTableColumn();
  const base = useId();

  const [own, setOwn] = useState<readonly string[]>(defaultValue ?? []);
  const committed = value ?? own;

  const [draft, setDraft] = useState<readonly string[]>(committed);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement | null>(null);

  const name = columnLabel ?? column ?? '';
  const filtered = committed.length > 0;

  /** What the search left. The covering checkbox answers for exactly this. */
  const shown = matching(options, query);

  const covered = shown.filter((option) => draft.includes(option.value));
  const searching = searchable ?? options.length >= searchThreshold;

  function request(next: readonly string[], reason: TableFilterReason, source: unknown) {
    const state = createControllable<readonly string[]>({
      controlled: value,
      initial: committed,
      equals: sameSet,
      onRequest: (change) => onValueChange?.(change.value, change),
    });
    if (state.request(next, reason, source)) setOwn(next);
  }

  function toggle(next: boolean) {
    setOpen(next);
    if (next) {
      /* The draft starts from what is committed, every time: a panel that kept
         the last draft would show a reader a set they cancelled. */
      setDraft(committed);
      setQuery('');
      return;
    }
    /* Closing is cancelling. Apply closes the panel itself, after committing. */
    setDraft(committed);
  }

  function announce(message: string) {
    getLiveAnnouncer(panel.current?.ownerDocument).announce(message);
  }

  const labels = table.labels;
  const triggerName =
    label ??
    (filtered
      ? `${labels.filter} ${name} (${committed.length} ${labels.filterChosen})`.replace('  ', ' ')
      : `${labels.filter} ${name}`.trim());

  return (
    <Popover onOpenChange={(next) => toggle(next)} open={open} {...popoverProps}>
      <PopoverTrigger
        render={(triggerProps) => (
          <button
            {...triggerProps}
            aria-label={triggerName}
            data-part="filter"
            {...(filtered ? { 'data-filtered': '' } : {})}
            type="button"
          >
            <Funnel />
          </button>
        )}
      />
      <PopoverLayer>
        <PopoverContent aria-label={triggerName}>
          {/* The parts are on this family's own element rather than on the
              popover's: `PopoverContent` names its own part, and a second
              `data-part` on the same element is one of them lost. */}
          <div data-part="filter-panel" data-ui="table" ref={panel}>
            {searching ? (
              <div data-part="filter-search">
                <TextField
                  aria-controls={`${base}-list`}
                  aria-label={searchLabel ?? `${labels.filterSearch} ${name}`}
                  clearable
                  onChange={(event) => {
                    const next = event.target.value;
                    setQuery(next);
                    /* A list that shortens under a reader who cannot see it
                       says nothing otherwise. */
                    announce(`${matching(options, next).length} ${labels.filterMatches}`);
                  }}
                  placeholder={searchLabel ?? labels.filterSearch}
                  size="sm"
                  value={query}
                />
              </div>
            ) : null}

            {shown.length === 0 ? (
              <p data-part="filter-empty">{emptyLabel ?? labels.filterEmpty}</p>
            ) : (
              <div data-part="filter-list" id={`${base}-list`}>
                <div data-covering="" data-part="filter-option">
                  <Checkbox
                    checked={covered.length > 0 && covered.length === shown.length}
                    indeterminate={covered.length > 0 && covered.length < shown.length}
                    onCheckedChange={(checked) => {
                      const visible = shown.map((option) => option.value);
                      setDraft(
                        checked
                          ? [...new Set([...draft, ...visible])]
                          : draft.filter((held) => !visible.includes(held)),
                      );
                    }}
                  >
                    {selectAllLabel ?? labels.filterSelectAll}
                  </Checkbox>
                  <span data-count="">{shown.length}</span>
                </div>

                {shown.map((option) => (
                  <div data-part="filter-option" key={option.value}>
                    <Checkbox
                      checked={draft.includes(option.value)}
                      onCheckedChange={(checked) =>
                        setDraft(
                          checked
                            ? [...draft, option.value]
                            : draft.filter((held) => held !== option.value),
                        )
                      }
                    >
                      {option.label ?? option.value}
                    </Checkbox>
                    {option.count === undefined ? null : <span data-count="">{option.count}</span>}
                  </div>
                ))}
              </div>
            )}
            <div data-part="filter-actions">
              <Button
                disabled={draft.length === 0}
                onClick={(event) => {
                  setDraft([]);
                  announce(`${labels.filter} ${name}, ${labels.filterCleared}`);
                  request([], 'clear', event);
                  setOpen(false);
                }}
                size="sm"
                tone="secondary"
                variant="ghost"
              >
                {clearLabel ?? labels.filterClear}
              </Button>
              <Button
                onClick={(event) => {
                  request(draft, 'pointer', event);
                  setOpen(false);
                }}
                size="sm"
              >
                {applyLabel ?? labels.filterApply}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </PopoverLayer>
    </Popover>
  );
}
