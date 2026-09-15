import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  forwardRef,
  HostAttributeToken,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  isPlainDate,
  isPlainDateTime,
  isPlainTime,
  parseISODate,
  parseISODateTime,
  parseISOTime,
  toISODate,
  toISODateTime,
  toISOTime,
} from '@slotted/core/date';
import {
  defaultOperator as kindDefaultOperator,
  describeFilter,
  describeFilterGroup,
  emptyFilter,
  emptyFilterGroup,
  firstLevelRules,
  insertNodeAt,
  isFilterActive,
  isFilterGroup,
  normalizeFilterGroup,
  operandCount,
  operatorsFor,
  removeNodeAt,
  ruleFor,
  serializeFilterGroup,
  updateNodeAt,
  withCondition,
  withGroupJoin,
  withoutRuleFor,
  withRuleFor,
} from '@slotted/core/filter';
import type {
  FilterCondition,
  FilterDescriptor,
  FilterGroup,
  FilterJoin,
  FilterNode,
  FilterOperator,
  FilterPath,
  FilterRule,
} from '@slotted/core/filter';
import { createRemovalFocus, createRovingTabindex } from '@slotted/core/focus';
import { getLiveAnnouncer } from '@slotted/core/live-announcer';
import { createControllable } from '@slotted/core/state';
import type { ChangeRequest } from '@slotted/core/state';
import { SlButton } from '@slotted/angular/button';
import { SlDatePicker } from '@slotted/angular/date-picker';
import { SlDateTimePicker } from '@slotted/angular/datetime-picker';
import {
  SlDrawer,
  SlDrawerBody,
  SlDrawerClose,
  SlDrawerFooter,
  SlDrawerHeader,
  SlDrawerTitle,
} from '@slotted/angular/drawer';
import { SlKbd } from '@slotted/angular/kbd';
import { SlMenu, SlMenuGroup, SlMenuItem, SlMenuTrigger } from '@slotted/angular/menu';
import { SlMultiSelect, SlMultiSelectItem } from '@slotted/angular/multi-select';
import { SlNumberField, SlNumberFieldInput } from '@slotted/angular/number-field';
import {
  SlPopover,
  SlPopoverBody,
  SlPopoverContent,
  SlPopoverLayer,
  SlPopoverTrigger,
} from '@slotted/angular/popover';
import { SlSegment, SlSegmentedControl } from '@slotted/angular/segmented-control';
import { SlSelect, SlSelectItem } from '@slotted/angular/select';
import { SlTag, SlTagBody, SlTagRemove } from '@slotted/angular/tag';
import {
  SlTextField,
  SlTextFieldEnd,
  SlTextFieldInput,
  SlTextFieldStart,
} from '@slotted/angular/text-field';
import { SlTimePicker } from '@slotted/angular/time-picker';

import {
  FILTER_BAR_DEFAULT_APPLY,
  FILTER_BAR_DEFAULT_CHIP_LIMIT,
  FILTER_BAR_DEFAULT_QUERY_DELAY,
  FILTER_BAR_DEFAULT_SIZE,
  injectFilterBarDefaults,
  resolveFilterBarLabels,
  type FilterBarApply,
  type FilterBarField,
  type FilterBarLabels,
  type FilterBarOpenReason,
  type FilterBarPreset,
  type FilterBarPresetReason,
  type FilterBarQueryReason,
  type FilterBarRevealedReason,
  type FilterBarSize,
  type FilterBarValueReason,
} from './filter-bar.constants';

const STYLES = ['../../../styles/src/filter-bar/filter-bar.css'];

type Condition = FilterCondition<string, unknown>;

const BAR_ITEMS =
  "[data-part='pill'], [data-part='add'], [data-part='clear'], [data-part='apply'], [data-part='reset'], [data-part='summary']";
const CHIP_ITEMS = "[data-part='chip'] [data-part='body']";

let counter = 0;

function sameGroup(a: FilterGroup | null, b: FilterGroup | null) {
  return serializeFilterGroup(a) === serializeFilterGroup(b);
}

function blankRule(field: FilterBarField): FilterDescriptor {
  if (field.defaultValue) return field.defaultValue;
  const operator = field.defaultOperator ?? kindDefaultOperator(field.kind);
  return emptyFilter(field.kind, operator as never) as FilterDescriptor;
}

const STICKY_TOP = '--slotted-page-sticky-top';

function isEditable(element: Element | null) {
  if (!element) return false;
  const tag = element.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (element as HTMLElement).isContentEditable
  );
}

/** What a `slFilterBarOperand` template is handed for one operand. */
export interface FilterBarOperandContext {
  $implicit: FilterBarField;
  field: FilterBarField;
  operator: FilterOperator;
  index: 0 | 1;
  value: unknown;
  set: (value: unknown) => void;
  apply: () => void;
  label: string;
  size: FilterBarSize;
}

/**
 * Replaces the operand control of a field's rules. `slFilterBarOperand` names
 * the field, or `*` for every field. The template is rendered per rule and
 * never built for a closed surface.
 */
@Directive({ selector: 'ng-template[slFilterBarOperand]', standalone: true })
export class SlFilterBarOperand {
  readonly field = input.required<string>({ alias: 'slFilterBarOperand' });
  readonly template = inject<TemplateRef<FilterBarOperandContext>>(TemplateRef);
}

/**
 * Writes this family's part name on a control another family's directive
 * owns. `slButton`, `slTagBody` and `slPopoverTrigger` each write `data-part`
 * as a static host attribute, which erases the one the template wrote — the rule the
 * briefing records for `toolbar`'s overflow control — so the part is written
 * back after the first render, where nothing writes over it again.
 */
@Directive({ selector: '[slFilterBarPart]', standalone: true })
export class SlFilterBarPart {
  readonly part = input.required<string>({ alias: 'slFilterBarPart' });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => this.host.nativeElement.setAttribute('data-part', this.part()));
  }
}

/** The consumer's own controls, drawn in the `end` slot. */
@Directive({ selector: '[slFilterBarEnd]', standalone: true })
export class SlFilterBarEnd {}

/** What every editor in the family reads from the bar. */
export interface FilterBarEnvironment {
  fields: () => readonly FilterBarField[];
  labels: () => FilterBarLabels;
  size: () => FilterBarSize;
  operandTemplates: () => readonly SlFilterBarOperand[];
}

/**
 * One condition — the operator and its operands — with the operand control the
 * kind draws, the same choice `table`'s typed filters make, or the consumer's
 * own template.
 */
