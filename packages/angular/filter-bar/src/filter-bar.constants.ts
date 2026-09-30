import { InjectionToken, inject } from '@angular/core';
import type { TemplateRef } from '@angular/core';
import type {
  FilterDescriptor,
  FilterGroup,
  FilterJoin,
  FilterKind,
  FilterOperator,
} from '@slotted/core/filter';

export type FilterBarApply = 'live' | 'manual';
export type FilterBarSize = 'sm' | 'md' | 'lg';
export type FilterBarValueReason =
  'pointer' | 'keyboard' | 'clear' | 'remove' | 'select' | 'submit' | 'programmatic';
export type FilterBarQueryReason = 'keyboard' | 'clear' | 'submit' | 'programmatic';
export type FilterBarPresetReason = 'select' | 'clear' | 'programmatic';
export type FilterBarOpenReason =
  'pointer' | 'keyboard' | 'escape' | 'outsidePress' | 'dismiss' | 'submit' | 'programmatic';
export type FilterBarRevealedReason = 'pointer' | 'keyboard' | 'programmatic';

/** A value of a set field, with the word a reader sees for it. */
export interface FilterBarOption {
  value: string;
  label: string;
}

/**
 * One field a listing can be filtered by. `key` is what a rule names and what
 * `read(row, field)` receives; `kind` decides the operators and the operand
 * control, which is the same decision `table`'s typed filters make.
 */
export interface FilterBarField {
  key: string;
  label: string;
  kind: FilterKind;
  /**
   * Drawn before the field's name on its chip and in the add menu: a glyph
   * name from `@slotted/core/glyph`, or a template of the consumer's.
   */
  icon?: string | TemplateRef<unknown>;
  /** Narrows the operators the kind offers. */
  operators?: readonly string[];
  /** The operator a new rule starts with. Defaults to the kind's. */
  defaultOperator?: string;
  /**
   * Always in sight: a dashed pill while it holds no condition, a chip in the
   * same place once it does.
   */
  pinned?: boolean;
  /**
   * A field that always holds a rule: Clear returns it to `defaultValue`
   * rather than to nothing, and a rule without an operand refuses to be
   * applied or removed. A required field is pinned whether or not it says so.
   */
  required?: boolean;
  defaultValue?: FilterDescriptor | null;
  /** A heading the add menu groups the field under. */
  section?: string;
  /** Whether the global query searches this field. */
  searchable?: boolean;
  /** The values a `set` field offers. */
  options?: readonly FilterBarOption[];
  min?: number | string;
  max?: number | string;
  step?: number;
}

/** A saved view: a name and the tree it restores. */
export interface FilterBarPreset {
  key: string;
  label: string;
  value: FilterGroup | null;
}

/** What the family says, in the application's language. */
export interface FilterBarLabels {
  bar: string;
  filters: string;
  builder: string;
  search: string;
  add: string;
  clear: string;
  /** The control that empties the rule a pill opens. */
  clearRule: string;
  apply: string;
  reset: string;
  done: string;
  cancel: string;
  summary: (count: number) => string;
  more: (count: number) => string;
  less: string;
  preset: string;
  presetNone: string;
  savePreset: string;
  addRule: string;
  addGroup: string;
  removeRule: string;
  removeGroup: string;
  joins: Record<FilterJoin, string>;
  /** The two faces of the join control: every rule, or any rule. */
  matchAll: string;
  matchAny: string;
  /** The words before the join control. */
  match: string;
  /** The words after the join control. */
  matches: string;
  /** The word before the first rule of a group; the join word stands before the rest. */
  where: string;
  field: string;
  operator: string;
  value: string;
  from: string;
  to: string;
  count: (count: string, total: string | undefined) => string;
  removed: (field: string) => string;
  cleared: string;
  required: (field: string) => string;
  unknownField: (field: string) => string;
  /** The word before a chip's own label on its remove control. */
  remove: string;
  /** The value segment of a condition still waiting for its value. */
  noValue: string;
  /** Appended to a chip's name while its condition is incomplete. */
  incomplete: string;
  /** After the first two values of a longer list; `count` is the rest. */
  moreValues: (count: number) => string;
  /** Said by the toolbar of a read-only bar. */
  readOnly: string;
  appliedCount: (count: number) => string;
  operators: Partial<Record<FilterOperator, string>>;
}

