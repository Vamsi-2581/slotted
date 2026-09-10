import { createFilter } from '@slotted/core/collection';
import { isPlainDate, parseISODate, toISODate } from '@slotted/core/date';
import type { PlainDate } from '@slotted/core/date';
import {
  defaultOperator as kindDefaultOperator,
  describeFilter,
  emptyFilter,
  isConditionActive,
  isFilterActive,
  normalizeFilter,
  operandCount,
  operatorsFor,
  serializeFilter,
  withCondition,
  withJoin,
} from '@slotted/core/filter';
import type {
  BooleanFilter,
  DateFilter,
  FilterCondition,
  FilterDescriptor,
  FilterJoin,
  FilterKind,
  FilterOperator,
  NumberFilter,
  SetFilter,
  TextFilter,
} from '@slotted/core/filter';
import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createControllable } from '@slotted/core/state';
import type { ChangeRequest } from '@slotted/core/state';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { SlButton } from '@slotted/angular/button';
import { SlCheckbox } from '@slotted/angular/checkbox';
import { SlDatePicker } from '@slotted/angular/date-picker';
import { SlNumberField, SlNumberFieldInput } from '@slotted/angular/number-field';
import {
  SlPopover,
  SlPopoverContent,
  SlPopoverLayer,
  SlPopoverTrigger,
} from '@slotted/angular/popover';
import { SlRadio, SlRadioGroup } from '@slotted/angular/radio-group';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';
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

type Condition = FilterCondition<string, unknown>;

/** What the operand template is handed, once per condition. */
export interface TableFilterOperandContext {
  /** Applies the draft, which is what `Enter` in the family's own field does. */
  apply: () => void;
  condition: Condition;
  /** The name the family would have given each field. */
  label: (slot: 0 | 1) => string;
  /** Writes one operand back into the draft. */
  set: (slot: 0 | 1, value: unknown) => void;
  /** Which operands this operator takes: none, the first, or both. */
  slots: readonly (0 | 1)[];
}

/**
 * Everything the five filters share: the draft, the conditions, the join, the
 * announcements and the request that carries a reason. What each of them adds
 * is its kind, its own typed `value`, and the control inside `filter-operand`.
 *
 * The panel edits a **draft**. Nothing reaches the consumer until Apply, and
 * Escape or a press outside restores the descriptor the panel opened with. The
 * family applies nothing: it reports the descriptor, and
 * `createFilterPredicate` in `@slotted/core/filter` is what a consumer applies
 * to its own rows.
 */
@Directive()
export abstract class SlTableFilterBase {
  /** Which vocabulary this column's conditions are written in. */
  abstract readonly kind: FilterKind;
  /** The committed descriptor, read from the component's own typed model. */
  protected abstract readValue(): FilterDescriptor | null;
  /** Writes it back into that model. */
  protected abstract writeValue(next: FilterDescriptor | null): void;

  /**
   * The operators this column offers, narrowing the kind's own list. Declared
   * once here rather than per component: the narrow operator type is the one
   * thing a shared base cannot keep, and the value — which is what a consumer
   * reads — stays exact on each of the five.
   */
  readonly operators = input<readonly string[] | undefined>(undefined);
  /** Which one the panel opens on. The kind's own default unless stated. */
  readonly defaultOperator = input<string | undefined>(undefined);
  /**
   * How many conditions the panel offers, which is AG Grid's
   * `maxNumConditions`. The second appears once the first is complete.
   */
  readonly conditions = input(2, { transform: numberAttribute });
  /**
   * The column's name in the trigger's own name. Read from the column header
   * around it when it is not stated.
   */
  readonly columnLabel = input<string | undefined>(undefined);
  /** The trigger's whole accessible name, replacing the one built from labels. */
  readonly label = input<string | undefined>(undefined);
  /** The operator chooser's own name. Defaults to the table's label. */
  readonly operatorLabel = input<string | undefined>(undefined);
  /**
   * Whether the panel is drawn at the end of the document. On by default, and
   * that is not a preference: a framed table clips its own overflow, so an
   * unportalled panel is cut off at the frame's edge — read on the Angular
   * reference page, where the join and both actions were simply not there. The
   * React binding takes `popover`'s own default, which is the same answer.
   */
  readonly portal = input(true, { transform: booleanAttribute });