@Component({
  selector: '[slFilterBarCondition]',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    SlDatePicker,
    SlDateTimePicker,
    SlMultiSelect,
    SlMultiSelectItem,
    SlNumberField,
    SlNumberFieldInput,
    SlSelect,
    SlSelectItem,
    SlTextField,
    SlTextFieldInput,
    SlTimePicker,
  ],
  template: `
    <div data-part="operator">
      <sl-select
        [size]="size()"
        [fullWidth]="true"
        [items]="operatorItems()"
        [attr.aria-label]="labels().operator"
        [value]="condition().operator"
        (valueChange)="setOperator($any($event))"
      >
        @for (operator of operators(); track operator) {
          <sl-select-item [value]="operator">{{ operatorName(operator) }}</sl-select-item>
        }
      </sl-select>
    </div>
    <div data-part="operand">
      @for (slot of slots(); track slot) {
        @if (customTemplate(); as custom) {
          <ng-container
            [ngTemplateOutlet]="custom.template"
            [ngTemplateOutletContext]="context(slot)"
          />
        } @else {
          @switch (field().kind) {
            @case ('number') {
              <div slNumberField [size]="size()">
                <input
                  slNumberFieldInput
                  [value]="$any(operand(slot)) ?? null"
                  [attr.aria-label]="operandLabel(slot)"
                  [attr.placeholder]="operandLabel(slot)"
                  [attr.min]="numberBound(field().min)"
                  [attr.max]="numberBound(field().max)"
                  [attr.step]="field().step ?? null"
                  (valueChange)="setOperand(slot, $event.value)"
                  (keydown.enter)="apply()"
                />
              </div>
            }
            @case ('date') {
              <div
                slDatePicker
                [size]="size()"
                [value]="day(operand(slot))"
                [min]="day(field().min) ?? undefined"
                [max]="day(field().max) ?? undefined"
                [attr.aria-label]="operandLabel(slot)"
                (valueChange)="setOperand(slot, isoDay($event.value))"
                (keydown.enter)="apply()"
              ></div>
            }
            @case ('time') {
              <div
                slTimePicker
                [size]="size()"
                [value]="time(operand(slot))"
                [attr.aria-label]="operandLabel(slot)"
                (valueChange)="setOperand(slot, isoTime($event.value))"
                (keydown.enter)="apply()"
              ></div>
            }
            @case ('datetime') {
              <div
                slDateTimePicker
                [size]="size()"
                [value]="dateTime(operand(slot))"
                [attr.aria-label]="operandLabel(slot)"
                (valueChange)="setOperand(slot, isoDateTime($event.value))"
                (keydown.enter)="apply()"
              ></div>
            }
            @case ('boolean') {
              <sl-select
                [size]="size()"
                [fullWidth]="true"
                [items]="truths"
                [attr.aria-label]="operandLabel(slot)"
                [value]="operand(slot) === true ? 'true' : operand(slot) === false ? 'false' : null"
                (valueChange)="setOperand(slot, $event === 'true')"
              >
                <sl-select-item value="true">true</sl-select-item>
                <sl-select-item value="false">false</sl-select-item>
              </sl-select>
            }
            @case ('set') {
              <sl-multi-select
                [size]="size()"
                [items]="field().options ?? []"
                [placeholder]="operandLabel(slot)"
                [attr.aria-label]="operandLabel(slot)"
                [value]="$any(operand(slot)) ?? []"
                (valueChange)="setOperand(slot, [...$event])"
              >
                @for (option of field().options ?? []; track option.value) {
                  <sl-multi-select-item [value]="option.value" [label]="option.label" />
                }
              </sl-multi-select>
            }
            @default {
              <div slTextField [size]="size()">
                <input
                  slTextFieldInput
                  [value]="$any(operand(slot)) ?? ''"
                  [attr.aria-label]="operandLabel(slot)"
                  [attr.placeholder]="operandLabel(slot)"
                  (valueChange)="setOperand(slot, $event.value)"
                  (keydown.enter)="apply()"
                />
              </div>
            }
          }
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display: contents' },
})
export class SlFilterBarCondition {
  readonly field = input.required<FilterBarField>();
  readonly condition = input.required<Condition>();
  readonly labels = input.required<FilterBarLabels>();
  readonly size = input.required<FilterBarSize>();
  readonly operandTemplates = input<readonly SlFilterBarOperand[]>([]);
  readonly applyRequest = output<void>();
  readonly conditionChange = output<Condition>();

  protected readonly truths = [
    { label: 'true', value: 'true' },
    { label: 'false', value: 'false' },
  ];

  protected readonly operators = computed(
    () => this.field().operators ?? (operatorsFor(this.field().kind) as readonly string[]),
  );
  protected readonly operatorItems = computed(() =>
    this.operators().map((operator) => ({ label: this.operatorName(operator), value: operator })),
  );
  protected readonly slots = computed<readonly (0 | 1)[]>(() => {
    const operands = operandCount(this.condition().operator as FilterOperator);
    return operands === 0 ? [] : operands === 1 ? [0] : [0, 1];
  });
  protected readonly customTemplate = computed(() => {
    const key = this.field().key;
    const templates = this.operandTemplates();
    return (
      templates.find((entry) => entry.field() === key) ??
      templates.find((entry) => entry.field() === '*')
    );
  });

  operatorName(operator: string) {
    return this.labels().operators[operator as FilterOperator] ?? operator;
  }

  protected operandLabel(slot: 0 | 1) {
    const labels = this.labels();
    if (this.slots().length < 2) return labels.value;
    return slot === 0 ? labels.from : labels.to;
  }

  protected operand(slot: 0 | 1): unknown {
    const condition = this.condition();
    return (slot === 0 ? condition.value : condition.end) ?? null;
  }

  protected numberBound(value: number | string | undefined) {
    return typeof value === 'number' ? value : null;
  }

  protected day = (value: unknown) => (value ? parseISODate(String(value)) : null);
  protected time = (value: unknown) => (value ? parseISOTime(String(value)) : null);
  protected dateTime = (value: unknown) => (value ? parseISODateTime(String(value)) : null);
  protected isoDay = (value: unknown) => (isPlainDate(value) ? toISODate(value) : null);
  protected isoTime = (value: unknown) => (isPlainTime(value) ? toISOTime(value, 'minute') : null);
  protected isoDateTime = (value: unknown) =>
    isPlainDateTime(value) ? toISODateTime(value) : null;

  protected setOperator(operator: string) {
    const condition = this.condition();
    const before = operandCount(condition.operator as FilterOperator);
    const after = operandCount(operator as FilterOperator);
    /* An operand the new operator still takes survives the change. */
    this.conditionChange.emit({
      operator,
      ...(after >= 1 && before >= 1 ? { value: condition.value } : {}),
      ...(after === 2 && before === 2 ? { end: condition.end } : {}),
    });
  }

  protected setOperand(slot: 0 | 1, value: unknown) {
    const condition = this.condition();
    this.conditionChange.emit(slot === 0 ? { ...condition, value } : { ...condition, end: value });
  }

  protected apply() {
    this.applyRequest.emit();
  }

  protected context(slot: 0 | 1): FilterBarOperandContext {
    const field = this.field();
    return {
      $implicit: field,
      apply: () => this.apply(),
      field,
      index: slot,
      label: this.operandLabel(slot),
      operator: this.condition().operator as FilterOperator,
      set: (value) => this.setOperand(slot, value),
      size: this.size(),
      value: this.operand(slot),
    };
  }
}

/** One rule row in the builder: field, operator, operand, remove. */
@Component({
  selector: '[slFilterBarRule]',
  standalone: true,
  imports: [SlFilterBarCondition, SlSelect, SlSelectItem],
  template: `
    <div data-part="field">
      <sl-select
        [size]="size()"
        [fullWidth]="true"
        [items]="fieldItems()"
        [attr.aria-label]="labels().field"
        [value]="rule().field"
        (valueChange)="changeField($any($event))"
      >
        @for (entry of fields(); track entry.key) {
          <sl-select-item [value]="entry.key">{{ entry.label }}</sl-select-item>
        }
      </sl-select>
    </div>
    @if (field(); as known) {
      <div
        slFilterBarCondition
        [field]="known"
        [condition]="condition()"
        [labels]="labels()"
        [size]="size()"
        [operandTemplates]="operandTemplates()"
        (conditionChange)="changeCondition($event)"
        (applyRequest)="applyRequest.emit()"
      ></div>
    } @else {
      <div data-part="operator"></div>
      <div data-part="operand"></div>
    }
    @if (removable()) {
      <button
        data-part="remove"
        type="button"
        [attr.aria-label]="labels().removeRule"
        (click)="removeRequest.emit()"
      ></button>
    } @else {
      <span></span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-part': 'rule',
    '[attr.data-kind]': 'field()?.kind ?? null',
    '[attr.data-operands]': 'operands()',
    '[attr.data-invalid]': 'invalid() || !field() ? "" : null',
  },
})
export class SlFilterBarRule {
  readonly rule = input.required<FilterRule>();
  readonly fields = input.required<readonly FilterBarField[]>();
  readonly labels = input.required<FilterBarLabels>();
  readonly size = input.required<FilterBarSize>();
  readonly operandTemplates = input<readonly SlFilterBarOperand[]>([]);
  readonly removable = input(true, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly ruleChange = output<FilterRule>();
  readonly removeRequest = output<void>();
  readonly applyRequest = output<void>();

  protected readonly field = computed(() =>
    this.fields().find((entry) => entry.key === this.rule().field),
  );
  protected readonly condition = computed<Condition>(() => {
    const field = this.field();
    return (
      this.rule().filter.conditions[0] ?? {
        operator: field ? (field.defaultOperator ?? kindDefaultOperator(field.kind)) : 'contains',
      }
    );
  });
  protected readonly operands = computed(() =>
    this.field() ? operandCount(this.condition().operator as FilterOperator) : 0,
  );
  protected readonly fieldItems = computed(() =>
    this.fields().map((entry) => ({ label: entry.label, value: entry.key })),
  );

  protected changeField(key: string) {
    const next = this.fields().find((entry) => entry.key === key);
    if (!next) return;
    this.ruleChange.emit({ field: key, filter: blankRule(next) });
  }

  protected changeCondition(condition: Condition) {
    const rule = this.rule();
    this.ruleChange.emit({
      field: rule.field,
      filter: withCondition(rule.filter, 0, condition as never),
    });
  }
}

/**
 * A group: its join, its rules and groups in order, and the controls that grow
 * it. Recursive, so a group holds a group; the depth is on the element for the
 * rail the stylesheet draws.
 */
@Component({
  selector: 'fieldset[slFilterBarGroup]',
  standalone: true,
  imports: [
    forwardRef(() => SlFilterBarGroup),
    SlButton,
    SlFilterBarPart,
    SlFilterBarRule,
    SlSegment,
    SlSegmentedControl,
  ],
  template: `
    <legend>{{ labels().match }} {{ joinWord() }} {{ labels().matches }}</legend>
    <div data-part="join">
      <span>{{ labels().match }}</span>
      <div
        slSegmentedControl
        size="sm"
        [attr.aria-label]="labels().match + ' ' + labels().matches"
        [value]="group().join"
        (valueChange)="setJoin($event.value ?? 'and')"
      >
        <label slSegment value="and">{{ labels().matchAll }}</label>
        <label slSegment value="or">{{ labels().matchAny }}</label>
      </div>
      <span>{{ labels().matches }}</span>
      @if (path().length > 0) {
        <button
          slButton
          slFilterBarPart="remove-group"
          type="button"
          tone="secondary"
          variant="ghost"
          [size]="buttonSize()"
          (click)="rootChange.emit(removeNodeAt(root(), path()))"
        >
          {{ labels().removeGroup }}
        </button>
      }
    </div>
    <div data-part="rules">
      @for (node of group().rules; track $index) {
        <span data-part="conjunction">{{
          $index === 0 ? labels().where : labels().joins[group().join]
        }}</span>
        @if (isGroup(node)) {
          <fieldset
            slFilterBarGroup
            [group]="node"
            [path]="childPath($index)"
            [root]="root()"
            [fields]="fields()"
            [labels]="labels()"
            [size]="size()"
            [operandTemplates]="operandTemplates()"
            (rootChange)="rootChange.emit($event)"
            (applyRequest)="applyRequest.emit()"
          ></fieldset>
        } @else {
          <div
            slFilterBarRule
            [rule]="$any(node)"
            [fields]="fields()"
            [labels]="labels()"
            [size]="size()"
            [operandTemplates]="operandTemplates()"
            [removable]="!isRequired($any(node))"
            (ruleChange)="replace($index, $event)"
            (removeRequest)="remove($index)"
            (applyRequest)="applyRequest.emit()"
          ></div>
        }
      }
    </div>
    <div data-part="actions">
      <button
        slButton
        slFilterBarPart="add-rule"
        type="button"
        tone="secondary"
        variant="ghost"
        [size]="buttonSize()"
        [disabled]="!firstField()"
        (click)="addRule()"
      >
        {{ labels().addRule }}
      </button>
      <button
        slButton
        slFilterBarPart="add-group"
        type="button"
        tone="secondary"
        variant="ghost"
        [size]="buttonSize()"
        [disabled]="!firstField()"
        (click)="addGroup()"
      >
        {{ labels().addGroup }}
      </button>
      @if (path().length === 0) {
        <ng-content></ng-content>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-part': 'group',
    '[attr.data-depth]': 'path().length',
  },
})
export class SlFilterBarGroup {
  readonly group = input.required<FilterGroup>();
  readonly path = input<FilterPath>([]);
  readonly root = input.required<FilterGroup>();
  readonly fields = input.required<readonly FilterBarField[]>();
  readonly labels = input.required<FilterBarLabels>();
  protected readonly joinWord = computed(() =>
    this.group().join === 'and' ? this.labels().matchAll : this.labels().matchAny,
  );
  readonly size = input.required<FilterBarSize>();
  readonly operandTemplates = input<readonly SlFilterBarOperand[]>([]);
  readonly rootChange = output<FilterGroup>();
  readonly applyRequest = output<void>();

  protected readonly removeNodeAt = removeNodeAt;
  protected readonly firstField = computed(() => this.fields()[0]);
  protected readonly buttonSize = computed(() => (this.size() === 'lg' ? 'md' : 'sm'));

  protected isGroup(node: FilterNode) {
    return isFilterGroup(node);
  }
  protected isRequired(rule: FilterRule) {
    return this.fields().find((entry) => entry.key === rule.field)?.required === true;
  }
  protected childPath(index: number): FilterPath {
    return [...this.path(), index];
  }
  protected setJoin(join: string) {
    this.rootChange.emit(withGroupJoin(this.root(), this.path(), join as FilterJoin));
  }
  protected replace(index: number, rule: FilterRule) {
    this.rootChange.emit(updateNodeAt(this.root(), this.childPath(index), rule));
  }
  protected remove(index: number) {
    this.rootChange.emit(removeNodeAt(this.root(), this.childPath(index)));
  }
  protected addRule() {
    const field = this.firstField();
    if (!field) return;
    this.rootChange.emit(
      insertNodeAt(this.root(), this.path(), { field: field.key, filter: blankRule(field) }),
    );
  }
  protected addGroup() {
    const field = this.firstField();
    if (!field) return;
    this.rootChange.emit(
      insertNodeAt(this.root(), this.path(), {
        join: this.group().join === 'and' ? 'or' : 'and',
        rules: [{ field: field.key, filter: blankRule(field) }],
      }),
    );
  }
}

/**
 * One rule in a popover. Under `live` every change is requested at once — a
 * text or number operand after `queryDelay`, so a query does not fire per
 * keystroke — and Done closes; under `manual` the change goes to the draft the
 * same way. Clear removes the rule, which a required field refuses.
 */
@Component({
  selector: '[slFilterBarRuleEditor]',
  standalone: true,
  imports: [SlButton, SlFilterBarCondition],
  template: `
    <div
      slFilterBarCondition
      [field]="field()"
      [condition]="condition()"
      [labels]="labels()"
      [size]="size()"
      [operandTemplates]="operandTemplates()"
      (conditionChange)="change($event)"
      (applyRequest)="done()"
    ></div>
    <div data-part="actions">
      <button
        slButton
        type="button"
        size="sm"
        tone="secondary"
        variant="ghost"
        [disabled]="field().required === true"
        (click)="clear()"
      >
        {{ labels().clearRule }}
      </button>
      <button slButton type="button" size="sm" (click)="done()">{{ labels().done }}</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'data-ui': 'filter-bar',
    'data-part': 'rule',
    '[attr.data-kind]': 'field().kind',
    '[attr.data-invalid]': 'invalid() ? "" : null',
  },
})
export class SlFilterBarRuleEditor {
  readonly field = input.required<FilterBarField>();
  readonly current = input<FilterDescriptor | undefined>(undefined);
  readonly labels = input.required<FilterBarLabels>();
  readonly size = input.required<FilterBarSize>();
  readonly operandTemplates = input<readonly SlFilterBarOperand[]>([]);
  readonly queryDelay = input(0);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly ruleChange = output<FilterDescriptor | null>();
  readonly doneRequest = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly local = signal<FilterDescriptor | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly draft = computed(
    () => this.local() ?? this.current() ?? blankRule(this.field()),
  );
  protected readonly condition = computed<Condition>(
    () =>
      this.draft().conditions[0] ?? {
        operator: this.field().defaultOperator ?? kindDefaultOperator(this.field().kind),
      },
  );

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  protected change(condition: Condition) {
    const next = { ...this.draft(), conditions: [condition] } as FilterDescriptor;
    this.local.set(next);
    clearTimeout(this.timer);
    const kind = this.field().kind;
    const debounced = (kind === 'text' || kind === 'number') && this.queryDelay() > 0;
    if (!debounced) {
      this.ruleChange.emit(next);
      return;
    }
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.ruleChange.emit(next);
    }, this.queryDelay());
  }

  protected done() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
      this.ruleChange.emit(this.draft());
    }
    this.doneRequest.emit();
  }

  protected clear() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.local.set(null);
    this.ruleChange.emit(null);
    this.doneRequest.emit();
  }
}