export const FILTER_BAR_DEFAULT_LABELS: FilterBarLabels = {
  add: 'Add filter',
  addGroup: 'Add group',
  addRule: 'Add rule',
  appliedCount: (count) => `${count} filters applied`,
  apply: 'Apply',
  bar: 'Filter',
  builder: 'Filters',
  cancel: 'Cancel',
  clear: 'Clear all',
  clearRule: 'Clear',
  cleared: 'Filters cleared',
  count: (count, total) => (total === undefined ? count : `${count} of ${total}`),
  done: 'Done',
  field: 'Field',
  filters: 'Filters',
  from: 'From',
  incomplete: 'incomplete',
  joins: { and: 'and', or: 'or' },
  less: 'Show less',
  match: 'Match',
  matchAll: 'All',
  matchAny: 'Any',
  matches: 'of the following',
  more: (count) => `+${count} more`,
  moreValues: (count) => `+${count}`,
  noValue: 'Select value',
  operator: 'Operator',
  operators: {
    after: 'after',
    anyOf: 'any of',
    before: 'before',
    between: 'between',
    contains: 'contains',
    empty: 'is empty',
    endsWith: 'ends with',
    equals: 'equals',
    greaterThan: 'greater than',
    greaterThanOrEqual: 'at least',
    is: 'is',
    isNot: 'is not',
    lessThan: 'less than',
    lessThanOrEqual: 'at most',
    noneOf: 'none of',
    notContains: 'does not contain',
    notEmpty: 'is not empty',
    notEquals: 'does not equal',
    startsWith: 'starts with',
  } as FilterBarLabels['operators'],
  preset: 'Saved view',
  presetNone: 'No saved view',
  readOnly: 'Read only',
  remove: 'Remove',
  removeGroup: 'Remove group',
  removeRule: 'Remove rule',
  removed: (field) => `${field} filter removed`,
  required: (field) => `${field} needs a value`,
  reset: 'Reset',
  savePreset: 'Save as view…',
  search: 'Search',
  summary: (count) => `Filters (${count})`,
  to: 'To',
  unknownField: (field) => `Unknown field ${field}`,
  value: 'Value',
  where: 'Where',
};

export const FILTER_BAR_DEFAULT_APPLY: FilterBarApply = 'live';
export const FILTER_BAR_DEFAULT_SIZE: FilterBarSize = 'md';
export const FILTER_BAR_DEFAULT_QUERY_DELAY = 320;
export const FILTER_BAR_DEFAULT_CHIP_LIMIT = 6;

export interface FilterBarDefaults {
  apply?: FilterBarApply;
  chipLimit?: number;
  labels?: Partial<FilterBarLabels>;
  queryDelay?: number;
  shortcut?: string | null;
  size?: FilterBarSize;
}

export const FILTER_BAR_DEFAULTS_TOKEN = new InjectionToken<FilterBarDefaults>(
  'slotted filter-bar defaults',
  { providedIn: 'root', factory: (): FilterBarDefaults => ({}) },
);

/**
 * An application decides once how its bars apply, how long the query waits,
 * how many chips show, which key reaches the search, and what the family says
 * in the language it ships. A bar that states any of those itself still wins.
 */
export function provideFilterBarDefaults(defaults: FilterBarDefaults) {
  return { provide: FILTER_BAR_DEFAULTS_TOKEN, useValue: defaults };
}

export function injectFilterBarDefaults(): FilterBarDefaults {
  return inject(FILTER_BAR_DEFAULTS_TOKEN);
}

export function resolveFilterBarLabels(
  ...layers: (Partial<FilterBarLabels> | undefined)[]
): FilterBarLabels {
  let resolved = FILTER_BAR_DEFAULT_LABELS;
  for (const layer of layers) {
    if (!layer) continue;
    resolved = {
      ...resolved,
      ...layer,
      joins: { ...resolved.joins, ...layer.joins },
      operators: { ...resolved.operators, ...layer.operators },
    };
  }
  return resolved;
}
