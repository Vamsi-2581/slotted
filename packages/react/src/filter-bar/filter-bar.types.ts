import type {
  FilterDescriptor,
  FilterGroup,
  FilterJoin,
  FilterKind,
  FilterOperator,
  FilterPath,
} from '@slotted/core/filter';
import type { ChangeReason, ChangeRequest } from '@slotted/core/state';
import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react';

export type FilterBarApply = 'live' | 'manual';
export type FilterBarSize = 'sm' | 'md' | 'lg';

export type FilterBarValueReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'clear' | 'remove' | 'select' | 'submit' | 'programmatic'
>;
export type FilterBarQueryReason = Extract<
  ChangeReason,
  'keyboard' | 'clear' | 'submit' | 'programmatic'
>;
export type FilterBarPresetReason = Extract<ChangeReason, 'select' | 'clear' | 'programmatic'>;
export type FilterBarOpenReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'escape' | 'outsidePress' | 'dismiss' | 'submit' | 'programmatic'
>;
export type FilterBarRevealedReason = Extract<
  ChangeReason,
  'pointer' | 'keyboard' | 'programmatic'
>;

export interface FilterBarValueRequest extends ChangeRequest<FilterGroup | null> {
  readonly reason: FilterBarValueReason;
}
export interface FilterBarQueryRequest extends ChangeRequest<string> {
  readonly reason: FilterBarQueryReason;
}
export interface FilterBarPresetRequest extends ChangeRequest<string | null> {
  readonly reason: FilterBarPresetReason;
}
export interface FilterBarOpenRequest extends ChangeRequest<boolean> {
  readonly reason: FilterBarOpenReason;
}
export interface FilterBarRevealedRequest extends ChangeRequest<boolean> {
  readonly reason: FilterBarRevealedReason;
}

/** A value of a set field, with the word a reader sees for it. */
export interface FilterBarOption {
  value: string;
  label: string;
}

/**
 * One field a listing can be filtered by. `key` is what a rule names and what
 * `read(row, field)` receives; `kind` decides the operators and the operand
 * control, which is the same decision `table`'s five typed filters make.
 */
export interface FilterBarField {
  key: string;
  label: string;
  kind: FilterKind;
  /**
   * Drawn before the field's name on its chip: a glyph name from
   * `@slotted/core/glyph`, or a node of the consumer's.
   */
  icon?: string | ReactNode | undefined;
  /** Narrows the operators the kind offers. AG Grid's `filterOptions`. */
  operators?: readonly string[] | undefined;
  /** The operator a new rule starts with. Defaults to the kind's. */
  defaultOperator?: string | undefined;
  /**
   * Always in sight: a dashed pill while it holds no condition, a chip in the
   * same place once it does. Polaris's `pinned`.
   */
  pinned?: boolean | undefined;
  /**
   * A field that always holds a rule: Clear returns it to `defaultValue`
   * rather than to nothing, and a rule without an operand refuses to be
   * applied or removed. A required field is pinned whether or not it says so.
   */
  required?: boolean | undefined;
  /** What a required field returns to; also the rule a new bar starts with for it. */
  defaultValue?: FilterDescriptor | null | undefined;
  /** A heading the add menu groups the field under. */
  section?: string | undefined;
  /** Whether the global query searches this field. Defaults to `true` for `text`. */
  searchable?: boolean | undefined;
  /** The values a `set` field offers. */
  options?: readonly FilterBarOption[] | undefined;
  /** Bounds and step for `number`, `date`, `time` and `datetime` operands, handed to their control. */
  min?: number | string | undefined;
  max?: number | string | undefined;
  step?: number | undefined;
}

/** A saved view: a name and the tree it restores. */
export interface FilterBarPreset {
  key: string;
  label: string;
  value: FilterGroup | null;
}

/** What the family says, in the application's language. */
export interface FilterBarLabels {
  /** The search landmark's name. */
  bar: string;
  /** The toolbar's name. */
  filters: string;
  /** The drawer's title. */
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
  /** The narrow control. `{count}` is the number of active rules. */
  summary: string;
  /** The fold control. `{count}` is the number of folded chips. */
  more: string;
  less: string;
  preset: string;
  presetNone: string;
  savePreset: string;
  addRule: string;
  addGroup: string;
  removeRule: string;
  removeGroup: string;
  /** The words between a group's rules. */
  joins: Record<FilterJoin, string>;
  /** The sentence around the join control: `{join}` is the control. */
  matches: string;
  /** The two faces of the join control: every rule, or any rule. */
  matchAll: string;
  matchAny: string;
  /** The word before the first rule of a group; the join word stands before the rest. */
  where: string;
  field: string;
  operator: string;
  value: string;
  from: string;
  to: string;
  /** `{count}` and `{total}`; `{total}` may be absent. */
  count: string;
  countOnly: string;
  /** `{field}` */
  removed: string;
  cleared: string;
  /** `{field}` */
  required: string;
  /** `{field}` */
  unknownField: string;
  /** The word before a chip's own label on its remove control. */
  remove: string;
  /** The value segment of a condition still waiting for its value. */
  noValue: string;
  /** Appended to a chip's name while its condition is incomplete. */
  incomplete: string;
  /** After the first two values of a longer list. `{count}` is the rest. */
  moreValues: string;
  /** Said by the toolbar of a read-only bar. */
  readOnly: string;
  /** `{count}` */
  appliedCount: string;
  operators: Partial<Record<FilterOperator, string>>;
}