  /** The request behind every committed change, with the reason it carries. */
  readonly valueChangeRequest = output<ChangeRequest<FilterDescriptor | null>>();

  readonly table = inject(SlTable);
  private readonly header = inject(SlTableColumnHeader, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly open = model(false);
  readonly draft = signal<FilterDescriptor>(emptyFilter('text'));

  readonly labels = computed(() => this.table.resolvedLabels());

  protected readonly start = computed(
    () => this.defaultOperator() ?? (kindDefaultOperator(this.kind) as string),
  );

  readonly offered = computed(
    () => this.operators() ?? (operatorsFor(this.kind) as readonly string[]),
  );

  private readonly format = computed(() => {
    const labels = this.labels();
    return {
      join: (join: FilterJoin) => labels.filterJoins[join] ?? join,
      operator: (operator: FilterOperator) => labels.filterOperators[operator] ?? operator,
    };
  });

  operatorName(operator: string) {
    return this.format().operator(operator as FilterOperator);
  }

  /** Every operator as a labelled option, so the closed chooser names its own. */
  readonly operatorItems = computed(() =>
    this.offered().map((operator) => ({ label: this.operatorName(operator), value: operator })),
  );

  joinName(join: FilterJoin) {
    return this.format().join(join);
  }

  readonly filtered = computed(() => isFilterActive(this.readValue()));

  readonly name = computed(() => {
    const stated = this.label();
    if (stated !== undefined) return stated;
    const labels = this.labels();
    const column = this.columnLabel() ?? this.header?.column() ?? '';
    const committed = this.readValue();
    return isFilterActive(committed)
      ? `${labels.filter} ${column}: ${describeFilter(committed, this.format())}`.trim()
      : `${labels.filter} ${column}`.trim();
  });

  /** One condition, or the two the panel can hold. */
  readonly rows = computed<readonly Condition[]>(() => {
    const draft = this.draft();
    const first = draft.conditions[0] ?? { operator: this.start() };
    /* AG Grid's own reveal: the second appears once the first is complete. A
       button would be one more word to translate before the common case, and an
       empty second row is noise in every panel that never needs it. */
    if (this.allowed() < 2 || !isConditionActive(this.kind, first)) return [first];
    return [first, draft.conditions[1] ?? { operator: this.start() }];
  });

  protected allowed() {
    return this.conditions();
  }

  readonly hasSecond = computed(() => this.rows().length === 2);

  slotsOf(condition: Condition): readonly (0 | 1)[] {
    const operands = operandCount(condition.operator as FilterOperator);
    return operands === 0 ? [] : operands === 1 ? [0] : [0, 1];
  }

  operandLabel(condition: Condition, slot: 0 | 1) {
    const labels = this.labels();
    if (operandCount(condition.operator as FilterOperator) < 2) return labels.filterValue;
    return slot === 0 ? labels.filterFrom : labels.filterTo;
  }

  context(index: number): TableFilterOperandContext {
    const condition = this.rows()[index] ?? { operator: this.start() };
    return {
      apply: () => this.applyDraft(null, 'keyboard'),
      condition,
      label: (slot) => this.operandLabel(condition, slot),
      set: (slot, value) => this.setOperand(index, slot, value),
      slots: this.slotsOf(condition),
    };
  }

  announce(message: string) {
    getLiveAnnouncer(this.host.nativeElement.ownerDocument).announce(message);
  }

  /**
   * Opens and closes, and resets the draft either way: the draft starts from
   * what is committed every time the panel opens, and closing puts it back —
   * closing is cancelling, and Apply closes the panel itself after committing.
   */
  toggle(next: boolean) {
    this.open.set(next);
    this.draft.set(this.readValue() ?? this.blank());
  }

  protected blank(): FilterDescriptor {
    return emptyFilter(this.kind, this.start() as never) as FilterDescriptor;
  }

  private operandsWord(count: 0 | 1 | 2) {
    const labels = this.labels();
    if (count === 0) return labels.filterOperandsNone;
    return count === 1 ? labels.filterOperandsOne : labels.filterOperandsTwo;
  }

  setOperator(index: number, operator: string) {
    const condition = this.rows()[index] ?? { operator: this.start() };
    const before = operandCount(condition.operator as FilterOperator);
    const after = operandCount(operator as FilterOperator);

    /* An operand the new operator still takes survives the change: a reader who
       typed a value and then chose a different comparison meant to keep it. */
    const next: Condition = {
      operator,
      ...(after >= 1 && before >= 1 ? { value: condition.value } : {}),
      ...(after === 2 && before === 2 ? { end: condition.end } : {}),
    };

    this.draft.set(withCondition(this.draft(), index, next as never));
    /* The panel grows a field or loses two. Announced, because a form that
       changes shape under a reader who cannot see it says nothing otherwise. */
    if (after !== before) {
      this.announce(`${this.operatorName(operator)}, ${this.operandsWord(after)}`);
    }
  }

  setOperand(index: number, slot: 0 | 1, operand: unknown) {
    const condition = this.rows()[index] ?? { operator: this.start() };
    const wasActive = isConditionActive(this.kind, condition);
    const next: Condition =
      slot === 0 ? { ...condition, value: operand } : { ...condition, end: operand };

    this.draft.set(withCondition(this.draft(), index, next as never));
    if (index === 0 && this.allowed() >= 2 && !wasActive && isConditionActive(this.kind, next)) {
      this.announce(this.labels().filterConditionAdded);
    }
  }

  setJoin(join: string) {
    this.draft.set(withJoin(this.draft(), join as FilterJoin));
  }

  /**
   * Named for what it does rather than `apply`, which reads as
   * `Function.prototype.apply` to a linter and to the next reader after it.
   */
  applyDraft(source: unknown, reason: TableFilterReason = 'pointer') {
    const next = normalizeFilter(this.draft());
    this.request(next, reason, source);
    this.announce(
      next
        ? `${this.labels().filter} ${this.columnName()}: ${describeFilter(next, this.format())}`.trim()
        : `${this.labels().filter} ${this.columnName()}, ${this.labels().filterCleared}`.trim(),
    );
    this.open.set(false);
  }

  clear(source: unknown) {
    this.draft.set(this.blank());
    this.announce(
      `${this.labels().filter} ${this.columnName()}, ${this.labels().filterCleared}`.trim(),
    );
    this.request(null, 'clear', source);
    this.open.set(false);
  }

  readonly canClear = computed(() => isFilterActive(this.draft()));

  private columnName() {
    return this.columnLabel() ?? this.header?.column() ?? '';
  }

  private request(next: FilterDescriptor | null, reason: TableFilterReason, source: unknown) {
    const state = createControllable<FilterDescriptor | null>({
      initial: this.readValue(),
      /* Two descriptors are the same filter when they serialise the same. */
      equals: (a, b) => serializeFilter(a) === serializeFilter(b),
      onRequest: (request) => this.valueChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.writeValue(next);
  }
}

/**
 * The panel every kind shares, drawn around an operand its owner projects.
 *
 * The operand is an `ng-template` rather than projected content, because it is
 * rendered once per condition: content would be built once and then belong to
 * whichever condition asked for it first.
 */
@Component({
  selector: 'span[slTableFilterShell]',
  standalone: true,
  exportAs: 'slTableFilterShell',
  imports: [
    NgTemplateOutlet,
    SlButton,
    SlPopover,
    SlPopoverContent,
    SlPopoverLayer,
    SlPopoverTrigger,
    SlRadio,
    SlRadioGroup,
    SlSelect,
    SlSelectItem,
  ],
  template: `<ng-container
    slPopover
    [portal]="owner().portal()"
    [open]="owner().open()"
    (openChange)="owner().toggle($event)"
  >
    <button
      slPopoverTrigger
      type="button"
      data-part="filter"
      [attr.data-filtered]="owner().filtered() ? '' : null"
      [attr.aria-label]="owner().name()"
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
      <div slPopoverContent [attr.aria-label]="owner().name()">
        <!-- The parts are on this family's own element rather than on the
             popover's: slPopoverContent names its own identity, and a second
             data-ui on the same element is one of them lost — the surface, the
             radius and the shadow all came off the panel. -->
        <div data-ui="table" data-part="filter-panel" [attr.data-kind]="owner().kind">
          @for (row of owner().rows(); track $index) {
            @if ($index === 1) {
              <div data-part="filter-join">
                <span data-label>{{ owner().labels().filterJoin }}</span>
                <div
                  slRadioGroup
                  orientation="horizontal"
                  size="sm"
                  [attr.aria-label]="owner().labels().filterJoin"
                  [value]="owner().draft().join"
                  (valueChange)="owner().setJoin($event.value ?? 'and')"
                >
                  <div slRadio value="and">{{ owner().joinName('and') }}</div>
                  <div slRadio value="or">{{ owner().joinName('or') }}</div>
                </div>
              </div>
            }

            <div data-part="filter-condition" [attr.data-operands]="owner().slotsOf(row).length">
              <div data-part="filter-operator">
                <!-- items names every operator for the closed control: without
                     it the trigger falls back to the value itself and a reader
                     sees the raw between the engine speaks. -->
                <sl-select
                  size="sm"
                  [fullWidth]="true"
                  [items]="owner().operatorItems()"
                  [attr.aria-label]="owner().operatorLabel() ?? owner().labels().filterOperator"
                  [value]="row.operator"
                  (valueChange)="owner().setOperator($index, $any($event))"
                >
                  @for (operator of owner().offered(); track operator) {
                    <sl-select-item [value]="operator">
                      {{ owner().operatorName(operator) }}
                    </sl-select-item>
                  }
                </sl-select>
              </div>

              @if (owner().slotsOf(row).length > 0) {
                <div data-part="filter-operand" [attr.data-kind]="owner().kind">
                  <ng-container
                    [ngTemplateOutlet]="operand()"
                    [ngTemplateOutletContext]="{ $implicit: owner().context($index) }"
                  />
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
              [disabled]="!owner().canClear()"
              (click)="owner().clear($event)"
            >
              {{ owner().labels().filterClear }}
            </button>
            <button slButton type="button" size="sm" (click)="owner().applyDraft($event)">
              {{ owner().labels().filterApply }}
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  </ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SlTableFilterShell {
  /** The filter this shell draws for. */
  readonly owner = input.required<SlTableFilterBase>({ alias: 'slTableFilterShell' });
  /** The control inside `filter-operand`, rendered once per condition. */
  readonly operand = input.required<TemplateRef<{ $implicit: TableFilterOperandContext }>>();
}

/** A column of words. Its comparisons are the collator's, never a fold. */
@Component({
  selector: 'span[slTableTextFilter]',
  exportAs: 'slTableTextFilter',
  imports: [SlTableFilterShell, SlTextField, SlTextFieldInput],
  template: `<span [slTableFilterShell]="this" [operand]="operand"></span>
    <ng-template #operand let-context>
      @for (slot of context.slots; track slot) {
        <div slTextField size="sm">
          <input
            slTextFieldInput
            [value]="$any(slot === 0 ? context.condition.value : context.condition.end) ?? ''"
            [attr.aria-label]="context.label(slot)"
            [attr.placeholder]="context.label(slot)"
            (input)="context.set(slot, $any($event.target).value)"
            (keydown.enter)="context.apply()"
          />
        </div>
      }
    </ng-template>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SlTableTextFilter extends SlTableFilterBase {
  override readonly kind = 'text' as const;
  /** The filter the column holds. Two-way, so a template binds it. */
  readonly value = model<TextFilter | null>(null);

  protected override readValue() {
    return this.value();
  }

  protected override writeValue(next: FilterDescriptor | null) {
    this.value.set(next as TextFilter | null);
  }
}

/** A column of quantities. The operand parses in the reader's own locale. */
@Component({
  selector: 'span[slTableNumberFilter]',
  exportAs: 'slTableNumberFilter',
  imports: [SlTableFilterShell, SlNumberField, SlNumberFieldInput],
  template: `<span [slTableFilterShell]="this" [operand]="operand"></span>
    <ng-template #operand let-context>
      @for (slot of context.slots; track slot) {
        <div slNumberField size="sm">
          <input
            slNumberFieldInput
            [value]="$any(slot === 0 ? context.condition.value : context.condition.end) ?? null"
            [locale]="locale()"
            [attr.aria-label]="context.label(slot)"
            [attr.placeholder]="context.label(slot)"
            (valueChange)="context.set(slot, $event.value)"
            (keydown.enter)="context.apply()"
          />
        </div>
      }
    </ng-template>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SlTableNumberFilter extends SlTableFilterBase {
  override readonly kind = 'number' as const;
  readonly value = model<NumberFilter | null>(null);
  /** BCP 47, for the operand's own parsing. Defaults to the runtime's. */
  readonly locale = input<string | undefined>(undefined);

  protected override readValue() {
    return this.value();
  }

  protected override writeValue(next: FilterDescriptor | null) {
    this.value.set(next as NumberFilter | null);
  }
}

/**
 * A column of days. The operand is the whole date picker — the segmented field
 * and the calendar behind it — rather than the field alone: every surveyed
 * implementation that filters a date column offers a grid to point at, and a
 * reader who has to type a date they could have pointed at is the one thing a
 * date filter exists to spare them. The calendar opens a layer inside the
 * panel's layer, which `dismissable-layer` already stacks for the operator
 * chooser beside it.
 *
 * The descriptor holds the ISO day the picker produces, never a `Date`.
 */
@Component({
  selector: 'span[slTableDateFilter]',
  exportAs: 'slTableDateFilter',
  imports: [SlTableFilterShell, SlDatePicker],
  template: `<span [slTableFilterShell]="this" [operand]="operand"></span>
    <ng-template #operand let-context>
      @for (slot of context.slots; track slot) {
        <div
          slDatePicker
          size="sm"
          [locale]="locale()"
          [value]="day($any(slot === 0 ? context.condition.value : context.condition.end))"
          [attr.aria-label]="context.label(slot)"
          (valueChange)="context.set(slot, iso($event.value))"
          (keydown.enter)="context.apply()"
        ></div>
      }
    </ng-template>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SlTableDateFilter extends SlTableFilterBase {
  override readonly kind = 'date' as const;
  readonly value = model<DateFilter | null>(null);
  /** BCP 47. Decides the operand's field order and separators. */
  readonly locale = input<string | undefined>(undefined);

  /** The descriptor's ISO day as the field's own value, and back. */
  day(value: unknown): PlainDate | null {
    return value ? parseISODate(String(value)) : null;
  }

  iso(value: unknown) {
    return isPlainDate(value) ? toISODate(value) : null;
  }

  protected override readValue() {
    return this.value();
  }

  protected override writeValue(next: FilterDescriptor | null) {
    this.value.set(next as DateFilter | null);
  }
}

/**
 * A column of yes and no. Three answers rather than two: the third is not being
 * filtered at all, which is what Clear leaves and what an empty draft is.
 */
@Component({
  selector: 'span[slTableBooleanFilter]',
  exportAs: 'slTableBooleanFilter',
  imports: [SlTableFilterShell, SlRadio, SlRadioGroup],
  template: `<span [slTableFilterShell]="this" [operand]="operand"></span>
    <ng-template #operand let-context>
      <div
        slRadioGroup
        orientation="horizontal"
        size="sm"
        [attr.aria-label]="context.label(0)"
        [value]="answer(context.condition.value)"
        (valueChange)="context.set(0, $event.value === 'true')"
      >
        <div slRadio value="true">{{ trueLabel() }}</div>
        <div slRadio value="false">{{ falseLabel() }}</div>
      </div>
    </ng-template>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SlTableBooleanFilter extends SlTableFilterBase {
  override readonly kind = 'boolean' as const;
  readonly value = model<BooleanFilter | null>(null);
  /** What the two answers are called. */
  readonly trueLabel = input('Yes');
  readonly falseLabel = input('No');

  answer(value: unknown) {
    return value === undefined || value === null ? '' : String(value);
  }

  protected override readValue() {
    return this.value();
  }

  protected override writeValue(next: FilterDescriptor | null) {
    this.value.set(next as BooleanFilter | null);
  }
}

/**
 * A column filtered to values the consumer named: the list, its search and the
 * checkbox that covers what the search left.
 *
 * One condition, and the design says why: `anyOf A and anyOf B` is
 * `anyOf (A ∩ B)`, so every pair of set conditions collapses to a single list.
 */
@Component({
  selector: 'span[slTableSetFilter]',
  exportAs: 'slTableSetFilter',
  imports: [SlTableFilterShell, SlCheckbox, SlTextField, SlTextFieldInput],
  template: `<span [slTableFilterShell]="this" [operand]="operand"></span>
    <ng-template #operand let-context>
      @if (searching()) {
        <div data-part="filter-search">
          <div slTextField size="sm" clearable>
            <input
              slTextFieldInput
              [value]="query()"
              [attr.aria-label]="searchLabel() ?? labels().filterSearch"
              [attr.placeholder]="searchLabel() ?? labels().filterSearch"
              (input)="search($event)"
            />
          </div>
        </div>
      }

      @if (shown().length === 0) {
        <p data-part="filter-empty">{{ emptyLabel() ?? labels().filterEmpty }}</p>
      } @else {
        <div data-part="filter-list">
          <div data-part="filter-option" data-covering>
            <span
              slCheckbox
              [checked]="allCovered(context)"
              [indeterminate]="someCovered(context)"
              (checkedChange)="coverAll(context, !allCovered(context))"
            >
              {{ selectAllLabel() ?? labels().filterSelectAll }}
            </span>
            <span data-count>{{ shown().length }}</span>
          </div>

          @for (option of shown(); track option.value) {
            <div data-part="filter-option">
              <span
                slCheckbox
                [checked]="chosen(context).includes(option.value)"
                (checkedChange)="hold(context, option.value, $event.value)"
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
    </ng-template>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SlTableSetFilter extends SlTableFilterBase {
  override readonly kind = 'set' as const;
  readonly value = model<SetFilter | null>(null);
  /** The values this column can be filtered to, and optionally their counts. */
  readonly options = input<readonly TableFilterOption[]>([]);
  /** The word shown when the search matches nothing. */
  readonly emptyLabel = input<string | undefined>(undefined);
  /** The search field's name and placeholder. */
  readonly searchLabel = input<string | undefined>(undefined);
  /** The covering checkbox's label. */
  readonly selectAllLabel = input<string | undefined>(undefined);
  /**
   * Whether the panel carries a search. Unstated, it appears once there are
   * `searchThreshold` values.
   */
  readonly searchable = input<boolean | undefined, boolean | string | undefined>(undefined, {
    transform: (state) => (state === undefined ? undefined : booleanAttribute(state)),
  });
  /** How many values bring the search with them. Eight unless stated. */
  readonly searchThreshold = input(8, { transform: numberAttribute });

  readonly query = signal('');

  /**
   * The collator `combobox` filters its own options with, rather than a fold
   * that strips combining marks: `normalize('NFD')` is an English answer
   * wearing a Unicode one — it turns `ø` into `ø` and leaves `ß` alone.
   */
  private readonly compare = createFilter({ sensitivity: 'base' });

  /** Two set conditions collapse to one list, so the panel offers one. */
  protected override allowed() {
    return 1;
  }

  /** What the search left. The covering checkbox answers for exactly this. */
  readonly shown = computed(() => {
    const query = this.query();
    const options = this.options();
    if (query === '') return options;
    return options.filter((option) => this.compare.contains(option.label ?? option.value, query));
  });

  readonly searching = computed(
    () => this.searchable() ?? this.options().length >= this.searchThreshold(),
  );

  chosen(context: TableFilterOperandContext): readonly string[] {
    return (context.condition.value as readonly string[] | null) ?? [];
  }

  private covered(context: TableFilterOperandContext) {
    const chosen = this.chosen(context);
    return this.shown().filter((option) => chosen.includes(option.value)).length;
  }

  allCovered(context: TableFilterOperandContext) {
    const covered = this.covered(context);
    return covered > 0 && covered === this.shown().length;
  }

  someCovered(context: TableFilterOperandContext) {
    const covered = this.covered(context);
    return covered > 0 && covered < this.shown().length;
  }

  search(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
    /* A list that shortens under a reader who cannot see it says nothing. */
    this.announce(`${this.shown().length} ${this.labels().filterMatches}`);
  }

  hold(context: TableFilterOperandContext, value: string, next: boolean) {
    const chosen = this.chosen(context);
    context.set(0, next ? [...chosen, value] : chosen.filter((held) => held !== value));
  }

  coverAll(context: TableFilterOperandContext, next: boolean) {
    const visible = this.shown().map((option) => option.value);
    const chosen = this.chosen(context);
    context.set(
      0,
      next
        ? [...new Set([...chosen, ...visible])]
        : chosen.filter((held) => !visible.includes(held)),
    );
  }

  protected override readValue() {
    return this.value();
  }

  protected override writeValue(next: FilterDescriptor | null) {
    this.value.set(next as SetFilter | null);
  }
}

export type {
  BooleanOperator,
  DateOperator,
  NumberOperator,
  SetOperator,
  TextOperator,
} from '@slotted/core/filter';
