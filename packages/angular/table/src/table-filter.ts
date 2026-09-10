import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createControllable } from '@slotted/core/state';
import type { ChangeRequest } from '@slotted/core/state';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { SlButton } from '@slotted/angular/button';
import { SlCheckbox } from '@slotted/angular/checkbox';
import {
  SlPopover,
  SlPopoverContent,
  SlPopoverLayer,
  SlPopoverTrigger,
} from '@slotted/angular/popover';
import { SlTextField, SlTextFieldInput } from '@slotted/angular/text-field';

import { SlTable } from './table';
import { SlTableColumnHeader } from './table-parts';

/** One value a column can be filtered to. */
export interface TableFilterOption {
  /** The value the consumer's query matches. It is what the state holds. */
  value: string;
  /** What the reader sees, when it is not the value itself. */
  label?: string;
  /**
   * How many records carry it. Optional and the consumer's own: how many rows a
   * value has is a fact about the query, not about the column.
   */
  count?: number;
}

export type TableFilterReason = 'pointer' | 'keyboard' | 'clear' | 'programmatic';

/**
 * Folds a value down to what a search should match: case and diacritics are how
 * a reader types, not what they mean.
 */
function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase();
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
 * four values fires one query, not four. Ant, AG Grid and Excel each work this
 * way.
 *
 * The family applies nothing. It reports the set the reader chose and the
 * consumer's own query keeps or drops the rows — the same division `sort`
 * records, and the line this family holds against `data-grid`.
 */