/** What the operand body of a rule is handed. */
export interface FilterBarOperandProps {
  field: FilterBarField;
  operator: FilterOperator;
  /** `0` for `value`, `1` for `end`. */
  index: 0 | 1;
  value: unknown;
  onValueChange: (value: unknown) => void;
  /** What `Enter` does in this surface. */
  apply: () => void;
  label: string;
  size: FilterBarSize;
}

export interface FilterBarHandle {
  /** Puts focus in the search field. */
  focusSearch: () => void;
  /** Opens the builder, on the node at `path` when one is given. */
  open: (path?: FilterPath) => void;
  readonly root: HTMLDivElement | null;
}

export interface FilterBarDefaults {
  apply?: FilterBarApply | undefined;
  chipLimit?: number | undefined;
  labels?: Partial<FilterBarLabels> | undefined;
  queryDelay?: number | undefined;
  shortcut?: string | null | undefined;
  size?: FilterBarSize | undefined;
}

export interface FilterBarDefaultsProviderProps extends FilterBarDefaults {
  children?: ReactNode;
}

export interface FilterBarProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'defaultValue' | 'onChange' | 'ref'
> {
  /** The fields the listing can be filtered by, in the order the add menu lists them. */
  fields: readonly FilterBarField[];

  /** The tree the consumer owns. Passing it decides the mode for good. */
  value?: FilterGroup | null | undefined;
  defaultValue?: FilterGroup | null | undefined;
  onValueChange?: ((value: FilterGroup | null, request: FilterBarValueRequest) => void) | undefined;

  /** The global query. */
  query?: string | undefined;
  defaultQuery?: string | undefined;
  onQueryChange?: ((query: string, request: FilterBarQueryRequest) => void) | undefined;

  presets?: readonly FilterBarPreset[] | undefined;
  preset?: string | null | undefined;
  defaultPreset?: string | null | undefined;
  onPresetChange?: ((preset: string | null, request: FilterBarPresetRequest) => void) | undefined;
  /** Asks the application to save the tree as a view. The name is the application's to ask for. */
  onPresetSave?: ((value: FilterGroup | null) => void) | undefined;

  /** Whether the builder is open. */
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean, request: FilterBarOpenRequest) => void) | undefined;

  /** Whether the chips past `chipLimit` are shown. */
  revealed?: boolean | undefined;
  defaultRevealed?: boolean | undefined;
  onRevealedChange?: ((revealed: boolean, request: FilterBarRevealedRequest) => void) | undefined;

  /** `live` commits as the reader goes; `manual` edits a draft until Apply. */
  apply?: FilterBarApply | undefined;
  /** Sticks under the page chrome, reading `--slotted-page-sticky-top`. */
  sticky?: boolean | undefined;
  /** A parent for the builder's drawer alone, instead of the shared portal root. */
  container?: Element | null | undefined;
  size?: FilterBarSize | undefined;
  /** Milliseconds the query waits before it is requested, under `live`. */
  queryDelay?: number | undefined;
  /** Chips past this number fold behind the `more` control. */
  chipLimit?: number | undefined;
  /** A document key that focuses the search. `null` binds none. */
  shortcut?: string | null | undefined;
  disabled?: boolean | undefined;
  /** The conditions can be read and reached, and nothing changes them. */
  readOnly?: boolean | undefined;
  loading?: boolean | undefined;
  /** BCP 47, for the figures in the count. Defaults to the runtime's. */
  locale?: string | undefined;
  /** The number of rows the filter kept, and the number there are. */
  count?: number | undefined;
  total?: number | undefined;
  labels?: Partial<FilterBarLabels> | undefined;
  /** Replaces the operand control of a rule. Returning `undefined` keeps the kind's own. */
  renderOperand?: ((props: FilterBarOperandProps) => ReactNode) | undefined;
  /** The consumer's own controls, drawn in the `end` slot. */
  children?: ReactNode;
  ref?: RefObject<FilterBarHandle | null> | ((handle: FilterBarHandle | null) => void) | undefined;
}
