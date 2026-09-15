import {
  defaultOperator as kindDefaultOperator,
  emptyFilter,
  insertNodeAt,
  isFilterGroup,
  operandCount,
  operatorsFor,
  removeNodeAt,
  updateNodeAt,
  withCondition,
  withGroupJoin,
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
import type { PlainDate } from '@slotted/core/date';
import { Fragment } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import { Button } from '../button';
import { DatePicker } from '../date-picker';
import { DateTimePicker } from '../datetime-picker';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectControl,
  MultiSelectItem,
} from '../multi-select';
import { NumberField } from '../number-field';
import { Segment, SegmentedControl } from '../segmented-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { TextField } from '../text-field';
import { TimePicker } from '../time-picker';
import { fill } from './filter-bar-defaults';
import type {
  FilterBarField,
  FilterBarLabels,
  FilterBarOperandProps,
  FilterBarSize,
} from './filter-bar.types';

type Condition = FilterCondition<string, unknown>;

/** What every editor in the family shares: the fields, the words, the size, the consumer's operand. */
export interface RuleEnvironment {
  fields: readonly FilterBarField[];
  labels: FilterBarLabels;
  size: FilterBarSize;
  renderOperand: ((props: FilterBarOperandProps) => ReactNode) | undefined;
  /** What `Enter` in an operand does in the surface the rule is drawn in. */
  apply: () => void;
}

export function fieldByKey(fields: readonly FilterBarField[], key: string) {
  return fields.find((field) => field.key === key);
}

export function operatorName(labels: FilterBarLabels, operator: string) {
  return labels.operators[operator as FilterOperator] ?? operator;
}

/** The rule a field starts with: its default, else one empty condition on its default operator. */
export function blankRule(field: FilterBarField): FilterDescriptor {
  if (field.defaultValue) return field.defaultValue;
  const operator = field.defaultOperator ?? kindDefaultOperator(field.kind);
  return emptyFilter(field.kind, operator as never) as FilterDescriptor;
}

/** `Enter` applies, and the consumer's own handler ran first. */
export function applyOnEnter(apply: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.defaultPrevented) apply();
  };
}

const day = (value: unknown) => (value ? parseISODate(String(value)) : null);
const time = (value: unknown) => (value ? parseISOTime(String(value)) : null);
const dateTime = (value: unknown) => (value ? parseISODateTime(String(value)) : null);

/**
 * The operand control a kind draws, the same choice `table`'s five typed
 * filters make: a text field, a number field, the whole date picker, a list
 * of the two truths, a multi-select over the field's options. Replaceable by
 * the consumer through `renderOperand`, which is the seam round 12 uses.
 */