@Component({
  selector: 'span[slTableFilter]',
  standalone: true,
  exportAs: 'slTableFilter',
  imports: [
    SlButton,
    SlCheckbox,
    SlPopover,
    SlPopoverContent,
    SlPopoverLayer,
    SlPopoverTrigger,
    SlTextField,
    SlTextFieldInput,
  ],
  template: `<ng-container
    slPopover
    [portal]="portal()"
    [open]="open()"
    (openChange)="toggle($event)"
  >
    <button
      slPopoverTrigger
      type="button"
      data-part="filter"
      [attr.data-filtered]="value().length > 0 ? '' : null"
      [attr.aria-label]="name()"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
      </svg>
    </button>

    <ng-template slPopoverLayer>
      <div slPopoverContent [attr.aria-label]="name()">
        <!-- The parts are on this family's own element rather than on the
             popover's: slPopoverContent names its own identity, and a second
             data-ui on the same element is one of them lost — the surface, the
             radius and the shadow all came off the panel. -->
        <div data-ui="table" data-part="filter-panel">
          @if (searching()) {
            <div data-part="filter-search">
              <div slTextField size="sm" clearable>
                <input
                  slTextFieldInput
                  [value]="query()"
                  [attr.aria-label]="labels().filterSearch"
                  [attr.placeholder]="labels().filterSearch"
                  (input)="search($event)"
                />
              </div>
            </div>
          }

          @if (shown().length === 0) {
            <p data-part="filter-empty">{{ labels().filterEmpty }}</p>
          } @else {
            <div data-part="filter-list">
              <div data-part="filter-option" data-covering>
                <span
                  slCheckbox
                  [checked]="allCovered()"
                  [indeterminate]="someCovered()"
                  (checkedChange)="coverAll(!allCovered())"
                >
                  {{ labels().filterSelectAll }}
                </span>
                <span data-count>{{ shown().length }}</span>
              </div>

              @for (option of shown(); track option.value) {
                <div data-part="filter-option">
                  <span
                    slCheckbox
                    [checked]="draft().includes(option.value)"
                    (checkedChange)="hold(option.value, !draft().includes(option.value))"
                  >
                    {{ option.label ?? option.value }}
                  </span>
                  @if (option.count !== undefined) {
                    <span data-count>{{ option.count }}</span>
                  }
                </div>
              }
            </div>
          }

          <div data-part="filter-actions">
            <button
              slButton
              type="button"
              size="sm"
              tone="secondary"
              variant="ghost"
              [disabled]="draft().length === 0"
              (click)="clear($event)"
            >
              {{ labels().filterClear }}
            </button>
            <button slButton type="button" size="sm" (click)="apply($event)">
              {{ labels().filterApply }}
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  </ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SlTableFilter {
  /** The values this column can be filtered to, and optionally their counts. */
  readonly options = input<readonly TableFilterOption[]>([]);
  /** The set the column is filtered to. Two-way, so a template binds it. */
  readonly value = model<readonly string[]>([]);
  /**
   * The column's name in the trigger's own name. Read from the column header
   * around it when it is not stated.
   */
  readonly columnLabel = input<string | undefined>(undefined);
  /** The trigger's whole accessible name, replacing the one built from labels. */
  readonly label = input<string | undefined>(undefined);
  /**
   * Whether the panel carries a search. Unstated, it appears once there are
   * `searchThreshold` values.
   */
  readonly searchable = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (state) => (state === undefined ? undefined : booleanAttribute(state)),
  });
  /** How many values bring the search with them. Eight unless stated. */
  readonly searchThreshold = input(8, { transform: numberAttribute });
  /** Whether the panel is drawn at the end of the document. */
  readonly portal = input(false, { transform: booleanAttribute });

  /** The request behind every committed change, with the reason it carries. */
  readonly valueChangeRequest = output<ChangeRequest<readonly string[]>>();

  readonly table = inject(SlTable);
  private readonly header = inject(SlTableColumnHeader, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly open = model(false);
  readonly draft = signal<readonly string[]>([]);
  readonly query = signal('');

  readonly labels = computed(() => this.table.resolvedLabels());

  readonly name = computed(() => {
    const stated = this.label();
    if (stated !== undefined) return stated;
    const labels = this.labels();
    const column = this.columnLabel() ?? this.header?.column() ?? '';
    const chosen = this.value().length;
    return chosen === 0
      ? `${labels.filter} ${column}`.trim()
      : `${labels.filter} ${column} (${chosen} ${labels.filterChosen})`.trim();
  });

  /** What the search left. The covering checkbox answers for exactly this. */
  readonly shown = computed(() => {
    const query = this.query();
    const options = this.options();
    if (query === '') return options;
    return options.filter((option) => fold(option.label ?? option.value).includes(fold(query)));
  });

  readonly searching = computed(
    () => this.searchable() ?? this.options().length >= this.searchThreshold(),
  );

  private readonly covered = computed(() => {
    const draft = this.draft();
    return this.shown().filter((option) => draft.includes(option.value)).length;
  });

  readonly allCovered = computed(
    () => this.covered() > 0 && this.covered() === this.shown().length,
  );
  readonly someCovered = computed(() => this.covered() > 0 && this.covered() < this.shown().length);

  /**
   * Opens and closes, and resets the draft either way: the draft starts from
   * what is committed every time the panel opens, and closing puts it back —
   * closing is cancelling, and Apply closes the panel itself after committing.
   */
  toggle(next: boolean) {
    this.open.set(next);
    this.draft.set(this.value());
    this.query.set('');
  }

  search(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
    /* A list that shortens under a reader who cannot see it says nothing. */
    getLiveAnnouncer(this.host.nativeElement.ownerDocument).announce(
      `${this.shown().length} ${this.labels().filterMatches}`,
    );
  }

  hold(value: string, next: boolean) {
    const draft = this.draft();
    this.draft.set(next ? [...draft, value] : draft.filter((held) => held !== value));
  }

  coverAll(next: boolean) {
    const visible = this.shown().map((option) => option.value);
    const draft = this.draft();
    this.draft.set(
      next ? [...new Set([...draft, ...visible])] : draft.filter((held) => !visible.includes(held)),
    );
  }

  apply(source: unknown) {
    this.request(this.draft(), 'pointer', source);
    this.open.set(false);
  }

  clear(source: unknown) {
    this.draft.set([]);
    getLiveAnnouncer(this.host.nativeElement.ownerDocument).announce(
      `${this.name()}, ${this.labels().filterCleared}`,
    );
    this.request([], 'clear', source);
    this.open.set(false);
  }

  private request(next: readonly string[], reason: TableFilterReason, source: unknown) {
    const state = createControllable<readonly string[]>({
      initial: this.value(),
      equals: sameSet,
      onRequest: (request) => this.valueChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.value.set(next);
  }
}