/**
 * A bar above a listing that edits one value: a tree of conditions over the
 * listing's fields, whose leaves are the descriptor `table` edits in a column
 * header. The bar draws the first level — a search field, a pill per pinned
 * field, a chip per applied rule — and opens a drawer on the whole tree.
 *
 * The family applies nothing. It reports the tree and the query, and
 * `createFilterGroupPredicate` and `createSearchPredicate` in
 * `@slotted/core/filter` are what a consumer applies to its own rows.
 */
@Component({
  selector: '[slFilterBar]',
  standalone: true,
  imports: [
    SlButton,
    SlDrawer,
    SlDrawerBody,
    SlDrawerClose,
    SlDrawerFooter,
    SlDrawerHeader,
    SlDrawerTitle,
    SlFilterBarGroup,
    SlFilterBarPart,
    SlFilterBarRuleEditor,
    SlKbd,
    SlMenu,
    SlMenuGroup,
    SlMenuItem,
    SlMenuTrigger,
    SlPopover,
    SlPopoverContent,
    SlPopoverBody,
    SlPopoverLayer,
    SlPopoverTrigger,
    SlSelect,
    SlSelectItem,
    SlTag,
    SlTagBody,
    SlTagRemove,
    SlTextField,
    SlTextFieldEnd,
    SlTextFieldStart,
    SlTextFieldInput,
  ],
  template: `
    <div data-part="frame">
      <div data-part="search">
        <div slTextField [size]="sizeValue()" [clearable]="true">
          <span slTextFieldStart aria-hidden="true" data-part="search-icon"></span>
          <input
            #search
            slTextFieldInput
            type="search"
            [value]="shownQuery()"
            [attr.aria-label]="labelSet().search"
            [attr.placeholder]="labelSet().search"
            [disabled]="disabled()"
            (valueChange)="typeQuery($event)"
            (keydown)="onSearchKeyDown($event)"
          />
          @if (shortcutValue(); as key) {
            <span slTextFieldEnd
              ><kbd slKbd size="sm">{{ key }}</kbd></span
            >
          }
        </div>
      </div>

      <div #barRow data-part="bar" role="toolbar" [attr.aria-label]="labelSet().filters">
        @for (field of pinned(); track field.key) {
          <ng-container
            slPopover
            [open]="openPill() === field.key"
            (openChange)="togglePill(field, $event)"
          >
            <button
              slPopoverTrigger
              type="button"
              slFilterBarPart="pill"
              aria-haspopup="dialog"
              [attr.data-field]="field.key"
              [attr.data-filtered]="isActive(field.key) ? '' : null"
              [attr.data-invalid]="invalid() === field.key ? '' : null"
              [attr.aria-invalid]="invalid() === field.key ? 'true' : null"
              [disabled]="disabled()"
            >
              <span>{{ field.label }}</span>
              @if (isActive(field.key)) {
                <span>{{ sentence(field) }}</span>
              }
            </button>
            <ng-template slPopoverLayer>
              <div slPopoverContent [attr.aria-label]="field.label">
                <div slPopoverBody>
                  <div
                    slFilterBarRuleEditor
                    [field]="field"
                    [current]="ruleOf(field.key)"
                    [labels]="labelSet()"
                    [size]="sizeValue()"
                    [operandTemplates]="operandTemplates()"
                    [queryDelay]="applyValue() === 'live' ? queryDelayValue() : 0"
                    [invalid]="invalid() === field.key"
                    (ruleChange)="editRule(field, $event)"
                    (doneRequest)="finishRule(field)"
                  ></div>
                </div>
              </div>
            </ng-template>
          </ng-container>
        }

        <button
          slButton
          slFilterBarPart="add"
          type="button"
          tone="secondary"
          variant="ghost"
          [size]="sizeValue()"
          [disabled]="disabled() || unfiltered().length === 0"
          [slMenuTriggerFor]="addMenu"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          {{ labelSet().add }}
        </button>
        <sl-menu #addMenu [attr.aria-label]="labelSet().add">
          @for (section of sections(); track section.name ?? '') {
            @if (section.name === undefined) {
              @for (field of section.fields; track field.key) {
                <button slMenuItem (select)="startPending(field)">{{ field.label }}</button>
              }
            } @else {
              <sl-menu-group [label]="section.name">
                @for (field of section.fields; track field.key) {
                  <button slMenuItem (select)="startPending(field)">{{ field.label }}</button>
                }
              </sl-menu-group>
            }
          }
        </sl-menu>

        @if (activeCount() > 0 || shownQuery() !== '') {
          <button
            slButton
            slFilterBarPart="clear"
            type="button"
            tone="secondary"
            variant="ghost"
            [size]="sizeValue()"
            [disabled]="disabled()"
            (click)="clearAll($event)"
          >
            {{ labelSet().clear }}
          </button>
        }

        @if (applyValue() === 'manual') {
          <div data-part="actions">
            <button
              slButton
              slFilterBarPart="reset"
              type="button"
              tone="secondary"
              variant="ghost"
              [size]="sizeValue()"
              [disabled]="disabled() || !dirty()"
              (click)="reset()"
            >
              {{ labelSet().reset }}
            </button>
            <button
              slButton
              slFilterBarPart="apply"
              type="button"
              [size]="sizeValue()"
              [disabled]="disabled() || loading() || !dirty()"
              (click)="submit($event)"
            >
              {{ labelSet().apply }}
            </button>
          </div>
        }

        <button
          slButton
          slFilterBarPart="summary"
          type="button"
          tone="secondary"
          variant="outline"
          aria-haspopup="dialog"
          [size]="sizeValue()"
          [disabled]="disabled()"
          (click)="requestOpen(true, 'pointer', $event)"
        >
          <span>{{ summaryWord() }}</span> <span>{{ summaryCount() }}</span>
        </button>
      </div>

      <div data-part="end">
        @if (presets(); as views) {
          @if (views.length > 0) {
            <div data-part="preset">
              <sl-select
                [size]="sizeValue()"
                [disabled]="disabled()"
                [items]="presetItems()"
                [attr.aria-label]="labelSet().preset"
                [value]="currentPreset()"
                (valueChange)="choosePreset($any($event))"
              >
                @for (view of views; track view.key) {
                  <sl-select-item [value]="view.key">{{ view.label }}</sl-select-item>
                }
              </sl-select>
            </div>
          }
        }
        <ng-content select="[slFilterBarEnd]"></ng-content>
      </div>

      @if (countText() !== null || loading()) {
        <p data-part="count" aria-live="polite" [attr.aria-busy]="loading() ? 'true' : null">
          @if (loading()) {
            <span
              data-ui="spinner"
              data-part="root"
              data-size="sm"
              role="progressbar"
              [attr.aria-label]="labelSet().filters"
            ></span>
          }
          {{ countText() }}
        </p>
      }

      <div
        #chipsGrid
        data-part="chips"
        role="grid"
        [attr.aria-label]="labelSet().applied"
        [attr.data-revealed]="isRevealed() ? '' : null"
      >
        <div role="row" style="display: contents">
          @for (chip of chips(); track chip.key) {
            <div
              data-part="chip"
              role="gridcell"
              [attr.data-folded]="$index >= chipLimitValue() ? '' : null"
              [attr.data-invalid]="chip.unknown || invalid() === chip.key ? '' : null"
            >
              @if (chip.group) {
                <span
                  slTag
                  size="sm"
                  [removable]="true"
                  [removeLabel]="labelSet().remove"
                  (remove)="removeNode(chip.path, $event)"
                >
                  <button
                    slTagBody
                    type="button"
                    [attr.title]="chip.sentence"
                    (click)="requestOpen(true, 'pointer', $event)"
                  >
                    <span>({{ chip.sentence }})</span>
                  </button>
                  <button slTagRemove></button>
                </span>
              } @else if (chip.unknown || !chip.field) {
                <span
                  slTag
                  size="sm"
                  [removable]="true"
                  [removeLabel]="labelSet().remove"
                  (remove)="removeField(chip.key, $event)"
                >
                  <button
                    slTagBody
                    type="button"
                    [attr.aria-label]="labelSet().unknownField(chip.key) + ': ' + chip.sentence"
                    [attr.title]="chip.sentence"
                  >
                    <span>{{ chip.label }}</span> <span>{{ chip.sentence }}</span>
                  </button>
                  <button slTagRemove></button>
                </span>
              } @else {
                <ng-container
                  slPopover
                  [open]="openPill() === chip.key"
                  (openChange)="togglePill(chip.field, $event)"
                >
                  <span
                    slTag
                    size="sm"
                    [removable]="true"
                    [removeLabel]="labelSet().remove"
                    (remove)="removeField(chip.key, $event)"
                  >
                    <button
                      slTagBody
                      slPopoverTrigger
                      type="button"
                      aria-haspopup="dialog"
                      [attr.aria-label]="chip.label + ': ' + chip.sentence"
                      [attr.title]="chip.label + ': ' + chip.sentence"
                    >
                      <span>{{ chip.label }}</span> <span>{{ chip.sentence }}</span>
                    </button>
                    <button slTagRemove></button>
                  </span>
                  <ng-template slPopoverLayer>
                    <div slPopoverContent [attr.aria-label]="chip.label">
                      <div slPopoverBody>
                        <div
                          slFilterBarRuleEditor
                          [field]="chip.field"
                          [current]="ruleOf(chip.key)"
                          [labels]="labelSet()"
                          [size]="sizeValue()"
                          [operandTemplates]="operandTemplates()"
                          [queryDelay]="applyValue() === 'live' ? queryDelayValue() : 0"
                          [invalid]="invalid() === chip.key"
                          (ruleChange)="editRule(chip.field, $event)"
                          (doneRequest)="finishRule(chip.field)"
                        ></div>
                      </div>
                    </div>
                  </ng-template>
                </ng-container>
              }
            </div>
          }
          @if (pendingField(); as field) {
            <div data-part="chip" role="gridcell">
              <ng-container slPopover [open]="true" (openChange)="togglePending(field, $event)">
                <span slTag size="sm">
                  <button
                    slTagBody
                    slPopoverTrigger
                    slFilterBarPart="body"
                    type="button"
                    [attr.aria-label]="field.label"
                  >
                    <span>{{ field.label }}</span>
                  </button>
                </span>
                <ng-template slPopoverLayer>
                  <div slPopoverContent [attr.aria-label]="field.label">
                    <div slPopoverBody>
                      <div
                        slFilterBarRuleEditor
                        [field]="field"
                        [current]="ruleOf(field.key)"
                        [labels]="labelSet()"
                        [size]="sizeValue()"
                        [operandTemplates]="operandTemplates()"
                        [queryDelay]="applyValue() === 'live' ? queryDelayValue() : 0"
                        (ruleChange)="editRule(field, $event)"
                        (doneRequest)="finishRule(field)"
                      ></div>
                    </div>
                  </div>
                </ng-template>
              </ng-container>
            </div>
          }
          @if (folded() > 0) {
            <button
              data-part="more"
              type="button"
              [attr.aria-expanded]="isRevealed()"
              (click)="requestRevealed(!isRevealed(), 'pointer', $event)"
            >
              {{ isRevealed() ? labelSet().less : labelSet().more(folded()) }}
            </button>
          }
        </div>
      </div>
    </div>

    <sl-drawer
      side="end"
      size="xl"
      [container]="container()"
      [open]="isOpen()"
      (openChangeRequest)="onDrawerRequest($event)"
    >
      <header slDrawerHeader>
        <h2 slDrawerTitle>{{ labelSet().builder }}</h2>
        <button slDrawerClose></button>
      </header>
      <div slDrawerBody>
        <div data-part="builder" data-ui="filter-bar" [id]="id + '-builder'">
          <fieldset
            slFilterBarGroup
            [group]="drawerDraft() ?? empty"
            [root]="drawerDraft() ?? empty"
            [fields]="fields()"
            [labels]="labelSet()"
            [size]="sizeValue()"
            [operandTemplates]="operandTemplates()"
            (rootChange)="drawerDraft.set($event)"
            (applyRequest)="commitDrawer()"
          >
            @if (savePresetEnabled()) {
              <button
                slButton
                slFilterBarPart="save-preset"
                type="button"
                size="sm"
                tone="secondary"
                variant="ghost"
                (click)="savePreset.emit(normalized(drawerDraft()))"
              >
                {{ labelSet().savePreset }}
              </button>
            }
          </fieldset>
        </div>
      </div>
      <footer slDrawerFooter>
        <button
          slButton
          type="button"
          size="sm"
          tone="secondary"
          variant="ghost"
          (click)="requestOpen(false, 'dismiss', $event)"
        >
          {{ labelSet().cancel }}
        </button>
        <button slButton type="button" size="sm" (click)="commitDrawer()">
          {{ labelSet().apply }}
        </button>
      </footer>
    </sl-drawer>
  `,
  styleUrls: STYLES,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'slFilterBar',
  host: {
    'data-ui': 'filter-bar',
    'data-part': 'root',
    role: 'search',
    '[attr.aria-label]': 'ariaLabel ?? labelSet().bar',
    '[attr.data-apply]': 'applyValue()',
    '[attr.data-size]': 'sizeValue()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-loading]': 'loading() ? "" : null',
    '[attr.data-dirty]': 'dirty() || presetDirty() ? "" : null',
    '[attr.data-open]': 'isOpen() ? "" : null',
    '[attr.data-sticky]': 'sticky() ? "" : null',
  },
})
export class SlFilterBar {
  /** The fields the listing can be filtered by, in the order the add menu lists them. */
  readonly fields = input.required<readonly FilterBarField[]>();
  /** The tree. Present is controlled, for the life of the bar. */
  readonly value = model<FilterGroup | null | undefined>(undefined);
  /** Where an uncontrolled tree starts, read once. */
  readonly defaultValue = input<FilterGroup | null>(null);
  /** The global query. */
  readonly query = model<string | undefined>(undefined);
  readonly defaultQuery = input('');
  readonly presets = input<readonly FilterBarPreset[] | undefined>(undefined);
  readonly preset = model<string | null | undefined>(undefined);
  readonly defaultPreset = input<string | null>(null);
  /** Whether the builder is open. */
  readonly open = model<boolean | undefined>(undefined);
  readonly defaultOpen = input(false, { transform: booleanAttribute });
  /** Whether the chips past `chipLimit` are shown. */
  readonly revealed = model<boolean | undefined>(undefined);
  readonly defaultRevealed = input(false, { transform: booleanAttribute });