export function Operand(
  props: FilterBarOperandProps & { render?: RuleEnvironment['renderOperand'] },
) {
  const { apply, field, label, onValueChange, render, size, value } = props;
  const custom = render?.(props);
  if (custom !== undefined && custom !== null) return <>{custom}</>;

  const bounds = {
    ...(field.min === undefined ? {} : { min: field.min }),
    ...(field.max === undefined ? {} : { max: field.max }),
  };

  switch (field.kind) {
    case 'number':
      return (
        <NumberField
          aria-label={label}
          onKeyDown={applyOnEnter(apply)}
          onValueChange={(next) => onValueChange(next)}
          placeholder={label}
          size={size}
          value={(value as number | null) ?? null}
          {...(typeof field.min === 'number' ? { min: field.min } : {})}
          {...(typeof field.max === 'number' ? { max: field.max } : {})}
          {...(field.step === undefined ? {} : { step: field.step })}
        />
      );
    case 'date':
      return (
        <DatePicker
          aria-label={label}
          onKeyDown={applyOnEnter(apply)}
          onValueChange={(next) => onValueChange(isPlainDate(next) ? toISODate(next) : null)}
          size={size}
          value={day(value)}
          {...(day(bounds.min) ? { min: day(bounds.min) as PlainDate } : {})}
          {...(day(bounds.max) ? { max: day(bounds.max) as PlainDate } : {})}
        />
      );
    case 'time':
      return (
        <TimePicker
          aria-label={label}
          onKeyDown={applyOnEnter(apply)}
          onValueChange={(next) =>
            onValueChange(isPlainTime(next) ? toISOTime(next, 'minute') : null)
          }
          size={size}
          value={time(value)}
        />
      );
    case 'datetime':
      return (
        <DateTimePicker
          aria-label={label}
          onKeyDown={applyOnEnter(apply)}
          onValueChange={(next) =>
            onValueChange(isPlainDateTime(next) ? toISODateTime(next) : null)
          }
          size={size}
          value={dateTime(value)}
        />
      );
    case 'boolean':
      return (
        <Select
          fullWidth
          items={[
            { label: 'true', value: 'true' },
            { label: 'false', value: 'false' },
          ]}
          onValueChange={(next) => onValueChange(next === 'true')}
          size={size}
          value={value === true ? 'true' : value === false ? 'false' : null}
        >
          <SelectTrigger aria-label={label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">true</SelectItem>
            <SelectItem value="false">false</SelectItem>
          </SelectContent>
        </Select>
      );
    case 'set': {
      const options = field.options ?? [];
      return (
        <MultiSelect
          items={options}
          onValueChange={(next) => onValueChange([...next])}
          size={size}
          value={(value as readonly string[] | null) ?? []}
        >
          <MultiSelectControl aria-label={label} placeholder={label} />
          <MultiSelectContent aria-label={label}>
            {options.map((option) => (
              <MultiSelectItem key={option.value} value={option.value}>
                {option.label}
              </MultiSelectItem>
            ))}
          </MultiSelectContent>
        </MultiSelect>
      );
    }
    default:
      return (
        <TextField
          aria-label={label}
          onKeyDown={applyOnEnter(apply)}
          onValueChange={(next) => onValueChange(next)}
          placeholder={label}
          size={size}
          value={(value as string | null) ?? ''}
        />
      );
  }
}

export interface ConditionEditorProps {
  environment: RuleEnvironment;
  field: FilterBarField;
  condition: Condition;
  onConditionChange: (condition: Condition) => void;
}

/**
 * One condition: the operator and its operands. An operand the new operator
 * still takes survives the change, `table`'s rule.
 */
export function ConditionEditor({
  condition,
  environment,
  field,
  onConditionChange,
}: ConditionEditorProps) {
  const { apply, labels, renderOperand, size } = environment;
  const operators = field.operators ?? (operatorsFor(field.kind) as readonly string[]);
  const operands = operandCount(condition.operator as FilterOperator);

  function setOperator(operator: string) {
    const before = operandCount(condition.operator as FilterOperator);
    const after = operandCount(operator as FilterOperator);
    onConditionChange({
      operator,
      ...(after >= 1 && before >= 1 ? { value: condition.value } : {}),
      ...(after === 2 && before === 2 ? { end: condition.end } : {}),
    });
  }

  const operandProps = (slot: 0 | 1): FilterBarOperandProps => ({
    apply,
    field,
    index: slot,
    label: operands === 2 ? (slot === 0 ? labels.from : labels.to) : labels.value,
    onValueChange: (operand) =>
      onConditionChange(
        slot === 0 ? { ...condition, value: operand } : { ...condition, end: operand },
      ),
    operator: condition.operator as FilterOperator,
    size,
    value: (slot === 0 ? condition.value : condition.end) ?? null,
  });

  return (
    <>
      <div data-part="operator">
        <Select
          fullWidth
          items={operators.map((operator) => ({
            label: operatorName(labels, operator),
            value: operator,
          }))}
          onValueChange={(next) => setOperator(next as string)}
          size={size}
          value={condition.operator}
        >
          <SelectTrigger aria-label={labels.operator}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operators.map((operator) => (
              <SelectItem key={operator} value={operator}>
                {operatorName(labels, operator)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div data-part="operand">
        {Array.from({ length: operands }, (_, slot) => (
          <Operand key={slot} render={renderOperand} {...operandProps(slot as 0 | 1)} />
        ))}
      </div>
    </>
  );
}

export interface RuleEditorProps {
  environment: RuleEnvironment;
  rule: FilterRule;
  /** Which fields the field chooser lists. Defaults to every field. */
  choices?: readonly FilterBarField[] | undefined;
  onRuleChange: (rule: FilterRule) => void;
  onRemove?: (() => void) | undefined;
  invalid?: boolean | undefined;
}

/** One rule row in the builder: field, operator, operand, remove. */
export function RuleEditor({
  choices,
  environment,
  invalid,
  onRemove,
  onRuleChange,
  rule,
}: RuleEditorProps) {
  const { fields, labels, size } = environment;
  const field = fieldByKey(fields, rule.field);
  const condition: Condition = rule.filter.conditions[0] ?? {
    operator: field ? (field.defaultOperator ?? kindDefaultOperator(field.kind)) : 'contains',
  };
  const operands = field ? operandCount(condition.operator as FilterOperator) : 0;
  const list = choices ?? fields;

  function changeField(key: string) {
    const next = fieldByKey(fields, key);
    if (!next) return;
    onRuleChange({ field: key, filter: blankRule(next) });
  }

  return (
    <div
      data-kind={field?.kind}
      data-operands={operands}
      data-part="rule"
      {...(invalid || !field ? { 'data-invalid': '' } : {})}
    >
      <div data-part="field">
        <Select
          fullWidth
          items={list.map((entry) => ({ label: entry.label, value: entry.key }))}
          onValueChange={(next) => changeField(next as string)}
          size={size}
          value={rule.field}
        >
          <SelectTrigger aria-label={labels.field}>
            <SelectValue
              placeholder={field ? undefined : fill(labels.unknownField, { field: rule.field })}
            />
          </SelectTrigger>
          <SelectContent>
            {list.map((entry) => (
              <SelectItem key={entry.key} value={entry.key}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {field ? (
        <ConditionEditor
          condition={condition}
          environment={environment}
          field={field}
          onConditionChange={(next) =>
            onRuleChange({
              field: rule.field,
              filter: withCondition(rule.filter, 0, next as never),
            })
          }
        />
      ) : (
        <>
          <div data-part="operator" />
          <div data-part="operand" />
        </>
      )}
      {onRemove ? (
        <button
          aria-label={labels.removeRule}
          data-part="remove"
          onClick={onRemove}
          type="button"
        />
      ) : (
        <span />
      )}
    </div>
  );
}

export interface GroupEditorProps {
  environment: RuleEnvironment;
  group: FilterGroup;
  /** The path of this group inside the root, `[]` for the root. */
  path: FilterPath;
  root: FilterGroup;
  onRootChange: (root: FilterGroup) => void;
  /** The field a new rule starts with. */
  firstField: FilterBarField | undefined;
  extra?: ReactNode;
}

/**
 * A group: its join, its rules and groups in order, and the controls that grow
 * it. Recursive, so a group holds a group; the depth is on the element for the
 * rail the stylesheet draws.
 */
export function GroupEditor({
  environment,
  extra,
  firstField,
  group,
  onRootChange,
  path,
  root,
}: GroupEditorProps) {
  const { labels, size } = environment;
  const depth = path.length;

  const joinControl = (
    <SegmentedControl
      aria-label={labels.matches.replace('{join}', '').trim() || labels.operator}
      onValueChange={(join) => onRootChange(withGroupJoin(root, path, join as FilterJoin))}
      size="sm"
      value={group.join}
    >
      <Segment value="and">{labels.matchAll}</Segment>
      <Segment value="or">{labels.matchAny}</Segment>
    </SegmentedControl>
  );
  const [before, after] = labels.matches.split('{join}');
  const joinWord = group.join === 'and' ? labels.matchAll : labels.matchAny;
  const removeGroup =
    depth > 0 ? (
      <Button
        onClick={() => onRootChange(removeNodeAt(root, path))}
        render={(props) => <button {...props} data-part="remove-group" />}
        size={size === 'lg' ? 'md' : 'sm'}
        tone="secondary"
        variant="ghost"
      >
        {labels.removeGroup}
      </Button>
    ) : null;

  function addRule() {
    if (!firstField) return;
    onRootChange(
      insertNodeAt(root, path, { field: firstField.key, filter: blankRule(firstField) }),
    );
  }
  function addGroup() {
    if (!firstField) return;
    onRootChange(
      insertNodeAt(root, path, {
        join: group.join === 'and' ? 'or' : 'and',
        rules: [{ field: firstField.key, filter: blankRule(firstField) }],
      }),
    );
  }

  return (
    <fieldset data-depth={depth} data-part="group">
      <legend>{fill(labels.matches, { join: joinWord })}</legend>
      <div data-part="join">
        {before?.trim() ? <span>{before.trim()}</span> : null}
        {joinControl}
        {after?.trim() ? <span>{after.trim()}</span> : null}
        {removeGroup}
      </div>
      <div data-part="rules">
        {group.rules.map((node: FilterNode, index) => {
          const childPath = [...path, index];
          /* The word that joins this row to the one above: "Where" on the first. */
          const conjunction = (
            <span data-part="conjunction">
              {index === 0 ? labels.where : labels.joins[group.join]}
            </span>
          );
          if (isFilterGroup(node)) {
            return (
              <Fragment key={index}>
                {conjunction}
                <GroupEditor
                  environment={environment}
                  firstField={firstField}
                  group={node}
                  onRootChange={onRootChange}
                  path={childPath}
                  root={root}
                />
              </Fragment>
            );
          }
          const field = fieldByKey(environment.fields, node.field);
          return (
            <Fragment key={index}>
              {conjunction}
              <RuleEditor
                environment={environment}
                onRemove={
                  field?.required ? undefined : () => onRootChange(removeNodeAt(root, childPath))
                }
                onRuleChange={(rule) => onRootChange(updateNodeAt(root, childPath, rule))}
                rule={node}
              />
            </Fragment>
          );
        })}
      </div>
      <div data-part="actions">
        <Button
          disabled={!firstField}
          onClick={addRule}
          render={(props) => <button {...props} data-part="add-rule" />}
          size={size === 'lg' ? 'md' : 'sm'}
          tone="secondary"
          variant="ghost"
        >
          {labels.addRule}
        </Button>
        <Button
          disabled={!firstField}
          onClick={addGroup}
          render={(props) => <button {...props} data-part="add-group" />}
          size={size === 'lg' ? 'md' : 'sm'}
          tone="secondary"
          variant="ghost"
        >
          {labels.addGroup}
        </Button>
        {depth === 0 ? extra : null}
      </div>
    </fieldset>
  );
}
