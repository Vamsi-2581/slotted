import { useEffect } from 'react';

import { InlineMessage } from '../inline-message';
import { formatFieldCount, isFieldCountOver, useField } from './field-context';
import type {
  FieldControlProps,
  FieldControlRootProps,
  FieldCounterProps,
  FieldCounterRootProps,
  FieldLabelProps,
  FieldLabelRootProps,
  FieldMessageProps,
} from './field.types';

/** The two identifiers that join a field's `aria-describedby`, in reading order. */
function useRegisterMessage(slot: 'description' | 'error', present: boolean) {
  const field = useField();
  const register = field?.registerMessage;

  useEffect(() => {
    if (register === undefined) return;
    register(slot, present);
    return () => register(slot, false);
  }, [present, register, slot]);
}

/** Whether there is anything to say, which is what decides both of the above. */
const hasContent = (children: unknown) =>
  children !== undefined && children !== null && children !== false && children !== '';

/**
 * Names the control, and says whether it has to be answered.
 *
 * The association is explicit — `for` pointing at the control's identifier —
 * because the APG's naming practice records that some combinations of assistive
 * technology and browser fail to treat the implicit form, wrapping the control
 * in the label, as having an accessible name at all.
 *
 * The necessity marker is drawn here rather than written by the page. The glyph
 * is `aria-hidden`, because `aria-required` on the control already carries the
 * semantics and a reader working a form of twenty required fields does not need
 * to hear "asterisk" twenty times; the two word forms are not hidden, because
 * `(optional)` is information rather than decoration.
 */
export function FieldLabel({
  children,
  htmlFor,
  id,
  ref,
  render,
  ...nativeProps
}: FieldLabelProps) {
  const field = useField();
  const mark = markText(field?.requiredMark ?? 'mark', field?.required === true, field);

  const rootProps: FieldLabelRootProps = {
    ...nativeProps,
    children: (
      <>
        {children}
        {mark === null ? null : (
          <span
            {...(field?.requiredMark === 'text' ? {} : { 'aria-hidden': true })}
            data-part="mark"
          >
            {mark}
          </span>
        )}
      </>
    ),
    'data-part': 'label',
    htmlFor: htmlFor ?? field?.ids.control,
    id: id ?? field?.ids.label,
  };

  return render === undefined ? <label {...rootProps} ref={ref} /> : render(rootProps);
}

function markText(
  requiredMark: string,
  required: boolean,
  field: ReturnType<typeof useField>,
): string | null {
  if (requiredMark === 'none') return null;
  if (requiredMark === 'text') {
    return required
      ? (field?.necessityWords.required ?? '(required)')
      : (field?.necessityWords.optional ?? '(optional)');
  }
  return required ? '*' : null;
}

/**
 * Applies the field's wiring to a control the library does not own — a plain
 * `input`, or a consumer's own component through `render`.
 *
 * Controls this library ships read the field themselves and need no wrapper, so
 * this part exists for the two cases that cannot: a native element, which
 * cannot read React context, and a component written before this library.
 *
 * Every value the consumer states wins. The field fills what is unset and
 * overwrites nothing, which is what keeps composition from removing capability.
 */
export function FieldControl({
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  disabled,
  id,
  readOnly,
  ref,
  render,
  ...nativeProps
}: FieldControlProps) {
  const field = useField();
  const register = field?.registerControl;

  useEffect(() => register?.(), [register]);

  const merged = [describedBy, field?.describedBy].filter(Boolean).join(' ') || undefined;

  const rootProps: FieldControlRootProps = {
    ...nativeProps,
    'aria-describedby': merged,
    'aria-invalid': ariaInvalid ?? (field?.invalid === true ? true : undefined),
    'aria-required': ariaRequired ?? (field?.required === true ? true : undefined),
    'data-part': 'control',
    disabled: disabled ?? field?.disabled,
    id: id ?? field?.ids.control,
    readOnly: readOnly ?? field?.readOnly,
  };

  return render === undefined ? <input {...rootProps} ref={ref} /> : render(rootProps);
}

/**
 * Help about the field, in the field's own message family.
 *
 * It renders an `inline-message`, so it arrives with a tone, a mark, a clipped
 * severity word an application translates once, and a `reserve` that holds its
 * line open — none of which the field reimplements. `docs/rebuild-order.md`
 * states that as the reason `inline-message` was built in wave 2.
 */
export function FieldDescription({ children, mark, tone, ...rest }: FieldMessageProps) {
  const field = useField();
  useRegisterMessage('description', hasContent(children));

  return (
    <InlineMessage
      {...rest}
      disabled={field?.disabled}
      id={field?.ids.description}
      mark={mark ?? 'dot'}
      size={field?.messageSize}
      tone={tone ?? 'secondary'}
    >
      {children}
    </InlineMessage>
  );
}

/**
 * What is wrong with the value, in words — which is what WCAG 2.2 SC 3.3.1
 * requires and what colour and a mark alone do not satisfy.
 *
 * `tone` defaults to `danger` and accepts the other four, so a warning that
 * does not block submission is the same part in another tone rather than a
 * member of its own. Fluent spends a `validationState` axis on that distinction
 * and Carbon a second component.
 *
 * `live` defaults to `off`, because a message already on the page when it loads
 * is announced by nothing whatever role it carries. A form that raises the error
 * after submit sets `live="polite"` and the reader hears it once.
 */
export function FieldError({ children, mark, tone, ...rest }: FieldMessageProps) {
  const field = useField();
  useRegisterMessage('error', hasContent(children));

  return (
    <InlineMessage
      {...rest}
      disabled={field?.disabled}
      id={field?.ids.error}
      mark={mark ?? 'dot'}
      size={field?.messageSize}
      tone={tone ?? 'danger'}
    >
      {children}
    </InlineMessage>
  );
}

/**
 * A count at the end of the label row — which is where Carbon puts it. Angular
 * Material puts it in the subscript beside the error, where a count that
 * appears on the first keystroke shares a row with the message and pushes it.
 *
 * Written with no children, it reads the count the control published: the
 * control owns the number and the field owns the place. Written with children,
 * they win and nothing is read — a count over words, bytes or line items is one
 * only the page can compute, and it is why this part still takes content.
 *
 * A field whose control publishes a count and whose page writes no counter gets
 * one anyway, drawn by the field. This part exists for the page that wants to
 * put it somewhere else, say it differently, or count something else.
 */
export function FieldCounter({
  children,
  invalid,
  ref,
  render,
  ...nativeProps
}: FieldCounterProps) {
  const field = useField();
  const register = field?.registerCounter;
  const count = field?.count;

  useEffect(() => {
    if (register === undefined) return;
    register(true);
    return () => register(false);
  }, [register]);

  const own = children === undefined && count !== undefined;
  const over = invalid ?? (own && count !== undefined ? isFieldCountOver(count) : false);

  const rootProps: FieldCounterRootProps = {
    ...nativeProps,
    children: own && count !== undefined ? formatFieldCount(count) : children,
    ...(over ? { 'data-invalid': '' } : {}),
    'data-part': 'counter',
  };

  return render === undefined ? <span {...rootProps} ref={ref} /> : render(rootProps);
}