  /** The five effective values: the model when it is set, the default otherwise. */
  readonly currentValue = computed(() => this.value() ?? this.defaultValue());
  readonly currentQuery = computed(() => this.query() ?? this.defaultQuery());
  readonly currentPreset = computed(() => this.preset() ?? this.defaultPreset());
  readonly isOpen = computed(() => this.open() ?? this.defaultOpen());
  readonly isRevealed = computed(() => this.revealed() ?? this.defaultRevealed());
  readonly apply = input<FilterBarApply | undefined>(undefined);
  readonly sticky = input(false, { transform: booleanAttribute });
  /** A parent for the builder's drawer alone, instead of the shared portal root. */
  readonly container = input<Element | null | undefined>(undefined);
  readonly size = input<FilterBarSize | undefined>(undefined);
  readonly queryDelay = input<number | undefined, number | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : numberAttribute(value)),
  });
  readonly chipLimit = input<number | undefined, number | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : numberAttribute(value)),
  });
  readonly shortcut = input<string | null | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  /** BCP 47, for the figures in the count. */
  readonly locale = input<string | undefined>(undefined);
  readonly count = input<number | undefined, number | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : numberAttribute(value)),
  });
  readonly total = input<number | undefined, number | string | undefined>(undefined, {
    transform: (value) => (value === undefined ? undefined : numberAttribute(value)),
  });
  readonly labels = input<Partial<FilterBarLabels> | undefined>(undefined);

  /** The requests behind every committed change, each with the reason it carries. */
  readonly valueChangeRequest = output<ChangeRequest<FilterGroup | null>>();
  readonly queryChangeRequest = output<ChangeRequest<string>>();
  readonly presetChangeRequest = output<ChangeRequest<string | null>>();
  readonly openChangeRequest = output<ChangeRequest<boolean>>();
  readonly revealedChangeRequest = output<ChangeRequest<boolean>>();
  /** Draws the save-as-view control in the builder. */
  readonly savePresetEnabled = input(false, { transform: booleanAttribute });
  /** Asks the application to save the tree as a view. */
  readonly savePreset = output<FilterGroup | null>();

  private readonly defaults = injectFilterBarDefaults();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly ariaLabel = inject(new HostAttributeToken('aria-label'), { optional: true });
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('search');
  private readonly barElement = viewChild.required<ElementRef<HTMLDivElement>>('barRow');
  private readonly chipsElement = viewChild.required<ElementRef<HTMLDivElement>>('chipsGrid');
  protected readonly operandTemplates = contentChildren(SlFilterBarOperand);
  protected readonly endSlot = contentChild(SlFilterBarEnd);

  readonly id = `slotted-filter-bar-${(counter += 1)}`;
  protected readonly empty = emptyFilterGroup();

  protected readonly labelSet = computed(() =>
    resolveFilterBarLabels(this.defaults.labels, this.labels()),
  );
  protected readonly applyValue = computed(
    () => this.apply() ?? this.defaults.apply ?? FILTER_BAR_DEFAULT_APPLY,
  );
  protected readonly sizeValue = computed(
    () => this.size() ?? this.defaults.size ?? FILTER_BAR_DEFAULT_SIZE,
  );
  protected readonly queryDelayValue = computed(
    () => this.queryDelay() ?? this.defaults.queryDelay ?? FILTER_BAR_DEFAULT_QUERY_DELAY,
  );
  protected readonly chipLimitValue = computed(
    () => this.chipLimit() ?? this.defaults.chipLimit ?? FILTER_BAR_DEFAULT_CHIP_LIMIT,
  );
  protected readonly shortcutValue = computed(() => {
    const own = this.shortcut();
    return own === undefined ? (this.defaults.shortcut ?? null) : own;
  });

  /* ── The draft under manual ────────────────────────────────────────── */

  private readonly draft = signal<{ value: FilterGroup | null; query: string } | null>(null);
  protected readonly invalid = signal<string | null>(null);
  protected readonly openPill = signal<string | null>(null);
  protected readonly pendingField = signal<FilterBarField | undefined>(undefined);
  protected readonly drawerDraft = signal<FilterGroup | null>(null);
  private readonly typed = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly shown = computed(() => {
    const draft = this.draft();
    return this.applyValue() === 'manual' && draft ? draft.value : this.currentValue();
  });
  protected readonly shownQuery = computed(() => {
    const typed = this.typed();
    if (typed !== null) return typed;
    const draft = this.draft();
    return this.applyValue() === 'manual' && draft ? draft.query : this.currentQuery();
  });
  protected readonly dirty = computed(() => {
    const draft = this.draft();
    return (
      this.applyValue() === 'manual' &&
      draft !== null &&
      (!sameGroup(draft.value, this.currentValue()) || draft.query !== this.currentQuery())
    );
  });
  protected readonly presetDirty = computed(() => {
    const chosen = this.presets()?.find((entry) => entry.key === this.currentPreset());
    return (
      chosen !== undefined && !sameGroup(normalizeFilterGroup(chosen.value), this.currentValue())
    );
  });

  private readonly format = computed(() => {
    const labels = this.labelSet();
    const fields = this.fields();
    return {
      field: (key: string) => fields.find((entry) => entry.key === key)?.label ?? key,
      join: (join: FilterJoin) => labels.joins[join],
      operator: (operator: string) => labels.operators[operator as FilterOperator] ?? operator,
    };
  });

  protected readonly required = computed(() => this.fields().filter((field) => field.required));
  protected readonly pinned = computed(() =>
    this.fields().filter((field) => field.pinned || field.required),
  );
  private readonly pinnedKeys = computed(() => new Set(this.pinned().map((field) => field.key)));
  protected readonly activeCount = computed(() => countActive(this.shown()));
  protected readonly unfiltered = computed(() => {
    const pending = this.pendingField()?.key;
    return this.fields().filter(
      (field) =>
        !this.pinnedKeys().has(field.key) &&
        ruleFor(this.shown(), field.key) === undefined &&
        field.key !== pending,
    );
  });
  protected readonly sections = computed(() => {
    const map = new Map<string | undefined, FilterBarField[]>();
    for (const field of this.unfiltered()) {
      const list = map.get(field.section) ?? [];
      list.push(field);
      map.set(field.section, list);
    }
    return [...map.entries()].map(([name, fields]) => ({ fields, name }));
  });
  protected readonly presetItems = computed(
    () => this.presets()?.map((entry) => ({ label: entry.label, value: entry.key })) ?? [],
  );
  protected readonly chips = computed(() => {
    const shown = this.shown();
    const fields = this.fields();
    const format = this.format();
    const list: {
      key: string;
      label: string;
      sentence: string;
      field: FilterBarField | undefined;
      unknown: boolean;
      group: boolean;
      path: FilterPath;
    }[] = [];
    (shown?.rules ?? []).forEach((node, index) => {
      if (isFilterGroup(node)) {
        const sentence = describeFilterGroup(node, format);
        list.push({
          field: undefined,
          group: true,
          key: `group-${index}`,
          label: sentence,
          path: [index],
          sentence,
          unknown: false,
        });
        return;
      }
      if (this.pinnedKeys().has(node.field)) return;
      const field = fields.find((entry) => entry.key === node.field);
      list.push({
        field,
        group: false,
        key: node.field,
        label: field?.label ?? node.field,
        path: [index],
        sentence: this.sentenceOf(field, node.filter),
        unknown: field === undefined,
      });
    });
    return list;
  });
  protected readonly folded = computed(() =>
    Math.max(0, this.chips().length - this.chipLimitValue()),
  );
  protected readonly countText = computed(() => {
    const count = this.count();
    if (count === undefined) return null;
    const figure = new Intl.NumberFormat(this.locale());
    const total = this.total();
    return this.labelSet().count(
      figure.format(count),
      total === undefined ? undefined : figure.format(total),
    );
  });
  protected readonly summaryWord = computed(() =>
    this.labelSet()
      .summary(this.activeCount())
      .replace(/\s*\(.*$/, ''),
  );
  protected readonly summaryCount = computed(() =>
    this.labelSet()
      .summary(this.activeCount())
      .replace(/^[^(]*/, ''),
  );

  constructor() {
    /* A controlled value that changes from outside replaces the draft. */
    let last = untracked(this.currentValue);
    effect(() => {
      const value = this.currentValue();
      if (!sameGroup(last, value)) {
        last = value;
        untracked(() => this.draft.set(null));
      }
    });

    /* The draft the drawer edits, taken from the tree each time it opens. */
    let wasOpen = false;
    effect(() => {
      const open = this.isOpen();
      if (open && !wasOpen) untracked(() => this.drawerDraft.set(this.shown()));
      wasOpen = open;
    });

    /* The rings: one tab stop for the bar, one for the chips, arrows inside. After render, because the items are the template's. */
    afterRenderEffect((onCleanup) => {
      const bar = this.barElement().nativeElement;
      const chips = this.chipsElement().nativeElement;
      const barRing = createRovingTabindex(bar, { itemSelector: BAR_ITEMS });
      const chipRing = createRovingTabindex(chips, { itemSelector: CHIP_ITEMS });
      const removal = createRemovalFocus(chips, {
        fallback: () => bar.querySelector<HTMLElement>("[data-part='add']") ?? null,
        itemSelector: CHIP_ITEMS,
      });
      /* Read the DOM again after a chip, a pill or a control came or went. */
      const observer = new MutationObserver(() => {
        barRing.refresh();
        chipRing.refresh();
      });
      observer.observe(bar, { childList: true, subtree: true });
      observer.observe(chips, { childList: true, subtree: true });
      onCleanup(() => {
        observer.disconnect();
        barRing.destroy();
        chipRing.destroy();
        removal.destroy();
      });
    });

    /* The document key that reaches the search, unless the reader is typing. */
    effect((onCleanup) => {
      const key = this.shortcutValue();
      if (!key || this.disabled()) return;
      const doc = this.host.nativeElement.ownerDocument;
      const listener = (event: KeyboardEvent) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
        if (event.key !== key || isEditable(doc.activeElement)) return;
        event.preventDefault();
        this.focusSearch();
      };
      doc.addEventListener('keydown', listener);
      onCleanup(() => doc.removeEventListener('keydown', listener));
    });

    /* Sticky: the bar reads the page property and adds its own height for what follows. */
    effect((onCleanup) => {
      if (!this.sticky() || typeof ResizeObserver === 'undefined') return;
      const element = this.host.nativeElement;
      const parent = element.parentElement;
      const view = element.ownerDocument.defaultView;
      if (!parent || !view) return;
      /* What the parent declared inline before this bar added itself: put back
         before every read, so a second measure never sums the bar twice. */
      const declared = parent.style.getPropertyValue(STICKY_TOP);
      const restore = () =>
        declared
          ? parent.style.setProperty(STICKY_TOP, declared)
          : parent.style.removeProperty(STICKY_TOP);
      const publish = () => {
        restore();
        const above = view.getComputedStyle(parent).getPropertyValue(STICKY_TOP).trim() || '0px';
        const height = element.getBoundingClientRect().height;
        element.style.setProperty(STICKY_TOP, above);
        parent.style.setProperty(STICKY_TOP, `calc(${above} + ${height}px)`);
      };
      const observer = new ResizeObserver(publish);
      observer.observe(element);
      publish();
      onCleanup(() => {
        observer.disconnect();
        element.style.removeProperty(STICKY_TOP);
        restore();
      });
    });

    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  /* ── Helpers the template reads ─────────────────────────────────────── */

  protected ruleOf(key: string) {
    return ruleFor(this.shown(), key);
  }

  protected isActive(key: string) {
    return isFilterActive(this.ruleOf(key) ?? null);
  }

  private sentenceOf(
    field: FilterBarField | undefined,
    filter: FilterDescriptor | null | undefined,
  ) {
    return describeFilter(filter, {
      ...this.format(),
      value: (value) =>
        field?.options?.find((option) => option.value === value)?.label ?? String(value),
    });
  }

  protected sentence(field: FilterBarField) {
    return this.sentenceOf(field, this.ruleOf(field.key));
  }

  protected normalized(group: FilterGroup | null) {
    return normalizeFilterGroup(group);
  }

  private announce(message: string) {
    getLiveAnnouncer(this.host.nativeElement.ownerDocument).announce(message);
  }

  /* ── The five requests ─────────────────────────────────────────────── */

  requestValue(next: FilterGroup | null, reason: FilterBarValueReason, source?: unknown) {
    const normalized = normalizeFilterGroup(next);
    const state = createControllable<FilterGroup | null>({
      equals: sameGroup,
      initial: this.currentValue(),
      onRequest: (request) => this.valueChangeRequest.emit(request),
    });
    if (state.request(normalized, reason, source)) this.value.set(normalized);
  }

  requestQuery(next: string, reason: FilterBarQueryReason, source?: unknown) {
    const state = createControllable<string>({
      initial: this.currentQuery(),
      onRequest: (request) => this.queryChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.query.set(next);
  }

  requestPreset(next: string | null, reason: FilterBarPresetReason, source?: unknown) {
    const state = createControllable<string | null>({
      initial: this.currentPreset(),
      onRequest: (request) => this.presetChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.preset.set(next);
  }

  requestOpen(next: boolean, reason: FilterBarOpenReason, source?: unknown) {
    const state = createControllable<boolean>({
      initial: this.isOpen(),
      onRequest: (request) => this.openChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.open.set(next);
  }

  requestRevealed(next: boolean, reason: FilterBarRevealedReason, source?: unknown) {
    const state = createControllable<boolean>({
      initial: this.isRevealed(),
      onRequest: (request) => this.revealedChangeRequest.emit(request),
    });
    if (state.request(next, reason, source)) this.revealed.set(next);
  }

  /* ── Edits ─────────────────────────────────────────────────────────── */

  private edit(next: FilterGroup | null, reason: FilterBarValueReason, source?: unknown) {
    if (this.applyValue() === 'manual') {
      this.draft.set({ query: this.shownQuery(), value: next });
      return;
    }
    this.requestValue(next, reason, source);
  }

  private baseline(): FilterGroup | null {
    let next: FilterGroup | null = null;
    for (const field of this.required()) {
      if (field.defaultValue) next = withRuleFor(next, field.key, field.defaultValue);
    }
    return normalizeFilterGroup(next);
  }

  private missing(tree: FilterGroup | null) {
    return this.required().filter((field) => !isFilterActive(ruleFor(tree, field.key) ?? null));
  }

  private refuse(field: FilterBarField) {
    this.invalid.set(field.key);
    this.announce(this.labelSet().required(field.label));
    this.host.nativeElement
      .querySelector<HTMLElement>(`[data-part='pill'][data-field='${CSS.escape(field.key)}']`)
      ?.focus();
  }

  protected editRule(field: FilterBarField, next: FilterDescriptor | null) {
    if (next === null) {
      if (field.required) {
        this.refuse(field);
        return;
      }
      this.edit(withoutRuleFor(this.shown(), field.key), 'clear');
      return;
    }
    this.invalid.set(null);
    this.edit(withRuleFor(this.shown(), field.key, next), 'keyboard');
    if (this.pendingField()?.key === field.key && isFilterActive(next))
      this.pendingField.set(undefined);
  }

  protected finishRule(field: FilterBarField) {
    const rule = this.ruleOf(field.key);
    if (rule && isFilterActive(rule)) {
      this.announce(`${field.label}: ${this.sentenceOf(field, rule)}`);
    }
    this.openPill.set(null);
    if (this.pendingField()?.key === field.key && !(rule && isFilterActive(rule))) {
      this.pendingField.set(undefined);
    }
  }

  protected togglePill(field: FilterBarField, open: boolean) {
    this.openPill.set(open ? field.key : null);
  }

  protected startPending(field: FilterBarField) {
    this.pendingField.set(field);
  }

  protected togglePending(field: FilterBarField, open: boolean) {
    if (!open && !this.isActive(field.key)) this.pendingField.set(undefined);
  }

  protected removeField(key: string, source?: unknown) {
    const field = this.fields().find((entry) => entry.key === key);
    if (field?.required) {
      this.refuse(field);
      return;
    }
    this.edit(withoutRuleFor(this.shown(), key), 'remove', source);
    this.announce(this.labelSet().removed(field?.label ?? key));
  }

  protected removeNode(path: FilterPath, source?: unknown) {
    const shown = this.shown();
    if (!shown) return;
    this.edit(removeNodeAt(shown, path), 'remove', source);
  }

  protected clearAll(source?: unknown) {
    const next = this.baseline();
    this.invalid.set(null);
    if (this.applyValue() === 'manual') {
      this.draft.set({ query: '', value: next });
    } else {
      this.requestValue(next, 'clear', source);
      if (this.currentQuery() !== '') this.requestQuery('', 'clear', source);
    }
    const labels = this.labelSet();
    this.announce(
      next ? `${labels.cleared}. ${describeFilterGroup(next, this.format())}` : labels.cleared,
    );
  }

  protected submit(source?: unknown) {
    const draft = this.draft();
    if (!draft) return;
    const lacking = this.missing(draft.value);
    if (lacking[0]) {
      this.refuse(lacking[0]);
      return;
    }
    this.invalid.set(null);
    this.requestValue(draft.value, 'submit', source);
    if (draft.query !== this.currentQuery()) this.requestQuery(draft.query, 'submit', source);
    this.draft.set(null);
    const applied = normalizeFilterGroup(draft.value);
    const labels = this.labelSet();
    this.announce(
      applied
        ? `${labels.appliedCount(firstLevelRules(applied).length)}: ${describeFilterGroup(applied, this.format())}`
        : labels.cleared,
    );
  }

  protected reset() {
    this.draft.set(null);
    this.invalid.set(null);
  }

  protected choosePreset(key: string | null, source?: unknown) {
    this.requestPreset(key, key === null ? 'clear' : 'select', source);
    const chosen = this.presets()?.find((entry) => entry.key === key);
    if (chosen) {
      this.draft.set(null);
      this.requestValue(chosen.value, 'select', source);
      this.announce(chosen.label);
    }
  }

  protected commitDrawer() {
    const next = this.drawerDraft();
    const lacking = this.missing(next);
    if (lacking[0]) {
      this.refuse(lacking[0]);
      return;
    }
    this.invalid.set(null);
    this.edit(next, 'submit');
    const applied = normalizeFilterGroup(next);
    const labels = this.labelSet();
    this.announce(
      applied
        ? `${labels.appliedCount(countActive(applied))}: ${describeFilterGroup(applied, this.format())}`
        : labels.cleared,
    );
    this.requestOpen(false, 'submit');
  }

  protected onDrawerRequest(request: ChangeRequest<boolean>) {
    this.requestOpen(request.value, request.reason as FilterBarOpenReason, request.source);
  }

  /* ── The query ─────────────────────────────────────────────────────── */

  protected typeQuery(request: ChangeRequest<string>) {
    const next = request.value;
    const reason: FilterBarQueryReason = request.reason === 'clear' ? 'clear' : 'keyboard';
    if (this.applyValue() === 'manual') {
      this.draft.set({ query: next, value: this.shown() });
      return;
    }
    this.typed.set(next);
    clearTimeout(this.timer);
    if (reason === 'clear' || this.queryDelayValue() === 0) {
      this.typed.set(null);
      this.requestQuery(next, reason, request.source);
      return;
    }
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.typed.set(null);
      this.requestQuery(next, reason, request.source);
    }, this.queryDelayValue());
  }

  protected onSearchKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape' && this.shownQuery() !== '') {
      event.preventDefault();
      this.typeQuery({
        cancel: () => {},
        cancelled: false,
        previous: this.shownQuery(),
        reason: 'clear',
        source: event,
        value: '',
      });
    }
    if (event.key === 'Enter' && this.applyValue() === 'manual') this.submit(event);
  }

  /* ── Imperative ────────────────────────────────────────────────────── */

  /** Puts focus in the search field. */
  focusSearch() {
    this.searchInput().nativeElement.focus();
  }

  /** Opens the builder. */
  openBuilder() {
    this.requestOpen(true, 'programmatic');
  }
}

function countActive(group: FilterGroup | null): number {
  const active = normalizeFilterGroup(group);
  if (!active) return 0;
  let count = 0;
  const walk = (node: FilterNode) => {
    if (isFilterGroup(node)) node.rules.forEach(walk);
    else count += 1;
  };
  walk(active);
  return count;
}
